import gql from 'graphql-tag'
import { pick } from 'lodash-es'

import { COMMUNITY_FRAGMENT } from '@/lib/community-helpers'
import {
  PERMITTED_PERSON_ATTRS,
  PERSON_FRAGMENT
} from '@/lib/person-helpers'

import {
  pruneEmptyValues
} from '@/lib/profile-helpers'

export const approveSubmission = ({ id, comment, targetId }) => {
  return {
    mutation: gql`
      mutation ($id: String!, $comment: String, $targetId: String) {
        approveSubmission(id: $id, comment: $comment, targetId: $targetId)
      }
      `,
    variables: {
      id,
      comment,
      targetId
    }
  }
}

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

export const approveEditWhakapapaViewSubmission = ({ id, comment, allowedFields }) => {
  return {
    mutation: gql`
      mutation ($id: String!, $comment: String, $allowedFields: WhakapapaViewInput!) {
        approveEditWhakapapaView(id: $id, comment: $comment, allowedFields: $allowedFields)
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

export const approveNewWhakapapaLink = ({ id, comment, allowedFields }) => {
  return {
    mutation: gql`
      mutation ($id: String!, $comment: String, $allowedFields: LinkInput!) {
        approveNewWhakapapaLink(id: $id, comment: $comment, allowedFields: $allowedFields)
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

export const proposeNewGroupPerson = ({ input, comment, groupId }) => {
  input = pick(input, PERMITTED_PERSON_ATTRS)
  input = pruneEmptyValues(input)

  return {
    mutation: gql`
      mutation ($input: PersonProfileInput!, $comment: String, $groupId: String!) {
        proposeNewGroupPerson (input: $input, comment: $comment, groupId: $groupId)
      }
    `,
    variables: {
      input,
      comment,
      groupId
    }
  }
}

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

export const proposeEditWhakapapaView = ({ whakapapaId, input, comment, groupId }) => {
  return {
    mutation: gql`
      mutation ($whakapapaId: String!, $input: WhakapapaViewInput!, $comment: String, $groupId: String!) {
        proposeEditWhakapapaView (whakapapaId: $whakapapaId, input: $input, comment: $comment, groupId: $groupId)
      }
    `,
    variables: {
      whakapapaId,
      input,
      comment,
      groupId
    }
  }
}

export const proposeNewWhakapapaLink = ({ input, comment, groupId }) => {
  return {
    mutation: gql`
      mutation ($input: LinkInput!, $comment: String, $groupId: String!) {
        proposeNewWhakapapaLink (input: $input, comment: $comment, groupId: $groupId)
      }
    `,
    variables: {
      input,
      comment,
      groupId
    }
  }
}

export const createSubmissionsLink = ({ parent, child, mappedDependencies }) => {
  return {
    mutation: gql`
      mutation ($parent: String, $child: String, $mappedDependencies: [MappedDependencyInput]) {
        createSubmissionsLink (parent: $parent, child: $child, mappedDependencies: $mappedDependencies)
      }
    `,
    variables: {
      parent,
      child,
      mappedDependencies
    }
  }
}

export const proposeTombstone = ({ recordId, comment, groupId }) => {
  return {
    mutation: gql`
      mutation ($recordId: String!, $comment: String, $groupId: String!) {
        proposeTombstone (recordId: $recordId, comment: $comment, groupId: $groupId)
      }
    `,
    variables: {
      recordId,
      comment,
      groupId
    }
  }
}

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

    approvedByIds
    rejectedByIds

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
        
        # NOTE: relationshipType is causing an error
        # relationshipType
        # legallyAdopted

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
        tombstone {
          date
          reason
        }
      }

      sourceRecord {
        ...ProfileFragment
      }
      targetRecord {
        ...ProfileFragment
      }
      source
      answers: joiningQuestions {
        question: label
        answer: value
      }
    }
  }
`

const WhakapapaLinkFragment = gql`
  fragment FullWhakapapaLinkFragment on WhakapapaLink {
    linkId
    type
    parent
    child
    relationshipType
    legallyAdopted
    # tombstone
    recps
  }
`

export const SubmissionWhakapapaLinkFragment = gql`
  ${WhakapapaLinkFragment}
  fragment SubmissionWhakapapaLinkFragment on Submission {
    approvedByIds
    ...on SubmissionWhakapapaLink {
      details {
        ...FullWhakapapaLinkFragment
      }
      sourceRecord {
        ...FullWhakapapaLinkFragment
      }
      targetRecord {
        ...FullWhakapapaLinkFragment
      }
    }
  }
`

export const SubmissionWhakapapaViewFragment = gql`
  fragment SubmissionWhakapapaViewFragment on Submission {
    ...on SubmissionWhakapapaView {
      details {
        # TODO: add other fields here when they are supported
        ignoredProfiles: ignoredProfilesSubmission {
          add
          remove
        }
      }

      # TODO cherese 20/09/23 we will need to plug in other fields when they are supported
      # There is a problem here where the typeDefs for the WhakapapaView type
      # ID is different from Person type which is ID!. They will need
      # to be the same in order for the interface to use both of them in the same query
      # the UI will be written to use sourceId and targetId to avoid this problem
      

      # this is the existing whakapapa that we are updating (if its an update)
      sourceRecord {
        # WARNING: there is an issue with using id directly.
        # ApolloError: Fields "sourceRecord" conflict because subfields "id" conflict because they return conflicting types "ID" and "ID!".
        # Use different aliases on the fields to fetch both if this was intentional.
        # To fix we will need to make sure the ID's are matching in each module (profile, whakapapa, link, etc)
        whakapapaId: id
        name
        image {
          uri
        }

        # WARNING: do not use ignoredProfiles here, must use ignoredProfilesSubmission instead
        ignoredProfiles: ignoredProfilesSubmission {
          add
          remove
        }
      }

      # this is the result from the update
      targetId
      targetRecord {
        name
        image {
          uri
        }
        # WARNING: do not use ignoredProfiles here, must use ignoredProfilesSubmission instead
        ignoredProfiles: ignoredProfilesSubmission {
          add
          remove
        }
      }
    }
  }
`

export const getSubmissions = ({
  query: gql`
    ${SubmissionFragment}
    ${SubmissionGroupPersonFragment}
    ${SubmissionWhakapapaLinkFragment}
    ${SubmissionWhakapapaViewFragment}
    query {
      getSubmissions {
        id
        targetType
        ...SubmissionFragment
        ...SubmissionGroupPersonFragment
        ...SubmissionWhakapapaLinkFragment
        ...SubmissionWhakapapaViewFragment

        dependencies {
          id
          targetType
          ...SubmissionWhakapapaLinkFragment
        }
      }
    }
  `
})
