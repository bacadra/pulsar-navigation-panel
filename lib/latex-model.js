const {AbstractModel} = require('./abstract-model');

const reHead = [
  /^ *\%\$ [_ ]*([^\%\n]*)(?<!_)/,
  /^ *\%\$\$ [_ ]*([^\%\n]*)(?<!_)/,
  /^ *\%\$\$\$ [_ ]*([^\%\n]*)(?<!_)/,
  /^ *\%\$\$\$\$ [_ ]*([^\%\n]*)(?<!_)/,
  /^ *\%\$\$\$\$\$ [_ ]*([^\%\n]*)(?<!_)/,
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
    const HEADING_REGEX = /^ *\%\$+ [_ ]*([^\%\n]*)(?<!_)|^[^\%\n]*(?:\\(?:part|chapter|section|frametitle|subsection|framesubtitle|subsubsection|paragraph|subparagraph)\*?)(?:\[.*\])?{([^}]*)/
    super(editorOrBuffer, HEADING_REGEX);
  }

  getRegexData(scanResult) {
    let level = 0;
    let label = '';
    let heading = scanResult[0];
    heading = heading.trim();
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

    return {
      level: level,
      label: label
    };
  }
}

module.exports = {LatexModel}
