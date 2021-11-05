'use babel';

import {MarkdownModel}         from './model-markdown'
import {LatexModel}            from './model-latex'
import {PythonModel}           from './model-python'
import {SofistikModel}         from './model-sofistik'
import {BibtexModel}           from './model-bibtex'
import {ReStructuredTextModel} from './model-rest'
import {AsciiDocModel}         from './model-asciidoc'
import {BacalogModel}          from './model-bacalog'
import {NavigationPaneView}    from './navigation-pane-view'
import {CompositeDisposable}   from 'atom'
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
      description: 'Common settings for all scope',
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
          type: 'integer',
          minimum: 1,
          maximum: 12,
          default: 12,
        },
        defaultSide: {
          order: 3,
          title: "Default side",
          description: 'Default side for outline to appear',
          type: 'string',
          enum: [{value: 'left', description: 'Left'}, {value: 'right', description: 'Right'}],
          default: 'left',
        },
        markLines: {
          order: 4,
          title: "Mark lines with special CSS",
          type: 'boolean',
          description: 'Mark section lines in Text Editor view',
          default: true,
        },
        autoScroll: {
          order: 5,
          title: 'Automatically scroll tree view',
          description: 'Automatically scroll tree view if actual section (position of first cursor) is not visible at tree',
          type: 'boolean',
          default: true,
        },
        centerScroll: {
          order: 6,
          title: 'Center scroll mode',
          description: 'After tree click scroll the editor to place the cursor at the centre',
          type: 'boolean',
          default: true,
        },
        smoothScroll: {
          order: 7,
          title: 'Smoth scroll mode',
          description: 'Smoth scroll of navigation pane acc. cursor position',
          type: 'boolean',
          default: true,
        }
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
          order: 6,
        },
      },
    },
  },

  activate(state) {
    this.update.bind(this);

    atom.contextMenu.add({'div.navigation-pane': [
      {
        label: 'Toggle pane',
        command: 'navigation-pane:toggle'
      },
      {
        label: 'Toggle markers',
        command: 'navigation-pane:toggle-markers'
      },
    ]});

    // View and document model for the active pane
    this.docModel = null;
    this.view = new NavigationPaneView();
    this.subscriptions = new CompositeDisposable();
    // subscriptions for the currently active editor, cleared on tab switch
    this.editorSubscriptions = new CompositeDisposable();

    atom.workspace.addOpener(uri => {
      if (uri === 'atom://navigation-pane/outline') {
        return new NavigationPaneView();
      }
    });

    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'navigation-pane:toggle'   : () => atom.workspace.toggle(this.view),
      'navigation-pane:toggle-markers': () => this.markersToggle(),
      'navigation-pane:toggle-defines': () => this.sofiDefineToggle(),
    }));

    this.subscriptions.add(atom.commands.add('atom-text-editor', {
      'navigation-pane:fold-section-at-1'     : () => this.foldSection(1),
      'navigation-pane:fold-section-at-2'     : () => this.foldSection(2),
      'navigation-pane:fold-section-at-3'     : () => this.foldSection(3),
      'navigation-pane:fold-section-at-4'     : () => this.foldSection(4),
      'navigation-pane:fold-section-at-5'     : () => this.foldSection(5),
      'navigation-pane:fold-section-at-6'     : () => this.foldSection(6),
      'navigation-pane:fold-section-at-7'     : () => this.foldSection(7),
      'navigation-pane:fold-section-at-8'     : () => this.foldSection(8),
      'navigation-pane:fold-section-at-9'     : () => this.foldSection(9),

      'navigation-pane:fold-section'   : () => this.foldSection(true),
      'navigation-pane:fold-as-TOC'    : () => this.foldTOC(),
      'navigation-pane:fold-toggle'    : () => this.toggleSection(),
      'navigation-pane:unfold-current' : () => this.unfold(),
      'navigation-pane:unfold-all'     : () => this.unfoldAll(),
    }));

    this.subscriptions.add(atom.workspace.observeTextEditors(editor =>  {
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
    }));

    this.subscriptions.add(atom.workspace.onDidChangeActiveTextEditor(editor => {this.updateCurrentEditor(editor)}));

    // Update the view if any options change
    this.subscriptions.add(atom.config.observe('navigation-pane.general.maxHeadingDepth', newValue => {
      this.update(atom.workspace.getActiveTextEditor());
    }));

    this.subscriptions.add(atom.config.observe('navigation-pane.general.collapseByDefault', () => {
      this.update(atom.workspace.getActiveTextEditor());
    }));

    this.subscriptions.add(atom.config.observe('navigation-pane.general.autoScroll', () => {
      this.view.autoScroll = atom.config.get('navigation-pane.general.autoScroll');
    }));

    this.subscriptions.add(atom.config.observe('navigation-pane.general.smoothScroll', () => {
      this.view.smoothScroll = atom.config.get('navigation-pane.general.smoothScroll');
    }));

    this.updateCurrentEditor(atom.workspace.getActiveTextEditor());
  },

  updateCurrentEditor(editor) {
    if (!editor) {
      this.docModel = null;
      this.view.clear()
      this.editor = null
      this.editorSubscriptions.dispose()
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
          this.editorSubscriptions.dispose();

          this.editorSubscriptions.add(this.editor.onDidStopChanging(() => {
            // TODO add throttle here
            this.update(this.editor);
          }));
          this.update(this.editor);
        }

      } else {
        // this is an editor, but not a supported language
        this.docModel = null;
        this.editor = null
        if (this.view) {
          this.view.clear();
          this.editorSubscriptions.dispose();
        }
      }
    }
  },

  markersToggle() {
    if (atom.config.get('navigation-pane.general.markLines')===true) {
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

  update(editor) {
    if (this.view) {
      if (this.docModel) {
        let outline = this.docModel.getOutline();
        if (outline) {
          this.view.update({outline, editor});
        }
      } else {
        this.view.clear();
      }
    }
  },

  deactivate() {
    if (this.view) {
      this.view.destroy();
      this.view = null;
      this.docModel = null;
    }
    this.editorSubscriptions.dispose();
    this.subscriptions.dispose();
  },

  deactivatePartially() {
    if (this.view) {
      this.view.destroy();
      this.view = null;
      this.docModel = null;
    }
    this.editorSubscriptions.dispose();
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

  provideOutlines() {
    return {
      name: 'Navigation pane',
      // priority: number,
      grammarScopes: SUPPORTED_SCOPES,
      getOutline: editor => {
        let docModel = this.getDocumentModel(editor);
        return {outlineTrees: docModel.getOutline()};
      }
    };
  },

  // ********************************

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

  foldSection (LVL) {
    model=this.getModel() ; if (!model) {return} ; model.foldSection(LVL)},

  toggleSection () {
    model=this.getModel() ; if (!model) {return} ; model.toggleSection()},

  unfold () {
    model=this.getModel() ; if (!model) {return} ; model.unfold()},

  unfoldAll () {
    model=this.getModel() ; if (!model) {return} ; model.unfoldAll()},

  foldSections (LVL) {
    model=this.getModel() ; if (!model) {return} ; model.foldSections(LVL)},

  foldTOC () {
    model=this.getModel() ; if (!model) {return} ; model.foldTOC()},

};
