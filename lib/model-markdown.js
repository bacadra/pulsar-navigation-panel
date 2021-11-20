const {AbstractModel} = require('./model-abstract');

const HEADING_REGEX = /^ *(\#+) (.*)/

class MarkdownModel extends AbstractModel {

  constructor(editorOrBuffer) {super(editorOrBuffer, HEADING_REGEX)}

  parseResults(scanResult) {
    return {level: scanResult[1].length, label: scanResult[2].trim()};
  }
}

module.exports = {MarkdownModel}
