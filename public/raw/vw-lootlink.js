(function() {
  'use strict';

  const win = window;
  const doc = document;

  const ICON_URL = win.ICON_URL || 'https://i.postimg.cc/zBXnVXrd/2180201F-FB5D-4574-9E55-158B4442F02A.png';
  const SUCCESS_GIF = win.SUCCESS_GIF || 'https://s13.gifyu.com/images/bqw8M.gif';
  const ERROR_JPG = win.ERROR_JPG || 'https://iili.io/Blf65Is.md.jpg';
  const LOOTLINK_UI_ICON = win.LOOTLINK_UI_ICON || ICON_URL;

  const LOOTLINK_CARD_CSS = `
    @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&display=swap');
    :root {
      --clay-bg: #1a1c23; --clay-text: #e0e5ec; --clay-text-dim: #9ba1ab; --clay-accent: #ef4444;
      --neu-out: 6px 6px 12px #121419, -6px -6px 12px #22242d;
      --neu-in: inset 4px 4px 8px #121419, inset -4px -4px 8px #22242d;
      --clay-btn: inset 2px 2px 4px rgba(255,255,255,0.05), inset -2px -2px 4px rgba(0,0,0,0.3), 4px 4px 8px rgba(0,0,0,0.4);
      --clay-btn-active: inset 4px 4px 8px rgba(0,0,0,0.5), inset -2px -2px 4px rgba(255,255,255,0.05);
    }
    .vw-lootlink-card {
      position: fixed !important; top: 50% !important; left: 50% !important; transform: translate(-50%, -50%) !important;
      width: clamp(300px, 90vw, 480px) !important; background: var(--clay-bg) !important; border-radius: 24px !important;
      box-shadow: var(--neu-out) !important; padding: 30px 25px !important; text-align: center !important;
      z-index: 2147483647 !important; font-family: 'Orbitron', sans-serif !important; animation: vw-fade-in 0.3s ease-out !important;
    }
    @keyframes vw-fade-in { from { opacity: 0; transform: translate(-50%, -40px); } to { opacity: 1; transform: translate(-50%, -50%); } }
    .vw-close {
      position: absolute !important; top: 15px !important; right: 15px !important; background: var(--clay-bg) !important;
      box-shadow: var(--clay-btn) !important; border: none !important; color: var(--clay-text-dim) !important;
      width: 35px !important; height: 35px !important; border-radius: 50% !important; cursor: pointer !important;
      font-weight: bold !important; transition: all 0.2s !important; display: flex; align-items: center; justify-content: center;
    }
    .vw-close:active { box-shadow: var(--clay-btn-active) !important; color: var(--clay-accent) !important; }
    .vw-lootlink-icon { width: 80px !important; height: 80px !important; border-radius: 50% !important; margin-bottom: 20px !important; box-shadow: var(--clay-btn) !important; object-fit: cover !important; }
    .vw-lootlink-spinner {
      width: 60px; height: 60px; border: 4px solid var(--clay-bg); border-top: 4px solid var(--clay-accent);
      border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 20px; box-shadow: var(--neu-out);
    }
    @keyframes spin { 100% { transform: rotate(360deg); } }
    .vw-lootlink-status { font-size: 22px; font-weight: 800; color: var(--clay-text); margin-bottom: 8px; text-transform: uppercase; text-shadow: 0 0 8px rgba(255,255,255,0.3); }
    .vw-lootlink-console {
      width: 100%; height: 120px; overflow-y: auto; background: var(--clay-bg); box-shadow: var(--neu-in);
      border-radius: 10px; padding: 12px; margin-bottom: 15px; font-family: 'Courier New', monospace; font-size: 12px;
      color: var(--clay-text-dim); text-align: left; border-left: 3px solid var(--clay-accent);
    }
    .vw-lootlink-console-line { padding: 2px 0; border-bottom: 1px solid rgba(239,68,68,0.1); }
    .vw-lootlink-console-line:last-child { border-bottom: none; }
    .vw-lootlink-countdown { font-size: 15px; font-weight: 700; color: var(--clay-accent); margin-bottom: 15px; text-transform: uppercase; letter-spacing: 1px; }
    .vw-lootlink-substatus {
      font-size: 14px; color: var(--clay-text-dim); margin-bottom: 20px; background: var(--clay-bg); box-shadow: var(--neu-in);
      padding: 10px 15px; border-radius: 10px; font-weight: 600;
    }
    .vw-lootlink-url {
      background: var(--clay-bg); box-shadow: var(--neu-in); border-radius: 10px; padding: 15px;
      font-family: 'Courier New', monospace; color: var(--clay-text-dim); word-break: break-all; margin-bottom: 20px; font-size: 13px;
      border-left: 3px solid var(--clay-accent);
    }
    .vw-lootlink-buttons { display: flex; gap: 12px; flex-wrap: wrap; justify-content: center; }
    .vw-lootlink-btn {
      flex: 1 1 120px; background: var(--clay-bg); box-shadow: var(--clay-btn); border: none; padding: 14px 20px;
      border-radius: 10px; color: var(--clay-text); font-weight: 700; cursor: pointer; transition: all 0.2s; font-size: 14px;
      font-family: 'Orbitron', sans-serif; text-transform: uppercase; letter-spacing: 1px; display: flex;
      align-items: center; justify-content: center; gap: 8px;
    }
    .vw-lootlink-btn:active { box-shadow: var(--clay-btn-active); transform: translateY(2px); color: var(--clay-accent); }
  `;

  let keyValid = false;
  let uiInjected = false;
  let lootlinkResolved = false;
  let bypassActive = false;
  let consoleLines = [];
  let countdownTimerId = null;
  let currentRemainingSeconds = 60;
  let methodStartTime = null;

  function waitForBody(callback) {
    if (doc.body) callback();
    else doc.addEventListener('DOMContentLoaded', callback, { once: true });
  }

  function addConsoleLine(text) {
    consoleLines.push(text);
    if (consoleLines.length > 8) consoleLines.shift();
    const consoleEl = doc.getElementById('vwLootlinkConsole');
    if (consoleEl) {
      consoleEl.innerHTML = consoleLines.map(line => '<div class="vw-lootlink-console-line">' + line + '</div>').join('');
      consoleEl.scrollTop = consoleEl.scrollHeight;
    }
  }

  function injectUI(iconUrl = LOOTLINK_UI_ICON) {
    if (doc.getElementById('vwLootlinkCard')) return;
    if (uiInjected) return;

    const styleId = 'vwLootlinkStyles';
    if (!doc.getElementById(styleId)) {
      const styleSheet = doc.createElement('style');
      styleSheet.id = styleId;
      styleSheet.textContent = LOOTLINK_CARD_CSS;
      (doc.head || doc.documentElement).appendChild(styleSheet);
    }

    const card = doc.createElement('div');
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
    doc.body.appendChild(card);
    card.querySelector('.vw-close').addEventListener('click', () => card.remove());
    uiInjected = true;
    addConsoleLine('> Initializing bypass...');
  }

  function updateStatus(main, sub) {
    if (!doc.getElementById('vwLootlinkCard')) injectUI();
    const m = doc.getElementById('vwLootlinkStatus');
    if (m) m.innerText = main;
    if (sub) addConsoleLine('> ' + sub);
    const spinner = doc.getElementById('vwLootlinkSpinner');
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
    const el = doc.getElementById('vwLootlinkCountdown');
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

  function escapeHtml(text) {
    const div = doc.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function copyTextSilent(text) {
    if (win.copyTextSilent) return win.copyTextSilent(text);
    try { return navigator.clipboard.writeText(String(text)).then(() => true); } catch (_) {}
    try {
      const ta = doc.createElement('textarea');
      ta.value = String(text);
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      doc.body.appendChild(ta);
      ta.focus();
      ta.select();
      const ok = doc.execCommand('copy');
      ta.remove();
      return Promise.resolve(!!ok);
    } catch (_) { return Promise.resolve(false); }
  }

  function showToast(message, isError = false, img = null) {
    if (win.showToast) win.showToast(message, isError, img);
  }

  function isAutoRedirectEnabled() {
    const v = localStorage.getItem('vw_auto_redirect');
    return v === null ? true : v === 'true';
  }

  function shutdown() {
    lootlinkResolved = true;
    bypassActive = false;
  }

  function showCompleteUI(finalUrl, timeLabel, isSuccess = true, errorMsg = '') {
    if (countdownTimerId) { clearInterval(countdownTimerId); countdownTimerId = null; }
    const countdownEl = doc.getElementById('vwLootlinkCountdown');
    if (countdownEl) countdownEl.style.display = 'none';

    const card = doc.getElementById('vwLootlinkCard');
    if (!card) return;
    const spinner = doc.getElementById('vwLootlinkSpinner');
    if (spinner) spinner.style.display = 'none';

    const statusIcon = isSuccess ? SUCCESS_GIF : ERROR_JPG;
    const statusText = isSuccess ? '✔️ Bypass Complete!' : '❌ Bypass Failed';
    const subText = isSuccess ? 'Completed in ' + timeLabel + 's' : errorMsg;

    card.innerHTML = `
      <button class="vw-close">✕</button>
      <img src="${statusIcon}" class="vw-lootlink-icon" style="display:block" onerror="this.onerror=null;this.src='${ICON_URL}'">
      <div id="vwLootlinkStatus" class="vw-lootlink-status">${statusText}</div>
      <div class="vw-lootlink-console" id="vwLootlinkConsole">${consoleLines.map(line => '<div class="vw-lootlink-console-line">' + line + '</div>').join('')}</div>
      <div class="vw-lootlink-substatus">${subText}</div>
      ${isSuccess ? '<div class="vw-lootlink-url" id="vwLootlinkUrl">' + escapeHtml(finalUrl) + '</div>' : ''}
      <div class="vw-lootlink-buttons">
        ${isSuccess ? '<button id="vwLootlinkCopyBtn" class="vw-lootlink-btn">📋 Copy URL</button>' : ''}
        <button id="vwLootlinkProceedBtn" class="vw-lootlink-btn">${isSuccess ? '➡️ Proceed' : 'OK'}</button>
      </div>
    `;
    card.querySelector('.vw-close').addEventListener('click', () => card.remove());
    if (isSuccess) {
      doc.getElementById('vwLootlinkCopyBtn').addEventListener('click', () => {
        copyTextSilent(finalUrl).then(() => showToast('URL copied to clipboard', false, '📋'));
      });
    }
    doc.getElementById('vwLootlinkProceedBtn').addEventListener('click', () => {
      if (isSuccess) location.href = finalUrl;
      else card.remove();
    });
    shutdown();
  }

  function handleBypassSuccess(url, timeSecondsStr) {
    let timeLabel = timeSecondsStr || (methodStartTime ? ((performance.now() - methodStartTime) / 1000).toFixed(2) : '0.00');
    if (countdownTimerId) { clearInterval(countdownTimerId); countdownTimerId = null; }
    const el = doc.getElementById('vwLootlinkCountdown'); if (el) el.style.display = 'none';

    if (isAutoRedirectEnabled()) {
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
    const el = doc.getElementById('vwLootlinkCountdown'); if (el) el.style.display = 'none';
    updateStatus('❌ Bypass failed', errorMsg);
    showToast('Bypass failed: ' + errorMsg, true, ERROR_JPG);
    showCompleteUI('', '', false, errorMsg);
  }

  function runLocalLootlinkBypass() {
    console.log('[VW] vw-lootlink.js loaded (UI controller)');
    if (win.Logger) win.Logger.info('VortixWorld local lootlinks bypass enabled (UI controller)');

    window.addEventListener('message', (event) => {
      if (event.source !== window) return;
      const data = event.data;
      if (!data || typeof data.type !== 'string') return;

      if (data.type === 'VW_LOG') {
        const { level, msg, data: logData } = data;
        if (win.Logger && win.Logger[level]) win.Logger[level](msg, logData);
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

    const validateKey = win.validateStoredKey || (() => Promise.resolve(true));
    validateKey().then(isValid => {
      keyValid = isValid;
      waitForBody(() => {
        if (!isValid) {
          injectUI();
          updateStatus('❌ API Key Invalid', 'Please enter a valid API key');
          const spinner = doc.getElementById('vwLootlinkSpinner');
          if (spinner) spinner.style.display = 'none';
        } else {
          if (!uiInjected) injectUI();
          updateStatus('Ready', 'Waiting for task data...');
        }
      });
    }).catch(() => {
      keyValid = false;
      waitForBody(() => {
        injectUI();
        updateStatus('❌ Key Validation Error', 'Unable to verify API key');
      });
    });

    window.addEventListener('beforeunload', () => {
      if (win.cleanupManager && win.cleanupManager.clearAll) win.cleanupManager.clearAll();
    });
  }

  win.runLocalLootlinkBypass = runLocalLootlinkBypass;
})();