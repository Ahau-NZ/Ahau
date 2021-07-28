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
        <v-row class="pt-4">
          <v-col v-if="connectedTribes.length" cols="12" class="py-0">
            <CommunityList :title="t('connectedTribes')" :tribes="connectedTribes"/>
          </v-col>
          <v-col v-if="otherTribes.length" cols="12" class="py-0">
            <v-divider light color="grey" class="my-10"></v-divider>
            <CommunityList :title="t('otherTribes')" :tribes="otherTribes"/>
          </v-col>
        </v-row>
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
import ProfileCard from '@/components/profile/ProfileCard.vue'
import CommunityList from '@/components/community/CommunityList.vue'
import Avatar from '@/components/Avatar.vue'
import NewPatakaDialog from '@/components/dialog/connection/NewPatakaDialog.vue'
import BigAddButton from '@/components/button/BigAddButton.vue'
import { getTribes } from '@/lib/community-helpers.js'
import patakaConfig from '../../../pataka.config'

const { mapMutations: mapAlertMutations } = createNamespacedHelpers('alerts')

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
    CommunityList,
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
      const patakaId = patakaConfig.id
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
    t (key, vars) {
      return this.$t('viewTribes.' + key, vars)
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.col {
  flex-grow: 0;
}

.headliner {
  font-size: 1em;
  text-transform: uppercase;
  font-weight: 400;
  letter-spacing: 5px;
  color: black;
}

</style>
