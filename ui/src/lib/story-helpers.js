import gql from 'graphql-tag'
import pick from 'lodash.pick'

export const SUBSCRIPTION_STORIES = gql`
   subscription stories {
    stories (type: "*") {
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
 `

export const PERMITTED_STORY_ATTRS = [
  'id',
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

export const GET_STORY = id => ({
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

export const GET_ALL_STORIES = ({
  query: gql`
    query {
      stories {
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
  fetchPolicy: 'no-cache'
})

export const SAVE_STORY = input => {
  input = {
    type: '*', // TODO: sort out types
    ...pick(input, PERMITTED_STORY_ATTRS)
  }

  return {
    mutation: gql`
      mutation($input: StoryInput!) {
        saveStory(input: $input)
      }
    `,
    variables: { input }
  }
}
