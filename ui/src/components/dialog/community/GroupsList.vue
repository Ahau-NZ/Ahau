<template>
  <v-row class="ma-5" id="groupList">
    <v-row class="pa-2 pb-4" :justify="mobile ? 'end':'space-between'">
      <p>{{ t('groupYourMembers')}}</p>
      <v-tooltip top open-delay="200">
        <template v-slot:activator="{ on }">
          <div v-on="on">
            <v-btn color="black" rounded outlined disabled @click="dialog = 'sub-group'">
              <v-icon class="pr-2">mdi-plus</v-icon>
              {{ t('addGroup') }}
            </v-btn>
          </div>
        </template>
        <span>{{ $t('support.comingSoon')}}</span>
      </v-tooltip>
    </v-row>
    <v-col cols="12" style="background-color:#ebebeb" class="mb-8">
      <p class="ml-5 mb-1 headliner">{{ t('tribalKaitiaki') }}</p>
      <p class="ml-5 mb-1 caption black--text">{{ t('kaitiakiDescription') }}</p>

      <!-- Displays Tribal Kaitiaki in rows, new and existing ones that havent been removed -->
      <v-row  v-for="(kaitiaki , i) in formData.authors" :key="i" class="justify-center align-center">
        <hr size="2" color='white' width='150%' class="ml-n6">
        <v-col offset="1" cols="1" class="py-0">
          <Avatar :size="mobile ? '50px' : '40px'" :image="kaitiaki.avatarImage" :alt="kaitiaki.preferredName" />
        </v-col>
        <v-col :class="mobile ? 'pb-0 pl-8':'pb-0'">
          <p style="color:black;">{{ getDisplayName(kaitiaki) }}</p>
        </v-col>
        <v-col v-if="formData.authors && formData.authors.length >= 2 && !isCurrentKaitiaki(kaitiaki)" align="end">
          <v-btn text @click="deleteKaitiaki(kaitiaki)">
          <v-icon>mdi-delete</v-icon>
          </v-btn>
        </v-col>
      </v-row>
      <hr size="2" color='white' width='150%' class="ml-n6">

      <!-- Displays the button to add new kaitiaki - shows the drop down when clicked -->
      <v-row v-if="!showKaitiaki && membersNotInKaitiakiGroup && membersNotInKaitiakiGroup.length" class="pa-4 pb-0">
        <v-btn small color="#3b3b3b" class="white--text ml-3" @click="showKaitiaki = true">
          <v-icon small class="pr-2">mdi-plus</v-icon> {{ t('addKaitiaki') }}
        </v-btn>
      </v-row>
      <!-- The drop down for selecting members as kaitiaki -->
      <v-row v-else-if="membersNotInKaitiakiGroup && membersNotInKaitiakiGroup.length" class="pa-5">
        <MembersPicker :members="membersNotInKaitiakiGroup" @addMember='addMember($event)'/>
      </v-row>
    </v-col>

    <SubGroup
      v-for="subGroup in subGroups" :key="subGroup.id"
      :subGroup="subGroup" :mobile="mobile"
      @edit="setEditingSubGroup"
    />
    <NewSubGroupDialog
      v-if="dialog === 'sub-group'"
      :show="dialog === 'sub-group'"
      :profile="selectedSubGroupProfile"
      :editing="editing"
      @submit="addSubGroup"
      @edit="updateSubGroupProfiles"
      @delete="dialog = 'delete-sub-group'"
      @close="close"
    />
    <DeleteCommunityDialog
      v-if="dialog === 'delete-sub-group'"
      :show="dialog === 'delete-sub-group'"
      @submit="deleteSubGroup"
      @close="dialog = 'sub-group'"
    />
  </v-row>
</template>
<script>
import { getDisplayName } from '@/lib/person-helpers.js'
import Avatar from '@/components/Avatar.vue'
import MembersPicker from './MembersPicker.vue'
import SubGroup from './SubGroup.vue'
import NewSubGroupDialog from './NewSubGroupDialog.vue'
import DeleteCommunityDialog from '@/components/dialog/community/DeleteCommunityDialog.vue'

// Calling in tribes to test as replacement data for groups
import { mapGetters, mapActions, createNamespacedHelpers } from 'vuex'
import { getTribalProfile } from '../../../lib/community-helpers'
const { mapActions: mapSubTribeActions } = createNamespacedHelpers('subtribe')

