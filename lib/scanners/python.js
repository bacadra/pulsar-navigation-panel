'use babel'

const {ScannerAbstract} = require('./abstract');

export class ScannerPython extends ScannerAbstract {

  constructor(editor) {
    super(editor, /^([^#\n]*)#(?:%%)?(\$+[spv1]?|\?)([\*\+\-\!\_]?)#(.*)/gi)
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
        text = `${subre[2].trim()} ${match[4].trim()}`
      }

    } else if (match[2].slice(-1)==='s') {
      subre = /['\"](.*?)['\"]/.exec(match[0])
      level = match[2].length-1
      if (subre) {
        text = subre[1]+' '+match[4].trim()
      } else {
        text = `${match[1].trim()} ${match[4].trim()}`
      }

    } else if (match[2].slice(-1)==='p') {
      subre = /((?:def|class)[^\:\(\n]*)/.exec(match[0])
      level = match[2].length-1
      if (subre) {
        text = subre[1]+' '+match[4].trim()
      } else {
        text = `${match[1].trim()} ${match[4].trim()}`
      }

    } else if (match[2].slice(-1)==='v') {
      subre = / *(.+) *=/.exec(match[0])
      level = match[2].length-1
      if (subre) {
        text = subre[1]+' '+match[4].trim()
      } else {
        text = `${match[1].trim()} ${match[4].trim()}`
      }

    } else if (match[2].slice(-1)==='1') {
      level = match[2].length-1

      let sr0 = match[1].split(' ')[0]
      if (sr0.slice(-1)===':') {
        sr0 = sr0.substring(0, sr0.length - 1);
      }
      text = (sr0 + ' ' + match[4]).trim()

    } else {
      level = match[2].length
      text = `${match[1].trim()} ${match[4].trim()}`
    }

    text = text.replace(/~+/g, ' ').replace(/--/g, '–')

    if (match[3]==='*') {
      classList = ['info']
    } else if (match[3]==='+') {
      classList = ['success']
    } else if (match[3]==='-') {
      classList = ['warning']
    } else if (match[3]==='!') {
      classList = ['error']
    } else if (match[3]==='_') {
      classList = ['separator']
    } else {
      classList = []
    }

    return {level:level, text:text, classList:classList}
  }
}
