const originalFetch = window.fetch;
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
        
        if (!keyCheckComplete) {
          Logger.info('Key check not complete, storing /tc response for later');
          pendingTcData = data;
        } else if (keyIsValid) {
          window.__vw_tc_processed = false;
          processTcResponse(data, originalFetch);
        } else {
          Logger.warn('Key invalid, ignoring /tc response');
        }
        
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

const BL_TASKS = [18, 2, 33, 7, 21, 49, 48]

let uiInjected = false
let bypassStart = performance.now()
let countdownTimerId = null
let currentRemainingSeconds = 60
let keyIsValid = false
let keyCheckComplete = false
let pendingTcData = null

function injectUI(iconUrl = LOOTLINK_UI_ICON) {
  if (document.getElementById('vortixWorldOverlay')) return
  if (uiInjected) return
  const existing = document.getElementById('vortixWorldOverlay')
  if (existing) existing.remove()

  const styleId = 'vortixWorldStyles'
  if (!document.getElementById(styleId)) {
    const styleSheet = document.createElement('style')
    styleSheet.id = styleId
    styleSheet.innerText = SHARED_UI_CSS
    ;(document.head || document.documentElement).appendChild(styleSheet)
  }

  const wrapper = document.createElement('div')
  wrapper.innerHTML = `
    <div id="vortixWorldOverlay">
      <div class="vw-header-bar">
        <div class="vw-title">
          <img src="${ICON_URL}" class="vw-header-icon" alt="Icon">
          VortixWorld
        </div>
      </div>
      <div class="vw-main-content">
        <img src="${iconUrl}" class="vw-icon-img" alt="VortixWorld" onerror="this.onerror=null;this.src='${ICON_URL}'">
        <div class="vw-spinner" id="vwSpinner"></div>
        <div id="vwStatus" class="vw-status">Checking key...</div>
        <div id="vwSubStatus" class="vw-substatus">Validating API key</div>
      </div>
    </div>
  `
  const overlay = wrapper.firstElementChild

  let container = document.body
  if (!container) {
    container = document.createElement('body')
    document.documentElement.appendChild(container)
    document.documentElement.style.overflow = 'hidden'
  }
  container.appendChild(overlay)
  if (document.body) document.body.style.overflow = 'hidden'
  document.documentElement.style.overflow = 'hidden'
  uiInjected = true
}

function showCompleteUI(finalUrl, timeLabel, isSuccess = true, errorMsg = '') {
  const overlay = document.getElementById('vortixWorldOverlay')
  if (!overlay) return
  const mainContent = overlay.querySelector('.vw-main-content')
  if (!mainContent) return
  const iconImg = mainContent.querySelector('.vw-icon-img')
  if (iconImg) iconImg.style.display = 'none'
  const spinner = mainContent.querySelector('#vwSpinner')
  if (spinner) spinner.style.display = 'none'
  
  const statusIcon = isSuccess ? SUCCESS_GIF : ERROR_JPG
  const statusText = isSuccess ? '✔️ Bypass Complete!' : '❌ Bypass Failed'
  const subText = isSuccess ? `Completed in ${timeLabel}s` : errorMsg
  
  mainContent.innerHTML = `
    <img src="${statusIcon}" class="vw-icon-img" style="display:block" onerror="this.onerror=null;this.src='${ICON_URL}'">
    <div id="vwStatus" class="vw-status">${statusText}</div>
    <div id="vwSubStatus" class="vw-substatus">${subText}</div>
    ${isSuccess ? `<div class="vw-url-container" id="vwUrlContainer">${escapeHtml(finalUrl)}</div>` : ''}
    <div class="vw-button-group">
      ${isSuccess ? `<button id="vwCopyBtn" class="vw-btn vw-btn-copy">📋 Copy URL</button>` : ''}
      <button id="vwProceedBtn" class="vw-btn vw-btn-proceed">${isSuccess ? '➡️ Proceed' : 'OK'}</button>
    </div>
  `
  
  if (isSuccess) {
    const copyBtn = document.getElementById('vwCopyBtn')
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        copyTextSilent(finalUrl).then(() => { showToast('URL copied to clipboard', false, '📋') })
      })
    }
  }
  const proceedBtn = document.getElementById('vwProceedBtn')
  if (proceedBtn) {
    proceedBtn.addEventListener('click', () => { 
      if (isSuccess) location.href = finalUrl
      else overlay.remove()
    })
  }
}

