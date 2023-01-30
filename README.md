# navigation-panel

![docface](https://github.com/bacadra/atom-navigation-panel/blob/master/assets/docface.png?raw=true)

## Installation

The official [Atom packages store](https://atom.io/packages) has been disabled. To get latest version run the shell command

    apm install bacadra/atom-navigation-panel

and obtain the package directly from Github repository.

The package has compability with [Pulsar](https://pulsar-edit.dev/) and can be install

    pulsar -p install bacadra/atom-navigation-panel

## Sections panel

This package provide the panel with navigation through custom symbols in text editors. The items of tree are created manually by inserting special marks into text editor. Multiple scopes are supported (see below) with their own marker system. You can open or hide panel by commands `navigation-panel:open` and `navigation-panel:hide`, optionally use `navigation-panel:toggle`. Package has fully support multiple cursors.

## Real section level

The package introduces the concept of multi-level headers. The user enters a tag with a level, which indicates **the maximum level** of the text associated with a given tag. The true level of the header will be determined when building the header tree using the rule that the header can have a level at most one greater than its predecessor. For example, if you enter a level 1 heading, then a level 2 heading, then a level 5 heading, then the real level of the last heading will be 3. The marker designations are for real headers. The real section level is use everywhere instead of user level.

## Highlight section

For each header, the package can create a marker to highlight the line text in the editor. The marker style can be customized.

## Categories

Mark headers by categories. The categories can be filtered in bottom bar of panel, context menu of panel or by command. The categories are predefined: info, success, warning, error. The meaning of the categories depends on the creativity of the user, use them as you like.

The settings of categories can be changed globally in package settings or locally by commands or in panel:

* `navigation-panel:all-categories`: activate all categories,
* `navigation-panel:none-categories`: deactivate all categories,
* `navigation-panel:categories-toggle`: toggle all categories,
* `navigation-panel:info-toggle`: toggle info category headers,
* `navigation-panel:success-toggle`: toggle success category headers,
* `navigation-panel:warning-toggle`: toggle warning category headers,
* `navigation-panel:error-toggle`:  toggle error category headers,
* `navigation-panel:standard-toggle`:  toggle category-less headers.

## Collapse modes

Elements of the header tree can be collapsed. This can improve workflow or document clarity. The global settings can be changed in package settings and local settings by context-menu of panel of by commands:

* `navigation-panel:collapse-mode`: collapse all headers now and if rebuilding,
* `navigation-panel:expand-mode`: uncollapse all headers now and if rebuilding,
* `navigation-panel:auto-collapse`: expand only active headers.

## Section folding

There are functions which provide fold actions (fold, unfold or toggle) of sections. The special future is to collapse all section a view like table of content. You may be interested in following commands:

* `navigation-panel:fold-toggle`: toggle fold of current section,
* `navigation-panel:fold-section`: fold current section,
* `navigation-panel:fold-section-at-n`: fold last section at level *n*,
* `navigation-panel:fold-as-table`: fold all section but in nested form,
* `navigation-panel:fold-all-infos`: fold as table, but only headers with category `info`,
* `navigation-panel:fold-all-successes`: fold as table, but only headers with category `success`,
* `navigation-panel:fold-all-warnings`: fold as table, but only headers with category `warning`,
* `navigation-panel:fold-all-errors`: fold as table, but only headers with category `error`,
* `navigation-panel:unfold`: unfold current section,
* `navigation-panel:unfold-all`: unfold all sections.

## regex testing

In order to search for markers in a text editor, all lines of the editor are tested by global regular expressions. If the global expression returns a positive search result, the matched lines are further prepared. Global expressions can be found below, different for each scope.

You can test and analyze regex's below at [regex101](https://regex101.com/). Just select flavor as `ECMAScript (JavaScript)` and paste statement.

## Customize the appearance

The panel can be adapted to the user's needs in many ways. Several options are outlined below. The colors can be adjusted to user preference and ui/syntax theme in `styles.less` (File/Stylesheet..).

* e.g. all markers has highlighted background, but level 1, 2 and 3 has their own color:
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

* e.g. add top border to markers with level 1:
  ```
  .navigation-marker-1 {
    border-top: 0.016px solid @text-color-info;
  }
  ```

* change font to monospace (or any other...):
  ```
  .navigation-panel {
    font-family: monospace;
  }
  ```

# Supported scopes

## ASCII

Global regular expression is `^(=={0,5}|#\#{0,5})[ \t]+(.+?)(?:[ \t]+\1)?$`.

## LaTeX

Global regular expression is `([^%\n]*)%(\$+)([\*\+\-\!\_]?)%(.*)|^[^\%\n]*\\(part*?|chapter*?|section*?|subsection*?|subsubsection*?|paragraph*?|subparagraph*?)\*?(?:\[(.*)\])?{(.*)}`. The `\part{...}` is equal level 4, `\chapter{...}` is level 5 etc. The section commands can be changed in package settings.

* e.g. `%$!% Countries` -> `1. Countries` with error category
* e.g. `%$$% United Kingdom` -> `1.1. United Kingdom`
* e.g. `\part{Resources}` -> `1.1.1.1. Resources`
* e.g. `\part[Resources]{Resources but to long to TOC}` -> `1.1.1.1. Resources`

In case of `([^%\n]*)%(\$+)%(.*)`, the additional letter can be used to provide additional visual effect:

* `*`: info category
* `+`: sucess category
* `-`: warning category
* `!`: error category
* `_`: separator category

## BibTeX

Global regular expression is `([^%\n]*)%(\$+)([\*!-]?)%(.*)|^[ ]*\@(\w*)[ ]*{[ ]*([^\,]*)`. The `@<type>{<text>,` is level 6.

* e.g. `%$% Bibliography about countries` -> `1. Bibliography about countries`
* e.g. `%$$% United Kingdom` -> `1.1. United Kingdom`
* e.g. `@book{jk2021, ...` -> `1.1.1.1.1.1. jk2021`

Additional letter can be used to provide additional visual effect:

* `*`: info category
* `+`: sucess category
* `-`: warning category
* `!`: error category
* `_`: separator category

## Markdown

Global regular expression is `^ *(\#+) (.*)`. The level is defined as count of `#`. The number of levels is endless.

* e.g. `# Countries` -> `1. Countries`
* e.g. `## United Kingdom` -> `1.1. United Kingdom`

## Python

Global regular expression is `^([^#\n]*)#(?:%%)?(\$+[spv1]?|\?)([\*\+\-\!\_]?)#(.*)` where count of `$` mean the level on list.

Additional letter can be used to provide additional parse effect:

* `s`: get only text from first string which occur in this line
* `p`: python def or class; show only type and name of object
* `v`: variable; show only name of variable
* `1`: use only first word (split by whitespace), without optional after-colon

Additional letter can be used to provide additional visual effect:

* `*`: info category
* `+`: sucess category
* `-`: warning category
* `!`: error category
* `_`: separator category

As special case you can use `#?#` or `#?<category>#` which mean auto level base on pattern `<any>(<lvl as int>, "<text>"<any>)`. It is useful e.g. in PyLaTex or similar.

* e.g. `#$# Countries` -> `1. Countries`
* e.g. `#$$# United Kingdom` -> `1.1. United Kingdom`
* e.g. `a = 5 #$$v#` -> `1.1. a`
* e.g. `class MyCounty(Country): #$$p#` -> `1.1. MyCounty`
* e.g. `document.section(1, 'Countries') #?!#` -> `1. Countries`
* e.g. `document.section(2, 'United Kingdom') #?+#` -> `1.1. United Kingdom` with sucess category
* e.g. `document.section(2, 'United Kingdom') #?!#` -> `1.1. United Kingdom` with error category

## ReStructuredText

Global regular expression is `^(.+)\n([!-/:-@[-[-~])\2+$`.

## SOFiSTiK

Global regular expression is `^ *(#define [^\n=]+$|#enddef)|(^(?! *\$)[^!\n]*)!(\$+)!(.*)|^!.!chapter +(.*)|^ *(.)?prog +([^\n]*)(?:\n *head +(.+))?|^ *!.! +(.*)|^\$ graphics +(\d+) +\| +picture +(\d+) +\| +layer +(\d+) +: *(.*)`. The chapter is level 4, prog is level 5 and label is level 6.

* e.g. `!$! Design slab` -> `1. Design slab`
* e.g. `!$$! Req. reinforcement` -> `1.1. Req. reinforcement`
* e.g. `!+!Chapter Design` -> `1.1.1.1. Design`
* e.g. `+prog aqua` -> `1.1.1.1.1. aqua`
* e.g. `+prog aqua \n head sections` -> `1.1.1.1.1.1. aqua: head sections`

## pdf-viewer

The package support the outline tree of [pdf-viewer](https://github.com/bacadra/atom-pdf-viewer). You can search through document by all-in outline tree instead of PDFjs outline.

# Contributing

If you have ideas on how to improve the package, see bugs or want to support new features - feel free to share it via GitHub.

See my other packages for Atom Editor:

* [autocomplete-sofistik](https://github.com/bacadra/atom-autocomplete-sofistik)
* [bib-finder](https://github.com/bacadra/atom-bib-finder)
* [hydrogen-run](https://github.com/bacadra/atom-hydrogen-run)
* [image-paste](https://github.com/bacadra/atom-image-paste)
* [language-sofistik](https://github.com/bacadra/atom-language-sofistik)
* [navigation-panel](https://github.com/bacadra/atom-navigation-panel)
* [open-external](https://github.com/bacadra/atom-open-external)
* [pdf-viewer](https://github.com/bacadra/atom-pdf-viewer)
* [project-files](https://github.com/bacadra/atom-project-files)
* [regex-aligner](https://github.com/bacadra/atom-regex-aligner)
* [sofistik-tools](https://github.com/bacadra/atom-sofistik-tools)
* [super-select](https://github.com/bacadra/atom-super-select)
* [word-map](https://github.com/bacadra/atom-word-map)
