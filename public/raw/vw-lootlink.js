const BL_TASKS = Array.from({ length: 50 }, (_, i) => i + 1).filter(n => n !== 17);

let uiInjected = false;
let bypassStart = performance.now();
let countdownTimerId = null;
let currentRemainingSeconds = 60;

function injectUI(iconUrl = LOOTLINK_UI_ICON) {
  if (uiInjected && document.getElementById('vortixWorldOverlay')) return;
  const existing = document.getElementById('vortixWorldOverlay');
  if (existing) existing.remove();

  const styleId = 'vortixWorldStyles';
  if (!document.getElementById(styleId)) {
    const styleSheet = document.createElement('style');
    styleSheet.id = styleId;
    styleSheet.innerText = SHARED_UI_CSS;
    (document.head || document.documentElement).appendChild(styleSheet);
  }

  const wrapper = document.createElement('div');
  wrapper.innerHTML = `
    <div id="vortixWorldOverlay">
      <div class="vw-header-bar">
        <div class="vw-title">
          <img src="${ICON_URL}" class="vw-header-icon" alt="Icon">
          VortixWorld
        </div>
      </div>
      <div class="vw-main-content">
        <img src="${iconUrl}" class="vw-icon-img" alt="VortixWorld" onerror="this.onerror=null;this.src='${ICON_URL}'">
        <div class="vw-spinner" id="vwSpinner"></div>
        <div id="vwStatus" class="vw-status">Initializing...</div>
        <div id="vwSubStatus" class="vw-substatus">Waiting for page to load</div>
      </div>
    </div>
  `;
  const overlay = wrapper.firstElementChild;

  let container = document.body;
  if (!container) {
    container = document.createElement('body');
    document.documentElement.appendChild(container);
    document.documentElement.style.overflow = 'hidden';
  }
  container.appendChild(overlay);
  if (document.body) document.body.style.overflow = 'hidden';
  document.documentElement.style.overflow = 'hidden';
  uiInjected = true;
}

function showCompleteUI(finalUrl, timeLabel) {
  const overlay = document.getElementById('vortixWorldOverlay');
  if (!overlay) return;
  const mainContent = overlay.querySelector('.vw-main-content');
  if (!mainContent) return;
  const iconImg = mainContent.querySelector('.vw-icon-img');
  if (iconImg) iconImg.style.display = 'none';
  const spinner = mainContent.querySelector('#vwSpinner');
  if (spinner) spinner.style.display = 'none';
  mainContent.innerHTML = `
    <img src="${iconImg ? iconImg.src : LOOTLINK_UI_ICON}" class="vw-icon-img" style="display:block" onerror="this.onerror=null;this.src='${ICON_URL}'">
    <div id="vwStatus" class="vw-status">✔️ Bypass Complete!</div>
    <div id="vwSubStatus" class="vw-substatus">Completed in ${timeLabel}s</div>
    <div class="vw-url-container" id="vwUrlContainer">${escapeHtml(finalUrl)}</div>
    <div class="vw-button-group">
      <button id="vwCopyBtn" class="vw-btn vw-btn-copy">📋 Copy URL</button>
      <button id="vwProceedBtn" class="vw-btn vw-btn-proceed">➡️ Proceed</button>
    </div>
  `;
  const copyBtn = document.getElementById('vwCopyBtn');
  const proceedBtn = document.getElementById('vwProceedBtn');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      copyTextSilent(finalUrl).then(() => { showToast('URL copied to clipboard', false, '📋'); });
    });
  }
  if (proceedBtn) {
    proceedBtn.addEventListener('click', () => { location.href = finalUrl; });
  }
}

function updateStatus(main, sub) {
  if (!document.getElementById('vortixWorldOverlay')) injectUI();
  const m = document.getElementById('vwStatus');
  const s = document.getElementById('vwSubStatus');
  if (m) m.innerText = main;
  if (s) s.innerText = sub;
  const spinner = document.getElementById('vwSpinner');
  if (spinner) {
    if (main.includes('Complete') || main.includes('Redirecting')) spinner.style.display = 'none';
    else spinner.style.display = 'block';
  }
}

