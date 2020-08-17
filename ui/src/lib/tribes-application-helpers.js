import gql from 'graphql-tag'

export const CREATE_GROUP_APPLICATION = gql`
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
`

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