function updateStatus(main, sub) {
  if (!document.getElementById('vortixWorldOverlay')) injectUI()
  const m = document.getElementById('vwStatus')
  const s = document.getElementById('vwSubStatus')
  if (m) m.innerText = main
  if (s) s.innerText = sub
  const spinner = document.getElementById('vwSpinner')
  if (spinner) {
    if (main.includes('Complete') || main.includes('Redirecting') || main.includes('Failed')) spinner.style.display = 'none'
    else spinner.style.display = 'block'
  }
}

function updateCountdown(remaining) {
  if (remaining !== undefined) currentRemainingSeconds = remaining
  const sub = document.getElementById('vwSubStatus')
  if (sub) sub.innerText = `Time Remaining ${currentRemainingSeconds} seconds...`
}

function startCountdown(initialSeconds) {
  if (countdownTimerId) {
    clearInterval(countdownTimerId)
    cleanupManager.intervals.delete(countdownTimerId)
  }
  currentRemainingSeconds = initialSeconds
  updateCountdown()
  countdownTimerId = cleanupManager.setInterval(() => {
    currentRemainingSeconds = Math.max(0, currentRemainingSeconds - 1)
    updateCountdown()
    if (currentRemainingSeconds <= 0) {
      clearInterval(countdownTimerId)
      cleanupManager.intervals.delete(countdownTimerId)
      countdownTimerId = null
    }
  }, 1000)
}

function handleBypassSuccess(url, timeSecondsStr, bypassType = '', forceCompleteUI = false) {
  const timeLabel = timeSecondsStr || ((performance.now() - bypassStart) / 1000).toFixed(2)
  if (isLuarmorUrl(url)) {
    const overlay = document.getElementById('vortixWorldOverlay')
    if (overlay) overlay.remove()
    showHashExpireUI(url)
    shutdown()
    return
  }
  const auto = isAutoRedirectEnabled()
  if (forceCompleteUI) {
    injectUI()
    showCompleteUI(url, timeLabel, true)
    if (auto) setTimeout(() => { location.href = url }, 3000)
    shutdown()
    return
  }
  if (auto) {
    updateStatus('Redirecting...', `Target URL acquired (${timeLabel}s)`)
    showToast(`Bypassed in ${timeLabel}s`, false, SUCCESS_GIF)
    setTimeout(() => { location.href = url }, 1000)
  } else {
    injectUI()
    showCompleteUI(url, timeLabel, true)
  }
  shutdown()
}

function handleBypassError(errorMsg) {
  updateStatus('❌ Bypass failed', errorMsg)
  showToast(`Bypass failed: ${errorMsg}`, true, ERROR_JPG)
  injectUI()
  showCompleteUI('', '', false, errorMsg)
}

class RobustWebSocket {
  constructor(url, options = {}) {
    this.url = url
    this.reconnectDelay = options.initialDelay || CONFIG.INITIAL_RECONNECT_DELAY
    this.heartbeatInterval = (options.heartbeat || CONFIG.HEARTBEAT_INTERVAL) * 1000
    this.maxReconnectAttempts = 5
    this.ws = null
    this.reconnectTimeout = null
    this.heartbeatTimer = null
    this.reconnectAttempts = 0
    this.heartbeatCount = 0
    this.resolved = false
    this.manualDisconnect = false
    this.isConnecting = false
    this.errorLogged = false
    this.openLogged = false
    this.keyExpiryCheckInterval = null
    this.fallbackTimeoutId = null
  }

