const HOST = (location.hostname || '').toLowerCase().replace(/^www\./, '');
const ICON_URL = 'https://i.postimg.cc/Y2TmKMf8/2180201F-FB5D-4574-9E55-158B4442F02A.png';
const SUCCESS_GIF = 'https://cdn3.emoji.gg/emojis/529330-ai-baby.gif';
const ERROR_JPG = 'https://iili.io/Blf65Is.md.jpg';
const API_BASE = 'https://vortixworld-end.vercel.app';
const VW_KEYS = { autoRedirect: 'vw_auto_redirect' };

const API_UI_CSS = `
  .vw-api-card {
    position:fixed!important; top:50%!important; left:50%!important; transform:translate(-50%,-50%)!important;
    width:min(500px,90vw)!important; background:#1e1e1e!important; border-radius:24px!important;
    box-shadow:8px 8px 16px #141414,-8px -8px 16px #282828!important; padding:24px!important;
    text-align:center!important; z-index:2147483647!important; font-family:'Inter',system-ui,sans-serif!important;
  }
  .vw-api-card .vw-close {
    position:absolute!important; top:16px!important; right:16px!important; background:#1e1e1e!important;
    box-shadow:3px 3px 6px #141414,-3px -3px 6px #282828!important; border:none!important; color:#aaa!important;
    font-size:18px!important; cursor:pointer!important; padding:6px 10px!important; border-radius:50%!important;
  }
  .vw-api-card .vw-close:active { box-shadow:inset 3px 3px 6px #141414,inset -3px -3px 6px #282828!important; }
  .vw-api-icon { width:64px!important; height:64px!important; border-radius:50%!important; margin-bottom:16px!important; box-shadow:4px 4px 8px #141414,-4px -4px 8px #282828!important; object-fit:cover!important; }
  .vw-api-status { font-size:28px!important; font-weight:700!important; margin-bottom:8px!important; color:#e0e0e0!important; }
  .vw-api-substatus { font-size:14px!important; color:#a0a0a0!important; margin-bottom:16px!important; }
  .vw-api-url { background:#1e1e1e!important; box-shadow:inset 4px 4px 8px #141414,inset -4px -4px 8px #282828!important; border-radius:12px!important; padding:12px!important; word-break:break-all!important; font-family:monospace!important; font-size:12px!important; color:#b3b3b3!important; margin-bottom:20px!important; max-height:100px!important; overflow-y:auto!important; }
  .vw-api-buttons { display:flex!important; gap:12px!important; }
  .vw-api-btn { flex:1!important; background:#1e1e1e!important; box-shadow:4px 4px 8px #141414,-4px -4px 8px #282828!important; border:none!important; padding:12px!important; border-radius:40px!important; color:#e0e0e0!important; font-weight:600!important; cursor:pointer!important; transition:all .2s!important; }
  .vw-api-btn-copy { color:#4ade80!important; }
  .vw-api-btn:active { box-shadow:inset 4px 4px 8px #141414,inset -4px -4px 8px #282828!important; transform:translateY(1px)!important; }
  .vw-api-topbar-inner { display:inline-flex!important; align-items:center!important; justify-content:center!important; gap:10px!important; width:100%!important; height:100%!important; padding:0 16px!important; white-space:nowrap!important; }
  .vw-api-loading-ring { width:20px!important; height:20px!important; flex:0 0 auto!important; display:inline-block!important; border-radius:50%!important; border:3px solid #141414!important; border-top:3px solid #e0e0e0!important; animation:vw-api-spin .8s linear infinite!important; }
  .vw-api-loading-text { color:#e0e0e0!important; font-weight:600!important; line-height:1!important; white-space:nowrap!important; }
  @keyframes vw-api-spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
`;

