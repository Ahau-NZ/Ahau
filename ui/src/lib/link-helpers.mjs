import gql from 'graphql-tag'
import pick from 'lodash.pick'
import { pruneEmptyValues } from '../lib/profile-helpers.mjs'

export const TYPES = {
  STORY_ARTEFACT: 'link/story-artefact',
  STORY_STORY: 'link/story-story',
  STORY_PROFILE_CONTRIBUTOR: 'link/story-profile/contributor',
  STORY_PROFILE_MENTION: 'link/story-profile/mention',
  STORY_PROFILE_CREATOR: 'link/story-profile/creator'
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

export const saveLink = input => {
  input = pick(input, LINK_PERMITTED_ATTRS)
  input = pruneEmptyValues(input)

  return {
    mutation: gql`
      mutation($input: LinkInput!) {
        saveLink(input: $input)
      }
    `,
    variables: { input }
  }
}

export const whakapapaLink = ({ parent, child, isPartner }) => ({
  query: gql`
    query($parent: String!, $child: String!, $isPartner: Boolean) {
      whakapapaLink (parent: $parent, child: $child, isPartner: $isPartner) {
        type
        linkId
        parent
        child
        relationshipType
        legallyAdopted
        recps
      }
    }
  `,
  variables: {
    parent,
    child,
    isPartner
  }
})
