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
            <!-- Displays the form to edit the profile fields -->
            <v-col class="py-0">
              <ProfileForm :profile.sync="formData" :readonly="!isEditing" :mobile="mobile" @cancel="cancel" isEditing isSideViewDialog>
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
            <!-- Displays delete profile button (if editing and allowed to delete) -->
            <v-col cols="12" sm="auto" v-if="!isAdminProfile">
              <v-btn
                v-if="deleteable"
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

          <v-row v-if="isEditing">
            <v-col cols="12" :class="mobile ? 'px-0':'py-0'">
              <v-divider/>
            </v-col>
            <v-col v-if="profile.parents.length" cols="12" :class="mobile ? 'px-0':'py-0'">
              <EditRelationships
                :label="t('parents')"
                :profiles="profile.parents"
                sideDialog
                @edit="updateLink($event, 'parent')"
                @remove="removeLink($event, 'parent')"
              />
              <v-divider/>
            </v-col>
            <v-col v-if="partners.length" cols="12" :class="mobile ? 'px-0':'py-0'">
              <EditRelationships
                :label="t('partners')"
                :profiles="partners"
                sideDialog
                @remove="removeLink($event, 'partner')"
              />
              <v-divider/>
            </v-col>
            <v-col v-if="profile.children.length" cols="12" :class="mobile ? 'px-0':'py-0'">
              <EditRelationships
                :label="t('children')"
                :profiles="profile.children"
                sideDialog
                @edit="updateLink($event, 'child')"
                @remove="removeLink($event, 'child')"
              />
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
                  <ProfileInfoItem class="pb-0 br bb" mdCols="6" smCols="6" :title="t('otherNames')" :value="profile.altNames.join(', ')"/>
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
                  <ProfileInfoItem class="br pb-0" mdCols="6" smCols="6" :title="t('schools')" :value="formData.school.join('\n')"/>
                  <ProfileInfoItem class="pb-0" mdCols="6" smCols="6" :title="t('skills')" :value="formData.education.join('\n')"/>
                </v-row>
                <v-row v-if="isKaitiaki && isAdminProfile" class="d-flex flex-column justify-center align-center">
                  <v-card-subtitle>
                    {{ t('contactInfoText') }}
                  </v-card-subtitle>
                </v-row>
                <v-row v-if="isKaitiaki && isAdminProfile" cols="12" class="rounded-border">
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
                    :profiles="profile.parents"
                    :group-title="t('parents')"
                    size="50px"
                    :show-labels="true"
                    @profile-click="openProfile($event)"
                  >
                    <template v-slot:action>
                      <AddButton v-if="!preview && profile.canEdit" @click="toggleNew('parent')" class="pb-4" justify="start"/>
                    </template>
                  </AvatarGroup>
                </v-col>

                <hr v-if="profile.parents" class="family-divider"/>

                <!-- Displays a row of partners -->
                <v-col v-if="partners" :cols="12" class="pa-0">
                  <AvatarGroup
                    :profiles="partners"
                    :group-title="t('partners')"
                    size="50px"
                    :show-labels="true"
                    @profile-click="openProfile($event)"
                  >
                    <template v-slot:action >
                      <AddButton v-if="!preview && profile.canEdit" @click="toggleNew('partner')" class="pb-4" justify="start"/>
                    </template>
                  </AvatarGroup>
                </v-col>

                <hr v-if="partners" class="family-divider"/>

                <!-- Displays a row of siblings -->
                <v-col :cols="12" v-if="profile.parents && profile.parents.length && profile.siblings" class="pa-0">
                  <AvatarGroup
                    :profiles="profile.siblings"
                    :group-title="t('siblings')"
                    size="60px"
                    :show-labels="true"
                    @profile-click="openProfile($event)"
                  >
                  <template v-slot:action v-if="!preview && view && view.focus !== profile.id">
                    <AddButton @click="toggleNew('sibling')" class="pb-4" justify="start"/>
                  </template>
                  </AvatarGroup>
                </v-col>

                <hr v-if="profile.parents && profile.parents.length && profile.siblings" class="family-divider"/>

                <!-- Displays a row of children -->
                <v-col :cols="12" class="pa-0">
                  <AvatarGroup
                    :profiles="profile.children && profile.children.length ? profile.children : profile._children"
                    :group-title="t('children')"
                    size="60px"
                    :show-labels="true"
                    @profile-click="openProfile($event)"
                    @delete="removeLink(profile.children[$event])"
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
                    @profile-click="openProfile($event)"
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
import { mapActions, mapGetters } from 'vuex'
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

