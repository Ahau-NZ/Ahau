import NewRecordDialog from './NewRecordDialog.vue'

export default {
  title: 'NewRecordDialog'
}

export const Dialog = () => ({
  template: '<NewRecordDialog :show="true"/>',
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
