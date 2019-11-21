<template>
  <Dialog :show="show" @close="close">
    <v-form ref="form"
      v-model="form.valid"
      lazy-validation
    >
      <v-card>
        <v-card-title>
          <span class="headline">
            Create a new Person
          </span>
        </v-card-title>
        <v-card-text>
          <v-container light>
            <v-row>
              <v-col cols="12" sm="5" md="3">
                <v-select label="Title*"
                  :items="titles"
                  v-model="node.title"
                  :rules="form.rules.title"
                  required
                ></v-select>
              </v-col>
              <v-col cols="12" sm="5" md="3">
                <v-select label="Gender*"
                  v-model="node.gender"
                  :rules="form.rules.title"
                  :items="genders"
                  required
                ></v-select>
              </v-col>
              <v-col cols="12" sm="5" md="3">
                <NodeDatePicker label="Date of Birth*"
                  :required="true"
                  :rules="form.rules.date.birth"
                  :value="node.dateOfBirth"
                  @date="node.dateOfBirth = $event"
                  :date="node.dateOfBirth"
                />
              </v-col>
              <v-col cols="12" sm="5" md="3">
                <NodeDatePicker label="Date Deceased"
                  :required="false"
                  :value="node.dateOfDeath"
                  @date="node.dateOfDeath = $event"
                />
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12" sm="5" md="7">
                <v-text-field label="Preferred Name*"
                  v-model="node.preferredName"
                  :rules="form.rules.name.preferred"
                  hint="This is the name that will show on the whakapapa"
                  required
                ></v-text-field>
              </v-col>
              <v-col>
                <!-- insert photo picker here -->
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12" sm="5" md="7">
                <v-text-field label="Legal Name*"
                  v-model="node.legalName"
                  :rules="form.rules.name.legal"
                  hint="This is the name that appears on your birth certificate or ID"
                  required
                ></v-text-field>
              </v-col>
              <v-col>
                <v-checkbox label="Legally Adopted"
                  v-model="node.adopted"
                ></v-checkbox>
              </v-col>
              <v-col>
                <v-checkbox label="Raised"
                  v-model="node.raised"
                ></v-checkbox>
              </v-col>
            </v-row>

            <v-row>

              <v-btn class="mx-2" fab>
                <v-icon>mdi-plus</v-icon>
              </v-btn>

            </v-row>

            <v-row class="actions">
              <v-col cols="12" sm="5" md="9">
                <small>*indicates required field</small>
              </v-col>
              <v-col>
                <v-btn @click="close" fab text color="secondary" class="mr-4">
                  <v-icon>mdi-cancel</v-icon>
                </v-btn>
                <v-btn @click="submit"
                  :disabled="!form.valid"
                  fab
                  text
                  color="success"
                  class="mr-4">
                  <v-icon>mdi-check</v-icon>
                </v-btn>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
      </v-card>
    </v-form>
  </Dialog>
</template>

<script>
import Dialog from './Dialog.vue'
import NodeDatePicker from '../NodeDatePicker.vue'

export default {
  components: {
    Dialog,
    NodeDatePicker
  },
  props: {
    show: {
      type: Boolean,
      required: true
    }
  },
  data () {
    return {
      form: {
        valid: true,
        rules: {
          title: [
            v => !!v || 'Title is required'
          ],
          gender: [
            v => !!v || 'Gender is required'
          ],
          name: {
            preferred: [
              v => !!v || 'Preferred name is required',
              v => (v && v.length <= 20) || 'Name must be less than 20 characters'
            ],
            legal: [
              v => !!v || 'Legal name is required',
              v => (v && v.length <= 50) || 'Name must be less than 50 characters'
            ]
          },
          date: {
            birth: [
              v => !!v || 'Date of birth is required'
            ]
          }
        }
      },
      node: {
        title: '',
        gender: '',
        preferredName: '',
        legalName: '',
        dateOfBirth: '',
        dateOfDeath: '',
        adopted: false,
        raised: false,
        children: []
      },
      titles: [
        'Mr',
        'Mrs',
        'Ms',
        'Miss',
        'Other'
      ],
      genders: [
        'Male',
        'Female',
        'Other'
      ]
    }
  },
  methods: {
    close: function () {
      console.log('close()')
      this.$emit('close')

      // reset the form properties
      // TODO: figure out when is a good time to reset these?
      // this.node.title = ''
      // this.node.gender = ''
      // this.node.preferredName = ''
      // this.node.legalName = ''
      // this.node.dateOfBirth = ''
      // this.node.dateOfDeath = ''
      // this.node.adopted = false
      // this.node.raised = false
      // this.node.children = []
    },
    submit () {
      console.log('submit()')
      if (this.$refs.form.validate()) {
        console.log('---->validated')
        var node = this.node

        // send the data back to the parent component
        this.$emit('submit', node)

        // close this dialog
        this.close()
      } else {
        console.log('---->not validated')
      }
    }
  }
}
</script>
