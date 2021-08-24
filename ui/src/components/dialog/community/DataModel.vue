<template>
  <div class="ma-2 mt-4">
    <v-divider class="my-10"></v-divider>
    <p class="black--text">{{ $t('addCommunityForm.dataModel') }}</p>
    <v-tooltip bottom open-delay="200">
      <template v-slot:activator="{ on }">
        <div v-on="on">
          <v-data-table
            :headers="headers"
            :items="dataModel"
            class="elevation-1 grey--text"
            disable-sort
            disable-pagination
            hide-default-footer
            disabled
          >
            <template v-slot:item.show="{ item }"> <!-- eslint-disable-line -->
              <v-simple-checkbox
                v-model="item.show"
                disabled
              ></v-simple-checkbox>
            </template>
            <template v-slot:item.required="{ item }"> <!-- eslint-disable-line -->
              <v-simple-checkbox
                v-model="item.required"
                disabled
              ></v-simple-checkbox>
            </template>
          </v-data-table>
          <v-col cols="12" justify="start" class="px-1">
            <v-btn color="#3b3b3b" class="white--text" disabled>
              <v-icon class="pr-1">mdi-plus</v-icon> {{ $t('addCommunityForm.addDataPoint') }}
            </v-btn>
          </v-col>
        </div>
      </template>
      <span>{{ $t('support.comingSoon')}}</span>
    </v-tooltip>

    <v-divider></v-divider>
  </div>
</template>
<script>

export default {
  name: 'DataModel',
  data () {
    return {
      headers: [
        { text: this.$t('addCommunityForm.data'), value: 'name' },
        { text: this.$t('addCommunityForm.type'), value: 'type' },
        { text: this.$t('addCommunityForm.included'), value: 'show' },
        { text: this.$t('addCommunityForm.required'), value: 'required' }
      ],
      // model: profileData
      dataModel: [
        { value: 'preferredName', name: this.t('preferredName'), type: 'text', required: true, show: true },
        { value: 'legalName', name: this.t('legalName'), type: 'text', required: false, show: true },
        { value: 'altNames', name: this.t('altNames'), type: 'mulitple response', required: false, show: true },
        { value: 'description', name: this.t('dataDescription'), type: 'text', required: false, show: true },
        { value: 'gender', name: this.t('gender.title'), type: 'selection', required: false, show: true },
        { value: 'address', name: this.t('personalInfo.address'), type: 'text', required: false, show: true },
        { value: 'city', name: this.t('personalInfo.city'), type: 'text', required: true, show: true },
        { value: 'country', name: this.t('personalInfo.country'), type: 'text', required: true, show: true },
        { value: 'postCode', name: this.t('personalInfo.postCode'), type: 'text', required: false, show: true },
        { value: 'email', name: this.t('personalInfo.email'), type: 'email', required: false, show: true },
        { value: 'phone', name: this.t('personalInfo.phone'), type: 'phone', required: false, show: true },
        { value: 'aliveInterval', name: this.t('dob.title'), type: 'date', required: false, show: true },
        { value: 'aliveInterval', name: this.t('dod'), type: 'date', required: false, show: true },
        { value: 'birthOrder', name: this.t('birthOrder'), type: 'number', required: false, show: true },
        { value: 'deceased', name: this.t('notLiving'), type: 'checkbox', required: false, show: true },
        { value: 'placeOfBirth', name: this.t('birthPlace'), type: 'text', required: false, show: true },
        { value: 'placeOfDeath', name: this.t('deathPlace'), type: 'text', required: false, show: true },
        { value: 'buriedLocation', name: this.t('burialLocation'), type: 'text', required: false, show: true },
        { value: 'profession', name: this.t('skills.profession'), type: 'text', required: false, show: true },
        { value: 'education', name: this.t('skills.title'), type: 'mulitple response', required: false, show: true },
        { value: 'school', name: this.t('skills.placeOfEducation'), type: 'mulitple response', required: false, show: true }
      ]
    }
  },
  methods: {
    t (key, vars) {
      return this.$t('addPersonForm.' + key, vars)
    }
  }

}

</script>
