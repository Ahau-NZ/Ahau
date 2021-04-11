const captureFrame = require('capture-frame')

export default function getVideoPoster (uri) {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    video.addEventListener('canplay', onCanPlay)

    video.volume = 0
    video.autoplay = true
    video.muted = true // most browsers block autoplay unless muted
    video.setAttribute('crossOrigin', 'anonymous') // optional, when cross-domain
    video.src = uri

    function onCanPlay () {
      video.removeEventListener('canplay', onCanPlay)
      video.addEventListener('seeked', onSeeked)

      video.currentTime = 2 // seek 2 seconds into the video
    }

    function onSeeked () {
      video.removeEventListener('seeked', onSeeked)

      const frame = captureFrame(video)

      // unload video element, to prevent memory leaks
      video.pause()
      video.src = ''
      video.load()

      resolve(URL.createObjectURL(
        new Blob([frame.image], { type: 'image/png' }) // eslint-disable-line
      ))
    }
  })
}
