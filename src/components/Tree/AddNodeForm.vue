<template>
  <v-row justify="center">
    <v-dialog v-model="getVisible"
      light
      persistent
      max-width="1000px"
    >
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
                    @date="node.date.birth = $event.target.value"
                  />
                </v-col>
                <v-col cols="12" sm="5" md="3">
                  <NodeDatePicker label="Date Deceased"
                    :required="false"
                    @date="node.date.death = $event.target.value"
                  />
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12" sm="5" md="7">
                  <v-text-field label="Preferred Name*"
                    v-model="node.name.preferred"
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
                    v-model="node.name.legal"
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
                  <v-btn @click="onCancel" fab text color="secondary" class="mr-4">
                    <v-icon>mdi-cancel</v-icon>
                  </v-btn>
                  <v-btn @click="validate"
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
    </v-dialog>
  </v-row>
</template>

<script>
import NodeDatePicker from './NodeDatePicker.vue'
import Avatar from '../Avatar.vue'

export default {
  components: {
    NodeDatePicker,
    Avatar
  },
  data(){
    return {
      isVisible: true,
      avatar: {
        update: false
      },
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
              v => (v && v.length <= 20) || 'Name must be less than 20 characters',
            ],
            legal: [
              v => !!v || 'Legal name is required',
              v => (v && v.length <= 50) || 'Name must be less than 50 characters',
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
        name: {
          preffered: '',
          legal: ''
        },
        date: {
          birth: '',
          death: ''
        },
        adopted: false,
        raised: false
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
  props: {
    visible: {
      type: Boolean,
      required: true
    }
  },
  computed: {
    setVisible(value) {
      this.isVisible = value
    },
    getVisible(){
      return this.isVisible
    }
  },
  methods: {
    onSubmit(){
      alert('Submitted!')
    },
    onCancel(){
      alert('Cancelled!')
    },
    validate(){
      if(this.$refs.form.validate()){
        alert('Validated!')
      }
    }
  }
  
}
</script>

<style scoped lang="scss">

</style>