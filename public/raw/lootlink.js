// ==UserScript==
// @name         VortixWorld method 2 lootlink
// @namespace    afklolbypasser
// @version      1.0
// @description  lootlink method 2 integration for VortixWorld
// @author       afk.l0l
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
  'use strict'

  const API_URL = 'https://api.bypass.tools/api/v1/bypass/direct'
  const API_KEY = 'bt_09009a360dd5e8b49cf1a68962f774d92136564fb5594c64'

  const API_BYPASS_HOSTS = [
    'work.ink',
    'linkvertise.com',
    'auth.platorelay.com',
    'fly.inc',
    'lockr.so',
    'lockr.net',
    'link-unlocker.com',
    'link-unlock.com',
    'arolinks.com',
    'go.linkify.ru',
    'bstlar.com',
    'linkzy.space',
    'rekonise.com',
    'rekonise.org',
    'rkns.link',
    'mboost.me',
    'social-unlock.com',
    'sub2unlock.com',
    'sub2unlock.me',
    'sub2unlock.io',
    'sub4unlock.com',
    'sub4unlock.me',
    'sub4unlock.io',
    'sub2get.com',
    'subfinal.com',
    'unlocknow.net',
    'ytsubme.com',
    'pastebin.com',
    'paste-drop.com',
    'pastefy.app',
    'paster.so',
    'paster.gg',
    'justpaste.it',
    'pastecanyon.com',
    'pastehill.com',
    'pastemode.com',
    'rentry.org',
    'rentry.co',
    'bit.ly',
    'cl.gy',
    'goo.gl',
    'is.gd',
    'rebrand.ly',
    'shorter.me',
    't.co',
    't.ly',
    'tiny.cc',
    'tinylink.onl',
    'tinyurl.com',
    'v.gd',
    'gateway.platoboost.com',
    'pandadevelopment.net',
    'new.pandadevelopment.net',
    'trigonevo.com',
    'violated.lol',
    'blox-script.com',
    'boblox-script.com',
    'hydrogen.lat',
    'mobile.codex.lol',
    'delta-executor.com',
    'vegax.gg',
    'ad-link.link'
  ]

  const ICON_URL = 'https://i.ibb.co/p6Qjk6gP/BFB1896-C-9-FA4-4429-881-A-38074322-DFCB.png'
  const LOOTLINK_UI_ICON = 'https://i.ibb.co/s0yg2cv/AA1-D3-E03-2205-4572-ACFB-29-B8-B9-DDE381.png'

  function injectAPIUI() {
    if (document.getElementById('vortixWorldOverlay')) return

    if (!document.getElementById('vortixWorldStyles')) {
      const style = document.createElement('style')
      style.id = 'vortixWorldStyles'
      style.textContent = `
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
      document.head.appendChild(style)
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
          <img src="${LOOTLINK_UI_ICON}" class="vw-icon-img" alt="VortixWorld" onerror="this.onerror=null;this.src='${ICON_URL}'">
          <div class="vw-spinner" id="vwSpinner"></div>
          <div id="vwStatus" class="vw-status">Initializing...</div>
          <div id="vwSubStatus" class="vw-substatus">Waiting for API...</div>
        </div>
      </div>
    `
    document.body.appendChild(wrapper.firstElementChild)
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'
  }

  function updateAPIStatus(main, sub) {
    const overlay = document.getElementById('vortixWorldOverlay')
    if (!overlay) injectAPIUI()
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

  function showAPIResult(finalUrl, timeLabel) {
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
        navigator.clipboard.writeText(finalUrl)
        showAPIToast('URL copied to clipboard')
      })
    }
    if (proceedBtn) {
      proceedBtn.addEventListener('click', () => {
        location.href = finalUrl
      })
    }
  }

  function showAPIError(message) {
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
      <div id="vwStatus" class="vw-status">❌ Bypass Failed</div>
      <div id="vwSubStatus" class="vw-substatus">${escapeHtml(message)}</div>
      <div class="vw-button-group">
        <button id="vwRetryBtn" class="vw-btn">🔄 Retry</button>
        <button id="vwCloseBtn" class="vw-btn">✖️ Close</button>
      </div>
    `

    const retryBtn = document.getElementById('vwRetryBtn')
    const closeBtn = document.getElementById('vwCloseBtn')
    if (retryBtn) {
      retryBtn.addEventListener('click', () => {
        runApiBypass()
      })
    }
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        document.getElementById('vortixWorldOverlay')?.remove()
        document.body.style.overflow = ''
        document.documentElement.style.overflow = ''
      })
    }
  }

  function showAPIToast(message, isError = false) {
    const toast = document.createElement('div')
    toast.className = 'vw-toast' + (isError ? ' error' : '')
    toast.textContent = message
    document.body.appendChild(toast)
    setTimeout(() => toast.remove(), 3500)
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>]/g, function(m) {
      if (m === '&') return '&amp;'
      if (m === '<') return '&lt;'
      if (m === '>') return '&gt;'
      return m
    }).replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, function(c) { return c })
  }

  async function runApiBypass() {
    const startTime = Date.now()
    injectAPIUI()
    updateAPIStatus('⏳ Bypassing...', 'Contacting bypass.tools API')

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY
        },
        body: JSON.stringify({
          url: location.href,
          refresh: false
        })
      })

      const data = await response.json()

      if (data.status === 'success') {
        const finalUrl = data.result
        const duration = ((Date.now() - startTime) / 1000).toFixed(2)
        showAPIResult(finalUrl, duration)
        showAPIToast(`✅ Bypassed in ${duration}s`)
      } else {
        throw new Error(data.message || 'Unknown API error')
      }
    } catch (error) {
      console.error('API bypass error:', error)
      showAPIError(error.message)
      showAPIToast(`❌ Bypass failed: ${error.message}`, true)
    }
  }

  window.VW_API_BYPASS = {
    hosts: API_BYPASS_HOSTS,
    run: runApiBypass
  }
})()