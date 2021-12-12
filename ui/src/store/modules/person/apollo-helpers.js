import gql from 'graphql-tag'

const GET_PERSON_MINIMAL = gql`
  query($id: String!) {
    person(id: $id){
      id
      preferredName
      legalName
      gender
      avatarImage { uri }

      aliveInterval
      deceased
    }
  }
`
// NOTE this doesn't load the kaitiaki adminProfile
// which may have profile details which should over-ride the group-profile

export const getPersonMinimal = (id, fetchPolicy = 'no-cache') => ({
  query: GET_PERSON_MINIMAL,
  variables: { id },
  fetchPolicy
})
