import gql from 'graphql-tag'

export const whakapapaViews = ({
  query: gql`{
      whakapapaViews {
        id
        name
        description
        image { uri }
      }
  }`,
  update: data => data.whakapapaViews,
  fetchPolicy: 'no-cache'
})

export const saveWhakapapa = input => ({
  mutation: gql`
    mutation($input: WhakapapaViewInput!) {
      saveWhakapapaView(input: $input)
    }
  `,
  variables: { input }
})

export const whakapapaView = id => ({
  query: gql`
    query($id: String!) {
      whakapapaView(id: $id) {
        id
        name
        description
        image { uri }
        focus
        recps
        ignoredProfiles
      }
    }
  `,
  variables: { id: id },
  fetchPolicy: 'no-cache'
})
