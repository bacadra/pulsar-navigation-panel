# navigation-pane

![docface](https://github.com/bacadra/atom-navigation-pane/blob/master/pic-1.png?raw=true)

## Sections panel

Package offer custom panel to show navigation tree. The CSS can be customized.

## Highlight section

Section can be highlighted. The default is line background highlight, but in can change to border or any another by user styles.

The colors can be adjusted to user preference and ui/syntax theme in `styles.less`.

* e.g. all markers has highlighted background, but level 1, 2 and 3 has their own color
  ```
  .navigation-marker {
    background: rgba(233, 228, 141, 0.3);
  }
  .navigation-marker-1 {
    background: rgba(197, 218, 131, 0.3);
  }
  .navigation-marker-2 {
    background: rgba(250, 192, 209, 0.3);
  }
  .navigation-marker-3 {
    background: rgba(200, 197, 243, 0.3);
  }
  ```

* e.g. add top border to markers with level 1
  ```
  .navigation-marker-1 {
    border-top: 0.016px solid @text-color-info;
  }
  ```


## Section folding

There are functions which provide fold actions (fold, unfold or toggle) of sections. The special future is to collapse all section to create a view like table of content.


## ASCII scope

Global regular expression is `/^(=={0,5}|#\#{0,5})[ \t]+(.+?)(?:[ \t]+\1)?$/`.


## LaTeX scope

Global regular expression is `/[^%\n]*%\${1,5}% .*|^[^\%\n]*(?:\\(?:part|chapter|section|frametitle|subsection|framesubtitle|subsubsection|paragraph|subparagraph)\*?)(?:\[.*\])?{([^}]*)/`. The `\part{...}` is equal level 6.

* e.g. `%$% Countries`
* e.g. `%$$% United Kingdom`
* e.g. `\part{Resources}`


## BibTeX scope

Global regular expression is `/[^%\n]*%\${1,5}% (.*)|^[ ]*\@(\w*)[ ]*{[ ]*([^\,]*)/`. The `@` lines has lowest priority, equal to level 6.

* e.g. `%$% Bibliography about countries`
* e.g. `%$$% United Kingdom`
* e.g. `@book{jk2021, ...`


## Markdown scope

Global regular expression is `/^ *\#{1,5} (.*)/`. The level is defined as count of `#`.

* e.g. `# Countries`
* e.g. `## United Kingdom`


## Python scope

Global regular expression is `/^([^#\n]*)#(?:%%)?(\${1,9}[spv1]?|a)([\!\*-]?)#(.*)/` where count of `$` mean the level on list.

Additional letter can be used to provide additional parse effect:

* `s`: get only text from first string which occur in this line,
* `p`: python def or class; show only type and name of object
* `v`: variable; show only name of variable
* `1`: use only first word (split by whitespace), without optional after-colon

Additional letter can be used to provide additional visual effect:

* `*`: technical section
* `!`: important section
* `-`: add top border in tree

As special case you can use `#a#` which mean auto level base on pattern `<any>(<lvl as int>, "<text>"<any>)`. It is useful e.g. in PyLaTex or similar.

* e.g. `#$# Countries`
* e.g. `#$$# United Kingdom`
* e.g. `a = 5 #$$v#`
* e.g. `class MyCounty(Country): #$$p#`
* e.g. `document.section(1, 'Countries') #a!#`
* e.g. `document.section(2, 'United Kingdom') #a#`


## ReStructuredText scope

Global regular expression is `/^(.+)\n([!-/:-@[-[-~])\2+$/`.


## SOFiSTiK scope

Global regular expression is `/^ *(#define [^\n=]+$|#enddef)|[^!\n]*!\${1,5}!.*|^!.!chapter +=*[^=\n]*|^ *.?prog +[^\n]*(?:\n *head +(.+))?|!.! +.*/`.

* e.g. `!$ Design slab`
* e.g. `!$$ Req. reinforcement`
* e.g. `!+!Chapter Design`
* e.g. `+prog aqua`
* e.g. `+prog aqua \n head sections`
