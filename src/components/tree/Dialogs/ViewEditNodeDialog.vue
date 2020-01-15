<template>
  <Dialog :node="profile" :show="show" @close="close">
    <v-form ref="form"
      v-model="form.valid"
    >
      <v-card>
        <v-container width="100%">
          <v-card-text>
            <v-row>
              <v-col md="8">
                <h1 v-if="!isEditting">
                  Profile Overview
                </h1>
                <h1 v-else>
                  Edit {{ profile.preferredName }}
                </h1>
              </v-col>
              <v-spacer/>
              <v-col md="2">
                <v-fab-transition>
                  <v-btn
                    @click="activeButton.action"
                    :key="activeButton.icon"
                    align="center"
                    color="white"
                    text
                    large
                    :class="activeButton.class"
                  >
                    <v-icon :class="activeButton.class" left>{{ activeButton.icon }}</v-icon>
                    {{ activeButton.label }}
                  </v-btn>
                </v-fab-transition>
              </v-col>
              <v-col v-if="!isEditting" md="1" class="ma-0 pa-0 pl-2">
                <v-btn @click="close" fab text large color="secondary">
                  <v-icon>mdi-close</v-icon>
                </v-btn>
              </v-col>
              <v-spacer v-else/>
            </v-row>
            <v-row>
              <v-col md="7">
                <v-row>
                  <!--<v-col v-if="data.title" class="pa-0" md="3">
                    <v-select
                      :label="data.title"
                      :disabled="toggled"
                      flat
                      solo
                      :append-icon="!toggled ? '$dropdown' : ''"
                      :items="titles"
                    >
                    </v-select>
                  </v-col>-->
                  <v-col class="pa-0" md="3">
                    <v-select
                      v-model="data.gender"
                      :disabled="!isEditting"
                      :items="genders"
                      flat
                      solo
                      :append-icon="isEditting ? '$dropdown' : ''"
                    >
                    </v-select>
                  </v-col>
                  <v-col class="pa-0" md="3">
                    <NodeDatePicker
                      required
                      :label="data.bornAt"
                      @date="data.bornAt = $event"
                      :makeDisabled="!isEditting"
                    />
                  </v-col>
                  <v-col class="pa-0" md="3"> <!-- TODO: replace living with data when its available -->
                    <v-select
                      label="living"
                      :disabled="!isEditting"
                      flat
                      solo
                      :append-icon="isEditting ? '$dropdown' : ''"
                    >
                    </v-select>
                  </v-col>
                  <v-spacer/>
                </v-row>
                <v-row>
                    <small class="pa-0"> Preferred Name. This is the name that will show on the Whakapapa</small>
                </v-row>
                <v-row>
                  <v-col class="pa-0">
                    <v-card-title class="pa-0">
                      <v-text-field class="pl-3"
                        v-model="data.preferredName"
                        :rules="form.rules.name.preferred"
                        required
                        :readonly="!isEditting"
                        :flat="!isEditting"
                        :solo="!isEditting"
                        :append-icon="isEditting ? 'mdi-pencil' : ''"
                        :hide-details="!isEditting"
                      >
                      </v-text-field>
                    </v-card-title>
                  </v-col>
                </v-row>
                <v-row>
                  <small class="pa-0"> Legal Name</small>
                </v-row>
                <v-row>
                  <v-col class="pa-0">
                    <v-card-title class="pa-0">
                      <v-text-field class="pl-3"
                        v-model="data.legalName"
                        :rules="form.rules.name.legal"
                        required
                        :readonly="!isEditting"
                        :flat="!isEditting"
                        :solo="!isEditting"
                        :append-icon="isEditting ? 'mdi-pencil' : ''"
                        :hide-details="!isEditting"
                      >
                      </v-text-field>
                    </v-card-title>
                  </v-col>
                </v-row>
                <v-row v-if="data.description || isEditting">
                  <small class="pa-0">Description</small>
                </v-row>
                <v-row v-if="data.description || isEditting">
                  <v-col class="pa-0">
                      <v-textarea class="pl-3"
                        v-model="data.description"
                        :readonly="!isEditting"
                        :flat="!isEditting"
                        :solo="!isEditting"
                        :no-resize="true"
                        :hide-details="!isEditting"
                        :append-icon="isEditting ? 'mdi-pencil' : ''"
                      >
                      </v-textarea>
                  </v-col>
                </v-row>
              </v-col>
              <v-divider :vertical="true"></v-divider>
              <v-col class="ml-10" md="4">
              <v-row>
                <v-spacer/>
                <v-col>
                  <Avatar class="justify-center align-center" size="250px" :image="profile.avatarImage" :alt="profile.preferredName" :gender="profile.gender" />
                </v-col>
                <v-spacer/>
              </v-row>
              </v-col>
            </v-row>
            <v-divider/>
            <v-row>
              <v-col>
                <AvatarGroup :show-labels="true" :profiles="parents" group-title="Parents" button-label="Add Parent" @button-click="toggleNew('parent')"/>
              </v-col>
              <v-divider v-if="hasSiblings" :vertical="true"></v-divider>
              <v-col v-if="hasSiblings">
                <AvatarGroup :show-labels="true" :profiles="siblings" group-title="Sibling"/>
              </v-col>
              <v-divider :vertical="true"/>
              <v-col>
                <AvatarGroup :show-labels="true" :profiles="children" group-title="Children" button-label="Add Child" @button-click="toggleNew('child')"/>
              </v-col>
            </v-row>
            <v-divider />
            <v-row v-if="isEditting">
              <v-spacer/>
              <v-col md="3">
                <v-btn @click="close"
                  text
                  large
                  fab
                  class="secondary--text"
                >
                  <v-icon color="secondary">mdi-close</v-icon>
                </v-btn>
                <v-btn @click="submit"
                  :disabled="hasChanges"
                  text
                  x-large
                  fab
                  class="blue--text"
                >
                  <v-icon color="blue">mdi-check</v-icon>
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>
        </v-container>
      </v-card>
    </v-form>
    <DeleteNodeDialog v-if="deleteDialog" :show="deleteDialog" :name="profile.preferredName"
      close="toggleDelete" @submit="deleteProfile()"
    />
  </Dialog>
