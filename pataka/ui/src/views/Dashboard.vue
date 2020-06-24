<template>
  <div class="wrapper">
    <v-container class="px-12" fluid>
      <v-row>
        <v-col cols="4">
          <v-row justify="center">
            <v-btn color="grey" outlined tile>Generate join code</v-btn>
          </v-row>
        </v-col>
        <v-col cols="4">
          <v-row>
            <h3 class="text-uppercase subtitle-1">Pātaka single use code</h3>
          </v-row>
          <v-row align="center" class="mt-4">
            <div class="grey--text subtitle-2">askdhasjdkahskd</div>
            <v-btn color="grey" outlined tile class="ml-8 text-uppercase">copy</v-btn>
          </v-row>
        </v-col>
      </v-row>
      <v-row justify="center">
        <v-col cols="4">
          <Avatar size="180px" alt="name" class="pb-4" />
          <h2 class="subtitle-1 text-uppercase text-center">Name of Pataka</h2>
          <p class="subtitle-2 grey--text text-center">Pataka SSB ID</p>
          <v-col cols="8" class="mx-auto">
            <v-row justify="center">
              <div class="dot orange mr-4" />
              <p class="body-1 text-uppercase text-center">Offline</p>
            </v-row>
            <v-row justify="center">
              <div class="dot green mr-4" />
              <p class="body-1 text-uppercase">Local</p>
            </v-row>
            <Meter title="CPU" :labels="labels" :values="values" />
            <Meter title="RAM" :labels="labels" :values="values" />
            <v-col class="mt-8">
              <h3>Disk Usage</h3>
              <v-progress-linear class="mt-4" v-model="storage" height="25" color="blue-grey">
                <strong>{{ Math.ceil(storage) }}%</strong>
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

export default {
  name: 'Dashboard',
  data: () => ({
    storage: 33,
    labels: [
      '12am',
      '3am',
      '6am',
      '9am',
      '12pm',
      '3pm',
      '6pm',
      '9pm'
    ],
    values: [
      200,
      675,
      410,
      390,
      310,
      460,
      250,
      240
    ]
  }),
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
.dot {
  height: 25px;
  width: 25px;
  background-color: #bbb;
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
