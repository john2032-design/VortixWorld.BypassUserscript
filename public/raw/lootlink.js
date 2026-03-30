// ==UserScript==
// @name         VortixWorld API Bypass (lootlink.js)
// @namespace    afklolbypasser
// @version      1.0
// @description  bypass.tools API integration for VortixWorld
// @author       afk.l0l
// @match        *://*/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    const API_URL = 'https://api.bypass.tools/api/v1/bypass/direct';
    const API_KEY = 'bt_09009a360dd5e8b49cf1a68962f774d92136564fb5594c64';

    async function bypassUrl(url) {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': API_KEY
            },
            body: JSON.stringify({
                url: url.trim(),
                refresh: false
            })
        });

        const data = await response.json();

        if (data.status === 'success') {
            return { success: true, result: data.result };
        } else {
            return { success: false, error: data.message || 'Unknown error' };
        }
    }

    window.VortixWorldAPI = {
        bypass: bypassUrl
    };
})();