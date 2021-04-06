<template>
  <transition appear :name="mobile ? 'up' : 'left'">
    <v-navigation-drawer
      :style="mobile ? preview ? 'top: -7px ' : 'top: -64px;' : 'top: 64px;'"
      v-model="drawer"
      :absolute="mobile"
      :fixed="!mobile"
      :right="!mobile"
      light
      :width="mobile ? '100%' : '21%'"
      permanent
      :height="mobile ? 'auto' : 'calc(100vh - 64px)'"
      class="side-menu"
    >
      <v-card light min-height="100%">
        <DialogTitleBanner v-if="mobile" :title="getDisplayName(formData)" mobile @close="close"  :isEditing="isEditing" class="px-1 pt-3"/>
        <v-row v-else class="justify-end">
          <v-btn icon class="mr-3">
            <v-icon @click="close" color="secondary">mdi-close</v-icon>
          </v-btn>
        </v-row>
        <v-container>
          <v-row v-if="isEditing">
            <v-col class="py-0">
              <ProfileForm :profile.sync="formData" :readonly="!isEditing" :mobile="mobile" @cancel="cancel" isEditing isSideViewDialog>
                <template v-slot:top>
                  <v-row class="justify-center">
                    <h1>Edit {{ getDisplayName(formData) }}</h1>
                  </v-row>
                  <v-row class="justify-center">
                    <v-btn
                      @click="toggleEdit"
                      color="white"
                      text
                      medium
                      class="blue--text"
                    >
                      <v-icon small class="blue--text" left>mdi-close</v-icon>Cancel
                    </v-btn>
                  </v-row>
                </template>
              </ProfileForm>
            </v-col>
          </v-row>
          <v-row v-if="isEditing">
            <v-col cols="12" sm="auto">
              <v-btn
                v-if="deleteable"
                @click="$emit('delete')"
                align="center"
                color="white"
                text
                class="secondary--text"
              >
                <v-icon class="secondary--text" left>mdi-delete</v-icon>Delete this person
              </v-btn>
            </v-col>
            <v-col
              col="12"
              :align="mobile ? '' : 'right'"
              class="pt-0 d-flex justify-space-between"
            >
              <v-btn @click="cancel" text large fab class="secondary--text mr-10">
                Cancel
              </v-btn>
              <v-btn @click="submit" text large fab class="blue--text ml-5" color="blue">
                Save
              </v-btn>
            </v-col>
          </v-row>
          <v-row v-if="!isEditing"  :class="`${mobile ? 'mt-6' : '' } justify-center`" style="margin-bottom: -20px">
            <Avatar
              class="big-avatar"
              size="250px"
              :image="formData.avatarImage"
              :alt="getDisplayName(formData)"
              :gender="formData.gender"
              :aliveInterval="formData.aliveInterval"
              :deceased="formData.deceased"
              :isEditing="isEditing"
              @updateAvatar="formData.avatarImage = $event"
            />
          </v-row>
          <v-row v-if="!isEditing" class="justify-center">
            <h1 >{{ getDisplayName(formData) }}</h1>
          </v-row>
          <v-row v-if="!isEditing"  class="justify-center pt-3">
            <v-btn
              @click.native="goArchive()"
              color="white"
              text
              medium
              class="blue--text"
            >
              <ArchiveIcon size="normal" color="blue"/>
              <span class="pl-2 "> Stories </span>
            </v-btn>
            <v-btn
              v-if="!preview && profile.canEdit"
              @click="toggleEdit"
              color="white"
              text
              medium
              class="blue--text"
            >
              <v-icon small class="blue--text" left>mdi-pencil</v-icon>Edit
            </v-btn>
          </v-row>
          <v-row v-if="formData.description && !isEditing" class="ma-2 py-2">
            <v-col cols="12" class="pt-0">
              <v-row>
                <v-col class="py-1 px-0 profile-label overline"><small>Description</small></v-col>
              </v-row>
              <v-row class="py-0 justify-center">
                <p class="ma-0 profile-info" style="font-size: 0.8em">{{formData.description}}</p>
              </v-row>
            </v-col>
          </v-row>
          <v-row v-if="!isEditing"  class="flex-column mx-0 ">
            <v-col class="pa-0">
              <v-col cols="12" :class="profile.description ? 'pt-0':'pt-6'">
                <v-row cols="12" class="rounded-border">
                  <ProfileInfoItem class="pb-0 bb" mdCols="12" smCols="12" :title="'Full Name'" :value="profile.legalName"/>
                  <ProfileInfoItem class="pb-0 br bb" mdCols="6" smCols="6" :title="'Other Names'" :value="profile.altNames.join(', ')"/>
                  <ProfileInfoItem class="pb-0 bb" mdCols="6" smCols="6" :title="'Age'" :value="age(formData.aliveInterval)"/>
                  <ProfileInfoItem class="pb-0 br" mdCols="6" smCols="6" title="City" :value="formData.city"/>
                  <ProfileInfoItem class="pb-0 br" mdCols="6" smCols="6" title="Country" :value="formData.country"/>
                </v-row>
                <v-row cols="12" class="rounded-border">
                  <ProfileInfoItem :class="profile.deceased ? 'pb-0 bb br':'pb-0'" :title="'Place of birth'" :mdCols="profile.deceased ? '6':'12'" smCols="12" :value="profile.placeOfBirth" />
                  <template v-if="profile.deceased">
                    <ProfileInfoItem class="pb-0 bb" :title="'Place of passing'" mdCols="6" smCols="12" :value="profile.placeOfDeath" />
                    <ProfileInfoItem class="pb-0 br" :title="'Date of passing'" mdCols="6" smCols="12" :value="diedAt" />
                    <ProfileInfoItem class="pb-0" :title="'Buried location'" mdCols="6" smCols="12" :value="profile.buriedLocation" />
                  </template>
                </v-row>
                <v-row cols="12" class="rounded-border">
                  <ProfileInfoItem class="bb pb-0" mdCols="12" smCols="12"  title="Profession" :value="formData.profession"/>
                  <ProfileInfoItem class="bb pb-0" mdCols="12" smCols="12" title="Schools" :value="formData.school.join('\n')"/>
                  <ProfileInfoItem class="pb-0" mdCols="12" smCols="12" title="Skills" :value="formData.education.join('\n')"/>
                </v-row>
              </v-col>
            </v-col>
          </v-row>
          <v-row v-if="!isEditing"  class="px-2">
            <v-col cols="12" class="border-right">
              <v-row class="d-flex flex-column justify-center align-center">
                <v-col :cols="12" class="pa-0">
                  <AvatarGroup
                    :profiles="profile.parents"
                    group-title="Parents"
                    size="50px"
                    :show-labels="true"
                    @profile-click="openProfile($event)"
                  >
                    <template v-slot:action >
                      <AddButton v-if="!preview && profile.canEdit" @click="toggleNew('parent')" class="pb-4" justify="start"/>
                    </template>
                  </AvatarGroup>
                </v-col>

                <hr v-if="profile.parents" class="family-divider"/>

                <v-col :cols="12" v-if="profile.siblings && profile.siblings.length" class="pa-0">
                  <AvatarGroup
                    :profiles="profile.siblings"
                    group-title="Siblings"
                    size="60px"
                    :show-labels="true"
                    @profile-click="openProfile($event)"
                  >
                  <template v-slot:action >
                    <AddButton v-if="!preview && view && view.focus !== profile.id" @click="toggleNew('sibling')" class="pb-4" justify="start"/>
                  </template>
                  </AvatarGroup>
                </v-col>

                <hr v-if="profile.siblings && profile.siblings.length" class="family-divider"/>

                <v-col :cols="12" class="pa-0">
                  <AvatarGroup
                    v-if="profile.children && profile.children.length"
                    :profiles="profile.children"
                    group-title="Children"
                    size="60px"
                    :show-labels="true"
                    @profile-click="openProfile($event)"
                  >
                    <template v-slot:action >
                      <AddButton v-if="!preview && profile.canEdit" @click="toggleNew('child')" class="pb-4" justify="start"/>
                    </template>
                  </AvatarGroup>
                  <AvatarGroup
                    v-else
                    :profiles="profile._children"
                    group-title="Children"
                    size="60px"
                    :show-labels="true"
                    @profile-click="openProfile($event)"
                  >
                    <template v-slot:action >
                      <AddButton v-if="!preview && profile.canEdit" @click="toggleNew('child')" class="pb-6" />
                    </template>
                  </AvatarGroup>
                </v-col>
              </v-row>
            </v-col>
          </v-row>
        </v-container>
      </v-card>
    </v-navigation-drawer>
  </transition>
