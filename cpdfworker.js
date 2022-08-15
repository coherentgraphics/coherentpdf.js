importScripts('dist/cpdf.browser.js')

self.onmessage = function(e) {
   switch (e.data.mtype)
   {
     case 'pdf':
       var pdf = cpdf.fromMemory(e.data.bytes, "");
       self.postMessage({mtype: 'progress', message: '(1/4) PDF loaded successfully from file ...'});
       self.postMessage({mtype: 'pages', x: cpdf.pages(pdf)});
       self.postMessage({mtype: 'creator', x: cpdf.getCreator(pdf)});
       self.postMessage({mtype: 'producer', x: cpdf.getProducer(pdf)});
       cpdf.decryptPdf(pdf, "");
       self.postMessage({mtype: 'progress', message: '(2/4) File decrypted if necessary...'});
       cpdf.rotateContents(pdf, cpdf.all(pdf), 10);
       self.postMessage({mtype: 'progress', message: '(3/4) File rotated....'});
       var mem = cpdf.toMemory(pdf, false, false);
       self.postMessage({mtype: 'progress', message: '(4/4) File serialized to memory...'});
       self.postMessage({mtype: 'pdfout', bytes: mem});
       break;
   }
}
