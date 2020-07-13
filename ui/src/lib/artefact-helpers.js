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
  'createdAt',

  'title',
  'description',

  'identifier',
  'licence',
  'rights',
  'source',

  'language',
  'translation'
]

export const PERMITTED_ARTEFACT_VIDEO_AUDIO_ATTRS = [
  'duration',
  'transcription'
]

export const PERMITTED_ARTEFACT_OUTPUT_ATTRS = [
  ...PERMITTED_ARTEFACT_SHARED_ATTRS
]

export const PERMITTED_ARTEFACT_ATTRS = [
  ...PERMITTED_ARTEFACT_SHARED_ATTRS,
  ...PERMITTED_ARTEFACT_VIDEO_AUDIO_ATTRS
]

export const ARTEFACT_FRAGMENT = gql`
  fragment ArtefactFragment on Artefact {
    type
    blob { blobId mimeType size unbox uri }
    createdAt
    title
    description
    identifier
    licence
    rights
    source
    language
    translation
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

  if (input.blob && input.blob.uri) delete input.blob.uri

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

export const DELETE_ARTEFACT = (id, date) => ({
  mutation: gql`
    mutation ($input: ArtefactInput!) {
      saveArtefact (input: $input)
    }
  `,
  variables: {
    input: {
      id,
      tombstone: { date }
    }
  }
})

export const ALL_ATTRS = [
  'id',

  'type',
  'blob',
  'createdAt',

  'title',
  'description',

  'identifier',
  'licence',
  'rights',
  'source',
  'format',

  'language',
  'translation'
]

export const PHOTO_ATTRS = [
  ...ALL_ATTRS
]

export const AUDIO_ATTRS = [
  ...ALL_ATTRS,
  'duration',
  'transcription'
]

export const VIDEO_ATTRS = [
  ...ALL_ATTRS,
  ...AUDIO_ATTRS
]

export const TEXT_ATTRS = [
  ...ALL_ATTRS
]

export const APPLICATION_ATTRS = [
  ...ALL_ATTRS
]

export function typeAttrs (type) {
  switch (type) {
    case 'photo':
    case 'image':
      return PHOTO_ATTRS
    case 'video':
      return VIDEO_ATTRS
    case 'audio':
      return AUDIO_ATTRS
    case 'text':
      return TEXT_ATTRS
    case 'document':
      return APPLICATION_ATTRS
    default:
      return []
  }
}
