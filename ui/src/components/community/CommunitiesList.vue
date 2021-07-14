<template>
  <div class="py-4">
    <v-row>
      <v-col cols="10" class="headliner black--text pa-0 pl-4 pt-5" :class="!mobile ? 'pt-2':''">Tribes</v-col>
      <v-col >
        <BigAddButton :label="t('newTribeButton')" :customClass="mobile ? 'addBtnMobile':'addBtnDesktop'" @click="$emit('add-community-dialog')" />
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" md="9">
        <div>
          <v-row v-if="connectedTribes.length" class="pt-4">
            <v-col cols="12" class="py-0">
              <p class="sub-headline pa-0 mb-4">{{ t('connectedTribes') }}</p>
              <v-row justify="start">
                <v-col
                  v-for="tribe in connectedTribes"
                  :item="tribe"
                  :key="tribe.id"
                  justify-self="start"
                >
                  <v-card flat class="rounded-border" light :width="!mobile ? '190px':'100vw'" :to="goTribe(tribe)">
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
              <p class="sub-headline pa-0 mb-4">{{ t('otherTribes')}}</p>
              <v-row justify="start">
                <v-col v-for="tribe in otherTribes" :item="tribe" :key="tribe.id" justify-self="start">
                  <v-card flat light class="rounded-border" :width="!mobile ? '190px':'100vw'" :to="goTribe(tribe)">
                    <v-img height="150px" :src="getImage(tribe.public[0])" class="card-image" />
                    <v-card-title class="subtitle font-weight-bold pb-2">
                      {{ tribe.public[0].preferredName }}
                    </v-card-title>
                    <v-card-text class="body-2">
                      {{ shortDescription(tribe.public[0]) }}
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </v-col>
          </v-row>
        </div>
      </v-col>
      <v-col cols="12" md='3' :class="mobile ? 'px-6':'py-0 pr-8 pl-4 mt-12'">
        <v-divider v-if="mobile" light></v-divider>
        <ProfileCard title="Pātaka" class="mt-7">
          <template v-slot:content>
            <div v-if="patakas.length > 0">
              <v-row v-for="pataka in patakas" :key="pataka.id" class="align-center ml-6">
                <v-col cols="2" class="pt-0 pl-0">
                  <Avatar :size="mobile ? '60px' : '45px'" :image="pataka.avatarImage" :alt="pataka.preferredName" :isView="!pataka.avatarImage" :online="pataka.online"/>
                </v-col>
                <v-col cols="10" class="pb-6" justify-center>
                  <p style="color:black;" class="mb-0">{{ pataka.preferredName }} </p>
                  <span v-if="pataka.online" style="color:#37e259; position:absolute; font-size:11px">online</span>
                </v-col>
              </v-row>
            </div>
            <div v-else>
              <p class="pl-3 caption">{{ $t('pataka.notConnected') }}</p>
            </div>
            <v-row justify='center'>
              <v-btn text small justify-center class="blue--text mt-3" @click="dialog = !dialog">
                <v-icon small class="blue--text pr-2 ml-3">mdi-plus</v-icon>
                {{ $t('pataka.connectPataka')}}
              </v-btn>
            </v-row>
          </template>
        </ProfileCard>
      </v-col>
    </v-row>
    <NewPatakaDialog
      v-if="dialog"
      :show="dialog"
      :title="$t('pataka.newPataka')"
      :connected="connectedPatakaAotearoa"
      @close="dialog = false"
      @submit="connected($event)"
    />
  </div>
</template>

<script>
import { mapActions, createNamespacedHelpers } from 'vuex'
import gql from 'graphql-tag'
import whakapapa from '@/assets/whakapapa.png'
import ProfileCard from '@/components/profile/ProfileCard.vue'
import Avatar from '@/components/Avatar.vue'
import NewPatakaDialog from '@/components/dialog/connection/NewPatakaDialog.vue'
import BigAddButton from '@/components/button/BigAddButton.vue'
import { getTribes } from '@/lib/community-helpers.js'
const { mapMutations: mapAlertMutations } = createNamespacedHelpers('alerts')

const get = require('lodash.get')

export default {
  name: 'CommunitiesList',
  data () {
    return {
      confirmationText: null,
      tribes: [],
      patakasRaw: [],
      connectedPeers: [],
      dialog: false
    }
  },
  components: {
    ProfileCard,
    Avatar,
    NewPatakaDialog,
    BigAddButton
  },
  apollo: {
    tribes: {
      ...getTribes,
      pollInterval: 10e3
    },
    patakasRaw: {
      query: gql`query{
        patakas {
          id
          preferredName
          avatarImage { uri }
          description
        }
      }`,
      pollInterval: 10e3,
      fetchPolicy: 'no-cache',
      update (data) {
        return data.patakas
      }
    },
    connectedPeers: {
      query: gql`query{
        connectedPeers {
          pataka {
            id
            preferredName
            avatarImage {uri}
          }
        }
      }`,
      pollInterval: 10e3,
      fetchPolicy: 'no-cache',
      update (data) {
        return data.connectedPeers
      }
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
    },
    connectedPatakaAotearoa () {
      if (!this.patakasRaw) return
      const env = require('ahau-env')()
      const patakaId = env.isDevelopment ? '%2XVs1WkdDdCmiHtijSES/q7PBcLIi9cyK64ndfn/c1w=.sha256' : '%tSrLMNsHrgoXMa6AAXL5EoZiLN0CqbHZ7fdFEW0AG/o=.sha256'
      return this.patakasRaw.some(pataka => pataka.id === patakaId)
    },
    patakas () {
      if (!this.patakasRaw) return
      return this.patakasRaw.map(pataka => {
        if (this.connectedPeers && this.connectedPeers.pataka && this.connectedPeers.pataka.some(peer => peer.id === pataka.id)) {
          return {
            ...pataka,
            online: true
          }
        } else return pataka
      })
    }
  },
  methods: {
    ...mapActions(['setSyncing']),
    ...mapAlertMutations(['showAlert']),
    connected (text) {
      this.dialog = false
      this.showAlert({
        message: text,
        color: 'green'
      })
      this.setSyncing(true)

      // update to check ssb.status
    },
    goTribe (tribe) {
      if (tribe.private.length > 0) return this.goProfile(tribe.id, tribe.private[0])
      return this.goProfile(tribe.id, tribe.public[0])
    },
    goProfile (tribeId, profile) {
      return {
        name: 'community', params: { tribeId, profileId: profile.id, profile }
      }
    },
    getImage (community) {
      return get(community, 'avatarImage.uri') || whakapapa
    },
    shortDescription (community) {
      if (!community.description) return
      return community.description.substring(0, 180)
    },
    t (key, vars) {
      return this.$t('viewTribes.' + key, vars)
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.subtitle {
  word-break: break-word;
}

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

.rounded-border {
  color: black;
  border: 0.5px solid rgba(0,0,0,0.3);
  border-radius: 10px;
  background-color: white;
}

</style>
