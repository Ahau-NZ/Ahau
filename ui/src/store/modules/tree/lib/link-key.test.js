import linkKey from './link-key'

const test = require('tape')

test('linkKey', t => {
  const A = node('%3PJOD7S8fUcCA2B2m58czDqIcf2Wn8btHXpkkqLSvGI=.sha256')
  const B = node('%BypHtE1Mz2evI2a27yuNPa/2AyUP7FWANYOKXa4KLQQ=.sha256')
  const C = node('%4asdazse/aevI2a27yuNPa/2AyUP7FWANYOKXa4KLQQ=.sha256')

  t.equal(
    linkKey('child', [A, B], C),
    linkKey('child', [B, A], C)
  )

  t.end()
})

function node (id) {
  return {
    data: { id }
  }
}
