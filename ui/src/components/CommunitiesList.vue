<template>
  <div class="py-4">
    <v-row class="top-margin mb-5">
      <v-col class="headliner black--text pa-0 pl-4 pt-2" :class="!mobile ? 'pt-2':''">
        Tribes
      </v-col>
      <div>
        <v-btn :medium="!mobile" text :x-small="mobile" :class="mobile ? 'addBtnMob' : 'addBtn'" class="my-2" fab color="white" @click="$emit('addCommunityDialog')" elevation="1">
          <v-icon :large="!mobile" class="black--text">mdi-plus</v-icon>
        </v-btn>
      </div>
    </v-row>
    <!-- TRIBES -->
    <div v-if="tribes && tribes.length">
      <v-row v-if="connectedTribes && connectedTribes.length" class="pt-4">
        <v-col cols="12" md="9" class="py-0">
          <p class="sub-headline pa-0 mb-4">Tribes that you are connected to</p>
          <v-row justify="start">
              <v-col v-for="tribe in connectedTribes" :item="tribe" :key="tribe.id" justify-self="start">
                <v-card light :width="!mobile ? '190px':'100vw'" @click="goTribe(tribe)">
                  <v-img height="150px" :src="getImage(tribe.private[0])" class="card-image" />
                  <v-card-title class="subtitle font-weight-bold pb-2">{{
                    tribe.private[0].preferredName
                  }}</v-card-title>
                  <v-card-text class="body-2">{{
                    shortDescrciption(tribe.private[0])
                  }}</v-card-text>
                </v-card>
              </v-col>
            </v-row>
          <v-divider v-if="otherTribes && otherTribes.length" light color="grey" class="my-10"></v-divider>
        </v-col>
      </v-row>
      <v-row v-if="otherTribes && otherTribes.length" class="pt-4">
        <v-col cols="12" md="9" class="py-0">
          <p class="sub-headline pa-0 mb-4">Other whanau tribes</p>
          <v-row justify="start">
              <v-col v-for="tribe in otherTribes" :item="tribe" :key="tribe.id" justify-self="start">
                <v-card light :width="!mobile ? '190px':'100vw'" @click="goTribe(tribe)">
                  <v-img height="150px" :src="getImage(tribe.public[0])" class="card-image" />
                  <v-card-title class="subtitle font-weight-bold pb-2">{{
                    tribe.public[0].preferredName
                  }}</v-card-title>
                  <v-card-text class="body-2">{{
                    shortDescrciption(tribe.public[0])
                  }}</v-card-text>
                </v-card>
              </v-col>
            </v-row>
        </v-col>
      </v-row>
    </div>
    <v-row class="py-2">
      <v-col cols="12" md="9">
        <v-divider light color="grey" class="my-10"></v-divider>
        <p class="sub-headline pa-0">Enter a Pātaka code to discover tribes</p>
        <v-row>
          <v-col cols="10" md='9' class="py-0">
              <v-text-field
                v-model="patakaCode"
                placeholder="xxxx-xxxxx-xxxx-xxxx"
                outlined
                light
                dense
                :success-messages="successMsg"
                :error-messages="errorMsg"
                append-icon="mdi-lan-connect"
                clearable
              />
          </v-col>
          <v-col class="py-0 pl-0">
              <v-btn color="black" :class="mobile ? 'px-0':''" @click="acceptInvite" :text="mobile" :x-small="mobile">
                <v-icon v-if="mobile">mdi-arrow-right</v-icon>
                <span v-else>connect</span>
              </v-btn>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import gql from 'graphql-tag'
import { getTribes } from '@/lib/community-helpers'

const get = require('lodash.get')

export default {
  name: 'CommunitiesList',
  data () {
    return {
      communities: [],
      patakaCode: null,
      invalidCode: false,
      validCode: false,
      successMsg: [],
      errorMsg: []
    }
  },
  apollo: {
    tribes: {
      query: gql`query {
        tribes {
          id
          public {
            id
            preferredName
            description
            avatarImage { uri } 
            headerImage { uri }
            tombstone { date }
            tiaki { 
              id
              avatarImage { uri }
              preferredName
            }
          }
          private {
            id
            preferredName
            description
            avatarImage { uri }
            headerImage { uri }
            recps
            tombstone {date}
            tiaki { 
              id
              avatarImage { uri }
              preferredName
            }
          }
        }
      }
    `,
      fetchPolicy: 'no-cache'
    }
  },
  computed: {
    mobile () {
      return this.$vuetify.breakpoint.xs
    },
    connectedTribes () {
      return this.tribes.filter(tribe => tribe.private.length > 0)
    },
    otherTribes () {
      return this.tribes.filter(tribe => tribe.private.length < 1 && tribe.public.length > 0)
    }
  },
  methods: {
    ...mapActions(['setComponent', 'setDialog', 'setProfileById', 'setCurrentTribe']),
    goTribe (tribe) {
      this.setCurrentTribe(tribe)
      if (tribe.private.length > 0) this.goProfile(tribe.private[0].id)
      else this.goProfile(tribe.public[0].id)
    },
    goProfile (id) {
      this.setComponent('profile')
      this.setProfileById({ id })
      this.$router.push({ name: 'profileShow', params: { id } }).catch(() => {})
    },
    getImage (community) {
      return get(community, 'avatarImage.uri') || ''
    },
    shortDescrciption (community) {
      if (!community.description) return
      return community.description.substring(0, 180)
    },
    async acceptInvite (inviteCode) {
      try {
        await this.$apollo.mutate({
          mutation: gql`
          mutation($inviteCode: String) {
            acceptInvite(inviteCode: $inviteCode)
          }`,
          varibles: {
            inviteCode: this.patakaCode
          }
        })
        // this.sucinvalidCode = false
        // this.validCode = true
        this.successMsg = ['Successfully located Pātaka']
      } catch (err) {
        // this.invalidCode = true
        // this.validCode = false
        this.errorMsg = ['Invalid code, please check the code and try again']
        console.error('Invite error: ', err)
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
  .col {
    flex-grow: 0;
  }

  .card-image {
    background: linear-gradient(45deg,
        hsl(0, 6%, 37.1%) 12%,
        transparent 0,
        transparent 88%,
        hsl(0, 6%, 37.1%) 0),
      linear-gradient(135deg,
        transparent 37%,
        hsl(13.5, 4%, 31%) 0,
        hsl(13.5, 4%, 31%) 63%,
        transparent 0),
      linear-gradient(45deg,
        transparent 37%,
        hsl(0, 6%, 37.1%) 0,
        hsl(0, 6%, 37.1%) 63%,
        transparent 0),
      hsl(0, 5.2%, 27.6%);
    background-size: 50px 50px;
  }

  .connect-title {
    flex: 1;
  }

  .headliner {
    font-size: 1em;
    text-transform: uppercase;
    font-weight: 400;
    letter-spacing: 5px;
    color: black;
  }

  .sub-headline {
    font-size: 0.8rem;
    color: rgba(0, 0, 0, 0.6);
  }

  .addBtn {
    position: fixed;
    top: 80px;
    right:100px
  }

  .addBtnMob {
    position: absolute;
    top: 10px;
    right:20px
  }

</style>
