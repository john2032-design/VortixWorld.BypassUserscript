const HOST = (location.hostname || '').toLowerCase().replace(/^www\./, '');
const ICON_URL = 'https://i.postimg.cc/Y2TmKMf8/2180201F-FB5D-4574-9E55-158B4442F02A.png';
const LOOTLINK_UI_ICON = 'https://i.ibb.co/s0yg2cv/AA1-D3-E03-2205-4572-ACFB-29-B8-B9-DDE381.png';
const LUARMOR_UI_ICON = 'https://i.ibb.co/BDQS9rS/F20-A6183-C85E-447-C-A27-C-11-B9-E8971-B45.png';
const SUCCESS_GIF = 'https://cdn3.emoji.gg/emojis/529330-ai-baby.gif';
const ERROR_JPG = 'https://iili.io/Blf65Is.md.jpg';
const SITE_HOST = 'vortix-world-bypass.vercel.app';
const TPI_HOST = 'tpi.li';
const ANDROID_UA = 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Mobile Safari/537.36';
const API_BASE = 'https://vortixworld-end.vercel.app';
const TC_PROXY_URL = 'https://lootlink-backend-b526.onrender.com/tc';
const INCENTIVE_SERVER_DOMAIN = 'onsultingco.com';

const LOOT_HOSTS = [
  'loot-link.com', 'loot-links.com', 'lootlink.org', 'lootlinks.co',
  'lootdest.info', 'lootdest.org', 'lootdest.com', 'links-loot.com',
  'linksloot.net', 'lootlinks.com', 'best-links.org', 'loot-labs.com',
  'lootlabs.com', 'links.lootlabs.gg'
];

const ALLOWED_SHORT_HOSTS = [
  'linkvertise.com', 'admaven.com', 'shortearn.eu',
  'beta.shortearn.eu', 'cuty.io', 'ouo.io', 'lockr.so',
  'rekonise.com', 'mboost.me', 'link-unlocker.com', 'direct-link.net',
  'direct-links.net', 'direct-links.org', 'link-center.net', 'link-hub.net',
  'link-pays.in', 'link-target.net', 'link-target.org', 'link-to.net',
  'fast-links.org', 'rapid-links.com', 'rapid-links.net', 'hydrogen.lat',
  'auth.platorelay.com', 'pandadevelopment.net', 'new.pandadevelopment.net'
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
  HEARTBEAT_INTERVAL: 0.1,
  INITIAL_RECONNECT_DELAY: 1000,
  COUNTDOWN_INTERVAL: 1000,
  FALLBACK_CHECK_DELAY: 15000
});

const VW_KEYS = {
  autoRedirect: 'vw_auto_redirect',
  lootUseLocal: 'vw_loot_use_local'
};

