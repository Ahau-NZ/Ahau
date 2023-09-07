import gql from 'graphql-tag'
import { PublicProfileFieldsFragment } from '../../profile/apollo-helpers.mjs'

export const WhakapapaFragment = gql`
  fragment WhakapapaFragment on WhakapapaView {
    id
    name
    description
    focus
    recps
    ignoredProfiles
    image { uri }
    recordCount
    permission
    importantRelationships {
      profileId
      primary {
        profileId
        relationshipType
      }
      other {
        profileId
        relationshipType
      }
    }
  }
`

export const getWhakapapaView = id => ({
  query: gql`
    ${WhakapapaFragment}
    ${PublicProfileFieldsFragment}
    query($id: String!) {
      whakapapaView(id: $id) {
        ...WhakapapaFragment

        links {
          childLinks {
            parent
            child
            relationshipType
          }
          partnerLinks {
            parent
            child
          }
        }
        tiaki {
          ...PublicProfileFields
        }
      }
    }
  `,
  variables: { id },
  fetchPolicy: 'no-cache'
})

const GET_DESCENDANT_LINKS_QUERY = gql`
  query($profileId: String!) {
    getDescendantLinks(profileId: $profileId) {
      childLinks {
        parent
        child
        relationshipType
      }
      partnerLinks {
        parent
        child
      }
    }
  }
`
export const getDescendantLinks = profileId => ({
  query: GET_DESCENDANT_LINKS_QUERY,
  variables: { profileId },
  fetchPolicy: 'no-cache'
})

export const getWhakapapaViews = groupId => ({
  query: gql`
    ${WhakapapaFragment}
    ${PublicProfileFieldsFragment}
    query ($groupId: String) {
      whakapapaViews (groupId: $groupId) {
        ...WhakapapaFragment
        tiaki {
          ...PublicProfileFields
        }
      }
    }
  `,
  variables: { groupId },
  update: data => data.whakapapaViews,
  fetchPolicy: 'no-cache'
})

export const saveWhakapapaView = input => {
  if (input.image) delete input.image.uri

  return {
    mutation: gql`
      mutation($input: WhakapapaViewInput) {
        saveWhakapapaView(input: $input)
      }
    `,
    variables: { input }
  }
}

const GET_FAMILY_LINKS_QUERY = gql`
  query ($profileId: String!, $extended: Boolean) {
    loadFamilyOfPerson(id: $profileId, extended: $extended) {
      childLinks {
        parent
        child
        relationshipType
      }
      partnerLinks {
        parent
        child
        relationshipType
      }
    }
  }
`
export const getFamilyLinks = (profileId, extended = false) => ({
  query: GET_FAMILY_LINKS_QUERY,
  variables: {
    profileId,
    extended
  },
  fetchPolicy: 'no-cache'
})
