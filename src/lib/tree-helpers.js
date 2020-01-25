import clone from 'lodash.clonedeep'

export default {
  flatten,
  hydrate
}

function flatten (node) {
  const { children, parents } = node
  // currently ignores e.g. childNode.relationshipType childNode.legallyAdopted

  const flatNode = Object.assign(
    {},
    node,
    {
      children: children.map(p => p.profile.id),
      parents: parents.map(p => p.profile.id)
    }
  )

  var output = {
    [node.id]: flatNode
  }
  children.forEach(person => { output[person.profile.id] = person.profile })
  parents.forEach(person => { output[person.profile.id] = person.profile })

  // NOTE these children + parent entries have Person data, but dont't yet
  // have associated children/ parent records

  return output
}

function hydrate (node, flatStore) {
  var output = clone(node)

  if (output.children) {
    output.children = output.children
      .map(profileId => {
        // look up the full record to replace the profileId
        var profile = flatStore[profileId]
        profile = hydrate(profile, flatStore)
        return profile
      })
  }

  // TODO: fix this Date hack
  // https://app.asana.com/0/1139954823432348/1155904273421465/f
  // the Date scalar we're using with graphql doesn't currently allow `null` as a valid date.
  // this can be fixed, but for the moment we chose a specific date in the past to encode `null`
  //
  // files invovled:
  // - src/lib/tree-helpers.js
  // - graphql/ssb/queries/get-profile.js

  if (output.bornAt) {
    output.bornAt = output.bornAt.slice(0, 10)
    output.bornAt = (output.bornAt === '-005001-12') ? null : output.bornAt
  }

  if (output.diedAt) {
    output.diedAt = output.diedAt.slice(0, 10)
    output.diedAt = (output.diedAt === '-005001-12') ? null : output.diedAt
  }

  if (output.parents) {
    output.siblings = []
    output.parents = output.parents
      .map(profileId => {
        // look up the full record to replace the profileId
        var profile = flatStore[profileId]

        if (profile.children) {
          const currentSiblings = profile.children.map(d => {
            return d
          })

          const siblings = new Set([...currentSiblings, ...output.siblings])
          siblings.delete(output.id) // remove the current profile from this
          output.siblings = Array.from(siblings)
        }
        return profile
      })
  }

  if (output.siblings) {
    output.siblings = output.siblings
      .map(profileId => {
        var profile = flatStore[profileId]
        return profile
      })
  }

  if (output.partners) {
    output.partners = output.partners
      .map(profileId => flatStore[profileId])
  }
  return output
}
