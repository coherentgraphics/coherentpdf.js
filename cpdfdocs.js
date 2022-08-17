// CHAPTER -1: Introduction

/**
Use
---

coherentpdf.js can be used from both node and the browser.

The file `cpdflibtest.js` uses every function in coherentpdf.js. Call `./run`
to run it in node.

For development server-side with node: `coherentpdf.js` (minified version
`coherentpdf.min.js`). Load with `const coherentpdf = require('coherentpdf')`
if installed in npm, or `const coherentpdf = require('./coherentpdf.js')` to
load from current directory.

For development client-side with the browser : `coherentpdf.browser.js`
(minified version for deployment : `coherentpdf.browser.min.js`). Load with
`<script src="coherentpdf.browser.js"></script>` or similar.


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


Concurrency
-----------

coherentpdf.js is synchronous and non-re-entrant. In the browser, best used in a worker.
**/

// CHAPTER 0. Preliminaries

/** Returns a string giving the version number of the CPDF library.
@returns {string} version */
function version() {}

/** Some operations have a fast mode. The default is 'slow' mode, which works
even on old-fashioned files. For more details, see section 1.13 of the CPDF
manual. This function sets the mode to fast globally. */
function setFast() {}

/** Some operations have a fast mode. The default is 'slow' mode, which works
even on old-fashioned files. For more details, see section 1.13 of the CPDF
manual. This function sets the mode to slow globally. */
function setSlow() {}

/** Delete a PDF so the memory representing it may be recovered.
@arg {pdf} pdf PDF document to delete */
function deletePdf(pdf) {}

/* A debug function which prints some information about resource usage. This
can be used to detect if PDFs or ranges are being deallocated properly.
Contrary to its name, it may be run at any time. */
function onexit() {}

// CHAPTER 1. Basics

/** Loads a PDF file from a given file. Supply a user password (possibly blank)
in case the file is encrypted. It won't be decrypted, but sometimes the
password is needed just to load the file.
@arg {string} filename File name
@arg {string} userpw User password, or blank if none */
function fromFile(filename, userpw) {}

/** Loads a PDF from a file, doing only minimal parsing. The objects will be
read and parsed when they are actually needed. Use this when the whole file
won't be required. Also supply a user password (possibly blank) in case the
file is encrypted. It won't be decrypted, but sometimes the password is needed
just to load the file.
@arg {string} filename File name
@arg {string} userpw User password, or blank if none */
function fromFileLazy(filename, userpw) {}

/** Loads a file from memory given any user password.
@arg {Uint8Array} data PDF document as an array of bytes
@arg {string} userpw User password, or blank if none */
function fromMemory(data, userpw) {}

/** Loads a file from memory, given a pointer and a length, and the user
password, but lazily like fromFileLazy.
@arg {Uint8Array} data PDF document as an array of bytes
@arg {string} userpw User password, or blank if none */
function fromMemoryLazy(data, userpw) {}

/** To enumerate the list of currently allocated PDFs, call startEnumeratePDFs
which gives the number, n, of PDFs allocated, then enumeratePDFsInfo and
enumeratePDFsKey with index numbers from 0...(n - 1). Call endEnumeratePDFs to
clean up.
@return {number} number of PDFs */
function startEnumeratePDFs() {}

/** To enumerate the list of currently allocated PDFs, call startEnumeratePDFs
which gives the number, n, of PDFs allocated, then enumeratePDFsInfo and
enumeratePDFsKey with index numbers from 0...(n - 1). Call endEnumeratePDFs to
clean up.
@arg {n} index number
@return {number} PDF key */
function enumeratePDFsKey(n) {}

/** To enumerate the list of currently allocated PDFs, call startEnumeratePDFs
which gives the number, n, of PDFs allocated, then enumeratePDFsInfo and
enumeratePDFsKey with index numbers from 0...(n - 1). Call endEnumeratePDFs to
clean up.
@arg {n} index number
@return {number} PDF information */
function enumeratePDFsInfo(n) {}

/** To enumerate the list of currently allocated PDFs, call startEnumeratePDFs
which gives the number, n, of PDFs allocated, then enumeratePDFsInfo and
enumeratePDFsKey with index numbers from 0...(n - 1). Call endEnumeratePDFs to
clean up. */
function endEnumeratePDFs() {}

/** Converts a figure in centimetres to points (72 points to 1 inch)
@arg {number} i figure in centimetres
@return {number} figure in points */
function ptOfCm(i) {}

/** Converts a figure in millimetres to points (72 points to 1 inch)
@arg {number} i figure in millimetres
@return {number} figure in points */
function ptOfMm(i) {}

/** Converts a figure in inches to points (72 points to 1 inch)
@arg {number} i figure in inches
@return {number} figure in points */
function ptOfIn(i) {}

/** Converts a figure in points to centimetres (72 points to 1 inch)
@arg {number} i figure in points
@return {number} figure in centimetres */
function cmOfPt(i) {}

/** Converts a figure in points to millimetres (72 points to 1 inch)
@arg {number} i figure in points
@return {number} figure in millimetres */
function mmOfPt(i) {}

/** Converts a figure in points to inches (72 points to 1 inch)
@arg {number} i figure in points 
@return {number} figure in inches */
function inOfPt(i) {}

/** Parses a page specification with reference to a given PDF (the PDF is
supplied so that page ranges which reference pages which do not exist are
rejected).
@arg {pdf} pdf PDF document
@arg {string} pagespec Page specification
@return {array} page range */
function parsePagespec(pdf, pagespec) {}

/** Validates a page specification so far as is possible in the absence of
the actual document. Result is true if valid.
@arg {string} pagespec Page specification
@return {boolean} validity or otherwise of page specification */
function validatePagespec(pagespec) {}

/** Builds a page specification from a page range. For example, the range
containing 1,2,3,6,7,8 in a document of 8 pages might yield "1-3,6-end"
@arg {pdf} pdf PDF document
@arg {array} r Page range
@return {string} Page specifcation */
function stringOfPagespec(pdf, r) {}

/** Creates a range with no pages in.
@return {array} Page range */
function blankRange() {}

/** Builds a range from one page to another inclusive. For example, range(3,7)
gives the range 3,4,5,6,7
@arg {number} f begining of page range
@arg {number} t end of page range
@return {array} page range */
function range(f, t) {}

/** The range containing all the pages in a given document.
@arg {pdf} pdf PDF document
@return {array} page range */
function all(pdf) {}

/** Makes a range which contains just the even pages of another range.
@arg {array} r_in page range
@return {array} page range */
function even(r_in) {}

/** Makes a range which contains just the odd pages of another range.
@arg {array} r_in page range
@return {array} page range */
function odd(r_in) {}

/** Makes the union of two ranges giving a range containing the pages in range
a and range b.
@arg {array} a page range
@arg {array} b page range
@return {array} page range */
function rangeUnion(a, b) {}

/** Makes the difference of two ranges, giving a range containing all the
pages in a except for those which are also in b.
@arg {array} a page range
@arg {array} b page range
@return {array} page range */
function difference(a, b) {}

/** Deduplicates a range, making a new one.
@arg {array} a page range
@return {array} page range */
function removeDuplicates(a) {}

/** Gives the number of pages in a range.
@arg {array} r page range
@return {number} length */
function rangeLength(r) {}

/** Gets the page number at position n in a range, where n runs from 0 to
rangeLength - 1.
@arg {array} r page range
@arg {number} n position
@return {number} page at given position */
function rangeGet(r, n) {}

/** Adds the page to a range, if it is not already there.
@arg {array} r page range
@arg {number} page page number */
function rangeAdd(r, page) {}

/** Returns true if the page is in the range, false otherwise.
@arg {array} r page range
@arg {number} page page number
@return {boolean} true if page in range, false otherwise */
function isInRange(r, page) {}

/** Returns the number of pages in a PDF.
@arg {pdf} pdf PDF document
@return {number} number of pages */
function pages(pdf) {}

/** Returns the number of pages in a given PDF, with given user password. It
tries to do this as fast as possible, without loading the whole file.
@arg {string} password user password
@arg {string} filename file name
@return {number} number of pages */
function pagesFast(password, filename) {}

/** Returns the number of pages in a given PDF, with given user password. It
tries to do this as fast as possible, without loading the whole file.
@arg {string} password user password
@arg {Uint8Array} data PDF file as a byte array
@return {number} number of pages */
function pagesFastMemory(password, data) {}

