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

export const proposeEditGroupPerson = ({ profileId, input, comment, recps }) => {
  return {
    mutation: gql`
      mutation ($profileId: String!, $input: PersonProfileInput!, $comment: String, $recps: [String]) {
        proposeEditGroupPerson (profileId: $profileId, input: $input, comment: $comment, recps: $recps)
      }
    `,
    variables: {
      profileId,
      input,
      comment,
      recps
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

export const SubmissionFragment = gql`
  fragment SubmissionFragment on Submission {
    id
    targetId
    targetType
    recps
    comments {
      feedId
      comment
    }

    approvedBy
    rejectedBy

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
        
        # NOTE: the fields below are causing errors
        # because they are not being returned in the format
        # expected by the Person type definition
        # I have disabled these until we add in support
        # altNames
        # customFields {
        #   key
        #   value
        # }
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
