'use babel'


export class ScannerAbstract {

  constructor(editor, regex) {
    this.editor   = editor
    this.regex    = regex
    this.maxDepth = atom.config.get('navigation-panel.general.maxHeadingDepth')
  }

  getHeaders() {
    headers = []
    if (!this.editor) { return headers }
    this.editor.scan(this.regex, {}, (object) => {
      item = this.parse(object)
      if (!item) {return}
      item.text = item.text.trim()
      item.children = []
      item.editor = this.editor
      item.startPoint = object.range.start,
      item.endPoint = object.range.end
      this.stacker(headers, item, 1)
    })
    return headers
  }

  stacker(stack, item, revel) {
    if (this.maxDepth<revel) { return }
    item.revel = revel
    if (!stack.length) {
      stack.push(item)
    } else if (stack[stack.length-1].level>=item.level) {
      stack.push(item)
    } else {
      this.stacker(stack[stack.length-1].children, item, revel+1)
    }
  }

  parse(object) { return object }
}
