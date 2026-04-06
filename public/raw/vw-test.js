;(function () {
  'use strict'

  if (window.top !== window.self) return

  const VW_SETTINGS_ID = 'vw-settings-shadow-host'
  const ICON_URL = 'https://i.ibb.co/LdshK1fR/461-F6268-08-F3-4-E8A-BC73-409218-A3-F168.jpg'

  const keys = {
    autoRedirect: 'vw_auto_redirect',
    userAgent: 'vw_user_agent'
  }

  const UA_LIST = {
    "Default": navigator.userAgent,
    "PC - Chrome (Windows)": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "PC - Firefox (Windows)": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0",
    "PC - Safari (Mac)": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3.1 Safari/605.1.15",
    "Android - Chrome (S24)": "Mozilla/5.0 (Linux; Android 14; SM-S928B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.64 Mobile Safari/537.36",
    "Android - Pixel 8": "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.90 Mobile Safari/537.36",
    "Android - Opera Mobile": "Mozilla/5.0 (Linux; Android 14; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.64 Mobile Safari/537.36 OPR/79.0.4135.76261",
    "iOS - iPhone 15 Pro": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3.1 Mobile/15E148 Safari/604.1",
    "iOS - iPad Pro": "Mozilla/5.0 (iPad; CPU OS 17_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3.1 Mobile/15E148 Safari/604.1",
    "iOS - iPhone 14": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1"
  }

  const SETTINGS_CSS = `
    :host { all: initial; position: fixed !important; inset: 0 !important; z-index: 2147483647 !important; pointer-events: none !important; isolation: isolate !important; }
    .vw-gear-btn { position: fixed !important; left: calc(14px + env(safe-area-inset-left)) !important; bottom: calc(14px + env(safe-area-inset-bottom)) !important; z-index: 2147483647 !important; width: 48px !important; height: 48px !important; border-radius: 24px !important; border: none !important; background: #1e1e1e !important; box-shadow: 4px 4px 8px #141414, -4px -4px 8px #282828 !important; color: #e0e0e0 !important; font-size: 22px !important; display: flex !important; align-items: center !important; justify-content: center !important; cursor: pointer !important; pointer-events: auto !important; }
    .vw-backdrop { position: fixed !important; inset: 0 !important; background: rgba(0, 0, 0, 0.6) !important; display: none !important; align-items: center !important; justify-content: center !important; pointer-events: auto !important; }
    .vw-backdrop.open { display: flex !important; }
    .vw-panel { width: min(520px, calc(100vw - 28px)) !important; border-radius: 28px !important; background: #1e1e1e !important; box-shadow: 10px 10px 20px #141414, -10px -10px 20px #282828 !important; color: #e0e0e0 !important; font-family: Inter, system-ui, sans-serif !important; overflow: hidden; display: flex; flex-direction: column; }
    .vw-header { padding: 16px 18px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 4px 8px -4px #141414; }
    .vw-title { font-weight: 800; font-size: 18px; display: flex; align-items: center; gap: 12px; }
    .vw-title img { width: 32px; height: 32px; border-radius: 12px; }
    .vw-body { padding: 18px; display: flex; flex-direction: column; gap: 16px; overflow-y: auto; }
    .vw-row { display: flex; flex-direction: column; gap: 10px; padding: 16px; border-radius: 20px; box-shadow: inset 4px 4px 8px #141414, inset -4px -4px 8px #282828; }
    .vw-row-split { display: flex; flex-direction: row !important; justify-content: space-between; align-items: center; }
    .vw-label-title { font-size: 14px; font-weight: 800; }
    .vw-label-desc { font-size: 12px; color: #a0a0a0; }
    .vw-select { background: #1e1e1e; color: #e0e0e0; border: none; padding: 8px 12px; border-radius: 12px; box-shadow: 3px 3px 6px #141414, -3px -3px 6px #282828; width: 100%; outline: none; font-size: 13px; }
    .vw-toggle { position: relative; width: 50px; height: 26px; }
    .vw-toggle input { opacity: 0; width: 100%; height: 100%; cursor: pointer; position: absolute; z-index: 2; }
    .vw-toggle-slider { position: absolute; inset: 0; background: #1e1e1e; box-shadow: inset 3px 3px 6px #141414, inset -3px -3px 6px #282828; transition: 0.25s; border-radius: 999px; }
    .vw-toggle-slider:before { content: ""; position: absolute; height: 18px; width: 18px; left: 4px; bottom: 4px; background: #ef4444; transition: 0.25s; border-radius: 50%; }
    input:checked + .vw-toggle-slider:before { transform: translateX(24px); background: #4ade80; }
    .vw-actions { display: flex; gap: 12px; justify-content: flex-end; padding: 10px 0; }
    .vw-btn { padding: 10px 18px; border-radius: 40px; border: none; background: #1e1e1e; box-shadow: 4px 4px 8px #141414, -4px -4px 8px #282828; color: #e0e0e0; font-weight: 700; cursor: pointer; }
    .vw-btn:active { box-shadow: inset 4px 4px 8px #141414, inset -4px -4px 8px #282828; }
    .vw-hidden { display: none !important; }
  `

  function getStoredValue(key, defaultValue) {
    try {
      const val = localStorage.getItem(key);
      if (val === null) return defaultValue;
      if (typeof defaultValue === 'boolean') return val === 'true';
      return val;
    } catch (_) { return defaultValue; }
  }

  function setStoredValue(key, value) {
    try { localStorage.setItem(key, String(value)); } catch (_) {}
  }

  function createSettingsUI() {
    if (document.getElementById(VW_SETTINGS_ID)) return;
    const host = document.createElement('div');
    host.id = VW_SETTINGS_ID;
    const shadow = host.attachShadow({ mode: 'closed' });
    const style = document.createElement('style');
    style.textContent = SETTINGS_CSS;
    shadow.appendChild(style);

    const gearBtn = document.createElement('button');
    gearBtn.className = 'vw-gear-btn';
    gearBtn.textContent = '⚙️';
    shadow.appendChild(gearBtn);

    const backdrop = document.createElement('div');
    backdrop.className = 'vw-backdrop';
    backdrop.innerHTML = `
      <div class="vw-panel">
        <div class="vw-header">
          <div class="vw-title"><img src="${ICON_URL}"><span>Settings</span></div>
          <button class="vw-close" style="background:none;border:none;color:#aaa;cursor:pointer;font-size:20px;">✕</button>
        </div>
        <div class="vw-body">
          <div class="vw-row vw-row-split">
            <div class="vw-label">
              <div class="vw-label-title">Auto Redirect</div>
              <div class="vw-label-desc">Automatic redirect on complete</div>
            </div>
            <label class="vw-toggle"><input type="checkbox" id="vwAutoToggle"><span class="vw-toggle-slider"></span></label>
          </div>
          <div class="vw-row">
            <div class="vw-label">
              <div class="vw-label-title">User Agent Spoofer</div>
              <div class="vw-label-desc">Select device profile for bypass</div>
            </div>
            <select class="vw-select" id="vwUASelect"></select>
          </div>
          <div class="vw-actions">
            <button class="vw-btn" id="vwReloadBtn">Reload</button>
            <button class="vw-btn" id="vwApplyBtn" style="color:#4ade80">Save Settings</button>
          </div>
        </div>
      </div>
    `;
    shadow.appendChild(backdrop);

    const uaSelect = shadow.querySelector('#vwUASelect');
    Object.keys(UA_LIST).forEach(name => {
      const opt = document.createElement('option');
      opt.value = UA_LIST[name];
      opt.textContent = name;
      uaSelect.appendChild(opt);
    });

    const load = () => {
      shadow.querySelector('#vwAutoToggle').checked = getStoredValue(keys.autoRedirect, true);
      uaSelect.value = getStoredValue(keys.userAgent, UA_LIST["Default"]);
    };

    const save = () => {
      setStoredValue(keys.autoRedirect, shadow.querySelector('#vwAutoToggle').checked);
      setStoredValue(keys.userAgent, uaSelect.value);
    };

    gearBtn.onclick = () => { load(); backdrop.classList.add('open'); };
    shadow.querySelector('.vw-close').onclick = () => backdrop.classList.remove('open');
    shadow.querySelector('#vwApplyBtn').onclick = () => { save(); backdrop.classList.remove('open'); location.reload(); };
    shadow.querySelector('#vwReloadBtn').onclick = () => location.reload();
    
    document.documentElement.appendChild(host);
  }

  createSettingsUI();
  setInterval(() => { if(!document.getElementById(VW_SETTINGS_ID)) createSettingsUI(); }, 2000);
})();
