//Merge example

//Load coherentpdf.js
const coherentpdf = require('./coherentpdf.js');

//Load the file hello.pdf from the current directory
var pdf = coherentpdf.fromFile('hello.pdf', '');

//Merge three copies of it
var merged = coherentpdf.mergeSimple([pdf, pdf, pdf]);

//Write to merged.pdf
coherentpdf.toFile(merged, 'merged.pdf', false, false);

//Clean up the two PDFs
coherentpdf.deletePdf(pdf);
coherentpdf.deletePdf(merged);
