const pull = require('pull-stream')

const { pullAutoPresentationByRecps } = require('ssb-atala-prism/lib')

const tribeSettingsCache = {}

module.exports = function startAtalaPrism (ssb) {
  ssb.atalaPrism.start()
    .then(autoRequestPresentations)
    .catch(err => console.log('ATALA ERROR (failed to start)', err))

  function isVerifyingTribe (registration, cb) {
    const { groupId } = registration

    if (tribeSettingsCache[groupId]) {
      return cb(null, tribeSettingsCache[groupId])
    }

    ssb.profile.findByGroupId(groupId, (err, profiles) => {
      if (err) return cb(err)
      if (!profiles.public.length) return cb(null, null)

      // check the settings
      const config = ssb.config.atalaPrism
      const { issuesVerifiedCredentials, acceptsVerifiedCredentials } = profiles.public[0]

      // if the tribe is not configured to handle any credentials
      // we just ignore it
      if (!issuesVerifiedCredentials && !acceptsVerifiedCredentials) {
        tribeSettingsCache[groupId] = false
        return cb(null, false)
      }

      const issues = issuesVerifiedCredentials && config.issuers[groupId]
      const verifies = acceptsVerifiedCredentials && config.verifiers[groupId]

      let isVerifying = null

      // TODO: there are edge cases here that we arent yet handling
      if (issues && verifies) {
        // TODO: if the member doesnt have a credential, then start the issue process
        // otherwise, start the verification process
        isVerifying = true
      } else if (verifies) {
        // TODO: if the member doesnt have a credential
        // otherwise, start the verification process
        isVerifying = true
      } else if (issues) {
        // Ignore any registrations for tribes that are just issuing tribes
        isVerifying = false
      } else {
        console.error(`Tribe ${groupId} received a registration that it cannot process for auto-presentation, ignoring it. This could be the tribe is not configured to handle the request`)
      }

      tribeSettingsCache[groupId] = isVerifying

      cb(null, isVerifying ? registration : null)
    })
  }

  async function autoRequestPresentations () {
    ssb.registration.tribe.list({
      get: true,
      accepted: null // only registrations that have not been accepted
    }, (err, registrations) => {
      if (err) throw err // todo  handle error

      pull(
        pull.values(registrations),
        pull.filter(registration => registration.applicantId !== ssb.id), // ignore registrations that i sent

        // only handle registrations for tribes that has the verify settings enabled
        pull.asyncMap((registration, cb) => isVerifyingTribe(registration, cb)),
        pull.filter(Boolean),

        // make sure we arent handling registrations where the auto presentation process
        // has already been started
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
