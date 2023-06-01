'use babel'
/** @jsx etch.dom */

import etch from 'etch'
import { CompositeDisposable, TextEditor } from 'atom'
import zadeh from 'zadeh'
import Diacritics from 'diacritic'

const STATES = { searchBar:null, categoryBar:null, visibility:null, collapseWork:null, info:null, success:null, warning:null, error:null, standard:null, textWrap:null, centerScroll:null }

export class NavigationTree {

  constructor() {
    this.headers = this.original = null

    STATES.searchBar   = atom.config.get('navigation-panel.general.searchBar'  )
    STATES.categoryBar = atom.config.get('navigation-panel.general.categoryBar')
    STATES.visibility  = atom.config.get('navigation-panel.general.visibility' )
    STATES.textWrap    = atom.config.get('navigation-panel.general.textWrap'   )
    STATES.info        = atom.config.get('navigation-panel.categories.info'    )
    STATES.success     = atom.config.get('navigation-panel.categories.success' )
    STATES.warning     = atom.config.get('navigation-panel.categories.warning' )
    STATES.error       = atom.config.get('navigation-panel.categories.error'   )
    STATES.standard    = atom.config.get('navigation-panel.categories.standard')

    this.disposables = new CompositeDisposable()
    this.disposables.add(
      atom.config.observe('navigation-panel.general.centerScroll', {}, (value) => {
        STATES.centerScroll = value ; etch.update(this)
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
        'navigation-panel:info-toggle' : () => {
            this.categoriesChange(['info'])
        },
        'navigation-panel:success-toggle': () => {
            this.categoriesChange(['success'])
        },
        'navigation-panel:warning-toggle': () => {
            this.categoriesChange(['warning'])
        },
        'navigation-panel:error-toggle': () => {
            this.categoriesChange(['error'])
        },
        'navigation-panel:standard-toggle': () => {
            this.categoriesChange(['standard'])
        },
        'navigation-panel:collapse-mode': () => {
          STATES.visibility = STATES.collapseWork = 0 ; etch.update(this)
        },
        'navigation-panel:expand-mode': () => {
          STATES.visibility = STATES.collapseWork = 1 ; etch.update(this)
        },
        'navigation-panel:auto-collapse': () => {
          STATES.visibility = 2 ; etch.update(this)
        },
        'navigation-panel:focus-current': () => {
          STATES.collapseWork = 2 ; etch.update(this)
        },
        'navigation-panel:text-wrap-toggle': () => {
          STATES.textWrap = !STATES.textWrap ; etch.update(this)
        },
        'navigation-panel:search-bar-toggle': () => {
          STATES.searchBar = !STATES.searchBar ; etch.update(this)
        },
        'navigation-panel:category-bar-toggle': () => {
          STATES.categoryBar = !STATES.categoryBar ; etch.update(this)
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
    let searchBar, naviList, categoryBar
    if (STATES.searchBar) {
      searchBar = <div class='navigation-search' id='navigation-search'>{etch.dom(TextEditor, {ref:'searchEditor', mini:true, placeholderText:'Search...'})}<div class="icon-remove-close" on={{click:this.clearQuery}}/></div>
    } else {
      searchBar = <div class="navigation-search" id='navigation-search'/>
    }

    if (!this.headers) {
      naviList = <div class="navigation-list" id='navigation-list'>
        <background-tips>
          <ul class='background-message centered'>
            <li>This grammar is not supported</li>
          </ul>
        </background-tips>
      </div>
    } else if (this.headers.length) {
      let wspace = STATES.textWrap || !this.headers ? 'normal' : 'nowrap'
      naviList = <div class="navigation-list" id='navigation-list' style={`white-space:${wspace};`}>{this.headers.map( (item) => { return <TreeView {...item}/> })}</div>
    } else {
      naviList = <div class="navigation-list" id='navigation-list'>
        <background-tips>
          <ul class='background-message centered'>
            <li>No results</li>
          </ul>
        </background-tips>
      </div>
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
    STATES.collapseWork = null
    this.scrollToCurrent()
  }

  scrollToCurrent() {
    let element = document.getElementsByClassName('navigation-block current')[0];
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
    let query = Diacritics.clean(this.refs.searchEditor.getText())
    if (query.length===0) { return this.update(this.original)}
    let scoredItems = []
    this._filter(query, scoredItems, this.original)
    this.headers = scoredItems.sort((a,b) => b.score-a.score)
    etch.update(this)
  }

  _filter(query, items, headers) {
    for (var item of headers) {
      item.score = zadeh.score(Diacritics.clean(item.text), query, {usePathScoring:false})
        if (item.score>0) {
          let matches = query.length>0 ? zadeh.match(Diacritics.clean(item.text), query, {usePathScoring:false}) : []
          let display = this.highlightMatchesInElement(item.text, matches, item.startPoint ? item.startPoint.row : null)
          items.push({...item, children:[], display:display})
        }
      this._filter(query, items, item.children)
    }
  }

  clearQuery() {
    this.refs.searchEditor.setText('')
    this.update(this.original)
    atom.views.getView(this.refs.searchEditor).focus();
  }

  highlightMatchesInElement(text, matches, row) {
    let el = row!==null ? [<span class='badge badge-flexible'>{row+1}</span>] : []
    let matchedChars = []
    let lastIndex = 0
    for (const matchIndex of matches) {
      const unmatched = text.substring(lastIndex, matchIndex)
      if (unmatched) {
        if (matchedChars.length > 0) {
          el.push( <span class='character-match'>{matchedChars.join('')}</span> )
          matchedChars = []
        }
        el.push( <span>{unmatched}</span> )
      }
      matchedChars.push(text[matchIndex])
      lastIndex = matchIndex + 1
    }
    if (matchedChars.length > 0) {
      el.push( <span class="character-match">{matchedChars.join('')}</span> )
    }
    const unmatched = text.substring(lastIndex)
    if (unmatched) {
      el.push( <span>{unmatched}</span> )
    }
    return el
  }
}


class TreeView {

  constructor(item) {
    this.item = item
    if (STATES.visibility===2 || STATES.collapseWork===2) {
      if (this.item.stackCount >0) {
        this.showChildren = true
      } else {
        this.showChildren = false
      }
    } else {
      this.showChildren = Boolean(STATES.visibility)
    }
    etch.initialize(this)
  }

  update(item) {
    this.item = item
    if (STATES.visibility===2 || STATES.collapseWork===2) {
      if (this.item.stackCount >0) {
        this.showChildren = true
      } else {
        this.showChildren = false
      }
    } else if (STATES.collapseWork!==null) {
      this.showChildren = Boolean(STATES.visibility)
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
    let iconClass, naviList
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
    let stackClass   = this.item.stackCount   >0 ? ' stack'   : ''
    let currentClass = this.item.currentCount >0 ? ' current' : ''
    let naviClass    = this.item.classList ? ' '+this.item.classList.join(' ') : ''
    let text = this.item.display ? this.item.display : this.item.text
    return <div class={"navigation-tree"+stackClass}>
      <div class={"navigation-block"+naviClass+currentClass}>
        <div class={"navigation-icon icon"+iconClass} on={{click:this.toggleNested}}/>
        <div class="navigation-text" on={{click:this.scrollToLine}}>{text}</div>
      </div>
      {naviList}
    </div>
  }

  scrollToLine(e) {
    if (this.item.viewer) {
      this.item.viewer.scrollToDestination(this.item)
      atom.views.getView(this.item.viewer).focus();
      return
    } else if (e.ctrlKey && e.altKey) {
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
