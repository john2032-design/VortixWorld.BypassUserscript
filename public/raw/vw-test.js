const ICON_URL = 'https://i.postimg.cc/Y2TmKMf8/2180201F-FB5D-4574-9E55-158B4442F02A.png';
const LOOTLINK_UI_ICON = 'https://i.postimg.cc/PqQbqPcZ/IMG-0021.jpg';
const LUARMOR_UI_ICON = 'https://i.postimg.cc/PqQbqPcZ/IMG-0021.jpg';
const SUCCESS_GIF = 'https://i.ibb.co/jP7P4Dbw/IMG-0022.gif';
const ERROR_JPG = 'https://i.ibb.co/1f0hY4t/IMG-0023.jpg';
const ANDROID_UA = 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36';
const INCENTIVE_SERVER_DOMAIN = 'nerventualken.com';
const INCENTIVE_SYNCER_DOMAIN = 'nerventualken.com';
const TC_PROXY_URL = 'https://lootlink-backend.onrender.com/tc';
const API_BASE = 'https://vortixworld.vercel.app';
const TID = '';

const CONFIG = {
  INITIAL_RECONNECT_DELAY: 1000,
  HEARTBEAT_INTERVAL: 30,
  FALLBACK_CHECK_DELAY: 5000
};

const SHARED_UI_CSS = `
  #vortixWorldOverlay{position:fixed;top:0;left:0;width:100vw;height:100vh;background:#1e1e1e;z-index:2147483647;display:flex;flex-direction:column;color:#e0e0e0;font-family:sans-serif}
  .vw-header-bar{padding:16px 20px;background:#1e1e1e;box-shadow:0 4px 8px #141414;display:flex;align-items:center;justify-content:space-between}
  .vw-title{display:flex;align-items:center;gap:12px;font-weight:700;font-size:18px}
  .vw-header-icon{width:32px;height:32px;border-radius:12px;box-shadow:2px 2px 4px #141414,-2px -2px 4px #282828}
  .vw-main-content{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px}
  .vw-icon-img{width:100px;height:100px;border-radius:28px;margin-bottom:24px;box-shadow:6px 6px 12px #141414,-6px -6px 12px #282828}
  .vw-spinner{width:50px;height:50px;border:4px solid #333;border-top:4px solid #4ade80;border-radius:50%;animation:vw-spin 1s linear infinite;margin:20px}
  @keyframes vw-spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}
  .vw-status{font-size:20px;font-weight:700;margin-bottom:12px}
  .vw-substatus{font-size:14px;color:#a0a0a0}
  .vw-url-container{background:#2a2a2a;padding:12px 16px;border-radius:40px;font-family:monospace;font-size:13px;word-break:break-all;max-width:90%;margin:20px 0;box-shadow:inset 3px 3px 6px #141414,inset -3px -3px 6px #282828}
  .vw-button-group{display:flex;gap:12px;margin-top:20px}
  .vw-btn{padding:12px 24px;border-radius:40px;border:none;background:#1e1e1e;box-shadow:4px 4px 8px #141414,-4px -4px 8px #282828;color:#e0e0e0;font-weight:700;cursor:pointer;transition:all 0.2s}
  .vw-btn:active{box-shadow:inset 4px 4px 8px #141414,inset -4px -4px 8px #282828}
  .vw-btn-copy{background:#1e1e1e}
  .vw-btn-proceed{background:#1e1e1e}
`;

