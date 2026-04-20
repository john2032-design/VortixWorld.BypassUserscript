const HOST = (location.hostname || '').toLowerCase().replace(/^www\./, '');
const ICON_URL = 'https://i.postimg.cc/Y2TmKMf8/2180201F-FB5D-4574-9E55-158B4442F02A.png';
const LOOTLINK_UI_ICON = 'https://i.ibb.co/s0yg2cv/AA1-D3-E03-2205-4572-ACFB-29-B8-B9-DDE381.png';
const SUCCESS_GIF = 'https://cdn3.emoji.gg/emojis/529330-ai-baby.gif';
const ERROR_JPG = 'https://iili.io/Blf65Is.md.jpg';
const ANDROID_UA = 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Mobile Safari/537.36';
const TC_PROXY_URL = 'https://lootlink-backend-b526.onrender.com/tc';
const INCENTIVE_SERVER_DOMAIN = 'onsultingco.com';
const CONFIG = Object.freeze({ HEARTBEAT_INTERVAL: 0.1, INITIAL_RECONNECT_DELAY: 1000, COUNTDOWN_INTERVAL: 1000, FALLBACK_CHECK_DELAY: 15000 });
const VW_KEYS = { autoRedirect: 'vw_auto_redirect' };

const SHARED_UI_CSS = `
  :root {
    --vw-bg: #1e1e1e;
    --vw-glass-bg: #1e1e1e;
    --vw-text: #e0e0e0;
    --vw-text-dim: #a0a0a0;
    --neu-out: 8px 8px 16px #141414, -8px -8px 16px #282828;
    --neu-in: inset 4px 4px 8px #141414, inset -4px -4px 8px #282828;
    --neu-btn: 4px 4px 8px #141414, -4px -4px 8px #282828;
    --neu-btn-active: inset 4px 4px 8px #141414, inset -4px -4px 8px #282828;
  }
  html, body { margin:0; padding:0; height:100%; overflow:hidden; background:var(--vw-bg); }
  #vortixWorldOverlay {
    position:fixed!important; top:0!important; left:0!important; width:100vw!important;
    height:100vh!important; height:100dvh!important; background:var(--vw-bg)!important;
    z-index:2147483647!important; display:flex!important; flex-direction:column!important;
    align-items:center!important; justify-content:center!important;
    font-family:'Inter',system-ui,sans-serif!important; opacity:1!important; visibility:visible!important;
    pointer-events:auto!important; box-sizing:border-box!important; isolation:isolate!important;
  }
  .vw-header-bar {
    position:absolute!important; top:0!important; left:0!important; width:100%!important;
    height:72px!important; padding:0 28px!important; display:flex!important;
    align-items:center!important; justify-content:space-between!important;
    background:var(--vw-bg)!important; box-shadow:0 4px 10px #141414!important; z-index:2147483648!important;
  }
  .vw-title {
    font-weight:700!important; font-size:1.5rem!important; display:flex!important;
    align-items:center!important; gap:12px!important; color:var(--vw-text)!important;
  }
  .vw-header-icon {
    height:36px!important; width:36px!important; border-radius:50%!important;
    object-fit:cover!important; box-shadow:var(--neu-btn)!important;
  }
  .vw-main-content {
    display:flex!important; flex-direction:column!important; align-items:center!important;
    justify-content:center!important; width:100%!important; max-width:520px!important;
    padding:2.5rem!important; background:var(--vw-bg)!important; border-radius:24px!important;
    border:none!important; box-shadow:var(--neu-out)!important; text-align:center!important;
    animation:vw-fade-in .5s cubic-bezier(0.2,0.9,0.4,1.1)!important;
  }
  .vw-icon-img {
    width:96px!important; height:96px!important; border-radius:50%!important;
    margin-bottom:1.5rem!important; object-fit:cover!important; box-shadow:var(--neu-btn)!important;
  }
  .vw-spinner {
    width:48px!important; height:48px!important; border:4px solid #141414!important;
    border-top:4px solid var(--vw-text)!important; border-radius:50%!important;
    animation:spin .8s linear infinite!important; margin-bottom:1.5rem!important; box-shadow:var(--neu-btn)!important;
  }
  @keyframes spin { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }
  .vw-status {
    font-size:1.8rem!important; font-weight:700!important; color:var(--vw-text)!important;
    margin-bottom:.5rem!important;
  }
  .vw-console {
    width:100%; height:120px; overflow-y:auto; background:var(--vw-bg);
    box-shadow:var(--neu-in); border-radius:10px; padding:12px; margin-bottom:15px;
    font-family:'Courier New',monospace; font-size:12px; color:var(--vw-text-dim);
    text-align:left; border-left:3px solid #4ade80;
  }
  .vw-console-line { padding:2px 0; border-bottom:1px solid rgba(74,222,128,.1); }
  .vw-console-line:last-child { border-bottom:none; }
  .vw-countdown {
    font-size:15px; font-weight:700; color:#4ade80; margin-bottom:15px;
    text-transform:uppercase; letter-spacing:1px;
  }
  .vw-url-container {
    width:100%!important; margin:1.5rem 0 1rem 0!important; padding:1rem!important;
    background:var(--vw-bg)!important; border-radius:12px!important; box-shadow:var(--neu-in)!important;
    word-break:break-all!important; font-size:.85rem!important; color:#b3b3b3!important;
    font-family:monospace!important; max-height:100px!important; overflow-y:auto!important;
  }
  .vw-button-group {
    display:flex!important; gap:1rem!important; width:100%!important; margin-top:1rem!important;
  }
  .vw-btn {
    background:var(--vw-bg)!important; color:var(--vw-text)!important; border:none!important;
    box-shadow:var(--neu-btn)!important; padding:.85rem 1rem!important; border-radius:40px!important;
    font-weight:600!important; cursor:pointer!important; transition:all .2s!important;
    font-size:.95rem!important; flex:1;
  }
  .vw-btn-copy { color:#4ade80!important; }
  .vw-btn-proceed { color:var(--vw-text)!important; }
  .vw-btn:hover { filter:brightness(1.1)!important; }
  .vw-btn:active { box-shadow:var(--neu-btn-active)!important; transform:translateY(1px)!important; }
  @keyframes vw-fade-in { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
`;

