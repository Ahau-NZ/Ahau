<template>
  <ProfileForm
    :persistedState="profile"
    @cancel="back"
    @save-profile="save($event)"
  />
</template>

<script>
import gql from 'graphql-tag'
// import ProfileForm from '@/components/ProfileForm' file deprecated

export default {
  name: 'PersonEdit',
  data () {
    return {
      profile: {}
    }
  },
  apollo: {
    profile: {
      query: gql`
        query ProfileData($id: String!) {
          person(id: $id) {
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
        }
      `,
      update (data) {
        return {
          ...data.person
        }
      },
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
      // Have commented this out as the only time you will edit a profile using this view is when you first create one.
      // All future edits to your profile will be handled in the new whakapapa dialogs
      // this.$router.push({ name: 'personShow', params: { id: this.profile.id } })
      this.$router.push({ name: 'login' })
      // TODO - to fix this need to stop using % in :id
      // add encode / decodeURIcomponent ?
      // this.$router.back()
    },
    done () {
      if (this.$route.query.setup) {
        this.$router.push({ name: 'whakapapaIndex' })
      } else {
        this.back()
      }
    },
    async save (profileChanges) {
      const result = await this.$apollo.mutate({
        mutation: gql`
          mutation($input: ProfileInput!) {
            saveProfile(input: $input)
          }
        `,
        variables: {
          input: {
            id: this.profile.id,
            ...profileChanges
          }
        }
      })

      if (result.errors) return

      this.done()
    }
  },
  components: {
    // ProfileForm
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
