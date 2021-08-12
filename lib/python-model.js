const {AbstractModel} = require('./abstract-model');

const HEADING_REGEX = /^([^#\n]*)#(?:%%)?(\${1,9}[spv1]?|a)([\!\*]?)#(.*)/

class PythonModel extends AbstractModel {

  constructor(editor) {super(editor, HEADING_REGEX)}

  parseResults(scanResult) {
    let level, label, subre, cssExtension

    if (scanResult[2]==='a') {
      subre = /\( *(\d+) *, *[rf]*['\"](.*?)['\"]/.exec(scanResult[0])
      if (!subre) {return}
      level = parseInt(subre[1])
      if (!level || level > this.maxDepth || level<1 || level>9) {
        return
      } else {
        label = `${subre[2].trim()} ${scanResult[4].trim()}`
      }

    } else if (scanResult[2].slice(-1)==='s') {
      subre = /['\"](.*?)['\"]/.exec(scanResult[0])
      level = scanResult[2].length-1
      if (subre) {
        label = subre[1]+' '+scanResult[4].trim()
      } else {
        label = `${scanResult[1].trim()} ${scanResult[4].trim()}`
      }

    } else if (scanResult[2].slice(-1)==='p') {
      subre = /((?:def|class)[^\:\(\n]*)/.exec(scanResult[0])
      level = scanResult[2].length-1
      if (subre) {
        label = subre[1]+' '+scanResult[4].trim()
      } else {
        label = `${scanResult[1].trim()} ${scanResult[4].trim()}`
      }

    } else if (scanResult[2].slice(-1)==='v') {
      subre = / *(.+) *=/.exec(scanResult[0])
      level = scanResult[2].length-1
      if (subre) {
        label = subre[1]+' '+scanResult[4].trim()
      } else {
        label = `${scanResult[1].trim()} ${scanResult[4].trim()}`
      }

    } else if (scanResult[2].slice(-1)==='1') {
      level = scanResult[2].length-1

      let sr0 = scanResult[1].split(' ')[0]
      if (sr0.slice(-1)===':') {
        sr0 = sr0.substring(0, sr0.length - 1);
      }
      label = (sr0 + ' ' + scanResult[4]).trim()

    } else {
      level = scanResult[2].length
      label = `${scanResult[1].trim()} ${scanResult[4].trim()}`
    }

    if (scanResult[3]==='*') {
      cssExtension = 'technical'
    } else if (scanResult[3]==='!') {
      cssExtension = 'important'
    } 
    return {level:level, label:label.trim(), cssExtension:cssExtension}
  }

}

module.exports = {PythonModel}