const WORKINK_UI_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600;700&display=swap');
  .vw-workink-card {
    position: fixed !important; top: 50% !important; left: 50% !important;
    transform: translate(-50%, -50%) !important; width: min(420px, 90vw) !important;
    background: #1e1e1e !important; border-radius: 24px !important; border: none !important;
    box-shadow: 8px 8px 16px #141414, -8px -8px 16px #282828 !important; padding: 24px !important;
    text-align: center !important; z-index: 2147483647 !important;
    font-family: 'Inter', sans-serif !important; animation: vw-fade-in 0.3s ease-out !important;
  }
  .vw-workink-card .vw-close {
    position: absolute !important; top: 16px !important; right: 16px !important; background: #1e1e1e !important;
    box-shadow: 3px 3px 6px #141414, -3px -3px 6px #282828 !important; border: none !important; color: #aaa !important;
    font-size: 18px !important; cursor: pointer !important; padding: 6px 10px !important; border-radius: 50% !important;
  }
  .vw-workink-card .vw-close:active { box-shadow: inset 3px 3px 6px #141414, inset -3px -3px 6px #282828 !important; }
  .vw-workink-icon { width: 64px !important; height: 64px !important; border-radius: 50% !important; margin-bottom: 16px !important; box-shadow: 4px 4px 8px #141414, -4px -4px 8px #282828 !important; object-fit: cover !important; }
  .vw-workink-status {
    font-family: 'Orbitron', sans-serif !important; font-size: 28px !important; font-weight: 700 !important;
    margin-bottom: 8px !important; color: #e0e0e0 !important; text-transform: uppercase; letter-spacing: 1px;
    text-shadow: 0 0 8px rgba(255,255,255,0.3);
  }
  .vw-workink-url {
    background: #1e1e1e !important; box-shadow: inset 4px 4px 8px #141414, inset -4px -4px 8px #282828 !important;
    border-radius: 12px !important; padding: 12px !important; word-break: break-all !important;
    font-family: monospace !important; font-size: 12px !important; color: #b3b3b3 !important;
    margin-bottom: 20px !important; max-height: 100px !important; overflow-y: auto !important;
  }
  .vw-workink-countdown {
    font-family: 'Orbitron', sans-serif !important; font-size: 15px; font-weight: 700; color: #4ade80;
    margin-bottom: 15px; text-transform: uppercase; letter-spacing: 1px;
  }
  .vw-workink-buttons { display: flex !important; gap: 12px !important; }
  .vw-workink-btn {
    font-family: 'Orbitron', sans-serif !important; flex: 1 !important; background: #1e1e1e !important;
    box-shadow: 4px 4px 8px #141414, -4px -4px 8px #282828 !important; border: none !important;
    padding: 12px !important; border-radius: 40px !important; color: #e0e0e0 !important;
    font-weight: 600 !important; cursor: pointer !important; transition: all 0.2s !important;
    text-transform: uppercase; letter-spacing: 1px;
  }
  .vw-workink-btn-copy { color: #4ade80 !important; }
  .vw-workink-btn:active { box-shadow: inset 4px 4px 8px #141414, inset -4px -4px 8px #282828 !important; transform: translateY(1px) !important; }
  @keyframes vw-fade-in { from { opacity:0; transform:translate(-50%,-40px); } to { opacity:1; transform:translate(-50%,-50%); } }
  @media (max-width: 640px) {
    .vw-workink-card { padding: 20px !important; }
    .vw-workink-status { font-size: 22px !important; }
  }
`;

const cleanupManager = {
  intervals: new Set(),
  timeouts: new Set(),
  setInterval(fn, delay, ...args) { const id = setInterval(fn, delay, ...args); this.intervals.add(id); return id; },
  setTimeout(fn, delay, ...args) { const id = setTimeout(() => { this.timeouts.delete(id); fn(...args); }, delay); this.timeouts.add(id); return id; },
  clearAll() { this.intervals.forEach(id => clearInterval(id)); this.timeouts.forEach(id => clearTimeout(id)); this.intervals.clear(); this.timeouts.clear(); }
};

let isShutdown = false;
function shutdown() {
  if (isShutdown) return;
  isShutdown = true;
  cleanupManager.clearAll();
  if (window.bypassObserver) { window.bypassObserver.disconnect(); window.bypassObserver = null; }
  if (window.primaryWebSocket) { window.primaryWebSocket.disconnect(); window.primaryWebSocket = null; }
  if (window.fallbackWebSocket) { window.fallbackWebSocket.disconnect(); window.fallbackWebSocket = null; }
  if (window.activeWebSocket) { window.activeWebSocket.disconnect(); window.activeWebSocket = null; }
}

async function copyTextSilent(text) {
  try {
    if (!text) return false;
    if (navigator.clipboard && window.isSecureContext) { await navigator.clipboard.writeText(String(text)); return true; }
  } catch (_) {}
  try {
    const ta = document.createElement('textarea');
    ta.value = String(text);
    ta.style.position = 'fixed'; ta.style.left = '-9999px';
    (document.body || document.documentElement).appendChild(ta);
    ta.focus(); ta.select();
    const ok = document.execCommand('copy'); ta.remove();
    return !!ok;
  } catch (_) {}
  return false;
}

function isLuarmorUrl(url) {
  try {
    const u = new URL(String(url), location.href);
    const h = (u.hostname || '').toLowerCase();
    return h === 'ads.luarmor.net' || h.endsWith('.ads.luarmor.net');
  } catch (_) { return String(url).includes('ads.luarmor.net'); }
}

function escapeHtml(str) {
  return String(str).replace(/[&<>]/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;'})[m])
    .replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, c => c);
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
window.INCENTIVE_SERVER_DOMAIN = INCENTIVE_SERVER_DOMAIN;
window.LOOT_HOSTS = LOOT_HOSTS;
window.ALLOWED_SHORT_HOSTS = ALLOWED_SHORT_HOSTS;
window.isLootHost = isLootHost;
window.isAllowedHost = isAllowedHost;
window.isTpiLi = isTpiLi;
window.CONFIG = CONFIG;
window.VW_KEYS = VW_KEYS;
window.WORKINK_UI_CSS = WORKINK_UI_CSS;
window.LOOTLINK_CARD_CSS = LOOTLINK_CARD_CSS;
window.API_UI_CSS = API_UI_CSS;
window.TPI_UI_CSS = TPI_UI_CSS;
window.cleanupManager = cleanupManager;
window.shutdown = shutdown;
window.copyTextSilent = copyTextSilent;
window.isLuarmorUrl = isLuarmorUrl;
window.escapeHtml = escapeHtml;
window.isAutoRedirectEnabled = () => {
  const v = localStorage.getItem(VW_KEYS.autoRedirect);
  return v === null ? true : v === 'true';
};
window.decodeURIxor = decodeURIxor;
window.isShutdown = isShutdown;