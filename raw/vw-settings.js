;(function () {
  'use strict'

  if (window.top !== window.self) return

  const VW_SETTINGS_ID = 'vw-settings-shadow-host'

  const SETTINGS_CSS = `
*{margin:0;padding:0;box-sizing:border-box;}
:host{all:initial;position:fixed !important;bottom:14px !important;left:14px !important;z-index:2147483647 !important;pointer-events:none !important;}
.vw-gear-btn{position:fixed !important;bottom:0 !important;left:0 !important;z-index:2147483647 !important;width:48px !important;height:48px !important;border-radius:12px !important;border:1px solid rgba(255,255,255,0.18) !important;background:linear-gradient(135deg,#000000,#071033,#1e2be8) !important;box-shadow:0 8px 32px rgba(0,0,0,0.6) !important;color:#cfd6e6 !important;font-size:22px !important;display:flex !important;align-items:center !important;justify-content:center !important;cursor:pointer !important;user-select:none !important;transition:transform 0.2s,box-shadow 0.2s !important;pointer-events:auto !important;font-family:system-ui,-apple-system,'Segoe UI',Roboto,Arial,sans-serif !important;}
.vw-gear-btn:hover{transform:translateY(-2px) scale(1.05) !important;box-shadow:0 12px 40px rgba(30,43,232,0.4) !important;}
.vw-backdrop{position:fixed !important;top:0 !important;left:0 !important;right:0 !important;bottom:0 !important;width:100vw !important;height:100vh !important;background:rgba(0,0,0,0.85) !important;z-index:2147483647 !important;display:none !important;align-items:center !important;justify-content:center !important;backdrop-filter:blur(8px) !important;pointer-events:auto !important;}
.vw-backdrop.open{display:flex !important;}
.vw-panel{width:90% !important;max-width:480px !important;border-radius:24px !important;border:1px solid rgba(255,255,255,0.2) !important;background:rgba(20,30,50,0.7) !important;backdrop-filter:blur(12px) !important;box-shadow:0 20px 40px rgba(0,0,0,0.4) !important;color:#fff !important;font-family:system-ui,-apple-system,'Segoe UI',Roboto,Arial,sans-serif !important;overflow:hidden !important;animation:vw-slide-in 0.3s ease-out !important;pointer-events:auto !important;}
@keyframes vw-slide-in{from{opacity:0;transform:translateY(-20px) scale(0.95);}to{opacity:1;transform:translateY(0) scale(1);}}
.vw-header{display:flex !important;align-items:center !important;justify-content:space-between !important;padding:16px 20px !important;border-bottom:1px solid rgba(255,255,255,0.15) !important;}
.vw-title{font-weight:700 !important;font-size:18px !important;display:flex !important;align-items:center !important;gap:12px !important;color:#fff !important;}
.vw-badge{width:36px !important;height:36px !important;border-radius:12px !important;border:1px solid rgba(255,255,255,0.2) !important;background:rgba(255,255,255,0.1) !important;display:flex !important;align-items:center !important;justify-content:center !important;font-weight:700 !important;font-size:12px !important;}
.vw-close-btn{width:36px !important;height:36px !important;border-radius:12px !important;border:1px solid rgba(255,255,255,0.2) !important;background:rgba(0,0,0,0.3) !important;color:#fff !important;cursor:pointer !important;font-size:18px !important;display:flex !important;align-items:center !important;justify-content:center !important;transition:background 0.2s !important;}
.vw-close-btn:hover{background:rgba(255,255,255,0.2) !important;}
.vw-body{padding:16px 20px !important;display:flex !important;flex-direction:column !important;gap:14px !important;max-height:70vh !important;overflow-y:auto !important;}
.vw-row{display:flex !important;align-items:center !important;justify-content:space-between !important;gap:12px !important;padding:12px !important;border-radius:16px !important;border:1px solid rgba(255,255,255,0.1) !important;background:rgba(255,255,255,0.05) !important;}
.vw-label{display:flex !important;flex-direction:column !important;gap:4px !important;flex:1 !important;}
.vw-label-title{font-size:14px !important;font-weight:700 !important;color:#3b82f6 !important;}
.vw-label-desc{font-size:12px !important;color:rgba(255,255,255,0.7) !important;}
.vw-input{width:96px !important;background:rgba(0,0,0,0.3) !important;border:1px solid rgba(255,255,255,0.2) !important;color:#fff !important;border-radius:8px !important;padding:8px 10px !important;text-align:center !important;font-weight:600 !important;font-size:14px !important;outline:none !important;flex-shrink:0 !important;}
.vw-input:focus{border-color:#3b82f6 !important;box-shadow:0 0 0 2px rgba(59,130,246,0.3) !important;}
.vw-actions{display:flex !important;align-items:center !important;justify-content:flex-end !important;gap:10px !important;padding-top:6px !important;}
.vw-btn{padding:10px 16px !important;border-radius:40px !important;border:1px solid rgba(255,255,255,0.2) !important;background:rgba(0,0,0,0.3) !important;color:#fff !important;font-weight:600 !important;font-size:13px !important;cursor:pointer !important;transition:all 0.2s !important;}
.vw-btn:hover{background:rgba(255,255,255,0.1) !important;transform:translateY(-1px) !important;}
.vw-btn-primary{background:#3b82f6 !important;border:none !important;}
.vw-btn-primary:hover{background:#2563eb !important;}
.vw-log-entry{padding:8px 12px;border-bottom:1px solid rgba(255,255,255,0.1);font-size:12px;font-family:monospace;white-space:pre-wrap;word-break:break-word;color:#e2e8f0;}
.vw-log-time{color:#94a3b8;margin-right:8px;}
.vw-log-level-info{color:#22c55e;}
.vw-log-level-warn{color:#f59e0b;}
.vw-log-level-error{color:#ef4444;}
.vw-log-message{color:#fff;}
`

  const keys = {
    redirectWaitTime: 'vw_redirect_wait_time',
    luarmorWaitTime: 'vw_luarmor_wait_time'
  }

  function hasGM() {
    return typeof GM_getValue === 'function' && typeof GM_setValue === 'function'
  }

  function getStoredValue(key, defaultValue) {
    if (hasGM()) {
      try {
        return GM_getValue(key, defaultValue)
      } catch (_) {}
    }
    const lsValue = localStorage.getItem(key)
    if (lsValue === null) return defaultValue
    if (typeof defaultValue === 'boolean') return lsValue === 'true'
    if (typeof defaultValue === 'number') {
      const n = parseInt(lsValue, 10)
      return Number.isFinite(n) ? n : defaultValue
    }
    return lsValue
  }

  function setStoredValue(key, value) {
    if (hasGM()) {
      try {
        GM_setValue(key, value)
      } catch (_) {}
    }
    localStorage.setItem(key, String(value))
  }

  function clampInt(value, min, max, def) {
    const n = parseInt(String(value), 10)
    if (!Number.isFinite(n)) return def
    return Math.min(max, Math.max(min, n))
  }

  function formatTime(timestamp) {
    const date = new Date(timestamp)
    return `${date.getHours().toString().padStart(2,'0')}:${date.getMinutes().toString().padStart(2,'0')}:${date.getSeconds().toString().padStart(2,'0')}`
  }

  function createConsolePanel(shadow, closePanel) {
    const panel = shadow.querySelector('.vw-panel')
    const header = panel.querySelector('.vw-header')
    const body = panel.querySelector('.vw-body')
    const logs = window.__vw_logs || []
    body.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
        <div class="vw-label-title">Console Logs</div>
        <div>
          <button id="vwConsoleRefresh" class="vw-btn" style="padding:4px 12px; margin-right:8px;">↻</button>
          <button id="vwConsoleClear" class="vw-btn" style="padding:4px 12px;">Clear</button>
        </div>
      </div>
      <div id="vwLogList" style="max-height:400px; overflow-y:auto;">
        ${logs.slice().reverse().map(log => `
          <div class="vw-log-entry">
            <span class="vw-log-time">${formatTime(log.timestamp)}</span>
            <span class="vw-log-level-${log.level}">[${log.level.toUpperCase()}]</span>
            <span class="vw-log-message"> ${log.message} ${log.details ? '- '+log.details : ''}</span>
          </div>
        `).join('')}
      </div>
    `
    header.innerHTML = `
      <div class="vw-title"><div class="vw-badge">📋</div><span>Console</span></div>
      <button class="vw-close-btn" id="vwBackBtn" type="button">←</button>
    `
    const backBtn = header.querySelector('#vwBackBtn')
    backBtn.addEventListener('click', () => {
      closePanel()
      createSettingsUI(shadow, closePanel)
    })
    const refreshBtn = body.querySelector('#vwConsoleRefresh')
    const clearBtn = body.querySelector('#vwConsoleClear')
    if (refreshBtn) refreshBtn.addEventListener('click', () => createConsolePanel(shadow, closePanel))
    if (clearBtn) clearBtn.addEventListener('click', () => {
      window.__vw_logs = []
      createConsolePanel(shadow, closePanel)
    })
  }

  function createSettingsUI(shadow, closePanel) {
    const panel = shadow.querySelector('.vw-panel')
    const header = panel.querySelector('.vw-header')
    const body = panel.querySelector('.vw-body')
    body.innerHTML = `
      <div class="vw-row">
        <div class="vw-label">
          <div class="vw-label-title">Redirect Wait Time</div>
          <div class="vw-label-desc">Delay before redirecting to bypass site (0-60)</div>
        </div>
        <input type="number" class="vw-input" id="vwWaitTimeInput" min="0" max="60">
      </div>
      <div class="vw-row">
        <div class="vw-label">
          <div class="vw-label-title">Luarmor Next Wait</div>
          <div class="vw-label-desc">Delay before enabling Next (0-120)</div>
        </div>
        <input type="number" class="vw-input" id="vwLuarmorWaitTimeInput" min="0" max="120">
      </div>
      <div class="vw-actions">
        <button class="vw-btn" id="vwConsoleBtn" type="button">📋 Console</button>
        <button class="vw-btn" id="vwReloadBtn" type="button">Reload Page</button>
        <button class="vw-btn vw-btn-primary" id="vwApplyBtn" type="button">Apply & Save</button>
      </div>
    `
    header.innerHTML = `
      <div class="vw-title"><div class="vw-badge">⚙️</div><span>Settings</span></div>
      <button class="vw-close-btn" id="vwCloseBtn" type="button">✕</button>
    `
    const closeBtn = header.querySelector('#vwCloseBtn')
    closeBtn.addEventListener('click', () => closePanel())

    const waitTimeInput = body.querySelector('#vwWaitTimeInput')
    const luarmorWaitTimeInput = body.querySelector('#vwLuarmorWaitTimeInput')
    const applyBtn = body.querySelector('#vwApplyBtn')
    const reloadBtn = body.querySelector('#vwReloadBtn')
    const consoleBtn = body.querySelector('#vwConsoleBtn')

    waitTimeInput.value = String(clampInt(getStoredValue(keys.redirectWaitTime, 5), 0, 60, 5))
    luarmorWaitTimeInput.value = String(clampInt(getStoredValue(keys.luarmorWaitTime, 20), 0, 120, 20))

    applyBtn.addEventListener('click', (e) => {
      e.preventDefault()
      const newWaitTime = clampInt(waitTimeInput.value, 0, 60, 5)
      const newLuarmorWaitTime = clampInt(luarmorWaitTimeInput.value, 0, 120, 20)
      setStoredValue(keys.redirectWaitTime, newWaitTime)
      setStoredValue(keys.luarmorWaitTime, newLuarmorWaitTime)
      if (window.VW_CONFIG) {
        window.VW_CONFIG.redirectWaitTime = newWaitTime
        window.VW_CONFIG.luarmorWaitTime = newLuarmorWaitTime
      }
      showToast(shadow, hasGM() ? '✓ Settings saved globally!' : '✓ Settings saved (localStorage)!')
      closePanel()
    })

    reloadBtn.addEventListener('click', () => location.reload())
    consoleBtn.addEventListener('click', () => createConsolePanel(shadow, closePanel))
  }

  function showToast(shadowRoot, message) {
    const existingToast = shadowRoot.querySelector('.vw-toast')
    if (existingToast) existingToast.remove()
    const toast = document.createElement('div')
    toast.className = 'vw-toast'
    toast.textContent = message
    shadowRoot.appendChild(toast)
    setTimeout(() => {
      try { toast.remove() } catch (_) {}
    }, 2500)
  }

  function createUI() {
    const existing = document.getElementById(VW_SETTINGS_ID)
    if (existing) existing.remove()

    const host = document.createElement('div')
    host.id = VW_SETTINGS_ID
    host.style.cssText = 'all: initial !important; position: fixed !important; bottom: 14px !important; left: 14px !important; width: 48px !important; height: 48px !important; z-index: 2147483647 !important; pointer-events: none !important; isolation: isolate !important;'

    const shadow = host.attachShadow({ mode: 'closed' })

    const style = document.createElement('style')
    style.textContent = SETTINGS_CSS
    shadow.appendChild(style)

    const gearBtn = document.createElement('div')
    gearBtn.className = 'vw-gear-btn'
    gearBtn.textContent = '⚙️'
    shadow.appendChild(gearBtn)

    const backdrop = document.createElement('div')
    backdrop.className = 'vw-backdrop'
    backdrop.innerHTML = `
      <div class="vw-panel">
        <div class="vw-header"></div>
        <div class="vw-body"></div>
      </div>
    `
    shadow.appendChild(backdrop)

    function openPanel() {
      createSettingsUI(shadow, () => backdrop.classList.remove('open'))
      backdrop.classList.add('open')
    }

    function closePanel() {
      backdrop.classList.remove('open')
    }

    gearBtn.addEventListener('click', (e) => {
      e.preventDefault()
      e.stopPropagation()
      openPanel()
    })

    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) closePanel()
    })

    document.documentElement.appendChild(host)
  }

  function init() {
    createUI()
    const observer = new MutationObserver(() => {
      if (!document.getElementById(VW_SETTINGS_ID)) createUI()
    })
    observer.observe(document.documentElement, { childList: true, subtree: true })
    setInterval(() => {
      if (!document.getElementById(VW_SETTINGS_ID)) createUI()
    }, 2000)
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init)
  else init()
})()