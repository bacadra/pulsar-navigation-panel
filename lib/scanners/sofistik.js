'use babel'

const {ScannerAbstract} = require('./abstract');

export class ScannerSofistik extends ScannerAbstract {

  constructor(editor) {
    super(editor, /^ *(#define [^\n=]+$|#enddef)|(^(?! *\$)[^!\n]*)!(\$+)!(.*)|^!.!chapter +([^=\n]*)|^ *.?prog +([^\n]*)(?:\n *head +(.+))?|^ *!.! +(.*)|^\$ graphics +(\d+) +\| +picture +(\d+) +\| +layer +(\d+) +: *(.*)/gi)
    this.defineCount = 0
    this.inBlock = atom.config.get('navigation-panel.sofistik.inBlock')
  }

  parse(object) {
    match = object.match
    if (!this.inBlock) {
      if (match[1]) {
        if (match[1].charAt(1)==='d') {
          this.defineCount++;
        } else {
          this.defineCount--;
        }
        return
      }
    } else if (match[1]) {
      return
    }

    if (this.defineCount>0) {
      return
    } else if (match[3]) {
      level = match[3].length;
      text = `${match[2].trim()} ${match[4].trim()}`.trim()
    } else if (match[5]) {
      level = 4;
      text = match[5].trim()
    } else if (match[6]) {
      level = 5;
      text = match[6].replace(/urs\:.+/, '').trim()
      text = match[7] ? `${text}: ${match[7]}`.trim() : text
    } else if (match[8]) {
      level = 6;
      text = match[8].trim()
    } else if (match[9]) {
      level = 7;
      text = `G-${match[9]}-${match[10]}-${match[11]}: ` + (match[12] ? match[12] : '' )
    }
    return {level:level, text:text}
  }
}
