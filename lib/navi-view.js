'use babel'
/** @jsx etch.dom */

import { CompositeDisposable, TextEditor } from 'atom'
const etch = require('etch')
import fuzzaldrin     from 'fuzzaldrin'
import fuzzaldrinPlus from 'fuzzaldrin-plus'

etch.setScheduler(atom.views)

const STATES = {
  searchBar   : null,
  categoryBar : null,
  scoringMode : null,
  collapseMode: null,
  collapseReal: null,
  autoCollapse: null,
  info        : null,
  success     : null,
  warning     : null,
  error       : null,
  standard    : null,
  textWrap    : null,
  centerScroll: null,
}

export class NavigationView {

  constructor() {
    this.headers = this.original = null

    STATES.collapseMode = atom.config.get('navigation-panel.general.collapseMode')
    STATES.autoCollapse = atom.config.get('navigation-panel.general.autoCollapse')
    STATES.textWrap     = atom.config.get('navigation-panel.general.textWrap'    )
    STATES.info         = atom.config.get('navigation-panel.categories.info'     )
    STATES.success      = atom.config.get('navigation-panel.categories.success'  )
    STATES.warning      = atom.config.get('navigation-panel.categories.warning'  )
    STATES.error        = atom.config.get('navigation-panel.categories.error'    )
    STATES.standard     = atom.config.get('navigation-panel.categories.standard' )

    this.disposables = new CompositeDisposable()
    this.disposables.add(
      atom.config.observe('navigation-panel.general.searchBar', {}, (value) => {
        STATES.searchBar = value ; etch.update(this)
      }),
      atom.config.observe('navigation-panel.general.categoryBar', {}, (value) => {
        STATES.categoryBar = value ; etch.update(this)
      }),
      atom.config.observe('navigation-panel.general.centerScroll', {}, (value) => {
        STATES.centerScroll = value ; etch.update(this)
      }),
      atom.config.observe('command-palette.useAlternateScoring', (value) => {
        STATES.scoringMode = value
      }),
      atom.commands.add('.navigation-search', {
        'navigation-panel:filter-query': () => this.filterQuery(),
        'navigation-panel:clear-query' : () => this.clearQuery(),
      }),
      atom.commands.add('atom-workspace', {
        'navigation-panel:all-categories': () => {
          this.categoriesChange(['info', 'success', 'warning', 'error', 'standard'], true)
        },
        'navigation-panel:none-categories': () => {
          this.categoriesChange(['info', 'success', 'warning', 'error', 'standard'], false)
        },
        'navigation-panel:categories-toggle': () => {
          this.categoriesChange(['info', 'success', 'warning', 'error', 'standard'])
        },
        'navigation-panel:info-toggle'    : () => this.categoriesChange(['info'    ]),
        'navigation-panel:success-toggle' : () => this.categoriesChange(['success' ]),
        'navigation-panel:warning-toggle' : () => this.categoriesChange(['warning' ]),
        'navigation-panel:error-toggle'   : () => this.categoriesChange(['error'   ]),
        'navigation-panel:standard-toggle': () => this.categoriesChange(['standard']),
        'navigation-panel:expand-mode': () => {
          STATES.collapseMode = STATES.collapseReal = true ; etch.update(this)
        },
        'navigation-panel:collapse-mode': () => {
          STATES.collapseMode = STATES.collapseReal = false ; etch.update(this)
        },
        'navigation-panel:auto-collapse-toggle': () => {
          STATES.autoCollapse = !STATES.autoCollapse ;
          if (!STATES.autoCollapse) { STATES.collapseReal = STATES.collapseMode }
          etch.update(this)
        },
        'navigation-panel:text-wrap-toggle': () => {
          STATES.textWrap = !STATES.textWrap ; etch.update(this)
        },
      })
    )
    etch.initialize(this)
  }

  destroy() {
    this.disposables.dispose()
    etch.destroy(this)
  }

