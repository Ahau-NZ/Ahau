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
              <v-col cols="12" sm="5" md="7">
                <v-text-field label="Preferred Name*"
                  v-model="data.preferredName"
                  :rules="form.rules.name.preferred"
                  hint="This is the name that will show on the whakapapa"
                  required
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12" sm="5" md="7">
                <v-text-field label="Legal Name*"
                  v-model="data.legalName"
                  :rules="form.rules.name.legal"
                  hint="This is the name that appears on your birth certificate or ID"
                  required
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <!-- <v-col cols="12" sm="5" md="3"> -->
              <!--   <v-select label="Title*" -->
              <!--     :items="titles" -->
              <!--     v-model="data.title" -->
              <!--     :rules="form.rules.title" -->
              <!--     required -->
              <!--   ></v-select> -->
              <!-- </v-col> -->
              <v-col cols="12" sm="5" md="3">
                <v-select label="Gender*"
                  v-model="data.gender"
                  :rules="form.rules.gender"
                  :items="genders"
                  required
                ></v-select>
              </v-col>
            <!--   <v-col cols="12" sm="5" md="3"> -->
            <!--     <NodeDatePicker label="Date of Birth*" -->
            <!--       :required="true" -->
            <!--       :rules="form.rules.date.birth" -->
            <!--       :value="data.dateOfBirth" -->
            <!--       @date="data.dateOfBirth = $event" -->
            <!--       :date="data.dateOfBirth" -->
            <!--     /> -->
            <!--   </v-col> -->
            <!--   <v-col cols="12" sm="5" md="3"> -->
            <!--     <NodeDatePicker label="Date Deceased" -->
            <!--       :required="false" -->
            <!--       :value="data.dateOfDeath" -->
            <!--       @date="data.dateOfDeath = $event" -->
            <!--     /> -->
            <!--   </v-col> -->
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

            <!-- <v-row>

              <v-btn class="mx-2" fab> -->
                <!-- <v-icon>mdi-plus</v-icon> -->
                <!-- insert photo picker here -->
              <!-- </v-btn>

            </v-row> -->

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
</template>

<script>
import Dialog from '@/components/Dialog.vue'
// import NodeDatePicker from './NodeDatePicker.vue'
import { GENDERS, RELATIONSHIPS } from '@/lib/constants'

function defaultData () {
  return {
    preferredName: '',
    legalName: '',
    gender: '',
    relationshipType: '',
    legallyAdopted: false,
    children: []
    // title: '',
    // dateOfBirth: '',
    // dateOfDeath: '',
  }
}

export default {
  name: 'NewNodeDialog',
  components: {
    Dialog
    // NodeDatePicker
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
      form: {
        valid: true,
        rules: {
          // title: [
          //   v => !!v || 'Title is required'
          // ],
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
          gender: [
            v => !!v || 'Gender is required'
          ],
          relationshipType: [
            v => !!v || 'Relationship type is required'
          ]
          // date: {
          //   birth: [
          //     v => !!v || 'Date of birth is required'
          //   ]
          // }
        }
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
    submit () {
      if (!this.$refs.form.validate()) {
        console.log('---->not validated')
        return
      }

      // send the data back to the parent component
      this.$emit('submit', this.data)

      // close this dialog
      this.close()
    }
  }
}
</script>
