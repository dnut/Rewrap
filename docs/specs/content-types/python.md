# Python

> language: "python"

Whole paragraphs of text can be written between triple " or '

    """ ¦      ->      """ ¦
    a b c              a b ¦
    d   ¦              c d ¦
    """ ¦              """ ¦

    ''' ¦      ->      ''' ¦
    a b c              a b ¦
    d   ¦              c d ¦
    ''' ¦              ''' ¦

''' Could appear inside a """-block and vice-versa.

    """ ¦      ->      """ ¦
    a b c              a b ¦
    d   ¦              c d ¦
    ''' ¦              ''' ¦
    a   ¦              a b ¦
    b   ¦              """ ¦
    """ ¦

    ''' ¦      ->      ''' ¦
    a b c              a b ¦
    d   ¦              c d ¦
    """ ¦              """ ¦
    a   ¦              a b ¦
    b   ¦              ''' ¦
    ''' ¦

Triple-quoted strings can be preceded with a character. Valid combinations are
b, f, r, u, br, rb, fr, rf, and with any comnbination of upper and lower case.

    b"""      ->       b"""¦
    a b c              a b ¦
    d   ¦              c d ¦
    """ ¦              """ ¦

    f"""      ->       f"""¦
    a b c              a b ¦
    d   ¦              c d ¦
    """ ¦              """ ¦

    r'''      ->       r'''¦
    a b c              a b ¦
    d   ¦              c d ¦
    ''' ¦              ''' ¦

    u'''      ->       u'''¦
    a b c              a b ¦
    d   ¦              c d ¦
    ''' ¦              ''' ¦

    fr"""     ->       fr"""
    a b c              a b ¦
    d   ¦              c d ¦
    """ ¦              """ ¦

    rF'''     ->       rF'''
    a b c              a b ¦
    d   ¦              c d ¦
    ''' ¦              ''' ¦

    Br"""     ->       Br"""
    a b c              a b ¦
    d   ¦              c d ¦
    """ ¦              """ ¦


    RB'''     ->       RB'''
    a b c              a b ¦
    d   ¦              c d ¦
    ''' ¦              ''' ¦

Starting the string later on the line is also (imperfectly) supported.

    var = """¦     ->    var = """
    a b c d e f          a b c d e
    g h      ¦           f g h    ¦
    """      ¦           """      ¦
    i        ¦           i        ¦
    j        ¦           j        ¦

Imperfectly, because it's not a full language parser.

When the first line of a docstring wraps, the opening quotes are not repeated on the
new line. The new line gets the same indent as the body text of the docstring
([#10](https://github.com/dnut/Rewrap/issues/10)), or that of the opening quotes if
there is none.

    ····"""Aaa bbb ccc ddd      ->      ····"""Aaa bbb ¦
                   ¦                    ····ccc ddd    ¦
    ····Eee.       ¦                                   ¦
    ····"""        ¦                    ····Eee.       ¦
                                        ····"""        ¦

    ····"""Aaa bbb ccc ddd      ->      ····"""Aaa bbb ¦
    ····"""        ¦                    ····ccc ddd    ¦
                                        ····"""        ¦

    ····r"""Aaa bbb ccc ddd     ->      ····r"""Aaa bbb ¦
                    ¦                   ········ccc ddd ¦
    ········Eee.    ¦                                   ¦
    ····"""         ¦                   ········Eee.    ¦
                                        ····"""         ¦

This also holds when only the first line is selected
([#22](https://github.com/dnut/Rewrap/issues/22)).

    «"""Aaa bbb ccc ddd»      ->      """Aaa bbb ¦
               ¦                      ccc ddd    ¦
    Eee.       ¦                                 ¦
    """        ¦                      Eee.       ¦
                                      """        ¦

A backslash right after the opening quotes (a line continuation, so the string doesn't
start with a line break) stays on the first line
([#50](https://github.com/dnut/Rewrap/issues/50)).

    TEST = """\     ¦  ->  TEST = """\     ¦
    aaa bbb         ¦      aaa bbb ccc     ¦
    ccc             ¦      """             ¦
    """             ¦

Strings on one line are wrapped too,

    var = """a b c"""      ->      var = """a b
    x x x x x x                          c"""  ¦
                ¦                  x x x x x x

Though these should maybe be left alone in a large (eg whole-document)
selection, and only wrapped if explicitly asked


## reStructuredText

The content of Python docstrings is reStructuredText.

    """                 ¦                     """                 ¦
    :Author: Me         ¦                     :Author: Me         ¦
    :version: 1         ¦                     :version: 1         ¦
                        ¦                                         ¦
    term                ¦                     term                ¦
        definition      ¦              ->         definition text ¦
        text text       ¦                         text            ¦
                        ¦                                         ¦
    ::                  ¦                     ::                  ¦
                        ¦                                         ¦
      literal           ¦                       literal           ¦
      block             ¦                       block             ¦
    """                 ¦                     """                 ¦


## Google style docstrings

In sections of items in [Google style](https://google.github.io/styleguide/pyguide.html#38-comments-and-docstrings)
docstrings (`Args:`, `Raises:` etc.), each item starts on a new line. Lines indented
further than an item continue it, and are indented further when it's wrapped
([#26](https://github.com/dnut/Rewrap/issues/26)).

    """                           ¦  ->  """                           ¦
    Aaa bbb                       ¦      Aaa bbb ccc.                  ¦
    ccc.                          ¦
                                  ¦      Args:                         ¦
    Args:                         ¦          x (int): Ddd.             ¦
        x (int): Ddd.             ¦          y (str): Eee.             ¦
        y (str): Eee.             ¦
                                  ¦      Returns:                      ¦
    Returns:                      ¦          int: Fff.                 ¦
        int: Fff.                 ¦      """                           ¦
    """                           ¦

    """                 ¦         ->  """                 ¦
    Args:               ¦             Args:               ¦
        x (int): Aaa bbb ccc ddd          x (int): Aaa bbb¦
        y: Eee          ¦                     ccc ddd     ¦
            fff         ¦                 y: Eee fff      ¦
        **kwargs: Ggg   ¦                 **kwargs: Ggg   ¦
    Raises:             ¦             Raises:             ¦
        ValueError: Hhh ¦                 ValueError: Hhh ¦
    """                 ¦             """                 ¦

An item's description is normal reStructuredText, so it can contain other blocks, which as
elsewhere are separated from its first paragraph by a blank line.

    """                               ¦  ->  """                               ¦
    Args:                             ¦      Args:                             ¦
        mode (str): The mode,         ¦          mode (str): The mode, one of: ¦
            one of:                   ¦                                        ¦
                                      ¦              - a: Aaa                  ¦
            - a: Aaa                  ¦              - b: Bbb                  ¦
            - b: Bbb                  ¦                                        ¦
                                      ¦              >>> f(mode)               ¦
            >>> f(mode)               ¦              1                         ¦
            1                         ¦          x: Ccc.                       ¦
        x: Ccc.                       ¦      """                               ¦
    """                               ¦

    """                           ¦  ->  """                           ¦
    Args:                         ¦      Args:                         ¦
        x: For example::          ¦          x: For example::          ¦
                                  ¦                                    ¦
            foo(1) bar(2)         ¦              foo(1) bar(2)         ¦
            baz(3)                ¦              baz(3)                ¦
    """                           ¦      """                           ¦

The description can start on the line after the item's name.

    """                 ¦     ->  """                 ¦
    Args:               ¦         Args:               ¦
        config:         ¦             config:         ¦
            Aaa bbb ccc ddd.              Aaa bbb ccc ¦
    """                 ¦                 ddd.        ¦
                                  """                 ¦

As in Sphinx's napoleon extension, section names aren't case sensitive, there can be blank
lines after the header, and `Raise`, `Receive` and `Warn` (and their plurals) are also
section names.

    """                               ¦  ->  """                               ¦
    raise:                            ¦      raise:                            ¦
                                      ¦                                        ¦
        ValueError: Aaa               ¦          ValueError: Aaa               ¦
        TypeError: Bbb                ¦          TypeError: Bbb                ¦
    """                               ¦      """                               ¦

NumPy style docstrings are already handled as reStructuredText.

    """                 ¦  ->  """                 ¦
    Parameters          ¦      Parameters          ¦
    ----------          ¦      ----------          ¦
    x : int             ¦      x : int             ¦
        Aaa             ¦          Aaa bbb.        ¦
        bbb.            ¦      y : str             ¦
    y : str             ¦          Ccc.            ¦
        Ccc.            ¦      """                 ¦
    """                 ¦
