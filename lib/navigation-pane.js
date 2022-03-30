'use babel';

import {CompositeDisposable}   from 'atom'
import {MarkdownModel}         from './model-markdown'
import {LatexModel}            from './model-latex'
import {PythonModel}           from './model-python'
import {SofistikModel}         from './model-sofistik'
import {BibtexModel}           from './model-bibtex'
import {ReStructuredTextModel} from './model-rest'
import {AsciiDocModel}         from './model-asciidoc'
import {BacalogModel}          from './model-bacalog'
import {NavigationPaneView}    from './navigation-pane-view'
import {scopeIncludesOne}      from './tools'

const MODEL_CLASSES = {
  'source.gfm'           : MarkdownModel,
  'text.md'              : MarkdownModel,
  'source.weave.md'      : MarkdownModel,
  'python'               : PythonModel,
  'source.python'        : PythonModel,
  'source.cython'        : PythonModel,
  'source.sofistik'      : SofistikModel,
  'text.bibtex'          : BibtexModel,
  'text.tex.latex'       : LatexModel,
  'text.tex.latex.beamer': LatexModel,
  'text.tex.latex.knitr' : LatexModel,
  'text.knitr'           : LatexModel,
  'text.restructuredtext': ReStructuredTextModel,
  'source.asciidoc'      : AsciiDocModel,
  'text.blg'             : BacalogModel
};

const SUPPORTED_SCOPES = Object.keys(MODEL_CLASSES);

