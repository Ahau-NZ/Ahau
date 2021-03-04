import gql from 'graphql-tag'
import { PublicProfileFieldsFragment } from './profile-helpers.js'

export const PERMITTED_WHAKAPAPA_ATTRS = [
  'image', // WARNING: this needs to be the first
  'id',
  'name',
  'description',
  'focus',
  'canEdit',
  'recps',
  'ignoredProfiles'
]

export const WHAKAPAPA_FRAGMENT = gql`
  fragment WhakapapaFragment on WhakapapaView {
    ${PERMITTED_WHAKAPAPA_ATTRS.slice(1)}
    image { uri }
  }
`

export const saveWhakapapaView = input => {
  return {
    mutation: gql`
      mutation($input: WhakapapaViewInput) {
        saveWhakapapaView(input: $input)
      }
    `,
    variables: { input }
  }
}

export const getWhakapapaView = id => ({
  query: gql`
    ${WHAKAPAPA_FRAGMENT}
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
  variables: { id: id },
  fetchPolicy: 'no-cache'
})

export const getWhakapapaViews = () => ({
  query: gql`
    ${WHAKAPAPA_FRAGMENT}
    ${PublicProfileFieldsFragment}
    query {
      whakapapaViews {
        ...WhakapapaFragment,
        kaitiaki {
          ...PublicProfileFields
        }
      }
    }
  `,
  update: data => data.whakapapaViews,
  fetchPolicy: 'no-cache'
})
