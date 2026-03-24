;(function () {
  'use strict'

  if (window.top !== window.self) return

  const VW_SETTINGS_ID = 'vw-settings-shadow-host'

  const SETTINGS_CSS = `
*{margin:0;padding:0;box-sizing:border-box;}
:host{all:initial;position:fixed !important;bottom:14px !important;left:14px !important;z-index:2147483647 !important;pointer-events:none !important;}
.vw-gear-btn{position:fixed !important;bottom:0 !important;left:0 !important;z-index:2147483647 !important;width:48px !important;height:48px !important;border-radius:16px !important;border:1px solid rgba(59,130,246,0.4) !important;background:linear-gradient(135deg,#0a0a1f,#0f1235,#1a237e) !important;box-shadow:0 8px 32px rgba(0,0,0,0.6) !important;color:#e2e8f0 !important;font-size:22px !important;display:flex !important;align-items:center !important;justify-content:center !important;cursor:pointer !important;user-select:none !important;transition:transform 0.2s,box-shadow 0.2s !important;pointer-events:auto !important;font-family:'Inter',system-ui,-apple-system,'Segoe UI',Roboto,Arial,sans-serif !important;}
.vw-gear-btn:hover{transform:translateY(-2px) scale(1.05) !important;box-shadow:0 12px 40px rgba(59,130,246,0.4) !important;}
.vw-backdrop{position:fixed !important;top:0 !important;left:0 !important;right:0 !important;bottom:0 !important;width:100vw !important;height:100vh !important;background:rgba(0,0,0,0.85) !important;z-index:2147483647 !important;display:none !important;align-items:center !important;justify-content:center !important;backdrop-filter:blur(8px) !important;pointer-events:auto !important;}
.vw-backdrop.open{display:flex !important;}
.vw-panel{width:90% !important;max-width:520px !important;border-radius:24px !important;border:1px solid rgba(59,130,246,0.4) !important;background:linear-gradient(135deg,#0a0a1f 0%,#0f1235 60%,#1a237e 100%) !important;box-shadow:0 30px 100px rgba(0,0,0,0.8) !important;color:#e2e8f0 !important;font-family:'Inter',system-ui,-apple-system,'Segoe UI',Roboto,Arial,sans-serif !important;overflow:hidden !important;animation:vw-slide-in 0.3s ease-out !important;pointer-events:auto !important;}
@keyframes vw-slide-in{from{opacity:0;transform:translateY(-20px) scale(0.95);}to{opacity:1;transform:translateY(0) scale(1);}}
.vw-header{display:flex !important;align-items:center !important;justify-content:space-between !important;padding:16px 20px !important;border-bottom:1px solid rgba(59,130,246,0.4) !important;background:rgba(10,10,31,0.7) !important;}
.vw-title{font-weight:900 !important;font-size:18px !important;display:flex !important;align-items:center !important;gap:12px !important;color:#3b82f6 !important;}
.vw-badge{width:36px !important;height:36px !important;border-radius:12px !important;border:1px solid rgba(59,130,246,0.4) !important;background:rgba(10,10,31,0.6) !important;display:flex !important;align-items:center !important;justify-content:center !important;font-weight:950 !important;font-size:12px !important;color:#e2e8f0 !important;}
.vw-close-btn{width:36px !important;height:36px !important;border-radius:12px !important;border:1px solid rgba(59,130,246,0.4) !important;background:rgba(0,0,0,0.3) !important;color:#e2e8f0 !important;cursor:pointer !important;font-size:18px !important;display:flex !important;align-items:center !important;justify-content:center !important;transition:background 0.2s !important;font-family:'Inter',system-ui,-apple-system,'Segoe UI',Roboto,Arial,sans-serif !important;}
.vw-close-btn:hover{background:rgba(59,130,246,0.2) !important;}
.vw-body{padding:16px 20px !important;display:flex !important;flex-direction:column !important;gap:14px !important;}
.vw-row{display:flex !important;align-items:center !important;justify-content:space-between !important;gap:12px !important;padding:14px !important;border-radius:16px !important;border:1px solid rgba(59,130,246,0.2) !important;background:rgba(10,10,31,0.4) !important;}
.vw-label{display:flex !important;flex-direction:column !important;gap:4px !important;flex:1 !important;}
.vw-label-title{font-size:14px !important;font-weight:900 !important;color:#3b82f6 !important;}
.vw-label-desc{font-size:12px !important;color:#94a3b8 !important;font-weight:500 !important;}
.vw-input{width:96px !important;background:rgba(0,0,0,0.5) !important;border:1px solid #3b82f640 !important;color:#e2e8f0 !important;border-radius:12px !important;padding:8px 10px !important;text-align:center !important;font-weight:700 !important;font-size:14px !important;outline:none !important;flex-shrink:0 !important;font-family:'Inter',system-ui,-apple-system,'Segoe UI',Roboto,Arial,sans-serif !important;}
.vw-input:focus{border-color:#3b82f6 !important;box-shadow:0 0 0 2px rgba(59,130,246,0.3) !important;}
.vw-actions{display:flex !important;align-items:center !important;justify-content:flex-end !important;gap:10px !important;padding-top:6px !important;}
.vw-btn{padding:10px 16px !important;border-radius:12px !important;border:1px solid rgba(59,130,246,0.4) !important;background:rgba(0,0,0,0.3) !important;color:#e2e8f0 !important;font-weight:700 !important;font-size:13px !important;cursor:pointer !important;transition:background 0.2s,transform 0.2s !important;font-family:'Inter',system-ui,-apple-system,'Segoe UI',Roboto,Arial,sans-serif !important;}
.vw-btn:hover{background:rgba(59,130,246,0.2) !important;transform:translateY(-1px) !important;}
.vw-btn-primary{background:linear-gradient(90deg,#1e293b,#1e293b) !important;border:1px solid #3b82f6 !important;}
.vw-btn-primary:hover{background:linear-gradient(90deg,#2d3a4e,#2d3a4e) !important;}
.vw-toast{position:fixed !important;bottom:70px !important;left:14px !important;padding:10px 16px !important;border-radius:12px !important;background:#1e293b !important;color:#e2e8f0 !important;font-weight:700 !important;font-size:13px !important;box-shadow:0 8px 32px rgba(0,0,0,0.5) !important;animation:vw-toast-in 0.3s ease-out !important;z-index:2147483647 !important;pointer-events:none !important;font-family:'Inter',system-ui,-apple-system,'Segoe UI',Roboto,Arial,sans-serif !important;}
@keyframes vw-toast-in{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);}}

.vw-console{height:400px;max-height:60vh;overflow-y:auto;background:#0a0a1f;border-radius:16px;padding:12px;font-family:monospace;font-size:12px;margin-top:16px;border:1px solid #3b82f640;}
.vw-log-entry{padding:8px 12px;border-bottom:1px solid #1e293b;white-space:pre-wrap;word-break:break-all;}
.vw-log-time{color:#64748b;margin-right:12px;}
.vw-log-level-info{color:#22c55e;}
.vw-log-level-warn{color:#f97316;}
.vw-log-level-error{color:#ef4444;}
.vw-log-message{color:#e2e8f0;}
.vw-log-data{color:#94a3b8;margin-top:4px;font-size:11px;}
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

  function createSettingsUI() {
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
      <div class="vw-panel" id="vwSettingsPanel">
        <div class="vw-header">
          <div class="vw-title"><div class="vw-badge">VW</div><span>Settings</span></div>
          <button class="vw-close-btn" type="button">✕</button>
        </div>
        <div class="vw-body">
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
            <button class="vw-btn" id="vwConsoleBtn" type="button">Console</button>
            <button class="vw-btn" id="vwReloadBtn" type="button">Reload Page</button>
            <button class="vw-btn vw-btn-primary" id="vwApplyBtn" type="button">Apply & Save</button>
          </div>
        </div>
      </div>
      <div class="vw-panel" id="vwConsolePanel" style="display:none;">
        <div class="vw-header">
          <div class="vw-title"><div class="vw-badge">📟</div><span>Console</span></div>
          <button class="vw-close-btn" type="button">✕</button>
        </div>
        <div class="vw-body">
          <div class="vw-console" id="vwConsoleLogs"></div>
          <div class="vw-actions" style="margin-top:12px;">
            <button class="vw-btn" id="vwClearConsoleBtn" type="button">Clear</button>
            <button class="vw-btn vw-btn-primary" id="vwBackToSettingsBtn" type="button">Back to Settings</button>
          </div>
        </div>
      </div>
    `
    shadow.appendChild(backdrop)

    const settingsPanel = shadow.querySelector('#vwSettingsPanel')
    const consolePanel = shadow.querySelector('#vwConsolePanel')
    const closeBtns = shadow.querySelectorAll('.vw-close-btn')
    const backdropDiv = shadow.querySelector('.vw-backdrop')

    function openPanel(panel) {
      settingsPanel.style.display = panel === 'settings' ? 'flex' : 'none'
      consolePanel.style.display = panel === 'console' ? 'flex' : 'none'
      backdropDiv.classList.add('open')
      if (panel === 'console') renderConsoleLogs()
    }

    function closePanel() {
      backdropDiv.classList.remove('open')
      settingsPanel.style.display = 'flex'
      consolePanel.style.display = 'none'
    }

    gearBtn.addEventListener('click', (e) => {
      e.preventDefault()
      e.stopPropagation()
      openPanel('settings')
    })

    closeBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault()
        e.stopPropagation()
        closePanel()
      })
    })

    backdropDiv.addEventListener('click', (e) => {
      if (e.target === backdropDiv) closePanel()
    })

    const waitTimeInput = shadow.querySelector('#vwWaitTimeInput')
    const luarmorWaitTimeInput = shadow.querySelector('#vwLuarmorWaitTimeInput')
    const applyBtn = shadow.querySelector('#vwApplyBtn')
    const reloadBtn = shadow.querySelector('#vwReloadBtn')
    const consoleBtn = shadow.querySelector('#vwConsoleBtn')
    const clearConsoleBtn = shadow.querySelector('#vwClearConsoleBtn')
    const backToSettingsBtn = shadow.querySelector('#vwBackToSettingsBtn')

    function loadSettings() {
      waitTimeInput.value = String(clampInt(getStoredValue(keys.redirectWaitTime, 5), 0, 60, 5))
      luarmorWaitTimeInput.value = String(clampInt(getStoredValue(keys.luarmorWaitTime, 20), 0, 120, 20))
    }

    function saveSettings() {
      const newWaitTime = clampInt(waitTimeInput.value, 0, 60, 5)
      const newLuarmorWaitTime = clampInt(luarmorWaitTimeInput.value, 0, 120, 20)

      setStoredValue(keys.redirectWaitTime, newWaitTime)
      setStoredValue(keys.luarmorWaitTime, newLuarmorWaitTime)

      if (window.VW_CONFIG) {
        window.VW_CONFIG.redirectWaitTime = newWaitTime
        window.VW_CONFIG.luarmorWaitTime = newLuarmorWaitTime
      }

      showToast(shadow, hasGM() ? '✓ Settings saved globally!' : '✓ Settings saved (localStorage)!')
    }

    function renderConsoleLogs() {
      const container = shadow.querySelector('#vwConsoleLogs')
      if (!container) return
      const logs = window.__vw_logs || []
      container.innerHTML = logs.map(log => `
        <div class="vw-log-entry">
          <span class="vw-log-time">[${log.timestamp.slice(11, 19)}]</span>
          <span class="vw-log-level-${log.level}">${log.level.toUpperCase()}</span>
          <span class="vw-log-message"> ${escapeHtml(log.message)}</span>
          ${log.data ? `<div class="vw-log-data">${escapeHtml(log.data)}</div>` : ''}
        </div>
      `).join('')
      container.scrollTop = container.scrollHeight
    }

    function escapeHtml(str) {
      if (!str) return ''
      return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;'
        if (m === '<') return '&lt;'
        if (m === '>') return '&gt;'
        return m
      }).replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, function(c) {
        return c
      })
    }

    applyBtn.addEventListener('click', (e) => {
      e.preventDefault()
      e.stopPropagation()
      saveSettings()
      closePanel()
    })

    reloadBtn.addEventListener('click', (e) => {
      e.preventDefault()
      e.stopPropagation()
      location.reload()
    })

    consoleBtn.addEventListener('click', (e) => {
      e.preventDefault()
      e.stopPropagation()
      renderConsoleLogs()
      openPanel('console')
    })

    clearConsoleBtn.addEventListener('click', (e) => {
      e.preventDefault()
      e.stopPropagation()
      window.__vw_logs = []
      renderConsoleLogs()
      showToast(shadow, 'Console cleared')
    })

    backToSettingsBtn.addEventListener('click', (e) => {
      e.preventDefault()
      e.stopPropagation()
      openPanel('settings')
    })

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

    loadSettings()
    document.documentElement.appendChild(host)
  }

  function init() {
    createSettingsUI()
    const observer = new MutationObserver(() => {
      if (!document.getElementById(VW_SETTINGS_ID)) createSettingsUI()
    })
    observer.observe(document.documentElement, { childList: true, subtree: true })
    setInterval(() => {
      if (!document.getElementById(VW_SETTINGS_ID)) createSettingsUI()
    }, 2000)
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init)
  else init()
})()