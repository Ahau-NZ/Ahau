import { Getters } from './lib/test-helpers'
import { LargeWhakapapa } from './fixtures'

const test = require('tape')

/*
For example diagrams please see: https://hackmd.io/mv0WnB8yRXKxnSwpIJ6eKw
*/

test('vuex/whakapapa getters.findPathToRoot', t => {
  const state = LargeWhakapapa()

  const muna = state.view.focus
  const myra = '%xYbaNaz4XSYJHSaPDYT4A8wzRp5+L2WLvDGhwfp0pyg=.sha256' // partner

  const rena = '%yCJeYffyCgbNoXpvYZIbI1DaU3lfqWkvfRSUbS0K/S4=.sha256'
  const bill = '%72WcJq+oQkAHSpFKOKvtxO7fb+9Qa7jd+hoID0FU6c8=.sha256' // partner

  const claudine = '%uC5WUuPTkEZ5ZgJmHbdHB0qPEBEvJSY1xfwCUFQ3tBo=.sha256'
  const stacey = '%WfsswbivkRIRm7UhL8TZVThW5PL3H36MA/zmq/gsFtg=.sha256' // inferred partner to claudine
  const susan = '%T2Tqv5z3gjeddMP+Qcej0tqu+8J9BWgnSPhRuQgw6/c=.sha256' // partner to stacey

  const zara = '%povL918CbyyPHeJyauLCMN4Y0+0uTt32QHReJDBI8/8=.sha256'
  const makene = '%ViZ1dOInon/WKmg0c1Yj/5fBsmUYvZwVT3IuZhw9VRc=.sha256' // partner

  const otene = '%cUNHwuwkKuc5M1pgynnnnldAr4e7hSiiw/den2ssMeA=.sha256'

  // birth child to rena, whangai child to muna
  const tua = '%GXP1GyoYqGVth0XvuVJ1zZ6mES7JrLLihxyOTUTiBBg=.sha256'

  // extended family step-sibling
  const zavien = '%9ZM1o9UiagdzSWl+c4WnOW0qqsdfBz3oAwMLq/TkalI=.sha256'

  const { findPathToRoot } = Getters(state)

  const equalPath = (actual, expected, comment) => {
    t.deepEqual(actual.sort(), expected.sort(), comment)
  }

  equalPath(
    findPathToRoot(null),
    [],
    'No id'
  )

  equalPath(
    findPathToRoot(muna),
    [muna],
    'No hops'
  )

  equalPath(
    findPathToRoot(myra),
    [myra, muna],
    'One hop across'
  )

  equalPath(
    findPathToRoot(rena),
    [rena, muna],
    'One hop up'
  )

  equalPath(
    findPathToRoot(bill),
    [rena, bill, muna],
    'One hop across, and one hop up'
  )

  equalPath(
    findPathToRoot(claudine),
    [rena, claudine, muna],
    'One hop across and two hops up'
  )

  equalPath(
    findPathToRoot(stacey),
    [rena, claudine, stacey, muna],
    'Two hops across and two hops up'
  )

  equalPath(
    findPathToRoot(susan),
    [rena, claudine, stacey, susan, muna],
    'One hop up, one hop across and two hops up'
  )

  equalPath(
    findPathToRoot(zara),
    [rena, claudine, zara, muna],
    'Three hops up'
  )

  equalPath(
    findPathToRoot(makene),
    [rena, claudine, zara, makene, muna],
    'One hop across and three hops up (including collapsed)'
  )

  equalPath(
    findPathToRoot(otene),
    [rena, claudine, zara, otene, muna],
    'Four hops up (including collapsed)'
  )

  equalPath(
    findPathToRoot(tua),
    [tua, muna],
    'finds path to whangai child'
  )

  equalPath(
    findPathToRoot(zavien),
    [rena, claudine, stacey, zavien, muna],
    'finds path to extended family member'
  )

  t.end()
})
