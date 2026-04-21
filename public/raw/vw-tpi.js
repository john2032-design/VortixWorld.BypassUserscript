let tpiConsoleLines = [];
let tpiCountdownTimerId = null;
let tpiCurrentRemainingSeconds = 60;
let tpiMethodStartTime = null;
let tpiResolved = false;

function addTpiConsoleLine(text) {
  tpiConsoleLines.push(text);
  if (tpiConsoleLines.length > 8) tpiConsoleLines.shift();
  const consoleEl = document.getElementById('vwConsoleOutput');
  if (consoleEl) {
    consoleEl.innerHTML = tpiConsoleLines.map(line => `<div class="vw-console-line">${line}</div>`).join('');
    consoleEl.scrollTop = consoleEl.scrollHeight;
  }
}

function injectTpiUI() {
  if (document.getElementById('vortixWorldOverlay')) return;

  const styleId = 'vortixWorldStyles';
  if (!document.getElementById(styleId)) {
    const styleSheet = document.createElement('style');
    styleSheet.id = styleId;
    styleSheet.innerText = TPI_UI_CSS;
    (document.head || document.documentElement).appendChild(styleSheet);
  }

  const overlay = document.createElement('div');
  overlay.id = 'vortixWorldOverlay';
  overlay.innerHTML = `
    <div class="vw-header-bar">
      <div class="vw-title">
        <img src="${ICON_URL}" class="vw-header-icon" alt="Icon">
        VortixWorld
      </div>
    </div>
    <div class="vw-main-content">
      <img src="${ICON_URL}" class="vw-icon-img" alt="VortixWorld" onerror="this.onerror=null;this.src='${ICON_URL}'">
      <div class="vw-spinner" id="vwSpinner"></div>
      <div id="vwStatus" class="vw-status">Preparing bypass...</div>
      <div class="vw-console" id="vwConsoleOutput"></div>
      <div id="vwCountdown" class="vw-countdown" style="display:none;"></div>
    </div>
  `;
  document.body.appendChild(overlay);
  document.body.style.overflow = 'hidden';
  document.documentElement.style.overflow = 'hidden';
  addTpiConsoleLine('> Initializing tpi.li bypass...');
}

function updateTpiStatus(main, sub) {
  if (!document.getElementById('vortixWorldOverlay')) injectTpiUI();
  const m = document.getElementById('vwStatus');
  if (m) m.innerText = main;
  if (sub) addTpiConsoleLine(`> ${sub}`);
  const spinner = document.getElementById('vwSpinner');
  if (spinner) {
    if (main.includes('Complete') || main.includes('Redirecting') || main.includes('Failed')) {
      spinner.style.display = 'none';
    } else {
      spinner.style.display = 'block';
    }
  }
}

function startTpiCountdown(seconds) {
  if (tpiCountdownTimerId) clearInterval(tpiCountdownTimerId);
  tpiCurrentRemainingSeconds = seconds;
  const el = document.getElementById('vwCountdown');
  if (el) { el.style.display = 'block'; el.innerText = `Time Remaining: ${seconds}s`; }
  tpiCountdownTimerId = setInterval(() => {
    tpiCurrentRemainingSeconds = Math.max(0, tpiCurrentRemainingSeconds - 1);
    if (el) {
      el.innerText = `Time Remaining: ${tpiCurrentRemainingSeconds}s`;
      if (tpiCurrentRemainingSeconds <= 0) el.style.display = 'none';
    }
    if (tpiCurrentRemainingSeconds <= 0) {
      clearInterval(tpiCountdownTimerId);
      tpiCountdownTimerId = null;
    }
  }, 1000);
}

