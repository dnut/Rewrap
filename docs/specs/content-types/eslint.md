# ESLint Directives

JavaScript and TypeScript ESLint directives must remain on a single line to preserve their
effect, so Rewrap does not wrap them.


## Line Comments

> language: javascript

    // eslint-disable-next-line @typescript-eslint/no-base-to-string -- ModuleSource returns    ->    // eslint-disable-next-line @typescript-eslint/no-base-to-string -- ModuleSource returns
    nextLoad(url).source    ¦                                                                         nextLoad(url).source    ¦

> language: typescript

    // eslint-disable-line @typescript-eslint/no-base-to-string -- ModuleSource returns         ->    // eslint-disable-line @typescript-eslint/no-base-to-string -- ModuleSource returns
    nextLoad(url).source    ¦                                                                         nextLoad(url).source    ¦

    // eslint-disable no-console, @typescript-eslint/no-base-to-string -- temporary exception   ->    // eslint-disable no-console, @typescript-eslint/no-base-to-string -- temporary exception
    nextLoad(url).source    ¦                                                                         nextLoad(url).source    ¦

    // eslint-enable no-console, @typescript-eslint/no-base-to-string -- restore lint checks    ->    // eslint-enable no-console, @typescript-eslint/no-base-to-string -- restore lint checks
    nextLoad(url).source    ¦                                                                         nextLoad(url).source    ¦

    // Some comment text    ¦                                                                   ->    // Some comment text    ¦
    // eslint-disable-next-line @typescript-eslint/no-base-to-string -- more comment text             // eslint-disable-next-line @typescript-eslint/no-base-to-string -- more comment text
    nextLoad(url).source    ¦                                                                         nextLoad(url).source    ¦


## Block Comments

> language: javascript

    /* eslint-disable no-console, @typescript-eslint/no-base-to-string -- temporary exception */    ->   /* eslint-disable no-console, @typescript-eslint/no-base-to-string -- temporary exception */
    nextLoad(url).source    ¦                                                                            nextLoad(url).source    ¦

    /* eslint-enable no-console, @typescript-eslint/no-base-to-string -- restore lint checks */     ->   /* eslint-enable no-console, @typescript-eslint/no-base-to-string -- restore lint checks */
    nextLoad(url).source    ¦                                                                            nextLoad(url).source    ¦

    /*                      ¦                                                                       ->   /*                      ¦
     * Some comment text    ¦                                                                             * Some comment text    ¦
     * eslint-disable no-console -- more comment text                                                     * eslint-disable no-console -- more comment text
     */                     ¦                                                                             */                     ¦
    nextLoad(url).source    ¦                                                                            nextLoad(url).source    ¦
