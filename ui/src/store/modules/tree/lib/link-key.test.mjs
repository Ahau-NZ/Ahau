import test from 'tape'

import linkKey from './link-key.mjs'

test('linkKey', t => {
  const A = node('%3PJOD7S8fUcCA2B2m58czDqIcf2Wn8btHXpkkqLSvGI=.sha256')
  const B = node('%BypHtE1Mz2evI2a27yuNPa/2AyUP7FWANYOKXa4KLQQ=.sha256')
  const C = node('%4asdazse/aevI2a27yuNPa/2AyUP7FWANYOKXa4KLQQ=.sha256')

  t.equal(linkKey('child', A, B), 'child-3PJOD7S8-BypHtE1M')

  // link from multiple parents to child
  t.equal(
    linkKey('child', [A, B], C),
    'child-3PJOD7S8+BypHtE1M-4asdazse'
  )
  t.equal(
    linkKey('child', [A, B], C),
    linkKey('child', [B, A], C)
  )

  // links between partners
  t.equal(linkKey('partner', [A, B]), 'partner-3PJOD7S8+BypHtE1M')
  t.equal(
    linkKey('partner', [A, B]),
    linkKey('partner', [B, A])
  )

  t.end()
})

function node (id) {
  return {
    data: { id }
  }
}
