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