function updateCountdown(remaining) {
  if (remaining !== undefined) currentRemainingSeconds = remaining;
  const sub = document.getElementById('vwSubStatus');
  if (sub) sub.innerText = `Time Remaining ${currentRemainingSeconds} seconds...`;
}

function startCountdown(initialSeconds) {
  if (countdownTimerId) {
    clearInterval(countdownTimerId);
    cleanupManager.intervals.delete(countdownTimerId);
  }
  currentRemainingSeconds = initialSeconds;
  updateCountdown();
  countdownTimerId = cleanupManager.setInterval(() => {
    currentRemainingSeconds = Math.max(0, currentRemainingSeconds - 1);
    updateCountdown();
    if (currentRemainingSeconds <= 0) {
      clearInterval(countdownTimerId);
      cleanupManager.intervals.delete(countdownTimerId);
      countdownTimerId = null;
    }
  }, 1000);
}

function handleBypassSuccess(url, timeSecondsStr, bypassType = '', forceCompleteUI = false) {
  const timeLabel = timeSecondsStr || ((performance.now() - bypassStart) / 1000).toFixed(2);
  if (isLuarmorUrl(url)) {
    const overlay = document.getElementById('vortixWorldOverlay');
    if (overlay) overlay.remove();
    showHashExpireUI(url);
    shutdown();
    return;
  }
  const auto = isAutoRedirectEnabled();
  if (forceCompleteUI) {
    injectUI();
    showCompleteUI(url, timeLabel);
    if (auto) setTimeout(() => { location.href = url; }, 3000);
    shutdown();
    return;
  }
  if (auto) {
    updateStatus('Redirecting...', `Target URL acquired (${timeLabel}s)`);
    if (bypassType === 'tpili') showToast(`Bypassed in ${timeLabel}s`, false, '✅');
    else if (bypassType === 'lootlink') showToast('Bypass successful', false, '✅');
    else showToast(`Bypassed in ${timeLabel}s`, false, '✅');
    setTimeout(() => { location.href = url; }, 1000);
  } else {
    injectUI();
    showCompleteUI(url, timeLabel);
  }
  shutdown();
}

class RobustWebSocket {
  constructor(url, options = {}) {
    this.url = url;
    this.reconnectDelay = options.initialDelay || CONFIG.INITIAL_RECONNECT_DELAY;
    this.heartbeatInterval = (options.heartbeat || CONFIG.HEARTBEAT_INTERVAL) * 1000;
    this.ws = null;
    this.reconnectTimeout = null;
    this.heartbeatTimer = null;
    this.retryCount = 0;
    this.heartbeatCount = 0;
    this.resolved = false;
    this.manualDisconnect = false;
  }

  connect() {
    if (window.isShutdown) return;
    try {
      Logger.websocket('Connecting WebSocket', this.url);
      this.ws = new WebSocket(this.url);
      this.ws.onopen = () => this.onOpen();
      this.ws.onmessage = e => this.onMessage(e);
      this.ws.onclose = () => this.handleReconnect();
      this.ws.onerror = e => this.onError(e);
    } catch (e) {
      Logger.error('Unhandled exception thrown', e);
      this.handleReconnect();
    }
  }

