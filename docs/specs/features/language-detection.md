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

Editors give some kinds of Markdown file their own language ID. For example VS Code uses
`prompt` for `.prompt.md` files and `instructions` for `copilot-instructions.md`
([#46](https://github.com/dnut/Rewrap/issues/46)). Files with a Markdown extension and an
unknown language ID are still treated as Markdown, even if the editor knows comment
markers for the language.

> language: "prompt", path: "/a/b.prompt.md", blockComment: "<!-- -->"

    # Title    ¦      ->      # Title    ¦
    a b c d e f g             a b c d e f¦
    h          ¦              g h        ¦

> language: "instructions", path: "/a/.github/copilot-instructions.md", blockComment: "<!-- -->"

    # Title    ¦      ->      # Title    ¦
    a b c d e f g             a b c d e f¦
    h          ¦              g h        ¦

Quarto and R Markdown documents are Markdown too
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
