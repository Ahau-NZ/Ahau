import * as csv from './csv'

const test = require('tape')

test('image (export)', t => {
  const unbox = 'Ic28TLLsg6/VxMHTaMoIytL0M1XbuM7prqJ6rf5I%2BU8%3D.boxs'
  const image = {
    blob: '&+Kcwdy0rdeQaR0XhN6/TuFqpxpy8ipWD4vBGzGuRoiU=.sha256',
    mimeType: 'image/png',
    size: 576003,
    width: null,
    height: null,
    uri: `http://localhost:28067/get/%26%2BKcwdy0rdeQaR0XhN6PTuFqpxpy8ipWD4vBGzGuRoiU%3D.sha256?unbox=${unbox}`
  }

  const imageStr = csv.exportImage(image)

  t.equal(
    imageStr,
    'ssb:blob/classic/-Kcwdy0rdeQaR0XhN6_TuFqpxpy8ipWD4vBGzGuRoiU=?mimeType=image%2Fpng&unbox=Ic28TLLsg6%2FVxMHTaMoIytL0M1XbuM7prqJ6rf5I%2BU8%3D.boxs',
    'can convert an image to uri'
  )

  const imageObj = csv.importImage(imageStr)

  t.deepEqual(
    imageObj,
    {
      blob: '&+Kcwdy0rdeQaR0XhN6/TuFqpxpy8ipWD4vBGzGuRoiU=.sha256',
      mimeType: 'image/png',
      unbox: 'Ic28TLLsg6/VxMHTaMoIytL0M1XbuM7prqJ6rf5I+U8=.boxs'
      // size: 576003
    },
    'can convert uri to an image object'
  )

  t.end()
})
