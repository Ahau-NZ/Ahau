<template>
  <div>
    <Dialog :show="show" :title="title" width="70vw" :goBack="close" enableMenu @close="close">
      <template v-slot:content>
        <v-row>
          <p class="pa-6 mb-0">Connect to a Pataka to backup your profile and connect with your tribes</p>
          <v-icon color="blue-grey" light @click="togglePatakaHelper" class="infoButton">mdi-information</v-icon>
        </v-row>

        <v-row justify="center" class="mx-4 mb-8">
          <v-expansion-panels focusable v-model="panel">
            <v-expansion-panel>
              <v-expansion-panel-header>
                <v-row align="center">
                  <v-icon class="px-4 black--text">mdi-server-network</v-icon>
                  <p class="mb-0 font-weight-bold">Connect with Pātaka Code</p> 
                </v-row>  
              </v-expansion-panel-header>
              <v-expansion-panel-content>
                <v-row class="py-2 pl-6">
                  <v-col cols="12">
                    <p class="sub-headline pa-0"> {{ $t('pataka.patakaCode') }} </p>
                    <v-row>
                      <v-col cols="12" md='10' class="py-0">
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
                      <v-col class="py-0">
                        <v-btn
                          color="black"
                          class="white--text"
                          @click="acceptInvite"
                        >
                          <span>{{ $t('pataka.connect') }}</span>
                        </v-btn>
                      </v-col>
                    </v-row>
                  </v-col>
                </v-row>
              </v-expansion-panel-content>
            </v-expansion-panel>
            <v-expansion-panel>
              <v-expansion-panel-header>
                <v-row align="center">
                  <img src="@/assets/logo_black.svg" class="logo" />
                  <p class="mb-0 font-weight-bold">Connect to Public Pātaka</p> 
                </v-row> 
              </v-expansion-panel-header>
              <v-expansion-panel-content>
                <p class="pt-4 font-weight-bold">Pataka Aotearoa is a public Pataka supported by the Āhau whānau</p>
                <div class="pa-4 pb-6" style="background-color:#ebebeb">
                  <p bold>By connecting to this Pataka:</p>
                  <p>I acknowledge that other people connected to this Pataka may be able to see the following information:</p>
                  <ul>
                    <li>My profile picture and preferred name</li>
                    <li>Any tribe profiles that i create including the following:
                      <ul>
                        <li>Profile picture</li>
                        <li>Cover photo</li>
                        <li>Profile kaitiaki preferred names and photos</li>
                        <li>And contact information if provided</li>
                      </ul>
                    </li>
                    <li>I acknowldge that all other information including any stories or whakapapa information will be completely encrypted and backed up to this Pataka for safe storage and access online.</li>
                    <li>I acknowledge that the Pataka only keeps a back up of the information that is already stored on my personal device.</li>
                    <li>I acknowledge that this is a free service provided by Ahau whānau and friends and do will not hold Ahau (ltd) responsible for any issues with the Pataka including loss of data</li>
                  </ul>
                </div>
                <v-checkbox
                  v-model="checkbox"
                  :label="t('agree')"
                  hide-details
                />
              </v-expansion-panel-content>
            </v-expansion-panel>
            <v-expansion-panel>
              <v-expansion-panel-header>Setup Your Own Pātaka</v-expansion-panel-header>
              <v-expansion-panel-content>               
              </v-expansion-panel-content>
            </v-expansion-panel>
            <v-expansion-panel>
              <v-expansion-panel-header>Buy Virtual Pātaka</v-expansion-panel-header>
              <v-expansion-panel-content>               
              </v-expansion-panel-content>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-row>

        

      </template>
      <template v-slot:actions>
        <v-row></v-row>
      </template>
    </Dialog>
    <PatakaHelper v-if="showPatakaHelper" :show="showPatakaHelper" @close="togglePatakaHelper" />
  </div>
</template>

<script>

import Dialog from '@/components/dialog/Dialog.vue'
import PatakaHelper from '@/components/dialog/connection/PatakaHelper.vue'

import gql from 'graphql-tag'

export default {
  name: 'NewPatakaDialog',
  components: {
    Dialog,
    PatakaHelper
  },
  props: {
    show: { type: Boolean, required: true },
    title: String
  },
  data () {
    return {
      panel: 0,
      patakaCode: null,
      invalidCode: false,
      validCode: false,
      successMsg: [],
      errorMsg: [], 
      showPatakaHelper: false,
      publicPataka: false
    }
  },
  computed: {
    mobile () {
      return this.$vuetify.breakpoint.xs
    }
  },
  methods: {
    togglePatakaHelper () {
      console.log('show instructions')
      this.showPatakaHelper = !this.showPatakaHelper
    },
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
        this.successMsg = [this.$t('pataka.connectSuccess')]
        this.$emit('submit', this.$t('pataka.connectSuccess'))
        this.close()
      } catch (err) {
        this.errorMsg = [this.$t('pataka.invalidCode')]
        console.error('Invite error: ', err)
        return
      }
      this.errorMsg = []
    },
    close () {
      this.$emit('close')
    },
    t (key, vars) {
      return this.$t('patakaInstruction.' + key, vars)
    }
  }
}
</script>

<style scoped lang="scss">
.logo {
  width:25px;
  margin-left: 16px;
  margin-right: 16px;
}
</style>
