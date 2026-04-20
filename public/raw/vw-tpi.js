const HOST = (location.hostname || '').toLowerCase().replace(/^www\./, '');
const ICON_URL = 'https://i.postimg.cc/Y2TmKMf8/2180201F-FB5D-4574-9E55-158B4442F02A.png';
const SUCCESS_GIF = 'https://cdn3.emoji.gg/emojis/529330-ai-baby.gif';
const ERROR_JPG = 'https://iili.io/Blf65Is.md.jpg';
const TPI_HOST = 'tpi.li';
const VW_KEYS = { autoRedirect: 'vw_auto_redirect' };

const SHARED_UI_CSS = `
  :root {
    --vw-bg: #1e1e1e;
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

let uiInjected = false, consoleLines = [], countdownTimerId = null, currentRemainingSeconds = 60;
let methodStartTime = null, bypassActive = false, resolved = false;

function addConsoleLine(text) {
  consoleLines.push(text); if (consoleLines.length>8) consoleLines.shift();
  const el = document.getElementById('vwConsoleOutput');
  if (el) { el.innerHTML = consoleLines.map(l=>`<div class="vw-console-line">${l}</div>`).join(''); el.scrollTop = el.scrollHeight; }
}
function injectUI(iconUrl=ICON_URL) {
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
function escapeHtml(str) {
  return String(str).replace(/[&<>]/g, m => m==='&'?'&amp;':m==='<'?'&lt;':'&gt;');
}
function isAutoRedirectEnabled() {
  const saved = localStorage.getItem(VW_KEYS.autoRedirect);
  return saved !== null ? saved === 'true' : true;
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
  bypassActive = false; resolved = true;
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
}
function handleBypassError(errorMsg) {
  if (countdownTimerId) { clearInterval(countdownTimerId); countdownTimerId = null; }
  updateStatus('❌ Bypass failed', errorMsg);
  showToast(`Bypass failed: ${errorMsg}`, true, ERROR_JPG);
  injectUI();
  showCompleteUI('', '', false, errorMsg);
}

async function runLocalTpiLiBypass() {
  Logger.info('VortixWorld local tpi.li bypass enabled');
  injectUI(ICON_URL);
  updateStatus('Checking key...', 'Validating API key');
  const isValid = await validateStoredKey();
  if (!isValid) {
    updateStatus('❌ Key invalid/expired', 'Please update API key in settings');
    showToast('API key invalid/expired', true, ERROR_JPG);
    return;
  }
  updateStatus('Key valid', 'Fetching tpi.li link...');
  methodStartTime = performance.now();
  try {
    const alias = location.pathname.slice(1);
    if (!alias) throw new Error('No alias found');
    addConsoleLine(`> Alias: ${alias}`);
    const res = await fetch(location.href, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const html = await res.text();
    addConsoleLine('> Page fetched, extracting token...');
    let m = html.match(/name="token"\s+value="([^"]+)"/) || html.match(/value="([^"]+)"\s+name="token"/);
    if (!m) throw new Error('Token not found');
    const token = m[1];
    addConsoleLine('> Token extracted, decoding...');
    const offset = 40 + 4 + alias.length + 4;
    if (token.length < offset) throw new Error('Token too short');
    const finalUrl = atob(token.slice(offset));
    addConsoleLine('> URL decoded successfully');
    if (!finalUrl.startsWith('http')) throw new Error('Invalid URL');
    const duration = ((Date.now() - (methodStartTime||0)) / 1000).toFixed(2);
    handleBypassSuccess(finalUrl, duration);
  } catch(e) {
    Logger.error('tpi.li bypass failed', e.message);
    handleBypassError(e.message);
  }
}
window.runLocalTpiLiBypass = runLocalTpiLiBypass;