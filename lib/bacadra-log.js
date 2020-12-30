const {AbstractModel} = require('./abstract-model');

const HEADING_REGEX = /(\[.+?\]\[.+?\]\[.+?\])/i

class BacadraLogModel extends AbstractModel {

  constructor(editorOrBuffer) {super(editorOrBuffer, HEADING_REGEX)}

  parseResults(scanResult) {
    return {level:1, label:scanResult[1].trim()}
  }
}

module.exports = {BacadraLogModel}
