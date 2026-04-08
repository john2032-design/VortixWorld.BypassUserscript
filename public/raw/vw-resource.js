const HOST = (location.hostname || '').toLowerCase().replace(/^www\./, '');
const ICON_URL = 'https://i.ibb.co/LdshK1fR/461-F6268-08-F3-4-E8A-BC73-409218-A3-F168.jpg';
const LOOTLINK_UI_ICON = 'https://i.ibb.co/s0yg2cv/AA1-D3-E03-2205-4572-ACFB-29-B8-B9-DDE381.png';
const LUARMOR_UI_ICON = 'https://i.ibb.co/BDQS9rS/F20-A6183-C85E-447-C-A27-C-11-B9-E8971-B45.png';
const SUCCESS_GIF = 'https://i.ibb.co/jP7P4Dbw/IMG-0022.gif';
const ERROR_JPG = 'https://i.ibb.co/0yFFh8yW/IMG-0184-Edited.jpg';
const SITE_HOST = 'vortix-world-bypass.vercel.app';
const TPI_HOST = 'tpi.li';
const ANDROID_UA = 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36';
const API_BASE = 'https://vortixworld-end.vercel.app';
const TC_PROXY_URL = 'https://lootlink-backend.onrender.com/tc';

const LOOT_HOSTS = [
  'loot-link.com', 'loot-links.com', 'lootlink.org', 'lootlinks.co',
  'lootdest.info', 'lootdest.org', 'lootdest.com', 'links-loot.com',
  'linksloot.net', 'lootlinks.com', 'best-links.org', 'loot-labs.com',
  'lootlabs.com', 'fast-links.org', 'rapid-links.com', 'rapid-links.net'
];

const ALLOWED_SHORT_HOSTS = [
  'linkvertise.com', 'admaven.com', 'work.ink', 'shortearn.eu',
  'beta.shortearn.eu', 'cuty.io', 'ouo.io', 'lockr.so',
  'rekonise.com', 'mboost.me', 'link-unlocker.com', 'direct-link.net',
  'direct-links.net', 'direct-links.org', 'link-center.net', 'link-hub.net',
  'link-pays.in', 'link-target.net', 'link-target.org', 'link-to.net'
];

const UA = navigator.userAgent;
const isIOS = /iPad|iPhone|iPod/.test(UA) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const isAndroid = /Android/.test(UA);
const isMobile = isIOS || isAndroid || /Mobi|Tablet/.test(UA);

if (isIOS) document.documentElement.classList.add('vw-ios');
if (isAndroid) document.documentElement.classList.add('vw-android');
if (isMobile) document.documentElement.classList.add('vw-mobile');
if (!isMobile) document.documentElement.classList.add('vw-desktop');

function hostMatchesAny(list) {
  const h = HOST;
  for (const base of list) {
    if (h === base) return true;
    if (h.endsWith('.' + base)) return true;
  }
  return false;
}

const isLootHost = () => hostMatchesAny(LOOT_HOSTS);
const isAllowedHost = () => hostMatchesAny(ALLOWED_SHORT_HOSTS);
const isTpiLi = () => HOST === TPI_HOST || HOST.endsWith('.' + TPI_HOST);

const CONFIG = Object.freeze({
  HEARTBEAT_INTERVAL: 10,
  INITIAL_RECONNECT_DELAY: 1000,
  COUNTDOWN_INTERVAL: 1000,
  FALLBACK_CHECK_DELAY: 15000
});

const VW_KEYS = window.VW_CONFIG?.keys || {
  autoRedirect: 'vw_auto_redirect'
};

