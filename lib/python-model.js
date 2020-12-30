const {AbstractModel} = require('./abstract-model');

const reHead = [
  /^([^#\n]*)#a#(.*)/i,
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
    const HEADING_REGEX = /^[^#\n]*#(?:\${1,9}[spv]?|a)#.*/i
    super(editorOrBuffer, HEADING_REGEX);
  }

  getRegexData(scanResult) {
    let level = -1;
    let label = '';
    let heading = scanResult[0];

    for (var regex of reHead) {
      level += 1;

      if (level > this.maxDepth) {return}

      let subresult = regex.exec(heading)

      if (subresult) {

        if (level===0) {
          let subre = /\( *(\d+) *, *[rf]*['\"](.*?)['\"]/.exec(heading)
          if (!subre) {return}
          let level = parseInt(subre[1])
          if (!level || level > this.maxDepth || level<1 || level>9) {return}
          return {level: level, label: subre[2].trim()};
        }

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
