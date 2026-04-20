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
let methodStartTime = null
let countdownTimerId = null
let currentRemainingSeconds = 60
let keyIsValid = false
let keyCheckComplete = false
let pendingTcData = null
let consoleLines = []
let bypassActive = false
let lootlinkResolved = false

function waitForBody(callback) {
  if (document.body) {
    callback();
  } else {
    const observer = new MutationObserver(() => {
      if (document.body) {
        observer.disconnect();
        callback();
      }
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }
}

function addConsoleLine(text) {
  consoleLines.push(text);
  if (consoleLines.length > 8) consoleLines.shift();
  const consoleEl = document.getElementById('vwConsoleOutput');
  if (consoleEl) {
    consoleEl.innerHTML = consoleLines.map(line => `<div class="vw-console-line">${line}</div>`).join('');
    consoleEl.scrollTop = consoleEl.scrollHeight;
  }
}

function injectUI(iconUrl = LOOTLINK_UI_ICON) {
  if (!document.body) {
    waitForBody(() => injectUI(iconUrl));
    return;
  }
  if (document.getElementById('vortixWorldOverlay')) return;
  if (uiInjected) return;
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
        <div id="vwStatus" class="vw-status">Preparing bypass...</div>
        <div class="vw-console" id="vwConsoleOutput"></div>
        <div id="vwCountdown" class="vw-countdown" style="display:none;"></div>
      </div>
    </div>
  `
  const overlay = wrapper.firstElementChild

  document.body.appendChild(overlay)
  document.body.style.overflow = 'hidden'
  document.documentElement.style.overflow = 'hidden'
  uiInjected = true
  addConsoleLine('> Initializing bypass...');
}

function showCompleteUI(finalUrl, timeLabel, isSuccess = true, errorMsg = '') {
  if (countdownTimerId) { clearInterval(countdownTimerId); countdownTimerId = null; }
  const countdownEl = document.getElementById('vwCountdown');
  if (countdownEl) countdownEl.style.display = 'none';
  
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
    <div class="vw-console" id="vwConsoleOutput">${consoleLines.map(line => `<div class="vw-console-line">${line}</div>`).join('')}</div>
    <div class="vw-substatus" style="font-size:14px;color:#a0a0a0;margin-bottom:20px;background:#1e1e1e;box-shadow:inset 4px 4px 8px #141414, inset -4px -4px 8px #282828;padding:10px 15px;border-radius:10px;font-weight:600;">${subText}</div>
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
  bypassActive = false
  lootlinkResolved = true
}

function updateStatus(main, sub) {
  if (!document.getElementById('vortixWorldOverlay')) injectUI()
  const m = document.getElementById('vwStatus')
  if (m) m.innerText = main
  if (sub) addConsoleLine(`> ${sub}`)
  const spinner = document.getElementById('vwSpinner')
  if (spinner) {
    if (main.includes('Complete') || main.includes('Redirecting') || main.includes('Failed')) spinner.style.display = 'none'
    else spinner.style.display = 'block'
  }
  if (main.includes('Method 1') || main.includes('Task completed') || main.includes('Establishing')) {
    bypassActive = true
  }
}

function startCountdown(initialSeconds) {
  if (countdownTimerId) clearInterval(countdownTimerId)
  currentRemainingSeconds = initialSeconds
  const countdownEl = document.getElementById('vwCountdown')
  if (countdownEl) {
    countdownEl.style.display = 'block'
    countdownEl.innerText = `Time Remaining: ${currentRemainingSeconds}s`
  }
  countdownTimerId = setInterval(() => {
    currentRemainingSeconds = Math.max(0, currentRemainingSeconds - 1)
    const el = document.getElementById('vwCountdown')
    if (el) {
      el.innerText = `Time Remaining: ${currentRemainingSeconds}s`
      if (currentRemainingSeconds <= 0) el.style.display = 'none'
    }
    if (currentRemainingSeconds <= 0) {
      clearInterval(countdownTimerId)
      countdownTimerId = null
    }
  }, 1000)
}

function handleBypassSuccess(url, timeSecondsStr, bypassType = '', forceCompleteUI = false) {
  let timeLabel = timeSecondsStr
  if (!timeLabel && methodStartTime) {
    timeLabel = ((performance.now() - methodStartTime) / 1000).toFixed(2)
  }
  if (!timeLabel) timeLabel = '0.00'
  
  if (countdownTimerId) { clearInterval(countdownTimerId); countdownTimerId = null; }
  const countdownEl = document.getElementById('vwCountdown')
  if (countdownEl) countdownEl.style.display = 'none'
  
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
    const delay = 0
    if (delay > 0) {
      let remaining = delay
      const countdownDiv = document.getElementById('vwCountdown')
      if (countdownDiv) {
        countdownDiv.style.display = 'block'
        countdownDiv.innerText = `Redirecting in ${remaining} seconds...`
      }
      const interval = setInterval(() => {
        remaining--
        if (countdownDiv) countdownDiv.innerText = `Redirecting in ${remaining} seconds...`
        if (remaining <= 0) {
          clearInterval(interval)
          if (countdownDiv) countdownDiv.style.display = 'none'
          location.href = url
        }
      }, 1000)
    } else {
      setTimeout(() => { location.href = url }, 100)
    }
  } else {
    injectUI()
    showCompleteUI(url, timeLabel, true)
  }
  shutdown()
}

function handleBypassError(errorMsg) {
  if (countdownTimerId) { clearInterval(countdownTimerId); countdownTimerId = null; }
  const countdownEl = document.getElementById('vwCountdown')
  if (countdownEl) countdownEl.style.display = 'none'
  
  updateStatus('❌ Bypass failed', errorMsg)
  showToast(`Bypass failed: ${errorMsg}`, true, ERROR_JPG)
  injectUI()
  showCompleteUI('', '', false, errorMsg)
  bypassActive = false
}

class RobustWebSocket {
  constructor(url, options = {}) {
    this.url = url
    this.reconnectDelay = options.initialDelay || CONFIG.INITIAL_RECONNECT_DELAY
    this.heartbeatInterval = 1000
    this.connectionTimeout = options.connectionTimeout || 3000
    this.maxReconnectAttempts = 2
    this.messageTimeout = 20000
    this.ws = null
    this.reconnectTimeout = null
    this.heartbeatTimer = null
    this.connectionTimer = null
    this.messageTimer = null
    this.reconnectAttempts = 0
    this.resolved = false
    this.manualDisconnect = false
    this.onConnectionTimeout = options.onConnectionTimeout || null
  }

  connect() {
    if (window.isShutdown || this.manualDisconnect || !keyIsValid) return
    if (this.reconnectAttempts >= this.maxReconnectAttempts) return
    this.clearConnectionTimer()
    this.connectionTimer = setTimeout(() => {
      if (!this.resolved) {
        Logger.warn('WebSocket connection timeout', this.url)
        if (this.ws) { this.ws.close(); this.ws = null; }
        if (this.onConnectionTimeout) this.onConnectionTimeout()
        else this.scheduleReconnect()
      }
    }, this.connectionTimeout)
    
    try {
      Logger.websocket('Connecting WebSocket', this.url)
      this.ws = new WebSocket(this.url)
      this.ws.onopen = () => this.onOpen()
      this.ws.onmessage = e => this.onMessage(e)
      this.ws.onclose = (e) => this.onClose(e)
      this.ws.onerror = (e) => this.onError(e)
    } catch (e) {
      this.clearConnectionTimer()
      Logger.error('WebSocket construction error', e.message)
      this.scheduleReconnect()
    }
  }

  clearConnectionTimer() {
    if (this.connectionTimer) {
      clearTimeout(this.connectionTimer)
      this.connectionTimer = null
    }
  }

  clearMessageTimer() {
    if (this.messageTimer) {
      clearTimeout(this.messageTimer)
      this.messageTimer = null
    }
  }

  onOpen() {
    this.clearConnectionTimer()
    this.reconnectAttempts = 0
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
      cleanupManager.timeouts.delete(this.reconnectTimeout)
      this.reconnectTimeout = null
    }
    Logger.websocket('WebSocket connection opened', this.url)
    this.sendHeartbeat()
    this.startHeartbeat()
    this.messageTimer = setTimeout(() => {
      if (!this.resolved) {
        Logger.warn('WebSocket message timeout (no r: received)', this.url)
        this.disconnect()
        if (this.onConnectionTimeout) this.onConnectionTimeout()
      }
    }, this.messageTimeout)
  }

  onClose(event) {
    this.clearConnectionTimer()
    this.clearMessageTimer()
    this.stopHeartbeat()
    if (window.isShutdown || this.manualDisconnect || !keyIsValid) return
    this.scheduleReconnect()
  }

  onError(error) {
    Logger.error('WebSocket fatal error', error.message || 'Unknown')
  }

  onMessage(event) {
    if (window.isShutdown || !keyIsValid) return
    if (event.data && event.data.includes('r:')) {
      this.clearMessageTimer()
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
          this.disconnect()
          handleBypassSuccess(finalUrl, null, 'lootlink')
        } else {
          Logger.error('Invalid final URL received', finalUrl)
        }
      }
    }
  }

  sendHeartbeat() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send('0')
    }
  }

  startHeartbeat() {
    this.stopHeartbeat()
    this.heartbeatTimer = cleanupManager.setInterval(() => {
      this.sendHeartbeat()
    }, this.heartbeatInterval)
  }

  stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      cleanupManager.intervals.delete(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }

  scheduleReconnect() {
    if (window.isShutdown || this.manualDisconnect || !keyIsValid) return
    if (this.reconnectAttempts >= this.maxReconnectAttempts) return
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts)
    this.reconnectAttempts++
    Logger.warn(`WebSocket connection slow to open`, `Retry ${this.reconnectAttempts} in ${delay}ms`)
    this.reconnectTimeout = cleanupManager.setTimeout(() => {
      this.connect()
    }, delay)
  }

  disconnect() {
    this.clearConnectionTimer()
    this.clearMessageTimer()
    this.manualDisconnect = true
    this.stopHeartbeat()
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
      cleanupManager.timeouts.delete(this.reconnectTimeout)
      this.reconnectTimeout = null
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
    updateStatus('Completing task 17...', 'Contacting skipped.lol')
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
      updateStatus('Task completed', 'Establishing connection...')
      return true
    } else {
      throw new Error('Unexpected response from skipped.lol')
    }
  } catch (err) {
    Logger.error('Error calling skipped.lol', err)
    throw err
  }
}

function startWebSocketForTask(taskData, isFallback = false, subdomainAttempt = 0, sameSubdomainRetry = 0) {
  if (!taskData || !taskData.urid) {
    Logger.error('Missing task data for WebSocket', taskData)
    return null
  }
  if (!keyIsValid) {
    Logger.warn('Key invalid, WebSocket not started')
    return null
  }
  const { urid, task_id, session_id } = taskData
  const subdomainIndex = (parseInt(urid.substr(-5)) + subdomainAttempt) % 3
  let wsUrl = `wss://${subdomainIndex}.${INCENTIVE_SERVER_DOMAIN}/c?uid=${urid}&cat=${task_id}&key=${KEY}`
  if (session_id) wsUrl += `&session_id=${session_id}`
  if (typeof is_loot !== 'undefined') wsUrl += `&is_loot=${is_loot ? '1' : '0'}`
  if (typeof TID !== 'undefined') wsUrl += `&tid=${TID}`
  Logger.info(`Initiating WebSocket connection (isFallback: ${isFallback}, attempt: ${subdomainAttempt})`, wsUrl)
  
  const ws = new RobustWebSocket(wsUrl, {
    initialDelay: CONFIG.INITIAL_RECONNECT_DELAY,
    connectionTimeout: 3000,
    messageTimeout: 20000,
    onConnectionTimeout: () => {
      if (sameSubdomainRetry < 1 && !ws.resolved) {
        Logger.warn(`WebSocket connection timeout on subdomain ${subdomainIndex}, retrying same subdomain`)
        startWebSocketForTask(taskData, isFallback, subdomainAttempt, sameSubdomainRetry + 1)
      } else if (subdomainAttempt < 2 && !ws.resolved) {
        Logger.warn(`WebSocket connection timeout on subdomain ${subdomainIndex}, trying next subdomain`)
        startWebSocketForTask(taskData, isFallback, subdomainAttempt + 1, 0)
      } else {
        if (window.primaryWebSocket) {
          window.primaryWebSocket.disconnect()
          window.primaryWebSocket = null
        }
        if (window.__vw_fallback_used) return
        window.__vw_fallback_used = true
        Logger.warn('WebSocket failed after all attempts, falling back')
        updateStatus('Method 1 Failed', 'Using Method 2')
        const fallbackTask = selectFallbackTask(window.__vw_tc_response || [])
        if (fallbackTask && fallbackTask.urid) {
          if (fallbackTask.auto_complete_seconds) {
            startCountdown(fallbackTask.auto_complete_seconds)
          }
          startWebSocketForTask(fallbackTask, true)
        } else {
          Logger.error('No fallback task available')
          handleBypassError('No suitable task found')
        }
      }
    }
  })

  if (isFallback) {
    if (window.fallbackWebSocket) {
      window.fallbackWebSocket.disconnect()
      window.fallbackWebSocket = null
    }
    window.fallbackWebSocket = ws
  } else {
    if (window.primaryWebSocket) {
      window.primaryWebSocket.disconnect()
      window.primaryWebSocket = null
    }
    window.primaryWebSocket = ws
  }
  window.activeWebSocket = ws
  ws.connect()

  try {
    const beaconUrl = `https://${subdomainIndex}.${INCENTIVE_SERVER_DOMAIN}/st?uid=${urid}&cat=${task_id}`
    navigator.sendBeacon(beaconUrl)
    Logger.info('Sent beacon', beaconUrl)
  } catch (_) {}

  const tdUrl = `https://nerventualken.com/td?ac=1&urid=${urid}&cat=${task_id}&tid=${TID}`
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

async function verifySession(sessionUuid) {
  if (!sessionUuid) return
  updateStatus('Verifying session...', 'Preparing anti-bot check')
  try {
    await fetch(`https://${location.hostname}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session: sessionUuid })
    })
    Logger.info('Session verification sent')
  } catch (e) {
    Logger.warn('Session verification failed', e.message)
  }
}

async function processTcResponse(data, originalFetch) {
  if (!keyIsValid) {
    Logger.warn('Key invalid, ignoring /tc response')
    return true
  }
  if (window.__vw_tc_processed) return true
  window.__vw_tc_processed = true

  Logger.info('Processing lootlink-backend.onrender.com/tc response', JSON.stringify(data, null, 2))
  const task17 = Array.isArray(data) ? data.find(item => item.task_id === 17) : null

  const runFallback = async (reason = 'missing') => {
    if (!keyIsValid) return
    if (window.__vw_fallback_used) return
    window.__vw_fallback_used = true
    if (reason === 'error') {
      Logger.warn('Running fallback task selection due to skipped.lol error')
      updateStatus('Method 1 Failed', 'Using Method 2')
    } else {
      Logger.info('No task 17 found, using fallback task')
      updateStatus('Using fallback task...', 'Selecting alternative offer')
    }
    
    if (window.primaryWebSocket) {
      window.primaryWebSocket.disconnect()
      window.primaryWebSocket = null
    }
    
    methodStartTime = performance.now()
    
    const fallbackTask = selectFallbackTask(data)
    if (fallbackTask && fallbackTask.urid) {
      Logger.info('Using fallback task for local WebSocket', fallbackTask)
      if (fallbackTask.auto_complete_seconds) {
        startCountdown(fallbackTask.auto_complete_seconds)
      }
      startWebSocketForTask(fallbackTask, true)
      updateStatus('Establishing connection...', `Task ${fallbackTask.task_id} - waiting for response`)
    } else {
      Logger.error('No suitable task found in /tc response')
      handleBypassError('No suitable task found')
    }
  }

  if (task17 && task17.ad_url) {
    Logger.info('Found task 17, using skipped.lol')
    const taskUrl = task17.ad_url
    methodStartTime = performance.now()
    completeTaskViaSkippedLol(taskUrl).then(() => {
      if (!keyIsValid) return
      Logger.info('Skipped.lol success, starting WebSocket for task 17 immediately')
      const primaryWs = startWebSocketForTask(task17, false)
      const fallbackTimeoutId = setTimeout(() => {
        if (primaryWs && !primaryWs.resolved && keyIsValid) {
          Logger.warn('Method 1 WS timed out after 10s, switching to fallback')
          primaryWs.disconnect()
          window.primaryWebSocket = null
          runFallback('error')
        }
      }, 10000)
      if (primaryWs) primaryWs.fallbackTimeoutId = fallbackTimeoutId
    }).catch(err => {
      Logger.error('Skipped.lol request failed, falling back to direct WebSocket', err)
      runFallback('error')
    })
  } else {
    runFallback('missing')
  }
  return true
}

function modifyParentElement(targetElement) {
  const parentElement = targetElement.parentElement
  if (!parentElement) return
  window.state.processStartTime = Date.now()
  methodStartTime = performance.now()
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

  async function startKeyCheck() {
    const isValid = await validateStoredKey()
    keyCheckComplete = true
    keyIsValid = isValid
    if (isValid) {
      waitForBody(async () => {
        const sessionUuid = window.session || document.session
        if (sessionUuid) await verifySession(sessionUuid)
        
        if (pendingTcData && !window.__vw_tc_processed) {
          Logger.info('Processing pending /tc response');
          processTcResponse(pendingTcData, window.fetch);
          pendingTcData = null;
          window.__vw_tc_processed = true;
        }
        
        if (window.__vw_tc_response && !window.__vw_tc_processed) {
          Logger.info('Processing captured /tc response');
          processTcResponse(window.__vw_tc_response, window.fetch);
          window.__vw_tc_processed = true;
        }
        
        const unlockText = ['UNLOCK CONTENT', 'Unlock Content', 'Complete Task', 'Get Reward', 'Claim Reward'];
        const existing = Array.from(document.querySelectorAll('*')).find(el => {
          const text = el.textContent;
          return text && unlockText.some(t => text.includes(t));
        });
        if (existing) {
          modifyParentElement(existing);
        } else {
          injectUI();
          updateStatus('Ready', 'Waiting for unlock button...');
        }

        cleanupManager.setTimeout(() => {
          if (!window.__vw_tc_processed && keyIsValid) {
            Logger.warn('Bypass seems stuck, checking for unlock element again');
            const existingAgain = Array.from(document.querySelectorAll('*')).find(el => {
              const text = el.textContent;
              return text && unlockText.some(t => text.includes(t));
            });
            if (existingAgain) modifyParentElement(existingAgain);
            else updateStatus('Bypass delayed', 'Trying alternative method...');
          }
        }, CONFIG.FALLBACK_CHECK_DELAY);
      });
    } else {
      Logger.warn('API key invalid/expired');
      waitForBody(() => {
        injectUI();
        updateStatus('❌ API Key Invalid', 'Please enter a valid API key');
        const spinner = document.getElementById('vwSpinner');
        if (spinner) spinner.style.display = 'none';
      });
      pendingTcData = null;
      window.__vw_tc_response = null;
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startKeyCheck, { once: true })
  } else {
    startKeyCheck()
  }

  window.addEventListener('beforeunload', () => cleanupManager.clearAll())
}

window.runLocalLootlinkBypass = runLocalLootlinkBypass