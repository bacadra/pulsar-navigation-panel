'use babel';
/** @jsx etch.dom */

const etch = require('etch');
const {NavigationTreeView} = require('./navigation-tree-view');

class NavigationPaneView {

  constructor() {
    this.cursorPositionSubscription = null;
    this.outline = [];
    this.autoScroll = atom.config.get('navigation-pane:autoScroll')
    this.smoothScroll = atom.config.get('navigation-pane:smoothScroll')
    this._depthFirstItems = [];
    etch.initialize(this);
  }

  getDefaultLocation() {
    return atom.config.get('navigation-pane.general.defaultSide');
  }

  getTitle() {
    return 'Navigation';
  }

  getIconName() {
    return 'list-unordered';
  }

  getURI() {
    return 'atom://navigation-pane/outline';
  }

  getAllowedLocations() {
    return ['left', 'right'];
  }

  getPreferredWidth() {
    return 200;
  }

  clear() {
    this.update({outline: []});
  }

  destroy() {
    etch.destroy(this);
    if (this.cursorPositionSubscription) {
      this.cursorPositionSubscription.dispose();
    }
  }

  getElement() {
    return this.element;
  }

  update(props) {
    let {outline, editor} = props;
    this.outline = outline;
    // Set the outline, which should rebuild the DOM tree
    // Clear existing events and re-subscribe to make sure we don't accumulate subscriptions

    if (editor && this.editor!=editor) { //second statment test purpose
      if (this.cursorPositionSubscription) {
        this.cursorPositionSubscription.dispose();
      }
      this.editor = editor
      this.cursorPos = editor.getCursorBufferPosition();
      this.cursorPositionSubscription = editor.onDidChangeCursorPosition(event => {
        if (event.oldBufferPosition.row !== event.newBufferPosition.row) {
          this.cursorPos = editor.getCursorBufferPosition();
          return etch.update(this);
        }
      });
    }

    this._depthFirstItems = [];
    return etch.update(this);
  }

  render() {
    this.outlineElements = this.outline.map(tree => {
      tree.cursorPos = this.cursorPos;
      tree.doHighlight = true;
      tree.autoCollapse = atom.config.get('navigation-pane.general.collapseByDefault');
      return <NavigationTreeView {...tree}/>;
    });

    return <div class="navigation-pane" id="navigation-pane">
        <ol class="list-tree">{this.outlineElements}</ol>
      </div>;
  }

  readAfterUpdate() {
    if (this.cursorPos) {
      let cursorPos = this.cursorPos;
      let range;
      let didFindDeepestItem = false;

      // NOTE: getElementsByClassName + filter should be much faster thant
      // querySelectorAll on .list-nested-item.current
      const elements = document.getElementsByClassName('list-nested-item');
      Array.from(elements).map(el => {
        return el.classList.remove('current');
      });

      for (let item of this.getDepthFirstItems(this.outline)) {
        range = item.range;
        if (range && range.containsPoint(cursorPos)) {
          let id = `navigation-pane-${item.range.start.row}-${item.range.end.row}`;
          let foundElement = document.getElementById(id);
          if (foundElement) {
            if (this.autoScroll) {
              if (this.smoothScroll) {behavior='smooth'} else {behavior='auto'}
              foundElement.scrollIntoView({behavior:behavior, block:'nearest', inline:'start'});
            }
            if (!didFindDeepestItem) {
              // This is where to add stuff related to the currently active sub-heading
              // without affecting parents or children
              foundElement.classList.add('current');
              didFindDeepestItem = true;
            }
          }
        }
      }
    }
  }

  getDepthFirstItems(root) {
    // Lazily construct a flat list of items for (in theory) fast iteration
    function collectDepthFirst(item, out) {
      let child;
      if (Array.isArray(item)) {
        for (child of item) {
          collectDepthFirst(child, out);
        }
      } else {
        for (child of item.children) {
          collectDepthFirst(child, out);
        }
        out.push(item);
      }
    }
      // Lazily get the items depth first. On first run build a flat list of items
    if (!this._depthFirstItems || this._depthFirstItems.length === 0) {
      this._depthFirstItems = [];
      collectDepthFirst(root, this._depthFirstItems);
    }
    return this._depthFirstItems;
  }
}

module.exports = {NavigationPaneView};
