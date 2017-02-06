'use strict'
let fs = require('fs')
let assign = require('lodash.assign')
let encrypt = require('./handlers/encrypt.js')
let gzip = require('./handlers/gzip.js')
let generateOutputName = require('./helpers/genOutputName')
let handleStreamEvents = require('./helpers/handleStreamEvenets')
let debug = require('debug')('secure-backup')
let Promise = require('bluebird')

module.exports = function main (cfg) {
  debug('initialized secure-backup')
  let config = {
    pubKeyPath: null,
    outputName: null,
    outputPath: null,
    handler: null,
    compress: false,
    s3: null
  }

  config = assign(config, cfg)

  // public key path is required
  if (!fs.existsSync(config.pubKeyPath)) {
    throw new Error('public key not found in ' + config.pubKeyPath)
  }

  // other checks
  if (!config.handler) {
    throw new Error('property handler should not be empty')
  }

  if (!config.s3 && !config.outputPath) {
    throw new Error('outputPath should be specified if not using s3')
  }

  if (config.s3 && config.outputPath) {
    throw new Error('property outputPath should be empty when using s3 ')
  }
  return function () {
    return new Promise(function (resolve, reject) {
      debug('starting backup process...')
      let outputName = generateOutputName(assign({}, config))
      let writeStream = null
      let db = config.handler.handler(reject)
      let enc = encrypt(assign({}, config, {outputName: outputName}))
      let gz = null
      let s3 = null

      if (!config.s3 && config.outputPath) {
        debug('start writing to disk...')
        writeStream = fs.createWriteStream(outputName)
        writeStream.on('error', function (err) {
          reject(err)
        })
        writeStream.on('close', function (data) {
          resolve(data)
        })
      }

      debug('handling database stream')
      if (config.compress) {
        gz = gzip(config, reject)
        db.stdout.pipe(gz.stdin)
        gz.stdout.pipe(enc.stdin)
      } else {
        db.stdout.pipe(enc.stdin)
      }

      writeStream && enc.stdout.pipe(writeStream)

      if (config.s3 && !config.outputPath) {
        debug('start uploading to s3...')
        s3 = config.s3(outputName, enc.stdout, resolve, reject)
      }

      let opts = {
        name: null,
        config: assign({}, config, {outputName: outputName}),
        reject: reject,
        resolve: resolve,
        streams: {
          spawn: {
            gz: gz,
            enc: enc,
            db: db
          },
          writeStream: writeStream,
          s3: s3
        }
      }

      handleStreamEvents(db, assign({}, opts, {name: config.handler.name}))

      gz && handleStreamEvents(gz, assign({}, opts, {name: 'gzip'}))

      handleStreamEvents(enc, assign({}, opts, {name: 'openssl'}))
    })
  }
}
