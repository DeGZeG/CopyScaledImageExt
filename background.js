const DEFAULT_SETTINGS = {
  size: 3000,
}

const CONTEXT_MENU_ID = 'COPYSCALEDIMAGE'

const sendRequestToFront = (info, tab) => {
  if (info.menuItemId !== CONTEXT_MENU_ID) return

  const event = {
    name: 'start',
    data: info
  }

  chrome.tabs.sendMessage(tab.id, event)
}

const initSettings = () => {
  chrome.storage.sync.set({ DEFAULT_SETTINGS })

  for (const settingId in DEFAULT_SETTINGS) {
    chrome.storage.sync.get(settingId, (data) => {
      let value = data[settingId]
      if (!value) {
        value = DEFAULT_SETTINGS[settingId]
        chrome.storage.sync.set({ [settingId]: value })
      }
    })
  }
}

const startApp = () => {
  initSettings()

  chrome.contextMenus.create({
    title: 'Копировать с рескейлом',
    contexts: ['image'],
    id: CONTEXT_MENU_ID
  })

  chrome.contextMenus.onClicked.addListener(sendRequestToFront)
}

startApp()