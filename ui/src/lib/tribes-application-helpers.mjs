import gql from 'graphql-tag'
import { pick, cloneDeep as clone } from 'lodash-es'

import { COMMUNITY_FRAGMENT } from './community-helpers.mjs'
import { PERSON_FRAGMENT } from './person-helpers.mjs'
import { pruneEmptyValues } from './profile-helpers.mjs'

export const createGroupApplication = ({ groupId, answers, comment, customFields }) => {
  return {
    mutation: gql`
      mutation(
        $groupId: String!,
        $answers: [GroupApplicationAnswerInput],
        $comment: String,
        $customFields: [PersonGroupCustomFieldInput]
      ) {
        createGroupApplication(
          groupId: $groupId
          answers: $answers
          comment: $comment
          customFields: $customFields
        )
      }
    `,
    variables: {
      groupId,
      answers,
      comment,
      customFields
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

        # public settings
        issuesVerifiedCredentials
        acceptsVerifiedCredentials
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
    credentialPresentations {
      state
      credentials {
        issuanceDate
        credentialSubject {
          memberOf {
            tribeId
            tribeName
          }
          person {
            dateOfBirth
            fullName
          }
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

export const offerMembershipCredential = ({ tribeId, poBoxId, feedId, claims }) => {
  return {
    mutation: gql`
      mutation(
        $tribeId: String!,
        $poBoxId: String!,
        $feedId: String!,
        $claims: MembershipClaimInput!,
        $connectionless: Boolean
      ) {
        offerCredential(
          tribeId: $tribeId, 
          poBoxId: $poBoxId, 
          feedId: $feedId, 
          claims: $claims,
          connectionless: $connectionless
        )
      }
    `,
    variables: {
      tribeId,
      poBoxId,
      feedId,
      claims,
      connectionless: true
    }
  }
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
