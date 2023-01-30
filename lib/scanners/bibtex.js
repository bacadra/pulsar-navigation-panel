'use babel'

const {ScannerAbstract} = require('./abstract');

export class ScannerBibtex extends ScannerAbstract {

  constructor(editor) {
    super(editor, /([^%\n]*)%(\$+)([\*\+\-\!\_]?)%(.*)|^[ ]*\@(\w*)[ ]*{[ ]*([^\,]*)/gmi)
  }

  parse(object) {
    let match = object.match
    let level, text, classList
    if (match[2]) {
      level = match[2].length;
      text = `${match[1].trim()} ${match[4].trim()}`.trim()
    } else if (match[5]) {
      level = 4;
      text = `@${match[5]}: ${match[6]}`;
    }
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
    return {level:level, text:text, classList:classList};
  }
}
