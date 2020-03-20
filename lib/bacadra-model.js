const {AbstractModel} = require('./abstract-model');

// Possible regex to exclude commented lines
// ^(?:!%)*\s*
const H1_REGEX = /^ *#\$ [ |\_]*([^\_|\n]*)|(.*)#\$#/;
const H2_REGEX = /^ *#\$\$ [ |\_]*([^\_|\n]*)|(.*)#\$\$#/;
const H3_REGEX = /^ *#\$\$\$ [ |\_]*([^\_|\n]*)|(.*)#\$\$\$#/;
const H4_REGEX = /^ *#\$\$\$\$ [ |\_]*([^\_|\n]*)|(.*)#\$\$\$\$#/;
const H5_REGEX = /^ *#\$\$\$\$\$ [ |\_]*([^\_|\n]*)|(.*)#\$\$\$\$\$#/;
const H6_REGEX = /^ *#\$\$\$\$\$\$ [ |\_]*([^\_|\n]*)|(.*)#\$\$\$\$\$\$#/;
const H7_REGEX = /^ *#\$\$\$\$\$\$\$ [ |\_]*([^\_|\n]*)|(.*)#\$\$\$\$\$\$\$#/;
const H8_REGEX = /^ *(?:#t|#p) [ |\_]*([^\_|\n]*)/;


const HEADING_REGEXES = [
    H1_REGEX,
    H2_REGEX,
    H3_REGEX,
    H4_REGEX,
    H5_REGEX,
    H6_REGEX,
    H7_REGEX,
	H8_REGEX];



let COMBO_REGEX = '';

for (let regex of HEADING_REGEXES) {
  // Join the regexes together, adding wildcard to match whole line, which lets
  // us detect '%' comment marks later
  COMBO_REGEX = COMBO_REGEX + '(.*' + regex.source + ')|';
}
const HEADING_REGEX = new RegExp(COMBO_REGEX.slice(0, -1), 'gm');



class BacadraModel extends AbstractModel {
  constructor(editorOrBuffer) {
    super(editorOrBuffer, HEADING_REGEX);
    this.maxDepth += 1;
  }

  getRegexData(scanResult) {
    let level = 0;
    let label = '';
    let heading = scanResult[0];
    heading = heading.trim();
    // Skip result if line is commented out.
    // if (heading.startsWith("%")) {
    //   return;
    // }

    for (let regex of HEADING_REGEXES) {
      level += 1;
      if (level <= this.maxDepth) {
        let subresult = regex.exec(heading);
        if (subresult) {
 		  if (subresult[1] != null){
           label = subresult[1]
 		  } else {
 		  label = subresult[2]};
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

module.exports = {BacadraModel}