  render() {
    if (STATES.searchBar) {
      searchBar = <div class='navigation-search' id='navigation-search'>{etch.dom(TextEditor, {ref:'searchEditor', mini:true, placeholderText:'Search...'})}<div class="icon-remove-close" on={{click:this.clearQuery}}/></div>
    } else {
      searchBar = <div class="navigation-search" id='navigation-search'/>
    }

    if (!this.headers) {
      naviList = <div class="navigation-list" id='navigation-list'>
        <ul class='background-message centered'><li>This grammar is not supported</li></ul></div>
    } else if (this.headers.length) {
      wspace = STATES.textWrap || !this.headers ? 'normal' : 'nowrap'
      naviList = <div class="navigation-list" id='navigation-list' style={`white-space:${wspace};`}>{this.headers.map( (item) => { return <TreeView {...item}/> })}</div>
    } else {
      naviList = <div class="navigation-list" id='navigation-list'>
        <ul class='background-message centered'><li>No results</li></ul></div>
    }
    if (STATES.categoryBar) {
      categoryBar = <div class="navigation-desk" id='navigation-desk'>
        <input type='checkbox' id='navigation-switch-info'
          class='navigation-switch input-toggle'
          checked={STATES.info} onChange={()=>this.categoriesChange(['info'])}
        />
        <input type='checkbox' id='navigation-switch-success'
          class='navigation-switch input-toggle'
          checked={STATES.success} onChange={()=>this.categoriesChange(['success'])}
        />
        <input type='checkbox' id='navigation-switch-warning'
          class='navigation-switch input-toggle'
          checked={STATES.warning} onChange={()=>this.categoriesChange(['warning'])}
        />
        <input type='checkbox' id='navigation-switch-error'
          class='navigation-switch input-toggle'
          checked={STATES.error} onChange={()=>this.categoriesChange(['error'])}
        />
        <input type='checkbox' id='navigation-switch-standard'
          class='navigation-switch input-toggle'
          checked={STATES.standard} onChange={()=>this.categoriesChange(['standard'])}
        />
      </div>
    } else {
      categoryBar = <div class="navigation-desk" id='navigation-desk'/>
    }
    return <atom-panel class="navigation-panel" id="navigation-panel">{searchBar}{naviList}{categoryBar}</atom-panel>
  }

  categoriesChange(classNames, value=null) {
    for (let className of classNames) {
      if (value===null) {
        STATES[className] = !STATES[className]
      } else {
        STATES[className] = value
      }
    }
    etch.update(this)
  }

  update(headers) {
    this.headers = this.original = headers
    etch.update(this)
  }

  readAfterUpdate() {
    STATES.collapseReal = null
    this.scrollToCurrent()
  }

  scrollToCurrent() {
    element = document.getElementsByClassName('navigation-block current')[0];
    if (element) { element.scrollIntoView({behavior:'smooth', block:'nearest', inline:'center'}) }
  }

  getTitle() {
    return 'Navigation'
  }

  getDefaultLocation() {
    return atom.config.get('navigation-panel.general.defaultSide')
  }

  getAllowedLocations() {
    return ['left', 'right', 'bottom']
  }

  getIconName() {
    return 'list-unordered';
  }

  filterQuery() {
    if (!this.original) { return }
    query = this.refs.searchEditor.getText()
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
    this.refs.searchEditor.setText('')
    this.update(this.original)
    atom.views.getView(this.refs.searchEditor).focus();
  }

  get fuzz () {
    return STATES.scoringMode ? fuzzaldrinPlus : fuzzaldrin
  }

  highlightMatchesInElement(item, query) {
    el = [<span class='badge badge-flexible'>{item.startPoint.row+1}</span>]
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
    this.showChildren = STATES.collapseMode
    etch.initialize(this)
  }

  update(item) {
    this.item = item
    if (STATES.autoCollapse) {
      if (this.item.stackCount >0) {
        this.showChildren = true
      } else {
        this.showChildren = false
      }
    } else if (!(STATES.collapseReal===null)) {
      this.showChildren = STATES.collapseMode
    }
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
      if (this.showChildren) {
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

    stackClass   = this.item.stackCount   >0 ? ' stack'   : ''
    currentClass = this.item.currentCount >0 ? ' current' : ''
    naviClass    = this.item.classList ? ' '+this.item.classList.join(' ') : ''

    text = this.item.display ? this.item.display : this.item.text

    return <div class={"navigation-tree"+stackClass}>
      <div class={"navigation-block"+naviClass+currentClass}>
        <div class={"navigation-icon icon"+iconClass} on={{click:this.toggleNested}}/>
        <div class="navigation-text" on={{click:this.scrollToLine}}>{text}</div>
      </div>
      {naviList}
    </div>
  }

  scrollToLine(e) {
    if (e.ctrlKey && e.altKey) {
      this.item.editor.addCursorAtBufferPosition([this.item.startPoint.row, 0])
    } else if (e.ctrlKey) {
      atom.clipboard.write(this.item.text)
    } else {
      if (STATES.centerScroll) {
        this.item.editor.setCursorBufferPosition([this.item.startPoint.row, 0], {autoscroll: false});
        this.item.editor.scrollToCursorPosition({center: true});
      } else {
        this.item.editor.setCursorBufferPosition([this.item.startPoint.row, 0], {autoscroll: true});
      }
    }
    atom.views.getView(this.item.editor).focus();
  }

  toggleNested() {
    this.showChildren = !this.showChildren
    etch.update(this)
  }
}
