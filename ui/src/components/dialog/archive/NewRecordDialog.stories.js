import NewRecordDialog from './NewRecordDialog.vue'
import { story1 } from '@/mocks/stories'

export default {
  title: 'NewRecordDialog'
}

export const NewRecord = () => ({
  template: '<NewRecordDialog :show="true"/>',
  components: { NewRecordDialog }
})

export const EditRecord = () => ({
  template: '<NewRecordDialog :show="true" :story="story"/>',
  data () {
    return {
      story: story1
    }
  },
  components: { NewRecordDialog }
})

/*
<NewRecordDialog
:show="isActive('new-record')"
:title="'Create a new Record'"
@close="close"
@submit="console.log('TODO: add record to profile')"
/>
*/
