const {AbstractModel} = require('./model-abstract');

const HEADING_REGEX = /^ *(#define [^\n=]+$|#enddef)|(^(?! *\$)[^!\n]*)!(\$+)!(.*)|^!.!chapter +([^=\n]*)|^ *.?prog +([^\n]*)(?:\n *head +(.+))?|^ *!.! +(.*)/i

class SofistikModel extends AbstractModel {

  constructor(editor) {
    super(editor, HEADING_REGEX)
    this.defineCount = 0
  }

  parseResults(scanResult) {
    let level ; let label

    if (atom.config.get('navigation-pane.sofistik.inBlock')===false) {
      if (scanResult[1]) {
        if (scanResult[1].charAt(1)==='d') {
          this.defineCount++;
        } else {
          this.defineCount--;
        }
        return
      }
    } else if (scanResult[1]) {
      return
    }

    if (this.defineCount>0) {
      return
    } else if (scanResult[3]) {
      level = scanResult[3].length;
      label = `${scanResult[2].trim()} ${scanResult[4].trim()}`.trim()
    } else if (scanResult[5]) {
      level = 4;
      label = scanResult[5].trim()
    } else if (scanResult[6]) {
      level = 5;
      label = scanResult[6].replace(/urs\:.+/, '').trim()
      label = scanResult[7] ? `${label}: ${scanResult[7]}` : label
    } else if (scanResult[8]) {
      level = 6;
      label = scanResult[8].trim()
    }
    return {level: level, label: label.trim()}
  }
}

module.exports = {SofistikModel}