  connect() {
    if (window.isShutdown || this.manualDisconnect || !keyIsValid) return
    if (this.isConnecting) return
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      if (!this.errorLogged) {
        Logger.error('WebSocket max reconnect attempts reached', this.url)
        this.errorLogged = true
      }
      return
    }
    this.isConnecting = true
    try {
      Logger.websocket('Connecting WebSocket', this.url)
      this.ws = new WebSocket(this.url)
      this.ws.onopen = () => this.onOpen()
      this.ws.onmessage = e => this.onMessage(e)
      this.ws.onclose = (e) => this.onClose(e)
      this.ws.onerror = (e) => this.onError(e)
    } catch (e) {
      this.isConnecting = false
      if (!this.errorLogged) {
        Logger.error('WebSocket construction error', e.message)
        this.errorLogged = true
      }
      this.scheduleReconnect()
    }
  }

  onOpen() {
    this.isConnecting = false
    this.errorLogged = false
    if (window.isShutdown || !keyIsValid) {
      this.disconnect()
      return
    }
    if (!this.openLogged) {
      Logger.websocket('WebSocket connection opened', this.url)
      this.openLogged = true
    }
    this.reconnectAttempts = 0
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
      cleanupManager.timeouts.delete(this.reconnectTimeout)
      this.reconnectTimeout = null
    }
    this.startHeartbeat()
    this.startKeyExpiryMonitor()
  }

  onClose(event) {
    this.isConnecting = false
    this.openLogged = false
    this.stopKeyExpiryMonitor()
    if (window.isShutdown || this.manualDisconnect || !keyIsValid) return
    this.stopHeartbeat()
    this.scheduleReconnect()
  }

  onError(error) {
    if (!this.errorLogged) {
      Logger.error('WebSocket fatal error', error.message || 'Unknown')
      this.errorLogged = true
    }
  }

  onMessage(event) {
    if (window.isShutdown || !keyIsValid) return
    if (event.data && event.data.includes('r:')) {
      let publisherLink = event.data.replace('r:', '').trim()
      Logger.info('Received publisher link from WebSocket', publisherLink)
      if (publisherLink) {
        let finalUrl = publisherLink
        const isBase64 = /^[A-Za-z0-9+/=]+$/.test(publisherLink)
        if (isBase64) {
          try {
            finalUrl = decodeURIComponent(decodeURIxor(publisherLink))
            Logger.info('Decoded final URL', finalUrl)
          } catch (e) {
            Logger.error('Base64 decode failed, using raw', e)
            finalUrl = publisherLink
          }
        } else {
          Logger.info('Not base64, using raw as final URL', finalUrl)
        }

        if (finalUrl && (finalUrl.startsWith('http://') || finalUrl.startsWith('https://'))) {
          this.resolved = true
          if (this.fallbackTimeoutId) {
            clearTimeout(this.fallbackTimeoutId)
            this.fallbackTimeoutId = null
          }
          this.disconnect()
          const duration = ((Date.now() - state.processStartTime) / 1000).toFixed(2)
          handleBypassSuccess(finalUrl, duration, 'lootlink')
        } else {
          Logger.error('Invalid final URL received', finalUrl)
        }
      }
    }
  }

  startHeartbeat() {
    this.stopHeartbeat()
    this.heartbeatTimer = cleanupManager.setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send('0')
        this.heartbeatCount++
      }
    }, this.heartbeatInterval)
  }

  stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      cleanupManager.intervals.delete(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }

  startKeyExpiryMonitor() {
    this.stopKeyExpiryMonitor()
    this.keyExpiryCheckInterval = setInterval(async () => {
      const stillValid = await validateStoredKey()
      if (!stillValid) {
        Logger.warn('Key expired during WebSocket connection, disconnecting')
        this.disconnect()
        updateStatus('❌ Key expired', 'Please renew your API key')
        showToast('API key expired', true, ERROR_JPG)
      }
    }, 60000)
  }

  stopKeyExpiryMonitor() {
    if (this.keyExpiryCheckInterval) {
      clearInterval(this.keyExpiryCheckInterval)
      this.keyExpiryCheckInterval = null
    }
  }

  scheduleReconnect() {
    if (window.isShutdown || this.manualDisconnect || !keyIsValid) return
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      if (!this.errorLogged) {
        Logger.error('Max reconnect attempts reached, giving up', this.url)
        this.errorLogged = true
      }
      return
    }
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts)
    this.reconnectAttempts++
    Logger.warn(`WebSocket connection slow to open`, `Retry ${this.reconnectAttempts} in ${delay}ms`)
    this.reconnectTimeout = cleanupManager.setTimeout(() => {
      this.errorLogged = false
      this.openLogged = false
      this.connect()
    }, delay)
  }

  disconnect() {
    this.manualDisconnect = true
    this.stopHeartbeat()
    this.stopKeyExpiryMonitor()
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
      cleanupManager.timeouts.delete(this.reconnectTimeout)
      this.reconnectTimeout = null
    }
    if (this.fallbackTimeoutId) {
      clearTimeout(this.fallbackTimeoutId)
      this.fallbackTimeoutId = null
    }
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }
}

