import gql from 'graphql-tag'
import pick from 'lodash.pick'

export const TYPES = {
  STORY_ARTEFACT: 'link/story-artefact',
  STORY_STORY: 'link/story-story',
  STORY_PROFILE_CONTRIBUTOR: 'link/story-profile/contributor',
  STORY_PROFILE_MENTION: 'link/story-profile/mention'
}

export const LINK_PERMITTED_ATTRS = [
  'linkId',
  'type',
  'parent',
  'child',

  // WhakapapaLink attrs
  'relationshipType',
  'legallyAdopted',

  // extras
  'recps',
  'tombstone'
]

export const SAVE_LINK = input => {
  input = pick(input, LINK_PERMITTED_ATTRS)
  return {
    mutation: gql`
      mutation($input: LinkInput!) {
        saveLink(input: $input)
      }
    `,
    variables: { input }
  }
}
