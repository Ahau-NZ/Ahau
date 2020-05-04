import gql from 'graphql-tag'

const PERMITTED_PROFILE_ATTRS = [
  'gender',
  'legalName',
  'bornAt',
  'diedAt',
  'preferredName',
  'avatarImage',
  'description',
  'headerImage',
  'altNames',
  'birthOrder',
  'location',
  'email',
  'phone',
  'address',
  'profession',
  'deceased'
]

const PERMITTED_RELATIONSHIP_ATTRS = [
  'relationshipType',
  'legallyAdopted'
]

const whoami = ({
  query: gql`
    {
      whoami {
        profile {
          id
        }
      }
    }
  `,
  fetchPolicy: 'no-cache'
})

const getProfile = id => ({
  query: gql`
    query($id: String!) {
      person(id: $id){
        id
        preferredName legalName altNames
        bornAt diedAt birthOrder
        gender description 
        location  address email
        phone profession deceased
        avatarImage { uri }
        children {
          profile {
            id
            preferredName legalName altNames
            bornAt diedAt birthOrder
            gender description
            location  address deceased
            email phone profession
            avatarImage { uri }
          }
          relationshipId
          relationshipType
        }
        parents {
          profile {
            id
            preferredName legalName altNames
            bornAt diedAt birthOrder
            gender description
            location address email
            phone profession deceased
            avatarImage { uri }
          }
          relationshipId
          relationshipType
        }
        
      }
    }
  `,
  variables: { id: id },
  fetchPolicy: 'no-cache'
})

const saveProfile = input => ({
  mutation: gql`
    mutation($input: ProfileInput!) {
      saveProfile(input: $input)
    }
  `,
  variables: { input }
})

// load person from DB and sort profile
async function loadKnownFamily (loadProfile, person) {
  console.log('loadKnwnfamily: ', person)
  const { children, parents, partners, siblings, relationship } = person
  var profile = {}

  if (loadProfile) {
    profile = await this.getRelatives(person.id)
  } else {
    profile = person
  }

  // populate it with what we do know about family members
  profile = Object.assign(profile, {
    children: children || [],
    parents: parents || [],
    siblings: siblings || [],
    partners: partners || [],
    relationship: relationship
  })

  if (!profile.relationship) profile.relationship = this.relationshipLinks[profile.parents[0].id + '-' + profile.id]

  if (!profile.children || profile.children.length === 0) return profile

  // // change my profile in all of my children
  profile.children = await Promise.all(profile.children.map(async child => {
    if (!child.parents) return child
    child.parents = child.parents.map(parent => {
      if (parent.id === person.id) {
        return profile
      }
      return parent
    })

    return child
  }))

  return profile
}

// get person with parents and children from DB
async function getRelatives (profileId) {
  const request = {
    query: gql`
      query($id: String!) {
        person(id: $id) {
          id
          preferredName
          legalName
          gender
          bornAt
          diedAt
          birthOrder
          description
          address
          email
          phone
          location
          profession
          deceased
          altNames
          avatarImage {
            uri
          }
          children {
            profile {
              id
              preferredName
              legalName
              gender
              bornAt
              diedAt
              birthOrder
              description
              address
              email
              phone
              location
              profession
              deceased
              altNames
              avatarImage {
                uri
              }
            }
            relationshipId
            relationshipType
          }

          parents {
            profile {
              id
              preferredName
              legalName
              gender
              bornAt
              diedAt
              birthOrder
              description
              address
              phone
              email
              location
              profession
              deceased
              altNames
              avatarImage {
                uri
              }
            }
            relationshipId
            relationshipType
          }
        }
      }
    `,
    variables: {
      id: profileId
    },
    fetchPolicy: 'no-cache'
  }
  try {
    const result = await this.$apollo.query(request)
    if (result.errors) {
      console.error('WARNING, something went wrong')
      console.error(result.errors)
      return
    } else {
      return result.data.person
    }
  } catch (e) {
    console.error('WARNING, something went wrong, caught it')
    console.error(e)
  }
}

export default {
  PERMITTED_PROFILE_ATTRS,
  PERMITTED_RELATIONSHIP_ATTRS,
  whoami,
  getProfile,
  saveProfile,
  loadKnownFamily,
  getRelatives
}
