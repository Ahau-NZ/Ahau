<template>
  <div>
  <Dialog :show="show" @close="close">
    <v-form ref="form" v-model="form.valid" lazy-validation>
      <v-card>
        <v-card-title>
          <span class="headline"> {{text || 'Create a new Whakapapa record'}} </span>
        </v-card-title>

        <v-card-text>
          <v-container light>

            <v-row class="d-flex">

              <!-- left col -->
              <v-col cols="7" md="7" sm="12">

                <v-row>
                  <v-col cols="12" sm="12" md="12">
                    <v-text-field label="Name*"
                      v-model="formData.name"
                      :rules="form.rules.name.whakapapaView"
                      hint="The name you'll remember this record by"
                      required
                    ></v-text-field>
                  </v-col>
                </v-row>

                <v-row>
                  <v-col cols="12" sm="12" md="12">
                    <v-textarea label="Description"
                      v-model="formData.description"
                      hint="Some more context or info about this record"
                      required
                    ></v-textarea>
                  </v-col>
                </v-row>
                <v-row class="d-flex flex-column">
                  <div class="black--text">Would you like to start with :</div>
                  <v-radio-group v-model="formData.focus">
                    <v-radio
                      :label="`Yourself`"
                      value="self"
                    ></v-radio>
                    <v-radio
                      :label="`Another person`"
                      value="new"
                    ></v-radio>
                  </v-radio-group>
                </v-row>
              </v-col>

              <!-- right col -->
              <v-col cols="5" md="5" sm="12">
                <!-- Whakapapa image upload -->
                <v-col cols="12" md="12" sm="12">
                  <v-row class="py-4 d-flex flex-column align-start justify-start">
                    <div v-if="formData.image" class="mr-4 mb-2">
                      <img :src="formData.image.uri" style="width: 250px; height: 250px;" />
                    </div>
                    <!--
                      <Avatar class="mr-4" size="100px" v-if="formData.image" :image="formData.image" :alt="formData.preferredName" />
                      TODO maybe make this not always round
                    -->

                    <clipper-upload accept="image/*" @input="toggleImage">
                      <v-btn v-if="!image.new" class="toggle" fab color="white">
                        <v-icon class="black--text">mdi-camera</v-icon>
                      </v-btn>
                      <span class="caption pt-4 pl-4">Upload whakapapa image</span>
                    </clipper-upload>
                  </v-row>
                </v-col>
                <!-- /Whakapapa image upload -->
              </v-col>

            </v-row>

            <v-row class="actions">
              <v-col cols="12" sm="5" md="9">
                <small>*indicates required field</small>
              </v-col>

              <v-col class='lock-icon' cols="12" sm="5" md="9">
                <v-icon medium color='#555'>mdi-lock</v-icon>
                <span id='lock-icon-margin'>Private record - Only visible by you</span>
              </v-col>

              <v-col>
                <v-btn @click="close" fab text color="secondary" class="mr-4">
                  <v-icon>mdi-cancel</v-icon>
                </v-btn>
                <v-btn @click="submit" :disabled="!form.valid" fab text color="success" class="mr-4">
                  <v-icon>mdi-check</v-icon>
                </v-btn>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>

      </v-card>
    </v-form>
  </Dialog>

  <AvatarEditDialog :show="image.showEditor" :avatarImage="image.new" :round="false"
    @close="toggleImage(null)" @submit="handleNewImage($event)" />
  </div>
</template>

<script>
import Dialog from '@/components/Dialog.vue'
import AvatarEditDialog from '@/components/tree/Dialogs/AvatarEditDialog.vue'
import { RULES } from '@/lib/constants'

function defaultData () {
  return {
    name: '',
    description: '',
    mode: 'descendants',
    focus: 'self',
    image: null
  }
}

export default {
  name: 'NewViewDialog',
  props: {
    text: String,
    show: {
      type: Boolean,
      required: true
    }
  },
  data () {
    return {
      formData: defaultData(),
      form: {
        valid: true,
        rules: RULES
      },
      image: {
        new: null,
        showEditor: false
      },
      width: '400px'
    }
  },
  methods: {
    close: function () {
      // reset the form properties
      this.formData = defaultData()

      this.$emit('close')
    },
    submit () {
      if (!this.$refs.form.validate()) {
        console.log('----> not validated')
        return
      }

      // send the data back to the parent component
      this.$emit('submit', this.formData)

      // close this dialog
      this.close()
    },
    toggleImage (file) {
      this.image.new = this.image.new ? null : file
      this.image.showEditor = !this.image.showEditor
    },
    handleNewImage (cleanImage) {
      this.formData.image = cleanImage

      this.image.new = null
      this.image.showEditor = false
    }
  },
  components: {
    AvatarEditDialog,
    Dialog
  }
}
</script>

<style scoped lang="scss">
  @import '~vue-context/dist/css/vue-context.css';

  .lock-icon {
    display: flex;
    align-items: center;
    font-size: 0.8em;
    color: #555;
  }
  #lock-icon-margin {
    margin-left: 10px;
  }

</style>
