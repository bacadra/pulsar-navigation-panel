const { ScannerAbstract } = require('./abstract')

class ScannerPython extends ScannerAbstract {

  constructor(editor) {
    super(editor, /^([^#\n]*)#(?:%%)?(\$+[spv1]?|\?)([\*\+\-\!]?)([\_\<]*)#(.*)/gi)
  }

  parse(object) {
    let match = object.match
    let level, text, classList, subre

    if (match[2]==='?') {
      subre = /\( *(\d+) *, *[rf]*['\"](.*?)['\"]/.exec(match[0])
      if (!subre) {return}
      level = parseInt(subre[1])
      if (!level || level > this.maxDepth || level<1 || level>9) {
        return
      } else {
        text = `${subre[2].trim()} ${match[5].trim()}`
      }

    } else if (match[2].slice(-1)==='s') {
      subre = /['\"](.*?)['\"]/.exec(match[0])
      level = match[2].length-1
      if (subre) {
        text = subre[1]+' '+match[5].trim()
      } else {
        text = `${match[1].trim()} ${match[5].trim()}`
      }

    } else if (match[2].slice(-1)==='p') {
      subre = /((?:def|class)[^\:\(\n]*)/.exec(match[0])
      level = match[2].length-1
      if (subre) {
        text = subre[1]+' '+match[5].trim()
      } else {
        text = `${match[1].trim()} ${match[5].trim()}`
      }

    } else if (match[2].slice(-1)==='v') {
      subre = / *(.+) *=/.exec(match[0])
      level = match[2].length-1
      if (subre) {
        text = subre[1]+' '+match[5].trim()
      } else {
        text = `${match[1].trim()} ${match[5].trim()}`
      }

    } else if (match[2].slice(-1)==='1') {
      level = match[2].length-1

      let sr0 = match[1].split(' ')[0]
      if (sr0.slice(-1)===':') {
        sr0 = sr0.substring(0, sr0.length - 1);
      }
      text = (sr0 + ' ' + match[5]).trim()

    } else {
      level = match[2].length
      text = `${match[1].trim()} ${match[5].trim()}`
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
    } else {
      classList = []
    }

    if (match[4]) {
      if (new Set(match[4]).size !== match[4].length) {
        return // don't allow duplicates
      }
      if (match[4].includes('_')) {
        classList.push('separator')
      }
      if (match[4].includes('<')) {
        classList.push('larger')
      }
    }

    return { level:level, text:text, classList:classList }
  }
}

module.exports = { ScannerPython }