/** Writes the file to a given filename. If linearize is true, it will be
linearized if a linearizer is available. If make_id is true, it will be
given a new ID.
@arg {pdf} pdf PDF document
@arg {string} filename file name
@arg {boolean} linearize linearize if a linearizer is available
@arg {boolean} make_id make a new /ID */
function toFile(pdf, filename, linearize, make_id) {}

/** Writes the file to a given filename. If make_id is true, it will be given
a new ID.  If preserve_objstm is true, existing object streams will be
preserved. If generate_objstm is true, object streams will be generated even if
not originally present. If compress_objstm is true, object streams will be
compressed (what we usually want). WARNING: the pdf argument will be invalid
after this call, and should be not be used again.
@arg {pdf} pdf PDF document
@arg {string} filename file name
@arg {boolean} linearize linearize if a linearizer is available
@arg {boolean} preserve_objstm preserve existing object streams
@arg {boolean} generate_objstm create new object streams
@arg {boolean} compress_objstm compress new object streams */
function toFileExt(pdf, filename, linearize, make_id, preserve_objstm, generate_objstm, compress_objstm) {}

/** Writes a PDF file and returns as an array of bytes.
@arg {pdf} pdf PDF document
@arg {boolean} linearize linearize if a linearizer is available
@arg {boolean} make_id make a new /ID
@result {Uint8Array} PDF document as an array of bytes */
function toMemory(pdf, linearize, make_id) {}

/** Writes the file to memory. If make_id is true, it will be given
a new ID.  If preserve_objstm is true, existing object streams will be
preserved. If generate_objstm is true, object streams will be generated even if
not originally present. If compress_objstm is true, object streams will be
compressed (what we usually want). WARNING: the pdf argument will be invalid
after this call, and should be not be used again.
@arg {pdf} pdf PDF document
@arg {boolean} linearize linearize if a linearizer is available
@arg {boolean} preserve_objstm preserve existing object streams
@arg {boolean} generate_objstm create new object streams
@arg {boolean} compress_objstm compress new object streams
@result {Uint8Array} PDF file as a byte array */
function toMemoryExt(pdf, linearize, make_id, preserve_objstm, generate_objstm, compress_objstm) {}

/** Returns true if a document is encrypted, false otherwise.
@arg {pdf} pdf PDF document
@return {boolean} true if document encrypted, false otherwise */
function isEncrypted(pdf) {}

/** Attempts to decrypt a PDF using the given user password. An exception is
raised if the decryption fails.
@arg {pdf} pdf PDF document
@arg {string} userpw user password, or empty if none */
function decryptPdf(pdf, userpw) {}

/** Attempts to decrypt a PDF using the given owner password. Raises an
exception if the decryption fails.
@arg {pdf} pdf PDF document
@arg {string} ownerpw owner password, or empty if none */
function decryptPdfOwner(pdf, ownerpw) {}

/** Cannot edit the document */
var noEdit = 0;

/** Cannot print the document */
var noPrint = 1;

/** Cannot copy the document */
var noCopy = 2;

/** Cannot annotate the document */
var noAnnot = 3;

/** Cannot edit forms in the document */
var noForms = 4;

/** Cannot extract information */
var noExtract = 5;

/** Cannot assemble into a bigger document */
var noAssemble = 6;

/** Cannot print high quality */
var noHqPrint = 7;

/** 40 bit RC4 encryption */
var pdf40bit = 0;

/** 128 bit RC4 encryption */
var pdf128bit = 1;

/** 128 bit AES encryption, do not encrypt metadata */
var aes128bitfalse = 2;

/** 128 bit AES encryption, encrypt metadata */
var aes128bittrue = 3;

/** Deprecated. Do not use for new files */
var aes256bitfalse = 4;

/** Deprecated. Do not use for new files */
var aes256bittrue = 5;

/** 256 bit AES encryption, do not encrypt metadata */
var aes256bitisofalse = 6;

/** 256 bit AES encryption, encrypt metadata */
var aes256bitisotrue = 7;

/** Writes a file as encrypted.
@arg {pdf} pdf PDF document
@arg {"encryption method"} encryption_method encryption method
@arg {"permission array"} array of permissions
@arg {string} ownerpw owner password
@arg {string} userpw user password
@arg {boolean} linearize linearize if a linearizer is available
@arg {boolean} makeid make a new /ID
@arg {string} filename file name */
function toFileEncrypted(pdf, encryption_method, permissions, ownerpw, userpw, linearize, makeid, filename) {}

/** Writes to memory as encrypted.
@arg {pdf} pdf PDF document
@arg {"encryption method"} encryption_method encryption method
@arg {"permission array"} array of permissions
@arg {string} ownerpw owner password
@arg {string} userpw user password
@arg {boolean} linearize linearize if a linearizer is available
@arg {boolean} makeid make a new /ID
@return {Uint8Array} PDF file as a byte array */
function toMemoryEncrypted(pdf, encryption_method, permissions, ownerpw, userpw, linearize, makeid) {}

/** Writes a file as encrypted with extra parameters. WARNING: the pdf argument
will be invalid after this call, and should not be used again.
@arg {pdf} pdf PDF document
@arg {"encryption method"} encryption_method encryption method
@arg {"permission array"} array of permissions
@arg {string} ownerpw owner password
@arg {string} userpw user password
@arg {boolean} linearize linearize if a linearizer is available
@arg {boolean} makeid make a new /ID
@arg {boolean} preserve_objstm preserve existing object streams
@arg {boolean} generate_objstm generate new object streams
@arg {boolean} compress_objstm compress object streams
@arg {string} filename file name */
function toFileEncryptedExt(pdf, encryption_method, permissions, ownerpw, userpw, linearize, makeid, preserve_objstm, generate_objstm, compress_objstm, filename) {}

/** Writes a file as encrypted with extra parameters. WARNING: the pdf argument
will be invalid after this call, and should not be used again.
@arg {pdf} pdf PDF document
@arg {"encryption method"} encryption_method encryption method
@arg {"permission array"} array of permissions
@arg {string} ownerpw owner password
@arg {string} userpw user password
@arg {boolean} linearize linearize if a linearizer is available
@arg {boolean} makeid make a new /ID
@arg {boolean} preserve_objstm preserve existing object streams
@arg {boolean} generate_objstm generate new object streams
@arg {boolean} compress_objstm compress object streams
@return {Uint8Array} PDF file as a byte array */
function toMemoryEncryptedExt(pdf, encryption_method, permissions, ownerpw, userpw, linearize, makeid, preserve_objstm, generate_objstm, compress_objstm) {}

/** Returns true if the given permission (restriction) is present.
@arg {pdf} pdf PDF document
@arg {permission} permission permission
@return {boolean} true if permission present */
function hasPermission(pdf, permission) {}

/** Returns the encryption method currently in use on a document.
@arg {pdf} pdf PDF document
@return {"encryption method"} encryption method */
function encryptionKind(pdf) {}

// CHAPTER 2. Merging and Splitting

/** Given a list of PDFs, merges the files into a new one, which is returned.
@arg {"array of pdfs"} pdfs array of PDF documents to merge
@return {pdf} merged PDF document */
function mergeSimple(pdfs) {}

/** Merges the PDFs. If retain_numbering is true page labels are not
rewritten. If remove_duplicate_fonts is true, duplicate fonts are merged.
This is useful when the source documents for merging originate from the same
source.
@arg {"array of pdfs"} pdfs array of PDF documents to merge
@arg {boolean} retain_numbering keep page numbering
@arg {boolean} remove_duplicate_fonts remove duplicate font data */
function merge(pdfs, retain_numbering, remove_duplicate_fonts) {}

/** The same as merge, except that it has an additional argument - a list of
page ranges. This is used to select the pages to pick from each PDF. This
avoids duplication of information when multiple discrete parts of a source PDF
are included.
@arg {"array of pdfs"} pdfs array of PDF documents to merge
@arg {boolean} retain_numbering keep page numbering
@arg {boolean} remove_duplicate_fonts remove duplicate font data 
@arg {"array of arrays of numbers"} ranges page ranges, one for each input PDF */
function mergeSame(pdfs, retain_numbering, remove_duplicate_fonts, ranges) {}

/** Returns a new document with just those pages in the page range.
@arg {pdf} pdf PDF document
@arg {range} page range */
function selectPages(pdf, r) {}

// CHAPTER 3. Pages

/** Scales the page dimensions and content by the given scale, about (0, 0).
Other boxes (crop etc. are altered as appropriate)
@arg {pdf} pdf PDF document
@arg {range} range page range
@arg {number} sx x scale
@arg {number} sy y scale */
function scalePages(pdf, range, sx, sy) {}

