const {AbstractModel} = require('./model-abstract');

const HEADING_REGEX = /(\[.+?\]\[.+?\]\[.+?\])/i

class BacalogModel extends AbstractModel {

  constructor(editor) {super(editor, HEADING_REGEX)}

  parseResults(scanResult) {
    return {level:1, label:scanResult[1].trim()}
  }
}

module.exports = {BacalogModel}
