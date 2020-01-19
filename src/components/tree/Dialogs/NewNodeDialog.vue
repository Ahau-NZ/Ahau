<template>
  <Dialog :show="show" @close="close">
    <v-form ref="form"
      v-model="form.valid"
      lazy-validation
    >
      <v-card>
        <v-card-text>
          <v-container>
            <v-row>
              <v-card-title>
                Add {{ type }} to {{ title }}
              </v-card-title>
            </v-row>
            <v-row>
              <v-col md="7">
                <v-row>
                  <v-text-field
                    v-model="data.preferredName"
                    label="Preferred name. This is the name shown on your profile"
                    :placeholder="' '"
                    :rules="form.rules.name.preferred"
                    required
                  ></v-text-field>
                </v-row>
                <v-row>
                  <v-text-field
                    v-model="data.legalName"
                    :rules="form.rules.name.legal"
                    label="Legal name"
                    :placeholder="' '"

                  ></v-text-field>
                </v-row>
                <v-row>
                  <AddButton label="Add name" @click="" row/>
                </v-row>
                <v-row>
                  <v-col>
                    <NodeDatePicker

                      :rules="form.rules.date.birth"
                      :value="data.bornAt"
                      label="Date of birth"
                      @date="data.bornAt = $event"
                    />
                  </v-col>
                  <v-col>
                    <v-text-field
                      type="number"
                      label="Order of birth"
                      :placeholder="' '"
                      append-icon="mdi-arrow-up-down"
                    />
                  </v-col>
                </v-row>
                <v-row>
                  <v-col>
                    <v-checkbox v-model="isDeceased" label="No longer living"/>
                  </v-col>
                  <v-col>
                    <NodeDatePicker
                      :makeDisabled="!isDeceased"
                      label="Date of death"
                      :value="data.diedAt"
                      @date="data.diedAt = $event"
                    />
                  </v-col>
                </v-row>
                <v-row>
                  <v-col>
                    <v-row>
                      Genders
                    </v-row>
                    <v-row>
                      <v-radio-group v-model="radios" row>
                        <v-radio v-for="(gender, index) in genders"
                          :key="index"
                          :value="`radio-${index}`"
                          :label="gender"
                        />
                      </v-radio-group>
                    </v-row>
                  </v-col>
                  <v-col>
                    Related By
                    <v-select
                      v-model="data.relationshipType"
                      placeholder="birth"
                      :rules="form.rules.relationshipType"
                      :items="relationshipTypes"
                      :menu-props="{ light: true }"
                      append-icon="mdi-chevron-down"
                    />
                  </v-col>
                </v-row>
                <v-row>
                  <AddButton label="Description" @click="" row/>
                </v-row>
              </v-col>
              <v-col>
                <v-row>
                  <Avatar size="200px" :image="data.avatarImage" :alt="data.preferredName" />
                </v-row>
                <v-row justify="center" align="center">
                  <!--<v-btn
                    fab
                    small
                  >
                  <v-icon>mdi-pencil</v-icon>
                  </v-btn>-->
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
    gender: 'female',
    relationshipType: 'birth',
    legallyAdopted: false,
    children: [],
    avatarImage: null,
    // title: '',
    bornAt: '',
    diedAt: ''
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
      radios: 'radio-1',
      form: {
        valid: true,
        rules: RULES
      }
    }
  },
  computed: {
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
    }
  },
  methods: {
    close: function () {
      // reset the form properties
      // TODO: figure out when is a good time to reset these?
      this.data = defaultData()

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
