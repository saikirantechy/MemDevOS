import { useState } from "react";
import { Pressable, SafeAreaView, ScrollView, Text, View } from "react-native";
import { demoConversations, demoEvent } from "@memdevos/shared/src/mock-data";
import { theme } from "@memdevos/shared/src/theme";

const nav = ["Home", "Capture", "Conversations", "People", "Events", "AI Chat"];

export default function Index() {
  const [screen, setScreen] = useState("Home");
  const [consent, setConsent] = useState(false);
  const [mockRecording, setMockRecording] = useState(false);
  const [selected, setSelected] = useState(demoConversations[0]);

  const buttonStyle = (active = false) => ({
    backgroundColor: active ? "#34314D" : theme.colors.surface,
    borderColor: active ? theme.colors.accent : theme.colors.border,
    borderWidth: 1, padding: 12, borderRadius: 12, marginBottom: 8
  } as const);

  return <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
    <ScrollView contentContainerStyle={{ padding: 18, gap: 12 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 8 }}>
        <Text style={{ color: theme.colors.accent, fontSize: 28 }}>✳</Text>
        <View><Text style={{ color: theme.colors.text, fontSize: 22, fontWeight: "800" }}>MemDevOS</Text><Text style={{ color: theme.colors.muted, fontSize: 11 }}>PERSONAL WORKSPACE · SAMPLE DATA</Text></View>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {nav.map(n => <Pressable key={n} onPress={() => setScreen(n)} style={[buttonStyle(screen === n), { marginRight: 6 }]}><Text style={{ color: theme.colors.text }}>{n}</Text></Pressable>)}
      </ScrollView>
      <Text style={{ color: theme.colors.text, fontSize: 26, fontWeight: "700" }}>{screen}</Text>

      {screen === "Home" && <>
        <View style={buttonStyle()}><Text style={{ color: theme.colors.muted }}>CURRENT SAMPLE EVENT</Text><Text style={{ color: theme.colors.text, fontSize: 18, marginTop: 6 }}>{demoEvent.name}</Text><Text style={{ color: theme.colors.muted, marginTop: 4 }}>{demoConversations.length} fictional conversations</Text></View>
        {demoConversations.map(c => <Pressable key={c.id} onPress={() => {setSelected(c);setScreen("Conversations");}} style={buttonStyle()}><Text style={{ color: theme.colors.text, fontWeight: "700" }}>{c.title}</Text><Text style={{ color: theme.colors.muted, marginTop: 6 }}>{c.summary}</Text></Pressable>)}
      </>}

      {screen === "Capture" && <View style={buttonStyle()}>
        <Text style={{ color: theme.colors.text, fontSize: 19, fontWeight: "700" }}>{mockRecording ? "Demo recording state" : "Ready to capture"}</Text>
        <Text style={{ color: theme.colors.muted, marginVertical: 10 }}>No microphone is accessed. This is a UI mock, not a real recording.</Text>
        <Pressable onPress={() => setConsent(!consent)} style={[buttonStyle(consent), { flexDirection: "row", gap: 10 }]}><Text style={{ color: theme.colors.accent }}>{consent ? "☑" : "☐"}</Text><Text style={{ color: theme.colors.text, flex: 1 }}>I have completed the appropriate consent checks. This attestation is not legal verification.</Text></Pressable>
        <Pressable disabled={!consent} onPress={() => setMockRecording(!mockRecording)} style={[buttonStyle(true), { opacity: consent ? 1 : 0.45 }]}><Text style={{ color: theme.colors.text, textAlign: "center" }}>{mockRecording ? "Stop demo state" : "Preview mock state"}</Text></Pressable>
      </View>}

      {screen === "Conversations" && <View style={buttonStyle()}><Text style={{ color: theme.colors.accent }}>CONVERSATION DETAIL · DEMO</Text><Text style={{ color: theme.colors.text, fontSize: 20, fontWeight: "700", marginVertical: 8 }}>{selected.title}</Text><Text style={{ color: theme.colors.muted }}>{selected.summary}</Text><Text style={{ color: theme.colors.text, marginTop: 18, fontWeight: "700" }}>Transcript</Text><Text style={{ color: theme.colors.muted, marginTop: 6 }}>Connect the transcript detail API to show timestamped segments and source-linked notes.</Text></View>}

      {screen === "People" && <View>{demoConversations.map(c => <View key={c.id} style={buttonStyle()}><Text style={{ color: theme.colors.text, fontWeight: "700" }}>{c.personIds[0] === "person-demo-alex" ? "Alex Morgan" : "Maya Chen"}</Text><Text style={{ color: theme.colors.muted, marginTop: 6 }}>Identity not confirmed · sample profile</Text></View>)}</View>}
      {screen === "Events" && <View style={buttonStyle()}><Text style={{ color: theme.colors.text, fontSize: 20 }}>{demoEvent.name}</Text><Text style={{ color: theme.colors.muted, marginTop: 6 }}>Fictional event record; no actual location or attendees stored.</Text></View>}
      {screen === "AI Chat" && <View style={buttonStyle()}><Text style={{ color: theme.colors.text, fontSize: 18 }}>Ask your memory</Text><Text style={{ color: theme.colors.muted, marginTop: 8 }}>Mock only. Connect retrieval and source citations before using answers as factual personal memory.</Text></View>}
    </ScrollView>
  </SafeAreaView>;
}
