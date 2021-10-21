# Changelog | Ahau desktop

## v2.3.0

### Bug Fixes

- Prevent recursive loops from ocurring in whakapapa tree
### Features

- Updated table side menu controls who tribal registry
- Added partners to ProfileShow.vue
- Added partners column to whakapapa table
- Can now click on a partner in whakapapa table to show that person in SideNodeDialog.vue
- Added frontend for custom Data Model
- Added options to whakapapa view to hide avatars and show extended family

### Fixes
- Now shows an error when trying to create a record that is too big for the current limit   
- fixed image sizes for collections and tribes
- fixed whakapapa table bottom scroll bar
- Removed kaitiaki from members list
- Added dev commands for deleting node modules on windows
- Changed unknown/other gender avatar to plain account icon
- Can add duplicate profiles to whakapapa
- Fixed other parent whakapapa links

## v2.2.0

### Features

- Added skeleton loaders to Profile.vue
- Can now click related collection in StoryCard.vue and the related collection will show
- Added 'Related to {Relative name} by' in whakapapa registry
- Show loading symbol when the database is rebuilding
- Can now create new stories when viewing a collection and saving that story adds it to that collection
- Added location, skills and age filters to whakapapa table FilterMenu.vue
- Added partners to SideNodeDialog.vue
- new translations
- clearing logging of config

### Fixes

- persist only custom config (and prune bloated config which might be causing bugs)

## v2.1.0

### Features

- Added non-partner parents to whakapapa tree

- Moved settings dialog/form into its own tab in EditNodeDialog
- Updated storage management in settings:
  - can now choose to prune hyperBlobs or not
  - can specify the max remote space hyperBlobs are allowed to use up before it prunes
- Settings
  - moved settings from profile page to the dialog where you edit your profile as a tab
  - more storage management settings
    - can now choose to prune hyperBlobs or not
    - can specify the max space remote hyperBlobs are allowed to use up before it prunes
- Create/Edit Community Dialog
  - pin tab headers to the top bar so they are visible on scroll

### Bug Fixes
- Fixes bug where creating/editing a community with joining questions failed because the field was removed from private community profiles
- Fixes bug where the edit profile button was hidden on mobile

## v2.0.2
- Fix bug where back button wasnt showing
- Updated profile page description labels

## v2.0.1
- Plug in new pataka codes for the new network

## v2.0.0

### Features
- **New network**:
  - **changed the apps network caps and home directory location**
- Record Permissions:
  - added some front end buttons to a record for setting a record to a specific group and different permissions
    - this still needs some backend to handle any changes so the options are currently disabled
- Permissions:
  - Added a permissions tabs to edit community profile dialog
    - this still needs some backend to handle any changes so the options are currently disabled
- Groups:
  - update ui when you create a new community
- Mobile changes:
  - artefact upload
  - hide actions when keyboard is open on mobile dialogs

### Bug Fixes
- updated the access button so that you cant change access to a story. To change access you now have to change the tribe
- changed the access button so that a user cannot select a different tribe when creating a record
## 1.6.0

### Features

- Can now add multiple members as kaitiaki to a group, any kaitiaki will be able to edit the Community, add/remove other kaitiaki and accept/decline applications to join the group
- Storage Management:
  - automatically prune hyperBlobs when the hyperBlobs total size exceeds 5gb
  - shows storage information in the settings
- Analytics:
  - reports version of app being used, so we can see how many people are on which versions of the app
- Delete Ahau:
  - Users have the option to delete their profile and database from the Settings dialog
  - Users need to enter a phrase to be able to delete
  - Takes Users to the login page when successfully deleted
- Story:
  - show a success message when deleting a story
- Whakapapa Tree/Registry:
  - Added ability to right click to open node context menu on desktop
  - Added ability to long press to open node context menu on mobile

  ### Bug Fixes

- fixed `ssb-profile` not allowing `headerImage` and `avatarImage` to be set to null
- fixed bug preventing node context menu from opening in whakapapa table
- fixed bug where you could no longer see profile information on a group application

## 1.5.1

### Bug Fixes

- fixed ssb-profile allow gender to be set to null (original blank state)
- app logs you straight in if you already have a profile

## 1.5.0

### Features

- Key backup:
  - Notification telling you to back up your keys (if you havent already)
  - Download key backup:
    - In the notification
    - In the settings dialog
- The main nav bar now shows connected tribes for quick navigation
- In tribe profile view you can now click on a member to view there profile info
- Updated Pataka onboarding
  - updated the Pataka dialog to provided users with other options
  - Users will now be prompted to join a Pātaka upon creating a profile 
- Translation updates

### Bug Fixes

- Fix bug where you couldnt create a new collection
- Fix mobile view for adding a person
- fix landing button
- fix mobile landing screen
- fix long community name on appbar on mobile
- fix long community names on profile.vie on mobile
- fix long emails in profile.vue
- fix showing tribes list if no tribes in appbar
- fix addPersonFormTitle translations
- Fixed bug causing selected locale to default to English when another language has been selected
- Updated the popup messages for consistency in style
- bugfix around public profiles
    - now impossible to accidentally publish private profile (e.g. phone number) to your public (unencrypted) profile) over graphql
    - ensure all public profiles have do not have private profile data in them

