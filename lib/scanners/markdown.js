'use babel'

const { ScannerAbstract } = require('./abstract');

export class ScannerMarkdown extends ScannerAbstract {

  constructor(editor) {
    super(editor, /^ *(#+) (.+)$/g)
  }

  parse(object) {
    match = object.match
    return {level:match[1].length, text:match[2], classList:[]}
  }
}