const cleanupManager = {
  intervals: new Set(), timeouts: new Set(),
  setInterval(fn, delay) { const id = setInterval(fn, delay); this.intervals.add(id); return id; },
  setTimeout(fn, delay) { const id = setTimeout(() => { this.timeouts.delete(id); fn(); }, delay); this.timeouts.add(id); return id; },
  clearAll() { this.intervals.forEach(clearInterval); this.timeouts.forEach(clearTimeout); this.intervals.clear(); this.timeouts.clear(); }
};

let isShutdown = false;
function shutdown() {
  if (isShutdown) return;
  isShutdown = true;
  cleanupManager.clearAll();
  if (window.primaryWebSocket) { window.primaryWebSocket.disconnect(); window.primaryWebSocket = null; }
  if (window.fallbackWebSocket) { window.fallbackWebSocket.disconnect(); window.fallbackWebSocket = null; }
  if (window.activeWebSocket) { window.activeWebSocket.disconnect(); window.activeWebSocket = null; }
}

async function copyTextSilent(text) {
  try { if (navigator.clipboard && window.isSecureContext) { await navigator.clipboard.writeText(String(text)); return true; } } catch (_) {}
  try { const ta = document.createElement('textarea'); ta.value = String(text); ta.style.position='fixed'; ta.style.left='-9999px'; document.body.appendChild(ta); ta.select(); const ok = document.execCommand('copy'); ta.remove(); return ok; } catch (_) { return false; }
}

function escapeHtml(str) {
  return String(str).replace(/[&<>]/g, m => m==='&'?'&amp;':m==='<'?'&lt;':'&gt;');
}
function isAutoRedirectEnabled() {
  const saved = localStorage.getItem(VW_KEYS.autoRedirect);
  return saved !== null ? saved === 'true' : true;
}
function decodeURIxor(encodedString, prefixLength=5) {
  const base64Decoded = atob(encodedString);
  const prefix = base64Decoded.substring(0, prefixLength);
  const encodedPortion = base64Decoded.substring(prefixLength);
  const decodedChars = new Array(encodedPortion.length);
  for (let i=0; i<encodedPortion.length; i++) decodedChars[i] = String.fromCharCode(encodedPortion.charCodeAt(i) ^ prefix.charCodeAt(i%prefix.length));
  return decodedChars.join('');
}

