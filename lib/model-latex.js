const {AbstractModel} = require('./model-abstract');

class LatexModel extends AbstractModel {

  constructor(editor) {
    let cmds = [
      atom.config.get('navigation-pane.latex.commands.4'),
      atom.config.get('navigation-pane.latex.commands.5'),
      atom.config.get('navigation-pane.latex.commands.6'),
      atom.config.get('navigation-pane.latex.commands.7'),
      atom.config.get('navigation-pane.latex.commands.8'),
      atom.config.get('navigation-pane.latex.commands.9'),
      atom.config.get('navigation-pane.latex.commands.10'),
    ]
    let HEADING_REGEX = new RegExp('([^%\\n]*)%(\\$+)%(.*)|^[^\\%\\n]*\\\\('+cmds.filter(cmd=>cmd).join('|')+')\\*?(?:\\[(.*)\\])?{(.*)}', 'i')
    super(editor, HEADING_REGEX)
    this.cmds = cmds
  }

  parseResults(scanResult) {
    let count; let level; let label;

    if (scanResult[2]) {
      level = scanResult[2].length;
      label = `${scanResult[1].trim()} ${scanResult[3].trim()}`.trim().replace('~', ' ')
    } else if (scanResult[4]) {
      level = scanResult[4].toLowerCase()
      for (let i = 1; i<=this.cmds.length; i++ ){
        if (this.cmds[i] && level.match('^'+this.cmds[i])) {
          level = i;
          break
        }
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
      label = label.substring(0,i).trim().replace('~', ' ')
    }
    return {level: level, label: label}
  }
}

module.exports = {LatexModel}
