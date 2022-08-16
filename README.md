A JavaScript library for editing PDF files. The files in dist/ are distributed
under the AGPL - see LICENSE.md. Check if you need a commercial license.

https://www.coherentpdf.com/

For commercial licenses, email contact@coherentgraphics.co.uk

Use
---

cpdf.js can be used from both node and the browser.

The file cpdflibtest.js uses every function in cpdf.js. Call ./run to run it in
node.

In the dist/ directory:

For development server-side with node: cpdf.js (minified version cpdf.min.js)

Load with "const cpdf = require('cpdf.js')" if installed in npm, or "const cpdf
= require('./cpdf.js')" to load from current directory.

For development client-side with the browser : cpdf.browser.js

(Minified version for deployment : cpdf.browser.min.js)

Load with <script src="cpdf.browser.js"></script> or similar.


Documentation
-------------

1. cpdfjsmanual.pdf contains the API documentation interleaved with the cpdf.js
   API. This is the primary source of documentation:

   https://coherentpdf.com/cpdfjsmanual.pdf

   The command line tools can be found at:

   https://community.coherentpdf.com/

2. API documentation online at https://www.coherentpdf.com/jscpdf/index.html


Concurrency
-----------

cpdf.js is synchronous and non-re-entrant.


Data types
----------

Arguments are numbers, strings, or arrays (of type UInt8Array for data). Page
ranges are represented by arrays of numbers.


Memory Management
-----------------

A PDF p must be explicitly deallocated with deletePdf(p).


Errors
------

Any function may raise an exception, containing a string describing the problem. 


Examples
--------

Server-side: cpdflibtest.js tests every function in cpdf.js.

Client-side: index.html is an interactive browser example. You will need to run
this from a real server, for example http-server, rather than just loading
index.html directly.


Contact
-------

https://www.coherentpdf.com/

For commercial licenses, email contact@coherentgraphics.co.uk
