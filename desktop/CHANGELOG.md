# Changelog | Ahau desktop

## v2.29.1

### Fixes

- Fixes issue with auto-presentation being called for registrations to tribes that are issuing only

## v2.29.0

### Features

- Connectionless Issuance and Presentation/Verification
  - Updates credential flow to use the connectionless approach, reducing the steps in the tribal registration onboarding with issuance or presentation of credentials.
  - Adds new documentation to ssb-atala-prism

## v2.28.0

### Features

- Updates ssb-atala-prism
  - Updates atala prism wallet SDK to version v6.1.0
  - Adds better validation around the Issuer, Verifier and Mediator being used.
- Beta Settings in the Tribe Settings
  - Allow users to view and copy the tribeId
  - Allow users to view and copy the ssb config file path
  - Allow users to see recommended config they would need to add to their config file, to enable verified credentials for the current tribe they are viewing.
  > Note: these new features are only viewable from the electron window
- Wallet Activity Feed
  - Adds a new activity feed to the verified credentials wallet

### Fixes

- Stops registration from being approved if the credential offer wasnt not successfully sent

## v2.27.3

### Fixes

- Fix bug where custom field ordering in the DataModel wasnt working correctly
  - Custom fields without an order set previously or by default will now show up without an order
  - When choosing an order, the number will go up to the last custom field with an order

## v2.27.2

### Fixes

- Fix authorship issue where multiple authors were getting into a forked state and were being classed as invalid author, due to simultaneous updates to the same record
- Fix issue with registration form to join a tribe getting stuck on the first step when there were required custom fields
  - NOTE: if this fix introduces other issues, we should relax required custom fields on the registration form.

## v2.27.1

### Fixes

- Fix issues with atala prism not starting
- Fix broken wallet UI

## v2.27.0

### Features

- custom field ordering for web-registration form
- presentation to verifier using pasted oob link - galaxy maps prototype

### Fixes

- loading spinner in mobile now works :D
- credentials look more like drivers license now
  - based on community feedback from Whangaroa Papa Hapū
  - shows photo of associated Āhau profile

## v2.26.1

### Fixes

- patch update `ssb-invite` (`rcp.close` callback)
- revert to `ip@1.1.8` which has vulerabilities but doesn't throw on domain
  names!
