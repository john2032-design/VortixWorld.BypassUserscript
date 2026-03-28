// ==UserScript==
// @name         VortixWorld Bypass
// @namespace    afklolbypasser
// @version      2.2
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
    FALLBACK_CHECK_DELAY: 15000
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
    websocket: 'color:#a855f7;',
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
    websocket: (m, d = '') => {
      console.info(
        `%c[WEBSOCKET]%c [VortixBypass] ${m}`,
        LOG_STYLE.base + LOG_STYLE.websocket,
        LOG_STYLE.base + LOG_STYLE.dim,
        d || ''
      )
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
    .vw-header-icon{height:34px!important;width:34px!important;border-radius:50%!important;object-fit:cover!important}
    .vw-main-content{display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;width:100%!important;max-width:600px!important;animation:vw-fade-in .4s cubic-bezier(0.2,0.9,0.4,1.1)!important;position:relative!important;z-index:2147483641!important;padding:20px!important;background:rgba(15,23,42,0.6)!important;backdrop-filter:blur(12px)!important;border-radius:32px!important;border:1px solid rgba(59,130,246,0.3)!important;box-shadow:0 25px 50px -12px rgba(0,0,0,0.5)!important}
    .vw-icon-img{width:80px!important;height:80px!important;border-radius:50%!important;margin-bottom:25px!important;box-shadow:0 10px 30px -5px rgba(0,0,0,0.4)!important;object-fit:cover!important}
    .vw-spinner{width:48px!important;height:48px!important;border:4px solid rgba(59,130,246,0.2)!important;border-top:4px solid #3b82f6!important;border-radius:50%!important;animation:spin 0.8s linear infinite!important;margin-bottom:20px!important}
    @keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}
    .vw-status{font-size:28px!important;font-weight:800!important;text-align:center!important;margin-bottom:12px!important;background:linear-gradient(135deg,#fff,#94a3b8)!important;-webkit-background-clip:text!important;background-clip:text!important;color:transparent!important}
    .vw-substatus{font-size:15px!important;color:#cbd5e1!important;text-align:center!important;font-weight:500!important;background:rgba(0,0,0,0.3)!important;padding:6px 12px!important;border-radius:40px!important;display:inline-block!important;word-break:break-all!important;max-width:90vw!important}
    .vw-url-container{width:100%;margin:20px 0;padding:12px;background:rgba(0,0,0,0.4);border-radius:12px;word-break:break-all;font-size:12px;color:#94a3b8;font-family:monospace;max-height:100px;overflow-y:auto}
    .vw-button-group{display:flex;gap:12px;width:100%;margin-top:8px}
    .vw-btn{background:rgba(30,41,59,0.6)!important;color:#e2e8f0!important;border:1px solid #3b82f640!important;padding:12px 20px!important;border-radius:40px!important;font-weight:700!important;cursor:pointer!important;transition:all .2s!important;font-size:14px!important;letter-spacing:0.5px!important;flex:1}
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
  let countdownTimerId = null
  let currentRemainingSeconds = 60

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
        <button id="vwCopyBtn" class="vw-btn">📋 Copy URL</button>
        <button id="vwProceedBtn" class="vw-btn">➡️ Proceed to URL</button>
      </div>
    `

    const copyBtn = document.getElementById('vwCopyBtn')
    const proceedBtn = document.getElementById('vwProceedBtn')
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        copyTextSilent(finalUrl).then(() => {
          showToast('URL copied to clipboard', false)
        })
      })
    }
    if (proceedBtn) {
      proceedBtn.addEventListener('click', () => {
        location.href = finalUrl
      })
    }
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>]/g, function(m) {
      if (m === '&') return '&amp;'
      if (m === '<') return '&lt;'
      if (m === '>') return '&gt;'
      return m
    }).replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, function(c) {
      return c
    })
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

  function updateCountdown(remaining) {
    if (remaining !== undefined) {
      currentRemainingSeconds = remaining
    }
    const sub = document.getElementById('vwSubStatus')
    if (sub) {
      sub.innerText = `Time Remaining ${currentRemainingSeconds} seconds...`
    }
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
      this.heartbeatCount = 0
      this.lastLoggedCount = 0
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
      } catch (e) {
        Logger.error('Unhandled exception thrown', e)
        this.handleReconnect()
      }
    }

    onOpen() {
      if (isShutdown) return
      Logger.websocket('WebSocket connection opened', this.url)
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
          Logger.websocket(`WebSocket heartbeat sent x${this.heartbeatCount}`, 'Keepalive')
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
        Logger.websocket('WebSocket url opened', this.url)
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
              saveResultToCache(location.href, finalUrl)
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

  const BL_TASKS = Array.from({ length: 53 }, (_, i) => i + 1).filter(n => n !== 17)

  async function completeTaskViaSkippedLol(taskUrl) {
    const endpoint = 'https://skipped.lol/api/evade/ll'
    let urlToSend = taskUrl
    if (urlToSend && urlToSend.startsWith('//')) {
      urlToSend = 'https:' + urlToSend
    }
    const payload = {
      ID: 17,
      URL: urlToSend
    }
    try {
      Logger.info('Sending request to skipped.lol', JSON.stringify(payload))
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      const rawText = await response.text()
      Logger.info('Raw response from skipped.lol', rawText)

      let parsed = null
      try {
        parsed = JSON.parse(rawText)
        Logger.info('Parsed JSON response', JSON.stringify(parsed, null, 2))
      } catch (e) {
        Logger.warn('Response not JSON, ignoring', e.message)
      }

      if (parsed && parsed.status === 'ok') {
        Logger.info('Skipped.lol confirmed task completion')
        return true
      } else {
        throw new Error('Unexpected response from skipped.lol')
      }
    } catch (err) {
      Logger.error('Error calling skipped.lol', err)
      throw err
    }
  }

  function startWebSocketForTask(taskData) {
    if (!taskData || !taskData.urid) {
      Logger.error('Missing task data for WebSocket', taskData)
      return
    }
    const { urid, task_id } = taskData
    const wsUrl = `wss://${urid.substr(-5) % 3}.${INCENTIVE_SERVER_DOMAIN}/c?uid=${urid}&cat=${task_id}&key=${KEY}`
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
      const beaconUrl = `https://${urid.substr(-5) % 3}.${INCENTIVE_SERVER_DOMAIN}/st?uid=${urid}&cat=${task_id}`
      navigator.sendBeacon(beaconUrl)
      Logger.info('Sent beacon', beaconUrl)
    } catch (_) {}

    const tdUrl = `https://${INCENTIVE_SYNCER_DOMAIN}/td?ac=1&urid=${urid}&cat=${task_id}&tid=${TID}`
    fetch(tdUrl, { credentials: 'include' }).catch(() => {})
    Logger.info('Fetched td URL', tdUrl)
  }

  function selectFallbackTask(tasks) {
    if (!Array.isArray(tasks) || tasks.length === 0) return null
    const preferred = tasks.find(t => t.auto_complete_seconds === 30)
    if (preferred) return preferred
    const second = tasks.find(t => t.auto_complete_seconds === 40)
    if (second) return second
    return tasks[0]
  }

  function processTcResponse(data, originalFetch) {
    Logger.info('Processing /tc response', JSON.stringify(data, null, 2))
    const task17 = Array.isArray(data) ? data.find(item => item.task_id === 17) : null

    if (task17 && task17.ad_url) {
      Logger.info('Found task 17, using skipped.lol')
      const taskUrl = task17.ad_url
      completeTaskViaSkippedLol(taskUrl)
        .then(() => {
          Logger.info('Skipped.lol success, starting WebSocket for task 17')
          startWebSocketForTask(task17)
        })
        .catch(err => {
          Logger.error('Skipped.lol request failed, falling back to direct WebSocket', err)
          updateStatus('⚠️ Method 1 Failed', 'Using Method 2')
          startWebSocketForTask(task17)
        })
    } else {
      Logger.warn('Task 17 not found or missing ad_url, falling back to another task')
      updateStatus('⚠️ Method 1 Failed', 'Using Method 2')
      const fallbackTask = selectFallbackTask(data)
      if (fallbackTask && fallbackTask.urid) {
        Logger.info('Using fallback task', fallbackTask)
        if (fallbackTask.auto_complete_seconds) {
          startCountdown(fallbackTask.auto_complete_seconds)
        }
        startWebSocketForTask(fallbackTask)
      } else {
        Logger.error('No suitable task found in /tc response')
        updateStatus('❌ Bypass failed', 'No suitable task')
      }
    }
    return true
  }

  function initLootlinkFetchOverride() {
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
          if (config && config.method && config.method.toUpperCase() === 'POST') {
            let newBody = null
            let originalBody = config.body
            if (originalBody && typeof originalBody === 'string') {
              try {
                const parsed = JSON.parse(originalBody)
                if (!parsed.bl) {
                  parsed.bl = BL_TASKS
                  newBody = JSON.stringify(parsed)
                }
              } catch (e) {}
            } else if (originalBody && typeof originalBody === 'object') {
              if (!originalBody.bl) {
                const newBodyObj = { ...originalBody, bl: BL_TASKS }
                newBody = JSON.stringify(newBodyObj)
              }
            } else {
              newBody = JSON.stringify({ bl: BL_TASKS })
            }
            if (newBody) {
              const newConfig = {
                ...config,
                headers: {
                  ...config.headers,
                  'Content-Type': 'application/json'
                },
                body: newBody
              }
              return originalFetch(url, newConfig)
                .then(response => {
                  if (!response.ok) return response
                  return response.clone().json()
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
                .catch(err => originalFetch(url, config))
            }
          }
          return originalFetch(url, config)
            .then(response => {
              if (!response.ok) return response
              return response.clone().json()
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
            .catch(err => originalFetch(url, config))
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
    const syncDomain = INCENTIVE_SYNCER_DOMAIN
    if (!syncDomain) return
    const tcUrl = `https://${syncDomain}/tc`
    const payload = { bl: BL_TASKS }
    Logger.info('Sending manual POST /tc request with bl array', JSON.stringify(payload))

    try {
      const res = await fetchWithRetry(tcUrl, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': ANDROID_UA
        },
        body: JSON.stringify(payload)
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
    const interval = setInterval(() => {
      if (window.__vw_tc_processed) {
        clearInterval(interval)
        return
      }
      if (INCENTIVE_SYNCER_DOMAIN && INCENTIVE_SERVER_DOMAIN && typeof KEY !== 'undefined' && typeof TID !== 'undefined') {
        clearInterval(interval)
        sendTcManually()
      }
    }, 100)
  }

  function modifyParentElement(targetElement) {
    const parentElement = targetElement.parentElement
    if (!parentElement) return

    state.processStartTime = Date.now()
    bypassStart = performance.now()

    parentElement.innerHTML = ''
    parentElement.style.cssText = 'height: 0px !important; overflow: hidden !important; visibility: hidden !important;'

    injectUI()
    updateStatus('⏳ Loading...', 'Waiting for task data')
  }

  function setupOptimizedObserver() {
    const targetContainer = document.body || document.documentElement
    const observer = new MutationObserver((mutationsList, observerRef) => {
      if (isShutdown) {
        observerRef.disconnect()
        return
      }
      const unlockText = ['UNLOCK CONTENT', 'Unlock Content', 'Complete Task', 'Get Reward', 'Claim Reward']
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

    const unlockText = ['UNLOCK CONTENT', 'Unlock Content', 'Complete Task', 'Get Reward', 'Claim Reward']
    const existing = Array.from(document.querySelectorAll('*')).find(el => {
      const text = el.textContent
      return text && unlockText.some(t => text.includes(t))
    })
    if (existing) {
      modifyParentElement(existing)
      observer.disconnect()
    }
  }

  function runLocalLootlinkBypass() {
    Logger.info('VortixWorld local lootlinks bypass enabled (skipped.lol + WebSocket)')
    installLuarmorNavigationGuard()

    const cachedResult = getCachedResult(location.href)
    if (cachedResult && !isLuarmorUrl(cachedResult)) {
      Logger.info('Using cached result', `from cache: ${cachedResult}`)
      handleBypassSuccess(cachedResult, '0.00 (cached)', 'lootlink')
      return
    } else if (cachedResult && isLuarmorUrl(cachedResult)) {
      Logger.info('Cached result is luarmor, ignoring cache', cachedResult)
    }

    injectUI()
    updateStatus('⏳ Loading...', 'Preparing bypass')
    setupOptimizedObserver()
    initLootlinkFetchOverride()
    startManualCheck()

    cleanupManager.setTimeout(() => {
      if (!window.__vw_tc_processed) {
        Logger.warn('Bypass seems stuck, checking for unlock element again')
        const unlockText = ['UNLOCK CONTENT', 'Unlock Content', 'Complete Task', 'Get Reward', 'Claim Reward']
        const existing = Array.from(document.querySelectorAll('*')).find(el => {
          const text = el.textContent
          return text && unlockText.some(t => text.includes(t))
        })
        if (existing) {
          modifyParentElement(existing)
        } else {
          updateStatus('⚠️ Bypass delayed', 'Trying alternative method...')
        }
      }
    }, CONFIG.FALLBACK_CHECK_DELAY)

    window.addEventListener('beforeunload', () => cleanupManager.clearAll())
  }

  const RESULT_CACHE_KEY = 'vw_lootlink_results'

  function saveResultToCache(originalUrl, resultUrl) {
    try {
      let cache = {}
      const existing = localStorage.getItem(RESULT_CACHE_KEY)
      if (existing) {
        try {
          cache = JSON.parse(existing)
        } catch (_) {}
      }
      cache[originalUrl] = resultUrl
      localStorage.setItem(RESULT_CACHE_KEY, JSON.stringify(cache))
      Logger.info('Cached result', `${originalUrl} -> ${resultUrl}`)
    } catch (e) {
      Logger.warn('Failed to cache result', e)
    }
  }

  function getCachedResult(originalUrl) {
    try {
      const existing = localStorage.getItem(RESULT_CACHE_KEY)
      if (!existing) return null
      const cache = JSON.parse(existing)
      return cache[originalUrl] || null
    } catch (_) {
      return null
    }
  }

  async function runLocalTpiLiBypass() {
    const startTime = Date.now()
    Logger.info('VortixWorld local tpi.li bypass enabled')
    injectUI(ICON_URL)
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

  const state = {
    processStartTime: Date.now()
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