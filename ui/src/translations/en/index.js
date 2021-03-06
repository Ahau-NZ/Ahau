module.exports = {
  /* Indexes (overviews) */
  // TODO rename tribe-index.json etc.
  viewTribes: require('./view-tribes.json'),
  personIndex: require('./person-index.json'),
  whakapapaIndex: require('./whakapapa-index.json'),
  viewTribalRegistry: require('./view-tribal-registry.json'),
  timeline: require('./timeline.json'),

  /* Shows (see a particular record) */
  // TODO rename person-show.json etc.
  viewPerson: require('./view-person.json'),
  viewArchive: require('./view-archive.json'),
  whakapapaTable: require('./whakapapa-table.json'),
  months: require('./months.json'),

  /* Forms */
  addPersonForm: require('./add-person-form.json'),
  addCommunityForm: require('./add-community-form.json'),
  addWhakapapaForm: require('./add-whakapapa-form.json'),
  addStoryForm: require('./add-story-form.json'),
  addCollectionForm: require('./add-collection-form.json'),
  settingsForm: require('./settings-form.json'),
  keyBackupForm: require('./key-backup-form.json'),
  newNode: require('./new-node.json'),
  deleteNode: require('./delete-node.json'),
  deleteProfileForm: require('./delete-profile-form.json'),
  dialogHandler: require('./dialog-handler.json'),
  dialog: require('./dialog.json'),
  editNodeDialog: require('./edit-node-dialog.json'),
  reviewRegistration: require('./review-registration-dialog.json'),
  tribeSettings: require('./tribe-settings.json'),

  /* Nav / misc */
  accessButton: require('./access-button.json'),
  appBarMenu: require('./appbar-menu.json'),
  nodeMenu: require('./node-menu.json'), // whakapapa menu
  sideNav: require('./side-nav-menu.json'),
  notifications: require('./notifications.json'),

  pataka: require('./pataka'),
  patakaInstruction: require('./instructions-pataka.json'),

  sideProfile: require('./side-profile.json'),

  instructionsWhakapapa: require('./instructions-whakapapa.json'),
  instructionsStory: require('./instructions-story.json'),
  groups: require('./groups.json'),
  support: require('./support.json'),
  button: require('./button.json'),
  importPeopleForm: require('./import-csv.json')
}
