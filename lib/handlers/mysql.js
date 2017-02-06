'use strict'
let spawn = require('child_process').spawn
let assign = require('lodash.assign')
let debug = require('debug')('secure-backup')

module.exports = function mysqlHandler (cfg) {
  debug('initialized mysql handler')
  let config = {
    user: null,
    password: null,
    database: null,
    commands: []
  }

  config = assign(config, cfg)

  let commands = [
    '-u', config.user
  ]

  if (config.password) {
    commands = commands.concat([config.password])
  }

  commands = commands.concat(config.database)

  function handler () {
    return spawn('mysqldump', commands)
  }

  return {
    name: 'mysql',
    handler: handler,
    defaultOutputName: 'mysql_dump.sql'
  }
}
