;(function () {
‘use strict’

if (window.top !== window.self) return

const VW_SETTINGS_ID = ‘vw-settings-shadow-host’

const SETTINGS_CSS = `
*, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }

:host {
all: initial !important;
position: fixed !important;
bottom: 16px !important;
left: 16px !important;
z-index: 2147483647 !important;
pointer-events: none !important;
}

/* ── Gear Button ─────────────────────────────────────────── */
.vw-gear-btn {
position: fixed !important;
bottom: 16px !important;
left: 16px !important;
z-index: 2147483647 !important;
width: 50px !important;
height: 50px !important;
border-radius: 16px !important;
border: 1px solid rgba(255,255,255,0.1) !important;
background: rgba(10,12,28,0.85) !important;
backdrop-filter: blur(24px) !important;
-webkit-backdrop-filter: blur(24px) !important;
box-shadow: 0 8px 32px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.06) !important;
color: #e2e8f0 !important;
font-size: 20px !important;
display: flex !important;
align-items: center !important;
justify-content: center !important;
cursor: pointer !important;
user-select: none !important;
transition: transform 0.2s ease, box-shadow 0.2s ease !important;
pointer-events: auto !important;
font-family: ‘Inter’, system-ui, -apple-system, ‘Segoe UI’, Roboto, Arial, sans-serif !important;
}
.vw-gear-btn:hover {
transform: translateY(-2px) scale(1.07) !important;
box-shadow: 0 14px 44px rgba(59,130,246,0.35), inset 0 1px 0 rgba(255,255,255,0.1) !important;
}

/* ── Backdrop ─────────────────────────────────────────────── */
.vw-backdrop {
position: fixed !important;
top: 0 !important; left: 0 !important; right: 0 !important; bottom: 0 !important;
width: 100vw !important; height: 100vh !important;
background: rgba(0,0,0,0.72) !important;
backdrop-filter: blur(14px) !important;
-webkit-backdrop-filter: blur(14px) !important;
z-index: 2147483647 !important;
display: none !important;
align-items: center !important;
justify-content: center !important;
pointer-events: auto !important;
padding: 16px !important;
}
.vw-backdrop.open { display: flex !important; }

/* ── Panel (shared base) ──────────────────────────────────── */
.vw-panel {
width: 100% !important;
max-width: 480px !important;
max-height: min(88vh, 600px) !important;
border-radius: 20px !important;
border: 1px solid rgba(255,255,255,0.09) !important;
background: rgba(10,12,26,0.9) !important;
backdrop-filter: blur(40px) !important;
-webkit-backdrop-filter: blur(40px) !important;
box-shadow:
0 32px 80px rgba(0,0,0,0.7),
0 0 0 1px rgba(255,255,255,0.03),
inset 0 1px 0 rgba(255,255,255,0.07) !important;
color: #e2e8f0 !important;
font-family: ‘Inter’, system-ui, -apple-system, ‘Segoe UI’, Roboto, Arial, sans-serif !important;
overflow: hidden !important;
animation: vw-panel-in 0.28s cubic-bezier(0.34,1.45,0.64,1) !important;
pointer-events: auto !important;
flex-direction: column !important;
}

@keyframes vw-panel-in {
from { opacity: 0; transform: scale(0.91) translateY(-18px); }
to   { opacity: 1; transform: scale(1)    translateY(0); }
}

/* ── Panel Header ─────────────────────────────────────────── */
.vw-header {
display: flex !important;
align-items: center !important;
justify-content: space-between !important;
padding: 16px 20px !important;
border-bottom: 1px solid rgba(255,255,255,0.06) !important;
background: rgba(255,255,255,0.025) !important;
flex-shrink: 0 !important;
}

.vw-title {
font-weight: 800 !important;
font-size: 15px !important;
display: flex !important;
align-items: center !important;
gap: 10px !important;
color: #f1f5f9 !important;
letter-spacing: -0.2px !important;
}

.vw-badge-settings {
width: 30px !important; height: 30px !important;
border-radius: 9px !important;
background: linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%) !important;
display: flex !important; align-items: center !important; justify-content: center !important;
font-weight: 900 !important; font-size: 9px !important;
color: #fff !important; letter-spacing: 0.5px !important;
flex-shrink: 0 !important;
}

.vw-badge-console {
width: 30px !important; height: 30px !important;
border-radius: 9px !important;
background: linear-gradient(135deg, #c2410c 0%, #f97316 100%) !important;
display: flex !important; align-items: center !important; justify-content: center !important;
font-size: 14px !important;
flex-shrink: 0 !important;
}

.vw-close-btn {
width: 30px !important; height: 30px !important;
border-radius: 9px !important;
border: 1px solid rgba(255,255,255,0.07) !important;
background: rgba(255,255,255,0.04) !important;
color: #64748b !important;
cursor: pointer !important; font-size: 14px !important;
display: flex !important; align-items: center !important; justify-content: center !important;
transition: all 0.18s ease !important;
font-family: ‘Inter’, system-ui, -apple-system, ‘Segoe UI’, Roboto, Arial, sans-serif !important;
line-height: 1 !important;
}
.vw-close-btn:hover {
background: rgba(239,68,68,0.18) !important;
border-color: rgba(239,68,68,0.35) !important;
color: #fca5a5 !important;
}

/* ── Panel Body ───────────────────────────────────────────── */
.vw-body {
padding: 16px 20px !important;
display: flex !important;
flex-direction: column !important;
gap: 10px !important;
overflow-y: auto !important;
flex: 1 !important;
min-height: 0 !important;
}

/* ── Setting Row ──────────────────────────────────────────── */
.vw-row {
display: flex !important;
align-items: center !important;
justify-content: space-between !important;
gap: 14px !important;
padding: 13px 15px !important;
border-radius: 13px !important;
border: 1px solid rgba(255,255,255,0.055) !important;
background: rgba(255,255,255,0.028) !important;
transition: border-color 0.2s ease, background 0.2s ease !important;
}
.vw-row:hover {
border-color: rgba(59,130,246,0.28) !important;
background: rgba(59,130,246,0.04) !important;
}

.vw-label {
display: flex !important; flex-direction: column !important; gap: 3px !important; flex: 1 !important;
}
.vw-label-title {
font-size: 13px !important; font-weight: 700 !important; color: #e2e8f0 !important;
}
.vw-label-desc {
font-size: 11px !important; color: #475569 !important; font-weight: 400 !important; line-height: 1.4 !important;
}

.vw-input {
width: 86px !important;
background: rgba(0,0,0,0.45) !important;
border: 1px solid rgba(255,255,255,0.08) !important;
color: #e2e8f0 !important;
border-radius: 10px !important;
padding: 8px 10px !important;
text-align: center !important;
font-weight: 700 !important; font-size: 14px !important;
outline: none !important; flex-shrink: 0 !important;
transition: border-color 0.2s, box-shadow 0.2s !important;
font-family: ‘Inter’, system-ui, -apple-system, ‘Segoe UI’, Roboto, Arial, sans-serif !important;
-webkit-appearance: textfield !important;
-moz-appearance: textfield !important;
appearance: textfield !important;
}
.vw-input::-webkit-inner-spin-button,
.vw-input::-webkit-outer-spin-button { -webkit-appearance: none !important; margin: 0 !important; }
.vw-input:focus {
border-color: rgba(59,130,246,0.7) !important;
box-shadow: 0 0 0 3px rgba(59,130,246,0.14) !important;
}

/* ── Divider ──────────────────────────────────────────────── */
.vw-divider {
height: 1px !important;
background: rgba(255,255,255,0.05) !important;
border: none !important;
margin: 2px 0 !important;
}

/* ── Actions ──────────────────────────────────────────────── */
.vw-actions {
display: flex !important;
align-items: center !important;
justify-content: flex-end !important;
gap: 8px !important;
flex-wrap: wrap !important;
padding-top: 2px !important;
}

/* ── Buttons ──────────────────────────────────────────────── */
.vw-btn {
padding: 8px 14px !important;
border-radius: 10px !important;
border: 1px solid rgba(255,255,255,0.08) !important;
background: rgba(255,255,255,0.05) !important;
color: #94a3b8 !important;
font-weight: 600 !important; font-size: 12px !important;
cursor: pointer !important;
transition: all 0.18s ease !important;
white-space: nowrap !important;
font-family: ‘Inter’, system-ui, -apple-system, ‘Segoe UI’, Roboto, Arial, sans-serif !important;
line-height: 1 !important;
}
.vw-btn:hover {
background: rgba(255,255,255,0.09) !important;
border-color: rgba(255,255,255,0.14) !important;
color: #cbd5e1 !important;
transform: translateY(-1px) !important;
}
.vw-btn:active { transform: translateY(0) !important; }

.vw-btn-console {
border-color: rgba(249,115,22,0.28) !important;
color: #fb923c !important;
background: rgba(249,115,22,0.07) !important;
}
.vw-btn-console:hover {
background: rgba(249,115,22,0.14) !important;
border-color: rgba(249,115,22,0.45) !important;
color: #fdba74 !important;
box-shadow: 0 4px 14px rgba(249,115,22,0.2) !important;
}

.vw-btn-reload {
border-color: rgba(100,116,139,0.3) !important;
color: #94a3b8 !important;
background: rgba(100,116,139,0.07) !important;
}
.vw-btn-reload:hover {
background: rgba(100,116,139,0.14) !important;
border-color: rgba(100,116,139,0.45) !important;
color: #cbd5e1 !important;
}

.vw-btn-primary {
background: linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%) !important;
border-color: transparent !important;
color: #fff !important;
font-weight: 700 !important;
box-shadow: 0 4px 14px rgba(59,130,246,0.25) !important;
}
.vw-btn-primary:hover {
background: linear-gradient(135deg, #2563eb 0%, #60a5fa 100%) !important;
transform: translateY(-1px) !important;
box-shadow: 0 6px 20px rgba(59,130,246,0.38) !important;
color: #fff !important;
}

.vw-btn-back {
background: rgba(249,115,22,0.1) !important;
border-color: rgba(249,115,22,0.28) !important;
color: #fb923c !important;
}
.vw-btn-back:hover {
background: rgba(249,115,22,0.18) !important;
border-color: rgba(249,115,22,0.45) !important;
color: #fdba74 !important;
box-shadow: 0 4px 14px rgba(249,115,22,0.2) !important;
}

/* ── Console ──────────────────────────────────────────────── */
.vw-console-section {
display: flex !important;
flex-direction: column !important;
flex: 1 !important;
min-height: 0 !important;
gap: 10px !important;
}

.vw-console {
flex: 1 !important;
overflow-y: auto !important;
overflow-x: hidden !important;
-webkit-overflow-scrolling: touch !important;
background: rgba(0,0,0,0.65) !important;
border-radius: 12px !important;
padding: 10px !important;
font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, ‘Courier New’, monospace !important;
font-size: 11px !important;
border: 1px solid rgba(255,255,255,0.05) !important;
min-height: 180px !important;
max-height: 340px !important;
}

.vw-console::-webkit-scrollbar { width: 4px !important; }
.vw-console::-webkit-scrollbar-track { background: transparent !important; }
.vw-console::-webkit-scrollbar-thumb {
background: rgba(255,255,255,0.1) !important;
border-radius: 2px !important;
}
.vw-console::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.18) !important; }

.vw-log-entry {
padding: 5px 7px !important;
border-radius: 6px !important;
margin-bottom: 2px !important;
transition: background 0.1s !important;
}
.vw-log-entry:hover { background: rgba(255,255,255,0.03) !important; }

.vw-log-row {
display: flex !important;
align-items: baseline !important;
gap: 7px !important;
flex-wrap: wrap !important;
}
.vw-log-time   { color: #1e293b !important; font-size: 10px !important; flex-shrink: 0 !important; }
.vw-log-level-info  { color: #22d3ee !important; font-weight: 700 !important; font-size: 10px !important; flex-shrink: 0 !important; }
.vw-log-level-warn  { color: #fb923c !important; font-weight: 700 !important; font-size: 10px !important; flex-shrink: 0 !important; }
.vw-log-level-error { color: #f87171 !important; font-weight: 700 !important; font-size: 10px !important; flex-shrink: 0 !important; }
.vw-log-msg    { color: #94a3b8 !important; word-break: break-word !important; flex: 1 !important; }
.vw-log-data   {
color: #334155 !important; font-size: 10px !important;
padding-left: 10px !important; word-break: break-all !important;
margin-top: 2px !important;
}

.vw-empty-log {
display: flex !important; align-items: center !important; justify-content: center !important;
min-height: 120px !important;
color: #1e293b !important; font-size: 12px !important; font-style: italic !important;
}

/* ── Toast ────────────────────────────────────────────────── */
.vw-toast {
position: fixed !important;
bottom: 76px !important; left: 16px !important;
padding: 9px 15px !important; border-radius: 10px !important;
background: rgba(10,12,26,0.92) !important;
backdrop-filter: blur(20px) !important;
-webkit-backdrop-filter: blur(20px) !important;
border: 1px solid rgba(255,255,255,0.1) !important;
color: #e2e8f0 !important;
font-weight: 700 !important; font-size: 12px !important;
box-shadow: 0 8px 30px rgba(0,0,0,0.45) !important;
animation: vw-toast-in 0.3s ease-out !important;
z-index: 2147483648 !important;
pointer-events: none !important;
font-family: ‘Inter’, system-ui, -apple-system, ‘Segoe UI’, Roboto, Arial, sans-serif !important;
max-width: calc(100vw - 32px) !important;
}
@keyframes vw-toast-in {
from { opacity: 0; transform: translateY(10px); }
to   { opacity: 1; transform: translateY(0); }
}

/* ── Responsive ───────────────────────────────────────────── */
@media (max-width: 520px) {
.vw-panel { max-width: 100% !important; border-radius: 16px !important; }
.vw-actions { justify-content: stretch !important; }
.vw-btn { flex: 1 !important; text-align: center !important; justify-content: center !important; }
.vw-console { max-height: 260px !important; min-height: 140px !important; }
}
`

const keys = {
redirectWaitTime: ‘vw_redirect_wait_time’,
luarmorWaitTime: ‘vw_luarmor_wait_time’
}

function hasGM() {
return typeof GM_getValue === ‘function’ && typeof GM_setValue === ‘function’
}

function getStoredValue(key, defaultValue) {
if (hasGM()) {
try { return GM_getValue(key, defaultValue) } catch (_) {}
}
const lsValue = localStorage.getItem(key)
if (lsValue === null) return defaultValue
if (typeof defaultValue === ‘boolean’) return lsValue === ‘true’
if (typeof defaultValue === ‘number’) {
const n = parseInt(lsValue, 10)
return Number.isFinite(n) ? n : defaultValue
}
return lsValue
}

function setStoredValue(key, value) {
if (hasGM()) {
try { GM_setValue(key, value) } catch (_) {}
}
localStorage.setItem(key, String(value))
}

function clampInt(value, min, max, def) {
const n = parseInt(String(value), 10)
if (!Number.isFinite(n)) return def
return Math.min(max, Math.max(min, n))
}

function escapeHtml(str) {
if (!str) return ‘’
return String(str)
.replace(/&/g, ‘&’)
.replace(/</g, ‘<’)
.replace(/>/g, ‘>’)
.replace(/”/g, ‘"’)
}

function createSettingsUI() {
const existing = document.getElementById(VW_SETTINGS_ID)
if (existing) existing.remove()

```
const host = document.createElement('div')
host.id = VW_SETTINGS_ID
host.style.cssText = [
  'all: initial !important',
  'position: fixed !important',
  'bottom: 16px !important',
  'left: 16px !important',
  'width: 50px !important',
  'height: 50px !important',
  'z-index: 2147483647 !important',
  'pointer-events: none !important',
  'isolation: isolate !important'
].join(';')

const shadow = host.attachShadow({ mode: 'closed' })

const style = document.createElement('style')
style.textContent = SETTINGS_CSS
shadow.appendChild(style)

/* ── Gear button ── */
const gearBtn = document.createElement('div')
gearBtn.className = 'vw-gear-btn'
gearBtn.setAttribute('role', 'button')
gearBtn.setAttribute('aria-label', 'Open VortixWorld Settings')
gearBtn.textContent = '⚙️'
shadow.appendChild(gearBtn)

/* ── Backdrop ── */
const backdrop = document.createElement('div')
backdrop.className = 'vw-backdrop'
backdrop.setAttribute('role', 'dialog')
backdrop.setAttribute('aria-modal', 'true')

backdrop.innerHTML = `
  <!-- Settings Panel -->
  <div class="vw-panel" id="vwSettingsPanel" role="document" style="display:none;">
    <div class="vw-header">
      <div class="vw-title">
        <div class="vw-badge-settings">VW</div>
        <span>Settings</span>
      </div>
      <button class="vw-close-btn" type="button" aria-label="Close settings">✕</button>
    </div>
    <div class="vw-body">
      <div class="vw-row">
        <div class="vw-label">
          <div class="vw-label-title">Redirect Wait Time</div>
          <div class="vw-label-desc">Delay (seconds) before redirecting to bypass site (0 – 60)</div>
        </div>
        <input type="number" class="vw-input" id="vwWaitTimeInput" min="0" max="60" inputmode="numeric">
      </div>
      <div class="vw-row">
        <div class="vw-label">
          <div class="vw-label-title">Luarmor Next Wait</div>
          <div class="vw-label-desc">Delay (seconds) before enabling Next button (0 – 120)</div>
        </div>
        <input type="number" class="vw-input" id="vwLuarmorWaitTimeInput" min="0" max="120" inputmode="numeric">
      </div>
      <hr class="vw-divider">
      <div class="vw-actions">
        <button class="vw-btn vw-btn-console" id="vwConsoleBtn" type="button">📟 Console</button>
        <button class="vw-btn vw-btn-reload"  id="vwReloadBtn"  type="button">↻ Reload</button>
        <button class="vw-btn vw-btn-primary"  id="vwApplyBtn"   type="button">Apply &amp; Save</button>
      </div>
    </div>
  </div>

  <!-- Console Panel -->
  <div class="vw-panel" id="vwConsolePanel" role="document" style="display:none;">
    <div class="vw-header">
      <div class="vw-title">
        <div class="vw-badge-console">📟</div>
        <span>Console Logs</span>
      </div>
      <button class="vw-close-btn" type="button" aria-label="Close console">✕</button>
    </div>
    <div class="vw-body">
      <div class="vw-console-section">
        <div class="vw-console" id="vwConsoleLogs" role="log" aria-live="polite" aria-label="Log output"></div>
      </div>
      <div class="vw-actions" style="margin-top:8px; flex-shrink:0;">
        <button class="vw-btn" id="vwClearConsoleBtn" type="button">Clear</button>
        <button class="vw-btn vw-btn-back" id="vwBackToSettingsBtn" type="button">← Back</button>
      </div>
    </div>
  </div>
`
shadow.appendChild(backdrop)

/* ── Query elements ── */
const settingsPanel      = shadow.getElementById('vwSettingsPanel')
const consolePanel       = shadow.getElementById('vwConsolePanel')
const backdropEl         = shadow.querySelector('.vw-backdrop')
const closeBtns          = shadow.querySelectorAll('.vw-close-btn')
const waitTimeInput      = shadow.getElementById('vwWaitTimeInput')
const luarmorWaitInput   = shadow.getElementById('vwLuarmorWaitTimeInput')
const applyBtn           = shadow.getElementById('vwApplyBtn')
const reloadBtn          = shadow.getElementById('vwReloadBtn')
const consoleBtn         = shadow.getElementById('vwConsoleBtn')
const clearConsoleBtn    = shadow.getElementById('vwClearConsoleBtn')
const backToSettingsBtn  = shadow.getElementById('vwBackToSettingsBtn')
const consoleLogsEl      = shadow.getElementById('vwConsoleLogs')

/* ── Panel helpers ── */
function showPanel(which) {
  if (which === 'settings') {
    settingsPanel.style.display = 'flex'
    settingsPanel.style.flexDirection = 'column'
    consolePanel.style.display = 'none'
  } else {
    consolePanel.style.display = 'flex'
    consolePanel.style.flexDirection = 'column'
    settingsPanel.style.display = 'none'
    renderConsoleLogs()
  }
  backdropEl.classList.add('open')
}

function hideAll() {
  backdropEl.classList.remove('open')
  settingsPanel.style.display = 'none'
  consolePanel.style.display = 'none'
}

/* ── Settings helpers ── */
function loadSettings() {
  waitTimeInput.value    = String(clampInt(getStoredValue(keys.redirectWaitTime, 5),   0,  60,  5))
  luarmorWaitInput.value = String(clampInt(getStoredValue(keys.luarmorWaitTime,  20),  0, 120, 20))
}

function saveSettings() {
  const newWait   = clampInt(waitTimeInput.value,    0,  60,  5)
  const newLuarm  = clampInt(luarmorWaitInput.value, 0, 120, 20)
  setStoredValue(keys.redirectWaitTime, newWait)
  setStoredValue(keys.luarmorWaitTime,  newLuarm)
  if (window.VW_CONFIG) {
    window.VW_CONFIG.redirectWaitTime = newWait
    window.VW_CONFIG.luarmorWaitTime  = newLuarm
  }
  showToast(hasGM() ? '✓ Settings saved globally!' : '✓ Settings saved!')
}

/* ── Console helpers ── */
function renderConsoleLogs() {
  if (!consoleLogsEl) return
  const logs = window.__vw_logs || []
  if (!logs.length) {
    consoleLogsEl.innerHTML = '<div class="vw-empty-log">No logs yet.</div>'
    return
  }
  consoleLogsEl.innerHTML = logs.map(log => {
    const levelClass = `vw-log-level-${escapeHtml(log.level)}`
    const levelLabel = escapeHtml(log.level.toUpperCase()).padEnd(5, ' ')
    const time       = escapeHtml((log.timestamp || '').slice(11, 19))
    const msg        = escapeHtml(log.message || '')
    const data       = log.data ? `<div class="vw-log-data">${escapeHtml(log.data)}</div>` : ''
    return `
      <div class="vw-log-entry">
        <div class="vw-log-row">
          <span class="vw-log-time">[${time}]</span>
          <span class="${levelClass}">${levelLabel}</span>
          <span class="vw-log-msg">${msg}</span>
        </div>
        ${data}
      </div>`
  }).join('')
  consoleLogsEl.scrollTop = consoleLogsEl.scrollHeight
}

/* ── Toast ── */
function showToast(message) {
  const prev = shadow.querySelector('.vw-toast')
  if (prev) { try { prev.remove() } catch (_) {} }
  const toast = document.createElement('div')
  toast.className = 'vw-toast'
  toast.textContent = message
  shadow.appendChild(toast)
  setTimeout(() => { try { toast.remove() } catch (_) {} }, 2800)
}

/* ── Event listeners ── */
gearBtn.addEventListener('click', e => { e.stopPropagation(); showPanel('settings') })

closeBtns.forEach(btn => {
  btn.addEventListener('click', e => { e.stopPropagation(); hideAll() })
})

backdropEl.addEventListener('click', e => { if (e.target === backdropEl) hideAll() })

// Trap Escape key
shadow.addEventListener('keydown', e => { if (e.key === 'Escape') hideAll() })

applyBtn.addEventListener('click', e => {
  e.stopPropagation()
  saveSettings()
  hideAll()
})

reloadBtn.addEventListener('click', e => {
  e.stopPropagation()
  location.reload()
})

consoleBtn.addEventListener('click', e => {
  e.stopPropagation()
  showPanel('console')
})

clearConsoleBtn.addEventListener('click', e => {
  e.stopPropagation()
  window.__vw_logs = []
  renderConsoleLogs()
  showToast('Console cleared')
})

backToSettingsBtn.addEventListener('click', e => {
  e.stopPropagation()
  showPanel('settings')
})

/* ── Init ── */
loadSettings()
document.documentElement.appendChild(host)
```

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

if (document.readyState === ‘loading’) document.addEventListener(‘DOMContentLoaded’, init)
else init()
})()