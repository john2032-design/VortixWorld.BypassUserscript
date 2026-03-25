// ==UserScript==
// @name         VortixWorld Bypass
// @namespace    afklolbypasser
// @version      2.0
// @description  Bypass 💩 Fr
// @author       afk.l0l
// @match        *://*/*
// @icon         https://i.ibb.co/p6Qjk6gP/BFB1896-C-9-FA4-4429-881-A-38074322-DFCB.png
// @require      https://vortixworlduserscript.vercel.app/raw/vw-settings.js
// @grant        none
// @license      MIT
// @run-at       document-start
// ==/UserScript==

;(function () {
  'use strict'

  const HOST = (location.hostname || '').toLowerCase().replace(/^www\./, '')
  const ICON_URL = 'https://i.ibb.co/p6Qjk6gP/BFB1896-C-9-FA4-4429-881-A-38074322-DFCB.png'
  const LOOTLINK_UI_ICON = 'https://i.ibb.co/s0yg2cv/AA1-D3-E03-2205-4572-ACFB-29-B8-B9-DDE381.png'
  const LUARMOR_UI_ICON = 'https://i.ibb.co/BDQS9rS/F20-A6183-C85-E-447-C-A27-C-11-B9-E8971-B45.png'
  const SITE_HOST = 'vortix-world-bypass.vercel.app'
  const TPI_HOST = 'tpi.li'
  const ANDROID_UA = 'Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36'

  const LOOT_HOSTS = [
    'loot-link.com',
    'loot-links.com',
    'lootlink.org',
    'lootlinks.co',
    'lootdest.info',
    'lootdest.org',
    'lootdest.com',
    'links-loot.com',
    'linksloot.net',
    'lootlinks.com',
    'best-links.org',
    'loot-labs.com',
    'lootlabs.com'
  ]

  const ALLOWED_SHORT_HOSTS = [
    'linkvertise.com',
    'admaven.com',
    'work.ink',
    'shortearn.eu',
    'beta.shortearn.eu',
    'cuty.io',
    'ouo.io',
    'lockr.so',
    'rekonise.com',
    'mboost.me',
    'link-unlocker.com',
    'mega.nz',
    'mega.co.nz',
    'direct-link.net',
    'direct-links.net',
    'direct-links.org',
    'link-center.net',
    'link-hub.net',
    'link-pays.in',
    'link-target.net',
    'link-target.org',
    'link-to.net',
    'workink.net'
  ]

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
    CACHED_METHOD_TIMEOUT: 15000,
    BYPASS_START_DELAY: 1000,
    GLOBALS_WAIT_TIMEOUT: 10000,
    NORMAL_FLOW_FALLBACK_TIMEOUT: 15000
  })

  const VW_KEYS = window.VW_CONFIG?.keys || {
    autoRedirect: 'vw_auto_redirect',
    redirectWaitTime: 'vw_redirect_wait_time',
    luarmorWaitTime: 'vw_luarmor_wait_time'
  }

  let RedirectWaitTime = (() => {
    if (typeof window.VW_CONFIG?.redirectWaitTime === 'number') return window.VW_CONFIG.redirectWaitTime
    const saved = localStorage.getItem(VW_KEYS.redirectWaitTime)
    const parsed = saved ? parseInt(saved, 10) : NaN
    return !isNaN(parsed) ? parsed : 5
  })()

  let LuarmorWaitTime = (() => {
    if (typeof window.VW_CONFIG?.luarmorWaitTime === 'number') return window.VW_CONFIG.luarmorWaitTime
    const saved = localStorage.getItem(VW_KEYS.luarmorWaitTime)
    const parsed = saved ? parseInt(saved, 10) : NaN
    return !isNaN(parsed) ? parsed : 20
  })()

  window.__vw_logs = window.__vw_logs || []
  const LOG_STYLE = {
    base: 'font-weight:800; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;',
    info: 'color:#22c55e;',
    warn: 'color:#f59e0b;',
    error: 'color:#ef4444;',
    heartbeat: 'color:#a855f7;',
    dim: 'color:#94a3b8;'
  }

  const Logger = {
    _push(level, msg, data) {
      const entry = {
        timestamp: new Date().toISOString(),
        level,
        message: msg,
        data: data !== undefined ? String(data) : ''
      }
      window.__vw_logs.push(entry)
      if (window.__vw_logs.length > 500) window.__vw_logs.shift()
    },
    info: (m, d = '') => {
      console.info(
        `%c[INFO]%c [VortixBypass] ${m}`,
        LOG_STYLE.base + LOG_STYLE.info,
        LOG_STYLE.base + LOG_STYLE.dim,
        d || ''
      )
      Logger._push('info', m, d)
    },
    warn: (m, d = '') => {
      console.warn(
        `%c[WARN]%c [VortixBypass] ${m}`,
        LOG_STYLE.base + LOG_STYLE.warn,
        LOG_STYLE.base + LOG_STYLE.dim,
        d || ''
      )
      Logger._push('warn', m, d)
    },
    error: (m, d = '') => {
      console.error(
        `%c[ERROR]%c [VortixBypass] ${m}`,
        LOG_STYLE.base + LOG_STYLE.error,
        LOG_STYLE.base + LOG_STYLE.dim,
        d || ''
      )
      Logger._push('error', m, d)
    },
    heartbeat: (m, d = '') => {
      console.info(
        `%c[HEARTBEAT]%c [VortixBypass] ${m}`,
        LOG_STYLE.base + LOG_STYLE.heartbeat,
        LOG_STYLE.base + LOG_STYLE.dim,
        d || ''
      )
      Logger._push('heartbeat', m, d)
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
    if (window.bypassObserver) {
      window.bypassObserver.disconnect()
      window.bypassObserver = null
    }
    if (window.activeWebSocket) {
      window.activeWebSocket.disconnect()
      window.activeWebSocket = null
    }
  }

  async function copyTextSilent(text) {
    try {
      if (!text) return false
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(String(text))
        return true
      }
    } catch (_) {}
    try {
      const ta = document.createElement('textarea')
      ta.value = String(text)
      ta.style.position = 'fixed'
      ta.style.left = '-9999px'
      ta.style.top = '0'
      ;(document.body || document.documentElement).appendChild(ta)
      ta.focus()
      ta.select()
      const ok = document.execCommand('copy')
      ta.remove()
      return !!ok
    } catch (_) {}
    return false
  }

  function isLuarmorUrl(url) {
    try {
      const u = new URL(String(url), location.href)
      const h = (u.hostname || '').toLowerCase()
      return h === 'ads.luarmor.net' || h.endsWith('.ads.luarmor.net')
    } catch (_) {
      return String(url).includes('ads.luarmor.net')
    }
  }

  function getBypassReturnUrl() {
    try {
      const params = new URLSearchParams(location.search)
      const ret = params.get('return')
      if (ret) return ret
    } catch (_) {}
    try {
      const ret = sessionStorage.getItem('vw_bypass_return_url')
      if (ret) return ret
    } catch (_) {}
    return ''
  }

  function setBypassReturnUrl(url) {
    try {
      sessionStorage.setItem('vw_bypass_return_url', String(url))
    } catch (_) {}
  }

  function buildReturnWithRedirect(returnUrl, target) {
    try {
      const u = new URL(String(returnUrl), location.href)
      u.searchParams.set('redirect', String(target))
      return u.toString()
    } catch (_) {
      const base = String(returnUrl)
      const join = base.includes('?') ? '&' : '?'
      return base + join + 'redirect=' + encodeURIComponent(String(target))
    }
  }

  const SHARED_UI_CSS = `
    html,body{margin:0;padding:0;height:100%;overflow:hidden}
    #vortixWorldOverlay{position:fixed!important;top:0!important;left:0!important;width:100vw!important;height:100vh!important;height:100dvh!important;background:radial-gradient(circle at 10% 20%,#0f172a,#030614)!important;z-index:2147483647!important;display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;font-family:'Inter',system-ui,-apple-system,'Segoe UI',Roboto,Arial,sans-serif!important;opacity:1!important;visibility:visible!important;pointer-events:auto!important;box-sizing:border-box!important;isolation:isolate!important}
    #vortixWorldOverlay *{box-sizing:border-box!important}
    .vw-header-bar{position:absolute!important;top:0!important;left:0!important;width:100%!important;height:72px!important;padding:0 26px!important;display:flex!important;align-items:center!important;justify-content:space-between!important;background:rgba(15,23,42,0.7)!important;backdrop-filter:blur(12px)!important;border-bottom:1px solid rgba(59,130,246,0.3)!important;z-index:2147483648!important}
    .vw-title{font-weight:900!important;font-size:22px!important;display:flex!important;align-items:center!important;gap:12px!important;color:#3b82f6!important}
    .vw-header-icon{height:34px!important;width:34px!important;border-radius:50%!important;object-fit:cover!important;border:2px solid #3b82f6!important}
    .vw-main-content{display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;width:100%!important;max-width:600px!important;animation:vw-fade-in .4s cubic-bezier(0.2,0.9,0.4,1.1)!important;position:relative!important;z-index:2147483641!important;padding:20px!important;background:rgba(15,23,42,0.6)!important;backdrop-filter:blur(12px)!important;border-radius:32px!important;border:1px solid rgba(59,130,246,0.3)!important;box-shadow:0 25px 50px -12px rgba(0,0,0,0.5)!important}
    .vw-icon-img{width:80px!important;height:80px!important;border-radius:50%!important;margin-bottom:25px!important;box-shadow:0 0 0 2px #3b82f6,0 10px 30px -5px rgba(0,0,0,0.4)!important;object-fit:cover!important}
    .vw-spinner{width:48px!important;height:48px!important;border:4px solid rgba(59,130,246,0.2)!important;border-top:4px solid #3b82f6!important;border-radius:50%!important;animation:spin 0.8s linear infinite!important;margin-bottom:20px!important}
    @keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}
    .vw-status{font-size:28px!important;font-weight:800!important;text-align:center!important;margin-bottom:12px!important;background:linear-gradient(135deg,#fff,#94a3b8)!important;-webkit-background-clip:text!important;background-clip:text!important;color:transparent!important}
    .vw-substatus{font-size:15px!important;color:#cbd5e1!important;text-align:center!important;font-weight:500!important;background:rgba(0,0,0,0.3)!important;padding:6px 12px!important;border-radius:40px!important;display:inline-block!important}
    .vw-btn{background:rgba(30,41,59,0.6)!important;color:#e2e8f0!important;border:1px solid #3b82f640!important;padding:12px 20px!important;border-radius:40px!important;font-weight:700!important;cursor:pointer!important;width:100%!important;transition:all .2s!important;font-size:14px!important;letter-spacing:0.5px!important}
    .vw-btn:hover{background:#3b82f6!important;border-color:#3b82f6!important;transform:translateY(-1px)!important;color:#fff!important}
    .vw-btn:disabled{opacity:.45!important;cursor:not-allowed!important;transform:none!important}
    @keyframes vw-fade-in{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
    .vw-toast{position:fixed!important;top:calc(72px + 12px)!important;right:calc(14px + env(safe-area-inset-right))!important;padding:10px 18px!important;border-radius:40px!important;background:rgba(15,23,42,0.92)!important;backdrop-filter:blur(8px)!important;color:#e2e8f0!important;font-weight:700!important;font-size:13px!important;box-shadow:0 8px 32px rgba(0,0,0,0.5)!important;animation:vw-toast-in 0.22s ease-out!important;z-index:2147483648!important;pointer-events:none!important;font-family:'Inter',system-ui,sans-serif!important;max-width:calc(100vw - 28px)!important;word-break:break-word!important;border-left:4px solid #3b82f6!important}
    .vw-toast.error{border-left-color:#ef4444!important}
    @keyframes vw-toast-in{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
    @media (max-width:768px){.vw-status{font-size:22px!important}.vw-substatus{font-size:12px!important}.vw-icon-img{width:64px!important;height:64px!important}.vw-header-bar{height:60px!important;padding:0 16px!important}.vw-main-content{padding:16px!important}.vw-toast{top:calc(60px + 12px)!important}}
  `

  let __vwLuarmorAllowOnceUrl = ''
  let __vwLuarmorAllowUntil = 0

  function allowLuarmorOnce(url, ms = 1500) {
    __vwLuarmorAllowOnceUrl = String(url || '')
    __vwLuarmorAllowUntil = Date.now() + ms
  }

  function isLuarmorAllowedNow(url) {
    const u = String(url || '')
    if (!__vwLuarmorAllowOnceUrl) return false
    if (Date.now() > __vwLuarmorAllowUntil) return false
    return u === __vwLuarmorAllowOnceUrl
  }

  function renderLuarmorNextUI(targetUrl, waitSeconds) {
    const secs = Number.isFinite(waitSeconds) ? Math.max(0, Math.floor(waitSeconds)) : 20
    document.documentElement.innerHTML = `
      <html>
        <head>
          <title>VortixWorld USERSCRIPT</title>
          <meta name="viewport" content="width=device-width,initial-scale=1"/>
          <style>${SHARED_UI_CSS}</style>
        </head>
        <body>
          <div id="vortixWorldOverlay">
            <div class="vw-header-bar">
              <div class="vw-title">
                <img src="${ICON_URL}" class="vw-header-icon" alt="Icon">
                VortixWorld
              </div>
            </div>
            <div class="vw-main-content">
              <img src="${LUARMOR_UI_ICON}" class="vw-icon-img" alt="VortixWorld" onerror="this.onerror=null;this.src='${ICON_URL}'">
              <div id="vwLuarmorSpinner" class="vw-spinner"></div>
              <div id="vwStatus" class="vw-status">Luarmor Manual Continue</div>
              <div id="vwSubStatus" class="vw-substatus">Next will unlock in ${secs} seconds...</div>
              <div style="width:80%; max-width:420px; margin-top:18px; display:flex; flex-direction:column; gap:12px;">
                <button id="vwLuarmorNextBtn" class="vw-btn" disabled>Next</button>
              </div>
            </div>
          </div>
        </body>
      </html>
    `
    const btn = document.getElementById('vwLuarmorNextBtn')
    const sub = document.getElementById('vwSubStatus')
    const spinner = document.getElementById('vwLuarmorSpinner')
    let remaining = secs
    const iv = setInterval(() => {
      remaining = Math.max(0, remaining - 1)
      if (sub) sub.innerText = remaining > 0 ? `Next will unlock in ${remaining} seconds...` : 'You may continue now.'
      if (remaining <= 0) {
        if (spinner) spinner.style.display = 'none'
        if (btn) btn.disabled = false
        clearInterval(iv)
      }
    }, 1000)
    if (btn) {
      btn.addEventListener('click', () => {
        allowLuarmorOnce(targetUrl, 1500)
        try {
          location.href = targetUrl
        } catch (_) {
          window.open(targetUrl, '_self')
        }
      })
    }
  }

  function handleLuarmorTarget(url) {
    const target = String(url)
    if (isLuarmorAllowedNow(target)) {
      __vwLuarmorAllowOnceUrl = ''
      __vwLuarmorAllowUntil = 0
      return false
    }
    if (HOST === SITE_HOST) {
      const ret = getBypassReturnUrl()
      if (ret) {
        copyTextSilent(target).then(() => {
          const backUrl = buildReturnWithRedirect(ret, target)
          try {
            location.href = backUrl
          } catch (_) {
            window.open(backUrl, '_self')
          }
        })
        return true
      }
    }
    const wait = Number.isFinite(LuarmorWaitTime) ? LuarmorWaitTime : 20
    renderLuarmorNextUI(target, wait)
    return true
  }

  function installLuarmorNavigationGuard() {
    if (window.__VW_LUARMOR_GUARD_INSTALLED__) return
    window.__VW_LUARMOR_GUARD_INSTALLED__ = true

    const go = url => {
      if (!isLuarmorUrl(url)) return false
      return handleLuarmorTarget(url)
    }

    try {
      const origOpen = window.open
      window.open = function (url, target, features) {
        if (go(url)) return null
        return origOpen.call(this, url, target, features)
      }
    } catch (_) {}

    try {
      const origAssign = Location.prototype.assign
      Location.prototype.assign = function (url) {
        if (go(url)) return
        return origAssign.call(this, url)
      }
    } catch (_) {}

    try {
      const origReplace = Location.prototype.replace
      Location.prototype.replace = function (url) {
        if (go(url)) return
        return origReplace.call(this, url)
      }
    } catch (_) {}

    try {
      const origHrefDesc = Object.getOwnPropertyDescriptor(Location.prototype, 'href')
      if (origHrefDesc && origHrefDesc.set && origHrefDesc.get) {
        Object.defineProperty(Location.prototype, 'href', {
          configurable: true,
          enumerable: true,
          get: function () {
            return origHrefDesc.get.call(this)
          },
          set: function (url) {
            if (go(url)) return
            return origHrefDesc.set.call(this, url)
          }
        })
      }
    } catch (_) {}
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

  let uiInjected = false
  let bypassStart = performance.now()

  const uiHTML = `
    <div id="vortixWorldOverlay">
      <div class="vw-header-bar">
        <div class="vw-title">
          <img src="${ICON_URL}" class="vw-header-icon" alt="Icon">
          VortixWorld
        </div>
      </div>
      <div class="vw-main-content">
        <img src="${LOOTLINK_UI_ICON}" class="vw-icon-img" alt="VortixWorld" onerror="this.onerror=null;this.src='${ICON_URL}'">
        <div class="vw-spinner" id="vwSpinner"></div>
        <div id="vwStatus" class="vw-status">Initializing...</div>
        <div id="vwSubStatus" class="vw-substatus">Waiting for page to load</div>
      </div>
    </div>
  `

  function injectUI() {
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
    wrapper.innerHTML = uiHTML
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

  function updateStatus(main, sub) {
    if (!document.getElementById('vortixWorldOverlay')) injectUI()
    const m = document.getElementById('vwStatus')
    const s = document.getElementById('vwSubStatus')
    if (m) m.innerText = main
    if (s) s.innerText = sub
    const spinner = document.getElementById('vwSpinner')
    if (spinner) {
      if (main.includes('Complete') || main.includes('Redirecting')) {
        spinner.style.display = 'none'
      } else {
        spinner.style.display = 'block'
      }
    }
  }

  function showToast(message, isError = false) {
    const toast = document.createElement('div')
    toast.className = 'vw-toast' + (isError ? ' error' : '')
    toast.textContent = message
    document.body.appendChild(toast)
    setTimeout(() => {
      if (toast && toast.remove) toast.remove()
    }, 3500)
  }

  function isAutoRedirectEnabled() {
    const saved = localStorage.getItem(VW_KEYS.autoRedirect)
    return saved !== null ? saved === 'true' : true
  }

  function handleBypassSuccess(url, timeSecondsStr, bypassType = '') {
    const timeLabel = timeSecondsStr || ((performance.now() - bypassStart) / 1000).toFixed(2)
    if (isLuarmorUrl(url)) {
      handleLuarmorTarget(url)
      shutdown()
      return
    }
    const auto = isAutoRedirectEnabled()
    if (auto) {
      updateStatus('🚀 Redirecting...', `Target URL acquired (${timeLabel}s)`)
      if (bypassType === 'tpili') {
        showToast(`✅ Bypassed in ${timeLabel}s`, false)
      } else if (bypassType === 'lootlink') {
        showToast('✅ Bypass successful', false)
      } else {
        showToast(`✅ Bypassed in ${timeLabel}s`, false)
      }
      setTimeout(() => {
        location.href = url
      }, 1000)
    } else {
      injectUI()
      updateStatus('✔️ Bypass Complete!', `Completed in ${timeLabel}s - ${url}`)
      if (bypassType === 'tpili') {
        showToast(`✅ Completed in ${timeLabel}s`, false)
      } else if (bypassType === 'lootlink') {
        showToast('✅ Bypass successful', false)
      } else {
        showToast(`✅ Completed in ${timeLabel}s`, false)
      }
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
      this.heartbeatCount = 0
      this.lastLoggedCount = 0
      this.resolved = false
    }

    connect() {
      if (isShutdown) return
      try {
        Logger.info('Connecting WebSocket', this.url)
        this.ws = new WebSocket(this.url)
        this.ws.onopen = () => this.onOpen()
        this.ws.onmessage = e => this.onMessage(e)
        this.ws.onclose = () => this.handleReconnect()
        this.ws.onerror = e => this.onError(e)
      } catch (e) {
        Logger.error('Unhandled exception thrown', e)
        this.handleReconnect()
      }
    }

    onOpen() {
      if (isShutdown) return
      Logger.info('WebSocket connection opened', this.url)
      this.retryCount = 0
      this.reconnectDelay = CONFIG.INITIAL_RECONNECT_DELAY
      if (this.reconnectTimeout) {
        clearTimeout(this.reconnectTimeout)
        cleanupManager.timeouts.delete(this.reconnectTimeout)
        this.reconnectTimeout = null
      }
      this.sendHeartbeat()
      this.heartbeatTimer = cleanupManager.setInterval(() => {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          this.sendHeartbeat()
        } else {
          clearInterval(this.heartbeatTimer)
        }
      }, this.heartbeatInterval)
    }

    sendHeartbeat() {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send('0')
        this.heartbeatCount++
        if (this.heartbeatCount - this.lastLoggedCount >= 5) {
          this.lastLoggedCount = this.heartbeatCount
          Logger.heartbeat(`WebSocket heartbeat sent x${this.heartbeatCount}`, 'Keepalive')
        }
      }
    }

    handleReconnect() {
      if (isShutdown) return
      if (this.heartbeatTimer) {
        clearInterval(this.heartbeatTimer)
        cleanupManager.intervals.delete(this.heartbeatTimer)
        this.heartbeatTimer = null
      }
      if (this.retryCount >= this.maxRetries) {
        Logger.error('WebSocket fatal error', 'Max retries exceeded')
        return
      }
      this.retryCount++
      const delay = Math.min(this.reconnectDelay * Math.pow(2, this.retryCount - 1), this.maxDelay)
      Logger.warn('WebSocket connection slow to open', `Retry ${this.retryCount} in ${delay}ms`)
      this.reconnectTimeout = cleanupManager.setTimeout(() => {
        Logger.info('WebSocket url opened', this.url)
        this.connect()
      }, delay)
    }

    onMessage(event) {
      if (isShutdown) return
      if (event.data && event.data.includes('r:')) {
        const PUBLISHER_LINK = event.data.replace('r:', '')
        Logger.info('Received publisher link from WebSocket', PUBLISHER_LINK)
        if (PUBLISHER_LINK) {
          try {
            const finalUrl = decodeURIComponent(decodeURIxor(PUBLISHER_LINK))
            Logger.info('Decoded final URL', finalUrl)
            this.disconnect()
            const duration = ((Date.now() - state.processStartTime) / 1000).toFixed(2)
            if (!isLuarmorUrl(finalUrl)) {
              cacheLootlinkMethod(state.cachedUrid, state.cachedTaskId)
            } else {
              Logger.info('Skipping cache because final URL is luarmor', finalUrl)
            }
            this.resolved = true
            handleBypassSuccess(finalUrl, duration, 'lootlink')
          } catch (e) {
            Logger.error('Critical decode failure', e)
          }
        }
      }
    }

    onError(error) {
      Logger.error('WebSocket fatal error', error)
    }

    disconnect() {
      if (this.heartbeatTimer) {
        clearInterval(this.heartbeatTimer)
        cleanupManager.intervals.delete(this.heartbeatTimer)
        this.heartbeatTimer = null
      }
      if (this.reconnectTimeout) {
        clearTimeout(this.reconnectTimeout)
        cleanupManager.timeouts.delete(this.reconnectTimeout)
        this.reconnectTimeout = null
      }
      if (this.ws) {
        this.ws.close()
      }
    }
  }

  const state = {
    processStartTime: Date.now(),
    cachedUrid: null,
    cachedTaskId: null,
    fallbackTimer: null
  }

  const LOOTLINK_CACHE_KEY = 'vw_lootlink_method'
  function cacheLootlinkMethod(urid, taskId) {
    if (!urid || !taskId) return
    const cache = {
      urid,
      taskId,
      host: HOST,
      url: location.href,
      timestamp: Date.now()
    }
    try {
      localStorage.setItem(LOOTLINK_CACHE_KEY, JSON.stringify(cache))
      Logger.info('Cached lootlink method', `urid: ${urid}, taskId: ${taskId}, url: ${location.href}`)
    } catch (_) {}
  }

  function getCachedLootlinkMethod() {
    try {
      const raw = localStorage.getItem(LOOTLINK_CACHE_KEY)
      if (!raw) return null
      const cache = JSON.parse(raw)
      if (cache.host === HOST && cache.url === location.href && (Date.now() - cache.timestamp) < 3600000) {
        return cache
      }
    } catch (_) {}
    return null
  }

  function waitForGlobals() {
    return new Promise((resolve) => {
      let attempts = 0
      const interval = setInterval(() => {
        if (window.INCENTIVE_SYNCER_DOMAIN && window.INCENTIVE_SERVER_DOMAIN && window.KEY && window.TID) {
          clearInterval(interval)
          resolve(true)
        } else if (attempts >= CONFIG.GLOBALS_WAIT_TIMEOUT / 100) {
          clearInterval(interval)
          resolve(false)
        }
        attempts++
      }, 100)
    })
  }

  async function tryCachedLootlinkBypass() {
    if (window.__vw_tc_processed) return false
    const cache = getCachedLootlinkMethod()
    if (!cache) return false
    const { urid, taskId } = cache

    Logger.info('Waiting for globals to use cached lootlink method')
    const globalsReady = await waitForGlobals()
    if (!globalsReady || !window.INCENTIVE_SERVER_DOMAIN) {
      Logger.warn('Globals not ready or domain missing for cached method, falling back to normal flow')
      return false
    }

    if (typeof KEY === 'undefined' || typeof TID === 'undefined') return false
    const wsUrl = `wss://${urid.substr(-5) % 3}.${window.INCENTIVE_SERVER_DOMAIN}/c?uid=${urid}&cat=${taskId}&key=${KEY}`
    Logger.info('Using cached lootlink method', wsUrl)
    const ws = new RobustWebSocket(wsUrl, {
      initialDelay: CONFIG.INITIAL_RECONNECT_DELAY,
      maxDelay: CONFIG.MAX_RECONNECT_DELAY,
      heartbeat: CONFIG.HEARTBEAT_INTERVAL,
      maxRetries: 3
    })
    window.activeWebSocket = ws
    ws.connect()

    state.fallbackTimer = cleanupManager.setTimeout(() => {
      if (!ws.resolved) {
        Logger.warn('Cached method timed out, falling back to normal flow')
        ws.disconnect()
        startNormalLootlinkFlow()
      }
    }, CONFIG.CACHED_METHOD_TIMEOUT)
    return true
  }

  function startNormalLootlinkFlow() {
    if (window.__vw_tc_processed) return
    injectUI()
    setupOptimizedObserver()
    initLocalLootlinkFetchOverride()
    startManualCheck()
    updateStatus('⏳ Loading...', 'Preparing bypass')

    cleanupManager.setTimeout(() => {
      if (!window.__vw_tc_processed && !window.activeWebSocket) {
        Logger.warn('Normal flow appears stuck, falling back to manual mode')
        updateStatus('⚠️ Bypass delayed', 'Trying alternative method...')
      }
    }, CONFIG.NORMAL_FLOW_FALLBACK_TIMEOUT)
  }

  function detectTaskInfo() {
    let countdownSeconds = 60
    let taskName = 'Processing'
    try {
      const pageText = document.body ? document.body.innerText : ''
      const lowerText = pageText.toLowerCase()
      if (lowerText.includes('view content') || lowerText.includes('watch video')) {
        countdownSeconds = 13
        taskName = 'View Content'
      } else if (lowerText.includes('notification') || lowerText.includes('allow notifications')) {
        countdownSeconds = 30
        taskName = 'Notification'
      } else if (lowerText.includes('app install') || lowerText.includes('download app')) {
        countdownSeconds = 60
        taskName = 'App Install'
      } else if (lowerText.includes('gaming offer') || lowerText.includes('play game')) {
        countdownSeconds = 90
        taskName = 'Gaming Offer'
      } else if (lowerText.includes('send sms') || lowerText.includes('text message')) {
        countdownSeconds = 50
        taskName = 'Send SMS'
      } else if (lowerText.includes('click') && lowerText.includes('reward')) {
        countdownSeconds = 30
        taskName = 'Click Reward'
      } else if (lowerText.includes('complete') && lowerText.includes('reward')) {
        countdownSeconds = 30
        taskName = 'Complete Reward'
      } else {
        const images = document.querySelectorAll('img')
        for (let img of images) {
          const src = (img.src || '').toLowerCase()
          if (src.includes('eye.png')) {
            countdownSeconds = 13
            taskName = 'View Content'
            break
          } else if (src.includes('bell.png')) {
            countdownSeconds = 30
            taskName = 'Notification'
            break
          } else if (src.includes('apps.png') || src.includes('fire.png')) {
            countdownSeconds = 60
            taskName = 'App Install'
            break
          } else if (src.includes('gamers.png')) {
            countdownSeconds = 90
            taskName = 'Gaming Offer'
            break
          }
        }
      }
    } catch (_) {}
    return { countdownSeconds, taskName }
  }

  function modifyParentElement(targetElement) {
    const parentElement = targetElement.parentElement
    if (!parentElement) return

    const { countdownSeconds, taskName } = detectTaskInfo()
    state.processStartTime = Date.now()
    bypassStart = performance.now()

    parentElement.innerHTML = ''
    parentElement.style.cssText = 'height: 0px !important; overflow: hidden !important; visibility: hidden !important;'

    injectUI()
    updateStatus(`⏳ ${taskName}...`, `Estimated ${countdownSeconds} seconds remaining...`)

    let remaining = countdownSeconds
    const timer = cleanupManager.setInterval(() => {
      remaining--
      updateStatus('🔄 Bypassing...', `(Estimated ${remaining} seconds remaining..)`)
      if (remaining <= 0) {
        clearInterval(timer)
        cleanupManager.intervals.delete(timer)
      }
    }, CONFIG.COUNTDOWN_INTERVAL)
  }

  function setupOptimizedObserver() {
    const targetContainer = document.body || document.documentElement
    const observer = new MutationObserver((mutationsList, observerRef) => {
      if (isShutdown) {
        observerRef.disconnect()
        return
      }
      const unlockText = ['UNLOCK CONTENT', 'Unlock Content']
      for (const mutation of mutationsList) {
        if (mutation.type !== 'childList') continue
        const addedElements = Array.from(mutation.addedNodes).filter(n => n.nodeType === 1)
        const found = addedElements
          .flatMap(el => [el, ...Array.from(el.querySelectorAll('*'))])
          .find(el => {
            const text = el.textContent
            return text && unlockText.some(t => text.includes(t))
          })
        if (found) {
          modifyParentElement(found)
          observerRef.disconnect()
          return
        }
      }
    })
    window.bypassObserver = observer
    observer.observe(targetContainer, { childList: true, subtree: true })

    const unlockText = ['UNLOCK CONTENT', 'Unlock Content']
    const existing = Array.from(document.querySelectorAll('*')).find(el => {
      const text = el.textContent
      return text && unlockText.some(t => text.includes(t))
    })
    if (existing) {
      modifyParentElement(existing)
      observer.disconnect()
    }
  }

  function processTcResponse(data, originalFetch) {
    let urid = ''
    let task_id = ''
    let action_pixel_url = ''
    try {
      data.forEach(item => {
        urid = item.urid
        task_id = 54
        action_pixel_url = item.action_pixel_url
      })
      Logger.info('Processed /tc response', `urid=${urid}, task_id=${task_id}`)
    } catch (_) {
      Logger.error('Failed to parse /tc response', data)
      return false
    }

    if (typeof KEY === 'undefined' || typeof TID === 'undefined') {
      Logger.warn('KEY or TID not defined, cannot proceed')
      return false
    }

    state.cachedUrid = urid
    state.cachedTaskId = task_id

    const wsUrl = `wss://${urid.substr(-5) % 3}.${window.INCENTIVE_SERVER_DOMAIN}/c?uid=${urid}&cat=${task_id}&key=${KEY}`
    Logger.info('Initiating WebSocket connection', wsUrl)
    const ws = new RobustWebSocket(wsUrl, {
      initialDelay: CONFIG.INITIAL_RECONNECT_DELAY,
      maxDelay: CONFIG.MAX_RECONNECT_DELAY,
      heartbeat: CONFIG.HEARTBEAT_INTERVAL,
      maxRetries: 3
    })
    window.activeWebSocket = ws
    ws.connect()

    try {
      const beaconUrl = `https://${urid.substr(-5) % 3}.${window.INCENTIVE_SERVER_DOMAIN}/st?uid=${urid}&cat=${task_id}`
      navigator.sendBeacon(beaconUrl)
      Logger.info('Sent beacon', beaconUrl)
    } catch (_) {}

    if (action_pixel_url) {
      originalFetch(action_pixel_url).catch(() => {})
      Logger.info('Fetched action pixel', action_pixel_url)
    }
    const tdUrl = `https://${window.INCENTIVE_SYNCER_DOMAIN}/td?ac=1&urid=${urid}&&cat=${task_id}&tid=${TID}`
    originalFetch(tdUrl).catch(() => {})
    Logger.info('Fetched td URL', tdUrl)

    return true
  }

  function initLocalLootlinkFetchOverride() {
    const originalFetch = window.fetch
    window.fetch = function (url, config) {
      try {
        const urlStr = typeof url === 'string' ? url : url && url.url ? url.url : ''
        if (typeof INCENTIVE_SYNCER_DOMAIN === 'undefined' || typeof INCENTIVE_SERVER_DOMAIN === 'undefined') {
          return originalFetch(url, config)
        }
        if (urlStr.includes(`${INCENTIVE_SYNCER_DOMAIN}/tc`)) {
          if (window.__vw_tc_processed) {
            return originalFetch(url, config)
          }
          return originalFetch(url, config)
            .then(response => {
              if (!response.ok) return response
              return response
                .clone()
                .json()
                .then(data => {
                  processTcResponse(data, originalFetch)
                  window.__vw_tc_processed = true
                  return new Response(JSON.stringify(data), {
                    status: response.status,
                    statusText: response.statusText,
                    headers: response.headers
                  })
                })
                .catch(() => response)
            })
            .catch(() => originalFetch(url, config))
        }
      } catch (_) {}
      return originalFetch(url, config)
    }
  }

  async function fetchWithRetry(url, options, retries = 2, delay = 1000) {
    for (let i = 0; i <= retries; i++) {
      try {
        const res = await fetch(url, options)
        if (res.ok) return res
        if (i === retries) throw new Error(`HTTP ${res.status}`)
      } catch (err) {
        if (i === retries) throw err
      }
      await new Promise(r => setTimeout(r, delay * Math.pow(2, i)))
    }
  }

  async function sendTcManually() {
    if (window.__vw_tc_processed) return
    const originalFetch = window.fetch
    const syncDomain = window.INCENTIVE_SYNCER_DOMAIN
    if (!syncDomain) return
    const tcUrl = `https://${syncDomain}/tc`
    Logger.info('Sending manual /tc request', tcUrl)
    try {
      const res = await fetchWithRetry(tcUrl, {
        credentials: 'include',
        headers: { 'User-Agent': ANDROID_UA }
      }, 2, 1000)
      const data = await res.json()
      processTcResponse(data, originalFetch)
      window.__vw_tc_processed = true
      Logger.info('Manual /tc processed successfully')
      showToast('✅ Lootlink bypass successful', false)
    } catch (err) {
      Logger.warn('Manual /tc request failed after retries', err.message)
      showToast('⚠️ Lootlink bypass failed, retrying...', true)
    }
  }

  function startManualCheck() {
    let attempts = 0
    const interval = setInterval(() => {
      if (window.__vw_tc_processed) {
        clearInterval(interval)
        return
      }
      if (window.INCENTIVE_SYNCER_DOMAIN && window.INCENTIVE_SERVER_DOMAIN && window.KEY && window.TID) {
        clearInterval(interval)
        sendTcManually()
      } else if (attempts >= 100) {
        clearInterval(interval)
        Logger.warn('Manual /tc: globals not found after 10s, relying on page fetch')
        showToast('⚠️ Globals not found, bypass may be slower', true)
      }
      attempts++
    }, 100)
  }

  function runLocalLootlinkBypass() {
    Logger.info('VortixWorld local lootlinks bypass enabled')
    installLuarmorNavigationGuard()

    if (tryCachedLootlinkBypass()) {
      Logger.info('Using cached lootlink method, waiting for result')
      return
    }

    cleanupManager.setTimeout(() => {
      startNormalLootlinkFlow()
    }, CONFIG.BYPASS_START_DELAY)

    window.addEventListener('beforeunload', () => cleanupManager.clearAll())
  }

  async function runLocalTpiLiBypass() {
    const startTime = Date.now()
    Logger.info('VortixWorld local tpi.li bypass enabled')
    injectUI()
    updateStatus('🔍 Fetching tpi.li link...', 'Extracting token, please wait')

    try {
      const alias = location.pathname.slice(1)
      if (!alias) {
        throw new Error('No alias found in URL')
      }
      Logger.info('TPI.LI alias', alias)

      const response = await fetch(location.href, { headers: { 'User-Agent': 'Mozilla/5.0' } })
      const html = await response.text()
      Logger.info('Fetched TPI.LI HTML', `${html.length} bytes`)

      let tokenMatch = html.match(/name="token"\s+value="([^"]+)"/)
      if (!tokenMatch) tokenMatch = html.match(/value="([^"]+)"\s+name="token"/)
      if (!tokenMatch) throw new Error('Token not found in page')
      const token = tokenMatch[1]
      Logger.info('Token extracted', token.substring(0, 20) + '...')

      const offset = 40 + 4 + alias.length + 4
      if (token.length < offset) throw new Error('Token too short')
      const tokenPart = token.slice(offset)
      Logger.info('Token part for decoding', tokenPart)
      const finalUrl = atob(tokenPart)
      Logger.info('Decoded final URL', finalUrl)

      if (!finalUrl || !finalUrl.startsWith('http')) throw new Error('Invalid final URL')
      const duration = ((Date.now() - startTime) / 1000).toFixed(2)
      handleBypassSuccess(finalUrl, duration, 'tpili')
    } catch (err) {
      Logger.error('tpi.li bypass failed', err.message)
      updateStatus('❌ Bypass failed', err.message)
      showToast(`❌ Bypass failed: ${err.message}`, true)
      const manualDiv = document.createElement('div')
      manualDiv.innerHTML = `<p style="color:#f97316; margin-top:20px;">Failed to auto-bypass. <a href="${location.href}" style="color:#3b82f6;">Click here to continue manually</a></p>`
      const overlay = document.getElementById('vortixWorldOverlay')
      if (overlay && overlay.querySelector('.vw-main-content')) {
        overlay.querySelector('.vw-main-content').appendChild(manualDiv)
      }
    }
  }

  function runRedirectBypass() {
    const cfgTime = RedirectWaitTime && RedirectWaitTime > 0 ? RedirectWaitTime : 10
    const config = { time: cfgTime }
    const TARGET = 'https://' + SITE_HOST + '/userscript.html'
    installLuarmorNavigationGuard()

    const originalCreateElement = document.createElement.bind(document)
    document.createElement = function (elementName) {
      const el = originalCreateElement(elementName)
      if (elementName && elementName.toLowerCase() === 'script') el.setAttribute('type', 'text/plain')
      return el
    }

    const params = new URLSearchParams(location.search)
    const redirectParam = params.get('redirect')

    if (redirectParam) {
      const rp = String(redirectParam)

      if (isLuarmorUrl(rp)) {
        handleLuarmorTarget(rp)
        return
      }

      try {
        location.href = rp
      } catch (_) {
        window.open(rp, '_blank', 'noopener,noreferrer')
      }
      return
    }

    if (!isAllowedHost()) {
      const returnUrl = location.href
      setBypassReturnUrl(returnUrl)
      copyTextSilent(returnUrl)

      const targetUrl =
        TARGET +
        '?url=' +
        encodeURIComponent(returnUrl) +
        '&time=' +
        encodeURIComponent(config.time) +
        '&return=' +
        encodeURIComponent(returnUrl)

      setTimeout(() => {
        location.href = targetUrl
      }, 1200)
      return
    }

    document.documentElement.innerHTML = `
      <html>
        <head>
          <title>VortixWorld USERSCRIPT</title>
          <meta name="viewport" content="width=device-width,initial-scale=1"/>
          <style>${SHARED_UI_CSS}</style>
        </head>
        <body>
          <div id="vortixWorldOverlay">
            <div class="vw-header-bar">
                <div class="vw-title">
                    <img src="${ICON_URL}" class="vw-header-icon" alt="Icon">
                    VortixWorld
                </div>
            </div>
            <div class="vw-main-content">
                <img src="${ICON_URL}" class="vw-icon-img" alt="VortixWorld">
                <div class="vw-spinner"></div>
                <div id="vwStatus" class="vw-status">Redirecting...</div>
                <div id="vwSubStatus" class="vw-substatus">Redirecting in ${config.time} seconds...</div>
            </div>
          </div>
        </body>
      </html>
    `

    let remaining = config.time
    const timerEl = document.getElementById('vwSubStatus')

    const interval = setInterval(() => {
      remaining--
      if (timerEl) timerEl.innerText = `Redirecting in ${remaining} seconds...`
      if (remaining <= 0) {
        clearInterval(interval)
        const returnUrl = location.href
        setBypassReturnUrl(returnUrl)
        copyTextSilent(returnUrl)
        location.href =
          TARGET +
          '?url=' +
          encodeURIComponent(returnUrl) +
          '&time=' +
          encodeURIComponent(config.time) +
          '&return=' +
          encodeURIComponent(returnUrl)
      }
    }, 1000)
  }

  function main() {
    if (window.VW_CONFIG) {
      if (typeof window.VW_CONFIG.redirectWaitTime === 'number') {
        RedirectWaitTime = window.VW_CONFIG.redirectWaitTime
        localStorage.setItem(VW_KEYS.redirectWaitTime, String(RedirectWaitTime))
      }
      if (typeof window.VW_CONFIG.luarmorWaitTime === 'number') {
        LuarmorWaitTime = window.VW_CONFIG.luarmorWaitTime
        localStorage.setItem(VW_KEYS.luarmorWaitTime, String(LuarmorWaitTime))
      }
    }

    if (HOST === SITE_HOST) {
      installLuarmorNavigationGuard()
    }

    if (isTpiLi()) {
      runLocalTpiLiBypass()
      return
    }

    if (isLootHost()) {
      runLocalLootlinkBypass()
      return
    }

    if (isAllowedHost()) {
      runRedirectBypass()
      return
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', main)
  } else {
    main()
  }
})()