import gql from 'graphql-tag'

export const SharedProfileFieldsFragment = gql`
  fragment SharedProfileFields on Profile {
    id
    recps
    type
    
    preferredName
    description

    avatarImage { uri }
    headerImage { uri }
    
    address
    city
    country
    postCode
    phone
    email
  }
`

export const CommunityProfileFieldsFragment = gql`
  ${SharedProfileFieldsFragment}
  fragment CommunityProfileFields on Community {
    ...SharedProfileFields
    joiningQuestions {
      type
      label
    }
  }
`

export const PersonProfileFieldsFragment = gql`
  ${SharedProfileFieldsFragment}
  fragment PersonProfileFields on Person {
    ...SharedProfileFields
    legalName
    altNames
    profession
    gender
    aliveInterval
    birthOrder
    deceased
    placeOfBirth
    placeOfDeath
    buriedLocation
    education
    school
  }
`

export const PersonProfileLinkFragment = gql`
  fragment PersonProfileLink on Person {
    relationshipType
    legallyAdopted
  }
`

export const PublicProfileFieldsFragment = gql`
  fragment PublicProfileFields on Profile {
    id
    preferredName
    legalName
    ...on Person {
      gender
    }
    avatarImage { uri }
    feedId: originalAuthor   
  }
`

export const AllProfileFieldsFragment = gql`
  ${SharedProfileFieldsFragment}
  ${CommunityProfileFieldsFragment}
  ${PersonProfileFieldsFragment}
  ${PersonProfileLinkFragment}
  fragment AllProfileFields on Profile {
    ...on Community {
      ...CommunityProfileFields
    }
    ...on Person {
      ...PersonProfileFields
      children {
        ...PersonProfileFields
        ...PersonProfileLink
      }
      parents {
        ...PersonProfileFields
        ...PersonProfileLink
      }
      partners {
        ...PersonProfileFields
        ...PersonProfileLink
        children {
          ...PersonProfileFields
          ...PersonProfileLink
        }
        parents {
          ...PersonProfileFields
          ...PersonProfileLink
        }
      }
      siblings {
        ...PersonProfileFields
      }
    }
  }
`

export const ProfileTiakiFieldsFragment = gql`
  ${PublicProfileFieldsFragment}
  fragment ProfileTiakiFields on Profile {
    canEdit
    tiaki {
      ...PublicProfileFields
    }
    authors {
      profile {
        ...PublicProfileFields
      }
      feedId
      intervals {
        start
        end
      }
    }
  }
`

export const getProfile = ({
  query: gql`
    ${AllProfileFieldsFragment}
    ${ProfileTiakiFieldsFragment}
    query($id: String!) {
      profile(id: $id){
        ...AllProfileFields
        ...ProfileTiakiFields
      }
    }
  `,
  update ({ profile }) {
    return profile
  },
  fetchPolicy: 'no-cache'
})

export const saveProfile = input => {
  if (input.avatarImage) delete input.avatarImage.uri
  if (input.headerImage) delete input.headerImage.uri

  return {
    mutation: gql`
      mutation($input: ProfileInput!) {
        saveProfile(input: $input)
      }
    `,
    variables: { input }
  }
}
