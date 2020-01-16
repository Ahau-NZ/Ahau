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
              <v-col>
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
                    required
                  ></v-text-field>
                </v-row>
                <v-row>
                  <AddButton label="Add name" @click="" row/>
                </v-row>
                <v-row>
                  <v-col>
                    <NodeDatePicker
                      :required="true"
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
                      append-icon="mdi-chevron-down"
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
                      <v-radio-group row>
                        <v-radio v-for="(gender, index) in genders" :key="index" :label="gender"/>
                      </v-radio-group>
                    </v-row>
                  </v-col>
                </v-row>
                <v-row>
                  <AddButton label="Description" @click="" row/>
                </v-row>
              </v-col>
              <v-col>
                <Avatar class="mr-4" size="100px" v-if="data.avatarImage" :image="data.avatarImage" :alt="data.preferredName" />
                <clipper-upload accept="image/*" @input="toggleAvatar">
                  <v-btn v-if="!avatar.new" class="toggle" fab color="white">
                    <v-icon class="black--text">mdi-camera</v-icon>
                  </v-btn>
                  <span class="caption pt-4 pl-4">Upload profile photo</span>
                </clipper-upload>








              </v-col>
            </v-row>
            <v-row>
              <v-spacer/>
              <v-btn @click="" text color="secondary" class="mr-4" >
                <v-icon>mdi-close</v-icon>
              </v-btn>
              <v-btn @click="" text color="blue" >
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
import gql from 'graphql-tag'
import Dialog from '@/components/Dialog.vue'
import Avatar from '@/components/Avatar.vue'
import AddButton from '@/components/AddButton.vue'
import NodeDatePicker from '@/components/NodeDatePicker.vue'
import { GENDERS, RELATIONSHIPS, RULES } from '@/lib/constants'

function defaultData () {
  return {
    preferredName: '',
    legalName: '',
    gender: '',
    relationshipType: '',
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
    AddButton

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
      data: defaultData(),
      avatar: {
        new: null,
        showEditor: false,
        rotation: 0
      },
      isDeceased: false,
      altNameCount: 0,
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
    async handleImageUpload () {
      try {
        const canvas = this.$refs.avatar.clip({ maxWPixel: 1920 })
        canvas.toBlob(async blob => {
          const file = new File([blob], 'avatar', { type: blob.type })

          const result = await this.$apollo.mutate({
            mutation: gql`mutation uploadFile($file: Upload!) {
              uploadFile(file: $file) {
                blob
                mimeType
                uri
              }
            }`,
            variables: {
              file
            }
          })

          if (result.errors) throw result.errors

          let cleanImage = {}
          Object.entries(result.data.uploadFile).forEach(([key, value]) => {
            if (key !== '__typename') cleanImage[key] = value
          })
          this.data.avatarImage = cleanImage

          this.avatar.new = null
          this.avatar.showEditor = false
        })
      } catch (error) {
        throw error
      }
    },
    submit () {
      if (!this.$refs.form.validate()) {
        return
      }

      const submission = Object.assign({}, this.data)
      if (!submission.avatarImage) {
        delete submission.avatarImage
      }

      // send the data back to the parent component
      this.$emit('submit', submission)

      // close this dialog
      this.close()
    }
  }
}
</script>
