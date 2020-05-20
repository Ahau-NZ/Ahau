<template>
  <v-card flat light class="d-inline-block" justify="center" :min-width="mobile ? '100%' : '300'" :max-width="mobile ? '100%' : '310'" :max-height="mobile ? '' : '300'" :style="mobile ? '' : 'overflow-y: auto;'">
    <v-container class="pa-0">
      <v-list class="pa-0">
        <v-list-item class="pa-1" v-for="(chip, i) in chips" :key="`chip-group-item-${i}-${chip.id}`">
          <Chip
            :title="chip.title"
            :description="chip.description"
            :image="chip.image"
            @delete="$emit('delete', i)"
          />
        </v-list-item>
      </v-list>
    </v-container>
  </v-card>
</template>

<script>
import Chip from './Chip.vue'

export default {
  name: 'ChipGroup',
  props: {
    chips: Array
  },
  components: {
    Chip
  },
  computed: {
    mobile () {
      return this.$vuetify.breakpoint.xs
    }
  }
}
</script>