import calculateAge from '../../../lib/calculate-age'
import { ACCESS_KAITIAKI } from '@/lib/constants.js'
import { PERMITTED_PERSON_ATTRS, PERMITTED_RELATIONSHIP_ATTRS } from '@/lib/person-helpers'
import { parseInterval, dateToString } from '@/lib/date-helpers.js'
import { getDisplayName } from '@/lib/person-helpers.js'
import mapProfileMixins from '@/mixins/profile-mixins.js'

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
    relationshipType: profile.relationshipType,
    legallyAdoped: profile.legallyAdopted,
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
    ProfileInfoItem,
    EditRelationships
  },
  props: {
    profile: { type: Object, default: () => {} },
    deleteable: { type: Boolean, default: false },
    view: { type: Object },
    show: { type: Boolean, required: true },
    readonly: { type: Boolean, default: false },
    preview: { type: Boolean, default: false }
  },
  mixins: [
    mapProfileMixins({ mapMethods: ['getProfile', 'getWhakapapaLink', 'saveLink'] })
  ],
  data () {
    return {
      isEditing: false,
      formData: {},
      showDescription: false,
      drawer: false,
      authors: [],
      allowRemoveChildren: false
    }
  },
  computed: {
    ...mapGetters(['isKaitiaki', 'currentAccess']),
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
      return this.currentAccess.type !== ACCESS_KAITIAKI
    },
    mobile () {
      return this.$vuetify.breakpoint.xs
    },
    diedAt () {
      if (this.scopedProfile.aliveInterval) {
        var date = this.scopedProfile.aliveInterval.split('/')
        return dateToString(date[1], this.monthTranslations)
      }
      return null
    },
    profileChanges () {
      let changes = {}

      Object.entries(this.formData).forEach(([key, value]) => {
        if (!isEqual(this.formData[key], this.scopedProfile[key])) {
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
    },
    partners () {
      return this.profile.partners.filter(partner => !partner.isNonPartner)
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
      handler (newVal) {
        if (!newVal) return
        this.formData = defaultData(newVal)
        this.getOriginalAuthor()
      }
    }
  },
  methods: {
    ...mapActions(['setDialog']),
    ...mapActions('archive', ['setIsFromWhakapapaShow']),
    ...mapActions('person', ['setProfileById']),
    getDisplayName,
    async getOriginalAuthor () {
      // TODO cherese 22-04-21 move to graphql
      const originalAuthor = await this.getProfile(this.scopedProfile.originalAuthor)
      this.authors = [originalAuthor]
    },
    monthTranslations (key, vars) {
      return this.$t('months.' + key, vars)
    },
    async updateLink (person, type) {
      if (type !== 'parent' && type !== 'child') {
        console.error('Cannot update a link that isnt a parent or child link')
        return
      }

      if (type === 'parent') {
        await this.updateLinkedPerson(person.id, this.scopedProfile.id, person.relationshipType)
      } else {
        await this.updateLinkedPerson(this.scopedProfile.id, person.id, person.relationshipType)
      }

      // this is needed to reload the whakapapa
      // TODO: this could be slow for larger whakapapa!
      this.$emit('reload-whakapapa')
    },
    async removeLink (person, type) {
      var isPartner = type === 'partner'
      let link
      if (type === 'parent') link = await this.removeLinkedPerson(person.id, this.scopedProfile.id)
      else link = await this.removeLinkedPerson(this.scopedProfile.id, person.id, isPartner)

      if (isPartner) person.isPartner = true

      this.$emit('delete-link', { link, mainProfileId: this.scopedProfile.id })
    },
    async updateLinkedPerson (parent, child, relationshipType) {
      const { linkId } = await this.getWhakapapaLink(parent, child)
      if (!linkId) throw new Error('No linkId to update this link!')

      let input = {
        type: 'link/profile-profile/child',
        linkId,
        relationshipType
      }

      await this.saveLink(input)
    },
    async removeLinkedPerson (parent, child, isPartner) {
      const link = await this.getWhakapapaLink(parent, child, isPartner)

      if (!link || !link.linkId) throw new Error('No linkId to remove this link!')

      let input = {
        linkId: link.linkId,
        tombstone: {
          date: new Date().toISOString().slice(0, 10),
          reason: 'user deleted link'
        }
      }

      await this.saveLink(input)
      this.$emit('submit', {}) // needed to reload this dialog

      return link
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
      var age = calculateAge(born)
      if (age || age === 0) {
        return age.toString()
      }
      return age
    },
    openProfile (profile) {
      this.setProfileById({ id: profile.id })
      this.setDialog({ active: 'view-edit-node' })
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
    },
    submit () {
      var output = Object.assign({}, pick(this.profileChanges, [...PERMITTED_PERSON_ATTRS, ...PERMITTED_RELATIONSHIP_ATTRS]))

      if (!isEmpty(output)) {
        if (this.profile.adminProfile) output.id = this.profile.adminProfile.id

        this.$emit('submit', output)
      }

      this.formData = defaultData(this.scopedProfile)
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
