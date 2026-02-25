<!-- This part has to be written in HTML, because doing it in markdown puts the content in
a <p>, which adds unwanted margins. It has to be in a table so it can be right-aligned on
GitHub. For GitHub we can't get rid of the border on the td nor make the font smaller as
we want-->
<table class="topright" align="right" style="font-size:90%;width:auto;margin:0;border:none">
<tr style="border:none"><td align="right" style="border:none">
For <a href="https://marketplace.visualstudio.com/items?itemName=dnut.rewrap-revived"><b>VS Code</b></a>,
<a href="https://open-vsx.org/extension/dnut/rewrap-revived"><b>Open VSX</b></a> and
<a href="https://marketplace.visualstudio.com/items?itemName=stkb.Rewrap-18980">
  <b>Visual Studio</b></a>.<br/>
Latest stable version <b>1.16.3</b> / pre-release <b>17.x</b> /
<a href="https://github.com/dnut/rewrap/releases">changelog</a>
</td></tr></table>


<h1 style="font-size: 2.5em">Rewrap Revived</h1>

Rewrap Revived is a Visual Studio and VS Code extension that is used to hard-wrap code 
comments to a configured maximium line length. This is a fork of the unmaintained 
[Rewrap](https://github.com/stkb/Rewrap) extension by Steve Baker 
([@stkb](https://github.com/stkb)).

<br><img src="https://dnut.github.io/Rewrap/images/example.svg" width="700px"/><br/><br/>

The main Rewrap command is: <sn>**Rewrap Comment / Text**</sn>, by default bound to
`Alt+Q`. With the cursor in a comment block, hit this to re-wrap the contents to the
[specified wrapping column](https://dnut.github.io/Rewrap/configuration/#wrapping-column).

## Features

* Re-wrap comment blocks in many languages, with per-language settings.
* Smart handling of contents, including Java-/JS-/XMLDoc tags and code examples.
* Can select lines to wrap or multiple comments/paragraphs at once (even the whole
  document).
* Also works with Markdown documents, LaTeX or any kind of plain text file.

The contents of comments are usually parsed as markdown, so you can use lists, code
samples (which are untouched) etc:

<img src="https://dnut.github.io/Rewrap/images/example1.svg" width="700px"/>

<div class="hideOnDocsSite"><br/><b><a href="https://dnut.github.io/Rewrap/">
See the docs site for more info.</a></b></div>

## Installation

Rewrap Revived is available in both the
[Microsoft marketplace](https://marketplace.visualstudio.com/items?itemName=dnut.rewrap-revived)
and the [OpenVSX marketplace](https://open-vsx.org/extension/dnut/rewrap-revived).

**Please install the pre-release version**. That way, you can identify any bugs and report
them, so they don't make their way into the stable release. If you *do* observe a bug, then you
can switch to the stable release, and rest assured that the bug will not be introduced there,
since you have reported the issue (unless of course, it is already present in both releases).

## Contributing

To build and test locally, run `./do build` and `./do test`. See the
[contributing guide](docs/CONTRIBUTING.md) for full development workflow
documentation including prerequisites, manual testing, and publishing.