</template>

<script>

import calculateAge from '../../../lib/calculate-age'

import { PERMITTED_PERSON_ATTRS, PERMITTED_RELATIONSHIP_ATTRS } from '@/lib/person-helpers'
import { parseInterval, dateToString } from '@/lib/date-helpers.js'

import isEqual from 'lodash.isequal'
import isEmpty from 'lodash.isempty'
import pick from 'lodash.pick'
import clone from 'lodash.clonedeep'
import { mapActions, mapMutations } from 'vuex'

import ProfileInfoItem from '@/components/profile/ProfileInfoItem.vue'
import ProfileForm from '@/components/profile/ProfileForm.vue'

import Avatar from '@/components/Avatar.vue'
import AvatarGroup from '@/components/AvatarGroup.vue'
import AddButton from '@/components/button/AddButton.vue'
import DialogTitleBanner from '@/components/dialog/DialogTitleBanner.vue'
import ArchiveIcon from '@/components/button/ArchiveIcon.vue'

import { getDisplayName } from '@/lib/person-helpers.js'

function defaultData (input) {
  var profile = clone(input)

  return {
    id: profile.id,
    gender: profile.gender,
    legalName: profile.legalName,
    aliveInterval: profile.aliveInterval,
    preferredName: profile.preferredName,
    avatarImage: profile.avatarImage,
    description: profile.description,
    birthOrder: profile.birthOrder,
    relationshipType: profile.relationship ? profile.relationship.relationshipType : null,
    email: profile.email,
    phone: profile.phone,
    deceased: profile.deceased,
    placeOfBirth: profile.placeOfBirth,
    placeOfDeath: profile.placeOfDeath,
    buriedLocation: profile.buriedLocation,
    address: profile.address,
    city: profile.city,
    country: profile.country,
    postCode: profile.postCode,
    profession: profile.profession,
    altNames: {
      currentState: clone(profile.altNames),
      add: [], // new altNames to add
      remove: [] // altNames to remove
    },
    education: profile.education,
    school: profile.school
  }
}

