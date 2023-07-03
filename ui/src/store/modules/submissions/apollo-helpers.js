import gql from 'graphql-tag'
import { COMMUNITY_FRAGMENT } from '@/lib/community-helpers'
import { PERSON_FRAGMENT } from '@/lib/person-helpers'

// export const approveSubmission = ({ id, comment }) => {
//   return {
//     mutation: gql`
//       mutation ($id: String!, $comment: String) {
//         approveSubmission(id: $id, comment: $comment)
//       }
//       `,
//     variables: {
//       id,
//       comment: comment
//     }
//   }
// }

export const approveEditGroupPersonSubmission = ({ id, comment, allowedFields }) => {
  return {
    mutation: gql`
      mutation ($id: String!, $comment: String, $allowedFields: PersonProfileInput!) {
        approveEditGroupPerson(id: $id, comment: $comment, allowedFields: $allowedFields)
      }
      `,
    variables: {
      id,
      comment,
      allowedFields
    }
  }
}

export const approveNewGroupPersonSubmission = ({ id, comment, allowedFields }) => {
  return {
    mutation: gql`
      mutation ($id: String!, $comment: String, $allowedFields: PersonProfileInput!) {
        approveNewGroupPerson(id: $id, comment: $comment, allowedFields: $allowedFields)
      }
      `,
    variables: {
      id,
      comment,
      allowedFields
    }
  }
}

export const rejectSubmission = ({ id, comment }) => {
  return {
    mutation: gql`
      mutation ($id: String!, $comment: String) {
        rejectSubmission(id: $id, comment: $comment)
      }
      `,
    variables: {
      id,
      comment
    }
  }
}

export const tombstoneSubmission = (submissionId) => {
  return {
    mutation: gql`
      mutation ($id: String!, $tombstoneInput: TombstoneInput!) {
        tombstoneSubmission(id: $id, tombstoneInput: $tombstoneInput)
      }
    `,
    variables: {
      id: submissionId,
      tombstoneInput: {
        reason: 'user deleted submission'
      }
    }
  }
}

// export const proposeNewGroupPerson = ({ input, comment, groupId }) => {
//   return {
//     mutation: gql`
//       mutation ($input: PersonProfileInput!, $comment: String, $groupId: String!) {
//         proposeNewGroupPerson (input: $input, comment: $comment, groupId: $groupId)
//       }
//     `,
//     variables: {
//       input,
//       comment,
//       groupId
//     }
//   }
// }

export const proposeEditGroupPerson = ({ profileId, input, comment, groupId }) => {
  return {
    mutation: gql`
      mutation ($profileId: String!, $input: PersonProfileInput!, $comment: String, $groupId: String!) {
        proposeEditGroupPerson (profileId: $profileId, input: $input, comment: $comment, groupId: $groupId)
      }
    `,
    variables: {
      profileId,
      input,
      comment,
      groupId
    }
  }
}

// export const proposeTombstone = ({ recordId, comment, groupId }) => {
//   return {
//     mutation: gql`
//       mutation ($recordId: String!, $comment: String, $groupId: String!) {
//         proposeTombstone (recordId: $recordId, comment: $comment, groupId: $groupId)
//       }
//     `,
//     variables: {
//       recordId,
//       comment
//       groupId
//     }
//   }
// }

export const SubmissionFragment = gql`
  ${COMMUNITY_FRAGMENT}
  fragment SubmissionFragment on Submission {
    id
    sourceId
    targetId
    targetType
    recps
    groupId
    comments {
      authorId
      author {
        id
        preferredName
        avatarImage {
          uri
        }
        aliveInterval
        gender
      }
      comment
    }

    group {
      id
      public {
        ...CommunityFragment
      }
      private {
        ...CommunityFragment
      }
    }

    approvedB: approvedByIds
    rejectedBy: rejectedByIds

    # tombstone

    applicantId
    applicant {
      id
      preferredName
      avatarImage {
        uri
      }
      gender
      aliveInterval
    }
  }
`

export const SubmissionGroupPersonFragment = gql`
  ${PERSON_FRAGMENT}
  fragment SubmissionGroupPersonFragment on Submission {
    ...on SubmissionGroupPerson {
      details {
        preferredName
        legalName
        description
        avatarImage {
          uri
        }
        headerImage {
          uri
        }
        gender
        aliveInterval
        birthOrder
        deceased
        placeOfBirth
        placeOfDeath
        buriedLocation
        address
        city
        country
        postCode
        phone
        email
        profession
        education
        school
        relationshipType
        legallyAdopted

        altNames: altNamesSubmission {
          add
          remove
        }

        customFields {
          key
          value
          ...on PersonCustomFieldDate {
            type
          }
        }
      }

      source {
        ...ProfileFragment
      }
    }
  }
`

export const getSubmissions = ({
  query: gql`
    ${SubmissionFragment}
    ${SubmissionGroupPersonFragment}
    query {
      getSubmissions {
        ...SubmissionFragment
        ...SubmissionGroupPersonFragment
      }
    }
  `
})
