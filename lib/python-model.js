const {AbstractModel} = require('./abstract-model');

const HEADING_REGEX = /^([^#\n]*)#(\${1,9}[spv]?|a)#(.*)/

class PythonModel extends AbstractModel {

  constructor(editor) {super(editor, HEADING_REGEX)}

  parseResults(scanResult) {
    let level, label, subre

    if (scanResult[2]==='a') {
      subre = /\( *(\d+) *, *[rf]*['\"](.*?)['\"]/.exec(scanResult[0])
      if (!subre) {return}
      level = parseInt(subre[1])
      if (!level || level > this.maxDepth || level<1 || level>9) {
        return
      } else {
        label = `${subre[2].trim()} ${scanResult[3].trim()}`
      }

    } else if (scanResult[2].slice(-1)==='s') {
      subre = /['\"](.*?)['\"]/.exec(scanResult[0])
      level = scanResult[2].length-1
      if (subre) {
        label = subre[1]+' '+scanResult[3].trim()
      } else {
        label = `${scanResult[1].trim()} ${scanResult[3].trim()}`
      }

    } else if (scanResult[2].slice(-1)==='p') {
      subre = /((?:def|class)[^\:\(\n]*)/.exec(scanResult[0])
      level = scanResult[2].length-1
      if (subre) {
        label = subre[1]+' '+scanResult[3].trim()
      } else {
        label = `${scanResult[1].trim()} ${scanResult[3].trim()}`
      }

    } else if (scanResult[2].slice(-1)==='v') {
      subre = / *(.+) *=/.exec(scanResult[0])
      level = scanResult[2].length-1
      if (subre) {
        label = subre[1]+' '+scanResult[3].trim()
      } else {
        label = `${scanResult[1].trim()} ${scanResult[3].trim()}`
      }

    } else {
      level = scanResult[2].length
      label = `${scanResult[1].trim()} ${scanResult[3].trim()}`
    }

    return {level:level, label:label.trim()}
  }

}

module.exports = {PythonModel}
