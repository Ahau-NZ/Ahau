<template>
<div>

  <v-expansion-panels light v-model="panel" :class="isReg ? 'ma-2': ''" :flat="isReg">
    <v-expansion-panel :readonly="!mobile" align-start class="align-start"
      :style="
        `background: linear-gradient(to right, rgba(255, 255, 255, 0.99), 60%, rgba(255, 255, 255, 0.8)), url(`+ image + `);
        background-position: center`
      "
      >
      <v-expansion-panel-header class="pa-0" hide-actions >
        <v-col :cols="isReg ? 3 : 5">
          <v-img
            :src="image"
            class="grey darken-4 align-end"
          />
        </v-col>
        <v-col>
          <v-row class="overline font-weight-light">
              {{ t('tribalMember') }}
          </v-row>
          <v-row class="title text-uppercase">
            {{ tribe.preferredName }}
          </v-row>
          <v-row v-if="isReg" class="pt-4 overline success--text font-weight-bold">
            <v-icon color="success">mdi-checkbox-marked-circle</v-icon>
            <span class="pa-1">{{ t('state') }}</span>
          </v-row>
          <v-row justify="end" class="mr-4 mt-6">
            <v-btn text circle @click="toggleInviteDialog">
              <v-icon color="black"> mdi-share </v-icon>
            </v-btn>
        </v-row>
        </v-col>
      </v-expansion-panel-header>
      <v-expansion-panel-content class="pa-o">
        <v-divider light class="mx-4"/>
        <v-col class="caption pb-0">{{ t('credentialDescription', {name: tribe.preferredName}) }}</v-col>
        <v-col cols="10" class="overline font-weight-light pb-2">
          {{ t('info') }}
        </v-col>
        <v-col cols="12" class="caption font-weight-light py-0">
          {{ t('name') }}:
        </v-col>
        <v-col cols="12" class="pt-0 font-weight-medium pb-1">
          <div >{{ person.fullName }}</div>
        </v-col>
        <v-col cols="12" class="caption font-weight-light py-0">
          {{ t('dob' )}}:
        </v-col>
        <v-col cols="12" class="pt-0 font-weight-medium pb-1">
          <div >{{ person.dateOfBirth }}</div>
        </v-col>
        <v-row>
          <v-col cols="8">
            <v-col cols="12" class="caption font-weight-light py-0">
              {{ t('issued' )}}:
            </v-col>
            <v-col cols="12" class="pt-0 font-weight-medium pb-1 body-2">
              {{ issuedDate }}
            </v-col>
          </v-col>
          <v-col>
            <v-col cols="12" class="caption font-weight-light py-0">
              {{ t('status' )}}:
            </v-col>
            <v-col cols="12" class="pt-0 font-weight-medium pb-1 body-2">
              {{ status }}
            </v-col>
          </v-col>
        </v-row>
      </v-expansion-panel-content>
    </v-expansion-panel>
  </v-expansion-panels>
  <InputInviteDialog
    v-if="showInviteDialog"
    :credential="credential"
    @close="showInviteDialog = false"
    :show="showInviteDialog"
  />
</div>

</template>

<script>
import { mapGetters } from 'vuex'
import InputInviteDialog from './InputInviteDialog.vue'

export default {
  name: 'CredentialPreview',
  components: {
    InputInviteDialog
  },
  props: {
    credential: Object,
    isReg: Boolean
  },
  data () {
    return {
      showInviteDialog: false
    }
  },
  computed: {
    ...mapGetters('tribe', ['tribes']),
    panel () {
      return this.mobile ? null : 0
    },
    mobile () {
      return this.$vuetify.breakpoint.xs || this.$vuetify.breakpoint.sm || this.isReg
    },
    tribe () {
      const id = this.credential?.credentialSubject.memberOf.tribeId
      const tribe = this.tribes.find(tribe => id === tribe.id)
      return tribe.public[0]
    },
    image () {
      return this.tribe.avatarImage.uri
    },
    issuedDate () {
      return new Date(this.credential.issuanceDate).toDateString()
    },
    status () {
      return this.credential.credentialStatus ?? 'Active'
    },
    person () {
      return this.credential?.credentialSubject.person
    }
  },
  methods: {
    t (key, vars) {
      return this.$t('walletShow.' + key, vars)
    },
    toggleInviteDialog () {
      this.showInviteDialog = !this.showInviteDialog
    }
  }
}
</script>

<style lang="scss">
.overline {
  line-height: 1.2rem !important;
}
.v-expansion-panel-header {
  align-items: start !important;
}
.v-expansion-panel-content__wrap {
  padding: 0px !important
}
</style>