const API_UI_CSS = `
  .vw-api-card{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);width:400px;max-width:90vw;background:#1e1e1e;border-radius:28px;box-shadow:10px 10px 20px #141414,-10px -10px 20px #282828;z-index:2147483647;padding:24px;color:#e0e0e0;font-family:Inter,sans-serif}
  .vw-close{position:absolute;top:16px;right:16px;width:32px;height:32px;border-radius:50%;border:none;background:#1e1e1e;box-shadow:3px 3px 6px #141414,-3px -3px 6px #282828;color:#aaa;cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center}
  .vw-close:active{box-shadow:inset 3px 3px 6px #141414,inset -3px -3px 6px #282828}
  .vw-api-icon{width:80px;height:80px;border-radius:50%;margin:0 auto 16px;display:block;box-shadow:4px 4px 8px #141414,-4px -4px 8px #282828}
  .vw-api-status{font-size:18px;font-weight:700;text-align:center;margin-bottom:8px}
  .vw-api-substatus{font-size:14px;color:#a0a0a0;text-align:center;margin-bottom:16px}
  .vw-api-url{background:#2a2a2a;padding:12px;border-radius:20px;font-family:monospace;font-size:12px;word-break:break-all;margin:16px 0;box-shadow:inset 3px 3px 6px #141414,inset -3px -3px 6px #282828}
  .vw-api-buttons{display:flex;gap:12px;justify-content:center}
  .vw-api-btn{padding:10px 20px;border-radius:40px;border:none;background:#1e1e1e;box-shadow:4px 4px 8px #141414,-4px -4px 8px #282828;color:#e0e0e0;font-weight:700;cursor:pointer;transition:all 0.2s;font-size:14px}
  .vw-api-btn:active{box-shadow:inset 4px 4px 8px #141414,inset -4px -4px 8px #282828}
  .vw-api-topbar-inner{display:flex;align-items:center;gap:12px}
  .vw-api-loading-ring{width:20px;height:20px;border:3px solid #333;border-top:3px solid #4ade80;border-radius:50%;animation:vw-spin 1s linear infinite}
  @keyframes vw-spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}
`;

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/[&<>]/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;'})[m]);
}

function isLuarmorUrl(url) {
  return url && (url.includes('luarmor.net') || url.includes('ads.luarmor.net'));
}

function isAutoRedirectEnabled() {
  const key = 'vw_auto_redirect';
  if (typeof GM_getValue === 'function') {
    try {
      const val = GM_getValue(key);
      if (val !== undefined && val !== null) return val;
    } catch (_) {}
  }
  try {
    const val = localStorage.getItem(key);
    if (val === null) return true;
    return val === 'true';
  } catch (_) {
    return true;
  }
}

function decodeURIxor(str) {
  let result = '';
  for (let i = 0; i < str.length; i++) {
    result += String.fromCharCode(str.charCodeAt(i) ^ 7);
  }
  return decodeURIComponent(result);
}

const cleanupManager = {
  timeouts: new Set(),
  intervals: new Set(),
  setTimeout: (fn, delay) => {
    const id = setTimeout(fn, delay);
    cleanupManager.timeouts.add(id);
    return id;
  },
  setInterval: (fn, delay) => {
    const id = setInterval(fn, delay);
    cleanupManager.intervals.add(id);
    return id;
  },
  clearAll: () => {
    cleanupManager.timeouts.forEach(clearTimeout);
    cleanupManager.intervals.forEach(clearInterval);
    cleanupManager.timeouts.clear();
    cleanupManager.intervals.clear();
  }
};

function shutdown() {
  cleanupManager.clearAll();
  if (window.primaryWebSocket) window.primaryWebSocket.disconnect();
  if (window.fallbackWebSocket) window.fallbackWebSocket.disconnect();
  window.activeWebSocket = null;
  window.isShutdown = true;
}

async function validateStoredKey() {
  const key = window.VW_API_KEY;
  if (!key) return false;
  try {
    const res = await fetch(`https://apikey-nine.vercel.app/api/key/info/${key}`);
    const data = await res.json();
    return data.valid === true;
  } catch {
    return false;
  }
}

