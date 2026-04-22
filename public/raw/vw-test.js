function VW_createSettingsUI(GM_storage, VW_KEYS, ICON_URL, HARDCODED_KEY, EMOJI, KEY_VALIDATION_URL) {
    if (document.getElementById('vw-settings-shadow-host')) return;
    const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&display=swap');`;
    const NEU_VARS = `
        :root {
            --clay-bg: #1a1c23; --clay-text: #e0e5ec; --clay-text-dim: #9ba1ab; --clay-accent: #ef4444;
            --neu-out: 6px 6px 12px #121419, -6px -6px 12px #22242d;
            --neu-in: inset 4px 4px 8px #121419, inset -4px -4px 8px #22242d;
            --clay-btn: inset 2px 2px 4px rgba(255,255,255,0.05), inset -2px -2px 4px rgba(0,0,0,0.3), 4px 4px 8px rgba(0,0,0,0.4);
            --clay-btn-active: inset 4px 4px 8px rgba(0,0,0,0.5), inset -2px -2px 4px rgba(255,255,255,0.05);
        }
    `;
    const SETTINGS_CSS = FONT_IMPORT + NEU_VARS + `
        .vw-settings-btn { position: fixed !important; left: 20px !important; bottom: 20px !important; z-index: 2147483647 !important; padding: 14px 24px !important; border-radius: 40px !important; border: none !important; background: #1a1c23 !important; box-shadow: var(--clay-btn) !important; color: var(--clay-text) !important; font-weight: 700 !important; cursor: grab !important; pointer-events: auto !important; transition: all 0.2s ease !important; text-transform: uppercase; letter-spacing: 1px; font-size: 14px; font-family: 'Orbitron', sans-serif; opacity: 1 !important; user-select: none; display: flex !important; align-items: center !important; gap: 8px !important; }
        .vw-settings-btn:active { cursor: grabbing !important; box-shadow: var(--clay-btn-active) !important; transform: translateY(2px); color: var(--clay-accent); }
        .vw-backdrop { position: fixed !important; inset: 0 !important; width: 100vw !important; height: 100vh !important; background: #1a1c23 !important; backdrop-filter: blur(8px); z-index: 2147483647 !important; display: none !important; align-items: center !important; justify-content: center !important; pointer-events: auto !important; opacity: 1 !important; }
        .vw-backdrop.open { display: flex !important; }
        .vw-panel { width: clamp(300px, 90vw, 600px) !important; max-height: 85vh !important; border-radius: 20px !important; background: var(--clay-bg) !important; box-shadow: 12px 12px 24px #121419, -12px -12px 24px #22242d !important; color: var(--clay-text) !important; display: flex !important; flex-direction: column !important; animation: vw-slide-in 0.3s ease-out !important; pointer-events: auto !important; border: 1px solid rgba(239,68,68,0.1); overflow: hidden; opacity: 1 !important; }
        @keyframes vw-slide-in { from { opacity: 0; transform: translateY(20px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .vw-header { display: flex !important; align-items: center !important; justify-content: space-between !important; padding: clamp(15px, 4vw, 20px) clamp(15px, 4vw, 25px) !important; border-bottom: 2px solid rgba(239,68,68,0.1); }
        .vw-title { font-weight: 800 !important; font-size: clamp(16px, 5vw, 20px) !important; display: flex !important; align-items: center !important; gap: 15px !important; color: #EDEDED !important; text-transform: uppercase; letter-spacing: 1px; text-shadow: 0 0 8px rgba(255,255,255,0.3); }
        .vw-title img { width: clamp(30px, 8vw, 38px) !important; height: clamp(30px, 8vw, 38px) !important; border-radius: 50% !important; box-shadow: inset 2px 2px 4px rgba(255,255,255,0.05), inset -2px -2px 4px rgba(0,0,0,0.3), 5px 5px 10px rgba(0,0,0,0.4) !important; object-fit: cover !important; }
        .vw-close-btn { width: clamp(30px, 8vw, 40px) !important; height: clamp(30px, 8vw, 40px) !important; border-radius: 50% !important; border: none !important; background: var(--clay-bg) !important; box-shadow: inset 2px 2px 4px rgba(255,255,255,0.05), inset -2px -2px 4px rgba(0,0,0,0.3), 5px 5px 10px rgba(0,0,0,0.4) !important; color: var(--clay-text-dim) !important; cursor: pointer !important; font-size: clamp(14px, 4vw, 18px) !important; display: flex !important; align-items: center !important; justify-content: center !important; font-weight: bold; transition: all 0.2s ease !important; opacity: 1 !important; }
        .vw-close-btn:active { box-shadow: inset 4px 4px 8px rgba(0,0,0,0.5), inset -2px -2px 4px rgba(255,255,255,0.05) !important; color: var(--clay-accent) !important; }
        .vw-navbar { display: flex !important; flex-wrap: wrap !important; justify-content: center !important; padding: clamp(15px, 4vw, 20px) !important; gap: 10px !important; }
        .vw-nav-btn { background: var(--clay-bg) !important; border: none !important; color: var(--clay-text-dim) !important; font-weight: 700 !important; font-size: clamp(11px, 3.5vw, 13px) !important; padding: 10px 16px !important; border-radius: 10px !important; cursor: pointer !important; box-shadow: 4px 4px 8px #121419, -4px -4px 8px #22242d !important; transition: all 0.2s !important; text-transform: uppercase; flex: 1 1 auto; text-align: center; opacity: 1 !important; }
        .vw-nav-btn.active { box-shadow: var(--neu-in) !important; color: var(--clay-accent) !important; border: 1px solid rgba(239,68,68,0.2); }
        .vw-body { padding: clamp(15px, 4vw, 25px) !important; display: flex !important; flex-direction: column !important; gap: 20px !important; flex: 1 1 auto !important; overflow-y: auto !important; }
        .vw-tab-content { display: none !important; flex-direction: column !important; gap: 20px !important; }
        .vw-tab-content.active { display: flex !important; animation: vw-fade-in 0.2s; }
        .vw-home-container { text-align: center; padding: 25px; background: var(--clay-bg); box-shadow: var(--neu-in); border-radius: 15px; border: 1px solid rgba(239,68,68,0.05); opacity: 1 !important; }
        .vw-home-container h2 { font-size: clamp(18px, 5vw, 22px); color: var(--clay-text); margin-bottom: 10px; font-weight: 800; text-transform: uppercase; }
        .vw-home-container p { font-size: clamp(13px, 3.5vw, 15px); color: var(--clay-text-dim); line-height: 1.5; font-weight: 600; }
        .vw-home-container .owner { margin-top: 15px; text-transform: uppercase; display: flex; align-items: center; justify-content: center; gap: 4px; }
        .owner-owner { color: #fbbf24; font-weight: 800; }
        .owner-at { color: #00ffff; font-weight: 800; }
        .owner-afk { font-weight: 800; background: linear-gradient(135deg, #ef4444, #ec4899); -webkit-background-clip: text; background-clip: text; color: transparent; }
        .owner-l0l { font-weight: 800; background: linear-gradient(135deg, #ec4899, #f472b6); -webkit-background-clip: text; background-clip: text; color: transparent; }
        .vw-row { display: flex !important; flex-wrap: wrap; justify-content: space-between !important; align-items: center !important; gap: 15px !important; padding: clamp(15px, 4vw, 20px) !important; border-radius: 15px !important; background: var(--clay-bg) !important; box-shadow: var(--neu-in) !important; border: 1px solid rgba(239,68,68,0.05); opacity: 1 !important; }
        .vw-row > div { flex: 1 1 100%; }
        @media (min-width: 450px) { .vw-row > div:first-child { flex: 1; } .vw-row > *:not(:first-child) { flex: 0 0 auto; } }
        .vw-label-title { font-size: clamp(14px, 4vw, 15px) !important; font-weight: 800 !important; color: var(--clay-text) !important; margin-bottom: 6px !important; text-transform: uppercase; letter-spacing: 0.5px; }
        .vw-label-desc { font-size: clamp(11px, 3vw, 12px) !important; color: var(--clay-text-dim) !important; font-weight: 600 !important; }
        .vw-key-status { margin-top: 15px; padding: 15px; border-radius: 10px; background: var(--clay-bg); box-shadow: var(--neu-out); font-size: 13px; font-weight: 700; text-align: center; color: var(--clay-text-dim); text-transform: uppercase; opacity: 1 !important; }
        .vw-key-status.valid { color: #4ade80; box-shadow: inset 2px 2px 4px rgba(74,222,128,0.05), var(--neu-out); border: 1px solid rgba(74,222,128,0.2); }
        .vw-key-status.invalid { color: var(--clay-accent); border: 1px solid rgba(239,68,68,0.2); }
        .vw-toggle { position: relative !important; display: inline-block !important; width: 56px !important; height: 30px !important; }
        .vw-toggle input { opacity: 0 !important; width: 0 !important; height: 0 !important; }
        .vw-toggle-slider { position: absolute !important; inset: 0 !important; background-color: var(--clay-bg) !important; box-shadow: inset 3px 3px 6px #121419, inset -3px -3px 6px #22242d !important; border-radius: 30px !important; transition: .3s !important; cursor: pointer; opacity: 1 !important; }
        .vw-toggle-slider:before { position: absolute !important; content: "" !important; height: 22px !important; width: 22px !important; left: 4px !important; bottom: 4px !important; background-color: #ef4444 !important; box-shadow: 2px 2px 5px rgba(0,0,0,0.5) !important; border-radius: 50% !important; transition: .3s !important; }
        input:checked + .vw-toggle-slider:before { transform: translateX(26px) !important; background-color: #4ade80 !important; }
        .vw-actions { display: flex !important; justify-content: flex-end !important; gap: 10px !important; margin-top: auto !important; flex-wrap: wrap; }
        .vw-btn-action { flex: 1 1 auto; text-align: center; padding: 14px 20px !important; border-radius: 10px !important; border: none !important; background: var(--clay-bg) !important; box-shadow: inset 2px 2px 4px rgba(255,255,255,0.05), inset -2px -2px 4px rgba(0,0,0,0.3), 4px 4px 8px rgba(0,0,0,0.4) !important; color: var(--clay-text) !important; font-weight: 800 !important; font-size: clamp(12px, 3.5vw, 14px) !important; cursor: pointer !important; transition: all 0.2s ease !important; font-family: 'Orbitron', sans-serif !important; text-transform: uppercase; letter-spacing: 1px; opacity: 1 !important; display: flex !important; align-items: center !important; justify-content: center !important; gap: 8px !important; }
        .vw-btn-action:active { box-shadow: inset 4px 4px 8px rgba(0,0,0,0.5), inset -2px -2px 4px rgba(255,255,255,0.05) !important; transform: translateY(2px) !important; color: var(--clay-accent) !important; }
        .vw-console { height: clamp(200px, 40vh, 300px) !important; overflow-y: auto !important; background: var(--clay-bg) !important; border-radius: 15px !important; padding: 20px !important; font-family: 'Courier New', monospace !important; font-size: clamp(11px, 3vw, 13px) !important; box-shadow: var(--neu-in) !important; word-break: break-word; border: 1px solid rgba(239,68,68,0.1); opacity: 1 !important; }
        .vw-supported-list { display: flex; flex-direction: column; gap: 8px; background: var(--clay-bg); box-shadow: var(--neu-in); border-radius: 15px; padding: 20px; border: 1px solid rgba(239,68,68,0.05); opacity: 1 !important; }
        .vw-domain-item { display: flex; align-items: center; gap: 10px; padding: 8px 0; border-bottom: 1px solid rgba(239,68,68,0.1); }
        .vw-domain-item:last-child { border-bottom: none; }
        .vw-domain-name { font-size: 13px; font-weight: 600; color: var(--clay-text); text-transform: lowercase; }
        .vw-domain-note { font-size: 11px; color: var(--clay-text-dim); margin-left: 5px; }
    `;
    const host = document.createElement('div'); host.id = 'vw-settings-shadow-host';
    host.style.cssText = 'all:initial;position:fixed;inset:0;z-index:2147483647;pointer-events:none;isolation:isolate;background:transparent;';
    const shadow = host.attachShadow({mode:'closed'});
    GM_addStyle(SETTINGS_CSS);
    const style = document.createElement('style'); style.textContent = SETTINGS_CSS; shadow.appendChild(style);
    const btn = document.createElement('button'); btn.className = 'vw-settings-btn';
    btn.innerHTML = `<span>${EMOJI.COG}</span> Settings`;
    shadow.appendChild(btn);
    const backdrop = document.createElement('div'); backdrop.className = 'vw-backdrop';
    backdrop.innerHTML = `
        <div class="vw-panel">
            <div class="vw-header"><div class="vw-title"><img src="${ICON_URL}"> Settings</div><button class="vw-close-btn">&times;</button></div>
            <div class="vw-navbar">
                <button class="vw-nav-btn active" data-target="home">Home</button>
                <button class="vw-nav-btn" data-target="key">Key</button>
                <button class="vw-nav-btn" data-target="redirect">Redirect</button>
                <button class="vw-nav-btn" data-target="supported">Supported</button>
                <button class="vw-nav-btn" data-target="console">Console</button>
            </div>
            <div class="vw-body">
                <div id="tab-home" class="vw-tab-content active">
                    <div class="vw-home-container"><h2>VortixWorld Settings.</h2><p>For API key, AutoRedirect, Console Logs</p><br><p class="owner"><span>${EMOJI.CROWN}</span><span class="owner-owner">OWNER</span> <span class="owner-at">@</span><span class="owner-afk">AFK</span><span class="owner-l0l">.L0L</span></p></div>
                </div>
                <div id="tab-key" class="vw-tab-content">
                    <div class="vw-row"><div><div class="vw-label-title">API Key Status</div><div class="vw-label-desc">Current VortixWorld API key</div></div></div>
                    <div id="vwKeyStatus" class="vw-key-status">Status: Checking...</div>
                    <div class="vw-actions"><button class="vw-btn-action" id="vwRefreshKeyBtn">Refresh Status</button></div>
                </div>
                <div id="tab-redirect" class="vw-tab-content">
                    <div class="vw-row"><div><div class="vw-label-title">Auto Redirect</div><div class="vw-label-desc">Automatically redirect when bypass completes</div></div><label class="vw-toggle"><input type="checkbox" id="vwAutoToggle"><span class="vw-toggle-slider"></span></label></div>
                    <div class="vw-row"><div><div class="vw-label-title">Redirect Delay (Seconds)</div><input type="number" id="vwDelayInput" class="vw-input" placeholder="0" min="0" max="60"></div></div>
                    <div class="vw-actions"><button class="vw-btn-action" id="vwSaveRedirectBtn">Save Settings</button></div>
                </div>
                <div id="tab-supported" class="vw-tab-content">
                    <div class="vw-supported-list">
                        <div class="vw-domain-item"><span class="vw-domain-name">admaven.com</span></div>
                        <div class="vw-domain-item"><span class="vw-domain-name">auth.platorelay.com</span></div>
                        <div class="vw-domain-item"><span class="vw-domain-name">beta.shortearn.eu</span></div>
                        <div class="vw-domain-item"><span class="vw-domain-name">cuty.io</span></div>
                        <div class="vw-domain-item"><span class="vw-domain-name">fast-links.org</span></div>
                        <div class="vw-domain-item"><span class="vw-domain-name">hydrogen.lat</span></div>
                        <div class="vw-domain-item"><span class="vw-domain-name">links-lootlabs.gg</span></div>
                        <div class="vw-domain-item"><span class="vw-domain-name">linkvertise.com</span><span class="vw-domain-note">(all domains)</span></div>
                        <div class="vw-domain-item"><span class="vw-domain-name">lockr.so</span></div>
                        <div class="vw-domain-item"><span class="vw-domain-name">lootlinks</span><span class="vw-domain-note">(all domains)</span></div>
                        <div class="vw-domain-item"><span class="vw-domain-name">mboost.me</span></div>
                        <div class="vw-domain-item"><span class="vw-domain-name">new.pandadevelopment.net</span></div>
                        <div class="vw-domain-item"><span class="vw-domain-name">ouo.io</span></div>
                        <div class="vw-domain-item"><span class="vw-domain-name">pandadevelopment.net</span></div>
                        <div class="vw-domain-item"><span class="vw-domain-name">rapid-links.com</span><span class="vw-domain-note">(all domains)</span></div>
                        <div class="vw-domain-item"><span class="vw-domain-name">rekonise.com</span></div>
                        <div class="vw-domain-item"><span class="vw-domain-name">shortearn.eu</span></div>
                        <div class="vw-domain-item"><span class="vw-domain-name">spdmteam.com</span><span class="vw-domain-note">(Arceus key system)</span></div>
                        <div class="vw-domain-item"><span class="vw-domain-name">tpi.li</span></div>
                        <div class="vw-domain-item"><span class="vw-domain-name">work.ink</span></div>
                        <div class="vw-domain-item"><span class="vw-domain-name">draculahub.xyz</span><span class="vw-domain-note">(LootLabs key)</span></div>
                    </div>
                </div>
                <div id="tab-console" class="vw-tab-content">
                    <div class="vw-console" id="vwConsoleLogs"></div>
                    <div class="vw-actions"><button class="vw-btn-action" id="vwCopyConsoleBtn"><span>${EMOJI.COPY}</span> Copy Logs</button><button class="vw-btn-action" id="vwClearConsoleBtn" style="color:var(--clay-accent);">Clear</button></div>
                </div>
            </div>
        </div>
    `;
    shadow.appendChild(backdrop);
    const closeBtn = shadow.querySelector('.vw-close-btn');
    const navBtns = shadow.querySelectorAll('.vw-nav-btn');
    const tabs = shadow.querySelectorAll('.vw-tab-content');
    const autoToggle = shadow.querySelector('#vwAutoToggle');
    const delayInput = shadow.querySelector('#vwDelayInput');
    const keyStatusEl = shadow.querySelector('#vwKeyStatus');

    async function updateKeyStatusUI() {
        keyStatusEl.className = 'vw-key-status';
        keyStatusEl.innerText = 'STATUS: CHECKING...';
        if (!HARDCODED_KEY) { keyStatusEl.innerText = 'STATUS: NO KEY SET'; keyStatusEl.classList.add('invalid'); return; }
        try {
            const res = await new Promise((res,rej)=> GM_xmlhttpRequest({ method:'GET', url:`${KEY_VALIDATION_URL.replace('/validate','/info')}/${HARDCODED_KEY}`, onload:res, onerror:rej }));
            const data = JSON.parse(res.responseText);
            if (data.valid) { keyStatusEl.classList.add('valid'); keyStatusEl.innerText = `STATUS: VALID (EXPIRES IN ${(d=>{if(!d)return'Unknown';const n=Math.floor(Date.now()/1000),df=d-n;if(df<=0)return'Expired';const day=Math.floor(df/86400),h=Math.floor((df%86400)/3600);return day>0?`${day}d ${h}h`:h>0?`${h}h ${Math.floor((df%3600)/60)}m`:`${Math.floor(df/60)}m`})(data.expires_at)})`; }
            else { keyStatusEl.classList.add('invalid'); keyStatusEl.innerText = 'STATUS: INVALID OR EXPIRED'; }
        } catch(e) { keyStatusEl.innerText = 'STATUS: NETWORK ERROR'; keyStatusEl.classList.add('invalid'); }
    }

    (async () => {
        const stored = await GM_storage.get(['vw_auto_redirect','vw_redirect_delay','vw_settings_pos']);
        autoToggle.checked = stored.vw_auto_redirect !== false;
        delayInput.value = stored.vw_redirect_delay || 0;
        updateKeyStatusUI();
        if (stored.vw_settings_pos) { btn.style.left = stored.vw_settings_pos.left; btn.style.bottom = stored.vw_settings_pos.bottom; btn.style.right='auto'; btn.style.top='auto'; }
    })();

    btn.onclick = () => backdrop.classList.add('open');
    closeBtn.onclick = () => backdrop.classList.remove('open');
    backdrop.onclick = e => { if(e.target===backdrop) backdrop.classList.remove('open'); };
    navBtns.forEach(b => b.onclick = () => { navBtns.forEach(n=>n.classList.remove('active')); tabs.forEach(t=>t.classList.remove('active')); b.classList.add('active'); shadow.querySelector(`#tab-${b.dataset.target}`).classList.add('active'); if(b.dataset.target==='key') updateKeyStatusUI(); });
    shadow.querySelector('#vwRefreshKeyBtn').onclick = () => updateKeyStatusUI();
    shadow.querySelector('#vwSaveRedirectBtn').onclick = () => GM_storage.set({ [VW_KEYS.autoRedirect]: autoToggle.checked, [VW_KEYS.redirectDelay]: parseInt(delayInput.value||'0',10) }).then(()=>alert('Settings Saved!'));
    shadow.querySelector('#vwClearConsoleBtn').onclick = () => { window.__vw_logs = []; shadow.querySelector('#vwConsoleLogs').innerHTML = ''; };
    shadow.querySelector('#vwCopyConsoleBtn').onclick = async () => {
        const logs = window.__vw_logs || [], text = logs.map(l=>`[${l.timestamp}] [${l.level.toUpperCase()}] ${l.message} ${l.data}`).join('\n');
        try { await navigator.clipboard.writeText(text); const b = shadow.querySelector('#vwCopyConsoleBtn'); b.innerHTML = `<span>${EMOJI.CHECK}</span> Copied!`; setTimeout(()=>b.innerHTML=`<span>${EMOJI.COPY}</span> Copy Logs`,2000); } catch(e){}
    };
    setInterval(() => {
        if (!backdrop.classList.contains('open') || !shadow.querySelector('#tab-console').classList.contains('active')) return;
        const logsEl = shadow.querySelector('#vwConsoleLogs');
        if (logsEl) {
            logsEl.innerHTML = (window.__vw_logs||[]).map(l=>{
                let color = '#4ade80'; if(l.level==='error')color='#ef4444'; else if(l.level==='warn')color='#fbbf24'; else if(l.level==='websocket')color='#c084fc'; else if(l.level==='network')color='#60a5fa';
                return `<div style="margin-bottom:5px;"><span style="color:${color};font-weight:bold;">[${l.level.toUpperCase()}]</span> <span style="color:var(--clay-text)">${l.message}</span> <span style="color:var(--clay-text-dim)">${l.data}</span></div>`;
            }).join('');
        }
    }, 1000);

    let dragging = false, startX, startY, startLeft, startBottom;
    btn.addEventListener('mousedown', e => { if(e.button!==0)return; dragging=true; startX=e.clientX; startY=e.clientY; const r=btn.getBoundingClientRect(); startLeft=r.left; startBottom=window.innerHeight-r.bottom; btn.style.cursor='grabbing'; e.preventDefault(); });
    window.addEventListener('mousemove', e => { if(!dragging)return; let l=startLeft+(e.clientX-startX), b=startBottom-(e.clientY-startY); l=Math.max(0,Math.min(window.innerWidth-btn.offsetWidth,l)); b=Math.max(0,Math.min(window.innerHeight-btn.offsetHeight,b)); btn.style.left=l+'px'; btn.style.bottom=b+'px'; btn.style.right='auto'; btn.style.top='auto'; });
    window.addEventListener('mouseup', () => { if(dragging) { dragging=false; btn.style.cursor='grab'; GM_storage.set({ vw_settings_pos: { left: btn.style.left, bottom: btn.style.bottom } }); } });
    document.documentElement.appendChild(host);
}