/** Scales the content to fit new page dimensions (width x height) multiplied
by scale (typically 1.0). Other boxes (crop etc. are altered as appropriate).
@arg {pdf} pdf PDF document
@arg {range} range page range
@arg {number} sx x scale
@arg {number} sy y scale
@arg {number} scale scale */
function scaleToFit(pdf, range, sx, sy, scale) {}

/** A0 Portrait paper */
var a0portrait = 0;

/** A1 Portrait paper */
var a1portrait = 1;

/** A2 Portrait paper */
var a2portrait = 2;

/** A3 Portrait paper */
var a3portrait = 3;

/** A4 Portrait paper */
var a4portrait = 4;

/** A5 Portrait paper */
var a5portrait = 5;

/** A0 Landscape paper */
var a0landscape = 6;

/** A1 Landscape paper */
var a1landscape = 7;

/** A2 Landscape paper */
var a2landscape = 8;

/** A3 Landscape paper */
var a3landscape = 9;

/** A4 Landscape paper */
var a4landscape = 10;

/** A5 Landscape paper */
var a5landscape = 11;

/** US Letter Portrait paper */
var usletterportrait = 12;

/** US Letter Landscape paper */
var usletterlandscape = 13;

/** US Legal Portrait paper */
var uslegalportrait = 14;

/** US Legal Landscape paper */
var uslegallandscape = 15;

/** Scales the page content to fit the given page size, possibly multiplied by
scale (typically 1.0)
@arg {pdf} pdf PDF document
@arg {range} range page range
@arg {"paper size"} papersize paper size
@arg {number} s scale */
function scaleToFitPaper(pdf, range, papersize, s) {}

/** Positions on the page. Used for scaling about a point, and adding text.

A position is an anchor and zero or one or two parameters.

posCentre: Two parameters, x and y<br/>
posLeft: Two parameters, x and y<br/>
posRight: Two parameters, x and y<br/>
top: One parameter - distance from top<br/>
topLeft: One parameter - distance from top left<br/>
topRight: One parameter - distance from top right<br/>
left: One parameter - distance from left middle<br/>
bottomLeft: One parameter - distance from bottom left<br/>
bottom: One parameter - distance from bottom<br/>
bottomRight: One parameter - distance from bottom right<br/>
right: One parameter - distance from right<br/>
diagonal: Zero parameters<br/>
reverseDiagonal: Zero parameters */

/** Absolute centre */
var posCentre = 0;

/** Absolute left */
var posLeft = 1;

/** Absolute right */
var posRight = 2;

/** The top centre of the page */
var top = 3;

/** The top left of the page */
var topLeft = 4;

/** The top right of the page */
var topRight = 5;

/** The left hand side of the page, halfway down */
var left = 6;

/** The bottom left of the page */
var bottomLeft = 7;

/** The bottom middle of the page */
var bottom = 8;

/** The bottom right of the page */
var bottomRight = 9;

/** The right hand side of the page, halfway down */
var right = 10;

/** Diagonal, bottom left to top right */
var diagonal = 11;

/** Diagonal, top left to bottom right */
var reversediagonal = 12;

/** Scales the contents of the pages in the range about the point given by
the position, by the scale given.
@arg {pdf} pdf PDF document
@arg {range} range page range
@arg {anchor} anchor anchor to scale contents about
@arg {number} p1 position argument 1
@arg {number} p2 position argument 2
@arg {number} scale scale */
function scaleContents(pdf, range, anchor, p1, p2, scale) {}

/** Shifts the content of the pages in the range.
@arg {pdf} pdf PDF document
@arg {range} range page range
@arg {number} dx x shift
@arg {number} dy y shift */
function shiftContents(pdf, range, dx, dy) {}

/** Changes the viewing rotation to an absolute value. Appropriate rotations
are 0, 90, 180, 270.
@arg {pdf} pdf PDF document
@arg {range} range page range
@arg {number} rotation rotation */
function rotate(pdf, range, rotation) {}

/** Rotates the content about the centre of the page by the given number of
degrees, in a clockwise direction. Appropriate rotations
are 0, 90, 180, 270.
@arg {pdf} pdf PDF document
@arg {range} range page range
@arg {number} rotation rotation */
function rotateBy(pdf, range, rotation) {}

/** Rotates the content about the centre of the page by the given number of
degrees, in a clockwise direction.
@arg {pdf} pdf PDF document
@arg {range} range page range
@arg {number} angle angle */
function rotateContents(pdf, range, angle) {}

/** Changes the viewing rotation of the pages in the range, counter-rotating
the dimensions and content such that there is no visual change.
@arg {pdf} pdf PDF document
@arg {range} range page range */
function upright(pdf, range) {}

/** Flips horizontally the pages in the range.
@arg {pdf} pdf PDF document
@arg {range} range page range */
function hFlip(pdf, range) {}

/** Flips vertically the pages in the range.
@arg {pdf} pdf PDF document
@arg {range} range page range */
function vFlip(pdf, range) {}

/** Crops a page, replacing any existing crop box. The dimensions are in
points.
@arg {pdf} pdf PDF document
@arg {range} range page range
@arg {number} x x position
@arg {number} y y position
@arg {number} w width
@arg {number} h height */
function crop(pdf, range, x, y, w, h) {}

/** Removes any crop box from pages in the range.
@arg {pdf} pdf PDF document
@arg {range} range page range */
function removeCrop(pdf, range) {}

/** Removes any trim box from pages in the range.
@arg {pdf} pdf PDF document
@arg {range} range page range */
function removeTrim(pdf, range) {}

/** Removes any art box from pages in the range.
@arg {pdf} pdf PDF document
@arg {range} range page range */
function removeArt(pdf, range) {}

/** Removes any bleed box from pages in the range.
@arg {pdf} pdf PDF document
@arg {range} range page range */
function removeBleed(pdf, range) {}

/** Adds trim marks to the given pages, if the trimbox exists.
@arg {pdf} pdf PDF document
@arg {range} range page range */
function trimMarks(pdf, range) {}

/** Shows the boxes on the given pages, for debug.
@arg {pdf} pdf PDF document
@arg {range} range page range */
function showBoxes(pdf, range) {}

/** Makes a given box a 'hard box' i.e clips it explicitly.
@arg {pdf} pdf PDF document
@arg {range} range page range
@arg {string} boxname box name */
function hardBox(pdf, range, boxname) {}

// CHAPTER 4. Encryption

// CHAPTER 5. Compression

/** Compresses any uncompressed streams in the given PDF using the Flate
algorithm.
@arg {pdf} pdf PDF document */
function compress(pdf) {}

/** Decompresses any streams in the given PDF, so long as the compression
method is supported.
@arg {pdf} pdf PDF document */
function decompress(pdf) {}

/** Squeezes a pdf in memory.
@arg {pdf} pdf PDF document */
function squeezeInMemory(pdf) {}

// CHAPTER 6. Bookmarks

/** Starts the bookmark retrieval process for a given PDF.
@arg {pdf} pdf PDF document */
function startGetBookmarkInfo(pdf) {}

/** Gets the number of bookmarks for the PDF given to startGetBookmarkInfo.
@return {number} number of bookmarks */
function numberBookmarks() {}

/** Gets the bookmark level for the given bookmark (0...(n - 1)).
@arg {number} n serial number
@return {number} bookmark level */
function getBookmarkLevel(n) {}

/** Gets the bookmark target page for the given PDF (which must be the same
as the PDF passed to startSetBookmarkInfo) and bookmark (0...(n - 1)).
@arg {pdf} pdf PDF document
@arg {number} n serial number
@return {number} bookmark page */
function getBookmarkPage(pdf, n) {}

/** Returns the text of bookmark (0...(n - 1)).
@arg {number} n serial number
@return {string} bookmark text */
function getBookmarkText(n) {}

/** True if the bookmark is open.
@arg {number} n serial number
@return {boolean} open status */
function getBookmarkOpenStatus(n) {}

/** Ends the bookmark retrieval process, cleaning up. */
function endGetBookmarkInfo() {}

/** Starts the bookmark setting process for n bookmarks.
@arg {number} n number of bookmarks required */
function startSetBookmarkInfo(n) {}

/** Set bookmark level for the given bookmark (0...(n - 1)).
@arg {number} n serial number
@arg {number} level bookmark level */
function setBookmarkLevel(n, level) {}

/** Sets the bookmark target page for the given PDF (which must be the same as
the PDF to be passed to endSetBookmarkInfo) and bookmark (0...(n - 1)).
@arg {pdf} pdf PDF document
@arg {number} n serial number
@arg {number} targetpage target page */
function setBookmarkPage(pdf, n, targetpage) {}

