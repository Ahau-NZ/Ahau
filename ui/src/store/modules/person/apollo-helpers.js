import gql from 'graphql-tag'
import pick from 'lodash.pick'

import { PERMITTED_PERSON_ATTRS, PERSON_FRAGMENT } from '../../../lib/person-helpers'
import { pruneEmptyValues } from '../../../lib/profile-helpers'
import { saveProfile } from '../profile/apollo-helpers'

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
      
      tombstone {
        date
      }
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

export const getPersonFull = (id, fetchPolicy = 'no-cache') => ({
  query: gql`
    ${PERSON_FRAGMENT}
    query($id: String!) {
      person(id: $id){
        ...ProfileFragment
        adminProfile {
          ...ProfileFragment
        }
        tombstone {
          date
        }
      }
    }
  `,
  variables: {
    id
  },
  fetchPolicy
})

export const savePerson = input => {
  input = pick(input, PERMITTED_PERSON_ATTRS)
  input = pruneEmptyValues(input)

  return saveProfile(input)
}

export const deletePerson = (id, allowPublic = false) => {
  const input = {
    id,
    tombstone: { reason: 'user deleted profile' }
  }

  if (allowPublic) input.allowPublic = true

  return saveProfile(input)
}
