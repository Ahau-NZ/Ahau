<template>
<div>
  <ProfileShow type="person" :profile="profile" @dialogTrigger="updateDialog($event)"/>
  <DialogHandler
      :dialog.sync="dialog.active"
      :selectedProfile="profile"
    />
</div>
</template>

<script>
import gql from 'graphql-tag'
import ProfileShow from '@/components/ProfileShow'
import DialogHandler from '@/components/dialog/DialogHandler.vue'

export default {
  name: 'PersonShow',
  data () {
    return {
      profile: {},
      dialog: {
          active: null,
          type: null
      },
    }
  },
  apollo: {
    profile () {
      return {
        query: gql`
          query ProfileData($id: String!) {
            person(id: $id) {
              id
              preferredName
              legalName
              gender
              bornAt
              diedAt
              birthOrder
              description
              address
              email
              phone
              location
              profession
              deceased
              altNames
              avatarImage {
                uri
              }
              children {
                profile {
                  id
                  preferredName
                  legalName
                  gender
                  bornAt
                  diedAt
                  birthOrder
                  description
                  address
                  email
                  phone
                  location
                  profession
                  deceased
                  altNames
                  avatarImage {
                    uri
                  }
                }
                relationshipId
                relationshipType
              }

              parents {
                profile {
                  id
                  preferredName
                  legalName
                  gender
                  bornAt
                  diedAt
                  birthOrder
                  description
                  address
                  phone
                  email
                  location
                  profession
                  deceased
                  altNames
                  avatarImage {
                    uri
                  }
                }
                relationshipId
                relationshipType
              }
              canEdit
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
    // edit () {
    //   this.$router.push({
    //     name: 'personEdit',
    //     params: { id: this.$route.params.id }
    //   })
    // }
    updateDialog(dialogObj) {
      this.dialog.type = dialogObj.type
      this.dialog.active = dialogObj.dialog
    },
  },
  components: {
    ProfileShow,
    DialogHandler
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.body-width {
  max-width: 900px;
}
</style>
