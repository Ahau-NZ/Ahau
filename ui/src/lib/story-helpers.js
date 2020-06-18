import gql from 'graphql-tag'

export const PERMITTED_STORY_ATTRS = [
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
  'transcription'
]

export const getStory = id => ({
  query: gql`
    query($id: ID!) {
      story(id: $id) {
        id
        type
        title
        description
        timeInterval
        submissionDate
        location
        contributionNotes
        locationDescription
        format
        identifier
        language
        source
        transcription
      }
    }
  `,
  variables: { id: id },
  fetchPolicy: 'no-cache'
})

export const getStories = type => ({
  query: gql`
    query($type: String) {
      stories(type: $type) {
        id
        type
        title
        description
        timeInterval
        submissionDate
        location
        contributionNotes
        locationDescription
        format
        identifier
        language
        source
        transcription
      }
    }
  `,
  variables: { type: type },
  fetchPolicy: 'no-cache'
})

export const saveStory = input => ({
  mutation: gql`
    mutation($input: StoryInput) {
      saveStory(input: $input)
    }
  `,
  variables: { input }
})
