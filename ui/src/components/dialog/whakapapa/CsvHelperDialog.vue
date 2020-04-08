<template>
  <Dialog :show="show" @close="close" :width="`80%`" :goBack="close">
    <template v-slot:title>
      <v-card-title>
        <span class="headline">Upload CSV Instructions </span>
      </v-card-title>
    </template>
    <template v-slot:content>
      <v-card-text class="pt-0">
        To make the data entry and upload of whakapapa information easier we have added the ability to upload a CSV file to build the whakapapa graph. <br>
        These instructions will walk you through those steps to successfully transfer and upload this information. If you are having any issues with this please contact us at info@ahau.io and we will do our best to help you.
      </v-card-text>
      <v-card-text class="pt-0">
        <p>1. Download and open CSV template </p>
        <p>2. It is important to note that you must not edit the first row. If you do, the file upload will not work. We understand that this may mean that there are columns missing that you would like to have. If this is the case, please let us know via the feedback button or send us an email at info@ahau.io </p>
        <p>3. Type in or copy the information from your existing spreadsheet into the template making sure that the information provided in each cell aligns correctly under each column heading, and that each person is on a single row. Leave the columns 'parentNumber' and 'number' blank for this step. If you dont have the information to put in for each header it is ok to just leave it blank.
  i.e **insert picture of example** </p>
        <p>
          4. For each field the software expects certain types of answers. Please note that no field is required to be filled out, (with the exception of number and parentNumber, but we will get to that). If any information is not yet known or you do not wish to put it into the software you can just leave it empty.
          <ul>
            <li>preferredName : the name the person is known by, can be one name or more, but it looks better in the graph if just the first name is provided </li>
            <li>legalName : the persons legal name, this can be as long or as short as you like</li>
            <li>gender : the persons gender, put m for male or f for female </li>
            <li>bornAt : the persons date of birth, use the dd/mm/yyyy format for instance 01/12/1987
          This can be easily set in excel. Unders ‘home’ tab in the number section, select ‘short date’ from the drop down menu. </li>
            <li>diedAt : if the person has passed away put the date the person passed using the dd/mm/yyyy format for instance 01-12-2019 </li>
            <li>birthOrder : the persons order of birth, put 1 for the first born, 2 for the 2nd born, and so on. </li>
            <li>contact : you can put any text into this field this could be phone number e.g 022 0022 0022 or email </li>
            <li>location : you put any text into this field. This could be street address, or just city, country </li>
            <li>profession : you put any text into this field. This could the persons current profession, or a description </li>
            <li>relationshipType : use this field, if the person if by related birth, whangai or adoption. If left blank it will add the person by birth otherwise put whangai or adopted </li>
          </ul>
        </p>
        <p>5. Once you have each cell correctly aligned under each heading we will now need to populate the 'parentNumber' and 'number' columns to tell the software who is the parent of each person. Please note for the file to successfully upload to work these fields must be completed. </p>
        <p>5.1 In the number column give each person a different number. The easiest way to do this is to give them a number, starting from '1', the next person '2', the next person '3' and so on, continuning until the list is complete. There is currently no limit to the number of people you can have. Please note that there are a number of ways to do this easily in excel, and be careful to give each person a different number. </p>
        <p>5.2 Now in the parentNumber column, you will put the number given in the 'number' column that persons parent.</p>
        <p>for example **insert picture of sheet with number column filled **
          <ul>
            <li> Will Smith has 3 children, Jaden, Trey, and Willow. </li>
            <li> Will's number is '1', so Jaden, Trey and Willow's parentNumber will be 1. </li>
            <li> Continue this process untill every person has a their corressponding 'parentNumber' </li>
          </ul>
          Please note the if the parentNumber field is missing, that person will not appear in the created whakapapa graph
        </p>
        <P>6. Once all feilds have been completed click 'file' -> 'save as' and select where you would like to save the file. Make sure that below the file name you select 'CSV (comma delimited)(*.csv)' from the 'save as type'.</P>
        <P>7. Back in Āhau select build from CSV file and select the field to upload the file that you have just created.</P>
        <p>8. The software will run a quick check and if everything looks right the field will turn green you should expect to see a message below the file showing the top ancestors first name and the name of their first child.
          **upload example**
        </p>
        <p>9. Select the blue tick to confirm and and the software will automatically take you to your newly created whakapapa graph</p>
      </v-card-text>
      <!-- <v-divider />

      <v-carousel hide-delimiters>
        <v-carousel-item
          v-for="(item,i) in items"
          :key="i"
          :src="item.src"
          class="centerImage"
        ></v-carousel-item>
      </v-carousel> -->
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
    close () {
      this.$emit('close')
    }
  }
}
</script>
<style>
.centerImage {
  display: block;
  margin-left: auto;
  margin-right: auto;
  width: 20em;
  height:auto
}
</style>
