'use strict'
let spawn = require('child_process').spawn

module.exports = function encrypt (config) {
  let commands = [
    'smime',
    '-encrypt',
    '-aes-256-cbc',
    '-binary',
    '-outform',
    'DEM'
  ]

  commands = commands.concat([config.pubKeyPath])

  return spawn('openssl', commands)
}
