import gql from 'graphql-tag'
import { PublicProfileFieldsFragment } from '../../../lib/profile-helpers.js'

export const WhakapapaFragment = gql`
  fragment WhakapapaFragment on WhakapapaView {
    id
    name
    description
    focus
    canEdit
    recps
    ignoredProfiles
    image { uri }
    recordCount
    importantRelationships {
      profileId
      important
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
        tiaki {
          ...PublicProfileFields
        }
      }
    }
  `,
  variables: { id },
  fetchPolicy: 'no-cache'
})

export const getWhakapapaViews = ({
  query: gql`
    ${WhakapapaFragment}
    ${PublicProfileFieldsFragment}
    query {
      whakapapaViews {
        ...WhakapapaFragment
        kaitiaki {
          ...PublicProfileFields
        }
      }
    }
  `,
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
