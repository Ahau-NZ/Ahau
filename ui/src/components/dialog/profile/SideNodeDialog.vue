<template>
  <transition v-if="profile" appear :name="mobile ? 'up' : 'left'">
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
            <!-- Displays the form to edit the profile fields -->
            <v-col class="py-0">
              <ProfileForm :profile.sync="formData"
                isSideViewDialog
                isEditing
                :readonly="!isEditing"
                :fullForm='fullForm'
                :mobile="mobile"
                @cancel="cancel" >
                <template v-slot:top>
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
            <v-col cols="12" :class="mobile ? 'px-0':'py-0'">
              <v-divider/>
            </v-col>
            <v-col v-if="parents.length" cols="12" :class="mobile ? 'px-0':'py-0'">
              <EditRelationships
                type="parent"
                :label="t('parents')"
                :profiles="parents"
                @updateLink="updateChildLink"
                @removeLink="deleteChildLink"
              />
              <v-divider/>
            </v-col>
            <v-col v-if="partners.length" cols="12" :class="mobile ? 'px-0':'py-0'">
              <EditRelationships
                type="partner"
                :label="t('partners')"
                :profiles="partners"
                @removeLink="deletePartnerLink"
              />
              <v-divider/>
            </v-col>
            <v-col v-if="children.length" cols="12" :class="mobile ? 'px-0':'py-0'">
              <EditRelationships
                type="child"
                :label="t('children')"
                :profiles="children"
                @updateLink="updateChildLink"
                @removeLink="deleteChildLink"
              />
            </v-col>
          </v-row>

          <v-row v-if="isEditing">
            <!-- Displays delete profile button (if editing and allowed to delete) -->
            <v-col cols="12" sm="auto" v-if="isDeletable">
              <v-btn
                @click="$emit('delete')"
                align="center"
                color="white"
                text
                class="secondary--text"
              >
                <v-icon class="secondary--text" left>mdi-delete</v-icon>{{ t('deletePerson') }}
              </v-btn>
            </v-col>

            <!-- Displays the save/cancel buttons when editing the profile -->
            <v-col
              cols="12"
              :align="mobile ? '' : 'right'"
              class="pt-0 d-flex justify-space-between"
            >
              <v-btn @click="cancel" text large fab class="secondary--text">
                {{ t('cancel') }}
              </v-btn>
              <v-btn @click="submit" text large fab class="blue--text" color="blue">
                {{ t('save') }}
              </v-btn>
            </v-col>
          </v-row>

          <!-- Displays the profile avatar when viewing the profile -->
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

          <!-- Displays the profile name -->
          <v-row v-if="!isEditing" class="justify-center">
            <h1 >{{ getDisplayName(formData) }}</h1>
          </v-row>

          <!-- Displays buttons to edit or navigate to this profiles archive -->
          <v-row v-if="!isEditing"  class="justify-center pt-3">
            <v-btn
              @click.native="goArchive"
              color="white"
              text
              medium
              class="blue--text"
              v-if="showStoriesButton"
            >
              <ArchiveIcon size="normal" color="blue"/>
              <span class="pl-2 "> {{ t('stories') }} </span>
            </v-btn>
            <v-btn
              v-if="!preview && (profile.canEdit || isAdminProfile)"
              @click="toggleEdit"
              color="white"
              text
              medium
              class="blue--text"
            >
              <v-icon small class="blue--text" left>mdi-pencil</v-icon>{{ t('edit') }}
            </v-btn>
          </v-row>

          <!-- Displays the profiles description when viewing the profile -->
          <v-row v-if="formData.description && !isEditing" class="mx-2 pb-2">
            <v-col cols="12" class="pt-0">
              <v-row>
                <v-col class="py-1 px-0 profile-label overline"><small>{{ t('description') }}</small></v-col>
              </v-row>
              <v-row class="py-0 justify-center">
                <p class="ma-0 profile-info" style="font-size: 0.8em">{{formData.description}}</p>
              </v-row>
            </v-col>
          </v-row>

          <!-- Displays profile information when viewing! -->
          <v-row v-if="!isEditing"  class="flex-column mx-0 ">
            <v-col class="pa-0">
              <v-col cols="12" :class="profile.description ? 'pt-0':'pt-0'">
                <v-row cols="12" class="rounded-border mb-4">
                  <ProfileInfoItem class="pb-0 bb" mdCols="12" smCols="12" :title="t('fullName')" :value="profile.legalName"/>
                  <ProfileInfoItem class="pb-0 br bb" mdCols="6" smCols="6" :title="t('otherNames')" :value="profile.altNames && profile.altNames.join(', ')"/>
                  <ProfileInfoItem class="pb-0 bb" mdCols="6" smCols="6" :title="t('age')" :value="age(formData.aliveInterval)"/>
                  <ProfileInfoItem class="pb-0 br" mdCols="6" smCols="6" :title="t('city')" :value="formData.city"/>
                  <ProfileInfoItem class="pb-0" mdCols="6" smCols="6" :title="t('country')" :value="formData.country"/>
                </v-row>
                <v-row cols="12" class="rounded-border mb-4">
                  <ProfileInfoItem :class="profile.deceased ? 'pb-0 bb br':'pb-0'" :title="t('placeOfBirth')" :mdCols="profile.deceased ? '6':'12'" :smCols="profile.deceased ? '6':'12'" :value="profile.placeOfBirth" />
                  <template v-if="profile.deceased">
                    <ProfileInfoItem class="pb-0 bb" :title="t('placeOfPassing')" mdCols="6" smCols="6" :value="profile.placeOfDeath" />
                    <ProfileInfoItem class="pb-0 br" :title="t('dateOfPassing')" mdCols="6" smCols="6" :value="diedAt" />
                    <ProfileInfoItem class="pb-0" :title="t('buriedLocation')" mdCols="6" smCols="6" :value="profile.buriedLocation" />
                  </template>
                </v-row>
                <v-row cols="12" class="rounded-border">
                  <ProfileInfoItem class="bb pb-0" mdCols="12" smCols="12"  :title="t('profession')" :value="formData.profession"/>
                  <ProfileInfoItem class="br pb-0" mdCols="6" smCols="6" :title="t('schools')" :value="formData.school && formData.school.join('\n')"/>
                  <ProfileInfoItem class="pb-0" mdCols="6" smCols="6" :title="t('skills')" :value="formData.school && formData.education.join('\n')"/>
                </v-row>
                <v-row v-if="isKaitiaki" class="d-flex flex-column justify-center align-center">
                  <v-card-subtitle>
                    {{ t('contactInfoText') }}
                  </v-card-subtitle>
                </v-row>
                <v-row v-if="isKaitiaki" cols="12" class="rounded-border">
                  <ProfileInfoItem class="bb pb-0" mdCols="12" smCols="12"  :title="t('address')" :value="formData.address"/>
                  <ProfileInfoItem class="pb-0 bb" mdCols="12" smCols="12" :title="t('postcode')" :value="formData.postCode"/>
                  <ProfileInfoItem class="bb pb-0" mdCols="12" smCols="12"  :title="t('phone')" :value="formData.phone"/>
                  <ProfileInfoItem class="pb-0"  mdCols="12" smCols="12" :title="t('email')" :value="formData.email"/>
                </v-row>
              </v-col>
            </v-col>
          </v-row>

          <!-- Displays whanau when viewing the profile -->
          <v-row v-if="!isEditing"  class="px-2">
            <v-col cols="12" class="border-right">
              <v-row class="d-flex flex-column justify-center align-center">

                <!-- Displays a row of parents -->
                <v-col :cols="12" class="pa-0">
                  <AvatarGroup
                    :profiles="parents"
                    :group-title="t('parents')"
                    size="50px"
                    :show-labels="true"
                    @profile-click="openProfile"
                  >
                    <template v-slot:action>
                      <AddButton v-if="!preview && profile.canEdit" @click="toggleNew('parent')" class="pb-4" justify="start"/>
                    </template>
                  </AvatarGroup>
                </v-col>

                <hr v-if="parents" class="family-divider"/>

                <!-- Displays a row of partners -->
                <v-col :cols="12" class="pa-0">
                  <AvatarGroup
                    :profiles="partners"
                    :group-title="t('partners')"
                    size="50px"
                    :show-labels="true"
                    @profile-click="openProfile"
                  >
                    <template v-slot:action >
                      <AddButton v-if="!preview && profile.canEdit" @click="toggleNew('partner')" class="pb-4" justify="start"/>
                    </template>
                  </AvatarGroup>
                </v-col>

                <hr class="family-divider"/>

                <!-- Displays a row of siblings -->
                <v-col :cols="12" v-if="parents.length && siblings.length" class="pa-0">
                  <AvatarGroup
                    :profiles="siblings"
                    :group-title="t('siblings')"
                    size="60px"
                    :show-labels="true"
                    @profile-click="openProfile"
                  >
                  <template v-slot:action v-if="!preview && view && view.focus !== profile.id">
                    <AddButton @click="toggleNew('sibling')" class="pb-4" justify="start"/>
                  </template>
                  </AvatarGroup>
                </v-col>

                <hr v-if="parents.length && siblings.length" class="family-divider"/>

                <!-- Displays a row of children -->
                <v-col :cols="12" class="pa-0">
                  <AvatarGroup
                    :profiles="children"
                    :group-title="t('children')"
                    size="60px"
                    :show-labels="true"
                    @profile-click="openProfile"
                  >
                    <template v-slot:action>
                      <AddButton v-if="!preview && profile.canEdit" @click="toggleNew('child')" class="pb-4" justify="start"/>
                    </template>
                  </AvatarGroup>
                </v-col>

                <!-- Displays who contributed the profile -->
                <hr v-if="authors" class="family-divider"/>
                <v-col v-if="authors" :cols="12" class="pa-0">
                  <AvatarGroup
                    :profiles="authors"
                    :group-title="t('contributedBy')"
                    size="60px"
                    :show-labels="true"
                    @profile-click="openProfile"
                  />
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
import { mapMutations, mapActions, mapGetters } from 'vuex'
import isEqual from 'lodash.isequal'
import isEmpty from 'lodash.isempty'
import pick from 'lodash.pick'
import clone from 'lodash.clonedeep'

