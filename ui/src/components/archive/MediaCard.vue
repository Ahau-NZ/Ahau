
<template>
  <div class="pa-0 ma-0">
    <Media @mouseover.native="toggleActions()" width="300px" height="auto" :artefact="displayArtefact"/>
    <div class="media-group">
      <Media class="thumbnail" v-for="(artefact, i) in artefacts"
        :key="`artefact-${artefact.id}-${i}`"
        :artefact="artefact"
        width="100px"
        height="auto"
        @click="display(artefact)"
      />
    </div>
    </div>
</template>

<script>
import ArtefactDialog from '@/components/dialog/archive/ArtefactDialog.vue'
import Media from '@/components/archive/Media.vue'

export default {
  name: 'MediaCard',
  props: {
    artefacts: {
      type: Array,
      default () {
        return []
      }
    }
  },
  mounted () {
    this.displayArtefact = this.artefacts[0]
  },
  components: { ArtefactDialog, Media },
  data: () => ({
    index: null,
    images: [
      'https://dummyimage.com/800/ffffff/000000',
      'https://dummyimage.com/1600/ffffff/000000',
      'https://dummyimage.com/1280/000000/ffffff',
      'https://dummyimage.com/400/000000/ffffff',
    ],
    displayArtefact: {},
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
    toggleActions () {
      console.log('hover')
    },
    display (artefact) {
      this.displayArtefact = artefact
    },
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

.media-group {
  width: 300px;
  height: 60px;
  display: flex;
  flex-direction: row;
  overflow-x: auto;
}

.thumbnail {
  width: 100px;
  height: 60px;
  padding: 0px;
}

::-webkit-scrollbar {
  height: 5px;
  display: none;
}

/* Track */
::-webkit-scrollbar-track {
  background: #f1f1f1;
}

/* Handle */
::-webkit-scrollbar-thumb {
  background: #888;
}

/* Handle on hover */
::-webkit-scrollbar-thumb:hover {
  background: #555;
}

</style>
