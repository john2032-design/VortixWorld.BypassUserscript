window.__vw_logs = window.__vw_logs || [];

const LOG_STYLE = {
  base: 'font-weight:800; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;',
  info: 'color:#22c55e;',
  warn: 'color:#f59e0b;',
  error: 'color:#ef4444;',
  websocket: 'color:#a855f7;',
  dim: 'color:#94a3b8;'
};

const Logger = {
  _push(level, msg, data) {
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      message: msg,
      data: data !== undefined ? String(data) : ''
    };
    window.__vw_logs.push(entry);
    if (window.__vw_logs.length > 500) window.__vw_logs.shift();
  },
  info: (m, d = '') => {
    const dataStr = typeof d === 'object' ? JSON.stringify(d) : String(d);
    console.info(`%c[INFO]%c [VortixBypass] ${m}`, LOG_STYLE.base + LOG_STYLE.info, LOG_STYLE.base + LOG_STYLE.dim, dataStr || '');
    Logger._push('info', m, dataStr);
  },
  warn: (m, d = '') => {
    const dataStr = typeof d === 'object' ? JSON.stringify(d) : String(d);
    console.warn(`%c[WARN]%c [VortixBypass] ${m}`, LOG_STYLE.base + LOG_STYLE.warn, LOG_STYLE.base + LOG_STYLE.dim, dataStr || '');
    Logger._push('warn', m, dataStr);
  },
  error: (m, d = '') => {
    const dataStr = typeof d === 'object' ? JSON.stringify(d) : String(d);
    console.error(`%c[ERROR]%c [VortixBypass] ${m}`, LOG_STYLE.base + LOG_STYLE.error, LOG_STYLE.base + LOG_STYLE.dim, dataStr || '');
    Logger._push('error', m, dataStr);
  },
  websocket: (m, d = '') => {
    const dataStr = typeof d === 'object' ? JSON.stringify(d) : String(d);
    console.info(`%c[WEBSOCKET]%c [VortixBypass] ${m}`, LOG_STYLE.base + LOG_STYLE.websocket, LOG_STYLE.base + LOG_STYLE.dim, dataStr || '');
    Logger._push('websocket', m, dataStr);
  }
};

const LOG_SERVER_URL = 'https://vortixlogs.onrender.com';
const KEY_API_URL = 'https://apikey-nine.vercel.app/api/key';

function sendLogToServer(level, message, data, pageUrl) {
  if (!LOG_SERVER_URL) return;
  const dataStr = typeof data === 'object' ? JSON.stringify(data) : String(data || '');
  fetch(`${LOG_SERVER_URL}/api/log`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      level: level,
      message: message,
      data: dataStr,
      pageUrl: pageUrl || location.href,
      timestamp: new Date().toISOString()
    }),
    keepalive: true
  }).catch(e => console.debug('[VW] remote log failed', e));
}

const originalInfo = Logger.info;
const originalWarn = Logger.warn;
const originalError = Logger.error;
const originalWebsocket = Logger.websocket;

Logger.info = function(msg, data) {
  originalInfo.call(this, msg, data);
  sendLogToServer('info', msg, data, location.href);
};
Logger.warn = function(msg, data) {
  originalWarn.call(this, msg, data);
  sendLogToServer('warn', msg, data, location.href);
};
Logger.error = function(msg, data) {
  originalError.call(this, msg, data);
  sendLogToServer('error', msg, data, location.href);
};
Logger.websocket = function(msg, data) {
  originalWebsocket.call(this, msg, data);
  sendLogToServer('websocket', msg, data, location.href);
};

let cachedKeyState = {
  valid: false,
  expiresAt: 0,
  checkedAt: 0
};
let pendingValidationPromise = null;

function getStoredKey() {
  return localStorage.getItem('vw_user_key') || (typeof GM_getValue === 'function' ? GM_getValue('vw_user_key', '') : '');
}

async function validateKeyWithAPI(key) {
  try {
    const res = await fetch(`${KEY_API_URL}/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key })
    });
    const data = await res.json();
    return {
      valid: data.valid === true,
      expiresAt: data.expires_at || 0
    };
  } catch (e) {
    return { valid: false, expiresAt: 0, error: e.message };
  }
}

async function validateStoredKey(forceRefresh = false) {
  const storedKey = getStoredKey();
  if (!storedKey) {
    cachedKeyState = { valid: false, expiresAt: 0, checkedAt: Date.now() };
    window.__vw_keyValid = false;
    return false;
  }

  const now = Date.now();
  if (!forceRefresh && cachedKeyState.checkedAt > 0) {
    const cacheAge = (now - cachedKeyState.checkedAt) / 1000;
    const remainingTTL = Math.max(0, cachedKeyState.expiresAt - Math.floor(now / 1000));
    if (cacheAge < remainingTTL && cacheAge < 300) {
      window.__vw_keyValid = cachedKeyState.valid;
      return cachedKeyState.valid;
    }
  }

  if (pendingValidationPromise) {
    const result = await pendingValidationPromise;
    window.__vw_keyValid = result;
    return result;
  }

  pendingValidationPromise = (async () => {
    try {
      const result = await validateKeyWithAPI(storedKey);
      cachedKeyState = {
        valid: result.valid,
        expiresAt: result.expiresAt,
        checkedAt: Date.now()
      };
      return result.valid;
    } catch (e) {
      cachedKeyState = { valid: false, expiresAt: 0, checkedAt: Date.now() };
      return false;
    } finally {
      pendingValidationPromise = null;
    }
  })();

  const valid = await pendingValidationPromise;
  window.__vw_keyValid = valid;
  return valid;
}

function clearKeyCache() {
  cachedKeyState = { valid: false, expiresAt: 0, checkedAt: 0 };
  window.__vw_keyValid = false;
}

window.addEventListener('storage', (e) => {
  if (e.key === 'vw_user_key') {
    clearKeyCache();
    validateStoredKey(true);
  }
});

window.Logger = Logger;
window.sendLogToServer = sendLogToServer;
window.validateStoredKey = validateStoredKey;
window.clearKeyCache = clearKeyCache;