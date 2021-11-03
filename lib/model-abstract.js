const {Point, Range} = require('atom');

class AbstractModel {

  constructor(editorOrBuffer, headingRegexes) {
    this.HEADING_REGEX = headingRegexes;

    this.editor = editorOrBuffer

    if (editorOrBuffer.getBuffer) {
      editorOrBuffer = editorOrBuffer.getBuffer();
    }
    this.buffer = editorOrBuffer;

    if (this.buffer.findAllSync) {
      this._parseLevel = this._parseLevelFast;
    } else {
      this._parseLevel = this._parseLevelSlow;
    }
    this.maxDepth = atom.config.get("navigation-pane.general.maxHeadingDepth");
    this.oldHeadingStr = '';
  }

  getOutline() {
    let newHeadings = this.parse();
    let newHeadingStr = JSON.stringify(newHeadings);
    if (newHeadingStr === this.oldHeadingStr) {
      return null;
    }
    this.oldHeadingStr = newHeadingStr;
    return newHeadings;
  }

  parse() {
    this.markLines = atom.config.get('navigation-pane.general.markLines')
    return this._parseLevel(Point.ZERO, Point.INFINITY, 1);
  }

  _stackHeadings(rawHeadings) {
    this.editor.clearNavigationMarkers()

    let stack = [{
      level: 0,
      plainText: '_hidden_root',
      cssExtension: '',
      headingRange: new Range(Point.ZERO, Point.INFINITY),
      children: [],
      range: new Range(Point.ZERO, Point.INFINITY)
    }];
    let top;

    for (let heading of rawHeadings) {
      if (heading.level > this.maxDepth) {continue}
      top = stack.pop();

      if (heading.level > top.level) {
        top.children.push(heading);
        stack.push(top);
        stack.push(heading);

      } else if (heading.level === top.level) {
        // At equal level, we close the previous heading
        // Create a new point to avoid re-use of mutable value
        top.range.end = new Point(heading.headingRange.start.row - 1, heading.headingRange.start.column);
        top.endPosition = top.range.end;
        // Then get the parent
        top = stack.pop();
        top.children.push(heading);
        stack.push(top);
        stack.push(heading);

      } else if (top.level > heading.level) {
        // This starts a new section at a more important level
        // roll up the stack
        // Create a new point to avoid re-use of mutable value
        top.range.end = new Point(heading.headingRange.start.row - 1, heading.headingRange.start.column);
        top.endPosition = top.range.end;
        while (top) {
          top = stack.pop();
          // Close each range until we get to the suitable parent
          // Create a new point to avoid re-use of mutable value
          top.range.end = new Point(heading.headingRange.start.row - 1, heading.headingRange.start.column);
          top.endPosition = top.range.end;
          if (top.level < heading.level) {
            break;
          }
        }
        top.children.push(heading);
        stack.push(top);
        stack.push(heading);
      }

      if (this.markLines) {
        this.editor.getNavigationMarkerLayer(heading.level).markBufferRange(
            heading.headingRange, {exclusive:true, invalidate:'inside'}
        )
      }
    }
    return stack[0].children;
  }

  _parseLevelFast(start, end, level) {

    let rawHeadings = [];
    let regex = this.HEADING_REGEX;
    let ranges = this.buffer.findAllSync(regex);
    let headingText;
    // non global version of the heading regex
    // this is a backward compat hack that avoids changes to implementations
    // for each grammar.
    let limitedRegex = regex
    for (let headingRange of ranges) {

      headingText = this.buffer.getTextInRange(headingRange);
      let result = limitedRegex.exec(headingText);
      // let parsedResult = this.parseResults([headingText]);

      if (result) {
        let parsedResult = this.parseResults(result);

        if (parsedResult) {
          let heading = {
            level: parsedResult.level,
            headingRange: headingRange,
            plainText: parsedResult.label,
            cssExtension: parsedResult.cssExtension,
            children: [],
            range: new Range(headingRange.start, Point.INFINITY),
            startPosition: headingRange.start,
            endPosition: Point.INFINITY
          };
          rawHeadings.push(heading);
        }
      }
    }
    return this._stackHeadings(rawHeadings);
  }

