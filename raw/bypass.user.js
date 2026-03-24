// ==UserScript==
// @name         VortixWorld Bypass
// @namespace    afklolbypasser
// @version      1.15
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
‘use strict’

const HOST     = (location.hostname || ‘’).toLowerCase().replace(/^www./, ‘’)
const ICON_URL = ‘https://i.ibb.co/p6Qjk6gP/BFB1896-C-9-FA4-4429-881-A-38074322-DFCB.png’
const SITE_HOST = ‘vortix-world-bypass.vercel.app’
const TPI_HOST  = ‘tpi.li’

const LOOT_HOSTS = [
‘loot-link.com’,‘loot-links.com’,‘lootlink.org’,‘lootlinks.co’,
‘lootdest.info’,‘lootdest.org’,‘lootdest.com’,‘links-loot.com’,
‘linksloot.net’,‘lootlinks.com’,‘best-links.org’,‘loot-labs.com’,‘lootlabs.com’
]

const ALLOWED_SHORT_HOSTS = [
‘linkvertise.com’,‘admaven.com’,‘work.ink’,‘shortearn.eu’,
‘beta.shortearn.eu’,‘cuty.io’,‘ouo.io’,‘lockr.so’,‘rekonise.com’,
‘mboost.me’,‘link-unlocker.com’,‘mega.nz’,‘mega.co.nz’,
‘direct-link.net’,‘direct-links.net’,‘direct-links.org’,
‘link-center.net’,‘link-hub.net’,‘link-pays.in’,
‘link-target.net’,‘link-target.org’,‘link-to.net’,‘workink.net’
]

function hostMatchesAny(list) {
const h = HOST
for (const base of list) {
if (h === base) return true
if (h.endsWith(’.’ + base)) return true
}
return false
}

const isLootHost    = () => hostMatchesAny(LOOT_HOSTS)
const isAllowedHost = () => hostMatchesAny(ALLOWED_SHORT_HOSTS)
const isTpiLi       = () => HOST === TPI_HOST || HOST.endsWith(’.’ + TPI_HOST)

const CONFIG = Object.freeze({
HEARTBEAT_INTERVAL:    1000,
MAX_RECONNECT_DELAY:  30000,
INITIAL_RECONNECT_DELAY: 1000,
COUNTDOWN_INTERVAL:    1000
})

const VW_KEYS = window.VW_CONFIG?.keys || {
autoRedirect:      ‘vw_auto_redirect’,
redirectWaitTime:  ‘vw_redirect_wait_time’,
luarmorWaitTime:   ‘vw_luarmor_wait_time’
}

let RedirectWaitTime = (() => {
if (typeof window.VW_CONFIG?.redirectWaitTime === ‘number’) return window.VW_CONFIG.redirectWaitTime
const saved = localStorage.getItem(VW_KEYS.redirectWaitTime)
const parsed = saved ? parseInt(saved, 10) : NaN
return !isNaN(parsed) ? parsed : 5
})()

let LuarmorWaitTime = (() => {
if (typeof window.VW_CONFIG?.luarmorWaitTime === ‘number’) return window.VW_CONFIG.luarmorWaitTime
const saved = localStorage.getItem(VW_KEYS.luarmorWaitTime)
const parsed = saved ? parseInt(saved, 10) : NaN
return !isNaN(parsed) ? parsed : 20
})()

const savedAuto = localStorage.getItem(VW_KEYS.autoRedirect)
let isAutoRedirect = savedAuto !== null ? savedAuto === ‘true’ : true

const logStacks = { countdown: { lastRemaining: null } }

window.__vw_logs = window.__vw_logs || []
const LOG_STYLE = {
base:  ‘font-weight:800;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,“Liberation Mono”,“Courier New”,monospace;’,
info:  ‘color:#22c55e;’,
warn:  ‘color:#f59e0b;’,
error: ‘color:#ef4444;’,
dim:   ‘color:#94a3b8;’
}

const Logger = {
_push(level, msg, data) {
const entry = {
timestamp: new Date().toISOString(),
level, message: msg,
data: data !== undefined ? String(data) : ‘’
}
window.__vw_logs.push(entry)
if (window.__vw_logs.length > 500) window.__vw_logs.shift()
},
info:  (m, d = ‘’) => { console.info(`%c[INFO]%c [VortixBypass] ${m}`,  LOG_STYLE.base + LOG_STYLE.info,  LOG_STYLE.base + LOG_STYLE.dim, d || ‘’); Logger._push(‘info’,  m, d) },
warn:  (m, d = ‘’) => { console.warn(`%c[WARN]%c [VortixBypass] ${m}`,  LOG_STYLE.base + LOG_STYLE.warn,  LOG_STYLE.base + LOG_STYLE.dim, d || ‘’); Logger._push(‘warn’,  m, d) },
error: (m, d = ‘’) => { console.error(`%c[ERROR]%c [VortixBypass] ${m}`, LOG_STYLE.base + LOG_STYLE.error, LOG_STYLE.base + LOG_STYLE.dim, d || ‘’); Logger._push(‘error’, m, d) }
}

const cleanupManager = {
intervals: new Set(),
timeouts:  new Set(),
setInterval(fn, delay, …args) {
const id = setInterval(fn, delay, …args)
this.intervals.add(id); return id
},
setTimeout(fn, delay, …args) {
const id = setTimeout(() => { this.timeouts.delete(id); fn(…args) }, delay)
this.timeouts.add(id); return id
},
clearAll() {
this.intervals.forEach(id => clearInterval(id))
this.timeouts.forEach(id => clearTimeout(id))
this.intervals.clear(); this.timeouts.clear()
}
}

