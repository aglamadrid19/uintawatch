import { spawn } from "node:child_process"
import path from "node:path"

export const PORT = 9333
const CHROME =
  process.env.CHROME_PATH ||
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
let seq = 0

function cdp(ws, id) {
  return new Promise((resolve) => {
    const handler = (ev) => {
      const msg = JSON.parse(ev.data)
      if (msg.id === id) {
        ws.removeEventListener("message", handler)
        resolve(msg)
      }
    }
    ws.addEventListener("message", handler)
  })
}

export async function send(ws, method, params = {}) {
  const id = ++seq
  ws.send(JSON.stringify({ id, method, params }))
  const res = await cdp(ws, id)
  if (res.error) throw new Error(JSON.stringify(res.error))
  return res.result
}

export async function evaluate(ws, expression) {
  const res = await send(ws, "Runtime.evaluate", {
    expression,
    returnByValue: true,
    awaitPromise: true,
    userGesture: true,
  })
  if (res.exceptionDetails) {
    throw new Error("Evaluation failed: " + (res.exceptionDetails.text || "unknown"))
  }
  return res.result.value
}

async function probe() {
  return (await fetch(`http://127.0.0.1:${PORT}/json/version`).catch(() => null))?.ok === true
}

async function ensureChrome(profileDir) {
  if (await probe()) return
  spawn(
    CHROME,
    [
      `--remote-debugging-port=${PORT}`,
      `--user-data-dir=${profileDir}`,
      "--no-first-run",
      "--no-default-browser-check",
      "--noerrdialogs",
      "--hide-crash-restore-bubble",
      "--disable-background-networking",
      "--disable-component-update",
      "--disable-default-apps",
      "--disable-sync",
      "--disable-translate",
      "--no-pings",
      "--disable-features=Translate,MediaRouter",
      "--disable-blink-features=AutomationControlled",
      "--window-size=1280,900",
      "about:blank",
    ],
    { stdio: "ignore", detached: true }
  ).unref()
  for (let i = 0; i < 60; i++) {
    await sleep(300)
    if (await probe()) return
  }
  throw new Error("Chrome did not start on port " + PORT)
}

async function newTab() {
  const res = await fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, { method: "PUT" })
  if (!res.ok) throw new Error("Failed to open Chrome tab: " + res.status)
  return res.json()
}

export async function closeTab(tabId) {
  await fetch(`http://127.0.0.1:${PORT}/json/close/${tabId}`, { method: "PUT" }).catch(() => {})
}

export async function openTab(directory) {
  const profileDir = path.join(directory, ".opencode", ".chrome-data")
  await ensureChrome(profileDir)
  const tab = await newTab()
  const ws = new WebSocket(tab.webSocketDebuggerUrl)
  await new Promise((res, rej) => {
    ws.addEventListener("open", res)
    ws.addEventListener("error", rej)
  })
  await send(ws, "Page.enable")
  return { ws, tabId: tab.id }
}

export async function navigate(ws, url) {
  await send(ws, "Page.navigate", { url })
}

export async function waitFor(ws, expression, timeout = 15000, interval = 300) {
  const deadline = Date.now() + timeout
  while (Date.now() < deadline) {
    const v = await evaluate(ws, expression).catch(() => null)
    if (v) return v
    await sleep(interval)
  }
  return null
}
