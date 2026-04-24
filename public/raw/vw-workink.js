(function() {
  'use strict';

  function waitFor(fn) {
    if (fn()) return;
    const timer = setInterval(() => { if (fn()) { clearInterval(timer); } }, 50);
  }

  waitFor(() => window.Logger);

  window.initWorkinkBypass = function() {
    const host = location.hostname;
    if (!host.includes('work.ink')) return;
    Logger.info('[Work.ink] Initialising bypass...');

    if (window.__vw_workink_bypass_running) return;
    window.__vw_workink_bypass_running = true;

    const oldLog = console.log, oldWarn = console.warn, oldError = console.error;
    console.log = (...a) => Logger.info('[Work.ink]', ...a);
    console.warn = (...a) => Logger.warn('[Work.ink]', ...a);
    console.error = (...a) => Logger.error('[Work.ink]', ...a);

    let uiShown = false;
    function showWorkinkUI(url) {
      if (uiShown) return;
      uiShown = true;

      const card = document.createElement('div');
      card.id = 'vwWorkinkCard';
      card.className = 'vw-workink-card';
      card.innerHTML = `
        <button class="vw-close" id="vwWorkinkClose">✕</button>
        <img src="${window.ICON_URL}" class="vw-workink-icon" alt="VW">
        <div class="vw-workink-status">✔️ Link Bypassed</div>
        <div class="vw-workink-url">${window.escapeHtml ? window.escapeHtml(url) : url}</div>
        <div id="vwWorkinkCountdown" class="vw-workink-countdown" style="display:none;"></div>
        <div class="vw-workink-buttons">
          <button id="vwWorkinkCopyBtn" class="vw-workink-btn vw-workink-btn-copy">📋 Copy</button>
          <button id="vwWorkinkProceedBtn" class="vw-workink-btn vw-workink-btn-proceed">➡️ Proceed</button>
        </div>
      `;
      document.body.appendChild(card);

      document.getElementById('vwWorkinkClose').onclick = () => { card.remove(); uiShown = false; };

      const copyBtn = document.getElementById('vwWorkinkCopyBtn');
      copyBtn.onclick = async () => {
        if (window.copyTextSilent) await window.copyTextSilent(url);
        copyBtn.textContent = '✓ Copied';
        setTimeout(() => copyBtn.textContent = '📋 Copy', 2000);
      };

      const proceedBtn = document.getElementById('vwWorkinkProceedBtn');
      proceedBtn.onclick = () => { if (uiShown) location.replace(url); };

      const autoRedirect = (() => {
        try {
          const s = localStorage.getItem('vw_auto_redirect');
          if (s === null) return true;
          return s === 'true';
        } catch (_) { return true; }
      })();

      if (!autoRedirect) {
        document.getElementById('vwWorkinkCountdown').style.display = 'block';
        document.getElementById('vwWorkinkCountdown').textContent = 'Auto‑redirect disabled';
      } else {
        const redirectSetting = localStorage.getItem('bypass_redirect_setting') || 'off';
        if (redirectSetting === 'instant') {
          location.replace(url);
        } else if (redirectSetting === '25s') {
          let left = 25;
          const el = document.getElementById('vwWorkinkCountdown');
          el.style.display = 'block';
          el.textContent = `Redirecting in ${left}s`;
          const timer = setInterval(() => {
            left--;
            if (left <= 0) { clearInterval(timer); location.replace(url); }
            else el.textContent = `Redirecting in ${left}s`;
          }, 1000);
        }
      }
    }

    let logicReady = false;
    let pendingSessionController = null;
    let capturedWsUrl = null;
    let directWs = null, directWsReady = false, wsMessageQueue = [];
    let sessionController, sendMessage, sendMessageProxy, originalLinkInfo, linkDestination;
    let bypassTriggered = false, destinationReceived = false, destinationProcessed = false;
    let socialPage = false, destinationTimeoutId = null, proxiesInstalled = false;
    let redirectUrl = null;
    const RELOAD_KEY = 'wk_dest_reload_once';
    const DEST_TIMEOUT_MS = 30000;

    const OriginalWebSocket = window.WebSocket;
    window.WebSocket = function(url, ...args) {
      const instance = new OriginalWebSocket(url, ...args);
      if (url.includes('work.ink/_api/v2/ws')) {
        capturedWsUrl = url;
        Logger.info('[Work.ink] Captured WS:', url);
        instance.addEventListener('message', (event) => {
          try { const msg = JSON.parse(event.data); if (logicReady) handleDirectWsMessage(msg); } catch(e) {}
        });
        if (logicReady) openDirectWs(url);
      }
      return instance;
    };
    window.WebSocket.prototype = OriginalWebSocket.prototype;
    window.WebSocket.CONNECTING = OriginalWebSocket.CONNECTING;
    window.WebSocket.OPEN = OriginalWebSocket.OPEN;
    window.WebSocket.CLOSING = OriginalWebSocket.CLOSING;
    window.WebSocket.CLOSED = OriginalWebSocket.CLOSED;

    function openDirectWs(url) {
      if (directWs || !logicReady) return;
      directWs = new OriginalWebSocket(url);
      directWs.onopen = () => {
        directWsReady = true;
        Logger.info('[Work.ink] Direct WS connected');
        wsMessageQueue.forEach(m => sendDirectWs(m.type, m.data));
        wsMessageQueue = [];
      };
      directWs.onmessage = (event) => {
        try { handleDirectWsMessage(JSON.parse(event.data)); } catch(e) {}
      };
      directWs.onerror = (e) => Logger.warn('[Work.ink] Direct WS error:', e);
      directWs.onclose = () => {
        directWsReady = false;
        setTimeout(() => {
          if (capturedWsUrl && !destinationReceived && logicReady) {
            Logger.info('[Work.ink] Reconnecting direct WS...');
            directWs = null;
            openDirectWs(capturedWsUrl);
          }
        }, 3000);
      };
    }

    function sendDirectWs(type, data = {}) {
      if (!logicReady) return;
      if (!directWsReady || !directWs) { wsMessageQueue.push({type, data}); return; }
      directWs.send(JSON.stringify({type, data}));
    }

    function handleDirectWsMessage(msg) {
      if (!logicReady || uiShown) return;
      const url = msg?.url || msg?.data?.url || msg?.destination || msg?.data?.destination;
      if (url) {
        Logger.info('[Work.ink] Destination from direct WS:', url);
        destinationReceived = true; destinationProcessed = true; redirectUrl = url;
        showWorkinkUI(url);
        return;
      }
    }

    (function() {
      const kill = () => {
        document.querySelectorAll('.fc-message-root').forEach(el => el.remove());
        document.querySelectorAll('.\\[\\&\\:not\\(\\:first-child\\)\\]\\:mt-12').forEach(el => el.remove());
        document.querySelectorAll('.hidden.lg\\:block.sticky.top-32.self-start.w-\\[340px\\].flex-shrink-0').forEach(el => el.remove());
        document.querySelectorAll('adsense-billboard-container').forEach(el => el.remove());
        document.querySelectorAll('ins.adsbygoogle.svelte-fzt6lu').forEach(el => el.remove());
      };
      kill();
      new MutationObserver(kill).observe(document.documentElement, {childList: true, subtree: true});
    })();

    function findGoToDestinationButton() {
      for (const btn of document.querySelectorAll('div.button.large.accessBtn.pos-relative')) {
        const text = (btn.textContent || '');
        if (text.includes('Go to Destination') || text.includes('Proceed To Destination')) return btn;
      }
      for (const div of document.querySelectorAll('div')) {
        const text = (div.textContent || '').trim();
        const classes = div.className || '';
        if ((text.includes('Go to Destination') || text.includes('Proceed To Destination')) && classes.includes('accessBtn')) return div;
      }
      return null;
    }

    function getName(obj, candidates = null) {
      if (!obj || typeof obj !== 'object') return {fn: null, index: -1, name: null};
      if (candidates) {
        for (let i = 0; i < candidates.length; i++) {
          if (typeof obj[candidates[i]] === 'function') return {fn: obj[candidates[i]], index: i, name: candidates[i]};
        }
      } else {
        for (let i in obj) {
          if (typeof obj[i] == 'function' && obj[i].length == 2) return {fn: obj[i], name: i};
        }
      }
      return {fn: null, index: -1, name: null};
    }

    function sleep(ms) { return new Promise(res => setTimeout(res, ms)); }

    function setupProxies() {
      if (!sessionController || proxiesInstalled) return;
      const map = { onLinkInfo: ['onLinkInfo'], onLinkDestination: ['onLinkDestination'] };
      const send = getName(sessionController), info = getName(sessionController, map.onLinkInfo), dest = getName(sessionController, map.onLinkDestination);
      if (!send.fn || !info.fn || !dest.fn) return;
      sendMessage = send.fn; originalLinkInfo = info.fn; linkDestination = dest.fn;
      sendMessageProxy = createSendMessage();
      const onLinkInfoProxy = createLinkInfo(), linkDestinationProxy = createLinkDestination();
      try {
        Object.defineProperty(sessionController, send.name, { get() { return sendMessageProxy; }, set(v) { sendMessage = v; }, configurable: false, enumerable: true });
        Object.defineProperty(sessionController, info.name, { get() { return onLinkInfoProxy; }, set(v) { linkInfo = v; }, configurable: false, enumerable: true });
        Object.defineProperty(sessionController, dest.name, { get() { return linkDestinationProxy; }, set(v) { linkDestination = v; }, configurable: false, enumerable: true });
        proxiesInstalled = true;
        Logger.info('[Work.ink] Proxies installed');
      } catch(e) { Logger.error('[Work.ink] Proxy setup failed:', e); }
    }

    function createSendMessage() {
      return function(...args) {
        const type = args[0], data = args[1];
        if (!logicReady) return sendMessage.apply(this, args);
        return sendMessage.apply(this, args);
      };
    }

    function createLinkInfo() {
      return async function(...args) {
        const [info] = args;
        Logger.info('[Work.ink] Link info received:', info);
        if (!logicReady) {
          if (sessionController) sessionController.linkInfo = info;
          try { Object.defineProperty(info, 'isAdblockEnabled', { get: () => false, set: () => {}, configurable: false, enumerable: true }); } catch(e) {}
          return originalLinkInfo ? originalLinkInfo.apply(this, args) : undefined;
        }
        if ((info?.socials || []).length > 0) startDestinationTimeout();
        spoofWorkink();
        try { Object.defineProperty(info, 'isAdblockEnabled', { get: () => false, set: () => {}, configurable: false, enumerable: true }); } catch(e) {}
        return originalLinkInfo ? originalLinkInfo.apply(this, args) : undefined;
      };
    }

    function createLinkDestination() {
      return function(...args) {
        const [data] = args;
        if (data?.url) { redirectUrl = data.url; }
        if (!logicReady) return;
        if (uiShown || destinationProcessed) return;
        destinationProcessed = true; destinationReceived = true;
        Logger.info('[Work.ink] Destination processed:', redirectUrl);
        showWorkinkUI(redirectUrl);
      };
    }

    let destinationTimeoutStarted = false;
    function startDestinationTimeout() {
      if (destinationTimeoutStarted) return;
      destinationTimeoutStarted = true;
      destinationTimeoutId = setTimeout(() => {
        if (!destinationReceived) {
          const alreadyReloaded = sessionStorage.getItem(RELOAD_KEY);
          if (!alreadyReloaded) sessionStorage.setItem(RELOAD_KEY, '1');
          else {
            const url = sessionController?.linkInfo?.destination || sessionController?.linkInfo?.url || sessionController?.linkInfo?.redirect;
            if (url) { Logger.info('[Work.ink] Found cached destination:', url); destinationReceived = true; showWorkinkUI(url); }
          }
        }
      }, DEST_TIMEOUT_MS);
    }

    function spoofWorkink() {
      if (!sessionController?.linkInfo) return;
      const socials = sessionController.linkInfo.socials || [];
      Logger.info('[Work.ink] Found', socials.length, 'socials');
      if (socials.length > 0) {
        (async () => {
          let successCount = 0;
          for (let i = 0; i < socials.length; i++) {
            if (uiShown) break;
            const soc = socials[i];
            let platformName = 'Unknown';
            try { const url = new URL(soc.url); platformName = url.hostname.replace('www.','').split('.')[0]; platformName = platformName.charAt(0).toUpperCase() + platformName.slice(1); } catch(e) {}
            Logger.info(`[Work.ink] Sending social ${platformName} (${i+1}/${socials.length})`);
            if (sendMessageProxy && sessionController) {
              for (let a = 0; a < 3; a++) {
                sendMessageProxy.call(sessionController, 'c_social_started', { url: soc.url });
                sendDirectWs('c_social_started', { url: soc.url });
                await sleep(200);
              }
              successCount++;
            }
          }
          Logger.info(`[Work.ink] Sent ${successCount}/${socials.length} socials`);
          if (successCount === socials.length) {
            await sleep(2000);
            socialPage = false;
            location.reload();
          } else {
            await proceedToMonetizations();
          }
        })();
      } else {
        socialPage = false;
        proceedToMonetizations();
      }
    }

    async function proceedToMonetizations() {
      Logger.info('[Work.ink] Proceeding to monetizations...');
      injectBrowserExtensionSupport();
      const nodes = sessionController?.monetizations || [];
      for (let i = 0; i < nodes.length; i++) {
        if (uiShown) break;
        const node = nodes[i];
        try {
          const nodeId = node.id, nodeSendMessage = node.sendMessage;
          sendMessageProxy.call(sessionController, 'c_offer_skipped', { offerId: nodeId });
          sendMessageProxy.call(sessionController, 'c_offers_skipped', {});
          switch (nodeId) {
            case 22: nodeSendMessage.call(node, {event:'read'}); break;
            case 23: nodeSendMessage.call(node, {event:'start'}); await sleep(300); nodeSendMessage.call(node, {event:'installedClicked'}); break;
            case 25: nodeSendMessage.call(node, {event:'start'}); await sleep(300); nodeSendMessage.call(node, {event:'installedClicked'}); fetch('/_api/v2/affiliate/operaGX').catch(()=>{}); await sleep(2000); nodeSendMessage.call(node, {event:'done'}); fetch('https://work.ink/_api/v2/callback/operaGX',{method:'POST',mode:'no-cors',headers:{'Content-Type':'application/json'},body:JSON.stringify({noteligible:true})}).catch(()=>{}); await sleep(2000); break;
            case 73: nodeSendMessage.call(node, {event:'start'}); await sleep(300); nodeSendMessage.call(node, {event:'installedClicked'}); break;
            case 27: case 29: case 36: case 62: case 65: case 70: nodeSendMessage.call(node, {event:'start'}); break;
            case 57: nodeSendMessage.call(node, {event:'installed'}); break;
            case 28: case 34: case 40: case 60: case 71: nodeSendMessage.call(node, {event:'start'}); await sleep(300); nodeSendMessage.call(node, {event:'installedClicked'}); break;
            case 32: nodeSendMessage.call(node, {event:'start'}); break;
            case 80: nodeSendMessage.call(node, {event:'init'}); await sleep(300); nodeSendMessage.call(node, {event:'start'}); break;
            case 106: nodeSendMessage.call(node, {event:'init'}); await sleep(300); nodeSendMessage.call(node, {event:'start'}); await sleep(300); nodeSendMessage.call(node, {event:'done'}); break;
            default: nodeSendMessage.call(node, {event:'start'}); await sleep(300); ['init','installedClicked','installed','read'].forEach(ev => { try { nodeSendMessage.call(node, {event:ev}); } catch{} }); nodeSendMessage.call(node, {event:'done'}); break;
          }
          await sleep(500);
        } catch(e) { Logger.error('[Work.ink] Failed to process node', node.id, e); }
      }
      const waitForDestination = (retries = 50, interval = 500) => {
        return new Promise(resolve => {
          let attempts = 0;
          const check = () => {
            attempts++;
            if (uiShown) { resolve(redirectUrl); return; }
            const url = sessionController?.linkInfo?.destination || sessionController?.linkInfo?.url || sessionController?.linkInfo?.redirect;
            if (url) resolve(url);
            else if (attempts < retries) setTimeout(check, interval);
            else resolve(null);
          };
          check();
        });
      };
      const url = await waitForDestination();
      if (url && !uiShown) showWorkinkUI(url);
    }

    function injectBrowserExtensionSupport() {
      if (window._browserExt2BypassInjected) return;
      if (!window.chrome) window.chrome = {};
      if (!window.chrome.runtime) window.chrome.runtime = {};
      const orig = window.chrome.runtime.sendMessage;
      window.chrome.runtime.sendMessage = function(id, msg, cb) {
        if (msg?.message === 'wk_installed') { if (cb) cb({installed: true}); return; }
        if (orig) return orig.apply(this, arguments);
      };
      window._browserExt2BypassInjected = true;
    }

    function activateLogic() {
      if (logicReady) return;
      logicReady = true;
      Logger.info('[Work.ink] Button detected!');
      if (capturedWsUrl) openDirectWs(capturedWsUrl);
      if (pendingSessionController && !proxiesInstalled) { sessionController = pendingSessionController; setupProxies(); }
      if (redirectUrl && !uiShown && !destinationProcessed) { destinationProcessed = true; destinationReceived = true; showWorkinkUI(redirectUrl); return; }
      if (sessionController?.linkInfo) spoofWorkink();
    }

    let buttonDetected = false;
    const btnObserver = new MutationObserver(() => {
      if (buttonDetected) { btnObserver.disconnect(); return; }
      if (findGoToDestinationButton()) {
        buttonDetected = true;
        btnObserver.disconnect();
        setTimeout(activateLogic, 200);
      }
    });
    btnObserver.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'style'] });

    let pollCount = 0;
    const pollInterval = setInterval(() => {
      if (buttonDetected) { clearInterval(pollInterval); return; }
      if (++pollCount > 600) { clearInterval(pollInterval); btnObserver.disconnect(); return; }
      if (findGoToDestinationButton()) {
        buttonDetected = true;
        clearInterval(pollInterval);
        btnObserver.disconnect();
        setTimeout(activateLogic, 200);
      }
    }, 500);

    function checkController(target, prop, value) {
      if (value && typeof value === 'object' && getName(value).fn && getName(value, ['onLinkInfo']).fn && getName(value, ['onLinkDestination']).fn && !sessionController && !pendingSessionController) {
        if (logicReady) { sessionController = value; setupProxies(); }
        else { pendingSessionController = value; }
      }
      target[prop] = value; return true;
    }

    function createComponentProxy(component) {
      return new Proxy(component, {
        construct(target, args) {
          const instance = Reflect.construct(target, args);
          if (instance?.$$?.ctx) instance.$$.ctx = new Proxy(instance.$$.ctx, { set: checkController });
          return instance;
        }
      });
    }

    function createNodeResultProxy(result) {
      return new Proxy(result, {
        get(target, prop, receiver) {
          if (prop === 'component') return createComponentProxy(target.component);
          return Reflect.get(target, prop, receiver);
        }
      });
    }

    function createNodeProxy(oldNode) {
      return async (...args) => {
        return createNodeResultProxy(await oldNode(...args));
      };
    }

    function createKitProxy(kit) {
      if (typeof kit !== 'object' || !kit || !('start' in kit && kit.start)) return [false, kit];
      return [true, new Proxy(kit, {
        get(target, prop, receiver) {
          if (prop === 'start') return function(...args) {
            const appModule = args[0], options = args[2];
            if (typeof appModule === 'object' && typeof appModule.nodes === 'object' && typeof options === 'object' && typeof options.node_ids === 'object') {
              appModule.nodes[options.node_ids[1]] = createNodeProxy(appModule.nodes[options.node_ids[1]]);
            }
            return target.start.apply(this, args);
          };
          return Reflect.get(target, prop, receiver);
        }
      })];
    }

    function setupInterception() {
      const originalPromiseAll = Promise.all;
      let intercepted = false;
      window.Promise.all = async function(promises) {
        const result = originalPromiseAll.call(window.Promise, promises);
        if (!intercepted) return await new Promise((resolve) => {
          result.then(([kit, app, ...args]) => {
            const [success, wrappedKit] = createKitProxy(kit);
            if (success) { intercepted = true; window.Promise.all = originalPromiseAll; }
            resolve([wrappedKit, app, ...args]);
          });
        });
        return await result;
      };
    }
    setupInterception();
  };
})();