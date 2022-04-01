'use babel'

const {ScannerAbstract} = require('./abstract');

export class ScannerAsciiDoc extends ScannerAbstract {

  constructor(editor) {
    super(editor, /^(=={0,5}|#\#{0,5})[ \t]+(.+?)(?:[ \t]+\1)?$/gm);
    this.sectionLevels = {};
  }

  parseResults(match) {
    match = object.match
    let level = 1;
    let c = match[1].length;
    if (c in this.sectionLevels) {
      level = this.sectionLevels[c];
    } else {
      level = Object.keys(this.sectionLevels).length + 1;
      this.sectionLevels[c] = level;
    }
    return {level:level, text:match[2], naviClass:''}
  }
}
