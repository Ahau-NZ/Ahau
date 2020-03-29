<template>
  <v-form ref="form"  v-model="form.valid" lazy-validation>
    <v-row class="px-2">
      <v-col cols="12" sm="5" order-sm="2">
        <v-row class="pa-0">
          <v-col cols="12" class="pa-0">
            <!-- Avatar -->
            <Avatar
              class="big-avatar"
              size="250px"
              :image="formData.image"
              :alt="formData.name"
              isView
            />
          </v-col>
          <v-col cols="12" justify="center" align="center" class="pa-0">
            <ImagePicker label="Edit whakapapa image"
              @updateAvatar="formData.image = $event"
              isView
            />
          </v-col>
          <!-- END of Avatar -->
        </v-row>
      </v-col>
      <!-- Information Col -->
      <v-col cols="12" sm="7" class="border-right">
        <v-row>
          <!-- Preferred Name -->
          <v-col cols="12" class="pa-1">
            <v-text-field
              v-model="formData.name"
              label="Name*"
              placeholder=" "
              hide-details
              :rules="form.rules.name.whakapapaView"
            />
          </v-col>
          <!-- Description textarea -->
          <v-col cols="12" class="pa-1">
            <v-textarea
              v-model="formData.description"
              label="Description"
              placeholder=" "
              hide-details
              no-resize
              rows="1"
              auto-grow
            ></v-textarea>
          </v-col>
          <v-col cols="12" class="pa-1 pt-10" v-if="!hideDetails">
            Would you like to start with
          </v-col>
          <v-col cols="12" class="pa-1" v-if="!hideDetails">
            <v-radio-group v-model="formData.focus">
              <v-radio :label="`Yourself`" value="self"></v-radio>
              <v-radio :label="`Another person`" value="new"></v-radio>
              <v-radio :label="`Build from file`" value="file"></v-radio>
            </v-radio-group>
          </v-col>
          <v-row v-if="formData.focus == 'file'">
            <v-col cols="9" class="py-0">
              <v-file-input 
              class="pt-0" 
              v-model="file" 
              show-size 
              accept=".csv" 
              label="File input" 
              :success="success"
              :success-messages="successMsg"
              :error="error"
              :error-messages="errorMsg"
              @click:clear="resetFile()"
              ></v-file-input>
            </v-col>
          </v-row>
        </v-row>
      </v-col>
    </v-row>
  </v-form>
</template>
<script>

import Avatar from '@/components/Avatar.vue'
import ImagePicker from '@/components/ImagePicker.vue'
import { RULES } from '@/lib/constants'
import * as d3 from 'd3'
import pick from 'lodash.pick'
import isEmpty from 'lodash.isempty'
import gql from 'graphql-tag'


const EMPTY_WHAKAPAPA = {
  name: '',
  description: '',
  mode: 'descendants',
  focus: 'self',
  image: null
}

function setDefaultWhakapapa (whakapapa) {
  return {
    name: whakapapa.name,
    description: whakapapa.description,
    mode: whakapapa.mode,
    focus: whakapapa.focus,
    image: whakapapa.image
  }
}

