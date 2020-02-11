const { MockList } = require('apollo-server')
const casual = require('casual')

module.exports = {
  Query: () => ({
    profile: () => ({
      id: () => casual.ip,
      preferredName: () => casual.name,
      legalName: () => casual.full_name,
      altNames: () => new MockList([0, 4], () => casual.name),
      avatarImage: () => 'https://picsum.photos/300/300',
      headerImage: () => 'https://picsum.photos/800/300',
      description: () => casual.catch_phrase
    }),
    communities: () =>
      new MockList([1, 8], () => ({
        id: () => casual.ip,
        preferredName: () => casual.company_name,
        legalName: () => casual.company_name,
        altNames: () => new MockList([0, 4], () => casual.word),
        avatarImage: () => 'https://picsum.photos/300/300',
        headerImage: () => 'https://picsum.photos/800/300',
        description: () => casual.description
      }))
  })
}
