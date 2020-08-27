<template>
  <div class="wrapper">
    <v-container class="px-12" fluid>
      <v-row>
        <v-col cols="4">
          <v-row justify="center">
            <v-btn
              color="grey"
              outlined
              :disabled="network.portForwarding === null"
              tile
              @click="tryInvite"
            >{{!network.ipv4 ? 'Loading network data' : 'Generate join code'}}</v-btn>
          </v-row>
        </v-col>
        <v-col v-if="generateError">
          <p class="red--text caption mb-0">{{generateError}}</p>
        </v-col>
        <v-col cols="8" v-else-if="generatedInvite" class="generated-code">
          <v-row>
            <h3 class="text-uppercase subtitle-1">Pātaka single use code</h3>
          </v-row>
          <v-row align="center" class="mt-2">
            <p class="grey--text mb-0" id="inviteCode">{{generatedInvite}}</p>
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
          <Avatar
            size="180px"
            :alt="profile.preferredName"
            class="pb-4"
            :image="profile.avatarImage"
          />
          <h2 class="subtitle-1 text-uppercase text-center">{{profile.preferredName}}</h2>
          <p class="grey--text text-center feed-id">{{profile.feedId}}</p>
          <v-col cols="8" class="mx-auto">
            <v-row justify="start" class="pl-4">
              <div
                class="dot mr-4"
                :class="network.portForwarding ? 'green' : network.internetLatency === null ? 'grey' : 'orange'"
              />
              <p
                class="body-2 text-uppercase text-center"
              >{{ network.portForwarding ? 'Port-Forwarding' : network.portForwarding === null ? 'Checking' : 'Port-Forwarding Off' }}</p>
            </v-row>
            <v-row justify="start" class="pl-4">
              <div
                class="dot mr-4 internet-dot"
                :class="network.internetLatency ? network.internetLatency === -1 ? 'red' : 'green' : 'grey'"
              />
              <p
                class="body-2 text-uppercase text-center"
              >{{ network.internetLatency ? network.internetLatency === -1 ? 'Offline' : 'Online' : 'Checking'}}</p>
              <span class="network-latency">{{latency}}</span>
            </v-row>
            <v-row justify="start" class="pl-4 network-local">
              <div class="dot mr-4" :class="network.ipv4 ? 'green' : 'grey'" />
              <p class="body-2 text-uppercase">{{network.ipv4 ? ' Local Network' : 'Checking'}}</p>
            </v-row>
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
        <v-col cols="8">
          <v-row class="stat-column">
            <v-col cols="6">
              <Meter title="CPU" :values="cpuLoad" />
            </v-col>
            <v-col cols="6">
              <Meter title="RAM" :values="memoryLoad" />
            </v-col>
          </v-row>
          <v-row class="pt-12">
            <v-col cols="6" class="stat-column">
              <h2 class="h2 text-uppercase pb-12">People</h2>
              <p v-if="invitedPeople.length === 0">There's no one on your network</p>
              <v-row class="pb-2 pl-4">
                <v-col v-for="(people, key) in invitedPeople" :key="key" cols="2">
                  <Avatar
                    size="60px"
                    :alt="people.preferredName"
                    :image="people.avatarImage"
                    showOnHover
                  />
                </v-col>
              </v-row>
              <!-- <v-btn color="grey" outlined tile>View people</v-btn> -->
            </v-col>
            <v-col cols="6" class="stat-column">
              <h2 class="h2 text-uppercase pb-12">Tribes</h2>
              <p v-if="tribes.length === 0">There's are no tribes on your network</p>
              <v-row class="pb-2 pl-4">
                <v-col v-for="(tribes, key) in tribes" :key="key" cols="2">
                  <Avatar
                    size="60px"
                    :alt="tribes.public[0].preferredName"
                    :image="tribes.public[0].avatarImage"
                    showOnHover
                  />
                </v-col>
              </v-row>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-container>
    <GenerateInviteDialog
      v-if="dialog"
      :show="dialog"
      :publicIpv4="network.publicIpv4"
      :portForwarding="network.portForwarding"
      :checkPortForwarding="checkPortForwarding"
      :checkingPort="checkingPort"
      :title="`Generate Invite Code`"
      :errorMsg="errorMsg"
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

const SECONDS = 1000

