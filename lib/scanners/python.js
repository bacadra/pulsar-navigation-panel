'use babel'

const {ScannerAbstract} = require('./abstract');

export class ScannerPython extends ScannerAbstract {

  constructor(editor) {
    super(editor, /^([^#\n]*)#(?:%%)?(\$+[spv1]?|\?)([\!\*-]?)#(.*)/gi)
  }

  parse(object) {
    match = object.match

    if (match[2]==='?') {
      subre = /\( *(\d+) *, *[rf]*['\"](.*?)['\"]/.exec(match[0])
      if (!subre) {return}
      level = parseInt(subre[1])
      if (!level || level > this.maxDepth || level<1 || level>9) {
        return
      } else {
        label = `${subre[2].trim()} ${match[4].trim()}`
      }

    } else if (match[2].slice(-1)==='s') {
      subre = /['\"](.*?)['\"]/.exec(match[0])
      level = match[2].length-1
      if (subre) {
        label = subre[1]+' '+match[4].trim()
      } else {
        label = `${match[1].trim()} ${match[4].trim()}`
      }

    } else if (match[2].slice(-1)==='p') {
      subre = /((?:def|class)[^\:\(\n]*)/.exec(match[0])
      level = match[2].length-1
      if (subre) {
        label = subre[1]+' '+match[4].trim()
      } else {
        label = `${match[1].trim()} ${match[4].trim()}`
      }

    } else if (match[2].slice(-1)==='v') {
      subre = / *(.+) *=/.exec(match[0])
      level = match[2].length-1
      if (subre) {
        label = subre[1]+' '+match[4].trim()
      } else {
        label = `${match[1].trim()} ${match[4].trim()}`
      }

    } else if (match[2].slice(-1)==='1') {
      level = match[2].length-1

      let sr0 = match[1].split(' ')[0]
      if (sr0.slice(-1)===':') {
        sr0 = sr0.substring(0, sr0.length - 1);
      }
      label = (sr0 + ' ' + match[4]).trim()

    } else {
      level = match[2].length
      label = `${match[1].trim()} ${match[4].trim()}`
    }

    if (match[3]==='*') {
      naviClass = 'technical'
    } else if (match[3]==='!') {
      naviClass = 'important'
    } else if (match[3]==='-') {
      naviClass = 'separator'
    } else {
      naviClass = ''
    }

    return {level:level, text:label, naviClass:naviClass}
  }
}