const originalFetch = window.fetch;
window.fetch = function(url, config) {
  const urlStr = typeof url === 'string' ? url : (url && url.url ? url.url : '');
  if (urlStr.includes('nerventualken.com/tc') || urlStr.includes('INCENTIVE_SYNCER_DOMAIN/tc')) {
    let bodyObj = {};
    if (config && config.body) {
      try { bodyObj = typeof config.body === 'string' ? JSON.parse(config.body) : config.body; } catch(e) {}
    }
    bodyObj.bl = [18,2,33,7,21,49,48];
    return originalFetch(TC_PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyObj)
    }).then(response => {
      if (!response.ok) throw new Error(`Proxy returned ${response.status}`);
      return response.clone().json().then(data => {
        window.__vw_tc_response = data;
        if (!keyCheckComplete) {
          Logger.info('Key check not complete, storing /tc response for later');
          pendingTcData = data;
        } else if (keyIsValid) {
          window.__vw_tc_processed = false;
          processTcResponse(data, originalFetch);
        } else {
          Logger.warn('Key invalid, ignoring /tc response');
        }
        return new Response(JSON.stringify(data), { status:200, headers:{'Content-Type':'application/json'} });
      });
    }).catch(err => {
      console.error('[VW] Proxy fetch failed:', err);
      return originalFetch(url, config);
    });
  }
  return originalFetch(url, config);
};
window.__vw_fetch_interceptor_active = true;

let uiInjected = false, methodStartTime = null, countdownTimerId = null, currentRemainingSeconds = 60;
let keyIsValid = false, keyCheckComplete = false, pendingTcData = null;
let consoleLines = [], bypassActive = false, lootlinkResolved = false;

