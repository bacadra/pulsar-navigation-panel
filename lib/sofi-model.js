const {AbstractModel} = require('./abstract-model');

const reHeadSofi = [
  /([^!\n]*)!\${1}!(.*)/i,
  /([^!\n]*)!\${2}!(.*)/i,
  /([^!\n]*)!\${3}!(.*)/i,
  /([^!\n]*)!\${4}!(.*)/i,
  /([^!\n]*)!\${5}!(.*)/i,
  /^(!.!chapter) +=*([^=\n]*)/i,
  /^ *(.?prog +[^ \n]*)(?:.*\nhead +(.+))?/i,
  /(!.! +.*)/,
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

    const HEADING_REGEX = /[^!\n]*!\${1,5}!.*|^!.!chapter +=*[^=\n]*|^ *.?prog +[^ \n]*(?:.*\nhead +(.+))?|!.! +.*/i
    super(editorOrBuffer, HEADING_REGEX);
  }

  getRegexData(scanResult) {
    let level = 0;
    let label = '';
    let heading = scanResult[0];

    for (var regex of reHeadSofi) {
      level += 1;
      if (level > this.maxDepth) {break}

      let subresult = regex.exec(heading)

      if (subresult) {

        if (level<=5) {
            label = subresult[1].trim() + ' ' + subresult[2].trim()
            let labre = /^[ =]*(.*?)[ =]*$/.exec(label)
            label = labre[1]

        } else if (level==6) {
          label = subresult[1] + ' ' + subresult[2]

        } else if (level==7) {
          if (subresult[2]) {
            label = subresult[1] + ': ' + subresult[2]
          } else {
            label = subresult[1]
          }

        } else {
          label = subresult[1]
      }

      break
    }
  }
  return {level: level, label: label.trim()}};
}

module.exports = {SofiModel}
