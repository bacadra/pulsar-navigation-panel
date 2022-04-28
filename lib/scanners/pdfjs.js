'use babel'

export class ScannerPDFjs {

  constructor(viewer) {
    this.viewer  = viewer
  }

  getHeaders(outline) {
    this.parse(outline, 1)
    return outline
  }

  parse(data, revel) {
    for (item of data) {
      item.text = item.title
      item.viewer = this.viewer
      item.children = item.items
      item.classList = []
      item.level = item.revel = revel
      this.parse(item.children, revel+1)
    }
  }
}