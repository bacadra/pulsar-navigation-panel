const {AbstractModel} = require('./abstract-model');

const reHead = [
  /^ *#\${1} +=*([^=\n]*)|^ *(?![# ]+)(.*)#\${1}#.*|^ *(?![# ]+)(.*)#\${1}s#.*|^ *(?![# ]+)(.*)#\${1}p#.*/i,
  /^ *#\${2} +=*([^=\n]*)|^ *(?![# ]+)(.*)#\${2}#.*|^ *(?![# ]+)(.*)#\${2}s#.*|^ *(?![# ]+)(.*)#\${2}p#.*/i,
  /^ *#\${3} +=*([^=\n]*)|^ *(?![# ]+)(.*)#\${3}#.*|^ *(?![# ]+)(.*)#\${3}s#.*|^ *(?![# ]+)(.*)#\${3}p#.*/i,
  /^ *#\${4} +=*([^=\n]*)|^ *(?![# ]+)(.*)#\${4}#.*|^ *(?![# ]+)(.*)#\${4}s#.*|^ *(?![# ]+)(.*)#\${4}p#.*/i,
  /^ *#\${5} +=*([^=\n]*)|^ *(?![# ]+)(.*)#\${5}#.*|^ *(?![# ]+)(.*)#\${5}s#.*|^ *(?![# ]+)(.*)#\${5}p#.*/i,
                        /|^ *(?![# ]+)(.*)#\${6}#.*|^ *(?![# ]+)(.*)#\${6}s#.*|^ *(?![# ]+)(.*)#\${6}p#.*/i,
                        /|^ *(?![# ]+)(.*)#\${7}#.*|^ *(?![# ]+)(.*)#\${7}s#.*|^ *(?![# ]+)(.*)#\${7}p#.*/i,
                        /|^ *(?![# ]+)(.*)#\${8}#.*|^ *(?![# ]+)(.*)#\${8}s#.*|^ *(?![# ]+)(.*)#\${8}p#.*/i,
                        /|^ *(?![# ]+)(.*)#\${9}#.*|^ *(?![# ]+)(.*)#\${9}s#.*|^ *(?![# ]+)(.*)#\${9}p#.*/i,
]

class PythonModel extends AbstractModel {

  constructor(editorOrBuffer) {
    // let COMBO_REGEX = '';
    // for (let regex of reHead) {
    //   COMBO_REGEX = COMBO_REGEX + '(.*' + regex.source + ')|';
    // }
    // const HEADING_REGEX = new RegExp(COMBO_REGEX.slice(0, -1), 'igm');

    // faster way to global determine if entry is valid
    const HEADING_REGEX = /^ *\#\${1,5} .*|^ *(?![# ]+).*#\${1,9}[sp]?#/i
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

          // ***** now determine what to do with regex groups ********* //
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
          // ***** end of block ************************************* //

        }
      } else {break}
    }
    return {level: level, label: label.trim()};
  }
}

module.exports = {PythonModel}
