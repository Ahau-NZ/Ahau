# Web Registration

This is the process of a person visiting a website in order to register with a
group. The expected outcome is that their registration is processed by a
kaitiaki, and an associated profile is createed for the group. NOTE, the person
registering will not have their own Ahau account. If a person is expecting that,
they should complete the registration with the Ahau app.

- V1 - Will connect web registrations to the Ahau software
- V2 - Will enable verifiable presentations as apart of the registration process  

## User Stories

### Hapu kaitiaki sets up web registration

Requirements:
- Pataka installed
- static IP address
- custom domain (ideal, not required)
- Ahau instance with a tribe set up
    - must be connected with the Pataka
    - tribe should have customFields / joiningQuestions set up

You will need to do some setup:
- set up pataka config file
- set up port forwarding

see https://gitlab.com/ahau/pataka#config

### Hapu member fills in web registration

This story describes roughly how we expect this to work for WPH which may have a
shared papa hapu pataka, but distinct hapu groups within that.

1. user visits e.g. register.wph.nz
    - page is served by pataka running at that domain
2. user selects the hapu they want to register
    - fetch groups/tribes from pataka graphql API
    - NOTE:
        - it's possible to confugre the pataka to only offer registration for
          certain tribes
        - if there is only one tribe supported, there is no selection page, you
          are redirected immediately to the new registration page
3. user fills in hapu form, and submits
    - customFields, joiningQuestions questions fetched from API
    - submission mutation sent to API `proposeNewGroupPerson`
        - may need to make `proposeNewGroupPersonFromOutside`
        - OR `proposeNewGroupPerson` default to encrypting with `poBoxId` if
          peer isn't in group (pataka is not)

```
mutation proposeNewGroupPerson (
  input,
  groupId,
  source,      // webForm
  moreInfo     // joiningQuestions
)

```
4. server catches this mutation and creates a submission
5. kaitiaki receives the submission
6. kaitiaki accepts/ rejects
    - profile is created with `source: webForm`
    - using `savePerson` automatically takes care of group/admin aspects of
      profile

## Architecture

NOTE: we are NOT using `ssb-tribes-registration`, we're using `ssb-submissions`

1. pataka changed such that they
    - have an awareness of groups they are hosting
    - they serve a web-form
        - you can pick a group to submit a registration to
        - the form loaded reflects the "custom fields" of that group
    - completing that form => creation of a new profile `submission` sent to kaitiaki
        - NOTE this `submission` must be marked as `source: webForm`
2. kaitaiki process the submission
    - only up to date apps display this new type of registration (technically a submission)
    - on acceptance
        - a new group profile is made using `savePerson`
        - the submission is marked as accepted, and links to the profile created
        - NO `group/add-member` is performed

### Changes 

<details>
  <summary>High level changes to behaviour</summary>

- pataka:
    - must be able to encrypt messages to POBox
        - ideally still cannot decrypt (saves processing)
    - must provide new API (graphql)
        - get groups you can register to
        - get registration details for group
        - create a submission
            - new field `source`
            - single recp: poBoxId of group
    - serve a form over a new port

- ahau:
    - just another submission, but with new data about `source`
    - registration API
        - new field to indicate where this is from
           ```
           type Submission {
             ....
             source: SubmissionSource`
           }

           enum SubmissionSource {
             ahau
             webForm
           }
           ```
        - ensure old API does not present these new webForm registrations
           - schema _should_ handle this
        - on accept, this new type should behave differently
           - create profile
           - DO NOT ADD pataka TO THE GROUP! (they submitted it)
</details>

<details>
  <summary>Modules modified to acheive change in behaviour</summary>

- [x] `ssb-submissions`
    - add new field `moreInfo` to allow sending of responses to `joiningQuestions`
    - add a new field `source` field to registrations
        - :fire: this is important to make these new registrations NOT flow into
          old versions of ahau, get approved, then to add the pataka to the
          group!
        - optional field (not set implies from ahau app)

- [x] `@ssb-graphql/submissions`
    - add `moreInfo` to ProfileGroupPerson
    - add `source` to ProfileGroupPerson

- [x] `ssb-profile`
    - add new field "source" or similar
        - TODO check how this fits with the architecture of
          verified/registered/etc.

- [x] `@ssb-graphql/profile`
    - add `source` to ProfileGroupPerson

- [x] `pataka`, `pataka-cli`
    - add encryption capacity from `ssb-tribes` (but not decryption if possible)
    - add updated `ssb-submissions`
    - add updated `ssb-profile`
    - add updated `ssb-pataka`

- [x] `ssb-pataka`
    - add UI for form
    - add web form server (to serve form)
        - should run on a different port than the admin UI, and have different
          CORS (wide open for this one)
        - consider adding config to allow this to be toggled
    - allow graphql queries from the domain the pataka is serving the registration at
    - add updated `@ssb-graphql/submissions`
    - add updated `@ssb-graphql/profile`

</details>

## Future ideas

### Prompt to use Ahau when it's installed

If a person visited e.g. register.wph.nz and they have Ahau installed, then they
should get a popup saying "open this in Ahau".

This could be achieved in a number of ways:
- registering URL handlers
- Ahau running a localhost server which the website "pings"
  - requires Ahau is running

### Spam protection

These forms could be used to abuse the system by creating millions of submissions.
We could/ should rate-limit the creation of submissions, maybe by ip address?