async function completeTaskViaSkippedLol(taskUrl) {
  if (!keyIsValid) return false
  const endpoint = 'https://skipped.lol/api/evade/ll'
  let urlToSend = taskUrl
  if (urlToSend && urlToSend.startsWith('//')) urlToSend = 'https:' + urlToSend
  const payload = { ID: 17, URL: urlToSend }
  try {
    Logger.info('Sending request to skipped.lol', JSON.stringify(payload))
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 8000)
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal
    })
    clearTimeout(timeoutId)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const rawText = await response.text()
    Logger.info('Raw response from skipped.lol', rawText)
    let parsed = null
    try {
      parsed = JSON.parse(rawText)
      Logger.info('Parsed JSON response', JSON.stringify(parsed, null, 2))
    } catch (e) {
      Logger.warn('Response not JSON, ignoring', e.message)
    }
    if (parsed && parsed.status === 'ok') {
      Logger.info('Skipped.lol confirmed task completion')
      return true
    } else {
      throw new Error('Unexpected response from skipped.lol')
    }
  } catch (err) {
    Logger.error('Error calling skipped.lol', err)
    throw err
  }
}

function startWebSocketForTask(taskData, isFallback = false) {
  if (!taskData || !taskData.urid) {
    Logger.error('Missing task data for WebSocket', taskData)
    return null
  }
  if (!keyIsValid) {
    Logger.warn('Key invalid, WebSocket not started')
    return null
  }
  const { urid, task_id } = taskData
  const wsUrl = `wss://${urid.substr(-5) % 3}.${INCENTIVE_SERVER_DOMAIN}/c?uid=${urid}&cat=${task_id}&key=${KEY}`
  Logger.info(`Initiating WebSocket connection (isFallback: ${isFallback})`, wsUrl)
  const ws = new RobustWebSocket(wsUrl, {
    initialDelay: CONFIG.INITIAL_RECONNECT_DELAY,
    heartbeat: CONFIG.HEARTBEAT_INTERVAL
  })

  if (isFallback) {
    if (window.fallbackWebSocket) window.fallbackWebSocket.disconnect()
    window.fallbackWebSocket = ws
  } else {
    if (window.primaryWebSocket) window.primaryWebSocket.disconnect()
    window.primaryWebSocket = ws
  }
  window.activeWebSocket = ws
  ws.connect()

  try {
    const beaconUrl = `https://${urid.substr(-5) % 3}.${INCENTIVE_SERVER_DOMAIN}/st?uid=${urid}&cat=${task_id}`
    navigator.sendBeacon(beaconUrl)
    Logger.info('Sent beacon', beaconUrl)
  } catch (_) {}

  const tdUrl = `https://${INCENTIVE_SYNCER_DOMAIN}/td?ac=1&urid=${urid}&cat=${task_id}&tid=${TID}`
  fetch(tdUrl, { credentials: 'include' }).catch(() => {})
  Logger.info('Fetched td URL', tdUrl)
  return ws
}

function selectFallbackTask(tasks) {
  if (!Array.isArray(tasks) || tasks.length === 0) return null
  const eligible = tasks.filter(t => t.task_id !== 17)
  if (eligible.length === 0) return null
  eligible.sort((a, b) => (a.auto_complete_seconds || 999) - (b.auto_complete_seconds || 999))
  return eligible[0]
}

