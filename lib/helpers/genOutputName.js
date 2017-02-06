let assign = require('lodash.assign')
let debug = require('debug')('secure-backup')

module.exports = function generateOutputName (cfg) {
  let config = assign({}, cfg)
  let outputName = config.outputName || config.handler.defaultOutputName
  let today = new Date()
  let year = today.getFullYear()
  let day = today.getDate()
  let month = today.getMonth() + 1
  let seconds = today.getSeconds()
  let minutes = today.getMinutes()
  let hours = today.getHours()
  outputName = `${year}-${month}-${day}:${hours}:${minutes}:${seconds}-${outputName}`

  if (config.outputPath) {
    outputName = config.outputPath + outputName
  }

  if (config.compress) {
    debug('compress enabled: append .gz to output name')
    outputName += '.gz'
  }
  debug('append .enc to output name')
  outputName += '.enc'
  return outputName
}
