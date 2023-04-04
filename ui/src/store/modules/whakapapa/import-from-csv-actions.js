/* eslint brace-style: ["error", "stroustrup", { "allowSingleLine": true }] */
import { ACCESS_KAITIAKI } from '../../../lib/constants.js'

// bulk import actions

export default {
  // create a whakapapa from rows containing a profile + link
  async bulkCreateWhakapapaView ({ dispatch }, { whakapapaViewInput, rows, type }) {
    dispatch('setLoading', true, { root: true })
    dispatch('setLoadingLabel', 'importing CSV...', { root: true })

    const { recps } = whakapapaViewInput
    if (!recps) throw new Error('no recps found on the import input!')

    const length = rows.length
    const totalProfiles = {}
    const totalLinks = []
    const chunkSize = 100

    for (let i = 0; i < length; i += chunkSize) {
      // show progress percentage
      const percentage = Math.round((Object.keys(totalProfiles).length / length * 100) * 10) / 10 || true
      dispatch('setLoading', percentage, { root: true })
      dispatch('setLoadingLabel', 'creating profiles...', { root: true })
      // split out 100 profiles
      const chunk = rows.slice(i, i + chunkSize)
      // create profiles
      const { profiles, links } = await dispatch('bulkCreateProfiles', { chunk, recps })
      // add profiles to total obj
      Object.assign(totalProfiles, profiles)
      // add links to total links arr
      if (links) totalLinks.push(...links)
    }

    if (totalLinks.length) {
      // show progress percentage
      dispatch('setLoading', true, { root: true })
      dispatch('setLoadingLabel', 'adding family links...', { root: true })

      for (let i = 0; i < length; i += chunkSize) {
        // show progress percentage
        const percentage = Math.round((i / totalLinks.length * 100) * 10) / 10 || true
        dispatch('setLoading', percentage, { root: true })
        // split 100 links
        const linksChunk = totalLinks.slice(i, i + chunkSize)
        // create links
        await dispatch('bulkCreateLinks', { linksChunk, totalProfiles, recps })
      }
    }

    // if from create whakapapa
    if (!type) {
      // the first row is the focus
      whakapapaViewInput.focus = totalProfiles[rows[0].csvId]
      // create whakapapa with first person in the csv as the focus
      return dispatch('createWhakapapaView', whakapapaViewInput) // whakapapaId
    }
    else {
      return totalProfiles
    }
  },
  async bulkCreateProfiles ({ dispatch, rootGetters }, { chunk, recps }) {
    const profiles = {}
    const links = chunk
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
      chunk.map(async ({ csvId, profile }, i) => {
        if (!profile) return

        profile.recps = recps
        profile.type = rootGetters.currentAccess.type === ACCESS_KAITIAKI ? 'person/admin' : 'person'
        profile.authors = {
          add: ['*']
        }

        const profileId = await dispatch('person/createPerson', profile, { root: true })

        // importing from peoples list doesnt require a csvId we may not be building relaiotnships
        if (csvId) profiles[csvId] = profileId
        else profiles[i] = profileId
      })
    )
      .catch((err) => {
        console.error('failed to create profile with csv bulk create', err)
        dispatch('setLoading', false, { root: true })
      })

    if (!res) return

    return { profiles, links }
  },
  async bulkCreateLinks ({ dispatch }, { recps, linksChunk, totalProfiles }) {
    await Promise.all(
      linksChunk.map((link, i) => {
        const { parentCsvId, childCsvId, relationshipType } = link

        const relationship = {
          // get the parent and child's actual profileId
          parent: totalProfiles[parentCsvId],
          child: totalProfiles[childCsvId],
          recps
        }

        if (relationshipType === 'partner') return dispatch('createPartnerLink', relationship)

        // // TODO: check if this is important
        if (relationshipType !== '' && relationshipType !== null) relationship.relationshipType = relationshipType

        return dispatch('createChildLink', relationship)
      })
    )
  }
}
