(function () {
  'use strict'

  let autoLuaActive = false
  let autoLuaNavAttempted = false
  let autoLuaTimers = []

  function clearAutoLuaTimeouts() {
    autoLuaTimers.forEach(clearTimeout)
    autoLuaTimers = []
  }

  function triggerNativeLuarmor(btnId) {
    const scriptContent = `
      try {
        const btn = document.getElementById('${btnId}');
        if (btn) {
          if (typeof k !== 'undefined' && k.event && typeof k.event.dispatch === 'function') {
            console.log('[AutoLuarmor] Found k.event.dispatch, triggering...');
            const mockEvent = { target: btn, type: 'click', preventDefault: () => {}, stopPropagation: () => {} };
            k.event.dispatch.call(btn, mockEvent);
          } else {
            btn.click();
          }
        }
      } catch (e) { console.error('Native trigger failed:', e); }
    `
    const script = document.createElement('script')
    script.textContent = scriptContent
    ;(document.head || document.documentElement).appendChild(script)
    script.remove()
  }

  function checkProgress() {
    const prog = document.getElementById('adprogressp')
    if (!prog) return
    const match = prog.textContent.match(/(\d+)\/(\d+)/)
    if (match && match[1] === match[2]) {
      const key = document.querySelector('h6.mb-0.text-sm')?.textContent.trim()
      const btn = document.getElementById(`addtimebtn_${key}`) || document.getElementById('newkeybtn')
      if (btn && !btn.disabled) triggerNativeLuarmor(btn.id)
    }
  }

  function attemptNext() {
    if (!autoLuaActive || autoLuaNavAttempted) return
    const btn = document.getElementById('nextbtn')
    if (btn && btn.offsetParent !== null && !btn.disabled && btn.style.cursor !== 'not-allowed') {
      console.log('[AutoLuarmor] Triggering native dispatch for nextbtn')
      triggerNativeLuarmor('nextbtn')
      autoLuaNavAttempted = true
      autoLuaTimers.push(setTimeout(() => {
        if (autoLuaActive && window.location.href === window.location.href) {
          console.log('[AutoLuarmor] Redirect delayed, retrying...')
          autoLuaNavAttempted = false
          attemptNext()
        }
      }, 3000))
    } else {
      autoLuaTimers.push(setTimeout(attemptNext, 600))
    }
  }

  function startAutoLuarmor() {
    if (autoLuaActive) return
    autoLuaActive = true
    localStorage.setItem('autoLua_isActive', 'true')
    autoLuaNavAttempted = false
    const ui = document.getElementById('autoLuaUI')
    if (ui) {
      const startStopBtn = ui.querySelector("#startStopBtn")
      const statusSpan = ui.querySelector("#autoStatus")
      if (startStopBtn) startStopBtn.textContent = "Stop"
      if (statusSpan) {
        statusSpan.style.color = "#4ade80"
        statusSpan.textContent = "● Running"
      }
    }
    checkProgress()
    attemptNext()
  }

  function stopAutoLuarmor() {
    if (!autoLuaActive) return
    autoLuaActive = false
    localStorage.setItem('autoLua_isActive', 'false')
    clearAutoLuaTimeouts()
    const ui = document.getElementById('autoLuaUI')
    if (ui) {
      const startStopBtn = ui.querySelector("#startStopBtn")
      const statusSpan = ui.querySelector("#autoStatus")
      if (startStopBtn) startStopBtn.textContent = "Start"
      if (statusSpan) {
        statusSpan.style.color = "#aaa"
        statusSpan.textContent = "● Idle"
      }
    }
  }

  function initAutoLuarmorUI() {
    if (document.getElementById('autoLuaUI')) return

    const ui = document.createElement("div")
    ui.id = "autoLuaUI"
    ui.style.cssText = `position:fixed;top:15px;left:50%;transform:translateX(-50%);width:max-content;min-width:280px;background:rgba(13,13,13,0.85);color:#fff;font-family:Poppins,Arial,sans-serif;z-index:2147483647;font-size:14px;box-shadow:0 4px 15px rgba(0,0,0,0.5);border:1px solid #333;border-radius:50px;backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);`

    ui.innerHTML = `
      <style>
        #autoLuaUI .top-bar { display:flex; justify-content:space-between; align-items:center; padding:8px 16px; width:100%; }
        #autoLuaUI .title { font-size:15px; font-weight:600; background:linear-gradient(135deg, #ccc, #fff); -webkit-background-clip:text; -webkit-text-fill-color:transparent; margin-right:15px; }
        #autoLuaUI .control-btn { background:#333; color:#fff; border:none; padding:6px 16px; border-radius:40px; font-size:13px; cursor:pointer; transition:all 0.2s; }
        #autoLuaUI .control-btn:hover { background:#555; }
      </style>
      <div class="top-bar">
        <div class="title">⚡ Auto Lua</div>
        <div style="display:flex; align-items:center;">
          <span id="autoStatus" style="font-size:11px; margin-right:10px; color:#aaa;">● Idle</span>
          <button id="startStopBtn" class="control-btn">Start</button>
        </div>
      </div>`

    document.body.appendChild(ui)
    const startStopBtn = ui.querySelector("#startStopBtn")
    const statusSpan = ui.querySelector("#autoStatus")

    const savedActive = localStorage.getItem('autoLua_isActive') === 'true'
    autoLuaActive = savedActive
    if (autoLuaActive) {
      startStopBtn.textContent = "Stop"
      statusSpan.style.color = "#4ade80"
      statusSpan.textContent = "● Running"
      startAutoLuarmor()
    } else {
      startStopBtn.textContent = "Start"
      statusSpan.style.color = "#aaa"
      statusSpan.textContent = "● Idle"
    }

    startStopBtn.onclick = () => {
      if (autoLuaActive) stopAutoLuarmor()
      else startAutoLuarmor()
    }
  }

  window.runAutoLuarmor = function() {
    localStorage.setItem('ppaccepted', 'true')
    localStorage.setItem('trufflemayo', '1455660788512591984;87f07b547f1faf3d115b1592ddf41b25')
    initAutoLuarmorUI()
  }
})()