  onOpen() {
    if (window.isShutdown) return;
    Logger.websocket('WebSocket connection opened', this.url);
    this.retryCount = 0;
    this.reconnectDelay = CONFIG.INITIAL_RECONNECT_DELAY;
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      cleanupManager.timeouts.delete(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    this.sendHeartbeat();
    this.heartbeatTimer = cleanupManager.setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) this.sendHeartbeat();
      else if (this.heartbeatTimer) {
        clearInterval(this.heartbeatTimer);
        cleanupManager.intervals.delete(this.heartbeatTimer);
        this.heartbeatTimer = null;
      }
    }, this.heartbeatInterval);
  }

  sendHeartbeat() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send('0');
      this.heartbeatCount++;
    }
  }

  handleReconnect() {
    if (window.isShutdown || this.manualDisconnect) return;
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      cleanupManager.intervals.delete(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
    this.retryCount++;
    const delay = this.reconnectDelay * Math.pow(2, this.retryCount - 1);
    Logger.warn('WebSocket connection slow to open', `Retry ${this.retryCount} in ${delay}ms`);
    this.reconnectTimeout = cleanupManager.setTimeout(() => {
      Logger.websocket('WebSocket url opened', this.url);
      this.connect();
    }, delay);
  }

  onMessage(event) {
    if (window.isShutdown) return;
    if (event.data && event.data.includes('r:')) {
      let publisherLink = event.data.replace('r:', '').trim();
      Logger.info('Received publisher link from WebSocket', publisherLink);
      if (publisherLink) {
        let finalUrl = publisherLink;
        const isBase64 = /^[A-Za-z0-9+/=]+$/.test(publisherLink);
        if (isBase64) {
          try {
            finalUrl = decodeURIComponent(decodeURIxor(publisherLink));
            Logger.info('Decoded final URL', finalUrl);
          } catch (e) {
            Logger.error('Base64 decode failed, using raw', e);
            finalUrl = publisherLink;
          }
        } else {
          Logger.info('Not base64, using raw as final URL', finalUrl);
        }

        if (finalUrl && (finalUrl.startsWith('http://') || finalUrl.startsWith('https://'))) {
          this.disconnect();
          const duration = ((Date.now() - state.processStartTime) / 1000).toFixed(2);
          if (!isLuarmorUrl(finalUrl)) saveResultToCache(location.href, finalUrl);
          else Logger.info('Skipping cache because final URL is luarmor', finalUrl);
          this.resolved = true;
          handleBypassSuccess(finalUrl, duration, 'lootlink');
        } else {
          Logger.error('Invalid final URL received', finalUrl);
        }
      }
    }
  }

  onError(error) { Logger.error('WebSocket fatal error', error); }

  disconnect() {
    this.manualDisconnect = true;
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      cleanupManager.intervals.delete(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      cleanupManager.timeouts.delete(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    if (this.ws) this.ws.close();
  }
}

async function completeTaskViaSkippedLol(taskUrl) {
  const endpoint = 'https://skipped.lol/api/evade/ll';
  let urlToSend = taskUrl;
  if (urlToSend && urlToSend.startsWith('//')) urlToSend = 'https:' + urlToSend;
  const payload = { ID: 17, URL: urlToSend };
  try {
    Logger.info('Sending request to skipped.lol', JSON.stringify(payload));
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const rawText = await response.text();
    Logger.info('Raw response from skipped.lol', rawText);
    let parsed = null;
    try {
      parsed = JSON.parse(rawText);
      Logger.info('Parsed JSON response', JSON.stringify(parsed, null, 2));
    } catch (e) {
      Logger.warn('Response not JSON, ignoring', e.message);
    }
    if (parsed && parsed.status === 'ok') {
      Logger.info('Skipped.lol confirmed task completion');
      return true;
    } else {
      throw new Error('Unexpected response from skipped.lol');
    }
  } catch (err) {
    Logger.error('Error calling skipped.lol', err);
    throw err;
  }
}

function startWebSocketForTask(taskData, isFallback = false) {
  if (!taskData || !taskData.urid) {
    Logger.error('Missing task data for WebSocket', taskData);
    return null;
  }
  const { urid, task_id } = taskData;
  const wsUrl = `wss://${urid.substr(-5) % 3}.${INCENTIVE_SERVER_DOMAIN}/c?uid=${urid}&cat=${task_id}&key=${KEY}`;
  Logger.info(`Initiating WebSocket connection (isFallback: ${isFallback})`, wsUrl);
  const ws = new RobustWebSocket(wsUrl, {
    initialDelay: CONFIG.INITIAL_RECONNECT_DELAY,
    heartbeat: CONFIG.HEARTBEAT_INTERVAL
  });

  if (isFallback) {
    window.fallbackWebSocket = ws;
  } else {
    window.primaryWebSocket = ws;
  }
  window.activeWebSocket = ws;
  ws.connect();

  try {
    const beaconUrl = `https://${urid.substr(-5) % 3}.${INCENTIVE_SERVER_DOMAIN}/st?uid=${urid}&cat=${task_id}`;
    navigator.sendBeacon(beaconUrl);
    Logger.info('Sent beacon', beaconUrl);
  } catch (_) {}

  const tdUrl = `https://${INCENTIVE_SYNCER_DOMAIN}/td?ac=1&urid=${urid}&cat=${task_id}&tid=${TID}`;
  fetch(tdUrl, { credentials: 'include' }).catch(() => {});
  Logger.info('Fetched td URL', tdUrl);
  return ws;
}

function selectFallbackTask(tasks) {
  if (!Array.isArray(tasks) || tasks.length === 0) return null;
  const eligible = tasks.filter(t => t.task_id !== 17);
  const preferred = eligible.find(t => t.auto_complete_seconds === 30);
  if (preferred) return preferred;
  const second = eligible.find(t => t.auto_complete_seconds === 40);
  if (second) return second;
  const third = eligible.find(t => t.auto_complete_seconds === 50);
  if (third) return third;
  const fourth = eligible.find(t => t.auto_complete_seconds === 60);
  if (fourth) return fourth;
  return eligible[0] || null;
}

function processTcResponse(data, originalFetch) {
  Logger.info('Processing lootlink-backend.onrender.com/tc response', JSON.stringify(data, null, 2));
  const task17 = Array.isArray(data) ? data.find(item => item.task_id === 17) : null;

  const runFallback = () => {
    Logger.warn('Running fallback task selection');
    updateStatus('Method 1 Failed/Timeout', 'Using Method 2');
    
    if (window.primaryWebSocket) {
      window.primaryWebSocket.disconnect();
      window.primaryWebSocket = null;
    }
    if (window.activeWebSocket === window.primaryWebSocket) {
      window.activeWebSocket = null;
    }
    
    const fallbackTask = selectFallbackTask(data);
    if (fallbackTask && fallbackTask.urid) {
      Logger.info('Using fallback task for local WebSocket', fallbackTask);
      if (fallbackTask.auto_complete_seconds) {
          startCountdown(fallbackTask.auto_complete_seconds);
      }
      startWebSocketForTask(fallbackTask, true);
    } else {
      Logger.error('No suitable task found in /tc response');
      updateStatus('❌ Bypass failed', 'No suitable task');
    }
  };

  if (task17 && task17.ad_url) {
    Logger.info('Found task 17, using skipped.lol');
    const taskUrl = task17.ad_url;
    completeTaskViaSkippedLol(taskUrl).then(() => {
      Logger.info('Skipped.lol success, starting WebSocket for task 17');
      const primaryWs = startWebSocketForTask(task17, false);
      setTimeout(() => {
        if (primaryWs && !primaryWs.resolved) {
          Logger.warn('Method 1 WS timed out, shutting down and switching to Method 2');
          primaryWs.disconnect();
          window.primaryWebSocket = null;
          runFallback();
        }
      }, 8000);
    }).catch(err => {
      Logger.error('Skipped.lol request failed, falling back to direct WebSocket', err);
      runFallback();
    });
  } else {
    runFallback();
  }
  return true;
}

function initLootlinkFetchOverride() {
  const originalFetch = window.fetch;
  window.fetch = function (url, config) {
    try {
      const urlStr = typeof url === 'string' ? url : url && url.url ? url.url : '';
      if (typeof INCENTIVE_SYNCER_DOMAIN === 'undefined' || typeof INCENTIVE_SERVER_DOMAIN === 'undefined') {
        return originalFetch(url, config);
      }
      if (urlStr.includes(`${INCENTIVE_SYNCER_DOMAIN}/tc`)) {
        if (window.__vw_tc_processed) return originalFetch(url, config);
        
        let bodyObj = {};
        if (config && config.body) {
          try {
            if (typeof config.body === 'string') {
              bodyObj = JSON.parse(config.body);
            } else if (typeof config.body === 'object') {
              bodyObj = config.body;
            }
          } catch (e) {}
        }
        bodyObj.bl = BL_TASKS;

        return fetch(TC_PROXY_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bodyObj)
        }).then(response => {
          if (!response.ok) throw new Error(`Proxy returned ${response.status}`);
          return response.clone().json().then(data => {
            processTcResponse(data, originalFetch);
            window.__vw_tc_processed = true;
            return new Response(JSON.stringify(data), { status: 200, headers: { 'Content-Type': 'application/json' } });
          });
        }).catch(err => {
          Logger.error('Proxy fetch failed', err.message);
          return originalFetch(url, config);
        });
      }
    } catch (_) {}
    return originalFetch(url, config);
  };
}

