const getImageBlobByImageObject = (image, size) => {
  return new Promise(async (resolve) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    canvas.width = size.width
    canvas.height = size.height
    ctx.drawImage(image, 0, 0, size.width, size.height)
    try {
      canvas.toBlob(async (blob) => resolve(blob))
    } catch (e) {
      console.error('Не удалось получить Blob через Image Object', e)
      resolve(null)
    }
  })
}

const getImageBlobBySrcUrl = (imageSrc, size) => {
  return new Promise(async (resolve) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const image = new Image()
    image.crossOrigin = 'anonymous'
    image.src = imageSrc

    image.onload = async () => {
      canvas.width = size.width
      canvas.height = size.height
      ctx.drawImage(image, 0, 0, size.width, size.height)
      try {
        canvas.toBlob(async (blob) => resolve(blob))
      } catch (e) {
        console.error('Не удалось получить Blob через Image Url', e)
        resolve(null)
      }
    }
  })
}


const scaleAndCopyImage = async (image) => {
  if (!image) return
  const size = await getScaledSizeOfImage(image)
  let imageBlob = await getImageBlobByImageObject(image, size)
  if (!imageBlob) imageBlob = await getImageBlobBySrcUrl(image.src, size)
  if (!imageBlob) {
    const error = 'Не удалось получить Blob изображения'
    alertify.error(error, 6)
    console.error(error)
    return
  }

  try {
    await navigator.clipboard.write([
      new ClipboardItem({
        [imageBlob.type]: imageBlob
      })
    ])
    alertify.success(`Скопировано! ${size.width}x${size.height}`, 3)
  } catch (e) {
    alertify.error('Не удалось записать изображение в буфер обмена', 6)
    console.error(e)
  }
}

const downloadImage = async (image) => {
  if (!image) return
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  canvas.width = image.naturalWidth
  canvas.height = image.naturalHeight
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height)
  canvas.toBlob(async (blob) => {
    try {
      const link = document.createElement('a')
      link.download = 'filename.png'
      link.href = canvas.toDataURL()
      link.click()
    } catch (e) {
      alertify.error('Не удалось загрузить изображение', 3)
    }
  })
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

let lastClickedImageElement = null
document.addEventListener('contextmenu', (event) => {
  lastClickedImageElement = event.target
}, true)

chrome.runtime.onMessage.addListener((message) => {
  if (message?.name === 'start') {
    scaleAndCopyImage(lastClickedImageElement)
    // downloadImage(lastClickedImageElement)
  }
})