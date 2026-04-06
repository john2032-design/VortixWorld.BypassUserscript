// ==UserScript==
// @name         Auto Luarmor & Link Shortener Bypass
// @namespace    https://github.com/afk.l0l
// @version      2.0
// @description  Automatically collects Luarmor keys, clicks through ads, and bypasses link shorteners using a remote API.
// @author       @afk.l0l
// @match        *://*.luarmor.net/*
// @match        *://*.loot-link.com/*
// @match        *://*.lootdest.org/*
// @match        *://*.lootdest.com/*
// @match        *://*.lootlink.org/*
// @match        *://*.lootlinks.co/*
// @match        *://*.lootdest.info/*
// @match        *://*.links-loot.com/*
// @match        *://*.linksloot.net/*
// @match        *://*.work.ink/*
// @match        *://*.workink.net/*
// @match        *://*.linkvertise.com/*
// @match        *://*.tpi.li/*
// @match        *://*.exe.io/*
// @match        *://*.shrinkearn.com/*
// @match        *://*.shortingly.com/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function () {
    'use strict';

    const API_BYPASS_URL = 'https://lootlinkcom.vercel.app/api/bypass?url=';
    const currentUrl = window.location.href;
    const hostname = window.location.hostname;
    const isLuarmor = hostname.includes('luarmor.net');

    function simulateClick(element) {
        if (!element) return false;
        try {
            const rect = element.getBoundingClientRect();
            if (rect.width === 0 || rect.height === 0) return false;
            element.focus();
            
            ['touchstart', 'touchend', 'pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click'].forEach(eventType => {
                try {
                    let event;
                    if (eventType.startsWith('touch')) {
                        event = new Event(eventType, { bubbles: true, cancelable: true });
                    } else {
                        event = new MouseEvent(eventType, {
                            view: window,
                            bubbles: true,
                            cancelable: true,
                            button: 0,
                            buttons: 1,
                            clientX: rect.left + rect.width / 2,
                            clientY: rect.top + rect.height / 2
                        });
                    }
                    element.dispatchEvent(event);
                } catch(e) {}
            });
            
            try { element.click(); } catch(e2) {}
            return true;
        } catch(e) {
            try { element.click(); } catch(e2) {}
            return false;
        }
    }

    function forceNavigation(button) {
        if (!button) return false;
        if (button.tagName === 'A' && button.href) {
            window.location.href = button.href;
            return true;
        }
        const form = button.closest('form');
        if (form) {
            form.submit();
            return true;
        }
        const onclickAttr = button.getAttribute('onclick');
        if (onclickAttr && onclickAttr.includes('window.location')) {
            const match = onclickAttr.match(/window\.location\.href\s*=\s*['"]([^'"]+)['"]/);
            if (match && match[1]) {
                window.location.href = match[1];
                return true;
            }
        }
        return false;
    }

    if (isLuarmor) {
        localStorage.setItem('ppaccepted', 'true');
        localStorage.setItem('trufflemayo', '1455660788512591984;87f07b547f1faf3d115b1592ddf41b25');
        console.log('[AutoLuarmor] Keys injected');

        let isActive = localStorage.getItem('autoLua_isActive') === 'true';
        let navAttempted = false;
        let currentKey = "N/A";
        let activeTimers = [];

        function clearAllTimeouts() {
            for (const timer of activeTimers) {
                clearTimeout(timer);
            }
            activeTimers = [];
        }

        if (document.getElementById('autoLuaUI')) return;

        const ui = document.createElement("div");
        ui.id = "autoLuaUI";
        
        ui.style.cssText = `
            position: fixed;
            top: 15px;
            left: 50%;
            transform: translateX(-50%);
            width: max-content;
            min-width: 280px;
            background: rgba(13,13,13,0.85);
            color: #ffffff;
            font-family: Poppins, Arial, sans-serif;
            z-index: 2147483647;
            font-size: 14px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.5);
            border: 1px solid #333333;
            border-radius: 50px;
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
        `;

        ui.innerHTML = `
            <style>
                #autoLuaUI * { box-sizing: border-box; font-family: Poppins, Arial, sans-serif; }
                .top-bar {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 8px 16px;
                    width: 100%;
                }
                .title {
                    font-size: 15px;
                    font-weight: 600;
                    background: linear-gradient(135deg, #cccccc, #ffffff);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    letter-spacing: 0.5px;
                    margin-right: 15px;
                }
                .control-btn {
                    background: #333333;
                    color: #ffffff;
                    border: none;
                    padding: 6px 16px;
                    border-radius: 40px;
                    font-size: 13px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    font-family: Poppins, sans-serif;
                }
                .control-btn:hover {
                    background: #555555;
                    transform: scale(1.02);
                }
                .status {
                    font-size: 11px;
                    color: #aaaaaa;
                    margin-right: 10px;
                }
            </style>
            <div class="top-bar">
                <div class="title">⚡ Auto Lua</div>
                <div style="display: flex; align-items: center;">
                    <span class="status" id="autoStatus">● Idle</span>
                    <button id="startStopBtn" class="control-btn">Start</button>
                </div>
            </div>
        `;

        if (document.body) {
            document.body.appendChild(ui);
        } else {
            document.addEventListener('DOMContentLoaded', () => document.body.appendChild(ui));
        }

        const startStopBtn = ui.querySelector("#startStopBtn");
        const statusSpan = ui.querySelector("#autoStatus");

        function updateUIForState() {
            if (isActive) {
                startStopBtn.textContent = "Stop";
                statusSpan.innerHTML = "● Running";
                statusSpan.style.color = "#4ade80";
            } else {
                startStopBtn.textContent = "Start";
                statusSpan.innerHTML = "● Idle";
                statusSpan.style.color = "#aaaaaa";
            }
        }

        function stopAutomation() {
            isActive = false;
            localStorage.setItem('autoLua_isActive', 'false');
            clearAllTimeouts();
            updateUIForState();
            console.log('[AutoLuarmor] Stopped by user');
        }

        function startAutomation(isInitialLoad = false) {
            if (isActive && !isInitialLoad) return;
            isActive = true;
            localStorage.setItem('autoLua_isActive', 'true');
            navAttempted = false;
            clearAllTimeouts();
            updateUIForState();
            
            if (!isInitialLoad) console.log('[AutoLuarmor] Started by user');
            
            // Give the page slightly more time to load its listeners if it's an initial auto-load
            const delay = isInitialLoad ? 1000 : 300;
            const timer = setTimeout(() => {
                if (isActive) onLoad();
            }, delay);
            activeTimers.push(timer);
        }

        startStopBtn.addEventListener("click", () => {
            if (isActive) {
                stopAutomation();
            } else {
                startAutomation();
            }
        });

        function setKey(key) {
            currentKey = key;
        }

        function isBlocked() {
            const blacklist = document.querySelector('.swal2-x-mark');
            const loader = document.querySelector('.loader');
            const captcha = document.getElementById('captchafield');
            if (blacklist && blacklist.offsetParent !== null) return true;
            if (loader && loader.offsetParent !== null) return true;
            if (captcha && captcha.offsetParent !== null) return true;
            return false;
        }

        function grabKeyOnce() {
            if (currentKey !== "N/A") return;
            const keyElement = document.querySelector('h6.mb-0.text-sm');
            if (keyElement) {
                const keyText = keyElement.textContent.trim();
                if (keyText) setKey(keyText);
            }
        }

        function checkProgress() {
            if (!isActive) return;
            if (isBlocked()) return;
            const progressElement = document.getElementById('adprogressp');
            if (!progressElement) return;
            const progressParts = progressElement.textContent.match(/(\d+)\/(\d+)/);
            if (!progressParts) return;
            const remaining = parseInt(progressParts[2], 10) - parseInt(progressParts[1], 10);
            if (remaining === 0) {
                const keyElement = document.querySelector('h6.mb-0.text-sm');
                const addTimeBtn = keyElement ? document.getElementById(`addtimebtn_${keyElement.textContent.trim()}`) : null;
                const newKeyBtn = document.getElementById('newkeybtn');
                if (addTimeBtn && addTimeBtn.offsetParent !== null && !addTimeBtn.disabled) {
                    simulateClick(addTimeBtn);
                } else if (newKeyBtn && newKeyBtn.offsetParent !== null && !newKeyBtn.disabled) {
                    simulateClick(newKeyBtn);
                }
            }
        }

        function waitForButtonToBeClickable() {
            if (!isActive || navAttempted) return;
            if (isBlocked()) {
                const timer = setTimeout(waitForButtonToBeClickable, 500);
                activeTimers.push(timer);
                return;
            }
            const btn = document.getElementById('nextbtn');
            if (btn && btn.offsetParent !== null && !(btn.style.cursor === 'not-allowed' || btn.disabled)) {
                console.log('[AutoLuarmor] Clicking nextbtn');
                simulateClick(btn);
                navAttempted = true;
                
                // Enhanced Fallback: If it didn't work, reset and try again
                const fallbackTimer = setTimeout(() => {
                    if (isActive && window.location.href === currentUrl) {
                        console.log('[AutoLuarmor] Click seemed to fail, retrying...');
                        navAttempted = false; // Reset so it can try clicking again
                        forceNavigation(btn); // Try forcing as a backup
                        waitForButtonToBeClickable(); // Re-enter the loop
                    }
                }, 2500);
                activeTimers.push(fallbackTimer);
            } else {
                const timer = setTimeout(waitForButtonToBeClickable, 500);
                activeTimers.push(timer);
            }
        }

        function onLoad() {
            if (!isActive) return;
            if (isBlocked()) {
                const timer = setTimeout(onLoad, 500);
                activeTimers.push(timer);
                return;
            }
            grabKeyOnce();
            checkProgress();
            waitForButtonToBeClickable();
        }

        if (isActive) {
            startAutomation(true); 
        } else {
            updateUIForState();
        }

    } else {
        const shortenerDomains = [
            'loot-link.com', 'lootdest.org', 'lootdest.com', 'lootlink.org',
            'lootlinks.co', 'lootdest.info', 'links-loot.com', 'linksloot.net',
            'work.ink', 'workink.net', 'linkvertise.com', 'tpi.li',
            'exe.io', 'shrinkearn.com', 'shortingly.com'
        ];
        const isShortenerDomain = shortenerDomains.some(domain =>
            hostname === domain || hostname.endsWith('.' + domain)
        );
        if (!isShortenerDomain) return;

        const badge = document.createElement('div');
        badge.textContent = '⏳ Bypassing...';
        badge.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #222222;
            color: #ffffff;
            padding: 8px 16px;
            border-radius: 20px;
            font-family: Poppins, Arial, sans-serif;
            font-size: 12px;
            font-weight: bold;
            z-index: 2147483647;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
            pointer-events: none;
        `;
        document.body.appendChild(badge);

        console.log('[Bypass] Starting for', currentUrl);

        function showLuarmorExpiryOverlay(url) {
            badge.remove();
            let timeLeft = 7;
            const overlay = document.createElement('div');
            overlay.style.cssText = `
                position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
                background: rgba(10, 10, 10, 0.95); backdrop-filter: blur(5px);
                display: flex; align-items: center; justify-content: center;
                z-index: 2147483647; font-family: Poppins, Arial, sans-serif;
            `;
            // Removed the URL div from here
            overlay.innerHTML = `
                <style>
                    .hash-card { width:90%; max-width:500px; background:#111111; padding:30px 25px; border-radius:16px; box-shadow:0 10px 30px rgba(0,0,0,.8); text-align:center; color:#ffffff; border:1px solid #333333; }
                    .hash-title { font-size:24px; font-weight:600; margin-bottom:15px; color:#ffffff; }
                    .hash-timer { font-size:36px; font-weight:bold; margin:20px 0; color:#ff5555; }
                    .hash-btn { padding:12px 30px; border:none; border-radius:10px; font-size:16px; font-weight:600; cursor:pointer; background:#333333; color:#ffffff; margin-top:10px; }
                    .hash-btn:hover { background:#555555; }
                    .hash-footer { margin-top:25px; font-size:11px; color:#888888; }
                </style>
                <div class="hash-card">
                    <div class="hash-title">⚠️ Expiring Hash Detected</div>
                    <div>This hash expires in:</div>
                    <div class="hash-timer" id="countdown">7</div>
                    <button class="hash-btn" id="redirectNow">🔗 Go to Link Now</button>
                    <div class="hash-footer">Made by: @afk.l0l</div>
                </div>
            `;
            document.documentElement.appendChild(overlay);

            const timerElem = overlay.querySelector('#countdown');
            const btn = overlay.querySelector('#redirectNow');

            const interval = setInterval(() => {
                timeLeft--;
                timerElem.textContent = timeLeft;
                if (timeLeft <= 0) {
                    clearInterval(interval);
                    timerElem.textContent = "Expired!";
                    btn.disabled = true;
                    btn.style.opacity = '0.5';
                    btn.textContent = '⏰ Hash Expired';
                }
            }, 1000);

            btn.onclick = () => {
                if (timeLeft > 0) {
                    window.location.href = url;
                } else {
                    alert('Hash has expired. Please refresh and try again.');
                }
            };
        }

        function showResultOverlay(result) {
            result = result.trim();
            if (result.includes('ads.luarmor.net') && result.includes('?hash=')) {
                showLuarmorExpiryOverlay(result);
                return;
            }
            const overlay = document.createElement('div');
            overlay.style.cssText = `
                position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
                background: rgba(10, 10, 10, 0.95); backdrop-filter: blur(5px);
                display: flex; align-items: center; justify-content: center;
                z-index: 2147483647; font-family: Poppins, Arial, sans-serif;
            `;
            overlay.innerHTML = `
                <style>
                    .bp-card { width:90%; max-width:650px; background:#111111; padding:40px 36px; border-radius:16px; box-shadow:0 15px 40px rgba(0,0,0,.8); text-align:center; color:#ffffff; border:1px solid #333333; }
                    .bp-title { font-size:28px; font-weight:600; margin-bottom:10px; color:#ffffff; }
                    .bp-sub { font-size:14px; color:#cccccc; margin-bottom:24px; }
                    .bp-box { background:#1a1a1a; border:1px solid #333333; border-radius:10px; padding:16px 20px; margin-bottom:24px; word-break:break-all; font-size:13px; color:#88ccff; text-align:left; max-height:180px; overflow-y:auto; font-family:'Courier New',monospace; }
                    .bp-btn { padding:14px 40px; border:none; border-radius:10px; font-size:15px; font-weight:600; cursor:pointer; background:#333333; color:#ffffff; }
                    .bp-btn:hover { background:#555555; transform:translateY(-2px); }
                    .bp-footer { margin-top:28px; padding-top:20px; border-top:1px solid #333333; font-size:12px; color:#888888; }
                </style>
                <div class="bp-card">
                    <div class="bp-title">✓ Bypass Successful</div>
                    <div class="bp-sub">Your result is ready</div>
                    <div class="bp-box" id="bp-result">${result}</div>
                    <button class="bp-btn" id="bp-copy">📋 Copy Result</button>
                    <div class="bp-footer">Made by: @afk.l0l</div>
                </div>
            `;
            document.documentElement.appendChild(overlay);
            document.getElementById('bp-copy').onclick = () => {
                navigator.clipboard.writeText(result).then(() => {
                    const btn = document.getElementById('bp-copy');
                    btn.textContent = '✓ Copied!';
                    setTimeout(() => { btn.textContent = '📋 Copy Result'; }, 2000);
                });
            };
        }

        const requestUrl = API_BYPASS_URL + encodeURIComponent(currentUrl);
        fetch(requestUrl)
            .then(res => res.json())
            .then(data => {
                if (data.status === 'success' && data.result) {
                    let finalResult = data.result.trim();
                    try {
                        const urlObj = new URL(finalResult);
                        const toParam = urlObj.searchParams.get('to');
                        if (toParam) finalResult = decodeURIComponent(toParam);
                    } catch(e) {}
                    showResultOverlay(finalResult);
                } else {
                    badge.textContent = '❌ Bypass failed';
                    badge.style.background = '#222222';
                    badge.style.color = '#ff8888';
                    console.error('Bypass failed:', data);
                    alert('Failed to bypass this link.\n' + (data.result || 'Unknown error'));
                }
            })
            .catch(err => {
                badge.textContent = '⚠️ Network error';
                badge.style.background = '#222222';
                badge.style.color = '#ff8888';
                console.error('Network error:', err);
                alert('Network error: ' + err.message);
            });
    }
})();
