'use strict'
let spawn = require('child_process').spawn

module.exports = function gzip (config) {
  return spawn('gzip', ['-c'])
}