const SHARED_UI_CSS = `
  :root {
    --vw-bg: #1e1e1e;
    --vw-glass-bg: #1e1e1e;
    --vw-text: #e0e0e0;
    --vw-text-dim: #a0a0a0;
    --neu-out: 8px 8px 16px #141414, -8px -8px 16px #282828;
    --neu-in: inset 4px 4px 8px #141414, inset -4px -4px 8px #282828;
    --neu-btn: 4px 4px 8px #141414, -4px -4px 8px #282828;
    --neu-btn-active: inset 4px 4px 8px #141414, inset -4px -4px 8px #282828;
  }
  html, body {
    margin: 0; padding: 0; height: 100%; overflow: hidden; background: var(--vw-bg);
  }
  html.vw-ios #vortixWorldOverlay {
    padding-top: env(safe-area-inset-top) !important;
    padding-bottom: env(safe-area-inset-bottom) !important;
  }
  #vortixWorldOverlay {
    position: fixed !important; top: 0 !important; left: 0 !important; width: 100vw !important;
    height: 100vh !important; height: 100dvh !important; background: var(--vw-bg) !important;
    z-index: 2147483647 !important; display: flex !important; flex-direction: column !important;
    align-items: center !important; justify-content: center !important;
    font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
    opacity: 1 !important; visibility: visible !important; pointer-events: auto !important;
    box-sizing: border-box !important; isolation: isolate !important;
  }
  #vortixWorldOverlay * { box-sizing: border-box !important; }
  .vw-header-bar {
    position: absolute !important; top: 0 !important; left: 0 !important; width: 100% !important;
    height: 72px !important; padding: 0 28px !important; display: flex !important;
    align-items: center !important; justify-content: space-between !important;
    background: var(--vw-bg) !important; box-shadow: 0 4px 10px #141414 !important;
    z-index: 2147483648 !important;
  }
  html.vw-ios .vw-header-bar { top: env(safe-area-inset-top) !important; }
  .vw-title {
    font-weight: 700 !important; font-size: 1.5rem !important; display: flex !important;
    align-items: center !important; gap: 12px !important; color: var(--vw-text) !important;
  }
  .vw-header-icon {
    height: 36px !important; width: 36px !important; border-radius: 50% !important;
    object-fit: cover !important; box-shadow: var(--neu-btn) !important;
  }
  .vw-main-content {
    display: flex !important; flex-direction: column !important; align-items: center !important;
    justify-content: center !important; width: 100% !important; max-width: 520px !important;
    padding: 2.5rem !important; background: var(--vw-bg) !important; border-radius: 24px !important;
    border: none !important; box-shadow: var(--neu-out) !important; text-align: center !important;
    animation: vw-fade-in 0.5s cubic-bezier(0.2, 0.9, 0.4, 1.1) !important;
  }
  .vw-icon-img {
    width: 96px !important; height: 96px !important; border-radius: 50% !important;
    margin-bottom: 1.5rem !important; object-fit: cover !important; box-shadow: var(--neu-btn) !important;
  }
  .vw-spinner {
    width: 48px !important; height: 48px !important; border: 4px solid #141414 !important;
    border-top: 4px solid var(--vw-text) !important; border-radius: 50% !important;
    animation: spin 0.8s linear infinite !important; margin-bottom: 1.5rem !important;
    box-shadow: var(--neu-btn) !important;
  }
  @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
  .vw-status {
    font-size: 1.8rem !important; font-weight: 700 !important; color: var(--vw-text) !important;
    margin-bottom: 0.5rem !important;
  }
  .vw-substatus {
    font-size: 0.9rem !important; color: var(--vw-text-dim) !important; background: var(--vw-bg) !important;
    box-shadow: var(--neu-in) !important; padding: 8px 18px !important; border-radius: 40px !important;
    display: inline-block !important; word-break: break-word !important; max-width: 90vw !important;
  }
  .vw-url-container {
    width: 100% !important; margin: 1.5rem 0 1rem 0 !important; padding: 1rem !important;
    background: var(--vw-bg) !important; border-radius: 12px !important; box-shadow: var(--neu-in) !important;
    word-break: break-all !important; font-size: 0.85rem !important; color: #b3b3b3 !important;
    font-family: monospace !important; max-height: 100px !important; overflow-y: auto !important; border: none !important;
  }
  .vw-button-group {
    display: flex !important; gap: 1rem !important; width: 100% !important; margin-top: 1rem !important;
  }
  .vw-btn {
    background: var(--vw-bg) !important; color: var(--vw-text) !important; border: none !important;
    box-shadow: var(--neu-btn) !important; padding: 0.85rem 1rem !important; border-radius: 40px !important;
    font-weight: 600 !important; cursor: pointer !important; transition: all 0.2s ease !important;
    font-size: 0.95rem !important; flex: 1;
  }
  .vw-btn-copy { color: #4ade80 !important; }
  .vw-btn-proceed { color: var(--vw-text) !important; }
  .vw-btn:hover { filter: brightness(1.1) !important; }
  .vw-btn:active { box-shadow: var(--neu-btn-active) !important; transform: translateY(1px) !important; }
  .vw-btn:disabled { opacity: 0.5 !important; cursor: not-allowed !important; box-shadow: var(--neu-in) !important; }
  @keyframes vw-fade-in { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
  @media (max-width: 640px) {
    .vw-status { font-size: 1.4rem !important; }
    .vw-main-content { padding: 1.5rem !important; margin: 1rem !important; max-width: 90vw !important; }
    .vw-header-bar { height: 60px !important; padding: 0 16px !important; }
    .vw-btn { padding: 0.6rem 1rem !important; font-size: 0.8rem !important; }
  }
`;

