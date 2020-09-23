<template>
  <Dialog :show="show" :title="title" width="75vw" :goBack="close" enableMenu @close="close">
    <template v-slot:content>
      <v-row class="py-2 pl-10">
        <v-col cols="12">
          <p class="sub-headline pa-0">Enter a Pātaka code to discover tribes</p>
          <v-row>
            <v-col cols="10" md='9' class="py-0">
              <v-text-field
                v-model="patakaCode"
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
            <v-col class="py-0 pl-0">
              <v-btn
                color="black"
                :class="mobile ? 'px-0':'white--text'"
                @click="acceptInvite"
                :text="mobile"
                :x-small="mobile"
              >
                <v-icon v-if="mobile">mdi-arrow-right</v-icon>
                <span v-else>connect</span>
              </v-btn>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </template>
    <template v-slot:actions>
      <v-row></v-row>
    </template>
  </Dialog>
</template>

<script>

import Dialog from '@/components/dialog/Dialog.vue'
import gql from 'graphql-tag'

export default {
  name: 'NewPatakaDialog',
  components: {
    Dialog,
  },
  props: {
    show: { type: Boolean, required: true },
    title: String,
  },
  data () {
    return {
      patakaCode: null,
      invalidCode: false,
      validCode: false,
      successMsg: [],
      errorMsg: [],
    }
  },
  computed: {
    mobile () {
      return this.$vuetify.breakpoint.xs
    }
  },
  methods: {
    async acceptInvite () {
      try {
        await this.$apollo.mutate({
          mutation: gql`
          mutation($inviteCode: String!) {
            acceptInvite(inviteCode: $inviteCode)
          }`,
          variables: {
            inviteCode: this.patakaCode.trim()
          }
        })
        // this.invalidCode = false
        // this.validCode = true
        this.successMsg = ['Successfully connected to Pātaka']
        this.$emit('submit', 'Pātaka successfully connected')
        this.close()
      } catch (err) {
        // this.invalidCode = true
        // this.validCode = false
        this.errorMsg = ['Invalid code, please check the code and try again']
        console.error('Invite error: ', err)
        return
      }
      this.errorMsg = []
    },
    close () {
      this.$emit('close')
    },
    // submit () {
    //   this.$emit('submit', output)
    // }
  }
}
</script>

<style scoped lang="scss">

</style>
