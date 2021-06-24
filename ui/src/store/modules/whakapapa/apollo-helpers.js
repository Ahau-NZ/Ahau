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
  }
`

export const getWhakapapaView = id => ({
  query: gql`
    ${WhakapapaFragment}
    ${PublicProfileFieldsFragment}
    query($id: String!) {
      whakapapaView(id: $id) {
        ...WhakapapaFragment
        kaitiaki {
          ...PublicProfileFields
        }
      }
    }
  `,
  variables: { id },
  fetchPolicy: 'no-cache'
})
