<template>
  <transition v-if="profile" appear :name="mobile ? 'up' : 'left'">
    <v-navigation-drawer
      :style="mobile ? preview ? 'top: -7px ' : 'top: -64px;' : 'top: 64px;'"
      v-model="drawer"
      :absolute="mobile"
      :fixed="!mobile"
      :right="!mobile"
      light
      :width="fullscreen ? '100%' : '320px'"
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
              <ProfileForm
                :profile.sync="formData"
                isSideViewDialog
                isEditing
                show-custom-fields
                :readonly="!isEditing"
                :fullForm="fullForm"
                :mobile="mobile"
                @cancel="cancel"
              >
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

          <v-row v-if="isEditing && !canSubmit">
            <v-col cols="12" :class="mobile ? 'px-0' : 'py-0'">
              <v-divider/>
            </v-col>
            <v-col v-if="parents.length" cols="12" :class="mobile ? 'px-0' : 'py-0'">
              <EditRelationships
                type="parent"
                :label="t('parents')"
                :profiles="parents"
                @updateLink="updateChildLink"
                @removeLink="deleteChildLink"
              />
              <v-divider/>
            </v-col>
            <v-col v-if="partners.length" cols="12" :class="mobile ? 'px-0' : 'py-0'">
              <EditRelationships
                type="partner"
                :label="t('partners')"
                :profiles="partners"
                @removeLink="deletePartnerLink"
              />
              <v-divider/>
            </v-col>
            <v-col v-if="children.length" cols="12" :class="mobile ? 'px-0' : 'py-0'">
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
            <v-col cols="12" sm="auto" v-if="isDeletable && !canSubmit">
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
            <!-- Displays textbox for user comment when in a submit only whakapapa-->
            <v-col v-if="canSubmit" cols="12" sm="12" class="pa-1" >
              <!-- Comment textarea -->
              <v-textarea
                v-model="comment"
                label="Add a comment"
                outlined
                hide-details
                placeholder=" "
                no-resize
                :rows="3"
                auto-grow
                class="px-5 pt-4"
              />
            </v-col>

            <v-col
              cols="12"
              :align="mobile ? '' : 'right'"
              class="pt-0 d-flex justify-space-between"
            >
              <v-btn @click="cancel" text large class="secondary--text">
                {{ t('cancel') }}
              </v-btn>

              <v-btn @click="processUpdatePerson" text large class="blue--text" color="blue" :loading="isLoadingProfile">
                {{ canSubmit ? t('submit') : t('save')}}
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
          <v-row v-if="!isEditing" class="flex-column mx-0 ">
            <v-col class="pa-0">
              <v-col cols="12" class="pt-0">
                <v-row cols="12" class="rounded-border mb-4">
                  <ProfileInfoItem v-if="hasDefaultField('legalName')" class="pb-0 bb" mdCols="12" smCols="12" :title="t('fullName')" :value="profile.legalName"/>
                  <ProfileInfoItem v-if="hasDefaultField('altNames')" class="pb-0 br bb" mdCols="6" smCols="6" :title="t('otherNames')" :value="profile.altNames"/>
                  <ProfileInfoItem :class="{ 'pb-0': true, bb: hasDefaultField('city') || hasDefaultField('country') }" mdCols="6" smCols="6" :title="t('age')" :value="age(formData.aliveInterval)"/>
                  <ProfileInfoItem v-if="hasDefaultField('postCode')" class="pb-0 bb" mdCols="12" smCols="12" :title="t('postcode')" :value="formData.postCode"/>
                  <ProfileInfoItem v-if="hasDefaultField('city')" class="pb-0 br" mdCols="6" smCols="6" :title="t('city')" :value="formData.city"/>
                  <ProfileInfoItem v-if="hasDefaultField('country')" class="pb-0" mdCols="6" smCols="6" :title="t('country')" :value="formData.country"/>
                </v-row>
                <v-row cols="12" v-if="hasDefaultField('isDeceased') && profile.deceased" class="rounded-border mb-4">
                  <ProfileInfoItem v-if="hasDefaultField('isDeceased')" :class="profile.deceased ? 'pb-0 bb br' : 'pb-0'" :title="t('placeOfBirth')" :mdCols="profile.deceased ? '6' : '12'" :smCols="profile.deceased ? '6' : '12'" :value="profile.placeOfBirth" />
                  <template v-if="hasDefaultField('isDeceased') && profile.deceased">
                    <ProfileInfoItem v-if="hasDefaultField('placeOfDeath')" class="pb-0 bb" :title="t('placeOfPassing')" mdCols="6" smCols="6" :value="profile.placeOfDeath" />
                    <ProfileInfoItem class="pb-0 br" :title="t('dateOfPassing')" mdCols="6" smCols="6" :value="diedAt" />
                    <ProfileInfoItem v-if="hasDefaultField('buriedLocation')" class="pb-0" :title="t('buriedLocation')" mdCols="6" smCols="6" :value="profile.buriedLocation" />
                  </template>
                </v-row>
                <v-row cols="12" v-if="hasOneField(['profession', 'education', 'school'])" class="rounded-border">
                  <ProfileInfoItem v-if="hasDefaultField('profession')" class="bb pb-0" mdCols="12" smCols="12"  :title="t('profession')" :value="formData.profession"/>
                  <ProfileInfoItem v-if="hasDefaultField('education')" class="br pb-0" mdCols="6" smCols="6" :title="t('schools')" :value="formData.school && formData.school.join('\n')"/>
                  <ProfileInfoItem v-if="hasDefaultField('school')" class="pb-0" mdCols="6" smCols="6" :title="t('skills')" :value="formData.education && formData.education.join('\n')"/>
                </v-row>
                <v-row v-if="isKaitiaki && hasOneField(['address', 'phone', 'email'])" class="d-flex flex-column justify-center align-center">
                  <v-card-subtitle>
                    {{ t('contactInfoText') }}
                  </v-card-subtitle>
                </v-row>
                <v-row v-if="isKaitiaki && hasOneField(['address', 'phone', 'email'])" cols="12" class="rounded-border">
                  <ProfileInfoItem v-if="hasDefaultField('address')" class="bb pb-0" mdCols="12" smCols="12"  :title="t('address')" :value="formData.address"/>
                  <ProfileInfoItem v-if="hasDefaultField('phone')" class="pb-0 bb" mdCols="12" smCols="12"  :title="t('phone')" :value="formData.phone"/>
                  <ProfileInfoItem v-if="hasDefaultField('email')" class="pb-0"  mdCols="12" smCols="12" :title="t('email')" :value="formData.email"/>
                </v-row>
                <v-row v-if="tribeCustomFields.length" class="d-flex flex-column justify-center align-center">
                  <v-card-subtitle>
                    {{ t('customFieldText') }}
                  </v-card-subtitle>
                </v-row>
                <v-row v-if="tribeCustomFields.length" cols="12" class="rounded-border">
                  <ProfileInfoItem
                    v-for="(fieldDef, i) in tribeCustomFields" :key="i"
                    class="pb-0 bb"
                    smCols="12"
                    mdCols="12"
                    :title="fieldDef.label"
                    :value="getFieldValue(fieldDef)"
                  />
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
                    <template v-slot:action v-if="!canSubmit">
                      <AddButton v-if="!preview && profile.canEdit" @click="toggleNew('parent')" class="pb-4" justify="start"/>
                    </template>
                  </AvatarGroup>
                </v-col>

                <hr class="family-divider"/>

                <!-- Displays a row of partners -->
                <v-col :cols="12" class="pa-0">
                  <AvatarGroup
                    :profiles="partners"
                    :group-title="t('partners')"
                    size="50px"
                    :show-labels="true"
                    @profile-click="openProfile"
                  >
                    <template v-slot:action v-if="!canSubmit">
                      <AddButton v-if="!preview && profile.canEdit" @click="toggleNew('partner')" class="pb-4" justify="start"/>
                    </template>
                  </AvatarGroup>
                </v-col>

                <hr class="family-divider"/>

                <!-- Displays a row of siblings -->
                <v-col :cols="12" v-if="parents.length" class="pa-0">
                  <AvatarGroup
                    :profiles="siblings"
                    :group-title="t('siblings')"
                    size="60px"
                    :show-labels="true"
                    @profile-click="openProfile"
                  >
                  <template v-slot:action v-if="!preview && view && view.focus !== profile.id && !canSubmit">
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
                    <template v-slot:action v-if="!canSubmit">
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
import get from 'lodash.get'

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
import { getDefaultFieldValue, getCustomFieldChanges, mapPropToLabel } from '@/lib/custom-field-helpers.js'

