const API_BASE = 'https://apikey-nine.vercel.app';
const SUCCESS_GIF = 'https://i.ibb.co/6JhLwXj/success.gif';
const ERROR_JPG = 'https://i.ibb.co/LdshK1fR/461-F6268-08-F3-4-E8A-BC73-409218-A3-F168.jpg';

const API_UI_CSS = `
.vw-api-card {
  position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 360px;
  max-width: 90vw; background: #1e1e1e; border-radius: 28px; padding: 20px;
  box-shadow: 10px 10px 20px #141414, -10px -10px 20px #282828; z-index: 2147483647;
  color: #e0e0e0; font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
  border: none; text-align: center;
}
.vw-api-card .vw-close {
  position: absolute; top: 16px; right: 16px; width: 28px; height: 28px; border-radius: 50%;
  background: #1e1e1e; border: none; box-shadow: 3px 3px 6px #141414, -3px -3px 6px #282828;
  color: #aaa; font-size: 16px; cursor: pointer; display: flex; align-items: center; justify-content: center;
}
.vw-api-icon { width: 80px; height: 80px; border-radius: 20px; margin: 10px auto; object-fit: cover; }
.vw-api-status { font-size: 20px; font-weight: 700; margin-bottom: 6px; }
.vw-api-substatus { font-size: 14px; color: #a0a0a0; margin-bottom: 16px; }
.vw-api-url {
  background: #2a2a2a; padding: 10px; border-radius: 40px; font-size: 13px; word-break: break-all;
  box-shadow: inset 3px 3px 6px #141414, inset -3px -3px 6px #282828; margin-bottom: 20px;
}
.vw-api-buttons { display: flex; gap: 10px; justify-content: center; }
.vw-api-btn {
  padding: 10px 18px; border-radius: 40px; border: none; background: #1e1e1e;
  box-shadow: 4px 4px 8px #141414, -4px -4px 8px #282828; color: #e0e0e0; font-weight: 600;
  font-size: 14px; cursor: pointer; transition: all 0.2s; flex: 1;
}
.vw-api-btn:active { box-shadow: inset 4px 4px 8px #141414, inset -4px -4px 8px #282828; }
.vw-api-btn-copy { color: #4ade80; }
.vw-api-btn-proceed { color: #60a5fa; }
.vw-api-topbar-inner { display: flex; align-items: center; gap: 12px; }
.vw-api-loading-ring {
  width: 18px; height: 18px; border: 2px solid #3a3a3a; border-top-color: #4ade80;
  border-radius: 50%; animation: vw-spin 0.8s linear infinite;
}
@keyframes vw-spin { to { transform: rotate(360deg); } }
`;

const safeLogger = {
  info: (...args) => (typeof Logger !== 'undefined' ? Logger.info(...args) : console.log('[VW]', ...args)),
  error: (...args) => (typeof Logger !== 'undefined' ? Logger.error(...args) : console.error('[VW]', ...args))
};

function hasGM() {
  return typeof GM_getValue === 'function' && typeof GM_setValue === 'function';
}

function getStoredAutoRedirect() {
  const key = 'vw_auto_redirect';
  const defaultValue = true;
  if (hasGM()) {
    try {
      const val = GM_getValue(key, defaultValue);
      if (val !== undefined && val !== null) return val;
    } catch (_) {}
  }
  try {
    const lsValue = localStorage.getItem(key);
    if (lsValue === null) return defaultValue;
    return lsValue === 'true';
  } catch (_) {
    return defaultValue;
  }
}

function copyTextSilent(text) {
  return navigator.clipboard?.writeText(text).catch(() => {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
  });
}

