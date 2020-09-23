<template>
  <div class="py-4">
    <v-row class="top-margin mb-5">
      <v-col class="headliner black--text pa-0 pl-4 pt-2" :class="!mobile ? 'pt-2':''">Tribes</v-col>
      <div>
        <v-btn
          :medium="!mobile"
          text
          :x-small="mobile"
          :class="mobile ? 'addBtnMob' : 'addBtn'"
          class="my-2"
          fab
          color="white"
          @click="$emit('add-community-dialog')"
          elevation="4"
        >
          <v-icon :large="!mobile" class="black--text">mdi-plus</v-icon>
        </v-btn>
      </div>
    </v-row>
    <v-row>
      <v-col cols="12" md="9">
        <div>
          <v-row v-if="connectedTribes.length" class="pt-4">
            <v-col cols="12" class="py-0">
              <p class="sub-headline pa-0 mb-4">Tribes that you are connected to</p>
              <v-row justify="start">
                <v-col
                  v-for="tribe in connectedTribes"
                  :item="tribe"
                  :key="tribe.id"
                  justify-self="start"
                >
                  <v-card light :width="!mobile ? '190px':'100vw'" @click="goTribe(tribe)">
                    <v-img height="150px" :src="getImage(tribe.private[0])" class="card-image" />
                    <v-card-title class="subtitle font-weight-bold pb-2">
                      {{
                      tribe.private[0].preferredName
                      }}
                    </v-card-title>
                    <v-card-text class="body-2">
                      {{
                      shortDescription(tribe.private[0])
                      }}
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
              <v-divider v-if="otherTribes && otherTribes.length" light color="grey" class="my-10"></v-divider>
            </v-col>
          </v-row>
          <v-row v-if="otherTribes.length" class="pt-4">
            <v-col cols="12" class="py-0">
              <p class="sub-headline pa-0 mb-4">Other whanau tribes</p>
              <v-row justify="start">
                <v-col v-for="tribe in otherTribes" :item="tribe" :key="tribe.id" justify-self="start">
                  <v-card light :width="!mobile ? '190px':'100vw'" @click="goTribe(tribe)">
                    <v-img height="150px" :src="getImage(tribe.public[0])" class="card-image" />
                    <v-card-title class="subtitle font-weight-bold pb-2">
                      {{
                      tribe.public[0].preferredName
                      }}
                    </v-card-title>
                    <v-card-text class="body-2">
                      {{
                      shortDescription(tribe.public[0])
                      }}
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </v-col>
          </v-row>
        </div>
      </v-col>
      <v-col cols="12" md='3' class="py-0 pr-8 mt-12">
        <ProfileCard title="Pātaka" class="mt-3">
          <template v-slot:content>
            <div v-if="patakas.length > 0">
              <v-row v-for="pataka in patakas" :key="pataka.id" class="justify-center align-center ma-0 ml-4">
                <v-col cols="2" class="pt-0 pl-0">
                  <Avatar :size="mobile ? '50px' : '40px'" :image="pataka.avatarImage" :alt="pataka.preferredName" :isView="!pataka.avatarImage"/>
                </v-col>
                <v-col cols="10" class="py-0">
                  <p style="color:black;">{{pataka.preferredName}}</p>
                </v-col>
              </v-row>
            </div>
            <v-row justify='center'>
              <v-btn text small justify-center class="blue--text mt-3" @click="dialog = 'new-pataka'">
                <v-icon small class="blue--text pr-2 ml-3">mdi-plus</v-icon>
                new Pātaka
              </v-btn>
            </v-row>
          </template>
        </ProfileCard>
      </v-col>
    </v-row>
    <NewPatakaDialog 
      v-if="dialog === 'new-pataka'"
      :show="dialog === 'new-pataka'"
      :title="`Connect to new Pātaka`"
      @close="dialog = null"
      @submit="showSnackbar($event)"
    />
    <ConfirmationText :show="snackbar" :message="confirmationText" :timeout="5000"/>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import gql from 'graphql-tag'
import whakapapa from '@/assets/whakapapa.png'
import ProfileCard from '@/components/profile/ProfileCard.vue'
import Avatar from '@/components/Avatar.vue'
import NewPatakaDialog from '@/components/dialog/community/NewPatakaDialog.vue'
import ConfirmationText from '@/components/dialog/ConfirmationText.vue'