export default {
  name: 'SideNodeDialog',
  components: {
    ProfileForm,
    AddButton,
    Avatar,
    AvatarGroup,
    DialogTitleBanner,
    ArchiveIcon,
    ProfileInfoItem
  },
  props: {
    goBack: { type: Function },
    profile: { type: Object, default: () => {} },
    deleteable: { type: Boolean, default: false },
    warnAboutChildren: { type: Boolean, default: true },
    view: { type: Object },
    sideMenu: { type: Boolean, default: false },
    relationshipLinks: { type: Array },
    show: { type: Boolean, required: true },
    readonly: { type: Boolean, default: false },
    preview: { type: Boolean, default: false }
  },

  data () {
    return {
      isEditing: false,
      formData: {},
      showDescription: false,
      drawer: false
    }
  },
  computed: {
    mobile () {
      return this.$vuetify.breakpoint.xs
    },
    diedAt () {
      var date = this.profile.aliveInterval.split('/')
      return dateToString(date[1])
    },
    profileChanges () {
      let changes = {}

      Object.entries(this.formData).forEach(([key, value]) => {
        if (!isEqual(this.formData[key], this.profile[key])) {
          switch (key) {
            case 'altNames':
              if (!isEqual(this.formData.altNames.add, this.profile.altNames)) {
                changes[key] = pick(this.formData.altNames, ['add', 'remove'])
                changes[key].add = changes[key].add.filter(Boolean)
              }
              break
            case 'birthOrder':
              changes[key] = parseInt(value)
              break
            case 'relationshipType':
              if (value && value !== this.profile.relationshipType) {
                changes[key] = value
              }
              break
            case 'aliveInterval':
              changes[key] = parseInterval(this.formData.aliveInterval)
              break
            default:
              changes[key] = value
          }
        }
      })
      return changes
    },
    customProps () {
      return {
        readonly: !this.isEditing,
        flat: !this.isEditing,
        // appendIcon: this.isEditing ? '' ? 'mdi-delete' : 'mdi-pencil',
        hideDetails: true,
        placeholder: ' ',
        class: !this.isEditing ? 'custom' : ''
      }
    }
  },
  watch: {
    show: {
      immediate: true,
      handler (newVal) {
        this.drawer = newVal
        if (this.mobile) window.scrollTo(0, 0)
      }
    },
    profile: {
      deep: true,
      immediate: true,
      handler (newVal) {
        if (!newVal) return
        this.formData = defaultData(newVal)
      }
    }
  },
  methods: {
    ...mapMutations(['updateIsFromWhakapapaShow']),
    ...mapActions(['setProfileById', 'setDialog', 'setIsFromWhakapapaShow']),
    getDisplayName,
    goArchive () {
      if (
        this.$route.name === 'person/whakapapa/:whakapapaId' ||
        this.$route.name === 'community/whakapapa/:whakapapaId'
      // ) this.setIsFromWhakapapaShow(true)
      ) this.updateIsFromWhakapapaShow(true)
      this.$router.push({
        name: 'person/archive',
        params: {
          tribeId: this.$route.params.tribeId,
          profileId: this.profile.id
        }
      }).catch(() => {})
    },
    age (born) {
      var age = calculateAge(born)
      if (age) {
        return age.toString()
      }
      return age
    },
    openProfile (profile) {
      this.setProfileById({ id: profile.id, type: 'preview' })
      this.setDialog({ active: 'view-edit-node', type: 'preview' })
    },
    close () {
      this.$emit('close')
    },
    cancel () {
      // reset form values
      this.formData = defaultData(this.profile)
      this.toggleEdit()
    },
    submit () {
      var output = Object.assign({}, pick(this.profileChanges, [...PERMITTED_PERSON_ATTRS, ...PERMITTED_RELATIONSHIP_ATTRS]))

      if (!isEmpty(output)) {
        this.$emit('submit', output)
      }

      this.formData = defaultData(this.profile)
      this.toggleEdit()
    },
    toggleNew (type) {
      this.$emit('new', type)
    },
    toggleEdit () {
      this.isEditing = !this.isEditing
    }
  }
}
</script>

