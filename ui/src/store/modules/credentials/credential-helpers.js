import gql from 'graphql-tag'

export const getAllCredentials = ({
  query: gql`query{
    verifiableCredentials {
      iss
      id
      credentialSubject
      credentialStatus { id }
      sub
      issuanceDate
    }
  }`
})

export const getAllMessages = ({
  query: gql`query{
    getPlutoMessages
  }`
})
