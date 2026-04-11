let autoLuaActive = false;
let autoLuaTimers = [];
let clickedButtons = new Set();
let btnClicked = false;

function clearAutoLuaTimeouts() {
  autoLuaTimers.forEach(clearTimeout);
  autoLuaTimers = [];
}

function removeAutoLuaUI() {
  const ui = document.getElementById('autoLuaUI');
  if (ui) ui.remove();
}

function triggerNativeLuarmor(btnId) {
  const scriptContent = `
    try {
      const btn = document.getElementById('${btnId}');
      if (btn) {
        if (typeof k !== 'undefined' && k.event && typeof k.event.dispatch === 'function') {
          const mockEvent = { target: btn, type: 'click', preventDefault: () => {}, stopPropagation: () => {} };
          k.event.dispatch.call(btn, mockEvent);
        } else {
          btn.click();
        }
      }
    } catch (e) { }
  `;
  const script = document.createElement('script');
  script.textContent = scriptContent;
  (document.head || document.documentElement).appendChild(script);
  script.remove();
}

function isBlocked() {
  const blacklist = document.querySelector('.swal2-x-mark');
  const loader = document.querySelector('.loader');
  const captcha = document.getElementById('captchafield');
  if (blacklist && blacklist.offsetParent !== null) return { type: "blacklist", blocked: true };
  if (loader && loader.offsetParent !== null) return { type: "loader", blocked: true };
  if (captcha && captcha.offsetParent !== null) return { type: "captcha", blocked: true };
  return { type: null, blocked: false };
}

function checkProgress() {
  if (!autoLuaActive) return;
  if (isBlocked().blocked) {
    autoLuaTimers.push(setTimeout(checkProgress, 500));
    return;
  }
  const prog = document.getElementById('adprogressp');
  if (prog) {
    const match = prog.textContent.match(/(\d+)\/(\d+)/);
    if (match && match[1] === match[2]) {
      const key = document.querySelector('h6.mb-0.text-sm')?.textContent.trim();
      const btn = document.getElementById(`addtimebtn_${key}`) || document.getElementById('newkeybtn');
      if (btn && !btn.disabled) {
        if (!clickedButtons.has(btn.id)) {
          clickedButtons.add(btn.id);
          triggerNativeLuarmor(btn.id);
          if (btn.id === 'newkeybtn') {
            stopAutoLuarmor();
            return;
          }
        }
      }
    }
  }
  autoLuaTimers.push(setTimeout(checkProgress, 500));
}

function waitForButtonToBeClickable() {
  if (!autoLuaActive || btnClicked) return;
  if (isBlocked().blocked) {
    autoLuaTimers.push(setTimeout(waitForButtonToBeClickable, 500));
    return;
  }
  const btn = document.getElementById('nextbtn');
  if (btn && btn.offsetParent !== null && !(btn.style.cursor === 'not-allowed' || btn.disabled)) {
    if (!clickedButtons.has('nextbtn')) {
      clickedButtons.add('nextbtn');
      triggerNativeLuarmor('nextbtn');
      btnClicked = true;
    }
  }
  autoLuaTimers.push(setTimeout(waitForButtonToBeClickable, 500));
}

async function startAutoLuarmor() {
  if (autoLuaActive) return;
  if (!window.location.hostname.includes('luarmor.net')) {
    if (typeof showToast === 'function') showToast('Auto Luarmor only works on luarmor.net', true);
    return;
  }
  if (typeof showToast === 'function') showToast('Checking API key...', false, '🔑');
  const isValid = typeof validateStoredKey === 'function' ? await validateStoredKey() : true;
  if (!isValid) {
    if (typeof showToast === 'function') showToast('API key invalid/expired. Auto Luarmor disabled.', true, typeof ERROR_JPG !== 'undefined' ? ERROR_JPG : null);
    return;
  }
  if (typeof showToast === 'function') showToast('Key valid. Auto Luarmor starting...', false, typeof SUCCESS_GIF !== 'undefined' ? SUCCESS_GIF : null);

  autoLuaActive = true;
  localStorage.setItem('vw_auto_luarmor_active', 'true');
  clickedButtons.clear();
  btnClicked = false;
  const ui = document.getElementById('autoLuaUI');
  if (ui) {
    const startStopBtn = ui.querySelector("#startStopBtn");
    const statusSpan = ui.querySelector("#autoStatus");
    if (startStopBtn) {
      startStopBtn.textContent = "Stop";
      startStopBtn.style.color = "#ef4444";
    }
    if (statusSpan) {
      statusSpan.style.color = "#4ade80";
      statusSpan.textContent = "● Running";
    }
  }
  clearAutoLuaTimeouts();
  checkProgress();
  waitForButtonToBeClickable();
}

