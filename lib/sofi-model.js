const {AbstractModel} = require('./abstract-model');

const reHeadSofi = [
  /^ *\!\$ +=*([^=\n]*)/,
  /^ *\!\$\$ +=*([^=\n]*)/,
  /^ *\!\$\$\$ +=*([^=\n]*)/,
  /^ *\!\$\$\$\$ +=*([^=\n]*)/,
  /^ *\!\$\$\$\$\$ +=*([^=\n]*)/,
  /^(!.!chapter) +=*([^=\n]*)/i,
  /^ *(.?prog [^ \n]*)/i,
  /(!.! .*)/,
]

class SofiModel extends AbstractModel {

  constructor(editorOrBuffer) {
    // let COMBO_REGEX = '';
    // for (let regex of reHeadSofi) {
    //   COMBO_REGEX = COMBO_REGEX + '(.*' + regex.source + ')|';
    // }
    // const HEADING_REGEX = new RegExp(COMBO_REGEX.slice(0, -1), 'igm');

    // better but long
    // const HEADING_REGEX = /^ *\!\$+ [_ ]*([^!\n]*)(?<!_)|^(!.!chapter) [_ ]*([^!\n]*)(?<!_)|^ *(.?prog [^ \n]*)|(!.! .*)/i

    const HEADING_REGEX = /(?:^ *\!\$+|^!.!chapter|^ *.?prog|!.!) .*/i
    super(editorOrBuffer, HEADING_REGEX);
  }

  getRegexData(scanResult) {
    let level = 0;
    let label = '';
    let heading = scanResult[0];

    for (var regex of reHeadSofi) {
      level += 1;
      if (level <= this.maxDepth) {
        let subresult = regex.exec(heading)

        if (subresult) {
          // ***** now determine what to do with regex groups
          if (subresult[1]) {
            if (level==6) {
            label = subresult[1] + ' ' + subresult[2]
            break
            } else {
            label = subresult[1]
            break
          }
          }
          // ***** end of block
        }
      } else {break}
    }
    return {level: level, label: label.trim()};
  }
}

module.exports = {SofiModel}
