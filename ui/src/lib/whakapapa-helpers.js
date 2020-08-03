import gql from 'graphql-tag'

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
    query($id: String!) {
      whakapapaView(id: $id) {
        id
        name
        description
        image { uri }
        focus
        canEdit
        recps
        ignoredProfiles
      }
    }
  `,
  variables: { id: id },
  fetchPolicy: 'no-cache'
})
