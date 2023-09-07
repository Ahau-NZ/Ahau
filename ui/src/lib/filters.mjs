// TODO: move these filters into table vuex
import calculateAge from '@/lib/calculate-age'
import isEmpty from 'lodash.isempty'

let tableFilter = []

export function determineFilter (node, filter) {
  tableFilter = filter
  if (tableFilter.deceased && node.data.deceased) return false

  return (
    nameMatchesFilter(node) &&
    locationMatchesFilter(node) &&
    skillsMatchesFilter(node) &&
    filterByAge(node)
  )
}

function nameMatchesFilter (node) {
  if (!tableFilter.name) return true

  const search = setString(tableFilter.name)
  const preferredName = setString(node.data.preferredName)
  const legalName = setString(node.data.legalName)

  return preferredName.includes(search) ||
        legalName.includes(search) ||
        findAltNameMatch(search, node.data.altNames)
}
function findAltNameMatch (filterString, altNames) {
  let altNameFound = false

  if (altNames && altNames.length > 0) {
    for (let i = 0; i < altNames.length; i++) {
      const currAltName = setString(altNames[i])
      if (currAltName.includes(filterString)) altNameFound = true
    }
  }
  return altNameFound
}

function locationMatchesFilter (node) {
  if (!tableFilter.location) return true

  const search = setString(tableFilter.location)
  const address = setString(node.data.address)
  const city = setString(node.data.city)
  const postCode = setString(node.data.postCode)
  const country = setString(node.data.country)

  return address.includes(search) ||
        city.includes(search) ||
        postCode.includes(search) ||
        country.includes(search)
}
function skillsMatchesFilter (node) {
  if (!tableFilter.skills) return true

  const skills = node.data.education
  const profession = setString(node.data.profession)
  const search = setString(tableFilter.skills)
  let skillFound = false

  if (skills && skills.length && skills[0] !== '') {
    for (let i = 0; i < skills.length; i++) {
      const currSkill = setString(skills[i])
      if (currSkill.includes(search)) skillFound = true
    }
  }

  return skillFound || profession.includes(search)
}
function filterByAge (node) {
  if (!(tableFilter.age.max < 150)) return true

  const min = tableFilter.age.min
  const max = tableFilter.age.max

  const nodeAge = calculateAge(node.data.aliveInterval)
  if (!nodeAge) return false
  if (nodeAge >= min && nodeAge <= max) return true
  else return false
}

function setString (name) {
  if (isEmpty(name)) return ''
  return name.toLowerCase().trim()
}
