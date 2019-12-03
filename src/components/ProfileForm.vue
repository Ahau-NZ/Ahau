<template>
  <div class='wrapper'>
    <Header
      :preferredName="profile.preferredName"
      :avatarImage="profile.avatarImage"
      :headerImage="profile.headerImage"
      :addImages="addChanges"
    />
    <v-container class='body px-12 pt-12'>
      <v-row>
        <v-col>
          <v-form class="body white pt-0" ref="form" v-model="form.valid" lazy-validation>
            <v-row>
              <v-col cols="12" md="12" >
                <v-text-field
                  light
                  v-model="profile.preferredName"
                  label="Preferred name"
                ></v-text-field>
              </v-col>

              <v-col cols="12" md="12" >
                <v-text-field
                  light
                  v-model="profile.legalName"
                  label="Legal name"
                ></v-text-field>
              </v-col>

              <v-col cols="12">
                <v-textarea
                  v-model="profile.description"
                  light
                  name="input-7-1"
                  label="Description"
                  hint="Hint text"
                ></v-textarea>
              </v-col>

            </v-row>
          </v-form>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <Actions
            :save="saveProfile"
            :cancel="onCancel"
            :hasChanges="hasChanges"
          />
        </v-col>
      </v-row>

      <v-row class='spacer'/>

    </v-container>
  </div>
</template>

<script>
import gql from 'graphql-tag'
import pick from 'lodash.pick'
import Header from '@/components/profile-form/Header'
import Actions from '@/components/profile-form/Actions'

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
      persistedState: {},
      form: {
        valid: true,
        rules: {
          // title: [
          //   v => !!v || 'Title is required'
          // ],
          // gender: [
          //   v => !!v || 'Gender is required'
          // ],
          name: {
            preferred: [
              v => !!v || 'Preferred name is required',
              v => (v && v.length <= 20) || 'Name must be less than 20 characters'
            ],
            legal: [
              v => !!v || 'Legal name is required',
              v => (v && v.length <= 50) || 'Name must be less than 50 characters'
            ]
          }
          // date: {
          //   birth: [
          //     v => !!v || 'Date of birth is required'
          //   ]
          // }
        }
      }
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
    addChanges (changes) {
      const permitted = [
        'preferredName',
        'legalName',
        'description',
        'avatarImage',
        'headerImage'
      ]
      this.profile = Object.assign({}, this.profile, pick(changes, permitted))
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
        if (this.isNew) {
          this.$router.push({ name: 'communityShow', params: { id: result.data.createProfile } })
        } else {
          this.$router.push({ name: 'communityShow', params: { id: result.data.updateProfile } })
          // this.$router.go(-1)
        }
      }
    },
    onCancel () {
      if (this.isNew) this.$router.push({ name: 'communityIndex' })
      else this.$router.push({ name: 'communityShow', params: { id: this.id } })
    }
  },
  components: {
    Header,
    Actions
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

    > .body {
      min-width: 600px;
      max-width: 60vw;
      background: #fff;

      padding: 0;

      .row {
        .col {
          padding: 0;
        }
      }
      .row.spacer {
        background: #fff;
        height: 20vh
      }
    }
  }
</style>
