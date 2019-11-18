<template>
  <v-row justify="center">
    <v-dialog v-model="visible" light persistent max-width="600px">
       <!--<template v-slot:activator="{ on }">
       <v-btn color="primary" dark v-on="on">Open Dialog</v-btn>
        <slot></slot>
      </template>-->
      <v-card>
        <v-card-title>
          <span class="headline">New Person</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12" sm="6" md="4">
                <v-text-field label="Legal first name*" required></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" md="4">
                <v-text-field label="Legal middle name"></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" md="4">
                <v-text-field
                  label="Legal last name*"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" md="4">
                <v-text-field
                  label="Preferred Name*"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-select
                  :items="['Female', 'Male', 'Other']"
                  label="Gender*"
                  required
                ></v-select>
              </v-col>
              <v-col cols="12" sm="6">
                <NodeDatePicker />
              </v-col>
              <v-col cols="12" sm="6">
                <v-select
                  :items="['No', 'Yes']"
                  label="Adopted"
                ></v-select>
              </v-col>
            </v-row>
            <v-row>

            </v-row>
          </v-container>
          <small>*indicates required field</small>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="red darken-1" text @click="visible = !visible">Cancel</v-btn>
          <v-btn color="red darken-1" text @click="visible = !visible">Add</v-btn>
        </v-card-actions>
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
  props: {
    visible: {
      type: Boolean,
      required: true
    }
  },
  computed: {
  }
}
</script>
