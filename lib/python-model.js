const {AbstractModel} = require('./abstract-model');

const reHead = [
  /^([^#\n]*)#\${1}([spv]?)#(.*)/i,
  /^([^#\n]*)#\${2}([spv]?)#(.*)/i,
  /^([^#\n]*)#\${3}([spv]?)#(.*)/i,
  /^([^#\n]*)#\${4}([spv]?)#(.*)/i,
  /^([^#\n]*)#\${5}([spv]?)#(.*)/i,
  /^([^#\n]*)#\${6}([spv]?)#(.*)/i,
  /^([^#\n]*)#\${7}([spv]?)#(.*)/i,
  /^([^#\n]*)#\${8}([spv]?)#(.*)/i,
  /^([^#\n]*)#\${9}([spv]?)#(.*)/i,
]

class PythonModel extends AbstractModel {

  constructor(editorOrBuffer) {
    const HEADING_REGEX = /^([^#\n]*)#\${1,9}([spv]?)#(.*)/i
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

        label = subresult[1].trim() + ' ' + subresult[3].trim()

        if (subresult[2].toLowerCase()==='s') {
          let subre = /['\"](.*?)['\"]/.exec(heading)
          if (subre) {label = subre[1]+' '+subresult[3].trim()}

        } else if (subresult[2].toLowerCase()==='p') {
          let subre = /((?:def|class)[^\:\(\n]*)/.exec(heading)
          if (subre) {label = subre[1]+' '+subresult[3].trim()}

        } else if (subresult[2].toLowerCase()==='v') {
          let subre = / *(.+) *=/.exec(heading)
          if (subre) {label = subre[1]+' '+subresult[3].trim()}
        }

        let labre = /^[ =]*(.*?)[ =]*$/.exec(label)
        label = labre[1]

        break
      }
    }
    return {level: level, label: label.trim()}};
}

module.exports = {PythonModel}
