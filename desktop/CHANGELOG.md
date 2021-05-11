# Changelog | Ahau desktop

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