export default {
  name: 'Dashboard',
  data: () => ({
    dialog: false,
    ipSet: false,
    copyText: 'Copy',
    generatedInvite: null,
    generateError: false,
    errorMsg: null,
    checkingPort: null,
    invitedPeople: [],
    tribes: [],
    profile: {
      feedId: '',
      preferredName: '',
      avatarImage: null
    },
    portForwarding: null,
    network: {
      internetLatency: null,
      ipv4: null,
      ipv6: null,
      publicIpv4: null
    },
    diskUsage: [],
    cpuLoad: [],
    memoryLoad: []
  }),
  computed: {
    latency () {
      if (this.network.internetLatency && this.network.internetLatency !== -1) return `${this.network.internetLatency} ms`
      else return 'Unknown'
    }
  },
  apollo: {
    profile: {
      query: gql`query {
        whoami {
          public {
          feedId
          profile {
            id
            preferredName
            avatarImage {
              uri
            }
          }
          }
        }
    }`,
      update (data) {
        if (!data.whoami.public.profile || !data.whoami.public.profile.preferredName) this.$router.push({ name: 'login' })
        return {
          ...data.whoami.public.profile,
          feedId: data.whoami.public.feedId
        }
      }
    },
    network: {
      query: gql`query {
        network {
          ipv4
          internetLatency
          publicIpv4
          portForwarding
        }
      }`,
      pollInterval: 10 * SECONDS
    },
    portForwarding: {
      query: gql`query {
        network {
          portForwarding
        }
      }`,
      update (data) {
        return data.network.portForwarding
      }
    },
    cpuLoad: {
      query: gql`query {
        cpuLoad
      }`,
      pollInterval: 10 * SECONDS,
      update (data) {
        if (this.cpuLoad.length >= 360) {
          this.cpuLoad.pop()
        }
        return [ ...this.cpuLoad, data.cpuLoad ]
      }
    },
    memoryLoad: {
      query: gql`query {
        memoryLoad
      }`,
      pollInterval: 10 * SECONDS,
      update (data) {
        if (this.memoryLoad.length >= 360) {
          this.memoryLoad.pop()
        }
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
      pollInterval: 10 * SECONDS
    },
    invitedPeople: {
      query: gql`query {
        invitedPeople {
          id
          preferredName
          avatarImage {
            uri
          }
        }
      }
      `,
      pollInterval: 5 * SECONDS
    },
    tribes: {
      query: gql`query {
        tribes {
          public {
            preferredName
            avatarImage {
              uri
            }
          }
        }
      }`,
      pollInterval: 10 * SECONDS
    }
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
        this.dialog = false
        this.generatedInvite = res.data.createInvite
        this.copyText = 'Copy'
      } catch (err) {
        console.error(err)
        this.generateError = 'something went wrong while trying to generate an invite code'
        throw err
      }
    },
    async tryInvite () {
      if (this.portForwarding) await this.generateInviteCode(this.network.publicIpv4)
      else this.toggleDialog()
    },
    async checkPortForwarding () {
      this.checkingPort = true
      this.errorMsg = null
      const res = await this.$apollo.query({
        query: gql`query {
            network {
              portForwarding
            }
          }`
      })
      const pf = res.data.network.portForwarding
      this.portForwarding = pf
      if (pf) {
        await this.tryInvite()
        this.errorMsg = null
      } else {
        this.errorMsg = 'Port not open'
      }
      this.checkingPort = false
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
#inviteCode {
  font-size: 0.5em;
}
.feed-id {
  font-size: 0.5em;
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
.internet-dot:hover ~ .network-latency {
  left: -200px;
}
.network-latency {
  position: relative;
  left: -100vw;
  top: -10px;
  background: grey;
  height: 30px;
  width: 100px;
  line-height: 30px;
  text-align: center;
  border-radius: 4px;
  margin: 0 auto;
}
// .network-local {
//   margin-top: -30px !important;
// }
.stat-column {
  padding-top: 10px;
}
.log-box {
  background: var(--v-primary-base);
  opacity: 0.8;
  padding: 45px 25px 15px;
  min-height: 90%;
}
@media screen and (min-width: 1280px) {
  #inviteCode {
    font-size: 0.8em;
  }
  .feed-id {
    font-size: 0.8em;
  }
}
</style>
