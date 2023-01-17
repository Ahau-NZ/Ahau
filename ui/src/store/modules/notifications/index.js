// import gql from 'graphql-tag'
import account2 from '@/assets/account-fill.svg'
import koro from '@/assets/koro.svg'
import { createProvider } from '@/plugins/vue-apollo'
import { listGroupApplications } from '@/lib/tribes-application-helpers'

const apolloProvider = createProvider()
const apollo = apolloProvider.defaultClient

const state = {
  notifications: [],
  currentNotification: {}
}

const getters = {
  notifications: state => {
    return state.notifications
  },
  currentNotification: state => {
    return state.currentNotification
  }
}

const mutations = {
  updateNotifications (state, notifications) {
    state.notifications = notifications
  },
  updateCurrentNotification (state, notification) {
    state.currentNotification = notification
  }
}

const actions = {
  async getAllNotifications ({ commit, rootState: { whoami } }) {
    try {
      const res = await apollo.query(
        listGroupApplications()
      )
      const testobj = {
        from: 'bob',
        group: {
          id: '%vNqmX1qk2JUEKW0Hr7b6h5mrM/pOOZ7+R5soLMOSZ0M=.sha256',
          preferredName: 'Test tribe'
        },
        userToBeChanged: {
          id: '%AK3Ujg5KQxoI0Z0+UxXEt6a15C7giEEhaiAvpOXYkPE=.sha256',
          canEdit: true,
          type: 'person',
          preferredName: 'Fin Mountfort',
          legalName: null,
          altNames: [],
          description: null,
          gender: 'male',
          postCode: null,
          city: 'Hamilton',
          country: 'NZ',
          profession: null,
          aliveInterval: null,
          birthOrder: 1,
          deceased: false,
          placeOfBirth: null,
          placeOfDeath: null,
          buriedLocation: null,
          education: [
            ''
          ],
          school: [
            ''
          ],
          recps: [
            'ssb:identity/po-box/YzNORxzK3Cpvk-kCC3a5h1JoVaAogCzBgMKUS-2sbQc=',
            '@mhoGMBpX3KGiurX+wZ3KrD45T7+foCvJtUxvJgIhpXk=.ed25519'
          ],
          address: null,
          email: null,
          phone: null,
          avatarImage: { uri: account2 },
          headerImage: null,
          customFields: [],
          originalAuthor: '@mhoGMBpX3KGiurX+wZ3KrD45T7+foCvJtUxvJgIhpXk=.ed25519',
          __typename: 'Person'
        },
        submitter: {
          id: '%PLYl1cTU5/bMjTWRCRvT9MjUNTXPMU9J7s95mOZ+L7w=.sha256',
          canEdit: true,
          type: 'person/admin',
          preferredName: 'Big Man',
          legalName: null,
          altNames: [],
          description: null,
          gender: 'male',
          postCode: null,
          city: 'Hamilton',
          country: 'NZ',
          profession: null,
          aliveInterval: null,
          birthOrder: 1,
          deceased: false,
          placeOfBirth: null,
          placeOfDeath: null,
          buriedLocation: null,
          education: [
            ''
          ],
          school: [
            ''
          ],
          recps: [
            'ssb:identity/po-box/YzNORxzK3Cpvk-kCC3a5h1JoVaAogCzBgMKUS-2sbQc=',
            '@mhoGMBpX3KGiurX+wZ3KrD45T7+foCvJtUxvJgIhpXk=.ed25519'
          ],
          address: null,
          email: null,
          phone: null,
          avatarImage: null,
          headerImage: null,
          customFields: [],
          originalAuthor: '@mhoGMBpX3KGiurX+wZ3KrD45T7+foCvJtUxvJgIhpXk=.ed25519',
          __typename: 'Person'
        },
        changes: {
          preferredName: 'Fin M',
          profession: 'programmer',
          legalName: 'Full name here',
          altNames: { add: ['Big Man', 'Bigger Man'], remove: ['Small Man', 'Smaller Man'] },
          description: 'about section',
          gender: 'male',
          postCode: '3216',
          city: 'Hammy',
          country: 'NZ',
          aliveInterval: '2022-01-01/2023-01-01',
          birthOrder: 2,
          deceased: false,
          placeOfBirth: 'waiheke',
          placeOfDeath: 'auckland',
          buriedLocation: 'waiheke',
          education: ['master\'s degree', 'another masters degree'],
          school: ['waikato uni'],
          avatarImage: { uri: koro }
        },
        id: 'id',
        answers: [],
        history: [
          {
            type: 'answers',
            authorId: '@mhoGMBpX3KGiurX+wZ3KrD45T7+foCvJtUxvJgIhpXk=.ed25519',
            author: {
              id: '%PLYl1cTU5/bMjTWRCRvT9MjUNTXPMU9J7s95mOZ+L7w=.sha256'
            },
            timestamp: '1670206345610',
            answers: [],
            __typename: 'GroupApplicationAnswerHistory'
          },
          {
            type: 'comment',
            authorId: '@mhoGMBpX3KGiurX+wZ3KrD45T7+foCvJtUxvJgIhpXk=.ed25519',
            author: {
              id: '%PLYl1cTU5/bMjTWRCRvT9MjUNTXPMU9J7s95mOZ+L7w=.sha256'
            },
            timestamp: '1670206345610',
            comment: 'This is a test comment',
            __typename: 'GroupApplicationCommentHistory'
          }
        ],
        isPersonal: true,
        isAccepted: false,
        isSubmission: true,
        isNew: true
      }
      // res.data.unseen.push(testobj)
      // console.log(JSON.stringify(res, null, 4))

      if (res.errors) throw res.errors

      const { unseen, accepted, declined } = res.data

      const applications = [...unseen, ...accepted, ...declined]
        .map(mapValues(whoami))
        .filter(n => n.group)
        .reverse()

      // console.log(JSON.stringify(applications, null, 4))
      // appending test notification to notif list
      applications.push(testobj)
      commit('updateNotifications', applications)
    } catch (err) {
      console.error('Something went wrong while trying to get all group applications', err)
    }
  },
  setCurrentNotification ({ commit }, notification) {
    commit('updateCurrentNotification', notification)
  },
  submitProfileChanges ({ commit }, output) {
    // commit('updateNotifications', [testobj, testobj, testobj])

    console.log('changes submitted: ' + JSON.stringify(output))
  }
}

export default {
  state,
  mutations,
  actions,
  getters
}

function mapValues (whoami) {
  return function (application) {
    const { decision, applicant, applicantId, group, answers, history } = application

    const isPersonal = applicantId === whoami.public.feedId
    const isNew = decision === null
    const isAccepted = (decision && decision.accepted) || false
    // defaults to false as currently only join requests are mapped
    const isSubmission = false
    const _group = (group && group.public[0]) || null

    // TODO: not sure which admin, find out later: look at the history instead
    const from = isPersonal ? whoami.personal.profile : applicant
    return {
      from,
      group: _group,
      applicant: applicant || null,
      id: application.id,
      answers,
      history,
      isPersonal,
      isAccepted,
      isSubmission,
      isNew
    }
  }
}
