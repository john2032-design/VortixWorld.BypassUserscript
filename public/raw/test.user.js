// ==UserScript==
// @name         VortixWorld Bypass
// @namespace    afklolbypasser
// @version      2.9.1
// @description  Bypass 💩 Fr
// @author       afk.l0l
// @match        *://*/*
// @icon         https://i.ibb.co/LdshK1fR/461-F6268-08-F3-4-E8A-BC73-409218-A3-F168.jpg
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_setClipboard
// @grant        none
// @license      MIT
// @run-at       document-start
// ==/UserScript==

(function() {
  'use strict';

  window.VW_API_KEY = 'PUT_KEY_HERE';

  const HOST = (location.hostname || '').toLowerCase().replace(/^www\./, '');
  const LOOT_HOSTS = [
    'loot-link.com', 'loot-links.com', 'lootlink.org', 'lootlinks.co',
    'lootdest.info', 'lootdest.org', 'lootdest.com', 'links-loot.com',
    'linksloot.net', 'lootlinks.com', 'best-links.org', 'loot-labs.com',
    'lootlabs.com'
  ];
  function hostMatchesAny(list) {
    for (const base of list) if (HOST === base || HOST.endsWith('.' + base)) return true;
    return false;
  }
  const isLootHostNow = hostMatchesAny(LOOT_HOSTS);

  if (isLootHostNow) {
    const unlockText = ['UNLOCK CONTENT', 'Unlock Content', 'Complete Task', 'Get Reward', 'Claim Reward'];
    const observer = new MutationObserver((mutations, obs) => {
      for (const mut of mutations) {
        if (mut.type !== 'childList') continue;
        for (const node of mut.addedNodes) {
          if (node.nodeType !== 1) continue;
          const elements = [node, ...node.querySelectorAll?.('*') || []];
          for (const el of elements) {
            if (el.textContent && unlockText.some(t => el.textContent.includes(t))) {
              const parent = el.parentElement;
              if (parent) {
                parent.innerHTML = '';
                parent.style.cssText = 'height:0!important;overflow:hidden!important;visibility:hidden!important';
                window.__vw_unlockDetected = true;
                window.__vw_unlockElement = parent;
                obs.disconnect();
                return;
              }
            }
          }
        }
      }
    });
    observer.observe(document.documentElement || document.body, { childList: true, subtree: true });
    window.__vw_lootlink_observer = observer;

    const originalFetch = window.fetch;
    const TC_PROXY_URL = 'https://lootlink-backend.onrender.com/tc';
    const BL_TASKS = [18, 2, 33, 7, 21, 49, 48];
    window.fetch = function(url, config) {
      const urlStr = typeof url === 'string' ? url : (url && url.url ? url.url : '');
      if (urlStr.includes('nerventualken.com/tc') || urlStr.includes('INCENTIVE_SYNCER_DOMAIN/tc')) {
        let bodyObj = {};
        if (config && config.body) {
          try {
            bodyObj = typeof config.body === 'string' ? JSON.parse(config.body) : config.body;
          } catch(e) {}
        }
        bodyObj.bl = BL_TASKS;

        return originalFetch(TC_PROXY_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bodyObj)
        }).then(response => {
          if (!response.ok) throw new Error(`Proxy returned ${response.status}`);
          return response.clone().json().then(data => {
            window.__vw_tc_response = data;
            window.__vw_tc_processed = false;
            return new Response(JSON.stringify(data), { status: 200, headers: { 'Content-Type': 'application/json' } });
          });
        }).catch(err => {
          console.error('[VW] Proxy fetch failed:', err);
          return originalFetch(url, config);
        });
      }
      return originalFetch(url, config);
    };
    window.__vw_fetch_interceptor_active = true;
  }

  const DEPENDENCIES = [
    'https://vortixworlduserscript.vercel.app/raw/vw-settings.js',
    'https://vortixworlduserscript.vercel.app/raw/vw-resource.js',
    'https://vortixworlduserscript.vercel.app/raw/vw-logs.js',
    'https://vortixworlduserscript.vercel.app/raw/vw-toast.js',
    'https://vortixworlduserscript.vercel.app/raw/vw-lootlink.js',
    'https://vortixworlduserscript.vercel.app/raw/vw-api.js',
    'https://vortixworlduserscript.vercel.app/raw/vw-tpi.js',
    'https://vortixworlduserscript.vercel.app/raw/vw-luarmor.js'
  ];

  let loadedCount = 0;
  const totalDeps = DEPENDENCIES.length;

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load: ${src}`));
      document.head.appendChild(script);
    });
  }

  async function loadAllDependencies() {
    for (const src of DEPENDENCIES) {
      await loadScript(src);
      loadedCount++;
      console.log(`[VW] Loaded (${loadedCount}/${totalDeps}): ${src}`);
    }
  }

  async function startMainLogic() {
    const state = { processStartTime: Date.now() };
    window.state = state;

    async function main() {
      try {
        if (typeof HOST === 'undefined') return;

        if (HOST.includes('luarmor.net')) {
          if (typeof runAutoLuarmor === 'function') runAutoLuarmor();
          return;
        } else {
          if (typeof removeAutoLuaUI === 'function') removeAutoLuaUI();
        }

        if (typeof isLootHost === 'function' && isLootHost()) {
          if (typeof runLocalLootlinkBypass === 'function') runLocalLootlinkBypass();
        }
        else if (typeof isTpiLi === 'function' && isTpiLi()) {
          if (typeof runLocalTpiLiBypass === 'function') runLocalTpiLiBypass();
        }
        else if (typeof isAllowedHost === 'function' && isAllowedHost()) {
          if (typeof runApiBypass === 'function') runApiBypass();
        }

        if (typeof showToast === 'function') {
          showToast('Userscript Loaded', false, 'https://i.ibb.co/jP7P4Dbw/IMG-0022.gif');
        }
      } catch (err) {
        console.error('[VW] Main logic crashed:', err);
      }
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', main);
    } else {
      main();
    }
  }

  loadAllDependencies()
    .then(() => {
      console.log('[VW] All dependencies loaded. Starting main logic.');
      startMainLogic();
    })
    .catch(err => {
      console.error('[VW] Failed to load dependencies:', err);
    });
})();