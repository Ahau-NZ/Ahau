import gql from 'graphql-tag'

export const saveWhakapapaLink = input => ({
  mutation: gql`
    mutation($input: WhakapapaLinkInput!) {
      saveWhakapapaLink(input: $input)
    }
  `,
  variables: { input }
})
