const scaleAndCopyImage = (imageUrl) => {
  if (!imageUrl) return
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  const image = new Image()
  image.crossOrigin = 'anonymous'
  image.src = imageUrl

  image.onload = async () => {
    const { width, height } = await getScaledSizeOfImage(image)
    canvas.width = width
    canvas.height = height
    ctx.drawImage(image, 0, 0, width, height)
    canvas.toBlob(async (blob) => {
      try {
        await navigator.clipboard.write([
          new ClipboardItem({
            [blob.type]: blob
          })
        ])
        alertify.success(`Скопировано! ${width}x${height}`, 3)
      } catch (e) {
        alertify.error('Не удалось записать изображение в буфер обмена', 6)
      }
    })
  }
}

const getScaledSizeOfImage = async (image) => {
  const size = await getSizeSetting()
  const originalWidth = image.naturalWidth
  const originalHeight = image.naturalHeight
  const isWidthHigher = originalWidth > originalHeight
  let newWidth = originalWidth
  let newHeight = originalHeight

  if (originalWidth > size || originalHeight > size) {
    if (isWidthHigher) {
      newWidth = size
      newHeight = Math.floor(originalHeight / originalWidth * newWidth)
    } else {
      newHeight = size
      newWidth = Math.floor(originalWidth / originalHeight * newHeight)
    }
  }

  return {
    width: newWidth,
    height: newHeight
  }
}

const getSizeSetting = () => {
  return new Promise((resolve) => {
    chrome.storage.sync.get('size', (sizeData) => {
      chrome.storage.sync.get('DEFAULT_SETTINGS', (settingsData) => {
        if (!sizeData['size']) resolve(settingsData.DEFAULT_SETTINGS.size)
        resolve(+sizeData['size'])
      })
    })
  })
}

chrome.runtime.onMessage.addListener((message) => {
  if (message?.name === 'start') {
    const imageUrl = message?.data?.srcUrl
    scaleAndCopyImage(imageUrl)
  }
})