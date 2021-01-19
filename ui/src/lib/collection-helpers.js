import gql from 'graphql-tag'
import pick from 'lodash.pick'
import clone from 'lodash.clonedeep'
import { PUBLIC_PROFILE_FRAGMENT } from '@/lib/person-helpers'

export function setDefaultCollection (newCollection) {
  var collection = clone(newCollection)

  return {
    id: collection.id,
    name: collection.name,
    description: collection.description,
    image: collection.image
  }
}

export const EMPTY_COLLECTION = {
  id: null,
  name: null,
  description: null,
  image: null
}

// contains standalone attrs with no sub atrrs
export const PERMITTED_COLLECTION_ATTRS = [
  'id',
  'type',
  'name',
  'description',
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

export const getCollection = id => ({
  query: gql`
    ${COLLECTION_FRAGMENT}
    query($id: ID!) {
      collection(id: $id) {
        ...CollectionFragment
      }
    }
  `,
  variables () {
    return { id }
  },
  fetchPolicy: 'no-cache'
})

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
  // update (data) {
  //   return data.collections.reverse()
  // },
  fetchPolicy: 'no-cache'
})

export const getAllStoriesByMentions = id => ({
  query: gql`
    ${COLLECTION_FRAGMENT}
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
    type: '*', // TODO: sort out types
    ...pick(input, ALL_PERMITTED_COLLECTION_ATTRS),
    submissionDate
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

export const saveStoryLink = input => {
  input = {
    type: 'collection-story', // link type
    ...pick(input, PERMITTED_STORY_LINK_ATTRS)
  }

  return {
    mutation: gql`
      mutation($input: CollectionStoryLinkInput) {
        saveStoryLink(input: $input)
      }
    `,
    variables: { input }
  }
}
