;(function () {
  'use strict'

  if (window.top !== window.self) return

  const VW_SETTINGS_ID = 'vw-settings-shadow-host'
  const ICON_URL = 'https://i.ibb.co/LdshK1fR/461-F6268-08-F3-4-E8A-BC73-409218-A3-F168.jpg'

  const keys = {
    autoRedirect: 'vw_auto_redirect',
    userAgent: 'vw_user_agent'
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
    if (hasGM()) {
      try {
        const val = GM_getValue(key)
        if (val !== undefined && val !== null) return val
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

          <div class="vw-actions">
            <button class="vw-btn" id="vwUserAgentBtn" type="button">UserAgent</button>
            <button class="vw-btn" id="vwConsoleBtn" type="button">Console</button>
            <button class="vw-btn" id="vwReloadBtn" type="button">Reload Page</button>
            <button class="vw-btn vw-btn-primary" id="vwApplyBtn" type="button">Apply &amp; Save</button>
          </div>
        </div>
      </div>

      <div class="vw-panel vw-hidden" id="vwUaPanel" role="dialog" aria-modal="true" aria-label="VW UserAgent">
        <div class="vw-header">
          <div class="vw-title">
            <img src="${ICON_URL}" alt="VW Icon">
            <span>UserAgent Select</span>
          </div>
          <button class="vw-close-btn" type="button" aria-label="Close UserAgent">✕</button>
        </div>
        <div class="vw-body">
          <div class="vw-row" style="grid-template-columns: 1fr;">
            <div class="vw-label">
              <div class="vw-label-title">Select UserAgent for /tc</div>
              <div class="vw-label-desc">Choose a specific UA to trick Lootlinks. Used ONLY for /tc endpoints to ensure bypass works.</div>
            </div>
            <select id="vwUaSelect" style="width:100%; padding: 12px; border-radius: 12px; background: #141414; color: #e0e0e0; border: none; outline: none; margin-top: 10px; font-family: inherit;">
              <option value="">Default (Browser Default)</option>
              <optgroup label="iOS">
                <option value="Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1">iPhone 14 (Safari)</option>
                <option value="Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1">iPhone 13 (Safari)</option>
                <option value="Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1">iPad Pro (Safari)</option>
              </optgroup>
              <optgroup label="Android">
                <option value="Mozilla/5.0 (Linux; Android 13; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Mobile Safari/537.36">Galaxy S23 Ultra (Chrome)</option>
                <option value="Mozilla/5.0 (Linux; Android 12; Pixel 6 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Mobile Safari/537.36">Pixel 6 Pro (Chrome)</option>
                <option value="Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36">Galaxy S10 (Chrome)</option>
              </optgroup>
              <optgroup label="Desktop">
                <option value="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36">Windows 10 (Chrome)</option>
                <option value="Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/114.0">Windows 10 (Firefox)</option>
                <option value="Mozilla/5.0 (Macintosh; Intel Mac OS X 13_4) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Safari/605.1.15">Mac OS (Safari)</option>
              </optgroup>
            </select>
          </div>
          <div class="vw-actions">
            <button class="vw-btn vw-btn-primary" id="vwBackFromUaBtn" type="button">Back to Settings</button>
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
    const uaPanel = shadow.querySelector('#vwUaPanel')
    const closeBtns = shadow.querySelectorAll('.vw-close-btn')
    const backdropDiv = shadow.querySelector('.vw-backdrop')

    const autoToggle = shadow.querySelector('#vwAutoToggle')
    const uaSelect = shadow.querySelector('#vwUaSelect')
    const applyBtn = shadow.querySelector('#vwApplyBtn')
    const reloadBtn = shadow.querySelector('#vwReloadBtn')
    const consoleBtn = shadow.querySelector('#vwConsoleBtn')
    const uaBtn = shadow.querySelector('#vwUserAgentBtn')
    const copyConsoleBtn = shadow.querySelector('#vwCopyConsoleBtn')
    const clearConsoleBtn = shadow.querySelector('#vwClearConsoleBtn')
    const backToSettingsBtn = shadow.querySelector('#vwBackToSettingsBtn')
    const backFromUaBtn = shadow.querySelector('#vwBackFromUaBtn')
    const tabs = shadow.querySelectorAll('.vw-tab')
    const consoleContainer = shadow.querySelector('#vwConsoleLogs')

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

    function openPanel(panel) {
      setVisible(settingsPanel, panel === 'settings')
      setVisible(consolePanel, panel === 'console')
      setVisible(uaPanel, panel === 'ua')
      backdropDiv.classList.add('open')
      setScrollLock(true)

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

      const focusTarget = panel === 'console'
        ? shadow.querySelector('#vwCopyConsoleBtn')
        : panel === 'ua' ? shadow.querySelector('#vwUaSelect')
        : shadow.querySelector('#vwAutoToggle')

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
      setVisible(uaPanel, false)
      setScrollLock(false)
      stopAutoRefresh()
    }

    function loadSettings() {
      const auto = getStoredValue(keys.autoRedirect, true)
      autoToggle.checked = auto === true
      
      const savedUa = getStoredValue(keys.userAgent, '')
      uaSelect.value = savedUa
    }

    function saveSettings() {
      const newAuto = autoToggle.checked
      const newUa = uaSelect.value

      setStoredValue(keys.autoRedirect, newAuto)
      setStoredValue(keys.userAgent, newUa)

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

    uaBtn.addEventListener('click', (e) => {
      e.preventDefault()
      e.stopPropagation()
      openPanel('ua')
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
    
    backFromUaBtn.addEventListener('click', (e) => {
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
    setVisible(uaPanel, false)
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
