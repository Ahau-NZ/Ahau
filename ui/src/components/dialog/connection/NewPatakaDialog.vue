<template>
  <div>
    <Dialog :show="show" :title="title" width="65vw" :goBack="close" enableMenu @close="$emit('close')">
      <template v-slot:content>
        <v-row>
          <v-col cols="10">
            <p class="mb-0 ml-2">{{ t('intro') }}</p>
          </v-col>
          <v-col align-self="end">
            <v-icon color="blue-grey" light @click="togglePatakaHelper" class="infoButton">mdi-information</v-icon>
          </v-col>
        </v-row>

        <v-row justify="center" class="mx-4 mb-8">
          <v-expansion-panels focusable v-model="panel">
            <v-expansion-panel>
              <v-expansion-panel-header>
                <v-row align="center">
                  <v-icon class="px-4 black--text">mdi-share-variant</v-icon>
                  <p class="mb-0 font-weight-bold">{{ t('code') }}</p>
                </v-row>
              </v-expansion-panel-header>
              <v-expansion-panel-content>
                <v-row class="py-2 pl-6">
                  <v-col cols="12">
                    <p class="sub-headline pa-0"> {{ t('patakaCode') }} </p>
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
                          @click="acceptInvite(patakaCode)"
                        >
                          <span>{{ t('connect') }}</span>
                        </v-btn>
                      </v-col>
                    </v-row>
                  </v-col>
                </v-row>
              </v-expansion-panel-content>
            </v-expansion-panel>

            <v-expansion-panel v-if="!connected">
              <v-expansion-panel-header>
                <v-row align="center">
                  <img src="@/assets/logo_black.svg" class="logo" />
                  <p class="mb-0 font-weight-bold">{{ t('ahauPataka') }}</p>
                </v-row>
              </v-expansion-panel-header>
              <v-expansion-panel-content>
                <p class="pt-4 font-weight-bold">{{ t('publicPataka') }}</p>
                <div class="pa-4 pb-6" style="background-color:#ebebeb;">
                  <p bold>{{ t('agreementTitle') }}</p>
                  <p>{{ t('sharing') }}</p>
                  <ul>
                    <li>{{ t('encryption') }}</li>
                    <li>{{ t('backup') }}</li>
                    <li>{{ t('waver') }}</li>
                  </ul>
                </div>
                <v-row>
                  <v-checkbox
                    class="px-4"
                    v-model="checkbox"
                    :label="t('agree')"
                    hide-details
                  />
                  <v-progress-circular
                    v-if="tryingConnection"
                    class="mt-4"
                    indeterminate>
                  </v-progress-circular>
                  <v-btn
                    v-else-if="checkbox"
                    color="black"
                    class="white--text ml-4 mt-4"
                    @click="acceptInvite(patakaAotearoa, true)"
                  >
                    <span>{{ $t('connect') }}</span>
                  </v-btn>
                  <span v-if="connectionErrMsg" :class="mobile ? 'pt-4 text-center':'pl-8 pt-6 text-center'">{{connectionErrMsg}}</span>
                </v-row>
              </v-expansion-panel-content>
            </v-expansion-panel>

            <v-expansion-panel>
              <v-expansion-panel-header>
                <v-row align="center">
                  <v-icon class="px-4 black--text">mdi-laptop-windows</v-icon>
                  <p class="mb-0 font-weight-bold">{{ t('selfHost') }}</p>
                </v-row>
              </v-expansion-panel-header>
              <v-expansion-panel-content>
                <p class="pt-4">{{ t('selfIntro') }}</p>
                <p>{{ t('selfPatakaDescription') }}</p>
                <p>{{ t('selfPatakaSetup') }}</p>
                <p>{{ t('selfPatakaGuide') }}</p>
                <a class="blue--text font-weight-bold" href="https://docs.ahau.io/#/pataka-guide" target="_blank">{{ t('setupGuide') }}</a>
              </v-expansion-panel-content>
            </v-expansion-panel>

            <v-expansion-panel>
              <v-expansion-panel-header>
                <v-row align="center">
                  <v-icon class="px-4 black--text">mdi-cloud-sync</v-icon>
                  <p class="mb-0 font-weight-bold">{{ t('cloudPataka') }}</p>
                </v-row>
              </v-expansion-panel-header>
              <v-expansion-panel-content>
                <p class="pt-4">{{ t('cloudIntro') }}</p>
                <p>{{ t('cloudDescription') }}</p>
                <p>{{ t('cloudPros') }}</p>
                <p>{{ t('cloudCosts') }} {{ t('cloudCons') }}</p>
                <p>{{ t('cloudSetup') }}</p>
                <p>{{ t('contact') }} <a class="blue--text" href="https://chat.ahau.io" target="_blank">https://chat.ahau.io</a></p>
              </v-expansion-panel-content>
            </v-expansion-panel>
          </v-expansion-panels>
          <p class="pt-4">{{ t('help') }} <a class="blue--text" href="https://chat.ahau.io" target="_blank">https://chat.ahau.io</a></p>
        </v-row>
      </template>

      <template v-slot:actions>

          <v-col :align="mobile ? 'center' : 'end'">
            <v-btn
              color="#B12626"
              text
              @click="closeBtn"
            >
              {{ t('skip') }}
            </v-btn>
          </v-col>
      </template>
    </Dialog>
    <PatakaHelper v-if="showPatakaHelper" :show="showPatakaHelper" @close="togglePatakaHelper" />
  </div>
</template>

<script>
import gql from 'graphql-tag'
import Dialog from '@/components/dialog/Dialog.vue'
import PatakaHelper from '@/components/dialog/connection/PatakaHelper.vue'
import patakaConfig from '../../../../pataka.config'

export default {
  name: 'NewPatakaDialog',
  components: {
    Dialog,
    PatakaHelper
  },
  props: {
    show: { type: Boolean, required: true },
    title: String,
    connected: Boolean
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
      publicPataka: false,
      checkbox: false,
      tryingConnection: false,
      connectionErrMsg: null,
      patakaAotearoa: patakaConfig.code
    }
  },
  computed: {
    mobile () {
      return this.$vuetify.breakpoint.xs
    }
  },
  methods: {
    togglePatakaHelper () {
      this.showPatakaHelper = !this.showPatakaHelper
    },
    async acceptInvite (invite, dev) {
      this.tryingConnection = true
      this.errorMsg = []
      this.connectionErrMsg = null
      try {
        await this.$apollo.mutate({
          mutation: gql`
          mutation($inviteCode: String!) {
            acceptInvite(inviteCode: $inviteCode)
          }`,
          variables: {
            inviteCode: invite.trim()
          }
        })
        this.tryingConnection = false
        this.successMsg = [this.$t('pataka.connectSuccess')]
        this.$emit('submit', this.$t('pataka.connectSuccess'))
        this.close()
      } catch (err) {
        this.tryingConnection = false
        if (dev) this.connectionErrMsg = this.$t('pataka.failConnection')
        else this.errorMsg = [this.$t('pataka.invalidCode')]
        console.error('Invite error: ', err)
        return
      }
      this.errorMsg = []
    },
    closeBtn () {
      this.$route.name === 'login' ? this.$emit('skip') : this.$emit('close')
    },
    close () {
      this.$emit('close')
    },
    t (key, vars) {
      return this.$t('pataka.' + key, vars)
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
