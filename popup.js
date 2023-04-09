const updateSetting = (settingId, value) => {
  chrome.storage.sync.set({ [settingId]: value })
}

const handleInput = (event) => {
  const settingId = event.target.id
  const value = event.target.value
  updateSetting(settingId, value)
}

const loadSettings = () => {
  chrome.storage.sync.get('DEFAULT_SETTINGS', (data) => {
    const DEFAULT_SETTINGS = data.DEFAULT_SETTINGS

    for (const settingId in DEFAULT_SETTINGS) {
      const settingInput = document.getElementById(settingId)

      chrome.storage.sync.get(settingId, (data) => {
        settingInput.value = data[settingId]
      })

      settingInput.addEventListener('input', handleInput)
    }
  })
}

loadSettings()