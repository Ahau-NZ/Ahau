import isEqual from 'lodash.isequal'
import isEmpty from 'lodash.isempty'
import uniqby from 'lodash.uniqby'
import { arrayChanges } from './story-helpers.mjs'
import { parseInterval } from './date-helpers.mjs'

function findItemById (initialArray, itemToFind) {
  if (!itemToFind.id) return null
  return initialArray.find(existingItem => {
    return existingItem.id === itemToFind.id
  })
}

export function getObjectChanges (initialValue, updatedValue) {
  const changes = {}

  if (isEqual(initialValue, updatedValue)) return changes

  Object.entries(updatedValue).forEach(([key, value]) => {
    if (key === 'kaitiaki' || key === 'tiaki' || key === 'customFields') return

    let newItems = []

    // see if the value has changes
    if (!isEqual(initialValue[key], updatedValue[key])) {
      switch (true) {
        // the value is an array
        case Array.isArray(updatedValue[key]):
          // different use case for joiningQuestions
          if (key === 'joiningQuestions') {
            changes[key] = updatedValue[key].map(q => ({ label: q.label, type: q.type }))
              .filter(q => q.label !== '') // ensure it filters out empty entries, these will break backend
            break
          }

          // intiate the array to add, remove fields
          changes[key] = { add: [], remove: [] }
          updatedValue[key].forEach(newItem => {
            // if the item already exists
            const oldItem = findItemById(initialValue[key], newItem)

            if (oldItem) {
              // only get what changed...
              const itemChanges = getObjectChanges(oldItem, newItem)

              // only add if there are changes
              if (!isEmpty(itemChanges)) {
                newItem = { id: newItem.id, linkId: newItem.linkId, ...itemChanges }
                changes[key].add.push(newItem)
              }
            } else {
              newItems.push(newItem)
            }
          })

          changes[key].remove = arrayChanges(initialValue[key], updatedValue[key])

          changes[key].add = removeAddDuplicates(changes[key].add)
          newItems = removeAddDuplicates(newItems)

          // add new items to add array
          changes[key].add = [...changes[key].add, ...newItems]

          // remove dupes from remove array
          changes[key].remove = uniqby(changes[key].remove, 'id')

          // remove add or remove if theyre empty
          if (isEmpty(changes[key].add)) delete changes[key].add
          if (isEmpty(changes[key].remove)) delete changes[key].remove
          break
        // use default for non arrays
        case key === 'duration':
          changes[key] = parseInt(value)
          break
        case key === 'timeInterval':
          changes[key] = parseInterval(value)
          break
        default:
          changes[key] = value
      }
    }
  })

  return changes
}

/*
  Note: only catches duplicates that have an ID
*/
function removeAddDuplicates (array) {
  let i = 0

  // make sure newItems are unique as well
  return uniqby(array, (item) => {
    if (item.id) return item.id
    return ++i // HACK: if it doesnt have an ID (meaning its a new item), it classes them as unique
  })
}
