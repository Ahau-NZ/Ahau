import { merge } from 'lodash-es'

import src from '../index.mjs'
const { getters } = src()

// this builds the getters that some other getters need to be injected with
export function Getters (state) {
  const activeGetters = {}

  const getterNames = Object.keys(getters)
    .filter(getterName => !['pathToRoot'].includes(getterName))

  let count = 0

  while (getterNames.length) {
    if (++count > 1000) throw new Error(`Getters helper stuck on: ${getterNames.join(', ')}`)
    const getterName = getterNames.shift()

    try {
      const result = getters[getterName](state, activeGetters)
      // if it explodes, it was probably dependant on some other getters
      // so if it doesn't add it to the activeGetters

      if (typeof result === 'function') activeGetters[getterName] = result
      else {
        Object.defineProperty(activeGetters, getterName, {
          get: () => getters[getterName](state, activeGetters)
        })
      }
    } catch (err) {
      // not ready yet!
      getterNames.push(getterName)
    }
  }

  return activeGetters

  // if this stops working, just hard-code a solution like this:

  // return {
  //   getChildIds: getters.getChildIds(state),
  //   getParentIds: getters.getParentIds(state),
  //   getPartnerIds: getters.getPartnerIds(state),
  //   getImportantRelationship: getters.getImportantRelationship(state)
  // }
}

export function State (state) {
  const base = {
    view: {
      focus: 'TODO: set this',
      importantRelationships: {},
      ignoredProfiles: [],
      changes: {
        focus: null,
        collapsed: {},
        showExtendedFamily: false // current default
      }
    },
    childLinks: {},
    partnerLinks: {}
  }

  return merge(base, state)
}
