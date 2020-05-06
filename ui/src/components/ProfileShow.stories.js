import { action } from '@storybook/addon-actions'
import Profile from './Profile.vue'

export default {
  title: 'Profile'
}

const avatarImage = {
  uri:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Ruru-morepork-heaphy-track.jpg/800px-Ruru-morepork-heaphy-track.jpg'
}
const headerImage = {
  uri:
    'https://upload.wikimedia.org/wikipedia/commons/d/d7/View_from_te_mata_peak.jpg'
}

const communityAvatarImage = {
  uri:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/MAP_Expo_Maori_Hame%C3%A7on_13012012_4.jpg/800px-MAP_Expo_Maori_Hame%C3%A7on_13012012_4.jpg'
}
const communityHeaderImage = {
  uri:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Wilkin_River_close_to_its_confluence_with_Makarora_River%2C_New_Zealand.jpg/800px-Wilkin_River_close_to_its_confluence_with_Makarora_River%2C_New_Zealand.jpg'
}

const mixProfile = {
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

// profile/community ////////////////////
export const CompleteCommunityProfile = () => ({
  template:
    '<Profile :profile="profile" type="community" :editProfile="editProfile"/>',
  data: () => ({
    type: 'community',
    profile: {
      id: '%someProfileId',
      canEdit: true,

      preferredName: 'Aoteaora',
      legalName: 'Aoteaora',
      description: `
        Several meanings have been proposed for the name; the most popular meaning usually given is "long white cloud", or variations thereof.
        This refers to the cloud formations which helped early Polynesian navigators find the country.
      `,

      avatarImage: communityAvatarImage,
      headerImage: communityHeaderImage,
      tiaki: [mixProfile]
    }
  }),
  methods: {
    editProfile: action('edit profile')
  },
  components: { Profile }
})

// profile/person ////////////////////
export const CompleteProfile = () => ({
  template:
    '<Profile :profile="profile" type="person" :editProfile="editProfile"/>',
  data: () => ({
    type: 'person',
    profile: mixProfile
  }),
  methods: {
    editProfile: action('edit profile')
  },
  components: { Profile }
})

export const EmptyProfile = () => ({
  template: '<Profile :profile="profile" type="person"/>',
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
  components: { Profile }
})

// profile/community ////////////////////

// TODO
