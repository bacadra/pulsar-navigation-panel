const {AbstractModel} = require('./model-abstract');

class LatexModel extends AbstractModel {

  constructor(editor) {
    let secCommands = [
      atom.config.get('navigation-panel.latex.commands.4'),
      atom.config.get('navigation-panel.latex.commands.5'),
      atom.config.get('navigation-panel.latex.commands.6'),
      atom.config.get('navigation-panel.latex.commands.7'),
      atom.config.get('navigation-panel.latex.commands.8'),
      atom.config.get('navigation-panel.latex.commands.9'),
      atom.config.get('navigation-panel.latex.commands.10'),
    ]
    let HEADING_REGEX = new RegExp('([^%\\n]*)%(\\$+)([*!-]?)%(.*)|^[^\\%\\n]*\\\\('+secCommands.join('|')+')\\*?(?:\\[(.*)\\])?{(.*)}', 'i')
    super(editor, HEADING_REGEX)
    this.secCommands = secCommands
  }

  parseResults(scanResult) {
    let count; let level; let label; let cssExtension

    if (scanResult[2]) {
      level = scanResult[2].length;
      label = `${scanResult[1].trim()} ${scanResult[4].trim()}`.trim().replace('~', ' ')

      if (scanResult[3]==='*') {
        cssExtension = 'technical'
      } else if (scanResult[3]==='!') {
        cssExtension = 'important'
      } else if (scanResult[3]==='-') {
        cssExtension = 'separator'
      }

    } else if (scanResult[5]) {
      level = scanResult[5].toLowerCase()
      for (let i = 0; i<this.secCommands.length; i++ ){
        if (this.secCommands[i] && level.match(`^(${this.secCommands[i]})$`)) {
          level = 4+i;
          break
        }
      }
      label = scanResult[6] ? scanResult[6] : scanResult[7]
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
      label = label.substring(0,i).trim().replace('~', ' ')
    }
    return {level: level, label: label, cssExtension:cssExtension}
  }
}

module.exports = {LatexModel}
