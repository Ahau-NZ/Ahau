import { isEmpty, isEqual, get, cloneDeep as clone } from 'lodash-es'

export const DEFAULT_NEW_FIELD = {
  label: '',
  type: 'text',
  required: false,
  visibleBy: 'members'
}

export const DEFAULT_PROFILE_MODEL = [
  { label: 'profile image', type: 'image', required: false, visibleBy: 'members', order: 1 },
  { label: 'first name', type: 'text', required: true, visibleBy: 'members', order: 2 },
  { label: 'full name', type: 'text', required: false, visibleBy: 'members', order: 3 },
  { label: 'other names', type: 'array', required: false, visibleBy: 'members', order: 4 },
  { label: 'date of birth', type: 'date', required: false, visibleBy: 'members', order: 5 },
  { label: 'gender', type: 'list', required: false, visibleBy: 'members', options: ['male', 'female', 'other', 'unknown'], multiple: false, order: 6 },
  { label: 'related by', type: 'list', required: false, visibleBy: 'members', options: ['birth', 'whangai', 'adopted'], multiple: false, order: 7 },
  { label: 'city', type: 'text', required: true, visibleBy: 'members', order: 8 },
  { label: 'country', type: 'text', required: true, visibleBy: 'members', order: 9 },
  { label: 'street address', type: 'text', required: false, visibleBy: 'admin', order: 10 },
  { label: 'post code', type: 'text', required: false, visibleBy: 'members', order: 11 },
  { label: 'email', type: 'text', required: false, visibleBy: 'admin', order: 12 },
  { label: 'phone', type: 'text', required: false, visibleBy: 'admin', order: 13 },
  { label: 'description', type: 'text', required: false, visibleBy: 'members', order: 14 },
  { label: 'birth order', type: 'number', required: false, visibleBy: 'members', order: 15 },
  { label: 'no longer living', type: 'checkbox', required: false, visibleBy: 'members', order: 16 },
  { label: 'date of death', type: 'date', required: false, visibleBy: 'members', order: 17 },
  { label: 'place of birth', type: 'text', required: false, visibleBy: 'members', order: 18 },
  { label: 'place of death', type: 'text', required: false, visibleBy: 'members', order: 19 },
  { label: 'buried location', type: 'text', required: false, visibleBy: 'members', order: 20 },
  { label: 'profession', type: 'text', required: false, visibleBy: 'members', order: 21 },
  { label: 'skills/qualifications', type: 'array', required: false, visibleBy: 'members', order: 22 },
  { label: 'schools', type: 'array', required: false, visibleBy: 'members', order: 23 },
  { label: 'age', type: 'number', required: false, visibleBy: 'members', order: 24 }
]

// these are default fields which are disabled (you cant change or remove them)
export const DISABLED_DEFAULT_FIELDS = [
  'first name', // NOTE: this is required for all profiles
  'profile image' // TODO cherese 2023-10-31 changes to this field as a custom field are not yet supported, so disabling it until support is added
]

// these are default fields where the required field cannot be enabled
export const REQUIRED_DISABLED_FIELDS = ['description', 'no longer living', 'date of death', 'place of birth', 'place of death', 'buried location']

// this takes all the custom fields, and makes sure there are no duplicates
// by putting them in order of key, then the first of duplicates will
// be the only one that is kept
function getUniqueFields (fields) {
  const fieldNames = Array.from(new Set(fields.map(f => f.label)))
  const fieldsByTime = fields.sort((a, b) => b.key >= a.key ? -1 : +1)

  return fieldNames
    .map(label => {
      // find first match which is untombstoned
      const untombstoned = fieldsByTime.find(f => f.label === label && !f.tombstone)
      if (untombstoned) return untombstoned

      return fieldsByTime.find(f => f.label === label)
    })
}

// default fields, but informed by customFields, which can be used to mutate defaults
export function getDefaultFields (customFields) {
  const uniqueCustomFields = getUniqueFields(customFields)

  return DEFAULT_PROFILE_MODEL
    .map(defaultField => {
      // see if there is a custom field definition overidding default
      const customField = uniqueCustomFields
        .find(field => field.label === defaultField.label)

      // return that or all back to default
      return customField || defaultField
    })
    // drop the tombstoned ones!
    .filter(field => !field.tombstone)
}

// custom fields, but excluding fields that are mutating the default fields
export function getCustomFields (customFields) {
  // WARNING: there is an infinite loop, unsure where its root is, but
  // this line fixes it
  customFields = clone(customFields)

  const uniqueCustomFields = getUniqueFields(customFields)

  return uniqueCustomFields
    .filter(field => (
      !DEFAULT_PROFILE_MODEL.some(defaultField => defaultField.label === field.label)
    ))
    // drop the tombstoned ones!
    .filter(field => !field.tombstone)
    .sort((a, b) => b.key >= a.key ? -1 : +1)
}

