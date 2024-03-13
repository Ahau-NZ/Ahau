<template>
  <div>
    <v-row style="margin-top: 100px">
      <v-col cols="10" class="sub-headliner black--text pa-0 pl-6 pb-2">
        {{ t('identityCredentials') }}
      </v-col>
    </v-row>
    <v-row v-if="credentials && credentials.length > 0" class="ma-2">
      <!-- TODO hacky styling fix! -->
      <v-col v-for="credential in credentials" :key="credential.id"
        cols="12" md="6" class="pr-4"
        style="max-width: 440px;"
      >
        <CredentialPreview
          :credential="credential"
          :avatarImage="whoami.public.profile.avatarImage"
        />
      </v-col>
    </v-row>

    <!-- empty -->
    <v-row v-else>
      <v-col
        cols="12"
        xs="12"
        sm="12"
        md="9"
        class="pa-0"
      >
        <v-col
          class="px-8 subtitle-1 grey--text "
          :class="{ 'text-center': mobile }"
        >
          {{ t('credentialNotFound') }}
        </v-col>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import CredentialPreview from './CredentialPreview.vue'
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'WalletShow',
  components: { CredentialPreview },
  data () {
    return {
      model: null
    }
  },
  mounted () {
    this.getAllCredentials()
  },
  computed: {
    ...mapGetters(['whoami']),
    ...mapGetters('credentials', ['credentials']),
    mobile () {
      return this.$vuetify.breakpoint.xs || this.$vuetify.breakpoint.sm
    }
  },
  methods: {
    ...mapActions('credentials', ['getAllCredentials']),
    t (key, vars) {
      return this.$t('walletShow.' + key, vars)
    }
  }
}
</script>

<style lang="scss">

</style>
