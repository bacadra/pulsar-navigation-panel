'use babel'

import { CompositeDisposable } from 'atom'
import { NavigationView      } from './navi-view'
import { ScannerAsciiDoc     } from './scanners/asciidoc'
import { ScannerBibtex       } from './scanners/bibtex'
import { ScannerLatex        } from './scanners/latex'
import { ScannerMarkdown     } from './scanners/markdown'
import { ScannerPython       } from './scanners/python'
import { ScannerRest         } from './scanners/rest'
import { ScannerSofistik     } from './scanners/sofistik'

SCANNERS = {
  'source.asciidoc'      : ScannerAsciiDoc,
  'text.bibtex'          : ScannerBibtex,
  'text.tex.latex'       : ScannerLatex,
  'text.tex.latex.beamer': ScannerLatex,
  'text.tex.latex.knitr' : ScannerLatex,
  'text.knitr'           : ScannerLatex,
  'source.gfm'           : ScannerMarkdown,
  'text.md'              : ScannerMarkdown,
  'source.weave.md'      : ScannerMarkdown,
  'python'               : ScannerPython,
  'source.python'        : ScannerPython,
  'source.cython'        : ScannerPython,
  'text.restructuredtext': ScannerRest,
  'source.sofistik'      : ScannerSofistik,
}

