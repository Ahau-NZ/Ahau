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
        <DialogTitleBanner v-if="mobile" title="Apply Filter" mobile @close="close"  :isEditing="true" class="px-1 pt-3"/>
        <v-row v-else class="justify-end">
          <v-btn icon class="mr-3">
            <v-icon @click="close" color="secondary">mdi-close</v-icon>
          </v-btn>
        </v-row>
        <v-container>
          <v-row class="justify-center">
            <h1>Apply Table Filters</h1>
          </v-row>
        </v-container>
      </v-card>
    </v-navigation-drawer>
  </transition>
</template>

<script>
import calculateAge from '../../../lib/calculate-age'

import { PERMITTED_PERSON_ATTRS, PERMITTED_RELATIONSHIP_ATTRS } from '@/lib/person-helpers'
import { parseInterval } from '@/lib/date-helpers.js'

import isEqual from 'lodash.isequal'
import isEmpty from 'lodash.isempty'
import pick from 'lodash.pick'
import clone from 'lodash.clonedeep'
import { mapActions } from 'vuex'

import ProfileForm from '@/components/profile/ProfileForm.vue'

import Avatar from '@/components/Avatar.vue'
import AvatarGroup from '@/components/AvatarGroup.vue'
import AddButton from '@/components/button/AddButton.vue'
import DialogTitleBanner from '@/components/dialog/DialogTitleBanner.vue'
import ArchiveIcon from '@/components/button/ArchiveIcon.vue'

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
  name: 'FilterMenu',
  components: {
    ProfileForm,
    AddButton,
    Avatar,
    AvatarGroup,
    DialogTitleBanner,
    ArchiveIcon
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
        // readonly: !this.isEditing,
        // flat: !this.isEditing,
        // appendIcon: this.isEditing ? '' ? 'mdi-delete' : 'mdi-pencil',
        hideDetails: true,
        placeholder: ' ',
        // class: !this.isEditing ? 'custom' : ''
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
    ...mapActions(['setProfileById', 'setDialog']),
    goArchive () {
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
