'use babel'

export class ScannerPDFjs {

  constructor(viewer) {
    this.viewer = viewer
  }

  getHeaders(outline) {
    if (!outline) { return [] }
    this.parse(outline, 1)
    return outline
  }

  parse(data, revel) {
    for (let item of data) {
      item.text = item.title
      item.viewer = this.viewer
      item.children = item.items
      item.classList = []
      item.level = item.revel = revel
      this.parse(item.children, revel+1)
    }
  }
}
