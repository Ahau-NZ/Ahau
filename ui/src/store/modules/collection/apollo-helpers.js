import pick from 'lodash.pick'
import gql from 'graphql-tag'
import { PublicProfileFieldsFragment } from '../profile/apollo-helpers'

// TODO we should get rid of these and force the developer to manually enter the fields into the fragment
// this will also ensure further down when saving, that we are seeing input errors rather than removing extra
// fields to prevent these errors
export const PERMITTED_COLLECTION_ATTRS = [
  'id',
  'type',
  'name',
  'description',
  'canEdit',
  'recps',
  'submissionDate',
  'recordCount'
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

export const CollectionFragment = gql`
  fragment CollectionFragment on Collection {
    ${PERMITTED_COLLECTION_ATTRS}
    image {
      uri
    }
  }
`

export const saveCollection = input => {
  const submissionDate = Date.now()

  input = {
    ...pick(input, ALL_PERMITTED_COLLECTION_ATTRS), // TODO: this stops us from knowing we are passing the wrong input
    submissionDate
  }

  if (!input.id) input.type = '*'
  if (!input.authors) {
    input.authors = {
      add: ['*']
    }
  }

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

  // enable all authors
  if (!input.linkId) {
    input.authors = {
      add: ['*']
    }
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

export const getAllCollections = (groupId) => ({
  query: gql`
    ${CollectionFragment}
    ${PublicProfileFieldsFragment}
    query ($filter: StoryFilter) {
      collections(filter: $filter) {
        ...CollectionFragment
        tiaki {
          ...PublicProfileFields
        }
      }
    }
  `,
  variables: {
    filter: {
      type: '*',
      groupId
    }
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