const get = require('lodash.get')

export default {
  name: 'CommunitiesList',
  data () {
    return {
      snackbar: false,
      confirmationText: null,
      tribes: [],
      patakas: [],
      dialog: null
    }
  },
  components: {
    ProfileCard,
    Avatar,
    NewPatakaDialog,
    ConfirmationText,
    Chip
  },
  apollo: {
    tribes: {
      query: gql`query {
        tribes {
          id
          public {
            id
            type
            preferredName
            description
            avatarImage { uri }
            description
            headerImage { uri }
            tombstone { date }
            email
            phone
            location
            canEdit
            tiaki {
              id
              feedId
              avatarImage { uri }
              preferredName
              aliveInterval
            }
          }
          private {
            id
            type
            preferredName
            description
            avatarImage { uri }
            headerImage { uri }
            recps
            tombstone {date}
            email
            phone
            location
            canEdit
            tiaki {
              id
              feedId
              avatarImage { uri }
              preferredName
              aliveInterval
            }
          }
        }
      }
    `,
      pollInterval: 10e3,
      update (data) {
        return data.tribes
      },
      fetchPolicy: 'no-cache'
    }
  },
  mounted () {
    this.pataka()
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
    },
  },
  methods: {
    ...mapActions(['setComponent', 'setDialog', 'setProfile','setCurrentTribe']),
    showSnackbar(text) {
      this.snackbar = !this.snackbar
      this.confirmationText = text
    },
    async pataka () {
      var result = await this.$apollo.query({
        query: gql`
        query{
          patakas {
            id preferredName avatarImage {uri} description
          }
        }`
      })
      if (result.errors) {
        console.error('WARNING, something went wrong')
        console.error(result.errors)
      } else {
        this.patakas = result.data.patakas
        console.log('patakas: ', this.patakas)
      }
    },
    goTribe (tribe) {
      this.setCurrentTribe(tribe)
      if (tribe.private.length > 0) this.goProfile(tribe.private[0])
      else this.goProfile(tribe.public[0])
    },
    goProfile (tribe) {
      this.setComponent('profile')
      this.setProfile(tribe)
      this.$router.push({ name: 'profileShow', params: { id: tribe.id } }).catch(() => {})
    },
    getImage (community) {
      return get(community, 'avatarImage.uri') || whakapapa
    },
    shortDescription (community) {
      if (!community.description) return
      return community.description.substring(0, 180)
    },
  //   async acceptInvite () {
  //     if (!this.patakaCode || this.patakaCode.length === 0) {
  //       this.errorMsg = ['Invalid code, please enter a code and try again']
  //       return
  //     }

  //     try {
  //       await this.$apollo.mutate({
  //         mutation: gql`
  //         mutation($inviteCode: String!) {
  //           acceptInvite(inviteCode: $inviteCode)
  //         }`,
  //         variables: {
  //           inviteCode: this.patakaCode.trim()
  //         }
  //       })
  //       // this.invalidCode = false
  //       // this.validCode = true
  //       this.successMsg = ['Successfully connected to Pātaka']
  //     } catch (err) {
  //       // this.invalidCode = true
  //       // this.validCode = false
  //       this.errorMsg = ['Invalid code, please check the code and try again']
  //       console.error('Invite error: ', err)
  //       return
  //     }
  //     this.errorMsg = []
  //   }
   
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.col {
  flex-grow: 0;
}

.card-image {
  background: linear-gradient(
      45deg,
      hsl(0, 6%, 37.1%) 12%,
      transparent 0,
      transparent 88%,
      hsl(0, 6%, 37.1%) 0
    ),
    linear-gradient(
      135deg,
      transparent 37%,
      hsl(13.5, 4%, 31%) 0,
      hsl(13.5, 4%, 31%) 63%,
      transparent 0
    ),
    linear-gradient(
      45deg,
      transparent 37%,
      hsl(0, 6%, 37.1%) 0,
      hsl(0, 6%, 37.1%) 63%,
      transparent 0
    ),
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
  right: 100px;
}

.addBtnMob {
  position: absolute;
  top: 10px;
  right: 20px;
}
</style>

