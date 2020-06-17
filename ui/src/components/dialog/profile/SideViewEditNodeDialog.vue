<template>
  <transition appear :name="mobile ? 'up' : 'left'">
    <v-navigation-drawer
      :style="mobile ? 'top: -64px;' : 'top: 64px;'"
      v-model="drawer"
      absolute
      :right="!mobile"
      light
      :width="mobile ? '100%' : '25%'"
      permanent
      :height="mobile ? 'auto' : 'calc(100vh - 64px)'"
      class="side-menu"
    >
      <v-card light class="scroll" height="100%">
        <DialogTitleBanner v-if="mobile" :title="formData.preferredName" mobile @close="close"  :isEditing="isEditing" class="px-5 pt-5"/>
        <v-row v-else class="justify-end">
          <v-btn icon class="mr-3">
            <v-icon @click="close" color="secondary">mdi-close</v-icon>
          </v-btn>
        </v-row>
        <v-container>
          <v-row v-if="isEditing">
            <v-col>
              <ProfileForm :profile.sync="formData" :readonly="!isEditing" mobile @cancel="cancel" isEditing>
                <template v-slot:top>
                  <v-row class="justify-center">
                    <h1>Edit {{ formData.preferredName }}</h1>
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
            <v-col cols="12" sm="auto" class="mb-8">
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
                <v-icon color="secondary">mdi-close</v-icon>
              </v-btn>
              <v-btn @click="submit" text large fab class="blue--text ml-5" color="blue">
                <v-icon>mdi-check</v-icon>
              </v-btn>
            </v-col>
          </v-row>
          <v-row v-if="!isEditing"  :class="`${mobile ? 'mt-6' : '' } justify-center`" style="margin-bottom: -20px">
            <Avatar
              class="big-avatar"
              size="250px"
              :image="formData.avatarImage"
              :alt="formData.preferredName"
              :gender="formData.gender"
              :aliveInterval="formData.aliveInterval"
              :deceased="formData.deceased"
              :isEditing="isEditing"
              @updateAvatar="formData.avatarImage = $event"
            />
          </v-row>
          <v-row v-if="!isEditing" class="justify-center">
            <h1 >{{ formData.preferredName }}</h1>
          </v-row>
          <v-row v-if="!isEditing"  class="justify-center">
            <v-btn
              @click="toggleEdit"
              color="white"
              text
              medium
              class="blue--text"
            >
              <v-icon small class="blue--text" left>mdi-pencil</v-icon>Edit
            </v-btn>
          </v-row>
          <v-row v-if="formData.description && !isEditing" class="ma-2">
            <v-col cols="12" class="pt-0">
              <v-row>
                <v-col class="py-1 px-0 profile-label"><small>Description</small></v-col>
              </v-row>
              <v-row class="py-0 justify-center">
                <p class="ma-0 profile-info" style="font-size: 0.8em">{{formData.description}}</p>
              </v-row>
            </v-col>
          </v-row>
          <v-row v-if="!isEditing"  style="border: 0.5px solid rgba(0,0,0,0.12); border-radius: 10px;" class="flex-column mx-2">
            <v-col>
              <v-row style="border-bottom: 0.5px solid rgba(0,0,0,0.12);" class="ma-0">
                <v-col cols="6">
                  <v-row>
                    <v-col class="py-1 px-0 profile-label"><small>Legal Name</small></v-col>
                  </v-row>
                  <v-row class="py-0 justify-center">
                    <p class="ma-0 profile-info">{{formData.legalName}}</p>
                  </v-row>
                </v-col>
                <v-col cols="6">
                  <v-row>
                    <v-col class="py-1 px-0 profile-label"><small>Age</small></v-col>
                  </v-row>
                  <v-row class="py-0 justify-center">
                    <p class="ma-0 profile-info">{{age(formData.aliveInterval)}}</p>
                  </v-row>
                </v-col>
              </v-row>
              <v-row class="ma-0">
                <v-col cols="6">
                  <v-row>
                    <v-col class="py-1 px-0 profile-label"><small>Occupation</small></v-col>
                  </v-row>
                  <v-row class="py-0 justify-center">
                    <p class="ma-0 profile-info" style="font-size: 0.8em">{{formData.profession}}</p>
                  </v-row>
                </v-col>
                <v-col cols="6">
                  <v-row>
                    <v-col class="py-1 px-0 profile-label"><small>Location</small></v-col>
                  </v-row>
                  <v-row class="py-0 justify-center">
                    <p class="ma-0 profile-info" style="font-size: 0.8em">{{formData.location}}</p>
                  </v-row>
                </v-col>
              </v-row>
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
                    <AddButton @click="toggleNew('parent')" />
                  </AvatarGroup>
                </v-col>

                <hr v-if="profile.siblings" class="family-divider"/>

                <v-col :cols="12" v-if="profile.siblings" class="pa-0">
                  <AvatarGroup
                    :profiles="profile.siblings"
                    group-title="Siblings"
                    size="60px"
                    :show-labels="true"
                    @profile-click="openProfile($event)"
                  >
                    <AddButton v-if="view.focus !== profile.id" @click="toggleNew('sibling')" />
                  </AvatarGroup>
                </v-col>

                <hr v-if="profile.siblings" class="family-divider"/>

                <v-col :cols="12" class="pa-0">
                  <AvatarGroup
                    v-if="profile.children.length"
                    :profiles="profile.children"
                    group-title="Children"
                    size="60px"
                    :show-labels="true"
                    @profile-click="openProfile($event)"
                  >
                    <AddButton @click="toggleNew('child')" />
                  </AvatarGroup>
                  <AvatarGroup
                    v-else
                    :profiles="profile._children"
                    group-title="Children"
                    size="60px"
                    :show-labels="true"
                    @profile-click="openProfile($event)"
                  >
                    <AddButton @click="toggleNew('child')" />
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

