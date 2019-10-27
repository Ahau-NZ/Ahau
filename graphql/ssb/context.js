const pull = require('pull-stream')

module.exports = function getContext (sbot, cb) {
  pull(
    pull.once('go get it!'), // dummy entry
    pull.asyncMap((_, cb) => {
      sbot.whoami((err, data) => {
        if (err) cb(err)
        else cb(null, data.id)
      })
    }),
    pull.asyncMap((feedId, cb) => {
      sbot.profile.findByFeedId(feedId, (err, profileState) => {
        if (err) return cb(err)

        if (profileState) return cb(null, { feedId, profileId: profileState.key })

        const details = {
          // preferredName: { set: 'mix' },
          // altNames: { mixy: 1, mixmix: 2 }
        }
        sbot.profile.create('person', details, (err, profileId) => {
          if (err) return cb(err)

          sbot.profile.link.create({ profile: profileId }, (err, link) => {
            if (err) return cb(err)

            cb(null, { feedId, profileId })
          })
        })
      })
    }),
    pull.collect((err, data) => {
      if (err) cb(err)
      else cb(null, data[0])
    })
  )
}
