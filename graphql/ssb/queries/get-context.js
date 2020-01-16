module.exports = function getContext (sbot, cb) {
  sbot.whoami((err, data) => {
    if (err) return cb(err)

    const { id: feedId } = data

    sbot.profile.findByFeedId(feedId, (err, profileState) => {
      if (err) return cb(err)

      if (profileState) {
        return cb(null, { feedId, profileId: profileState.key })
      }

      // create a new empty profile
      // and link this profile to my feedId
      sbot.profile.create('person', {}, (err, profileId) => {
        if (err) return cb(err)

        sbot.profile.link.create({ profile: profileId }, (err, link) => {
          if (err) return cb(err)

          cb(null, { feedId, profileId })
        })
      })
    })
  })
}