const API_UI_CSS = `
  .vw-api-card {
    position: fixed !important; top: 50% !important; left: 50% !important;
    transform: translate(-50%, -50%) !important; width: min(500px, 90vw) !important;
    background: #1e1e1e !important; border-radius: 24px !important; border: none !important;
    box-shadow: 8px 8px 16px #141414, -8px -8px 16px #282828 !important; padding: 24px !important;
    text-align: center !important; z-index: 2147483647 !important; font-family: 'Inter', system-ui, sans-serif !important;
  }
  .vw-api-card .vw-close {
    position: absolute !important; top: 16px !important; right: 16px !important; background: #1e1e1e !important;
    box-shadow: 3px 3px 6px #141414, -3px -3px 6px #282828 !important; border: none !important; color: #aaa !important;
    font-size: 18px !important; cursor: pointer !important; padding: 6px 10px !important; border-radius: 50% !important;
    transition: all 0.2s !important;
  }
  .vw-api-card .vw-close:active { box-shadow: inset 3px 3px 6px #141414, inset -3px -3px 6px #282828 !important; }
  .vw-api-icon { width: 64px !important; height: 64px !important; border-radius: 50% !important; margin-bottom: 16px !important; box-shadow: 4px 4px 8px #141414, -4px -4px 8px #282828 !important; object-fit: cover !important; }
  .vw-api-status { font-size: 28px !important; font-weight: 700 !important; margin-bottom: 8px !important; color: #e0e0e0 !important; }
  .vw-api-substatus { font-size: 14px !important; color: #a0a0a0 !important; margin-bottom: 16px !important; }
  .vw-api-url { background: #1e1e1e !important; box-shadow: inset 4px 4px 8px #141414, inset -4px -4px 8px #282828 !important; border-radius: 12px !important; padding: 12px !important; word-break: break-all !important; font-family: monospace !important; font-size: 12px !important; color: #b3b3b3 !important; margin-bottom: 20px !important; max-height: 100px !important; overflow-y: auto !important; }
  .vw-api-buttons { display: flex !important; gap: 12px !important; }
  .vw-api-btn { flex: 1 !important; background: #1e1e1e !important; box-shadow: 4px 4px 8px #141414, -4px -4px 8px #282828 !important; border: none !important; padding: 12px !important; border-radius: 40px !important; color: #e0e0e0 !important; font-weight: 600 !important; cursor: pointer !important; transition: all 0.2s !important; }
  .vw-api-btn-copy { color: #4ade80 !important; }
  .vw-api-btn:active { box-shadow: inset 4px 4px 8px #141414, inset -4px -4px 8px #282828 !important; transform: translateY(1px) !important; }
  .vw-api-topbar-inner { display: inline-flex !important; align-items: center !important; justify-content: center !important; gap: 10px !important; width: 100% !important; height: 100% !important; padding: 0 16px !important; white-space: nowrap !important; }
  .vw-api-loading-ring { width: 20px !important; height: 20px !important; flex: 0 0 auto !important; display: inline-block !important; border-radius: 50% !important; border: 3px solid #141414 !important; border-top: 3px solid #e0e0e0 !important; animation: vw-api-spin 0.8s linear infinite !important; }
  .vw-api-loading-text { color: #e0e0e0 !important; font-weight: 600 !important; line-height: 1 !important; white-space: nowrap !important; }
  @keyframes vw-api-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  @media (max-width: 640px) { .vw-api-card { padding: 20px !important; } .vw-api-status { font-size: 22px !important; } .vw-api-substatus { font-size: 12px !important; } }
`;

