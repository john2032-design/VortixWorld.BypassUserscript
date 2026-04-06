// ==UserScript==
// @name         Auto Luarmor & Link Shortener Bypass
// @namespace    https://github.com/camper
// @version      1.4
// @description  Automatically collects Luarmor keys, clicks through ads, and bypasses link shorteners using a remote API.
// @author       Camper
// @match        *://*.luarmor.net/*
// @match        *://loot-link.com/*
// @match        *://lootdest.org/*
// @match        *://lootdest.com/*
// @match        *://lootlink.org/*
// @match        *://lootlinks.co/*
// @match        *://lootdest.info/*
// @match        *://links-loot.com/*
// @match        *://linksloot.net/*
// @match        *://work.ink/*
// @match        *://workink.net/*
// @match        *://linkvertise.com/*
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
            ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click'].forEach(eventType => {
                const event = new MouseEvent(eventType, {
                    view: window,
                    bubbles: true,
                    cancelable: true,
                    button: 0,
                    buttons: 1,
                    clientX: rect.left + rect.width / 2,
                    clientY: rect.top + rect.height / 2
                });
                element.dispatchEvent(event);
            });
            if (element.onclick) element.onclick(new Event('click'));
            element.click();
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

        let isPaused = false;
        let currentKey = "N/A";
        let navAttempted = false;

        if (document.getElementById('autoLuaUI')) return;

        const ui = document.createElement("div");
        ui.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            width: auto;
            max-width: 400px;
            background: transparent;
            color: #fff;
            font-family: Poppins, Arial, sans-serif;
            z-index: 2147483647;
            font-size: 13px;
            display: flex;
            justify-content: center;
            pointer-events: none;
        `;

        ui.innerHTML = `
            <style>
                #autoLuaUI * { box-sizing: border-box; font-family: Poppins, Arial, sans-serif; }
                #autoLuaUI .title {
                    font-size: 18px; font-weight: 600; margin-bottom: 6px;
                    background: linear-gradient(135deg, #7b2cbf, #c77dff);
                    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
                }
                #autoLuaUI .info-box {
                    background: #0f0f14; border: 1px solid #2a2a40;
                    border-radius: 10px; padding: 12px 14px; margin-bottom: 14px;
                }
                #autoLuaUI .info-row {
                    display: flex; justify-content: space-between;
                    align-items: center; gap: 8px;
                }
                #autoLuaUI .label { color: #a0a0c0; font-size: 11px; white-space: nowrap; }
                #autoLuaUI .key-val {
                    font-family: 'Courier New', monospace; font-size: 11px;
                    color: #4ea8ff; word-break: break-all; text-align: right;
                }
                #autoLuaUI .btn-group { display: flex; gap: 8px; margin-bottom: 14px; }
                #autoLuaUI .btn {
                    flex: 1; padding: 10px; border: none; border-radius: 10px;
                    font-size: 12px; font-weight: 600; cursor: pointer;
                    transition: all 0.3s ease; font-family: Poppins, sans-serif;
                }
                #autoLuaUI #toggleBtn {
                    background: linear-gradient(135deg, #7b2cbf, #5a189a); color: #fff;
                }
                #autoLuaUI #toggleBtn:hover {
                    background: linear-gradient(135deg, #9d4edd, #7b2cbf);
                    transform: translateY(-2px); box-shadow: 0 6px 20px rgba(123,44,191,.4);
                }
                #autoLuaUI .footer {
                    margin-top: 14px; padding-top: 12px; border-top: 1px solid #2a2a40;
                    font-size: 10px; color: #6a6a8a; text-align: center;
                }
                #autoLuaUI .dot {
                    width: 8px; height: 8px; background: #4ade80;
                    border-radius: 50%; box-shadow: 0 0 8px #4ade80;
                    display: inline-block; margin-right: 6px;
                }
            </style>
            <div id="autoLuaUI" style="
                width:320px;
                background:linear-gradient(180deg,#1b1b27,#16161f);
                border-radius:16px;
                padding:16px;
                box-shadow:0 10px 30px rgba(0,0,0,.6),0 0 40px rgba(123,44,191,.15);
                border:1px solid rgba(123,44,191,.3);
                pointer-events: auto;">
                <div style="display:flex; align-items:center; margin-bottom:4px;">
                    <span class="dot"></span>
                    <div class="title">Auto Luarmor</div>
                </div>
                <div class="info-box">
                    <div class="info-row">
                        <span class="label">Key</span>
                        <span id="keyDisplay" class="key-val">N/A</span>
                    </div>
                </div>
                <div class="btn-group">
                    <button id="toggleBtn" class="btn">Pause</button>
                </div>
                <div class="footer">Made by: Camper</div>
            </div>
        `;

        if (document.body) {
            document.body.appendChild(ui);
        } else {
            document.addEventListener('DOMContentLoaded', () => document.body.appendChild(ui));
        }

        const toggleBtn = ui.querySelector("#toggleBtn");
        const keyDisplay = ui.querySelector("#keyDisplay");

        toggleBtn.addEventListener("click", () => {
            isPaused = !isPaused;
            toggleBtn.innerHTML = isPaused ? "Resume" : "Pause";
            if (!isPaused) {
                navAttempted = false;
                onLoad();
            }
        });

        function setKey(key) {
            currentKey = key;
            if (keyDisplay) keyDisplay.textContent = key;
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
            if (isPaused) return;
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

        async function waitForButtonToBeClickable() {
            if (isPaused || navAttempted) return;
            if (isBlocked()) { setTimeout(waitForButtonToBeClickable, 500); return; }
            const btn = document.getElementById('nextbtn');
            if (btn && btn.offsetParent !== null && !(btn.style.cursor === 'not-allowed' || btn.disabled)) {
                console.log('[AutoLuarmor] Clicking nextbtn');
                simulateClick(btn);
                navAttempted = true;
                setTimeout(() => {
                    if (window.location.href === currentUrl) {
                        console.log('[AutoLuarmor] Navigation failed, forcing redirect');
                        forceNavigation(btn);
                    }
                }, 1500);
            } else {
                setTimeout(waitForButtonToBeClickable, 500);
            }
        }

        function onLoad() {
            if (isPaused) return;
            if (isBlocked()) { setTimeout(onLoad, 500); return; }
            grabKeyOnce();
            checkProgress();
            waitForButtonToBeClickable();
        }

        if (document.readyState === "complete") {
            onLoad();
        } else {
            window.addEventListener("load", onLoad);
        }
    } else {
        const shortenerDomains = [
            'loot-link.com', 'lootdest.org', 'lootdest.com', 'lootlink.org',
            'lootlinks.co', 'lootdest.info', 'links-loot.com', 'linksloot.net',
            'work.ink', 'workink.net', 'linkvertise.com'
        ];
        const isShortenerDomain = shortenerDomains.some(domain =>
            hostname === domain || hostname.endsWith('.' + domain)
        );
        if (!isShortenerDomain) return;

        console.log('[Bypass] Starting for', currentUrl);

        function showResultOverlay(result) {
            result = result.trim();
            const overlay = document.createElement('div');
            overlay.style.cssText = `
                position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
                background: linear-gradient(135deg, #0f0f14 0%, #1a1a2e 100%);
                display: flex; align-items: center; justify-content: center;
                z-index: 2147483647; font-family: Poppins, Arial, sans-serif;
            `;
            overlay.innerHTML = `
                <style>
                    .bp-card { width:90%; max-width:650px; background:linear-gradient(180deg,#1b1b27,#16161f); padding:40px 36px; border-radius:16px; box-shadow:0 15px 40px rgba(0,0,0,.6),0 0 80px rgba(123,44,191,.15); text-align:center; color:#fff; border:1px solid rgba(123,44,191,.3); }
                    .bp-title { font-size:28px; font-weight:600; margin-bottom:10px; background:linear-gradient(135deg,#7b2cbf,#c77dff); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
                    .bp-sub { font-size:14px; color:#a0a0c0; margin-bottom:24px; }
                    .bp-box { background:#0f0f14; border:1px solid #2a2a40; border-radius:10px; padding:16px 20px; margin-bottom:24px; word-break:break-all; font-size:13px; color:#4ea8ff; text-align:left; max-height:180px; overflow-y:auto; font-family:'Courier New',monospace; }
                    .bp-btn { padding:14px 40px; border:none; border-radius:10px; font-size:15px; font-weight:600; cursor:pointer; background:linear-gradient(135deg,#5a189a,#7b2cbf); color:#fff; }
                    .bp-btn:hover { background:linear-gradient(135deg,#7b2cbf,#9d4edd); transform:translateY(-2px); }
                    .bp-footer { margin-top:28px; padding-top:20px; border-top:1px solid #2a2a40; font-size:12px; color:#6a6a8a; }
                </style>
                <div class="bp-card">
                    <div class="bp-title">✓ Bypass Successful</div>
                    <div class="bp-sub">Your result is ready</div>
                    <div class="bp-box" id="bp-result">${result}</div>
                    <button class="bp-btn" id="bp-copy">📋 Copy Result</button>
                    <div class="bp-footer">Made by: Camper</div>
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
                    console.error('Bypass failed:', data);
                    alert('Failed to bypass this link.\n' + (data.result || 'Unknown error'));
                }
            })
            .catch(err => {
                console.error('Network error:', err);
                alert('Network error: ' + err.message);
            });
    }
})();