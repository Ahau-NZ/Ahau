<template>
  <Dialog :show="show" @close="close">
    <v-form ref="form" v-model="form.valid" lazy-validation>
      <v-card>
        <v-card-text>
          <v-container class="ma-2">
            <v-row>
              <v-card-title>{{ title }}</v-card-title>
            </v-row>
            <v-row>
              <v-col md="7">
                <v-row>
                  <v-col>
                    <v-text-field
                      v-model="formData.preferredName"
                      label="Preferred name. This is the name shown on your profile"
                      :placeholder="' '"
                      :rules="form.rules.name.preferred"
                      :hide-details="true"
                    ></v-text-field>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col>
                    <v-text-field
                      v-model="formData.legalName"
                      :rules="form.rules.name.legal"
                      label="Legal name"
                      :placeholder="' '"
                      :hide-details="true"
                    ></v-text-field>
                  </v-col>
                </v-row>
                <v-row v-for="n in altNameCount" :key="n">
                  <v-col>
                    <v-text-field
                      v-model="formData.altNames.add[n-1]"
                      :rules="form.rules.name.preferred"
                      :label="`Alternative name ${n}`"
                      :placeholder="' '"
                      :hide-details="true"
                    />
                  </v-col>
                </v-row>
                <v-row>
                  <AddButton label="Add name" @click="addAltNameField" row/>
                </v-row>
                <v-row>
                  <v-col>
                    <NodeDatePicker
                      :rules="form.rules.bornAt"
                      :value="formData.bornAt"
                      label="Date of birth"
                      @date="formData.bornAt = $event"
                    />
                  </v-col>
                  <v-col>
                    <v-text-field
                      v-model="formData.birthOrder"
                      type="number"
                      label="Order of birth"
                      :placeholder="' '"
                      append-icon="mdi-chevron-down"
                      :hide-details="true"
                      min="1"
                    />
                  </v-col>
                </v-row>
                <v-row>
                  <v-col md="6">
                    <v-checkbox v-model="isDeceased" label="No longer living"  :hide-details="true"/>
                  </v-col>
                  <v-col md="6">
                    <NodeDatePicker
                      v-if="isDeceased"
                      label="Date of death"
                      :value="formData.diedAt"
                      @date="formData.diedAt = $event"
                    />
                  </v-col>
                </v-row>
                <v-row>
                  <v-col md="6">
                    <v-row>
                      Gender
                    </v-row>
                    <v-row>
                      <v-radio-group v-model="formData.gender" row>
                        <v-radio v-for="(gender, index) in genders"
                          :key="index"
                          :value="gender"
                          :label="gender"
                          :hide-details="true"
                          class="pr-10"
                        />
                      </v-radio-group>
                    </v-row>
                  </v-col>
                  <v-col md="4" v-if="withRelationships">
                    Related By
                    <v-select
                      v-model="formData.relationshipType"
                      placeholder="birth"
                      :rules="form.rules.relationshipType"
                      :items="relationshipTypes"
                      :menu-props="{ light: true }"
                      append-icon="mdi-chevron-down"
                      :hide-details="true"
                    />

                    <v-col v-if="showLegallyAdopted">
                      <v-checkbox label="Legally Adopted" v-model="formData.legallyAdopted"/>
                    </v-col>
                  </v-col>
                  <v-col md="4" v-else />
                </v-row>
                <v-row v-if="!showDescription">
                  <AddButton label="Description" @click="toggleDescription" row/>
                </v-row>
                <v-row v-if="showDescription">
                  Description
                </v-row>
                <v-row v-if="showDescription">
                  <v-col>
                    <v-textarea
                      v-model="formData.description"
                      :no-resize="true"
                    >
                    </v-textarea>
                  </v-col>
                </v-row>
              </v-col>
              <v-col>
                <v-row>
                  <Avatar size="200px" :image="formData.avatarImage" :alt="formData.preferredName" :gender="formData.gender" :bornAt="formData.bornAt" />
                </v-row>
                <v-row justify="center" align="center">
                  <clipper-upload accept="image/*" @input="toggleAvatar">
                    <v-btn v-if="!avatar.new" class="toggle" fab small color="white">
                      <v-icon class="black--text">mdi-pencil</v-icon>
                    </v-btn>
                    &nbsp; &nbsp; Upload profile photo
                  </clipper-upload>
                  <AvatarEditDialog :show="avatar.showEditor" :avatarImage="avatar.new" :round="true"
                    @submit="updateAvatar($event)" @close="toggleAvatar(null)"
                  />
                </v-row>
              </v-col>
            </v-row>
            <v-row>
              <v-spacer/>
              <v-btn @click="close" text color="secondary" class="mr-4" >
                <v-icon>mdi-close</v-icon>
              </v-btn>
              <v-btn @click="submit" text color="blue" >
                <v-icon>mdi-check</v-icon>
              </v-btn>
            </v-row>
          </v-container>
        </v-card-text>
      </v-card>
    </v-form>
  </Dialog>
