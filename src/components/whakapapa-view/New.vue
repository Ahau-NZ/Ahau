<template>
  <Dialog :show="show" @close="close">
    <v-form ref="form" v-model="form.valid" lazy-validation>
      <v-card>
        <v-card-title>
          <span class="headline"> {{text || 'Create a new Whakapapa record'}} </span>
        </v-card-title>

        <v-card-text>
          <v-container light>
            <v-row>
              <v-col cols="12" sm="5" md="7">
                <v-text-field label="Name*"
                  v-model="data.name"
                  :rules="form.rules.name"
                  hint="The name you'll remember this record by"
                  required
                ></v-text-field>
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12" sm="5" md="7">
                <v-textarea label="Description"
                  v-model="data.description"
                  hint="Some more context or info about this record"
                  required
                ></v-textarea>
              </v-col>
            </v-row>

            <!-- TODO -->
            <!-- <v-row>
              <v-btn class="mx-2" fab>
                <v-icon>mdi-plus</v-icon> -->
                <!-- insert photo picker here -->
              <!-- </v-btn>

            </v-row>
            -->

            <v-row class="actions">
              <v-col cols="12" sm="5" md="9">
                <small>*indicates required field</small>
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
</template>

<script>
import Dialog from '@/components/Dialog.vue'

function defaultData () {
  return {
    name: '',
    description: '',
    // focus: ''
    mode: 'descendants'
  }
}

export default {
  name: 'WhakapapaViewNew',
  props: {
    text: String,
    show: {
      type: Boolean,
      required: true
    }
  },
  data () {
    return {
      data: defaultData(),
      form: {
        valid: true,
        rules: {
          name: [
            v => !!v || 'Name is required',
            v => (v && v.length <= 20) || 'Name must be less than 20 characters'
          ]
        }
      }
    }
  },
  methods: {
    close: function () {
      // reset the form properties
      this.data = defaultData()

      this.$emit('close')
    },
    submit () {
      if (!this.$refs.form.validate()) {
        console.log('----> not validated')
        return
      }

      // send the data back to the parent component
      this.$emit('submit', this.data)

      // close this dialog
      this.close()
    }
  },
  components: {
    Dialog
  }
}
</script>
