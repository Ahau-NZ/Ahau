import gql from 'graphql-tag'
import pick from 'lodash.pick'
import { ARTEFACT_FRAGMENT } from './artefact-helpers'
import { PERSON_FRAGMENT } from './person-helpers'
import clone from 'lodash.clonedeep'

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

export const getAllStories = filter => ({
  query: gql`
    ${STORY_FRAGMENT}
    ${STORY_LINK_FRAGMENT}
    query ($filter: StoryFilter) {
      stories(filter: $filter) {
        ...StoryFragment
        ...StoryLinkFragment
      }
    }
  `,
  variables: {
    filter
  },
  update (data) {
    return data.stories.reverse()
  },
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
