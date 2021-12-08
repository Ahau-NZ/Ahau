import pick from 'lodash.pick'
import { getRelatives, getPerson, savePerson } from '@/lib/person-helpers'
import { saveLink } from '@/lib/link-helpers.js'

export default function (apollo) {
  const state = {
    selectedProfile: {}
  }

  const getters = {
    selectedProfile: state => {
      return state.selectedProfile
    }
  }

  const mutations = {
    updateSelectedProfile (state, profile) {
      state.selectedProfile = profile
    }
  }

  const actions = {
    async savePerson (context, input) {
      try {
        const res = await apollo.mutate(
          savePerson(input)
        )

        if (res.errors) throw res.errors

        return res.data.saveProfile // profileId
      } catch (err) {
        console.error('Something went wrong while trying to save a person', input)
        console.error(err)
      }
    },
    async createPerson ({ dispatch }, input) {
      try {
        if (!input.type) throw new Error('profile.type is required on createPerson()')
        if (!input.recps) throw new Error('profile.recps is required on createPerson()')
        if (!input.authors) throw new Error('profile.authors is required on createPerson()')
        if (input.id) throw new Error('profile.id is not allowed on createPerson()')

        return dispatch('savePerson', input) // profileId
      } catch (err) {
        console.error('Something went wrong while trying to create a person', input)
        console.error(err)
      }
    },
    async getPerson (context, profileId) {
      try {
        const res = await apollo.query(
          getPerson(profileId)
        )

        if (res.errors) throw res.errors

        return res.data.person
      } catch (err) {
        console.error('Something went wrong while trying to get a person', err)
      }
    },
    updateSelectedProfile ({ commit }, profile) {
      commit('updateSelectedProfile', profile)
    },

    async setProfileById ({ commit, rootState, dispatch }, { id, type }) {
      // NOTE to dispatch outide this namespace, we use:
      //   dispatch(actionName, data, { root: true })
      //
      // ref: https://vuex.vuejs.org/guide/modules.html#namespacing
      if (id === rootState.whoami.public.profile.id) {
        dispatch('setWhoami', id, { root: null })
      }
      if (id === rootState.whoami.personal.profile.id) {
        dispatch('setWhoami', id, { root: null })
      }
      // if viewing a story and sideview is open and you want to jump to another profile > close the story
      if (rootState.archive.showStory && rootState.dialog.preview) {
        dispatch('archive/toggleShowStory', null, { root: true })
      }
      if (type !== 'setWhanau' && rootState.dialog.dialog) {
        dispatch('setDialog', null, { root: true })
      }
      var person = await getRelatives(id, apollo)
      commit('updateSelectedProfile', person)
    },
    async bulkCreateWhakapapaView ({ dispatch }, { whakapapaInput, rows }) {
      dispatch('setLoading', true, { root: true })

      const { recps } = whakapapaInput

      if (!recps) throw new Error('no recps found on the whakapapa input!')

      // create a profile for each row in the csv
      const { profiles, links } = await dispatch('bulkCreateProfiles', { rows, recps })

      // create all the links from the profiles
      await dispatch('bulkCreateLinks', { links, profiles, recps })

      // the first row is the focus
      whakapapaInput.focus = profiles[rows[0].csvId]

      // create whakapapa with first person in the csv as the focus
      return dispatch('whakapapa/createWhakapapaView', whakapapaInput, { root: true }) // whakapapaId
    },
    async bulkCreateProfiles ({ dispatch }, { rows, recps }) {
      const profiles = {}
      const links = rows
        .map(row => row.link)
        .filter(Boolean)

      /*
        NOTE:
        profiles = {
          [csvId]: profileId
        }

        links = [{ childCsvId, parentCsvId, relationshipType }]
      */
      const res = await Promise.all(
        rows.map(async ({ csvId, profile }) => {
          if (!profile) return

          // TODO: check profiles have recps!
          profile.recps = recps
          profile.type = 'person'
          profile.authors = {
            add: ['*']
          }

          var profileId = await dispatch('createPerson', profile)
          profiles[csvId] = profileId
        })
      )
        .catch((err) => {
          console.error('failed to create profile with csv bulk create', err)
          dispatch('setLoading', false, { root: true })
        })

      if (!res) return

      return { profiles, links }
    },
    async bulkCreateLinks ({ dispatch }, { recps, links, profiles }) {
      await Promise.all(
        links.map(link => {
          const { parentCsvId, childCsvId, relationshipType } = link

          const relationship = {
            // get the parent and child's actual profileId
            parent: profiles[parentCsvId],
            child: profiles[childCsvId],
            recps
          }

          if (relationshipType === 'partner') return dispatch('createPartnerLink', relationship)

          // TODO: check if this is important
          if (relationshipType !== '' && relationshipType !== null) relationship.relationshipType = relationshipType

          return dispatch('createChildLink', relationship)
        })
      )
    },
    // TODO: move link related methods to store/modules/link
    async createChildLink ({ dispatch }, input) {
      input.type = 'link/profile-profile/child'

      await dispatch('createLink', input)
    },
    async createPartnerLink ({ dispatch }, input) {
      input = pick(input, ['child', 'parent', 'recps'])
      input.type = 'link/profile-profile/partner'

      await dispatch('createLink', input)
    },
    async createLink (context, input) {
      try {
        const res = await apollo.mutate(
          saveLink(input)
        )

        if (res.errors) throw res.errors

        return res.data.saveLink
      } catch (err) {
        console.log('failed to create link', input)
        console.log(err)
      }
    }
  }

  return {
    state,
    mutations,
    actions,
    getters,
    namespaced: true
  }
}
