import { fetch } from "expo/fetch";
import { SensorWithReading, FireReport, Alert } from "../types";
import { formatTemp } from "../store/settings";

/**
 * Uinta Agent — streaming chat client for the project's field-intelligence
 * assistant. Talks to the local antseed proxy (OpenAI-compatible), the same
 * endpoint the dev tooling uses. iOS simulators share the host network, so
 * `localhost` resolves from the app.
 */
const AGENT_URL =
  (typeof process !== "undefined" && process.env.EXPO_PUBLIC_AGENT_URL) ||
  "http://localhost:8377/v1/chat/completions";

const AGENT_MODEL =
  (typeof process !== "undefined" && process.env.EXPO_PUBLIC_AGENT_MODEL) ||
  "claude-haiku-4-5";

export interface AgentChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export class AgentError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = "AgentError";
  }
}

function relTime(iso: string): string {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  if (mins < 1440) return `${Math.floor(mins / 60)}h ago`;
  return `${Math.floor(mins / 1440)}d ago`;
}

/**
 * Builds the agent persona + injects a live snapshot of the simulated
 * network so answers are grounded in what the app is showing right now.
 * The dataset is scripted simulation — the agent must be honest about that.
 */
export function buildSystemPrompt(
  sensors: SensorWithReading[],
  reports: FireReport[],
  alerts: Alert[],
): string {
  const lines: string[] = [
    "You are the Uinta Agent, the field-intelligence assistant inside the Uinta Watch iOS app.",
    "Uinta Watch is an open wildfire-sensing lab for the Uintah Basin, Utah: a mesh of HFENS sensor nodes (BME688 + PM2.5, LoRa mesh to a gateway) monitoring temperature, humidity, pressure, VOC, battery and wind to detect early smoke/fire signatures. Everything in the app currently comes from a scripted simulation dataset — no physical nodes are deployed yet. Always be honest that data is simulated when it matters.",
    "Be concise and field-practical: short paragraphs or compact lists, numbers with units, actionable advice. Reply in PLAIN TEXT only — no markdown syntax (no **, no #, no pipe tables); use dashes for bullets. Never invent sensors, readings, or reports that are not in the snapshot below. If asked about something outside the snapshot, say what you would need.",
  ];

  if (sensors.length > 0) {
    lines.push("Live sensor snapshot (simulated):");
    for (const s of sensors) {
      const r = s.latestReading;
      const reading = r
        ? `${formatTemp(r.tempC, "metric").value}°C, ${r.humidityPct.toFixed(0)}% RH, battery ${(r.batteryMv / 1000).toFixed(2)}V${r.windMs != null ? `, wind ${r.windMs.toFixed(1)} m/s` : ""}, seen ${relTime(r.timestamp)}`
        : "no recent reading";
      lines.push(`- ${s.name} [${s.status}] @ (${s.lat.toFixed(3)}, ${s.lng.toFixed(3)}): ${reading}`);
    }
  }
  const activeAlerts = alerts.filter(a => !a.resolved);
  if (activeAlerts.length > 0) {
    lines.push("Active alerts (simulated):");
    for (const a of activeAlerts.slice(0, 8)) {
      lines.push(`- [${a.severity}] ${a.message} (${relTime(a.triggeredAt)})`);
    }
  }
  if (reports.length > 0) {
    lines.push("Recent community smoke/fire reports (simulated):");
    for (const r of reports.slice(0, 5)) {
      lines.push(`- ${r.verified ? "Verified" : "Unverified"} @ (${r.lat.toFixed(3)}, ${r.lng.toFixed(3)}): "${r.text}" (${relTime(r.submittedAt)})`);
    }
  }
  return lines.join("\n");
}

/**
 * Streams an assistant reply from the proxy. `onDelta` is called per token;
 * resolves with the full text. Aborts cleanly on signal abort.
 */
export async function streamAgentReply(
  messages: AgentChatMessage[],
  onDelta: (token: string) => void,
  signal?: AbortSignal,
): Promise<string> {
  let res: Response;
  try {
    res = await fetch(AGENT_URL, {
      method: "POST",
      headers: {
        "Authorization": "Bearer antseed",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: AGENT_MODEL,
        stream: true,
        messages,
      }),
      signal,
    });
  } catch (err) {
    throw new AgentError("Could not reach the agent service.", err);
  }

  if (!res.ok || !res.body) {
    throw new AgentError(`Agent service error (HTTP ${res.status}).`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let full = "";

  const handleLine = (line: string) => {
    if (!line.startsWith("data:")) return;
    const payload = line.slice(5).trim();
    if (!payload || payload === "[DONE]") return;
    try {
      const chunk = JSON.parse(payload) as {
        choices?: Array<{ delta?: { content?: string } }>;
      };
      const token = chunk.choices?.[0]?.delta?.content;
      if (token) {
        full += token;
        onDelta(token);
      }
    } catch {
      // malformed keep-alive chunk — ignore
    }
  };

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split("\n");
    buffer = parts.pop() ?? "";
    for (const line of parts) handleLine(line.trim());
  }
  if (buffer.trim()) handleLine(buffer.trim());

  if (!full) throw new AgentError("The agent returned an empty response.");
  return full;
}
