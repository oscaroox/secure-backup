let debug = require('debug')('secure-backup')
let fs = require('fs')

module.exports = function handleStreamEvents (stream, options) {
  let streams = options.streams
  let reject = options.reject
  let resolve = options.resolve
  let name = options.name
  let config = options.config

  stream.stderr.on('data', function (data) {
    debug(name + ': writing to stderr \n%s', data)
    for (let str in streams.spawn) {
      let stream = streams.spawn[str]
      if (stream) {
        stream.stdin.end()
      }
    }
    reject(new Error(data.toString()))
    streams.s3 && streams.s3.abort()
  })

  stream.on('end', function () {
    debug(name + ': writing data to stdout ended')
  })

  stream.on('close', function (code) {
    if (code !== 0) {
      debug(name + ': failed with code %s', code)
      streams.writeStream && fs.unlink(config.outputName, function (err, res) {
        if (err) return reject(err)
        resolve(res)
      })
      return
    }
    debug(name + ': stream closed successfully')
    stream.stdin.end()
  })
}
