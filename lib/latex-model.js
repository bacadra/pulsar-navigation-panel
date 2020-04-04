const {AbstractModel} = require('./abstract-model');

const reHead = [
  /^ *%\${1} +=*([^=\n]*)/,
  /^ *%\${2} +=*([^=\n]*)/,
  /^ *%\${3} +=*([^=\n]*)/,
  /^ *%\${4} +=*([^=\n]*)/,
  /^ *%\${5} +=*([^=\n]*)/,
  /^[^\%\n]*(?:\\part\*?)(?:\[.*\])?{([^}]*)/,
  /^[^\%\n]*(?:\\chapter\*?)(?:\[.*\])?{([^}]*)/,
  /^[^\%\n]*(?:\\section|frametitle\*?)(?:\[.*\])?{([^}]*)/,
  /^[^\%\n]*(?:\\subsection|framesubtitle\*?)(?:\[.*\])?{([^}]*)/,
  /^[^\%\n]*(?:\\subsubsection\*?)(?:\[.*\])?{([^}]*)/,
  /^[^\%\n]*(?:\\paragraph\*?)(?:\[.*\])?{([^}]*)/,
  /^[^\%\n]*(?:\\subparagraph\*?)(?:\[.*\])?{([^}]*)/,
]


class LatexModel extends AbstractModel {
  constructor(editorOrBuffer) {
    // let COMBO_REGEX = '';
    // for (let regex of reHead) {
    //   COMBO_REGEX = COMBO_REGEX + '(.*' + regex.source + ')|';
    // }
    // const HEADING_REGEX = new RegExp(COMBO_REGEX.slice(0, -1), 'igm');

    // faster way to global determine if entry is valid
    const HEADING_REGEX = /^ *%\${1,5} .*|^[^\%\n]*(?:\\(?:part|chapter|section|frametitle|subsection|framesubtitle|subsubsection|paragraph|subparagraph)\*?)(?:\[.*\])?{([^}]*)/
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
          label = subresult[1];
          break;
        }
      }
    }
    return {level: level, label: label.trim()};
  }
}

module.exports = {LatexModel}
