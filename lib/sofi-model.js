const {AbstractModel} = require('./abstract-model');

const reHeadSofi = [
  /^ *\!\$ [_ ]*([^!\n]*)(?<!_)/,
  /^ *\!\$\$ [_ ]*([^!\n]*)(?<!_)/,
  /^ *\!\$\$\$ [_ ]*([^!\n]*)(?<!_)/,
  /^ *\!\$\$\$\$ [_ ]*([^!\n]*)(?<!_)/,
  /^ *\!\$\$\$\$\$ [_ ]*([^!\n]*)(?<!_)/,
  /^ *\!\$\$\$\$\$\$ [_ ]*([^!\n]*)(?<!_)/,
  /^(!.![cC][hH][aA][pP][tT][eE][rR]) [_ ]*([^!\n]*)(?<!_)/i,
  /^ *(.?[pP][rR][oO][gG] [^ \n]*)/i,
  /(!.! .*)/,
]

class SofiModel extends AbstractModel {

  constructor(editorOrBuffer) {
    let COMBO_REGEX = '';
    for (let regex of reHeadSofi) {
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

    for (var regex of reHeadSofi) {
      level += 1;
      if (level <= this.maxDepth) {
        let subresult = regex.exec(heading)
        console.log('sub', subresult)
        if (subresult) {
          // ***** now determine what to do with regex groups
          if (subresult[1]) {
            if (level==7) {
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
    return {level: level, label: label};
  }
}

module.exports = {SofiModel}
