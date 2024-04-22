<template>
  <div>
    <v-btn v-if="mobile" text active-class="no-active"  @click="toggleDialog" class="white--text text-uppercase ml-3">
      <p class="font-weight-light" style="font-size: 0.8em;">? {{ t('mobile-btn') }}</p>
    </v-btn>
    <v-tooltip v-else bottom>
      <template v-slot:activator="{ on }">
          <v-btn small v-on="on" text  :color="color ? color : `#b12526`" @click="toggleDialog">
            <v-icon small light>mdi-help</v-icon>
          </v-btn>
      </template>
      <span>{{ t('help') }}</span>
    </v-tooltip>
    <HelpDialog
      v-if="showDialog"
      :show="showDialog"
      :title="t('title')"
      @close="toggleDialog"
    />
  </div>
</template>
<script>
import HelpDialog from '@/components/dialog/HelpDialog.vue'

export default {
  components: {
    HelpDialog
  },
  props: {
    color: null
  },
  data () {
    return {
      showDialog: false
    }
  },
  computed: {
    mobile () {
      return this.$vuetify.breakpoint.xs || this.$vuetify.breakpoint.sm
    }
  },
  methods: {
    toggleDialog () {
      this.showDialog = !this.showDialog
    },
    t (key, vars) {
      return this.$t('help.' + key, vars)
    }
  }
}
</script>
