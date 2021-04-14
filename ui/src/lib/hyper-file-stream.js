const stream = require('readable-stream')
const http = require('stream-http')

/**
 * Readable stream of a torrent file
 *
 * @param {Blob} blob (uri, size)
 * @param {Object} opts
 * @param {number} opts.start stream slice of file, starting from this byte (inclusive)
 * @param {number} opts.end stream slice of file, ending with this byte (inclusive)
 */

// https://nodejs.org/dist/v10.19.0/docs/api/stream.html#stream_implementing_a_readable_stream
export default class FileStream extends stream.Readable {
  constructor (blob, opts = {}) {
    super(opts)

    const start = (opts && opts.start) || 0
    let end
    if (start) {
      end = (opts && opts.end && opts.end < blob.size)
        ? opts.end
        : blob.size - 1
    }

    this.destroyed = false
    this._reading = false
    this._notifying = false

    this.res = null
    const req = http.request(buildRequest(blob.uri, { start, end }), (res) => {
      this.res = res
      res.on('data', (chunk) => {
        res.pause()
        this.push(chunk)
        this._reading = false
        this._notifying = false
      })
    })
    req.on('error', (e) => {
      console.error(`problem with request: ${e.message}`)
    })
    req.end()
  }

  _read () {
    if (this._reading) return

    this._reading = true
    this._notify()
  }

  _notify () {
    if (!this._reading) return
    if (this._notifying) return

    if (this.res === null) {
      return setTimeout(this._notify, 500) // HACK
    }
    this._notifying = true

    this.res.resume()
  }

  destroy (onclose) {
    this._destroy(null, onclose)
  }

  _destroy (err, onclose) {
    if (this.destroyed) return
    this.destroyed = true

    if (err) this.emit('error', err)
    this.emit('close')
    if (onclose) onclose()
  }
}

function buildRequest (uri, opts = {}) {
  const url = new URL(uri)
  // if (typeof opts.start === 'number') url.searchParams.append('start', opts.start)
  // if (typeof opts.end === 'number') url.searchParams.append('end', opts.end)

  const req = {
    method: 'GET',
    hostname: url.hostname,
    port: url.port,
    path: url.pathname + url.search
  }

  if (typeof opts.start === 'number') {
    req.headers = {
      Range: `bytes=${opts.start}-${opts.end || ''}`
    }
  }

  return req
}
