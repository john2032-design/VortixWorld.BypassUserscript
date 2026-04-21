console.log('[VW] vw-lootlink.js loaded');

const originalFetch = window.fetch;
window.fetch = function(url, config) {
  const urlStr = typeof url === 'string' ? url : (url && url.url ? url.url : '');
  if (urlStr.includes('nerventualken.com/tc') || urlStr.includes('INCENTIVE_SYNCER_DOMAIN/tc')) {
    console.log('[VW] Intercepted /tc request:', urlStr);
    Logger.info('Intercepted /tc request', urlStr);
    let bodyObj = {};
    if (config && config.body) {
      try {
        bodyObj = typeof config.body === 'string' ? JSON.parse(config.body) : config.body;
      } catch(e) {}
    }
    bodyObj.bl = BL_TASKS;

    return originalFetch(TC_PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyObj)
    }).then(response => {
      if (!response.ok) throw new Error(`Proxy returned ${response.status}`);
      return response.clone().json().then(data => {
        window.__vw_tc_response = data;
        console.log('[VW] /tc proxy response received, tasks:', data.length);
        Logger.info('/tc proxy response received', 'tasks:' + data.length);
        
        if (!keyCheckComplete) {
          Logger.info('Key check not complete, storing /tc response for later');
          pendingTcData = data;
        } else if (keyIsValid) {
          window.__vw_tc_processed = false;
          processTcResponse(data, originalFetch);
        } else {
          Logger.warn('Key invalid, ignoring /tc response');
        }
        
        return new Response(JSON.stringify(data), { status: 200, headers: { 'Content-Type': 'application/json' } });
      });
    }).catch(err => {
      console.error('[VW] Proxy fetch failed:', err);
      Logger.error('Proxy fetch failed', err.message);
      return originalFetch(url, config);
    });
  }
  return originalFetch(url, config);
};
window.__vw_fetch_interceptor_active = true;

const BL_TASKS = [18, 2, 33, 7, 21, 49, 48]

let uiInjected = false
let methodStartTime = null
let countdownTimerId = null
let currentRemainingSeconds = 60
let keyIsValid = false
let keyCheckComplete = false
let pendingTcData = null
let consoleLines = []
let bypassActive = false
let lootlinkResolved = false

function waitForBody(callback) {
  if (document.body) callback();
  else document.addEventListener('DOMContentLoaded', callback, { once: true });
}

function addConsoleLine(text) {
  consoleLines.push(text);
  if (consoleLines.length > 8) consoleLines.shift();
  const consoleEl = document.getElementById('vwLootlinkConsole');
  if (consoleEl) {
    consoleEl.innerHTML = consoleLines.map(line => `<div class="vw-lootlink-console-line">${line}</div>`).join('');
    consoleEl.scrollTop = consoleEl.scrollHeight;
  }
}

function injectUI(iconUrl = LOOTLINK_UI_ICON) {
  if (document.getElementById('vwLootlinkCard')) return;
  if (uiInjected) return;

  const styleId = 'vwLootlinkStyles';
  if (!document.getElementById(styleId)) {
    const styleSheet = document.createElement('style');
    styleSheet.id = styleId;
    styleSheet.textContent = LOOTLINK_CARD_CSS;
    (document.head || document.documentElement).appendChild(styleSheet);
  }

  const card = document.createElement('div');
  card.id = 'vwLootlinkCard';
  card.className = 'vw-lootlink-card';
  card.innerHTML = `
    <button class="vw-close">✕</button>
    <img src="${iconUrl}" class="vw-lootlink-icon" alt="VortixWorld" onerror="this.onerror=null;this.src='${ICON_URL}'">
    <div class="vw-lootlink-spinner" id="vwLootlinkSpinner"></div>
    <div id="vwLootlinkStatus" class="vw-lootlink-status">Preparing bypass...</div>
    <div class="vw-lootlink-console" id="vwLootlinkConsole"></div>
    <div id="vwLootlinkCountdown" class="vw-lootlink-countdown" style="display:none;"></div>
  `;
  document.body.appendChild(card);
  card.querySelector('.vw-close').addEventListener('click', () => card.remove());
  uiInjected = true;
  addConsoleLine('> Initializing bypass...');
}

