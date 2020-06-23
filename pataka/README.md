# Āhau Pātaka

## Changes from Whakapapa-Ora desktop, ui and server

### Unique parts

UI:
  - `ui/src/App.vue`
  - `ui/src/views/Dashboard.vue`
  - `ui/src/views/PortForwarding.vue`


### Tweaked parts

Installers: 
  - `build/electron-builder.config.js`: changed appId and productName; included `'!ui/*'` and `'!server/*'` to files

Ahoy:
  - `index.js`: uses `ahau-pataka-server` instead of `ahau-server`
  - `ssb.config.js`: uses different ssb port and folders

UI:
  - `ui/package.json`: ui runs on port `8081`
  - `ui/public/index.html`: changed title and removed cordova parts
  - `ui/src/plugins/vue-apollo.js`: GraphQL server runs on 4001 and different `AUTH_TOKEN`
  - `ui/src/views/Login.vue`: removed Cordova logic
  - `ui/src/components/Avatar.vue`: changed path of imported components; removed gender logic
  - `ui/src/components/AvatarEditDialog.vue`: changed path of imported components
  - `ui/src/components/Dialog.vue`: changed path of imported components; removed all logic related to gender and dates
  - `ui/src/components/DialogTitleBanner.vue`: changed path of imported assets
  - `ui/src/components/ImagePicker.vue`: changed path of imported components
  - `ui/src/components/NewNodeDialog.vue`: changed paths of imported components; only use a name, description and avatar; removed all relationship related logic
  - `ui/src/components/ProfileForm.vue`: removed all relationship related logic; left only name, description and avatar fields;

Server:
  - `server/package.json`: uses different ssb-graphql plugins
  - `server/index.js`: uses different ssb-graphql plugins, runs on port 4001, removed Cordova parts and mocking

### Copied parts

Installers: 
  - `build/mac`, `build/win` and `build/build-icons.js`

UI:
  - `.storybook`, `.eslintrc.js`, `apollo.config.js`, `babel.config.js`, `postcss.config.js`, `vue.config.js`, `vuetify.config.js`
  - `plugins/vuetify.js`
  - `assets`

