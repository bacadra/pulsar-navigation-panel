'use babel';
/** @jsx etch.dom */

const etch = require('etch');
const {Point} = require('atom');

etch.setScheduler(atom.views);

export class TreeView {
  constructor(props) {
    this.plainText = props.plainText;
    this.cssExtension = props.cssExtension;
    this.childOutlines = props.children ? props.children : [];
    this.startRow = props.startPosition ? props.startPosition.row : null;
    this.endRow = props.endPosition ? props.endPosition.row : null;
    for (let child of this.childOutlines) {
      child.doHighlight = props.doHighlight;
      child.cursorPos = props.cursorPos;
    }
    this.highlight = '';
    if (props.cursorPos) {
      if (props.cursorPos.row >= props.startPosition.row && props.cursorPos.row <= props.endPosition.row && props.doHighlight) {
        this.highlight = 'item-highlight';
      }
    }
    this.autoCollapse = props.autoCollapse;
    this.showChildren = true;
    this.updateIcon();
    etch.initialize(this);
  }

  update(props) {
    // this.cursorPos = props.cursorPos;
    this.plainText = props.plainText;
    this.cssExtension = props.cssExtension;
    this.childOutlines = props.children;
    this.startRow = props.startPosition ? props.startPosition.row : null;
    this.endRow = props.endPosition ? props.endPosition.row : null;

    for (let child of this.childOutlines) {
      child.doHighlight = props.doHighlight;
      child.cursorPos = props.cursorPos;
      child.autoCollapse = props.autoCollapse;
    }

    this.highlight = '';
    if (props.cursorPos) {
      if (props.cursorPos.row >= props.startPosition.row && props.cursorPos.row <= props.endPosition.row && props.doHighlight) {
        this.highlight = 'item-highlight';
        if (props.autoCollapse) {
          this.showChildren = true;
        }
      } else {
        if (props.autoCollapse) {
          this.showChildren = false;
        }
      }
    }
    this.updateIcon();
    return etch.update(this);
  }

  render() {
    let sublist = <span></span>;

    if (this.childOutlines && this.showChildren) {
      sublist = <ol class="list-tree">
          {this.childOutlines.map(child => {
            return <TreeView {...child}/>;
          })}
        </ol>;
    }

    let iconClass = `icon ${this.icon}`;
    let itemClass = `list-nested-item list-selectable-item ${this.highlight}`;
    let itemId = `navigation-panel-${this.startRow}-${this.endRow}`;

    if (this.cssExtension==='separator') {
      itemClass = `${itemClass} separator`
      clsdiv = "tree-item-text"
    } else if (this.cssExtension) {
      clsdiv = `tree-item-text ${this.cssExtension}`
    } else {
      clsdiv = "tree-item-text"
    }

    return <div class={itemClass}
    startrow={this.startRow} endrow={this.endRow}
    id={itemId}
    key={itemId}
    ref="outlineElement"
    >
    <span class={iconClass} on={{click: this.toggleSubtree}}></span>
    <span class={clsdiv} on={{
      click: this.didClick,
      dblclick: this.toggleSubtree}}>
    {this.plainText}</span>
    {sublist}
    </div>;
  }

  async destroy () {
    await etch.destroy(this)
  }

  didClick() {
    const editor = atom.workspace.getActiveTextEditor();
    // const cursorPos = editor.getCursorBufferPosition();
    const documentPos = new Point(this.startRow, 0);
    if (editor && documentPos) {
      editor.setCursorBufferPosition(documentPos, {autoscroll: false});
      editor.scrollToCursorPosition({center: atom.config.get('navigation-panel.general.centerScroll')});
    }
    atom.views.getView(editor).focus();
  }

  toggleSubtree() {
    this.showChildren = !this.showChildren;
    this.updateIcon();
    return etch.update(this);
  }

  updateIcon() {
    if (this.childOutlines && this.childOutlines.length > 0 && this.showChildren) {
      this.icon = 'icon-chevron-down';
    } else if (this.childOutlines && this.childOutlines.length > 0 && !this.showChildren) {
      this.icon = 'icon-chevron-right';
    } else {
      this.icon = 'icon-one-dot';
    }
  }
}