function showCompleteUI(finalUrl, timeLabel, isSuccess = true, errorMsg = '') {
  if (countdownTimerId) { clearInterval(countdownTimerId); countdownTimerId = null; }
  const countdownEl = document.getElementById('vwLootlinkCountdown');
  if (countdownEl) countdownEl.style.display = 'none';

  const card = document.getElementById('vwLootlinkCard');
  if (!card) return;
  const spinner = document.getElementById('vwLootlinkSpinner');
  if (spinner) spinner.style.display = 'none';

  const statusIcon = isSuccess ? SUCCESS_GIF : ERROR_JPG;
  const statusText = isSuccess ? '✔️ Bypass Complete!' : '❌ Bypass Failed';
  const subText = isSuccess ? `Completed in ${timeLabel}s` : errorMsg;

  card.innerHTML = `
    <button class="vw-close">✕</button>
    <img src="${statusIcon}" class="vw-lootlink-icon" style="display:block" onerror="this.onerror=null;this.src='${ICON_URL}'">
    <div id="vwLootlinkStatus" class="vw-lootlink-status">${statusText}</div>
    <div class="vw-lootlink-console" id="vwLootlinkConsole">${consoleLines.map(line => `<div class="vw-lootlink-console-line">${line}</div>`).join('')}</div>
    <div class="vw-lootlink-substatus" style="font-size:14px;color:#a0a0a0;margin-bottom:20px;background:#1e1e1e;box-shadow:inset 4px 4px 8px #141414, inset -4px -4px 8px #282828;padding:10px 15px;border-radius:10px;font-weight:600;">${subText}</div>
    ${isSuccess ? `<div class="vw-lootlink-url" id="vwLootlinkUrl">${escapeHtml(finalUrl)}</div>` : ''}
    <div class="vw-lootlink-buttons">
      ${isSuccess ? `<button id="vwLootlinkCopyBtn" class="vw-lootlink-btn vw-lootlink-btn-copy">📋 Copy URL</button>` : ''}
      <button id="vwLootlinkProceedBtn" class="vw-lootlink-btn">${isSuccess ? '➡️ Proceed' : 'OK'}</button>
    </div>
  `;
  card.querySelector('.vw-close').addEventListener('click', () => card.remove());
  if (isSuccess) {
    document.getElementById('vwLootlinkCopyBtn').addEventListener('click', () => {
      copyTextSilent(finalUrl).then(() => showToast('URL copied to clipboard', false, '📋'));
    });
  }
  document.getElementById('vwLootlinkProceedBtn').addEventListener('click', () => {
    if (isSuccess) location.href = finalUrl;
    else card.remove();
  });
  bypassActive = false;
  lootlinkResolved = true;
}

function updateStatus(main, sub) {
  if (!document.getElementById('vwLootlinkCard')) injectUI();
  const m = document.getElementById('vwLootlinkStatus');
  if (m) m.innerText = main;
  if (sub) addConsoleLine(`> ${sub}`);
  const spinner = document.getElementById('vwLootlinkSpinner');
  if (spinner) {
    if (main.includes('Complete') || main.includes('Redirecting') || main.includes('Failed')) spinner.style.display = 'none';
    else spinner.style.display = 'block';
  }
  if (main.includes('Method 1') || main.includes('Task completed') || main.includes('Establishing')) {
    bypassActive = true;
  }
}

function startCountdown(initialSeconds) {
  if (countdownTimerId) clearInterval(countdownTimerId);
  currentRemainingSeconds = initialSeconds;
  const el = document.getElementById('vwLootlinkCountdown');
  if (el) { el.style.display = 'block'; el.innerText = `Time Remaining: ${initialSeconds}s`; }
  countdownTimerId = setInterval(() => {
    currentRemainingSeconds = Math.max(0, currentRemainingSeconds - 1);
    if (el) {
      el.innerText = `Time Remaining: ${currentRemainingSeconds}s`;
      if (currentRemainingSeconds <= 0) el.style.display = 'none';
    }
    if (currentRemainingSeconds <= 0) {
      clearInterval(countdownTimerId);
      countdownTimerId = null;
    }
  }, 1000);
}

function handleBypassSuccess(url, timeSecondsStr) {
  let timeLabel = timeSecondsStr || (methodStartTime ? ((performance.now() - methodStartTime) / 1000).toFixed(2) : '0.00');
  if (countdownTimerId) { clearInterval(countdownTimerId); countdownTimerId = null; }
  const el = document.getElementById('vwLootlinkCountdown'); if (el) el.style.display = 'none';

  if (isLuarmorUrl(url)) {
    document.getElementById('vwLootlinkCard')?.remove();
    showHashExpireUI(url);
    shutdown();
    return;
  }
  const auto = isAutoRedirectEnabled();
  if (auto) {
    updateStatus('Redirecting...', `Target URL acquired (${timeLabel}s)`);
    showToast(`Bypassed in ${timeLabel}s`, false, SUCCESS_GIF);
    setTimeout(() => { location.href = url; }, 1000);
  } else {
    showCompleteUI(url, timeLabel, true);
  }
  shutdown();
}

function handleBypassError(errorMsg) {
  if (countdownTimerId) { clearInterval(countdownTimerId); countdownTimerId = null; }
  const el = document.getElementById('vwLootlinkCountdown'); if (el) el.style.display = 'none';
  updateStatus('❌ Bypass failed', errorMsg);
  showToast(`Bypass failed: ${errorMsg}`, true, ERROR_JPG);
  showCompleteUI('', '', false, errorMsg);
  bypassActive = false;
}

