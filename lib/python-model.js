const {AbstractModel} = require('./abstract-model');

const reHead = [
  /(^[^#\n]*)#\${1}([spv]?)#(.*)$/i,
  /(^[^#\n]*)#\${2}([spv]?)#(.*)$/i,
  /(^[^#\n]*)#\${3}([spv]?)#(.*)$/i,
  /(^[^#\n]*)#\${4}([spv]?)#(.*)$/i,
  /(^[^#\n]*)#\${5}([spv]?)#(.*)$/i,
  /(^[^#\n]*)#\${6}([spv]?)#(.*)$/i,
  /(^[^#\n]*)#\${7}([spv]?)#(.*)$/i,
  /(^[^#\n]*)#\${8}([spv]?)#(.*)$/i,
  /(^[^#\n]*)#\${9}([spv]?)#(.*)$/i,
]

class PythonModel extends AbstractModel {

  constructor(editorOrBuffer) {
    // let COMBO_REGEX = '';
    // for (let regex of reHead) {
    //   COMBO_REGEX = COMBO_REGEX + '(.*' + regex.source + ')|';
    // }
    // const HEADING_REGEX = new RegExp(COMBO_REGEX.slice(0, -1), 'igm');

    // faster way to global determine if entry is valid
    const HEADING_REGEX = /(^[^#\n]*)#\${1,9}([spv]?)#(.*)$/i
    super(editorOrBuffer, HEADING_REGEX);
  }

  getRegexData(scanResult) {
    let level = 0;
    let label = '';
    let heading = scanResult[0];
    heading = heading;

    for (var regex of reHead) {
      level += 1;
      if (level <= this.maxDepth) {
        let subresult = regex.exec(heading)
        if (subresult) {
          label = subresult[1].trim() + ' ' + subresult[3].trim()

          if (subresult[2]) {
            if (subresult[2]=='s') {
              let subre = /['\"](.*?)['\"]/.exec(label)
              if (subre) {label = subre[1] + ' ' + subresult[3].trim()}
            } else if (subresult[2]=='p') {
              let subre = /((?:def|class)[^\:\(\n]*)/.exec(label)
              if (subre) {label = subre[1] + ' ' + subresult[3].trim()}
            } else if (subresult[2]=='v') {
              let subre = / *(.+) *=/.exec(label)
              if (subre) {label = subre[1] + ' ' + subresult[3].trim()}
            }
          }
          break
        }
      } else {break}
    }
    return {level: level, label: label.trim()};
  }
}

module.exports = {PythonModel}
