;(function () {
  'use strict'

  if (window.top !== window.self) return

  const VW_SETTINGS_ID = 'vw-settings-shadow-host'

  const SETTINGS_CSS = `
*{margin:0;padding:0;box-sizing:border-box;}
:host{all:initial;position:fixed !important;bottom:14px !important;left:14px !important;z-index:2147483647 !important;pointer-events:none !important;}
.vw-gear-btn{position:fixed !important;bottom:0 !important;left:0 !important;z-index:2147483647 !important;width:48px !important;height:48px !important;border-radius:12px !important;border:1px solid rgba(255,255,255,0.18) !important;background:linear-gradient(135deg,#000000,#071033,#a855f7) !important;box-shadow:0 8px 32px rgba(0,0,0,0.6) !important;color:#cfd6e6 !important;font-size:22px !important;display:flex !important;align-items:center !important;justify-content:center !important;cursor:pointer !important;user-select:none !important;transition:transform 0.2s,box-shadow 0.2s !important;pointer-events:auto !important;font-family:system-ui,-apple-system,'Segoe UI',Roboto,Arial,sans-serif !important;}
.vw-gear-btn:hover{transform:translateY(-2px) scale(1.05) !important;box-shadow:0 12px 40px rgba(168,85,247,0.4) !important;}
.vw-backdrop{position:fixed !important;top:0 !important;left:0 !important;right:0 !important;bottom:0 !important;width:100vw !important;height:100vh !important;background:rgba(0,0,0,0.85) !important;z-index:2147483647 !important;display:none !important;align-items:center !important;justify-content:center !important;backdrop-filter:blur(8px) !important;pointer-events:auto !important;}
.vw-backdrop.open{display:flex !important;}
.vw-panel{width:90% !important;max-width:480px !important;border-radius:16px !important;border:1px solid rgba(255,255,255,0.14) !important;background:linear-gradient(135deg,#000000 0%,#071033 60%,#a855f7 100%) !important;box-shadow:0 30px 100px rgba(0,0,0,0.8) !important;color:#cfd6e6 !important;font-family:system-ui,-apple-system,'Segoe UI',Roboto,Arial,sans-serif !important;overflow:hidden !important;animation:vw-slide-in 0.3s ease-out !important;pointer-events:auto !important;}
@keyframes vw-slide-in{from{opacity:0;transform:translateY(-20px) scale(0.95);}to{opacity:1;transform:translateY(0) scale(1);}}
.vw-header{display:flex !important;align-items:center !important;justify-content:space-between !important;padding:16px 20px !important;border-bottom:1px solid rgba(255,255,255,0.12) !important;background:rgba(255,255,255,0.04) !important;}
.vw-title{font-weight:900 !important;font-size:18px !important;display:flex !important;align-items:center !important;gap:12px !important;color:#a855f7 !important;}
.vw-badge{width:36px !important;height:36px !important;border-radius:10px !important;border:1px solid rgba(255,255,255,0.14) !important;background:rgba(255,255,255,0.06) !important;display:flex !important;align-items:center !important;justify-content:center !important;font-weight:950 !important;font-size:12px !important;color:#cfd6e6 !important;}
.vw-close-btn{width:36px !important;height:36px !important;border-radius:10px !important;border:1px solid rgba(255,255,255,0.16) !important;background:rgba(0,0,0,0.18) !important;color:#cfd6e6 !important;cursor:pointer !important;font-size:18px !important;display:flex !important;align-items:center !important;justify-content:center !important;transition:background 0.2s !important;font-family:system-ui,-apple-system,'Segoe UI',Roboto,Arial,sans-serif !important;}
.vw-close-btn:hover{background:rgba(255,255,255,0.1) !important;}
.vw-body{padding:16px 20px !important;display:flex !important;flex-direction:column !important;gap:14px !important;}
.vw-row{display:flex !important;align-items:center !important;justify-content:space-between !important;gap:12px !important;padding:14px !important;border-radius:12px !important;border:1px solid rgba(255,255,255,0.12) !important;background:rgba(255,255,255,0.05) !important;}
.vw-label{display:flex !important;flex-direction:column !important;gap:4px !important;flex:1 !important;}
.vw-label-title{font-size:14px !important;font-weight:900 !important;color:#a855f7 !important;}
.vw-label-desc{font-size:12px !important;color:rgba(207,214,230,0.75) !important;font-weight:600 !important;}
.vw-switch{position:relative !important;width:52px !important;height:28px !important;flex-shrink:0 !important;}
.vw-switch input{opacity:0 !important;width:100% !important;height:100% !important;position:absolute !important;top:0 !important;left:0 !important;cursor:pointer !important;z-index:1 !important;margin:0 !important;}
.vw-switch-slider{position:absolute !important;top:0 !important;left:0 !important;right:0 !important;bottom:0 !important;border-radius:999px !important;background:rgba(255,255,255,0.18) !important;transition:0.3s !important;pointer-events:none !important;}
.vw-switch-slider:before{content:"" !important;position:absolute !important;top:4px !important;left:4px !important;width:20px !important;height:20px !important;border-radius:50% !important;background:#cfd6e6 !important;transition:0.3s !important;}
.vw-switch input:checked + .vw-switch-slider{background:linear-gradient(90deg,#0f1b4f,#a855f7) !important;}
.vw-switch input:checked + .vw-switch-slider:before{transform:translateX(24px) !important;}
.vw-input{width:96px !important;background:rgba(0,0,0,0.25) !important;border:1px solid rgba(255,255,255,0.15) !important;color:#fff !important;border-radius:8px !important;padding:8px 10px !important;text-align:center !important;font-weight:800 !important;font-size:14px !important;outline:none !important;flex-shrink:0 !important;font-family:system-ui,-apple-system,'Segoe UI',Roboto,Arial,sans-serif !important;}
.vw-input:focus{border-color:#a855f7 !important;box-shadow:0 0 0 2px rgba(168,85,247,0.3) !important;}
.vw-actions{display:flex !important;align-items:center !important;justify-content:flex-end !important;gap:10px !important;padding-top:6px !important;}
.vw-btn{padding:10px 16px !important;border-radius:10px !important;border:1px solid rgba(255,255,255,0.16) !important;background:rgba(0,0,0,0.18) !important;color:#cfd6e6 !important;font-weight:900 !important;font-size:13px !important;cursor:pointer !important;transition:background 0.2s,transform 0.2s !important;font-family:system-ui,-apple-system,'Segoe UI',Roboto,Arial,sans-serif !important;}
.vw-btn:hover{background:rgba(255,255,255,0.08) !important;transform:translateY(-1px) !important;}
.vw-btn-primary{background:linear-gradient(90deg,#0f1b4f,#a855f7) !important;border:1px solid rgba(255,255,255,0.14) !important;}
.vw-btn-primary:hover{background:linear-gradient(90deg,#1a2a6c,#c084fc) !important;}
.vw-toast{position:fixed !important;bottom:70px !important;left:14px !important;padding:10px 16px !important;border-radius:10px !important;background:linear-gradient(90deg,#0f1b4f,#a855f7) !important;color:#cfd6e6 !important;font-weight:900 !important;font-size:13px !important;box-shadow:0 8px 32px rgba(0,0,0,0.5) !important;animation:vw-toast-in 0.3s ease-out !important;z-index:2147483647 !important;pointer-events:none !important;font-family:system-ui,-apple-system,'Segoe UI',Roboto,Arial,sans-serif !important;}
@keyframes vw-toast-in{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);}}
`

  const keys = {
    lootlinkLocal: 'vw_lootlink_local',
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
      <div class="vw-panel">
        <div class="vw-header">
          <div class="vw-title"><div class="vw-badge">VW</div><span>Settings</span></div>
          <button class="vw-close-btn" type="button">✕</button>
        </div>
        <div class="vw-body">
          <div class="vw-row">
            <div class="vw-label">
              <div class="vw-label-title">LootlinkLocal</div>
              <div class="vw-label-desc">Enable local bypass on Loot* domains</div>
            </div>
            <label class="vw-switch">
              <input type="checkbox" id="vwLootlinkToggle">
              <span class="vw-switch-slider"></span>
            </label>
          </div>

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
            <button class="vw-btn" id="vwReloadBtn" type="button">Reload Page</button>
            <button class="vw-btn vw-btn-primary" id="vwApplyBtn" type="button">Apply & Save</button>
          </div>
        </div>
      </div>
    `
    shadow.appendChild(backdrop)

    const closeBtn = shadow.querySelector('.vw-close-btn')
    const panel = shadow.querySelector('.vw-panel')
    const lootlinkToggle = shadow.querySelector('#vwLootlinkToggle')
    const waitTimeInput = shadow.querySelector('#vwWaitTimeInput')
    const luarmorWaitTimeInput = shadow.querySelector('#vwLuarmorWaitTimeInput')
    const applyBtn = shadow.querySelector('#vwApplyBtn')
    const reloadBtn = shadow.querySelector('#vwReloadBtn')

    function openPanel() {
      lootlinkToggle.checked = !!getStoredValue(keys.lootlinkLocal, true)
      waitTimeInput.value = String(clampInt(getStoredValue(keys.redirectWaitTime, 5), 0, 60, 5))
      luarmorWaitTimeInput.value = String(clampInt(getStoredValue(keys.luarmorWaitTime, 20), 0, 120, 20))
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

    closeBtn.addEventListener('click', (e) => {
      e.preventDefault()
      e.stopPropagation()
      closePanel()
    })

    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) closePanel()
    })

    panel.addEventListener('click', (e) => e.stopPropagation())

    applyBtn.addEventListener('click', (e) => {
      e.preventDefault()
      e.stopPropagation()

      const newLootlink = !!lootlinkToggle.checked
      const newWaitTime = clampInt(waitTimeInput.value, 0, 60, 5)
      const newLuarmorWaitTime = clampInt(luarmorWaitTimeInput.value, 0, 120, 20)

      setStoredValue(keys.lootlinkLocal, newLootlink)
      setStoredValue(keys.redirectWaitTime, newWaitTime)
      setStoredValue(keys.luarmorWaitTime, newLuarmorWaitTime)

      if (window.VW_CONFIG) {
        window.VW_CONFIG.lootlinkLocal = newLootlink
        window.VW_CONFIG.redirectWaitTime = newWaitTime
        window.VW_CONFIG.luarmorWaitTime = newLuarmorWaitTime
      }

      showToast(shadow, hasGM() ? '✓ Settings saved globally!' : '✓ Settings saved (localStorage)!')
      closePanel()
    })

    reloadBtn.addEventListener('click', (e) => {
      e.preventDefault()
      e.stopPropagation()
      location.reload()
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