export function findMissingRequiredFields (profile, requiredFields) {
  const invalidProps = []

  requiredFields.forEach(requiredField => {
    if (!profile[mapLabelToProp(requiredField.label)]) invalidProps.push({ prop: requiredField.label })
  })

  return invalidProps
}

export function mapLabelToProp (label) {
  return mappings[label]
}

export function mapPropToLabel (prop) {
  const found = Object.entries(mappings)
    .find(([key, label]) => label === prop)

  if (found) return found.at(0)

  return found ? found.at(0) : null
}

const mappings = {
  'profile image': 'avatarImage',
  'first name': 'preferredName',
  'full name': 'legalName',
  'other names': 'altNames',
  gender: 'gender',
  'related by': 'relatedBy',
  city: 'city',
  country: 'country',
  'street address': 'address',
  'post code': 'postCode',
  email: 'email',
  phone: 'phone',
  description: 'description',
  'birth order': 'birthOrder',
  'no longer living': 'isDeceased',
  'place of birth': 'placeOfBirth',
  'place of death': 'placeOfDeath',
  'buried location': 'buriedLocation',
  profession: 'profession',
  'skills/qualifications': 'education',
  schools: 'school',
  'date of birth': 'dateOfBirth',
  'date of death': 'dateOfDeath'
}

/**
 * This method returns the custom field changes against the default values.
 * This method is used when creating a new profile in a tribe
 *
 * @param {Object} customFields raw custom fields in this form { [key]: value }
 * @param {Array} customFieldDefs custom field definitions in this form [{ type, key, label, required, visibleBy, order, ... }]
 */
export function getInitialCustomFieldChanges (rawCustomFields, customFieldDefs) {
  if (isEmpty(rawCustomFields)) return []

  return Object.entries(rawCustomFields)
    .map(([key, value]) => {
      const fieldDef = customFieldDefs.find(field => field.key === key)
      // doing the filtering here so that we dont have to search the fieldDef again in the next step
      if (!fieldDef) return undefined
      if (isEqual(value, getDefaultFieldValue(fieldDef))) return undefined

      return (fieldDef.type === 'date')
        ? { type: 'date', key, value }
        : { key, value }
    })
    .filter(Boolean)
}

/**
 * Method to find the custom field changes against existing ones from the same profile.
 * This method is used when update a profile in a tribe that has custom fields (or doesnt)
 *
 * @param {Array|Object} originalCustomFields the custom field values given by the profile
 * @param {Object} updatedCustomFields raw custom fields in this form { [key]: value }
 * @oaran {Array} customFieldDefs custom field definitions in this form [{ type, key, label, required, visibleBy, order, ... }]
 */
export function getCustomFieldChanges (originalCustomFields, updatedCustomFields, customFieldDefs) {
  if (!originalCustomFields || !updatedCustomFields || !customFieldDefs) return []

  // sometimes the originalCustomFields given can be in a different format depending on where the profile came from
  // here we check and convert it accordingly
  if (!Array.isArray(originalCustomFields) && typeof originalCustomFields === 'object') {
    // convert it to any array
    originalCustomFields = Object.entries(originalCustomFields)
      .map(convertCustomFieldObjectToArray)
  }

  return Object.entries(updatedCustomFields)
    .map(convertCustomFieldObjectToArray)
    .filter(({ key, value }) => {
      // find the fields definition
      const fieldDef = customFieldDefs.find(field => field.key === key)
      if (!fieldDef) return false

      // find any existing value of the field from the current profile
      const fieldOriginalValue = originalCustomFields.find(field => field.key === key)

      // only keep those where the value has changed from the original value and the default value
      return (!isEqual(get(fieldOriginalValue, 'value'), value) && !isEqual(value, getDefaultFieldValue(fieldDef)))
    })
}

/**
 *
 * Method to get the raw custom fields depending on whether the current user is a kaitiaki
 * or not.
 *
 * @param {Object} rawTribe the raw tribe in the form { id: public: [Community], private: [Community] }
 * @param {Boolean} isKaitiaki boolean stating whether the current user is a kaitiaki of this tribe or not
 * @returns {Array} customFieldDefinitions
 */
export function getRawCustomFields (rawTribe, isKaitiaki) {
  const customFields = get(rawTribe, 'public[0].customFields', [])
  if (isKaitiaki) return customFields

  // if the use is not a kaitiaki, only the fields that are visibleBy members
  // are returned
  return customFields
    .filter(field => field.visibleBy === 'members')
}

export function getTribeCustomFields (rawTribe, isKaitiaki) {
  const rawCustomFields = getRawCustomFields(rawTribe, isKaitiaki)

  return getCustomFields(rawCustomFields)
}

const convertCustomFieldObjectToArray = ([key, value]) => ({ key, value })

/**
 * This method returns the default value for a custom field, depending on its type
 *
 * @param {Object} field { type } the custom field definition
 */
export function getDefaultFieldValue (field) {
  switch (field.type) {
    case 'list':
      return []
    case 'array':
      return ['']
    case 'text':
    case 'date':
      return ''
    case 'checkbox':
      return false
    default:
      return null
  }
}
