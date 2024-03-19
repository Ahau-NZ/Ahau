const pull = require('pull-stream')
const CRUT = require('ssb-crut')

const { pullAutoPresentationByRecps } = require('ssb-atala-prism/lib')
const registrationGroupSpec = require('ssb-tribes-registration/spec/registration-group')

module.exports = function startAtalaPrism (ssb) {
  const registrationGroup = new CRUT(ssb, registrationGroupSpec)

  ssb.atalaPrism.start()
    .then(autoRequestPresentations)
    .catch(err => console.log('ATALA ERROR (failed to start)', err))

  function autoRequestPresentations () {
    pull(
      ssb.messagesByType({
        type: 'registration/group',
        private: true,
        live: true,
        old: false
      }),

      pull.filter(m => (
        m.value.author !== ssb.id && // ignore registrations I sent
        registrationGroup.isRoot(m)
      )),

      // filter for regristations which haven't had auto-presentation started
      pull.asyncMap((m, cb) => {
        const { recps } = m.value.content
        if (!recps) return cb(null, null) // filter at next step

        pull(
          pullAutoPresentationByRecps(ssb, recps),
          pull.take(1),
          pull.collect((err, autoPresentations) => {
            // if there was an error OR
            // if there is already an auto-presentation
            if (err || autoPresentations.length) cb(null, null) // filter at next step
            else cb(null, m.value.content) // allow to continue
          })
        )
      }),
      pull.filter(Boolean),

      pull.drain(content => {
        const { groupId, recps } = content // eslint-disable-line
        const [poBoxId, feedId] = recps

        ssb.atalaPrism.requestPresentation(groupId, poBoxId, feedId)
      })
    )
  }
}
