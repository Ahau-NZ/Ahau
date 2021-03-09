import gql from 'graphql-tag'
import tree from './tree-helpers.js'

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
  }
`

export const PersonProfileLinkFragment = gql`
  fragment PersonProfileLink on WhakapapaLink {
    linkId
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
        profile {
          ...PersonProfileFields
          parents {
            profile {
              ...PersonProfileFields
            }
            ...PersonProfileLink
          }
        }
        ...PersonProfileLink
      }
      parents {
        profile {
          ...PersonProfileFields
          children {
            profile {
              ...PersonProfileFields
            }
            ...PersonProfileLink
          }
        }
        ...PersonProfileLink
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
    if (profile.type === 'community') return profile

    if (profile.children) {
      profile.children = profile.children.map(child => {
        var childProfile = child.profile ? child.profile : child
        childProfile = {
          ...childProfile,
          relationshipType: child.relationshipType
        }
        profile = tree.getPartners(profile, childProfile)
        return childProfile
      })
    }

    if (profile.parents) {
      profile.parents = profile.parents.map(parent => {
        var parentProfile = parent.profile ? parent.profile : parent
        parentProfile = {
          ...parentProfile,
          relationshipType: parent.relationshipType
        }
        profile = tree.getSiblings(parentProfile, profile)
        return parentProfile
      })
    }

    return profile
  },
  fetchPolicy: 'no-cache'
})

export const saveProfile = input => ({
  mutation: gql`
    mutation($input: ProfileInput!) {
      saveProfile(input: $input)
    }
  `,
  variables: { input }
})
