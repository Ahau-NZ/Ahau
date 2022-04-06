<template>
  <div class="container">
    <div v-if="isLoading" class="splash">
      <img src="@/assets/logo_red.svg" />
      <h1>Āhau</h1>
      <v-progress-circular
        v-if="mobile"
        color="white"
        :indeterminate="true"
        size="16"
        width="2"
      />
    </div>
    <div v-if="!isLoading && !isSetup" class="welcome-text" style="justify-items:center;display: grid;">
      <v-row>
        <p class="mb-0 headliner">Nau mai</p>
      </v-row>
      <v-row>
        <p class="mb-0 headliner">Whakatau mai</p>
      </v-row>
      <v-row class="pb-12">
        <p style="color:darkgrey" class="mb-0 headliner2">welcome</p>
      </v-row>
      <v-row class="mt-10">
        <v-btn
          text
          x-large
          color="#b12526"
          style="border-color:#b12526; background-color: #303030;"
          @click.prevent="toggleNew"
          outlined
        >
            <p class="login-text mb-0">Ko wai koe --</p><p style="color:lightgrey" class="login-text mb-0"> -- who are you?</p>

        </v-btn>
      </v-row>
    </div>

    <div
      v-if="!isLoading && isSetup"
      class="d-flex flex-column align-center button"
      @click="login()"
    >
      <Avatar
        :image="whoami.personal.profile.avatarImage"
        :gender="whoami.personal.profile.gender"
        :aliveInterval="whoami.personal.profile.aliveInterval"
        size="13vh"
      />
      <p class="name mt-2">{{ whoami.personal.profile.preferredName }}</p>
    </div>
    <NewNodeDialog v-if="dialog"
      :show="dialog"
      :title="`AHAU ---- I AM`"
      @close="toggleNew"
      @create="save($event)"
    />
    <NewPatakaDialog
      v-if="onboarding"
      :show="onboarding"
      :title="$t('pataka.newPataka')"
      @skip="skip()"
      @submit="connect($event)"
      @close="onboarding = false"
    />
  </div>

</template>

<script>
import { mapGetters, mapActions } from 'vuex'

import Avatar from '@/components/Avatar'
import NewNodeDialog from '@/components/dialog/profile/NewNodeDialog.vue'
import NewPatakaDialog from '@/components/dialog/connection/NewPatakaDialog.vue'

const karakia = `
---------------------------------
E te tangata
Whāia te māutauranga kai mārama
Kia whai take ngā mahi katoa
Tū māia, tū kaha
Aroha atu, aroha mai
Tātou i a tātou katoa

For this person
Seek knowledge for understanding
Have purpose in all that you do
Stand tall, be strong
Lets us all show respect
For each other
---------------------------------
`

export default {
  name: 'AhauLogin',
  props: {
    mobileServerLoaded: { type: Boolean, default: false }
  },
  data () {
    return {
      isLoading: true,
      isSetup: false, // has profile set up
      dialog: false,
      onboarded: true,
      onboarding: false,
      pataka: false
    }
  },
  computed: {
    ...mapGetters(['whoami']),
    mobile () {
      return this.$vuetify.breakpoint.xs
    }
  },
  watch: {
    mobileServerLoaded: {
      handler (nextValue) {
        if (nextValue && process.env.VUE_APP_PLATFORM === 'cordova') {
          this.getCurrentIdentity()
        }
      },
      immediate: true
    }
  },
  mounted () {
    if (process.env.VUE_APP_PLATFORM !== 'cordova') {
      this.getCurrentIdentity()
    }
  },
  methods: {
    ...mapActions(['setWhoami', 'setSyncing']),
    ...mapActions('person', ['updatePerson']),
    ...mapActions('alerts', ['showAlert']),
    async getCurrentIdentity () {
      await this.setWhoami()
      this.proceed()
    },

    karakiaTūwhera () {
      console.log(karakia)
    },

    proceed () {
      if (this.$apollo.loading || !this.whoami.personal.profile.id) {
        console.log('waiting for apollo')
        setTimeout(this.proceed, 300)
        return
      }
      this.isSetup = Boolean(this.whoami.personal.profile.legalName) || Boolean(this.whoami.personal.profile.preferredName)
      // Shortcut in dev, that saves us from doing one click when testing

      // if (this.isSetup && process.env.NODE_ENV === 'development') {
      //   this.login()
      // }

      this.isLoading = false
    },

    close () {
      this.onboarding = false
    },

    skip () {
      this.onbaording = false
      this.onboarded = true
      this.login()
    },

    login () {
      if (this.onboarded) {
        this.karakiaTūwhera()
        this.$router.push({
          name: 'person',
          params: {
            tribeId: this.whoami.personal.groupId,
            profileId: this.whoami.personal.profile.id
          }
        }).catch(() => {})
      } else {
        this.onboarding = true
      }
    },

    connect (text) {
      this.showAlert({
        message: text,
        color: 'green'
      })
      // update to check ssb.status
      this.setSyncing(true)
      this.skip()
    },

    toggleNew () {
      this.dialog = !this.dialog
    },

    async save (input) {
      await this.updatePerson({
        id: this.whoami.personal.profile.id,
        ...input
      })

      // set to false to open pataka dialog
      this.onboarded = false

      this.getCurrentIdentity()
    }
  },
  components: {
    Avatar,
    NewNodeDialog,
    NewPatakaDialog
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
h1 {
  text-transform: uppercase;
  letter-spacing: 0.5vw;
  text-align: center;
  padding-top: 15%;
}
.container {
  width: 100%;
  height: 90%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.splash {
  min-height: 20vh;
  width: 20vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.name {
  font-size: 1em;
  text-transform: uppercase;
  font-weight: 400;
  letter-spacing: 3px;
  color: white;
}
.body-width {
  max-width: 900px;
}
.button:hover {
  cursor: pointer;
}

.welcome-text {
  position: relative;
  top: -10%;
}

 .headliner {
    font-size: 1.5em;
    text-transform: uppercase;
    font-weight: 400;
    letter-spacing: 5px;
  }

 .headliner2 {
    padding-top: 50px;
    font-size: 1.5em;
    text-transform: uppercase;
    font-weight: 300;
    letter-spacing: 3px;
  }

  .login-text {
    font-weight: 500;
  }
</style>
