import { action } from '@storybook/addon-actions'
import ProfileShow from './ProfileShow.vue'

export default {
  title: 'ProfileShow'
}

const avatarImage = { uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Ruru-morepork-heaphy-track.jpg/800px-Ruru-morepork-heaphy-track.jpg' }
const headerImage = { uri: 'https://upload.wikimedia.org/wikipedia/commons/d/d7/View_from_te_mata_peak.jpg' }

// profile/person ////////////////////

export const CompleteProfile = () => ({
  template: '<ProfileShow :profile="profile" type="person" :editProfile="editProfile"/>',
  data: () => ({
    type: 'person',
    profile: {
      id: '%someProfileId',
      canEdit: true,

      preferredName: 'Mix',
      legalName: 'J A Irving',
      description: `
        Grew up in Hawkes Bay, the child of two British immigrants - a teacher and a programmer.
        Is somewhat predicatably a teacher and programmer.
      `,

      avatarImage,
      headerImage
    }
  }),
  methods: {
    editProfile: action('edit profile')
  },
  components: { ProfileShow }
})

export const EmptyProfile = () => ({
  template: '<ProfileShow :profile="profile" type="person"/>',
  data: () => ({
    type: 'person',
    profile: {
      id: '%someProfileId',
      canEdit: false,

      preferredName: 'Mix (minimal)',
      legalName: null,
      description: null,

      avatarImage: null,
      headerImage: null
    }
  }),
  components: { ProfileShow }
})

// profile/community ////////////////////

// TODO

