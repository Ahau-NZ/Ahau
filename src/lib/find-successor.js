export default function findSuccessor (profile) {
  if (!Array.isArray(profile.partners)) throw new Error('profile missing partners field')
  if (!Array.isArray(profile.children)) throw new Error('profile missing children field')

  if (profile.partners.length === 1) return profile.partners[0]
  if (profile.partners.length > 1) return false

  if (profile.children.length === 1) return profile.children[0]
  if (profile.children.length > 1) return false

  return false
}
