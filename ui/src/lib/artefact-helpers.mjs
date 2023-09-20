import gql from 'graphql-tag'
import { pick } from 'lodash-es'

export const ARTEFACT_FILE_TYPES = `
  audio/*,
  video/*,
  image/*,
  application/msword, application/vnd.ms-excel, application/vnd.ms-powerpoint,
  application/vnd.openxmlformats-officedocument.presentationml.presentation,
  application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,
  application/vnd.openxmlformats-officedocument.wordprocessingml.document,
  application/pdf,
  text/*,
  application/vnd.openxmlformats-officedocument.presentationml.presentation,
  application/epub+zip,
  application/zip
`

export const EMPTY_ARTEFACT = {
  id: null,
  type: null,
  blob: null,
  uri: null,
  title: null,
  createdAt: null,
  description: null,
  identifier: null,
  language: null,
  licence: null,
  rights: null,
  source: null,
  translation: null,
  duration: null,
  transcription: null,
  location: null
}

export const PERMITTED_ARTEFACT_SHARED_ATTRS = [
  'id',

  'type',
  'blob',
  'createdAt',

  'location',

  'title',
  'description',

  'identifier',
  'licence',
  'rights',
  'source',

  'language',
  'translation',
  'recps'
]

export const ARTEFACT_ICON = (mimeType) => {
  switch (true) {
    case mimeType === 'application/pdf': return 'mdi-file-pdf'
    case mimeType === 'application/msword': return 'mdi-file-word'
    case mimeType === 'application/vnd.ms-excel': return 'mdi-file-excel'
    case mimeType === 'application/vnd.ms-powerpoin': return 'mdi-file-powerpoint'
    default: return 'mdi-file'
  }
}

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
    id
    type
    blob {
      blobId
      mimeType
      size
      uri
    }
    createdAt
    title
    description
    location
    identifier
    licence
    rights
    source
    language
    translation
    canEdit
    recps
    ... on Audio {
      duration
      transcription
    }
    ... on Video {
      duration
      transcription
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

export const saveArtefact = input => {
  input = pick(input, [...PERMITTED_ARTEFACT_ATTRS, 'authors'])

  if (input.blob && input.blob.uri) delete input.blob.uri

  return {
    mutation: gql`
      mutation($input: ArtefactInput) {
        saveArtefact(input: $input)
      }
    `,
    variables: { input }
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

export const convertBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}
