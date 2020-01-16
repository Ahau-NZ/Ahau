<template>
  <ProfileForm :persistedState="profile"
    @cancel="back"
    @save-profile="save($event)"
  />
</template>

<script>
import gql from 'graphql-tag'
import ProfileForm from '@/components/ProfileForm'

export default {
  name: 'CommunityEdit',
  data () {
    return {
      profile: {}
    }
  },
  apollo: {
    profile: {
      query: gql`query ProfileData($id: String!) {
        profile(id: $id) {
          id
          preferredName
          legalName
          altNames
          description

          avatarImage { uri }
          headerImage { uri }
        }
      }`,
      variables () {
        return {
          id: this.$route.params.id
          // id: decodeURIComponent(this.$route.params.id)
        }
      },
      fetchPolicy: 'no-cache'
    }
  },
  methods: {
    back () {
      this.$router.push({ name: 'communityShow', params: { id: this.profile.id } })

      // TODO - to fix this need to stop using % in :id
      // add encode / decodeURIComponent ?
      // this.$router.back()
    },
    async save (profileChanges) {
      const result = await this.$apollo.mutate({
        mutation: gql`mutation ($input: ProfileInput!) {
          saveProfile(input: $input)
        }`,
        variables: {
          input: {
            id: this.profile.id,
            ...profileChanges
          }
        }
      })

      if (result.errors) return

      this.back()
    }
  },
  components: {
    ProfileForm
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
  .form {
    min-width: 600px;
    max-width: 60vw;
    margin: 0 auto;
  }
</style>