/** Sets the open status of bookmark (0...(n - 1)).
@arg {number} n serial number
@arg {boolean} status open status */
function setBookmarkOpenStatus(n, status) {}

/** Sets the text of bookmark (0...(n - 1)).
@arg {number} n serial number
@arg {string} text bookmark text */
function setBookmarkText(n, text) {}

/** Ends the bookmark setting process, writing the bookmarks to the given
PDF.
@arg {pdf} pdf PDF document */
function endSetBookmarkInfo(pdf) {}

/** Returns the bookmark data in JSON format.
@arg {pdf} pdf PDF document
@result {Uint8Array} result as a byte array */
function getBookmarksJSON(pdf) {}

/** Sets the bookmarks from JSON bookmark data.
@arg {pdf} pdf PDF document
@arg {Uint8Array} byte array of JSON bookmark data */
function setBookmarksJSON(pdf, data) {}

/** Typesets a table of contents from existing bookmarks and prepends it to
the document. If bookmark is set, the table of contents gets its own
bookmark.
@arg {pdf} pdf PDF document
@arg {font} font font
@arg {number} fontsize font size
@arg {string} title title
@arg {boolean} bookmark table of contents gets its own bookmark */
function tableOfContents(pdf, font, fontsize, title, bookmark) {}

// CHAPTER 7. Presentations

// CHAPTER 8. Logos, Watermarks and Stamps
   
/** Stamps stamp_pdf on all the pages in the document which are in the
range. The stamp is placed with its origin at the origin of the target
document.
@arg {pdf} stamp_pdf stamp
@arg {pdf} pdf PDF document
@arg {range} range page range */
function stampOn(stamp_pdf, pdf, range) {}

/** Stamps stamp_pdf under all the pages in the document which are in the
range. The stamp is placed with its origin at the origin of the target
document.
@arg {pdf} stamp_pdf stamp
@arg {pdf} pdf PDF document
@arg {range} range page range */
function stampUnder(stamp_pdf, pdf, range) {}

/** A stamping function with extra features. 
@arg {pdf} pdf first PDF document
@arg {pdf} pdf second PDF document
@arg {boolean} isover pdf goes over pdf2, otherwise under
@arg {boolean} scale_stamp_to_fit scales the stamp to fit the page
@arg {anchor} anchor for position of stamp
@arg {number} p1 position argument 1
@arg {number} p2 position argument 2
@arg {boolean} relative_to_cropbox pos is relative to cropbox not mediabox. */
function stampExtended(pdf, pdf2, range, isover, scale_stamp_to_fit, position, relative_to_cropbox) {}

/** Combines the PDFs page-by-page, putting each page of 'over' over each page
of 'under'.
@arg {pdf} under PDF document
@arg {pdf} over PDF document
@result {pdf} resultant PDF document */
function combinePages(under, over) {}

/** Times Roman */
var timesRoman = 0;

/** Times Bold */
var timesBold = 1;

/** Times Italic */
var timesItalic = 2;

/** Times Bold Italic */
var timesBoldItalic = 3;

/** Helvetica */
var helvetica = 4;

/** Helvetica Bold */
var helveticaBold = 5;

/** Helvetica Oblique */
var helveticaOblique = 6;

/** Helvetica Bold Oblique */
var helveticaBoldOblique = 7;

/** Courier */
var courier = 8;

/** Courier Bold */
var courierBold = 9;

/** Courier Oblique */
var courierOblique = 10;

/** Courier Bold Oblique */
var courierBoldOblique = 11;

/** Left justify */
var leftJustify = 0;

/** Centre justify */
var centreJustify = 1;

/** Right justify */
var rightJustify = 2;

/** Adds text to the pages in the given range.
@arg {boolean} metrics collect metrics only
@arg {pdf} pdf PDF document
@arg {range} range page range
@arg {string} text text to add \\n for newline
@arg {anchor} anchor anchor to add text at
@arg {number} p1 position argument 1
@arg {number} p2 position argument 2
@arg {number} linespacing line spacing
@arg {number} bates starting bates number
@arg {font} font font
@arg {number} fontsize font size
@arg {number} r red component of colour 0..1
@arg {number} g green component of colour 0..1
@arg {number} b blue component of colour 0..1
@arg {boolean} underneath put text under the page rather than over
@arg {boolean} relative_to_cropbox position is relative to crop box not media box
@arg {boolean} outline text is outline
@arg {number} opacity opacity 0..1
@arg {justification} justification justification
@arg {boolean} midline position is relative to midline not baseline
@arg {boolean} topline position is relative to topline not baseline
@arg {string} filename file name
@arg {number} linewidth line width
@arg {boolean} embed_fonts add font information
*/
function addText(metrics, pdf, range, text, anchor, p1, p2, linespacing,
                 bates, font, fontsize, r, g, b, underneath, relative_to_cropbox, outline,
                 opacity, justification, midline, topline, filename, linewidth, embed_fonts) {}

/** Adds text with most parameters default.
@arg {pdf} pdf PDF document
@arg {range} range page range
@arg {string} text text to add. \\n for newline
@arg {anchor} anchor anchor to add text at
@arg {number} p1 position argument 1
@arg {number} p2 position argument 2
@arg {font} font font
@arg {number} fontsize font size */
function addTextSimple(pdf, range, text, anchor, p1, p2, font, fontsize) {}

/** Removes any text added by cpdf from the given pages.
@arg {pdf} pdf PDF document
@arg {range} range page range */
function removeText(pdf, range) {}

/** Returns the width of a given string in the given font in thousandths of a
point.
@arg {font} font font
@arg {string} text text
@result {number} width */
function textWidth(font, text) {}

/** Adds page content before (if true) or after (if false) the existing
content to pages in the given range in the given PDF.
@arg {string} content content to add
@arg {boolean} before rather than after
@arg {pdf} pdf PDF document
@arg {range} range page range */
function addContent(content, before, pdf, range) {}

/** Stamps stamp_pdf onto the pages in the given range in pdf as a shared Form
XObject. The name of the newly-created XObject is returned.
@arg {pdf} pdf PDF document
@arg {range} range page range
@arg {pdf} stamp_pdf stamp pdf
@result {string} name of XObject */
function stampAsXObject(pdf, range, stamp_pdf) {}

// CHAPTER 9. Multipage facilities

/** Imposes a PDF. There are two modes: imposing x * y, or imposing to fit a
page of size x * y. This is controlled by fit. Columns imposes by columns
rather than rows. rtl is right-to-left, btt bottom-to-top. Center is unused
for now. Margin is the margin around the output, spacing the spacing between
imposed inputs.
@arg {pdf} pdf PDF document
@arg {number} x (explained above)
@arg {number} y (explained above)
@arg {boolean} fit (explained above)
@arg {boolean} rtl impose right to left
@arg {boolean} btt impose bottom to top
@arg {boolean} center unused
@arg {number} margin margin around output pages
@arg {number} spacing spacing between imposed pages
@arg {number} linewidth line width */
function impose(pdf, x, y, fit, columns, rtl, btt, center, margin, spacing, linewidth) {}

/** Imposes a document two up. twoUp does so by shrinking the page size, to fit
two pages on one.
@arg {pdf} pdf PDF document */
function twoUp(pdf) {}

/** Impose a document two up. twoUpStack does so by doubling the page size,
to fit two pages on one.
@arg {pdf} pdf PDF document */
function twoUpStack(pdf) {}

/** Adds a blank page before each page in the given range.
@arg {pdf} pdf PDF document
@arg {range} range page range */
function padBefore(pdf, range) {}

/** Adds a blank page after every n pages.
@arg {pdf} pdf PDF document
@arg {range} range page range */
function padAfter(pdf, range) {}

/** Adds a blank page after every n pages.
@arg {pdf} pdf PDF document
@arg {number} interval */
function padEvery(pdf, n) {}

/** Adds pages at the end to pad the file to a multiple of n pages in
length.
@arg {pdf} pdf PDF document
@arg {number} multiple to pad to */
function padMultiple(pdf, n) {}

/** Adds pages at the beginning to pad the file to a multiple of n pages in
length.
@arg {pdf} pdf PDF document
@arg {number} multiple to pad to */
function padMultipleBefore(pdf, n) {}

// CHAPTER 10. Annotations 

/** Returns the annotations from a PDF in JSON format.
@arg {pdf} pdf PDF document
@return {Uint8Array} results as an array of bytes */
function annotationsJSON(pdf) {}

// CHAPTER 11. Document Information and Metadata

