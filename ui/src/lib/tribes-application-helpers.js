import gql from 'graphql-tag'
import pick from 'lodash.pick'
import clone from 'lodash.clonedeep'

import { COMMUNITY_FRAGMENT } from './community-helpers'
import { PERSON_FRAGMENT } from './person-helpers'
import { pruneEmptyValues } from './profile-helpers'

export const createGroupApplication = ({ groupId, answers, comment }) => {
  return {
    mutation: gql`
      mutation(
        $groupId: String!,
        $answers: [GroupApplicationAnswerInput],
        $comment: String
      ) {
        createGroupApplication(
          groupId: $groupId,
          answers: $answers,
          comment: $comment
        )
      }
    `,
    variables: {
      groupId,
      answers,
      comment
    }
  }
}

export const acceptGroupApplication = ({ id, comment, groupIntro }) => {
  return {
    mutation: gql`
      mutation($id: String!, $comment: String, $groupIntro: String) {
        acceptGroupApplication(id: $id, comment: $comment, groupIntro: $groupIntro)
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
    applicantId
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

export function copyProfileInformation (profile) {
  profile = clone(profile)
  // delete field the new profile doesnt need
  const copy = pruneFields(profile)

  if (copy.altNames && copy.altNames.length) {
    copy.altNames = {
      add: copy.altNames
    }
  }

  if (copy.avatarImage) copy.avatarImage = copyImage(copy.avatarImage)
  if (copy.headerImage) copy.headerImage = copyImage(copy.headerImage)

  return pruneEmptyValues(copy)
}

function pruneFields (profile) {
  delete profile.authors
  delete profile.recps
  delete profile.id
  delete profile.tiaki
  delete profile.canEdit
  delete profile.__typename
  delete profile.type

  return profile
}

function copyImage (image) {
  image = clone(image)

  if (image.uri) {
    delete image.unbox
    const url = new URL(image.uri)
    image.unbox = url.searchParams.get('unbox')
  }
  const allowed = pick(image, ['blob', 'mimeType', 'size', 'unbox', 'width', 'height'])
  return pruneEmptyValues(allowed)
}
