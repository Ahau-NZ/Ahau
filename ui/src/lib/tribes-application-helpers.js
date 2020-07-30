import gql from 'graphql-tag'

export const CREATE_GROUP_APPLICATION = gql`
  mutation($groupId: String!, $recps: [String], $text: String) {
    createGroupApplication(groupId: $groupId, recps: $recps, text: $text) {
      id
      version
      groupId
      applicantId
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
      groupId
      applicantId
      text
      recps
      accepted
    }
  }
`

export const LIST_GROUP_APPLICATIONS = gql`
  query($groupId: String, $accepted: Boolean) {
    listGroupApplications(groupdId: $groupdId, accepted: $accepted) {
      id
      groupId
      applicantId
      text
      recps
      accepted
    }
  }
`

export const GET_GROUP_APPLICATION = gql`
  query($id: String!) {
    getGroupApplication(id: $id) {
      id
      groupId
      applicantId
      text
      recps
      accepted
    }
  }
`