function addConsoleLine(text) {
  consoleLines.push(text); if (consoleLines.length>8) consoleLines.shift();
  const el = document.getElementById('vwConsoleOutput');
  if (el) { el.innerHTML = consoleLines.map(l => `<div class="vw-console-line">${l}</div>`).join(''); el.scrollTop = el.scrollHeight; }
}
function injectUI(iconUrl=LOOTLINK_UI_ICON) {
  if (!document.body) { setTimeout(()=>injectUI(iconUrl),50); return; }
  if (document.getElementById('vortixWorldOverlay') || uiInjected) return;
  const style = document.createElement('style'); style.id = 'vortixWorldStyles'; style.textContent = SHARED_UI_CSS;
  document.head.appendChild(style);
  const overlay = document.createElement('div'); overlay.id = 'vortixWorldOverlay';
  overlay.innerHTML = `
    <div class="vw-header-bar"><div class="vw-title"><img src="${ICON_URL}" class="vw-header-icon">VortixWorld</div></div>
    <div class="vw-main-content">
      <img src="${iconUrl}" class="vw-icon-img" onerror="this.onerror=null;this.src='${ICON_URL}'">
      <div class="vw-spinner" id="vwSpinner"></div>
      <div id="vwStatus" class="vw-status">Preparing bypass...</div>
      <div class="vw-console" id="vwConsoleOutput"></div>
      <div id="vwCountdown" class="vw-countdown" style="display:none;"></div>
    </div>`;
  document.body.appendChild(overlay);
  document.body.style.overflow = document.documentElement.style.overflow = 'hidden';
  uiInjected = true;
  addConsoleLine('> Initializing bypass...');
}
function updateStatus(main, sub) {
  if (!document.getElementById('vortixWorldOverlay')) injectUI();
  const m = document.getElementById('vwStatus'); if (m) m.innerText = main;
  if (sub) addConsoleLine(`> ${sub}`);
  const spinner = document.getElementById('vwSpinner');
  if (spinner) spinner.style.display = (main.includes('Complete')||main.includes('Redirecting')||main.includes('Failed'))?'none':'block';
  if (main.includes('Method 1')||main.includes('Task completed')||main.includes('Establishing')) bypassActive = true;
}
function startCountdown(sec) {
  if (countdownTimerId) clearInterval(countdownTimerId);
  currentRemainingSeconds = sec;
  const el = document.getElementById('vwCountdown');
  if (el) { el.style.display='block'; el.innerText = `Time Remaining: ${sec}s`; }
  countdownTimerId = setInterval(() => {
    currentRemainingSeconds = Math.max(0, currentRemainingSeconds-1);
    if (el) { el.innerText = `Time Remaining: ${currentRemainingSeconds}s`; if (currentRemainingSeconds<=0) el.style.display='none'; }
    if (currentRemainingSeconds<=0) { clearInterval(countdownTimerId); countdownTimerId = null; }
  }, 1000);
}
function showCompleteUI(finalUrl, timeLabel, isSuccess=true, errorMsg='') {
  if (countdownTimerId) { clearInterval(countdownTimerId); countdownTimerId = null; }
  const el = document.getElementById('vwCountdown'); if (el) el.style.display = 'none';
  const overlay = document.getElementById('vortixWorldOverlay');
  if (!overlay) return;
  const main = overlay.querySelector('.vw-main-content');
  if (!main) return;
  const icon = main.querySelector('.vw-icon-img'); if (icon) icon.style.display = 'none';
  const spinner = main.querySelector('#vwSpinner'); if (spinner) spinner.style.display = 'none';
  const statusIcon = isSuccess ? SUCCESS_GIF : ERROR_JPG;
  const statusText = isSuccess ? '✔️ Bypass Complete!' : '❌ Bypass Failed';
  const subText = isSuccess ? `Completed in ${timeLabel}s` : errorMsg;
  main.innerHTML = `
    <img src="${statusIcon}" class="vw-icon-img" style="display:block" onerror="this.onerror=null;this.src='${ICON_URL}'">
    <div id="vwStatus" class="vw-status">${statusText}</div>
    <div class="vw-console" id="vwConsoleOutput">${consoleLines.map(l=>`<div class="vw-console-line">${l}</div>`).join('')}</div>
    <div class="vw-substatus" style="font-size:14px;color:#a0a0a0;margin-bottom:20px;background:#1e1e1e;box-shadow:inset 4px 4px 8px #141414,inset -4px -4px 8px #282828;padding:10px 15px;border-radius:10px;font-weight:600;">${subText}</div>
    ${isSuccess ? `<div class="vw-url-container" id="vwUrlContainer">${escapeHtml(finalUrl)}</div>` : ''}
    <div class="vw-button-group">
      ${isSuccess ? `<button id="vwCopyBtn" class="vw-btn vw-btn-copy">📋 Copy URL</button>` : ''}
      <button id="vwProceedBtn" class="vw-btn vw-btn-proceed">${isSuccess?'➡️ Proceed':'OK'}</button>
    </div>`;
  if (isSuccess) document.getElementById('vwCopyBtn').addEventListener('click', ()=>{ copyTextSilent(finalUrl).then(()=>showToast('URL copied',false,'📋')); });
  document.getElementById('vwProceedBtn').addEventListener('click', ()=>{ if(isSuccess) location.href=finalUrl; else overlay.remove(); });
  bypassActive = false; lootlinkResolved = true;
}
function handleBypassSuccess(url, timeSecondsStr) {
  let timeLabel = timeSecondsStr || (methodStartTime?((performance.now()-methodStartTime)/1000).toFixed(2):'0.00');
  if (countdownTimerId) { clearInterval(countdownTimerId); countdownTimerId = null; }
  const el = document.getElementById('vwCountdown'); if (el) el.style.display = 'none';
  if (isAutoRedirectEnabled()) {
    updateStatus('Redirecting...', `Target URL acquired (${timeLabel}s)`);
    showToast(`Bypassed in ${timeLabel}s`, false, SUCCESS_GIF);
    setTimeout(()=>{ location.href = url; }, 100);
  } else {
    showCompleteUI(url, timeLabel, true);
  }
  shutdown();
}
function handleBypassError(errorMsg) {
  if (countdownTimerId) { clearInterval(countdownTimerId); countdownTimerId = null; }
  updateStatus('❌ Bypass failed', errorMsg);
  showToast(`Bypass failed: ${errorMsg}`, true, ERROR_JPG);
  injectUI();
  showCompleteUI('', '', false, errorMsg);
}

