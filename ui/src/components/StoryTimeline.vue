<template>
  <div>
    <v-timeline align-top dense light>
      <v-timeline-item v-for="(item, index) in data" :key="index" fillDot :icon="item.storyTypeIcon"
        :color="getDotColour(item.storyTypeIcon)" :icon-color="getIconColour(item.storyTypeIcon)" :left="left"
        :right="right" :small="small">
        <template v-slot:icon>
          <!-- <v-avatar v-if="item.img">
            <img :src="item.img">
          </v-avatar> -->
        </template>
        <span slot="opposite">This is opposite slot</span>
        <v-card class="elevation-2">

          <!-- Timeline event title -->
          <v-row>
            <v-card-title class="headline">{{item.title}}</v-card-title>
          </v-row>

          <!-- Timeline event description -->
          <v-card-text class="pt-0 pb-8">
            {{item.description}}
          </v-card-text>

          <!-- Dropdown expansion -->
          <v-card-actions class="pt-0">
            <!-- <v-btn text>Share</v-btn>
            <v-btn color="#b02425" text>Explore</v-btn> -->
            <v-spacer></v-spacer>
            <v-btn icon @click="show = !show">
              <v-icon>{{ show ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
            </v-btn>
          </v-card-actions>
          <v-expand-transition>
            <div v-show="show">
              <v-divider light></v-divider>
              <v-card-text>
                <v-row>
                  <v-col col="4">
                    <h4>Mention</h4>
                    <!-- TODO: v-for People -->
                    <v-row>
                      <img class="people-circle" v-bind:src="require('@/assets/koro.svg')" />
                      <img class="people-circle" v-bind:src="require('@/assets/kuia.svg')" />
                    </v-row>
                  </v-col>
                  <v-col col="4">
                    <h4>Access</h4>
                    <!-- TODO: v-for People -->
                    <v-row>
                      <img class="people-circle" v-bind:src="require('@/assets/tama.svg')" />
                      <img class="people-circle" v-bind:src="require('@/assets/tane.svg')" />
                      <img class="people-circle" v-bind:src="require('@/assets/wahine.svg')" />
                    </v-row>
                  </v-col>
                  <v-col col="4">
                    <h4>Location</h4>
                  </v-col>
                </v-row>
              </v-card-text>
            </div>
          </v-expand-transition>

          <!-- Contributors -->
          <div class="relativeCorner">
            <Contributors :width="'30px'" hideDate />
          </div>

        </v-card>
      </v-timeline-item>
    </v-timeline>
  </div>
</template>

<script>
  import Contributors from '@/components/Contributors.vue'
  export default {
    props: ['data'],
    components: {
      Contributors,
    },
    data: () => ({
      show: false,
    }),
    methods: {
      getDotColour(iconType) {
        return "#FF9800"
      },
      getIconColour(iconType) {
        return "#ffffff"
      }
    }
  }
</script>

<style scoped>
  .relativeCorner {
    position: absolute;
    top: 0;
    right: 0;
  }

  .people-circle {
    width: 50px;
    margin: 5px;
    border-radius: 50%;
    background-color: lightgrey;
    background-position-y: 10px;
  }
</style>