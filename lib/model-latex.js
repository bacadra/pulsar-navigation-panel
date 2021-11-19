const {AbstractModel} = require('./model-abstract');

RE_SUP = /[^%\n]*%(\${1,5})% (.*)/
RE_LTX = /^[^\%\n]*\\((?:part|chapter|section|subsection|subsubsection|paragraph|subparagraph))\*?(?:\[(.*)\])?{(.*)}/

class LatexModel extends AbstractModel {

  constructor(editor) {super(editor, new RegExp(RE_SUP.source + "|" + RE_LTX.source))}

  parseResults(scanResult) {
    let match; let count; let level; let label;
    let heading = scanResult[0].replace('~', ' ');

    if (match = RE_SUP.exec(heading)) {
      if (match[1]) {
        level = match[1].length;
        label = match[2].trim()
      }
    } else if (match = RE_LTX.exec(heading)) {
      switch (match[1].toLowerCase()) {
        case 'part'          : level = 4 ; break;
        case 'chapter'       : level = 5 ; break;
        case 'section'       : level = 6 ; break;
        case 'subsection'    : level = 7 ; break;
        case 'subsubsection' : level = 8 ; break;
        case 'paragraph'     : level = 9 ; break;
        case 'subparagraph'  : level = 10 ; break;
      }
      label = match[2] ? match[2] : match[3]
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
