import { parseInterval } from './date-helpers'
import isEqual from 'lodash.isequal'
import isEmpty from 'lodash.isempty'
import uniqby from 'lodash.uniqby'
import { arrayChanges } from './story-helpers.js'

function findItemById (initialArray, itemToFind) {
  if (!itemToFind.id) return null
  return initialArray.find(existingItem => {
    return existingItem.id === itemToFind.id
  })
}

export function getObjectChanges (initialValue, updatedValue) {
  var changes = {}

  if (isEqual(initialValue, updatedValue)) return changes

  Object.entries(updatedValue).forEach(([key, value]) => {
    if (key === 'kaitiaki') return
    // see if the value has changes
    if (!isEqual(initialValue[key], updatedValue[key])) {
      switch (true) {
        // the value is an array
        case Array.isArray(updatedValue[key]):
          // intiate the array to add, remove fields
          changes[key] = { add: [], remove: [] }
          var newItems = []
          updatedValue[key].forEach(newItem => {
            // if the item already exists
            var oldItem = findItemById(initialValue[key], newItem)

            if (oldItem) {
              // only get what changed...
              var itemChanges = getObjectChanges(oldItem, newItem)

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

          changes[key].add = removeDuplicates(changes[key].add)
          newItems = removeDuplicates(newItems)

          // add new items to add array
          changes[key].add = [...changes[key].add, ...newItems]

          // remove dupes from remove array
          changes[key].remove = removeDuplicates(changes[key].remove)

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

function removeDuplicates (array) {
  var i = 0

  // make sure newItems are unique as well
  return uniqby(array, (item) => {
    if (item.id) return item.id
    return ++i
  })
}
