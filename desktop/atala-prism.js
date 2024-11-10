const pull = require('pull-stream')

const { pullAutoPresentationByRecps } = require('ssb-atala-prism/lib')

module.exports = function startAtalaPrism (ssb) {
  ssb.atalaPrism.start()
    .then(autoRequestPresentations)
    .catch(err => console.log('ATALA ERROR (failed to start)', err))

  async function autoRequestPresentations () {
    ssb.registration.tribe.list({
      get: true,
      accepted: null
    }, (err, registrations) => {
      if (err) throw err // todo  handle error

      pull(
        pull.values(registrations),
        pull.asyncMap((registration, cb) => {
          const { recps } = registration
          if (!recps) return cb(null, null) // filter at next step

          pull(
            pullAutoPresentationByRecps(ssb, recps),
            pull.take(1),
            pull.collect((err, autoPresentations) => {
              // if there was an error OR
              // if there is already an auto-presentation
              if (err || autoPresentations.length) cb(null, null) // filter at next step
              else cb(null, registration) // allow to continue
            })
          )
        }),
        pull.filter(Boolean),
        pull.drain(registration => {
          const { groupId, recps } = registration // eslint-disable-line
          const [poBoxId, feedId] = recps

          // NOTE: this previously used ssb.atalaPrism.requestPresentation which was an approach
          // that required establishing a connection between the agent and the peer.
          // whereas ssb.atalaPrism.requestPresentationInvitation uses a connectionless approach
          ssb.atalaPrism.requestPresentationInvitation(groupId, poBoxId, feedId)
        })
      )
    })
  }
}
