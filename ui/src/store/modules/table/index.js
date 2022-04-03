export default function () {
  const state = {
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

    table: (state, getters, rootState, rootGetters) => {
      const root = rootGetters['tree/root']
      if (!root) return

      let index = -1
      return rootGetters['tree/root'].eachBefore((n) => {
        n.x = state.settings.flatten ? 0.1 : n.depth * 15
        n.y = ++index * 30
      })
    },
    descendants: (state, getters) => {
      const table = getters.table

      if (!table) return []

      return table.descendants()
    },
    descendantLinks: (state, getters) => {
      const table = getters.table

      if (!table) return []

      return table.links()
    }
    // TODO: move table nodes, filtering and sorting to vuex
  }

  const mutations = {
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
