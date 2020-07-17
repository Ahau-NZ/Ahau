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
    <v-btn
      v-if="!isLoading && !isSetup"
      text
      x-large
      color="#b12526"
      @click.prevent="toggleNew"
    >
      <!-- TODO change this for an EditProfile dialog -->
      <v-icon left>mdi-plus</v-icon>
      <p class="mb-0">Ko wai koe --</p><p style="color:lightgrey" class="mb-0"> -- who are you?</p>
      <!-- <p style="color:white;" class="mb-0"  >  Who are you?</p> -->

    </v-btn>
    <router-link
      v-if="!isLoading && isSetup"
      :to="{ name: 'whakapapaIndex' }"
      class="d-flex flex-column align-center"
      @click.native="karakiaTūwhera()"
    >
      <Avatar
        :image="whoami.personal.profile.avatarImage"
        :gender="whoami.personal.profile.gender"
        :aliveInterval="whoami.personal.profile.aliveInterval"
        size="13vh"
      />
      <h3 class="name mt-2">{{ whoami.personal.profile.preferredName }}</h3>
    </router-link>

     <NewNodeDialog
      v-if="dialog"
      :show="dialog"
      :title="`AHAU ---- I AM`"
      @close="toggleNew" @create="save($event)"
    />

  </div>

</template>

<script>
import Avatar from '@/components/Avatar'
import NewNodeDialog from '@/components/dialog/profile/NewNodeDialog.vue'
import { mapGetters, mapActions } from 'vuex'
import { savePublicProfile } from '@/lib/profile-helpers.js'

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
  props: {
    mobileServerLoaded: { type: Boolean, default: false }
  },
  data () {
    return {
      isLoading: true,
      isSetup: false, // has profile set up
      dialog: false
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
    ...mapActions(['setWhoami', 'setComponent', 'setProfileById']),
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

      this.isSetup = Boolean(this.whoami.personal.profile.preferredName)
      // Shortcut in dev, that saves us from doing one click when testing
      if (this.isSetup && process.env.NODE_ENV === 'development') {
        this.karakiaTūwhera()
        this.setComponent('profile')
        this.setProfileById({ id: this.whoami.personal.profile.id })
        this.$router.push({ name: 'profileShow', params: { id: this.whoami.personal.profile.id } })
      }

      this.isLoading = false
    },

    toggleNew () {
      this.dialog = !this.dialog
    },

    async save (profileChanges) {
      const res = await this.$apollo.mutate(
        savePublicProfile(
          this.whoami.personal.profile.id,
          this.whoami.public.profile.id,
          profileChanges
        )
      )

      if (res.errors) {
        console.error('failed to update profile', res)
        return
      }

      this.getCurrentIdentity()
    }
  },
  components: {
    Avatar,
    NewNodeDialog
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
  color: white;
}
.body-width {
  max-width: 900px;
}
</style>
