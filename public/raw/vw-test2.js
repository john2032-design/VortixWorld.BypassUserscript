function appendToBestContainer(node) {
  const mount = document.body || document.documentElement;
  if (mount && node && node.parentNode !== mount) mount.appendChild(node);
}

let apiBarTimer = null;
let apiResultTimer = null;

function createApiTopBar(text = 'Bypassing...') {
  if (apiBarTimer) clearTimeout(apiBarTimer);
  const existing = document.getElementById('vwApiTopBar');
  if (existing) {
    const textEl = existing.querySelector('.vw-api-loading-text');
    if (textEl) textEl.textContent = text;
    return existing;
  }
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
  if (apiBarTimer) clearTimeout(apiBarTimer);
  const bar = document.getElementById('vwApiTopBar');
  if (bar) bar.remove();
}

function showApiResultUI(finalUrl, timeLabel, isError = false, errorMsg = '') {
  if (apiResultTimer) clearTimeout(apiResultTimer);
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

function getStoredAutoRedirect() {
  const key = 'vw_auto_redirect';
  const defaultValue = true;
  if (typeof GM_getValue === 'function' && typeof GM_setValue === 'function') {
    try {
      const val = GM_getValue(key);
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

let authTokenCache = null;
let authTokenExpiry = 0;

async function getAccessToken() {
  const now = Date.now();
  if (authTokenCache && now < authTokenExpiry) return authTokenCache;
  const res = await fetch(API_BASE + '/api/auth/anon', { method: 'POST', headers: { 'Content-Type': 'application/json' } });
  const json = await res.json();
  authTokenCache = json.accessToken;
  authTokenExpiry = now + (json.expiresIn - 30) * 1000;
  return authTokenCache;
}

async function bypassUrl(url) {
  const accessToken = await getAccessToken();
  const apiKey = window.VW_API_KEY || '';
  const res = await fetch(API_BASE + '/api/bypass/direct', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + accessToken,
      'X-VW-API-Key': apiKey
    },
    body: JSON.stringify({ url })
  });
  const json = await res.json();
  return json;
}

async function runApiBypass() {
  createApiTopBar('Checking key...');
  requestIdleCallback(async () => {
    const isValid = await validateStoredKey();
    if (!isValid) {
      updateApiTopBarText('❌ Key invalid/expired');
      showToast('API key invalid/expired', true, ERROR_JPG);
      apiBarTimer = setTimeout(() => removeApiTopBar(), 3000);
      return;
    }
    updateApiTopBarText('Key valid. Bypassing...');
    try {
      const result = await bypassUrl(location.href);
      if (result.status === 'success') {
        const finalUrl = result.result;
        const timeLabel = result.time;
        if (isLuarmorUrl(finalUrl)) {
          removeApiTopBar();
          showHashExpireUI(finalUrl);
          shutdown();
        } else {
          const autoRedirect = getStoredAutoRedirect();
          if (autoRedirect) {
            removeApiTopBar();
            location.href = finalUrl;
          } else {
            showApiResultUI(finalUrl, timeLabel, false);
            shutdown();
          }
        }
      } else {
        const errorDetail = JSON.stringify(result, null, 2);
        throw new Error(errorDetail);
      }
    } catch (err) {
      removeApiTopBar();
      showApiResultUI('', '', true, err.message);
    }
  });
}

window.runApiBypass = runApiBypass;