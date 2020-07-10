<template>
  <Dialog :show="show" :title="title" @close="close" width="70%" :goBack="close" enableMenu>

      <!-- FORM -->
      <template v-slot:content>
        <RegistrationForm ref="registrationForm" :editing="editing" :formData.sync="formData"/>
      </template>

      <!-- <template v-if="editing" v-slot:before-actions>
        <v-col cols="12" sm="auto" class="mt-4">
          <v-btn text @click="$emit('delete')">
            Delete this record
            <v-icon class="pl-2">mdi-delete</v-icon>
          </v-btn>
        </v-col>
      </template> -->

      <template v-slot:actions>
        <v-btn @click="close"
          text large fab
          class="secondary--text"
          :class="mobile ? 'mr-4':''"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <v-btn @click="submit"
            text large fab
            class="blue--text"
          >
            <v-icon>mdi-check</v-icon>
          </v-btn>
      </template>
    </Dialog>
</template>

<script>
import pick from 'lodash.pick'
import isEmpty from 'lodash.isempty'
import isEqual from 'lodash.isequal'

import Dialog from '@/components/dialog/Dialog.vue'
import RegistrationForm from '@/components/registration/RegistrationForm.vue'
import clone from 'lodash.clonedeep'
import { mapActions } from 'vuex'

// const EMPTY_REGISTRATION = {
//     id: '',
//     preferredName: '',
//     legalName: '',
//     altNames: {
//       add: []
//     },
//     gender: '',
//     relationshipType: '',
//     legallyAdopted: '',
//     children: [],
//     parents: [],
//     avatarImage: {},
//     aliveInterval: '',
//     bornAt: '',
//     diedAt: '',
//     birthOrder: '',
//     description: '',
//     location: '',
//     profession: '',
//     address: '',
//     email: '',
//     phone: '',
//     deceased: ''
// }

// function setDefaultRegistration (newRegistration) {
//   var person = clone(person)

//   return {
//     id: person.id,
//     preferredName: person.preferredName,
//     legalName: person.legalName,
//     altNames: person.altNames, 
//     gender: person.gender,
//     relationshipType: person.relationshipType,
//     legallyAdopted: person.legallyAdopted,
//     children: person.children,
//     parents: person.parents,
//     avatarImage: person.avatarImage,
//     aliveInterval: person.aliveInterval,
//     bornAt: person.bornAt,
//     diedAt: person.diedAt,
//     birthOrder: person.birthOrder,
//     description: person.description,
//     location: person.location,
//     profession: person.profession,
//     address: person.address,
//     email: person.email,
//     phone: person.phone,
//     deceased: person.deceased
//   }
// }

// function registrationChanges (initial, updated) {
//   let changes = []
//   Object.entries(updated).forEach(([key, value]) => {
//     if (!isEqual(updated[key], initial[key])) {
//       switch (true) {
//         case Array.isArray(updated[key]) && key !== 'artefacts':
//           changes[key] = { add: [], remove: [] }
//           changes[key].add = arrayChanges(updated[key], initial[key])
//           changes[key].remove = arrayChanges(initial[key], updated[key])

//           if (changes[key].add.length === 0) delete changes[key].add
//           if (changes[key].remove.length === 0) delete changes[key].remove

//           // means the same item was remove then added back in
//           if (isEmpty(changes[key])) delete changes[key]
//           break
//         default:
//           changes[key] = updated[key]
//           break
//       }
//     }
//   })
//   return changes
// }

// function arrayChanges (array1, array2) {
//   return array1.filter(item => !array2.some(item2 => item.id === item2.id))
//     .map(item => item.id) // map it to id
// }

// const PERMITTED_STORY_ATTRS = Object.keys(setDefaultStory(EMPTY_STORY))

// function storySubmission (newStory) {
//   var output = {}
//   var story = pick(newStory, [...PERMITTED_STORY_ATTRS])
//   Object.entries(story).forEach(([key, value]) => {
//     if (!isEmpty(story[key])) {
//       output[key] = value
//     }
//   })
//   return Object.assign({}, output)
// }

// export default {
//   name: 'NewRecordDialog',
//   components: {
//     Dialog,
//     RecordForm
//   },
//   props: {
//     show: { type: Boolean, required: true },
//     story: { type: Object, default () { return EMPTY_STORY } },
//     title: String,
//     editing: { type: Boolean, default: false }
//   },
//   data () {
//     return {
//       formData: setDefaultStory(this.story)
//     }
//   },
//   computed: {
//     mobile () {
//       return this.$vuetify.breakpoint.xs
//     }
//   },
//   watch: {
//     story: {
//       handler (newVal) {
//         console.log(newVal)
//       },
//       deep: true
//     }
//   },
//   methods: {
//     ...mapActions(['setDialog']),
//     close () {
//       this.formData = setDefaultStory(this.story)
//       this.$emit('close')
//     },
//     submit () {
//       var output = {}
//       if (this.editing) {
//         // get all changes
//         output = { id: this.story.id, ...storyChanges(this.story, this.formData) }
//       } else {
//         output = storySubmission(this.formData)
//       }
//       this.$emit('submit', output)
//       this.close()
//     }
//   }
// }
</script>

<style scoped lang="scss">
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
