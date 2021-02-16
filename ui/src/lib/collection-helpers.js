import gql from 'graphql-tag'
import pick from 'lodash.pick'
import clone from 'lodash.clonedeep'
import { PUBLIC_PROFILE_FRAGMENT } from './person-helpers'

export function setDefaultCollection (newCollection) {
  var collection = clone(newCollection)

  var { stories } = collection

  if (stories && stories.length > 0) {
    stories = stories.map(d => {
      return {
        ...d.story,
        linkId: d.linkId
      }
    })
  }

  return {
    id: collection.id,
    name: collection.name,
    description: collection.description,
    image: collection.image,
    stories
  }
}

export const EMPTY_COLLECTION = {
  id: null,
  name: null,
  description: null,
  image: null,
  stories: []
}

// contains standalone attrs with no sub atrrs
export const PERMITTED_COLLECTION_ATTRS = [
  'id',
  'type',
  'name',
  'description',
  'canEdit',
  'recps',
  'submissionDate'
]

// contains attrs with sub attrs
export const ALL_PERMITTED_COLLECTION_ATTRS = [
  ...PERMITTED_COLLECTION_ATTRS,
  'image',
  'authors'
]

export const PERMITTED_STORY_LINK_ATTRS = [
  'linkId',
  'type',
  'authors',
  'collection',
  'story',

  'tombstone',
  'recps'
]

export const COLLECTION_FRAGMENT = gql`
  fragment CollectionFragment on Collection {
    ${PERMITTED_COLLECTION_ATTRS}
    image {
      uri
    }
  }
`

export const getAllCollections = filter => ({
  query: gql`
    ${COLLECTION_FRAGMENT}
    ${PUBLIC_PROFILE_FRAGMENT}
    query ($filter: StoryFilter) {
      collections(filter: $filter) {
        ...CollectionFragment
        tiaki {
          ...PublicProfileFragment
        }
      }
    }
  `,
  variables: {
    filter
  },
  fetchPolicy: 'no-cache'
})

export const deleteCollection = (id, date) => ({
  mutation: gql`
    mutation ($input: CollectionInput!) {
      saveCollection (input: $input)
    }
  `,
  variables: {
    input: {
      id,
      tombstone: { date }
    }
  }
})

export const saveCollection = input => {
  var submissionDate = Date.now()

  input = {
    ...pick(input, ALL_PERMITTED_COLLECTION_ATTRS),
    submissionDate
  }

  if (!input.id) input.type = '*' // TODO: sort out types

  return {
    mutation: gql`
      mutation($input: CollectionInput!) {
        saveCollection(input: $input)
      }
    `,
    variables: { input }
  }
}

export const saveCollectionStoryLink = input => {
  input = {
    type: 'collection-story', // link type
    ...pick(input, PERMITTED_STORY_LINK_ATTRS)
  }

  return {
    mutation: gql`
      mutation($input: CollectionStoryLinkInput) {
        saveCollectionStoryLink(input: $input)
      }
    `,
    variables: { input }
  }
}
