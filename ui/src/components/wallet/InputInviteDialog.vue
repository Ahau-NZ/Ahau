<template>
  <DialogContainer :show="show" :title="title" width="65vw" :goBack="close" enableMenu @close="close">
    <template v-slot:content>
      <v-row :class="mobile ? 'py-2 ' : 'py-2 pl-6'">
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
              />
            </v-col>
            <p class="mx-2 ml-4" v-if="tryingConnection">{{ t('tryingConnection') }}</p>
            <v-col class="py-0">
              <v-btn
                v-if="!successMsg.length"
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
      title: this.t('sendProofTitle')
    }
  },
  computed: {
    mobile () {
      return this.$vuetify.breakpoint.xs
    }
  },
  methods: {
    ...mapActions('alerts', ['showAlert']),
    async acceptInvite (invitationUrl) {
      console.log('accepting invitation')
      this.tryingConnection = true
      this.errorMsg = []
      try {
        await this.$apollo.mutate({
          mutation: gql`
          mutation($invitationUrl: String!, $credentialId: String!) {
            sendCredentialProof(invitationUrl: $invitationUrl, credentialId: $credentialId)
          }`,
          variables: {
            invitationUrl: invitationUrl.trim(),
            credentialId: this.credential.id
          }
        })
        this.tryingConnection = false
        this.successMsg = [this.t('connectSuccess')]
        this.showAlert({
          message: this.t('connectSuccess'),
          color: 'green'
        })
      } catch (err) {
        this.tryingConnection = false
        this.errorMsg = [this.t('connectError')]
        console.error('something went wrong trying to send credential proof', err)
        this.showAlert({
          message: this.t('connectError'),
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
