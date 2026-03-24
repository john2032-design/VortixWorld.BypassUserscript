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
  const SITE_HOST = 'vortix-world-bypass.vercel.app'

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
    'link-to.net'
  ]

  const TPI_HOSTS = ['tpi.li']

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
  const isTpiHost = () => hostMatchesAny(TPI_HOSTS)

  const CONFIG = Object.freeze({
    HEARTBEAT_INTERVAL: 1000,
    MAX_RECONNECT_DELAY: 30000,
    INITIAL_RECONNECT_DELAY: 1000,
    COUNTDOWN_INTERVAL: 1000
  })

  const VW_KEYS = window.VW_CONFIG?.keys || {
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

  const savedAuto = localStorage.getItem(VW_KEYS.autoRedirect)
  let isAutoRedirect = savedAuto !== null ? savedAuto === 'true' : true

  const logStacks = {
    countdown: { lastRemaining: null }
  }

  window.__vw_logs = window.__vw_logs || []

  const LOG_STYLE = {
    base: 'font-weight:800; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;',
    info: 'color:#22c55e;',
    warn: 'color:#f59e0b;',
    error: 'color:#ef4444;',
    dim: 'color:#94a3b8;'
  }

  const Logger = {
    _push(level, message, details) {
      const entry = { timestamp: Date.now(), level, message, details: details || '' }
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
    #vortixWorldOverlay{position:fixed!important;top:0!important;left:0!important;width:100vw!important;height:100vh!important;background:rgba(0,0,0,0.85)!important;backdrop-filter:blur(12px)!important;z-index:2147483647!important;display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;font-family:'Segoe UI','Inter',system-ui,sans-serif!important;opacity:1!important;visibility:visible!important;pointer-events:auto!important;box-sizing:border-box!important;isolation:isolate!important}
    #vortixWorldOverlay *{box-sizing:border-box!important}
    .vw-glass-card{background:rgba(20,30,50,0.6)!important;backdrop-filter:blur(12px)!important;border-radius:28px!important;border:1px solid rgba(255,255,255,0.2)!important;box-shadow:0 20px 40px rgba(0,0,0,0.4)!important;padding:24px!important;width:90%!important;max-width:480px!important;text-align:center!important}
    .vw-header-bar{position:absolute!important;top:0!important;left:0!important;width:100%!important;padding:16px 24px!important;display:flex!important;align-items:center!important;justify-content:space-between!important;background:rgba(255,255,255,0.08)!important;border-bottom:1px solid rgba(255,255,255,0.15)!important;backdrop-filter:blur(10px)!important;z-index:2147483648!important}
    .vw-title{font-weight:700!important;font-size:20px!important;display:flex!important;align-items:center!important;gap:12px!important;color:#fff!important}
    .vw-header-icon{height:34px!important;width:34px!important;border-radius:50%!important;object-fit:cover!important;border:2px solid #3b82f6!important}
    .vw-main-content{display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;width:100%!important;animation:vw-fade-in 0.4s ease-out!important;position:relative!important;z-index:2147483641!important}
    .vw-icon-img{width:80px!important;height:80px!important;border-radius:20px!important;margin-bottom:20px!important;box-shadow:0 12px 28px rgba(0,0,0,0.3)!important;object-fit:cover!important}
    .vw-status{font-size:24px!important;font-weight:800!important;text-align:center!important;margin-bottom:8px!important;background:linear-gradient(135deg,#fff,#94a3f8)!important;-webkit-background-clip:text!important;background-clip:text!important;color:transparent!important}
    .vw-substatus{font-size:14px!important;color:rgba(255,255,255,0.7)!important;text-align:center!important;font-weight:500!important;margin-top:4px!important}
    .vw-spinner{width:48px!important;height:48px!important;border:4px solid rgba(255,255,255,0.2)!important;border-top:4px solid #3b82f6!important;border-radius:50%!important;animation:vw-spin 1s linear infinite!important;margin:20px auto!important}
    .vw-btn{background:rgba(59,130,246,0.9)!important;color:#fff!important;border:none!important;padding:12px 20px!important;border-radius:40px!important;font-weight:600!important;cursor:pointer!important;width:100%!important;text-transform:uppercase!important;transition:all 0.2s!important;font-size:14px!important;letter-spacing:0.5px!important;backdrop-filter:blur(4px)!important}
    .vw-btn:hover{background:#3b82f6!important;transform:translateY(-2px)!important;box-shadow:0 8px 20px rgba(59,130,246,0.4)!important}
    .vw-btn:disabled{opacity:0.5!important;cursor:not-allowed!important;transform:none!important}
    .vw-toggle-container{background:rgba(255,255,255,0.1)!important;border-radius:40px!important;padding:5px 12px!important;display:flex!important;align-items:center!important;gap:8px!important;font-size:12px!important;font-weight:500!important}
    @keyframes vw-fade-in{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
    @keyframes vw-spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}
    @media (max-width:768px){.vw-status{font-size:20px!important}.vw-icon-img{width:64px!important;height:64px!important}.vw-glass-card{padding:20px!important}.vw-header-bar{padding:12px 16px!important}}
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
              <div class="vw-glass-card">
                <img src="${ICON_URL}" class="vw-icon-img" alt="VortixWorld">
                <div id="vwStatus" class="vw-status">Luarmor Manual Continue</div>
                <div id="vwSubStatus" class="vw-substatus">Next will unlock in ${secs} seconds...</div>
                <div class="vw-spinner" style="display:${secs>0?'block':'none'}"></div>
                <button id="vwLuarmorNextBtn" class="vw-btn" disabled style="margin-top:20px">Next</button>
              </div>
            </div>
          </div>
        </body>
      </html>
    `
    const btn = document.getElementById('vwLuarmorNextBtn')
    const sub = document.getElementById('vwSubStatus')
    let remaining = secs
    const iv = setInterval(() => {
      remaining = Math.max(0, remaining - 1)
      if (sub) sub.innerText = remaining > 0 ? `Next will unlock in ${remaining} seconds...` : 'You may continue now.'
      if (remaining <= 0) {
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
        <div class="vw-toggle-container">
          <span>AutoRedirect</span>
          <label style="position:relative; display:inline-block; width:40px; height:20px;">
            <input type="checkbox" id="vwAutoToggle" style="opacity:0; width:100%; height:100%; position:absolute; top:0; left:0; cursor:pointer; margin:0;">
            <span id="vwAutoTrack" style="position:absolute; top:0; left:0; right:0; bottom:0; background-color:rgba(255,255,255,0.2); transition:0.25s; border-radius:999px;"></span>
            <span id="vwAutoKnob" style="position:absolute; height:14px; width:14px; left:3px; bottom:3px; background-color:#fff; transition:0.25s; border-radius:50%;"></span>
          </label>
        </div>
      </div>
      <div class="vw-main-content">
        <div class="vw-glass-card">
          <img src="${ICON_URL}" class="vw-icon-img" alt="VortixWorld">
          <div id="vwStatus" class="vw-status">Initializing...</div>
          <div id="vwSubStatus" class="vw-substatus">Waiting for page to load</div>
          <div class="vw-spinner" id="vwSpinner" style="display:block"></div>
        </div>
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

    const toggle = document.getElementById('vwAutoToggle')
    const knob = document.getElementById('vwAutoKnob')
    const track = document.getElementById('vwAutoTrack')

    const paint = checked => {
      if (track) track.style.background = checked ? '#3b82f6' : 'rgba(255,255,255,0.2)'
      if (knob) knob.style.transform = checked ? 'translateX(20px)' : 'translateX(0px)'
    }

    if (toggle) {
      toggle.checked = isAutoRedirect
      paint(isAutoRedirect)
      toggle.addEventListener('change', e => {
        isAutoRedirect = e.target.checked
        localStorage.setItem('vw_auto_redirect', isAutoRedirect)
        paint(isAutoRedirect)
      })
    }
  }

  function updateStatus(main, sub, showSpinner = true) {
    if (!document.getElementById('vortixWorldOverlay')) injectUI()
    const m = document.getElementById('vwStatus')
    const s = document.getElementById('vwSubStatus')
    const spinner = document.getElementById('vwSpinner')
    if (m) m.innerText = main
    if (s) s.innerText = sub
    if (spinner) spinner.style.display = showSpinner ? 'block' : 'none'
  }

  function handleBypassSuccess(url, timeSecondsStr) {
    const timeLabel = timeSecondsStr || ((performance.now() - bypassStart) / 1000).toFixed(2)
    if (isLuarmorUrl(url)) {
      handleLuarmorTarget(url)
      shutdown()
      return
    }
    if (isAutoRedirect) {
      updateStatus('🚀 Redirecting...', `Target URL acquired (${timeLabel}s)`, false)
      setTimeout(() => {
        location.href = url
      }, 1000)
    } else {
      injectUI()
      updateStatus('✔️ Bypass Complete!', String(url), false)
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
    }

    connect() {
      if (isShutdown) return
      try {
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
        Logger.info('WebSocket heartbeat sent', 'Keepalive')
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
        if (PUBLISHER_LINK) {
          try {
            const finalUrl = decodeURIComponent(decodeURIxor(PUBLISHER_LINK))
            this.disconnect()
            const duration = ((Date.now() - state.processStartTime) / 1000).toFixed(2)
            handleBypassSuccess(finalUrl, duration)
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
    processStartTime: Date.now()
  }

  function detectTaskInfo() {
    let countdownSeconds = 60
    let taskName = 'Processing'
    try {
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
      const last = logStacks.countdown.lastRemaining
      if (last === null || last - remaining >= 5 || remaining <= 5) {
        logStacks.countdown.lastRemaining = remaining
        Logger.info('Countdown progress snapshot', `${remaining} seconds remaining`)
      }
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

  let processedTc = false
  function initLocalLootlinkFetchOverride() {
    const originalFetch = window.fetch
    window.fetch = function (url, config) {
      try {
        const urlStr = typeof url === 'string' ? url : url && url.url ? url.url : ''
        if (typeof INCENTIVE_SYNCER_DOMAIN === 'undefined' || typeof INCENTIVE_SERVER_DOMAIN === 'undefined') {
          return originalFetch(url, config)
        }
        if (urlStr.includes(`${INCENTIVE_SYNCER_DOMAIN}/tc`) && !processedTc) {
          processedTc = true
          return originalFetch(url, config)
            .then(response => {
              if (!response.ok) return response
              return response
                .clone()
                .json()
                .then(data => {
                  let urid = ''
                  let task_id = ''
                  let action_pixel_url = ''
                  try {
                    data.forEach(item => {
                      urid = item.urid
                      task_id = 54
                      action_pixel_url = item.action_pixel_url
                    })
                  } catch (_) {}

                  if (typeof KEY === 'undefined' || typeof TID === 'undefined') {
                    return response
                  }

                  const wsUrl = `wss://${urid.substr(-5) % 3}.${INCENTIVE_SERVER_DOMAIN}/c?uid=${urid}&cat=${task_id}&key=${KEY}`
                  const ws = new RobustWebSocket(wsUrl, {
                    initialDelay: CONFIG.INITIAL_RECONNECT_DELAY,
                    maxDelay: CONFIG.MAX_RECONNECT_DELAY,
                    heartbeat: CONFIG.HEARTBEAT_INTERVAL,
                    maxRetries: 3
                  })
                  window.activeWebSocket = ws
                  ws.connect()

                  try {
                    const beaconUrl = `https://${urid.substr(-5) % 3}.${INCENTIVE_SERVER_DOMAIN}/st?uid=${urid}&cat=${task_id}`
                    navigator.sendBeacon(beaconUrl)
                  } catch (_) {}

                  if (action_pixel_url) {
                    originalFetch(action_pixel_url).catch(() => {})
                  }
                  const tdUrl = `https://${INCENTIVE_SYNCER_DOMAIN}/td?ac=1&urid=${urid}&&cat=${task_id}&tid=${TID}`
                  originalFetch(tdUrl).catch(() => {})

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

  function manualFetchTc() {
    if (processedTc) return
    if (typeof INCENTIVE_SYNCER_DOMAIN === 'undefined' || typeof INCENTIVE_SERVER_DOMAIN === 'undefined') {
      setTimeout(manualFetchTc, 500)
      return
    }
    fetch(`/${INCENTIVE_SYNCER_DOMAIN}/tc`).catch(() => {})
  }

  function runLocalLootlinkBypass() {
    Logger.info('VortixWorld local lootlinks bypass enabled')
    installLuarmorNavigationGuard()
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        injectUI()
        setupOptimizedObserver()
        initLocalLootlinkFetchOverride()
        setTimeout(manualFetchTc, 500)
        updateStatus('⏳ Loading...', 'Preparing bypass')
      })
    } else {
      injectUI()
      setupOptimizedObserver()
      initLocalLootlinkFetchOverride()
      setTimeout(manualFetchTc, 500)
      updateStatus('⏳ Loading...', 'Preparing bypass')
    }
    window.addEventListener('beforeunload', () => cleanupManager.clearAll())
  }

  async function runTpiBypass() {
    Logger.info('Starting tpi.li bypass')
    injectUI()
    updateStatus('🔓 TPI.BY', 'Fetching redirect...')
    try {
      const alias = location.pathname.slice(1)
      const html = await fetch(location.href, { headers: { 'User-Agent': 'Mozilla/5.0' } }).then(r => r.text())
      const tokenMatch = html.match(/name="token"\s+value="([^"]+)"/) || html.match(/value="([^"]+)"\s+name="token"/)
      const token = tokenMatch ? tokenMatch[1] : null
      if (!token) throw new Error('No token found')
      const offset = 40 + 4 + alias.length + 4
      const base64Part = token.slice(offset)
      const finalUrl = atob(base64Part)
      handleBypassSuccess(finalUrl)
    } catch (err) {
      Logger.error('tpi.li bypass failed', err)
      updateStatus('❌ Failed', err.message, false)
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

      if (rp.includes('https://flux.li/android/external/main.php')) {
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
                  <div class="vw-title"><img src="${ICON_URL}" class="vw-header-icon">VortixWorld</div>
                </div>
                <div class="vw-main-content">
                  <div class="vw-glass-card">
                    <img src="${ICON_URL}" class="vw-icon-img">
                    <div class="vw-status">Manual Redirect Required</div>
                    <div class="vw-substatus">Extra security checks detected</div>
                    <a href="${rp}" class="vw-btn" style="display:inline-block; text-decoration:none; margin-top:20px">Continue</a>
                  </div>
                </div>
              </div>
            </body>
          </html>
        `
        return
      }

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
              <div class="vw-title"><img src="${ICON_URL}" class="vw-header-icon">VortixWorld</div>
            </div>
            <div class="vw-main-content">
              <div class="vw-glass-card">
                <img src="${ICON_URL}" class="vw-icon-img">
                <div id="vwStatus" class="vw-status">Redirecting...</div>
                <div id="vwSubStatus" class="vw-substatus">Redirecting in ${config.time} seconds...</div>
                <div class="vw-spinner" id="vwSpinner" style="display:block"></div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `

    let remaining = config.time
    const timerEl = document.getElementById('vwSubStatus')
    const spinner = document.getElementById('vwSpinner')

    const interval = setInterval(() => {
      remaining--
      if (timerEl) timerEl.innerText = `Redirecting in ${remaining} seconds...`
      if (remaining <= 0) {
        clearInterval(interval)
        if (spinner) spinner.style.display = 'none'
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
    if (HOST === SITE_HOST) {
      installLuarmorNavigationGuard()
    }

    if (isTpiHost()) {
      runTpiBypass()
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