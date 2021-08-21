const {AbstractModel} = require('./model-abstract');

const HEADING_REGEX = /^ *\#{1,5} (.*)/

const RE_LHEAD = [
  /^ *\#{1} (.*)/,
  /^ *\#{2} (.*)/,
  /^ *\#{3} (.*)/,
  /^ *\#{4} (.*)/,
  /^ *\#{5} (.*)/,
];

class MarkdownModel extends AbstractModel {

  constructor(editorOrBuffer) {super(editorOrBuffer, HEADING_REGEX)}

  parseResults(scanResult) {
    let level = 0;
    let label = '';
    let heading = scanResult[0];

    for (let regex of RE_LHEAD) {
      level += 1;
      if (level <= this.maxDepth) {
        let subresult = regex.exec(heading);
        if (subresult) {
			    label = subresult[1];
          break;
        }
      }
    }
    return {level: level, label: label.trim()};
  }
}

module.exports = {MarkdownModel}
