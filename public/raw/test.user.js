// ==UserScript==
// @name         VortixWorld Bypass
// @namespace    afklolbypasser
// @version      2.6
// @description  Bypass 💩 Fr
// @author       afk.l0l
// @match        *://*/*
// @icon         https://i.ibb.co/LdshK1fR/461-F6268-08-F3-4-E8A-BC73-409218-A3-F168.jpg
// @require      https://vortixworlduserscript.vercel.app/raw/vw-settings.js
// @grant        none
// @license      MIT
// @run-at       document-start
// ==/UserScript==

;(function () {
  'use strict'

  const HOST = (location.hostname || '').toLowerCase().replace(/^www\./, '')
  const ICON_URL = 'https://i.ibb.co/LdshK1fR/461-F6268-08-F3-4-E8A-BC73-409218-A3-F168.jpg'
  const LOOTLINK_UI_ICON = 'https://i.ibb.co/s0yg2cv/AA1-D3-E03-2205-4572-ACFB-29-B8-B9-DDE381.png'
  const LUARMOR_UI_ICON = 'https://i.ibb.co/BDQS9rS/F20-A6183-C85E-447-C-A27-C-11-B9-E8971-B45.png'
  const API_BASE = 'https://vortixworld-end.vercel.app'

  // --- SETTINGS INTEGRATION ---
  const VW_KEYS = { autoRedirect: 'vw_auto_redirect', userAgent: 'vw_user_agent' }
  const getEffectiveUA = () => localStorage.getItem(VW_KEYS.userAgent) || navigator.userAgent;
  const ACTIVE_UA = getEffectiveUA();

  const UA = navigator.userAgent
  const isIOS = /iPad|iPhone|iPod/.test(UA) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  const isAndroid = /Android/.test(UA)
  const isMobile = isIOS || isAndroid || /Mobi|Tablet/.test(UA)

  // Apply Spoofer immediately
  try { Object.defineProperty(navigator, 'userAgent', { get: () => ACTIVE_UA, configurable: true }); } catch(e){}

  const LOOT_HOSTS = ['loot-link.com', 'loot-links.com', 'lootlink.org', 'lootlinks.co', 'lootdest.info', 'lootdest.org', 'lootdest.com', 'links-loot.com', 'linksloot.net', 'lootlinks.com', 'best-links.org', 'loot-labs.com', 'lootlabs.com', 'fast-links.org', 'rapid-links.com', 'rapid-links.net']
  const ALLOWED_SHORT_HOSTS = ['linkvertise.com', 'admaven.com', 'work.ink', 'shortearn.eu', 'beta.shortearn.eu', 'cuty.io', 'ouo.io', 'lockr.so', 'rekonise.com', 'mboost.me', 'link-unlocker.com', 'direct-link.net', 'direct-links.net', 'direct-links.org', 'link-center.net', 'link-hub.net', 'link-pays.in', 'link-target.net', 'link-target.org', 'link-to.net']

  const Logger = {
    _push(level, msg, data) {
      window.__vw_logs = window.__vw_logs || [];
      window.__vw_logs.push({ timestamp: new Date().toISOString(), level, message: msg, data: data || '' });
      if (window.__vw_logs.length > 500) window.__vw_logs.shift();
    },
    info: (m, d) => { console.info(`[INFO] ${m}`, d || ''); Logger._push('info', m, d); },
    warn: (m, d) => { console.warn(`[WARN] ${m}`, d || ''); Logger._push('warn', m, d); },
    error: (m, d) => { console.error(`[ERROR] ${m}`, d || ''); Logger._push('error', m, d); },
    websocket: (m, d) => { console.info(`[WS] ${m}`, d || ''); Logger._push('websocket', m, d); }
  }

  const cleanupManager = {
    intervals: new Set(), timeouts: new Set(),
    setInterval(fn, d) { const id = setInterval(fn, d); this.intervals.add(id); return id; },
    setTimeout(fn, d) { const id = setTimeout(() => { this.timeouts.delete(id); fn(); }, d); this.timeouts.add(id); return id; },
    clearAll() { this.intervals.forEach(clearInterval); this.timeouts.forEach(clearTimeout); this.intervals.clear(); this.timeouts.clear(); }
  }

  let isShutdown = false;
  function shutdown() {
    if (isShutdown) return; isShutdown = true; cleanupManager.clearAll();
    if (window.activeWebSocket) window.activeWebSocket.disconnect();
  }

  // --- LUARMOR LOGIC ---
  let autoLuaActive = false, autoLuaNavAttempted = false, lastLuaClickTime = 0;
  function triggerNativeLuarmor(id) {
    const s = document.createElement('script');
    s.textContent = `try{const b=document.getElementById('${id}');if(b){if(window.k?.event?.dispatch){k.event.dispatch.call(b,{target:b,type:'click',preventDefault:()=>{},stopPropagation:()=>{}})}else{b.click()}}}catch(e){}`;
    document.head.appendChild(s); s.remove();
  }

  function attemptNext() {
    if (!autoLuaActive || autoLuaNavAttempted) return;
    const btn = document.getElementById('nextbtn');
    if (btn && btn.offsetParent !== null && !btn.disabled) {
      if (Date.now() - lastLuaClickTime > 5000) {
        lastLuaClickTime = Date.now();
        triggerNativeLuarmor('nextbtn');
        // Only loop every 10s if IOS. Otherwise, click once and stop monitoring until next manual action or page change.
        if (isIOS) {
            autoLuaNavAttempted = false; 
            cleanupManager.setTimeout(attemptNext, 10000);
        } else {
            autoLuaNavAttempted = true; 
        }
      }
    } else { cleanupManager.setTimeout(attemptNext, 1000); }
  }

  function startAutoLuarmor() {
    autoLuaActive = true; localStorage.setItem('vw_auto_luarmor_active', 'true');
    attemptNext();
  }

  // --- LOOTLINK LOGIC ---
  function processTcResponse(data) {
    Logger.info('Processing /tc response');
    const task17 = Array.isArray(data) ? data.find(i => i.task_id === 17) : null;

    const runFallback = () => {
      Logger.warn('Method 1 Failed/Timeout -> Switching to Method 2');
      updateStatus('Switching Method...', 'Method 1 failed, trying Method 2');
      const fallback = data.find(t => t.auto_complete_seconds);
      if (fallback) {
        if (fallback.auto_complete_seconds) startCountdown(fallback.auto_complete_seconds);
        startWebSocketForTask(fallback, true);
      } else { updateStatus('❌ Bypass Failed', 'No tasks available'); }
    };

    if (task17 && task17.ad_url) {
      completeTaskViaSkippedLol(task17.ad_url).then(() => {
        const primaryWs = startWebSocketForTask(task17, false);
        cleanupManager.setTimeout(() => {
          if (primaryWs && !primaryWs.resolved) {
            primaryWs.disconnect();
            runFallback();
          }
        }, 8500); // Fail-safe timeout for Method 1
      }).catch(runFallback);
    } else { runFallback(); }
  }

  function initLootlinkFetchOverride() {
    const org = window.fetch;
    window.fetch = function (url, cfg) {
      const uStr = typeof url === 'string' ? url : (url?.url || '');
      if (uStr.includes('/tc') && cfg?.method === 'POST') {
        try {
          let body = JSON.parse(cfg.body || '{}');
          body.bl = Array.from({length: 53}, (_, i) => i + 1).filter(n => n !== 17);
          if (!isMobile) body.max_tasks = 3; // Requirement #5
          cfg.body = JSON.stringify(body);
        } catch(e){}
        return org(url, cfg).then(res => {
          if (!res.ok) return res;
          return res.clone().json().then(d => { processTcResponse(d); window.__vw_tc_processed = true; return new Response(JSON.stringify(d), res); }).catch(() => res);
        });
      }
      return org(url, cfg);
    };
  }

  async function completeTaskViaSkippedLol(taskUrl) {
    const res = await fetch('https://skipped.lol/api/evade/ll', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ID: 17, URL: taskUrl })
    });
    const json = await res.json();
    if (json.status !== 'ok') throw new Error('Skipped fail');
    return true;
  }

  function startWebSocketForTask(task, isFallback) {
    const wsUrl = `wss://${task.urid.substr(-5) % 3}.${INCENTIVE_SERVER_DOMAIN}/c?uid=${task.urid}&cat=${task.task_id}&key=${KEY}`;
    const ws = new RobustWebSocket(wsUrl);
    window.activeWebSocket = ws;
    ws.connect();
    return ws;
  }

  class RobustWebSocket {
    constructor(url) { this.url = url; this.resolved = false; }
    connect() {
      this.ws = new WebSocket(this.url);
      this.ws.onopen = () => { this.timer = setInterval(() => this.ws.send('0'), 10000); };
      this.ws.onmessage = (e) => {
        if (e.data.includes('r:')) {
          this.resolved = true;
          clearInterval(this.timer);
          let raw = e.data.replace('r:', '').trim();
          try { 
            let final = decodeURIComponent(atob(raw).split('').map((c, i) => String.fromCharCode(c.charCodeAt(0) ^ "abcde".charCodeAt(i % 5))).join(''));
            handleBypassSuccess(final);
          } catch(err) { handleBypassSuccess(raw); }
        }
      };
      this.ws.onclose = () => clearInterval(this.timer);
    }
    disconnect() { if(this.ws) this.ws.close(); clearInterval(this.timer); }
  }

  // --- UI & HELPERS ---
  function updateStatus(m, s) {
    const mEl = document.getElementById('vwStatus'), sEl = document.getElementById('vwSubStatus');
    if(mEl) mEl.innerText = m; if(sEl) sEl.innerText = s;
  }

  function handleBypassSuccess(url) {
    const auto = localStorage.getItem(VW_KEYS.autoRedirect) !== 'false';
    if (auto) { updateStatus('Redirecting...', 'Success!'); setTimeout(() => location.href = url, 1000); }
    else { showCompleteUI(url); }
    shutdown();
  }

  function injectUI() {
    if (document.getElementById('vortixWorldOverlay')) return;
    const div = document.createElement('div');
    div.id = 'vortixWorldOverlay';
    div.style.cssText = `position:fixed;inset:0;background:#1e1e1e;z-index:2147483647;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#e0e0e0;font-family:sans-serif;`;
    div.innerHTML = `<img src="${ICON_URL}" style="width:80px;border-radius:50%;margin-bottom:20px;"><div id="vwStatus" style="font-size:24px;font-weight:bold;">Initializing...</div><div id="vwSubStatus" style="color:#a0a0a0;margin-top:10px;">Please wait</div>`;
    document.documentElement.appendChild(div);
  }

  function startCountdown(s) {
    let timeLeft = s;
    const iv = setInterval(() => {
        timeLeft--;
        updateStatus('Bypassing...', `Method 2: ${timeLeft}s remaining`);
        if (timeLeft <= 0) clearInterval(iv);
    }, 1000);
  }

  function main() {
    if (HOST.includes('luarmor.net')) { startAutoLuarmor(); return; }
    if (LOOT_HOSTS.some(h => HOST.includes(h))) {
        injectUI();
        initLootlinkFetchOverride();
        // Fallback for manual trigger if fetch doesn't fire
        cleanupManager.setTimeout(() => { if(!window.__vw_tc_processed) location.reload(); }, 25000);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', main); else main();
})();
