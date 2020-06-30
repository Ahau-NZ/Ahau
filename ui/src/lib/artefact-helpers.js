import gql from 'graphql-tag'
import pick from 'lodash.pick'
import isEmpty from 'lodash.isempty'

export const EMPTY_ARTEFACT = {
  id: null,
  type: null,
  blob: null,
  uri: null,
  title: null,
  description: null,
  format: null,
  identifier: null,
  language: null,
  licence: null,
  rights: null,
  source: null,
  translation: null,
  duration: null,
  size: null,
  transcription: null,
  mentions: []
}

export const PERMITTED_ARTEFACT_SHARED_ATTRS = [
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
  'translation'
]

export const PERMITTED_ARTEFACT_VIDEO_AUDIO_ATTRS = [
  'duration',
  'size',
  'transcription'
]

export const PERMITTED_ARTEFACT_OUTPUT_ATTRS = [
  ...PERMITTED_ARTEFACT_SHARED_ATTRS,
  'uri'
]

export const PERMITTED_ARTEFACT_ATTRS = [
  ...PERMITTED_ARTEFACT_SHARED_ATTRS,
  ...PERMITTED_ARTEFACT_VIDEO_AUDIO_ATTRS
]

export const ARTEFACT_FRAGMENT = gql`
  fragment ArtefactFragment on Artefact {
    ${PERMITTED_ARTEFACT_OUTPUT_ATTRS}
    ... on Audio {
      ${PERMITTED_ARTEFACT_VIDEO_AUDIO_ATTRS}
    }
    ... on Video {
      ${PERMITTED_ARTEFACT_VIDEO_AUDIO_ATTRS}
    }
  }
`

export const getArtefact = id => ({
  query: gql`
    ${ARTEFACT_FRAGMENT}
    query($id: ID!) {
      artefact(id: $id) {
        ...ArtefactFragment
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
        ...ArtefactFragment
      }
    }
  `,
  fetchPolicy: 'no-cache'
})

function removeNullProperties (input) {
  Object.entries(input).forEach(([key, value]) => {
    if (isEmpty(input[key])) {
      delete input[key]
    }
  })
}

export const SAVE_ARTEFACT = input => {
  input = pick(input, PERMITTED_ARTEFACT_ATTRS)

  removeNullProperties(input)

  return {
    mutation: gql`
      mutation($input: ArtefactInput) {
        saveArtefact(input: $input)
      }
    `,
    variables: { input: { ...input } }
  }
}