class RobustWebSocket {
  constructor(url, opts={}) {
    this.url = url;
    this.reconnectDelay = opts.initialDelay || 1000;
    this.heartbeatInterval = 1000;
    this.connectionTimeout = opts.connectionTimeout || 3000;
    this.maxReconnectAttempts = 2;
    this.messageTimeout = 20000;
    this.ws = null; this.reconnectTimeout = null; this.heartbeatTimer = null; this.connectionTimer = null; this.messageTimer = null;
    this.reconnectAttempts = 0; this.resolved = false; this.manualDisconnect = false;
    this.onConnectionTimeout = opts.onConnectionTimeout || null;
  }
  connect() {
    if (isShutdown || this.manualDisconnect || !keyIsValid || this.reconnectAttempts>=this.maxReconnectAttempts) return;
    this.clearConnectionTimer();
    this.connectionTimer = setTimeout(()=>{
      if (!this.resolved) {
        Logger.warn('WebSocket connection timeout', this.url);
        if (this.ws) { this.ws.close(); this.ws = null; }
        if (this.onConnectionTimeout) this.onConnectionTimeout(); else this.scheduleReconnect();
      }
    }, this.connectionTimeout);
    try {
      Logger.websocket('Connecting WebSocket', this.url);
      this.ws = new WebSocket(this.url);
      this.ws.onopen = ()=>this.onOpen();
      this.ws.onmessage = e=>this.onMessage(e);
      this.ws.onclose = ()=>this.onClose();
      this.ws.onerror = e=>Logger.error('WebSocket fatal error', e.message||'Unknown');
    } catch(e) {
      Logger.error('WebSocket construction error', e.message);
      this.clearConnectionTimer();
      this.scheduleReconnect();
    }
  }
  clearConnectionTimer() { if (this.connectionTimer) { clearTimeout(this.connectionTimer); this.connectionTimer = null; } }
  clearMessageTimer() { if (this.messageTimer) { clearTimeout(this.messageTimer); this.messageTimer = null; } }
  onOpen() {
    this.clearConnectionTimer();
    this.reconnectAttempts = 0;
    if (this.reconnectTimeout) { clearTimeout(this.reconnectTimeout); this.reconnectTimeout = null; }
    Logger.websocket('WebSocket connection opened', this.url);
    this.sendHeartbeat();
    this.startHeartbeat();
    this.messageTimer = setTimeout(()=>{
      if (!this.resolved) {
        Logger.warn('WebSocket message timeout (no r:)', this.url);
        this.disconnect();
        if (this.onConnectionTimeout) this.onConnectionTimeout();
      }
    }, this.messageTimeout);
  }
  onClose() {
    this.clearConnectionTimer(); this.clearMessageTimer(); this.stopHeartbeat();
    if (isShutdown || this.manualDisconnect || !keyIsValid) return;
    this.scheduleReconnect();
  }
  onMessage(e) {
    if (isShutdown || !keyIsValid) return;
    if (e.data && e.data.includes('r:')) {
      this.clearMessageTimer();
      let link = e.data.replace('r:', '').trim();
      Logger.info('Received publisher link', link);
      if (link) {
        let final = link;
        if (/^[A-Za-z0-9+/=]+$/.test(link)) {
          try { final = decodeURIComponent(decodeURIxor(link)); } catch {}
        }
        if (final && final.startsWith('http')) {
          this.resolved = true;
          this.disconnect();
          handleBypassSuccess(final, null);
        }
      }
    }
  }
  sendHeartbeat() { if (this.ws && this.ws.readyState===WebSocket.OPEN) this.ws.send('0'); }
  startHeartbeat() { this.stopHeartbeat(); this.heartbeatTimer = setInterval(()=>this.sendHeartbeat(), this.heartbeatInterval); }
  stopHeartbeat() { if (this.heartbeatTimer) { clearInterval(this.heartbeatTimer); this.heartbeatTimer = null; } }
  scheduleReconnect() {
    if (isShutdown || this.manualDisconnect || !keyIsValid) return;
    if (this.reconnectAttempts>=this.maxReconnectAttempts) return;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts);
    this.reconnectAttempts++;
    Logger.warn(`WebSocket reconnect ${this.reconnectAttempts} in ${delay}ms`);
    this.reconnectTimeout = setTimeout(()=>this.connect(), delay);
  }
  disconnect() {
    this.clearConnectionTimer(); this.clearMessageTimer(); this.manualDisconnect = true; this.stopHeartbeat();
    if (this.reconnectTimeout) { clearTimeout(this.reconnectTimeout); this.reconnectTimeout = null; }
    if (this.ws) { this.ws.close(); this.ws = null; }
  }
}