function appendToBestContainer(node) {
  const mount = document.body || document.documentElement;
  if (mount && node && node.parentNode !== mount) mount.appendChild(node);
}
function createApiTopBar(text='Bypassing...') {
  if (document.getElementById('vwApiTopBar')) return;
  const style = document.createElement('style'); style.id = 'vwApiStyles'; style.textContent = API_UI_CSS;
  document.head.appendChild(style);
  const bar = document.createElement('div'); bar.id = 'vwApiTopBar';
  bar.style.cssText = `position:fixed;top:20px;left:50%;transform:translateX(-50%);width:300px;max-width:80vw;height:48px;background:#1e1e1e;border-radius:40px;box-shadow:6px 6px 12px #141414,-6px -6px 12px #282828;z-index:2147483647;display:flex;align-items:center;justify-content:center;font-family:'Inter',system-ui,sans-serif;font-size:14px;color:#e0e0e0;font-weight:500;`;
  bar.innerHTML = `<div class="vw-api-topbar-inner"><span class="vw-api-loading-ring"></span><span class="vw-api-loading-text">${text}</span></div>`;
  appendToBestContainer(bar);
  if (!document.body) document.addEventListener('DOMContentLoaded', ()=>{ if (bar.parentNode!==document.body&&document.body) document.body.appendChild(bar); }, {once:true});
  return bar;
}
function updateApiTopBarText(text) {
  const el = document.querySelector('#vwApiTopBar .vw-api-loading-text');
  if (el) el.textContent = text;
}
function removeApiTopBar() { document.getElementById('vwApiTopBar')?.remove(); }
function showApiResultUI(finalUrl, timeLabel, isError=false, errorMsg='') {
  removeApiTopBar();
  const existing = document.getElementById('vwApiCard'); if (existing) existing.remove();
  const card = document.createElement('div'); card.id = 'vwApiCard'; card.className = 'vw-api-card';
  card.innerHTML = `
    <button class="vw-close">✕</button>
    <img src="${isError?ERROR_JPG:SUCCESS_GIF}" class="vw-api-icon">
    <div class="vw-api-status">${isError?'❌ Bypass Failed':'✔️ Bypass Complete!'}</div>
    <div class="vw-api-substatus">${isError?errorMsg:`Completed in ${timeLabel}s`}</div>
    ${!isError?`<div class="vw-api-url">${finalUrl}</div>`:''}
    <div class="vw-api-buttons">
      ${!isError?`<button class="vw-api-btn vw-api-btn-copy">📋 Copy URL</button><button class="vw-api-btn vw-api-btn-proceed">➡️ Proceed</button>`:`<button class="vw-api-btn">OK</button>`}
    </div>`;
  card.querySelector('.vw-close').addEventListener('click', ()=>card.remove());
  if (!isError) {
    card.querySelector('.vw-api-btn-copy').addEventListener('click', ()=>{ copyTextSilent(finalUrl).then(()=>showToast('URL copied',false,'📋')); });
    card.querySelector('.vw-api-btn-proceed').addEventListener('click', ()=>{ location.href=finalUrl; });
  } else card.querySelector('.vw-api-btn').addEventListener('click', ()=>card.remove());
  appendToBestContainer(card);
}
function getStoredAutoRedirect() {
  const key = VW_KEYS.autoRedirect;
  const defaultValue = true;
  if (typeof GM_getValue === 'function') { try { const v = GM_getValue(key); if (v!==undefined) return v; } catch(_){} }
  const ls = localStorage.getItem(key);
  return ls === null ? defaultValue : ls === 'true';
}
async function initApi() {
  const res = await fetch(API_BASE+'/api/auth/anon', { method:'POST', headers:{'Content-Type':'application/json'} });
  const json = await res.json();
  Logger.info('API authentication successful', json.accessToken?'Token received':'No token');
  return json.accessToken;
}
async function bypassUrl(url, accessToken) {
  const apiKey = window.VW_API_KEY || '';
  const res = await fetch(API_BASE+'/api/bypass/direct', {
    method:'POST',
    headers: { 'Content-Type':'application/json', 'Authorization':'Bearer '+accessToken, 'X-VW-API-Key':apiKey },
    body: JSON.stringify({ url })
  });
  const json = await res.json();
  Logger.info('API bypass response', json.status);
  return json;
}
async function copyTextSilent(text) {
  try { if (navigator.clipboard && window.isSecureContext) { await navigator.clipboard.writeText(String(text)); return true; } } catch (_) {}
  try { const ta = document.createElement('textarea'); ta.value = String(text); ta.style.position='fixed'; ta.style.left='-9999px'; document.body.appendChild(ta); ta.select(); const ok = document.execCommand('copy'); ta.remove(); return ok; } catch (_) { return false; }
}
async function runApiBypass() {
  Logger.info('Starting API bypass for', location.href);
  createApiTopBar('Checking key...');
  const isValid = await validateStoredKey();
  if (!isValid) {
    updateApiTopBarText('❌ Key invalid/expired');
    showToast('API key invalid/expired', true, ERROR_JPG);
    setTimeout(removeApiTopBar, 3000);
    return;
  }
  updateApiTopBarText('Key valid. Bypassing...');
  try {
    const token = await initApi();
    const result = await bypassUrl(location.href, token);
    if (result.status === 'success') {
      if (getStoredAutoRedirect()) {
        removeApiTopBar();
        location.href = result.result;
      } else {
        showApiResultUI(result.result, result.time, false);
      }
    } else throw new Error(JSON.stringify(result));
  } catch(e) {
    Logger.error('API bypass failed', e.message);
    removeApiTopBar();
    showApiResultUI('', '', true, e.message);
  }
}
window.runApiBypass = runApiBypass;