function showTpiCompleteUI(finalUrl, timeLabel, isSuccess = true, errorMsg = '') {
  if (tpiCountdownTimerId) { clearInterval(tpiCountdownTimerId); tpiCountdownTimerId = null; }
  const el = document.getElementById('vwCountdown'); if (el) el.style.display = 'none';
  const overlay = document.getElementById('vortixWorldOverlay');
  if (!overlay) return;
  const main = overlay.querySelector('.vw-main-content');
  if (!main) return;
  const spinner = main.querySelector('#vwSpinner'); if (spinner) spinner.style.display = 'none';
  const icon = main.querySelector('.vw-icon-img'); if (icon) icon.style.display = 'none';

  const statusIcon = isSuccess ? SUCCESS_GIF : ERROR_JPG;
  const statusText = isSuccess ? '✔️ Bypass Complete!' : '❌ Bypass Failed';
  const subText = isSuccess ? `Completed in ${timeLabel}s` : errorMsg;

  main.innerHTML = `
    <img src="${statusIcon}" class="vw-icon-img" style="display:block" onerror="this.onerror=null;this.src='${ICON_URL}'">
    <div id="vwStatus" class="vw-status">${statusText}</div>
    <div class="vw-console" id="vwConsoleOutput">${tpiConsoleLines.map(l => `<div class="vw-console-line">${l}</div>`).join('')}</div>
    <div class="vw-substatus" style="font-size:14px;color:#a0a0a0;margin-bottom:20px;background:#1e1e1e;box-shadow:inset 4px 4px 8px #141414, inset -4px -4px 8px #282828;padding:10px 15px;border-radius:10px;font-weight:600;">${subText}</div>
    ${isSuccess ? `<div class="vw-url-container" id="vwUrlContainer">${escapeHtml(finalUrl)}</div>` : ''}
    <div class="vw-button-group">
      ${isSuccess ? `<button id="vwCopyBtn" class="vw-btn vw-btn-copy">📋 Copy URL</button>` : ''}
      <button id="vwProceedBtn" class="vw-btn vw-btn-proceed">${isSuccess ? '➡️ Proceed' : 'OK'}</button>
    </div>
  `;
  if (isSuccess) {
    document.getElementById('vwCopyBtn').addEventListener('click', () => {
      copyTextSilent(finalUrl).then(() => showToast('URL copied to clipboard', false, '📋'));
    });
  }
  document.getElementById('vwProceedBtn').addEventListener('click', () => {
    if (isSuccess) location.href = finalUrl;
    else overlay.remove();
  });
  tpiResolved = true;
}

function handleTpiSuccess(url, timeSecondsStr) {
  let timeLabel = timeSecondsStr || (tpiMethodStartTime ? ((performance.now() - tpiMethodStartTime) / 1000).toFixed(2) : '0.00');
  if (tpiCountdownTimerId) { clearInterval(tpiCountdownTimerId); tpiCountdownTimerId = null; }
  const el = document.getElementById('vwCountdown'); if (el) el.style.display = 'none';

  if (isAutoRedirectEnabled()) {
    updateTpiStatus('Redirecting...', `Target URL acquired (${timeLabel}s)`);
    showToast(`Bypassed in ${timeLabel}s`, false, SUCCESS_GIF);
    setTimeout(() => { location.href = url; }, 1000);
  } else {
    showTpiCompleteUI(url, timeLabel, true);
  }
}

function handleTpiError(errorMsg) {
  if (tpiCountdownTimerId) { clearInterval(tpiCountdownTimerId); tpiCountdownTimerId = null; }
  updateTpiStatus('❌ Bypass failed', errorMsg);
  showToast(`Bypass failed: ${errorMsg}`, true, ERROR_JPG);
  showTpiCompleteUI('', '', false, errorMsg);
}

async function runLocalTpiLiBypass() {
  console.log('[VW] runLocalTpiLiBypass called');
  Logger.info('VortixWorld local tpi.li bypass enabled');

  (function waitForBody(cb) {
    if (document.body) cb();
    else document.addEventListener('DOMContentLoaded', cb, { once: true });
  })(() => {
    injectTpiUI();
    updateTpiStatus('Checking key...', 'Validating API key');
  });

  const isValid = await validateStoredKey();
  if (!isValid) {
    updateTpiStatus('❌ Key invalid/expired', 'Please update API key in settings');
    showToast('API key invalid/expired', true, ERROR_JPG);
    return;
  }

  updateTpiStatus('Key valid', 'Fetching tpi.li link...');
  tpiMethodStartTime = performance.now();

  try {
    const alias = location.pathname.slice(1);
    if (!alias) throw new Error('No alias found');
    addTpiConsoleLine(`> Alias: ${alias}`);
    const res = await fetch(location.href, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const html = await res.text();
    addTpiConsoleLine('> Page fetched, extracting token...');
    let m = html.match(/name="token"\s+value="([^"]+)"/) || html.match(/value="([^"]+)"\s+name="token"/);
    if (!m) throw new Error('Token not found');
    const token = m[1];
    addTpiConsoleLine('> Token extracted, decoding...');
    const offset = 40 + 4 + alias.length + 4;
    if (token.length < offset) throw new Error('Token too short');
    const finalUrl = atob(token.slice(offset));
    addTpiConsoleLine('> URL decoded successfully');
    if (!finalUrl.startsWith('http')) throw new Error('Invalid URL');
    const duration = ((Date.now() - tpiMethodStartTime) / 1000).toFixed(2);
    handleTpiSuccess(finalUrl, duration);
  } catch (e) {
    Logger.error('tpi.li bypass failed', e.message);
    handleTpiError(e.message);
  }
}

window.runLocalTpiLiBypass = runLocalTpiLiBypass;