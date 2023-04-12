import gql from 'graphql-tag'

export const approveSubmission = ({ submissionId, comment }) => {
  return {
    mutation: gql`
      mutation ($id: String!, $comment: String) {
        approveSubmission(id: $id, comment: $comment)
      }
      `,
    variables: {
      id: submissionId,
      comment: comment
    }
  }
}

export const rejectSubmission = ({ submissionId, comment }) => {
  return {
    mutation: gql`
      mutation ($id: String!, $comment: String) {
        rejectSubmission(id: $id, comment: $comment)
      }
      `,
    variables: {
      id: submissionId,
      comment: comment
    }
  }
}

export const tombstoneSubmission = ({ submissionId, tombstoneInput }) => {
  return {
    mutation: gql`
      mutation ($id: String!, $tombstoneInput: TombstoneInput!) {
        tombstoneSubmission(id: $id, tombstoneInput: $tombstoneInput)
      }
    `,
    variables: {
      id: submissionId,
      tombstoneInput
    }
  }
}

export const proposeNewGroupPerson = ({ input, comment, recps }) => {
  return {
    mutation: gql`
      mutation ($input: PersonProfileInput!, $comment: String, recps: [String]) {
        proposeNewGroupPerson (input: $input, comment: $comment, recps: $recps)
      }
    `,
    variables: {
      input,
      comment,
      recps
    }
  }
}

export const proposeEditGroupPerson = ({ profileId, input, comment }) => {
  return {
    mutation: gql`
      mutation ($profileId: String!, $input: PersonProfileInput!, $comment: String) {
        proposeEditGroupPerson (profileId: $profileId, input: $input, comment: $comment)
      }
    `,
    variables: {
      profileId,
      input,
      comment
      // TODO recps for the submission
    }
  }
}

export const proposeTombstone = ({ recordId, comment }) => {
  return {
    mutation: gql`
      mutation ($recordId: String!, $comment: String) {
        proposeTombstone (recordId: $recordId, comment: $comment)
      }
    `,
    variables: {
      recordId,
      comment
      // TODO recps for the submission
    }
  }
}

// // TODO: get all submissions for specific whakapapa
// export const listSubmissions = ({ whakapapaId }) => {
//   return {
//     mutation: gql`
//       mutation ( $whakapapaId: String! ) {
//         listSubmissions ( id: $whakapapaId )
//       }
//     `,
//     variables: {
//       whakapapaId: whakapapaId
//     }
//   }
// }