import { PERMITTED_PROFILE_ATTRS, PERMITTED_RELATIONSHIP_ATTRS } from '@/lib/profile-helpers'

import isEqual from 'lodash.isequal'
import isEmpty from 'lodash.isempty'
import pick from 'lodash.pick'
import clone from 'lodash.clonedeep'

import edtf from 'edtf'

import ProfileForm from '@/components/profile-form/ProfileForm.vue'

import Avatar from '@/components/Avatar.vue'
import AvatarGroup from '@/components/AvatarGroup.vue'
import AddButton from '@/components/button/AddButton.vue'
import DialogTitleBanner from '@/components/dialog/DialogTitleBanner.vue'

function defaultData (profile) {
  return {
    id: profile.id,
    gender: profile.gender,
    legalName: profile.legalName,
    aliveInterval: profile.aliveInterval,
    bornAt: '',
    diedAt: '',
    preferredName: profile.preferredName,
    avatarImage: profile.avatarImage,
    description: profile.description,
    birthOrder: profile.birthOrder,
    relationshipType: profile.relationship ? profile.relationship.relationshipType : null,
    location: profile.location,
    email: profile.email,
    phone: profile.phone,
    deceased: profile.deceased,
    address: profile.address,
    profession: profile.profession,
    altNames: {
      currentState: clone(profile.altNames),
      add: [], // new altNames to add
      remove: [] // altNames to remove
    }
  }
}

export default {
  name: 'SideViewEditNodeDialog',
  components: {
    ProfileForm,
    AddButton,
    Avatar,
    AvatarGroup,
    DialogTitleBanner
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
    readonly: { type: Boolean, default: false }
  },

  data () {
    return {
      testmapimage: require('../../../assets/map-test.png'),
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
      }
    },
    profile: {
      deep: true,
      immediate: true,
      handler (newVal) {
        if (!newVal) return
        this.formData = defaultData(newVal)

        if (this.formData.aliveInterval) {
          var v = edtf(this.formData.aliveInterval)
          this.formData.bornAt = v.lower || ''
          this.formData.diedAt = v.upper || ''
        } else {
          this.formData.bornAt = ''
          this.formData.diedAt = ''
        }
      }
    },
    'formData.bornAt' (newVal) {
      if (this.formData.aliveInterval) {
        var dates = this.formData.aliveInterval.split('/')
        this.formData.aliveInterval = (newVal || '') + '/' + (dates[1] || '')
      } else {
        this.formData.aliveInterval = (newVal || '') + '/'
      }
    },
    'formData.diedAt' (newVal) {
      if (this.formData.aliveInterval) {
        var dates = this.formData.aliveInterval.split('/')
        this.formData.aliveInterval = (dates[0] || '') + '/' + (newVal || '')
      } else {
        this.formData.aliveInterval = '/' + (newVal || '')
      }
    }
  },
  methods: {
    age (born) {
      var age = calculateAge(born)
      return age
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
      var output = Object.assign({}, pick(this.profileChanges, [...PERMITTED_PROFILE_ATTRS, ...PERMITTED_RELATIONSHIP_ATTRS]))

      if (!isEmpty(output)) {
        this.$emit('submit', output)
      }

      this.formData = defaultData(this.profile)
      this.toggleEdit()
    },
    openProfile (profile) {
      this.$emit('open-profile', profile.id)
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
  overflow-x: hidden;
}

.scroll {
  overflow-x: hidden;
  overflow-y: scroll;
  max-height: 100%;
}

::-webkit-scrollbar {
  width: 5px;
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
  border: 0.5px solid rgba(0, 0, 0, 0.12);
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
