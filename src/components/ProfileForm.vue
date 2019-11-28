<template>
  <div class='wrapper'>
    <ProfileHeaderEdit
      :preferredName="profile.preferredName"
      :avatarImage="profile.avatarImage"
      :headerImage="profile.headerImage"
      :addImages="addImages"
    />
    <ProfileInfoEdit
      :preferredName="profile.preferredName"
      :legalName="profile.legalName"
      :description="profile.description"
    />
    <ProfileEditActions
      :save="saveProfile"
      :cancel="onCancel"
      :hasChanges="hasChanges"
    />
  </div>
</template>

<script>
import gql from 'graphql-tag'
import ProfileHeaderEdit from '@/components/ProfileHeaderEdit'
import ProfileInfoEdit from '@/components/ProfileInfoEdit'
import ProfileEditActions from '@/components/ProfileEditActions'

const get = require('lodash.get')

export default {
  name: 'ProfileForm',
  props: {
    id: String,
    type: String
  },
  data () {
    return {
      profile: {
        id: '',
        preferredName: '',
        legalName: '',
        description: '',
        avatarImage: undefined,
        headerImage: undefined
      },
      persistedState: {}
    }
  },
  computed: {
    isNew () {
      if (!this.id) return true
      else return false
    },
    altNames () {
      return get(this, 'profile.altNames', [])
    },
    profileChanges () {
      let changes = {}
      Object.entries(this.profile).map(([key, value]) => {
        // TODO: special case for altNames

        if (this.isNew) {
          if (value !== '') changes[key] = value
          return
        }

        // if this value hasn't been written before
        if (this.persistedState[key] === null) {
          // and the new value isn't "empty", then it's a change
          if (value !== '') changes[key] = value
        } else {
          // it has been written before, and it's a new value!
          if (this.persistedState[key] !== value) changes[key] = value
        }
      })
      return changes
    },
    hasChanges () {
      return Object.keys(this.profileChanges).length > 0
    }
  },
  apollo: {
    persistedState: {
      // only run this if an id props was passed
      skip () { return !this.id },
      query: gql`query ProfileData($id: String!) {
        profile(id: $id) {
          id
          preferredName
          legalName
          altNames
          description

          avatarImage {
            uri
          }
          headerImage {
            uri
          }
        }
      }`,
      variables () {
        return {
          id: this.id
        }
      },
      update: data => data.profile,
      fetchPolicy: 'no-cache'
    }
  },
  watch: {
    persistedState (nextValue) {
      Object.entries(nextValue)
        .filter(([key]) => !key.startsWith('_'))
        .forEach(([key, value]) => {
          if (value !== null) this.profile[key] = value
        })
    }
  },
  methods: {
    addImages ({ avatarImage, headerImage }) {
      if (avatarImage) this.profile.avatarImage = avatarImage
      if (headerImage) this.profile.headerImage = headerImage
    },
    async saveProfile () {
      if (!this.hasChanges) return

      const request = this.isNew
        ? {
          mutation: gql`mutation ($input: CreateProfileInput!) {
            createProfile(input: $input)
          }`,
          variables: {
            input: {
              type: this.type,
              ...this.profileChanges
            }
          }
        }
        : {
          mutation: gql`mutation ($input: UpdateProfileInput!) {
            updateProfile(input: $input)
          }`,
          variables: {
            input: {
              id: this.profile.id,
              ...this.profileChanges
            }
          }
        }

      const result = await this.$apollo.mutate(request)

      if (result.data) {
        const id = this.isNew ? result.data.createProfile : result.data.updateProfile
        this.$router.push({ name: 'communityShow', params: { id } })
      }
    },
    onCancel () {
      if (this.isNew) this.$router.push({ name: 'communityIndex' })
      else this.$router.push({ name: 'communityShow', params: { id: this.id } })
    }
  },
  components: {
    ProfileHeaderEdit,
    ProfileInfoEdit,
    ProfileEditActions
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
  .wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    background: linear-gradient(to right, grey 0%,grey 50%,#000000 50%,white 50%,white 100%);
  }
  .body-width {
    min-width: 600px;
    max-width: 60vw;
  }
</style>
