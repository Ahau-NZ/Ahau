import gql from 'graphql-tag'

export const PERMITTED_ARTEFACT_ATTRS = [
  'type',
  'blob',
  'title',
  'description',
  'format',
  'identifier',
  'language',
  'licence',
  'rights',
  'source',
  'translation'
]

export const getArtefact = id => ({
  query: gql`
    query($id: ID!) {
      artefact(id: $id) {
        id
        type
        blob
        title
        description
        format
        identifier
        language
        licence
        rights
        source
        translation
      }
    }
  `,
  variables: { id: id },
  fetchPolicy: 'no-cache'
})

export const getArtefacts = () => ({
  query: gql`
    query {
      artefacts {
        id
        type
        blob
        title
        description
        format
        identifier
        language
        licence
        rights
        source
        translation
      }
    }
  `,
  fetchPolicy: 'no-cache'
})

export const saveArtefact = input => ({
  mutation: gql`
    mutation($input: ArtefactInput) {
      saveArtefact(input: $input)
    }
  `,
  variables: { input }
})
