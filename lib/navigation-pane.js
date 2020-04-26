'use babel';

import {MarkdownModel}         from './markdown-model'
import {LatexModel}            from './latex-model'
import {PythonModel}           from './python-model'
import {SofiModel}             from './sofi-model'
import {BibModel}              from './bib-model'
import {ReStructuredTextModel} from './rst-model'
import {AsciiDocModel}         from './asciidoc-model'
import {BacadraLogModel}       from './bacadra-log'

import {DocumentOutlineView}   from './navigation-pane-view'
import {CompositeDisposable}   from 'atom'
import {scopeIncludesOne}      from './util'

const MODEL_CLASS_FOR_SCOPES = {
  'source.gfm'           : MarkdownModel,
  'text.md'              : MarkdownModel,
  'source.weave.md'      : MarkdownModel,
  'python'               : PythonModel,
  'source.python'        : PythonModel,
  'source.sofi'          : SofiModel,
  'text.bibtex'          : BibModel,
  'text.tex.latex'       : LatexModel,
  'text.tex.latex.beamer': LatexModel,
  'text.tex.latex.knitr' : LatexModel,
  'text.knitr'           : LatexModel,
  'text.restructuredtext': ReStructuredTextModel,
  'source.asciidoc'      : AsciiDocModel,
  'text.blg'             : BacadraLogModel
};

const SUPPORTED_SCOPES = Object.keys(MODEL_CLASS_FOR_SCOPES);

export default {
  config: {
    showByDefault: {
      type: 'boolean',
      default: true,
      description: 'Automatically show outline when opening a supported document type'
    },
    collapseByDefault: {
      type: 'boolean',
      default: false,
      description: 'Automatically collapse outline, expanding only the current section'
    },
    maxHeadingDepth: {
      type: 'integer',
      default: 12,
      minimum: 1,
      maximum: 12
    },
    defaultSide: {
      type: 'string',
      default: 'right',
      enum: [{value: 'left', description: 'Left'}, {value: 'right', description: 'Right'}],
      description: 'Default side for outline to appear'
    },
    markLines: {
      type: 'boolean',
      default: true,
      description: 'Mark section lines in Text Editor view'
    }
  },

  activate(state) {
    this.update.bind(this);

    atom.contextMenu.add({'div.navigation-pane': [{
      label: 'Toggle outline',
      command: 'navigation-pane:toggle'
    }]});

    // View and document model for the active pane
    this.docModel = null;
    this.view = new DocumentOutlineView();
    this.subscriptions = new CompositeDisposable();
    // subscriptions for the currently active editor, cleared on tab switch
    this.editorSubscriptions = new CompositeDisposable();

    // atom.workspace.addOpener(uri => {
    //   if (uri === 'atom://navigation-pane/outline') {
    //     return new DocumentOutlineView();
    //   }
    // });


    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'navigation-pane:view-toggle': () => atom.workspace.toggle(this.view),
      'navigation-pane:markers-toggle': () => this.markersToggle(),
      'navigation-pane:deactivate': () => this.deactivatePartially(),
      'navigation-pane:activate': () => this.activate(),
    }));

    this.subscriptions.add(atom.workspace.onDidStopChangingActivePaneItem(pane => {this.updateCurrentEditor(pane)}));

    // Update the view if any options change
    this.subscriptions.add(atom.config.observe('navigation-pane.maxHeadingDepth', newValue => {
      this.update(atom.workspace.getActiveTextEditor());
    }));

    this.subscriptions.add(atom.config.observe('navigation-pane.collapseByDefault', () => {
      this.update(atom.workspace.getActiveTextEditor());
    }));

    this.subscriptions.add(atom.config.observe('navigation-pane.defaultSide', () => {
      if (atom.config.get("navigation-pane.showByDefault")) {
        atom.workspace.hide(this.view);
        atom.workspace.open(this.view, {location: atom.config.get('navigation-pane.defaultSide')});
      }
    }));

    this.subscriptions.add(atom.config.observe("navigation-pane.showByDefault", enable => {
      if (enable) {
        this.updateCurrentEditor(atom.workspace.getActiveTextEditor());
        atom.workspace.open(this.view, {location: atom.config.get('navigation-pane.defaultSide')});
      } else {
        this.view.clear();
        // atom.workspace.hide(this.view);
      }
    }));

    if (atom.config.get("navigation-pane.showByDefault")) {
      this.updateCurrentEditor(atom.workspace.getActiveTextEditor());
      atom.workspace.open(this.view, {location: atom.config.get('navigation-pane.defaultSide')});
    }
    //  else {
    //   atom.workspace.hide(this.view);
    // }

    this.subscriptions.add(atom.config.observe('navigation-pane.markLines', () => {
      this.update(atom.workspace.getActiveTextEditor());
    }));


    // // create marks for all text editors during atom opening...
    // let currPane = atom.workspace.getActivePane()
    // for (let editor of atom.workspace.getTextEditors()) {
    //   pane = atom.workspace.paneForItem(editor)
    //   pane.activate()
    //   this.updateCurrentEditor(editor)
    // }
    // currPane.activate()
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
    if (atom.config.get('navigation-pane.markLines')==true) {
      atom.config.set('navigation-pane.markLines', false)
    } else {
      atom.config.set('navigation-pane.markLines', true)
    }
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
    let ModelClass = MODEL_CLASS_FOR_SCOPES[scope];
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
  }
};
