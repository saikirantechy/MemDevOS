-- MemDevOS initial schema.
-- Apply to a development project first. All user-owned tables use RLS.
create extension if not exists pgcrypto;

create type public.processing_status as enum (
  'draft', 'awaiting_consent', 'ready', 'recording', 'upload_pending',
  'transcribing', 'indexing', 'completed', 'needs_review', 'failed'
);
create type public.consent_status as enum (
  'not_checked', 'checks_completed', 'blocked', 'withdrawn'
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (length(trim(name)) > 0),
  venue text,
  starts_at timestamptz,
  ends_at timestamptz,
  timezone text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.people (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  display_name text not null check (length(trim(display_name)) > 0),
  company text,
  role text,
  identity_confirmed boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'Untitled conversation',
  occurred_at timestamptz not null default now(),
  duration_ms bigint check (duration_ms is null or duration_ms >= 0),
  event_id uuid references public.events(id) on delete set null,
  status public.processing_status not null default 'draft',
  consent_status public.consent_status not null default 'not_checked',
  consent_notes text,
  summary text,
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.conversation_people (
  owner_id uuid not null references auth.users(id) on delete cascade,
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  person_id uuid not null references public.people(id) on delete cascade,
  relationship_confidence numeric check (relationship_confidence between 0 and 1),
  identity_verified_at timestamptz,
  primary key (conversation_id, person_id)
);

create table public.audio_assets (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  storage_path text not null,
  mime_type text,
  byte_size bigint check (byte_size is null or byte_size >= 0),
  duration_ms bigint check (duration_ms is null or duration_ms >= 0),
  checksum_sha256 text,
  upload_status text not null default 'pending'
    check (upload_status in ('pending','uploading','uploaded','failed','deleted')),
  created_at timestamptz not null default now(),
  unique(owner_id, storage_path)
);

create table public.consent_records (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  scope text not null,
  status public.consent_status not null default 'not_checked',
  method text not null check (method in ('user_attestation','recorded_permission','other')),
  checked_at timestamptz,
  notes text,
  created_at timestamptz not null default now()
);

create table public.transcript_segments (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  start_ms bigint not null check (start_ms >= 0),
  end_ms bigint not null check (end_ms >= start_ms),
  text text not null default '',
  speaker_label text not null default 'Unknown speaker',
  person_id uuid references public.people(id) on delete set null,
  confidence numeric check (confidence between 0 and 1),
  needs_review boolean not null default false,
  source_revision integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.notes (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  conversation_id uuid references public.conversations(id) on delete cascade,
  title text not null,
  body text not null default '',
  origin text not null default 'user'
    check (origin in ('user','ai_generated','imported')),
  edited_by_user boolean not null default false,
  version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.note_sources (
  owner_id uuid not null references auth.users(id) on delete cascade,
  note_id uuid not null references public.notes(id) on delete cascade,
  segment_id uuid not null references public.transcript_segments(id) on delete cascade,
  quote text,
  start_ms bigint,
  end_ms bigint,
  primary key(note_id, segment_id)
);

create table public.processing_jobs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  kind text not null check (kind in ('transcription','note_generation','indexing','export')),
  status text not null default 'queued'
    check (status in ('queued','running','completed','failed','cancelled')),
  attempts integer not null default 0 check (attempts >= 0),
  error_code text,
  error_message text,
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.audit_events (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index conversations_owner_time_idx on public.conversations(owner_id, occurred_at desc);
create index people_owner_name_idx on public.people(owner_id, display_name);
create index events_owner_start_idx on public.events(owner_id, starts_at desc);
create index transcript_conversation_time_idx on public.transcript_segments(conversation_id, start_ms);
create index notes_owner_updated_idx on public.notes(owner_id, updated_at desc);
create index jobs_owner_status_idx on public.processing_jobs(owner_id, status, created_at);

-- Enable RLS everywhere; policies scope each record to the authenticated owner.
do $$
declare t text;
begin
  foreach t in array array[
    'events','people','conversations','conversation_people','audio_assets',
    'consent_records','transcript_segments','notes','note_sources',
    'processing_jobs','audit_events'
  ] loop
    execute format('alter table public.%I enable row level security', t);
    execute format(
      'create policy %I on public.%I for all to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid())',
      t || '_owner_all', t
    );
  end loop;
end $$;

-- Enforce same-owner references at the database boundary, not only in the UI/API.
create or replace function public.memdevos_check_related_owner()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
declare related_owner uuid;
begin
  if tg_table_name = 'conversations' and new.event_id is not null then
    select owner_id into related_owner from public.events where id = new.event_id;
    if related_owner is distinct from new.owner_id then raise exception 'event owner mismatch'; end if;
  elsif tg_table_name = 'conversation_people' then
    select owner_id into related_owner from public.conversations where id = new.conversation_id;
    if related_owner is distinct from new.owner_id then raise exception 'conversation owner mismatch'; end if;
    select owner_id into related_owner from public.people where id = new.person_id;
    if related_owner is distinct from new.owner_id then raise exception 'person owner mismatch'; end if;
  elsif tg_table_name = 'audio_assets' or tg_table_name = 'consent_records'
     or tg_table_name = 'transcript_segments' or tg_table_name = 'processing_jobs' then
    select owner_id into related_owner from public.conversations where id = new.conversation_id;
    if related_owner is distinct from new.owner_id then raise exception 'conversation owner mismatch'; end if;
    if tg_table_name = 'transcript_segments' and new.person_id is not null then
      select owner_id into related_owner from public.people where id = new.person_id;
      if related_owner is distinct from new.owner_id then raise exception 'person owner mismatch'; end if;
    end if;
  elsif tg_table_name = 'notes' and new.conversation_id is not null then
    select owner_id into related_owner from public.conversations where id = new.conversation_id;
    if related_owner is distinct from new.owner_id then raise exception 'conversation owner mismatch'; end if;
  elsif tg_table_name = 'note_sources' then
    select owner_id into related_owner from public.notes where id = new.note_id;
    if related_owner is distinct from new.owner_id then raise exception 'note owner mismatch'; end if;
    select owner_id into related_owner from public.transcript_segments where id = new.segment_id;
    if related_owner is distinct from new.owner_id then raise exception 'segment owner mismatch'; end if;
  end if;
  return new;
end $$;

create trigger conversations_related_owner before insert or update on public.conversations
for each row execute function public.memdevos_check_related_owner();
create trigger conversation_people_related_owner before insert or update on public.conversation_people
for each row execute function public.memdevos_check_related_owner();
create trigger audio_assets_related_owner before insert or update on public.audio_assets
for each row execute function public.memdevos_check_related_owner();
create trigger consent_records_related_owner before insert or update on public.consent_records
for each row execute function public.memdevos_check_related_owner();
create trigger transcript_segments_related_owner before insert or update on public.transcript_segments
for each row execute function public.memdevos_check_related_owner();
create trigger notes_related_owner before insert or update on public.notes
for each row execute function public.memdevos_check_related_owner();
create trigger note_sources_related_owner before insert or update on public.note_sources
for each row execute function public.memdevos_check_related_owner();
create trigger processing_jobs_related_owner before insert or update on public.processing_jobs
for each row execute function public.memdevos_check_related_owner();

-- Storage bucket creation and storage.objects policies are intentionally separate:
-- create a private bucket named "conversation-audio" and scope object paths by auth.uid().
