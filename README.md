cpdf.js
=======

JavaScript PDF library built by compiling CamlPDF+CPDF+cpdflib with
`js_of_ocaml`.


Use
===

For development server-side with node: cpdf.js / cpdflib.js

(Minified versions cpdf.min.js and cpdflib.min.js)

Load with "const cpdf = require('cpdf.js')" if installed in npm, or "const cpdf
= require('./cpdf.js')" to load from current directory.

For development client-side with the browser : cpdf.browser.js

(Minified version for deployment : cpdf.browser.min.js)

Load with <script src="cpdf.browser.js"></script> or similar.


Documentation
=============

1. cpdfjsmanual.pdf in this directory contains the API documentation
   interleaved with the cpdf.js API. This is the primary source of
   documentation. The command line tools can be found at:

   https://community.coherentpdf.com/

2. API documentation online at

3. Or read cpdfsource.js manually


Examples
========

Server-side: cpdflibtest.js tests every function in cpdf.js.

Client-side: index.html is an interactive browser example.


Building
========

See ./build to build (requires other repositories to be downloaded). Then "make
distrib" to build. Run ./run to test.


Expected test output differences compared with other cpdflib implementations
============================================================================

1. 03rotatecontents.pdf
   08stampee\_after.pdf

   Last digit of floating point number differs by one. Difference in libc/js
   float rounding.

2. 01tofileext.pdf
   05squeezedinmemory.pdf
   17draft.pdf

   Differing zlib compression libraries.


Contact
=======

contact at coherentgraphics.co.uk
