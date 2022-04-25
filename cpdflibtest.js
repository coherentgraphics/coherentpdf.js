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
System.out.println("***** CHAPTER 1. Basics");
System.out.println("---cpdf_fromFile()");
pdf = cpdfjs.fromFile("testinputs/cpdflibmanual.pdf", "");
/*System.out.println("---cpdf_fromFileLazy()");
Jcpdf.Pdf pdf2 = jcpdf.fromFileLazy("testinputs/cpdflibmanual.pdf", "");
System.out.println("---cpdf_toMemory()");
byte[] mempdf = jcpdf.toMemory(pdf, false, false);
System.out.println("---cpdf_fromMemory()");
Jcpdf.Pdf frommem = jcpdf.fromMemory(mempdf, "");
jcpdf.toFile(frommem, "testoutputs/01fromMemory.pdf", false, false);
System.out.println("---cpdf_fromMemoryLazy()");
Jcpdf.Pdf frommemlazy = jcpdf.fromMemoryLazy(mempdf, "");
jcpdf.toFile(frommemlazy, "testoutputs/01fromMemoryLazy.pdf", false, false);
jcpdf.fromMemoryLazyRelease(mempdf);
Jcpdf.Pdf pdf3 = jcpdf.blankDocument(153.5, 234.2, 50);
Jcpdf.Pdf pdf4 = jcpdf.blankDocumentPaper(jcpdf.a4landscape, 50);
System.out.println("---cpdf: enumerate PDFs");
int n = jcpdf.startEnumeratePDFs();
for (int x = 0; x < n; x++)
{
    int key = jcpdf.enumeratePDFsKey(x);
    String info = jcpdf.enumeratePDFsInfo(x);
}
jcpdf.endEnumeratePDFs();
System.out.println("---cpdf_ptOfIn()");
System.out.format("One inch is %f points\n", jcpdf.ptOfIn(1.0));
System.out.println("---cpdf_ptOfCm()");
System.out.format("One centimetre is %f points\n", jcpdf.ptOfCm(1.0));
System.out.println("---cpdf_ptOfMm()");
System.out.format("One millimetre is %f points\n", jcpdf.ptOfMm(1.0));
System.out.println("---cpdf_inOfPt()");
System.out.format("One point is %f inches\n", jcpdf.inOfPt(1.0));
System.out.println("---cpdf_cmOfPt()");
System.out.format("One point is %f centimetres\n", jcpdf.cmOfPt(1.0));
System.out.println("---cpdf_mmOfPt()");
System.out.format("One point is %f millimetres\n", jcpdf.mmOfPt(1.0));
System.out.println("---cpdf_range()");
Jcpdf.Range range = jcpdf.range(1, 10);
System.out.println("---cpdf_all()");
Jcpdf.Range all = jcpdf.all(pdf3);
System.out.println("---cpdf_even()");
Jcpdf.Range even = jcpdf.even(all);
System.out.println("---cpdf_odd()");
Jcpdf.Range odd = jcpdf.odd(all);
System.out.println("---cpdf_rangeUnion()");
Jcpdf.Range union = jcpdf.rangeUnion(even, odd);
System.out.println("---cpdf_difference()");
Jcpdf.Range diff = jcpdf.difference(even, odd);
System.out.println("---cpdf_removeDuplicates()");
Jcpdf.Range revdup = jcpdf.removeDuplicates(even);
System.out.println("---cpdf_rangeLength()");
int length = jcpdf.rangeLength(even);
System.out.println("---cpdf_rangeGet()");
int rangeget = jcpdf.rangeGet(even, 1);
System.out.println("---cpdf_rangeAdd()");
Jcpdf.Range rangeadd = jcpdf.rangeAdd(even, 20);
System.out.println("---cpdf_isInRange()");
boolean isin = jcpdf.isInRange(even, 2);
System.out.println("---cpdf_parsePagespec()");
Jcpdf.Range r = jcpdf.parsePagespec(pdf3, "1-5");
System.out.println("---cpdf_validatePagespec()");
boolean valid = jcpdf.validatePagespec("1-4,5,6");
System.out.format("Validating pagespec gives %d\n", valid ? 1 : 0);
System.out.println("---cpdf_stringOfPagespec()");
String ps = jcpdf.stringOfPagespec(pdf3, r);
System.out.format("String of pagespec is %s\n", ps);
System.out.println("---cpdf_blankRange()");
Jcpdf.Range b = jcpdf.blankRange();
Jcpdf.Pdf pdf10 = jcpdf.fromFile("testinputs/cpdflibmanual.pdf", "");
System.out.println("---cpdf_pages()");
int pages = jcpdf.pages(pdf10);
System.out.format("Pages = %d\n", pages);
System.out.println("---cpdf_pagesFast()");
int pagesfast = jcpdf.pagesFast("", "testinputs/cpdflibmanual.pdf");
System.out.format("Pages = %d\n", pagesfast);
System.out.println("---cpdf_toFile()");
jcpdf.toFile(pdf10, "testoutputs/01tofile.pdf", false, false);
System.out.println("---cpdf_toFileExt()");
jcpdf.toFileExt(pdf10, "testoutputs/01tofileext.pdf", false, true, true, true, true);
System.out.println("---cpdf_isEncrypted()");
boolean isenc = jcpdf.isEncrypted(pdf10);
System.out.format("isencrypted:%d\n", isenc ? 1 : 0);
System.out.println("---cpdf_isLinearized()");
boolean lin = jcpdf.isLinearized("testinputs/cpdfmanual.pdf");
System.out.format("islinearized:%d\n", lin ? 1 : 0);
try
   (Jcpdf.Pdf pdf400 = jcpdf.fromFile("testinputs/cpdflibmanual.pdf", "");
    Jcpdf.Pdf pdf401 = jcpdf.fromFile("testinputs/cpdflibmanual.pdf", ""))
{
    int[] permissions = new int[] {jcpdf.noEdit};
    System.out.println("---cpdf_toFileEncrypted()");
    jcpdf.toFileEncrypted(pdf400, jcpdf.pdf40bit, permissions, "owner", "user", false, false, "testoutputs/01encrypted.pdf");
    System.out.println("---cpdf_toFileEncryptedExt()");
    jcpdf.toFileEncryptedExt(pdf401, jcpdf.pdf40bit, permissions, "owner", "user", false, false, true, true, true, "testoutputs/01encryptedext.pdf");
    System.out.println("---cpdf_hasPermission()");
}
try (Jcpdf.Pdf pdfenc = jcpdf.fromFile("testoutputs/01encrypted.pdf", "user"))
{
    boolean hasnoedit = jcpdf.hasPermission(pdfenc, jcpdf.noEdit);
    boolean hasnocopy = jcpdf.hasPermission(pdfenc, jcpdf.noCopy);
    System.out.format("Haspermission %d, %d\n", hasnoedit ? 1 : 0, hasnocopy ? 1 : 0);
    System.out.println("---cpdf_encryptionKind()");
    int enckind = jcpdf.encryptionKind(pdfenc);
    System.out.format("encryption kind is %d\n", enckind);
}
System.out.println("---cpdf_decryptPdf()");
jcpdf.decryptPdf(pdf10, "");
System.out.println("---cpdf_decryptPdfOwner()");
jcpdf.decryptPdfOwner(pdf10, "");*/
