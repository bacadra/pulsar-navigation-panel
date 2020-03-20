const {AbstractModel} = require('./abstract-model');

const reHead = [
  /^ *\#\$ [_ ]*([^#\n]*)(?<!_)|^ *(?![# ]+)(.*)#\$#.*|^ *(?![# ]+)(.*)#\$[sS]#.*|^ *(?![# ]+)(.*)#\$[pP]#.*/i,
  /^ *\#\$\$ [_ ]*([^#\n]*)(?<!_)|^ *(?![# ]+)(.*)#\$\$#.*|^ *(?![# ]+)(.*)#\$\$[sS]#.*|^ *(?![# ]+)(.*)#\$\$[pP]#.*/i,
  /^ *\#\$\$\$ [_ ]*([^#\n]*)(?<!_)|^ *(?![# ]+)(.*)#\$\$\$#.*|^ *(?![# ]+)(.*)#\$\$\$[sS]#.*|^ *(?![# ]+)(.*)#\$\$\$[pP]#.*/i,
  /^ *\#\$\$\$\$ [_ ]*([^#\n]*)(?<!_)|^ *(?![# ]+)(.*)#\$\$\$\$#.*|^ *(?![# ]+)(.*)#\$\$\$\$[sS]#.*|^ *(?![# ]+)(.*)#\$\$\$\$[pP]#.*/i,
  /^ *\#\$\$\$\$\$ [_ ]*([^#\n]*)(?<!_)|^ *(?![# ]+)(.*)#\$\$\$\$\$#.*|^ *(?![# ]+)(.*)#\$\$\$\$\$[sS]#.*|^ *(?![# ]+)(.*)#\$\$\$\$\$[pP]#.*/i,
  /^ *\#\$\$\$\$\$\$ [_ ]*([^#\n]*)(?<!_)|^ *(?![# ]+)(.*)#\$\$\$\$\$\$#.*|^ *(?![# ]+)(.*)#\$\$\$\$\$\$[sS]#.*|^ *(?![# ]+)(.*)#\$\$\$\$\$\$[pP]#.*/i,
  /^ *\#\$\$\$\$\$\$\$ [_ ]*([^#\n]*)(?<!_)|^ *(?![# ]+)(.*)#\$\$\$\$\$\$\$#.*|^ *(?![# ]+)(.*)#\$\$\$\$\$\$\$[sS]#.*|^ *(?![# ]+)(.*)#\$\$\$\$\$\$\$[pP]#.*/i,
  /^ *\#\$\$\$\$\$\$\$\$ [_ ]*([^#\n]*)(?<!_)|^ *(?![# ]+)(.*)#\$\$\$\$\$\$\$\$#.*|^ *(?![# ]+)(.*)#\$\$\$\$\$\$\$\$[sS]#.*|^ *(?![# ]+)(.*)#\$\$\$\$\$\$\$\$[pP]#.*/i,
  /^ *\#\$\$\$\$\$\$\$\$\$ [_ ]*([^#\n]*)(?<!_)|^ *(?![# ]+)(.*)#\$\$\$\$\$\$\$\$\$#.*|^ *(?![# ]+)(.*)#\$\$\$\$\$\$\$\$\$[sS]#.*|^ *(?![# ]+)(.*)#\$\$\$\$\$\$\$\$\$[pP]#.*/i,
]

class PythonModel extends AbstractModel {

  constructor(editorOrBuffer) {
    let COMBO_REGEX = '';
    for (let regex of reHead) {
      COMBO_REGEX = COMBO_REGEX + '(.*' + regex.source + ')|';
    }
    const HEADING_REGEX = new RegExp(COMBO_REGEX.slice(0, -1), 'igm');

    super(editorOrBuffer, HEADING_REGEX);
    this.maxDepth += 0;
  }

  getRegexData(scanResult) {
    let level = 0;
    let label = '';
    let heading = scanResult[0];
    heading = heading.trim();

    for (var regex of reHead) {
      level += 1;
      if (level <= this.maxDepth) {
        let subresult = regex.exec(heading)
        if (subresult) {
          // ***** now determine what to do with regex groups
          if (subresult[1]) {
            label = subresult[1]
            break
          } else if (subresult[2]) {
            label = subresult[2]
            break
          } else if (subresult[3]) {
            // special for texme
            let subre = /['\"](.*?)['\"]/.exec(heading)
            if (subre) {
              label = subre[1]
              break
            } else {
              label = subresult[3]
              break
            }
          } else if (subresult[4]) {
            // special for python
            let subre = /((?:def|class)[^\:\(\n]*)/.exec(heading)
            if (subre) {
              label = subre[1]
              break
            } else {
              label = subresult[4]
              break
            }
          }
          // ***** end of block
        }
      } else {break}
    }
    return {level: level, label: label};
  }
}

module.exports = {PythonModel}
