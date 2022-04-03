import gql from 'graphql-tag'
import pick from 'lodash.pick'
import clone from 'lodash.clonedeep'

import { ARTEFACT_FRAGMENT } from './artefact-helpers'
import { PERSON_FRAGMENT } from './person-helpers'
import { PublicProfileFieldsFragment } from '../store/modules/profile/apollo-helpers'
import { CollectionFragment } from '../store/modules/collection/apollo-helpers.js'

export function setDefaultStory (newStory) {
  const story = clone(newStory)
  let { artefacts, mentions, contributors, creators, relatedRecords, collections } = story

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

  if (collections && collections.length > 0) {
    collections = collections.map(d => mapLinks(d, 'collection'))
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
    collections,
    // access: story.access,
    contributors,
    creators,
    protocols: story.protocols,
    relatedRecords,
    artefacts,
    tiaki: story.tiaki
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
  'collections',
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
  ${PublicProfileFieldsFragment}
  ${ARTEFACT_FRAGMENT}
  ${PERSON_FRAGMENT}
  ${CollectionFragment}
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
    collections: collectionLinks {
      linkId
      collection {
        ...CollectionFragment
      }
    }
    tiaki {
      ...PublicProfileFields
    }
  }
`

/*
  WARNING: i put this in here because it uses the story fragments, for some reason when
  i imported story-helpers.js in collection-helpers.js to use the fragments, it would throw a
  graphql error (even just importing it!!)
*/
export const getCollection = id => ({
  query: gql`
    ${CollectionFragment}
    ${PublicProfileFieldsFragment}
    ${STORY_FRAGMENT}
    ${STORY_LINK_FRAGMENT}
    query ($id: ID!) {
      collection(id: $id) {
        ...CollectionFragment
        tiaki {
          ...PublicProfileFields
        }
        stories: storyLinks {
          linkId
          story {
            ...StoryFragment
            ...StoryLinkFragment
          }
        }
      }
    }
  `,
  variables: { id },
  fetchPolicy: 'no-cache'
})

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

export const getAllStories = ({ groupId }) => ({
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
    filter: {
      type: '*',
      groupId
    }
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

export const saveStory = input => {
  const submissionDate = new Date().toISOString().slice(0, 10)

  input = {
    type: '*', // TODO: sort out types
    ...pick(input, [...PERMITTED_STORY_ATTRS, 'authors']),
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
