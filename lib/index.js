'use strict';
let fs = require('fs');
let path = require('path');
let assign = require('lodash.assign')
let encrypt = require('./encrypt.js');
let gzip = require('./gzip.js');
let helpers = require('./helpers');
let debug = require('debug')('secure-backup');
module.exports = function main(cfg) {
  debug('initialized secure-backup')
  let config = {
    pubKeyPath: null,
    outputName: null,
    outputPath: null,
    pg: null,
    mysql: null,
    compress: false,
    s3: null
  }

  config = assign(config, cfg);

  // public key path is required
  if (!fs.existsSync(config.pubKeyPath)) {
    throw new Error('public key not found in ' + config.pubKeyPath)
  }

  // other checks
  if(!config.pg && !config.mysql) {
    throw new Error('property pg or mysql should not be empty')
  }

  if(!config.s3 && !config.outputPath) {
    throw new Error('outputPath should be specified if not using s3')
  }

  if(config.s3 && config.outputPath) {
    throw new Error('property outputPath should be empty when using s3 ')
  }

  return function() {
    debug('starting backup process...')
    let outputName = helpers.generateOutputName(assign({}, config));

    let enc = encrypt(assign({}, config, {outputName: outputName}));

    if(config.pg) {
      debug('handling postgres stream')
      let pg = config.pg.handler();
      if (config.compress) {
        let gz = gzip(config)
        pg.stdout.pipe(gz.stdin)
        gz.stdout.pipe(enc.stdin)
      } else {
        pg.stdout.pipe(enc.stdin)
      }
    }

    if(config.mysql) {return}

    if (config.s3 && !config.outputPath) {
      debug('start uploading to s3...')
      config.s3(outputName, enc.stdout)
    }
  }
}
