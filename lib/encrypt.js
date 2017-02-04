'use strict';
let spawn = require('child_process').spawn
let debug = require( 'debug')('secure-backup')

module.exports = function encrypt(config) {
  let commands = [
    'smime',
    '-encrypt',
    '-aes-256-cbc',
    '-binary',
    '-outform',
    'DEM'
  ];

  if (!config.s3) {
      commands = commands.concat([
        '-out', config.outputName
      ])
  }

  commands = commands.concat([config.pubKeyPath])

  let encryption = spawn('openssl', commands);

  encryption.stderr.on('data', function(data) {
    debug('openssl: writing data to sderr \n %s ', data)
  });

  encryption.stdout.on('end', function(data) {
    debug('openssl: writing data to stoud ended')
  });

  encryption.on('close', function(code) {
    if(code !== 0) {
      debug('openssl: failed with code: %s', code)
      throw new Error('Encryption failed with code: ' + code)
    }
    debug('openssl: stream closed successfully')
    encryption.stdin.end();
  })

  return encryption;
}
