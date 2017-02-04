'use strict';
let spawn = require('child_process').spawn;
let assign = require('lodash.assign');
let debug = require('debug')('secure-backup');

module.exports = function postgresqlHandler(cfg) {
  debug('initialized postgres handler')
  let config = {
    user: null,
    password: null,
    database: null,
    commands: []
  }

  config = assign(config, cfg)

  let commands = [
    '-U', config.user
  ]

  if (config.password) {
    commands = commands.concat([config.password])
  }
  commands = commands.concat(config.database)

  function handler() {
    let pgDump = spawn('pg_dump', commands);

    pgDump.stderr.on('data', function (data) {
      debug('pg_dump: writing data to stderr %s', data)
    });

    pgDump.stdout.on('end', function (data) {
      debug('pg_dump: writing data to stdout ended')
    });

    pgDump.on('close', function (code) {
      if (code !== 0) {
        debug('pg_dump: failed with code %s', code)
      }
      debug('pg_dump: stream closed successfully')
      pgDump.stdin.end();
    });

    return pgDump;
  }

  return {
    handler: handler,
    defaultOutputName: 'pg_dump.sql'
  }
}
