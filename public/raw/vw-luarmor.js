let autoLuaActive = false
let autoLuaNavAttempted = false
let autoLuaTimers = []
let clickedButtons = new Set()
let startDelayTimer = null

function clearAutoLuaTimeouts() {
  autoLuaTimers.forEach(clearTimeout)
  autoLuaTimers = []
  if (startDelayTimer) {
    clearTimeout(startDelayTimer)
    startDelayTimer = null
  }
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

function checkProgress() {
  if (!autoLuaActive) return;
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
  autoLuaTimers.push(setTimeout(checkProgress, 1000));
}

function attemptNext() {
  if (!autoLuaActive || autoLuaNavAttempted) return;
  const btn = document.getElementById('nextbtn');
  if (btn && btn.offsetParent !== null && !btn.disabled && btn.style.cursor !== 'not-allowed') {
      if (!clickedButtons.has('nextbtn')) {
          clickedButtons.add('nextbtn');
          Logger.info('AutoLuarmor', 'Triggering native dispatch for nextbtn');
          triggerNativeLuarmor('nextbtn');
          autoLuaNavAttempted = true;
          return;
      }
  }
  autoLuaTimers.push(setTimeout(attemptNext, 600));
}

async function startAutoLuarmor() {
  if (autoLuaActive) return;
  showToast('Checking API key...', false);
  const isValid = await validateStoredKey();
  if (!isValid) {
    showToast('API key invalid/expired. Auto Luarmor disabled.', true);
    return;
  }
  showToast('Key valid. Starting Auto Luarmor in 5s...', false);
  autoLuaActive = true;
  localStorage.setItem('vw_auto_luarmor_active', 'true');
  autoLuaNavAttempted = false;
  clickedButtons.clear();
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
      statusSpan.textContent = "● Starting in 5s...";
    }
  }
  clearAutoLuaTimeouts();
  startDelayTimer = setTimeout(() => {
    const ui = document.getElementById('autoLuaUI');
    if (ui) {
      const statusSpan = ui.querySelector("#autoStatus");
      if (statusSpan) statusSpan.textContent = "● Running";
    }
    checkProgress();
    attemptNext();
    startDelayTimer = null;
  }, 5000);
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
  localStorage.setItem('ppaccepted', 'true');
  localStorage.setItem('trufflemayo', '1455660788512591984;87f07b547f1faf3d115b1592ddf41b25');
  initAutoLuarmorUI();
}

window.runAutoLuarmor = runAutoLuarmor;