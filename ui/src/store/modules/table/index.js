const defaultFilter = {
  name: '',
  location: '',
  skills: '',
  age: {
    min: 0,
    max: 0 // filter is disabled when max is 0
  }
}

export default function () {
  const state = {
    tableFilter: defaultFilter
  }

  const getters = {
    tableFilter: state => state.tableFilter
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
      if (age.max === 150) age.max = 0
      state.tableFilter.age = age
    },
    updateFilter (state, tableFilter) {
      state.tableFilter = tableFilter
      state.tableFilter.age.min = 0
      state.tableFilter.age.max = 0
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
      commit('updateFilter', defaultFilter)
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
