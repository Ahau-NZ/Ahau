<template>
  <div>
    <Dialog :show="show" @close="close">
      <v-form ref="form"
        v-model="form.valid"
        lazy-validation
      >
        <v-card>
          <v-card-text>
            <v-container light>
              <v-row>
                <v-card-title>
                  <h3>
                    Add DialogType to SelectedNode
                  </h3>
                </v-card-title>
              </v-row>
              <v-row>
                <v-col md="8">
                  <v-text-field
                    v-model="data.preferredName"
                    label="Preferred name. This is the name shown on your profile"
                    :placeholder="' '"
                    :rules="form.rules.name.preferred"
                    required
                  ></v-text-field>
                </v-col>
              </v-row>

                <v-col cols="4" sm="12" md="5">
                  <v-row class="py-4 d-flex column align-center">
                    <Avatar class="mr-4" size="100px" v-if="data.avatarImage" :image="data.avatarImage" :alt="data.preferredName" />
                    <clipper-upload accept="image/*" @input="toggleAvatar">
                      <v-btn v-if="!avatar.new" class="toggle" fab color="white">
                        <v-icon class="black--text">mdi-camera</v-icon>
                      </v-btn>
                      <span class="caption pt-4 pl-4">Upload profile photo</span>
                    </clipper-upload>
                  </v-row>
                </v-col>
              <v-row>
                <v-col md="8">
                  <v-text-field
                    v-model="data.legalName"
                    :rules="form.rules.name.legal"
                    label="Legal name"
                    :placeholder="' '"
                    required
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-row>
                <v-col md="2">
                  <AddButton label="Add name" @click="" :row="true"/>
                </v-col>
              </v-row>

              <v-row justify="center" align="center">
                <v-col md="4">
                  <NodeDatePicker
                    :required="true"
                    :rules="form.rules.date.birth"
                    :value="data.bornAt"
                    label="Date of birth"
                    @date="data.bornAt = $event"
                  />
                </v-col>
                <v-col md="4">
                  <v-text-field
                    type="number"
                    label="Order of birth"
                    :placeholder="' '"
                    append-icon="mdi-chevron-down"
                  />
                </v-col>
                <v-spacer/>
                <!-- <v-col cols="12" sm="5" md="3"> -->
                <!--   <v-select label="Title*" -->
                <!--     :items="titles" -->
                <!--     v-model="data.title" -->
                <!--     :rules="form.rules.title" -->
                <!--     required -->
                <!--   ></v-select> -->
                <!-- </v-col> -->
              </v-row>
              <v-row justify="center" align="center">
                <v-col md="4" >
                  <v-radio label="No longer living"/>
                </v-col>
                <v-col md=4>
                  <NodeDatePicker
                    label="Date of death"
                    :value="data.diedAt"
                    @date="data.diedAt = $event"
                  />
                </v-col>
                <v-spacer/>
              </v-row>
              <v-row>
                <v-col cols="12" sm="5" md="3">
                  <v-select label="Relationship Type*"
                    v-model="data.relationshipType"
                    :rules="form.rules.relationshipType"
                    :items="relationshipTypes"
                    required
                  ></v-select>
                </v-col>
                <v-col v-if="showLegallyAdopted">
                  <v-checkbox label="Legally Adopted" v-model="data.legallyAdopted"/>
                </v-col>
              </v-row>

              <v-row class="actions">
                <v-col cols="12" sm="5" md="9">
                  <small>*indicates required field</small>
                </v-col>
                <v-col>
                  <v-btn @click="close" fab text color="secondary" class="mr-4">
                    <v-icon>mdi-cancel</v-icon>
                  </v-btn>
                  <v-btn @click="submit" :disabled="!form.valid"
                    fab text color="success" class="mr-4">
                    <v-icon>mdi-check</v-icon>
                  </v-btn>
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>
        </v-card>
      </v-form>
    </Dialog>

    <Dialog :show='avatar.showEditor'>
      <v-container style="background: black;">

        <v-row justify="center">
          <v-col style="max-width: 600px;">
            <clipper-fixed
              ref="avatar"
              :grid="false"
              :src="avatar.new"
              :area="100"
              bg-color="rgba(0, 0, 0, 0)"
              :round="true"
              shadow="rgba(0,0,0,0.5)"
              :rotate="avatar.rotation"
            />
          </v-col>
        </v-row>

        <div class="px-8 py-4">
          <h6 class="caption pt-8"><v-icon>mdi-gesture-tap-hold</v-icon> Ajust the image by zooming, scaling and moving it around before saving.</h6>
          <h5 class="pt-8">rotate</h5>
          <clipper-range v-model="avatar.rotation" style="max-width:300px" :min="0" :max="360"></clipper-range>

          <v-row class="actions py-6">
            <v-btn @click="toggleAvatar(null)" text color="secondary" class="mr-4" >
              <v-icon>mdi-close</v-icon>
            </v-btn>
            <v-btn @click="handleImageUpload()" text color="secondary" >
              <v-icon>mdi-check</v-icon>
            </v-btn>
          </v-row>

        </div>
      </v-container>
    </Dialog>
  </div>
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
