<template>
<div>
  <Profile type="person" :profile="selectedProfile" @dialogTrigger="updateDialog($event)"/>
  <DialogHandler
      :dialog.sync="dialog.active"
      :selectedProfile="selectedProfile"
      @setupProfile="setupProfile($event)"
    />
</div>
</template>

<script>
import Profile from '@/components/Profile'
import DialogHandler from '@/components/dialog/DialogHandler.vue'

import { getProfile } from '@/lib/profile-helpers'
import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'ProfileShow',
  data () {
    return {
      dialog: {
        active: null,
        type: null
      }
    }
  },
  mounted () {
    this.setupProfile(this.$route.params.id)
  },
  computed: {
    ...mapGetters(['selectedProfile', 'whoami'])
  },

  methods: {
    ...mapActions(['setProfile', 'setWhoami']),

    async setupProfile (id) {
      const result = await this.$apollo.query(getProfile(id))
      if (result.errors) {
        console.error('Failed to get profile in ProfileShow')
        console.error(result.errors)
        return
      } else {
        if (result.data.person) this.setProfile(result.data.person)
      }
      if (this.dialog.active) this.dialog.active = null
      if (id === this.whoami.profile.id) await this.setWhoami()
    },

    updateDialog (dialogObj) {
      this.dialog.type = dialogObj.type
      this.dialog.active = dialogObj.dialog
    }
  },
  components: {
    Profile,
    DialogHandler
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.body-width {
  max-width: 900px;
}
</style>
