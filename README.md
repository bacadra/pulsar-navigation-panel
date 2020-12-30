# navigation-pane

Create custom list of sections.

## Sections panel

Package offer custom panel to show navigation tree.

## Available markers

* Python:
  * 1-9: `^([^#\n]*)#\${1,9}([spv]?)#(.*)`
  * e.g.: `#$$ comment lvl 1`
  * e.g.: `#$$$ comment lvl 2`
  * e.g.: `print('somethink') #$# lvl 1`
  * e.g.: `print('somethink') #$$# lvl 2`
* Markdown:
  * 1-9: `^ *#{1,9}`
  * e.g.: `# heading 1`
  * e.g.: `## heading 21`
* SOFiSTiK:
  * 1-5: `([^!\n]*)!\${1,5}!(.*)`
  * 6: `^(!.!chapter) +=*([^=\n]*)`
  * 7: `^ *(.?prog +[^ \n]*)(?:.*\nhead +(.+))?`
  * 8: `(!.! +.*`
* LaTeX:
  * 1-5: `([^%\n]*)%\${1,5}%(.*)`
  * 6: `^[^\%\n]*(?:\\part\*?)(?:\[.*\])?{([^}]*`
  * 7: `^[^\%\n]*(?:\\chapter\*?)(?:\[.*\])?{([^}]*`
  * 8: `^[^\%\n]*(?:\\section|frametitle\*?)(?:\[.*\])?{([^}]*`
  * 9: `^[^\%\n]*(?:\\subsection|framesubtitle\*?)(?:\[.*\])?{([^}]*`
  * 10: `^[^\%\n]*(?:\\subsubsection\*?)(?:\[.*\])?{([^}]*`
  * 11: `^[^\%\n]*(?:\\paragraph\*?)(?:\[.*\])?{([^}]*`
  * 12: `^[^\%\n]*(?:\\subparagraph\*?)(?:\[.*\])?{([^}]*`
* BibTeX:
  * 1-5: `/([^%\n]*)%\${1,5}%.*/i`
  * 6: `^[ ]*\@.`


## Highlight section

Section can be highlated. The default is line background highligth, but in can change to border or another css effect.


## Section folding

There are function which provide fold, unfold or toggle sections following by the headers markers. The special future is to collapse all section to create view like table of content.

## TODO

* to overwrite default outline paste this lines in `package.json` -- make it automatic:
```json
"providedServices": {
  "outline-view": {"versions": {"0.1.0": "provideOutlines"}}
},
```

# See also

* [bacadra-atom](https://github.com/bacadra/bacadra-atom)
* [bib-finder](https://github.com/bacadra/bib-finder)
* [fold-section](https://github.com/bacadra/fold-section)
* [hydrogen-run](https://github.com/bacadra/hydrogen-run)
* [image-paste](https://github.com/bacadra/image-paste)
* [language-bacadra](https://github.com/bacadra/language-bacadra)
* [language-sofistik](https://github.com/bacadra/language-sofistik)
* [navigation-pane](https://github.com/bacadra/navigation-pane)
* [sofistik-atom](https://github.com/bacadra/sofistik-atom)
* [word-map](https://github.com/bacadra/word-map)