const cleanupManager = {
  intervals: new Set(),
  timeouts: new Set(),
  setInterval(fn, delay, ...args) {
    const id = setInterval(fn, delay, ...args);
    this.intervals.add(id);
    return id;
  },
  setTimeout(fn, delay, ...args) {
    const id = setTimeout(() => {
      this.timeouts.delete(id);
      fn(...args);
    }, delay);
    this.timeouts.add(id);
    return id;
  },
  clearAll() {
    this.intervals.forEach(id => clearInterval(id));
    this.timeouts.forEach(id => clearTimeout(id));
    this.intervals.clear();
    this.timeouts.clear();
  }
};

let isShutdown = false;

function shutdown() {
  if (isShutdown) return;
  isShutdown = true;
  cleanupManager.clearAll();
  if (window.bypassObserver) {
    window.bypassObserver.disconnect();
    window.bypassObserver = null;
  }
  if (window.primaryWebSocket) {
    window.primaryWebSocket.disconnect();
    window.primaryWebSocket = null;
  }
  if (window.fallbackWebSocket) {
    window.fallbackWebSocket.disconnect();
    window.fallbackWebSocket = null;
  }
  if (window.activeWebSocket) {
    window.activeWebSocket.disconnect();
    window.activeWebSocket = null;
  }
}

async function copyTextSilent(text) {
  try {
    if (!text) return false;
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(String(text));
      return true;
    }
  } catch (_) {}
  try {
    const ta = document.createElement('textarea');
    ta.value = String(text);
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    ta.style.top = '0';
    (document.body || document.documentElement).appendChild(ta);
    ta.focus();
    ta.select();
    const ok = document.execCommand('copy');
    ta.remove();
    return !!ok;
  } catch (_) {}
  return false;
}

function isLuarmorUrl(url) {
  try {
    const u = new URL(String(url), location.href);
    const h = (u.hostname || '').toLowerCase();
    return h === 'ads.luarmor.net' || h.endsWith('.ads.luarmor.net');
  } catch (_) {
    return String(url).includes('ads.luarmor.net');
  }
}

function escapeHtml(str) {
  return String(str).replace(/[&<>]/g, function(m) {
    if (m === '&') return '&amp;';
    if (m === '<') return '&lt;';
    if (m === '>') return '&gt;';
    return m;
  }).replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, function(c) { return c });
}

function isAutoRedirectEnabled() {
  const saved = localStorage.getItem(VW_KEYS.autoRedirect);
  return saved !== null ? saved === 'true' : true;
}

function decodeURIxor(encodedString, prefixLength = 5) {
  const base64Decoded = atob(encodedString);
  const prefix = base64Decoded.substring(0, prefixLength);
  const encodedPortion = base64Decoded.substring(prefixLength);
  const prefixLen = prefix.length;
  const decodedChars = new Array(encodedPortion.length);
  for (let i = 0; i < encodedPortion.length; i++) {
    const encodedChar = encodedPortion.charCodeAt(i);
    const prefixChar = prefix.charCodeAt(i % prefixLen);
    decodedChars[i] = String.fromCharCode(encodedChar ^ prefixChar);
  }
  return decodedChars.join('');
}

window.HOST = HOST;
window.ICON_URL = ICON_URL;
window.LOOTLINK_UI_ICON = LOOTLINK_UI_ICON;
window.LUARMOR_UI_ICON = LUARMOR_UI_ICON;
window.SUCCESS_GIF = SUCCESS_GIF;
window.ERROR_JPG = ERROR_JPG;
window.TPI_HOST = TPI_HOST;
window.ANDROID_UA = ANDROID_UA;
window.API_BASE = API_BASE;
window.TC_PROXY_URL = TC_PROXY_URL;
window.LOOT_HOSTS = LOOT_HOSTS;
window.ALLOWED_SHORT_HOSTS = ALLOWED_SHORT_HOSTS;
window.isLootHost = isLootHost;
window.isAllowedHost = isAllowedHost;
window.isTpiLi = isTpiLi;
window.CONFIG = CONFIG;
window.VW_KEYS = VW_KEYS;
window.SHARED_UI_CSS = SHARED_UI_CSS;
window.API_UI_CSS = API_UI_CSS;
window.cleanupManager = cleanupManager;
window.shutdown = shutdown;
window.copyTextSilent = copyTextSilent;
window.isLuarmorUrl = isLuarmorUrl;
window.escapeHtml = escapeHtml;
window.isAutoRedirectEnabled = isAutoRedirectEnabled;
window.decodeURIxor = decodeURIxor;
window.isShutdown = isShutdown;