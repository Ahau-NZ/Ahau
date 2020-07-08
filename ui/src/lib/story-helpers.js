import gql from 'graphql-tag'
import pick from 'lodash.pick'
import { ARTEFACT_FRAGMENT } from './artefact-helpers'
import { PROFILE_FRAGMENT } from './profile-helpers'
import isEqual from 'lodash.isequal'
import isEmpty from 'lodash.isempty'
import clone from 'lodash.clonedeep'

export function SET_DEFAULT_STORY (newStory) {
  var story = clone(newStory)

  var artefacts = story.artefacts
  var mentions = story.mentions
  var contributors = story.contributors
  var relatedRecords = story.relatedRecords
  var timeInterval = ['', '']

  if (story.timeInterval) {
    timeInterval = story.timeInterval.split('/')
  }

  if (artefacts && artefacts.length > 0) {
    artefacts = artefacts.map(a => {
      return {
        ...a.artefact,
        linkId: a.linkId
      }
    })
  }

  if (mentions && mentions.length > 0) {
    mentions = mentions.map(m => {
      return {
        ...m.profile,
        linkId: m.linkId
      }
    })
  }

  if (contributors && contributors.length > 0) {
    contributors = contributors.map(c => {
      return {
        ...c.profile,
        linkId: c.linkId
      }
    })
  }

  if (relatedRecords && relatedRecords.length > 0) {
    relatedRecords = relatedRecords.map(r => {
      return {
        ...r.story,
        linkId: r.linkId
      }
    })
  }

  return {
    id: story.id,
    title: story.title,
    description: story.description,
    timeInterval: story.timeInterval,
    startDate: timeInterval[0],
    endDate: timeInterval[1],
    location: story.location,
    locationDescription: story.locationDescription,
    creator: story.creator,
    submissionDate: story.submissionDate,
    contributionNotes: story.contributionNotes,

    format: story.format,
    identifier: story.identifier,
    source: story.source,
    language: story.language,
    translation: story.translation,
    culturalNarrative: story.culturalNarrative,

    mentions,
    categories: story.categories,
    collections: story.collections,
    access: story.access,
    contributors,
    protocols: story.protocols,
    relatedRecords,
    artefacts
  }
}

export const EMPTY_STORY = {
  id: null,
  title: null,
  description: null,
  startDate: null,
  endDate: null,
  location: null,
  locationDescription: null,
  creator: null,
  contributionNotes: null,

  format: null,
  identifier: null,
  source: null,
  language: null,
  translation: null,
  culturalNarrative: null,

  mentions: [],
  categories: [],
  collections: [],
  access: [],
  contributors: [],
  protocols: [],
  relatedRecords: [],
  artefacts: []
}

export const PERMITTED_STORY_ATTRS = [
  'id',
  'type',
  'title',
  'description',
  'timeInterval',
  'submissionDate',
  'location',
  'contributionNotes',
  'locationDescription',
  'format',
  'identifier',
  'language',
  'source',
  'transcription'
]

export const PERMITTED_STORY_LINKS = [
  'mentions',
  // 'categories',
  // 'collections',
  // 'access',
  'contributors',
  // 'protocols',
  'relatedRecords',
  'artefacts'
  // 'creator'
]

export const STORY_FRAGMENT = gql`
  fragment StoryFragment on Story {
    ${PERMITTED_STORY_ATTRS}
  }
`

export const STORY_LINK_FRAGMENT = gql`
  ${ARTEFACT_FRAGMENT}
  ${PROFILE_FRAGMENT}
  fragment StoryLinkFragment on Story {
    artefacts: artefactLinks {
      linkId
      artefact {
        ...ArtefactFragment
      }
    }
    mentions: mentionLinks {
      linkId
      profile {
        ...ProfileFragment
      }
    }
    contributors: contributorLinks {
      linkId
      profile {
        ...ProfileFragment
      }
    }
    relatedRecords: storyLinks {
      linkId
      story {
        ...StoryFragment
        artefacts: artefactLinks {
          linkId
          artefact {
            ...ArtefactFragment
          }
        }
      }
    }
  }
`

export const GET_STORY = id => ({
  query: gql`
    ${STORY_FRAGMENT}
    ${STORY_LINK_FRAGMENT}
    query($id: ID!) {
      story(id: $id) {
        ...StoryFragment
        ...StoryLinkFragment
      }
    }
  `,
  variables: { id: id },
  fetchPolicy: 'no-cache'
})

// TODO: sort out type
export const GET_ALL_STORIES = ({
  query: gql`
    ${STORY_FRAGMENT}
    ${STORY_LINK_FRAGMENT}
    query {
      stories (type: "*") {
        ...StoryFragment
        ...StoryLinkFragment
      }
    }
  `,
  fetchPolicy: 'no-cache'
})

export const DELETE_STORY = (id, date) => ({
  mutation: gql`
    mutation ($input: StoryInput!) {
      saveStory (input: $input)
    }
  `,
  variables: {
    input: {
      id,
      tombstone: { date }
    }
  }
})

export const SAVE_STORY = input => {
  input = {
    type: '*', // TODO: sort out types
    ...pick(input, PERMITTED_STORY_ATTRS)
  }

  return {
    mutation: gql`
      mutation($input: StoryInput!) {
        saveStory(input: $input)
      }
    `,
    variables: { input }
  }
}

export function arrayChanges (array1, array2) {
  return array1.filter(item => {
    return !array2.some(item2 => item.id === item2.id)
  })
}

export function GET_CHANGES (initial, updated) {
  console.log(initial, updated)
  var changes = {}

  Object.entries(updated).forEach(([key, value]) => {
    if (!isEqual(updated[key], initial[key])) {
      switch (true) {
        case Array.isArray(updated[key]):
          // initiate add remove arrays to tell us what to add or remove
          changes[key] = { add: [], remove: [] }

          // go through all the new values in the array
          updated[key].forEach(newVal => {
            // try find it in the initial array
            var oldVal = initial[key].find(og => {
              return og.id === newVal.id
            })
            if (oldVal) {
              var valuesChanges = GET_CHANGES(oldVal, newVal)
              if (!isEmpty(valuesChanges)) {
                // ensure we include the linkId incase it needs to be deleted...
                changes[key].add.push({ id: oldVal.id, ...valuesChanges, linkId: oldVal.linkId })
              }
            } else {
              // its a new one
              changes[key].add.push(newVal)
            }
          })

          // get all the items that were deleted
          changes[key].remove = arrayChanges(initial[key], updated[key])

          // remove add or remove if theyre empty
          if (isEmpty(changes[key].add)) delete changes[key].add
          if (isEmpty(changes[key].remove)) delete changes[key].remove

          // if there were no changes, then remove the add/remove
          if (isEmpty(changes[key])) delete changes[key]
          break

        default:
          changes[key] = value
      }
    }
  })

  // Update the submissionDate with the new record
  var submissionDate = new Date().toISOString().slice(0, 10)
  changes.submissionDate = submissionDate

  return changes
}
