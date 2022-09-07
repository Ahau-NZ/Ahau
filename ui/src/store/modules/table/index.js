import { buildTree } from '../tree'

export default function () {
  const state = {
    tree: null,
    settings: {
      flatten: true,
      filter: {
        name: '',
        location: '',
        skills: '',
        age: {
          min: 0,
          max: 150 // filter is disabled when max is this
        },
        deceased: false
      },
      sortBy: {
        value: null,
        event: null
      }
    }
  }

  const getters = {
    tableFilter: state => state.settings.filter,
    tableSort: state => state.settings.sortBy,
    tableFlatten: state => state.settings.flatten,
    descendants: state => {
      if (!state.tree) return []
      return state.tree.descendants()
    },
    descendantLinks: state => {
      if (!state.tree) return []

      return state.tree.links
    }
    // TODO: move table nodes, filtering and sorting to vuex
  }

  const mutations = {
    setTree (state, tree) {
      state.tree = tree
    },
    toggleTableFlatten (state) {
      state.settings.flatten = !state.settings.flatten
    },
    updateNameFilter (state, name) {
      state.settings.filter.name = name
    },
    updateLocationFilter (state, location) {
      state.settings.filter.location = location
    },
    updateSkillsFilter (state, skills) {
      state.settings.filter.skills = skills
    },
    updateAgeFilter (state, age) {
      state.settings.filter.age = age
    },
    updateDeceasedFilter (state, deceased) {
      state.settings.filter.deceased = deceased
    },
    updateFilter (state, filter) {
      state.settings.filter = filter
    },
    updateSort (state, sortBy) {
      state.settings.sortBy = sortBy
    }
  }

  const actions = {
    refreshWhakapapaData ({ state, rootGetters, commit }) {
      const tree = buildTree(rootGetters)
      if (!tree) return

      let index = -1
      tree.eachBefore(n => {
        n.x = state.settings.flatten ? 0.1 : n.depth * 15
        n.y = ++index * 30
      })

      commit('setTree', tree)
    },
    updateTableFilter ({ commit }, { type, value }) {
      switch (type) {
        case 'name': return commit('updateNameFilter', value)
        case 'location': return commit('updateLocationFilter', value)
        case 'skills': return commit('updateSkillsFilter', value)
        case 'age': return commit('updateAgeFilter', value)
        case 'deceased': return commit('updateDeceasedFilter', value)
        default:
          console.error('Unknown table filter')
      }
    },
    resetTableFilters ({ commit }) {
      const resetFilter = {
        name: '',
        location: '',
        skills: '',
        age: {
          min: 0,
          max: 150 // filter is disabled when max is this
        },
        deceased: false
      }

      commit('updateFilter', resetFilter)
    },
    toggleTableFlatten ({ commit }) {
      commit('toggleTableFlatten')
    },
    updateTableSort ({ commit }, { value, event }) {
      commit('updateSort', { value, event })
    }
  }

  return {
    namespaced: true,
    state,
    getters,
    mutations,
    actions
  }
}
