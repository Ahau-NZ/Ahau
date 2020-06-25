<template>
  <div class="wrapper">
    <v-container class="px-12" fluid>
      <v-row>
        <v-col cols="4">
          <v-row justify="center">
            <v-btn color="grey" outlined tile @click="generateInviteCode">Generate join code</v-btn>
          </v-row>
        </v-col>
        <v-col v-if="generatedInvite" class="generated-code">
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
              <div class="dot mr-4" :class="network.internetLatency ? 'green' : 'grey'" />
              <p
                class="body-1 text-uppercase text-center"
              >{{ network.internetLatency ? 'Online' : 'Checking'}}</p>
            </v-row>
            <v-row justify="center">
              <div class="dot mr-4" :class="network.ipv4 ? 'green' : 'grey'" />
              <p class="body-1 text-uppercase">{{network.ipv4 ? 'Local' : 'Checking'}}</p>
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
          <h2 class="h2 text-uppercase pb-12">People</h2>
          <h3 class="py-2 text-uppercase subtitle-1 grey--text">64 people online</h3>
          <v-row class="pb-4">
            <Avatar size="40px" alt="name" />
          </v-row>
          <v-btn color="grey" outlined tile>View people</v-btn>
        </v-col>
        <v-col cols="2" class="stat-column">
          <h2 class="h2 text-uppercase pb-12">Summary</h2>
          <h3 class="py-2 text-uppercase subtitle-1 grey--text">213 Records</h3>
          <h3 class="py-2 text-uppercase subtitle-1 grey--text">28 Whakapapa Records</h3>
          <h3 class="py-2 text-uppercase subtitle-1 grey--text">7 communities</h3>
        </v-col>
        <v-col cols="3" class="stat-column">
          <h2 class="h2 text-uppercase pb-12">Activity log</h2>
          <p class="log-box">
            warning: Pulling without specifying how to reconcile divergent branches is
            discouraged. You can squelch this message by running one of the following
            commands sometime before your next pull:
            git config pull.rebase false # merge (the default strategy)
            git config pull.rebase true # rebase
            git config pull.ff only # fast-forward only
            You can replace "git config" with "git config --global" to set a default
            preference for all repositories. You can also pass --rebase, --no-rebase,
            or --ff-only on the command line to override the configured default per
            invocation.
            From gitlab.com:ahau/ssb-graphql-main
            * branch master -> FETCH_HEAD
            Already up to date.
          </p>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import Avatar from '@/components/Avatar.vue'
import Meter from '@/components/Meter.vue'
import gql from 'graphql-tag'

export default {
  name: 'Dashboard',
  data: () => ({
    copyText: 'Copy',
    generatedInvite: null,
    network: {
      internetLatency: null,
      ipv4: null
    },
    diskUsage: [],
    cpuLoad: [],
    memoryLoad: []
  }),
  apollo: {
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
        console.log('update -> DISAK', data)
        return data.diskUsage
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
  },
  methods: {
    async generateInviteCode () {
      try {
        const res = await this.$apollo.mutate({
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
    Meter
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