class RobustWebSocket {
  constructor(url, options = {}) {
    this.url = url;
    this.reconnectDelay = options.initialDelay || 1000;
    this.heartbeatInterval = (options.heartbeat || 0.1) * 1000;
    this.connectionTimeout = options.connectionTimeout || 3000;
    this.maxReconnectAttempts = 5;
    this.ws = null;
    this.reconnectTimeout = null;
    this.heartbeatTimer = null;
    this.connectionTimer = null;
    this.reconnectAttempts = 0;
    this.resolved = false;
    this.manualDisconnect = false;
    this.onConnectionTimeout = options.onConnectionTimeout || null;
  }
  connect() {
    if (window.isShutdown || this.manualDisconnect || !keyIsValid) return;
    if (this.reconnectAttempts >= this.maxReconnectAttempts) return;
    this.clearConnectionTimer();
    this.connectionTimer = setTimeout(() => {
      if (!this.resolved) {
        Logger.warn('WebSocket connection timeout', this.url);
        if (this.ws) { this.ws.close(); this.ws = null; }
        if (this.onConnectionTimeout) this.onConnectionTimeout();
        else this.scheduleReconnect();
      }
    }, this.connectionTimeout);
    try {
      Logger.websocket('Connecting WebSocket', this.url);
      this.ws = new WebSocket(this.url);
      this.ws.onopen = () => this.onOpen();
      this.ws.onmessage = e => this.onMessage(e);
      this.ws.onclose = () => this.onClose();
      this.ws.onerror = () => {};
    } catch (e) {
      this.clearConnectionTimer();
      this.scheduleReconnect();
    }
  }
  clearConnectionTimer() { if (this.connectionTimer) { clearTimeout(this.connectionTimer); this.connectionTimer = null; } }
  onOpen() {
    this.clearConnectionTimer();
    this.reconnectAttempts = 0;
    if (this.reconnectTimeout) { clearTimeout(this.reconnectTimeout); this.reconnectTimeout = null; }
    Logger.websocket('WebSocket connection opened', this.url);
    this.sendHeartbeat();
    this.startHeartbeat();
  }
  onClose() {
    this.clearConnectionTimer();
    this.stopHeartbeat();
    if (this.manualDisconnect || this.resolved) return;
    this.scheduleReconnect();
  }
  onMessage(event) {
    if (event.data && event.data.includes('r:')) {
      let link = event.data.replace('r:', '').trim();
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
  sendHeartbeat() { if (this.ws && this.ws.readyState === WebSocket.OPEN) this.ws.send('0'); }
  startHeartbeat() { this.stopHeartbeat(); this.heartbeatTimer = setInterval(() => this.sendHeartbeat(), this.heartbeatInterval); }
  stopHeartbeat() { if (this.heartbeatTimer) { clearInterval(this.heartbeatTimer); this.heartbeatTimer = null; } }
  scheduleReconnect() {
    if (this.manualDisconnect || this.resolved) return;
    if (this.reconnectAttempts >= this.maxReconnectAttempts) return;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts);
    this.reconnectAttempts++;
    this.reconnectTimeout = setTimeout(() => this.connect(), delay);
  }
  disconnect() {
    this.clearConnectionTimer();
    this.manualDisconnect = true;
    this.stopHeartbeat();
    if (this.reconnectTimeout) { clearTimeout(this.reconnectTimeout); this.reconnectTimeout = null; }
    if (this.ws) { this.ws.close(); this.ws = null; }
  }
}

async function completeTaskViaSkippedLol(taskUrl) {
  if (!keyIsValid) return false;
  const endpoint = 'https://skipped.lol/api/evade/ll';
  let urlToSend = taskUrl.startsWith('//') ? 'https:' + taskUrl : taskUrl;
  const payload = { ID: 17, URL: urlToSend };
  try {
    Logger.info('Sending request to skipped.lol', JSON.stringify(payload));
    const ctrl = new AbortController();
    setTimeout(() => ctrl.abort(), 8000);
    const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), signal: ctrl.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    const parsed = JSON.parse(text);
    if (parsed?.status === 'ok') return true;
    throw new Error('Unexpected response');
  } catch (err) {
    Logger.error('Error calling skipped.lol', err);
    throw err;
  }
}

