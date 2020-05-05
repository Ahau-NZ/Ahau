
import gql from 'graphql-tag'
import { createProvider } from '@/plugins/vue-apollo'
import { person, savePerson } from './graphql'
import pick from 'lodash.pick'
import isEmpty from 'lodash.isempty'
import { PERMITTED_PROFILE_ATTRS, PERMITTED_RELATIONSHIP_ATTRS } from '../../../lib/profile-helpers'
import { saveWhakapapaLink } from '../../../lib/link-helpers'
/*
  this is needed in order to run queries and mutations
*/
const apolloProvider = createProvider()
const apolloClient = apolloProvider.defaultClient

/*
  Actions are asynchronous functions that cannot directly change the state. Instead
  they commit changes (mutations).
*/
const actions = {
/*
    calls db query to get a person by their id
*/
  async fetchPerson ({ commit }, id) {
    const res = await apolloClient.query(person(id))

    if (res.data) {
      await commit('mutatePerson', res.data.person)
      return res.data.person
    }

    // error handling here

    return null
  },
  /*
    call db query to save a person
  */
  async savePerson ({ dispatch }, input) {
    const res = await apolloClient.mutate(savePerson(input))
    if (res.data) {
      // get the updated person from the db
      const person = dispatch('fetchPerson', res.data.savePerson)
      return person
    }
    return null
  },
  /*
    handles updating the person in the db and nestedWhakapapa
  */
  async updatePerson ({ rootState, dispatch, commit }, $event) {
    const profileChanges = pick($event, [...PERMITTED_PROFILE_ATTRS])
    // const relationshipAttrs = pick($event, [...PERMITTED_RELATIONSHIP_ATTRS])
    const profileId = rootState.whakapapa.selectedPerson.id
    // const whakapapa = rootState.currentWhakapapa

    const res = await apolloClient.mutate({
      mutation: gql`
        mutation($input: ProfileInput!) {
          saveProfile(input: $input)
        }
      `,
      variables: {
        input: {
          id: profileId,
          ...profileChanges
        }
      }
    })

    if (res.data) {
      const person = await dispatch('fetchPerson', res.data.saveProfile)

      // only submit attributes
      const attrs = {
        id: person.id,
        ...pick(person, PERMITTED_PROFILE_ATTRS, PERMITTED_RELATIONSHIP_ATTRS)
      }

      // update the node
      dispatch('whakapapa/updateNode', attrs, { root: true })
      return person
    }

    return null
  },
  async createProfile ({ rootState }, {
    preferredName,
    legalName,
    gender,
    bornAt,
    diedAt,
    birthOrder,
    avatarImage,
    altNames,
    description,
    address,
    location,
    profession,
    email,
    phone,
    deceased
  }) {
    const res = await apolloClient.mutate({
      mutation: gql`
        mutation($input: ProfileInput!) {
          saveProfile(input: $input)
        }
      `,
      variables: {
        input: {
          type: 'person',
          preferredName,
          legalName,
          gender,
          bornAt,
          diedAt,
          birthOrder,
          avatarImage,
          altNames,
          description,
          location,
          profession,
          address,
          email,
          phone,
          deceased,
          recps: rootState.whakapapa.selectedWhakapapa.recps
        }
      }
    })

    if (res.errors) {
      console.error('failed to createProfile', res)
      return
    }
    return res.data.saveProfile
  },
  // async createPerson ({ dispatch, rootState }, { submission, type }) {
  //   try {
  //     var { id } = submission

  //     if (!id) {
  //       const newPerson = await dispatch('createProfile', submission)
  //       console.log('newPerson', newPerson)
  //       if (!newPerson) return
  //       id = newPerson
  //     } else {
  //       const whakapapa = rootState.whakapapa.selectedWhakapapa
  //       if (whakapapa.ignoredProfile.includes(id)) {
  //         await dispatch('removeIgnoredPerson', id)
  //         return
  //       }
  //     }

  //     let child, parent
  //     const relationshipAttrs = pick(submission, ['relationshipType', 'legallyAdopted'])
  //     switch (type) {
  //       case 'child':
  //         child = id
  //         parent = rootState.whakapapa.selectedPerson.id
  //         console.log('child', id)
  //         console.log('parent', parent)

  //         // check that they dont already have that child
  //         if (!hasFamilyMember(rootState.whakapapa.selectedPerson.children)) {
  //           // create the parent/child link
  //           await dispatch('createLink', { child, parent, ...relationshipAttrs })
  //         }
  //         // load the parent
  //         await dispatch('whakapapa/updateChildren', parent, { root: true })

  //         break
  //       case 'parent':
  //         child = rootState.whakapapa.selectedPerson.id
  //         parent = id

  //         // check if they dont already have that parent
  //         if (!hasFamilyMember(rootState.whakapapa.selectedPerson.parents)) {
  //           // create the parent/child link
  //           await dispatch('createLink', { child, parent, ...relationshipAttrs })
  //         }

  //         // if the child is the focus
  //         if (child === rootState.whakapapa.selectedWhakapapa.focus) {
  //           // update focus
  //           await dispatch('whakapapa/updateFocus', parent, { root: true })
  //         } else if (rootState.whakapapa.selectedPerson.parents.length < 1) {
  //           // change focus
  //           await dispatch('whakapapa/changeFocus', parent)
  //         } else {
  //           // load the whakapapa of the child?

  //         }
  //         break
  //     }
  //   } catch (err) {
  //     console.error(err)
  //   }
  // },
  async addPerson ({ rootState, dispatch }, { submission, type }) {
    const selectedWhakapapa = rootState.whakapapa.selectedWhakapapa
    const selectedPerson = rootState.whakapapa.selectedPerson
    var { id } = submission

    if (!id) {
      id = await dispatch('createProfile', submission)
      console.log('id', id)
      if (!id) return
    }

    if (selectedWhakapapa.ignoredProfiles.includes(id)) {
      const input = {
        id: selectedWhakapapa.id,
        ignoredProfiles: {
          remove: [id]
        }
      }
      const res = await apolloClient.mutate({
        mutation: gql`
        mutation($input: WhakapapaViewInput) {
          saveWhakapapaView(input: $input)
        }
        `,
        variables: { input }
      })
      if (res.data) {
        // refresh the tree

        // if (this.isActive('view-edit-node')) {
        //   this.$emit('set', this.selectedProfile.id)
        // }
        console.log('refresh the tree')
        return
      } else {
        console.error(res)
      }
    }

    let child, parent
    const relationshipAttrs = pick(submission, [
      'relationshipType',
      'legallyAdopted'
    ])
    switch (type) {
      case 'child':
        child = id
        parent = selectedPerson.id

        if (selectedPerson.children) {
          const childrenExists = selectedPerson.children.filter(existingChild => {
            return existingChild.id === child
          })
          if (isEmpty(childrenExists)) {
            await dispatch('createLink', { child, parent, ...relationshipAttrs })
          }
        }
        // load descendants on parent
        console.log('loadDescendants of parent')
        await dispatch('whakapapa/updateChildren', { child: child, parent: parent }, { root: true })
        break
      case 'parent':
        child = selectedPerson.id
        parent = id

        // check the child doesnt already have a link
        if (selectedPerson.parents) {
          const parentExists = selectedPerson.parents.filter(existingParent => {
            return existingParent.id === parent
          })

          if (isEmpty(parentExists)) {
            // dont want to create a new link
            await dispatch('createLink', { child, parent, ...relationshipAttrs })
          }
        }
        if (child === selectedWhakapapa.focus) {
          // in this case we're updating the top of the graph, we update view.focus to that new top parent
          await dispatch('whakapapa/updateFocus', parent, { root: true })
        } else if (selectedPerson.parents.length < 1) {
          console.log('changeFocus')
          // await dispatch('whakapapa/changeFocus', parent, { root: true })
        } else {
          // await this.$emit('load', child)
          await dispatch('whakapapa/updateParents', parent, { root: true })
        }
        break
      case 'sibling':
        if (!selectedPerson.parents) break
        parent = selectedPerson.parents[0].id
        child = id
        await dispatch('createLink', { child, parent, ...relationshipAttrs })

        // await this.$emit('load', parent)
        console.log('load descendants on parent')
        break
      default:
        console.log('not built')
    }
    // if (this.isActive('view-edit-node')) {
    //   this.$emit('set', this.selectedProfile.id)
    // }
  },
  async removeIgnoredPerson ({ rootState, state, dispatch }, id) {
    const whakapapa = rootState.whakapapa.selectedWhakapapa
    const whakapapaInput = {
      id: whakapapa.id,
      ignoredProfiles: {
        remove: [id]
      }
    }
    // run the whakapapa action to save changes to a whakapapa
    dispatch('whakapapa/saveWhakapapa', whakapapaInput, { root: true })

    // refresh the whakapapa somehow ?
    dispatch('whakapapa/loadFullWhakapapa', whakapapa.id, { root: true })

    // reload the selected person
    dispatch('setSelectedPerson', state.selectedPerson.id)
  },
  async createLink ({ rootState },
    { child, parent, relationshipType, legallyAdopted },
    view
  ) {
    const input = {
      child,
      parent,
      relationshipType,
      legallyAdopted,
      recps: rootState.whakapapa.selectedWhakapapa.recps
    }
    try {
      const res = await apolloClient.mutate(saveWhakapapaLink(input))
      if (res.errors) {
        console.error('failed to createChildLink', res)
        return
      }
      return res.data.saveWhakapapaLink // TODO return the linkId
    } catch (err) {
      throw err
    }
  },
  async deletePerson ({ dispatch }, input) {

  }
}

function hasFamilyMember (array, memberId) {
  if (!array) return false
  return array.find(d => d.id === memberId)
}

export default actions
