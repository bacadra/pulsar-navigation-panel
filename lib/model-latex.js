const {AbstractModel} = require('./model-abstract');

const HEADING_REGEX = /([^%\n]*)%(\$+)%(.*)|^[^\%\n]*\\((?:part|chapter|section|subsection|subsubsection|paragraph|subparagraph))\*?(?:\[(.*)\])?{(.*)}/

class LatexModel extends AbstractModel {

  constructor(editor) {super(editor, HEADING_REGEX)}

  parseResults(scanResult) {
    let count; let level; let label;

    if (scanResult[2]) {
      level = scanResult[2].length;
      label = `${scanResult[1].trim()} ${scanResult[3].trim()}`.trim()
    } else if (scanResult[4]) {
      switch (scanResult[4].toLowerCase()) {
        case 'part'          : level = 4 ; break;
        case 'chapter'       : level = 5 ; break;
        case 'section'       : level = 6 ; break;
        case 'subsection'    : level = 7 ; break;
        case 'subsubsection' : level = 8 ; break;
        case 'paragraph'     : level = 9 ; break;
        case 'subparagraph'  : level = 10 ; break;
      }
      label = scanResult[5] ? scanResult[5] : scanResult[6]
      count = 0
      for (var i=0; i<label.length;i++) {
        let char = label.charAt(i)
        if (char==='{') {
            count++;
        } else if (char==='}') {
          if (count===0) {
            break
          } else {
            count --;
          }
        }
      }
      label = label.substring(0,i)
    }
    return level ? {level: level, label: label} : false;
  }
}

module.exports = {LatexModel}