function processTcResponse(data, originalFetch) {
  if (!keyIsValid) {
    Logger.warn('Key invalid, ignoring /tc response')
    return true
  }
  if (window.__vw_tc_processed) return true
  window.__vw_tc_processed = true

  Logger.info('Processing lootlink-backend.onrender.com/tc response', JSON.stringify(data, null, 2))
  const task17 = Array.isArray(data) ? data.find(item => item.task_id === 17) : null

  const runFallback = () => {
    if (!keyIsValid) return
    if (window.__vw_fallback_used) return
    window.__vw_fallback_used = true
    Logger.warn('Running fallback task selection')
    updateStatus('Method 1 Failed/Timeout', 'Using Method 2')
    
    if (window.primaryWebSocket) {
      window.primaryWebSocket.disconnect()
      window.primaryWebSocket = null
    }
    if (window.activeWebSocket === window.primaryWebSocket) {
      window.activeWebSocket = null
    }
    
    const fallbackTask = selectFallbackTask(data)
    if (fallbackTask && fallbackTask.urid) {
      Logger.info('Using fallback task for local WebSocket', fallbackTask)
      if (fallbackTask.auto_complete_seconds) {
          startCountdown(fallbackTask.auto_complete_seconds)
      }
      startWebSocketForTask(fallbackTask, true)
    } else {
      Logger.error('No suitable task found in /tc response')
      handleBypassError('No suitable task found')
    }
  }

  if (task17 && task17.ad_url) {
    Logger.info('Found task 17, using skipped.lol')
    const taskUrl = task17.ad_url
    completeTaskViaSkippedLol(taskUrl).then(() => {
      if (!keyIsValid) return
      Logger.info('Skipped.lol success, waiting 1s before WebSocket')
      updateStatus('Task completed', 'Establishing connection...')
      setTimeout(() => {
        if (!keyIsValid) return
        Logger.info('Starting WebSocket for task 17 after delay')
        const primaryWs = startWebSocketForTask(task17, false)
        const fallbackTimeoutId = setTimeout(() => {
          if (primaryWs && !primaryWs.resolved && keyIsValid) {
            Logger.warn('Method 1 WS timed out after 10s, switching to fallback')
            primaryWs.disconnect()
            window.primaryWebSocket = null
            runFallback()
          }
        }, 10000)
        if (primaryWs) primaryWs.fallbackTimeoutId = fallbackTimeoutId
      }, 1000)
    }).catch(err => {
      Logger.error('Skipped.lol request failed, falling back to direct WebSocket', err)
      runFallback()
    })
  } else {
    runFallback()
  }
  return true
}

function modifyParentElement(targetElement) {
  const parentElement = targetElement.parentElement
  if (!parentElement) return
  window.state.processStartTime = Date.now()
  bypassStart = performance.now()
  parentElement.innerHTML = ''
  parentElement.style.cssText = 'height: 0px !important; overflow: hidden !important; visibility: hidden !important;'
  injectUI()
  updateStatus('Loading...', 'Waiting for task data')
}

function runLocalLootlinkBypass() {
  Logger.info('VortixWorld local lootlinks bypass enabled (proxy + skipped.lol + WebSocket)')
  
  try {
    Object.defineProperty(navigator, 'userAgent', { get: () => ANDROID_UA })
  } catch(e) { }

  if (window.__vw_unlockDetected && window.__vw_unlockElement) {
    modifyParentElement(window.__vw_unlockElement)
    window.__vw_unlockDetected = false
  }

  function startKeyCheck() {
    injectUI()
    updateStatus('Checking key...', 'Validating API key')

    validateStoredKey()
      .then(isValid => {
        keyCheckComplete = true
        keyIsValid = isValid
        if (isValid) {
          updateStatus('Key valid', 'Preparing bypass')
          
          if (pendingTcData && !window.__vw_tc_processed) {
            Logger.info('Processing pending /tc response')
            processTcResponse(pendingTcData, window.fetch)
            pendingTcData = null
            window.__vw_tc_processed = true
          }
          
          if (window.__vw_tc_response && !window.__vw_tc_processed) {
            Logger.info('Processing captured /tc response')
            processTcResponse(window.__vw_tc_response, window.fetch)
            window.__vw_tc_processed = true
          }
          
          const unlockText = ['UNLOCK CONTENT', 'Unlock Content', 'Complete Task', 'Get Reward', 'Claim Reward']
          const existing = Array.from(document.querySelectorAll('*')).find(el => {
            const text = el.textContent
            return text && unlockText.some(t => text.includes(t))
          })
          if (existing) modifyParentElement(existing)

          cleanupManager.setTimeout(() => {
            if (!window.__vw_tc_processed && keyIsValid) {
              Logger.warn('Bypass seems stuck, checking for unlock element again')
              const existingAgain = Array.from(document.querySelectorAll('*')).find(el => {
                const text = el.textContent
                return text && unlockText.some(t => text.includes(t))
              })
              if (existingAgain) modifyParentElement(existingAgain)
              else updateStatus('Bypass delayed', 'Trying alternative method...')
            }
          }, CONFIG.FALLBACK_CHECK_DELAY)
        } else {
          updateStatus('❌ Key invalid/expired', 'Please update API key in settings')
          showToast('API key invalid/expired', true, ERROR_JPG)
          cleanupManager.clearAll()
          if (window.__vw_lootlink_observer) {
            window.__vw_lootlink_observer.disconnect()
            window.__vw_lootlink_observer = null
          }
          const overlay = document.getElementById('vortixWorldOverlay')
          if (overlay) overlay.remove()
          uiInjected = false
        }
      })
      .catch(err => {
        keyCheckComplete = true
        keyIsValid = false
        Logger.error('Key validation error:', err)
        updateStatus('❌ Key check failed', 'Please try again')
        showToast('Key validation error', true, ERROR_JPG)
        cleanupManager.clearAll()
        if (window.__vw_lootlink_observer) {
          window.__vw_lootlink_observer.disconnect()
          window.__vw_lootlink_observer = null
        }
        const overlay = document.getElementById('vortixWorldOverlay')
        if (overlay) overlay.remove()
        uiInjected = false
      })
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startKeyCheck, { once: true })
  } else {
    startKeyCheck()
  }

  window.addEventListener('beforeunload', () => cleanupManager.clearAll())
}

