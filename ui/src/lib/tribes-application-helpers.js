import gql from 'graphql-tag'
import { COMMUNITY_FRAGMENT } from './community-helpers'
import { PERSON_FRAGMENT } from './person-helpers'

export const createGroupApplication = ({ groupId, groupAdmins, answers, comment }) => {
  return {
    mutation: gql`
      mutation($groupId: String!, $groupAdmins: [String!]!, $opts: ApplicationOptsInput) {
        createGroupApplication(
          groupId: $groupId
          groupAdmins: $groupAdmins
          opts: $opts
        )
      }
    `,
    variables: {
      groupId,
      groupAdmins,
      opts: {
        answers,
        comment
      }
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
      author
      timestamp
      ...on CommentHistory {
        comment
      }
      ...on AnswerHistory {
        answers {
          question
          answer
        }
      }
      ...on DecisionHistory {
        decision {
          accepted
        }
      }
    }
  }
`

export const listGroupApplications = (accepted = null) => {
  return {
    query: gql`
      ${APPLICATION_FRAGMENT}
      query($accepted: Boolean) {
        listGroupApplications(accepted: $accepted) {
          ...ApplicationFragment
        }
      }`,
    variables: {
      accepted
    },
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
  // address
  // city/country
  const invalidProps = []

  const { preferredName, legalName, aliveInterval, address, location } = profile

  if (!preferredName && !legalName) invalidProps.push({ prop: 'Preferred Name or Full Name' })
  if (!aliveInterval) invalidProps.push({ prop: 'Date of Birth' })
  if (!address) invalidProps.push({ prop: 'Address' })
  if (!location) invalidProps.push({ prop: 'City, Country' })

  return invalidProps
}