function stopAutoLuarmor() {
  if (!autoLuaActive) return;
  autoLuaActive = false;
  localStorage.setItem('vw_auto_luarmor_active', 'false');
  clearAutoLuaTimeouts();
  const ui = document.getElementById('autoLuaUI');
  if (ui) {
    const startStopBtn = ui.querySelector("#startStopBtn");
    const statusSpan = ui.querySelector("#autoStatus");
    if (startStopBtn) {
      startStopBtn.textContent = "Start";
      startStopBtn.style.color = "#e0e0e0";
    }
    if (statusSpan) {
      statusSpan.style.color = "#a0a0a0";
      statusSpan.textContent = "● Idle";
    }
  }
}

function initAutoLuarmorUI() {
  if (!window.location.hostname.includes('luarmor.net')) {
    removeAutoLuaUI();
    return;
  }
  if (document.getElementById('autoLuaUI')) return;
  const ui = document.createElement("div");
  ui.id = "autoLuaUI";
  ui.style.cssText = `position:fixed;top:15px;left:50%;transform:translateX(-50%);width:max-content;min-width:280px;background:#1e1e1e;color:#e0e0e0;font-family:Poppins,Arial,sans-serif;z-index:2147483647;font-size:14px;box-shadow:6px 6px 12px #141414, -6px -6px 12px #282828;border-radius:50px;`;
  ui.innerHTML = `
    <style>
      #autoLuaUI .top-bar { display:flex; justify-content:space-between; align-items:center; padding:10px 18px; width:100%; }
      #autoLuaUI .title { font-size:15px; font-weight:700; color:#e0e0e0; margin-right:15px; text-shadow: 1px 1px 2px #141414; }
      #autoLuaUI .control-btn { background:#1e1e1e; box-shadow:3px 3px 6px #141414, -3px -3px 6px #282828; color:#e0e0e0; border:none; padding:8px 20px; border-radius:40px; font-size:13px; font-weight:600; cursor:pointer; transition:all 0.2s; }
      #autoLuaUI .control-btn:active { box-shadow:inset 3px 3px 6px #141414, inset -3px -3px 6px #282828; }
    </style>
    <div class="top-bar">
      <div class="title">⚡ Auto Lua</div>
      <div style="display:flex; align-items:center;">
        <span id="autoStatus" style="font-size:12px; margin-right:12px; color:#a0a0a0; font-weight:600;">● Idle</span>
        <button id="startStopBtn" class="control-btn">Start</button>
      </div>
    </div>`;

  const appendUiSafely = () => {
    document.body.appendChild(ui);
    const startStopBtn = ui.querySelector("#startStopBtn");
    if (localStorage.getItem('vw_auto_luarmor_active') === 'true') {
      startAutoLuarmor();
    } else {
      stopAutoLuarmor();
    }
    startStopBtn.onclick = () => {
      if (autoLuaActive) stopAutoLuarmor();
      else startAutoLuarmor();
    };
  };

  if (document.body) {
    appendUiSafely();
  } else {
    document.addEventListener('DOMContentLoaded', appendUiSafely);
  }
}

function runAutoLuarmor() {
  if (!window.location.hostname.includes('luarmor.net')) {
    removeAutoLuaUI();
    return;
  }
  localStorage.setItem('ppaccepted', 'true');
  localStorage.setItem('trufflemayo', '1455660788512591984;87f07b547f1faf3d115b1592ddf41b25');
  initAutoLuarmorUI();
}

window.runAutoLuarmor = runAutoLuarmor;
window.removeAutoLuaUI = removeAutoLuaUI;