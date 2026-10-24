> language: "lua"

Line comment

    --a b c      ->      --a b ¦
    --d   ¦              --c d ¦
    z y x w              z y x w
    v u   ¦              v u   ¦

Block comment

    --[[                                      --[[
      a b c                           ->        a b ¦
      d   ¦                                     c d ¦
    ]]--  ¦                                   ]]--  ¦
    z y x w                                   z y x w
    v u   ¦                                   v u   ¦


Block comment markers can have any number or '='s in them as long as they match

    --[=[                                     --[=[
      a b c                           ->        a b ¦
      d   ¦                                     c d ¦
    ]=]-- ¦                                   ]=]-- ¦
    z y x w                                   z y x w
    v u   ¦                                   v u   ¦

    --[=====[                                 --[=====[
      a b c                           ->        a b ¦
      d   ¦                                     c d ¦
    ]=====]--                                 ]=====]--
    z y x w                                   z y x w
    v u   ¦                                   v u   ¦


Doc comments (`---`), as used by lua-language-server, are kept apart from other comments.
Lines with annotations (eg `---@param`) are never wrapped
([#35](https://github.com/dnut/Rewrap/issues/35)).

    ---aaa bbb      ¦      ->  ---aaa bbb ccc  ¦
    ---ccc          ¦          ---             ¦
    ---             ¦          ---@param aaa bbb ccc
    ---@param aaa bbb ccc      ---@return ddd  ¦
    ---@return ddd  ¦          -- eee fff      ¦
    -- eee          ¦
    -- fff          ¦

A wrapped doc comment line keeps its `---` prefix.

    ---aaa bbb ccc ddd  ->  ---aaa bbb ccc  ¦
                    ¦       ---ddd          ¦

Annotation continuations (`---|`) keep their line breaks, even with descriptions or
lines longer than the wrapping column. Ordinary doc text can still be wrapped.

    ---@alias Mode                                    ¦                 ->  ---@alias Mode                                    ¦
    ---| "read" # Read files                          ¦                     ---| "read" # Read files                          ¦
    ---| "write" # Write files                        ¦                     ---| "write" # Write files                        ¦
    --- | "append" # Append data without overwriting existing contents      --- | "append" # Append data without overwriting existing contents
    ---                                               ¦                     ---                                               ¦
    ---More                                           ¦                     ---More text                                      ¦
    ---text                                           ¦