function showToast(message, isError = false, emoji = '') {
  const existing = document.getElementById('vw-toast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.id = 'vw-toast';
  toast.style.cssText = `
    position: fixed; top: 80px; right: 20px; padding: 12px 20px; background: #1e1e1e;
    border-radius: 40px; box-shadow: 6px 6px 12px #141414, -6px -6px 12px #282828;
    color: #e0e0e0; font-family: 'Inter', sans-serif; font-weight: 500; font-size: 14px;
    z-index: 2147483647; border-left: 4px solid ${isError ? '#ef4444' : '#4ade80'};
    pointer-events: none; animation: vw-toast-in 0.2s ease;
  `;
  toast.textContent = emoji ? `${emoji} ${message}` : message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

function isLuarmorUrl(url) {
  return /luarmor\.net/.test(url);
}

function shutdown() {}

async function validateStoredKey() {
  const key = window.VW_API_KEY;
  if (!key) return false;
  try {
    const res = await fetch(`${API_BASE}/api/key/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key })
    });
    const data = await res.json();
    return data.valid === true;
  } catch {
    return false;
  }
}

function appendToBestContainer(node) {
  const mount = document.body || document.documentElement;
  if (mount && node && node.parentNode !== mount) mount.appendChild(node);
}

function createApiTopBar(text = 'Bypassing...') {
  if (document.getElementById('vwApiTopBar')) return;
  const styleId = 'vwApiStyles';
  if (!document.getElementById(styleId)) {
    const styleSheet = document.createElement('style');
    styleSheet.id = styleId;
    styleSheet.innerText = API_UI_CSS;
    document.head.appendChild(styleSheet);
  }
  const bar = document.createElement('div');
  bar.id = 'vwApiTopBar';
  bar.style.cssText = `
    position: fixed; top: 20px; left: 50%; transform: translateX(-50%); width: 300px;
    max-width: 80vw; height: 48px; background: #1e1e1e; border-radius: 40px; border: none;
    box-shadow: 6px 6px 12px #141414, -6px -6px 12px #282828; z-index: 2147483647;
    display: flex; align-items: center; justify-content: center; font-family: 'Inter', system-ui, sans-serif;
    font-size: 14px; color: #e0e0e0; font-weight: 500;
  `;
  bar.innerHTML = `
    <div class="vw-api-topbar-inner">
      <span class="vw-api-loading-ring" aria-hidden="true"></span>
      <span class="vw-api-loading-text">${text}</span>
    </div>
  `;
  appendToBestContainer(bar);
  if (!document.body) {
    const onReady = () => {
      if (bar.isConnected && bar.parentNode !== document.body && document.body) document.body.appendChild(bar);
    };
    document.addEventListener('DOMContentLoaded', onReady, { once: true });
  }
  return bar;
}

function updateApiTopBarText(text) {
  const bar = document.getElementById('vwApiTopBar');
  if (bar) {
    const textEl = bar.querySelector('.vw-api-loading-text');
    if (textEl) textEl.textContent = text;
  }
}

function removeApiTopBar() {
  const bar = document.getElementById('vwApiTopBar');
  if (bar) bar.remove();
}

function showApiResultUI(finalUrl, timeLabel, isError = false, errorMsg = '') {
  removeApiTopBar();
  const styleId = 'vwApiStyles';
  if (!document.getElementById(styleId)) {
    const styleSheet = document.createElement('style');
    styleSheet.id = styleId;
    styleSheet.innerText = API_UI_CSS;
    document.head.appendChild(styleSheet);
  }
  const existingCard = document.getElementById('vwApiCard');
  if (existingCard) existingCard.remove();
  const card = document.createElement('div');
  card.id = 'vwApiCard';
  card.className = 'vw-api-card';
  const closeBtn = document.createElement('button');
  closeBtn.className = 'vw-close';
  closeBtn.textContent = '✕';
  closeBtn.addEventListener('click', () => card.remove());
  const icon = document.createElement('img');
  icon.src = isError ? ERROR_JPG : SUCCESS_GIF;
  icon.className = 'vw-api-icon';
  icon.alt = 'Status';
  const statusDiv = document.createElement('div');
  statusDiv.className = 'vw-api-status';
  statusDiv.textContent = isError ? '❌ Bypass Failed' : '✔️ Bypass Complete!';
  const substatusDiv = document.createElement('div');
  substatusDiv.className = 'vw-api-substatus';
  substatusDiv.textContent = isError ? errorMsg : `Completed in ${timeLabel}s`;
  const urlDiv = document.createElement('div');
  urlDiv.className = 'vw-api-url';
  urlDiv.textContent = isError ? '' : finalUrl;
  const buttonsDiv = document.createElement('div');
  buttonsDiv.className = 'vw-api-buttons';
  if (!isError) {
    const copyBtn = document.createElement('button');
    copyBtn.className = 'vw-api-btn vw-api-btn-copy';
    copyBtn.textContent = '📋 Copy URL';
    copyBtn.addEventListener('click', () => {
      copyTextSilent(finalUrl).then(() => { showToast('URL copied to clipboard', false, '📋'); });
    });
    const proceedBtn = document.createElement('button');
    proceedBtn.className = 'vw-api-btn vw-api-btn-proceed';
    proceedBtn.textContent = '➡️ Proceed to URL';
    proceedBtn.addEventListener('click', () => { location.href = finalUrl; });
    buttonsDiv.appendChild(copyBtn);
    buttonsDiv.appendChild(proceedBtn);
  } else {
    const okBtn = document.createElement('button');
    okBtn.className = 'vw-api-btn';
    okBtn.textContent = 'OK';
    okBtn.addEventListener('click', () => card.remove());
    buttonsDiv.appendChild(okBtn);
  }
  card.appendChild(closeBtn);
  card.appendChild(icon);
  card.appendChild(statusDiv);
  card.appendChild(substatusDiv);
  if (!isError) card.appendChild(urlDiv);
  card.appendChild(buttonsDiv);
  appendToBestContainer(card);
}

async function initApi() {
  const res = await fetch(API_BASE + '/api/auth/anon', { method: 'POST', headers: { 'Content-Type': 'application/json' } });
  const json = await res.json();
  safeLogger.info('API authentication successful', json.accessToken ? 'Token received' : 'No token');
  return json.accessToken;
}

async function bypassUrl(url, accessToken) {
  const res = await fetch(API_BASE + '/api/bypass/direct', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + accessToken },
    body: JSON.stringify({ url })
  });
  const json = await res.json();
  safeLogger.info('API bypass response', json.status);
  return json;
}

async function runApiBypass() {
  safeLogger.info('Starting API bypass for', location.href);
  createApiTopBar('Checking key...');
  const isValid = await validateStoredKey();
  if (!isValid) {
    updateApiTopBarText('❌ Key invalid/expired');
    showToast('API key invalid/expired', true, '❌');
    setTimeout(() => removeApiTopBar(), 3000);
    return;
  }
  updateApiTopBarText('Key valid. Bypassing...');
  try {
    const accessToken = await initApi();
    const result = await bypassUrl(location.href, accessToken);
    if (result.status === 'success') {
      const finalUrl = result.result;
      const timeLabel = result.time;
      const autoRedirect = getStoredAutoRedirect();
      if (isLuarmorUrl(finalUrl)) {
        removeApiTopBar();
        if (typeof showHashExpireUI === 'function') {
          showHashExpireUI(finalUrl);
        } else {
          location.href = finalUrl;
        }
        shutdown();
      } else {
        if (autoRedirect) {
          removeApiTopBar();
          location.href = finalUrl;
        } else {
          showApiResultUI(finalUrl, timeLabel, false);
          shutdown();
        }
      }
    } else {
      throw new Error(result.result || 'Bypass failed');
    }
  } catch (err) {
    safeLogger.error('API bypass failed', err.message);
    removeApiTopBar();
    showApiResultUI('', '', true, err.message);
  }
}

window.runApiBypass = runApiBypass;