console.log('[VW] vw-lootlink.js loaded (UI controller)');

let keyValid = false;
let uiInjected = false;
let lootlinkResolved = false;
let bypassActive = false;
let consoleLines = [];
let countdownTimerId = null;
let currentRemainingSeconds = 60;
let methodStartTime = null;

function waitForBody(callback) {
  if (document.body) callback();
  else document.addEventListener('DOMContentLoaded', callback, { once: true });
}

function addConsoleLine(text) {
  consoleLines.push(text);
  if (consoleLines.length > 8) consoleLines.shift();
  const consoleEl = document.getElementById('vwLootlinkConsole');
  if (consoleEl) {
    consoleEl.innerHTML = consoleLines.map(line => '<div class="vw-lootlink-console-line">' + line + '</div>').join('');
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

function updateStatus(main, sub) {
  if (!document.getElementById('vwLootlinkCard')) injectUI();
  const m = document.getElementById('vwLootlinkStatus');
  if (m) m.innerText = main;
  if (sub) addConsoleLine('> ' + sub);
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
  if (el) { el.style.display = 'block'; el.innerText = 'Time Remaining: ' + initialSeconds + 's'; }
  countdownTimerId = setInterval(() => {
    currentRemainingSeconds = Math.max(0, currentRemainingSeconds - 1);
    if (el) {
      el.innerText = 'Time Remaining: ' + currentRemainingSeconds + 's';
      if (currentRemainingSeconds <= 0) el.style.display = 'none';
    }
    if (currentRemainingSeconds <= 0) {
      clearInterval(countdownTimerId);
      countdownTimerId = null;
    }
  }, 1000);
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
  const subText = isSuccess ? 'Completed in ' + timeLabel + 's' : errorMsg;

  card.innerHTML = `
    <button class="vw-close">✕</button>
    <img src="${statusIcon}" class="vw-lootlink-icon" style="display:block" onerror="this.onerror=null;this.src='${ICON_URL}'">
    <div id="vwLootlinkStatus" class="vw-lootlink-status">${statusText}</div>
    <div class="vw-lootlink-console" id="vwLootlinkConsole">${consoleLines.map(line => '<div class="vw-lootlink-console-line">' + line + '</div>').join('')}</div>
    <div class="vw-lootlink-substatus" style="font-size:14px;color:#a0a0a0;margin-bottom:20px;background:#1e1e1e;box-shadow:inset 4px 4px 8px #141414, inset -4px -4px 8px #282828;padding:10px 15px;border-radius:10px;font-weight:600;">${subText}</div>
    ${isSuccess ? '<div class="vw-lootlink-url" id="vwLootlinkUrl">' + escapeHtml(finalUrl) + '</div>' : ''}
    <div class="vw-lootlink-buttons">
      ${isSuccess ? '<button id="vwLootlinkCopyBtn" class="vw-lootlink-btn vw-lootlink-btn-copy">📋 Copy URL</button>' : ''}
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
    updateStatus('Redirecting...', 'Target URL acquired (' + timeLabel + 's)');
    showToast('Bypassed in ' + timeLabel + 's', false, SUCCESS_GIF);
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
  showToast('Bypass failed: ' + errorMsg, true, ERROR_JPG);
  showCompleteUI('', '', false, errorMsg);
  bypassActive = false;
}

function runLocalLootlinkBypass() {
  Logger.info('VortixWorld local lootlinks bypass enabled (UI controller)');
  try { Object.defineProperty(navigator, 'userAgent', { get: () => ANDROID_UA }); } catch (_) {}

  window.addEventListener('message', (event) => {
    if (event.source !== window) return;
    const data = event.data;
    if (!data || typeof data.type !== 'string') return;

    if (data.type === 'VW_LOG') {
      const { level, msg, data: logData } = data;
      if (Logger[level]) Logger[level](msg, logData);
    } else if (data.type === 'VW_UI_UPDATE') {
      if (!uiInjected) injectUI();
      updateStatus(data.status, data.subStatus);
    } else if (data.type === 'VW_COUNTDOWN') {
      startCountdown(data.seconds);
    } else if (data.type === 'VW_LOOTLINK_SUCCESS' && data.url) {
      if (lootlinkResolved) return;
      lootlinkResolved = true;
      methodStartTime = performance.now();
      handleBypassSuccess(data.url, null);
    }
  });

  validateStoredKey().then(isValid => {
    keyValid = isValid;
    waitForBody(() => {
      if (!isValid) {
        injectUI();
        updateStatus('❌ API Key Invalid', 'Please enter a valid API key');
        document.getElementById('vwLootlinkSpinner').style.display = 'none';
      }
    });
  }).catch(() => {
    keyValid = false;
    waitForBody(() => {
      injectUI();
      updateStatus('❌ Key Validation Error', 'Unable to verify API key');
    });
  });

  window.addEventListener('beforeunload', () => cleanupManager.clearAll());
}

window.runLocalLootlinkBypass = runLocalLootlinkBypass;
window.showHashExpireUI = function(finalUrl) {};