function modifyParentElement(targetElement) {
  const parentElement = targetElement.parentElement;
  if (!parentElement) return;
  window.state.processStartTime = Date.now();
  bypassStart = performance.now();
  parentElement.innerHTML = '';
  parentElement.style.cssText = 'height: 0px !important; overflow: hidden !important; visibility: hidden !important;';
  injectUI();
  updateStatus('Loading...', 'Waiting for task data');
}

function setupOptimizedObserver() {
  const targetContainer = document.body || document.documentElement;
  const observer = new MutationObserver((mutationsList, observerRef) => {
    if (window.isShutdown) {
      observerRef.disconnect();
      return;
    }
    const unlockText = ['UNLOCK CONTENT', 'Unlock Content', 'Complete Task', 'Get Reward', 'Claim Reward'];
    for (const mutation of mutationsList) {
      if (mutation.type !== 'childList') continue;
      const addedElements = Array.from(mutation.addedNodes).filter(n => n.nodeType === 1);
      const found = addedElements.flatMap(el => [el, ...Array.from(el.querySelectorAll('*'))]).find(el => {
        const text = el.textContent;
        return text && unlockText.some(t => text.includes(t));
      });
      if (found) {
        modifyParentElement(found);
        observerRef.disconnect();
        return;
      }
    }
  });
  window.bypassObserver = observer;
  observer.observe(targetContainer, { childList: true, subtree: true });
  const unlockText = ['UNLOCK CONTENT', 'Unlock Content', 'Complete Task', 'Get Reward', 'Claim Reward'];
  const existing = Array.from(document.querySelectorAll('*')).find(el => {
    const text = el.textContent;
    return text && unlockText.some(t => text.includes(t));
  });
  if (existing) {
    modifyParentElement(existing);
    observer.disconnect();
  }
}

