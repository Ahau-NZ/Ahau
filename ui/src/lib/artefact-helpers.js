import gql from 'graphql-tag'
import pick from 'lodash.pick'

export const PERMITTED_ARTEFACT_ATTRS = [
  'id',
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
  'translation',
  'transcription',
  'tombstone',
  'duration',
  'size'
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
        transcription
        size
        duration
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
        transcription
        size
        duration
      }
    }
  `,
  fetchPolicy: 'no-cache'
})

export const SAVE_ARTEFACT = input => {
  input = pick(input, PERMITTED_ARTEFACT_ATTRS)
  return {
    mutation: gql`
      mutation($input: ArtefactInput) {
        saveArtefact(input: $input)
      }
    `,
    variables: { input }
  }
}