let isShutdown = false

function shutdown() {
if (isShutdown) return
isShutdown = true
cleanupManager.clearAll()
if (window.bypassObserver)   { window.bypassObserver.disconnect();  window.bypassObserver  = null }
if (window.activeWebSocket)  { window.activeWebSocket.disconnect(); window.activeWebSocket = null }
}

async function copyTextSilent(text) {
try {
if (!text) return false
if (navigator.clipboard && window.isSecureContext) {
await navigator.clipboard.writeText(String(text)); return true
}
} catch (*) {}
try {
const ta = document.createElement(‘textarea’)
ta.value = String(text)
ta.style.cssText = ‘position:fixed;left:-9999px;top:0;’
;(document.body || document.documentElement).appendChild(ta)
ta.focus(); ta.select()
const ok = document.execCommand(‘copy’)
ta.remove(); return !!ok
} catch (*) {}
return false
}

function isLuarmorUrl(url) {
try {
const u = new URL(String(url), location.href)
const h = (u.hostname || ‘’).toLowerCase()
return h === ‘ads.luarmor.net’ || h.endsWith(’.ads.luarmor.net’)
} catch (_) { return String(url).includes(‘ads.luarmor.net’) }
}

function getBypassReturnUrl() {
try { const ret = new URLSearchParams(location.search).get(‘return’); if (ret) return ret } catch (*) {}
try { const ret = sessionStorage.getItem(‘vw_bypass_return_url’);       if (ret) return ret } catch (*) {}
return ‘’
}

function setBypassReturnUrl(url) {
try { sessionStorage.setItem(‘vw_bypass_return_url’, String(url)) } catch (_) {}
}

function buildReturnWithRedirect(returnUrl, target) {
try {
const u = new URL(String(returnUrl), location.href)
u.searchParams.set(‘redirect’, String(target)); return u.toString()
} catch (_) {
const base = String(returnUrl)
return base + (base.includes(’?’) ? ‘&’ : ‘?’) + ‘redirect=’ + encodeURIComponent(String(target))
}
}

/* ═══════════════════════════════════════════════════════════
SHARED UI CSS  –  Glassmorphism + dark ambient theme
═══════════════════════════════════════════════════════════ */
const SHARED_UI_CSS = `
html,body{margin:0;padding:0;height:100%;overflow:hidden}

```
#vortixWorldOverlay{
  position:fixed!important;top:0!important;left:0!important;
  width:100vw!important;height:100vh!important;
  background:radial-gradient(ellipse at 70% 10%,rgba(59,130,246,0.12) 0%,transparent 55%),
             radial-gradient(ellipse at 20% 90%,rgba(249,115,22,0.09) 0%,transparent 50%),
             linear-gradient(160deg,#060812 0%,#0a0d1c 50%,#0d1124 100%)!important;
  z-index:2147483647!important;
  display:flex!important;flex-direction:column!important;
  align-items:center!important;justify-content:center!important;
  font-family:'Inter',system-ui,-apple-system,'Segoe UI',Roboto,Arial,sans-serif!important;
  opacity:1!important;visibility:visible!important;
  pointer-events:auto!important;box-sizing:border-box!important;
  isolation:isolate!important;
}
#vortixWorldOverlay *{box-sizing:border-box!important}

/* Header */
.vw-header-bar{
  position:absolute!important;top:0!important;left:0!important;
  width:100%!important;height:68px!important;padding:0 26px!important;
  display:flex!important;align-items:center!important;justify-content:space-between!important;
  background:rgba(255,255,255,0.025)!important;
  backdrop-filter:blur(20px)!important;-webkit-backdrop-filter:blur(20px)!important;
  border-bottom:1px solid rgba(255,255,255,0.07)!important;
  z-index:2147483648!important;
}

.vw-title{
  font-weight:900!important;font-size:19px!important;
  display:flex!important;align-items:center!important;gap:11px!important;
  color:#f1f5f9!important;letter-spacing:-0.4px!important;
}

.vw-header-icon{
  height:32px!important;width:32px!important;border-radius:10px!important;
  object-fit:cover!important;
  border:1.5px solid rgba(59,130,246,0.45)!important;
  box-shadow:0 0 12px rgba(59,130,246,0.25)!important;
}

/* Main content wrapper */
.vw-main-content{
  display:flex!important;flex-direction:column!important;
  align-items:center!important;justify-content:center!important;
  width:100%!important;max-width:480px!important;
  padding:20px!important;
  animation:vw-fade-up .45s cubic-bezier(0.22,1,0.36,1)!important;
  position:relative!important;z-index:1!important;
}

/* Glass card */
.vw-glass-card{
  width:100%!important;
  background:rgba(255,255,255,0.04)!important;
  backdrop-filter:blur(32px)!important;-webkit-backdrop-filter:blur(32px)!important;
  border:1px solid rgba(255,255,255,0.09)!important;
  border-radius:24px!important;
  padding:36px 32px!important;
  display:flex!important;flex-direction:column!important;align-items:center!important;
  box-shadow:
    0 24px 80px rgba(0,0,0,0.5),
    0 0 0 1px rgba(255,255,255,0.025),
    inset 0 1px 0 rgba(255,255,255,0.07)!important;
}

/* Dual-ring loader */
.vw-loader-wrap{
  position:relative!important;
  width:60px!important;height:60px!important;
  margin-bottom:22px!important;
}
.vw-loader-outer{
  position:absolute!important;inset:0!important;
  border-radius:50%!important;
  border:2.5px solid rgba(255,255,255,0.06)!important;
  border-top-color:#3b82f6!important;
  animation:vw-spin .9s linear infinite!important;
}
.vw-loader-inner{
  position:absolute!important;inset:8px!important;
  border-radius:50%!important;
  border:2.5px solid rgba(255,255,255,0.04)!important;
  border-bottom-color:#f97316!important;
  animation:vw-spin .7s linear infinite reverse!important;
}
@keyframes vw-spin{to{transform:rotate(360deg)}}

