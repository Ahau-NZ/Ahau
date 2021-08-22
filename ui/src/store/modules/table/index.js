export default function () {
  const state = {
    tableFilter: {
      name: '',
      location: '',
      skills: '',
      age: {
        min: 0,
        max: 150 // filter is disabled when max is this
      }
    },
    tableSort: {
      value: null,
      event: null
    }
  }

  const getters = {
    tableFilter: state => state.tableFilter,
    tableSort: state => state.tableSort
  }

  const mutations = {
    updateNameFilter (state, name) {
      state.tableFilter.name = name
    },
    updateLocationFilter (state, location) {
      state.tableFilter.location = location
    },
    updateSkillsFilter (state, skills) {
      state.tableFilter.skills = skills
    },
    updateAgeFilter (state, age) {
      state.tableFilter.age = age
    },
    updateFilter (state, tableFilter) {
      state.tableFilter = tableFilter
    },
    updateSort (state, tableSort) {
      state.tableSort = tableSort
    }
  }

  const actions = {
    updateTableFilter ({ commit }, { type, value }) {
      if (type === 'name') commit('updateNameFilter', value)
      else if (type === 'location') commit('updateLocationFilter', value)
      else if (type === 'skills') commit('updateSkillsFilter', value)
      else if (type === 'age') commit('updateAgeFilter', value)
      else console.error('Unknown table filter')
    },
    resetTableFilters ({ commit }) {
      const resetFilter = {
        name: '',
        location: '',
        skills: '',
        age: {
          min: 0,
          max: 150 // filter is disabled when max is this
        }
      }

      commit('updateFilter', resetFilter)
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