import ProfileInfoItem from '@/components/profile/ProfileInfoItem.vue'
import ProfileForm from '@/components/profile/ProfileForm.vue'
import Avatar from '@/components/Avatar.vue'
import AvatarGroup from '@/components/AvatarGroup.vue'
import AddButton from '@/components/button/AddButton.vue'
import DialogTitleBanner from '@/components/dialog/DialogTitleBanner.vue'
import ArchiveIcon from '@/components/button/ArchiveIcon.vue'
import EditRelationships from '@/components/profile/EditRelationships.vue'

import calculateAge from '@/lib/calculate-age'
import { ACCESS_KAITIAKI } from '@/lib/constants.js'
import { getDisplayName, PERMITTED_PERSON_ATTRS, PERMITTED_RELATIONSHIP_ATTRS } from '@/lib/person-helpers'
import { parseInterval, dateToString } from '@/lib/date-helpers.js'

function arrayEquals (a, b) {
  return (
    Array.isArray(a) &&
    Array.isArray(b) &&
    a.length === b.length &&
    a.every((val, index) => val === b[index])
  )
}

function defaultData (profile) {
  return {
    ...clone(profile),
    altNames: {
      currentState: clone(profile.altNames),
      add: [], // new altNames to add
      remove: [] // altNames to remove
    }
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
    ProfileInfoItem,
    EditRelationships
  },
  props: {
    /* required */
    profileId: { type: String, required: true },
    show: { type: Boolean, required: true },

    /* optional */
    view: { type: Object },
    readonly: { type: Boolean, default: false },
    editing: { type: Boolean, default: false },
    fullForm: { type: Boolean, default: false },
    deleteable: { type: Boolean, default: false },
    preview: { type: Boolean, default: false }
  },
  mounted () {
    this.loadPersonFull(this.profileId)
    this.loadFamilyLinks(this.profileId)
  },
  data () {
    return {
      formData: {},
      showDescription: false,
      drawer: false,
      authors: [],
      allowRemoveChildren: false,
      isEditing: this.editing
    }
  },
  computed: {
    ...mapGetters(['isKaitiaki', 'currentAccess', 'isMyProfile']),
    ...mapGetters('tribe', ['tribeSettings']),
    ...mapGetters('person', ['person']),
    ...mapGetters('whakapapa', [
      'getRawParentIds', 'getRawChildIds', 'getRawPartnerIds',
      'getPartnerType'
    ]),
    isDeletable () {
      return (
        this.deleteable &&

        // protects us from deleting a profile we cant
        // mainly owned profiles
        this.profile.canEdit &&

        // not one of your personal profiles
        !this.isMyProfile(this.profileId)
      )
    },
    profile () {
      return this.person(this.profileId)
    },
    parents () {
      return this.getRawParentIds(this.profileId)
        .map(this.findOrLoadProfile)
        .filter(Boolean)
    },
    children () {
      return this.getRawChildIds(this.profileId)
        .map(this.findOrLoadProfile)
        .filter(Boolean)
    },
    partners () {
      return this.getRawPartnerIds(this.profileId)
        .filter(partnerId => this.getPartnerType(this.profileId, partnerId) === 'partners') // dont include inferred partners
        .map(this.findOrLoadProfile)
        .filter(Boolean)
    },
    siblings () {
      const childIds = this.getRawParentIds(this.profileId)
        .flatMap(parentId => this.getRawChildIds(parentId))

      const childIdSet = new Set(childIds)
      childIdSet.delete(this.profileId)

      return Array.from(childIdSet)
        .map(this.findOrLoadProfile)
        .filter(Boolean)
    },
    scopedProfile () {
      if (this.profile && this.profile.adminProfile) {
        const ignoreList = new Set(['id', 'type', 'recps', '__typename'])
        const profile = { ...this.profile }
        const adminProfile = profile.adminProfile
        delete profile.adminProfile

        for (const field in adminProfile) {
          if (ignoreList.has(field)) continue
          if (adminProfile[field] === null) continue
          if (Array.isArray(adminProfile[field]) && adminProfile[field].length === 0) continue

          profile[field] = adminProfile[field]
        }
        profile.adminProfileId = this.profile.adminProfile.id

        return profile
      }

      return this.profile
    },
    isAdminProfile () {
      return this.profile && this.profile.adminProfile
    },
    showStoriesButton () {
      return (
        this.currentAccess.type !== ACCESS_KAITIAKI &&
        (this.tribeSettings && this.tribeSettings.allowStories)
      )
    },
    mobile () {
      return this.$vuetify.breakpoint.xs
    },
    diedAt () {
      if (this.scopedProfile.aliveInterval) {
        const date = this.scopedProfile.aliveInterval.split('/')
        return dateToString(date[1], this.monthTranslations)
      }
      return null
    },
    profileChanges () {
      const changes = {}

      Object.entries(this.formData).forEach(([key, value]) => {
        if (['school', 'education'].includes(key)) {
          if (!arrayEquals(this.formData[key], this.profile[key])) {
            changes[key] = value
          }
        } else if (!isEqual(this.formData[key], this.scopedProfile[key])) {
          switch (key) {
            case 'altNames':
              if (!isEqual(this.formData.altNames.add, this.scopedProfile.altNames)) {
                changes[key] = pick(this.formData.altNames, ['add', 'remove'])
                changes[key].add = changes[key].add.filter(Boolean)
              }
              break
            case 'birthOrder':
              changes[key] = parseInt(value)
              break
            case 'relationshipType':
              if (value && value !== this.scopedProfile.relationshipType) {
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
    scopedProfile: {
      deep: true,
      immediate: true,
      async handler (profile) {
        if (!profile) return
        this.formData = defaultData(profile)
        if (profile.originalAuthor) {
          // TODO cherese 8/3/22 move to graphql and change from using getProfile
          // it doesnt need to whole profile
          const originalAuthor = await this.getProfile(profile.originalAuthor)
          this.authors = [originalAuthor]
        }
      }
    }
  },
  methods: {
    ...mapMutations(['updateDialog']),
    ...mapActions('archive', ['setIsFromWhakapapaShow']),
    ...mapActions('profile', ['getProfile']),
    ...mapActions('whakapapa', ['getLink', 'saveLink', 'addLinks', 'deleteChildLink', 'deletePartnerLink', 'loadFamilyLinks']),
    ...mapActions('person', ['setSelectedProfileById', 'updatePerson', 'loadPersonFull', 'loadPersonMinimal']),
    getDisplayName,
    monthTranslations (key, vars) {
      return this.$t('months.' + key, vars)
    },
    findOrLoadProfile (profileId) {
      const profile = this.person(profileId)
      if (!profile) this.loadPersonMinimal(profileId)
      // HACK - make sure profile is loaded

      return profile
    },
    async updateChildLink ({ parent, child, relationshipType, legallyAdopted }) {
      const _link = await this.getLink({ parent, child, isPartner: false })
      if (!_link) throw new Error('No linkId to update this link!')

      await this.saveLink({ linkId: _link.linkId, relationshipType, legallyAdopted })

      this.addLinks({
        childLinks: [{ parent, child, relationshipType }]
      })
    },
    goArchive () {
      if (
        this.$route.name === 'person/whakapapa/:whakapapaId' ||
        this.$route.name === 'community/whakapapa/:whakapapaId'
      ) this.setIsFromWhakapapaShow(true)
      this.$router.push({
        name: 'person/archive',
        params: {
          tribeId: this.$route.params.tribeId,
          profileId: this.scopedProfile.id
        }
      }).catch(() => {})
    },
    age (born) {
      const age = calculateAge(born)
      if (age || age === 0) {
        return age.toString()
      }
      return age
    },
    async openProfile (profile) {
      this.updateDialog(null, null)
      await this.setSelectedProfileById(profile.id)
      this.updateDialog('view-edit-node', null)
    },
    cordovaBackButton () {
      this.close()
    },
    close () {
      this.$emit('close')
    },
    cancel () {
      // reset form values
      this.formData = defaultData(this.scopedProfile)
      this.toggleEdit()
      this.$emit('cancel')
    },
    async submit () {
      const output = Object.assign({}, pick(this.profileChanges, [...PERMITTED_PERSON_ATTRS, ...PERMITTED_RELATIONSHIP_ATTRS]))

      if (!isEmpty(output)) await this.processUpdate(output)

      this.formData = defaultData(this.scopedProfile)
      this.toggleEdit()
    },
    async processUpdate (input) {
      if (input.recps) delete input.recps

      // update their profile in the db
      await this.updatePerson({ id: this.profileId, ...input })

      // loads their full profile for changes in the tree as well as the side node dialog
      await this.loadPersonFull(this.profileId)
      this.$root.$emit('PersonListSave')
    },
    toggleNew (type) {
      this.$emit('new', type)
    },
    toggleEdit () {
      this.isEditing = !this.isEditing
    },
    t (key, vars) {
      return this.$t('sideProfile.' + key, vars)
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

// ::-webkit-scrollbar{
//   display:none;
// }

::-webkit-scrollbar {
  width: 6px;
  height: 8px;
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
