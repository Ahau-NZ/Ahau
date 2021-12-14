import pick from 'lodash.pick'

import { PERMITTED_PERSON_ATTRS } from '../../../lib/person-helpers'
import { pruneEmptyValues } from '../../../lib/profile-helpers'
import { saveProfile } from '../profile/apollo-helpers'

export const savePersonMutation = input => {
  input = pick(input, PERMITTED_PERSON_ATTRS)
  input = pruneEmptyValues(input)

  return saveProfile(input)
}

export const deletePersonMutation = (id, allowPublic = false) => {
  const input = {
    id,
    tombstone: { reason: 'user deleted profile' }
  }

  if (allowPublic) input.allowPublic = true

  return saveProfile(input)
}
