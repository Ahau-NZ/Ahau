import gql from 'graphql-tag'
import pick from 'lodash.pick'
import { ARTEFACT_FRAGMENT } from './artefact-helpers'
import { AUTHOR_FRAGMENT, PERSON_FRAGMENT, PUBLIC_PROFILE_FRAGMENT } from './person-helpers'
import { parseInterval } from './date-helpers'
import isEqual from 'lodash.isequal'
import isEmpty from 'lodash.isempty'
import clone from 'lodash.clonedeep'
import uniqby from 'lodash.uniqby'

export function setDefaultStory (newStory) {
  var story = clone(newStory)

  var artefacts = story.artefacts
  var mentions = story.mentions
  var contributors = story.contributors
  var creators = story.creators
  var relatedRecords = story.relatedRecords

  function mapLinks (link, entity) {
    return {
      ...link[entity],
      linkId: link.linkId
    }
  }

  if (artefacts && artefacts.length > 0) {
    artefacts = artefacts.map(d => mapLinks(d, 'artefact'))
  }

  if (mentions && mentions.length > 0) {
    mentions = mentions.map(d => mapLinks(d, 'profile'))
  }

  if (contributors && contributors.length > 0) {
    contributors = contributors.map(d => mapLinks(d, 'profile'))
  }

  if (creators && creators.length > 0) {
    creators = creators.map(d => mapLinks(d, 'profile'))
  }

  if (relatedRecords && relatedRecords.length > 0) {
    relatedRecords = relatedRecords.map(d => mapLinks(d, 'story'))
  }

  return {
    id: story.id,
    title: story.title,
    description: story.description,
    timeInterval: story.timeInterval,
    location: story.location,
    locationDescription: story.locationDescription,
    submissionDate: story.submissionDate,
    contributionNotes: story.contributionNotes,

    format: story.format,
    identifier: story.identifier,
    source: story.source,
    language: story.language,
    translation: story.translation,
    // culturalNarrative: story.culturalNarrative,

    mentions,
    categories: story.categories,
    collections: story.collections,
    // access: story.access,
    contributors,
    creators,
    protocols: story.protocols,
    relatedRecords,
    artefacts,
    kaitiaki: story.kaitiaki
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
  // access: [],
  contributors: [],
  creators: [],
  protocols: [],
  relatedRecords: [],
  artefacts: [],
  timeInterval: null,
  submissionDate: null
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
  'transcription',
  'canEdit',
  'recps'
]

export const PERMITTED_STORY_LINKS = [
  'mentions',
  // 'categories',
  // 'collections',
  // 'access',
  'contributors',
  // 'protocols',
  'relatedRecords',
  'artefacts',
  'creators'
]

export const STORY_FRAGMENT = gql`
  fragment StoryFragment on Story {
    ${PERMITTED_STORY_ATTRS}
  }
`

export const STORY_LINK_FRAGMENT = gql`
  ${ARTEFACT_FRAGMENT}
  ${PERSON_FRAGMENT}
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
    creators: creatorLinks {
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

export const getStory = id => ({
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

export const getAllStories = ({
  query: gql`
    ${STORY_FRAGMENT}
    ${STORY_LINK_FRAGMENT}
    query {
      stories(type: "*") {
        ...StoryFragment
        ...StoryLinkFragment
      }
    }
  `,
  fetchPolicy: 'no-cache'
})

export const getAllStoriesByMentions = id => ({
  query: gql`
    ${STORY_FRAGMENT}
    ${STORY_LINK_FRAGMENT}
    query($id: String!) {
      person(id: $id) {
        mentions: mentionLinks {
          linkId
          story {
            ...StoryFragment
            ...StoryLinkFragment
          }
        }
      }
    }
  `,
  variables: {
    id
  },
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

export const saveStory = input => {
  var submissionDate = new Date().toISOString().slice(0, 10)

  input = {
    type: '*', // TODO: sort out types
    ...pick(input, PERMITTED_STORY_ATTRS),
    submissionDate
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

function findItemById (initialArray, itemToFind) {
  if (!itemToFind.id) return null
  return initialArray.find(existingItem => {
    return existingItem.id === itemToFind.id
  })
}

export function GET_CHANGES (initialValue, updatedValue) {
  var changes = {}

  if (isEqual(initialValue, updatedValue)) return changes

  Object.entries(updatedValue).forEach(([key, value]) => {
    if (key === 'kaitiaki') return
    // see if the value has changes
    if (!isEqual(initialValue[key], updatedValue[key])) {
      switch (true) {
        // the value is an array
        case Array.isArray(updatedValue[key]):
          // intiate the array to add, remove fields
          changes[key] = { add: [], remove: [] }
          var newItems = []
          updatedValue[key].forEach(newItem => {
            // if the item already exists
            var oldItem = findItemById(initialValue[key], newItem)

            if (oldItem) {
              // only get what changed...
              var itemChanges = GET_CHANGES(oldItem, newItem)

              // only add if there are changes
              if (!isEmpty(itemChanges)) {
                newItem = { id: newItem.id, linkId: newItem.linkId, ...itemChanges }
                changes[key].add.push(newItem)
              }
            } else {
              newItems.push(newItem)
            }
          })

          changes[key].remove = arrayChanges(initialValue[key], updatedValue[key])

          // remove dupes (if any) from the add array
          changes[key].add = uniqby(changes[key].add, 'id')

          // add new items to add array
          changes[key].add = [...changes[key].add, ...newItems]

          // remove dupes from remove array
          changes[key].remove = uniqby(changes[key].remove, 'id')

          // remove add or remove if theyre empty
          if (isEmpty(changes[key].add)) delete changes[key].add
          if (isEmpty(changes[key].remove)) delete changes[key].remove
          break
        // use default for non arrays
        case key === 'duration':
          changes[key] = parseInt(value)
          break
        case key === 'timeInterval':
          changes[key] = parseInterval(value)
          break
        default:
          changes[key] = value
      }
    }
  })

  return changes
}
