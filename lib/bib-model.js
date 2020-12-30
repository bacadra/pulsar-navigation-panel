const {AbstractModel} = require('./abstract-model');

const HEADING_REGEX = /[^%\n]*%\${1,5}% (.*)|^[ ]*\@(\w*)[ ]*{[ ]*([^\,]*)/

const RE_LHEAD = [
  /([^%\n]*)%\${1}% (.*)/i,
  /([^%\n]*)%\${2}% (.*)/i,
  /([^%\n]*)%\${3}% (.*)/i,
  /([^%\n]*)%\${4}% (.*)/i,
  /([^%\n]*)%\${5}% (.*)/i,
  /^[ ]*\@(\w*)[ ]*{[ ]*([^\,]*)/,
];




class BibModel extends AbstractModel {
  constructor(editorOrBuffer) {
    // let COMBO_REGEX = '';
    // for (let regex of RE_LHEAD) {
    //   COMBO_REGEX = COMBO_REGEX + '(.*' + regex.source + ')|';
    // }
    // const HEADING_REGEX = new RegExp(COMBO_REGEX.slice(0, -1), 'igm');

    // faster way to global determine if entry is valid
    let HEADING_REGEX = HEADING_REGEX
    super(editorOrBuffer, HEADING_REGEX);
  }

  parseResults(scanResult) {
    let level = 0;
    let label = '';
    let heading = scanResult[0];

    for (let regex of RE_LHEAD) {
      level += 1;
      if (level <= this.maxDepth) {
        let subresult = regex.exec(heading);
        if (subresult) {
		      if (level==6) {
			      label = '@' + subresult[1] +': '+subresult[2];
		      } else {
			      label = subresult[1] + " " + subresult[2];
		      }
          break;
        }
      }
    }
    return {level: level, label: label.trim()};
  }
}

module.exports = {BibModel}