- minor update `ssb-hyper-blobs` (use a new DHT bootstrap node that we run,
  instead of the default ones that have been taken down. Fixes sharing of large
  artefacts
- patch update `ssb-atala-prism`

## v2.26.0

### Features

- tribes can now issue and request verifiable credentials. This setting is
  toggled in the tribe settings (requires config setup, please get in touch if
  you're interested)
- updated translations and added machine translation of Dutch language

## v2.25.6

### Patches

- install `ssb-ahoy@6.1.1` which downgrades to `secret-stack@6` to fix
  incompatability with `ssb-replicate`

## v2.25.5

### Patches

- fixes an infinite loop in `ProfileForm` causing dialogs like `SideNodeDialog`
  and `NewPersonDialog` to crash
- removes .woff files from roboto-latin
- translations

## v2.25.4

### Patches

- fix `esbuild` setup
- drop un-needed fonts

## v2.25.3

This is a reversions of the electron updates in v2.25.x It's v2.24.1 plus
notarazing updates, plus intial replication updates

## v2.25.2

### Patches

- fixed `sodium-native` monkey patch (needed `sodium_free`)
- fixed Mixpanel ENV missing

## v2.25.1

### Patches

- fixed dependencies that were blocking esbuild

## v2.25.0

### Features

- submissions for proposing profiles to be ignored from a whakapapa

### Updates

- `ssb-friends` updated - fixes initial sync
- `electron` upgraded to version 26
- `electron-builder` updated
  - NOTE change in ENV vars for Mac
- `secret-stack` updated to version 7
- replaced `noderify` with `esbuild`
- translations updated

### Patches

- refactored tribe data field editing to be cleaner

## v2.24.1

### Bug Fix

- messed up the merge order and last fix did not make it into release :facepalm:

## v2.24.0

### Features

- add ability to block a Pataka
- (dev-tools): add vite-inspector tool

### Updates

- update translations
- tidy up dependencies, linting
- tidy assets
  - delete unused assets
  - compress `.svg` files
  - convert all images to `.webp`
- to some linting
  - renamed "reserved name" components (e.g. `Header`, `Dialog`)

### Bug Fix

- stop Ahau never launching first time! (Fix to the last fix)


## v2.23.0

### Bug Fix

- Stop Ahau launching multiple times and causing noisy errors (mainly seen on
  windows)

### Updates

- translations from Crowdin

### Upgrades

- upgraded modules
  - `d3`
  - `lodash.*` > `lodash-es`
  - `vuejs-clipper`
  - many other minor/patch updates
- transitioned from `@vue/cli` > `vite`
  - lightning fast ui dev + build
  - dropped a lot of modules no longer needed
  - new shims needed:
    - `node-stdlib-browser`
    - `unplugin-vue-components`


## v2.22.0

### Features

- Submissions
  - added select all and unselect all when approving fields

### Bug Fixes

- Whakapapa
  - Fixed showing birth parents from the same whakapapa (with secondary links)
- Submissions
  - Fix bug where approveBy and rejectedBy were renamed and causing an error
  - Fix issue with Altnames causing error on the submission approval process
- Profiles
  - Fix bug where csv download was erroring

## v2.21.0

### Features

- Submissions
  - Allow users to delete submissions by clicking into the submission from the
    notification panel, and pressing the delete this submission button. This
    will also remove it from the notifications panel.
- Web Forms
  - Ahau can now receive submissions from a web registration form to create
    profiles for people within a tribe. The web registration form needs to be
    set up with the Pātaka.

## v2.20.0

### Improvements

- put padding below alert snackbar
- put a max-width on the side navigation menu

### Features

- Submissions
  - Allow submissions to save a profileId as a reference for future submissions
    features. This profileId will allow you to see what exactly was changed when
    a submission was approved to edit a profile.
  - Disable ability to any new people to a whakapapa if you are not the kaitiaki
    - This is because we havent implemented submissions to do that yet. Members
      can only create submissions to edit a profile at the moment.

### Bug Fixes
- Adding a new person adds them as the youngest sibling by default
- fixed an `ssb-friends` replication error

## v2.18.1

### Bug Fixes

- New version built to debug a windows installer

## v2.18.0 ### Features

- Submissions
  - Kaitiaki can create submit-only whakapapa
  - Members can make submissions to a submit-only whakapapa to update records.
    NOTE: This feature is still a work in progress and some pieces are missing.
- Custom Fields
  - Kaitiaki can now add custom fields to a tribe
  - Members can provide custom field values when registering for a tribe
  - Custom fields are viewable across the app and get be edited like any other
    field
  - Kaitiaki can set the visibility of a custom field
  - Hide admin-only fields from members
  - CSV Import/Export now supports custom fields. When a new field is imported
    in a csv, it is added as a custom field

### Improvements

- Better "cleaning up" of tombstoned profiles
- Better testing around csv import/export

### Bug Fixes

- fix bug where the dialog for creating a new person would open at the bottom of
  the form instead of the top
- fix bug clearing the person index when switching tribes
- fix error in display of altnames
- Table:
  - fix bug where whakapap table is not loading
  - fix Table not showing adminProfile fields on initial load
- Person Index:
  - fix bug where admin profiles were not not showing correctly
  - fix bug where it wasnt reloading correctly
  - fix person list profile loading and merging
  - fix dates not showing
- Custom Fields:
  - fix bug where members couldn't create a new group profile with custom fields

## v2.17.0

### Features
* can now add people direct to people database

### Bug Fixes
* improved whakapapa to svg printing
* improved loading large whakapapa charts
* fixed getting adminProfiles in personIndex ## v2.16.1

### Bug Fixes
* fixed correct partner spacing
* fixed updating whakapapa count

Tweak Feature
* changed the installer names-pattern

## v2.16.0

### Features
* added "export to SVG" for whakapapa graphs

### Improvements
* better layout for complex multi-partner scenarios
* better relationship line layout

### Bug Fixes
* fixed auto-updating for windows (this version onwards should work)


## v2.15.0

### Features
* added option to select whether a member can edit or view a whakapapa record
* auto open sideNodeDialog when clicking on a person, add
* update whakapapa card in whakapapa index to show whakapapa permissions
* members cannot update view only records ### Bug Fixes
- fixed sorting of children
- fixed sorting of partners
- SideNodeDialog now showing admin fields for admin users
- NewRegistrationDialog now recongnises required DOB inputs

## v2.14.2

patched a bug introduced by ssb-tribes removing deprecated `application` API -
this was still used in ssb-ahau's database migrations

## v2.14.0

### Features

- tree search bar
    - uncollapses all nodes from the root/focus node to the searched profile
    - highlights the path
- error handling
    - network / graphql errors will now open a little alert (for whakapapa
      queries)
- custom community fields
    - admins can now set "custom fields" for tribes.
    - these are fields which people will be able to fill in in a future release
    - TODO
        - connecting it to person profile
        - connecting it to group registrations
- highlight-path from root node ==> searched node
    - also uncollapses path to this

## Improvements

- faster graph loading
    - reworked data loading to significantly speed up whakapapa loading for
      large graphs
- styling improved
    - person list

## Bug Fixes

- group tangle bug
    - Ben had a group which had out of control tangle meta-data (too many
      "previous" messages referenced)
    - added a fix which ensures message never exceeds size limit because of this
      meta-data
- updating items on person-list

### Improvements

- show timeline button on mobile Persons list
  - improve ui for mobile
  - update search bar and title to be consistent with existing styling
    WhakapapaIndex
  - update the whakapapa cards to be the same as the collection cards when on
    mobile

## v2.13.0

### Features

* added images and multiple filter and toggle columns on peoples list
* removed the background color on the whakapapa icons
* added a loader whakapapa show when loading profiles and connections
* added a loader in place of the node menu on a person when a whakapapa is still
  loading. This limits what a user can do when a graph is still loading and will
  prevent the graph trying to make changes while loading

## Bug Fixes

* removed the toggle timeline/archive button when there are no stories
* fixed a csv import bug where the where it was importing properly if a person
  was in the csv more than once
* changed how we get and load the node profiles in a graph to speed up whakapapa
  loading

### Improvements

* disabled the scroll on peoples list
* moved table filters to a lib so i could use the filter functionality in the
  peoples list
* added all profiles to store to enable faster loading of whakapapas
* changed the auto collapse language to expand and inverted the value to make
  sense
* put a little expand transition on the whakapapaShow search bar and buttons as
  they swap out with the loader when its finished loading

## v2.12.0

### Features

- Peoples list
  - added feature to import people into database with having
    relationships/parent information
  - added feature to export people from database to csv
  - can now click on a row to view that person
  - changed the default rows to show more
- Updated the progress circle to show progress and a label
- Moved timeline navigation from side menu into Stories
- Added connected patakas to your profile page
- Changed the connect pataka text to join network
- Toggling community features
  - Kaitiaki can now turn on/off features including archive, whakapapa, persons
    list
- Changed edit profile button to "tribe settings" when in a tribe, or "account
  settings" when on your profile
- More translations
- Search Bar
  - changed the search bar in the whakapapa to search the database instead of
    the tree

### Bug Fixes

- fix bug where it would hide kaitiaki-only buttons because the calculation was
  wrong
- fix bug where you couldnt search for collections when creating/updating a
  story
- fix bug where it was creating duplicate profiles when editing an admin profile
- fix bug where migrations were sometimes failing, preventing someone from using
  the app

## v2.11.0

### Features

- Peoples list
  - can now delete a person from the persons list
- More translations

### Bug Fixes

- fix persons list icon and text for different screen sizes
- fix incorrect text in the DeleteNodeDialog
- fix bug where you couldnt edit education or school from the SideNodeDialog

## v2.10.0

### Features

- whakapapa (family tree) view:
    - added ability to turn off "auto-collapsing" of nodes
        - when turned off, all nodes and all future nodes added will be
          uncollapsed
- person list view for a tribe
    - a searchable table of all profiles (of type 'person.group') in a group
    - only accessible to kaitiaki
    - searchable
    - edit dialog

### Bug Fixes

- registration form
    - fixes ui for joining questions
    - add placeholders
    - hide comments section when there are no comments

## v2.9.6

### Bug Fixes

- Fixes issues where the app wasnt starting up when starting from a new user

## v2.9.5

### Features

- you can now search for people who have a macron, without using macrons in the
  search text

### Bug Fixes

- fix bug where you couldnt search for people who have a macron in their name
- fix error when opening your personal profile in the SideNodeDialog

## v2.9.3

### Bug Fixes

- fix bug in 2.9.2 where default icons werent loading in production

## v2.9.2

### Features

- updated various front-end dependencies

### Bug Fixes

- fixed bug where ignored profiles werent showing up in the SideNodeDialog
- fixed bug where partner nodes were sometimes overlapping
- fixed bug where partner links were on the same y-axis
- fixed errors in the console when opening the SideNodeDialog
- fixed text on a WhakapapaViewCard that said "1 people" instead of "1 person"
- fixed a bug when adding a person using the quick add feature wasnt applying a
  change in the relationshipType

## v2.9.1

### Features

### Bug Fixes

- fix bug in NewNodeDialog that may have resulted in duplicate profiles not
  being detected
- fix loading spinner on rebuild + made it easier to read the percentage
- fix bug where it was suggesting people to add in NewNodeDialog that were
  already there
- fix bug where it wasnt suggesting to add partners children in NewNodeDialog
- fix bug where it wasnt allowing you to select a relationshipType in
  NewNodeDialog
- fix bug where it wasnt showing some whanau members in the SideNodeDialog
- fix bugs where deleting links wouldnt update the tree
- fix bugs where important links werent being displayed correctly (NOTE: there
  are still some existing bugs)

## v2.9.0

### Features

- selected node in whakapapa is now highlighted
- graph loads first 2 generations
    - click ... to expand another 2 generations
    - if there are less than 10 profiles loaded, keep loading generations till
      at least 10 are loaded
    - graph loads much faster!
- select a partner and the graph loads their ancestors
    - currently follow the first ancenstor link created for that node. can
      customise this in future


### Bug Fixes

- if you're a kaitiaki and edit a profile, it now correctly updates details in
  the graph
    - bug was that it was saving to kaitiaki subgroup (and those details aren't
      shown in UI)
- fixed personal group whakapapa import
    - discovered that the process was failing when it tried to save contact
      details there
    - contact details are currently not saved in personal group, but import
      doesn't crash
- fixed "show exteneded family" edge case with whangai links


## v2.8.0

Major refacor of the graph loading

Features:
- hovering on a node in whakapapa highlights the childLinks for that node
- added ability to search for partners within the graph

## v2.7.1

### Features

- csv import/export fields
    - partners
    - images
    - email,phone,address (NOTE: kaitiaki-only whakapapa dont handle these well
      yet)

### Bug fixes

- windows code signing: expand publisherName to include two different Ahau
  spellings
- cancel loading when closing a whakapapa tree
- stop infinite looping on a whakapapa tree when loading other parents

## v2.7.0

### Features

- allow improved editing/deleting relationships
- allow kaitiaki-only whakapapa
- added CI testing

### Bug Fixes

- fixed creating important relationships and filtering for duplicate partners
- fix loading spinner, more relaxed polling

## v2.6.2 ### Features

- set AppBar to be visble over the loading spinner
- improve whakapapa loading times
- update important relationships to handle different types
- change UI so whakapapaViews only loaded for current tribe
- new translations
- hide less important links when their parent is collapsed

### Bug Fixes

- fix bug where it was classing partner children as duplicates
- fix bug where when a whakapapa was closed it tried saving the record count
  when you werent a kaitiaki
- better protection against infinite whangai loops
- fix bug where navigating to the archive of a person was broken
- fix tribal registry to use adminProfile correctly

## v2.6.1

- various bug fixes and ui improvements ## v2.6.0

### Features

- Added options to whakapapa view to hide avatars and show extended family

### Fixes

- Can add duplicate profiles to whakapapa
- Fixed other parent whakapapa links
- Updated parent links and nodes for better alignment and less crossover


## v2.3.0

### Bug Fixes

- Prevent recursive loops from ocurring in whakapapa tree ### Features

- Updated table side menu controls who tribal registry
- Added partners to ProfileShow.vue
- Added partners column to whakapapa table
- Can now click on a partner in whakapapa table to show that person in
  SideNodeDialog.vue
- Added frontend for custom Data Model
- Added options to whakapapa view to hide avatars and show extended family

### Fixes
- Now shows an error when trying to create a record that is too big for the
  current limit   
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
- Can now click related collection in StoryCard.vue and the related collection
  will show
- Added 'Related to {Relative name} by' in whakapapa registry
- Show loading symbol when the database is rebuilding
- Can now create new stories when viewing a collection and saving that story
  adds it to that collection
- Added location, skills and age filters to whakapapa table FilterMenu.vue
- Added partners to SideNodeDialog.vue
- new translations
- clearing logging of config

### Fixes

- persist only custom config (and prune bloated config which might be causing
  bugs)

## v2.1.0

### Features

- Added non-partner parents to whakapapa tree

- Moved settings dialog/form into its own tab in EditNodeDialog
- Updated storage management in settings:
  - can now choose to prune hyperBlobs or not
  - can specify the max remote space hyperBlobs are allowed to use up before it
    prunes
- Settings
  - moved settings from profile page to the dialog where you edit your profile
    as a tab
  - more storage management settings
    - can now choose to prune hyperBlobs or not
    - can specify the max space remote hyperBlobs are allowed to use up before
      it prunes
- Create/Edit Community Dialog
  - pin tab headers to the top bar so they are visible on scroll

### Bug Fixes
- Fixes bug where creating/editing a community with joining questions failed
  because the field was removed from private community profiles
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
  - added some front end buttons to a record for setting a record to a specific
    group and different permissions
    - this still needs some backend to handle any changes so the options are
      currently disabled
- Permissions:
  - Added a permissions tabs to edit community profile dialog
    - this still needs some backend to handle any changes so the options are
      currently disabled
- Groups:
  - update ui when you create a new community
- Mobile changes:
  - artefact upload
  - hide actions when keyboard is open on mobile dialogs

### Bug Fixes
- updated the access button so that you cant change access to a story. To change
  access you now have to change the tribe
- changed the access button so that a user cannot select a different tribe when
  creating a record ## 1.6.0

### Features

- Can now add multiple members as kaitiaki to a group, any kaitiaki will be able
  to edit the Community, add/remove other kaitiaki and accept/decline
  applications to join the group
- Storage Management:
  - automatically prune hyperBlobs when the hyperBlobs total size exceeds 5gb
  - shows storage information in the settings
- Analytics:
  - reports version of app being used, so we can see how many people are on
    which versions of the app
- Delete Ahau:
  - Users have the option to delete their profile and database from the Settings
    dialog
  - Users need to enter a phrase to be able to delete
  - Takes Users to the login page when successfully deleted
- Story:
  - show a success message when deleting a story
- Whakapapa Tree/Registry:
  - Added ability to right click to open node context menu on desktop
  - Added ability to long press to open node context menu on mobile

  ### Bug Fixes

- fixed `ssb-profile` not allowing `headerImage` and `avatarImage` to be set to
  null
- fixed bug preventing node context menu from opening in whakapapa table
- fixed bug where you could no longer see profile information on a group
  application

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
- Fixed bug causing selected locale to default to English when another language
  has been selected
- Updated the popup messages for consistency in style
- bugfix around public profiles
    - now impossible to accidentally publish private profile (e.g. phone number)
      to your public (unencrypted) profile) over graphql
    - ensure all public profiles have do not have private profile data in them

## v1.4.2

### Features

- Settings dialog in Profile Show
  - Change app language
- New translations

### Bug fixes

- Added install script to auto-install `VCRUNTIME140.dll` if it's missing during
  Windows install

## v1.4.1

### Bug fixes
- Small patch attempting to fix windows install bug (failed)


## v1.4.0

### Features
- new personal settings record
  - automatically finds or creates a personal settings record to store
    information about app settings:
    - current only storing information about whether your keys have been backed
      up
- Updated translations

### Bug fixes
- fix bug where all whakapapa werent listed on the main whakapapa page
- fix bug where mentioning a profile when creating/editing a story was
  potentially crashing the app
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
- This adds `electron-updater` - a module which allows checking for updates
  automatically on startup.
  - Updates are downloaded in the background and installed when you close the
    app

### Bug fixes
- Timeline images not showing
- Deleting a story
- Member avatar only showing default avatar - female
- Download file name
    - When you downloaded a file, it wasnt saving with the filename
- Post code label on the create new community form
- Removed zoom from desktop artefact view
  - It was causing large images to not display correctly and sometimes get lost
    in the view
- Broken whakapapa list
  - Fixed an error where the whakapapa page wouldnt load when you deleted the
    community that has a whakapapa in it

### Improvements
- better story reloading


## v1.2.1

### Bug Fixes
- fixed a bug where partners and parents were being saved as children, resulting
  in an infinite loop - the whakapapa was stuck on the loading symbol
- fixed a bug where you couldnt upload an avatar image to any
  profile/whakapapa/collection
- fixed a bug where it wasnt displaying whakapapa images
- fixed a bug where it wasnt displaying collection images
- fixed a bug where the artefact video not displaying when viewing the artefact
- fixed a notification error when a group was deleted
  - this also fixed a bug where the join community button wasnt showing because
    of that error
- Fixed a ui problem where labels where showing incorrectly in the form for
  Add/View a persons information

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
  * when adding a person, you can add other people to them who are already in
    the whakapapa
* Ports
  * changed the default ports the graphql and ssb servers run on
* Add an existing person UI
  * changed the look of the populated form when you add a person and choose one
    of the suggestions
* TBC

### Known bugs - need fixing
* uploading an avatar to a profile - current shows an error and the upload fails
* date issue - setting a date of birth and date of death that are the same
  currently fails

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
- display names: fixes a bug where there was no name being displayed when there
  was a full name but not a preferred name in the profile
    - automatically takes the first name in the full name if no preferred name
      is present OR displays "unknown" if no names are present
- suggested profiles: fixes the suggested profiles not being displayed in
  NewNodeDialog when tying a full name
- kaitiaki avatar showing wrong gender
- duplicate parents: fixes a bug where after adding a third parent, the ui was
  duplicating them showing duplicate partners in the whakapapa tree
- edit root node on focused partner: fixed a bug where you couldnt edit the root
  node on the whakapapa tree when focused on a partners whakapapa
- minor errors showing up in the console
- fixed issue with heuristic fragment matching (graphql)

### UI Fixes
- profile form preferredName: moves the text input field to the top of the form
  underneath full name
- declined applications
    - can now see declined applications in the notifications panel
    - can review declined applications
    - `request sent` button shows `request declined` when your application to
      join a community has been declined
    - the button becomes disabled now when you have requested to join or have
      been declined
 - back button:
    - back to archive button
 - wording changes around the app

---

## Version 1.0.0

**In this release, we have added**
- we have added to the ability to create collections. Collections can be used to
  group stories into different categories
- we have added a search and sort feature on the whakapapa table
- we have added the ability for a tribe to add community registration questions
  for improved verification

**We have also updated**
- the profile information section to include the place of birth, if deceased
  location buried and changed legal name to full name. We have also added a
  selection avatar for 'other' gender
- we have updated the date input to a dropdown list
