const pull = require('pull-stream')
const toPull = require('stream-to-pull-stream')
const toUrl = require('ssb-serve-blobs/id-to-url')

module.exports = function PostUploadFile (sbot) {
  return function postUploadFile (file, cb) {
    file
      .then(({ createReadStream, mimetype }) => {
        pull(
          toPull.source(createReadStream()),
          sbot.blobs.add((err, hash) => {
            if (err) return cb(err)
            cb(null, {
              blob: hash,
              mimeType: mimetype,
              uri: toUrl(hash)
              // TODO size:
            })
          })
        )
      })
      .catch(err => {
        throw err
      })
  }
}