function handleBypassSuccess(url, timeSecondsStr, bypassType = '', forceCompleteUI = false) {
  if (window.__vw_bypass_completed) return;
  window.__vw_bypass_completed = true;
  if (isLuarmorUrl(url)) {
    if (typeof showHashExpireUI === 'function') showHashExpireUI(url);
    else location.href = url;
    shutdown();
    return;
  }
  const auto = isAutoRedirectEnabled();
  if (auto && !forceCompleteUI) {
    if (typeof updateStatus === 'function') updateStatus('Redirecting...', `Target URL acquired (${timeSecondsStr}s)`);
    if (typeof showToast === 'function') showToast(`Bypassed in ${timeSecondsStr}s`, false, SUCCESS_GIF);
    setTimeout(() => { location.href = url; }, 1000);
  } else {
    if (typeof injectUI === 'function') injectUI();
    if (typeof showCompleteUI === 'function') showCompleteUI(url, timeSecondsStr, true);
  }
  shutdown();
}

function handleBypassError(errorMsg) {
  if (typeof updateStatus === 'function') updateStatus('❌ Bypass failed', errorMsg);
  if (typeof showToast === 'function') showToast(`Bypass failed: ${errorMsg}`, true, ERROR_JPG);
  if (typeof injectUI === 'function') injectUI();
  if (typeof showCompleteUI === 'function') showCompleteUI('', '', false, errorMsg);
}

let uiInjected = false;
function injectUI(iconUrl = LOOTLINK_UI_ICON) {
  if (uiInjected) return;
  if (!document.body) return;
  const existing = document.getElementById('vortixWorldOverlay');
  if (existing) existing.remove();
  const styleId = 'vortixWorldStyles';
  if (!document.getElementById(styleId)) {
    const styleSheet = document.createElement('style');
    styleSheet.id = styleId;
    styleSheet.innerText = SHARED_UI_CSS;
    document.head.appendChild(styleSheet);
  }
  const wrapper = document.createElement('div');
  wrapper.innerHTML = `
    <div id="vortixWorldOverlay">
      <div class="vw-header-bar"><div class="vw-title"><img src="${ICON_URL}" class="vw-header-icon">VortixWorld</div></div>
      <div class="vw-main-content">
        <img src="${iconUrl}" class="vw-icon-img" onerror="this.src='${ICON_URL}'">
        <div class="vw-spinner" id="vwSpinner"></div>
        <div id="vwStatus" class="vw-status">Preparing bypass...</div>
        <div id="vwSubStatus" class="vw-substatus">Waiting for task data</div>
      </div>
    </div>
  `;
  document.body.appendChild(wrapper.firstElementChild);
  document.body.style.overflow = 'hidden';
  document.documentElement.style.overflow = 'hidden';
  uiInjected = true;
}

function updateStatus(main, sub) {
  const m = document.getElementById('vwStatus');
  const s = document.getElementById('vwSubStatus');
  if (m) m.innerText = main;
  if (s) s.innerText = sub;
  const spinner = document.getElementById('vwSpinner');
  if (spinner) {
    spinner.style.display = (main.includes('Complete') || main.includes('Redirecting') || main.includes('Failed')) ? 'none' : 'block';
  }
}

function showCompleteUI(finalUrl, timeLabel, isSuccess = true, errorMsg = '') {
  const overlay = document.getElementById('vortixWorldOverlay');
  if (!overlay) return;
  const mainContent = overlay.querySelector('.vw-main-content');
  if (!mainContent) return;
  const iconImg = mainContent.querySelector('.vw-icon-img');
  if (iconImg) iconImg.style.display = 'none';
  const spinner = document.getElementById('vwSpinner');
  if (spinner) spinner.style.display = 'none';
  mainContent.innerHTML = `
    <img src="${isSuccess ? SUCCESS_GIF : ERROR_JPG}" class="vw-icon-img" style="display:block" onerror="this.src='${ICON_URL}'">
    <div id="vwStatus" class="vw-status">${isSuccess ? '✔️ Bypass Complete!' : '❌ Bypass Failed'}</div>
    <div id="vwSubStatus" class="vw-substatus">${isSuccess ? `Completed in ${timeLabel}s` : errorMsg}</div>
    ${isSuccess ? `<div class="vw-url-container" id="vwUrlContainer">${escapeHtml(finalUrl)}</div>` : ''}
    <div class="vw-button-group">
      ${isSuccess ? '<button id="vwCopyBtn" class="vw-btn vw-btn-copy">📋 Copy URL</button>' : ''}
      <button id="vwProceedBtn" class="vw-btn vw-btn-proceed">${isSuccess ? '➡️ Proceed' : 'OK'}</button>
    </div>
  `;
  if (isSuccess) {
    document.getElementById('vwCopyBtn')?.addEventListener('click', () => {
      copyTextSilent(finalUrl).then(() => showToast?.('URL copied', false, '📋'));
    });
  }
  document.getElementById('vwProceedBtn')?.addEventListener('click', () => {
    if (isSuccess) location.href = finalUrl;
    else overlay.remove();
  });
}

