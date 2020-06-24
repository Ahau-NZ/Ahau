<template>
  <div class="wrapper">
    <v-container class="px-12" fluid>
      <v-row>
        <v-col cols="4">
          <v-btn>Generate join code</v-btn>
        </v-col>
        <v-col cols="4">
          <v-row>Single use code</v-row>
          <v-row justify="center">
            <v-col>askdhasjdkahskd</v-col>
            <v-col>
              <v-btn>COPY</v-btn>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
      <v-row justify="center">
        <v-col cols="3">
          <Avatar size="40px" alt="name" />
          <h2>Name of Pataka</h2>
          <h3>Pataka SSB ID</h3>
          <v-row class="py-4">
            <div class="dot orange mr-4" />
            <h4>Offline</h4>
          </v-row>
          <v-row>
            <div class="dot green mr-4" />
            <h4>Local</h4>
          </v-row>
          <template>
            <v-card class="mt-4" max-width="400">
              <v-sheet class="v-sheet--offset mx-auto" elevation="12">
                <v-card-text class="pt-0">
                  <div class="title font-weight-light mb-2">CPU</div>
                </v-card-text>
                <v-sparkline
                  :labels="labels"
                  :value="value"
                  color="cyan"
                  line-width="2"
                  padding="16"
                ></v-sparkline>
              </v-sheet>
            </v-card>
          </template>
          <template>
            <v-card class="mt-4" max-width="400">
              <v-sheet class="v-sheet--offset mx-auto" elevation="12">
                <v-card-text class="pt-0">
                  <div class="title font-weight-light mb-2">RAM</div>
                </v-card-text>
                <v-sparkline
                  :labels="labels"
                  :value="value"
                  color="cyan"
                  line-width="2"
                  padding="16"
                ></v-sparkline>
              </v-sheet>
            </v-card>
          </template>
          <v-col class="mt-8">
            <h3>Disk Usage</h3>
            <v-progress-linear class="mt-4" v-model="storage" height="25" color="blue-grey">
              <strong>{{ Math.ceil(storage) }}%</strong>
            </v-progress-linear>
          </v-col>
        </v-col>
        <v-col cols="3">
          <h2>People</h2>
          <h3>64 people online</h3>
          <v-row>
            <Avatar size="40px" alt="name" />
          </v-row>
          <v-btn>View people</v-btn>
        </v-col>
        <v-col cols="3">
          <h2>Summary</h2>
          <h3>213 Records</h3>
          <h3>28 Whakapapa Records</h3>
          <h3>7 communities</h3>
        </v-col>
        <v-col cols="3">
          <h2>Activity log</h2>
          <p>
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
    value: [
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
    Avatar
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
</style>