/** Finds out if a document is linearized as quickly as possible without
loading it.
@arg {string} filename file name
@result {boolean} true if linearized */
function isLinearized(filename) {}

/** Finds out if a document in memory is linearized as quickly as possible without
loading it.
@arg {Uint8Array} PDF file as a byte array
@result {boolean} true if linearized */
function isLinearizedMemory(data) {}

/** Returns the minor version number of a document.
@arg {pdf} pdf PDF document
@return {number} version number */
function getVersion(pdf) {}

/** Returns the major version number of a document.
@arg {pdf} pdf PDF document
@return {number} major version number */
function getMajorVersion(pdf) {}

/** Returns the title of a document.
@arg {pdf} pdf PDF document
@return {string} title */
function getTitle(pdf) {}

/** Returns the author of a document.
@arg {pdf} pdf PDF document
@return {string} author */
function getAuthor(pdf) {}

/** Returns the subject of a document.
@arg {pdf} pdf PDF document
@return {string} subject */
function getSubject(pdf) {}

/** Returns the keywords of a document.
@arg {pdf} pdf PDF document
@return {string} keywords */
function getKeywords(pdf) {}

/** Returns the creator of a document.
@arg {pdf} pdf PDF document
@return {string} creator */
function getCreator(pdf) {}

/** Returns the producer of a document.
@arg {pdf} pdf PDF document
@return {string} producer */
function getProducer(pdf) {}

/** Returns the creation date of a document.
@arg {pdf} pdf PDF document
@return {string} creation date */
function getCreationDate(pdf) {}

/** Returns the modification date of a document.
@arg {pdf} pdf PDF document
@return {string} modification date */
function getModificationDate(pdf) {}

/** Returns the XMP title of a document.
@arg {pdf} pdf PDF document
@return {string} XMP title */
function getTitleXMP(pdf) {}

/** Returns the XMP author of a document.
@arg {pdf} pdf PDF document
@return {string} XMP author */
function getAuthorXMP(pdf) {}

/** Returns the XMP subject of a document.
@arg {pdf} pdf PDF document
@return {string} XMP subject */
function getSubjectXMP(pdf) {}

/** Returns the XMP keywords of a document.
@arg {pdf} pdf PDF document
@return {string} XMP keywords */
function getKeywordsXMP(pdf) {}

/** Returns the XMP creator of a document.
@arg {pdf} pdf PDF document
@return {string} XMP creator */
function getCreatorXMP(pdf) {}

/** Returns the XMP producer of a document.
@arg {pdf} pdf PDF document
@return {string} XMP producer */
function getProducerXMP(pdf) {}

/** Returns the XMP creation date of a document.
@arg {pdf} pdf PDF document
@return {string} XMP creation date */
function getCreationDateXMP(pdf) {}

/** Returns the XMP modification date of a document.
@arg {pdf} pdf PDF document
@return {string} XMP modification date */
function getModificationDateXMP(pdf) {}

/** Sets the title of a document.
@arg {pdf} pdf PDF document
@arg {string} s title */
function setTitle(pdf, s) {}

/** Sets the author of a document.
@arg {pdf} pdf PDF document
@arg {string} s author */
function setAuthor(pdf, s) {}

/** Sets the subject of a document.
@arg {pdf} pdf PDF document
@arg {string} s subject */
function setSubject(pdf, s) {}

/** Sets the keywords of a document.
@arg {pdf} pdf PDF document
@arg {string} s keywords */
function setKeywords(pdf, s) {}

/** Sets the creator of a document.
@arg {pdf} pdf PDF document
@arg {string} s creator */
function setCreator(pdf, s) {}

/** Sets the producer of a document.
@arg {pdf} pdf PDF document
@arg {string} s producer */
function setProducer(pdf, s) {}

/** Sets the creation date of a document.
@arg {pdf} pdf PDF document
@arg {string} s creation date */
function setCreationDate(pdf, s) {}

/** Sets the modification date of a document.
@arg {pdf} pdf PDF document
@arg {string} s modification date */
function setModificationDate(pdf, s) {}

/** Sets the XMP title of a document.
@arg {pdf} pdf PDF document
@arg {string} s XMP title */
function setTitleXMP(pdf, s) {}

/** Sets the XMP author of a document.
@arg {pdf} pdf PDF document
@arg {string} s XMP author */
function setAuthorXMP(pdf, s) {}

/** Sets the XMP author of a document.
@arg {pdf} pdf PDF document
@arg {string} s XMP subject */
function setSubjectXMP(pdf, s) {}

/** Sets the XMP keywords of a document.
@arg {pdf} pdf PDF document
@arg {string} s XMP keywords */
function setKeywordsXMP(pdf, s) {}

/** Sets the XMP creator of a document.
@arg {pdf} pdf PDF document
@arg {string} s XMP creator */
function setCreatorXMP(pdf, s) {}

/** Sets the XMP producer of a document.
@arg {pdf} pdf PDF document
@arg {string} s XMP producer */
function setProducerXMP(pdf, s) {}

/** Sets the XMP creation date of a document.
@arg {pdf} pdf PDF document
@arg {string} s XMP creation date */
function setCreationDateXMP(pdf, s) {}

/** Sets the XMP modification date of a document.
@arg {pdf} pdf PDF document
@arg {string} s XMP modification date */
function setModificationDateXMP(pdf, s) {}

/** Returns the components from a PDF date string.
@arg {string} string date string
@return {"array of numbers"} date components */
function getDateComponents(string) {}

/** Builds a PDF date string from individual components.
@arg {number} y year
@arg {number} m month
@arg {number} d day
@arg {number} h hour
@arg {number} min minute
@arg {number} sec second
@arg {number} hour_offset hour offset
@arg {number} minute_offset minute offset
@return {string} date string */
function dateStringOfComponents(y, m, d, h, min, sec, hour_offset, minute_offset) {}

/** Gets the viewing rotation for a given page.
@arg {pdf} pdf PDF document
@arg {number} page page number
@result {number} page rotation */
function getPageRotation(pdf, page) {}

/** Returns true if that page has the given box. E.g "/CropBox".
@arg {pdf} pdf PDF document
@arg {number} page page number
@arg {string} box box name
@result {boolean} true if box present */
function hasBox(pdf, page, box) {}

/** These functions get a box given the document, page number, min x, max x,
min y, max y in points. Only succeeds if such a box exists, as checked by
hasBox.
@arg {pdf} pdf PDF document
@arg {number} pagenumber page number
@return {"array of numbers"} media box */
function getMediaBox(pdf, pagenumber) {}

/** These functions get a box given the document, page number, min x, max x,
min y, max y in points. Only succeeds if such a box exists, as checked by
hasBox.
@arg {pdf} pdf PDF document
@arg {number} pagenumber page number
@return {"array of numbers"} crop box */
function getCropBox(pdf, pagenumber) {}

/** These functions get a box given the document, page number, min x, max x,
min y, max y in points. Only succeeds if such a box exists, as checked by
hasBox.
@arg {pdf} pdf PDF document
@arg {number} pagenumber page number
@return {"array of numbers"} art box */
function getArtBox(pdf, pagenumber) {}

/** These functions get a box given the document, page number, min x, max x,
min y, max y in points. Only succeeds if such a box exists, as checked by
hasBox.
@arg {pdf} pdf PDF document
@arg {number} pagenumber page number
@return {"array of numbers"} bleed box */
function getBleedBox(pdf, pagenumber) {}

/** These functions get a box given the document, page number, min x, max x,
min y, max y in points. Only succeeds if such a box exists, as checked by
hasBox.
@arg {pdf} pdf PDF document
@arg {number} pagenumber page number
@return {"array of numbers"} trim box */
function getTrimBox(pdf, pagenumber) {}

/** These functions set a box given the document, page range, min x, max x,
min y, max y in points.
@arg {pdf} pdf PDF document
@arg {range} range page range
@arg {number} minx min x
@arg {number} maxx max x
@arg {number} minx min y
@arg {number} maxx max y */
function setMediabox(pdf, range, minx, maxx, miny, maxy) {}

/** These functions set a box given the document, page range, min x, max x,
min y, max y in points.
@arg {pdf} pdf PDF document
@arg {range} range page range
@arg {number} minx min x
@arg {number} maxx max x
@arg {number} minx min y
@arg {number} maxx max y */
function setCropBox(pdf, range, minx, maxx, miny, maxy) {}

/** These functions set a box given the document, page range, min x, max x,
min y, max y in points.
@arg {pdf} pdf PDF document
@arg {range} range page range
@arg {number} minx min x
@arg {number} maxx max x
@arg {number} minx min y
@arg {number} maxx max y */
function setTrimBox(pdf, range, minx, maxx, miny, maxy) {}