export default {

  config: {
    general: {
      type: 'object',
      title: 'General',
      description: 'General settings for all scopes',
      properties: {
        collapseByDefault: {
          order: 1,
          title: "Collapse by default",
          description: 'Automatically collapse outline, expanding only the current section',
          type: 'boolean',
          default: false,
        },
        maxHeadingDepth: {
          order: 2,
          title: "Max sections deepth",
          description: 'The level reference to theoretical section level, not real one',
          type: 'integer',
          minimum: 1,
          maximum: 12,
          default: 12,
        },
        defaultSide: {
          order: 3,
          title: "Default side",
          description: 'Default pane side to navigation-pane appear',
          type: 'string',
          enum: [{value: 'left', description: 'Left'}, {value: 'right', description: 'Right'}],
          default: 'left',
        },
        markLines: {
          order: 4,
          title: "Mark secition lines",
          type: 'boolean',
          description: 'Mark section lines by fancy marker. The style of markers can be customized in `style.less`',
          default: true,
        },
        autoScroll: {
          order: 5,
          title: 'Automatically scroll mode',
          description: 'Automatically scroll tree view if actual section (or position of first cursor) is not visible',
          type: 'boolean',
          default: true,
        },
        centerScroll: {
          order: 6,
          title: 'Center scroll mode',
          description: 'After tree click scroll the editor to place the cursor at the center',
          type: 'boolean',
          default: true,
        },
        smoothScroll: {
          order: 7,
          title: 'Smoth scroll mode',
          description: 'Smoth scroll of navigation pane acc. cursor position',
          type: 'boolean',
          default: true,
        },
        updateMode: {
          order: 8,
          title: 'Update delay',
          description: 'Wait to update tree 300ms after stop editing; disabling this feature may consume more computer resources, but the navigation tree will respond immediately',
          type: 'boolean',
          default: true,
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
          description: 'The `|` symbol can be used to use multiple names. The commands are case insensitive. In general, the commands must be valid JavaScript regex statment without groups. The command are tested against the following square brackets and curly parentheses or just curly parentheses. All statments are case insensitive globally, so you do not care about it.',
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
    this.naviView = new NavigationPaneView();
    this.docModel = null;

    this.disposables = new CompositeDisposable();
    this.editorDisps = new CompositeDisposable();

    this.disposables.add(
      atom.workspace.addOpener(uri => {
        if (uri === 'atom://navigation-pane/outline') {
          return new NavigationPaneView();
        }
      }),

      atom.contextMenu.add({'div.navigation-pane': [
        {
          label: 'Toggle pane',
          command: 'navigation-pane:toggle'
        },
        {
          label: 'Toggle markers',
          command: 'navigation-pane:toggle-markers'
        },
      ]}),

      atom.commands.add('atom-workspace', {
        'navigation-pane:toggle'        : () => this.naviView.toggle(),
        'navigation-pane:toggle-markers': () => this.markersToggle(),
        'navigation-pane:toggle-defines': () => this.sofiDefineToggle(),
      }),

      atom.commands.add('atom-text-editor', {
        'navigation-pane:fold-section-at-1': () => this.foldSection(1),
        'navigation-pane:fold-section-at-2': () => this.foldSection(2),
        'navigation-pane:fold-section-at-3': () => this.foldSection(3),
        'navigation-pane:fold-section-at-4': () => this.foldSection(4),
        'navigation-pane:fold-section-at-5': () => this.foldSection(5),
        'navigation-pane:fold-section-at-6': () => this.foldSection(6),
        'navigation-pane:fold-section-at-7': () => this.foldSection(7),
        'navigation-pane:fold-section-at-8': () => this.foldSection(8),
        'navigation-pane:fold-section-at-9': () => this.foldSection(9),

        'navigation-pane:fold-section'  : () => this.foldSection(true),
        'navigation-pane:fold-as-TOC'   : () => this.foldTOC(),
        'navigation-pane:fold-toggle'   : () => this.toggleSection(),
        'navigation-pane:unfold-current': () => this.unfold(),
        'navigation-pane:unfold-all'    : () => this.unfoldAll(),
      }),

      atom.workspace.observeTextEditors( (editor) =>  {
        editor.navigationMarkerLayer = {}
        editor.getNavigationMarkerLayer = (lvl) => {
          if (lvl in editor.navigationMarkerLayer) {
            return editor.navigationMarkerLayer[lvl]
          } else {
            buffer = editor.getBuffer()
            layer = editor.navigationMarkerLayer[lvl] = editor.addMarkerLayer()
            editor.decorateMarkerLayer(layer, {
                type: 'line',
                class: `navigation-marker-${lvl} navigation-marker`
            })
            return layer
          }
        }
        editor.clearNavigationMarkers = () => {
          for (var layer of Object.values(editor.navigationMarkerLayer)) {layer.clear()}
        }
        this.updateCurrentEditor(editor)
      }),

      atom.workspace.onDidChangeActiveTextEditor( (editor) => { this.updateCurrentEditor(editor) }),

      atom.config.observe('navigation-pane.general.maxHeadingDepth', () => {
        this.update(atom.workspace.getActiveTextEditor());
      }),

      atom.config.observe('navigation-pane.general.collapseByDefault', () => {
        this.update(atom.workspace.getActiveTextEditor());
      }),

      atom.config.observe('navigation-pane.general.autoScroll', () => {
        this.naviView.autoScroll = atom.config.get('navigation-pane.general.autoScroll');
      }),

      atom.config.observe('navigation-pane.general.smoothScroll', () => {
        this.naviView.smoothScroll = atom.config.get('navigation-pane.general.smoothScroll');
      }),
    )

    this.updateCurrentEditor( atom.workspace.getActiveTextEditor() );
  },

  deactivate() {
    if (this.naviView) {
      this.naviView.destroy();
      this.naviView = null;
      this.docModel = null;
    }
    this.editorDisps.dispose();
    this.disposables.dispose();
  },

  updateCurrentEditor(editor) {
    if (!editor) {
      this.docModel = null;
      this.naviView.clear()
      this.editor = null
      this.editorDisps.dispose()
      return
    } else if (atom.workspace.isTextEditor(editor)) {
      // Only text panes have scope descriptors
      // Note that we don't clear if the current pane is not a text editor,
      // because the docks count as panes, so focusing a dock would clear
      // the outline
      let scopeDescriptor = editor.getRootScopeDescriptor();
      if (scopeIncludesOne(scopeDescriptor.scopes, SUPPORTED_SCOPES)) {

        if (this.editor!=editor) {
          this.editor = editor;
          this.docModel = this.getDocumentModel(this.editor);
          this.editorDisps.dispose();

          if (atom.config.get('navigation-pane.general.updateMode')) {
            this.editorDisps.add(this.editor.onDidStopChanging(() => {
              this.update(this.editor);
            }));
          } else {
            this.editorDisps.add(this.editor.onDidChange(() => {
              this.update(this.editor);
            }));
          }

          this.update(this.editor);
        }

      } else {
        // this is an editor, but not a supported language
        this.docModel = null;
        this.editor = null
        if (this.naviView) {
          this.naviView.clear();
          this.editorDisps.dispose();
        }
      }
    }
  },

  update(editor) {
    if (this.naviView) {
      if (this.docModel) {
        let outline = this.docModel.getOutline();
        if (outline) {
          this.naviView.update({outline, editor});
        }
      } else {
        this.naviView.clear();
      }
    }
  },


  deactivatePartially() {
    if (this.naviView) {
      this.naviView.destroy();
      this.naviView = null;
      this.docModel = null;
    }
    this.editorDisps.dispose();
  },

  getDocumentModel(editor) {
    let docModel = null;
    let scope = scopeIncludesOne(editor.getRootScopeDescriptor().scopes, SUPPORTED_SCOPES);
    let ModelClass = MODEL_CLASSES[scope];
    if (ModelClass) {
      docModel = new ModelClass(editor);
    }
    return docModel;
  },

  getModel () {
    const editor = atom.workspace.getActiveTextEditor()
    scopeDescriptors = editor.getRootScopeDescriptor().scopes

    for (let scope of scopeDescriptors) {
      if (SUPPORTED_SCOPES.includes(scope)) {
        return new MODEL_CLASSES[scope](editor);
      }
    }
    return false;
  },


  markersToggle() {
    if (atom.config.get('navigation-pane.general.markLines')) {
      atom.config.set('navigation-pane.general.markLines', false)
    } else {
      atom.config.set('navigation-pane.general.markLines', true)
    }
    this.update(atom.workspace.getActiveTextEditor())
  },

  sofiDefineToggle() {
    if (atom.config.get('navigation-pane.sofistik.inBlock')===true) {
      atom.config.set('navigation-pane.sofistik.inBlock', false)
    } else {
      atom.config.set('navigation-pane.sofistik.inBlock', true)
    }
    this.update(atom.workspace.getActiveTextEditor())
  },


  foldSection(level) {
    model = this.getModel()
    if (!model) {return}
    model.foldSection(level)
  },

  toggleSection() {
    model = this.getModel()
    if (!model) {return}
    model.toggleSection()
  },

  unfold() {
    model = this.getModel()
    if (!model) {return}
    model.unfold()
  },

  unfoldAll() {
    model = this.getModel()
    if (!model) {return}
    model.unfoldAll()
  },

  foldSections(level) {
    model = this.getModel()
    if (!model) {return}
    model.foldSections(level)
  },

  foldTOC() {
    model = this.getModel()
    if (!model) {return}
    model.foldTOC()
  },

};
