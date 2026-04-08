// vw-tpi.js - tpi.li bypass logic

async function runLocalTpiLiBypass() {
  const startTime = Date.now();
  Logger.info('VortixWorld local tpi.li bypass enabled');
  // injectUI is defined in lootlink module but uses shared UI; we can call it if available, or implement simple overlay.
  // For simplicity, we'll rely on the shared injectUI from lootlink (it's in global).
  if (typeof injectUI === 'function') injectUI(ICON_URL);
  else {
    // fallback minimal injection
  }
  updateStatus('Fetching tpi.li link...', 'Extracting token, please wait');
  try {
    const alias = location.pathname.slice(1);
    if (!alias) throw new Error('No alias found in URL');
    Logger.info('TPI.LI alias', alias);
    const response = await fetch(location.href, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const html = await response.text();
    Logger.info('Fetched TPI.LI HTML', `${html.length} bytes`);
    let tokenMatch = html.match(/name="token"\s+value="([^"]+)"/);
    if (!tokenMatch) tokenMatch = html.match(/value="([^"]+)"\s+name="token"/);
    if (!tokenMatch) throw new Error('Token not found in page');
    const token = tokenMatch[1];
    Logger.info('Token extracted', token.substring(0, 20) + '...');
    const offset = 40 + 4 + alias.length + 4;
    if (token.length < offset) throw new Error('Token too short');
    const tokenPart = token.slice(offset);
    Logger.info('Token part for decoding', tokenPart);
    const finalUrl = atob(tokenPart);
    Logger.info('Decoded final URL', finalUrl);
    if (!finalUrl || !finalUrl.startsWith('http')) throw new Error('Invalid final URL');
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    handleBypassSuccess(finalUrl, duration, 'tpili');
  } catch (err) {
    Logger.error('tpi.li bypass failed', err.message);
    updateStatus('❌ Bypass failed', err.message);
    showToast(`Bypass failed: ${err.message}`, true, '⚠️');
    const manualDiv = document.createElement('div');
    manualDiv.innerHTML = `<p style="color:#f97316; margin-top:20px;">Failed to auto-bypass. <a href="${location.href}" style="color:#4f46e5;">Click here to continue manually</a></p>`;
    const overlay = document.getElementById('vortixWorldOverlay');
    if (overlay && overlay.querySelector('.vw-main-content')) overlay.querySelector('.vw-main-content').appendChild(manualDiv);
  }
}

window.runLocalTpiLiBypass = runLocalTpiLiBypass;