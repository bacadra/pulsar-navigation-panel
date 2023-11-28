'use babel'

import { ScannerAbstract } from './abstract'

export class ScannerTasklist extends ScannerAbstract {

  constructor(editor) {
    super(editor, /(?:^(#+) +(.+?) *$|^ *(.+?) *: *$)/g)
  }

  parse(object) {
    let match = object.match
    if (match[1]) {
      return { level:match[1].length, text:match[2], classList:[] }
    } else {
      return { level:5, text:match[3], classList:[] }
    }
  }
}
