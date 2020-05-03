<template>
    <ArchiveShow type="person" :profile="profile" :editProfile="edit" />
</template>
  
  <script>
  import gql from 'graphql-tag'
  import ArchiveShow from '@/components/ArchiveShow'
  
  export default {
    name: 'PersonShow',
    data () {
      return {
        profile: {}
      }
    },
    apollo: {
      profile () {
        return {
          query: gql`
            query ProfileData($id: String!) {
              person(id: $id) {
                canEdit
  
                preferredName
                legalName
                description
  
                headerImage {
                  uri
                }
                avatarImage {
                  uri
                }
              }
            }
          `,
          variables: {
            id: this.$route.params.id
          },
          // TODO this only exists to inject profile.id
          // make sure graphql resolver has the id so we don't need this
          update (data) {
            return {
              id: this.$route.params.id,
              ...data.person
            }
          },
          fetchPolicy: 'no-cache'
        }
      }
    },
    methods: {
      edit () {
        this.$router.push({
          name: 'personEdit',
          params: { id: this.$route.params.id }
        })
      }
    },
    components: {
      ArchiveShow
    }
  }
  </script>
  
  <!-- Add "scoped" attribute to limit CSS to this component only -->
  <style scoped lang="scss">
  .body-width {
    max-width: 900px;
  }
  </style>
  