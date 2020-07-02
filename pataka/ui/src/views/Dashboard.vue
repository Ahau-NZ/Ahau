<template>
  <div class="wrapper">
    <v-container class="px-12" fluid>
      <v-row>
        <v-col cols="4">
          <v-row justify="center">
            <v-btn
              color="grey"
              outlined
              :disabled="!network.ipv4"
              tile
              @click="toggleDialog"
            >{{!network.ipv4 ? 'Loading network data' : 'Generate join code'}}</v-btn>
          </v-row>
        </v-col>
        <v-col v-if="generateError">
          <p class="red--text caption mb-0">{{generateError}}</p>
        </v-col>
        <v-col v-else-if="generatedInvite" class="generated-code">
          <v-row>
            <h3 class="text-uppercase subtitle-1">Pātaka single use code</h3>
          </v-row>
          <v-row align="center" class="mt-2">
            <p class="grey--text caption mb-0" id="inviteCode">{{generatedInvite}}</p>
            <v-btn
              color="grey"
              outlined
              tile
              class="ml-8 text-uppercase"
              @click="copyCode"
            >{{copyText}}</v-btn>
          </v-row>
        </v-col>
        <v-col v-else class="generated-code"></v-col>
      </v-row>
      <v-row justify="center">
        <v-col cols="4">
          <Avatar size="180px" alt="name" class="pb-4" />
          <h2 class="subtitle-1 text-uppercase text-center">Name of Pataka</h2>
          <p class="subtitle-2 grey--text text-center">Pataka SSB ID</p>
          <v-col cols="8" class="mx-auto">
            <v-row justify="center">
              <div
                class="dot mr-4"
                :class="network.internetLatency ? network.internetLatency === -1 ? 'red' : 'green' : 'grey'"
              />
              <p
                class="body-1 text-uppercase text-center"
              >{{ network.internetLatency ? network.internetLatency === -1 ? 'Offline' : 'Online' : 'Checking'}}</p>
            </v-row>
            <v-row justify="center">
              <div class="dot mr-4" :class="network.ipv4 ? 'green' : 'grey'" />
              <p class="body-1 text-uppercase">{{network.ipv4 ? ' Local' : 'Checking'}}</p>
            </v-row>
            <Meter title="CPU" :values="cpuLoad" />
            <Meter title="RAM" :values="memoryLoad" />
            <v-col class="mt-8">
              <h3>Disk Usage</h3>
              <v-progress-linear
                v-for="disk in diskUsage"
                :key="disk.fs"
                class="mt-4"
                :value="disk.use"
                height="25"
                color="blue-grey"
              >
                <strong class="pr-2">{{ Math.ceil(disk.use) }}%</strong>
                <span class="caption">{{disk.fs}}</span>
              </v-progress-linear>
            </v-col>
          </v-col>
        </v-col>
        <v-col cols="3" class="stat-column">
          <!-- <h2 class="h2 text-uppercase pb-12">People</h2>
          <h3 class="py-2 text-uppercase subtitle-1 grey--text">64 people online</h3>
          <v-row class="pb-4">
            <Avatar size="40px" alt="name" />
          </v-row>
          <v-btn color="grey" outlined tile>View people</v-btn>-->
        </v-col>
        <v-col cols="2" class="stat-column">
          <h2 class="h2 text-uppercase pb-12">Summary</h2>
          <h3
            class="py-2 text-uppercase subtitle-1 grey--text"
          >{{dataSummary.profileRecords}} Profile Records</h3>
          <h3
            class="py-2 text-uppercase subtitle-1 grey--text"
          >{{dataSummary.whakapapaRecords}} Whakapapa Records</h3>
          <h3
            class="py-2 text-uppercase subtitle-1 grey--text"
          >{{dataSummary.communityRecords}} Community Records</h3>
        </v-col>
        <v-col cols="3" class="stat-column">
          <!-- <h2 class="h2 text-uppercase pb-12">Activity log</h2>
          <p class="log-box">
          </p>-->
        </v-col>
      </v-row>
    </v-container>
    <GenerateInviteDialog
      v-if="dialog"
      :show="dialog"
      :publicIpv4="publicIpv4"
      :title="`Generate Invite Code`"
      @close="toggleDialog"
      @generate="generateInviteCode($event)"
    />
  </div>
