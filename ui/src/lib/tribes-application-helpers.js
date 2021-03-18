import gql from 'graphql-tag'
import { COMMUNITY_FRAGMENT } from './community-helpers'
import { PERSON_FRAGMENT } from './person-helpers'

export const createGroupApplication = ({ groupId, groupAdmins, answers, comment }) => {
  return {
    mutation: gql`
      mutation(
        $groupId: String!,
        $groupAdmins: [String!]!,
        $answers: [GroupApplicationAnswerInput],
        $comment: String
      ) {
        createGroupApplication(
          groupId: $groupId,
          groupAdmins: $groupAdmins,
          answers: $answers,
          comment: $comment
        )
      }
    `,
    variables: {
      groupId,
      groupAdmins,
      answers,
      comment
    }
  }
}

export const acceptGroupApplication = ({ id, comment, groupIntro }) => {
  return {
    mutation: gql`
      mutation($id: String!, $comment: String, $groupIntro: String) {
        acceptGroupApplication(id: $id, applicationComment: $comment, groupIntro: $groupIntro)
      }
    `,
    variables: {
      id,
      comment,
      groupIntro
    }
  }
}

export const declineGroupApplication = ({ id, comment }) => {
  return {
    mutation: gql`
      mutation($id: String!, $comment: String) {
        declineGroupApplication(id: $id, reason: $comment)
      }
    `,
    variables: {
      id,
      comment
    }
  }
}

export const APPLICATION_FRAGMENT = gql`
  ${COMMUNITY_FRAGMENT}
  ${PERSON_FRAGMENT}
  fragment ApplicationFragment on GroupApplication {
    id
    group {
      id
      public {
        ...CommunityFragment
      }
      private {
        ...CommunityFragment
      }
    }
    applicant {
      ...ProfileFragment
    }
    groupAdmins {
      ...ProfileFragment
    }
    decision {
      accepted
    }
    answers {
      question
      answer
    }
    history {
      type
      authorId
      author {
        ...ProfileFragment
      }
      timestamp
      ...on GroupApplicationCommentHistory {
        comment
      }
      ...on GroupApplicationAnswerHistory {
        answers {
          question
          answer
        }
      }
      ...on GroupApplicationDecisionHistory {
        decision {
          accepted
        }
      }
    }
  }
`

export const listGroupApplications = () => {
  return {
    query: gql`
      ${APPLICATION_FRAGMENT}
      query {
        unseen: listGroupApplications {
          ...ApplicationFragment
        }
        accepted: listGroupApplications(accepted: true) {
          ...ApplicationFragment
        }
        declined: listGroupApplications(accepted: false) {
          ...ApplicationFragment
        }
      }`,
    fetchPolicy: 'no-cache'
  }
}

export const getGroupApplication = gql`
  ${APPLICATION_FRAGMENT}
  query($id: String!) {
    getGroupApplication(id: $id) {
      ...ApplicationFragment
    }
  }
`

export function findInvalidProfileProps (profile) {
  // validate required props on a profile when applying to join a community
  // preferredName or legalName
  // dob
  // city
  // country
  const invalidProps = []

  const { preferredName, legalName, aliveInterval, city, country } = profile

  if (!preferredName && !legalName) invalidProps.push({ prop: 'Preferred Name or Full Name' })
  if (!aliveInterval) invalidProps.push({ prop: 'Date of Birth' })
  if (!city) invalidProps.push({ prop: 'City' })
  if (!country) invalidProps.push({ prop: 'Country' })

  return invalidProps
}