export default {
  name: 'WhakapapaForm',
  components: {
    Avatar,
    ImagePicker
  },
  props: {
    view: { type: Object, default () { return setDefaultWhakapapa(EMPTY_WHAKAPAPA) } },
    readonly: { type: Boolean, default: false },
    hideDetails: { type: Boolean, default: false }
  },
  data () {
    return {
      formData: setDefaultWhakapapa(this.view),
      form: {
        valid: true,
        rules: RULES
      },
      file: null,
      data: null,
      success: false,
      error: false,
      errorMsg: [],
      successMsg: [],
      whoami : {}
    }
  },
  apollo: {
    whoami: {
      query: gql`
        {
          whoami {
            profile {
              id
            }
            feedId
          }
        }
      `,
      fetchPolicy: 'no-cache'
    }
  },
  methods: {

    checkFile (file) {
      if(this.file.name.split(".").pop() != 'csv'){//check if file extension is csv
        this.error = true
        this.errorMsg = ['please upload a CSV file']
      }
      else {
        var reader = new FileReader();
        reader.readAsText(file);
        reader.onload = () => {
          this.data = reader.result;
        }
        this.success = true
      }
    },

    resetFile(){
      this.file = null,
      this.error = false
      this.success = false
      this.errorMsg = []
    },

    async addPerson ($event) {
      console.log("add person event: ", $event)

      let person = {}
      Object.entries($event.data).map(([key, value]) => {
        if (!isEmpty($event.data[key])) {
          person[key] = value
        }
      })

      try {
        var { id } = $event.data

        if (!id) {
          console.log("id:", id)
          id = await this.createProfile(person)
          console.log("id after create: ", id)
          if (!id) return
        }

        let child = id
        
        const relationshipAttrs = pick($event, [
          'relationshipType',
          'legallyAdopted'
        ])

        if ($event.parent) {
          let parent = $event.data.parent.id
          console.log("child: ", child)
          console.log("parent: ", parent)
          const childrenExists = parent.children.filter(existingChild => {
            return existingChild.id === child
          })
          if (isEmpty(childrenExists)) {
            await this.createChildLink({ child, parent, ...relationshipAttrs })
          }
        }
        else
            console.log('not built')
        }

       catch (err) {
        throw err
      }
    },

    async createProfile ({
      preferredName,
      legalName,
      gender,
      bornAt,
      diedAt,
      birthOrder,
      avatarImage,
      altNames,
      description,
      location,
      profession,
      contact
    }) {
      const res = await this.$apollo.mutate({
        mutation: gql`
          mutation($input: ProfileInput!) {
            saveProfile(input: $input)
          }
        `,
        variables: {
          input: {
            type: 'person',
            preferredName,
            legalName,
            gender,
            bornAt,
            diedAt,
            birthOrder,
            avatarImage,
            altNames: {
              add: []
            },
            description,
            location,
            profession,
            contact,
            recps: [this.whoami.feedId] // TODO change this for groups
          }
        }
      })

      if (res.errors) {
        console.error('failed to createProfile', res)
        return
      }
      return res.data.saveProfile // a profileId
    },
    
    async createChildLink (
      { child, parent, relationshipType, legallyAdopted },
      view
    ) {
      const input = {
        child,
        parent,
        relationshipType,
        legallyAdopted,
        recps: this.view.recps
      }
      try {
        const res = await this.$apollo.mutate(saveWhakapapaLink(input))
        if (res.errors) {
          console.error('failed to createChildLink', res)
          return
        }
        return res // TODO return the linkId
      } catch (err) {
        throw err
      }
    },
  },
  
  watch: {
    view (newVal) {
      this.formData = newVal
    },
    'formData': {
      handler (newVal) {
        this.$emit('update:view', newVal)
      },
      deep: true
    },

    file (newValue){
      this.errorMsg = []
      this.error = false
      this.success = false
      if (newValue != null)
      this.checkFile(newValue)
    },

    data (newValue) {
      if(newValue != null){
        var csv = d3.csvParse(newValue)
        console.log("csv array:", csv)

        var root = d3.stratify()
          .id(function(d) { return d.number; })
          .parentId(function(d) { return d.parentNumber; })
          (csv);
          console.log("object: ", root)
        


        // var nestedData = d3.hierachy(root)
        var data = root.descendants()

        console.log("data: ", data)

        data.forEach(person => {
          console.log("adding person: ", person)
          this.addPerson(pick(person, ['data', 'parent', 'children']))
        })
       
        }

      else  return this.file = null
    } 
  },
    
}
</script>

<style scoped>
.custom.v-text-field > .v-input__control > .v-input__slot:before {
  border-style: none;
}
.custom.v-text-field > .v-input__control > .v-input__slot:after {
  border-style: none;
}
.close {
  top: -25px;
  right: -10px;
}
.big-avatar {
  position: relative;
  top: -20px;
}
.v-input--checkbox label {
  font-size: 14px;
}

.v-input--radio-group__input label {
  font-size: 14px;
}
</style>
