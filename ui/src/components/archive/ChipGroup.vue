<template>
  <v-card flat light class="d-inline-block" justify="center" :min-width="mobile ? '100%' : '300'" :max-height="mobile ? '' : '300'" :style="mobile ? '' : 'overflow-y: auto;'">
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
  }
}
</script>
