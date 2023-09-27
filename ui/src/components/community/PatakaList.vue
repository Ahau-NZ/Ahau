<template>
  <div>
    <v-row>
      <v-col>
        <v-divider v-if="mobile" light></v-divider>
        <ProfileCard :title="t('title')" class="patakas">
          <template v-slot:content>
            <SkeletonLoader
              v-if="!patakas"
              :totalSkeletons=2
              skeletonType="list-item-avatar"
              width="100%"
              :cols=12
              max-height=200
            />

            <div v-else-if="patakas && patakas.length > 0">
              <v-list-item v-for="pataka in patakas" :key="pataka.id"
                class="pataka px-1"
                :class="{ blocked: pataka.isBlocked, online: pataka.online }"
              >
                <v-list-item-avatar>
                  <Avatar
                    :image="pataka.avatarImage"
                    :alt="pataka.preferredName"
                    :size="mobile ? '60px' : '46px'"
                    :isView="!pataka.avatarImage"
                    :online="pataka.online"
                  />
                </v-list-item-avatar>

                <v-list-item-content>
                  <v-list-item-title v-if="pataka.preferredName">
                    {{ pataka.preferredName }}
                  </v-list-item-title>
                  <v-list-item-title v-else class="unnamed">
                    <i>{{ t('unnamed') }}</i>
                  </v-list-item-title>

                  <v-list-item-subtitle v-if="pataka.isBlocked">
                    {{ t('blocked') }}
                  </v-list-item-subtitle>
                  <v-list-item-subtitle v-else-if="pataka.online">
                    {{ t('online') }}
                  </v-list-item-subtitle>
                </v-list-item-content>

                <v-list-item-action>
                  <v-btn v-if="!pataka.isBlocked"
                    icon plain x-small
                    color="grey"
                    @click="handleBlock(pataka)"
                  >
                    <v-icon>mdi-delete</v-icon>
                  </v-btn>
                  <v-btn v-if="pataka.isBlocked"
                    icon plain x-small
                    color="secondary"
                    @click="handleUnblock(pataka)"
                  >
                    <v-icon>mdi-connection</v-icon>
                  </v-btn>
                </v-list-item-action>
              </v-list-item>
            </div>

            <div v-else>
              <p class="pl-3 caption">{{ t('notConnected') }}</p>
            </div>
            <v-row justify='center'>
              <v-btn text small justify-center
                class="blue--text mt-3"
                @click="dialog = !dialog"
              >
                <v-icon small class="blue--text pr-2 ml-3">mdi-plus</v-icon>
                {{ t('connectPataka')}}
              </v-btn>
            </v-row>
          </template>
        </ProfileCard>
      </v-col>
    </v-row>
    <NewPatakaDialog
      v-if="dialog"
      :show="dialog"
      :title="t('newPataka')"
      :connected="connectedPatakaAotearoa"
      @close="dialog = false"
      @submit="connected($event)"
    />
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import gql from 'graphql-tag'

import ProfileCard from '@/components/profile/ProfileCard.vue'
import Avatar from '@/components/Avatar.vue'
import NewPatakaDialog from '@/components/dialog/connection/NewPatakaDialog.vue'
import SkeletonLoader from '@/components/SkeletonLoader.vue'

import { getPatakas } from '@/store/modules/pataka/apollo-helpers.js'
import patakaConfig from '../../../pataka.config.mjs'

export default {
  name: 'PatakaList',
  components: {
    ProfileCard,
    Avatar,
    NewPatakaDialog,
    SkeletonLoader
  },
  apollo: {
    patakasRaw: getPatakas({
      pollInterval: 10e3,
      fetchPolicy: 'no-cache',
      update (data) {
        return data.patakas
      }
    }),
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
  data () {
    return {
      dialog: null,
      patakasRaw: null,
      connectedPeers: []
    }
  },
  computed: {
    mobile () {
      return this.$vuetify.breakpoint.xs || this.$vuetify.breakpoint.sm
    },
    connectedPatakaAotearoa () {
      if (!this.patakasRaw) return
      const patakaId = patakaConfig.id
      return this.patakasRaw.some(pataka => pataka.id === patakaId)
    },
    patakas () {
      if (!this.patakasRaw) return null
      if (!this.connectedPeers || !this.connectedPeers.pataka) return this.patakasRaw

      return this.patakasRaw.map(pataka => {
        return {
          ...pataka,
          online: this.connectedPeers.pataka.some(peer => peer.id === pataka.id)
        }
      })
    }
  },
  methods: {
    ...mapActions(['setSyncing']),
    ...mapActions('alerts', ['showAlert']),
    ...mapActions('pataka', ['blockPataka', 'unblockPataka']),

    connected (text) {
      this.dialog = false
      this.showAlert({
        message: text,
        color: 'green'
      })
      this.setSyncing(true)

      // update to check ssb.status
    },

    handleBlock (pataka) {
      this.blockPataka(pataka.feedId)
        .then(this.updatePatakasRaw)
    },

    handleUnblock (pataka) {
      this.unblockPataka(pataka.feedId)
        .then(this.updatePatakasRaw)
    },

    updatePatakasRaw () {
      this.$apollo.query(getPatakas())
        .then(res => {
          console.log('here', res)
          this.patakasRaw = res.data.patakas
        })
    },

    t (key, vars) {
      return this.$t('pataka.' + key, vars)
    }
  }
}
</script>

<style lang="scss" scoped>

.patakas {
  .pataka {
    min-height: 62px;

    .v-list-item__title {
      &.unnamed {
        color: grey;
      }
    }
    .v-list-item__content { color: black; }
    .v-list-item__subtitle { color: black; }

    &.online {
      .v-list-item__subtitle { color: #39b752; }
    }
    &.blocked {
      .v-list-item__avatar { filter: grayscale(1) opacity(50%); }
      .v-list-item__title { filter: grayscale(1) opacity(50%); }
      .v-list-item__subtitle { color: #b12626; }
    }
  }
}

</style>