/* Icon (used in Luarmor / Redirect pages where no loader is shown) */
.vw-icon-img{
  width:68px!important;height:68px!important;border-radius:18px!important;
  margin-bottom:20px!important;object-fit:cover!important;
  box-shadow:0 12px 36px rgba(59,130,246,0.3),0 0 0 1px rgba(59,130,246,0.15)!important;
}

.vw-status{
  font-size:21px!important;font-weight:800!important;
  text-align:center!important;margin-bottom:8px!important;
  color:#f1f5f9!important;letter-spacing:-0.5px!important;
}

.vw-substatus{
  font-size:14px!important;color:#475569!important;
  text-align:center!important;font-weight:500!important;line-height:1.55!important;
}

/* Button (used in Luarmor UI) */
.vw-btn{
  background:rgba(59,130,246,0.12)!important;
  color:#93c5fd!important;
  border:1px solid rgba(59,130,246,0.28)!important;
  padding:13px 20px!important;border-radius:13px!important;
  font-weight:700!important;cursor:pointer!important;width:100%!important;
  font-size:14px!important;letter-spacing:0.4px!important;
  transition:all .2s ease!important;margin-top:18px!important;
  font-family:'Inter',system-ui,-apple-system,'Segoe UI',Roboto,Arial,sans-serif!important;
}
.vw-btn:hover{
  background:rgba(59,130,246,0.22)!important;
  border-color:rgba(59,130,246,0.55)!important;
  transform:translateY(-2px)!important;
  box-shadow:0 8px 24px rgba(59,130,246,0.2)!important;
  color:#bfdbfe!important;
}
.vw-btn:disabled{
  opacity:.3!important;cursor:not-allowed!important;
  transform:none!important;box-shadow:none!important;
}

/* Orange accent button (Luarmor manual) */
.vw-btn-orange{
  background:rgba(249,115,22,0.12)!important;
  color:#fdba74!important;
  border:1px solid rgba(249,115,22,0.28)!important;
}
.vw-btn-orange:hover{
  background:rgba(249,115,22,0.22)!important;
  border-color:rgba(249,115,22,0.55)!important;
  box-shadow:0 8px 24px rgba(249,115,22,0.2)!important;
  color:#fed7aa!important;
}
.vw-btn-orange:disabled{
  opacity:.3!important;cursor:not-allowed!important;
  transform:none!important;box-shadow:none!important;
}

/* Toggle */
.vw-toggle-container{
  display:flex!important;align-items:center!important;gap:10px!important;
  font-size:12px!important;color:#64748b!important;font-weight:700!important;
  background:rgba(255,255,255,0.04)!important;
  backdrop-filter:blur(10px)!important;-webkit-backdrop-filter:blur(10px)!important;
  padding:7px 14px!important;border-radius:999px!important;
  border:1px solid rgba(255,255,255,0.07)!important;
  cursor:pointer!important;user-select:none!important;
  z-index:2147483650!important;pointer-events:auto!important;
}

