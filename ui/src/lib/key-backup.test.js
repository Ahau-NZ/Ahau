import { getPataka } from './key-backup'
const test = require('tape')

test('get conn.json', async t => {
  const connFile = await getPataka()
  console.log(connFile)

  t.end()
})
