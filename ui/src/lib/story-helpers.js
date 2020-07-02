import gql from 'graphql-tag'
import pick from 'lodash.pick'
import { ARTEFACT_FRAGMENT } from './artefact-helpers'
import { PROFILE_FRAGMENT } from './profile-helpers'

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

export const STORY_FRAGMENT = gql`
  fragment StoryFragment on Story {
    ${PERMITTED_STORY_ATTRS}
  }
`

export const STORY_LINK_FRAGMENT = gql`
  ${ARTEFACT_FRAGMENT}
  ${PROFILE_FRAGMENT}
  fragment StoryLinkFragment on Story {
    artefacts: artefactLinks {
      linkId
      artefact {
        ...ArtefactFragment
      }
    }
    mentions: mentionLinks {
      linkId
      profile {
        ...ProfileFragment
      }
    }
    contributors: contributorLinks {
      linkId
      profile {
        ...ProfileFragment
      }
    }
  }
`

export const GET_STORY = id => ({
  query: gql`
    ${STORY_FRAGMENT}
    ${STORY_LINK_FRAGMENT}
    query($id: ID!) {
      story(id: $id) {
        ...StoryFragment
        ...StoryLinkFragment
      }
    }
  `,
  variables: { id: id },
  fetchPolicy: 'no-cache'
})

// TODO: sort out type
export const GET_ALL_STORIES = ({
  query: gql`
    ${STORY_FRAGMENT}
    ${STORY_LINK_FRAGMENT}
    query {
      stories (type: "*") {
        ...StoryFragment
        ...StoryLinkFragment
      }
    }
  `,
  fetchPolicy: 'no-cache'
})

export const DELETE_STORY = (id, date) => ({
  mutation: gql`
    mutation ($input: StoryInput!) {
      saveStory (input: $input)
    }
  `,
  variables: {
    input: {
      id,
      tombstone: { date }
    }
  }
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
