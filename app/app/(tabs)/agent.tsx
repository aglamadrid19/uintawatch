import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSensors, useReports, useAlerts } from "../../src/hooks";
import { BrandedHeader } from "../../src/components";
import {
  buildSystemPrompt,
  streamAgentReply,
  AgentChatMessage,
  AgentError,
} from "../../src/services/agent";
import { colors, spacing, radius, shadows } from "../../src/theme";
import { fonts } from "../../src/theme/typography";

interface ChatEntry {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const SUGGESTED_PROMPTS = [
  "What's the fire risk right now?",
  "Which sensors are alerting and why?",
  "Summarize today's network conditions",
];

let entrySeq = 0;
const nextId = () => `m${++entrySeq}`;

/**
 * Uinta Agent chat — a field-intelligence assistant grounded in the live
 * (simulated) network snapshot. Streams replies from the local antseed proxy.
 */
export default function AgentScreen() {
  const { data: sensors } = useSensors(true);
  const { data: reports } = useReports();
  const { data: alerts } = useAlerts();

  const [messages, setMessages] = useState<ChatEntry[]>([]);
  const [draft, setDraft] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const listRef = useRef<FlatList<ChatEntry>>(null);

  useEffect(() => () => abortRef.current?.abort(), []);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || streaming) return;

      const userEntry: ChatEntry = { id: nextId(), role: "user", content: trimmed };
      const replyId = nextId();
      setMessages(prev => [
        { id: replyId, role: "assistant", content: "" },
        userEntry,
        ...prev,
      ]);
      setDraft("");
      setStreaming(true);
      setError(null);

      const history: AgentChatMessage[] = [
        { role: "system", content: buildSystemPrompt(sensors ?? [], reports ?? [], alerts ?? []) },
        ...messages
          .slice()
          .reverse()
          .map(m => ({ role: m.role, content: m.content }) as AgentChatMessage),
        { role: "user" as const, content: trimmed },
      ];

      const controller = new AbortController();
      abortRef.current = controller;

      const appendDelta = (token: string) => {
        setMessages(prev =>
          prev.map(m => (m.id === replyId ? { ...m, content: m.content + token } : m)),
        );
      };

