// ==UserScript==
// @name         Auto Luarmor & Link Shortener Bypass
// @namespace    https://github.com/camper
// @version      1.3
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
            const isVisible = rect.width > 0 && rect.height > 0;
            if (!isVisible) return false;
            element.focus();
            const touchStart = new TouchEvent('touchstart', {
                bubbles: true,
                cancelable: true,
                view: window,
                touches: [new Touch({ identifier: Date.now(), target: element, clientX: rect.left + 1, clientY: rect.top + 1, radiusX: 1, radiusY: 1, rotationAngle: 0, force: 1 })],
                targetTouches: [],
                changedTouches: []
            });
            element.dispatchEvent(touchStart);
            const touchEnd = new TouchEvent('touchend', {
                bubbles: true,
                cancelable: true,
                view: window,
                touches: [],
                targetTouches: [],
                changedTouches: [new Touch({ identifier: Date.now(), target: element, clientX: rect.left + 1, clientY: rect.top + 1, radiusX: 1, radiusY: 1, rotationAngle: 0, force: 0 })]
            });
            element.dispatchEvent(touchEnd);
            const mouseEvent = new MouseEvent('click', {
                view: window,
                bubbles: true,
                cancelable: true,
                button: 0,
                pointerId: 1,
                pressure: 1,
                isPrimary: true
            });
            element.dispatchEvent(mouseEvent);
            element.click();
            return true;
        } catch(e) {
            try { element.click(); } catch(e2) {}
            return false;
        }
    }

    if (isLuarmor) {
        localStorage.setItem('ppaccepted', 'true');
        localStorage.setItem('trufflemayo', '1455660788512591984;87f07b547f1faf3d115b1592ddf41b25');
        console.log('Keys injected: ppaccepted & trufflemayo');

        let isPaused = false;
        let currentKey = "N/A";

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
                #autoLuaUI .subtitle { font-size: 11px; color: #a0a0c0; margin-bottom: 14px; }
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

        toggleBtn.addEventListener("mouseenter", () => {
            toggleBtn.style.background = "rgba(255,255,255,0.2)";
        });
        toggleBtn.addEventListener("mouseleave", () => {
            toggleBtn.style.background = "";
        });

        toggleBtn.addEventListener("click", () => {
            isPaused = !isPaused;
            toggleBtn.innerHTML = isPaused ? "Resume" : "Pause";
            if (!isPaused) setTimeout(() => location.reload(), 500);
        });

        function setKey(key) {
            currentKey = key;
            if (keyDisplay) keyDisplay.textContent = key;
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

        function grabKeyOnce() {
            if (currentKey !== "N/A") return;
            const keyElement = document.querySelector('h6.mb-0.text-sm');
            if (keyElement) {
                const keyText = keyElement.textContent.trim();
                if (keyText) setKey(keyText);
            }
        }

        function onLoad() {
            if (isPaused) return;
            if (isBlocked().blocked) { setTimeout(onLoad, 500); return; }
            grabKeyOnce();
            checkProgress();
            waitForButtonToBeClickable();
        }

        function checkProgress() {
            if (isPaused) return;
            if (isBlocked().blocked) return;
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

        let btnClicked = false;
        function waitForButtonToBeClickable() {
            if (isPaused || btnClicked) return;
            if (isBlocked().blocked) { setTimeout(waitForButtonToBeClickable, 500); return; }
            const btn = document.getElementById('nextbtn');
            if (btn && btn.offsetParent !== null && !(btn.style.cursor === 'not-allowed' || btn.disabled)) {
                simulateClick(btn);
                btnClicked = true;
                setTimeout(checkWindowFocus, 1000);
            } else {
                setTimeout(waitForButtonToBeClickable, 500);
            }
        }

        function checkWindowFocus() {
            if (isPaused || btnClicked) return;
            if (isBlocked().blocked) return;
            if (!document.hasFocus()) { setTimeout(checkWindowFocus, 500); return; }
            setTimeout(() => {
                const btn = document.getElementById('nextbtn');
                if (btn && btn.offsetParent !== null && !(btn.style.cursor === 'not-allowed' || btn.disabled)) {
                    simulateClick(btn);
                    btnClicked = true;
                }
            }, 500);
        }

        if (document.readyState === "complete") {
            onLoad();
        } else {
            window.addEventListener("load", onLoad);
        }
    } else {
        const shortenerDomains = [
            'loot-link.com',
            'lootdest.org',
            'lootdest.com',
            'lootlink.org',
            'lootlinks.co',
            'lootdest.info',
            'links-loot.com',
            'linksloot.net',
            'work.ink',
            'workink.net',
            'linkvertise.com'
        ];

        const isShortenerDomain = shortenerDomains.some(domain =>
            hostname === domain || hostname.endsWith('.' + domain)
        );

        if (!isShortenerDomain) return;

        console.log('Bypassing ad step for', currentUrl);

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
                    .bp-box::-webkit-scrollbar { width:4px; } .bp-box::-webkit-scrollbar-track { background:#1a1a2e; border-radius:10px; } .bp-box::-webkit-scrollbar-thumb { background:#7b2cbf; border-radius:10px; }
                    .bp-btn { padding:14px 40px; border:none; border-radius:10px; font-size:15px; font-weight:600; cursor:pointer; transition:all 0.3s ease; font-family:Poppins,sans-serif; background:linear-gradient(135deg,#5a189a,#7b2cbf); color:#fff; }
                    .bp-btn:hover { background:linear-gradient(135deg,#7b2cbf,#9d4edd); transform:translateY(-2px); box-shadow:0 6px 20px rgba(123,44,191,.4); }
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
                    btn.style.background = 'linear-gradient(135deg,#10b981,#059669)';
                    setTimeout(() => {
                        btn.textContent = '📋 Copy Result';
                        btn.style.background = '';
                    }, 2000);
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
                alert('Network error while contacting bypass API.\n' + err.message);
            });
    }
})();