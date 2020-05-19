<template>
  <v-card light class="d-inline-block" justify="center" min-width="300" max-width="310" max-height="300" style="overflow-y: scroll;">
    <v-container class="pa-0">
      <v-list class="pa-0">
        <v-list-item class="pa-1" v-for="(chip, i) in chips" :key="`chip-group-item-${i}-${chip.id}`">
          <Chip
            :title="chip.title"
            :description="chip.description"
            :image="chip.image"
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
  }
}
</script>
