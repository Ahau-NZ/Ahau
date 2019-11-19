<template>
  <v-row justify="center">
    <v-dialog v-model="getVisible"
      light
      persistent
      max-width="1000px"
    >
      <v-card>
        <v-card-title>
          <span class="headline">
            Create a new Person
          </span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12" sm="5" md="3">
                <v-select label="Title*"
                  :items="titles"
                  required
                ></v-select>
              </v-col>
              <v-col cols="12" sm="5" md="3">
                <v-select label="Gender*"
                  :items="genders"
                  required
                ></v-select>
              </v-col>
              <v-col cols="12" sm="5" md="3">
                <NodeDatePicker label="Date of Birth*" 
                  required=true
                />
              </v-col>
              <v-col cols="12" sm="5" md="3">
                <NodeDatePicker label="Date Deceased"
                  required=true
                />
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12" sm="5" md="7">
                <v-text-field label="Preferred Name*"
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
                <v-text-field label="Legal Name"
                ></v-text-field>
              </v-col>
              <v-col>
                <v-checkbox label="Legally Adopted"
                ></v-checkbox>
              </v-col>
              <v-col>
                <v-checkbox label="Raised"
                ></v-checkbox>
              </v-col>
            </v-row>
            <v-row class="actions">
              <v-col cols="12" sm="5" md="9">
                <small>*indicates required field</small>
              </v-col>
              <v-col>
                <v-btn @click="onCancel" outlined color="secondary" class="mr-4">
                  <v-icon>mdi-cancel</v-icon>
                </v-btn>
                <v-btn @click="onSubmit"  color="success" class="mr-4">
                  <v-icon>mdi-check</v-icon>
                </v-btn>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script>
import NodeDatePicker from './NodeDatePicker.vue'

export default {
  components: {
    NodeDatePicker
  },
  data(){
    return {
      isVisible: true,
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
    }
  }
  
}
</script>
