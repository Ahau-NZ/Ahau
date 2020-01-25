<template>
  <Dialog :show="show" @close="close">
    <v-form ref="form" v-model="form.valid" lazy-validation>
      <v-card>
        <v-card-text>
          <v-container class="ma-2">
            <v-row>
              <v-card-title>
                Add {{ type }} to {{ title }}
              </v-card-title>
            </v-row>
            <v-row>
              <v-col md="7">
                <v-row>
                  <v-col>
                    <v-text-field
                      v-model="data.preferredName"
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
                      v-model="data.legalName"
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
                      v-model="data.altNames[n-1]"
                      :rules="form.rules.name.preferred"
                      :label="`Alternative name ${n}`"
                      :placeholder="' '"
                      :hide-details="true"
                    />
                  </v-col>
                </v-row>
                <v-row>
                  <AddButton label="Add name" @click="toggleAltName" row/>
                </v-row>
                <v-row>
                  <v-col>
                    <NodeDatePicker
                      :rules="form.rules.bornAt"
                      :value="data.bornAt"
                      label="Date of birth"
                      @date="data.bornAt = $event"
                    />
                  </v-col>
                  <v-col>
                    <!-- <v-text-field
                      type="number"
                      label="Order of birth"
                      :placeholder="' '"
                      append-icon="mdi-chevron-down"
                      :hide-details="true"
                    /> -->
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
                      :value="data.diedAt"
                      @date="data.diedAt = $event"
                    />
                  </v-col>
                </v-row>
                <v-row>
                  <v-col md="6">
                    <v-row>
                      Gender
                    </v-row>
                    <v-row>
                      <v-radio-group v-model="data.gender" row>
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
                  <v-col md="4">
                    Related By
                    <v-select
                      v-model="data.relationshipType"
                      placeholder="birth"
                      :rules="form.rules.relationshipType"
                      :items="relationshipTypes"
                      :menu-props="{ light: true }"
                      append-icon="mdi-chevron-down"
                      :hide-details="true"
                    />
                  </v-col>
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
                      v-model="data.description"
                      :no-resize="true"
                    >
                    </v-textarea>
                  </v-col>
                </v-row>
              </v-col>
              <v-col>
                <v-row>
                  <Avatar size="200px" :image="data.avatarImage" :alt="data.preferredName" />
                </v-row>
                <v-row justify="center" align="center">
                  <clipper-upload accept="image/*" @input="toggleAvatar">
                    <v-btn v-if="!avatar.new" class="toggle" fab small color="white">
                      <v-icon class="black--text">mdi-pencil</v-icon>
                    </v-btn>
                    &nbsp; &nbsp; Upload profile photo
                  </clipper-upload>
                  <AvatarEditDialog :show="avatar.showEditor" :avatarImage="avatar.new" @submit="updateAvatar($event)" @close="toggleAvatar(null)"/>
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
import AddButton from '@/components/AddButton.vue'
import NodeDatePicker from '@/components/NodeDatePicker.vue'
import AvatarEditDialog from './AvatarEditDialog.vue'

import { GENDERS, RELATIONSHIPS, RULES, PERMITTED_PROFILE_ATTRS } from '@/lib/constants'
import isEmpty from 'lodash.isempty'

function defaultData () {
  return {
    preferredName: '',
    legalName: '',
    altNames: [],
    gender: 'female',
    relationshipType: 'birth',
    legallyAdopted: false,
    children: [],
    avatarImage: null,
    // title: '',
    bornAt: '',
    diedAt: '',
    description: ''
  }
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
    type: {
      type: String,
      default: 'a new person'
    },
    title: {
      type: String,
      default: 'this Whakapapa'
    }
  },
  data () {
    return {
      genders: GENDERS,
      relationshipTypes: RELATIONSHIPS,
      permitted: PERMITTED_PROFILE_ATTRS,
      data: defaultData(),
      avatar: {
        new: null,
        showEditor: false
      },
      isDeceased: false,
      showDescription: false,
      radios: 'radio-1',
      count: 0,
      form: {
        valid: true,
        rules: RULES
      }
    }
  },
  computed: {
    altNameCount () {
      return this.count
    },
    showLegallyAdopted () {
      switch (this.data.relationshipType) {
        case 'whangai': return true
        case 'adopted': return true
        default: return false
      }
    },
    submission () {
      let submission = {}
      Object.entries(this.data).map(([key, value]) => {
        if (!isEmpty(this.data[key])) {
          submission[key] = value
        }
      })
      return submission
    }
  },
  watch: {
    'data.relationshipType' (newValue, oldValue) {
      // make sure adoption status can't be set true when relationship type is birth
      if (newValue === 'birth') this.data.legallyAdopted = false
    },
    isDeceased (newValue) {
      if (newValue === false) {
        this.data.diedAt = ''
      }
    }
  },
  methods: {
    close: function () {
      this.$emit('close')
    },
    toggleAvatar (file) {
      this.avatar.new = this.avatar.new ? null : file
      this.avatar.showEditor = !this.avatar.showEditor
    },
    updateAvatar (avatarImage) {
      this.data.avatarImage = avatarImage
      this.toggleAvatar(null)
    },
    toggleAltName () {
      this.count += 1
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
      // send the data back to the parent component
      this.$emit('submit', submission)
      // close this dialog
      this.close()
    }
  }
}
</script>
