
<template>
  <div>
  <v-data-table
    :headers="headers"
    :items="artefacts"
    v-if="artefacts.length > 0"
    :hide-default-footer="true"
    id="datatable"
  >
    <template v-slot:item=" { item, index }">
      <tr>
        <td style="width:30%; height:100%;" class="pt-2 pb-2">
          <Media :type="item.type" :src="item.url" :format="item.format" />
        </td>
        <td style="width:65%;">
          <div>
            <v-text-field
              v-model="artefacts[index].title"
              :style="`width: 100%`" hide-details solo flat
              :readonly="item.readonly"
              :clearable="isSelected[index]"
              @focus="isSelected[index] = true"
              @blur="isSelected[index] = false"
            />
          </div>
        </td>
        <td style="width: 5%" class="ma-0 pa-0">
          <v-btn icon @click="editArtefact(item)">
            <v-icon small class="blue--text">mdi-pencil</v-icon>
          </v-btn>
          <v-btn icon @click="deleteArtefact(index)">
            <v-icon small class="secondary--text">mdi-delete</v-icon>
          </v-btn>
        </td>
      </tr>
      <ArtefactDialog v-if="dialog" :title="selectedArtefact.title" :selectedIndex="selectedIndex" :artefacts.sync="artefacts" @close="close" @submit="save($event)" :show="dialog" />
    </template>
  </v-data-table>
  <v-card-actions v-if="artefacts.length > 0" class="justify-center">
    <v-btn text @click="clearArtefacts">
      Clear
    </v-btn>
  </v-card-actions>
  </div>
</template>

<script>
import ArtefactDialog from '@/components/dialog/archive/ArtefactDialog.vue'
import Media from '@/components/archive/Media.vue'

export default {
  name: 'MediaCard',
  props: ['artefacts'],
  components: { ArtefactDialog, Media },
  data: () => ({
    dialog: false,
    headers: [
      { text: 'File', value: 'file', sortable: false },
      // { text: 'Type', value: 'type', sortable: false },
      { text: 'Title', value: 'title', sortable: false },
      { text: '', value: 'edit', sortable: false }
      // { text: 'Description', value: 'decription', sortable: false },
      // { text: 'Format', value: 'format', sortable: false }
      // { text: 'Identifier', value: 'identifier', sortable: false },
      // { text: 'Language', value: 'language', sortable: false },
      // { text: 'Licence', value: 'licence', sortable: false },
      // { text: 'Rights', value: 'rights', sortable: false },
      // { text: 'Source', value: 'source', sortable: false },
      // { text: 'Translation', value: 'translation', sortable: false },
      // { text: 'Duration', value: 'duration', sortable: false },
      // { text: 'Size', value: 'size', sortable: false },
      // { text: 'Transcription', value: 'transcription', sortable: false }
    ],
    isSelected: [],
    selectedIndex: 0,
    selectedArtefact: {
      title: '',
      description: '',
      format: '',
      identifier: '',
      language: '',
      licence: '',
      rights: '',
      source: '',
      translation: '',
      duration: 0,
      size: 0,
      transcription: ''
    },
    defaultArtefact: {
      title: '',
      description: '',
      format: '',
      identifier: '',
      language: '',
      licence: '',
      rights: '',
      source: '',
      translation: '',
      duration: 0,
      size: 0,
      transcription: ''
    }
  }),
  watch: {
    artefacts: {
      deep: true,
      handler (newValue) {
        this.$emit('update:artefacts', newValue)
      }
    },
    dialog (val) {
      val || this.close()
    }
  },
  methods: {
    clearArtefacts () {
      confirm('Are you sure you want to clear all uploaded media?') && this.$emit('update:artefacts', [])
    },
    editArtefact (artefact) {
      this.selectedIndex = this.artefacts.indexOf(artefact)
      this.selectedArtefact = Object.assign({}, artefact)
      this.dialog = true
    },

    deleteArtefact (index) {
      confirm('Are you sure you want to delete this item?') && this.artefacts.splice(index, 1)
    },
    close () {
      this.dialog = false
      this.$nextTick(() => {
        this.selectedArtefact = Object.assign({}, this.defaultArtefact)
        this.selectedIndex = -1
      })
    },
    save ($event) {
      console.log('save', $event)
      if (this.selectedIndex > -1) {
        Object.assign(this.artefacts[this.selectedIndex], this.selectedArtefact)
      } else {
        this.artefacts.push(this.selectedArtefact)
      }
      this.close()
    }
  }
}
</script>

<style scoped>
.fit {
  object-fit: cover;
  width: 100%;
  height: 100%;
}
tr:hover td {
  background-color: #fff;
}

#datatable ::-webkit-scrollbar {
  height: 5px;
  /* display: none; */
}

/* Track */
#datatable ::-webkit-scrollbar-track {
  background: #f1f1f1;
}

/* Handle */
#datatable ::-webkit-scrollbar-thumb {
  background: #888;
}

/* Handle on hover */
#datatable ::-webkit-scrollbar-thumb:hover {
  background: #555;
}

#datatable {
  overflow-y: scroll;
  white-space: nowrap;
  max-height: 300px;
}

</style>
