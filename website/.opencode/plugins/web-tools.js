import { spawn } from "node:child_process"
import path from "node:path"
import { mkdirSync, writeFileSync } from "node:fs"
import { tool } from "@opencode-ai/plugin"

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const PORT = 9333
const CDPFN = process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

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

async function send(ws, method, params = {}) {
  const id = ++seq
  ws.send(JSON.stringify({ id, method, params }))
  const res = await cdp(ws, id)
  if (res.error) throw new Error(JSON.stringify(res.error))
  return res.result
}

async function evaluate(ws, expression) {
  const res = await send(ws, "Runtime.evaluate", {
    expression,
    returnByValue: true,
    awaitPromise: true,
    userGesture: true,
  })
  if (res.exceptionDetails) throw new Error("Evaluation failed: " + (res.exceptionDetails.text || "unknown"))
  return res.result.value
}

async function probe() {
  return (await fetch(`http://127.0.0.1:${PORT}/json/version`).catch(() => null))?.ok === true
}

async function ensureChrome(profileDir) {
  if (await probe()) return
  spawn(CDPFN, [
    `--remote-debugging-port=${PORT}`, `--user-data-dir=${profileDir}`,
    "--no-first-run", "--no-default-browser-check", "--noerrdialogs",
    "--hide-crash-restore-bubble", "--disable-background-networking",
    "--disable-component-update", "--disable-default-apps", "--disable-sync",
    "--disable-translate", "--no-pings",
    "--disable-features=Translate,MediaRouter",
    "--disable-blink-features=AutomationControlled",
    "--window-size=1280,900", "about:blank",
  ], { stdio: "ignore", detached: true }).unref()
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

async function openTab(directory) {
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

async function waitFor(ws, expression, timeout = 15000, interval = 300) {
  const deadline = Date.now() + timeout
  while (Date.now() < deadline) {
    const v = await evaluate(ws, expression).catch(() => null)
    if (v) return v
    await sleep(interval)
  }
  return null
}

const EXTRACT_TEXT = `(async () => {
  const clone = (el) => {
    const c = el.cloneNode(true)
    c.querySelectorAll("script,style,noscript,svg,iframe,form,button,nav,header,footer,[aria-hidden='true']").forEach((n) => n.remove())
    return c
  }
  const el = document.querySelector("article") || document.querySelector("main") || document.body
  const text = clone(el).innerText.replace(/\\n{3,}/g, "\\n\\n").trim()
  return { title: document.title, url: location.href, text }
})()`

const EXTRACT_RESULTS = `(async () => {
  const out = []
  const seen = new Set()
  for (const h of document.querySelectorAll("h3")) {
    const a = h.closest("a")
    if (!a) continue
    const u = a.href
    if (seen.has(u)) continue
    seen.add(u)
    const block = h.closest("div[data-hveid]") || a.parentElement
    let snippet = ""
    if (block) {
      const sn = block.querySelector("div[data-sncf], div.VwiC3b, span[data-sncf]")
      if (sn) snippet = sn.innerText
    }
    out.push({ title: h.innerText.trim(), url: u, snippet: snippet.trim() })
  }
  return out
})()`

async function handleConsent(ws) {
  await evaluate(ws, `(async () => {
    const f = document.querySelector('form[action*="consent.google.com/save"], form[action*="/save"]')
    if (!f) return false
    for (const n of ["x", "y"]) {
      let i = f.querySelector('input[name="' + n + '"]')
      if (!i) { i = document.createElement("input"); i.name = n; f.appendChild(i) }
      i.value = n === "x" ? "1" : "3"
    }
    f.submit()
    return true
  })()`)
  await sleep(1500)
}

async function resolveUrl(href) {
  if (!/^https:\/\/(www\.)?google\.com\/(goto|url)\?/.test(href)) return href
  try {
    const r = await fetch(href, {
      redirect: "manual",
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
      },
    })
    const loc = r.headers.get("location")
    return loc && /^https?:\/\//.test(loc) ? loc : href
  } catch { return href }
}

export const WebToolsPlugin = async (ctx) => {

  async function doSearch(args, context) {
    const directory = context.directory || context.worktree || process.cwd()
    const { ws, tabId } = await openTab(directory)
    try {
      const url = `https://www.google.com/search?q=${encodeURIComponent(args.query)}&hl=en&gl=US&udm=14&num=${Math.min((args.max_results ?? 6) + 2, 20)}`
      await send(ws, "Page.navigate", { url })
      for (let i = 0; i < 120; i++) {
        await sleep(1500)
        const st = await evaluate(ws, `(async () => ({ cons: location.hostname.includes("consent"), cap: location.pathname.includes("sorry"), h3: document.querySelectorAll("h3").length }))()`).catch(() => null)
        if (!st) continue
        if (st.cap) {
          const cpDir = path.join(directory, ".opencode", ".chrome-data")
          return "⚠️  Google served a CAPTCHA.\n\nThe Chrome window on port 9333 (profile: " + cpDir + ") is now showing the CAPTCHA. Solve it manually in Chrome — the search will **retry automatically every 1.5s** until results appear, or stop after 3 minutes."
        }
        if (st.cons) { await handleConsent(ws); continue }
        if (st.h3 > 0) break
      }
      const results = await evaluate(ws, EXTRACT_RESULTS)
      const sliced = results.slice(0, args.max_results ?? 6)
      const resolved = await Promise.all(sliced.map((r) => resolveUrl(r.url)))
      const lines = [`Google results for "${args.query}":`]
      resolved.forEach((u, i) => {
        const r = sliced[i]
        lines.push(`${i + 1}. ${r.title}\n   ${u}`)
        if (r.snippet) lines.push(`   ${r.snippet.slice(0, 200)}`)
      })
      if (sliced.length === 0) lines.push("(no organic results returned)")
      return lines.join("\n")
    } finally { ws.close() }
  }

  async function doFetch(args, context) {
    const directory = context.directory || context.worktree || process.cwd()
    const { ws, tabId } = await openTab(directory)
    try {
      await send(ws, "Page.navigate", { url: args.url })
      await waitFor(ws, `document.readyState === "complete"`, 15000)
      await sleep(1000)
      const { title, url: finalUrl, text } = await evaluate(ws, EXTRACT_TEXT)
      const maxChars = args.max_chars ?? 10000
      const snippet = text.length > maxChars ? text.slice(0, text.lastIndexOf(" ", maxChars)) + "…" : text
      return `# ${title}\nURL: ${finalUrl}\n\n${snippet}`
    } finally { ws.close() }
  }

  async function doScreenshot(args, context) {
    const directory = context.directory || context.worktree || process.cwd()
    const { ws } = await openTab(directory)
    try {
      await send(ws, "Emulation.setDeviceMetricsOverride", {
        width: args.width ?? 1280, height: 900, deviceScaleFactor: 1, mobile: false,
      })
      await send(ws, "Page.navigate", { url: args.url })
      await waitFor(ws, `document.readyState === "complete"`, 15000)
      await sleep(1200)
      let clip
      if (args.selector) {
        const rect = await evaluate(ws, `(async () => {
          const el = document.querySelector(${JSON.stringify(args.selector)})
          if (!el) return null
          const r = el.getBoundingClientRect()
          return { x: r.x, y: r.y, width: r.width, height: r.height }
        })()`)
        if (!rect) throw new Error("Selector not found: " + args.selector)
        clip = { ...rect, scale: 1 }
      }
      const shot = await send(ws, "Page.captureScreenshot", {
        format: "png",
        captureBeyondViewport: args.full_page !== false && !clip,
        fromSurface: true,
        ...(clip ? { clip } : {}),
      })
      const dir = path.join(directory, ".opencode", "screenshots")
      mkdirSync(dir, { recursive: true })
      const file = path.join(dir, `shot-${Date.now()}.png`)
      writeFileSync(file, Buffer.from(shot.data, "base64"))
      const title = await evaluate(ws, "document.title").catch(() => "")
      const finalUrl = await evaluate(ws, "location.href").catch(() => "")
      return `Screenshot saved: ${file}\nTitle: ${title}\nURL: ${finalUrl}\nUse the read tool on the file to view it.`
    } finally { ws.close() }
  }

  return {
    tool: {
      web_search: {
        description: "Search the web using Google via a real Chrome browser. Returns compact organic results (title, real URL, snippet). Use for up-to-date research, current events, and anything the model's training may not cover.",
        args: {
          query: tool.schema.string().describe("Google search query"),
          max_results: tool.schema.number().int().min(1).max(10).optional().describe("Number of results to return (default 6)"),
        },
        async execute(args, context) { return doSearch(args, context) },
      },
      web_fetch: {
        description: "Open a URL in Chrome and return its readable text, including JS-rendered content. Use to read articles, docs, or any page body text.",
        args: {
          url: tool.schema.string().describe("Full URL to read"),
          max_chars: tool.schema.number().int().min(500).max(60000).optional().describe("Max characters of text to return (default 10000)"),
        },
        async execute(args, context) { return doFetch(args, context) },
      },
      web_screenshot: {
        description: "Capture a screenshot of a web page (or a single element) in Chrome and save it to .opencode/screenshots/. Returns the image file path - view it with the read tool.",
        args: {
          url: tool.schema.string().describe("Full URL to capture"),
          full_page: tool.schema.boolean().optional().describe("Capture the full scrollable page instead of just the viewport (default true)"),
          selector: tool.schema.string().optional().describe("CSS selector of an element to capture instead of the whole page"),
          width: tool.schema.number().int().min(320).max(3840).optional().describe("Viewport width in pixels (default 1280)"),
        },
        async execute(args, context) { return doScreenshot(args, context) },
      },
    },
  }
}