const RESULT_CACHE_KEY = 'vw_lootlink_results';

function saveResultToCache(originalUrl, resultUrl) {
  try {
    let cache = {};
    const existing = localStorage.getItem(RESULT_CACHE_KEY);
    if (existing) {
      try { cache = JSON.parse(existing); } catch (_) {}
    }
    cache[originalUrl] = resultUrl;
    localStorage.setItem(RESULT_CACHE_KEY, JSON.stringify(cache));
    Logger.info('Cached result', `${originalUrl} -> ${resultUrl}`);
  } catch (e) { Logger.warn('Failed to cache result', e); }
}

function getCachedResult(originalUrl) {
  try {
    const existing = localStorage.getItem(RESULT_CACHE_KEY);
    if (!existing) return null;
    const cache = JSON.parse(existing);
    return cache[originalUrl] || null;
  } catch (_) { return null; }
}

function runLocalLootlinkBypass() {
  Logger.info('VortixWorld local lootlinks bypass enabled (proxy + skipped.lol + WebSocket)');
  
  try {
    Object.defineProperty(navigator, 'userAgent', { get: () => ANDROID_UA });
  } catch(e) { }

  const cachedResult = getCachedResult(location.href);
  if (cachedResult) {
    if (!isLuarmorUrl(cachedResult)) {
      Logger.info('Using cached result', `from cache: ${cachedResult}`);
      handleBypassSuccess(cachedResult, '0.00 (cached)', 'lootlink', true);
      return;
    } else {
      Logger.info('Cached result is luarmor, showing hash expire UI', cachedResult);
      showHashExpireUI(cachedResult);
      return;
    }
  }
  injectUI();
  updateStatus('Loading...', 'Preparing bypass');
  setupOptimizedObserver();
  initLootlinkFetchOverride();
  cleanupManager.setTimeout(() => {
    if (!window.__vw_tc_processed) {
      Logger.warn('Bypass seems stuck, checking for unlock element again');
      const unlockText = ['UNLOCK CONTENT', 'Unlock Content', 'Complete Task', 'Get Reward', 'Claim Reward'];
      const existing = Array.from(document.querySelectorAll('*')).find(el => {
        const text = el.textContent;
        return text && unlockText.some(t => text.includes(t));
      });
      if (existing) modifyParentElement(existing);
      else updateStatus('Bypass delayed', 'Trying alternative method...');
    }
  }, CONFIG.FALLBACK_CHECK_DELAY);
  window.addEventListener('beforeunload', () => cleanupManager.clearAll());
}

