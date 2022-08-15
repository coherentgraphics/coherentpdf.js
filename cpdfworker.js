importScripts('dist/cpdf.browser.js')

self.onmessage = function(e) {
   switch (e.data.mtype)
   {
     case 'pdf':
       //Load the PDF from the array of bytes handed to us by index.html
       var pdf = cpdf.fromMemory(e.data.bytes, "");
       self.postMessage({mtype: 'progress', message: '(1/4) PDF loaded successfully from file ...'});
       //Send some metadata back to index.html
       self.postMessage({mtype: 'pages', x: cpdf.pages(pdf)});
       self.postMessage({mtype: 'creator', x: cpdf.getCreator(pdf)});
       self.postMessage({mtype: 'producer', x: cpdf.getProducer(pdf)});
       //If the PDF is encrypted with blank owner password, decrypt it.
       cpdf.decryptPdf(pdf, "");
       self.postMessage({mtype: 'progress', message: '(2/4) File decrypted if necessary...'});
       //Rotate the contents of each page by 10 degrees
       cpdf.rotateContents(pdf, cpdf.all(pdf), 10);
       self.postMessage({mtype: 'progress', message: '(3/4) File rotated....'});
       //Write the result to a PDF file as an array of bytes
       var mem = cpdf.toMemory(pdf, false, false);
       self.postMessage({mtype: 'progress', message: '(4/4) File serialized to memory...'});
       //Send the file back to index.html
       self.postMessage({mtype: 'pdfout', bytes: mem});
       //This worker will be terminated by index.html, so no need to call cpdf.deletePdf
       break;
   }
}
