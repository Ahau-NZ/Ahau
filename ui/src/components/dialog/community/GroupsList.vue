<template>
  <v-row class="ma-5" id="groupList">
    <v-row class="pa-2 pb-4" :justify="mobile ? 'end':'space-between'">
      <p>{{ t('groupYourMembers')}}</p>
      <v-tooltip top open-delay="200">
        <template v-slot:activator="{ on }">
          <div v-on="on">
            <v-btn color="black" rounded outlined disabled  @click="showGroup = true">
              <v-icon class="pr-2">mdi-plus</v-icon> {{ t('addGroup') }}
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
        <v-col v-if="formData.authors && formData.authors.length >= 2" align="end">
          <v-btn text @click="deleteKaitiaki(kaitiaki)">
          <v-icon>mdi-delete</v-icon>
          </v-btn>
        </v-col>
      </v-row>
      <hr size="2" color='white' width='150%' class="ml-n6">

      <!-- Displays the button to add new kaitiaki - shows the drop down when clicked -->
      <v-row v-if="!showKaitiaki" class="pa-4 pb-0">
        <v-btn small color="#3b3b3b" class="white--text ml-3" @click="showKaitiaki = true">
          <v-icon small class="pr-2">mdi-plus</v-icon> {{ t('addKaitiaki') }}
        </v-btn>
      </v-row>
      <!-- The drop down for selecting members as kaitiaki -->
      <v-row v-else class="pa-5">
        <MembersPicker :tribeMembers="kaitiakiGroupMembers" :groupMembers.sync="groupMembers" @addMember='addMember($event)'/>
      </v-row>
    </v-col>

    <Group
      v-for="group in groups" :key="group.id"
      :group="group" :mobile="mobile"
      :members="tribe.members"
      @edit="setEditing($event)"
    />
    <NewGroupDialog
      v-if="showGroup"
      :show="showGroup"
      :title="$t('groups.groupDialogTitle')"
      :profile="subgroup"
      :editing="editing"
      @submit="addGroup($event)"
      @delete="deleteGroup($event)"
      @edit="updateGroup($event)"
      @close="close"
    />
  </v-row>
</template>
<script>
import { getDisplayName } from '@/lib/person-helpers.js'
import Avatar from '@/components/Avatar.vue'
import MembersPicker from './MembersPicker.vue'
import Group from './Group.vue'
import NewGroupDialog from './NewGroupDialog.vue'

// Calling in tribes to test as replacement data for groups
import { mapGetters, createNamespacedHelpers } from 'vuex'
const { mapGetters: mapTribeGetters } = createNamespacedHelpers('tribe')

export default {
  name: 'GroupsList',
  components: {
    Avatar,
    MembersPicker,
    Group,
    NewGroupDialog
  },
  props: {
    profile: Object,
    formData: Object,
    mobile: Boolean,
    tribe: Object
  },
  data () {
    return {
      showKaitiaki: false,
      groupMembers: this.profile.kaitiaki,
      showGroup: false,
      groups: [],
      subgroup: {},
      editing: false
    }
  },
  computed: {
    ...mapGetters(['whoami']),
    ...mapTribeGetters(['tribes']),
    kaitiakiGroupMembers () {
      return this.tribe.members
        .filter((member) => {
          return !this.formData.authors.some(kaitiaki => {
            return kaitiaki.feedId === member.feedId
          })
        })
    }
  },

  methods: {
    getDisplayName,
    addMember (member) {
      this.formData.authors.push(member)
      this.showKaitiaki = false
    },
    deleteKaitiaki (tiaki) {
      const index = this.formData.authors.indexOf(tiaki)
      if (index > -1) {
        this.formData.authors.splice(index, 1)
      }
    },
    addGroup (group) {
      // TODO: plugin in API here to create new subgroup
      // link subgroup to this group
      // update private community profile to populate groups based on links tribe
      // update groups line 93
      group = {
        ...group,
        kaitiaki: [this.whoami.personal.profile]
      }
      this.groups.push(group)

      // jump to the bottom of the dialog where the new group is
      setTimeout(() => {
        var element = document.getElementById('app-dialog')
        element.scrollTo({
          top: element.scrollHeight,
          behavior: 'smooth'
        })
      }, 100)
    },
    updateGroup (group) {
    // TODO edit group
      console.log('update this to edit  group')
    },
    setEditing (subgroup) {
      this.subgroup = subgroup
      this.editing = true
      this.showGroup = true
    },
    deleteGroup (group) {
      // TODO: change this to tombstone group profile and link
      // refresh groups list
      this.groups = this.groups.filter((d) => {
        return d.preferredName !== group.preferredName
      })
      this.close()
    },
    close () {
      this.showGroup = false
      this.editing = false
      this.subgroup = {}
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
