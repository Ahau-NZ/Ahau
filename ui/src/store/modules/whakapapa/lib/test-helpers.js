import merge from 'lodash.merge'

const { getters } = require('../').default()

// this builds the getters that some other getters need to be injected with
export function Getters (state) {
  const activeGetters = {}

  const getterNames = Object.keys(getters)

  while (getterNames.length) {
    const getterName = getterNames.shift()

    try {
      getters[getterName](state, activeGetters)
      // if it explodes, it was probably dependant on some other getters
      // so if it doesn't add it to the activeGetters
      activeGetters[getterName] = getters[getterName](state, activeGetters)
    } catch (err) {
      // console.log(err)
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
      extendedFamily: true,
      importantRelationships: {},
      ignoredProfiles: []
    },
    viewChanges: {
      focus: null,
      collapsed: {}
    },
    childLinks: {},
    partnerLinks: {}
  }

  return merge(base, state)
}
