const {AbstractModel} = require('./model-abstract');

const HEADING_REGEX = /([^%\n]*)%(\$+)%(.*)|^[ ]*\@(\w*)[ ]*{[ ]*([^\,]*)/i

class BibtexModel extends AbstractModel {

  constructor(editorOrBuffer) {super(editorOrBuffer, HEADING_REGEX)}

  parseResults(scanResult) {
    let level; let label;
    if (scanResult[2]) {
      level = scanResult[2].length;
      label = `${scanResult[1].trim()} ${scanResult[3].trim()}`.trim()
    } else if (scanResult[4]) {
      level = 4;
      label = `@${scanResult[4]}: ${scanResult[5]}`;
    }
    return {level: level, label: label};
  }
}

module.exports = {BibtexModel}
