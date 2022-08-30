import uniqBy from 'lodash.uniqby'
import clone from 'lodash.clonedeep'
import isEmpty from 'lodash.isempty'
import isEqual from 'lodash.isequal'
import get from 'lodash.get'
import { orderBy } from 'lodash'

export const DEFAULT_NEW_FIELD = {
  label: '',
  type: 'text',
  required: false,
  visibleBy: 'members'
}

export const DEFAULT_PROFILE_MODEL = [
  { label: 'first name', type: 'text', required: true, visibleBy: 'members' },
  { label: 'full name', type: 'text', required: false, visibleBy: 'members' },
  { label: 'other names', type: 'array', required: false, visibleBy: 'members' },
  { label: 'gender', type: 'list', required: false, visibleBy: 'members', options: ['male', 'female', 'other', 'unknown'], multiple: false },
  { label: 'related by', type: 'list', required: false, visibleBy: 'members', options: ['birth', 'whangai', 'adopted'], multiple: false },
  { label: 'city', type: 'text', required: true, visibleBy: 'members' },
  { label: 'country', type: 'text', required: true, visibleBy: 'members' },
  { label: 'street address', type: 'text', required: false, visibleBy: 'admin' },
  { label: 'post code', type: 'text', required: false, visibleBy: 'admin' },
  { label: 'email', type: 'text', required: false, visibleBy: 'admin' },
  { label: 'phone', type: 'text', required: false, visibleBy: 'admin' },
  { label: 'description', type: 'text', required: false, visibleBy: 'members' },
  { label: 'birth order', type: 'number', required: false, visibleBy: 'members' },
  { label: 'no longer living', type: 'checkbox', required: false, visibleBy: 'members' },
  { label: 'place of birth', type: 'text', required: false, visibleBy: 'members' },
  { label: 'place of death', type: 'text', required: false, visibleBy: 'members' },
  { label: 'buried location', type: 'text', required: false, visibleBy: 'members' },
  { label: 'profession', type: 'text', required: false, visibleBy: 'members' },
  { label: 'skills/qualifications', type: 'array', required: false, visibleBy: 'members' },
  { label: 'schools', type: 'array', required: false, visibleBy: 'members' }

  // disabled for now (as we dont have custom field dates)
  // { label: 'date of death', type: 'date', required: false, visibleBy: 'members' },
  // { label: 'date of birth', type: 'date', required: false, visibleBy: 'admin' }
]

// these are default fields which are disabled (you cant change or remove them)
// NOTE: date fields disabled for now (as we dont have custom field dates)
export const DISABLED_DEFAULT_FIELDS = ['first name', 'date of birth', 'date of death']

// these are default fields where the required field cannot be enabled
export const REQUIRED_DISABLED_FIELDS = ['description', 'no longer living', 'date of death', 'place of birth', 'place of death', 'buried location']

// this takes all the custom fields, and makes sure there are no duplicates
// by putting them in order of key, then the first of duplicates will
// be the only one that is kept
function getUniqueFields (fields) {
  return uniqBy(
    orderBy(fields, ['key'], ['desc']), 'label'
  )
}

export function getDefaultFields (customFields) {
  const uniqueCustomFields = getUniqueFields(customFields)

  return clone(DEFAULT_PROFILE_MODEL).map(defaultField => {
    const customDefaultField = uniqueCustomFields.find(customField => customField.label === defaultField.label)
    if (customDefaultField) {
      return customDefaultField
    }
    return defaultField
  })
}

export function getCustomFields (customFields) {
  const uniqueCustomFields = getUniqueFields(customFields)

  return uniqueCustomFields.filter(customField => {
    return !clone(DEFAULT_PROFILE_MODEL).some(defaultField => defaultField.label === customField.label)
  })
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
  return Object.entries(mappings)
    .find(([key, label]) => label === prop)
    .at(0)
}

const mappings = {
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
  'skills/qualifications': 'qualifications',
  schools: 'education'

  // disabled for now (as we dont have custom field dates)
  // 'date of birth': 'dateOfBirth',
  // 'date of death': 'dateOfDeath',
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
    .map(([key, value]) => ({ key, value }))
    .filter(({ key, value }) => {
      const fieldDef = customFieldDefs.find(field => field.key === key)
      if (!fieldDef) return false

      // only keep those where the value has changes
      return !isEqual(value, getDefaultFieldValue(fieldDef))
    })
}

/**
 * Method to find the custom field changes against existing ones from the same profile.
 * This method is used when update a profile in a tribe that has custom fields (or doesnt)
 *
 * @param {Array} originalCustomFields the custom field values given by the profile
 * @param {Array} updatedCustomFields raw custom fields in this form { [key]: value }
 * @oaran {Array} customFieldDefs custom field definitions in this form [{ type, key, label, required, visibleBy, order, ... }]
 */
export function getCustomFieldChanges (originalCustomFields, updatedCustomFields, customFieldDefs) {
  return Object.entries(updatedCustomFields)
    .map(([key, value]) => ({ key, value }))
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
      return ''
    case 'checkbox':
      return false
    default:
      return null
  }
}
