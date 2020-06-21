import gql from 'graphql-tag'
import pick from 'lodash.pick'

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

export const GET_STORIES = type => ({
  query: gql`
    query($type: String!) {
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
  variables: { type },
  fetchPolicy: 'no-cache'
})

export const GET_ALL_STORIES = GET_STORIES('*')

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