      try {
        await streamAgentReply(history, appendDelta, controller.signal);
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          const msg =
            err instanceof AgentError
              ? err.message
              : "Something went wrong reaching the agent.";
          setError(msg);
          setMessages(prev => prev.filter(m => m.id !== replyId));
        }
      } finally {
        setStreaming(false);
        abortRef.current = null;
      }
    },
    [alerts, messages, reports, sensors, streaming],
  );

  const isEmpty = messages.length === 0;

  return (
    <View style={styles.container}>
      <BrandedHeader hideBadge />

      <KeyboardAvoidingView
        style={styles.chatArea}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {isEmpty ? (
          <EmptyState onPick={send} disabled={streaming} />
        ) : (
          <FlatList
            ref={listRef}
            style={styles.messageList}
            data={messages}
            inverted
            keyExtractor={(m: ChatEntry) => m.id}
            contentContainerStyle={styles.messageContent}
            renderItem={({ item }: { item: ChatEntry }) => (
              <ChatBubble entry={item} streaming={streaming && item.role === "assistant" && item.id === messages[0]?.id} />
            )}
          />
        )}

        {error !== null && (
          <View style={styles.errorRow}>
            <Ionicons name="cloud-offline" size={14} color={colors.fireText} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={() => setError(null)} accessibilityRole="button" accessibilityLabel="Dismiss error">
              <Text style={styles.errorDismiss}>Dismiss</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* The tab bar already absorbs the home-indicator inset — the row
            only adds its own slim padding (no dead band under the input) */}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={draft}
            onChangeText={setDraft}
            placeholder="Ask the Uinta Agent…"
            placeholderTextColor={colors.inkDim}
            multiline
            editable={!streaming}
            accessibilityLabel="Message to the Uinta Agent"
          />
          <TouchableOpacity
            style={[styles.sendBtn, (draft.trim() === "" || streaming) && styles.sendBtnDisabled]}
            disabled={draft.trim() === "" || streaming}
            onPress={() => send(draft)}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Send message"
          >
            {streaming ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="arrow-up" size={20} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const EmptyState: React.FC<{ onPick: (t: string) => void; disabled: boolean }> = ({ onPick, disabled }) => (
  <View style={styles.emptyWrap}>
    <View style={styles.emptyAvatar}>
      <Ionicons name="sparkles" size={28} color={colors.fire} />
    </View>
    <Text style={styles.emptyTitle}>Uinta Agent</Text>
    <Text style={styles.emptySubtitle}>
      Field intelligence for the Uintah Basin sensor mesh — grounded in the live (simulated) network snapshot.
    </Text>
    {SUGGESTED_PROMPTS.map((p) => (
      <TouchableOpacity
        key={p}
        style={styles.suggestChip}
        disabled={disabled}
        onPress={() => onPick(p)}
        activeOpacity={0.75}
        accessibilityRole="button"
        accessibilityLabel={`Ask: ${p}`}
      >
        <Text style={styles.suggestText}>{p}</Text>
      </TouchableOpacity>
    ))}
  </View>
);

/** Fallback scrub for markdown the model still emits (V11). */
function cleanMarkdown(s: string): string {
  return s
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/(^|[\s(])\*(?!\s)(.+?)\*(?=[\s.,)!]|$)/g, "$1$2")
    .replace(/`(.+?)`/g, "$1")
    .split("\n")
    .map(l =>
      l.trimStart().startsWith("|")
        ? l.replace(/^\s*\|/, "").replace(/\|\s*$/, "").split("|").map(c => c.trim()).filter(Boolean).join(" — ")
        : l,
    )
    .join("\n");
}

const ChatBubble: React.FC<{ entry: ChatEntry; streaming?: boolean }> = ({ entry, streaming }) => {
  const isUser = entry.role === "user";
  return (
    <View style={[styles.bubbleRow, isUser ? styles.bubbleRowUser : null]}>
      <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAgent]}>
        {entry.content === "" ? (
          <TypingDots />
        ) : (
          <Text style={isUser ? styles.bubbleUserText : styles.bubbleAgentText}>
            {cleanMarkdown(entry.content)}
            {streaming && <Text style={styles.caret}> ▍</Text>}
          </Text>
        )}
      </View>
    </View>
  );
};

const TypingDots: React.FC = () => (
  <View style={styles.dotsRow} accessibilityLabel="Agent is typing">
    {[0, 1, 2].map(i => (
      <View key={i} style={[styles.dot, i === 1 && styles.dotMid, i === 2 && styles.dotEnd]} />
    ))}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  chatArea: {
    flex: 1,
  },
  messageList: {
    flex: 1,
  },
  messageContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  bubbleRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginTop: spacing.sm + 4,
  },
  bubbleRowUser: {
    justifyContent: "flex-end",
  },
  bubble: {
    maxWidth: "85%",
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderCurve: "continuous",
  },
  bubbleAgent: {
    backgroundColor: colors.surface,
    borderBottomLeftRadius: 4,
    ...shadows.sm,
  },
  bubbleUser: {
    backgroundColor: colors.fire,
    borderBottomRightRadius: 4,
    ...shadows.sm,
  },
  bubbleAgentText: {
    fontSize: 15,
    lineHeight: 21,
    color: colors.ink,
  },
  bubbleUserText: {
    fontSize: 15,
    lineHeight: 21,
    color: "#fff",
  },
  caret: {
    color: colors.inkMuted,
  },
  dotsRow: {
    flexDirection: "row",
    gap: 5,
    paddingVertical: 4,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.inkDim,
  },
  dotMid: { opacity: 0.66 },
  dotEnd: { opacity: 0.4 },

  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs + 2,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    backgroundColor: colors.fireGlow,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  errorText: {
    flex: 1,
    fontSize: 12,
    color: colors.fireText,
  },
  errorDismiss: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.fireText,
  },

  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.bgAlt,
    backgroundColor: colors.bg,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontSize: 15,
    color: colors.ink,
    ...shadows.sm,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.fire,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.sm,
  },
  sendBtnDisabled: {
    backgroundColor: colors.inkDim,
  },

  emptyWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
  },
  emptyAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.fireGlow,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 22,
    color: colors.ink,
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.inkMuted,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  suggestChip: {
    backgroundColor: colors.surface,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    marginTop: spacing.sm,
    ...shadows.sm,
  },
  suggestText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.fireText,
  },
});
