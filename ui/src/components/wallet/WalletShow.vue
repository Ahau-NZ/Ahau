<template>
  <div>
    <v-row style="margin-top: 100px">
      <v-col :cols="mobile ? 10 : 7" class="sub-headliner black--text pa-0 pl-6 pb-2">
        {{ t('identityCredentials') }}
      </v-col>
      <v-col :class="mobile ? 'mt-n5': ''">
        <BigAddButton v-if="!mobile" class="addBtnDesktop" :label="t('activity')" icon="mdi-chevron-left" @click.native.stop="showActivity = !showActivity" />
        <v-icon large class="grey--text" v-else @click.native.stop="showActivity = !showActivity">mdi-history</v-icon>
        </v-col>
    </v-row>
    <v-navigation-drawer right bottom absolute light
      :width="mobile ? '100%' : '600px'"
      :height="mobile ? '100%' : ''"
      style="margin-top: 60px"
      v-model="showActivity"
    >
      <div class="d-flex justify-end">
        <v-icon @click="showActivity = !showActivity" class="mr-6 mt-8">mdi-close</v-icon>
      </div>
      <v-row class="ma-2 black--text ml-8">
        <h1 class="headliner mb-4">{{ t('activity') }}</h1>
        <!-- TODO hacky styling fix! -->
        <v-col v-for="message in sortedMessages.reverse()" :key="message.id"
          cols="12" class="pa-0 pl-4"
        >
          <div class="d-flex align-start caption">
            <v-row>
              <div class="d-flex-column">
                <div><p class="font-weight-bold mb-0">{{message.time}}</p></div>
                <div><p class="font-weight-bold">{{message.date}}</p></div>
              </div>
              <div class="pl-2">
                <span>{{ t('from') + ': ' }}</span>
                <span class="d-block text-truncate" style="max-width:200px">{{ message.author }} </span>
              </div>
              <div class="pl-2 pt-5 blue--text font-weight-bold"><p>{{ message.action }}</p></div>
            </v-row>
          </div>
        </v-col>
      </v-row>
    </v-navigation-drawer>
    <v-row v-if="credentials && credentials.length > 0" class="ma-2">
      <!-- TODO hacky styling fix! -->
      <v-col v-for="credential in credentials" :key="credential.id"
        cols="12" md="6" class="pr-4"
        style="max-width: 440px;"
      >
        <CredentialPreview
          :credential="credential"
          :avatarImage="whoami.public.profile.avatarImage"
        />
      </v-col>
    </v-row>
    <!-- empty -->
    <v-row v-else>
      <v-col
        cols="12"
        xs="12"
        sm="12"
        md="9"
        class="pa-0"
      >
        <v-col
          class="px-8 subtitle-1 grey--text "
          :class="{ 'text-center': mobile }"
        >
          {{ t('credentialNotFound') }}
        </v-col>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import CredentialPreview from './CredentialPreview.vue'
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'WalletShow',
  components: { CredentialPreview },
  data () {
    return {
      showActivity: false
    }
  },
  mounted () {
    this.getAllCredentials()
    this.getAllMessages()
  },
  computed: {
    ...mapGetters(['whoami']),
    ...mapGetters('credentials', ['credentials', 'messages']),
    mobile () {
      return this.$vuetify.breakpoint.xs || this.$vuetify.breakpoint.sm
    },
    sortedMessages () {
      // date: action :party
      // 1. sort by date
      if (this.messages) {
        const rawMessages = this.messages?.map(message => {
          message.date = this.dateConverter(message.createdTime)
          message.time = this.timeConverter(message.createdTime)
          message.action = this.activityConvertor(message.piuri)
          message.author = this.getAuthor(message.from)
          return message
        })
        const sorted = rawMessages?.sort((a, b) => a.createdTime - b.createdTime)
        return sorted
      } else return []
    }
  },
  methods: {
    ...mapActions('credentials', ['getAllCredentials', 'getAllMessages']),
    t (key, vars) {
      return this.$t('walletShow.' + key, vars)
    },
    dateConverter (timeStamp) {
      const a = new Date(timeStamp * 1000)
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      const year = a.getFullYear()
      const month = months[a.getMonth()]
      const date = a.getDate()
      const fullDate = date + ' ' + month + ' ' + year
      return fullDate
    },
    timeConverter (timeStamp) {
      const locale = (navigator && navigator.language) || 'en-NZ'
      const a = new Date(timeStamp * 1000)
      const formattedTime = a.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })
      return formattedTime
    },
    activityConvertor (piuri) {
      switch (piuri) {
        case 'https://didcomm.org/issue-credential/3.0/offer-credential':
          return this.t('credentialOffer')
        case 'https://atalaprism.io/mercury/connections/1.0/response':
          return this.t('connectionResponse')
        case 'https://atalaprism.io/mercury/connections/1.0/request':
          return this.t('connectionRequest')
        case 'https://didcomm.org/issue-credential/3.0/issue-credential':
          return this.t('credentialIssue')
        case 'https://didcomm.org/issue-credential/3.0/request-credential':
          return this.t('credentialRequest')
        case 'https://didcomm.atalaprism.io/present-proof/3.0/request-presentation':
          return this.t('presentationRequest')
        case 'https://didcomm.atalaprism.io/present-proof/3.0/presentation':
          return this.t('presentationResponse')
        default:
          return 'no match'
      }
    },
    getAuthor (from) {
      // TODO: return name and image of author
      return from.uuid
    }
  }
}
</script>

<style lang="scss">
.v-navigation-drawer--bottom.v-navigation-drawer--is-mobile {
  max-height: 90%
}
</style>
