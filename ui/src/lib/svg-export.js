const pull = require('pull-stream')

// NOTE this assume browser context, needs: fetch, Image, Blob

export default function svgExport (svgInput, width, height, fileName = 'whakapapa-export') {
  const svg = document.importNode(svgInput, true)

  svg.setAttribute('version', '1.1')
  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  svg.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink')
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`)
  svg.removeAttribute('width')
  svg.setAttribute('height', '100vh')

  svg.removeChild(svg.querySelector('.zoomControl'))

  const radius = 35
  const minX = [...svg.querySelectorAll('.node')]
    .reduce(
      (acc, node) => Math.min(node.transform.baseVal[0].matrix.e, acc),
      0
    )
  // NOTE tree are not perfectly symmetric, so moving to half way will often put some off side of map,
  // so we figure out where leftmost node is and translate X to that
  svg.childNodes[0].setAttribute('transform', `translate(${Math.abs(minX)}, ${radius})`) // set global translation, remove scale
  svg.childNodes[0].childNodes[0].removeAttribute('transform') // drop other positioning

  const images = svg.querySelectorAll('image')
  const image = new Image() // eslint-disable-line
  image.crossOrigin = 'anonymous' // required
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  function toDataURL (src, cb) {
    image.onload = () => {
      canvas.height = image.naturalHeight
      canvas.width = image.naturalWidth
      ctx.drawImage(image, 0, 0)
      cb(null, canvas.toDataURL())
    }
    image.src = src
  }

  pull(
    pull.values(images),
    pull.asyncMap((img, cb) => {
      const href = img.getAttribute('href')

      if (href.endsWith('.svg')) {
        fetch(href) // eslint-disable-line
          .then(res => res.text())
          .then(text => {
            img.insertAdjacentHTML(
              'beforebegin',
              text
                .replace(/<\?xml[^>]*\?>/, '')
                // .replace(/[\n\t]+/g, ' ')
            )
            const svg = img.previousElementSibling
            svg.setAttribute('width', img.getAttribute('width'))
            svg.setAttribute('height', img.getAttribute('height'))
            svg.setAttribute('x', img.getAttribute('x'))
            svg.setAttribute('y', img.getAttribute('y'))

            img.parentElement.removeChild(img)

            cb(null)
          })
      } // eslint-disable-line
      else {
        toDataURL(img.getAttribute('href'), (err, dataURL) => {
          if (err) return cb(err)

          // img.setAttribute('href', dataURL) // new but less supported
          img.removeAttribute('href')
          img.setAttribute('xlink:href', dataURL)
          cb(null)
        })
      }
    }),
    pull.collect(err => {
      if (err) return console.error(err)

      // tidy ups
      const svgStr = svg.outerHTML
        .replace(/\sdata-v-[a-z0-9]+=""/g, '')

      const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' }) // eslint-disable-line
      const dataURL = URL.createObjectURL(blob)

      const a = document.createElement('a')
      a.setAttribute('href', dataURL)
      a.setAttribute('download', fileName + '.svg')
      a.setAttribute('target', '_blank')
      a.click()
    })
  )
}
