'use babel'
/** @jsx etch.dom */

import { CompositeDisposable } from 'atom'

const etch = require('etch')

etch.setScheduler(atom.views)

const STATES = { active:null, info: null, success: null, warning: null, error: null, standard: null}

export class NavigationView {

  constructor() {
    this.headers = []
    this.disposables = new CompositeDisposable()
    this.disposables.add(
      atom.config.observe('navigation-panel.categories.active', {}, (value) => {
        STATES.active = value ; etch.update(this) }),
      atom.config.observe('navigation-panel.categories.info', {}, (value) => {
        STATES.info = value ; this.observeSettings('info', value) }),
      atom.config.observe('navigation-panel.categories.success', {}, (value) => {
        STATES.success = value ; this.observeSettings('success', value) }),
      atom.config.observe('navigation-panel.categories.warning', {}, (value) => {
        STATES.warning = value ; this.observeSettings('warning', value) }),
      atom.config.observe('navigation-panel.categories.error', {}, (value) => {
        STATES.error = value ; this.observeSettings('error', value) }),
      atom.config.observe('navigation-panel.categories.standard', {}, (value) => {
        STATES.standard = value ; this.observeSettings('standard', value) }),
    )
    etch.initialize(this)
  }

  destroy() {
    this.disposables.dispose()
    etch.destroy(this)
  }

  render() {
    if (this.headers.length) {
      nested = <div class="navigation-list">{this.headers.map( (item) => { return <TreeView {...item}/> })}</div>
    } else {
      nested = ''
    }
    if (STATES.active) {
      control = <div class="navigation-desk">
        <input type='checkbox' id='navigation-switch-info'
          class='navigation-switch input-toggle'
          defaultChecked={STATES.info}
          onChange={()=>this.categoryStateToggle('info')}
        />
        <input type='checkbox' id='navigation-switch-success'
          class='navigation-switch input-toggle'
          defaultChecked={STATES.success}
          onChange={()=>this.categoryStateToggle('success')}
        />
        <input type='checkbox' id='navigation-switch-warning'
          class='navigation-switch input-toggle'
          defaultChecked={STATES.warning}
          onChange={()=>this.categoryStateToggle('warning')}
        />
        <input type='checkbox' id='navigation-switch-error'
          class='navigation-switch input-toggle'
          defaultChecked={STATES.error}
          onChange={()=>this.categoryStateToggle('error')}
        />
        <input type='checkbox' id='navigation-switch-standard'
          class='navigation-switch input-toggle'
          defaultChecked={STATES.standard}
          onChange={()=>this.categoryStateToggle('standard')}
        />
      </div>
    } else {
      control = <div />
    }
    return <atom-panel class="navigation-panel">{nested}{control}</atom-panel>
  }

  observeSettings(className, state) {
    element = document.getElementById(`navigation-switch-${className}`)
    if (element) { element.checked = state ; etch.update(this) }
  }

  categoryStateToggle(className) {
    atom.config.set(`navigation-panel.categories.${className}`, !atom.config.get(`navigation-panel.categories.${className}`))
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
    if (this.item.classList.includes('info')) {
      if (!STATES.info) { return <div /> }
    } else if (this.item.classList.includes('success')) {
      if (!STATES.success) { return <div /> }
    } else if (this.item.classList.includes('warning')) {
      if (!STATES.warning) { return <div /> }
    } else if (this.item.classList.includes('error')) {
      if (!STATES.error) { return <div /> }
    } else if (!STATES.standard) { return <div /> }

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

    stackClass   = this.item.stackQ    ? ' stack'   : ''
    currentClass = this.item.currentQ  ? ' current' : ''
    naviClass    = this.item.classList ? ' '+this.item.classList.join(' ') : ''

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
