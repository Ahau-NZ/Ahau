<template>
  <v-form class="body-width pt-0" ref="form" v-model="form.valid" lazy-validation>
    <v-container class="white mx-auto pt-12 px-12">
      <v-row>
        <v-col cols="12" md="12" >
          <v-text-field
            light
            v-model="preferredName"
            label="Preferred name"
          ></v-text-field>
        </v-col>

        <v-col cols="12" md="12" >
          <v-text-field
            light
            v-model="legalName"
            label="Legal name"
          ></v-text-field>
        </v-col>

        <v-col cols="12">
          <v-textarea
            v-model="description"
            light
            name="input-7-1"
            label="Description"
            hint="Hint text"
          ></v-textarea>
        </v-col>

        <v-col cols="12">
          <v-btn @click="onCancel" outlined text color="secondary" class="mr-4">
            <v-icon>mdi-close</v-icon>
          </v-btn>

          <v-btn v-if="hasChanges" @click="saveProfile" text color="secondary" class="mr-4">
            <v-icon>mdi-check</v-icon>
          </v-btn>
          <v-btn v-else outlined color="secondary" text class="mr-4">
            <v-icon>mdi-check</v-icon>
          </v-btn>
        </v-col>

      </v-row>
    </v-container>
  </v-form>
</template>

<script>
export default {
  name: 'ProfileForm',
  props: {
    preferredName: String,
    legalName: String,
    description: String,
    saveProfile: Function
  },
  data () {
    return {
      form: {
        valid: true,
        rules: {
          // title: [
          //   v => !!v || 'Title is required'
          // ],
          // gender: [
          //   v => !!v || 'Gender is required'
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
          }
          // date: {
          //   birth: [
          //     v => !!v || 'Date of birth is required'
          //   ]
          // }
        }
      }
    }
  }
}
</script>

<style scoped lang="scss">
  .body-width {
    background: white;

    min-height: 60vh;
    min-width: 600px;
    max-width: 60vw;
    margin: 0 auto;
  }
</style>
