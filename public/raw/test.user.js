// ==UserScript==
// @name         VortixWorld Bypass
// @namespace    afklolbypasser
// @version      2.8
// @description  Bypass 💩 Fr
// @author       afk.l0l
// @match        *://*/*
// @icon         https://i.ibb.co/LdshK1fR/461-F6268-08-F3-4-E8A-BC73-409218-A3-F168.jpg
// @require      https://vortixworlduserscript.vercel.app/raw/vw-test.js
// @grant        GM_getValue
// @grant        GM_setValue
// @license      MIT
// @run-at       document-start
// ==/UserScript==

;(function () {
  'use strict'

  const HOST = (location.hostname || '').toLowerCase().replace(/^www\./, '')
  const ICON_URL = 'https://i.ibb.co/LdshK1fR/461-F6268-08-F3-4-E8A-BC73-409218-A3-F168.jpg'
  const LOOTLINK_UI_ICON = 'https://i.ibb.co/s0yg2cv/AA1-D3-E03-2205-4572-ACFB-29-B8-B9-DDE381.png'
  const LUARMOR_UI_ICON = 'https://i.ibb.co/BDQS9rS/F20-A6183-C85E-447-C-A27-C-11-B9-E8971-B45.png'
  const TPI_HOST = 'tpi.li'
  const API_BASE = 'https://vortixworld-end.vercel.app'

  const LOOT_HOSTS = [
    'loot-link.com', 'loot-links.com', 'lootlink.org', 'lootlinks.co',
    'lootdest.info', 'lootdest.org', 'lootdest.com', 'links-loot.com',
    'linksloot.net', 'lootlinks.com', 'best-links.org', 'loot-labs.com',
    'lootlabs.com', 'fast-links.org', 'rapid-links.com', 'rapid-links.net'
  ]

  const ALLOWED_SHORT_HOSTS = [
    'linkvertise.com', 'admaven.com', 'work.ink', 'shortearn.eu',
    'beta.shortearn.eu', 'cuty.io', 'ouo.io', 'lockr.so',
    'rekonise.com', 'mboost.me', 'link-unlocker.com', 'direct-link.net',
    'direct-links.net', 'direct-links.org', 'link-center.net', 'link-hub.net',
    'link-pays.in', 'link-target.net', 'link-target.org', 'link-to.net'
  ]

  const UA = navigator.userAgent
  const isIOS = /iPad|iPhone|iPod/.test(UA) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  const isAndroid = /Android/.test(UA)
  const isMobile = isIOS || isAndroid || /Mobi|Tablet/.test(UA)

  if (isIOS) document.documentElement.classList.add('vw-ios')
  if (isAndroid) document.documentElement.classList.add('vw-android')
  if (isMobile) document.documentElement.classList.add('vw-mobile')
  if (!isMobile) document.documentElement.classList.add('vw-desktop')

  function hostMatchesAny(list) {
    const h = HOST
    for (const base of list) {
      if (h === base) return true
      if (h.endsWith('.' + base)) return true
    }
    return false
  }

  const isLootHost = () => hostMatchesAny(LOOT_HOSTS)
  const isAllowedHost = () => hostMatchesAny(ALLOWED_SHORT_HOSTS)
  const isTpiLi = () => HOST === TPI_HOST || HOST.endsWith('.' + TPI_HOST)

  const CONFIG = Object.freeze({
    HEARTBEAT_INTERVAL: 10,
    MAX_RECONNECT_DELAY: 30000,
    INITIAL_RECONNECT_DELAY: 1000,
    COUNTDOWN_INTERVAL: 1000,
    FALLBACK_CHECK_DELAY: 15000
  })

  const VW_KEYS = window.VW_CONFIG?.keys || {
    autoRedirect: 'vw_auto_redirect',
    userAgent: 'vw_user_agent'
  }

  function getStoredValue(key, defaultValue) {
    if (typeof GM_getValue === 'function') {
      try {
        return GM_getValue(key, defaultValue)
      } catch (_) {}
    }
    try {
      const lsValue = localStorage.getItem(key)
      if (lsValue === null) return defaultValue
      if (typeof defaultValue === 'boolean') return lsValue === 'true'
      if (typeof defaultValue === 'number') {
        const n = parseInt(lsValue, 10)
        return Number.isFinite(n) ? n : defaultValue
      }
      return lsValue
    } catch (_) {
      return defaultValue
    }
  }

  function getEffectiveUA() {
    const stored = getStoredValue(VW_KEYS.userAgent, null)
    if (stored && stored !== '') return stored
    if (isIOS) return 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1'
    if (isAndroid) return 'Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.144 Mobile Safari/537.36'
    return 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.130 Safari/537.36'
  }

  const ANDROID_UA = getEffectiveUA()

  try {
    Object.defineProperty(navigator, 'userAgent', { get: () => ANDROID_UA, configurable: false })
  } catch (e) {}

  window.__vw_logs = window.__vw_logs || []
  const LOG_STYLE = {
    base: 'font-weight:800; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;',
    info: 'color:#22c55e;',
    warn: 'color:#f59e0b;',
    error: 'color:#ef4444;',
    websocket: 'color:#a855f7;',
    dim: 'color:#94a3b8;'
  }

  const Logger = {
    _push(level, msg, data) {
      const entry = { timestamp: new Date().toISOString(), level, message: msg, data: data !== undefined ? String(data) : '' }
      window.__vw_logs.push(entry)
      if (window.__vw_logs.length > 500) window.__vw_logs.shift()
    },
    info: (m, d = '') => {
      console.info(`%c[INFO]%c [VortixBypass] ${m}`, LOG_STYLE.base + LOG_STYLE.info, LOG_STYLE.base + LOG_STYLE.dim, d || '')
      Logger._push('info', m, d)
    },
    warn: (m, d = '') => {
      console.warn(`%c[WARN]%c [VortixBypass] ${m}`, LOG_STYLE.base + LOG_STYLE.warn, LOG_STYLE.base + LOG_STYLE.dim, d || '')
      Logger._push('warn', m, d)
    },
    error: (m, d = '') => {
      console.error(`%c[ERROR]%c [VortixBypass] ${m}`, LOG_STYLE.base + LOG_STYLE.error, LOG_STYLE.base + LOG_STYLE.dim, d || '')
      Logger._push('error', m, d)
    },
    websocket: (m, d = '') => {
      console.info(`%c[WEBSOCKET]%c [VortixBypass] ${m}`, LOG_STYLE.base + LOG_STYLE.websocket, LOG_STYLE.base + LOG_STYLE.dim, d || '')
      Logger._push('websocket', m, d)
    }
  }

  const cleanupManager = {
    intervals: new Set(),
    timeouts: new Set(),
    setInterval(fn, delay, ...args) {
      const id = setInterval(fn, delay, ...args)
      this.intervals.add(id)
      return id
    },
    setTimeout(fn, delay, ...args) {
      const id = setTimeout(() => {
        this.timeouts.delete(id)
        fn(...args)
      }, delay)
      this.timeouts.add(id)
      return id
    },
    clearAll() {
      this.intervals.forEach(id => clearInterval(id))
      this.timeouts.forEach(id => clearTimeout(id))
      this.intervals.clear()
      this.timeouts.clear()
    }
  }

  let isShutdown = false
  function shutdown() {
    if (isShutdown) return
    isShutdown = true
    cleanupManager.clearAll()
    if (window.bypassObserver) { window.bypassObserver.disconnect(); window.bypassObserver = null }
    if (window.primaryWebSocket) { window.primaryWebSocket.disconnect(); window.primaryWebSocket = null }
    if (window.fallbackWebSocket) { window.fallbackWebSocket.disconnect(); window.fallbackWebSocket = null }
    if (window.activeWebSocket) { window.activeWebSocket.disconnect(); window.activeWebSocket = null }
  }

  async function copyTextSilent(text) {
    try {
      if (!text) return false
      if (navigator.clipboard && window.isSecureContext) { await navigator.clipboard.writeText(String(text)); return true }
    } catch (_) {}
    try {
      const ta = document.createElement('textarea')
      ta.value = String(text)
      ta.style.cssText = 'position:fixed;left:-9999px;top:0'
      ;(document.body || document.documentElement).appendChild(ta)
      ta.focus(); ta.select()
      const ok = document.execCommand('copy')
      ta.remove()
      return !!ok
    } catch (_) { return false }
  }

  function isLuarmorUrl(url) {
    try {
      const u = new URL(String(url), location.href)
      const h = (u.hostname || '').toLowerCase()
      return h === 'ads.luarmor.net' || h.endsWith('.ads.luarmor.net')
    } catch (_) { return String(url).includes('ads.luarmor.net') }
  }

  const SHARED_UI_CSS = `
    :root {
      --vw-bg: #1e1e1e;
      --vw-glass-bg: #1e1e1e;
      --vw-text: #e0e0e0;
      --vw-text-dim: #a0a0a0;
      --neu-out: 8px 8px 16px #141414, -8px -8px 16px #282828;
      --neu-in: inset 4px 4px 8px #141414, inset -4px -4px 8px #282828;
      --neu-btn: 4px 4px 8px #141414, -4px -4px 8px #282828;
      --neu-btn-active: inset 4px 4px 8px #141414, inset -4px -4px 8px #282828;
    }
    html, body {
      margin: 0; padding: 0; height: 100%; overflow: hidden; background: var(--vw-bg);
    }
    html.vw-ios #vortixWorldOverlay {
      padding-top: env(safe-area-inset-top) !important;
      padding-bottom: env(safe-area-inset-bottom) !important;
    }
    #vortixWorldOverlay {
      position: fixed !important; top: 0 !important; left: 0 !important; width: 100vw !important;
      height: 100vh !important; height: 100dvh !important; background: var(--vw-bg) !important;
      z-index: 2147483647 !important; display: flex !important; flex-direction: column !important;
      align-items: center !important; justify-content: center !important;
      font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
      opacity: 1 !important; visibility: visible !important; pointer-events: auto !important;
      box-sizing: border-box !important; isolation: isolate !important;
    }
    #vortixWorldOverlay * { box-sizing: border-box !important; }
    .vw-header-bar {
      position: absolute !important; top: 0 !important; left: 0 !important; width: 100% !important;
      height: 72px !important; padding: 0 28px !important; display: flex !important;
      align-items: center !important; justify-content: space-between !important;
      background: var(--vw-bg) !important; box-shadow: 0 4px 10px #141414 !important;
      z-index: 2147483648 !important;
    }
    html.vw-ios .vw-header-bar { top: env(safe-area-inset-top) !important; }
    .vw-title {
      font-weight: 700 !important; font-size: 1.5rem !important; display: flex !important;
      align-items: center !important; gap: 12px !important; color: var(--vw-text) !important;
    }
    .vw-header-icon {
      height: 36px !important; width: 36px !important; border-radius: 50% !important;
      object-fit: cover !important; box-shadow: var(--neu-btn) !important;
    }
    .vw-main-content {
      display: flex !important; flex-direction: column !important; align-items: center !important;
      justify-content: center !important; width: 100% !important; max-width: 520px !important;
      padding: 2.5rem !important; background: var(--vw-bg) !important; border-radius: 24px !important;
      border: none !important; box-shadow: var(--neu-out) !important; text-align: center !important;
      animation: vw-fade-in 0.5s cubic-bezier(0.2, 0.9, 0.4, 1.1) !important;
    }
    .vw-icon-img {
      width: 96px !important; height: 96px !important; border-radius: 50% !important;
      margin-bottom: 1.5rem !important; object-fit: cover !important; box-shadow: var(--neu-btn) !important;
    }
    .vw-spinner {
      width: 48px !important; height: 48px !important; border: 4px solid #141414 !important;
      border-top: 4px solid var(--vw-text) !important; border-radius: 50% !important;
      animation: spin 0.8s linear infinite !important; margin-bottom: 1.5rem !important;
      box-shadow: var(--neu-btn) !important;
    }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    .vw-status {
      font-size: 1.8rem !important; font-weight: 700 !important; color: var(--vw-text) !important;
      margin-bottom: 0.5rem !important;
    }
    .vw-substatus {
      font-size: 0.9rem !important; color: var(--vw-text-dim) !important; background: var(--vw-bg) !important;
      box-shadow: var(--neu-in) !important; padding: 8px 18px !important; border-radius: 40px !important;
      display: inline-block !important; word-break: break-word !important; max-width: 90vw !important;
    }
    .vw-url-container {
      width: 100% !important; margin: 1.5rem 0 1rem 0 !important; padding: 1rem !important;
      background: var(--vw-bg) !important; border-radius: 12px !important; box-shadow: var(--neu-in) !important;
      word-break: break-all !important; font-size: 0.85rem !important; color: #b3b3b3 !important;
      font-family: monospace !important; max-height: 100px !important; overflow-y: auto !important; border: none !important;
    }
    .vw-button-group {
      display: flex !important; gap: 1rem !important; width: 100% !important; margin-top: 1rem !important;
    }
    .vw-btn {
      background: var(--vw-bg) !important; color: var(--vw-text) !important; border: none !important;
      box-shadow: var(--neu-btn) !important; padding: 0.85rem 1rem !important; border-radius: 40px !important;
      font-weight: 600 !important; cursor: pointer !important; transition: all 0.2s ease !important;
      font-size: 0.95rem !important; flex: 1;
    }
    .vw-btn-copy { color: #4ade80 !important; }
    .vw-btn-proceed { color: var(--vw-text) !important; }
    .vw-btn:hover { filter: brightness(1.1) !important; }
    .vw-btn:active { box-shadow: var(--neu-btn-active) !important; transform: translateY(1px) !important; }
    .vw-btn:disabled { opacity: 0.5 !important; cursor: not-allowed !important; box-shadow: var(--neu-in) !important; }
    @keyframes vw-fade-in { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
    @media (max-width: 640px) {
      .vw-status { font-size: 1.4rem !important; }
      .vw-main-content { padding: 1.5rem !important; margin: 1rem !important; max-width: 90vw !important; }
      .vw-header-bar { height: 60px !important; padding: 0 16px !important; }
      .vw-btn { padding: 0.6rem 1rem !important; font-size: 0.8rem !important; }
    }
  `

  const API_UI_CSS = `
    .vw-api-card {
      position: fixed !important; top: 50% !important; left: 50% !important;
      transform: translate(-50%, -50%) !important; width: min(500px, 90vw) !important;
      background: #1e1e1e !important; border-radius: 24px !important; border: none !important;
      box-shadow: 8px 8px 16px #141414, -8px -8px 16px #282828 !important; padding: 24px !important;
      text-align: center !important; z-index: 2147483647 !important; font-family: 'Inter', system-ui, sans-serif !important;
    }
    .vw-api-card .vw-close {
      position: absolute !important; top: 16px !important; right: 16px !important; background: #1e1e1e !important;
      box-shadow: 3px 3px 6px #141414, -3px -3px 6px #282828 !important; border: none !important; color: #aaa !important;
      font-size: 18px !important; cursor: pointer !important; padding: 6px 10px !important; border-radius: 50% !important;
      transition: all 0.2s !important;
    }
    .vw-api-card .vw-close:active { box-shadow: inset 3px 3px 6px #141414, inset -3px -3px 6px #282828 !important; }
    .vw-api-icon { width: 64px !important; height: 64px !important; border-radius: 50% !important; margin-bottom: 16px !important; box-shadow: 4px 4px 8px #141414, -4px -4px 8px #282828 !important; }
    .vw-api-status { font-size: 28px !important; font-weight: 700 !important; margin-bottom: 8px !important; color: #e0e0e0 !important; }
    .vw-api-substatus { font-size: 14px !important; color: #a0a0a0 !important; margin-bottom: 16px !important; }
    .vw-api-url { background: #1e1e1e !important; box-shadow: inset 4px 4px 8px #141414, inset -4px -4px 8px #282828 !important; border-radius: 12px !important; padding: 12px !important; word-break: break-all !important; font-family: monospace !important; font-size: 12px !important; color: #b3b3b3 !important; margin-bottom: 20px !important; max-height: 100px !important; overflow-y: auto !important; }
    .vw-api-buttons { display: flex !important; gap: 12px !important; }
    .vw-api-btn { flex: 1 !important; background: #1e1e1e !important; box-shadow: 4px 4px 8px #141414, -4px -4px 8px #282828 !important; border: none !important; padding: 12px !important; border-radius: 40px !important; color: #e0e0e0 !important; font-weight: 600 !important; cursor: pointer !important; transition: all 0.2s !important; }
    .vw-api-btn-copy { color: #4ade80 !important; }
    .vw-api-btn:active { box-shadow: inset 4px 4px 8px #141414, inset -4px -4px 8px #282828 !important; transform: translateY(1px) !important; }
    .vw-api-topbar-inner { display: inline-flex !important; align-items: center !important; justify-content: center !important; gap: 10px !important; width: 100% !important; height: 100% !important; padding: 0 16px !important; white-space: nowrap !important; }
    .vw-api-loading-ring { width: 20px !important; height: 20px !important; flex: 0 0 auto !important; display: inline-block !important; border-radius: 50% !important; border: 3px solid #141414 !important; border-top: 3px solid #e0e0e0 !important; animation: vw-api-spin 0.8s linear infinite !important; }
    .vw-api-loading-text { color: #e0e0e0 !important; font-weight: 600 !important; line-height: 1 !important; white-space: nowrap !important; }
    @keyframes vw-api-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    @media (max-width: 640px) { .vw-api-card { padding: 20px !important; } .vw-api-status { font-size: 22px !important; } .vw-api-substatus { font-size: 12px !important; } }
  `

  const TOAST_CONTAINER_CSS = `
    #vwToastContainer {
      position: fixed !important; top: calc(72px + 12px) !important; right: calc(14px + env(safe-area-inset-right)) !important;
      padding: 0 !important; display: flex !important; flex-direction: column !important; align-items: flex-end !important;
      gap: 10px !important; z-index: 2147483649 !important; pointer-events: none !important; box-sizing: border-box !important;
      max-width: calc(100vw - 28px) !important;
    }
    .vw-toast {
      padding: 10px 18px !important; border-radius: 40px !important; background: #1e1e1e !important;
      box-shadow: 6px 6px 12px #141414, -6px -6px 12px #282828 !important; color: #e0e0e0 !important;
      font-weight: 700 !important; font-size: 13px !important; animation: vw-toast-in 0.22s ease-out !important;
      pointer-events: none !important; font-family: inherit !important; word-break: break-word !important;
      border-left: 4px solid #16a34a !important; max-width: 100% !important;
    }
    .vw-toast-content { display: flex !important; align-items: center !important; gap: 8px !important; white-space: normal !important; }
    .vw-toast-emoji { display: inline-flex !important; align-items: center !important; justify-content: center !important; width: 24px !important; height: 24px !important; background: transparent !important; font-size: 16px !important; flex: 0 0 auto !important; }
    .vw-toast-text { color: #e0e0e0 !important; font-weight: 700 !important; line-height: 1.25 !important; }
    .vw-toast-progress { height: 3px !important; background: #141414 !important; width: 100% !important; animation: vw-toast-progress 5s linear forwards !important; margin-top: 8px !important; border-radius: 999px !important; box-shadow: inset 1px 1px 2px #0a0a0a; }
    @keyframes vw-toast-progress { from { width: 100%; } to { width: 0%; } }
    @keyframes vw-toast-in { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
    @media (max-width: 768px) { #vwToastContainer { top: calc(60px + 12px) !important; } }
  `

  function showHashExpireUI(finalUrl) {
    const existingOverlay = document.getElementById('vortixWorldOverlay')
    if (existingOverlay) existingOverlay.remove()
    const existingExpire = document.getElementById('vwHashExpireOverlay')
    if (existingExpire) existingExpire.remove()

    document.documentElement.style.setProperty('visibility', 'visible', 'important')
    document.documentElement.style.setProperty('display', 'block', 'important')
    if (document.body) {
      document.body.style.setProperty('visibility', 'visible', 'important')
      document.body.style.setProperty('display', 'block', 'important')
    }

    const overlay = document.createElement('div')
    overlay.id = 'vwHashExpireOverlay'
    overlay.style.cssText = `position:fixed;top:0;left:0;width:100vw;height:100vh;background:#1e1e1e;display:flex;align-items:center;justify-content:center;z-index:2147483647;color:#e0e0e0;font-family:sans-serif;`
    overlay.innerHTML = `<div style="text-align:center;background:#1e1e1e;padding:40px;border-radius:24px;box-shadow:8px 8px 16px #141414, -8px -8px 16px #282828;">
      <img src="${LUARMOR_UI_ICON}" style="width:80px;height:80px;border-radius:50%;margin-bottom:20px;box-shadow:4px 4px 8px #141414, -4px -4px 8px #282828;">
      <h3 style="margin-top:0;font-size:1.4rem;">⚠️ Expiring Hash Detected</h3>
      <p style="color:#a0a0a0;font-size:14px;">Please redirect quickly before the link expires.</p>
      <div id="hz" style="font-size:45px;font-weight:bold;color:#ef4444;margin:20px;text-shadow:2px 2px 4px #141414;">7</div>
      <button id="go" style="padding:14px 35px;border-radius:40px;border:none;background:#1e1e1e;box-shadow:4px 4px 8px #141414, -4px -4px 8px #282828;color:#e0e0e0;font-weight:700;cursor:pointer;transition:all 0.2s;font-size:15px;">🔗 Go to Link Now</button>
    </div>`

    document.documentElement.appendChild(overlay)

    const goBtn = overlay.querySelector('#go')

    let tl = 7
    const iv = setInterval(() => {
      tl--
      const countdownEl = overlay.querySelector('#hz')
      if (countdownEl) countdownEl.textContent = tl
      if (tl <= 0) {
        clearInterval(iv)
        if (goBtn) {
          goBtn.disabled = true
          goBtn.style.boxShadow = 'inset 4px 4px 8px #141414, inset -4px -4px 8px #282828'
          goBtn.textContent = '🔄 Refreshing...'
        }
        window.location.reload()
      }
    }, 1000)

    if (goBtn) {
      goBtn.onmousedown = () => { goBtn.style.boxShadow = 'inset 4px 4px 8px #141414, inset -4px -4px 8px #282828'; }
      goBtn.onmouseup = () => { goBtn.style.boxShadow = '4px 4px 8px #141414, -4px -4px 8px #282828'; }
      goBtn.onclick = () => { window.location.href = finalUrl }
    }
  }

  let autoLuaActive = false, autoLuaNavAttempted = false, autoLuaTimers = [], initialKey = null, initialKeySet = false, lastLuaClickTime = 0
  const LUA_CLICK_COOLDOWN = isIOS ? 10000 : 0

  function clearAutoLuaTimeouts() { autoLuaTimers.forEach(clearTimeout); autoLuaTimers = [] }
  function canLuaClick() { return isIOS ? (Date.now() - lastLuaClickTime) >= LUA_CLICK_COOLDOWN : true }

  function triggerNativeLuarmor(btnId) {
    const script = document.createElement('script')
    script.textContent = `try{const btn=document.getElementById('${btnId}');if(btn){if(typeof k!=='undefined'&&k.event&&typeof k.event.dispatch==='function'){const mockEvent={target:btn,type:'click',preventDefault:()=>{},stopPropagation:()=>{}};k.event.dispatch.call(btn,mockEvent)}else btn.click();}}catch(e){}`
    ;(document.head || document.documentElement).appendChild(script)
    script.remove()
  }

  function checkProgress() {
    if (!autoLuaActive) return
    const prog = document.getElementById('adprogressp')
    if (prog) {
      const match = prog.textContent.match(/(\d+)\/(\d+)/)
      if (match && match[1] === match[2]) {
        const key = document.querySelector('h6.mb-0.text-sm')?.textContent.trim()
        const btn = document.getElementById(`addtimebtn_${key}`) || document.getElementById('newkeybtn')
        if (btn && !btn.disabled && canLuaClick()) {
          lastLuaClickTime = Date.now()
          triggerNativeLuarmor(btn.id)
          if (btn.id === 'newkeybtn') stopAutoLuarmor()
        }
      }
    }
    autoLuaTimers.push(setTimeout(checkProgress, isIOS ? 1000 : 500))
  }

  function attemptNext() {
    if (!autoLuaActive || autoLuaNavAttempted) return
    const btn = document.getElementById('nextbtn')
    if (btn && btn.offsetParent !== null && !btn.disabled && btn.style.cursor !== 'not-allowed') {
      if (canLuaClick()) {
        lastLuaClickTime = Date.now()
        triggerNativeLuarmor('nextbtn')
        if (!isIOS) { stopAutoLuarmor(); return }
        autoLuaNavAttempted = true
        autoLuaTimers.push(setTimeout(() => { if (autoLuaActive) autoLuaNavAttempted = false; attemptNext() }, 3000))
      } else { autoLuaTimers.push(setTimeout(attemptNext, 1000)) }
    } else { autoLuaTimers.push(setTimeout(attemptNext, 600)) }
  }

  function monitorKey() {
    if (!autoLuaActive) return
    const keyElement = document.querySelector('h6.mb-0.text-sm')
    if (keyElement) {
      const text = keyElement.textContent.trim()
      if (!initialKeySet) { initialKey = text; initialKeySet = true }
      else if (text !== initialKey && text.length > 0) stopAutoLuarmor()
    } else { if (!initialKeySet) { initialKey = ''; initialKeySet = true } }
    if (isIOS) autoLuaTimers.push(setTimeout(monitorKey, 1000))
  }

  function startAutoLuarmor() {
    if (autoLuaActive) return
    autoLuaActive = true
    localStorage.setItem('vw_auto_luarmor_active', 'true')
    autoLuaNavAttempted = false; initialKeySet = false
    const ui = document.getElementById('autoLuaUI')
    if (ui) {
      const btn = ui.querySelector('#startStopBtn'), span = ui.querySelector('#autoStatus')
      if (btn) btn.textContent = 'Stop', btn.style.color = '#ef4444'
      if (span) span.style.color = '#4ade80', span.textContent = '● Running'
    }
    checkProgress()
    if (isIOS) { attemptNext(); monitorKey() }
    else { autoLuaTimers.push(setTimeout(() => { if (autoLuaActive) attemptNext() }, 2000)) }
  }

  function stopAutoLuarmor() {
    if (!autoLuaActive) return
    autoLuaActive = false
    localStorage.setItem('vw_auto_luarmor_active', 'false')
    clearAutoLuaTimeouts()
    const ui = document.getElementById('autoLuaUI')
    if (ui) {
      const btn = ui.querySelector('#startStopBtn'), span = ui.querySelector('#autoStatus')
      if (btn) btn.textContent = 'Start', btn.style.color = '#e0e0e0'
      if (span) span.style.color = '#a0a0a0', span.textContent = '● Idle'
    }
  }

  function initAutoLuarmorUI() {
    if (document.getElementById('autoLuaUI')) return
    const ui = document.createElement("div")
    ui.id = "autoLuaUI"
    ui.style.cssText = `position:fixed;top:15px;left:50%;transform:translateX(-50%);width:max-content;min-width:280px;background:#1e1e1e;color:#e0e0e0;font-family:Poppins,Arial,sans-serif;z-index:2147483647;font-size:14px;box-shadow:6px 6px 12px #141414, -6px -6px 12px #282828;border-radius:50px;`
    ui.innerHTML = `
      <style>
        #autoLuaUI .top-bar { display:flex; justify-content:space-between; align-items:center; padding:10px 18px; width:100%; }
        #autoLuaUI .title { font-size:15px; font-weight:700; color:#e0e0e0; margin-right:15px; text-shadow: 1px 1px 2px #141414; }
        #autoLuaUI .control-btn { background:#1e1e1e; box-shadow:3px 3px 6px #141414, -3px -3px 6px #282828; color:#e0e0e0; border:none; padding:8px 20px; border-radius:40px; font-size:13px; font-weight:600; cursor:pointer; transition:all 0.2s; }
        #autoLuaUI .control-btn:active { box-shadow:inset 3px 3px 6px #141414, inset -3px -3px 6px #282828; }
      </style>
      <div class="top-bar">
        <div class="title">⚡ Auto Lua</div>
        <div style="display:flex; align-items:center;">
          <span id="autoStatus" style="font-size:12px; margin-right:12px; color:#a0a0a0; font-weight:600;">● Idle</span>
          <button id="startStopBtn" class="control-btn">Start</button>
        </div>
      </div>`
    
    const appendUiSafely = () => {
      document.body.appendChild(ui)
      const startStopBtn = ui.querySelector("#startStopBtn")
      if (localStorage.getItem('vw_auto_luarmor_active') === 'true') startAutoLuarmor()
      else stopAutoLuarmor()
      startStopBtn.onclick = () => { if (autoLuaActive) stopAutoLuarmor(); else startAutoLuarmor() }
    }
    if (document.body) appendUiSafely()
    else document.addEventListener('DOMContentLoaded', appendUiSafely)
  }

  function runAutoLuarmor() {
    localStorage.setItem('ppaccepted', 'true')
    localStorage.setItem('trufflemayo', '1455660788512591984;87f07b547f1faf3d115b1592ddf41b25')
    initAutoLuarmorUI()
  }

  function decodeURIxor(encodedString, prefixLength = 5) {
    const base64Decoded = atob(encodedString)
    const prefix = base64Decoded.substring(0, prefixLength)
    const encodedPortion = base64Decoded.substring(prefixLength)
    const prefixLen = prefix.length
    const decodedChars = new Array(encodedPortion.length)
    for (let i = 0; i < encodedPortion.length; i++) {
      const encodedChar = encodedPortion.charCodeAt(i)
      const prefixChar = prefix.charCodeAt(i % prefixLen)
      decodedChars[i] = String.fromCharCode(encodedChar ^ prefixChar)
    }
    return decodedChars.join('')
  }

  let uiInjected = false, bypassStart = performance.now(), countdownTimerId = null, currentRemainingSeconds = 60

  function injectUI(iconUrl = LOOTLINK_UI_ICON) {
    if (uiInjected && document.getElementById('vortixWorldOverlay')) return
    const existing = document.getElementById('vortixWorldOverlay')
    if (existing) existing.remove()

    const styleId = 'vortixWorldStyles'
    if (!document.getElementById(styleId)) {
      const styleSheet = document.createElement('style')
      styleSheet.id = styleId
      styleSheet.innerText = SHARED_UI_CSS
      ;(document.head || document.documentElement).appendChild(styleSheet)
    }

    const wrapper = document.createElement('div')
    wrapper.innerHTML = `
      <div id="vortixWorldOverlay">
        <div class="vw-header-bar">
          <div class="vw-title">
            <img src="${ICON_URL}" class="vw-header-icon" alt="Icon">
            VortixWorld
          </div>
        </div>
        <div class="vw-main-content">
          <img src="${iconUrl}" class="vw-icon-img" alt="VortixWorld" onerror="this.onerror=null;this.src='${ICON_URL}'">
          <div class="vw-spinner" id="vwSpinner"></div>
          <div id="vwStatus" class="vw-status">Initializing...</div>
          <div id="vwSubStatus" class="vw-substatus">Waiting for page to load</div>
        </div>
      </div>
    `
    const overlay = wrapper.firstElementChild

    let container = document.body
    if (!container) {
      container = document.createElement('body')
      document.documentElement.appendChild(container)
      document.documentElement.style.overflow = 'hidden'
    }
    container.appendChild(overlay)
    if (document.body) document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'
    uiInjected = true
  }

  function showCompleteUI(finalUrl, timeLabel) {
    const overlay = document.getElementById('vortixWorldOverlay')
    if (!overlay) return
    const mainContent = overlay.querySelector('.vw-main-content')
    if (!mainContent) return
    const iconImg = mainContent.querySelector('.vw-icon-img')
    if (iconImg) iconImg.style.display = 'none'
    const spinner = mainContent.querySelector('#vwSpinner')
    if (spinner) spinner.style.display = 'none'
    mainContent.innerHTML = `
      <img src="${iconImg ? iconImg.src : LOOTLINK_UI_ICON}" class="vw-icon-img" style="display:block" onerror="this.onerror=null;this.src='${ICON_URL}'">
      <div id="vwStatus" class="vw-status">✔️ Bypass Complete!</div>
      <div id="vwSubStatus" class="vw-substatus">Completed in ${timeLabel}s</div>
      <div class="vw-url-container" id="vwUrlContainer">${escapeHtml(finalUrl)}</div>
      <div class="vw-button-group">
        <button id="vwCopyBtn" class="vw-btn vw-btn-copy">📋 Copy URL</button>
        <button id="vwProceedBtn" class="vw-btn vw-btn-proceed">➡️ Proceed</button>
      </div>
    `
    const copyBtn = document.getElementById('vwCopyBtn')
    const proceedBtn = document.getElementById('vwProceedBtn')
    if (copyBtn) copyBtn.addEventListener('click', () => copyTextSilent(finalUrl).then(() => showToast('URL copied to clipboard', false, '📋')))
    if (proceedBtn) proceedBtn.addEventListener('click', () => location.href = finalUrl)
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>]/g, function(m) {
      if (m === '&') return '&amp;'
      if (m === '<') return '&lt;'
      if (m === '>') return '&gt;'
      return m
    }).replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, function(c) { return c })
  }

  function updateStatus(main, sub) {
    if (!document.getElementById('vortixWorldOverlay')) injectUI()
    const m = document.getElementById('vwStatus')
    const s = document.getElementById('vwSubStatus')
    if (m) m.innerText = main
    if (s) s.innerText = sub
    const spinner = document.getElementById('vwSpinner')
    if (spinner) {
      if (main.includes('Complete') || main.includes('Redirecting')) spinner.style.display = 'none'
      else spinner.style.display = 'block'
    }
  }

  function updateCountdown(remaining) {
    if (remaining !== undefined) currentRemainingSeconds = remaining
    const sub = document.getElementById('vwSubStatus')
    if (sub) sub.innerText = `Time Remaining ${currentRemainingSeconds} seconds...`
  }

  function startCountdown(initialSeconds) {
    if (countdownTimerId) {
      clearInterval(countdownTimerId)
      cleanupManager.intervals.delete(countdownTimerId)
    }
    currentRemainingSeconds = initialSeconds
    updateCountdown()
    countdownTimerId = cleanupManager.setInterval(() => {
      currentRemainingSeconds = Math.max(0, currentRemainingSeconds - 1)
      updateCountdown()
      if (currentRemainingSeconds <= 0) {
        clearInterval(countdownTimerId)
        cleanupManager.intervals.delete(countdownTimerId)
        countdownTimerId = null
      }
    }, 1000)
  }

  function ensureToastContainer() {
    let container = document.getElementById('vwToastContainer')
    if (!container) {
      container = document.createElement('div')
      container.id = 'vwToastContainer'
      const styleId = 'vwToastStyles'
      if (!document.getElementById(styleId)) {
        const style = document.createElement('style')
        style.id = styleId
        style.textContent = TOAST_CONTAINER_CSS
        ;(document.head || document.documentElement).appendChild(style)
      }
      ;(document.body || document.documentElement).appendChild(container)
    }
    return container
  }

  function showToast(message, isError = false, emoji = null) {
    if (window.top !== window.self) return
    const container = ensureToastContainer()
    const toast = document.createElement('div')
    toast.className = 'vw-toast'
    if (isError) toast.style.borderLeftColor = '#b91c1c'
    const emojiChar = emoji || (isError ? '⚠️' : '✓')
    toast.innerHTML = `<div class="vw-toast-content"><span class="vw-toast-emoji">${emojiChar}</span><span class="vw-toast-text">${message}</span></div><div class="vw-toast-progress"></div>`
    container.appendChild(toast)
    const progressBar = toast.querySelector('.vw-toast-progress')
    progressBar.style.animation = 'vw-toast-progress 5s linear forwards'
    const removeToast = () => { if (toast && toast.remove) toast.remove() }
    const timeoutId = setTimeout(removeToast, 5000)
    progressBar.addEventListener('animationend', () => { clearTimeout(timeoutId); removeToast() })
  }

  function isAutoRedirectEnabled() {
    const saved = getStoredValue(VW_KEYS.autoRedirect, true)
    return saved === true
  }

  function handleBypassSuccess(url, timeSecondsStr, bypassType = '', forceCompleteUI = false) {
    const timeLabel = timeSecondsStr || ((performance.now() - bypassStart) / 1000).toFixed(2)
    if (isLuarmorUrl(url)) {
      const overlay = document.getElementById('vortixWorldOverlay')
      if (overlay) overlay.remove()
      showHashExpireUI(url)
      shutdown()
      return
    }
    const auto = isAutoRedirectEnabled()
    if (forceCompleteUI) {
      injectUI()
      showCompleteUI(url, timeLabel)
      if (auto) setTimeout(() => location.href = url, 3000)
      shutdown()
      return
    }
    if (auto) {
      updateStatus('Redirecting...', `Target URL acquired (${timeLabel}s)`)
      if (bypassType === 'tpili') showToast(`Bypassed in ${timeLabel}s`, false, '✅')
      else if (bypassType === 'lootlink') showToast('Bypass successful', false, '✅')
      else showToast(`Bypassed in ${timeLabel}s`, false, '✅')
      setTimeout(() => location.href = url, 1000)
    } else {
      injectUI()
      showCompleteUI(url, timeLabel)
    }
    shutdown()
  }

  class RobustWebSocket {
    constructor(url, options = {}) {
      this.url = url
      this.reconnectDelay = options.initialDelay || CONFIG.INITIAL_RECONNECT_DELAY
      this.maxDelay = options.maxDelay || CONFIG.MAX_RECONNECT_DELAY
      this.heartbeatInterval = options.heartbeat || CONFIG.HEARTBEAT_INTERVAL
      this.maxRetries = options.maxRetries || 5
      this.ws = null
      this.reconnectTimeout = null
      this.heartbeatTimer = null
      this.retryCount = 0
      this.resolved = false
    }

    connect() {
      if (isShutdown) return
      try {
        Logger.websocket('Connecting WebSocket', this.url)
        this.ws = new WebSocket(this.url)
        this.ws.onopen = () => this.onOpen()
        this.ws.onmessage = e => this.onMessage(e)
        this.ws.onclose = () => this.handleReconnect()
        this.ws.onerror = e => this.onError(e)
      } catch (e) { Logger.error('Unhandled exception', e); this.handleReconnect() }
    }

    onOpen() {
      if (isShutdown) return
      Logger.websocket('WebSocket opened', this.url)
      this.retryCount = 0
      this.reconnectDelay = CONFIG.INITIAL_RECONNECT_DELAY
      if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout)
      this.sendHeartbeat()
      this.heartbeatTimer = cleanupManager.setInterval(() => { if (this.ws?.readyState === WebSocket.OPEN) this.sendHeartbeat() }, this.heartbeatInterval)
    }

    sendHeartbeat() { if (this.ws?.readyState === WebSocket.OPEN) this.ws.send('0') }

    handleReconnect() {
      if (isShutdown) return
      if (this.heartbeatTimer) clearInterval(this.heartbeatTimer)
      if (this.retryCount >= this.maxRetries) { Logger.error('WebSocket fatal', 'Max retries'); return }
      this.retryCount++
      const delay = Math.min(this.reconnectDelay * Math.pow(2, this.retryCount - 1), this.maxDelay)
      Logger.warn('WebSocket reconnect', `Retry ${this.retryCount} in ${delay}ms`)
      this.reconnectTimeout = cleanupManager.setTimeout(() => this.connect(), delay)
    }

    onMessage(event) {
      if (isShutdown) return
      if (event.data?.includes('r:')) {
        let publisherLink = event.data.replace('r:', '').trim()
        if (publisherLink) {
          let finalUrl = publisherLink
          const isBase64 = /^[A-Za-z0-9+/=]+$/.test(publisherLink)
          if (isBase64) {
            try { finalUrl = decodeURIComponent(decodeURIxor(publisherLink)); Logger.info('Decoded URL', finalUrl) }
            catch (e) { Logger.error('Base64 decode failed', e); finalUrl = publisherLink }
          }
          if (finalUrl && (finalUrl.startsWith('http://') || finalUrl.startsWith('https://'))) {
            this.disconnect()
            const duration = ((Date.now() - state.processStartTime) / 1000).toFixed(2)
            if (!isLuarmorUrl(finalUrl)) saveResultToCache(location.href, finalUrl)
            this.resolved = true
            handleBypassSuccess(finalUrl, duration, 'lootlink')
          }
        }
      }
    }

    onError(error) { Logger.error('WebSocket error', error) }

    disconnect() {
      if (this.heartbeatTimer) clearInterval(this.heartbeatTimer)
      if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout)
      if (this.ws) this.ws.close()
    }
  }

  let BL_TASKS = Array.from({ length: 53 }, (_, i) => i + 1).filter(n => n !== 17)
  if (!isMobile) BL_TASKS = [1, 2, 3]

  async function completeTaskViaSkippedLol(taskUrl) {
    const endpoint = 'https://skipped.lol/api/evade/ll'
    let urlToSend = taskUrl
    if (urlToSend?.startsWith('//')) urlToSend = 'https:' + urlToSend
    const payload = { ID: 17, URL: urlToSend }
    try {
      Logger.info('Sending to skipped.lol', JSON.stringify(payload))
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 8000)
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), signal: controller.signal })
      clearTimeout(timeoutId)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const raw = await res.text()
      Logger.info('Skipped.lol response', raw)
      const parsed = JSON.parse(raw)
      return parsed?.status === 'ok'
    } catch (err) { Logger.error('skipped.lol failed', err); throw err }
  }

  function startWebSocketForTask(taskData, isFallback = false) {
    if (!taskData?.urid) { Logger.error('Missing task data'); return null }
    const { urid, task_id } = taskData
    const wsUrl = `wss://${urid.substr(-5) % 3}.${INCENTIVE_SERVER_DOMAIN}/c?uid=${urid}&cat=${task_id}&key=${KEY}`
    const ws = new RobustWebSocket(wsUrl, { initialDelay: CONFIG.INITIAL_RECONNECT_DELAY, maxDelay: CONFIG.MAX_RECONNECT_DELAY, heartbeat: CONFIG.HEARTBEAT_INTERVAL, maxRetries: 3 })
    if (isFallback) window.fallbackWebSocket = ws
    else window.primaryWebSocket = ws
    window.activeWebSocket = ws
    ws.connect()
    try { navigator.sendBeacon(`https://${urid.substr(-5) % 3}.${INCENTIVE_SERVER_DOMAIN}/st?uid=${urid}&cat=${task_id}`) } catch (_) {}
    fetch(`https://${INCENTIVE_SYNCER_DOMAIN}/td?ac=1&urid=${urid}&cat=${task_id}&tid=${TID}`, { credentials: 'include' }).catch(() => {})
    return ws
  }

  function selectFallbackTask(tasks) {
    if (!Array.isArray(tasks) || !tasks.length) return null
    return tasks.find(t => t.auto_complete_seconds === 30) ||
           tasks.find(t => t.auto_complete_seconds === 40) ||
           tasks.find(t => t.auto_complete_seconds === 50) ||
           tasks.find(t => t.auto_complete_seconds === 60) ||
           tasks[0]
  }

  function processTcResponse(data, originalFetch) {
    Logger.info('Processing /tc', JSON.stringify(data, null, 2))
    const task17 = Array.isArray(data) ? data.find(i => i.task_id === 17) : null
    const runFallback = () => {
      Logger.warn('Fallback task selection')
      updateStatus('Method 1 Failed/Timeout', 'Using Method 2')
      const fallback = selectFallbackTask(data)
      if (fallback?.urid) {
        if (fallback.auto_complete_seconds) startCountdown(fallback.auto_complete_seconds)
        startWebSocketForTask(fallback, true)
      } else { Logger.error('No fallback task'); updateStatus('❌ Bypass failed', 'No suitable task') }
    }
    if (task17?.ad_url) {
      completeTaskViaSkippedLol(task17.ad_url).then(() => {
        const primaryWs = startWebSocketForTask(task17, false)
        const timeoutId = setTimeout(() => { if (primaryWs && !primaryWs.resolved) { primaryWs.disconnect(); runFallback() } }, 12000)
        cleanupManager.timeouts.add(timeoutId)
      }).catch(err => { Logger.error('skipped.lol fallback', err); runFallback() })
    } else { runFallback() }
  }

  function initLootlinkFetchOverride() {
    const originalFetch = window.fetch
    window.fetch = function(url, config) {
      try {
        const urlStr = typeof url === 'string' ? url : url?.url || ''
        if (typeof INCENTIVE_SYNCER_DOMAIN !== 'undefined' && urlStr.includes(`${INCENTIVE_SYNCER_DOMAIN}/tc`)) {
          if (window.__vw_tc_processed) return originalFetch(url, config)
          let newBody = null
          const originalBody = config?.body
          if (originalBody && typeof originalBody === 'string') {
            try { const parsed = JSON.parse(originalBody); if (!parsed.bl) { parsed.bl = BL_TASKS; newBody = JSON.stringify(parsed) } } catch(e) {}
          } else if (originalBody && typeof originalBody === 'object') {
            if (!originalBody.bl) newBody = JSON.stringify({ ...originalBody, bl: BL_TASKS })
          } else { newBody = JSON.stringify({ bl: BL_TASKS }) }
          if (newBody) {
            const newConfig = { ...config, headers: { ...config.headers, 'Content-Type': 'application/json' }, body: newBody }
            return originalFetch(url, newConfig).then(res => res.clone().json().then(data => { processTcResponse(data, originalFetch); window.__vw_tc_processed = true; return new Response(JSON.stringify(data), res) }).catch(() => res))
          }
        }
      } catch (_) {}
      return originalFetch(url, config)
    }
  }

  async function sendTcManually() {
    if (window.__vw_tc_processed) return
    const syncDomain = INCENTIVE_SYNCER_DOMAIN
    if (!syncDomain) return
    const tcUrl = `https://${syncDomain}/tc`
    const payload = { bl: BL_TASKS }
    Logger.info('Manual POST /tc')
    try {
      const res = await fetch(tcUrl, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json', 'User-Agent': ANDROID_UA }, body: JSON.stringify(payload) })
      const data = await res.json()
      processTcResponse(data, window.fetch)
      window.__vw_tc_processed = true
      showToast('Lootlink bypass successful', false, '✅')
    } catch (err) { if (!window.__vw_tc_processed) Logger.warn('Manual /tc failed', err.message) }
  }

  function startManualCheck() {
    const interval = setInterval(() => {
      if (window.__vw_tc_processed) { clearInterval(interval); return }
      if (typeof INCENTIVE_SYNCER_DOMAIN !== 'undefined' && typeof INCENTIVE_SERVER_DOMAIN !== 'undefined' && typeof KEY !== 'undefined') {
        clearInterval(interval); sendTcManually()
      }
    }, 100)
    cleanupManager.setTimeout(() => { if (!window.__vw_tc_processed) sendTcManually() }, 8000)
  }

  function modifyParentElement(targetElement) {
    const parent = targetElement.parentElement
    if (!parent) return
    state.processStartTime = Date.now()
    bypassStart = performance.now()
    parent.innerHTML = ''
    parent.style.cssText = 'height:0!important;overflow:hidden!important;visibility:hidden!important'
    injectUI()
    updateStatus('Loading...', 'Waiting for task data')
  }

  function setupOptimizedObserver() {
    const target = document.body || document.documentElement
    const observer = new MutationObserver((mutations, obs) => {
      if (isShutdown) { obs.disconnect(); return }
      const unlockText = ['UNLOCK CONTENT', 'Unlock Content', 'Complete Task', 'Get Reward', 'Claim Reward']
      for (const m of mutations) {
        if (m.type !== 'childList') continue
        const added = Array.from(m.addedNodes).filter(n => n.nodeType === 1)
        const found = added.flatMap(el => [el, ...Array.from(el.querySelectorAll('*'))]).find(el => unlockText.some(t => el.textContent?.includes(t)))
        if (found) { modifyParentElement(found); obs.disconnect(); return }
      }
    })
    window.bypassObserver = observer
    observer.observe(target, { childList: true, subtree: true })
    const existing = Array.from(document.querySelectorAll('*')).find(el => ['UNLOCK CONTENT','Unlock Content','Complete Task','Get Reward','Claim Reward'].some(t => el.textContent?.includes(t)))
    if (existing) { modifyParentElement(existing); observer.disconnect() }
  }

  function runLocalLootlinkBypass() {
    Logger.info('Lootlink bypass started')
    const cached = getCachedResult(location.href)
    if (cached) {
      if (!isLuarmorUrl(cached)) { handleBypassSuccess(cached, '0.00 (cached)', 'lootlink', true); return }
      else { showHashExpireUI(cached); return }
    }
    injectUI()
    updateStatus('Loading...', 'Preparing bypass')
    setupOptimizedObserver()
    initLootlinkFetchOverride()
    startManualCheck()
    cleanupManager.setTimeout(() => {
      if (!window.__vw_tc_processed) {
        const unlockText = ['UNLOCK CONTENT','Unlock Content','Complete Task','Get Reward','Claim Reward']
        const el = Array.from(document.querySelectorAll('*')).find(e => unlockText.some(t => e.textContent?.includes(t)))
        if (el) modifyParentElement(el)
        else updateStatus('Bypass delayed', 'Retrying...')
      }
    }, CONFIG.FALLBACK_CHECK_DELAY)
    window.addEventListener('beforeunload', () => cleanupManager.clearAll())
  }

  const RESULT_CACHE_KEY = 'vw_lootlink_results'
  function saveResultToCache(originalUrl, resultUrl) {
    try { let cache = JSON.parse(localStorage.getItem(RESULT_CACHE_KEY) || '{}'); cache[originalUrl] = resultUrl; localStorage.setItem(RESULT_CACHE_KEY, JSON.stringify(cache)) } catch(e) {}
  }
  function getCachedResult(originalUrl) {
    try { const cache = JSON.parse(localStorage.getItem(RESULT_CACHE_KEY) || '{}'); return cache[originalUrl] || null } catch(e) { return null }
  }

  async function runLocalTpiLiBypass() {
    const startTime = Date.now()
    injectUI(ICON_URL)
    updateStatus('Fetching tpi.li link...', 'Extracting token')
    try {
      const alias = location.pathname.slice(1)
      if (!alias) throw new Error('No alias')
      const html = await (await fetch(location.href, { headers: { 'User-Agent': ANDROID_UA } })).text()
      let tokenMatch = html.match(/name="token"\s+value="([^"]+)"/) || html.match(/value="([^"]+)"\s+name="token"/)
      if (!tokenMatch) throw new Error('Token not found')
      const token = tokenMatch[1]
      const offset = 40 + 4 + alias.length + 4
      if (token.length < offset) throw new Error('Token too short')
      const finalUrl = atob(token.slice(offset))
      if (!finalUrl?.startsWith('http')) throw new Error('Invalid URL')
      const duration = ((Date.now() - startTime) / 1000).toFixed(2)
      handleBypassSuccess(finalUrl, duration, 'tpili')
    } catch (err) {
      Logger.error('tpi.li failed', err.message)
      updateStatus('❌ Bypass failed', err.message)
      showToast(`Bypass failed: ${err.message}`, true, '⚠️')
    }
  }

  async function initApi() {
    const res = await fetch(API_BASE + '/api/auth/anon', { method: 'POST', headers: { 'Content-Type': 'application/json' } })
    return (await res.json()).accessToken
  }
  async function bypassUrl(url, token) {
    const res = await fetch(API_BASE + '/api/bypass/direct', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token }, body: JSON.stringify({ url }) })
    return res.json()
  }
  function appendToBestContainer(node) { (document.body || document.documentElement).appendChild(node) }
  function createApiTopBar() {
    if (document.getElementById('vwApiTopBar')) return
    const style = document.createElement('style'); style.id = 'vwApiStyles'; style.textContent = API_UI_CSS; document.head.appendChild(style)
    const bar = document.createElement('div'); bar.id = 'vwApiTopBar'; bar.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);width:300px;max-width:80vw;height:48px;background:#1e1e1e;border-radius:40px;box-shadow:6px 6px 12px #141414,-6px -6px 12px #282828;z-index:2147483647;display:flex;align-items:center;justify-content:center;font-family:Inter,system-ui;font-size:14px;color:#e0e0e0;font-weight:500'
    bar.innerHTML = `<div class="vw-api-topbar-inner"><span class="vw-api-loading-ring"></span><span class="vw-api-loading-text">Bypassing...</span></div>`
    appendToBestContainer(bar)
    return bar
  }
  function removeApiTopBar() { document.getElementById('vwApiTopBar')?.remove() }
  function showApiResultUI(finalUrl, timeLabel, isError = false, errorMsg = '') {
    removeApiTopBar()
    const style = document.createElement('style'); style.id = 'vwApiStyles'; style.textContent = API_UI_CSS; document.head.appendChild(style)
    const existing = document.getElementById('vwApiCard'); if (existing) existing.remove()
    const card = document.createElement('div'); card.id = 'vwApiCard'; card.className = 'vw-api-card'
    card.innerHTML = `<button class="vw-close">✕</button><img src="${ICON_URL}" class="vw-api-icon"><div class="vw-api-status">${isError ? '❌ Bypass Failed' : '✔️ Bypass Complete!'}</div><div class="vw-api-substatus">${isError ? errorMsg : `Completed in ${timeLabel}s`}</div>${!isError ? `<div class="vw-api-url">${escapeHtml(finalUrl)}</div>` : ''}<div class="vw-api-buttons"></div>`
    const closeBtn = card.querySelector('.vw-close'); closeBtn.onclick = () => card.remove()
    const btnsDiv = card.querySelector('.vw-api-buttons')
    if (!isError) {
      const copyBtn = document.createElement('button'); copyBtn.className = 'vw-api-btn vw-api-btn-copy'; copyBtn.textContent = '📋 Copy URL'; copyBtn.onclick = () => copyTextSilent(finalUrl).then(() => showToast('URL copied', false, '📋'))
      const proceedBtn = document.createElement('button'); proceedBtn.className = 'vw-api-btn vw-api-btn-proceed'; proceedBtn.textContent = '➡️ Proceed'; proceedBtn.onclick = () => location.href = finalUrl
      btnsDiv.append(copyBtn, proceedBtn)
    } else {
      const okBtn = document.createElement('button'); okBtn.className = 'vw-api-btn'; okBtn.textContent = 'OK'; okBtn.onclick = () => card.remove()
      btnsDiv.appendChild(okBtn)
    }
    appendToBestContainer(card)
  }
  async function runApiBypass() {
    try {
      createApiTopBar()
      const token = await initApi()
      const result = await bypassUrl(location.href, token)
      if (result.status === 'success') {
        const finalUrl = result.result
        if (isLuarmorUrl(finalUrl)) { removeApiTopBar(); showHashExpireUI(finalUrl); shutdown() }
        else { showApiResultUI(finalUrl, result.time, false); shutdown() }
      } else throw new Error(result.result || 'Bypass failed')
    } catch (err) { Logger.error('API bypass failed', err.message); removeApiTopBar(); showApiResultUI('', '', true, err.message) }
  }

  const state = { processStartTime: Date.now() }

  function main() {
    if (HOST.includes('luarmor.net')) { runAutoLuarmor(); return }
    if (isTpiLi()) runLocalTpiLiBypass()
    else if (isLootHost()) runLocalLootlinkBypass()
    else if (isAllowedHost()) runApiBypass()
    showToast('Userscript Loaded', false, '🚀')
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', main)
  else main()
})()