'use babel'

const {ScannerAbstract} = require('./abstract');

export class ScannerLatex extends ScannerAbstract {

  constructor(editor) {
    secCommands = [
      atom.config.get('navigation-panel.latex.commands.4'),
      atom.config.get('navigation-panel.latex.commands.5'),
      atom.config.get('navigation-panel.latex.commands.6'),
      atom.config.get('navigation-panel.latex.commands.7'),
      atom.config.get('navigation-panel.latex.commands.8'),
      atom.config.get('navigation-panel.latex.commands.9'),
      atom.config.get('navigation-panel.latex.commands.10'),
    ]
    super(editor, new RegExp('([^%\\n]*)%(\\$+)([*!-]?)%(.*)|^[^\\%\\n]*\\\\('+secCommands.join('|')+')\\*?(?:\\[(.*)\\])?{(.*)}', 'g'))
    this.secCommands = secCommands
  }

  parse(object) {
    match = object.match
    naviClass = ''
    if (match[2]) {
      level = match[2].length;
      text = `${match[1].trim()} ${match[4].trim()}`.trim().replace('~', ' ')

      if (match[3]==='*') {
        naviClass = 'technical'
      } else if (match[3]==='!') {
        naviClass = 'important'
      } else if (match[3]==='-') {
        naviClass = 'separator'
      }

    } else if (match[5]) {
      level = match[5].toLowerCase()
      for (let i = 0; i<this.secCommands.length; i++ ){
        if (this.secCommands[i] && level.match(`^(${this.secCommands[i]})$`)) {
          level = 4+i;
          break
        }
      }
      text = match[6] ? match[6] : match[7]
      count = 0
      for (var i=0; i<text.length;i++) {
        let char = text.charAt(i)
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
      text = text.substring(0,i).trim().replace('~', ' ')
    }
    return {level:level, text:text, naviClass:naviClass}
  }
}
