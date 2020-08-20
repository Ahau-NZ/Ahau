<template>
  <Dialog :title="'Upload CSV Instructions'" :show="show" @close="close" :width="`720px`" :goBack="close">

    <template v-slot:content>
      <v-card-text class="pt-2">
        To make the data entry and upload of whakapapa information easier we have added the ability to upload a CSV file to build the whakapapa graph. <br><br>
        These instructions will walk you through those steps to successfully transfer and upload this information. If you are having any issues with this please contact us at <b>info@ahau.io</b> and we will do our best to help you.
      </v-card-text>
      <div class="video-player">
        <video class="video" ref="video" controls>
          <source src="@/assets/buildCSV.mp4" type="video/mp4">
        </video>
      </div>
      <v-card-text>
        <ol id="instruction-list">
          <li> Download and open our csv template:
              <v-btn color="blue-grey" class="pa-0" @click='downloadCsv()' text>
                <v-icon class="pr-2" color="blue-grey">
                  mdi-file-download
                </v-icon>
                CSV Template
              </v-btn>
          </li>
          <li> <b>IMPORTANT NOTE: </b> You must not edit the first header row, otherwise the csv import will not work. </li>
          <li> Fill in your whānau information. How it works:
            <ul>
              <li>Each <b> table column </b> <v-icon>mdi-arrow-up-down</v-icon> in the table represents a different field of information (i.e. preferredName, legalName, etc).</li>
              <li>Each <b> table row </b> <v-icon>mdi-arrow-left-right</v-icon> in the table represents a different person.</li>
              <li>The <b>number</b> column and the <b>parentNumber</b> column are used to tell the software who is the <b>parent</b> and who is the <b>child</b>.</li>
              <li>In the <b>number</b> column put 1 for the first person, 2 for the second person, 3 for the third person and so on until each person has a number. <b>Each person must have a different number</b>.</li>
              <li>In the <b>parentNumber</b> column for the first person, leave this field empty. This person is your top ancestor for this whakapapa record. All children and grandchildren will come from them.</li>
              <li>For everyone else, in the <b>parentNumber</b> column, put in the number that is in the <b>number column</b> of that persons parent (please see the video for examples)</li>
              <li><b>IMPORTANT NOTE:</b> All fields in the table below can be left empty, however if the are entered they must be entered in the correct format shown below.</li>
            </ul>
            <v-simple-table fixed-header dense height="300px">
              <template v-slot:default>
                <thead>
                  <tr>
                    <th class="text-left">Field</th>
                    <th class="text-left">Description</th>
                    <th class="text-left">Format</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="field in fields" :key="field.name">
                    <td> {{ field.name }} </td>
                    <td> {{ field.description }} </td>
                    <td>
                      <ul>
                        <li v-for="format in field.formats" :key="format" style="list-style: none">
                          {{ format }}
                        </li>
                      </ul>
                    </td>
                  </tr>
                </tbody>
              </template>
            </v-simple-table>
          </li>
          <li>
            Once you have completed the spreadsheet, save your changes: <kbd>File > Save as</kbd> and select where you would like to save the file.
            <ul>
              <li>
                <b>Windows</b>: Make sure that below the file name you select <b>CSV (comma delimited)(*.csv)</b> from <kbd>save as type</kbd>
              </li>
              <li>
                <b>Mac/Numbers</b>: Export the saved file to csv <kbd>File > Export To > CSV...</kbd>
              </li>
            </ul>
          </li>
          <li>
            In Āhau, when creating a new whakapapapa record, choose <b>Import from CSV file</b> where you can then upload your newly created <b>.csv</b> file.
          </li>
          <li>
            The software will run a quick check on the file and let you know if anything needs changing
          </li>
          <li>
            If the checks passed, you should see a green message giving you the OK
          </li>
          <li>
            Press <v-icon class="blue--text">mdi-check</v-icon> to create your whakapapa from the <b>.csv</b> file and you'll automatically be taken to your newly created whakapapa tree.
          </li>
        </ol>
      </v-card-text>
    </template>
    <template v-slot:actions>
      <v-col :align="mobile ? 'center' : 'end'" class="py-0">
        <v-btn
          text
          @click="close"
        >
          close
        </v-btn>
      </v-col>
    </template>
  </Dialog>
</template>
<script>
import Dialog from '@/components/dialog/Dialog.vue'

export default {
  props: {
    show: { type: Boolean, required: true }
  },
  name: 'CsvHelperDialog',
  data () {
    return {
      items: [
        { src: require('../../../assets/tree.jpg') },
        { src: require('../../../assets/whakapapa-list.jpg') }
      ],
      fields: [
        { name: 'preferredName', description: 'Name the person is known by. Generally, the first name or even a nick name.', formats: ['Text'] },
        { name: 'legalName', description: 'Legal name of a person', formats: ['Text'] },
        { name: 'gender', description: 'Gender of a person', formats: ['male', 'female', 'other', 'unknown'] },
        { name: 'relationshipType', description: 'How a person is related', formats: ['birth (default)', 'whangai', 'adopted'] },
        { name: 'birthOrder', description: 'Order a person was born in their whānau. First born is 1, second is 2 and so on.', formats: ['Number'] },
        { name: 'bornAt', description: 'Date of birth, the date a person was born', formats: ['DD-MM-YYYY', 'DD/MM/YYYY'] },
        { name: 'deceased', description: 'This is to specify if a person is no longer living', formats: ['no (default)', 'yes'] },
        { name: 'diedAt', description: 'Date of death, the date a person passed away', formats: ['DD-MM-YYYY', 'DD/MM/YYYY'] },
        { name: 'phone', description: 'Phone number, this can be any phone number (i.e. mobile, home or work)', formats: ['Text'] },
        { name: 'email', description: 'Email address', formats: ['Text'] },
        { name: 'address', description: 'Street address', formats: ['Text'] },
        { name: 'location', description: 'Town, City or Country', formats: ['Text'] },
        { name: 'profession', description: 'Current Profession', formats: ['Text'] }
      ]
    }
  },
  components: {
    Dialog
  },
  methods: {
    cordovaBackButton () {
      this.close()
    },
    downloadCsv () {
      var csv = 'parentNumber,number,preferredName,legalName,gender,bornAt,deceased,diedAt,birthOrder,relationshipType,profession,phone,email,address,location\n'
      var hiddenElement = document.createElement('a')
      hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv)
      hiddenElement.target = '_blank'
      hiddenElement.download = 'whakapapa.csv'
      hiddenElement.click()
    },
    close () {
      this.$emit('close')
    }
  }
}
</script>
<style scoped>
.centerImage {
  display: block;
  margin-left: auto;
  margin-right: auto;
  width: 20em;
  height:auto
}

.video-player {
  width: 100%;
  margin: 20px auto;
}

.video {
  width: 100%;
}
.instruction-list .li {
  padding-bottom: 10px;
}
</style>
