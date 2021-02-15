import gql from 'graphql-tag'

export const createGroupApplication = ({ groupId, groupAdmins, text }) => {
  return {
    mutation: gql`
      mutation($groupId: String!, $groupAdmins: [String!]!, $text: String) {
        createGroupApplication(
          groupId: $groupId
          groupAdmins: $groupAdmins
          text: $text
        ) {
          id
          group {
            id
          }
          applicant {
            id
          }
          comments {
            author {
              id
              preferredName
              avatarImage {
                uri
              }
            }
            text
          }
          groupAdmins
          accepted
          addMember
        }
      }
    `,
    variables: {
      groupId,
      groupAdmins,
      text
    }
  }
}

export const ACCEPT_GROUP_APPLICATION = gql`
  mutation($id: String!, $text: String) {
    acceptGroupApplication(id: $id, text: $text) {
      id
      group {
        id
      }
      applicant {
        id
      }
      comments {
        author {
          id
          preferredName
          avatarImage {
            uri
          }
        }
      }
      groupAdmins
      accepted
    }
  }
`

export const LIST_GROUP_APPLICATIONS = gql`
  query($groupId: String, $accepted: Boolean) {
    listGroupApplications(groupId: $groupId, accepted: $accepted) {
      id
      comments {
        author {
          id
          preferredName
          avatarImage {
            uri
          }
        }
        text
      }
      accepted
      applicant {
        id
        gender
        preferredName
        avatarImage {
          uri
        }
      }
      group {
        id
        public {
          id
          preferredName
          avatarImage {
            uri
          }
        }
      }
    }
  }
`

export const GET_GROUP_APPLICATION = gql`
  query($id: String!) {
    getGroupApplication(id: $id) {
      id
      group {
        id
      }
      applicant {
        id
      }
      comments {
        author {
          id
          preferredName
          avatarImage {
            uri
          }
        }
        text
      }
      groupAdmins
      accepted
    }
  }
`

export function findInvalidProfileProps (profile) {
  // validate required props on a profile when applying to join a community
  // preferredName or legalName
  // dob
  // address
  // city/country
  const invalidProps = []

  const { preferredName, legalName, aliveInterval, address, location } = profile

  if (!preferredName && !legalName) invalidProps.push({ prop: 'name' })
  if (!aliveInterval) invalidProps.push({ prop: 'dob' })
  if (!address) invalidProps.push({ prop: 'address' })
  if (!location) invalidProps.push({ prop: 'location' })

  return invalidProps
}