</template>

<script>
import Dialog from '@/components/Dialog.vue'
import Avatar from '@/components/Avatar.vue'
import AvatarEditDialog from './AvatarEditDialog.vue'
import NodeDatePicker from '@/components/NodeDatePicker.vue'
import AddButton from '@/components/AddButton.vue'

import { GENDERS, RELATIONSHIPS, RULES, PERMITTED_PROFILE_ATTRS } from '@/lib/constants'
import isEmpty from 'lodash.isempty'

function defaultForm (withRelationships) {
  const formData = {
    preferredName: '',
    legalName: '',
    altNames: {
      add: []
    },
    gender: '',
    relationshipType: 'birth',
    legallyAdopted: false,
    children: [],
    avatarImage: null,
    // title: '',
    bornAt: '',
    diedAt: '',
    birthOrder: '',
    description: ''
  }

  if (!withRelationships) {
    delete formData.relationshipType
    delete formData.legallyAdopted
  }

  return formData
}

export default {
  name: 'NewNodeDialog',
  components: {
    Dialog,
    Avatar,
    NodeDatePicker,
    AddButton,
    AvatarEditDialog
  },
  props: {
    show: {
      type: Boolean,
      required: true
    },
    withRelationships: {
      type: Boolean,
      default: true
    },
    title: {
      type: String,
      default: 'Create a new person'
    }
  },
  data () {
    return {
      genders: GENDERS,
      relationshipTypes: RELATIONSHIPS,
      permitted: PERMITTED_PROFILE_ATTRS,
      formData: defaultForm(this.withRelationships),
      avatar: {
        new: null,
        showEditor: false
      },
      isDeceased: false,
      showDescription: false,
      radios: 'radio-1',
      altNameCount: 0,
      form: {
        valid: true,
        rules: RULES
      }
    }
  },
  computed: {
    showLegallyAdopted () {
      switch (this.formData.relationshipType) {
        case 'whangai': return true
        case 'adopted': return true
        default: return false
      }
    },
    submission () {
      let submission = {}
      Object.entries(this.formData).map(([key, value]) => {
        if (!isEmpty(this.formData[key])) {
          if (key === 'birthOrder') {
            submission[key] = parseInt(value)
          } else {
            submission[key] = value
          }
        }
      })
      return submission
    }
  },
  watch: {
    'formData.relationshipType' (newValue, oldValue) {
      // make sure adoption status can't be set true when relationship type is birth
      if (newValue === 'birth') this.formData.legallyAdopted = false
    },
    isDeceased (newValue) {
      if (newValue === false) {
        this.formData.diedAt = ''
      }
    }
  },
  methods: {
    close: function () {
      // reset the form properties
      // this.formData = defaultForm()
      // TODO: figure out when is a good time to reset these?

      this.$emit('close')
    },
    toggleAvatar (file) {
      this.avatar.new = this.avatar.new ? null : file
      this.avatar.showEditor = !this.avatar.showEditor
    },
    updateAvatar (avatarImage) {
      this.formData.avatarImage = avatarImage
      this.toggleAvatar(null)
    },
    addAltNameField () {
      this.altNameCount += 1
    },
    toggleDescription () {
      this.showDescription = true
    },
    submit () {
      if (!this.$refs.form.validate()) {
        alert('Empty form cannot be submitted')
        console.log('not submitted')
        return
      }

      var submission = Object.assign({}, this.submission)
      // send the formData back to the parent component
      this.$emit('submit', submission)
      // close this dialog
      this.close()
    }
  }
}
</script>
