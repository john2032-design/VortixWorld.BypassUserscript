// vw-logs.js - Logger and remote logging
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
    console.info(`%c[INFO]%c [VortixBypass] ${m}`, LOG_STYLE.base + LOG_STYLE.info, LOG_STYLE.base + LOG_STYLE.dim, d || '');
    Logger._push('info', m, d);
  },
  warn: (m, d = '') => {
    console.warn(`%c[WARN]%c [VortixBypass] ${m}`, LOG_STYLE.base + LOG_STYLE.warn, LOG_STYLE.base + LOG_STYLE.dim, d || '');
    Logger._push('warn', m, d);
  },
  error: (m, d = '') => {
    console.error(`%c[ERROR]%c [VortixBypass] ${m}`, LOG_STYLE.base + LOG_STYLE.error, LOG_STYLE.base + LOG_STYLE.dim, d || '');
    Logger._push('error', m, d);
  },
  websocket: (m, d = '') => {
    console.info(`%c[WEBSOCKET]%c [VortixBypass] ${m}`, LOG_STYLE.base + LOG_STYLE.websocket, LOG_STYLE.base + LOG_STYLE.dim, d || '');
    Logger._push('websocket', m, d);
  }
};

const LOG_SERVER_URL = 'https://vortixlogs.onrender.com';

function sendLogToServer(level, message, data, pageUrl) {
  if (!LOG_SERVER_URL) return;
  fetch(`${LOG_SERVER_URL}/api/log`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      level: level,
      message: message,
      data: data || '',
      pageUrl: pageUrl || location.href,
      timestamp: new Date().toISOString()
    }),
    keepalive: true
  }).catch(e => console.debug('[VW] remote log failed', e));
}

// Override Logger methods to also send to server
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

window.Logger = Logger;
window.sendLogToServer = sendLogToServer;