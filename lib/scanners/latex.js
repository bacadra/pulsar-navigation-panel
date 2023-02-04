'use babel'

const {ScannerAbstract} = require('./abstract');

export class ScannerLatex extends ScannerAbstract {

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
    super(editor, new RegExp('([^%\\n]*)%(\\$+)([\\*\\+\\-\\!\\_]?)%(.*)|^[^\\%\\n]*\\\\('+secCommands.join('|')+')\\*?(?:\\[(.*)\\])?{(.*)}', 'g'))
    this.secCommands = secCommands
  }

  parse(object) {
    let match = object.match
    let level, text
    let classList = []
    if (match[2]) {
      level = match[2].length;
      text = `${match[1].trim()} ${match[4].trim()}`.trim().replace(/~+/g, ' ')
      if (match[3]==='*') {
        classList = ['info']
      } else if (match[3]==='+') {
        classList = ['success']
      } else if (match[3]==='-') {
        classList = ['warning']
      } else if (match[3]==='!') {
        classList = ['error']
      } else if (match[3]==='_') {
        classList = ['separator']
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
      let count = 0
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
      text = text.substring(0,i).trim()
        .replace(/~+/g         , ' ')
        .replace(/--/g         , '–')
        .replace(/(?<!\\)\$/g  , '' )
        .replace(/\\\$/g       , '$')
        .replace(/\\%/g        , '%')
        .replace(/\\theta/     , 'θ')
        .replace(/\\Theta/     , 'Θ')
        .replace(/\\omega/     , 'ω')
        .replace(/\\Omega/     , 'Ω')
        .replace(/\\varepsilon/, 'ε')
        .replace(/\\Epsilon/   , 'Ε')
        .replace(/\\epsilon/   , 'ϵ')
        .replace(/\\rho/       , 'ρ')
        .replace(/\\Rho/       , 'Ρ')
        .replace(/\\tau/       , 'τ')
        .replace(/\\Tau/       , 'Τ')
        .replace(/\\psi/       , 'ψ')
        .replace(/\\Psi/       , 'Ψ')
        .replace(/\\upsilon/   , 'υ')
        .replace(/\\Upsilon/   , 'Υ')
        .replace(/\\iota/      , 'ι')
        .replace(/\\Iota/      , 'Ι')
        .replace(/\\omnikron/  , 'ο')
        .replace(/\\Omikron/   , 'Ο')
        .replace(/\\pi/        , 'π')
        .replace(/\\Pi/        , 'Π')
        .replace(/\\alpha/     , 'α')
        .replace(/\\Alpha/     , 'Α')
        .replace(/\\sigma/     , 'σ')
        .replace(/\\Sigma/     , 'Σ')
        .replace(/\\delta/     , 'δ')
        .replace(/\\Delta/     , 'Δ')
        .replace(/\\varphi/    , 'φ')
        .replace(/\\theta/     , 'ϑ')
        .replace(/\\gamma/     , 'γ')
        .replace(/\\Gamma/     , 'Γ')
        .replace(/\\eta/       , 'η')
        .replace(/\\Eta/       , 'Η')
        .replace(/\\phi/       , 'ϕ')
        .replace(/\\Phi/       , 'Φ')
        .replace(/\\kappa/     , 'κ')
        .replace(/\\Kappa/     , 'Κ')
        .replace(/\\lambda/    , 'λ')
        .replace(/\\Lambda/    , 'Λ')
        .replace(/\\zeta/      , 'ζ')
        .replace(/\\Zeta/      , 'Ζ')
        .replace(/\\xi/        , 'ξ')
        .replace(/\\Xi/        , 'Ξ')
        .replace(/\\chi/       , 'χ')
        .replace(/\\Chi/       , 'Χ')
        .replace(/\\beta/      , 'β')
        .replace(/\\Beta/      , 'Β')
        .replace(/\\nu/        , 'ν')
        .replace(/\\Nu/        , 'Ν')
        .replace(/\\mu/        , 'μ')
        .replace(/\\Mu/        , 'Μ')
    }
    return {level:level, text:text, classList:classList}
  }
}
