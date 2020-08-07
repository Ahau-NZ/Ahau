import gql from 'graphql-tag'

export const CREATE_GROUP_APPLICATION = gql`
  mutation($groupId: String!, $recps: [String], $text: String) {
    createGroupApplication(groupId: $groupId, recps: $recps, text: $text) {
      id
      version
      group {
        id
      }
      applicant {
        id
      }
      text
      recps
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
      text
      recps
      accepted
    }
  }
`

export const LIST_GROUP_APPLICATIONS = gql`
  query($groupId: String, $accepted: Boolean) {
    listGroupApplications(groupId: $groupId, accepted: $accepted) {
      id
      text
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
        preferredName
        avatarImage {
          uri
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
      text
      recps
      accepted
    }
  }
`