export default {
  name: 'GroupsList',
  components: {
    Avatar,
    MembersPicker,
    SubGroup,
    NewSubGroupDialog,
    DeleteCommunityDialog
  },
  props: {
    profile: Object,
    formData: Object,
    mobile: Boolean,
    tribe: Object
  },
  data () {
    return {
      dialog: null,
      showKaitiaki: false,
      subGroups: [],
      selectedSubGroup: null,
      editing: false,
      parentGroup: null
    }
  },
  async mounted () {
    await this.loadParentGroup()
    // await this.loadSubGroups()
  },
  computed: {
    ...mapGetters(['whoami']),
    ...mapGetters('tribe', ['tribes']),
    selectedSubGroupProfile () {
      if (!this.selectedSubGroup) return null

      return getTribalProfile(this.selectedSubGroup, this.whoami)
    },
    membersNotInKaitiakiGroup () {
      return this.parentGroup && this.parentGroup.members.filter(d => {
        return !this.formData.authors.some(m => m.feedId === d.feedId)
      })
    }
  },
  methods: {
    ...mapActions('tribe', ['getTribe', 'createPrivateGroupProfileLink']),
    ...mapSubTribeActions(['createSubGroup', 'getSubGroups']),
    ...mapActions('community', ['saveCommunity', 'updateCommunity', 'savePublicCommunity']),
    getDisplayName,
    // NOTE: im doing this because the tribe comes from a component which is far up, rather than
    // going through all the components to get there, i'll just reload it locally
    async loadParentGroup () {
      this.parentGroup = await this.getTribe(this.tribe.id)
    },
    // async loadSubGroups () {
    //   this.subGroups = await this.getSubGroups(this.tribe.id)
    // },
    async addMember (member) {
      const formData = this.formData
      formData.authors.push(member)
      this.$emit('update:formData', formData)
      this.showKaitiaki = false
    },
    isCurrentKaitiaki (kaitiaki) {
      return this.profile && this.profile.authors.some(m => m.feedId === kaitiaki.feedId)
    },
    deleteKaitiaki (tiaki) {
      const index = this.formData.authors.indexOf(tiaki)
      if (index > -1) {
        const formData = this.formData
        formData.authors.splice(index, 1)
        this.$emit('update:formData', formData)
      }
    },
    async addSubGroup ($event) {
      // create group profiles and link them
      await this.setupNewSubGroup($event)

      // add it to the list of subgroups
      await this.loadParentGroup()
      await this.loadSubGroups()

      //   // scroll to bottom
      this.jumpToBottom()
    },
    async setupNewSubGroup ($event) {
      // create a subgroup and link it to the current tribe
      const { id: subGroupId, poBoxId } = await this.createSubGroup(this.parentGroup.id)

      // create and link profiles
      const input = {
        ...$event,
        poBoxId, // attach the poBoxId to the subgroups profiles
        authors: {
          add: [this.whoami.public.feedId] // by default we'll set the authors to the creator
        }
      }

      // these were failing the spec checks in ssb-profile when null on create :/
      if (input.avatarImage === null) delete input.avatarImage
      if (input.headerImage === null) delete input.headerImage

      // create and link a new "private" profile for the subgroup
      const privateProfileId = await this.saveCommunity({
        ...input,
        recps: [subGroupId]
      })
      await this.createPrivateGroupProfileLink({
        group: subGroupId,
        profile: privateProfileId,
        parentGroupId: this.parentGroup.id // attaches the parent group
      })

      // TODO: find out recps
      // create a new profile for the subgroup visible in the parent group
      const profileInParentGroupId = await this.saveCommunity({
        ...input,
        recps: [subGroupId] // encrypt it to the parent group
      })
      await this.createPrivateGroupProfileLink({
        group: this.parentGroup.id, // link the subGroupProfile to the parent group
        profile: profileInParentGroupId
      })

      return subGroupId
    },
    // scroll to the bottom of the dialog
    jumpToBottom () {
      setTimeout(() => {
        const element = document.getElementById('app-dialog')
        element.scrollTo({
          top: element.scrollHeight,
          behavior: 'smooth'
        })
      }, 100)
    },
    async updateSubGroupProfiles (input) {
      // get the subgroups two profiles
      const subGroupPrivateProfile = this.selectedSubGroup.private[0]
      const subGroupProfileInGroup = this.parentGroup.private.find(profile => profile.recps[0] === this.selectedSubGroup.id)

      // update them
      await this.saveCommunity({ id: subGroupPrivateProfile.id, ...input })
      await this.saveCommunity({ id: subGroupProfileInGroup.id, ...input })

      // reload the ui
      // TODO: do something cheaper then this
      await this.loadParentGroup()
      // await this.loadSubGroups()

      // TODO: figure out how to scroll to this subgroup..?
    },
    setEditingSubGroup (subGroup) {
      this.selectedSubGroup = subGroup
      this.editing = true
      this.dialog = 'sub-group'
    },
    async deleteSubGroup () {
      const subGroup = this.selectedSubGroup

      // close the dialog
      this.close()

      // get the subgroups two profiles
      const subGroupPrivateProfile = subGroup.private[0]
      const subGroupProfileInGroup = this.parentGroup.private.find(profile => profile.recps[0] === subGroup.id)

      // tombstone them
      await this.saveCommunity({ id: subGroupPrivateProfile.id, tombstone: { date: new Date() } })
      await this.saveCommunity({ id: subGroupProfileInGroup.id, tombstone: { date: new Date() } })

      // reload the ui
      // TODO: do something cheaper then this
      await this.loadParentGroup()
      // await this.loadSubGroups()
    },
    close () {
      this.dialog = null
      this.editing = false
      this.selectedSubGroup = null
    },
    t (key, vars) {
      return this.$t('groups.' + key, vars)
    }
  }
}
</script>
<style scoped>
  .headliner {
    font-size: 1em;
    text-transform: uppercase;
    font-weight: 500;
    letter-spacing: 5px;
  }
</style>