async function completeTaskViaSkippedLol(taskUrl) {
  if (!keyIsValid) return false;
  const payload = { ID:17, URL:taskUrl.startsWith('//')?'https:'+taskUrl:taskUrl };
  Logger.info('Sending request to skipped.lol', JSON.stringify(payload));
  updateStatus('Completing task 17...', 'Contacting skipped.lol');
  const ctrl = new AbortController(); setTimeout(()=>ctrl.abort(), 8000);
  const res = await fetch('https://skipped.lol/api/evade/ll', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload), signal:ctrl.signal });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const text = await res.text();
  Logger.info('Raw response from skipped.lol', text);
  const parsed = JSON.parse(text);
  if (parsed?.status === 'ok') {
    Logger.info('Skipped.lol confirmed task completion');
    updateStatus('Task completed', 'Establishing connection...');
    return true;
  }
  throw new Error('Unexpected response from skipped.lol');
}
function startWebSocketForTask(taskData, isFallback=false, subdomainAttempt=0, sameSubdomainRetry=0) {
  if (!taskData?.urid) return null;
  if (!keyIsValid) return null;
  const { urid, task_id, session_id } = taskData;
  const subIdx = (parseInt(urid.substr(-5)) + subdomainAttempt) % 3;
  let wsUrl = `wss://${subIdx}.${INCENTIVE_SERVER_DOMAIN}/c?uid=${urid}&cat=${task_id}&key=${KEY}`;
  if (session_id) wsUrl += `&session_id=${session_id}`;
  if (typeof is_loot!=='undefined') wsUrl += `&is_loot=${is_loot?'1':'0'}`;
  if (typeof TID!=='undefined') wsUrl += `&tid=${TID}`;
  Logger.info(`Initiating WebSocket (fallback:${isFallback}, attempt:${subdomainAttempt})`, wsUrl);
  const ws = new RobustWebSocket(wsUrl, {
    initialDelay: CONFIG.INITIAL_RECONNECT_DELAY, connectionTimeout:3000, messageTimeout:20000,
    onConnectionTimeout: ()=>{
      if (sameSubdomainRetry<1 && !ws.resolved) {
        startWebSocketForTask(taskData, isFallback, subdomainAttempt, sameSubdomainRetry+1);
      } else if (subdomainAttempt<2 && !ws.resolved) {
        startWebSocketForTask(taskData, isFallback, subdomainAttempt+1, 0);
      } else {
        if (window.primaryWebSocket) { window.primaryWebSocket.disconnect(); window.primaryWebSocket = null; }
        if (window.__vw_fallback_used) return;
        window.__vw_fallback_used = true;
        updateStatus('Method 1 Failed', 'Using Method 2');
        const fallbackTask = selectFallbackTask(window.__vw_tc_response||[]);
        if (fallbackTask?.urid) {
          if (fallbackTask.auto_complete_seconds) startCountdown(fallbackTask.auto_complete_seconds);
          startWebSocketForTask(fallbackTask, true);
        } else handleBypassError('No suitable task found');
      }
    }
  });
  if (isFallback) {
    if (window.fallbackWebSocket) window.fallbackWebSocket.disconnect();
    window.fallbackWebSocket = ws;
  } else {
    if (window.primaryWebSocket) window.primaryWebSocket.disconnect();
    window.primaryWebSocket = ws;
  }
  window.activeWebSocket = ws;
  ws.connect();
  try { navigator.sendBeacon(`https://${subIdx}.${INCENTIVE_SERVER_DOMAIN}/st?uid=${urid}&cat=${task_id}`); } catch(_){}
  fetch(`https://nerventualken.com/td?ac=1&urid=${urid}&cat=${task_id}&tid=${TID}`, {credentials:'include'}).catch(()=>{});
  return ws;
}
function selectFallbackTask(tasks) {
  if (!Array.isArray(tasks)) return null;
  const eligible = tasks.filter(t=>t.task_id!==17);
  if (!eligible.length) return null;
  eligible.sort((a,b)=>(a.auto_complete_seconds||999)-(b.auto_complete_seconds||999));
  return eligible[0];
}
async function verifySession(uuid) {
  if (!uuid) return;
  updateStatus('Verifying session...', 'Preparing anti-bot check');
  try {
    await fetch(`https://${location.hostname}/verify`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({session:uuid}) });
    Logger.info('Session verification sent');
  } catch(e) { Logger.warn('Session verification failed', e.message); }
}
async function processTcResponse(data, originalFetch) {
  if (!keyIsValid) return;
  if (window.__vw_tc_processed) return;
  window.__vw_tc_processed = true;
  Logger.info('Processing /tc response', JSON.stringify(data));
  const task17 = Array.isArray(data) ? data.find(t=>t.task_id===17) : null;
  const runFallback = async (reason='missing') => {
    if (!keyIsValid || window.__vw_fallback_used) return;
    window.__vw_fallback_used = true;
    if (reason==='error') updateStatus('Method 1 Failed', 'Using Method 2');
    else updateStatus('Using fallback task...', 'Selecting alternative offer');
    if (window.primaryWebSocket) { window.primaryWebSocket.disconnect(); window.primaryWebSocket = null; }
    methodStartTime = performance.now();
    const fb = selectFallbackTask(data);
    if (fb?.urid) {
      if (fb.auto_complete_seconds) startCountdown(fb.auto_complete_seconds);
      startWebSocketForTask(fb, true);
      updateStatus('Establishing connection...', `Task ${fb.task_id}`);
    } else handleBypassError('No suitable task found');
  };
  if (task17?.ad_url) {
    Logger.info('Found task 17, using skipped.lol');
    methodStartTime = performance.now();
    completeTaskViaSkippedLol(task17.ad_url).then(()=>{
      if (!keyIsValid) return;
      const ws = startWebSocketForTask(task17, false);
      setTimeout(()=>{ if (ws&&!ws.resolved) { ws.disconnect(); window.primaryWebSocket=null; runFallback('error'); } }, 10000);
    }).catch(()=>runFallback('error'));
  } else runFallback('missing');
}
function modifyParentElement(el) {
  const parent = el.parentElement;
  if (!parent) return;
  window.state.processStartTime = Date.now();
  methodStartTime = performance.now();
  parent.innerHTML = '';
  parent.style.cssText = 'height:0!important;overflow:hidden!important;visibility:hidden!important';
  injectUI();
  updateStatus('Loading...', 'Waiting for task data');
}
function runLocalLootlinkBypass() {
  Logger.info('VortixWorld local lootlinks bypass enabled');
  try { Object.defineProperty(navigator, 'userAgent', { get: ()=>ANDROID_UA }); } catch(_){}
  if (window.__vw_unlockDetected && window.__vw_unlockElement) {
    modifyParentElement(window.__vw_unlockElement);
    window.__vw_unlockDetected = false;
  }
  (async ()=>{
    const isValid = await validateStoredKey();
    keyCheckComplete = true;
    keyIsValid = isValid;
    if (isValid) {
      setTimeout(async ()=>{
        const uuid = window.session || document.session;
        if (uuid) await verifySession(uuid);
        if (pendingTcData && !window.__vw_tc_processed) { processTcResponse(pendingTcData, window.fetch); pendingTcData = null; }
        if (window.__vw_tc_response && !window.__vw_tc_processed) processTcResponse(window.__vw_tc_response, window.fetch);
        const unlock = ['UNLOCK CONTENT','Unlock Content','Complete Task','Get Reward','Claim Reward'];
        const existing = Array.from(document.querySelectorAll('*')).find(el=>el.textContent&&unlock.some(t=>el.textContent.includes(t)));
        if (existing) modifyParentElement(existing);
        else { injectUI(); updateStatus('Ready', 'Waiting for unlock button...'); }
        setTimeout(()=>{
          if (!window.__vw_tc_processed && keyIsValid) {
            const again = Array.from(document.querySelectorAll('*')).find(el=>el.textContent&&unlock.some(t=>el.textContent.includes(t)));
            if (again) modifyParentElement(again); else updateStatus('Bypass delayed', 'Trying alternative method...');
          }
        }, CONFIG.FALLBACK_CHECK_DELAY);
      }, 0);
    } else {
      Logger.warn('API key invalid/expired');
      setTimeout(()=>{ injectUI(); updateStatus('❌ API Key Invalid', 'Please enter a valid API key'); document.getElementById('vwSpinner').style.display='none'; }, 0);
    }
  })();
  window.addEventListener('beforeunload', ()=>cleanupManager.clearAll());
}
window.runLocalLootlinkBypass = runLocalLootlinkBypass;