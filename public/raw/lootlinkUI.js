var DOMAINS = {
    'auth.platorelay.com':1, 'gateway.platoboost.com':1, 'pandadevelopment.net':1,
    'new.pandadevelopment.net':1, 'trigonevo.com':1, 'violated.lol':1, 'blox-script.com':1,
    'boblox-script.com':1, 'hydrogen.lat':1, 'mobile.codex.lol':1, 'delta-executor.com':1,
    'vegax.gg':1, 'ad-link.link':1, 'linkvertise.com':1, 'link-to.net':1, 'link-hub.net':1,
    'loot-link.com':1, 'lootdest.org':1, 'free-content.pro':1, 'work.ink':1, 'workink.net':1,
    'rinku.pro':1, '7mb.io':1, 'stfly.vip':1, 'shrtslug.biz':1, 'lockr.so':1, 'lockr.net':1,
    'linkunlocker.com':1, 'link-unlock.com':1, 'arolinks.com':1, 'tpi.li':1, 'go.linkify.ru':1,
    'bstlar.com':1, 'scriptpastebins.com':1, 'bstshrt.com':1, 'sfl.gl':1, 'go.yorurl.com':1,
    'yorurl.com':1, 'robloxscripts.gg':1, 'lnbz.la':1, 'linkzy.space':1, 'ez4short.com':1,
    'cuty.io':1, 'cety.io':1, 'boost.ink':1, 'adfoc.us':1, 'mendationforc.info':1, 'rekonise.com':1,
    'rekonise.org':1, 'rkns.link':1, 'socialwolvez.com':1, 'mboost.me':1, 'bst.gg':1, 'booo.st':1,
    'social-unlock.com':1, 'sub2unlock.com':1, 'sub2unlock.me':1, 'sub2unlock.io':1,
    'sub4unlock.com':1, 'sub4unlock.me':1, 'sub4unlock.io':1, 'sub2get.com':1, 'subfinal.com':1,
    'unlocknow.net':1, 'ytsubme.com':1, 'pastebin.com':1, 'paste-drop.com':1, 'pastefy.app':1,
    'paster.so':1, 'paster.gg':1, 'justpaste.it':1, 'pastecanyon.com':1, 'pastehill.com':1,
    'pastemode.com':1, 'rentry.org':1, 'rentry.co':1, 'bit.ly':1, 'cl.gy':1, 'goo.gl':1, 'is.gd':1,
    'rebrand.ly':1, 'shorter.me':1, 't.co':1, 't.ly':1, 'tiny.cc':1, 'tinylink.onl':1, 'tinyurl.com':1,
    'v.gd':1, 'ouo.io':1, 'beta.shortearn.eu':1, 'link-unlocker.com':1, 'mega.nz':1, 'mega.co.nz':1
};

function getHost(url) {
    try { return new URL(url).hostname.toLowerCase().replace(/^www\./, ''); } catch(e) { return ''; }
}

function isSupported(url) {
    return !!DOMAINS[getHost(url)];
}

var BOLT = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:block"><path d="M13 3L4 14h7v7l9-11h-7z" stroke="#f5c842" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/></svg>';
var BOLT_DARK = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" style="display:block"><path d="M13 3L4 14h7v7l9-11h-7z" fill="#090909" stroke="#090909" stroke-width="0.5" stroke-linejoin="round"/></svg>';

var overlay = document.createElement('div');
overlay.id = '_bto';
overlay.className = '_bto_hide';
overlay.innerHTML = `
    <div id="_btc">
        <div id="_bth">
            <div id="_bthi">${BOLT_DARK}</div>
            <div><div id="_btht">Bypass Tools</div><div id="_bths">Ad-link & shortener bypass</div></div>
            <button id="_btxb" aria-label="Close">
                <svg width="13" height="13" viewBox="0 0 12 12" fill="none" style="display:block">
                    <path d="M1 1l10 10M11 1L1 11" stroke="#888" stroke-width="1.8" stroke-linecap="round"/>
                </svg>
            </button>
        </div>
        <div id="_btbd">
            <div id="_btrw">
                <input id="_btin" type="url" inputmode="url" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" placeholder="https://linkvertise.com/..." />
                <button id="_btgb">Bypass</button>
            </div>
            <button id="_btag">⚡ Bypass this page</button>
            <div id="_btst" style="display:none">
                <div id="_btspin"></div>
                <div id="_btsmsg">Bypassing…</div>
                <div id="_btssub"></div>
            </div>
            <div id="_btrs">
                <div id="_btrh"><div id="_btrdot"></div><span id="_btrlbl"></span></div>
                <div id="_btrbd">
                    <div id="_btrurl"></div>
                    <div id="_btacts">
                        <button class="_btab" id="_btcp">Copy</button>
                        <button class="_btab" id="_btop">Open →</button>
                    </div>
                </div>
            </div>
        </div>
    </div>`;