window.runLocalLootlinkBypass = runLocalLootlinkBypass;
window.showHashExpireUI = function(finalUrl) {
  const existingOverlay = document.getElementById('vortixWorldOverlay');
  if (existingOverlay) existingOverlay.remove();
  const existingExpire = document.getElementById('vwHashExpireOverlay');
  if (existingExpire) existingExpire.remove();

  document.documentElement.style.setProperty('visibility', 'visible', 'important');
  document.documentElement.style.setProperty('display', 'block', 'important');
  if (document.body) {
    document.body.style.setProperty('visibility', 'visible', 'important');
    document.body.style.setProperty('display', 'block', 'important');
  }

  const overlay = document.createElement('div');
  overlay.id = 'vwHashExpireOverlay';
  overlay.style.cssText = `position:fixed;top:0;left:0;width:100vw;height:100vh;background:#1e1e1e;display:flex;align-items:center;justify-content:center;z-index:2147483647;color:#e0e0e0;font-family:sans-serif;`;
  overlay.innerHTML = `<div style="text-align:center;background:#1e1e1e;padding:40px;border-radius:24px;box-shadow:8px 8px 16px #141414, -8px -8px 16px #282828;">
    <img src="${LUARMOR_UI_ICON}" style="width:80px;height:80px;border-radius:50%;margin-bottom:20px;box-shadow:4px 4px 8px #141414, -4px -4px 8px #282828;">
    <h3 style="margin-top:0;font-size:1.4rem;">⚠️ Expiring Hash Detected</h3>
    <p style="color:#a0a0a0;font-size:14px;">Please redirect quickly before the link expires.</p>
    <div id="hz" style="font-size:45px;font-weight:bold;color:#ef4444;margin:20px;text-shadow:2px 2px 4px #141414;">7</div>
    <button id="go" style="padding:14px 35px;border-radius:40px;border:none;background:#1e1e1e;box-shadow:4px 4px 8px #141414, -4px -4px 8px #282828;color:#e0e0e0;font-weight:700;cursor:pointer;transition:all 0.2s;font-size:15px;">🔗 Go to Link Now</button>
  </div>`;
  document.documentElement.appendChild(overlay);

  const goBtn = overlay.querySelector('#go');
  let tl = 7;
  const iv = setInterval(() => {
    tl--;
    const countdownEl = overlay.querySelector('#hz');
    if (countdownEl) countdownEl.textContent = tl;
    if (tl <= 0) {
      clearInterval(iv);
      if (goBtn) {
        goBtn.disabled = true;
        goBtn.style.boxShadow = 'inset 4px 4px 8px #141414, inset -4px -4px 8px #282828';
        goBtn.textContent = '🔄 Refreshing...';
      }
      window.location.reload();
    }
  }, 1000);
  if (goBtn) {
    goBtn.onmousedown = () => { goBtn.style.boxShadow = 'inset 4px 4px 8px #141414, inset -4px -4px 8px #282828'; };
    goBtn.onmouseup = () => { goBtn.style.boxShadow = '4px 4px 8px #141414, -4px -4px 8px #282828'; };
    goBtn.onclick = () => { window.location.href = finalUrl; };
  }
};