/* Progress bar (redirect countdown) */
.vw-progress-track{
  width:100%!important;height:3px!important;
  background:rgba(255,255,255,0.06)!important;
  border-radius:999px!important;
  overflow:hidden!important;margin-top:18px!important;
}
.vw-progress-bar{
  height:100%!important;
  background:linear-gradient(90deg,#3b82f6,#f97316)!important;
  border-radius:999px!important;
  transition:width .9s linear!important;
}

@keyframes vw-fade-up{
  from{opacity:0;transform:translateY(22px)}
  to  {opacity:1;transform:translateY(0)}
}

/* Responsive */
@media(max-width:640px){
  .vw-status{font-size:18px!important}
  .vw-substatus{font-size:13px!important}
  .vw-glass-card{padding:28px 22px!important;border-radius:18px!important}
  .vw-header-bar{height:60px!important;padding:0 18px!important}
  .vw-loader-wrap{width:52px!important;height:52px!important}
}
@media(max-width:380px){
  .vw-glass-card{padding:22px 16px!important}
  .vw-status{font-size:16px!important}
}
```

`

/* ─────────────────────────────────────────────────────────
Luarmor guard
───────────────────────────────────────────────────────── */
let __vwLuarmorAllowOnceUrl = ‘’
let __vwLuarmorAllowUntil   = 0

function allowLuarmorOnce(url, ms = 1500) {
__vwLuarmorAllowOnceUrl = String(url || ‘’)
__vwLuarmorAllowUntil   = Date.now() + ms
}

function isLuarmorAllowedNow(url) {
if (!__vwLuarmorAllowOnceUrl) return false
if (Date.now() > __vwLuarmorAllowUntil) return false
return String(url || ‘’) === __vwLuarmorAllowOnceUrl
}

/* ─────────────────────────────────────────────────────────
Luarmor “Next” UI  –  orange-accented glass card
───────────────────────────────────────────────────────── */
function renderLuarmorNextUI(targetUrl, waitSeconds) {
const secs = Number.isFinite(waitSeconds) ? Math.max(0, Math.floor(waitSeconds)) : 20

```
document.documentElement.innerHTML = `
  <html lang="en">
    <head>
      <title>VortixWorld – Manual Continue</title>
      <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
      <style>${SHARED_UI_CSS}</style>
    </head>
    <body>
      <div id="vortixWorldOverlay">
        <div class="vw-header-bar">
          <div class="vw-title">
            <img src="${ICON_URL}" class="vw-header-icon" alt="">
            VortixWorld
          </div>
        </div>

        <div class="vw-main-content">
          <div class="vw-glass-card">
            <img src="${ICON_URL}" class="vw-icon-img" alt="VortixWorld">
            <div id="vwStatus"    class="vw-status">Manual Continue</div>
            <div id="vwSubStatus" class="vw-substatus">
              ${secs > 0 ? `Unlocking in <strong id="vwCountNum" style="color:#fdba74">${secs}</strong> seconds…` : 'You may continue now.'}
            </div>
            <div style="width:100%;margin-top:6px;">
              <div class="vw-progress-track">
                <div class="vw-progress-bar" id="vwProgressBar"
                     style="width:${secs > 0 ? '0%' : '100%'}"></div>
              </div>
            </div>
            <button id="vwLuarmorNextBtn" class="vw-btn vw-btn-orange"
                    ${secs > 0 ? 'disabled' : ''}>
              Continue →
            </button>
          </div>
        </div>
      </div>
    </body>
  </html>
`

const btn       = document.getElementById('vwLuarmorNextBtn')
const subEl     = document.getElementById('vwSubStatus')
const countEl   = document.getElementById('vwCountNum')
const barEl     = document.getElementById('vwProgressBar')
let remaining   = secs
const total     = secs

if (secs > 0 && barEl) {
  /* Kick off progress bar grow after a tiny delay so CSS transition fires */
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      if (barEl) barEl.style.width = '100%'
    })
  })
}

const iv = setInterval(() => {
  remaining = Math.max(0, remaining - 1)
  if (countEl) countEl.textContent = remaining
  if (remaining <= 0) {
    if (subEl)  subEl.innerHTML  = 'You may continue now.'
    if (btn)    btn.disabled     = false
    clearInterval(iv)
  }
}, 1000)

if (btn) {
  btn.addEventListener('click', () => {
    allowLuarmorOnce(targetUrl, 1500)
    try { location.href = targetUrl } catch (_) { window.open(targetUrl, '_self') }
  })
}
```

}

function handleLuarmorTarget(url) {
const target = String(url)
if (isLuarmorAllowedNow(target)) {
__vwLuarmorAllowOnceUrl = ‘’
__vwLuarmorAllowUntil   = 0
return false
}
if (HOST === SITE_HOST) {
const ret = getBypassReturnUrl()
if (ret) {
copyTextSilent(target).then(() => {
const backUrl = buildReturnWithRedirect(ret, target)
try { location.href = backUrl } catch (_) { window.open(backUrl, ‘_self’) }
})
return true
}
}
renderLuarmorNextUI(target, Number.isFinite(LuarmorWaitTime) ? LuarmorWaitTime : 20)
return true
}

function installLuarmorNavigationGuard() {
if (window.**VW_LUARMOR_GUARD_INSTALLED**) return
window.**VW_LUARMOR_GUARD_INSTALLED** = true

```
const go = url => { if (!isLuarmorUrl(url)) return false; return handleLuarmorTarget(url) }

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
    if (go(url)) return; return origAssign.call(this, url)
  }
} catch (_) {}

try {
  const origReplace = Location.prototype.replace
  Location.prototype.replace = function (url) {
    if (go(url)) return; return origReplace.call(this, url)
  }
} catch (_) {}

try {
  const origHrefDesc = Object.getOwnPropertyDescriptor(Location.prototype, 'href')
  if (origHrefDesc && origHrefDesc.set && origHrefDesc.get) {
    Object.defineProperty(Location.prototype, 'href', {
      configurable: true, enumerable: true,
      get: function ()    { return origHrefDesc.get.call(this) },
      set: function (url) { if (go(url)) return; return origHrefDesc.set.call(this, url) }
    })
  }
} catch (_) {}
```

}

/* ─────────────────────────────────────────────────────────
Decode helper
───────────────────────────────────────────────────────── */
function decodeURIxor(encodedString, prefixLength = 5) {
const base64Decoded  = atob(encodedString)
const prefix         = base64Decoded.substring(0, prefixLength)
const encodedPortion = base64Decoded.substring(prefixLength)
const prefixLen      = prefix.length
const out            = new Array(encodedPortion.length)
for (let i = 0; i < encodedPortion.length; i++) {
out[i] = String.fromCharCode(encodedPortion.charCodeAt(i) ^ prefix.charCodeAt(i % prefixLen))
}
return out.join(’’)
}

/* ─────────────────────────────────────────────────────────
Overlay UI (lootlink bypass in progress)
───────────────────────────────────────────────────────── */
let uiInjected = false
let bypassStart = performance.now()

const uiHTML = `
<div id="vortixWorldOverlay">
<div class="vw-header-bar">
<div class="vw-title">
<img src="${ICON_URL}" class="vw-header-icon" alt="">
VortixWorld
</div>
<div class="vw-toggle-container" style="pointer-events:auto;user-select:none;display:flex;align-items:center;gap:10px;font-size:12px;color:#64748b;font-weight:700;background:rgba(255,255,255,0.04);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);padding:7px 14px;border-radius:999px;border:1px solid rgba(255,255,255,0.07);">
<span style="color:#64748b;font-size:12px;font-weight:700;">AutoRedirect</span>
<label style="position:relative;display:inline-block;width:40px;height:20px;pointer-events:auto;flex-shrink:0;">
<input type="checkbox" id="vwAutoToggle" style="opacity:0;width:100%;height:100%;position:absolute;top:0;left:0;cursor:pointer;z-index:2147483651;margin:0;">
<span id="vwAutoTrack" style="position:absolute;top:0;left:0;right:0;bottom:0;background:#1e293b;transition:.25s;border-radius:999px;pointer-events:none;border:1px solid rgba(255,255,255,0.08);"></span>
<span id="vwAutoKnob"  style="position:absolute;height:14px;width:14px;left:3px;bottom:3px;background:#3b82f6;transition:.25s;border-radius:50%;pointer-events:none;"></span>
</label>
</div>
</div>

```
  <div class="vw-main-content">
    <div class="vw-glass-card">
      <div class="vw-loader-wrap">
        <div class="vw-loader-outer"></div>
        <div class="vw-loader-inner"></div>
      </div>
      <div id="vwStatus"    class="vw-status">Initializing…</div>
      <div id="vwSubStatus" class="vw-substatus">Waiting for page to load</div>
    </div>
  </div>
</div>
```

`

function injectUI() {
if (uiInjected && document.getElementById(‘vortixWorldOverlay’)) return
const existing = document.getElementById(‘vortixWorldOverlay’)
if (existing) existing.remove()

```
const styleId = 'vortixWorldStyles'
if (!document.getElementById(styleId)) {
  const s = document.createElement('style')
  s.id = styleId
  s.textContent = SHARED_UI_CSS
  ;(document.head || document.documentElement).appendChild(s)
}

const wrapper = document.createElement('div')
wrapper.innerHTML = uiHTML
const overlay = wrapper.firstElementChild

let container = document.body
if (!container) {
  container = document.createElement('body')
  document.documentElement.appendChild(container)
}
container.appendChild(overlay)
document.documentElement.style.overflow = 'hidden'
if (document.body) document.body.style.overflow = 'hidden'

uiInjected = true

const toggle = document.getElementById('vwAutoToggle')
const knob   = document.getElementById('vwAutoKnob')
const track  = document.getElementById('vwAutoTrack')

const paint = checked => {
  if (track) track.style.background = checked ? '#3b82f6' : '#1e293b'
  if (knob)  knob.style.transform  = checked ? 'translateX(20px)' : 'translateX(0px)'
}

if (toggle) {
  toggle.checked = isAutoRedirect
  paint(isAutoRedirect)
  toggle.addEventListener('change', e => {
    isAutoRedirect = e.target.checked
    localStorage.setItem(VW_KEYS.autoRedirect, isAutoRedirect)
    paint(isAutoRedirect)
  })
}
```

}

function updateStatus(main, sub) {
if (!document.getElementById(‘vortixWorldOverlay’)) injectUI()
const m = document.getElementById(‘vwStatus’)
const s = document.getElementById(‘vwSubStatus’)
if (m) m.textContent = main
if (s) s.textContent = sub
}

function handleBypassSuccess(url, timeSecondsStr) {
const timeLabel = timeSecondsStr || ((performance.now() - bypassStart) / 1000).toFixed(2)
if (isLuarmorUrl(url)) {
handleLuarmorTarget(url); shutdown(); return
}
if (isAutoRedirect) {
updateStatus(‘🚀 Redirecting…’, `Target acquired in ${timeLabel}s`)
setTimeout(() => { location.href = url }, 1000)
} else {
injectUI()
updateStatus(‘✔️ Bypass Complete!’, String(url))
}
shutdown()
}

/* ─────────────────────────────────────────────────────────
WebSocket
───────────────────────────────────────────────────────── */
class RobustWebSocket {
constructor(url, options = {}) {
this.url              = url
this.reconnectDelay   = options.initialDelay || CONFIG.INITIAL_RECONNECT_DELAY
this.maxDelay         = options.maxDelay     || CONFIG.MAX_RECONNECT_DELAY
this.heartbeatInterval= options.heartbeat    || CONFIG.HEARTBEAT_INTERVAL
this.maxRetries       = options.maxRetries   || 5
this.ws = null; this.reconnectTimeout = null; this.heartbeatTimer = null; this.retryCount = 0
}

```
connect() {
  if (isShutdown) return
  try {
    this.ws = new WebSocket(this.url)
    this.ws.onopen    = ()  => this.onOpen()
    this.ws.onmessage = e   => this.onMessage(e)
    this.ws.onclose   = ()  => this.handleReconnect()
    this.ws.onerror   = e   => this.onError(e)
  } catch (e) { Logger.error('Unhandled exception thrown', e); this.handleReconnect() }
}

onOpen() {
  if (isShutdown) return
  Logger.info('WebSocket connection opened', this.url)
  this.retryCount = 0; this.reconnectDelay = CONFIG.INITIAL_RECONNECT_DELAY
  if (this.reconnectTimeout) { clearTimeout(this.reconnectTimeout); cleanupManager.timeouts.delete(this.reconnectTimeout); this.reconnectTimeout = null }
  this.sendHeartbeat()
  this.heartbeatTimer = cleanupManager.setInterval(() => {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) this.sendHeartbeat()
    else { clearInterval(this.heartbeatTimer) }
  }, this.heartbeatInterval)
}

sendHeartbeat() {
  if (this.ws && this.ws.readyState === WebSocket.OPEN) {
    this.ws.send('0'); Logger.info('WebSocket heartbeat sent', 'Keepalive')
  }
}

handleReconnect() {
  if (isShutdown) return
  if (this.heartbeatTimer) { clearInterval(this.heartbeatTimer); cleanupManager.intervals.delete(this.heartbeatTimer); this.heartbeatTimer = null }
  if (this.retryCount >= this.maxRetries) { Logger.error('WebSocket fatal error', 'Max retries exceeded'); return }
  this.retryCount++
  const delay = Math.min(this.reconnectDelay * Math.pow(2, this.retryCount - 1), this.maxDelay)
  Logger.warn('WebSocket reconnecting', `Retry ${this.retryCount} in ${delay}ms`)
  this.reconnectTimeout = cleanupManager.setTimeout(() => { this.connect() }, delay)
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
      } catch (e) { Logger.error('Critical decode failure', e) }
    }
  }
}

onError(error) { Logger.error('WebSocket fatal error', error) }

disconnect() {
  if (this.heartbeatTimer)   { clearInterval(this.heartbeatTimer);   cleanupManager.intervals.delete(this.heartbeatTimer);   this.heartbeatTimer   = null }
  if (this.reconnectTimeout) { clearTimeout(this.reconnectTimeout);  cleanupManager.timeouts.delete(this.reconnectTimeout);  this.reconnectTimeout = null }
  if (this.ws) this.ws.close()
}
```

}

const state = { processStartTime: Date.now() }

/* ─────────────────────────────────────────────────────────
Task detection
───────────────────────────────────────────────────────── */
function detectTaskInfo() {
let countdownSeconds = 60, taskName = ‘Processing’
try {
for (const img of document.querySelectorAll(‘img’)) {
const src = (img.src || ‘’).toLowerCase()
if      (src.includes(‘eye.png’))   { countdownSeconds = 13; taskName = ‘View Content’; break }
else if (src.includes(‘bell.png’))  { countdownSeconds = 30; taskName = ‘Notification’; break }
else if (src.includes(‘apps.png’) || src.includes(‘fire.png’)) { countdownSeconds = 60; taskName = ‘App Install’; break }
else if (src.includes(‘gamers.png’)){ countdownSeconds = 90; taskName = ‘Gaming Offer’; break }
}
} catch (_) {}
return { countdownSeconds, taskName }
}

function modifyParentElement(targetElement) {
const parentElement = targetElement.parentElement
if (!parentElement) return

```
const { countdownSeconds, taskName } = detectTaskInfo()
state.processStartTime = Date.now()
bypassStart = performance.now()

parentElement.innerHTML = ''
parentElement.style.cssText = 'height:0!important;overflow:hidden!important;visibility:hidden!important;'

injectUI()
updateStatus(`⏳ ${taskName}…`, `Estimated ${countdownSeconds} seconds remaining…`)

let remaining = countdownSeconds
const timer = cleanupManager.setInterval(() => {
  remaining--
  const last = logStacks.countdown.lastRemaining
  if (last === null || last - remaining >= 5 || remaining <= 5) {
    logStacks.countdown.lastRemaining = remaining
    Logger.info('Countdown progress snapshot', `${remaining}s remaining`)
  }
  updateStatus('🔄 Bypassing…', `Estimated ${remaining} seconds remaining…`)
  if (remaining <= 0) { clearInterval(timer); cleanupManager.intervals.delete(timer) }
}, CONFIG.COUNTDOWN_INTERVAL)
```

}

function setupOptimizedObserver() {
const targetContainer = document.body || document.documentElement
const unlockText = [‘UNLOCK CONTENT’, ‘Unlock Content’]

```
const observer = new MutationObserver((mutations, obs) => {
  if (isShutdown) { obs.disconnect(); return }
  for (const mutation of mutations) {
    if (mutation.type !== 'childList') continue
    const added = Array.from(mutation.addedNodes).filter(n => n.nodeType === 1)
    const found = added
      .flatMap(el => [el, ...Array.from(el.querySelectorAll('*'))])
      .find(el => { const t = el.textContent; return t && unlockText.some(u => t.includes(u)) })
    if (found) { modifyParentElement(found); obs.disconnect(); return }
  }
})
window.bypassObserver = observer
observer.observe(targetContainer, { childList: true, subtree: true })

const existing = Array.from(document.querySelectorAll('*'))
  .find(el => { const t = el.textContent; return t && unlockText.some(u => t.includes(u)) })
if (existing) { modifyParentElement(existing); observer.disconnect() }
```

}

/* ─────────────────────────────────────────────────────────
TC / WebSocket processing
───────────────────────────────────────────────────────── */
function processTcResponse(data, originalFetch) {
let urid = ‘’, task_id = ‘’, action_pixel_url = ‘’
try { data.forEach(item => { urid = item.urid; task_id = 54; action_pixel_url = item.action_pixel_url }) }
catch (_) { return false }
if (typeof KEY === ‘undefined’ || typeof TID === ‘undefined’) return false

```
const wsUrl = `wss://${urid.substr(-5) % 3}.${INCENTIVE_SERVER_DOMAIN}/c?uid=${urid}&cat=${task_id}&key=${KEY}`
const ws = new RobustWebSocket(wsUrl, {
  initialDelay: CONFIG.INITIAL_RECONNECT_DELAY,
  maxDelay:     CONFIG.MAX_RECONNECT_DELAY,
  heartbeat:    CONFIG.HEARTBEAT_INTERVAL,
  maxRetries:   3
})
window.activeWebSocket = ws
ws.connect()

try { navigator.sendBeacon(`https://${urid.substr(-5) % 3}.${INCENTIVE_SERVER_DOMAIN}/st?uid=${urid}&cat=${task_id}`) } catch (_) {}
if (action_pixel_url) originalFetch(action_pixel_url).catch(() => {})
originalFetch(`https://${INCENTIVE_SYNCER_DOMAIN}/td?ac=1&urid=${urid}&&cat=${task_id}&tid=${TID}`).catch(() => {})
return true
```

}

function initLocalLootlinkFetchOverride() {
const originalFetch = window.fetch
window.fetch = function (url, config) {
try {
const urlStr = typeof url === ‘string’ ? url : url?.url ?? ‘’
if (typeof INCENTIVE_SYNCER_DOMAIN === ‘undefined’ || typeof INCENTIVE_SERVER_DOMAIN === ‘undefined’)
return originalFetch(url, config)
if (urlStr.includes(`${INCENTIVE_SYNCER_DOMAIN}/tc`)) {
return originalFetch(url, config)
.then(response => {
if (!response.ok) return response
return response.clone().json()
.then(data => {
processTcResponse(data, originalFetch)
return new Response(JSON.stringify(data), {
status: response.status, statusText: response.statusText, headers: response.headers
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

function sendTcManually() {
if (window.__vw_tc_processed) return
const originalFetch = window.fetch
const syncDomain    = window.INCENTIVE_SYNCER_DOMAIN
if (!syncDomain) return
const tcUrl = `https://${syncDomain}/tc`
Logger.info(‘Sending manual /tc request’, tcUrl)
fetch(tcUrl, { credentials: ‘include’, headers: { ‘User-Agent’: navigator.userAgent } })
.then(res => { if (!res.ok) throw new Error(`HTTP ${res.status}`); return res.json() })
.then(data => { window.__vw_tc_processed = true; processTcResponse(data, originalFetch); Logger.info(‘Manual /tc processed’) })
.catch(err => { Logger.warn(‘Manual /tc failed’, err.message) })
}

/* ─────────────────────────────────────────────────────────
runLocalLootlinkBypass
───────────────────────────────────────────────────────── */
function runLocalLootlinkBypass() {
Logger.info(‘VortixWorld local lootlinks bypass enabled’)
installLuarmorNavigationGuard()

```
const startManualCheck = () => {
  let attempts = 0
  const interval = setInterval(() => {
    if (window.INCENTIVE_SYNCER_DOMAIN && window.INCENTIVE_SERVER_DOMAIN && window.KEY && window.TID) {
      clearInterval(interval); sendTcManually()
    } else if (attempts >= 100) {
      clearInterval(interval); Logger.warn('Manual /tc: globals not found after 10s, relying on page fetch')
    }
    attempts++
  }, 100)
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    injectUI(); setupOptimizedObserver(); initLocalLootlinkFetchOverride(); startManualCheck()
    updateStatus('⏳ Loading…', 'Preparing bypass')
  })
} else {
  injectUI(); setupOptimizedObserver(); initLocalLootlinkFetchOverride(); startManualCheck()
  updateStatus('⏳ Loading…', 'Preparing bypass')
}
window.addEventListener('beforeunload', () => cleanupManager.clearAll())
```

}

/* ─────────────────────────────────────────────────────────
runLocalTpiLiBypass
───────────────────────────────────────────────────────── */
async function runLocalTpiLiBypass() {
Logger.info(‘VortixWorld local tpi.li bypass enabled’)
injectUI()
updateStatus(‘🔍 Fetching tpi.li link…’, ‘Extracting token, please wait’)
try {
const alias = location.pathname.slice(1)
if (!alias) throw new Error(‘No alias found in URL’)
const response = await fetch(location.href, { headers: { ‘User-Agent’: ‘Mozilla/5.0’ } })
const html = await response.text()
let tokenMatch = html.match(/name=“token”\s+value=”([^”]+)”/)
if (!tokenMatch) tokenMatch = html.match(/value=”([^”]+)”\s+name=“token”/)
if (!tokenMatch) throw new Error(‘Token not found in page’)
const token = tokenMatch[1]
const offset = 40 + 4 + alias.length + 4
if (token.length < offset) throw new Error(‘Token too short’)
const finalUrl = atob(token.slice(offset))
if (!finalUrl || !finalUrl.startsWith(‘http’)) throw new Error(‘Invalid final URL’)
handleBypassSuccess(finalUrl, ‘tpi.li’)
} catch (err) {
Logger.error(‘tpi.li bypass failed’, err.message)
updateStatus(‘❌ Bypass failed’, err.message)
const overlay = document.getElementById(‘vortixWorldOverlay’)
if (overlay && overlay.querySelector(’.vw-glass-card’)) {
const p = document.createElement(‘p’)
p.innerHTML = `<a href="${location.href}" style="color:#fb923c;font-weight:700;text-decoration:none;">Click here to continue manually →</a>`
p.style.cssText = ‘margin-top:18px;font-size:13px;’
overlay.querySelector(’.vw-glass-card’).appendChild(p)
}
}
}

/* ─────────────────────────────────────────────────────────
runRedirectBypass  –  redesigned redirect countdown UI
───────────────────────────────────────────────────────── */
function runRedirectBypass() {
const cfgTime = RedirectWaitTime && RedirectWaitTime > 0 ? RedirectWaitTime : 10
const config  = { time: cfgTime }
const TARGET  = ‘https://’ + SITE_HOST + ‘/userscript.html’
installLuarmorNavigationGuard()

```
const originalCreateElement = document.createElement.bind(document)
document.createElement = function (elementName) {
  const el = originalCreateElement(elementName)
  if (elementName && elementName.toLowerCase() === 'script') el.setAttribute('type', 'text/plain')
  return el
}

const params        = new URLSearchParams(location.search)
const redirectParam = params.get('redirect')

if (redirectParam) {
  const rp = String(redirectParam)

  /* Flux special case */
  if (rp.includes('https://flux.li/android/external/main.php')) {
    document.documentElement.innerHTML = `
      <html lang="en">
        <head>
          <title>VortixWorld USERSCRIPT</title>
          <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
          <style>
            *{margin:0;padding:0;box-sizing:border-box}
            html,body{height:100%;overflow:hidden;background:linear-gradient(160deg,#060812,#0a0d1c,#0d1124);
              color:#e2e8f0;font-family:'Inter',system-ui,-apple-system,'Segoe UI',Roboto,Arial,sans-serif;
              display:flex;align-items:center;justify-content:center;padding:20px;}
            .card{
              max-width:680px;width:100%;padding:36px 32px;border-radius:24px;
              background:rgba(255,255,255,0.04);
              backdrop-filter:blur(32px);-webkit-backdrop-filter:blur(32px);
              border:1px solid rgba(255,255,255,0.09);text-align:center;
              box-shadow:0 24px 80px rgba(0,0,0,0.5);
            }
            h1{color:#f1f5f9;font-size:24px;font-weight:900;margin-bottom:10px;letter-spacing:-0.5px;}
            p{color:#64748b;font-size:14px;margin-bottom:22px;line-height:1.6;}
            a{
              display:inline-block;color:#fff;
              background:linear-gradient(135deg,#1d4ed8,#3b82f6);
              padding:13px 24px;border-radius:13px;text-decoration:none;
              font-weight:700;font-size:14px;
              box-shadow:0 6px 20px rgba(59,130,246,0.3);
              transition:transform .2s,box-shadow .2s;
            }
            a:hover{transform:translateY(-2px);box-shadow:0 10px 28px rgba(59,130,246,0.4);}
            @media(max-width:480px){.card{padding:26px 20px;border-radius:18px;}h1{font-size:20px;}}
          </style>
        </head>
        <body>
          <div class="card">
            <h1>Manual Redirect Required</h1>
            <p>This target requires manual redirect due to extra security checks.</p>
            <a href="${rp}">Continue →</a>
          </div>
        </body>
      </html>`
    return
  }

  if (isLuarmorUrl(rp)) { handleLuarmorTarget(rp); return }

  try { location.href = rp } catch (_) { window.open(rp, '_blank', 'noopener,noreferrer') }
  return
}

/* Not yet on allowed host – redirect to bypass site */
if (!isAllowedHost()) {
  const returnUrl = location.href
  setBypassReturnUrl(returnUrl)
  copyTextSilent(returnUrl)
  const targetUrl = `${TARGET}?url=${encodeURIComponent(returnUrl)}&time=${encodeURIComponent(config.time)}&return=${encodeURIComponent(returnUrl)}`
  setTimeout(() => { location.href = targetUrl }, 1200)
  return
}

/* Countdown UI */
document.documentElement.innerHTML = `
  <html lang="en">
    <head>
      <title>VortixWorld USERSCRIPT</title>
      <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
      <style>${SHARED_UI_CSS}</style>
    </head>
    <body>
      <div id="vortixWorldOverlay">
        <div class="vw-header-bar">
          <div class="vw-title">
            <img src="${ICON_URL}" class="vw-header-icon" alt="">
            VortixWorld
          </div>
        </div>

        <div class="vw-main-content">
          <div class="vw-glass-card">
            <div class="vw-loader-wrap">
              <div class="vw-loader-outer"></div>
              <div class="vw-loader-inner"></div>
            </div>
            <div id="vwStatus"    class="vw-status">Redirecting…</div>
            <div id="vwSubStatus" class="vw-substatus">
              Continuing in <strong id="vwCountNum" style="color:#93c5fd">${config.time}</strong> seconds…
            </div>
            <div style="width:100%;margin-top:10px;">
              <div class="vw-progress-track">
                <div class="vw-progress-bar" id="vwProgressBar" style="width:0%"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </body>
  </html>
`

const timerEl    = document.getElementById('vwSubStatus')
const countEl    = document.getElementById('vwCountNum')
const barEl      = document.getElementById('vwProgressBar')
let   remaining  = config.time
const total      = config.time

/* Kick off progress bar */
requestAnimationFrame(() => {
  requestAnimationFrame(() => { if (barEl) barEl.style.width = '100%' })
})

const interval = setInterval(() => {
  remaining--
  if (countEl) countEl.textContent = remaining
  if (remaining <= 0) {
    clearInterval(interval)
    if (timerEl) timerEl.textContent = 'Redirecting now…'
    const returnUrl = location.href
    setBypassReturnUrl(returnUrl)
    copyTextSilent(returnUrl)
    location.href = `${TARGET}?url=${encodeURIComponent(returnUrl)}&time=${encodeURIComponent(config.time)}&return=${encodeURIComponent(returnUrl)}`
  }
}, 1000)
```

}

/* ─────────────────────────────────────────────────────────
Entry point
───────────────────────────────────────────────────────── */
function main() {
if (window.VW_CONFIG) {
if (typeof window.VW_CONFIG.redirectWaitTime === ‘number’) {
RedirectWaitTime = window.VW_CONFIG.redirectWaitTime
localStorage.setItem(VW_KEYS.redirectWaitTime, String(RedirectWaitTime))
}
if (typeof window.VW_CONFIG.luarmorWaitTime === ‘number’) {
LuarmorWaitTime = window.VW_CONFIG.luarmorWaitTime
localStorage.setItem(VW_KEYS.luarmorWaitTime, String(LuarmorWaitTime))
}
}

```
if (HOST === SITE_HOST) installLuarmorNavigationGuard()
if (isTpiLi())          { runLocalTpiLiBypass();  return }
if (isLootHost())       { runLocalLootlinkBypass(); return }
if (isAllowedHost())    { runRedirectBypass();      return }
```

}

if (document.readyState === ‘loading’) document.addEventListener(‘DOMContentLoaded’, main)
else main()

})()