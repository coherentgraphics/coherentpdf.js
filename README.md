coherentpdf.js
==============

A JavaScript library for editing PDF files. The files in `dist/` are distributed
under the AGPL - see LICENSE.md. Check if you need a commercial license.

[https://www.coherentpdf.com/](https://www.coherentpdf.com/)

For commercial licenses, email
[contact@coherentgraphics.co.uk](mailto:contact@coherentgraphics.co.uk)

Use
---

coherentpdf.js can be used from both node and the browser.

The file `cpdflibtest.js` uses every function in coherentpdf.js. Call `./run`
to run it in node.

In the `dist/` directory:

For development server-side with node: `coherentpdf.js` (minified version
`coherentpdf.min.js`). Load with `const coherentpdf = require('coherentpdf')`
if installed in npm, or `const coherentpdf = require('./coherentpdf.js')` to
load from current directory.

For development client-side with the browser : `coherentpdf.browser.js`
(minified version for deployment : `coherentpdf.browser.min.js`). Load with
`<script src="coherentpdf.browser.js"></script>` or similar.


Documentation
-------------

1. `cpdfjsmanual.pdf` contains the API documentation interleaved with the
   coherentpdf.js API. This is the primary source of documentation:

   [https://coherentpdf.com/cpdfjsmanual.pdf](https://coherentpdf.com/cpdfjsmanual.pdf)

   The command line tools can be found at:

   [https://community.coherentpdf.com/](https://community.coherentpdf.com/)

2. API documentation online at

   [https://www.coherentpdf.com/jscpdf/index.html](https://www.coherentpdf.com/jscpdf/index.html)


Data types
----------

Arguments are numbers, strings, or arrays (of type UInt8Array for data). Page
ranges are represented by arrays of numbers.


Memory Management
-----------------

A PDF `p` must be explicitly deallocated with `deletePdf(p)`.


Errors
------

Any function may raise an exception, containing a string describing the problem. 


Concurrency
-----------

coherentpdf.js is synchronous and non-re-entrant. In the browser, best used in
a worker.


Examples
--------

Server-side: `cpdflibtest.js` tests every function in coherentpdf.js.

Client-side: `index.html` is an interactive browser example with the worker
`cpdfworker.js`. You will need to run this from a real server, for example
`http-server`, rather than just loading `index.html` directly.


Contact
-------

[https://www.coherentpdf.com/](https://www.coherentpdf.com/)

For commercial licenses, email [contact@coherentgraphics.co.uk](mailto:contact@coherentgraphics.co.uk)