var fab = document.createElement('button');
fab.id = '_btfab';
fab.setAttribute('aria-label', 'Bypass Tools');
fab.innerHTML = BOLT;

function mount() {
    document.body.appendChild(overlay);
    document.body.appendChild(fab);
    bindEvents();
}

var inp   = null;
var gbtn  = null;
var pgbtn = null;
var st    = null;
var smsg  = null;
var ssub  = null;
var rs    = null;
var rlbl  = null;
var rurl  = null;
var cpbtn = null;
var opbtn = null;
var xbtn  = null;

var lastResult = '';

function bindEvents() {
    inp   = document.getElementById('_btin');
    gbtn  = document.getElementById('_btgb');
    pgbtn = document.getElementById('_btag');
    st    = document.getElementById('_btst');
    smsg  = document.getElementById('_btsmsg');
    ssub  = document.getElementById('_btssub');
    rs    = document.getElementById('_btrs');
    rlbl  = document.getElementById('_btrlbl');
    rurl  = document.getElementById('_btrurl');
    cpbtn = document.getElementById('_btcp');
    opbtn = document.getElementById('_btop');
    xbtn  = document.getElementById('_btxb');

    tap(fab,  function() { showOverlay(); });
    tap(xbtn, function() { hideOverlay(); });

    overlay.addEventListener('click', function(e) {
        if (e.target === overlay) hideOverlay();
    });

    tap(gbtn,  function() { doBypass(inp.value); });
    tap(pgbtn, function() { inp.value = window.location.href; doBypass(inp.value); });

    inp.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.keyCode === 13) doBypass(inp.value);
    });

    tap(cpbtn, function() { doCopy(); });
    tap(opbtn, function() { if (lastResult) window.open(lastResult, '_blank', 'noopener,noreferrer'); });

    if (isSupported(window.location.href)) {
        inp.value = window.location.href;
        showOverlay();
        doBypass(window.location.href);
    }
}

function showOverlay() {
    overlay.className = '';
    fab.className = '_btfab _bthid';
}

function hideOverlay() {
    overlay.className = '_bto_hide';
    fab.className = '_btfab';
}

function showSpinner(host) {
    st.style.display = 'flex';
    rs.className = '';
    smsg.textContent = 'Bypassing…';
    ssub.textContent = host;
    gbtn.disabled = true;
    pgbtn.disabled = true;
}

function hideSpinner() {
    st.style.display = 'none';
    gbtn.disabled = false;
    pgbtn.disabled = false;
}

function showResult(type, text) {
    lastResult = type === 'ok' ? text : '';
    rs.className = type === 'ok' ? '_btok' : '_bterr';
    rlbl.textContent = type === 'ok' ? 'Bypassed' : 'Failed';
    rurl.textContent = text;
    opbtn.style.display = type === 'ok' ? '' : 'none';
}

function doBypass(url) {
    url = (url || '').trim();
    if (!url) return;

    if (!isSupported(url)) {
        hideSpinner();
        showResult('err', 'Domain not supported: ' + getHost(url));
        return;
    }

    showOverlay();
    showSpinner(getHost(url));
    rs.className = '';

    function done(ok, text) {
        hideSpinner();
        showResult(ok ? 'ok' : 'err', text);
    }

    performBypass(url, done);
}

function doCopy() {
    if (!lastResult) return;
    function flash() { cpbtn.textContent = 'Copied!'; setTimeout(function() { cpbtn.textContent = 'Copy'; }, 1800); }
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(lastResult).then(flash).catch(fallback);
    } else { fallback(); }
    
    function fallback() {
        var ta = document.createElement('textarea');
        ta.value = lastResult;
        ta.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0;font-size:16px;';
        document.body.appendChild(ta);
        ta.focus(); ta.select();
        try { document.execCommand('copy'); flash(); } catch(e) {}
        document.body.removeChild(ta);
    }
}

function tap(el, fn) {
    var moved = false;
    el.addEventListener('touchstart', function() { moved = false; }, { passive: true });
    el.addEventListener('touchmove',  function() { moved = true;  }, { passive: true });
    el.addEventListener('touchend', function(e) { if (!moved) { e.preventDefault(); fn(e); } });
    el.addEventListener('click', function(e) { fn(e); });
}

window.initializeBypassTools = function () {
    if (document.body) {
        mount();
    } else {
        document.addEventListener('DOMContentLoaded', mount);
    }
};