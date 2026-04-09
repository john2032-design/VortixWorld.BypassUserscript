// ==UserScript==
// @name         VortixWorld Bypass
// @namespace    afklolbypasser
// @version      2.7
// @description  Bypass 💩 Fr
// @author       afk.l0l
// @match        *://*/*
// @icon         https://i.ibb.co/LdshK1fR/461-F6268-08-F3-4-E8A-BC73-409218-A3-F168.jpg
// @require      https://vortixworlduserscript.vercel.app/raw/vw-settings.js
// @require      https://vortixworlduserscript.vercel.app/raw/vw-logs.js
// @require      https://vortixworlduserscript.vercel.app/raw/vw-toast.js
// @require      https://vortixworlduserscript.vercel.app/raw/vw-resource.js
// @require      https://vortixworlduserscript.vercel.app/raw/vw-lootlink.js
// @require      https://vortixworlduserscript.vercel.app/raw/vw-api.js
// @require      https://vortixworlduserscript.vercel.app/raw/vw-tpi.js
// @require      https://vortixworlduserscript.vercel.app/raw/vw-luarmor.js
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        none
// @license      MIT
// @run-at       document-start
// ==/UserScript==

(function() {
  'use strict';

  const state = { processStartTime: Date.now() };
  window.state = state;

  async function main() {
    if (HOST.includes('luarmor.net')) {
      runAutoLuarmor();
      return;
    }

    if (isTpiLi()) {
      runLocalTpiLiBypass();
      return;
    }

    if (isLootHost()) {
      runLocalLootlinkBypass();
      return;
    }

    if (isAllowedHost()) {
      runApiBypass();
      return;
    }

    showToast('Userscript Loaded', false, 'https://i.ibb.co/jP7P4Dbw/IMG-0022.gif');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', main);
  else main();
})();