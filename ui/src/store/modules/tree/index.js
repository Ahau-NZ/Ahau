export default function () {
  const state = {
    mouseEvent: null
  }

  const getters = {
    mouseEvent: state => state.mouseEvent
  }

  const mutations = {
    setMouseEvent (state, e) {
      state.mouseEvent = e
    }
  }

  const actions = {
    setMouseEvent ({ commit }, e) {
      commit('setMouseEvent', e)
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
