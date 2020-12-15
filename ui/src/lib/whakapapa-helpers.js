import gql from 'graphql-tag'
import { PUBLIC_PROFILE_FRAGMENT } from './person-helpers'
// import { PUBLIC_PROFILE_FRAGMENT, AUTHOR_FRAGMENT } from './person-helpers'

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
    ${PUBLIC_PROFILE_FRAGMENT}
    query($id: String!) {
      whakapapaView(id: $id) {
        ...WhakapapaFragment
        kaitiaki {
          ...PublicProfileFragment
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
    ${PUBLIC_PROFILE_FRAGMENT}
    query {
      whakapapaViews {
        ...WhakapapaFragment,
        kaitiaki {
          ...PublicProfileFragment
        }
      }
    }
  `,
  update: data => data.whakapapaViews,
  fetchPolicy: 'no-cache'
})