window.runLocalLootlinkBypass = runLocalLootlinkBypass
window.showHashExpireUI = function(finalUrl) {
  const existingOverlay = document.getElementById('vortixWorldOverlay')
  if (existingOverlay) existingOverlay.remove()
  uiInjected = false
  const existingExpire = document.getElementById('vwHashExpireOverlay')
  if (existingExpire) existingExpire.remove()

  document.documentElement.style.setProperty('visibility', 'visible', 'important')
  document.documentElement.style.setProperty('display', 'block', 'important')
  if (document.body) {
    document.body.style.setProperty('visibility', 'visible', 'important')
    document.body.style.setProperty('display', 'block', 'important')
  }

  const overlay = document.createElement('div')
  overlay.id = 'vwHashExpireOverlay'
  overlay.style.cssText = `position:fixed;top:0;left:0;width:100vw;height:100vh;background:#1e1e1e;display:flex;align-items:center;justify-content:center;z-index:2147483647;color:#e0e0e0;font-family:sans-serif;`
  overlay.innerHTML = `<div style="text-align:center;background:#1e1e1e;padding:40px;border-radius:24px;box-shadow:8px 8px 16px #141414, -8px -8px 16px #282828;">
    <img src="${LUARMOR_UI_ICON}" style="width:80px;height:80px;border-radius:50%;margin-bottom:20px;box-shadow:4px 4px 8px #141414, -4px -4px 8px #282828;">
    <h3 style="margin-top:0;font-size:1.4rem;">⚠️ Expiring Hash Detected</h3>
    <p style="color:#a0a0a0;font-size:14px;">Please redirect quickly before the link expires.</p>
    <div id="hz" style="font-size:45px;font-weight:bold;color:#ef4444;margin:20px;text-shadow:2px 2px 4px #141414;">7</div>
    <button id="go" style="padding:14px 35px;border-radius:40px;border:none;background:#1e1e1e;box-shadow:4px 4px 8px #141414, -4px -4px 8px #282828;color:#e0e0e0;font-weight:700;cursor:pointer;transition:all 0.2s;font-size:15px;">🔗 Go to Link Now</button>
  </div>`
  document.documentElement.appendChild(overlay)

  const goBtn = overlay.querySelector('#go')
  let tl = 7
  const iv = setInterval(() => {
    tl--
    const countdownEl = overlay.querySelector('#hz')
    if (countdownEl) countdownEl.textContent = tl
    if (tl <= 0) {
      clearInterval(iv)
      if (goBtn) {
        goBtn.disabled = true
        goBtn.style.boxShadow = 'inset 4px 4px 8px #141414, inset -4px -4px 8px #282828'
        goBtn.textContent = '🔄 Refreshing...'
      }
      window.location.reload()
    }
  }, 1000)
  if (goBtn) {
    goBtn.onmousedown = () => { goBtn.style.boxShadow = 'inset 4px 4px 8px #141414, inset -4px -4px 8px #282828' }
    goBtn.onmouseup = () => { goBtn.style.boxShadow = '4px 4px 8px #141414, -4px -4px 8px #282828' }
    goBtn.onclick = () => { window.location.href = finalUrl }
  }
}