<style lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Forum&display=swap');
@import '~animate.css/source/sliding_entrances/slideInRight.css';
@import '~animate.css/source/sliding_exits/slideOutRight.css';
@import '~animate.css/source/sliding_entrances/slideInUp.css';

.side-menu {
  background-color: white;
  overflow: none;
  z-index:6
}

// .no-scroll::-webkit-scrollbar{
//   display:none;
// }

::-webkit-scrollbar {
  width: 5px;
  // height: 8px;
}

/* Track */
::-webkit-scrollbar-track {
  background: #f1f1f1;
}

/* Handle */
::-webkit-scrollbar-thumb {
  background: #888;
}

/* Handle on hover */
::-webkit-scrollbar-thumb:hover {
  background: #555;
}

.profile-label {
  color: rgba(0,0,0,0.6);
  display: flex;
  justify-content: center;
}

.profile-info {
  /* font-family: 'Forum', cursive; */
  text-align: center;
}

.family-divider {
  width: 80%;
  height:0.5px;
  border-width:0;
  color:gray;
  background-color:gray;
  opacity:0.3
}

.up-enter-active {
  animation: slideInUp .2s;
}
.up-leave-active, .up-leave-to{
  opacity: 0;
}

.left-enter-active {
  animation: slideInRight .2s;
}
.left-leave-active {
  animation: slideOutRight .3s;
}

</style>
