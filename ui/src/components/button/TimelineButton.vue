<template>
  <v-tooltip bottom>
    <template v-slot:activator="{ on }">
        <v-btn v-on="on" @click="toggle" fab small color="black" outlined>
          <TimelineIcon
            v-if="!timeline"
            size="medium"
            color="black"
          />
          <ArchiveIcon
            v-else
            size="medium"
            color="black"
            class="pb-1"
          />
        </v-btn>
    </template>
    <span>{{ text }}</span>
  </v-tooltip>
</template>

<script>
import TimelineIcon from '@/components/button/TimelineIcon.vue'
import ArchiveIcon from '@/components/button/ArchiveIcon.vue'

export default {
  name: 'TimelineButton',
  components: {
    TimelineIcon,
    ArchiveIcon
  },
  props: {
    timeline: Boolean
  },
  computed: {
    text () {
      return !this.timeline ? 'Timeline view' : 'Story view'
    }
  },
  methods: {
    toggle () {
      this.$emit('toggle')
    }
  }
}
</script>
<style scoped>
.timeline-btn {
  position: relative;
  right: 180px;
}
</style>
