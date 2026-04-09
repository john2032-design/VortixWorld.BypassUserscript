const SPDM_CONFIG = {
  linkvertisePath: 'https://linkvertise.com/376138/V19vkk9eHRFH?o=sharing',
  apiBase: 'https://spdmteam.com/api/keysystemv2?step=1&advertiser=linkvertise',
  finalUrl: 'https://spdmteam.com/key-system-getkey?advertiser=linkvertise',
  cookieMaxAge: 86400
}

let spdmRedirected = false
const SPDM_RETURN_URL_KEY = 'spdm_return_url'

function storeSpdmReturnUrl(url) {
  try { sessionStorage.setItem(SPDM_RETURN_URL_KEY, url) } catch (e) {}
}
function getSpdmReturnUrl() {
  try { return sessionStorage.getItem(SPDM_RETURN_URL_KEY) || '' } catch (e) { return '' }
}
function clearSpdmReturnUrl() {
  try { sessionStorage.removeItem(SPDM_RETURN_URL_KEY) } catch (e) {}
}

function hasLinkvertiseSession() {
  try {
    const cookies = document.cookie || ''
    return /linkvertise|lv_.*session|session/i.test(cookies)
  } catch (e) { return false }
}

function getSpdmteamParams() {
  try {
    const url = new URL(window.location.href)
    let hwid = url.searchParams.get('hwid') || ''
    let zone = url.searchParams.get('zone') || ''
    let os = url.searchParams.get('os') || ''
    if (!hwid && document.referrer) {
      try {
        const ref = new URL(document.referrer)
        if (ref.hostname.includes('spdmteam.com')) {
          hwid = ref.searchParams.get('hwid') || hwid
          zone = ref.searchParams.get('zone') || zone
          os = ref.searchParams.get('os') || os
        }
      } catch (_) {}
    }
    return { hwid, zone, os }
  } catch (e) { return { hwid: '', zone: '', os: '' } }
}

function getSpdmFromHash() {
  try {
    const hash = window.location.hash.replace(/^#/, '')
    if (!hash) return {}
    const params = new URLSearchParams(hash)
    return { hwid: params.get('hwid') || '', zone: params.get('zone') || '', os: params.get('os') || '' }
  } catch (_) { return {} }
}

function setSpdmteamCookie(hwidValue) {
  if (!hwidValue) return
  try {
    const clearBases = ['hwid=; Max-Age=0; Path=/', 'hwid=; Max-Age=0; Path=/; Domain=spdmteam.com', 'hwid=; Max-Age=0; Path=/; Domain=.spdmteam.com']
    clearBases.forEach(c => { document.cookie = c })
    const expires = new Date(Date.now() + SPDM_CONFIG.cookieMaxAge * 1000).toUTCString()
    const cookie = `hwid=${encodeURIComponent(hwidValue)}; Domain=.spdmteam.com; Path=/; SameSite=None; Secure; Max-Age=${SPDM_CONFIG.cookieMaxAge}; Expires=${expires}`
    document.cookie = cookie
  } catch (e) {}
}

function isSpdmteamKeyEntryPage() {
  return window.location.hostname.includes('spdmteam.com') && window.location.pathname.startsWith('/key-system-1')
}

function isSpdmteamSocialPage() {
  return window.location.hostname.includes('spdmteam.com') && window.location.pathname.startsWith('/social/key1unlocker')
}

function isLinkvertiseSpdteamPage() {
  if (!window.location.hostname.includes('linkvertise.com')) return false
  const path = window.location.pathname.replace(/^\/+/, '').toLowerCase()
  return path.startsWith('spdteam') || path.includes('376138/')
}

async function handleSpdmteamFlow() {
  const isValid = await validateStoredKey()
  if (!isValid) {
    Logger.warn('SPDM bypass skipped: invalid API key')
    return false
  }

  if (isSpdmteamKeyEntryPage()) return false

  if (isSpdmteamSocialPage()) {
    const hashParams = getSpdmFromHash()
    const searchParams = getSpdmteamParams()
    const hwid = hashParams.hwid || searchParams.hwid || ''
    const zone = hashParams.zone || searchParams.zone || ''
    const os = hashParams.os || searchParams.os || 'android'
    if (hwid) setSpdmteamCookie(hwid)
    const params = new URLSearchParams()
    if (hwid) params.set('hwid', hwid)
    if (zone) params.set('zone', zone)
    if (os) params.set('OS', os)
    const apiUrl = params.toString() ? `${SPDM_CONFIG.apiBase}&${params.toString()}` : SPDM_CONFIG.apiBase
    if (!hasLinkvertiseSession()) {
      storeSpdmReturnUrl(window.location.href)
      window.location.replace(SPDM_CONFIG.linkvertisePath)
      return true
    }
    if (spdmRedirected) return false
    spdmRedirected = true
    clearSpdmReturnUrl()
    window.location.replace(apiUrl)
    return true
  }

  if (isLinkvertiseSpdteamPage()) {
    let os = ''
    try { os = sessionStorage.getItem('spdm_os') || '' } catch (e) {}
    const hashParams = getSpdmFromHash()
    let refHwid = '', refZone = '', refOs = ''
    try {
      const ref = new URL(document.referrer)
      if (ref.hostname.includes('spdmteam.com')) {
        refHwid = ref.searchParams.get('hwid') || ''
        refZone = ref.searchParams.get('zone') || ''
        refOs = ref.searchParams.get('os') || ''
      }
    } catch (_) {}
    const hwid = hashParams.hwid || refHwid || ''
    const zone = hashParams.zone || refZone || ''
    const finalOs = os || hashParams.os || refOs || 'android'
    const params = new URLSearchParams()
    if (hwid) params.set('hwid', hwid)
    if (zone) params.set('zone', zone)
    if (finalOs) params.set('OS', finalOs)
    const apiUrl = params.toString() ? `${SPDM_CONFIG.apiBase}&${params.toString()}` : SPDM_CONFIG.apiBase
    if (spdmRedirected) return false
    spdmRedirected = true
    clearSpdmReturnUrl()
    window.location.replace(apiUrl)
    return true
  }

  if (window.location.hostname.includes('linkvertise.com')) {
    const returnUrl = getSpdmReturnUrl()
    if (returnUrl) {
      if (!hasLinkvertiseSession()) {
        setTimeout(() => handleSpdmteamFlow(), 1200)
        return false
      }
      clearSpdmReturnUrl()
      window.location.replace(returnUrl)
      return true
    }
  }
  return false
}

function runSpdmBypass() {
  handleSpdmteamFlow()
}

window.runSpdmBypass = runSpdmBypass