function showHashExpireUI(finalUrl) {
  const existing = document.getElementById('vortixWorldOverlay');
  if (existing) existing.remove();
  uiInjected = false;
  if (document.body) document.body.style.overflow = '';
  document.documentElement.style.overflow = '';
  const overlay = document.createElement('div');
  overlay.id = 'vwHashExpireOverlay';
  overlay.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:#1e1e1e;display:flex;align-items:center;justify-content:center;z-index:2147483647;color:#e0e0e0;font-family:sans-serif';
  overlay.innerHTML = `
    <div style="text-align:center;background:#1e1e1e;padding:40px;border-radius:24px;box-shadow:8px 8px 16px #141414,-8px -8px 16px #282828">
      <img src="${LUARMOR_UI_ICON}" style="width:80px;height:80px;border-radius:50%;margin-bottom:20px">
      <h3>⚠️ Expiring Hash Detected</h3>
      <p>Please redirect quickly before the link expires.</p>
      <div id="hz" style="font-size:45px;font-weight:bold;color:#ef4444;margin:20px">7</div>
      <button id="go" style="padding:14px 35px;border-radius:40px;background:#1e1e1e;box-shadow:4px 4px 8px #141414,-4px -4px 8px #282828;color:#e0e0e0;font-weight:700;cursor:pointer">🔗 Go to Link Now</button>
    </div>
  `;
  document.documentElement.appendChild(overlay);
  let tl = 7;
  const iv = setInterval(() => {
    tl--;
    document.getElementById('hz').textContent = tl;
    if (tl <= 0) {
      clearInterval(iv);
      document.getElementById('go').disabled = true;
      location.reload();
    }
  }, 1000);
  document.getElementById('go').onclick = () => location.href = finalUrl;
}

window.ICON_URL = ICON_URL;
window.LOOTLINK_UI_ICON = LOOTLINK_UI_ICON;
window.SUCCESS_GIF = SUCCESS_GIF;
window.ERROR_JPG = ERROR_JPG;
window.ANDROID_UA = ANDROID_UA;
window.INCENTIVE_SERVER_DOMAIN = INCENTIVE_SERVER_DOMAIN;
window.INCENTIVE_SYNCER_DOMAIN = INCENTIVE_SYNCER_DOMAIN;
window.TC_PROXY_URL = TC_PROXY_URL;
window.API_BASE = API_BASE;
window.TID = TID;
window.CONFIG = CONFIG;
window.SHARED_UI_CSS = SHARED_UI_CSS;
window.API_UI_CSS = API_UI_CSS;
window.escapeHtml = escapeHtml;
window.isLuarmorUrl = isLuarmorUrl;
window.isAutoRedirectEnabled = isAutoRedirectEnabled;
window.decodeURIxor = decodeURIxor;
window.cleanupManager = cleanupManager;
window.shutdown = shutdown;
window.validateStoredKey = validateStoredKey;
window.handleBypassSuccess = handleBypassSuccess;
window.handleBypassError = handleBypassError;
window.injectUI = injectUI;
window.updateStatus = updateStatus;
window.showCompleteUI = showCompleteUI;
window.showHashExpireUI = showHashExpireUI;