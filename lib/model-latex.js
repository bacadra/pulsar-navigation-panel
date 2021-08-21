const {AbstractModel} = require('./model-abstract');

const HEADING_REGEX = /[^%\n]*%\${1,5}% .*|^[^\%\n]*(?:\\(?:part|chapter|section|frametitle|subsection|framesubtitle|subsubsection|paragraph|subparagraph)\*?)(?:\[.*\])?{([^}]*)/

const RE_LHEAD = [
  /([^%\n]*)%\${1}% (.*)/i,
  /([^%\n]*)%\${2}% (.*)/i,
  /([^%\n]*)%\${3}% (.*)/i,
  /([^%\n]*)%\${4}% (.*)/i,
  /([^%\n]*)%\${5}% (.*)/i,
  /^[^\%\n]*(?:\\part\*?)(?:\[.*\])?{([^}]*)/,
  /^[^\%\n]*(?:\\chapter\*?)(?:\[.*\])?{([^}]*)/,
  /^[^\%\n]*(?:\\section|frametitle\*?)(?:\[.*\])?{([^}]*)/,
  /^[^\%\n]*(?:\\subsection|framesubtitle\*?)(?:\[.*\])?{([^}]*)/,
  /^[^\%\n]*(?:\\subsubsection\*?)(?:\[.*\])?{([^}]*)/,
  /^[^\%\n]*(?:\\paragraph\*?)(?:\[.*\])?{([^}]*)/,
  /^[^\%\n]*(?:\\subparagraph\*?)(?:\[.*\])?{([^}]*)/,
]

class LatexModel extends AbstractModel {

  constructor(editor) {super(editor, HEADING_REGEX)}

  parseResults(scanResult) {
    let level = 0;
    let label = '';
    let heading = scanResult[0];

    heading = heading.replace('~', ' ')

    for (let regex of RE_LHEAD) {
      level += 1;
      if (level <= this.maxDepth) {
        let subresult = regex.exec(heading);
        if (subresult) {

          if (level<=5) {
            label = subresult[1] + subresult[2]
          } else {
            label = subresult[1];
          }

          let labre = /^[ =]*(.*?)[ =]*$/.exec(label)
          label = labre[1]

          break;
        }
      }
    }
    return {level: level, label: label.trim()};
  }
}

module.exports = {LatexModel}
