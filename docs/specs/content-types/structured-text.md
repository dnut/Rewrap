# Structured Text

> language: "st"

IEC 61131-3 Structured Text ([#19](https://github.com/dnut/Rewrap/issues/19)). Line
comments, including doc comments (`///` and `//!`), and block comments (`(* *)` and
`/* */`, including doc comments `/** */` and `/*! */`). The content of comments is
treated as Markdown. Code is not wrapped.

    // aaa bbb      ¦  ->  // aaa bbb ccc  ¦
    // ccc          ¦      x := 1;         ¦
    x := 1;         ¦      y := 2;         ¦
    y := 2;         ¦

    /// aaa bbb     ¦  ->  /// aaa bbb ccc ¦
    /// ccc         ¦

    //! aaa bbb     ¦  ->  //! aaa bbb ccc ¦
    //! ccc         ¦

Different kinds of line comment on adjacent lines are kept apart.

    // aaa          ¦  ->  // aaa          ¦
    /// bbb         ¦      /// bbb ccc     ¦
    /// ccc         ¦

## Block comments

    (* aaa bbb        ¦  ->  (* aaa bbb ccc *) ¦
       ccc *)         ¦

    /* aaa bbb        ¦  ->  /* aaa bbb ccc */ ¦
       ccc */         ¦


Block comments are kept on separate lines if they started that way.

    (*              ¦  ->  (*              ¦
       aaa          ¦         aaa bbb      ¦
       bbb          ¦       *)             ¦
     *)             ¦

    /*              ¦  ->  /*              ¦
       aaa          ¦         aaa bbb      ¦
       bbb          ¦       */             ¦
     */             ¦

    /**             ¦  ->  /**             ¦
       aaa          ¦         aaa bbb      ¦
       bbb          ¦       */             ¦
     */             ¦

A `*` at the start of each line is kept in all kinds of block comment.

    (*              ¦  ->  (*              ¦
     * aaa          ¦       * aaa bbb      ¦
     * bbb          ¦       *)             ¦
     *)             ¦

    /*              ¦  ->  /*              ¦
     * aaa          ¦       * aaa bbb      ¦
     * bbb          ¦       */             ¦
     */             ¦

    /**             ¦  ->  /**             ¦
     * aaa          ¦       * aaa bbb      ¦
     * bbb          ¦       */             ¦
     */             ¦

If all the text is on the first line, lines added to a doc comment start with ` * `, and
lines added to other block comments don't.

    (* aaa bbb ccc ddd *)  ->  (* aaa bbb ccc  ¦
                    ¦          ddd *)          ¦

    /* aaa bbb ccc ddd */  ->  /* aaa bbb ccc  ¦
                    ¦          ddd */          ¦

    /** aaa bbb ccc ddd */  ->  /** aaa bbb ccc ¦
                    ¦            * ddd */       ¦

    /*! aaa bbb ccc ddd */  ->  /*! aaa bbb ccc ¦
                    ¦            * ddd */       ¦

## Language IDs

ST extensions use the language IDs `st` and `structured-text`. `iecst` is also
recognized.

> language: "structured-text"

    // aaa          ¦  ->  // aaa bbb      ¦
    // bbb          ¦      x := 1;         ¦
    x := 1;         ¦

> language: "iecst"

    // aaa          ¦  ->  // aaa bbb      ¦
    // bbb          ¦      x := 1;         ¦
    x := 1;         ¦

## File extensions

If the editor gives no language ID, or `plaintext`, files with the `.st` or `.iecst`
extension are treated as Structured Text, so their code isn't wrapped like plain text.

> language: "plaintext", path: "/a/b.st"

    // aaa          ¦  ->  // aaa bbb      ¦
    // bbb          ¦      x := 1;         ¦
    x := 1;         ¦      y := 2;         ¦
    y := 2;         ¦