function arrayEquals (a, b) {
  return (
    Array.isArray(a) &&
    Array.isArray(b) &&
    a.length === b.length &&
    a.every((val, index) => val === b[index])
  )
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
  data () {
    return {
      formData: {},
      showDescription: false,
      drawer: false,
      authors: [],
      comment: '',
      allowRemoveChildren: false,
      isEditing: this.editing
    }
  },
  computed: {
    ...mapGetters('alerts', ['alertSettings']),
    ...mapGetters(['isKaitiaki', 'currentAccess', 'isMyProfile', 'whoami']),
    ...mapGetters('tribe', ['currentTribe', 'tribeSettings', 'tribeCustomFields', 'tribeDefaultFields']),
    ...mapGetters('person', ['person']),
    ...mapGetters('whakapapa', [
      'getRawParentIds', 'getRawChildIds', 'getRawPartnerIds',
      'getPartnerType', 'whakapapaView'
    ]),
    isLoadingProfile () {
      return this.alertSettings.delay === -1
    },
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
    customFieldValues () {
      if (!this.profile?.customFields) return []

      return (Array.isArray(this.profile.customFields))
        ? this.profile?.customFields
        : Object.entries(this.profile?.customFields).map(([key, value]) => ({ key, value }))
    },
    adminCustomFieldValues () {
      if (!this.profile?.adminProfile?.customFields) return []

      return Array.isArray(this.profile.adminProfile.customFields)
        ? this.profile.adminProfile.customFields
        : Object.entries(this.profile.adminProfile).map(([key, value]) => ({ key, value }))
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
      let profile = clone(this.profile)

      if (profile && profile.adminProfile) {
        const _profile = profile.adminProfile
        delete _profile.adminProfile

        profile = this.mergeProfiles(profile, _profile)
        profile.adminProfileId = this.profile.adminProfile.id
      } else if (this.isMyProfile(this.profile.id)) {
        profile = this.mergeProfiles(profile, this.whoami.personal.profile)
      }

      return profile
    },
    isAdminProfile () {
      return this.profile && this.profile.adminProfile
    },
    showStoriesButton () {
      if (!this.currentAccess) return false

      return (
        this.currentAccess.type !== ACCESS_KAITIAKI &&
        (this.tribeSettings && this.tribeSettings.allowStories)
      )
    },
    mobile () {
      return this.$vuetify.breakpoint.xs
    },
    fullscreen () {
      return this.mobile || this.$vuetify.breakpoint.sm
    },
    diedAt () {
      if (this.scopedProfile.aliveInterval) {
        const date = this.scopedProfile.aliveInterval.split('/')
        return dateToString(date[1], this.monthTranslations)
      }
      return null
    },
    canSubmit () {
      return !this.isKaitiaki && this.whakapapaView.permission === 'submit'
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
    profileId: {
      immediate: true,
      handler (newVal) {
        this.loadProfile()
      }
    },
    scopedProfile: {
      deep: true,
      async handler (profile) {
        if (!profile) return
        this.formData = this.defaultData()

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
    ...mapMutations(['updateDialog', 'updateType']),
    ...mapMutations('archive', ['setIsFromWhakapapaShow', 'setIsFromPersonIndex']),
    ...mapActions('alerts', ['showAlert']),
    ...mapActions('profile', ['getProfile']),
    ...mapActions('whakapapa', ['getLink', 'saveLink', 'addLinks', 'deleteChildLink', 'deletePartnerLink', 'loadFamilyLinks']),
    ...mapActions('person', ['setSelectedProfileById', 'updatePerson', 'loadPersonFull', 'loadPersonMinimal', 'loadPersonAndWhanau', 'personListUpdate']),
    ...mapActions('submissions', ['proposeEditGroupPerson']),
    getDisplayName,
    async loadProfile () {
      if (this.$route.name === 'personIndex') {
        const profile = await this.loadPersonAndWhanau(this.profileId)
        if (profile.parents.length) {
          profile.parents.forEach(parent => {
            this.loadFamilyLinks(parent.id)
          })
        }
      } else {
        this.loadPersonFull(this.profileId)
      }
      this.loadFamilyLinks(this.profileId)
    },
    monthTranslations (key, vars) {
      return this.$t('months.' + key, vars)
    },
    defaultData () {
      const profile = clone(this.scopedProfile)
      return {
        ...profile,
        altNames: {
          currentState: clone(profile.altNames),
          add: [], // new altNames to add
          remove: [] // altNames to remove
        }
      }
    },
    hasDefaultField (key) {
      const label = mapPropToLabel(key)

      if (!label) return

      // find in defaultCustomFields
      return this.tribeDefaultFields.some(field => field.label === label)
    },
    hasOneField (keys) {
      return keys.some(key => this.hasDefaultField(key))
    },
    getProfileChanges  () {
      const changes = {}

      Object.entries(this.formData).forEach(([key, value]) => {
        if (['school', 'education'].includes(key)) {
          if (!arrayEquals(this.formData[key], this.profile[key])) {
            changes[key] = value
          }
        } else if (key === 'customFields') {
          const customFields = getCustomFieldChanges(
            clone(this.profile[key]),
            clone(this.formData[key][this.currentTribe.id]),
            this.tribeCustomFields
          )

          if (!isEmpty(customFields)) {
            changes[key] = customFields
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
    getFieldValue (fieldDef) {
      // TODO: cherese 23/02/23
      // NOTE: i dont like this monkey patching, but there is a lot of logic here around profiles and how they are loading,
      // that it is going to take longer if i take that route
      // The problem i have here is that initially the custom fields are an array
      // but for some reason, after a reload (like when saving changes to the profile)
      // the customFields then become an object. So here i am monkey patching to turn it
      // back into an array
      const findThisField = field => field.key === fieldDef.key
      // find the value from the applicants profile (if there is one)

      // first we look if the field is on the adminProfile
      let field = this.adminCustomFieldValues?.find(findThisField)
      const fallbackField = this.customFieldValues?.find(findThisField)

      if (!field) field = fallbackField

      if (isEmpty(field?.value) && !isEmpty(fallbackField?.value)) field = fallbackField
      if (!field) field = { value: getDefaultFieldValue(fieldDef) }

      switch (fieldDef.type) {
        case 'array':
          if (get(field, 'value.length')) return field.value.join(', ')
          return ''
        case 'list':
          if (fieldDef.multiple) return field.value.join(', ')
          else return field.value
        case 'checkbox':
          if (field.value) return 'yes'
          else return 'no'
        default:
          return field.value || ''
      }
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
      else if (this.$route.name === 'personIndex') this.setIsFromPersonIndex(true)
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
      if (this.preview) {
        this.updateDialog('view-edit-person')
        this.updateType('preview')
      } else this.updateDialog('view-edit-person')
    },
    cordovaBackButton () {
      this.close()
    },
    close () {
      this.$emit('close')
    },
    cancel () {
      // reset form values
      this.formData = this.defaultData()
      this.toggleEdit()
      this.$emit('cancel')
    },
    async processUpdatePerson () {
      const profileChanges = this.getProfileChanges()

      const output = pick(profileChanges, [...PERMITTED_PERSON_ATTRS, ...PERMITTED_RELATIONSHIP_ATTRS])
      if (!isEmpty(output)) {
        // Submiting request to edit the profile
        if (this.canSubmit) {
          await this.processSubmission(output)
          this.showAlert({ message: 'Submission sent', color: 'green' })
        } else {
          await this.processUpdate(output)
          // handle reload
          this.showAlert({ message: 'Profile updated', color: 'green' })
        }
      } else {
        this.showAlert({ message: 'No changes were submitted', color: 'green' })
      }

      this.handleReload()
    },
    async processUpdate (input) {
      this.showAlert({ message: 'Submitting Changes...', color: 'green', delay: -1 })
      if (input.recps) delete input.recps

      if (this.isMyProfile(this.profileId) && input.customFields) {
        // update separately to prevent bulk update

        await this.updatePerson({ id: this.profileId, customFields: input.customFields })
        delete input.customFields
      }

      // exclude empty altNames from submission
      this.formatAltnames(input)

      // update their profile in the db
      if (!isEmpty(input)) await this.updatePerson({ id: this.profileId, ...input })

      // loads their full profile for changes in the tree as well as the side node dialog
      const profile = await this.loadPersonFull(this.profileId)
      this.personListUpdate(profile)
    },
    async processSubmission (input) {
      this.showAlert({ message: 'Submitting changes for review', color: 'green', delay: -1 })
      if (input.recps) delete input.recps

      // exclude empty altNames from submission
      this.formatAltnames(input)

      // create the submission
      if (!isEmpty(input)) await this.proposeEditGroupPerson({ profileId: this.profileId, input, comment: this.comment })
    },
    formatAltnames (input) {
      if (input.altNames) {
        if (!get(input, 'altNames.add.length')) delete input.altNames.add
        if (!get(input, 'altNames.remove.length')) delete input.altNames.remove
        if (isEmpty(input.altNames)) delete input.altNames
      }
    },
    handleReload () {
      this.formData = this.defaultData()
      this.toggleEdit()
    },
    toggleNew (type) {
      this.$emit('new', type)
    },
    toggleEdit () {
      this.isEditing = !this.isEditing
    },
    t (key, vars) {
      return this.$t('sideProfile.' + key, vars)
    },
    mergeProfiles (profile, _profile) {
      const ignoreList = new Set(['id', 'type', 'recps', '__typename'])

      for (const field in _profile) {
        if (ignoreList.has(field)) continue
        if (_profile[field] === null) continue
        if (Array.isArray(_profile[field]) && _profile[field].length === 0) continue
        if (field === 'customFields') {
          profile[field] = { ...profile[field], ..._profile[field] }
        } else {
          profile[field] = _profile[field]
        }
      }
      return profile
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

.custom.v-text-field > .v-input__control > .v-input__slot:before {
  border-style: none;
}
.custom.v-text-field > .v-input__control > .v-input__slot:after {
  border-style: none;
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
