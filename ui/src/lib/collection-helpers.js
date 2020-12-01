import gql from 'graphql-tag'
import pick from 'lodash.pick'
import { ARTEFACT_FRAGMENT } from './artefact-helpers'
import { PERSON_FRAGMENT } from './person-helpers'
import clone from 'lodash.clonedeep'

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

export const PERMITTED_COLLECTION_ATTRS = [
  'id',
  'type',
  'name',
  'description',
  'image',
  'recps'
]

// export const PERMITTED_COLLECTION_LINKS = [
// ]

export const COLLECTION_FRAGMENT = gql`
  fragment CollectionFragment on Collection {
    ${PERMITTED_COLLECTION_ATTRS}
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
  variables: { id },
  fetchPolicy: 'no-cache'
})

export const getAllCollections = filter => ({
  query: gql`
    ${COLLECTION_FRAGMENT}
    query ($filter: StoryFilter) {
      collections(filter: $filter) {
        ...CollectionFragment
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
  // var submissionDate = new Date().toISOString().slice(0, 10)

  input = {
    type: '*', // TODO: sort out types
    ...pick(input, [...PERMITTED_COLLECTION_ATTRS, 'authors'])
    // submissionDate
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