/** These functions set a box given the document, page range, min x, max x,
min y, max y in points.
@arg {pdf} pdf PDF document
@arg {range} range page range
@arg {number} minx min x
@arg {number} maxx max x
@arg {number} minx min y
@arg {number} maxx max y */
function setBleedBox(pdf, range, minx, maxx, miny, maxy) {}

/** These functions set a box given the document, page range, min x, max x,
min y, max y in points.
@arg {pdf} pdf PDF document
@arg {range} range page range
@arg {number} minx min x
@arg {number} maxx max x
@arg {number} minx min y
@arg {number} maxx max y */
function setArtBox(pdf, range, minx, maxx, miny, maxy) {}

/** Marks a document as trapped.
@arg {pdf} pdf PDF document */
function markTrapped(pdf) {}

/** Marks a document as untrapped.
@arg {pdf} pdf PDF document */
function markUntrapped(pdf) {}

/** Marks a document as trapped in XMP metadata.
@arg {pdf} pdf PDF document */
function markTrappedXMP(pdf) {}

/** Marks a document as untrapped in XMP metadata.
@arg {pdf} pdf PDF document */
function markUntrappedXMP(pdf) {}

/** Single page */
var singlePage = 0;

/** One column */
var oneColumn = 1;

/** Two column left */
var twoColumnLeft = 2;

/** Two column right */
var twoColumnRight = 3;

/** Two page left */
var twoPageLeft = 4;

/** Two page right */
var twoPageRight = 5;
  
/** Sets the page layout for a document.
@arg {pdf} pdf PDF document
@arg {layout} layout page layout */
function setPageLayout(pdf, layout) {}

/** Use none */
var useNone = 0;

/** Use outlines */
var useOutlines = 1;

/** Use thumbs */
var useThumbs = 2;

/** Use OC */
var useOC = 3;

/** Use attachments */
var useAttachments = 4;

/** Sets the page mode for a document.
@arg {pdf} pdf PDF document
@arg {mode} mode page mode */
function setPageMode(pdf, mode) {}

/** Sets the hide toolbar flag.
@arg {pdf} pdf PDF document
@arg {boolean} flag hide toolbar */
function hideToolbar(pdf, flag) {}

/** Sets the hide menubar flag.
@arg {pdf} pdf PDF document
@arg {boolean} flag hide menubar */
function hideMenubar(pdf, flag) {}

/** Sets the hide window UI flag.
@arg {pdf} pdf PDF document
@arg {boolean} flag hide UI */
function hideWindowUi(pdf, flag) {}

/** Sets the fit window flag.
@arg {pdf} pdf PDF document
@arg {boolean} flag fit window */
function fitWindow(pdf, flag) {}

/** Sets the center window flag.
@arg {pdf} pdf PDF document
@arg {boolean} flag center window */
function centerWindow(pdf, flag) {}

/** Sets the display doc title flag.
@arg {pdf} pdf PDF document
@arg {boolean} flag display doc title */
function displayDocTitle(pdf, flag) {}

/** Sets the PDF to open, possibly with zoom-to-fit, at the given page
number.
@arg {pdf} pdf PDF document
@arg {boolean} fit zoom-to-fit
@arg {number} pagenumber page number */
function openAtPage(pdf, fit, pagenumber) {}

/** Sets the XMP metadata of a document, given a file name.
@arg {pdf} pdf PDF document
@arg {string} filename file name */
function setMetadataFromFile(pdf, filename) {}

/** Sets the XMP metadata from an array of bytes.
@arg {pdf} pdf PDF document
@arg {Uint8Array} data XMP metadata as an array of bytes */
function setMetadataFromByteArray(pdf, data) {}

/** Removes the XMP metadata from a document.
@arg {pdf} pdf PDF document */
function removeMetadata(pdf) {}

/** Returns the XMP metadata from a document.
@arg {pdf} pdf PDF document
@result {Uint8Array} XMP metadata as a byte array */
function getMetadata(pdf) {}

/** Builds fresh XMP metadata as best it can from existing metadata in the
document.
@arg {pdf} pdf PDF document */
function createMetadata(pdf) {}

/** Sets the metadata date for a PDF. The date is given in PDF date format --
cpdf will convert it to XMP format. The date 'now' means now. */
function setMetadataDate(pdf, date) {}

/** 1, 2, 3... */
var decimalArabic = 0;

/** I, II, III... */
var uppercaseRoman = 1;

/** i, ii, iii... */
var lowercaseRoman = 2;

/** A, B, C... */
var uppercaseLetters = 3;

/** a, b, c... */
var lowercaseLetters = 4;

/** Adds page labels. The prefix is prefix text for each label. The range is
the page range the labels apply to. Offset can be used to shift the numbering
up or down.
@arg {pdf} pdf PDF document
@arg {style} style page label style
@arg {string} prefix label prefix
@arg {number} offset offset
@arg {range} range page range
@arg {boolean} progress labels progress */
function addPageLabels(pdf, style, prefix, offset, range, progress) {}

/** Removes the page labels from the document.
@arg {pdf} pdf PDF document */
function removePageLabels(pdf) {}

/** Calculates the full label string for a given page, and returns it.
@arg {pdf} pdf PDF document
@arg {number} pagenumber page number
@result {string} page label string */
function getPageLabelStringForPage(pdf, pagenumber) {}

/** Gets page label data. Call startGetPageLabels to find out how many
there are, then use these serial numbers to get the style, prefix, offset
and start value (note not a range). Call endGetPageLabels to clean up.<br/><br/>

For example, a document might have five pages of introduction with roman
numerals, followed by the rest of the pages in decimal arabic, numbered from
one:<br/><br/>

labelstyle = LowercaseRoman<br/>
labelprefix = ""<br/>
startpage = 1<br/>
startvalue = 1<br/></br>

labelstyle = DecimalArabic<br/>
labelprefix = ""<br/>
startpage = 6<br/>
startvalue = 1<br/>

@arg {pdf} pdf PDF document
@result {number} number of page labels */
function startGetPageLabels(pdf) {}

/** Gets page label data. Call startGetPageLabels to find out how many
there are, then use these serial numbers to get the style, prefix, offset
and start value (note not a range). Call endGetPageLabels to clean up.<br/><br/>

For example, a document might have five pages of introduction with roman
numerals, followed by the rest of the pages in decimal arabic, numbered from
one:<br/><br/>

labelstyle = LowercaseRoman<br/>
labelprefix = ""<br/>
startpage = 1<br/>
startvalue = 1<br/></br>

labelstyle = DecimalArabic<br/>
labelprefix = ""<br/>
startpage = 6<br/>
startvalue = 1<br/>

@arg {number} n serial number
@result {"label style"} page label style */
function getPageLabelStyle(n) {}

/** Gets page label data. Call startGetPageLabels to find out how many
there are, then use these serial numbers to get the style, prefix, offset
and start value (note not a range). Call endGetPageLabels to clean up.<br/><br/>

For example, a document might have five pages of introduction with roman
numerals, followed by the rest of the pages in decimal arabic, numbered from
one:<br/><br/>

labelstyle = LowercaseRoman<br/>
labelprefix = ""<br/>
startpage = 1<br/>
startvalue = 1<br/></br>

labelstyle = DecimalArabic<br/>
labelprefix = ""<br/>
startpage = 6<br/>
startvalue = 1<br/>

@arg {number} n serial number
@result {string} page label prefix */
function getPageLabelPrefix(n) {}

/** Gets page label data. Call startGetPageLabels to find out how many
there are, then use these serial numbers to get the style, prefix, offset
and start value (note not a range). Call endGetPageLabels to clean up.<br/><br/>

For example, a document might have five pages of introduction with roman
numerals, followed by the rest of the pages in decimal arabic, numbered from
one:<br/><br/>

labelstyle = LowercaseRoman<br/>
labelprefix = ""<br/>
startpage = 1<br/>
startvalue = 1<br/></br>

labelstyle = DecimalArabic<br/>
labelprefix = ""<br/>
startpage = 6<br/>
startvalue = 1<br/>

@arg {number} n serial number
@result {number} page label offset */
function getPageLabelOffset(n) {}

