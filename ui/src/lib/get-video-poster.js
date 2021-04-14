const captureFrame = require('capture-frame')

const INITIAL_PROPORTION = 0.3
// https://www.dictionary.com/e/pop-culture/the-wadsworth-constant/

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

      video.currentTime = Math.ceil(video.duration * INITIAL_PROPORTION) // seek into the video
    }

    function onSeeked () {
      video.pause()
      const frame = captureFrame(video)
      const blob = new Blob([frame.image], { type: 'image/png' }) // eslint-disable-line

      if (blob.size / 1024 < 50) { // if blob is too small, it's likely a blank screen
        video.currentTime += 10
        video.play()
        return
      }

      video.removeEventListener('seeked', onSeeked)

      // unload video element, to prevent memory leaks
      video.src = ''
      video.load()

      resolve(URL.createObjectURL(blob))
    }
  })
}
