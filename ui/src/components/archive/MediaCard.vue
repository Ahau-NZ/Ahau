
<template>
  <v-data-table
    :headers="headers"
    :items="artefacts"
    v-if="artefacts.length > 0"
    :hide-default-footer="true"
    id="datatable"
  >
    <template v-slot:item=" { item, index, select }">
      <tr>

        <td style="width: 100px">
          <audio v-if="item.type === 'audio'" width="100" height="80">
            <source :src="item.url" :type="item.fileType"/>
          </audio>
          <video v-if="item.type === 'video'" width="100" height="80">
            <source :src="item.url"/>
          </video>
          <img v-if="item.type === 'photo'" :src="item.url" width="100" height="100" class="pt-6 pb-6"/>
        </td>
        <td style="width: 100px">
          {{ item.type }}
        </td>
        <td>
          <v-text-field :style="`width: 100%`" hide-details solo flat v-model="artefacts[index].title" :readonly="item.readonly"></v-text-field>
        </td>
        <td style="width: 120px">
          <v-btn icon @click="editArtefact(item, index)">
            <v-icon small class="blue--text">mdi-pencil</v-icon>
          </v-btn>
          <v-btn icon @click="deleteArtefact(index)">
            <v-icon small class="secondary--text">mdi-delete</v-icon>
          </v-btn>
        </td>
      </tr>
    </template>
  </v-data-table>
</template>

<script>
export default {
  name: 'MediaCard',
  props: ['artefacts'],
  data: () => ({
    dialog: false,
    headers: [
      { text: 'File', value: 'file', sortable: false },
      { text: 'Type', value: 'type', sortable: false },
      { text: 'Title', value: 'title', sortable: false },
      { text: 'Edit', value: 'edit', sortable: false }
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
    editedIndex: -1,
    editedItem: {
      title: '',
      description: '',
      format: '',
      identifier: '',
      rights: '',
      source: '',
      translation: '',
      duration: '',
      size: 0,
      transcription: ''
    },
    defaultItem: {
      title: '',
      description: '',
      format: '',
      identifier: '',
      rights: '',
      source: '',
      translation: '',
      duration: '',
      size: 0,
      transcription: ''
    }
  }),

  computed: {
    formTitle () {
      return this.editedIndex === -1 ? 'New Item' : 'Edit Item'
    }
  },

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
    editArtefact (artefact, index) {
      this.editedItem = Object.assign({}, artefact)
      this.dialog = true
    },

    deleteArtefact (index) {
      confirm('Are you sure you want to delete this item?') && this.artefacts.splice(index, 1)
    },

    close () {
      this.dialog = false
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem)
        this.editedIndex = -1
      })
    },

    save () {
      if (this.editedIndex > -1) {
        Object.assign(this.desserts[this.editedIndex], this.editedItem)
      } else {
        this.desserts.push(this.editedItem)
      }
      this.close()
    },
  },
}
</script>

<style scoped>
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
</style>