export default {

  config: {
    general: {
      type: 'object',
      title: 'General',
      description: 'General settings for all scopes',
      order: 1,
      properties: {
        defaultSide: {
          order: 1,
          title: "Default side",
          description: 'Default panel side to navigation-panel appear. Restart needed',
          type: 'string',
          enum: [
            {description: 'Left'  , value: 'left'  },
            {description: 'Right' , value: 'right' },
            {description: 'Bottom', value: 'bottom'},
          ],
          default: 'left',
        },
        markLines: {
          order: 2,
          title: "Mark section lines",
          type: 'boolean',
          description: 'Mark section lines by fancy marker. The style of markers can be customized in `style.less`',
          default: true,
        },
        maxHeadingDepth: {
          order: 3,
          title: "Max sections deepth",
          description: 'The level reference to real section level, not user one. Refocus needed',
          type: 'integer',
          minimum: 1,
          default: 9,
        },
        searchBar: {
          order: 4,
          title: "Show search bar in panel",
          description: 'Toggla state of search bar in panel view',
          type: 'boolean',
          default: true,
        },
        categoryBar: {
          order: 5,
          title: "Show category bar in panel",
          description: 'Toggla state of category bar in panel view',
          type: 'boolean',
          default: true,
        },
        textWrap: {
          order: 6,
          title: "Wrap text in panel",
          type: 'boolean',
          default: true,
        },
        collapseMode: {
          order: 7,
          title: "Show children by default",
          description: 'The behavior of children is to be expanded, by default. You can change this parameter for Atom instance by command or in conext-menu of panel. Restart needed',
          type: 'boolean',
          default: true,
        },
        autoCollapse: {
          order: 8,
          title: "Auto collapse to current header",
          description: 'Automatically collapse outline, expanding only the current section, by default. You can change this parameter for Atom instance by command or in conext-menu of panel. Restart needed',
          type: 'boolean',
          default: false,
        },
        centerScroll: {
          order: 9,
          title: 'Center scroll mode',
          description: 'After tree click scroll the editor to place the cursor at the center',
          type: 'boolean',
          default: false,
        },
      },
    },
    categories: {
      type: 'object',
      title: 'Categories for headers',
      description: 'Mark headers by categories. The categories can be filtered in bottom bar of panel, context menu of panel or by command. The categories are predefined: info, success, warning, error. The meaning of the categories depends on the creativity of the user, use them as you like',
      order: 2,
      properties: {
        info: {
          order: 1,
          title: "Show info category headers",
          description: 'Global state of category. You can change this parameter for Atom instance by command or in conext-menu of panel. Restart needed',
          type: 'boolean',
          default: true,
        },
        success: {
          order: 2,
          title: "Show success category headers",
          description: 'Global state of category. You can change this parameter for Atom instance by command or in conext-menu of panel. Restart needed',
          type: 'boolean',
          default: true,
        },
        warning: {
          order: 3,
          title: "Show warning category headers",
          description: 'Global state of category. You can change this parameter for Atom instance by command or in conext-menu of panel. Restart needed',
          type: 'boolean',
          default: true,
        },
        error: {
          order: 4,
          title: "Show error category headers",
          description: 'Global state of category. You can change this parameter for Atom instance by command or in conext-menu of panel. Restart needed',
          type: 'boolean',
          default: true,
        },
        standard: {
          order: 5,
          title: "Show category-less headers",
          description: 'Global state of category. You can change this parameter for Atom instance by command or in conext-menu of panel. Restart needed',
          type: 'boolean',
          default: true,
        },
      },
    },
    latex: {
      type: 'object',
      title: 'LaTeX',
      description: 'LaTeX scope settings',
      order: 3,
      properties: {
        commands: {
          type: 'object',
          title: 'Section commands',
          description: 'The `|` symbol can be used to use multiple names. The commands are case insensitive. In general, the commands must be valid JavaScript regex statment without groups. The command are tested against the following square brackets and curly parentheses or just curly parentheses',
          properties: {
            4: {
              title: "part command of level 4",
              description: 'Refocus needed',
              type: 'string',
              default: 'part*?',
              order: 4,
            },
            5: {
              title: "chapter command of level 5",
              description: 'Refocus needed',
              type: 'string',
              default: 'chapter*?',
              order: 5,
            },
            6: {
              title: "section command of level 6",
              description: 'Refocus needed',
              type: 'string',
              default: 'section*?',
              order: 6,
            },
            7: {
              title: "subsection command of level 7",
              description: 'Refocus needed',
              type: 'string',
              default: 'subsection*?',
              order: 7,
            },
            8: {
              title: "subsubsection command of level 8",
              description: 'Refocus needed',
              type: 'string',
              default: 'subsubsection*?',
              order: 8,
            },
            9: {
              title: "paragraph command of level 9",
              description: 'Refocus needed',
              type: 'string',
              default: 'paragraph*?',
              order: 9,
            },
            10: {
              title: "subparagraph cCommand of level 10",
              description: 'Refocus needed',
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
      order: 4,
      properties: {
        inBlock: {
          title: "Show sections inside define block",
          type: 'boolean',
          default: true,
          description: 'You can outline section inside define block or not. Refocus needed',
          order: 1,
        },
      },
    },
  },

  activate() {
    this.disposables    = new CompositeDisposable()
    this.navigationView = new NavigationView()
    this.headers        = []
    this.editor         = null
    this.scanner        = null
    this.editorDispose  = null
    this.cursorsDispose = null

    this.disposables.add(
      atom.commands.add('atom-workspace', {
        'navigation-panel:open'                : () => this.open(),
        'navigation-panel:open-and-split-down' : () => this.open({split:'down'}),
        'navigation-panel:hide'                : () => this.hide(),
        'navigation-panel:toggle'              : () => this.toggle(),

        'navigation-panel:fold-toggle'         : () => this.toggleSection(),
        'navigation-panel:fold-section'        : () => this.foldSectionAt(),
        'navigation-panel:fold-section-at-1'   : () => this.foldSectionAt(1),
        'navigation-panel:fold-section-at-2'   : () => this.foldSectionAt(2),
        'navigation-panel:fold-section-at-3'   : () => this.foldSectionAt(3),
        'navigation-panel:fold-section-at-4'   : () => this.foldSectionAt(4),
        'navigation-panel:fold-section-at-5'   : () => this.foldSectionAt(5),
        'navigation-panel:fold-section-at-6'   : () => this.foldSectionAt(6),
        'navigation-panel:fold-section-at-7'   : () => this.foldSectionAt(7),
        'navigation-panel:fold-section-at-8'   : () => this.foldSectionAt(8),
        'navigation-panel:fold-section-at-9'   : () => this.foldSectionAt(9),
        'navigation-panel:fold-as-table'       : () => this.foldAsTable(),
        'navigation-panel:fold-all-infos'      : () => this.foldAsTable('info'),
        'navigation-panel:fold-all-successes'  : () => this.foldAsTable('success'),
        'navigation-panel:fold-all-warnings'   : () => this.foldAsTable('warning'),
        'navigation-panel:fold-all-errors'     : () => this.foldAsTable('error'),
        'navigation-panel:unfold'              : () => this.unfold(),
        'navigation-panel:unfold-all'          : () => this.unfoldAll(),
      }),

      atom.workspace.observeActiveTextEditor( (editor) => {
        this.editorSubscribe(editor)
      }),

      atom.workspace.observeTextEditors( (editor) => {
        total = 9 ; buffer = editor.getBuffer()
        if (!('navigationMarkerLayers' in buffer)) {
          buffer.navigationMarkerLayers = {}
          for (let i=1; i<=total; i++) {
            buffer.navigationMarkerLayers[i] = (
              buffer.addMarkerLayer({role:`navigation-marker-${i}`})
            )
          }
        }
        for (let i=1; i<=total; i++) {
          editor.decorateMarkerLayer(buffer.navigationMarkerLayers[i], {
            type:'line', class:`navigation-marker-${i} navigation-marker`
          })
        }
      }),

      atom.config.observe('navigation-panel.general.markLines', (value) => {
        this.markLines = value ; this.update()
      }),
    )

    // create markers for all text editors at activation of package
    for (editor of atom.workspace.getTextEditors()) {
      if (!editor) { continue }
      scopeName = editor.getGrammar().scopeName
      if (!(scopeName in SCANNERS)) { continue }
      scanner = new SCANNERS[scopeName](editor)
      headers = scanner.getHeaders()
      this.clearMarkers(editor)
      this._refreshMarkers(editor, headers)
    }
  },

  deactivate() {
    for (editor of atom.workspace.getTextEditors()) { this.clearMarkers(editor) }
    this.editorUnsubscribe()
    this.navigationView.destroy()
    this.disposables.dispose()
  },

  editorUnsubscribe() {
    if (this.scanner) {
      this.editorDispose .dispose() ; this.editorDispose  = null
      this.cursorsDispose.dispose() ; this.cursorsDispose = null
      for (cursor of this.editor.getCursors()) {
        cursor.navigationDisposeODCP.dispose()
        cursor.navigationDisposeODD .dispose()
      }
      delete cursor.navigationItems
      this.editor  = null
      this.scanner = null
    }
  },

  editorSubscribe(editor) {
    this.editorUnsubscribe()
    this.editor = editor ; this.scanner = null
    if (this.editor) {
      scopeName = this.editor.getGrammar().scopeName
      if (scopeName in SCANNERS) {
        this.scanner = new SCANNERS[scopeName](this.editor)
        this.editorDispose = this.editor.onDidStopChanging( () => { this.update() })
        this.cursorsDispose = this.editor.observeCursors( (cursor) => {
          cursor.navigationItems = []
          this.findCursorItems(cursor, cursor.getBufferPosition().row)
          this.navigationView.update( this.headers )
          cursor.navigationDisposeODCP = cursor.onDidChangePosition( (e) => {
            this.clearCursorItems(cursor)
            this.findCursorItems(cursor, e.newBufferPosition.row)
            this.navigationView.update( this.headers )
          })
          cursor.navigationDisposeODD = cursor.onDidDestroy(() => {
            this.clearCursorItems(cursor)
            cursor.navigationDisposeODCP.dispose()
            cursor.navigationDisposeODD .dispose()
            this.navigationView.update( this.headers )
          })
        })
      }
    }
    return this.update()
  },

  open(userOptions) {
    previouslyFocusedElement = document.activeElement
    options = {location:atom.config.get('navigation-panel.general.defaultSide'), searchAllPanes:true}
    atom.workspace.open(this.navigationView, {...options, ...userOptions}).then( () => { previouslyFocusedElement.focus() })
  },

  hide() {
    previouslyFocusedElement = document.activeElement
    atom.workspace.hide(this.navigationView)
    previouslyFocusedElement.focus()
  },

  toggle() {
    previouslyFocusedElement = document.activeElement
    atom.workspace.toggle(this.navigationView).then( () => { previouslyFocusedElement.focus() })
  },

  update() {
    if (!this.scanner) {
      return this.navigationView.update(null)
    }
    return new Promise( (resolve, _) => {
      this.headers = this.scanner.getHeaders()
      resolve()
    }).then( () => {
      for (cursor of this.editor.getCursors()) {
        this.clearCursorItems(cursor)
        this.findCursorItems(cursor, cursor.getBufferPosition().row)
      }
      this.navigationView.update( this.headers )
    }).then( () => {
      if (this.markLines) {
        this.refreshMarkers()
      } else {
        this.clearMarkers(this.editor)
      }
    })
  },

  clearCursorItems(cursor) {
    if (cursor.navigationItems.length>0) {
      cursor.navigationItems[0].currentCount -= 1
      for (item of cursor.navigationItems) {
        item.stackCount -= 1
      }
    }
    cursor.navigationItems = []
  },

  findCursorItems(cursor, cursorRow) {
    this.lookupState(cursor.navigationItems, cursorRow, this.headers)
  },

  lookupState(navigationItems, cursorRow, headers) {
    for (var i=headers.length-1; i>=0; i--) {
      var item = headers[i]
      if (item.startPoint.row<=cursorRow) {
        this.lookupState(navigationItems, cursorRow, item.children)
        if (navigationItems.length===0) {
          item.currentCount += 1
        }
        item.stackCount += 1
        navigationItems.push(item)
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

  foldAsTable(naviClass=null) {
    this.unfoldAll()
    curPos  = this.editor.getCursorBufferPosition()
    lastRow = this.editor.getLastBufferRow()
    header0 = null
    headers = this.getFlattenHeaders()

    for (header of headers) {
      if (header0 && (!naviClass || (header0.classList.includes(naviClass)))) {
        this.foldSectionByRows(header0.startPoint.row, header.startPoint.row-1)
      } else if (!naviClass) {
        this.foldSectionByRows(0, header.startPoint.row-1)
      }
      header0 = header
    }
    this.foldSectionByRows(header.startPoint.row, lastRow)
    this.editor.setCursorBufferPosition(curPos)
  },

  refreshMarkers() {
    this.clearMarkers(this.editor)
    this._refreshMarkers(this.editor, this.headers)
  },

  _refreshMarkers(editor, headers) {
    buffer = editor.getBuffer()
    for (var item of headers) {
      if (item.revel in buffer.navigationMarkerLayers) {
        buffer.navigationMarkerLayers[item.revel].markRange([item.startPoint, item.endPoint], {exclusive:true, invalidate:'inside'})
        this._refreshMarkers(editor, item.children)
      }
    }
  },

  clearMarkers(editor) {
    for (const layer of Object.values(editor.getBuffer().navigationMarkerLayers)) { layer.clear() }
  },
}
