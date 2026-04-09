async function runLocalTpiLiBypass() {
  const startTime = Date.now();
  Logger.info('VortixWorld local tpi.li bypass enabled');
  
  if (typeof injectUI === 'function') {
    injectUI(ICON_URL);
    if (typeof updateStatus === 'function') {
      updateStatus('Checking key...', 'Validating API key');
    }
  }
  
  const isValid = await validateStoredKey();
  
  if (!isValid) {
    if (typeof updateStatus === 'function') {
      updateStatus('❌ Key invalid/expired', 'Please update API key in settings');
    }
    showToast('API key invalid/expired', true, ERROR_JPG);
    return;
  }
  
  if (typeof updateStatus === 'function') {
    updateStatus('Key valid', 'Fetching tpi.li link...');
  }
  
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
    if (typeof handleBypassSuccess === 'function') {
      handleBypassSuccess(finalUrl, duration, 'tpili');
    } else {
      window.location.href = finalUrl;
    }
  } catch (err) {
    Logger.error('tpi.li bypass failed', err.message);
    if (typeof handleBypassError === 'function') {
      handleBypassError(err.message);
    } else {
      showToast(`Bypass failed: ${err.message}`, true, ERROR_JPG);
    }
  }
}

window.runLocalTpiLiBypass = runLocalTpiLiBypass;