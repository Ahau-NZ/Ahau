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

export const editProfileSubmission = ({ profileId, details, comment, recps }) => {
  return {
    mutation: gql`
    mutation (
        $recordId: String!,
        $details: PersonProfileInput!,
        $comment: String,
        $recps: [String]
        ) {
          proposeEditGroupPerson (
            recordId: $recordId,
            details: $details,
            comment: $comment,
            recps: $recps)
    }
    `,
    variables: {
      recordId: profileId,
      details: details,
      comment: comment,
      recps: recps

    }
  }
}

// TODO: get all submissions for specific whakapapa
export const listSubmissions = ({ whakapapaId }) => {
  return {
    mutation: gql`
      mutation ( $whakapapaId: String! ) {
        listSubmissions ( id: $whakapapaId )
      }
    `,
    variables: {
      whakapapaId: whakapapaId
    }
  }
}
