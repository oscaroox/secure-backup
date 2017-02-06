'use strict'
let spawn = require('child_process').spawn
let assign = require('lodash.assign')
let debug = require('debug')('secure-backup')

module.exports = function postgresqlHandler (cfg) {
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

  function handler () {
    return spawn('pg_dump', commands)
  }

  return {
    name: 'postgresql',
    handler: handler,
    defaultOutputName: 'pg_dump.sql'
  }
}
