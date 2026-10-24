# Rust

> language: "rust"

Line comments, including doc comments (`///` and `//!`). The content of comments is
treated as Markdown.

    // aaa bbb      ¦  ->  // aaa bbb ccc  ¦
    // ccc          ¦

    /// aaa bbb     ¦  ->  /// aaa bbb ccc ¦
    /// ccc         ¦

Different kinds of comment on adjacent lines are kept apart.

    // aaa          ¦  ->  // aaa          ¦
    /// bbb         ¦      /// bbb ccc     ¦
    /// ccc         ¦

Block comments ([#42](https://github.com/dnut/Rewrap/issues/42)), including doc comments
(`/** */` and `/*! */`).

    /* aaa bbb ccc ddd */  ->  /* aaa bbb ccc  ¦
                    ¦          ddd */          ¦

    /*              ¦  ->  /*              ¦
     * aaa          ¦       * aaa bbb      ¦
     * bbb          ¦       */             ¦
     */             ¦

    /**             ¦  ->  /**             ¦
     * aaa          ¦       * aaa bbb      ¦
     * bbb          ¦       */             ¦
     */             ¦

    /*! aaa bbb ccc ddd */  ->  /*! aaa bbb ccc ¦
                    ¦            * ddd */       ¦

`/**/` is an empty comment, not the start of a doc comment.

    /**/            ¦  ->  /**/            ¦
    fn a() {}       ¦      fn a() {}       ¦
    // aaa          ¦      // aaa bbb      ¦
    // bbb          ¦

## Nested block comments

An inner `*/` does not end the outer comment. A cursor after the nested comment
still wraps the enclosing comment.

    /*                            ¦  ->  /*                            ¦
       /* inner */                ¦         /* inner */                ¦
                                  ¦                                    ¦
       «»aaa                                aaa bbb                    ¦
       bbb                        ¦      */                            ¦
    */                            ¦

Nesting can span multiple lines and mix ordinary and doc comments at several depths.

    /*!                           ¦    ->  /*!                           ¦
     * /* inner                   ¦         * /* inner /** deeper */     ¦
     *    /** deeper */           ¦         * */                         ¦
     * */                         ¦         *                            ¦
     *                            ¦         * aaa bbb                    ¦
     * «»aaa                                */                           ¦
     * bbb                        ¦        fn a() {}                     ¦
     */                           ¦
    fn a() {}                     ¦

Several delimiters on one line are counted too. Parsing resumes normally after the
outer comment ends.

    /* outer /* inner */ still outer */  ->  /* outer /* inner */ still    ¦
    // aaa                        ¦          outer */                      ¦
    // bbb                        ¦          // aaa bbb                    ¦
