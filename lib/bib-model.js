const {AbstractModel} = require('./abstract-model');

const reHead = [
  /^ *%\${1} +=*([^=\n]*)/,
  /^ *%\${2} +=*([^=\n]*)/,
  /^ *%\${3} +=*([^=\n]*)/,
  /^ *%\${4} +=*([^=\n]*)/,
  /^ *%\${5} +=*([^=\n]*)/,
  /^[ ]*\@(\w*)[ ]*{[ ]*([^\,]*)/,
];




class BibModel extends AbstractModel {
  constructor(editorOrBuffer) {
    // let COMBO_REGEX = '';
    // for (let regex of reHead) {
    //   COMBO_REGEX = COMBO_REGEX + '(.*' + regex.source + ')|';
    // }
    // const HEADING_REGEX = new RegExp(COMBO_REGEX.slice(0, -1), 'igm');

    // faster way to global determine if entry is valid
    let HEADING_REGEX = /^ *%\${1,5} .*|^[ ]*\@(\w*)[ ]*{[ ]*([^\,]*)/
    super(editorOrBuffer, HEADING_REGEX);
  }

  getRegexData(scanResult) {
    let level = 0;
    let label = '';
    let heading = scanResult[0];

    for (let regex of reHead) {
      level += 1;
      if (level <= this.maxDepth) {
        let subresult = regex.exec(heading);
        if (subresult) {
		      if (level==6) {
			      label = '@' + subresult[1] +': '+subresult[2];
		      } else {
			      label = subresult[1];
		      }
          break;
        }
      }
    }
    return {level: level, label: label.trim()};
  }
}

module.exports = {BibModel}