  _parseLevelSlow(start, end, level) {
    let rawHeadings = [];
    let regex = this.HEADING_REGEX;

    let text = this.buffer.getText();

    let results = [];
    let result;
    let parsedResult;
    // Collect the regex results
    while ((result = regex.exec(text)) !== null) {
      // allow subclasses to customise how they get level, label from regex
      parsedResult = this.parseResults(result);
      if (parsedResult) {
        parsedResult.index = result.index;
        results.push(parsedResult);
      }
    }

    // Find the line numbers for the results
    // Much faster to loop over the lines once than to search every time.
    let currentResultIndex = 0;
    let currentResult = results[currentResultIndex];
    let line = 0;
    let match;
    let re = /(^.*(\r\n|\n\r|\n|\r))|(^\r\n|^\n\r|^\n|^\r)/gm;
    while ((match = re.exec(text))) {
      if (match.index > currentResult.index) {
        let startLine = line;
        let headingRange = new Range([startLine, 0],
                                     [startLine, currentResult.label.length]);

        let heading = {
          level: currentResult.level,
          headingRange: headingRange,
          plainText: currentResult.label,
          cssExtension: parsedResult.cssExtension,
          children: [],
          icon: 'icon-one-dot',
          range: new Range(headingRange.start, Point.INFINITY),
          startPosition: headingRange.start,
          endPosition: Point.INFINITY
        };

        rawHeadings.push(heading);
        currentResultIndex += 1;
        if (currentResultIndex >= results.length) {
          // Stop iterating if we did all the headings
          break;
        } else {
          currentResult = results[currentResultIndex];
        }
      }
      line += 1;
    }

    return this._stackHeadings(rawHeadings);
  }

  // ********************************

  parseFold (level, lineText) {
    let scanResult = this.HEADING_REGEX.exec(lineText)
    if (scanResult) {
      let data = this.parseResults(scanResult)
      if (level===true || data.level===level){return data}
    }
  }

  parseResults () {
    return {level:1, label:'', cssExtension:''}
  }

  foldSection(level=true) {
    let currPos = this.editor.getCursorBufferPosition()
    let currRow = currPos.row
    let lastRow = this.editor.getLastBufferRow()

    let startRow, endRow, lineText, levelA, parsedResult

    for (let i = currRow; i >= 0; i--) {
      lineText = this.editor.lineTextForBufferRow(i)
      parsedResult = this.parseFold(level, lineText)
      if (parsedResult===undefined) {continue}
      startRow = i
      levelA = parsedResult.level
      break
    }

    if (parsedResult===undefined) {return}

    for (let i = currRow+1; i <= lastRow; i++) {
      lineText = this.editor.lineTextForBufferRow(i)
      parsedResult = this.parseFold(true, lineText)
      if (parsedResult!==undefined && parsedResult.level<=levelA) {
        endRow = i
        break
      }
    }

    if (!endRow) {endRow = lastRow} else {endRow=endRow-1}

    this.foldRows(startRow, endRow)

    this.editor.setCursorBufferPosition(currPos)
  }

  foldRows(startRow, endRow) {
    this.editor.setSelectedBufferRange(
      [[startRow, 1e10], [endRow, 1e10]]
    )
    this.editor.foldSelectedLines()
  }

  toggleSection() {
    const currentRow = this.editor.getCursorBufferPosition().row
    if (this.editor.isFoldedAtBufferRow(currentRow)){
      this.unfold()
    } else {
      this.foldSection()
    }
  }

  // foldSections(level) {
  //   this.unfoldAll()
  //   currPos = this.editor.getCursorBufferPosition()
  //   lastRow = this.editor.getLastBufferRow()
  //   level = level-1
  //   for (let i = 0; i <= lastRow; i++) {
  //     lineText = this.editor.lineTextForBufferRow(i)
  //     lvl = this.parseFold(level, lineText).level
  //     if (lvl===false) {continue}
  //     startRow = i
  //     i++;
  //     for (let j = 0; i <= lastRow; i++) {
  //       lineText = this.editor.lineTextForBufferRow(i)
  //       lvl = this.parseFold(true, lineText).level
  //       if ((lvl!==false && lvl<=level)|| i==lastRow) {
  //         endRow = i;
  //         if (i==lastRow) {endRow++}
  //         this.foldRows(startRow, endRow-1)
  //         i--;
  //         break
  //       }
  //     }
  //   }
  //   this.editor.setCursorBufferPosition(currPos)
  // }

  foldTOC() {
    this.unfoldAll()

    let currPos  = this.editor.getCursorBufferPosition()
    let lastRow = this.editor.getLastBufferRow()
    let lineText, parsedResult

    let startRow = -1

    for (let i = startRow+1; i <= lastRow; i++) {
      lineText = this.editor.lineTextForBufferRow(i)
      parsedResult = this.parseFold(true, lineText)
      if (parsedResult!==undefined || i===lastRow) {
        if (i==lastRow) {i++}
        this.foldRows(startRow, i-1)
        startRow = i
      }
    }

    this.editor.setCursorBufferPosition(currPos)
  }

  unfold () {
    const currentRow = this.editor.getCursorBufferPosition().row
    this.editor.unfoldBufferRow(currentRow)
    this.editor.scrollToCursorPosition()
  }

  unfoldAll() {
    let lrow = this.editor.getLastBufferRow()
    for (let row = 0; row < lrow; row++) {
      this.editor.unfoldBufferRow(row)
    }
    this.editor.scrollToCursorPosition()
  }

}

module.exports = {AbstractModel};
