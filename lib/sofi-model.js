const {AbstractModel} = require('./abstract-model');

const HEADING_REGEX = /[^!\n]*!\${1,5}!.*|^!.!chapter +=*[^=\n]*|^ *.?prog +[^ \n]*(?:.*\nhead +(.+))?|!.! +.*/i

const RE_LHEAD = [
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
    const HEADING_REGEX = HEADING_REGEX
    super(editorOrBuffer, HEADING_REGEX);
  }

  parseResults(scanResult) {
    let level = 0;
    let label = '';
    let heading = scanResult[0];

    for (var regex of RE_LHEAD) {
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
