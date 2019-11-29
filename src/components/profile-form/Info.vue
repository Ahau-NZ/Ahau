<template>
  <v-form class="body white pt-0" ref="form" v-model="form.valid" lazy-validation>
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

    </v-row>
  </v-form>
</template>

<script>
export default {
  name: 'ProfileFormInfo',
  props: {
    preferredName: String,
    legalName: String,
    description: String
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
  .body {
    background: white;
  }
</style>
