;(function () {
  'use strict'

  if (window.top !== window.self) return

  const VW_SETTINGS_ID = 'vw-settings-shadow-host'
  const ICON_URL = 'https://i.ibb.co/p6Qjk6gP/BFB1896-C-9-FA4-4429-881-A-38074322-DFCB.png'

  const keys = {
    autoRedirect: 'vw_auto_redirect',
    redirectWaitTime: 'vw_redirect_wait_time',
    luarmorWaitTime: 'vw_luarmor_wait_time'
  }

  const SETTINGS_CSS = `
    :host {
      all: initial;
      position: fixed !important;
      inset: 0 !important;
      z-index: 2147483647 !important;
      pointer-events: none !important;
      isolation: isolate !important;
      contain: layout style paint !important;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    .vw-hidden {
      display: none !important;
    }

    .vw-gear-btn {
      position: fixed !important;
      left: calc(14px + env(safe-area-inset-left)) !important;
      bottom: calc(14px + env(safe-area-inset-bottom)) !important;
      z-index: 2147483647 !important;
      width: 48px !important;
      height: 48px !important;
      border-radius: 24px !important;
      border: 1px solid rgba(59, 130, 246, 0.5) !important;
      background: rgba(15, 23, 42, 0.8) !important;
      backdrop-filter: blur(10px) !important;
      -webkit-backdrop-filter: blur(10px) !important;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4) !important;
      color: #e2e8f0 !important;
      font-size: 22px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      cursor: pointer !important;
      user-select: none !important;
      transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease !important;
      pointer-events: auto !important;
      font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif !important;
      -webkit-tap-highlight-color: transparent !important;
      touch-action: manipulation !important;
    }

    .vw-gear-btn:hover {
      transform: translateY(-2px) scale(1.05) !important;
      box-shadow: 0 12px 40px rgba(59, 130, 246, 0.35) !important;
    }

    .vw-gear-btn:active {
      transform: scale(0.98) !important;
    }

    .vw-backdrop {
      position: fixed !important;
      inset: 0 !important;
      width: 100vw !important;
      height: 100vh !important;
      height: 100dvh !important;
      padding:
        calc(14px + env(safe-area-inset-top))
        calc(14px + env(safe-area-inset-right))
        calc(14px + env(safe-area-inset-bottom))
        calc(14px + env(safe-area-inset-left)) !important;
      background: rgba(0, 0, 0, 0.78) !important;
      z-index: 2147483647 !important;
      display: none !important;
      align-items: center !important;
      justify-content: center !important;
      flex-direction: column !important;
      gap: 16px !important;
      overflow: auto !important;
      overscroll-behavior: contain !important;
      -webkit-overflow-scrolling: touch !important;
      backdrop-filter: blur(12px) !important;
      -webkit-backdrop-filter: blur(12px) !important;
      pointer-events: auto !important;
    }

    .vw-backdrop.open {
      display: flex !important;
    }

    .vw-panel {
      width: min(520px, calc(100vw - 28px)) !important;
      max-width: 100% !important;
      max-height: min(720px, calc(100vh - 28px), calc(100dvh - 28px)) !important;
      border-radius: 28px !important;
      border: 1px solid rgba(59, 130, 246, 0.4) !important;
      background: rgba(15, 23, 42, 0.93) !important;
      backdrop-filter: blur(14px) !important;
      -webkit-backdrop-filter: blur(14px) !important;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.55) !important;
      color: #e2e8f0 !important;
      font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif !important;
      overflow: hidden !important;
      animation: vw-slide-in 0.22s ease-out !important;
      pointer-events: auto !important;
      display: flex !important;
      flex-direction: column !important;
      min-width: 0 !important;
    }

    @keyframes vw-slide-in {
      from {
        opacity: 0;
        transform: translateY(12px) scale(0.98);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    .vw-header {
      display: flex !important;
      align-items: center !important;
      justify-content: space-between !important;
      gap: 12px !important;
      padding: 16px 18px !important;
      border-bottom: 1px solid rgba(59, 130, 246, 0.28) !important;
      background: rgba(0, 0, 0, 0.25) !important;
      flex: 0 0 auto !important;
      min-width: 0 !important;
    }

    .vw-title {
      font-weight: 900 !important;
      font-size: 18px !important;
      display: flex !important;
      align-items: center !important;
      gap: 12px !important;
      color: #3b82f6 !important;
      min-width: 0 !important;
    }

    .vw-title img {
      width: 32px !important;
      height: 32px !important;
      border-radius: 12px !important;
      border: 1px solid rgba(59, 130, 246, 0.5) !important;
      object-fit: cover !important;
    }

    .vw-title span {
      min-width: 0 !important;
      overflow: hidden !important;
      text-overflow: ellipsis !important;
      white-space: nowrap !important;
    }

    .vw-close-btn {
      width: 36px !important;
      height: 36px !important;
      border-radius: 12px !important;
      border: 1px solid rgba(59, 130, 246, 0.5) !important;
      background: rgba(0, 0, 0, 0.28) !important;
      color: #e2e8f0 !important;
      cursor: pointer !important;
      font-size: 18px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      transition: all 0.2s ease !important;
      font-family: inherit !important;
      flex: 0 0 auto !important;
      -webkit-tap-highlight-color: transparent !important;
      touch-action: manipulation !important;
    }

    .vw-close-btn:hover {
      background: #3b82f6 !important;
      border-color: #3b82f6 !important;
    }

    .vw-body {
      padding: 16px 18px 18px !important;
      display: flex !important;
      flex-direction: column !important;
      gap: 14px !important;
      flex: 1 1 auto !important;
      min-height: 0 !important;
      overflow: auto !important;
      -webkit-overflow-scrolling: touch !important;
    }

    .vw-row {
      display: grid !important;
      grid-template-columns: minmax(0, 1fr) 96px !important;
      align-items: center !important;
      gap: 12px !important;
      padding: 14px !important;
      border-radius: 20px !important;
      border: 1px solid rgba(59, 130, 246, 0.2) !important;
      background: rgba(0, 0, 0, 0.18) !important;
      min-width: 0 !important;
    }

    .vw-row-toggle {
      grid-template-columns: minmax(0, 1fr) auto !important;
    }

    .vw-label {
      display: flex !important;
      flex-direction: column !important;
      gap: 4px !important;
      min-width: 0 !important;
    }

    .vw-label-title {
      font-size: 14px !important;
      font-weight: 900 !important;
      color: #3b82f6 !important;
      line-height: 1.2 !important;
      word-break: break-word !important;
    }

    .vw-label-desc {
      font-size: 12px !important;
      color: #94a3b8 !important;
      font-weight: 500 !important;
      line-height: 1.35 !important;
      word-break: break-word !important;
    }

    .vw-input {
      width: 96px !important;
      max-width: 100% !important;
      background: rgba(0, 0, 0, 0.5) !important;
      border: 1px solid rgba(59, 130, 246, 0.25) !important;
      color: #e2e8f0 !important;
      border-radius: 20px !important;
      padding: 9px 12px !important;
      text-align: center !important;
      font-weight: 700 !important;
      font-size: 14px !important;
      outline: none !important;
      flex-shrink: 0 !important;
      font-family: inherit !important;
      -moz-appearance: textfield !important;
      appearance: textfield !important;
      min-width: 0 !important;
    }

    .vw-input::-webkit-outer-spin-button,
    .vw-input::-webkit-inner-spin-button {
      -webkit-appearance: none !important;
      margin: 0 !important;
    }

    .vw-input:focus {
      border-color: #3b82f6 !important;
      box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.25) !important;
    }

    .vw-toggle {
      position: relative !important;
      display: inline-block !important;
      width: 48px !important;
      height: 24px !important;
    }

    .vw-toggle input {
      opacity: 0 !important;
      width: 100% !important;
      height: 100% !important;
      position: absolute !important;
      top: 0 !important;
      left: 0 !important;
      cursor: pointer !important;
      z-index: 1 !important;
      margin: 0 !important;
    }

    .vw-toggle-slider {
      position: absolute !important;
      top: 0 !important;
      left: 0 !important;
      right: 0 !important;
      bottom: 0 !important;
      background-color: #334155 !important;
      transition: 0.25s !important;
      border-radius: 999px !important;
      pointer-events: none !important;
    }

    .vw-toggle-slider:before {
      position: absolute !important;
      content: "" !important;
      height: 18px !important;
      width: 18px !important;
      left: 3px !important;
      bottom: 3px !important;
      background-color: #3b82f6 !important;
      transition: 0.25s !important;
      border-radius: 50% !important;
    }

    input:checked + .vw-toggle-slider {
      background-color: #3b82f6 !important;
    }

    input:checked + .vw-toggle-slider:before {
      transform: translateX(24px) !important;
    }

    .vw-actions {
      display: flex !important;
      align-items: center !important;
      justify-content: flex-end !important;
      gap: 10px !important;
      padding-top: 6px !important;
      flex-wrap: wrap !important;
    }

    .vw-btn {
      padding: 10px 16px !important;
      border-radius: 40px !important;
      border: 1px solid rgba(59, 130, 246, 0.5) !important;
      background: rgba(0, 0, 0, 0.28) !important;
      color: #e2e8f0 !important;
      font-weight: 700 !important;
      font-size: 13px !important;
      cursor: pointer !important;
      transition: all 0.2s ease !important;
      font-family: inherit !important;
      -webkit-tap-highlight-color: transparent !important;
      touch-action: manipulation !important;
      min-width: 0 !important;
    }

    .vw-btn:hover {
      background: #3b82f6 !important;
      border-color: #3b82f6 !important;
      transform: translateY(-1px) !important;
    }

    .vw-btn:active {
      transform: translateY(0) scale(0.99) !important;
    }

    .vw-btn-primary {
      background: linear-gradient(135deg, #3b82f6, #2563eb) !important;
      border: none !important;
    }

    .vw-btn-primary:hover {
      background: linear-gradient(135deg, #2563eb, #1d4ed8) !important;
    }

    .vw-toast {
      position: fixed !important;
      top: calc(72px + 12px) !important;
      right: calc(14px + env(safe-area-inset-right)) !important;
      padding: 10px 18px !important;
      border-radius: 40px !important;
      background: rgba(15, 23, 42, 0.92) !important;
      backdrop-filter: blur(8px) !important;
      -webkit-backdrop-filter: blur(8px) !important;
      color: #e2e8f0 !important;
      font-weight: 700 !important;
      font-size: 13px !important;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5) !important;
      animation: vw-toast-in 0.22s ease-out !important;
      z-index: 2147483647 !important;
      pointer-events: none !important;
      font-family: inherit !important;
      max-width: calc(100vw - 28px) !important;
      word-break: break-word !important;
      border-left: 4px solid #3b82f6 !important;
    }

    @keyframes vw-toast-in {
      from {
        opacity: 0;
        transform: translateY(-8px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @media (max-width: 768px) {
      .vw-toast {
        top: calc(60px + 12px) !important;
      }
    }

    .vw-tabs {
      display: flex !important;
      gap: 8px !important;
      margin-bottom: 12px !important;
      border-bottom: 1px solid rgba(59, 130, 246, 0.3) !important;
      padding-bottom: 8px !important;
    }

    .vw-tab {
      background: transparent !important;
      border: none !important;
      color: #94a3b8 !important;
      font-weight: 600 !important;
      font-size: 12px !important;
      padding: 6px 12px !important;
      border-radius: 20px !important;
      cursor: pointer !important;
      transition: all 0.2s !important;
    }

    .vw-tab.active {
      background: #3b82f6 !important;
      color: white !important;
    }

    .vw-console {
      flex: 1 1 auto !important;
      min-height: 0 !important;
      overflow-y: auto !important;
      background: rgba(0, 0, 0, 0.4) !important;
      border-radius: 20px !important;
      padding: 12px !important;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace !important;
      font-size: 12px !important;
      border: 1px solid rgba(59, 130, 246, 0.25) !important;
      white-space: normal !important;
      min-width: 0 !important;
    }

    .vw-log-entry {
      padding: 8px 12px !important;
      border-bottom: 1px solid rgba(59, 130, 246, 0.16) !important;
      white-space: pre-wrap !important;
      word-break: break-word !important;
    }

    .vw-log-level-info {
      color: #22c55e !important;
    }

    .vw-log-level-warn {
      color: #f97316 !important;
    }

    .vw-log-level-error {
      color: #ef4444 !important;
    }

    .vw-log-message {
      color: #e2e8f0 !important;
    }

    @media (max-width: 560px) {
      .vw-panel {
        width: calc(100vw - 20px) !important;
        max-height: calc(100vh - 20px) !important;
        max-height: calc(100dvh - 20px) !important;
        border-radius: 22px !important;
      }

      .vw-header {
        padding: 14px 14px !important;
      }

      .vw-body {
        padding: 14px !important;
      }

      .vw-row {
        grid-template-columns: 1fr !important;
      }

      .vw-input {
        width: 100% !important;
      }

      .vw-actions {
        justify-content: stretch !important;
      }

      .vw-btn {
        flex: 1 1 140px !important;
      }

      .vw-title {
        font-size: 16px !important;
      }
    }

    @media (max-width: 360px) {
      .vw-panel {
        width: calc(100vw - 14px) !important;
        max-height: calc(100vh - 14px) !important;
        max-height: calc(100dvh - 14px) !important;
      }

      .vw-header,
      .vw-body {
        padding-left: 12px !important;
        padding-right: 12px !important;
      }

      .vw-btn {
        flex-basis: 100% !important;
      }
    }
  `

  function hasGM() {
    return typeof GM_getValue === 'function' && typeof GM_setValue === 'function'
  }

  function getStoredValue(key, defaultValue) {
    if (hasGM()) {
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

  function setStoredValue(key, value) {
    if (hasGM()) {
      try {
        GM_setValue(key, value)
      } catch (_) {}
    }

    try {
      localStorage.setItem(key, String(value))
    } catch (_) {}
  }

  function clampInt(value, min, max, def) {
    const n = parseInt(String(value), 10)
    if (!Number.isFinite(n)) return def
    return Math.min(max, Math.max(min, n))
  }

  function escapeHtml(str) {
    if (str === null || str === undefined) return ''
    return String(str).replace(/[&<>]/g, (m) => {
      if (m === '&') return '&amp;'
      if (m === '<') return '&lt;'
      if (m === '>') return '&gt;'
      return m
    })
  }

  function createSettingsUI() {
    const existing = document.getElementById(VW_SETTINGS_ID)
    if (existing) existing.remove()

    const host = document.createElement('div')
    host.id = VW_SETTINGS_ID
    host.style.cssText = 'all: initial !important; position: fixed !important; inset: 0 !important; z-index: 2147483647 !important; pointer-events: none !important; isolation: isolate !important; contain: layout style paint !important;'

    const shadow = host.attachShadow({ mode: 'closed' })

    const style = document.createElement('style')
    style.textContent = SETTINGS_CSS
    shadow.appendChild(style)

    const gearBtn = document.createElement('button')
    gearBtn.type = 'button'
    gearBtn.className = 'vw-gear-btn'
    gearBtn.textContent = '⚙️'
    gearBtn.setAttribute('aria-label', 'Open settings')
    shadow.appendChild(gearBtn)

    const backdrop = document.createElement('div')
    backdrop.className = 'vw-backdrop'
    backdrop.innerHTML = `
      <div class="vw-panel" id="vwSettingsPanel" role="dialog" aria-modal="true" aria-label="VW Settings">
        <div class="vw-header">
          <div class="vw-title">
            <img src="${ICON_URL}" alt="VW Icon">
            <span>Settings</span>
          </div>
          <button class="vw-close-btn" type="button" aria-label="Close settings">✕</button>
        </div>
        <div class="vw-body">
          <div class="vw-row vw-row-toggle">
            <div class="vw-label">
              <div class="vw-label-title">Auto Redirect</div>
              <div class="vw-label-desc">Automatically redirect when bypass is complete</div>
            </div>
            <label class="vw-toggle">
              <input type="checkbox" id="vwAutoToggle">
              <span class="vw-toggle-slider"></span>
            </label>
          </div>

          <div class="vw-row">
            <div class="vw-label">
              <div class="vw-label-title">Redirect Wait Time</div>
              <div class="vw-label-desc">Delay before redirecting to bypass site (0-60)</div>
            </div>
            <input type="number" class="vw-input" id="vwWaitTimeInput" min="0" max="60" inputmode="numeric">
          </div>

          <div class="vw-row">
            <div class="vw-label">
              <div class="vw-label-title">Luarmor Next Wait</div>
              <div class="vw-label-desc">Delay before enabling Next (0-120)</div>
            </div>
            <input type="number" class="vw-input" id="vwLuarmorWaitTimeInput" min="0" max="120" inputmode="numeric">
          </div>

          <div class="vw-actions">
            <button class="vw-btn" id="vwConsoleBtn" type="button">Console</button>
            <button class="vw-btn" id="vwReloadBtn" type="button">Reload Page</button>
            <button class="vw-btn vw-btn-primary" id="vwApplyBtn" type="button">Apply &amp; Save</button>
          </div>
        </div>
      </div>

      <div class="vw-panel vw-hidden" id="vwConsolePanel" role="dialog" aria-modal="true" aria-label="VW Console">
        <div class="vw-header">
          <div class="vw-title">
            <img src="${ICON_URL}" alt="VW Icon">
            <span>Console</span>
          </div>
          <button class="vw-close-btn" type="button" aria-label="Close console">✕</button>
        </div>
        <div class="vw-body">
          <div class="vw-tabs">
            <button class="vw-tab active" data-level="all">All</button>
            <button class="vw-tab" data-level="info">INFO</button>
            <button class="vw-tab" data-level="warn">WARN</button>
            <button class="vw-tab" data-level="error">ERROR</button>
          </div>
          <div class="vw-console" id="vwConsoleLogs"></div>
          <div class="vw-actions">
            <button class="vw-btn" id="vwCopyConsoleBtn" type="button">Copy</button>
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

    const autoToggle = shadow.querySelector('#vwAutoToggle')
    const waitTimeInput = shadow.querySelector('#vwWaitTimeInput')
    const luarmorWaitTimeInput = shadow.querySelector('#vwLuarmorWaitTimeInput')
    const applyBtn = shadow.querySelector('#vwApplyBtn')
    const reloadBtn = shadow.querySelector('#vwReloadBtn')
    const consoleBtn = shadow.querySelector('#vwConsoleBtn')
    const copyConsoleBtn = shadow.querySelector('#vwCopyConsoleBtn')
    const clearConsoleBtn = shadow.querySelector('#vwClearConsoleBtn')
    const backToSettingsBtn = shadow.querySelector('#vwBackToSettingsBtn')
    const tabs = shadow.querySelectorAll('.vw-tab')
    const consoleContainer = shadow.querySelector('#vwConsoleLogs')

    let previousBodyOverflow = ''
    let previousHtmlOverflow = ''
    let currentFilter = 'all'

    function setScrollLock(locked) {
      try {
        if (locked) {
          previousBodyOverflow = document.body ? document.body.style.overflow : ''
          previousHtmlOverflow = document.documentElement ? document.documentElement.style.overflow : ''
          if (document.body) document.body.style.overflow = 'hidden'
          if (document.documentElement) document.documentElement.style.overflow = 'hidden'
        } else {
          if (document.body) document.body.style.overflow = previousBodyOverflow
          if (document.documentElement) document.documentElement.style.overflow = previousHtmlOverflow
        }
      } catch (_) {}
    }

    function setVisible(el, visible) {
      if (!el) return
      if (visible) {
        el.classList.remove('vw-hidden')
        el.style.setProperty('display', 'flex', 'important')
      } else {
        el.classList.add('vw-hidden')
        el.style.setProperty('display', 'none', 'important')
      }
    }

    function getFilteredLogs() {
      const logs = window.__vw_logs || []
      if (currentFilter === 'all') return logs
      return logs.filter(log => log.level === currentFilter)
    }

    function renderConsoleLogs() {
      if (!consoleContainer) return

      const logs = getFilteredLogs()
      consoleContainer.innerHTML = logs
        .map((log) => {
          const level = (log.level || 'info').toUpperCase()
          const message = escapeHtml(log.message)
          const data = log.data ? ` ${escapeHtml(log.data)}` : ''
          return `<div class="vw-log-entry"><span class="vw-log-level-${log.level || 'info'}">[${level}]</span> <span class="vw-log-message">[VortixWorld] ${message}${data}</span></div>`
        })
        .join('')

      consoleContainer.scrollTop = consoleContainer.scrollHeight
    }

    function copyAllLogs() {
      const logs = getFilteredLogs()
      const text = logs.map(log => `[${log.level.toUpperCase()}] [VortixWorld] ${log.message}${log.data ? ' ' + log.data : ''}`).join('\n')
      navigator.clipboard.writeText(text).then(() => {
        showToast('Copied to clipboard')
      }).catch(() => {
        showToast('Failed to copy', true)
      })
    }

    let refreshInterval = null
    function startAutoRefresh() {
      if (refreshInterval) clearInterval(refreshInterval)
      refreshInterval = setInterval(() => {
        if (consolePanel && consolePanel.classList.contains('vw-hidden') === false) {
          renderConsoleLogs()
        }
      }, 500)
    }

    function stopAutoRefresh() {
      if (refreshInterval) {
        clearInterval(refreshInterval)
        refreshInterval = null
      }
    }

    function showToast(message, isError = false) {
      const existingToast = shadow.querySelector('.vw-toast')
      if (existingToast) existingToast.remove()

      const toast = document.createElement('div')
      toast.className = 'vw-toast'
      if (isError) toast.style.borderLeftColor = '#ef4444'
      toast.textContent = message
      shadow.appendChild(toast)

      setTimeout(() => {
        try {
          toast.remove()
        } catch (_) {}
      }, 2500)
    }

    function openPanel(panel) {
      setVisible(settingsPanel, panel === 'settings')
      setVisible(consolePanel, panel === 'console')
      backdropDiv.classList.add('open')
      setScrollLock(true)

      if (panel === 'console') {
        renderConsoleLogs()
        startAutoRefresh()
      } else {
        stopAutoRefresh()
      }

      const focusTarget = panel === 'console'
        ? shadow.querySelector('#vwCopyConsoleBtn')
        : shadow.querySelector('#vwWaitTimeInput')

      if (focusTarget && typeof focusTarget.focus === 'function') {
        setTimeout(() => {
          try {
            focusTarget.focus({ preventScroll: true })
          } catch (_) {
            try {
              focusTarget.focus()
            } catch (_) {}
          }
        }, 0)
      }
    }

    function closePanel() {
      backdropDiv.classList.remove('open')
      setVisible(settingsPanel, false)
      setVisible(consolePanel, false)
      setScrollLock(false)
      stopAutoRefresh()
    }

    function loadSettings() {
      const auto = getStoredValue(keys.autoRedirect, true)
      autoToggle.checked = auto === true
      waitTimeInput.value = String(clampInt(getStoredValue(keys.redirectWaitTime, 5), 0, 60, 5))
      luarmorWaitTimeInput.value = String(clampInt(getStoredValue(keys.luarmorWaitTime, 20), 0, 120, 20))
    }

    function saveSettings() {
      const newAuto = autoToggle.checked
      const newWaitTime = clampInt(waitTimeInput.value, 0, 60, 5)
      const newLuarmorWaitTime = clampInt(luarmorWaitTimeInput.value, 0, 120, 20)

      setStoredValue(keys.autoRedirect, newAuto)
      setStoredValue(keys.redirectWaitTime, newWaitTime)
      setStoredValue(keys.luarmorWaitTime, newLuarmorWaitTime)

      if (window.VW_CONFIG) {
        window.VW_CONFIG.redirectWaitTime = newWaitTime
        window.VW_CONFIG.luarmorWaitTime = newLuarmorWaitTime
        window.VW_CONFIG.keys = keys
      }

      showToast(hasGM() ? '✓ Settings saved globally!' : '✓ Settings saved (localStorage)!')
    }

    gearBtn.addEventListener('click', (e) => {
      e.preventDefault()
      e.stopPropagation()
      openPanel('settings')
    })

    closeBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault()
        e.stopPropagation()
        closePanel()
      })
    })

    backdropDiv.addEventListener('click', (e) => {
      if (e.target === backdropDiv) closePanel()
    })

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && backdropDiv.classList.contains('open')) closePanel()
    }, true)

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

    copyConsoleBtn.addEventListener('click', (e) => {
      e.preventDefault()
      e.stopPropagation()
      copyAllLogs()
    })

    clearConsoleBtn.addEventListener('click', (e) => {
      e.preventDefault()
      e.stopPropagation()
      window.__vw_logs = []
      renderConsoleLogs()
      showToast('Console cleared')
    })

    backToSettingsBtn.addEventListener('click', (e) => {
      e.preventDefault()
      e.stopPropagation()
      openPanel('settings')
    })

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const level = tab.getAttribute('data-level')
        currentFilter = level === 'all' ? 'all' : level
        tabs.forEach(t => t.classList.remove('active'))
        tab.classList.add('active')
        renderConsoleLogs()
      })
    })

    setVisible(settingsPanel, true)
    setVisible(consolePanel, false)
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

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true })
  } else {
    init()
  }
})()