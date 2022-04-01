'use babel'

const {ScannerAbstract} = require('./abstract');

export class ScannerBibtex extends ScannerAbstract {

  constructor(editor) {
    super(editor, /([^%\n]*)%(\$+)([\*!-]?)%(.*)|^[ ]*\@(\w*)[ ]*{[ ]*([^\,]*)/gmi)
  }

  parse(object) {
    match = object.match
    if (match[3]==='*') {
      naviClass = 'technical'
    } else if (match[3]==='!') {
      naviClass = 'important'
    } else if (match[3]==='-') {
      naviClass = 'separator'
    } else {
      naviClass = ''
    }
    if (match[2]) {
      level = match[2].length;
      text = `${match[1].trim()} ${match[4].trim()}`.trim()
    } else if (match[5]) {
      level = 4;
      text = `@${match[5]}: ${match[6]}`;
    }
    return {level:level, text:text, naviClass:naviClass};
  }
}
