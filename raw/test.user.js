  // ==UserScript==
  // @name         VortixWorld Lootlinks Bypass
  // @namespace    afklolbypasser
  // @version      9.0
  // @description  Bypass lootlinks with enhanced security and beautiful UI
  // @author       afk.l0l
  // @match        *://loot-link.com/s?*
  // @match        *://loot-links.com/s?*
  // @match        *://lootlink.org/s?*
  // @match        *://lootlinks.co/s?*
  // @match        *://lootdest.info/s?*
  // @match        *://lootdest.org/s?*
  // @match        *://lootdest.com/s?*
  // @match        *://links-loot.com/s?*
  // @match        *://linksloot.net/s?*
  // @connect      loot-link.com
  // @connect      loot-links.com
  // @connect      lootlink.org
  // @connect      lootlinks.co
  // @connect      lootdest.info
  // @connect      lootdest.org
  // @connect      lootdest.com
  // @connect      links-loot.com
  // @connect      linksloot.net
  // @icon         https://i.ibb.co/cKy9ztXL/IMG-3412.png
  // @grant        none
  // @license      MIT
  // @run-at       document-start
  // ==/UserScript==

  (function () {
  'use strict';

  if (window.__VORTIX_BYPASS_INSTALLED) return;
  window.__VORTIX_BYPASS_INSTALLED = true;

  const ALLOWED_HOSTS = Object.freeze([
      'loot-link.com',
      'loot-links.com',
      'lootlink.org',
      'lootlinks.co',
      'lootdest.info',
      'lootdest.org',
      'lootdest.com',
      'links-loot.com',
      'linksloot.net'
  ]);

  const UNLOCK_TEXTS = Object.freeze(['UNLOCK CONTENT', 'Unlock Content']);

  const TASK_IMAGES = Object.freeze({
      eye: 'eye.png',
      bell: 'bell.png',
      apps: 'apps.png',
      fire: 'fire.png',
      gamers: 'gamers.png'
  });

  const CONFIG = Object.freeze({
      WS_TIMEOUT: 90000,
      HEARTBEAT_INTERVAL: 1000,
      MAX_RECONNECT_DELAY: 30000,
      INITIAL_RECONNECT_DELAY: 1000,
      FETCH_TIMEOUT: 30000,
      COUNTDOWN_INTERVAL: 1000,
      MAX_DECODE_RETRIES: 3,
      MAX_FETCH_RETRIES: 3,
      PROGRESS_RING_RADIUS: 90,
      XOR_PREFIX_LENGTH: 5,
      DEFAULT_COUNTDOWN: 60,
      MIN_CONNECT_INTERVAL: 1000,
      OBSERVER_DEBOUNCE_DELAY: 50,
      VERSION: '9.0'
  });

  const DEBUG = true;

  const Logger = {
      _log(level, color, message, data) {
          if (!DEBUG && level !== 'error') return;
          const timestamp = new Date().toISOString().split('T')[1].slice(0, -1);
          const prefix = `%c[Vortix ${timestamp}]`;
          const style = `color:${color};font-weight:700`;
          if (data !== undefined && data !== '') {
              console[level](prefix, style, message, data);
          } else {
              console[level](prefix, style, message);
          }
      },
      info(message, data) { this._log('info', '#22d3ee', message, data); },
      warn(message, data) { this._log('warn', '#fbbf24', message, data); },
      error(message, data) { this._log('error', '#f87171', message, data); },
      success(message, data) { this._log('info', '#4ade80', message, data); }
  };

  Logger.info(`VortixWorld Bypass v${CONFIG.VERSION} initialized`);

  const pageURL = new URL(window.location.href);
  const hostname = pageURL.hostname || '';
  const isLootHost = ALLOWED_HOSTS.includes(hostname);

  Logger.info('Host validation', { hostname, allowed: isLootHost });

  if (!isLootHost) {
      Logger.warn('Exiting - hostname not in allowed list');
      return;
  }

  let originalFetch = null;
  const DOMCache = new Map();

  const perf = {
      marks: new Map(),
      mark(name) { this.marks.set(name, performance.now()); },
      measure(start, end) {
          const startTime = this.marks.get(start);
          const endTime = this.marks.get(end);
          if (startTime === undefined || endTime === undefined) return 0;
          return endTime - startTime;
      }
  };

  const state = {
      uiInjected: false,
      bypassSuccessful: false,
      decodedUrl: null,
      processStartTime: Date.now(),
      isShutdown: false
  };

  function escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
  }

  function isValidUrl(url) {
      try {
          const parsed = new URL(url);
          return ['http:', 'https:'].includes(parsed.protocol);
      } catch {
          return false;
      }
  }

  function validateUrid(urid) {
      return typeof urid === 'string' && /^[a-zA-Z0-9_-]+$/.test(urid);
  }

  function getCachedElement(selector, context = document) {
      const key = context === document ? selector : `${selector}@${context.id || 'ctx'}`;
      const cached = DOMCache.get(key);
      if (cached && document.contains(cached)) {
          return cached;
      }
      const element = context.querySelector(selector);
      if (element) {
          DOMCache.set(key, element);
      } else {
          DOMCache.delete(key);
      }
      return element;
  }

  function clearDOMCache() {
      DOMCache.clear();
  }

  function debounce(fn, delay) {
      let timeoutId = null;
      return function(...args) {
          if (timeoutId) clearTimeout(timeoutId);
          timeoutId = setTimeout(() => {
              timeoutId = null;
              fn.apply(this, args);
          }, delay);
      };
  }

  const cleanupManager = {
      intervals: new Set(),
      timeouts: new Set(),
      listeners: new Map(),

      setInterval(fn, delay, ...args) {
          const id = setInterval(fn, delay, ...args);
          this.intervals.add(id);
          return id;
      },

      clearInterval(id) {
          clearInterval(id);
          this.intervals.delete(id);
      },

      setTimeout(fn, delay, ...args) {
          const id = setTimeout(() => {
              this.timeouts.delete(id);
              fn(...args);
          }, delay);
          this.timeouts.add(id);
          return id;
      },

      clearTimeout(id) {
          clearTimeout(id);
          this.timeouts.delete(id);
      },

      addEventListener(target, event, handler, options) {
          target.addEventListener(event, handler, options);
          if (!this.listeners.has(target)) {
              this.listeners.set(target, []);
          }
          this.listeners.get(target).push({ event, handler, options });
      },

      clearAll() {
          this.intervals.forEach(id => clearInterval(id));
          this.timeouts.forEach(id => clearTimeout(id));
          this.intervals.clear();
          this.timeouts.clear();

          this.listeners.forEach((handlers, target) => {
              handlers.forEach(({ event, handler, options }) => {
                  try {
                      target.removeEventListener(event, handler, options);
                  } catch (e) {}
              });
          });
          this.listeners.clear();

          clearDOMCache();
          Logger.info('Cleanup complete - all resources released');
      }
  };

  function shutdown() {
      if (state.isShutdown) return;
      state.isShutdown = true;

      cleanupManager.clearAll();

      if (window.bypassObserver) {
          window.bypassObserver.disconnect();
          window.bypassObserver = null;
      }

      if (window.activeWebSocket) {
          window.activeWebSocket.disconnect();
          window.activeWebSocket = null;
      }

      if (originalFetch) {
          window.fetch = originalFetch;
      }

      Logger.success('Shutdown complete');
  }

  class RobustWebSocket {
      constructor(url, options = {}) {
          this.url = url;
          this.reconnectDelay = options.initialDelay || CONFIG.INITIAL_RECONNECT_DELAY;
          this.maxDelay = options.maxDelay || CONFIG.MAX_RECONNECT_DELAY;
          this.heartbeatInterval = options.heartbeat || CONFIG.HEARTBEAT_INTERVAL;
          this.maxRetries = options.maxRetries || 5;
          this.ws = null;
          this.reconnectTimeout = null;
          this.heartbeatTimer = null;
          this.retryCount = 0;
          this.intentionallyClosed = false;
          this.lastConnectAttempt = 0;
      }

      connect() {
          if (state.isShutdown || this.intentionallyClosed) return;

          const now = Date.now();
          if (now - this.lastConnectAttempt < CONFIG.MIN_CONNECT_INTERVAL) {
              Logger.warn('WebSocket connection rate limited');
              return;
          }
          this.lastConnectAttempt = now;

          try {
              this.ws = new WebSocket(this.url);
              this.ws.onopen = () => this.onOpen();
              this.ws.onmessage = (e) => this.onMessage(e);
              this.ws.onclose = () => this.handleReconnect();
              this.ws.onerror = (e) => this.onError(e);
          } catch (e) {
              Logger.error('WebSocket connection failed', e);
              this.handleReconnect();
          }
      }

      onOpen() {
          if (state.isShutdown) return;

          Logger.success('WebSocket connected', this.url);
          this.retryCount = 0;
          this.reconnectDelay = CONFIG.INITIAL_RECONNECT_DELAY;

          if (this.reconnectTimeout) {
              cleanupManager.clearTimeout(this.reconnectTimeout);
              this.reconnectTimeout = null;
          }

          this.sendHeartbeat();
          this.heartbeatTimer = cleanupManager.setInterval(() => {
              if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                  this.sendHeartbeat();
              } else {
                  cleanupManager.clearInterval(this.heartbeatTimer);
              }
          }, this.heartbeatInterval);
      }

      sendHeartbeat() {
          if (this.ws && this.ws.readyState === WebSocket.OPEN) {
              this.ws.send('0');
          }
      }

      handleReconnect() {
          if (state.isShutdown || this.intentionallyClosed) return;

          if (this.heartbeatTimer) {
              cleanupManager.clearInterval(this.heartbeatTimer);
              this.heartbeatTimer = null;
          }

          if (this.retryCount >= this.maxRetries) {
              Logger.error('WebSocket max retries exceeded');
              return;
          }

          this.retryCount++;
          const delay = Math.min(
              this.reconnectDelay * Math.pow(2, this.retryCount - 1),
              this.maxDelay
          );

          Logger.warn(`WebSocket reconnecting in ${delay}ms`, `Attempt ${this.retryCount}/${this.maxRetries}`);

          this.reconnectTimeout = cleanupManager.setTimeout(() => {
              this.connect();
          }, delay);
      }

      onMessage(event) {
          if (state.isShutdown) return;

          Logger.info('WebSocket message received', event.data?.length + ' bytes');

          if (event.data && event.data.includes('r:')) {
              const PUBLISHER_LINK = event.data.replace('r:', '');

              if (PUBLISHER_LINK) {
                  perf.mark('decodeStart');

                  const result = decodeURIxor(PUBLISHER_LINK);

                  if (!result) {
                      Logger.error('Decode failed - null result');
                      return;
                  }

                  let finalUrl = result;

                  try {
                      finalUrl = decodeURIComponent(result);
                  } catch (e) {
                      Logger.warn('URI decode failed, using raw result');
                  }

                  if (!isValidUrl(finalUrl)) {
                      Logger.error('Invalid URL detected', finalUrl);
                      return;
                  }

                  if (/^https?:\/\/ads\.luarmor\.net\//i.test(finalUrl)) {
                      finalUrl = `https://vortixworld-luarmor.vercel.app/redirect?to=${encodeURIComponent(finalUrl)}`;
                      this.disconnect();
                      Logger.info('Redirecting to modified URL');
                      window.location.href = finalUrl;
                      return;
                  }

                  perf.mark('decodeEnd');
                  Logger.success('Decode completed', `${perf.measure('decodeStart', 'decodeEnd').toFixed(2)}ms`);

                  this.disconnect();

                  const duration = ((Date.now() - state.processStartTime) / 1000).toFixed(2);
                  state.decodedUrl = finalUrl;

                  renderSuccessUI(finalUrl, duration);
              }
          }
      }

      onError(error) {
          Logger.error('WebSocket error', error);
      }

      disconnect() {
          this.intentionallyClosed = true;

          if (this.heartbeatTimer) {
              cleanupManager.clearInterval(this.heartbeatTimer);
              this.heartbeatTimer = null;
          }

          if (this.reconnectTimeout) {
              cleanupManager.clearTimeout(this.reconnectTimeout);
              this.reconnectTimeout = null;
          }

          if (this.ws) {
              this.ws.close();
              this.ws = null;
          }

          Logger.info('WebSocket disconnected');
      }
  }

  function decodeURIxor(encodedString, prefixLength = CONFIG.XOR_PREFIX_LENGTH) {
      try {
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
      } catch (e) {
          Logger.error('XOR decode failed', e);
          return null;
      }
  }

  const modernCSS = `
  :root {
      --bg-primary: #0a0a0f;
      --bg-secondary: #12121a;
      --bg-card: linear-gradient(145deg, #16161f 0%, #1a1a25 50%, #12121a 100%);
      --accent-primary: #6366f1;
      --accent-secondary: #8b5cf6;
      --accent-tertiary: #a855f7;
      --accent-glow: rgba(99, 102, 241, 0.4);
      --success: #10b981;
      --success-glow: rgba(16, 185, 129, 0.4);
      --text-primary: #f8fafc;
      --text-secondary: #94a3b8;
      --text-muted: #64748b;
      --border-subtle: rgba(99, 102, 241, 0.2);
      --border-glow: rgba(139, 92, 246, 0.5);
  }

  * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
  }

  @keyframes float {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      50% { transform: translateY(-20px) rotate(5deg); }
  }

  @keyframes pulse-ring {
      0% { transform: scale(1); opacity: 1; }
      100% { transform: scale(1.5); opacity: 0; }
  }

  @keyframes gradient-shift {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
  }

  @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
  }

  @keyframes fade-in-up {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
  }

  @keyframes success-bounce {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
  }

  @keyframes particle-float {
      0%, 100% { transform: translateY(0) translateX(0) rotate(0deg); opacity: 0.6; }
      25% { transform: translateY(-30px) translateX(10px) rotate(90deg); opacity: 1; }
      50% { transform: translateY(-50px) translateX(-10px) rotate(180deg); opacity: 0.8; }
      75% { transform: translateY(-30px) translateX(15px) rotate(270deg); opacity: 1; }
  }

  #vortix-bypass-overlay {
      position: fixed;
      inset: 0;
      background: var(--bg-primary);
      z-index: 2147483645;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
      padding: 20px;
      overflow: hidden;
  }

  #vortix-bypass-overlay::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(ellipse at center, rgba(99, 102, 241, 0.08) 0%, transparent 50%),
                  radial-gradient(ellipse at 80% 20%, rgba(139, 92, 246, 0.06) 0%, transparent 40%),
                  radial-gradient(ellipse at 20% 80%, rgba(168, 85, 247, 0.06) 0%, transparent 40%);
      animation: gradient-shift 15s ease infinite;
      background-size: 200% 200%;
      pointer-events: none;
  }

  .vortix-particles {
      position: absolute;
      inset: 0;
      overflow: hidden;
      pointer-events: none;
  }

  .vortix-particle {
      position: absolute;
      width: 6px;
      height: 6px;
      background: var(--accent-primary);
      border-radius: 50%;
      animation: particle-float 8s ease-in-out infinite;
  }

  .vortix-particle:nth-child(1) { left: 10%; top: 20%; animation-delay: 0s; background: var(--accent-primary); }
  .vortix-particle:nth-child(2) { left: 20%; top: 60%; animation-delay: 1s; background: var(--accent-secondary); }
  .vortix-particle:nth-child(3) { left: 70%; top: 30%; animation-delay: 2s; background: var(--accent-tertiary); }
  .vortix-particle:nth-child(4) { left: 80%; top: 70%; animation-delay: 3s; background: var(--accent-primary); }
  .vortix-particle:nth-child(5) { left: 50%; top: 10%; animation-delay: 4s; background: var(--accent-secondary); }
  .vortix-particle:nth-child(6) { left: 30%; top: 80%; animation-delay: 5s; background: var(--accent-tertiary); }

  .vortix-container {
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: 32px;
      padding: 48px 40px;
      max-width: 480px;
      width: 100%;
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 32px;
      animation: fade-in-up 0.6s ease-out;
      box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.05),
                  0 25px 50px -12px rgba(0, 0, 0, 0.5),
                  0 0 100px -20px var(--accent-glow);
  }

  .vortix-container::before {
      content: '';
      position: absolute;
      inset: -1px;
      border-radius: 32px;
      padding: 1px;
      background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary), var(--accent-tertiary), var(--accent-primary));
      background-size: 300% 300%;
      animation: gradient-shift 8s ease infinite;
      -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      -webkit-mask-composite: xor;
      mask-composite: exclude;
      pointer-events: none;
      opacity: 0.6;
  }

  .vortix-logo-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 20px;
  }

  .vortix-logo-wrapper {
      position: relative;
      width: 120px;
      height: 120px;
  }

  .vortix-logo-ring {
      position: absolute;
      inset: 0;
      border-radius: 50%;
      border: 2px solid transparent;
      border-top-color: var(--accent-primary);
      border-right-color: var(--accent-secondary);
      animation: spin 3s linear infinite;
  }

  .vortix-logo-ring:nth-child(2) {
      inset: 8px;
      animation-direction: reverse;
      animation-duration: 4s;
      border-top-color: var(--accent-secondary);
      border-right-color: var(--accent-tertiary);
  }

  .vortix-logo-ring:nth-child(3) {
      inset: 16px;
      animation-duration: 5s;
      border-top-color: var(--accent-tertiary);
      border-right-color: var(--accent-primary);
  }

  @keyframes spin {
      to { transform: rotate(360deg); }
  }

  .vortix-logo-icon {
      position: absolute;
      inset: 24px;
      background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 40px var(--accent-glow),
                  inset 0 0 20px rgba(255, 255, 255, 0.1);
  }

  .vortix-logo-icon img {
      width: 40px;
      height: 40px;
      filter: brightness(1.2) drop-shadow(0 0 10px rgba(255, 255, 255, 0.5));
  }

  .vortix-logo-text {
      font-size: 28px;
      font-weight: 800;
      letter-spacing: -0.5px;
      background: linear-gradient(135deg, var(--text-primary) 0%, var(--accent-secondary) 50%, var(--accent-tertiary) 100%);
      background-size: 200% auto;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      animation: shimmer 3s linear infinite;
  }

  .vortix-status {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
  }

  .vortix-status-text {
      font-size: 18px;
      font-weight: 600;
      color: var(--text-primary);
  }

  .vortix-status-sub {
      font-size: 14px;
      color: var(--text-secondary);
  }

  .vortix-loading-dots {
      display: inline-flex;
      gap: 4px;
      margin-left: 8px;
  }

  .vortix-loading-dots span {
      width: 6px;
      height: 6px;
      background: var(--accent-primary);
      border-radius: 50%;
      animation: dot-bounce 1.4s ease-in-out infinite;
  }

  .vortix-loading-dots span:nth-child(1) { animation-delay: 0s; }
  .vortix-loading-dots span:nth-child(2) { animation-delay: 0.2s; }
  .vortix-loading-dots span:nth-child(3) { animation-delay: 0.4s; }

  @keyframes dot-bounce {
      0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
      40% { transform: scale(1.2); opacity: 1; }
  }

  .vortix-task-card {
      width: 100%;
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%);
      border: 1px solid var(--border-subtle);
      border-radius: 20px;
      padding: 20px 24px;
      display: flex;
      align-items: center;
      gap: 20px;
  }

  .vortix-task-icon {
      width: 56px;
      height: 56px;
      background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28px;
      box-shadow: 0 8px 24px -8px var(--accent-glow);
  }

  .vortix-task-info {
      flex: 1;
  }

  .vortix-task-info h4 {
      font-size: 16px;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 4px;
  }

  .vortix-task-info p {
      font-size: 13px;
      color: var(--text-secondary);
  }

  .vortix-progress-container {
      position: relative;
      width: 200px;
      height: 200px;
  }

  .vortix-progress-ring {
      width: 100%;
      height: 100%;
      transform: rotate(-90deg);
      filter: drop-shadow(0 0 20px var(--accent-glow));
  }

  .vortix-progress-bg {
      fill: none;
      stroke: rgba(99, 102, 241, 0.1);
      stroke-width: 12;
  }

  .vortix-progress-bar {
      fill: none;
      stroke: url(#vortix-gradient);
      stroke-width: 12;
      stroke-linecap: round;
      transition: stroke-dashoffset 0.5s ease;
  }

  .vortix-progress-center {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      text-align: center;
  }

  .vortix-countdown {
      font-size: 52px;
      font-weight: 800;
      color: var(--text-primary);
      line-height: 1;
      text-shadow: 0 0 30px var(--accent-glow);
  }

  .vortix-countdown-label {
      font-size: 12px;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 3px;
      margin-top: 8px;
  }

  .vortix-footer {
      font-size: 13px;
      color: var(--text-muted);
      text-align: center;
  }

  .vortix-result {
      display: none;
      flex-direction: column;
      gap: 20px;
      width: 100%;
      animation: fade-in-up 0.5s ease-out;
  }

  .vortix-result.visible {
      display: flex;
  }

  .vortix-success-badge {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      padding: 16px 24px;
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.05) 100%);
      border: 1px solid rgba(16, 185, 129, 0.3);
      border-radius: 16px;
      animation: success-bounce 2s ease-in-out infinite;
  }

  .vortix-success-icon {
      width: 32px;
      height: 32px;
      background: var(--success);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 20px var(--success-glow);
  }

  .vortix-success-icon svg {
      width: 18px;
      height: 18px;
      color: white;
  }

  .vortix-success-text {
      font-size: 16px;
      font-weight: 700;
      color: var(--success);
  }

  .vortix-time-badge {
      font-size: 14px;
      color: var(--text-secondary);
      text-align: center;
  }

  .vortix-time-badge span {
      color: var(--accent-secondary);
      font-weight: 700;
  }

  .vortix-url-box {
      background: var(--bg-secondary);
      border: 1px solid var(--border-subtle);
      border-radius: 16px;
      padding: 16px 20px;
      max-height: 120px;
      overflow-y: auto;
  }

  .vortix-url-box::-webkit-scrollbar {
      width: 6px;
  }

  .vortix-url-box::-webkit-scrollbar-track {
      background: transparent;
  }

  .vortix-url-box::-webkit-scrollbar-thumb {
      background: var(--accent-primary);
      border-radius: 3px;
  }

  .vortix-url-text {
      font-family: 'JetBrains Mono', 'Fira Code', monospace;
      font-size: 13px;
      color: var(--text-secondary);
      word-break: break-all;
      line-height: 1.6;
  }

  .vortix-actions {
      display: flex;
      gap: 12px;
      width: 100%;
  }

  .vortix-btn {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      padding: 16px 24px;
      border: none;
      border-radius: 14px;
      font-size: 15px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.3s ease;
  }

  .vortix-btn-primary {
      background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
      color: white;
      box-shadow: 0 8px 24px -8px var(--accent-glow);
  }

  .vortix-btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 32px -8px var(--accent-glow);
  }

  .vortix-btn-primary:active {
      transform: translateY(0);
  }

  .vortix-btn-secondary {
      background: rgba(99, 102, 241, 0.1);
      color: var(--accent-primary);
      border: 1px solid var(--border-subtle);
  }

  .vortix-btn-secondary:hover {
      background: rgba(99, 102, 241, 0.2);
      border-color: var(--accent-primary);
  }

  .vortix-btn svg {
      width: 18px;
      height: 18px;
  }

  .hidden {
      display: none !important;
  }

  @media (max-width: 520px) {
      #vortix-bypass-overlay {
          padding: 12px;
      }

      .vortix-container {
          padding: 32px 24px;
          gap: 24px;
          border-radius: 24px;
      }

      .vortix-logo-wrapper {
          width: 100px;
          height: 100px;
      }

      .vortix-logo-icon {
          inset: 20px;
      }

      .vortix-logo-icon img {
          width: 32px;
          height: 32px;
      }

      .vortix-logo-text {
          font-size: 24px;
      }

      .vortix-status-text {
          font-size: 16px;
      }

      .vortix-task-card {
          padding: 16px 20px;
          gap: 16px;
      }

      .vortix-task-icon {
          width: 48px;
          height: 48px;
          font-size: 24px;
      }

      .vortix-progress-container {
          width: 160px;
          height: 160px;
      }

      .vortix-countdown {
          font-size: 42px;
      }

      .vortix-actions {
          flex-direction: column;
      }

      .vortix-btn {
          padding: 14px 20px;
      }
  }
  `;

  const BYPASS_HTML_TEMPLATE = `
  <div id="vortix-bypass-overlay">
      <div class="vortix-particles">
          <div class="vortix-particle"></div>
          <div class="vortix-particle"></div>
          <div class="vortix-particle"></div>
          <div class="vortix-particle"></div>
          <div class="vortix-particle"></div>
          <div class="vortix-particle"></div>
      </div>
      <div class="vortix-container">
          <div class="vortix-logo-section">
              <div class="vortix-logo-wrapper">
                  <div class="vortix-logo-ring"></div>
                  <div class="vortix-logo-ring"></div>
                  <div class="vortix-logo-ring"></div>
                  <div class="vortix-logo-icon">
                      <img src="https://i.ibb.co/cKy9ztXL/IMG-3412.png" alt="Vortix">
                  </div>
              </div>
              <div class="vortix-logo-text">Vortix Bypass</div>
          </div>

          <div class="vortix-status">
              <div class="vortix-status-text">
                  Processing your request
                  <span class="vortix-loading-dots">
                      <span></span>
                      <span></span>
                      <span></span>
                  </span>
              </div>
              <div class="vortix-status-sub">Please wait while we decode your link</div>
          </div>

          <div class="vortix-task-card">
              <div class="vortix-task-icon">ð</div>
              <div class="vortix-task-info">
                  <h4>Processing</h4>
                  <p>Estimated time: 60 seconds</p>
              </div>
          </div>

          <div class="vortix-progress-container">
              <svg class="vortix-progress-ring" viewBox="0 0 200 200">
                  <defs>
                      <linearGradient id="vortix-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stop-color="#6366f1"/>
                          <stop offset="50%" stop-color="#8b5cf6"/>
                          <stop offset="100%" stop-color="#a855f7"/>
                      </linearGradient>
                  </defs>
                  <circle class="vortix-progress-bg" cx="100" cy="100" r="90"/>
                  <circle class="vortix-progress-bar" id="vortix-progress-circle" cx="100" cy="100" r="90"/>
              </svg>
              <div class="vortix-progress-center">
                  <div class="vortix-countdown" id="vortix-countdown">60</div>
                  <div class="vortix-countdown-label">seconds</div>
              </div>
          </div>

          <div class="vortix-result" id="vortix-result">
              <div class="vortix-success-badge">
                  <div class="vortix-success-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                          <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                  </div>
                  <span class="vortix-success-text">Link Decoded Successfully!</span>
              </div>
              <div class="vortix-time-badge">Completed in <span id="vortix-time">0.00</span> seconds</div>
              <div class="vortix-url-box">
                  <div class="vortix-url-text" id="vortix-url"></div>
              </div>
              <div class="vortix-actions">
                  <button class="vortix-btn vortix-btn-primary" id="vortix-copy-btn">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                      </svg>
                      Copy Link
                  </button>
                  <button class="vortix-btn vortix-btn-secondary" id="vortix-open-btn">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                          <polyline points="15 3 21 3 21 9"></polyline>
                          <line x1="10" y1="14" x2="21" y2="3"></line>
                      </svg>
                      Open
                  </button>
              </div>
          </div>

          <div class="vortix-footer">
              Powered by Vortix v${CONFIG.VERSION}
          </div>
      </div>
  </div>
  `;

  function injectStyles() {
      if (document.getElementById('vortix-styles')) return;

      try {
          const styleEl = document.createElement('style');
          styleEl.id = 'vortix-styles';
          styleEl.textContent = modernCSS;

          if (document.head) {
              document.head.appendChild(styleEl);
          } else {
              document.addEventListener('DOMContentLoaded', () => {
                  document.head.appendChild(styleEl);
              });
          }

          Logger.success('Styles injected');
      } catch (e) {
          Logger.error('Style injection failed', e);
      }
  }

  function copyToClipboard(text) {
      if (navigator.clipboard && window.isSecureContext) {
          navigator.clipboard.writeText(text).then(() => {
              Logger.success('Copied to clipboard');
              showCopyFeedback();
          }).catch(() => fallbackCopy(text));
      } else {
          fallbackCopy(text);
      }
  }

  function fallbackCopy(text) {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      try {
          const success = document.execCommand('copy');
          if (success) {
              Logger.success('Copied via fallback');
              showCopyFeedback();
          }
      } catch (e) {
          Logger.error('Copy failed', e);
      }

      document.body.removeChild(textArea);
  }

  function showCopyFeedback() {
      const btn = document.getElementById('vortix-copy-btn');
      if (!btn) return;

      const originalText = btn.innerHTML;
      btn.innerHTML = `
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          Copied!
      `;
      btn.style.background = 'linear-gradient(135deg, #10b981, #059669)';

      cleanupManager.setTimeout(() => {
          btn.innerHTML = originalText;
          btn.style.background = '';
      }, 2000);
  }

  function renderSuccessUI(url, time) {
      Logger.success('Bypass completed', { time: time + 's' });

      const overlay = document.getElementById('vortix-bypass-overlay');
      if (!overlay) return;

      const statusText = overlay.querySelector('.vortix-status-text');
      if (statusText) statusText.classList.add('hidden');

      const statusSub = overlay.querySelector('.vortix-status-sub');
      if (statusSub) statusSub.classList.add('hidden');

      const taskCard = overlay.querySelector('.vortix-task-card');
      if (taskCard) taskCard.classList.add('hidden');

      const progressContainer = overlay.querySelector('.vortix-progress-container');
      if (progressContainer) progressContainer.classList.add('hidden');

      const logoRings = overlay.querySelectorAll('.vortix-logo-ring');
      logoRings.forEach(ring => ring.style.animation = 'none');

      const resultContainer = document.getElementById('vortix-result');
      if (resultContainer) {
          resultContainer.classList.add('visible');

          const timeEl = document.getElementById('vortix-time');
          if (timeEl) timeEl.textContent = time;

          const urlEl = document.getElementById('vortix-url');
          if (urlEl) urlEl.textContent = url;

          const copyBtn = document.getElementById('vortix-copy-btn');
          if (copyBtn) {
              copyBtn.onclick = () => copyToClipboard(url);
          }

          const openBtn = document.getElementById('vortix-open-btn');
          if (openBtn) {
              openBtn.onclick = () => {
                  if (isValidUrl(url)) {
                      window.open(url, '_blank', 'noopener,noreferrer');
                  }
              };
          }
      }

      state.decodedUrl = url;
      state.bypassSuccessful = true;

      if (window.vortixCountdownTimer) {
          cleanupManager.clearInterval(window.vortixCountdownTimer);
          window.vortixCountdownTimer = null;
      }

      shutdown();
  }

  function detectTaskInfo() {
      let countdownSeconds = CONFIG.DEFAULT_COUNTDOWN;
      let taskName = 'Processing';
      let taskIcon = 'ð';

      try {
          const images = document.querySelectorAll('img');

          for (const img of images) {
              const src = (img.src || '').toLowerCase();

              if (src.includes(TASK_IMAGES.eye)) {
                  countdownSeconds = 13;
                  taskName = 'View Content';
                  taskIcon = 'ðï¸';
                  break;
              } else if (src.includes(TASK_IMAGES.bell)) {
                  countdownSeconds = 30;
                  taskName = 'Notification';
                  taskIcon = 'ð';
                  break;
              } else if (src.includes(TASK_IMAGES.apps) || src.includes(TASK_IMAGES.fire)) {
                  countdownSeconds = 60;
                  taskName = 'App Task';
                  taskIcon = 'ð±';
                  break;
              } else if (src.includes(TASK_IMAGES.gamers)) {
                  countdownSeconds = 90;
                  taskName = 'Gaming Offer';
                  taskIcon = 'ð®';
                  break;
              }
          }
      } catch (e) {
          Logger.warn('Task detection failed', e);
      }

      return { countdownSeconds, taskName, taskIcon };
  }

  function modifyParentElement(targetElement) {
      const parentElement = targetElement.parentElement;
      if (!parentElement) return;

      Logger.info('Injecting bypass UI');

      const { countdownSeconds, taskName, taskIcon } = detectTaskInfo();
      state.processStartTime = Date.now();

      parentElement.innerHTML = '';
      parentElement.insertAdjacentHTML('afterbegin', BYPASS_HTML_TEMPLATE);

      const taskIconEl = document.querySelector('.vortix-task-icon');
      if (taskIconEl) taskIconEl.textContent = taskIcon;

      const taskNameEl = document.querySelector('.vortix-task-info h4');
      if (taskNameEl) taskNameEl.textContent = taskName;

      const taskTimeEl = document.querySelector('.vortix-task-info p');
      if (taskTimeEl) taskTimeEl.textContent = `Estimated time: ${countdownSeconds} seconds`;

      const progressCircle = document.getElementById('vortix-progress-circle');
      const countdownDisplay = document.getElementById('vortix-countdown');

      const radius = CONFIG.PROGRESS_RING_RADIUS;
      const circumference = 2 * Math.PI * radius;

      if (progressCircle) {
          progressCircle.style.strokeDasharray = circumference.toString();
          progressCircle.style.strokeDashoffset = circumference.toString();
      }

      let remaining = countdownSeconds;

      if (countdownDisplay) {
          countdownDisplay.textContent = remaining.toString();
      }

      const timer = cleanupManager.setInterval(() => {
          remaining--;

          if (countdownDisplay) {
              countdownDisplay.textContent = Math.max(0, remaining).toString();
          }

          if (progressCircle) {
              const progress = (countdownSeconds - remaining) / countdownSeconds;
              const offset = circumference - (progress * circumference);
              progressCircle.style.strokeDashoffset = offset.toString();
          }

          if (remaining <= 0) {
              cleanupManager.clearInterval(timer);
          }
      }, CONFIG.COUNTDOWN_INTERVAL);

      window.vortixCountdownTimer = timer;
      state.uiInjected = true;
  }

  function setupObserver() {
      try {
          const targetContainer = document.querySelector('.content-wrapper') || document.body;

          const handleMutations = debounce((mutationsList, observerRef) => {
              if (state.isShutdown) {
                  observerRef.disconnect();
                  return;
              }

              for (const mutation of mutationsList) {
                  if (mutation.type !== 'childList' || !mutation.addedNodes.length) continue;

                  const addedElements = Array.from(mutation.addedNodes).filter(n => n.nodeType === 1);

                  for (const element of addedElements) {
                      const text = element.textContent || '';

                      if (UNLOCK_TEXTS.some(t => text.includes(t))) {
                          handleUnlockElement(element, observerRef);
                          return;
                      }

                      const nested = element.querySelector('*');
                      if (nested) {
                          const allElements = element.querySelectorAll('*');
                          for (const el of allElements) {
                              const elText = el.textContent || '';
                              if (UNLOCK_TEXTS.some(t => elText.includes(t))) {
                                  handleUnlockElement(el, observerRef);
                                  return;
                              }
                          }
                      }
                  }
              }
          }, CONFIG.OBSERVER_DEBOUNCE_DELAY);

          const observer = new MutationObserver(handleMutations);
          window.bypassObserver = observer;

          observer.observe(targetContainer, {
              childList: true,
              subtree: true,
              attributes: false,
              characterData: false
          });

          Logger.info('MutationObserver started');

          const buttons = document.querySelectorAll('button, [role="button"], .btn, [class*="unlock"]');
          for (const el of buttons) {
              const text = el.textContent || '';
              if (UNLOCK_TEXTS.some(t => text.includes(t))) {
                  handleUnlockElement(el, observer);
                  return;
              }
          }

          function handleUnlockElement(element, observerRef) {
              Logger.info('Unlock element detected');
              modifyParentElement(element);
              observerRef.disconnect();
          }
      } catch (e) {
          Logger.error('Observer setup failed', e);
      }
  }

  function setupFetchOverride() {
      originalFetch = window.fetch;

      window.fetch = function(url, config) {
          if (state.isShutdown) {
              return originalFetch(url, config);
          }

          try {
              const urlStr = typeof url === 'string' ? url : (url && url.url) ? url.url : '';

              if (typeof INCENTIVE_SYNCER_DOMAIN === 'undefined' ||
                  typeof INCENTIVE_SERVER_DOMAIN === 'undefined' ||
                  typeof KEY === 'undefined' ||
                  typeof TID === 'undefined') {
                  return originalFetch(url, config);
              }

              if (urlStr.includes(`${INCENTIVE_SYNCER_DOMAIN}/tc`)) {
                  return originalFetch(url, config).then(response => {
                      if (!response.ok) return response;

                      return response.clone().json().then(data => {
                          let urid = '';
                          let task_id = 54;
                          let action_pixel_url = '';

                          try {
                              data.forEach(item => {
                                  urid = item.urid;
                                  action_pixel_url = item.action_pixel_url;
                              });
                          } catch (e) {}

                          if (!validateUrid(urid)) {
                              Logger.error('Invalid urid format');
                              return new Response(JSON.stringify(data), {
                                  status: response.status,
                                  statusText: response.statusText,
                                  headers: response.headers
                              });
                          }

                          const subdomain = parseInt(urid.slice(-5), 10) % 3;
                          const wsUrl = `wss://${subdomain}.${INCENTIVE_SERVER_DOMAIN}/c?uid=${encodeURIComponent(urid)}&cat=${task_id}&key=${encodeURIComponent(KEY)}`;

                          Logger.info('WebSocket connecting', wsUrl);

                          const ws = new RobustWebSocket(wsUrl, { maxRetries: 3 });
                          window.activeWebSocket = ws;
                          ws.connect();

                          if (navigator.sendBeacon) {
                              try {
                                  navigator.sendBeacon(`https://${subdomain}.${INCENTIVE_SERVER_DOMAIN}/st?uid=${encodeURIComponent(urid)}&cat=${task_id}`);
                              } catch (e) {}
                          }

                          if (action_pixel_url) {
                              fetch(action_pixel_url).catch(() => {});
                          }

                          fetch(`https://${INCENTIVE_SYNCER_DOMAIN}/td?ac=1&urid=${encodeURIComponent(urid)}&&cat=${task_id}&tid=${encodeURIComponent(TID)}`).catch(() => {});

                          return new Response(JSON.stringify(data), {
                              status: response.status,
                              statusText: response.statusText,
                              headers: response.headers
                          });
                      }).catch(() => response);
                  }).catch(err => {
                      Logger.error('Fetch intercept failed', err);
                      return originalFetch(url, config);
                  });
              }
          } catch (e) {
              Logger.error('Fetch override error', e);
          }

          return originalFetch(url, config);
      };

      Logger.info('Fetch override installed');
  }

  function init() {
      Logger.info('Initializing bypass system');
      injectStyles();
      setupFetchOverride();
      setupObserver();
  }

  if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
  } else {
      init();
  }

  cleanupManager.addEventListener(window, 'beforeunload', () => {
      cleanupManager.clearAll();
  });

  })();