/** Gets page label data. Call startGetPageLabels to find out how many
there are, then use these serial numbers to get the style, prefix, offset
and start value (note not a range). Call endGetPageLabels to clean up.<br/><br/>

For example, a document might have five pages of introduction with roman
numerals, followed by the rest of the pages in decimal arabic, numbered from
one:<br/><br/>

labelstyle = LowercaseRoman<br/>
labelprefix = ""<br/>
startpage = 1<br/>
startvalue = 1<br/></br>

labelstyle = DecimalArabic<br/>
labelprefix = ""<br/>
startpage = 6<br/>
startvalue = 1<br/>

@arg {number} n serial number
@result {number} page label range */
function getPageLabelRange(n) {}

/** Gets page label data. Call startGetPageLabels to find out how many
there are, then use these serial numbers to get the style, prefix, offset
and start value (note not a range). Call endGetPageLabels to clean up.<br/><br/>

For example, a document might have five pages of introduction with roman
numerals, followed by the rest of the pages in decimal arabic, numbered from
one:<br/><br/>

labelstyle = LowercaseRoman<br/>
labelprefix = ""<br/>
startpage = 1<br/>
startvalue = 1<br/></br>

labelstyle = DecimalArabic<br/>
labelprefix = ""<br/>
startpage = 6<br/>
startvalue = 1<br/> */
function endGetPageLabels() {}

// CHAPTER 12. File Attachments
    
/** Attaches a file to the pdf. It is attached at document level.
@arg {string} filename file name
@arg {pdf} pdf PDF document */
function attachFile(filename, pdf) {}

/** Attaches a file, given its file name, pdf, and the page number
to which it should be attached.
@arg {string} filename file name
@arg {pdf} pdf PDF document
@arg {number} pagenumber page number */
function attachFileToPage(filename, pdf, pagenumber) {}

/** Attaches data from memory, just like attachFile.
@arg {Uint8Array} data file as a byte array
@arg {string} filename file name to call it in the PDF
@arg {pdf} pdf PDF document */
function attachFileFromMemory(data, filename, pdf) {}

/** Attaches to a page from memory, just like attachFileToPage.
@arg {Uint8Array} data file as a byte array
@arg {string} filename file name to call it in the PDF
@arg {pdf} pdf PDF document
@arg {number} pagenumber page number */
function attachFileToPageFromMemory(data, filename, pdf, pagenumber) {}

/** Removes all page- and document-level attachments from a document.
@arg {pdf} pdf PDF document */
function removeAttachedFiles(pdf) {}

/** Lists information about attachments. Call startGetAttachments(pdf) first,
then numberGetAttachments to find out how many there are. Then
getAttachmentName etc. to return each one 0...(n - 1). Finally, call
endGetAttachments to clean up.
@arg {pdf} pdf PDF document */
function startGetAttachments(pdf) {}

/** Lists information about attachments. Call startGetAttachments(pdf) first,
then numberGetAttachments to find out how many there are. Then
getAttachmentName etc. to return each one 0...(n - 1). Finally, call
endGetAttachments to clean up.
@return {number} number of attachments */
function numberGetAttachments() {}

/** Gets the name of an attachment.
@arg {number} n serial number
@return {string} attachment name */
function getAttachmentName(n) {}

/** Gets the page number. 0 = document level.
@arg {number} n serial number
@return {number} attachment page */
function getAttachmentPage(n) {}

/** Gets the attachment data itself.
@arg {number} n serial number
@return {Uint8Array} attachment data */
function getAttachmentData(n) {}

/** Cleans up after getting attachments. */
function endGetAttachments() {}

//CHAPTER 13. Images

/** Gets image data, including resolution at all points of use. Call
startGetImageResolution(pdf, min_required_resolution) to begin the process of
obtaining data on all image uses below min_required_resolution, returning the
total number. So, to return all image uses, specify a very high
min_required_resolution. Then, call the other functions giving a serial number
0..n - 1, to retrieve the data. Finally, call endGetImageResolution to clean
up.
@arg {pdf} pdf PDF document
@arg {number} min_required_resolution minimum required resolution
@return {number} number of uses */
function startGetImageResolution(pdf, min_required_resolution) {}

/** Gets image data, including resolution at all points of use. Call
startGetImageResolution(pdf, min_required_resolution) to begin the process of
obtaining data on all image uses below min_required_resolution, returning the
total number. So, to return all image uses, specify a very high
min_required_resolution. Then, call the other functions giving a serial number
0..n - 1, to retrieve the data. Finally, call endGetImageResolution to clean
up.
@arg {number} n serial number
@return {number} page number */
function getImageResolutionPageNumber(n) {}

/** Gets image data, including resolution at all points of use. Call
startGetImageResolution(pdf, min_required_resolution) to begin the process of
obtaining data on all image uses below min_required_resolution, returning the
total number. So, to return all image uses, specify a very high
min_required_resolution. Then, call the other functions giving a serial number
0..n - 1, to retrieve the data. Finally, call endGetImageResolution to clean
up.
@arg {number} n serial number
@return {string} image name */
function getImageResolutionImageName(n) {}

/** Gets image data, including resolution at all points of use. Call
startGetImageResolution(pdf, min_required_resolution) to begin the process of
obtaining data on all image uses below min_required_resolution, returning the
total number. So, to return all image uses, specify a very high
min_required_resolution. Then, call the other functions giving a serial number
0..n - 1, to retrieve the data. Finally, call endGetImageResolution to clean
up.
@arg {number} n serial number
@return {number} X pixels */
function getImageResolutionXPixels(n) {}

/** Gets image data, including resolution at all points of use. Call
startGetImageResolution(pdf, min_required_resolution) to begin the process of
obtaining data on all image uses below min_required_resolution, returning the
total number. So, to return all image uses, specify a very high
min_required_resolution. Then, call the other functions giving a serial number
0..n - 1, to retrieve the data. Finally, call endGetImageResolution to clean
up.
@arg {number} n serial number
@return {number} Y pixels */
function getImageResolutionYPixels(n) {}

/** Gets image data, including resolution at all points of use. Call
startGetImageResolution(pdf, min_required_resolution) to begin the process of
obtaining data on all image uses below min_required_resolution, returning the
total number. So, to return all image uses, specify a very high
min_required_resolution. Then, call the other functions giving a serial number
0..n - 1, to retrieve the data. Finally, call endGetImageResolution to clean
up.
@arg {number} n serial number
@return {number} X Res */
function getImageResolutionXRes(n) {}

/** Gets image data, including resolution at all points of use. Call
startGetImageResolution(pdf, min_required_resolution) to begin the process of
obtaining data on all image uses below min_required_resolution, returning the
total number. So, to return all image uses, specify a very high
min_required_resolution. Then, call the other functions giving a serial number
0..n - 1, to retrieve the data. Finally, call endGetImageResolution to clean
up.
@arg {number} n serial number
@return {number} Y Res */
function getImageResolutionYRes(n) {}

/** Gets image data, including resolution at all points of use. Call
startGetImageResolution(pdf, min_required_resolution) to begin the process of
obtaining data on all image uses below min_required_resolution, returning the
total number. So, to return all image uses, specify a very high
min_required_resolution. Then, call the other functions giving a serial number
0..n - 1, to retrieve the data. Finally, call endGetImageResolution to clean
up. */
function endGetImageResolution() {}

// CHAPTER 14. Fonts.

/** Retrieves font information. First, call startGetFontInfo(pdf). Now call
numberFonts to return the number of fonts. For each font, call one or more of
getFontPage, getFontName, getFontType, and getFontEncoding giving a serial
number 0..n - 1 to return information. Finally, call endGetFontInfo to clean
up.
@ {pdf} pdf PDF document */
function startGetFontInfo(pdf) {}

/** Retrieves font information. First, call startGetFontInfo(pdf). Now call
numberFonts to return the number of fonts. For each font, call one or more of
getFontPage, getFontName, getFontType, and getFontEncoding giving a serial
number 0..n - 1 to return information. Finally, call endGetFontInfo to clean
up.
@result {number} number of fonts */
function numberFonts() {}

/** Retrieves font information. First, call startGetFontInfo(pdf). Now call
numberFonts to return the number of fonts. For each font, call one or more of
getFontPage, getFontName, getFontType, and getFontEncoding giving a serial
number 0..n - 1 to return information. Finally, call endGetFontInfo to clean
up.
@arg {number} n serial number
@return {number} page number */
function getFontPage(n) {}

/** Retrieves font information. First, call startGetFontInfo(pdf). Now call
numberFonts to return the number of fonts. For each font, call one or more of
getFontPage, getFontName, getFontType, and getFontEncoding giving a serial
number 0..n - 1 to return information. Finally, call endGetFontInfo to clean
up.
@arg {number} n serial number
@return {string} font name */
function getFontName(n) {}

