'use babel'
/** @jsx etch.dom */
const etch = require('etch')

const {ScannerAbstract} = require('./abstract');

export class ScannerSofistik extends ScannerAbstract {

  constructor(editor) {
    super(editor, /^ *(#define [^\n=]+$|#enddef)|(^(?! *\$)[^!\n]*)!(\$+)!(.*)|^!.!chapter +(.*)|^ *(.)?prog +([^\n]*)(?:\n *head +(.+))?|^ *!.! +(.*)|^\$ graphics +(\d+) +\| +picture +(\d+) +\| +layer +(\d+) +: *(.*)/gmi)
    this.defineCount = 0
    this.inBlock = atom.config.get('navigation-panel.sofistik.inBlock')
  }

  parse(object) {
    let display;
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
      if (match = text.match(/=+ (.+?) =+/)) { text = match[1] }
    } else if (match[7]) {
      level = 5;
      text = match[7].replace(/urs\:.+/, '').trim()
      if (match[8]) { text = `${text}: ${match[8]}`.trim()}
      sign = match[6] ? match[6] : '*'
      if (match[6]==='+') {
        iconClass = 'prog-toggle status-added icon icon-diff-added'
      } else if (match[6]==='-') {
        iconClass = 'prog-toggle status-removed icon icon-diff-removed'
      } else {
        iconClass = 'prog-toggle status-modified icon icon-diff-modified'
      }
      display = [<span class={iconClass} on={{click:(e)=>this.toggleProg(e, object)}}/>, <span>{text}</span>]
    } else if (match[9]) {
      level = 6;
      text = match[9].trim()
    } else if (match[10]) {
      level = 7;
      text = `G-${match[10]}-${match[11]}-${match[12]}: ` + (match[13] ? match[13] : '' )
    } else {
      return
    }
    return {level:level, text:text, classList:[], display:display}
  }

  toggleProg(e, object) {
    if (object.match[6]==='+') {
      object.replace(object.matchText.replace(/\+(prog)/i, '-$1'))
      e.srcElement.className = 'prog-toggle status-removed icon icon-diff-removed'
    } else if (object.match[6]==='-') {
      object.replace(object.matchText.replace(/\-(prog)/i, '+$1'))
      e.srcElement.className = 'prog-toggle status-added icon icon-diff-added'
    }
  }

}
