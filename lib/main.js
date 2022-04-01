'use babel'

import { CompositeDisposable } from 'atom'
import { NavigationView } from './navi-view'

import { ScannerAsciiDoc } from './scanners/asciidoc'
import { ScannerBibtex } from './scanners/bibtex'
import { ScannerLatex } from './scanners/latex'
import { ScannerMarkdown } from './scanners/markdown'
import { ScannerPython } from './scanners/python'
import { ScannerRest } from './scanners/rest'
import { ScannerSofistik } from './scanners/sofistik'


SCANNERS = {
  'source.asciidoc': ScannerAsciiDoc,
  'text.bibtex': ScannerBibtex,
  'text.tex.latex': ScannerLatex,
  'text.tex.latex.beamer': ScannerLatex,
  'text.tex.latex.knitr': ScannerLatex,
  'text.knitr': ScannerLatex,
  'source.gfm': ScannerMarkdown,
  'text.md': ScannerMarkdown,
  'source.weave.md': ScannerMarkdown,
  'python': ScannerPython,
  'source.python': ScannerPython,
  'source.cython': ScannerPython,
  'text.restructuredtext': ScannerRest,
  'source.sofistik': ScannerSofistik,
}

export default {

  config: {
    general: {
      type: 'object',
      title: 'General',
      description: 'General settings for all scopes',
      properties: {
        defaultSide: {
          title: "Default side",
          description: 'Default panel side to navigation-panel appear',
          type: 'string',
          enum: [{value: 'left', description: 'Left'}, {value: 'right', description: 'Right'}],
          default: 'left',
        },
        markLines: {
          title: "Mark section lines",
          type: 'boolean',
          description: 'Mark section lines by fancy marker. The style of markers can be customized in `style.less`',
          default: true,
        },
        maxHeadingDepth: {
          title: "Max sections deepth",
          description: 'The level reference to real section level, not user one',
          type: 'integer',
          minimum: 1,
          default: 9,
        }
      },
    },
    latex: {
      type: 'object',
      title: 'LaTeX',
      description: 'LaTeX scope settings',
      properties: {
        commands: {
          type: 'object',
          title: 'Section commands',
          description: 'The `|` symbol can be used to use multiple names. The commands are case insensitive. In general, the commands must be valid JavaScript regex statment without groups. The command are tested against the following square brackets and curly parentheses or just curly parentheses',
          properties: {
            4: {
              title: "part command of level 4",
              type: 'string',
              default: 'part*?',
              order: 4,
            },
            5: {
              title: "chapter command of level 5",
              type: 'string',
              default: 'chapter*?',
              order: 5,
            },
            6: {
              title: "section command of level 6",
              type: 'string',
              default: 'section*?',
              order: 6,
            },
            7: {
              title: "subsection command of level 7",
              type: 'string',
              default: 'subsection*?',
              order: 7,
            },
            8: {
              title: "subsubsection command of level 8",
              type: 'string',
              default: 'subsubsection*?',
              order: 8,
            },
            9: {
              title: "paragraph command of level 9",
              type: 'string',
              default: 'paragraph*?',
              order: 9,
            },
            10: {
              title: "subparagraph cCommand of level 10",
              type: 'string',
              default: 'subparagraph*?',
              order: 10,
            },
          },
        },
      },
    },
    sofistik: {
      type: 'object',
      title: 'SOFiSTiK',
      description: 'SOFiSTiK scope settings',
      properties: {
        inBlock: {
          title: "Show sections inside define block",
          type: 'boolean',
          default: false,
          description: 'You can outline section inside define block or not',
          order: 1,
        },
      },
    },
  },

  activate() {
    this.disposables = new CompositeDisposable()

    this.headers = []
    this.editor  = null
    this.grammar = null
    this.scanner = null
    this.editorStopChangingSub   = null
    this.cursorChangePositionSub = null

    this.navigationView = new NavigationView()

    this.disposables.add(
      atom.commands.add('atom-workspace', {
        'navigation-panel:toggle': () => this.toggle(),
        'navigation-panel:section'          : () => this.toggleSection(),
        'navigation-panel:fold-section'     : () => this.foldSectionAt(),
        'navigation-panel:fold-section-at-1': () => this.foldSectionAt(1),
        'navigation-panel:fold-section-at-2': () => this.foldSectionAt(2),
        'navigation-panel:fold-section-at-3': () => this.foldSectionAt(3),
        'navigation-panel:fold-section-at-4': () => this.foldSectionAt(4),
        'navigation-panel:fold-section-at-5': () => this.foldSectionAt(5),
        'navigation-panel:fold-section-at-6': () => this.foldSectionAt(6),
        'navigation-panel:fold-section-at-7': () => this.foldSectionAt(7),
        'navigation-panel:fold-section-at-8': () => this.foldSectionAt(8),
        'navigation-panel:fold-as-table'    : () => this.foldAsTable(),
        'navigation-panel:unfold'           : () => this.unfold(),
        'navigation-panel:unfold-all'       : () => this.unfoldAll(),
      }),

      atom.workspace.observeActiveTextEditor( (editor) => {
        if (this.editorStopChangingSub) {
          this.editorStopChangingSub.dispose()
          this.editorStopChangingSub = null
        }
        if (this.cursorChangePositionSub) {
          this.cursorChangePositionSub.dispose()
          this.cursorChangePositionSub = null
        }
        this.editor = editor ; this.scanner = null
        if (this.editor) {
          scopeName = this.editor.getGrammar().scopeName
          if (scopeName in SCANNERS) {
            this.scanner = new SCANNERS[scopeName](this.editor)
            this.editorStopChangingSub = this.editor.onDidStopChanging( () => { this.update() })
            this.cursorChangePositionSub = this.editor.onDidChangeCursorPosition( (e) => { this.state(e) })
          }
        }
        return this.update()
      }),

      atom.workspace.observeTextEditors( (editor) => {
        editor.navigationMarkerLayers = {}
      }),

      atom.config.observe('navigation-panel.general.markLines', (value) => {
        this.markLines = value ; this.update()
      }),

    )
  },

  deactivate() {
    this.navigationView.destroy()
    this.disposables.dispose()
  },

  toggle() {
    previouslyFocusedElement = document.activeElement
    atom.workspace.toggle(this.navigationView)
      .then( () => { previouslyFocusedElement.focus() })
  },

  update() {
    if (!this.scanner) {
      return this.navigationView.update([])
    }
    return new Promise( (resolve, _) => {
      this.headers = this.scanner.getHeaders()
      resolve()
    }).then( () => {
      this.state({newBufferPosition: this.editor.getCursorBufferPosition()})
      this.navigationView.update( this.headers )
    }).then( () => {
      if (this.markLines) {
        this.refreshMarkers()
      } else {
        this.clearNaviMarkers()
      }
    })
  },

  state(e) {
    this.currentQ = false
    this.disableState(e, this.headers)
    this.lookupState (e, this.headers)
    this.navigationView.update( this.headers)
  },

  disableState(e, headers) {
    for (var item of headers) {
      item.stackQ = false ; item.currentQ = false
      this.disableState(e, item.children)
    }
  },

  lookupState(e, headers) {
    for (var i=headers.length-1; i>=0; i--) {
      var item = headers[i]
      if (item.startPoint.row<=e.newBufferPosition.row) {
        this.lookupState(e, item.children)
        if (!this.currentQ) {
          item.currentQ = this.currentQ = true
        }
        item.stackQ = true
        break
      }
    }
  },

  getFlattenHeaders() {
    items = []
    this._getFlattenHeaders(items, headers)
    return items
  },

  _getFlattenHeaders(items, headers) {
    for (item of headers) {
      items.push(item)
      this._getFlattenHeaders(items, item.children)
    }
  },

  foldSectionByRows(startRow, endRow) {
    this.editor.setSelectedBufferRange(
      [[startRow, 1e10], [endRow, 1e10]]
    )
    this.editor.foldSelectedLines()
  },

  foldSectionAt(foldRevel) {
    curPos = this.editor.getCursorBufferPosition()
    header1 = null ; header2 = null
    headers = this.getFlattenHeaders()
    for (var i=headers.length-1; i>=0; i--) {

      if (headers[i].startPoint.row <= curPos.row && (!foldRevel || (foldRevel && headers[i].revel===foldRevel))) {
        header1 = headers[i]
        for (var j = i+1; j<headers.length; j++) {
          if (headers[j].revel<=header1.revel) {
            header2 = headers[j]
            break
          }
        }
        break
      }
    }
    if (!header1) {
      return
    } else {
      startRow = header1.startPoint.row
    }
    if (!header2) {
      endRow = this.editor.getLineCount()
    } else {
      endRow = header2.startPoint.row-1
    }
    this.foldSectionByRows(startRow, endRow)
  },

  unfold () {
    const currentRow = this.editor.getCursorBufferPosition().row
    this.editor.unfoldBufferRow(currentRow)
    this.editor.scrollToCursorPosition()
  },

  toggleSection() {
    const currentRow = this.editor.getCursorBufferPosition().row
    if (this.editor.isFoldedAtBufferRow(currentRow)){
      this.unfold()
    } else {
      this.foldSectionAt()
    }
  },

  unfoldAll() {
    let lrow = this.editor.getLastBufferRow()
    for (let row = 0; row < lrow; row++) {
      this.editor.unfoldBufferRow(row)
    }
    this.editor.scrollToCursorPosition()
  },

  foldAsTable() {
    this.unfoldAll()
    curPos  = this.editor.getCursorBufferPosition()
    lastRow = this.editor.getLastBufferRow()
    header0 = null
    headers = this.getFlattenHeaders()

    for (header of headers) {
      if (header0) {
        this.foldSectionByRows(header0.startPoint.row, header.startPoint.row-1)
      } else {
        this.foldSectionByRows(0, header.startPoint.row-1)
      }
      header0 = header
    }
    this.foldSectionByRows(header.startPoint.row, lastRow)
    this.editor.setCursorBufferPosition(curPos)
  },

  refreshMarkers() {
    this.clearNaviMarkers()
    this._refreshMarkers(this.headers)
  },

  _refreshMarkers(headers) {
    for (var item of headers) {
      this.getNaviMarkerLayer(item.revel).markBufferRange([item.startPoint, item.endPoint], {exclusive:true, invalidate:'inside'})
      this._refreshMarkers(item.children)
    }
  },

  getNaviMarkerLayer(revel) {
    if (revel in this.editor.navigationMarkerLayers) {
      return this.editor.navigationMarkerLayers[revel]
    } else {
      layer = this.editor.navigationMarkerLayers[revel] = this.editor.addMarkerLayer()
      this.editor.decorateMarkerLayer(layer, {
        type:'line', class:`navigation-marker-${revel} navigation-marker`
      })
      return layer
    }
  },

  clearNaviMarkers() {
    for (const layer of Object.values(this.editor.navigationMarkerLayers)) { layer.clear() }
  },
}