/** Retrieves font information. First, call startGetFontInfo(pdf). Now call
numberFonts to return the number of fonts. For each font, call one or more of
getFontPage, getFontName, getFontType, and getFontEncoding giving a serial
number 0..n - 1 to return information. Finally, call endGetFontInfo to clean
up.
@arg {number} n serial number
@return {string} font type */
function getFontType(n) {}

/** Retrieves font information. First, call startGetFontInfo(pdf). Now call
numberFonts to return the number of fonts. For each font, call one or more of
getFontPage, getFontName, getFontType, and getFontEncoding giving a serial
number 0..n - 1 to return information. Finally, call endGetFontInfo to clean
up.
@arg {number} n serial number
@return {string} font encoding */
function getFontEncoding(n) {}

/** Retrieves font information. First, call startGetFontInfo(pdf). Now call
numberFonts to return the number of fonts. For each font, call one or more of
getFontPage, getFontName, getFontType, and getFontEncoding giving a serial
number 0..n - 1 to return information. Finally, call endGetFontInfo to clean
up. */
function endGetFontInfo() {}

/** Removes all font data from a file.
@arg {pdf} pdf PDF document */
function removeFonts(pdf) {}

/** Copies the given font from the given page in the 'from' PDF to every page
in the range of the 'to' PDF. The new font is stored under its font name.
@arg {pdf} docfrom source document
@arg {pdf} docto destination document
@arg {range} page range
@arg {number} pagenumber source page number
@arg {string} fontname font name */
function copyFont(docfrom, docto, range, pagenumber, fontname) {}

// CHAPTER 15. PDF and JSON

/** Outputs a PDF in JSON format to the given filename. If parse_content is
true, page content is parsed. If no_stream_data is true, all stream data is
suppressed entirely. If decompress_streams is true, streams are decompressed.
@arg {string} filename file name
@arg {boolean} parse_content parse page content
@arg {boolean} no_stream_data suppress stream data
@arg {boolean} decompress_streams decompress streams
@arg {pdf} pdf PDF document */
function outputJSON(filename, parse_content, no_stream_data, decompress_streams, pdf) {}

/** Like outputJSON, but it writes to a byte array in memory.
@arg {boolean} parse_content parse page content
@arg {boolean} no_stream_data suppress stream data
@arg {boolean} decompress_streams decompress streams
@arg {pdf} pdf PDF document
@return {Uint8Array} JSON data as a byte array */
function outputJSONMemory(parse_content, no_stream_data, decompress_streams, pdf) {}

/** Loads a PDF from a JSON file given its filename.
@arg {string} filename file name
@return {pdf} PDF document */
function fromJSON(filename) {}

/** Loads a PDF from a JSON file in memory. 
@arg {Uint8Array} data JSON data as a byte array
@return {pdf} PDF document */
function fromJSONMemory(data) {}

// CHAPTER 16. Optional Content Groups

/** Begins retrieving optional content group names. The number of entries is returned.
@arg {pdf} pdf PDF document
@return {number} number of entries */
function startGetOCGList(pdf) {}

/** Retrieves an OCG name, given its serial number 0..n - 1.
@arg {number} n serial number
@return {string} OCG name */
function ocgListEntry(n) {}

/** Ends retrieval of optional content group names. */
function endGetOCGList() {}

/** Renames an optional content group.
@arg {pdf} pdf PDF document
@arg {string} name_from source name
@arg {string} name_to destination name */
function ocgRename(pdf, name_from, name_to) {}

/** Ensures that every optional content group appears in the OCG order list.
@arg {pdf} pdf PDF document */
function ocgOrderAll(pdf) {}

/** Coalesces optional content groups. For example, if we merge or stamp two
files both with an OCG called "Layer 1", we will have two different optional
content groups. This function will merge the two into a single optional
content group.
@arg {pdf} pdf PDF document */
function ocgCoalesce(pdf) {}

// CHAPTER 17. Creating new PDFs

/** Creates a blank document with pages of the given width (in points), height
(in points), and number of pages.
@arg {number} w page width
@arg {number} h page height
@arg {number} number of pages
@return {pdf} PDF document */
function blankDocument(w, h, pages) {}

/** Makes a blank document given a page size and number of pages.
@arg {"paper size"} papersize paper size
@arg {number} pages number of pages
@return {pdf} PDF document */
function blankDocumentPaper(papersize, pages) {}

/** Typesets a UTF8 text file ragged right on a page of size w * h in points
in the given font and font size.
@arg {number} w page width
@arg {number} h page height
@arg {font} font font
@arg {number} fontsize font size
@arg {string} filename file name
@result {pdf} PDF document */
function textToPDF(w, h, font, fontsize, filename) {}

/** Typesets a UTF8 text file ragged right on a page of size w * h in points
in the given font and font size.
@arg {number} w page width
@arg {number} h page height
@arg {font} font font
@arg {number} fontsize font size
@arg {Uint8Array} data text
@result {pdf} PDF document */
function textToPDFMemory(w, h, font, fontsize, data) {}

/** Typesets a UTF8 text file ragged right on a page of the given size in the
given font and font size.
@arg {"paper size"} papersize paper size
@arg {font} font font
@arg {number} fontsize font size
@arg {string} filename file name
@result {pdf} PDF document */
function textToPDFPaper(papersize, font, fontsize, filename) {}

/** Typesets a UTF8 text file ragged right on a page of the given size in the
given font and font size.
@arg {"paper size"} papersize paper size
@arg {font} font font
@arg {number} fontsize font size
@arg {Uint8Array} data text
@result {pdf} PDF document */
function textToPDFPaperMemory(papersize, font, fontsize, data) {}

//CHAPTER 18. Miscellaneous

/** Removes images on the given pages, replacing them with crossed boxes if
'boxes' is true.
@arg {pdf} pdf PDF document
@arg {range} range page range
@arg {boolean} boxes replace with crossed boxes */
function draft(pdf, range, boxes) {}

/** Removes all text from the given pages in a given document.
@arg {pdf} pdf PDF document
@arg {range} range page range */
function removeAllText(pdf, range) {}

/* Blackens all text on the given pages.
@arg {pdf} pdf PDF document
@arg {range} range page range */
function blackText(pdf, range) {}

/** Blackens all lines on the given pages.
@arg {pdf} pdf PDF document
@arg {range} range page range */
function blackLines(pdf, range) {}

/** Blackens all fills on the given pages.
@arg {pdf} pdf PDF document
@arg {range} range page range */
function blackFills(pdf, range) {}

/** Thickens every line less than min_thickness to min_thickness. Thickness
given in points.
@arg {pdf} pdf PDF document
@arg {range} range page range
@arg {number} min_thickness minimum required thickness */
function thinLines(pdf, range, min_thickness) {}

/** Copies the /ID from one document to another.
@arg {pdf} pdf_from source document
@arg {pdf} pdf_to destination document */
function copyId(pdf_from, pdf_to) {}

/** Removes a document's /ID.
@arg {pdf} pdf PDF document */
function removeId(pdf) {}

/** Sets the minor version number of a document.
@arg {pdf} pdf PDF document
@arg {number} version */
function setVersion(pdf, version) {}

/** Sets the full version number of a document.
@arg {pdf} pdf PDF document
@arg {number} major version
@arg {number} minor version */
function setFullVersion(pdf, major, minor) {}

/** Removes any dictionary entry with the given key anywhere in the document.
@arg {pdf} pdf PDF document
@arg {string} key key to remove */
function removeDictEntry(pdf, key) {}

/** Removes any dictionary entry with the given key whose value matches the
given search term.
@arg {pdf} pdf PDF document
@arg {string} key key to remove
@arg {string} searchterm search term */
function removeDictEntrySearch(pdf, key, searchterm) {}

/** Replaces the value associated with the given key.
@arg {pdf} pdf PDF document
@arg {string} key key to remove
@arg {string} newval new value */
function replaceDictEntry(pdf, key, newval) {}

/** Replaces the value associated with the given key if the existing value
matches the search term.
@arg {pdf} pdf PDF document
@arg {string} key key to remove
@arg {string} newval new value
@arg {string} searchterm search term */
function replaceDictEntrySearch(pdf, key, newval, searchterm) {}

/** Removes all clipping from pages in the given range.
@arg {pdf} pdf PDF document
@arg {range} range page range */
function removeClipping(pdf, range) {}

/* Returns a JSON array containing any and all values associated with the
given key.
@arg {pdf} pdf PDF docment
@arg {string} key key
@return {Uint8Array} results as an array of bytes */
function getDictEntries(pdf, key) {}
