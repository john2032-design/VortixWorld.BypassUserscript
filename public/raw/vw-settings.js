// ... inside createSettingsUI, replace the saveKeyBtn event listener:

    saveKeyBtn.addEventListener('click', async (e) => {
      e.preventDefault()
      const key = keyInput.value.trim()
      if (!key) {
        showToast('Please enter a key', true)
        return
      }
      saveKeyBtn.textContent = 'Saving...'
      saveKeyBtn.disabled = true
      const result = await validateKey(key)
      if (result.valid) {
        setStoredValue(keys.userKey, key)
        updateKeyUI(result)
        window.__vw_keyValid = true
        window.VW_API_KEY = key
        showToast('Key saved successfully!')
        clearKeyCache()
      } else {
        updateKeyUI(result)
        showToast('Cannot save invalid key', true)
      }
      saveKeyBtn.textContent = 'Save Key'
      saveKeyBtn.disabled = false
    })