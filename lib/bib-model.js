const {AbstractModel} = require('./abstract-model');

// Possible regex to exclude commented lines
// ^(?:!%)*\s*

const S1_REGEX = /^[ ]*(\%#) [ |\_]*([^\_|\n]*)/;
const S2_REGEX = /^[ ]*(\%##) [ |\_]*([^\_|\n]*)/;
const S3_REGEX = /^[ ]*(\%###) [ |\_]*([^\_|\n]*)/;
const S4_REGEX = /^[ ]*(\%####) [ |\_]*([^\_|\n]*)/;
const S5_REGEX = /^[ ]*(\%#####) [ |\_]*([^\_|\n]*)/;
const S6_REGEX = /^[ ]*(\%######) [ |\_]*([^\_|\n]*)/;
const S7_REGEX = /^[ ]*\@(\w*)[ ]*{[ ]*([^\,]*)/;


const SEADING_REGEXES = [S1_REGEX, S2_REGEX, S3_REGEX, S4_REGEX, S5_REGEX, S6_REGEX, S7_REGEX];


let SEADING_REGEX = /(?:^[ ]*(\%#) [ |\_]*([^\_|\n]*)|^[ ]*(\%##) [ |\_]*([^\_|\n]*)|^[ ]*(\%###) [ |\_]*([^\_|\n]*)|^[ ]*(\%####) [ |\_]*([^\_|\n]*)|^[ ]*(\%#####) [ |\_]*([^\_|\n]*)|^[ ]*(\%######) [ |\_]*([^\_|\n]*)|^[ ]*\@(\w*)[ ]*{[ ]*([^\,]*))/
// const MEADING_REGEX = /(\\((sub)*)section\*?){(.*)}/g;
class BibModel extends AbstractModel {
  constructor(editorOrBuffer) {
    super(editorOrBuffer, SEADING_REGEX);
  }

  getRegexData(scanResult) {
    let level = 0;
    let label = '';
    let heading = scanResult[0];
    heading = heading.trim();
    // Skip result if line is commented out.

    for (let regex of SEADING_REGEXES) {
      level += 1;
      if (level <= this.maxDepth) {
        let subresult = regex.exec(heading);
        if (subresult) {
		  if (level==7) {
			label = '@' + subresult[1] +': '+subresult[2];
		  } else {
			label = subresult[2];
		  }
          break;
        }
      }
    }

    return {
      level: level,
      label: label
    };
  }
}

module.exports = {BibModel}
