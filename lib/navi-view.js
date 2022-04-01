'use babel'
/** @jsx etch.dom */

const etch = require('etch')

etch.setScheduler(atom.views)

export class NavigationView {

  constructor() {
    this.headers = []
    etch.initialize(this)
  }

  destroy() {
    etch.destroy(this)
  }

  render() {
    if (this.headers.length) {
      nested = this.headers.map( (item) => { return <TreeView {...item}/> })
    } else {
      nested = ''
    }
    return <atom-panel class="navigation-panel">{nested}</atom-panel>
  }

  update(headers) {
    this.headers = headers
    etch.update(this)
  }

  readAfterUpdate() {
    this.scrollToCurrent()
  }

  scrollToCurrent() {
    element = document.getElementsByClassName('navigation-block current')[0];
    if (element) { element.scrollIntoView({behavior:'smooth', block:'nearest', inline:'start'}) }
  }

  getTitle() {
    return 'Navigation'
  }

  getDefaultLocation() {
    return atom.config.get('navigation-panel.general.defaultSide')
  }

  getAllowedLocations() {
    return ['left', 'right']
  }

  getIconName() {
    return 'list-unordered';
  }


}


class TreeView {

  constructor(item) {
    this.item = item
    this.nestedQ = true
    etch.initialize(this)
  }

  update(item) {
    this.item = item
    return etch.update(this)
  }

  destroy() {
    etch.destroy(this)
  }

  render() {
    if (this.item.children.length) {
      if (this.nestedQ) {
        iconClass = ' icon-chevron-down'
        nested = this.item.children.map( (item) => { return <TreeView {...item} /> })
      } else {
        iconClass = ' icon-chevron-right'
        nested = ''
      }
    } else {
      iconClass = ' icon-one-dot'
      nested = ''
    }

    stackClass   = this.item.stackQ    ? ' stack'                : ''
    currentClass = this.item.currentQ  ? ' current'              : ''
    naviClass    = this.item.naviClass ? ' '+this.item.naviClass : ''

    return <div class={"navigation-tree"+stackClass}>
      <div class={"navigation-block"+naviClass+currentClass}>
        <div class={"navigation-icon icon"+iconClass} on={{click:this.toggleNested}}/>
        <div class="navigation-text" on={{click:this.scrollToLine, dblclick:this.copyTextToClipboard}}>{this.item.text}</div>
      </div>
      {nested}
    </div>
  }

  scrollToLine() {
    this.item.editor.setCursorBufferPosition([this.item.startPoint.row, 0], {autoscroll: false});
    this.item.editor.scrollToCursorPosition({center: true});
    atom.views.getView(this.item.editor).focus();
  }

  toggleNested() {
    this.nestedQ = !this.nestedQ
    etch.update(this)
  }

  copyTextToClipboard() {
    atom.clipboard.write(this.item.text)
  }
}
