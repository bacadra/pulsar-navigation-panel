'use babel';

import {MarkdownModel}         from './markdown-model'
import {LatexModel}            from './latex-model'
import {PythonModel}           from './python-model'
import {SofiModel}             from './sofi-model'
import {BibModel}              from './bib-model'
import {ReStructuredTextModel} from './rst-model'
import {AsciiDocModel}         from './asciidoc-model'
import {BacadraLogModel}       from './bacadra-log'

import {NavigationPaneView}   from './navigation-pane-view'
import {CompositeDisposable}   from 'atom'
import {scopeIncludesOne}      from './util'

const MODEL_CLASSES = {
  'source.gfm'           : MarkdownModel,
  'text.md'              : MarkdownModel,
  'source.weave.md'      : MarkdownModel,
  'python'               : PythonModel,
  'source.python'        : PythonModel,
  'source.cython'        : PythonModel,
  'source.sofistik'          : SofiModel,
  'text.bibtex'          : BibModel,
  'text.tex.latex'       : LatexModel,
  'text.tex.latex.beamer': LatexModel,
  'text.tex.latex.knitr' : LatexModel,
  'text.knitr'           : LatexModel,
  'text.restructuredtext': ReStructuredTextModel,
  'source.asciidoc'      : AsciiDocModel,
  'text.blg'             : BacadraLogModel
};

const SUPPORTED_SCOPES = Object.keys(MODEL_CLASSES);

export default {
  config: {
    general: {
      type: 'object',
      title: 'General',
      description: 'Common settings for all scope',
      properties: {
        showByDefault: {
          title: "Show by default",
          type: 'boolean',
          default: true,
          description: 'Automatically show outline when opening a supported document type',
          order: 1,
        },
        collapseByDefault: {
          title: "Collapse by default",
          type: 'boolean',
          default: false,
          description: 'Automatically collapse outline, expanding only the current section',
          order: 2,
        },
        maxHeadingDepth: {
          title: "Max sections deepth",
          type: 'integer',
          default: 12,
          minimum: 1,
          maximum: 12,
          order: 3,
        },
        defaultSide: {
          title: "Default side",
          type: 'string',
          default: 'left',
          enum: [{value: 'left', description: 'Left'}, {value: 'right', description: 'Right'}],
          description: 'Default side for outline to appear',
          order: 4,
        },
        markLines: {
          title: "Mark lines with special CSS",
          type: 'boolean',
          default: true,
          description: 'Mark section lines in Text Editor view',
          order: 5,
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
          order: 6,
        },
      },
    },
  },

  activate(state) {
    this.update.bind(this);

    atom.contextMenu.add({'div.navigation-pane': [{
      label: 'Toggle outline',
      command: 'navigation-pane:toggle'
    }]});

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
      'navigation-pane:view-toggle': () => atom.workspace.toggle(this.view),
      'navigation-pane:markers-toggle': () => this.markersToggle(),
      'navigation-pane:SOFiSTiK-section-in-define-toggle': () => this.sofiDefineToggle(),
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

      'navigation-pane:fold-section' : () => this.foldSection(true),

      'navigation-pane:fold-as-TOC' : () => this.foldTOC(),

      'navigation-pane:fold-toggle' : () => this.toggleSection(),

      'navigation-pane:unfold-current' : () => this.unfold(),

      'navigation-pane:unfold-all' : () => this.unfoldAll(),
    }));


    this.subscriptions.add(atom.workspace.onDidStopChangingActivePaneItem(pane => {this.updateCurrentEditor(pane)}));

    // Update the view if any options change
    this.subscriptions.add(atom.config.observe('navigation-pane.general.maxHeadingDepth', newValue => {
      this.update(atom.workspace.getActiveTextEditor());
    }));

    this.subscriptions.add(atom.config.observe('navigation-pane.general.collapseByDefault', () => {
      this.update(atom.workspace.getActiveTextEditor());
    }));

    this.subscriptions.add(atom.config.observe('navigation-pane.general.defaultSide', () => {
      if (atom.config.get("navigation-pane.general.showByDefault")) {
        atom.workspace.hide(this.view);
        atom.workspace.open(this.view, {location: atom.config.get('navigation-pane.general.defaultSide')});
      }
    }));

    this.subscriptions.add(atom.config.observe("navigation-pane.general.showByDefault", enable => {
      if (enable) {
        this.updateCurrentEditor(atom.workspace.getActiveTextEditor());
        atom.workspace.open(this.view, {location: atom.config.get('navigation-pane.general.defaultSide')});
      } else {
        this.view.clear();
      }
    }));

    if (atom.config.get("navigation-pane.general.showByDefault")) {
      this.updateCurrentEditor(atom.workspace.getActiveTextEditor());
      atom.workspace.open(this.view, {location: atom.config.get('navigation-pane.general.defaultSide')});
    }

    for (let editor of atom.workspace.getTextEditors()) {
      this.updateCurrentEditor(editor)
    }
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
          this.docModel = this.getDocumentModel(editor);
          this.editorSubscriptions.dispose();

          this.editorSubscriptions.add(editor.onDidStopChanging(() => {
            // TODO add throttle here
            this.update(editor);
          }));
          this.update(editor);
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
      name: 'Document outline',
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
