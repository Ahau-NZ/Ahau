<template>
  <v-col cols="12" style="background-color:#ebebeb" class="mb-8">
    <v-row>
      <p class="ml-5 headliner">{{ group.preferredName}}</p>
      <v-icon @click="$emit('edit', (group))" small class=" mb-4 ml-5 blue--text">mdi-pencil</v-icon>
    </v-row>
    <p class="ml-3 mb-1 caption black--text">{{ group.description }}</p>

    <!-- Displays kaitiakis already in the group -->
    <v-row  v-for="kaitiaki in group.kaitiaki" :key="kaitiaki.id" class="justify-center align-center">
      <hr size="2" color='white' width='150%' class="ml-n6">
      <v-col offset-md="1" cols="3" md="1" :class="mobile ? 'pb-0':'py-0'">
        <Avatar :size="mobile ? '50px' : '40px'" :showLabel="mobile" :image="kaitiaki.avatarImage" :alt="kaitiaki.preferredName" />
      </v-col>
      <v-col cols="3" v-if="!mobile" class="pb-0">
        <p style="color:black;">{{ getDisplayName(kaitiaki) }}</p>
      </v-col>
      <!-- <v-col :class="mobile ? 'pb-0 pl-8':'pb-0'"> -->
      <v-col cols="6" md="4" class="pl-4 py-0">
        <v-select
          :items="[t('kaitiaki'), t('member')]"
          value="Kaitiaki"
          @change="updateRole($event, kaitiaki)"
          light
          dense
          hide-details
          outlined
          :menuProps="{ light: true }"
        ></v-select>
      </v-col>
      <v-col cols="3" align="end">
        <v-btn text @click="deleteMember(kaitiaki)">
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </v-col>
    </v-row>
    <!-- Dsiplay members already in the group -->
    <v-row  v-for="member in group.members" :key="member.id" class="justify-center align-center">
      <hr size="2" color='white' width='150%' class="ml-n6">
      <v-col offset-md="1" cols="3" md="1" :class="mobile ? 'pb-0':'py-0'">
        <Avatar :size="mobile ? '50px' : '40px'" :showLabel="mobile" :image="member.avatarImage" :alt="member.preferredName" />
      </v-col>
      <v-col cols="3" v-if="!mobile" class="pb-0">
        <p style="color:black;">{{ getDisplayName(member) }}</p>
      </v-col>
      <v-col cols="6" md="4" class="pl-4 py-0">
        <v-select
          :items="[t('member'), t('kaitiaki')]"
          value="Member"
          @change="updateRole($event, member)"
          light
          dense
          hide-details
          outlined
          :menuProps="{ light: true }"
        ></v-select>
      </v-col>
      <v-col cols="3" align="end">
        <v-btn text @click="deleteMember(member)">
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </v-col>
    </v-row>
    <hr size="2" color='white' width='150%' class="ml-n6">

    <!-- Displays the button to add new kaitiaki - shows the drop down when clicked -->
    <v-row v-if="!showMember" class="pa-4 pb-0">
      <v-btn small color="#3b3b3b" class="white--text ml-3" @click="showMember = true">
        <v-icon small class="pr-2">mdi-plus</v-icon> {{ t('addMembers') }}
      </v-btn>
    </v-row>

    <!-- The drop down for selecting members as kaitiaki -->
    <v-row v-else class="pa-5">
      <MembersPicker :tribeMembers="potentialMembers" :groupMembers.sync="groupMembers" @addMember='addMember($event)'/>
    </v-row>
  </v-col>
</template>
<script>

import { getDisplayName } from '@/lib/person-helpers.js'
import Avatar from '@/components/Avatar.vue'
import MembersPicker from './MembersPicker.vue'

export default {
  name: 'Group',
  components: {
    Avatar,
    MembersPicker
  },
  props: {
    mobile: Boolean,
    group: Object,
    members: Array
  },
  data () {
    return {
      showMember: false,
      groupMembers: this.group.members
    }
  },
  computed: {
    // gets list of tribal members and removes current subgroup members and kaitiaki
    potentialMembers () {
      return this.members
        .filter((member) => {
          return !this.group.members.some(d => {
            return d.id === member.id
          })
        }).filter((kaitiaki) => {
          return !this.group.kaitiaki.some(d => {
            return d.id === kaitiaki.id
          })
        })
    }
  },
  methods: {
    getDisplayName,
    updateRole (val, person) {
      if (val === 'Member') {
        this.deleteKaitiaki(person)
        this.addMember(person)
      } else if (val === 'Kaitiaki') {
        this.deleteMember(person)
        this.addKaitiaki(person)
      }
    },
    deleteKaitiaki (tiaki) {
      const index = this.group.kaitiaki.indexOf(tiaki)
      if (index > -1) {
        this.group.kaitiaki.splice(index, 1)
      }
    },
    addKaitiaki (tiaki) {
      this.group.kaitiaki.push(tiaki)
    },
    addMember (member) {
      this.group.members.push(member)
      this.showMember = false
    },
    deleteMember (member) {
      const index = this.group.members.indexOf(member)
      if (index > -1) {
        this.group.members.splice(index, 1)
      }
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
