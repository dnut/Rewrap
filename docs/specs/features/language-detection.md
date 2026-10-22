# Language Detection

The parser used for a document is chosen by its language ID (given by the editor). If
the language ID is empty or `plaintext`, the file name is used instead. If the language
ID isn't known, comment markers the editor knows for the language are used, so that just
comments are wrapped.

> language: "rewrap-test-unknown", path: "/a/b.xyz", lineComment: "#"

    # a        ¦      ->      # a b      ¦
    # b        ¦              x          ¦
    x          ¦              y          ¦
    y          ¦

## Markdown ##

Quarto and R Markdown documents are Markdown
([#54](https://github.com/dnut/Rewrap/issues/54),
[#40](https://github.com/dnut/Rewrap/issues/40)).

> language: "quarto", path: "/a/b.qmd", blockComment: "<!-- -->"

    # Title    ¦      ->      # Title    ¦
    a b c d e f g             a b c d e f¦
    h          ¦              g h        ¦

> language: "rmd", path: "/a/b.Rmd", blockComment: "<!-- -->"

    # Title    ¦      ->      # Title    ¦
    a b c d e f g             a b c d e f¦
    h          ¦              g h        ¦

This also works for new documents that don't have a file name yet.

> language: "quarto", blockComment: "<!-- -->"

    # Title    ¦      ->      # Title    ¦
    a b c d e f g             a b c d e f¦
    h          ¦              g h        ¦

> language: "rmd", blockComment: "<!-- -->"

    # Title    ¦      ->      # Title    ¦
    a b c d e f g             a b c d e f¦
    h          ¦              g h        ¦
