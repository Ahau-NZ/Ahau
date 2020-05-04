import gql from 'graphql-tag'

export const saveWhakapapaView = input => ({
  mutation: gql`
    mutation($input: WhakapapaViewInput) {
      saveWhakapapaView(input: $input)
    }
  `,
  variables: { input }
})

export const getWhakapapaView = id => ({
  query: gql`
    query($id: String!) {
      whakapapaView(id: $id) {
        name
        description
        image { uri }
        focus
        recps
      }
    }
  `,
  variables: { id: id },
  fetchPolicy: 'no-cache'
})
