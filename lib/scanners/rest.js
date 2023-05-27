'use babel'

import { ScannerAbstract } from './abstract'

export class ScannerRest extends ScannerAbstract {

  constructor(editor) {
    super(editor, /^(.+)\n([!-/:-@[-`{-~])\2+$/igm)
    this.sectionLevels = {}
  }

  parse(object) {
    let match = object.match
    let level = 1
    let c = match[2].substr(0, 1)
    if (c in this.sectionLevels) {
      level = this.sectionLevels[c]
    } else {
      level = Object.keys(this.sectionLevels).length + 1
      this.sectionLevels[c] = level
    }
    return { level:level, text:match[1], classList:[] }
  }
}
