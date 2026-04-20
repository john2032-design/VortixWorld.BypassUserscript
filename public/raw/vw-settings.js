;(function () {
  'use strict'

  if (window.top !== window.self) return

  const VW_SETTINGS_ID = 'vw-settings-shadow-host'
  const ICON_URL = 'https://i.postimg.cc/Y2TmKMf8/2180201F-FB5D-4574-9E55-158B4442F02A.png'
  const GEAR_ICON_URL = 'https://i.postimg.cc/KzkvJ3V4/BB752784-A3D8-4E6A-9955-E190A76EBD71.png'
  const API_INFO_URL = 'https://apikey-nine.vercel.app/api/key/info/'

  const keys = {
    autoRedirect: 'vw_auto_redirect'
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
      border: none !important;
      background: #1e1e1e !important;
      box-shadow: 4px 4px 8px #141414, -4px -4px 8px #282828 !important;
      color: #e0e0e0 !important;
      font-size: 22px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      cursor: pointer !important;
      user-select: none !important;
      transition: all 0.2s ease !important;
      pointer-events: auto !important;
      font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif !important;
      -webkit-tap-highlight-color: transparent !important;
      touch-action: manipulation !important;
      padding: 0 !important;
    }

    .vw-gear-btn img {
      width: 28px !important;
      height: 28px !important;
      object-fit: contain !important;
      border-radius: 0 !important;
      display: block !important;
    }

    .vw-gear-btn:hover {
      transform: translateY(-2px) scale(1.02) !important;
      box-shadow: 6px 6px 12px #141414, -6px -6px 12px #282828 !important;
    }

    .vw-gear-btn:active {
      transform: scale(0.98) !important;
      box-shadow: inset 4px 4px 8px #141414, inset -4px -4px 8px #282828 !important;
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
      background: rgba(0, 0, 0, 0.6) !important;
      z-index: 2147483647 !important;
      display: none !important;
      align-items: center !important;
      justify-content: center !important;
      flex-direction: column !important;
      gap: 16px !important;
      overflow: auto !important;
      overscroll-behavior: contain !important;
      -webkit-overflow-scrolling: touch !important;
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
      border: none !important;
      background: #1e1e1e !important;
      box-shadow: 10px 10px 20px #141414, -10px -10px 20px #282828 !important;
      color: #e0e0e0 !important;
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
      border-bottom: none !important;
      box-shadow: 0 4px 8px -4px #141414 !important;
      background: #1e1e1e !important;
      flex: 0 0 auto !important;
      min-width: 0 !important;
    }

    .vw-title {
      font-weight: 800 !important;
      font-size: 18px !important;
      display: flex !important;
      align-items: center !important;
      gap: 12px !important;
      color: #e0e0e0 !important;
      min-width: 0 !important;
    }

    .vw-title img {
      width: 32px !important;
      height: 32px !important;
      border-radius: 12px !important;
      border: none !important;
      box-shadow: 2px 2px 4px #141414, -2px -2px 4px #282828 !important;
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
      border-radius: 50% !important;
      border: none !important;
      background: #1e1e1e !important;
      box-shadow: 3px 3px 6px #141414, -3px -3px 6px #282828 !important;
      color: #aaa !important;
      cursor: pointer !important;
      font-size: 16px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      transition: all 0.2s ease !important;
      font-family: inherit !important;
      flex: 0 0 auto !important;
      -webkit-tap-highlight-color: transparent !important;
      touch-action: manipulation !important;
    }

    .vw-close-btn:active {
      box-shadow: inset 3px 3px 6px #141414, inset -3px -3px 6px #282828 !important;
    }

    .vw-body {
      padding: 16px 18px 18px !important;
      display: flex !important;
      flex-direction: column !important;
      gap: 16px !important;
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
      padding: 16px !important;
      border-radius: 20px !important;
      border: none !important;
      background: #1e1e1e !important;
      box-shadow: inset 4px 4px 8px #141414, inset -4px -4px 8px #282828 !important;
      min-width: 0 !important;
    }

    .vw-row-toggle {
      grid-template-columns: minmax(0, 1fr) auto !important;
    }

    .vw-row-keyinfo {
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
      font-weight: 800 !important;
      color: #e0e0e0 !important;
      line-height: 1.2 !important;
      word-break: break-word !important;
    }

    .vw-label-desc {
      font-size: 12px !important;
      color: #a0a0a0 !important;
      font-weight: 500 !important;
      line-height: 1.35 !important;
      word-break: break-word !important;
    }

    .vw-key-value {
      font-size: 13px !important;
      font-weight: 600 !important;
      padding: 4px 12px !important;
      background: #2a2a2a !important;
      border-radius: 40px !important;
      box-shadow: inset 2px 2px 4px #141414, inset -2px -2px 4px #282828 !important;
      text-align: center !important;
      min-width: 70px !important;
    }

    .vw-key-value.active {
      color: #4ade80 !important;
    }

    .vw-key-value.inactive {
      color: #ef4444 !important;
    }

    .vw-toggle {
      position: relative !important;
      display: inline-block !important;
      width: 50px !important;
      height: 26px !important;
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
      background-color: #1e1e1e !important;
      box-shadow: inset 3px 3px 6px #141414, inset -3px -3px 6px #282828 !important;
      transition: 0.25s !important;
      border-radius: 999px !important;
      pointer-events: none !important;
    }

    .vw-toggle-slider:before {
      position: absolute !important;
      content: "" !important;
      height: 18px !important;
      width: 18px !important;
      left: 4px !important;
      bottom: 4px !important;
      background-color: #ef4444 !important;
      box-shadow: 2px 2px 4px #141414;
      transition: 0.25s !important;
      border-radius: 50% !important;
    }

    input:checked + .vw-toggle-slider:before {
      transform: translateX(24px) !important;
      background-color: #4ade80 !important;
    }

    .vw-actions {
      display: flex !important;
      align-items: center !important;
      justify-content: flex-end !important;
      gap: 12px !important;
      padding-top: 6px !important;
      flex-wrap: wrap !important;
    }

    .vw-btn {
      padding: 10px 18px !important;
      border-radius: 40px !important;
      border: none !important;
      background: #1e1e1e !important;
      box-shadow: 4px 4px 8px #141414, -4px -4px 8px #282828 !important;
      color: #e0e0e0 !important;
      font-weight: 700 !important;
      font-size: 13px !important;
      cursor: pointer !important;
      transition: all 0.2s ease !important;
      font-family: inherit !important;
      -webkit-tap-highlight-color: transparent !important;
      touch-action: manipulation !important;
      min-width: 0 !important;
    }

    .vw-btn:active {
      box-shadow: inset 4px 4px 8px #141414, inset -4px -4px 8px #282828 !important;
      transform: translateY(1px) !important;
    }

    .vw-btn-primary {
      color: #fff !important;
      background: #1e1e1e !important;
    }

    .vw-toast {
      position: fixed !important;
      top: calc(72px + 12px) !important;
      right: calc(14px + env(safe-area-inset-right)) !important;
      padding: 10px 18px !important;
      border-radius: 40px !important;
      background: #1e1e1e !important;
      box-shadow: 6px 6px 12px #141414, -6px -6px 12px #282828 !important;
      color: #e0e0e0 !important;
      font-weight: 700 !important;
      font-size: 13px !important;
      animation: vw-toast-in 0.22s ease-out !important;
      z-index: 2147483647 !important;
      pointer-events: none !important;
      font-family: inherit !important;
      max-width: calc(100vw - 28px) !important;
      word-break: break-word !important;
      border-left: 4px solid #16a34a !important;
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
      gap: 12px !important;
      margin-bottom: 8px !important;
      flex-wrap: wrap !important;
    }

    .vw-tab {
      background: #1e1e1e !important;
      border: none !important;
      color: #a0a0a0 !important;
      font-weight: 600 !important;
      font-size: 12px !important;
      padding: 8px 16px !important;
      border-radius: 40px !important;
      cursor: pointer !important;
      transition: all 0.2s !important;
      box-shadow: 3px 3px 6px #141414, -3px -3px 6px #282828 !important;
    }

    .vw-tab.active {
      box-shadow: inset 3px 3px 6px #141414, inset -3px -3px 6px #282828 !important;
      color: #e0e0e0 !important;
    }

    .vw-console {
      flex: 1 1 auto !important;
      min-height: 0 !important;
      overflow-y: auto !important;
      background: #1e1e1e !important;
      border-radius: 20px !important;
      padding: 16px !important;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace !important;
      font-size: 12px !important;
      border: none !important;
      box-shadow: inset 4px 4px 8px #141414, inset -4px -4px 8px #282828 !important;
      white-space: normal !important;
      min-width: 0 !important;
    }

    .vw-log-entry {
      padding: 8px 0 !important;
      border-bottom: 1px solid #2a2a2a !important;
      white-space: pre-wrap !important;
      word-break: break-word !important;
    }
    
    .vw-log-entry:last-child {
      border-bottom: none !important;
    }

    .vw-log-level-info { color: #4ade80 !important; }
    .vw-log-level-warn { color: #fbbf24 !important; }
    .vw-log-level-error { color: #f87171 !important; }
    .vw-log-level-websocket { color: #c084fc !important; }

    .vw-log-message {
      color: #e0e0e0 !important;
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
    if (key === keys.autoRedirect) {
      if (hasGM()) {
        try {
          const val = GM_getValue(key, defaultValue)
          if (val !== undefined && val !== null) return val
        } catch (_) {}
      }
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
    if (key === keys.autoRedirect) {
      if (hasGM()) {
        try {
          GM_setValue(key, value)
        } catch (_) {}
      }
    }
    try {
      localStorage.setItem(key, String(value))
    } catch (_) {}
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

  function formatExpiration(expiresAt) {
    if (!expiresAt) return 'Unknown'
    if (expiresAt === 2147483647) return 'Never'
    const now = Math.floor(Date.now() / 1000)
    if (expiresAt <= now) return 'Expired'
    const diff = expiresAt - now
    const days = Math.floor(diff / 86400)
    const hours = Math.floor((diff % 86400) / 3600)
    const minutes = Math.floor((diff % 3600) / 60)
    if (days > 0) return `${days}d ${hours}h`
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
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
    gearBtn.setAttribute('aria-label', 'Open settings')
    const gearImg = document.createElement('img')
    gearImg.src = GEAR_ICON_URL
    gearImg.alt = 'Settings'
    gearBtn.appendChild(gearImg)
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
          <div class="vw-row vw-row-keyinfo">
            <div class="vw-label">
              <div class="vw-label-title">API Key Status</div>
              <div class="vw-label-desc" id="vwKeyStatusDesc">Loading...</div>
            </div>
            <span class="vw-key-value" id="vwKeyStatusValue">—</span>
          </div>

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
            <button class="vw-tab" data-level="websocket">WEBSOCKET</button>
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
    const applyBtn = shadow.querySelector('#vwApplyBtn')
    const reloadBtn = shadow.querySelector('#vwReloadBtn')
    const consoleBtn = shadow.querySelector('#vwConsoleBtn')
    const copyConsoleBtn = shadow.querySelector('#vwCopyConsoleBtn')
    const clearConsoleBtn = shadow.querySelector('#vwClearConsoleBtn')
    const backToSettingsBtn = shadow.querySelector('#vwBackToSettingsBtn')
    const tabs = shadow.querySelectorAll('.vw-tab')
    const consoleContainer = shadow.querySelector('#vwConsoleLogs')
    const keyStatusDesc = shadow.querySelector('#vwKeyStatusDesc')
    const keyStatusValue = shadow.querySelector('#vwKeyStatusValue')

    let previousBodyOverflow = ''
    let previousHtmlOverflow = ''
    let currentFilter = 'all'
    let userHasScrolled = false
    let scrollListenerAdded = false

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
      if (currentFilter === 'websocket') {
        return logs.filter(log => log.level === 'websocket')
      }
      return logs.filter(log => log.level === currentFilter)
    }

    function renderConsoleLogs() {
      if (!consoleContainer) return

      const logs = getFilteredLogs()
      const wasAtBottom = consoleContainer.scrollHeight - consoleContainer.scrollTop <= consoleContainer.clientHeight + 10

      consoleContainer.innerHTML = logs
        .map((log) => {
          const level = (log.level || 'info').toUpperCase()
          const message = escapeHtml(log.message)
          const data = log.data ? ` ${escapeHtml(log.data)}` : ''
          const levelClass = log.level === 'websocket' ? 'vw-log-level-websocket' : `vw-log-level-${log.level || 'info'}`
          return `<div class="vw-log-entry"><span class="${levelClass}">[${level}]</span> <span class="vw-log-message">${message}${data}</span></div>`
        })
        .join('')

      if (wasAtBottom && !userHasScrolled) {
        consoleContainer.scrollTop = consoleContainer.scrollHeight
      }
    }

    function copyAllLogs() {
      const logs = getFilteredLogs()
      const text = logs.map(log => `[${log.level.toUpperCase()}] ${log.message}${log.data ? ' ' + log.data : ''}`).join('\n')
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
      if (isError) toast.style.borderLeftColor = '#b91c1c'
      toast.textContent = message
      shadow.appendChild(toast)

      setTimeout(() => {
        try {
          toast.remove()
        } catch (_) {}
      }, 2500)
    }

    async function fetchKeyStatus() {
      const apiKey = window.VW_API_KEY
      if (!apiKey) {
        keyStatusDesc.textContent = 'No API key found'
        keyStatusValue.textContent = '—'
        keyStatusValue.className = 'vw-key-value inactive'
        return
      }

      try {
        const response = await fetch(API_INFO_URL + apiKey)
        if (!response.ok) throw new Error('API error')
        const data = await response.json()
        
        const typeMap = { '24h': '24 Hours', '78h': '78 Hours', '1month': '1 Month', 'infinite': 'Infinite' }
        const typeDisplay = typeMap[data.key_type] || data.key_type || 'Unknown'
        
        if (data.valid) {
          const expiresDisplay = data.expires_at === 2147483647 ? 'Never' : formatExpiration(data.expires_at)
          keyStatusDesc.textContent = `Type: ${typeDisplay} • Expires: ${expiresDisplay}`
          keyStatusValue.textContent = 'Active'
          keyStatusValue.className = 'vw-key-value active'
        } else {
          let reason = 'Inactive'
          if (data.active === 0) reason = 'Deactivated'
          else if (data.expires_at && data.expires_at < Math.floor(Date.now() / 1000)) reason = 'Expired'
          keyStatusDesc.textContent = `Type: ${typeDisplay}`
          keyStatusValue.textContent = reason
          keyStatusValue.className = 'vw-key-value inactive'
        }
      } catch (error) {
        console.error('[VW] Failed to fetch key status:', error)
        keyStatusDesc.textContent = 'Failed to fetch status'
        keyStatusValue.textContent = 'Error'
        keyStatusValue.className = 'vw-key-value inactive'
      }
    }

    function openPanel(panel) {
      setVisible(settingsPanel, panel === 'settings')
      setVisible(consolePanel, panel === 'console')
      backdropDiv.classList.add('open')
      setScrollLock(true)

      if (panel === 'settings') {
        fetchKeyStatus()
      }

      if (panel === 'console') {
        userHasScrolled = false
        if (!scrollListenerAdded) {
          consoleContainer.addEventListener('scroll', () => {
            const atBottom = consoleContainer.scrollHeight - consoleContainer.scrollTop <= consoleContainer.clientHeight + 10
            userHasScrolled = !atBottom
          })
          scrollListenerAdded = true
        }
        renderConsoleLogs()
        startAutoRefresh()
      } else {
        stopAutoRefresh()
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
    }

    function saveSettings() {
      const newAuto = autoToggle.checked
      setStoredValue(keys.autoRedirect, newAuto)
      showToast(hasGM() ? '✓ Settings saved globally!' : '✓ Settings saved (localStorage)!')
    }

    function syncFromStorage(e) {
      if (e.key === keys.autoRedirect) {
        loadSettings()
      }
    }

    window.addEventListener('storage', syncFromStorage)

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