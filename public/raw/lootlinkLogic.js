(function () {
    'use strict';

    var API_KEY = 'bt_09009a360dd5e8b49cf1a68962f774d92136564fb5594c64';
    var API_URL = 'https://api.bypass.tools/api/v1/bypass/direct';

    function performBypass(url, done) {
        var body = JSON.stringify({ url: url, refresh: false });
        var hdrs = { 'x-api-key': API_KEY, 'Content-Type': 'application/json' };

        if (typeof GM_xmlhttpRequest !== 'undefined') {
            GM_xmlhttpRequest({
                method: 'POST',
                url: API_URL,
                headers: hdrs,
                data: body,
                timeout: 25000,
                onload: function(r) {
                    try {
                        var d = JSON.parse(r.responseText);
                        if (d.status === 'success' && d.result) done(true, d.result);
                        else done(false, d.message || d.result || 'Bypass failed');
                    } catch(e) { done(false, 'Invalid API response'); }
                },
                onerror: function() { done(false, 'Network error — check connection'); },
                ontimeout: function() { done(false, 'Request timed out'); }
            });
        } else {
            fetch(API_URL, { method: 'POST', headers: hdrs, body: body })
            .then(function(r) { return r.json(); })
            .then(function(d) {
                if (d.status === 'success' && d.result) done(true, d.result);
                else done(false, d.message || d.result || 'Bypass failed');
            })
            .catch(function() { done(false, 'Network error — check connection'); });
        }
    }

    window.performBypass = performBypass;
})();