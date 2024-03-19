<template>
<v-card style="max-width: 440px;">
  <v-expansion-panels light :value="panel" :flat="isReg">
    <v-expansion-panel :readonly="!mobile" align-start class="align-start"
      :style="
        `background: linear-gradient(to right, rgba(255, 255, 255, 0.99), 60%, rgba(255, 255, 255, 0.8)), url(`+ tribeImage + `);
        background-position: center`
      "
      >
      <v-expansion-panel-header class="px-4 py-1" hide-actions >
        <v-row>
          <v-col cols=4 class="pl-2 pt-2">
            <v-row no-gutters>
              <v-col cols=12 class="">
                <v-img
                  :src="tribeImage"
                  class="grey darken-4"
                  width="100px"
                />
              </v-col>
              <v-col v-if="avatarImage" cols=12 class="pt-4">
                <v-img
                  :src="avatarImage?.uri"
                  width="100px"
                />
              </v-col>
            </v-row>
          </v-col>

          <v-col cols="8" class="pt-1" >
            <v-row class="title text-uppercase">
              {{ tribe.preferredName }}
            </v-row>
            <v-row class="overline font-weight-light">
              {{ t('tribalMember') }}
            </v-row>

            <v-row v-if="isReg" class="pt-4 overline success--text font-weight-bold">
              <v-icon color="success">mdi-checkbox-marked-circle</v-icon>
              <span class="pa-1">{{ t('state') }}</span>
            </v-row>

            <v-row cols="12" class="caption font-weight-light pt-4 pb-0">
              {{ t('name') }}
            </v-row>
            <v-row cols="12" class="text-content pt-0 pb-1">
              <div >{{ person.fullName }}</div>
            </v-row>

            <v-row cols="12" class="caption font-weight-light pb-0">
              {{ t('dob' )}}
            </v-row>
            <v-row cols="12" class="text-content pt-0 pb-1">
              <div >{{ person.dateOfBirth }}</div>
            </v-row>

            <v-row cols="12" class="caption font-weight-light pt-8">
              {{ t('issued' )}}
            </v-row>
            <v-row cols="12" class="pt-0 pb-1 body-2">
              {{ issuedDate }}
            </v-row>
          </v-col>
        </v-row>

      </v-expansion-panel-header>

      <v-expansion-panel-content class="pa-0">
        <v-divider light class="mx-4"/>
        <v-col class="caption pb-0">
          {{ t('credentialDescription', {name: tribe.preferredName}) }}
        </v-col>

        <v-row>
          <v-col>
            <v-col cols="12" class="caption font-weight-light py-0">
              {{ t('status' )}}:
            </v-col>
            <v-col cols="12" class="text-content pt-0 pb-1 body-2">
              {{ status }}
            </v-col>
          </v-col>
        </v-row>

        <v-row v-if="!isReg" justify="end" class="mr-2 mb-4">
          <v-btn text circle @click="toggleInviteDialog">
            <v-icon color="black"> mdi-send </v-icon>
          </v-btn>
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
</v-card>
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
    avatarImage: Object,
    isReg: {
      type: Boolean,
      defualt: false
    }
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
    tribeImage () {
      return this.tribe?.avatarImage?.uri
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
.text-content {
  font-weight: 500;
  font-size: 1.2rem;
}
.overline {
  line-height: 1.2rem !important;
}
.v-expansion-panel-header {
  align-items: start !important;
}
.v-expansion-panel-content__wrap {
  padding: 0px !important
}

.v-item-group.v-expansion-panels--flat {
  // margin: 0 !important;
}
</style>
