module.exports = sbot => {
  return {
    Query: {
      whoami: () => sbot.whoami
    }
    //   Mutation: {
    //     publish: async (_, { input: { type, content } }) => {
    //       let parsedContent
    //       // Check if is validjson
    //       if (
    //         /^[\],:{}\s]*$/.test(
    //           content
    //             .replace(/\\["\\\/bfnrtu]/g, '@')
    //             .replace(
    //               /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,
    //               ']'
    //             )
    //             .replace(/(?:^|:|,)(?:\s*\[)+/g, '')
    //         )
    //       ) {
    //       } else {
    //         const doubleQuotesContent = content.replace(/'/g, '"')
    //         parsedContent = JSON.parse(doubleQuotesContent)
    //       }
    //       const formatedContent = Object.assign({ type }, parsedContent)
    //       try {
    //         const published = await publish(formatedContent, sbot)
    //         return published
    //       } catch (err) {
    //         throw err
    //       }
    //     }
    //   }
  }
}
