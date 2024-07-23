coherentpdf.js
==============

A JavaScript library for editing PDF files. For example:

- Quality Split and Merge, keeping bookmarks. Extract pages. Split on Bookmarks.
- Impose files n-up
- Create new PDFs. Convert text files to PDF
- Losslessly squeeze files to reduce their size
- Encrypt and Decrypt (including AES 128 and AES 256 encryption)
- Read and set info and metadata from a PDF file. Set and read XMP Metadata.
- Scale, rotate, crop and flip pages. Scale pages to fit.
- Copy, Remove and Add bookmarks. Build table of contents from bookmarks.
- Stamp logos, shapes, watermarks, page numbers and multiline text. Transparency.
- List, copy or remove annotations
- Add and remove file attachments to document or page. Extract attachments.
- Thicken hairlines, blacken text, make draft documents
- Reconstruct malformed files
- Detect missing fonts, low resolution images. Remove images. Extract images.
- Add printer's marks
- Add, modify, remove, or print page labels.
- Export PDF file to / Import PDF file from JSON.
- Manipulate optional content groups

coherentpdf.js is distributed under the AGPL - see LICENSE.md. If you are unable
to abide by the terms of the AGPL, you will need a commercial license.

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
