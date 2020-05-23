<template>
  <div :class="!mobile ? 'transparent':''" :style="!mobile ? 'position:relative; bottom:80px':'max-height:70px'">
    <v-card
      class="d-flex flex-row justify-end art-group pa-0"
      flat
      tile
    >
      <v-card
        v-for="(artefact, i) in artefacts"
        :key="i"
        class="pa-0 art-group"
        tile
        elevation="0"
        style="min-width:80px;"
        @click.prevent="updateModel(i)"
      >
        <v-img v-if="artefact.__typename === 'Photo'" :src="artefact.blob" height="80px" width="80px">
        </v-img>
        <v-icon class="pt-4 pl-4" dark large v-if="artefact.__typename === 'Video'" style="justify-self:center">mdi-movie</v-icon>
        <v-icon class="pt-4 pl-4" dark large v-if="artefact.__typename === 'Audio'" height="80px" width="80px">mdi-music</v-icon>
        <v-fade-transition>
          <v-overlay :absolute="true" opacity="0.6" :value="!match(i)"/>
        </v-fade-transition>
      </v-card>
    </v-card>
  </div>
</template>

<script>
export default {
  props: {
    artefacts: Array,
    model: Number
  },
  data () {
    return {
      show: 0
    }
  },
  computed: {
    mobile () {
      return this.$vuetify.breakpoint.xs || this.$vuetify.breakpoint.sm
    }
  },
  methods: {
    updateModel (i) {
      this.$emit('updateModel', i)
    },
    match (i) {
      if (this.model === i) {
        return true
      }
    }
  }
}

</script>
<style lang="scss" scoped>
.art-group {
   background-color: rgba(0,0,0,0.5);
}

.highlight {
  border-style: solid;
  border-width: 5px !important;
  border-color: white !important;

}
</style>
