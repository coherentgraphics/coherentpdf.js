cpdf = require('./cpdf');
cpdfjs = require('./cpdflibwrapper');

/* CHAPTER 0. Preliminaries */
console.log("***** CHAPTER 0. Preliminaries");
console.log("---cpdf_startup()");
//cpdfjs.startup();
console.log("---cpdf_version()");
console.log("version = %s", cpdfjs.version());
console.log("---cpdf_setFast()");
cpdfjs.setFast();
console.log("---cpdf_setSlow()");
cpdfjs.setSlow();
console.log("---cpdf_clearError()");

/* CHAPTER 1. Basics */
console.log("***** CHAPTER 1. Basics");
console.log("---cpdf_fromFile()");
var pdf = cpdfjs.fromFile("testinputs/cpdflibmanual.pdf", "");
console.log("---cpdf_fromFileLazy()");
var pdf2 = cpdfjs.fromFileLazy("testinputs/cpdflibmanual.pdf", "");
console.log("---cpdf_toMemory()");
var mempdf = cpdfjs.toMemory(pdf, false, false);
console.log("---END OF CHAPTER 1");
/*console.log("---cpdf_fromMemory()");
var frommem = cpdfjs.fromMemory(mempdf, "");
cpdfjs.toFile(frommem, "testoutputs/01fromMemory.pdf", false, false);*/
/*console.log("---cpdf_fromMemoryLazy()");
cpdfjs.Pdf frommemlazy = cpdfjs.fromMemoryLazy(mempdf, "");
cpdfjs.toFile(frommemlazy, "testoutputs/01fromMemoryLazy.pdf", false, false);
cpdfjs.fromMemoryLazyRelease(mempdf);*/
var pdf3 = cpdfjs.blankDocument(153.5, 234.2, 50);
var pdf4 = cpdfjs.blankDocumentPaper(cpdfjs.a4landscape, 50);
console.log("---cpdf: enumerate PDFs");
/*int n = cpdfjs.startEnumeratePDFs();
for (int x = 0; x < n; x++)
{
    int key = cpdfjs.enumeratePDFsKey(x);
    String info = cpdfjs.enumeratePDFsInfo(x);
}
cpdfjs.endEnumeratePDFs(); */
console.log("---cpdf_ptOfIn()");
console.log("One inch is %f points", cpdfjs.ptOfIn(1.0));
console.log("---cpdf_ptOfCm()");
console.log("One centimetre is %f points", cpdfjs.ptOfCm(1.0));
console.log("---cpdf_ptOfMm()");
console.log("One millimetre is %f points", cpdfjs.ptOfMm(1.0));
console.log("---cpdf_inOfPt()");
console.log("One point is %f inches", cpdfjs.inOfPt(1.0));
console.log("---cpdf_cmOfPt()");
console.log("One point is %f centimetres", cpdfjs.cmOfPt(1.0));
console.log("---cpdf_mmOfPt()");
console.log("One point is %f millimetres", cpdfjs.mmOfPt(1.0));
console.log("---cpdf_range()");
/*
cpdfjs.Range range = cpdfjs.range(1, 10);
console.log("---cpdf_all()");
cpdfjs.Range all = cpdfjs.all(pdf3);
console.log("---cpdf_even()");
cpdfjs.Range even = cpdfjs.even(all);
console.log("---cpdf_odd()");
cpdfjs.Range odd = cpdfjs.odd(all);
console.log("---cpdf_rangeUnion()");
cpdfjs.Range union = cpdfjs.rangeUnion(even, odd);
console.log("---cpdf_difference()");
cpdfjs.Range diff = cpdfjs.difference(even, odd);
console.log("---cpdf_removeDuplicates()");
cpdfjs.Range revdup = cpdfjs.removeDuplicates(even);
console.log("---cpdf_rangeLength()");
int length = cpdfjs.rangeLength(even);
console.log("---cpdf_rangeGet()");
int rangeget = cpdfjs.rangeGet(even, 1);
console.log("---cpdf_rangeAdd()");
cpdfjs.Range rangeadd = cpdfjs.rangeAdd(even, 20);
console.log("---cpdf_isInRange()");
boolean isin = cpdfjs.isInRange(even, 2);
console.log("---cpdf_parsePagespec()");
cpdfjs.Range r = cpdfjs.parsePagespec(pdf3, "1-5");
console.log("---cpdf_validatePagespec()");
boolean valid = cpdfjs.validatePagespec("1-4,5,6");
System.out.format("Validating pagespec gives %d\n", valid ? 1 : 0);
console.log("---cpdf_stringOfPagespec()");
String ps = cpdfjs.stringOfPagespec(pdf3, r);
System.out.format("String of pagespec is %s\n", ps);
console.log("---cpdf_blankRange()");
cpdfjs.Range b = cpdfjs.blankRange();*/
pdf10 = cpdfjs.fromFile("testinputs/cpdflibmanual.pdf", "");
/*console.log("---cpdf_pages()");
int pages = cpdfjs.pages(pdf10);
System.out.format("Pages = %d\n", pages);
console.log("---cpdf_pagesFast()");
int pagesfast = cpdfjs.pagesFast("", "testinputs/cpdflibmanual.pdf");
System.out.format("Pages = %d\n", pagesfast);*/
console.log("---cpdf_toFile()");
cpdfjs.toFile(pdf10, "testoutputs/01tofile.pdf", false, false);
console.log("---cpdf_toFileExt()");
cpdfjs.toFileExt(pdf10, "testoutputs/01tofileext.pdf", false, true, true, true, true);
console.log("---cpdf_isEncrypted()");
var isenc = cpdfjs.isEncrypted(pdf10);
console.log("isencrypted:%i", isenc ? 1 : 0);
console.log("---cpdf_isLinearized()");
var lin = cpdfjs.isLinearized("testinputs/cpdfmanual.pdf");
console.log("islinearized:%i", lin ? 1 : 0);
var pdf400 = cpdfjs.fromFile("testinputs/cpdflibmanual.pdf", "");
var pdf401 = cpdfjs.fromFile("testinputs/cpdflibmanual.pdf", "");
var permissions = [cpdfjs.noEdit];
console.log(permissions.length);
console.log("---cpdf_toFileEncrypted()");
cpdfjs.toFileEncrypted(pdf400, cpdfjs.pdf40bit, permissions, "owner", "user", false, false, "testoutputs/01encrypted.pdf");
console.log("---cpdf_toFileEncryptedExt()");
cpdfjs.toFileEncryptedExt(pdf401, cpdfjs.pdf40bit, permissions, "owner", "user", false, false, true, true, true, "testoutputs/01encryptedext.pdf");
console.log("---cpdf_hasPermission()");
var pdfenc = cpdfjs.fromFile("testoutputs/01encrypted.pdf", "user");
/*boolean hasnoedit = cpdfjs.hasPermission(pdfenc, cpdfjs.noEdit);
boolean hasnocopy = cpdfjs.hasPermission(pdfenc, cpdfjs.noCopy);
System.out.format("Haspermission %d, %d\n", hasnoedit ? 1 : 0, hasnocopy ? 1 : 0);
console.log("---cpdf_encryptionKind()");
int enckind = cpdfjs.encryptionKind(pdfenc);
System.out.format("encryption kind is %d\n", enckind);
console.log("---cpdf_decryptPdf()");
cpdfjs.decryptPdf(pdf10, "");
console.log("---cpdf_decryptPdfOwner()");
cpdfjs.decryptPdfOwner(pdf10, "");*/