function startWebSocketForTask(taskData, isFallback = false, subdomainAttempt = 0) {
  if (!taskData?.urid || !keyIsValid) return null;
  const { urid, task_id } = taskData;
  const subIdx = (parseInt(urid.substr(-5)) + subdomainAttempt) % 3;
  const wsUrl = `wss://${subIdx}.${INCENTIVE_SERVER_DOMAIN}/c?uid=${urid}&cat=${task_id}&key=${window.VW_API_KEY}`;
  Logger.info(`Initiating WebSocket (fallback:${isFallback})`, wsUrl);
  const ws = new RobustWebSocket(wsUrl, {
    onConnectionTimeout: () => {
      if (subdomainAttempt < 2 && !ws.resolved) startWebSocketForTask(taskData, isFallback, subdomainAttempt + 1);
    }
  });
  if (isFallback) {
    if (window.fallbackWebSocket) window.fallbackWebSocket.disconnect();
    window.fallbackWebSocket = ws;
  } else {
    if (window.primaryWebSocket) window.primaryWebSocket.disconnect();
    window.primaryWebSocket = ws;
  }
  ws.connect();
  try { navigator.sendBeacon(`https://${subIdx}.${INCENTIVE_SERVER_DOMAIN}/st?uid=${urid}&cat=${task_id}`); } catch (_) {}
  fetch(`https://nerventualken.com/td?ac=1&urid=${urid}&cat=${task_id}`, { credentials: 'include' }).catch(() => {});
  return ws;
}

function selectFallbackTask(tasks) {
  if (!Array.isArray(tasks)) return null;
  const eligible = tasks.filter(t => t.task_id !== 17);
  if (!eligible.length) return null;
  eligible.sort((a, b) => (a.auto_complete_seconds || 999) - (b.auto_complete_seconds || 999));
  return eligible[0];
}

function verifySession(uuid) {
  if (!uuid) return;
  fetch(`https://${location.hostname}/verify`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ session: uuid }) })
    .then(() => Logger.info('Session verification sent'))
    .catch(e => Logger.warn('Session verification failed', e.message));
}

function processTcResponse(data) {
  if (!keyIsValid || window.__vw_tc_processed) return;
  window.__vw_tc_processed = true;
  const task17 = Array.isArray(data) ? data.find(t => t.task_id === 17) : null;
  const runFallback = () => {
    if (window.__vw_fallback_used) return;
    window.__vw_fallback_used = true;
    updateStatus('Method 1 Failed/Timeout', 'Using Method 2');
    if (window.primaryWebSocket) { window.primaryWebSocket.disconnect(); window.primaryWebSocket = null; }
    methodStartTime = performance.now();
    const fb = selectFallbackTask(data);
    if (fb?.urid) {
      if (fb.auto_complete_seconds) startCountdown(fb.auto_complete_seconds);
      startWebSocketForTask(fb, true);
    } else handleBypassError('No suitable task found');
  };
  if (task17?.ad_url) {
    methodStartTime = performance.now();
    completeTaskViaSkippedLol(task17.ad_url).then(() => {
      if (!keyIsValid) return;
      updateStatus('Task completed', 'Establishing connection...');
      const ws = startWebSocketForTask(task17, false);
      setTimeout(() => { if (ws && !ws.resolved) { ws.disconnect(); window.primaryWebSocket = null; runFallback(); } }, 10000);
    }).catch(() => runFallback());
  } else runFallback();
}

function runLocalLootlinkBypass() {
  Logger.info('VortixWorld local lootlinks bypass enabled');
  console.log('[VW] runLocalLootlinkBypass called');
  try { Object.defineProperty(navigator, 'userAgent', { get: () => ANDROID_UA }); } catch (_) {}

  function startKeyCheck() {
    validateStoredKey().then(isValid => {
      keyCheckComplete = true;
      keyIsValid = isValid;
      waitForBody(() => {
        if (isValid) {
          const uuid = window.session || document.session;
          if (uuid) verifySession(uuid);
          if (pendingTcData && !window.__vw_tc_processed) { processTcResponse(pendingTcData); pendingTcData = null; }
          if (window.__vw_tc_response && !window.__vw_tc_processed) processTcResponse(window.__vw_tc_response);
          
          if (!uiInjected) {
            injectUI();
            updateStatus('Ready', 'Waiting for bypass tasks...');
          }
        } else {
          injectUI();
          updateStatus('❌ API Key Invalid', 'Please enter a valid API key');
          const spinner = document.getElementById('vwLootlinkSpinner');
          if (spinner) spinner.style.display = 'none';
        }
      });
    }).catch(err => {
      keyCheckComplete = true; keyIsValid = false;
      waitForBody(() => {
        injectUI();
        updateStatus('❌ Key Validation Error', 'Unable to verify API key');
        const spinner = document.getElementById('vwLootlinkSpinner');
        if (spinner) spinner.style.display = 'none';
      });
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', startKeyCheck, { once: true });
  else startKeyCheck();
  window.addEventListener('beforeunload', () => cleanupManager.clearAll());
}

window.runLocalLootlinkBypass = runLocalLootlinkBypass;
window.showHashExpireUI = function(finalUrl) { };