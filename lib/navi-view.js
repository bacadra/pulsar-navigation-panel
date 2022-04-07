'use babel'
/** @jsx etch.dom */

import { CompositeDisposable, TextEditor } from 'atom'
const etch = require('etch')
import fuzzaldrin from 'fuzzaldrin'
import fuzzaldrinPlus from 'fuzzaldrin-plus'

etch.setScheduler(atom.views)

const STATES = { searchBar: null, categoryBar:null, info: null, success: null, warning: null, error: null, standard: null}

export class NavigationView {

  constructor() {
    this.headers = this.original = []
    this.disposables = new CompositeDisposable()
    this.disposables.add(
      atom.config.observe('navigation-panel.general.searchBar', {}, (value) => {
        STATES.searchBar = value ; etch.update(this) }),
      atom.config.observe('navigation-panel.general.categoryBar', {}, (value) => {
        STATES.categoryBar = value ; etch.update(this) }),
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
      atom.commands.add('.navigation-search', {
        'navigation-panel:filter': () => this.filterQuery(),
        'navigation-panel:clear' : () => this.clearQuery(),
      }),
      atom.config.observe('command-palette.useAlternateScoring', (value) => {
        this.useAlternateScoring = value
      }),
    )
    etch.initialize(this)
  }

  destroy() {
    this.disposables.dispose()
    etch.destroy(this)
  }

  render() {
    if (STATES.searchBar) {
      searchBar = <div class='navigation-search'>{etch.dom(TextEditor, {ref:'navigationEditor', mini:true})}</div>
    } else {
      searchBar = ''
    }
    if (this.headers.length) {
      naviList = <div class="navigation-list">{this.headers.map( (item) => { return <TreeView {...item}/> })}</div>
    } else {
      naviList = <div class="navigation-list"/>
    }
    if (STATES.categoryBar) {
      categoryBar = <div class="navigation-desk">
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
      categoryBar = ''
    }
    return <atom-panel class="navigation-panel">{searchBar}{naviList}{categoryBar}</atom-panel>
  }

  observeSettings(className, state) {
    element = document.getElementById(`navigation-switch-${className}`)
    if (element) { element.checked = state ; etch.update(this) }
  }

  categoryStateToggle(className) {
    atom.config.set(`navigation-panel.categories.${className}`, !atom.config.get(`navigation-panel.categories.${className}`))
  }

  update(headers) {
    this.headers = this.original = headers
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

  filterQuery() {
    query = this.refs.navigationEditor.getText()
    if (query.length===0) { return this.update(this.original)}
    scoredItems = []
    this._filter(scoredItems, this.original)
    this.headers = scoredItems.sort((a,b) => b.score-a.score)
    etch.update(this)
  }

  _filter(items, headers) {
    for (var item of headers) {
      score = this.fuzz.score(item.text, query)
        if (score>0) {
          display = this.highlightMatchesInElement(item, query)
          items.push({...item, children:[], display:display})
        }
      this._filter(items, item.children)
    }
  }

  clearQuery() {
    this.refs.navigationEditor.setText('')
  }

  get fuzz () {
    return this.useAlternateScoring ? fuzzaldrinPlus : fuzzaldrin
  }

  highlightMatchesInElement(item, query) {
    el = [<span class='line-number badge badge-flexible'>{item.startPoint.row+1}</span>]
    text = item.text
    const matches = this.fuzz.match(text, query)
    let matchedChars = []
    let lastIndex = 0
    for (const matchIndex of matches) {
      const unmatched = text.substring(lastIndex, matchIndex)
      if (unmatched) {
        if (matchedChars.length > 0) {
          el.push(
            <span class='character-match'>{matchedChars.join('')}</span>
          )
          matchedChars = []
        }
        el.push(
          <span>{unmatched}</span>
        )
      }
      matchedChars.push(text[matchIndex])
      lastIndex = matchIndex + 1
    }
    if (matchedChars.length > 0) {
      el.push(
        <span class="character-match">{matchedChars.join('')}</span>
      )
    }
    const unmatched = text.substring(lastIndex)
    if (unmatched) {
      el.push(
        <span>{unmatched}</span>
      )
    }
    return el
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
        naviList = this.item.children.map( (item) => { return <TreeView {...item} /> })
      } else {
        iconClass = ' icon-chevron-right'
        naviList = ''
      }
    } else {
      iconClass = ' icon-one-dot'
      naviList = ''
    }

    stackClass   = this.item.stackQ    ? ' stack'   : ''
    currentClass = this.item.currentQ  ? ' current' : ''
    naviClass    = this.item.classList ? ' '+this.item.classList.join(' ') : ''

    text = this.item.display ? this.item.display : this.item.text

    return <div class={"navigation-tree"+stackClass}>
      <div class={"navigation-block"+naviClass+currentClass}>
        <div class={"navigation-icon icon"+iconClass} on={{click:this.toggleNested}}/>
        <div class="navigation-text" on={{click:this.scrollToLine, dblclick:this.copyTextToClipboard}}>{text}</div>
      </div>
      {naviList}
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

  get fuzz () {
    return this.useAlternateScoring ? fuzzaldrinPlus : fuzzaldrin
  }
}
