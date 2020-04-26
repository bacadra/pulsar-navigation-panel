const {AbstractModel} = require('./abstract-model');

const reHead = [
  /(\[.+?\]\[.+?\]\[.+?\])/i,
]

class BacadraLogModel extends AbstractModel {

  constructor(editorOrBuffer) {
    const HEADING_REGEX = /\[.+?\]\[.+?\]\[.+?\]/i
    super(editorOrBuffer, HEADING_REGEX);
  }

  getRegexData(scanResult) {
    let level = 0;
    let label = '';
    let heading = scanResult[0];

    for (var regex of reHead) {
      level += 1;
      if (level > this.maxDepth) {break}

      let subresult = regex.exec(heading)

      if (subresult) {
        label = subresult[1]
        break
      }
    }
    return {level: level, label: label.trim()}};
}

module.exports = {BacadraLogModel}