</template>

<script>
import Dialog from '@/components/Dialog.vue'
import Avatar from '@/components/Avatar.vue'
import AvatarGroup from '@/components/AvatarGroup.vue'
import { GENDERS, RULES, PERMITTED_PROFILE_ATTRS } from '@/lib/constants'
import DeleteNodeDialog from '@/components/tree/Dialogs/DeleteNodeDialog.vue'
import NodeDatePicker from '@/components/NodeDatePicker.vue'

import isEqual from 'lodash.isequal'
import pick from 'lodash.pick'

export default {
  name: 'ViewEditNodeDialog',
  components: {
    Dialog,
    Avatar,
    AvatarGroup,
    DeleteNodeDialog,
    NodeDatePicker
  },
  props: {
    show: { type: Boolean, required: true },
    profile: { type: Object, required: true }
  },
  data () {
    return {
      genders: GENDERS,
      // titles: TITLES,
      permitted: PERMITTED_PROFILE_ATTRS,
      isEditting: false,
      data: {
        id: this.profile.id,
        gender: this.profile.gender,
        legalName: this.profile.legalName,
        bornAt: this.profile.bornAt,
        preferredName: this.profile.preferredName,
        avatarImage: this.profile.avatarImage,
        description: this.profile.description
      },
      deleteDialog: false,
      form: {
        valid: true,
        rules: RULES
      }
    }
  },
  computed: {
    activeButton () {
      switch (!this.isEditting) {
        case true: return {
          icon: 'mdi-pencil',
          class: 'blue--text',
          label: 'Edit this Person',
          action: this.toggleEdit
        }
        case false: return {
          icon: 'mdi-delete',
          class: 'secondary--text',
          label: 'Delete this Person',
          action: this.toggleDelete
        }
        default: return {}
      }
    },
    profileChanges () {
      let changes = {}
      Object.entries(this.data).map(([key, value]) => {
        if (this.data[key] !== this.profile[key]) {
          changes[key] = value
        }
      })
      return changes
    },
    hasChanges () {
      return isEqual(this.data, this.profile)
    },
    hasSiblings () {
      return this.siblings ? this.siblings.length > 0 : false
    },
    parents () {
      return this.profile.parents
    },
    siblings () {
      return this.profile.siblings
    },
    children () {
      return this.profile.children
    }
  },
  methods: {
    close () {
      this.$emit('close')
    },
    submit () {
      if (!this.$refs.form.validate()) return

      var output = Object.assign({}, pick(this.profileChanges, this.permitted))
      this.$emit('submit', output)
      this.close()
    },
    toggleNew (type) {
      this.$emit('new', type)
    },
    toggleEdit () {
      this.isEditting = !this.isEditting
    },
    toggleDelete () {
      this.deleteDialog = !this.deleteDialog
    },
    deleteProfile () {
      this.$emit('delete')
      this.toggleDelete()
      this.close()
    }
  }
}
</script>
