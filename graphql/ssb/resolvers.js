module.exports = sbot => {
  return {
    Query: {
      whoami: () => sbot.whoami,
      profile: () => sbot.about
    },
    Mutation: {
      saveProfile: async (_, { input }) => {
        try {
          const saved = await sbot.publish({
            type: 'profile',
            content: input
          })
          return saved
        } catch (err) {
          throw err
        }
      }
    }
  }
}