</template>

<script>
import Avatar from '@/components/Avatar.vue'
import GenerateInviteDialog from '@/components/GenerateInviteDialog'
import Meter from '@/components/Meter.vue'
import gql from 'graphql-tag'

export default {
  name: 'Dashboard',
  data: () => ({
    dialog: false,
    ipSet: false,
    copyText: 'Copy',
    generatedInvite: null,
    generateError: false,
    publicIpv4: null,
    network: {
      internetLatency: null,
      ipv4: null,
      ipv6: null
    },
    diskUsage: [],
    cpuLoad: [],
    memoryLoad: [],
    dataSummary: {
      profileRecords: 0,
      whakapapaRecords: 0,
      communityRecords: 0
    }
  }),
  apollo: {
    publicIpv4: {
      query: gql`query {
      network {
        publicIpv4
      }
    }`,
      update (data) {
        return data.network.publicIpv4
      }
    },
    network: {
      query: gql`query {
      network {
        ipv4
        internetLatency
      }
    }`,
      update (data) {
        return data.network
      }
    },
    cpuLoad: {
      query: gql`query {
      cpuLoad
    }`,
      update (data) {
        return [ ...this.cpuLoad, data.cpuLoad ]
      }
    },
    memoryLoad: {
      query: gql`query {
      memoryLoad
    }`,
      update (data) {
        return [ ...this.memoryLoad, data.memoryLoad ]
      }
    },
    diskUsage: {
      query: gql`query {
      diskUsage {
        use
        fs
      }
    }`,
      update (data) {
        return data.diskUsage
      }
    },
    dataSummary: {
      query: gql`query {
      dataSummary {
        profileRecords
        whakapapaRecords
        communityRecords
      }
    }`,
      pollInterval: 300,
      update (data) {
        return data.dataSummary
      }
    }
  },
  watch: {
    'cpuLoad' (newValue) {
      if (newValue.length === 1) this.$apollo.queries.cpuLoad.startPolling(5000)
    },
    'memoryLoad' (newValue) {
      if (newValue.length === 1) this.$apollo.queries.memoryLoad.startPolling(5000)
    },
    'diskUsage' (newValue) {
      this.$apollo.queries.diskUsage.startPolling(5000)
    }
    // 'dataSummary' (newValue) {
    //   this.$apollo.queries.dataSummary.startPolling(5000)
    // }
  },
  methods: {
    async toggleDialog () {
      this.dialog = !this.dialog
    },
    async generateInviteCode (externalIp) {
      const input = externalIp ? {
        external: externalIp
      } : {}
      try {
        const res = await this.$apollo.mutate({
          mutation: gql`
              mutation ($input: createInviteInput) {
                createInvite(input: $input)
              }
              `,
          variables: {
            input: {
              ...input
            }
          }

        })
        this.generateError = false
        this.generatedInvite = res.data.createInvite
        this.copyText = 'Copy'
      } catch (err) {
        this.generateError = err
        throw err
      }
    },
    async getDiskUsage () {
      try {
        const res = await this.$apollo.query({
          mutation: gql`
              mutation {
                createInvite
              }
              `
        })
        this.generatedInvite = res.data.createInvite
        this.copyText = 'Copy'
      } catch (err) {
        throw err
      }
    },
    async copyCode () {
      navigator.clipboard.writeText(this.generatedInvite)
        .then(() => {
          this.copyText = 'Copied'
        })
        .catch(err => {
          // This can happen if the user denies clipboard permissions:
          console.error('Could not copy text: ', err)
        })
    }
  },
  components: {
    Avatar,
    Meter,
    GenerateInviteDialog
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.wrapper {
  // background-color: white;
  width: 100%;
  height: 100%;
}
.generated-code {
  height: 70px;
}
.dot {
  height: 25px;
  width: 25px;
  background-color: grey;
  border-radius: 50%;
  display: inline-block;
}
.green {
  background-color: green;
}
.orange {
  background-color: orange;
}
.red {
  background-color: red;
}
.grey {
  background-color: grey;
}
.stat-column {
  padding-top: 240px;
}
.log-box {
  background: var(--v-primary-base);
  opacity: 0.8;
  padding: 45px 25px 15px;
  min-height: 90%;
}
</style>
