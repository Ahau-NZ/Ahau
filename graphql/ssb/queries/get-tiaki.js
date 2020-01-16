const pull = require('pull-stream')

module.exports = function GetTiaki (sbot) {
  return function getTiaki (authors, cb) {
    pull(
      pull.values(authors),
      pull.asyncMap((author, cb) => {
        sbot.profile.findByFeedId(author, cb)
      }),
      pull.collect((err, profiles) => {
        if (err) cb(err)
        else {
          profiles = profiles.map(profile => {
            return {
              id: profile.key,
              // WARNING! we're assuming just one head-state!
              ...profile.states[0].state
            }
          })
          cb(null, profiles)
        }
      })
    )
  }
}