## v1.4.2

### Features

- Settings dialog in Profile Show
  - Change app language
- New translations

### Bug fixes

- Added install script to auto-install `VCRUNTIME140.dll` if it's missing during Windows install

## v1.4.1

### Bug fixes
- Small patch attempting to fix windows install bug (failed)


## v1.4.0

### Features
- new personal settings record
  - automatically finds or creates a personal settings record to store information about app settings:
    - current only storing information about whether your keys have been backed up
- Updated translations

### Bug fixes
- fix bug where all whakapapa werent listed on the main whakapapa page
- fix bug where mentioning a profile when creating/editing a story was potentially crashing the app
- fix archive page title
- update `ssb-ahau` to fix profile avatar upload bug

### Known Bugs

- fix profile picture upload not working

### Improvements

- move the pataka into its own repo

## v1.3.2

- adds anonymised usage analytics
- refactored collections helper / mixins > vuex
- easter-egg : locale picker

## v1.3.1

This updates `electron`, `electron-builder` and `electron-notarize`

## v1.3.0

### Features
- This adds `electron-updater` - a module which allows checking for updates automatically on startup.
  - Updates are downloaded in the background and installed when you close the app

### Bug fixes
- Timeline images not showing
- Deleting a story
- Member avatar only showing default avatar - female
- Download file name
    - When you downloaded a file, it wasnt saving with the filename
- Post code label on the create new community form
- Removed zoom from desktop artefact view
  - It was causing large images to not display correctly and sometimes get lost in the view
- Broken whakapapa list
  - Fixed an error where the whakapapa page wouldnt load when you deleted the community that has a whakapapa in it

### Improvements
- better story reloading


## v1.2.1

### Bug Fixes
- fixed a bug where partners and parents were being saved as children, resulting in an infinite loop - the whakapapa was stuck on the loading symbol
- fixed a bug where you couldnt upload an avatar image to any profile/whakapapa/collection
- fixed a bug where it wasnt displaying whakapapa images
- fixed a bug where it wasnt displaying collection images
- fixed a bug where the artefact video not displaying when viewing the artefact
- fixed a notification error when a group was deleted
  - this also fixed a bug where the join community button wasnt showing because of that error
- Fixed a ui problem where labels where showing incorrectly in the form for Add/View a persons information

### Known Bugs - Need Fixing
- Date Picker issue - cant save the same start and end date
- Images on timeline not showing
- Tribe member gender showing incorrectly
- Cannot delete a story
- Issue collapsing a person on the Tribal Registry
- TBC

---

## v1.2.0

### New Features
* Hyper blobs - large file upload
  * upload an artefact less than 150mb (was previously only 5mb)
* Partners
  * add a partner to a person
  * delete a partner from a person
  * edit a partner profile
* Quick add
  * when adding a person, you can add other people to them who are already in the whakapapa
* Ports
  * changed the default ports the graphql and ssb servers run on
* Add an existing person UI
  * changed the look of the populated form when you add a person and choose one of the suggestions
* TBC

### Known bugs - need fixing
* uploading an avatar to a profile - current shows an error and the upload fails
* date issue - setting a date of birth and date of death that are the same currently fails

---

## v1.1.0

### New Features
- can export whakapapa to csv
- add new profile fields skill, schools, and profile layout
- artifact zoomer on mobile
- can filter by name on table

### Bug Fixes 
- fix showing collection photos on stories
- fix date picker input 

---

## v1.0.1

### Bug Fixes
- display names: fixes a bug where there was no name being displayed when there was a full name but not a preferred name in the profile
    - automatically takes the first name in the full name if no preferred name is present OR displays "unknown" if no names are present
- suggested profiles: fixes the suggested profiles not being displayed in NewNodeDialog when tying a full name
- kaitiaki avatar showing wrong gender
- duplicate parents: fixes a bug where after adding a third parent, the ui was duplicating them showing duplicate partners in the whakapapa tree
- edit root node on focused partner: fixed a bug where you couldnt edit the root node on the whakapapa tree when focused on a partners whakapapa
- minor errors showing up in the console
- fixed issue with heuristic fragment matching (graphql)

### UI Fixes
- profile form preferredName: moves the text input field to the top of the form underneath full name
- declined applications
    - can now see declined applications in the notifications panel
    - can review declined applications
    - `request sent` button shows `request declined` when your application to join a community has been declined
    - the button becomes disabled now when you have requested to join or have been declined
 - back button:
    - back to archive button
 - wording changes around the app
    
---

## Version 1.0.0

**In this release, we have added**
- we have added to the ability to create collections. Collections can be used to group stories into different categories
- we have added a search and sort feature on the whakapapa table
- we have added the ability for a tribe to add community registration questions for improved verification

**We have also updated**
- the profile information section to include the place of birth, if deceased location buried and changed legal name to full name. We have also added a selection avatar for 'other' gender
- we have updated the date input to a dropdown list


