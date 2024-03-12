<template>
  <DialogContainer :show="show" :title="title" width="65vw" :goBack="close" enableMenu @close="close">
    <template v-slot:content>
      <v-row class="py-2 pl-6">
        <v-col cols="12">
          <p class="sub-headline pa-0"> {{ t('inviteLabel') }} </p>
          <v-row>
            <v-col cols="12" class="py-0">
              <v-textarea
                v-model="invitationUrl"
                placeholder="xxxx-xxxxx-xxxx-xxxx"
                outlined
                light
                dense
                :success-messages="successMsg"
                :error-messages="errorMsg"
                append-icon="mdi-lan-connect"
                clearable
              />
            </v-col>
            <p v-if="tryingConnection">Establishing secure connection and sending credential proof</p>
            <v-col class="py-0">
              <v-btn
                color="black"
                class="white--text"
                :loading="tryingConnection"
                @click="acceptInvite(invitationUrl)"
              >
                <span>{{ t('connect') }}</span>
              </v-btn>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </template>
    <template v-slot:actions>
      <v-col :align="mobile ? 'center' : 'end'">
        <v-btn
          color="#B12626"
          text
          @click="close"
        >
          {{ t('cancel') }}
        </v-btn>
      </v-col>
      </template>
  </DialogContainer>
</template>

<script>
import gql from 'graphql-tag'
import { mapActions } from 'vuex'

export default {
  name: 'InputInviteDialog',
  props: {
    show: { type: Boolean, required: true },
    credential: Object
  },
  data () {
    return {
      invitationUrl: null,
      successMsg: [],
      errorMsg: [],
      tryingConnection: false,
      title: 'Send Credential'
    }
  },
  computed: {
    mobile () {
      return this.$vuetify.breakpoint.xs
    }
  },
  methods: {
    ...mapActions('alerts', ['showAlert']),
    ...mapActions('loading', ['setLoading']),
    async acceptInvite (invitationUrl) {
      console.log('accepting invitation')
      this.tryingConnection = true
      this.errorMsg = []
      this.setLoading(true)
      try {
        const res = await this.$apollo.mutate({
          mutation: gql`
          mutation($invitationUrl: String!, $credentialId: String!) {
            sendCredentialProof(invitationUrl: $invitationUrl, credentialId: $credentialId)
          }`,
          variables: {
            invitationUrl: invitationUrl.trim(),
            credentialId: this.credential.id
          }
        })
        console.log(res)
        this.setLoading(false)
        this.tryingConnection = false
        this.showAlert({
          message: this.t('connectSuccess'),
          color: 'green'
        })
        this.close()
      } catch (err) {
        this.tryingConnection = false
        this.errorMsg = [this.t('connectError')]
        this.setLoading(false)
        this.showAlert({
          message: this.t('connectError :', err),
          color: 'red'
        })
        return
      }
      this.errorMsg = []
    },
    close () {
      this.$emit('close')
    },
    t (key, vars) {
      return this.$t('walletShow.' + key, vars)
    }
  }
}
</script>

<style scoped lang="scss">
</style>
