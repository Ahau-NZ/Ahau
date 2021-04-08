<template>
  <v-card flat light class="d-inline-block" justify="center" :min-width="mobile ? '100%' : '300'" :max-height="mobile ? '' : '300'" :style="mobile ? '' : chips.length > 4 ? 'overflow-y: auto;' : ''">
    <v-container class="pa-0">
      <v-list class="pa-0">
        <v-list-item class="pa-1" v-for="(chip, i) in chips" :key="`chip-group-item-${i}-${chip.id}`">
          <Chip
            :title="chip.title || chip.name || 'Untitled'"
            :description="chip.description"
            :deletable="deletable"
            :index="i"
            :type="type"
            :chip="chip"
            :image="getImage(chip)"
            @click="$emit('click', chip)"
            @delete="$emit('delete', i)"
          />
        </v-list-item>
      </v-list>
    </v-container>
  </v-card>
</template>

<script>
import Chip from './Chip.vue'
import niho from '@/assets/niho.svg'

export default {
  name: 'ChipGroup',
  props: {
    chips: Array,
    deletable: Boolean,
    type: String
  },
  components: {
    Chip
  },
  computed: {
    mobile () {
      return this.$vuetify.breakpoint.xs
    }
  },
  methods: {
    getImage (item) {
      // for stories
      const { artefacts } = item
      if (artefacts && artefacts.length > 0) {
        // still in link format
        var artefact = artefacts[0].artefact
        if (artefact.type === 'photo') return artefact.blob.uri
      }

      // related records
      // collections
      if (item && item.image && item.image.uri) return item.image.uri

      // default
      return niho
    }
  }
}
</script>
