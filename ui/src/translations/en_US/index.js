module.exports = {
  /* Indexes (overviews) */
  viewTribes: require('./view-tribes.json'),
  whakapapaIndex: require('./whakapapa-index.json'),
  viewTribalRegistry: require('./view-tribal-registry.json'),
  timeline: require('./timeline.json'),

  /* Shows (see a particular record) */
  viewPerson: require('./view-person.json'),
  viewArchive: require('./view-archive.json'),

  /* Forms */
  addPersonForm: require('./add-person-form.json'),
  addCommunityForm: require('./add-community-form.json'),
  addWhakapapaForm: require('./add-whakapapa-form.json'),
  addStoryForm: require('./add-story-form.json'),
  addCollectionForm: require('./add-collection-form.json'),
  settingsForm: require('./settings-form.json'),

  deletePerson: require('./delete-person.json'),

  /* Nav / misc */
  accessButton: require('./access-button.json'),
  appBarMenu: require('./appbar-menu.json'),
  nodeMenu: require('./node-menu.json'), // whakapapa menu
  sideNav: require('./side-nav-menu.json'),

  pataka: require('./pataka'),

  sideProfile: require('./side-profile.json'),

  instructionsWhakapapa: require('./instructions-whakapapa.json'),
  instructionsStory: require('./instructions-story.json')
}
