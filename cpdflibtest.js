cpdf = require('./cpdf');
cpdfjs = require('./cpdflibwrapper');

/* CHAPTER 0. Preliminaries */
console.log("***** CHAPTER 0. Preliminaries");
console.log("---cpdf_startup()");
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
/*console.log("---cpdf_fromMemory()");
var frommem = cpdfjs.fromMemory(mempdf, "");
cpdfjs.toFile(frommem, "testoutputs/01fromMemory.pdf", false, false);
console.log("---cpdf_fromMemoryLazy()");
var frommemlazy = cpdfjs.fromMemoryLazy(mempdf, "");
cpdfjs.toFile(frommemlazy, "testoutputs/01fromMemoryLazy.pdf", false, false);*/
var pdf3 = cpdfjs.blankDocument(153.5, 234.2, 50);
var pdf4 = cpdfjs.blankDocumentPaper(cpdfjs.a4landscape, 50);
console.log("---cpdf: enumerate PDFs");
var n = cpdfjs.startEnumeratePDFs();
for (x = 0; x < n; x++)
{
    var key = cpdfjs.enumeratePDFsKey(x);
    var info = cpdfjs.enumeratePDFsInfo(x);
}
cpdfjs.endEnumeratePDFs();
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
var range = cpdfjs.range(1, 10);
console.log("---cpdf_all()");
var all = cpdfjs.all(pdf3);
console.log("---cpdf_even()");
var even = cpdfjs.even(all);
console.log("---cpdf_odd()");
var odd = cpdfjs.odd(all);
console.log("---cpdf_rangeUnion()");
var union = cpdfjs.rangeUnion(even, odd);
console.log("---cpdf_difference()");
var diff = cpdfjs.difference(even, odd);
console.log("---cpdf_removeDuplicates()");
var revdup = cpdfjs.removeDuplicates(even);
console.log("---cpdf_rangeLength()");
var length = cpdfjs.rangeLength(even);
console.log("---cpdf_rangeGet()");
var rangeget = cpdfjs.rangeGet(even, 1);
console.log("---cpdf_rangeAdd()");
var rangeadd = cpdfjs.rangeAdd(even, 20);
console.log("---cpdf_isInRange()");
var isin = cpdfjs.isInRange(even, 2);
console.log("---cpdf_parsePagespec()");
var r = cpdfjs.parsePagespec(pdf3, "1-5");
console.log("---cpdf_validatePagespec()");
var valid = cpdfjs.validatePagespec("1-4,5,6");
console.log("Validating pagespec gives %d", valid ? 1 : 0);
console.log("---cpdf_stringOfPagespec()");
var ps = cpdfjs.stringOfPagespec(pdf3, r);
console.log("String of pagespec is %s", ps);
console.log("---cpdf_blankRange()");
var b = cpdfjs.blankRange();
pdf10 = cpdfjs.fromFile("testinputs/cpdflibmanual.pdf", "");
console.log("---cpdf_pages()");
var pages = cpdfjs.pages(pdf10);
console.log("Pages = %i", pages);
console.log("---cpdf_pagesFast()");
var pagesfast = cpdfjs.pagesFast("", "testinputs/cpdflibmanual.pdf");
console.log("Pages = %i", pagesfast);
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
var hasnoedit = cpdfjs.hasPermission(pdfenc, cpdfjs.noEdit);
var hasnocopy = cpdfjs.hasPermission(pdfenc, cpdfjs.noCopy);
console.log("Haspermission %d, %d", hasnoedit ? 1 : 0, hasnocopy ? 1 : 0);
console.log("---cpdf_encryptionKind()");
var enckind = cpdfjs.encryptionKind(pdfenc);
console.log("encryption kind is %d", enckind);
console.log("---cpdf_decryptPdf()");
cpdfjs.decryptPdf(pdf10, "");
console.log("---cpdf_decryptPdfOwner()");
cpdfjs.decryptPdfOwner(pdf10, "");

/* CHAPTER 2. Merging and Splitting */
console.log("***** CHAPTER 2. Merging and Splitting");
var pdf11 = cpdfjs.fromFile("testinputs/cpdflibmanual.pdf", "");
var selectrange = cpdfjs.range(1, 3);
console.log("---cpdf_mergeSimple()");
var arr = [pdf11, pdf11, pdf11];
var merged = cpdfjs.mergeSimple(arr);
cpdfjs.toFile(merged, "testoutputs/02merged.pdf", false, true);
console.log("---cpdf_merge()");
var merged2 = cpdfjs.merge(arr, false, false);
cpdfjs.toFile(merged2, "testoutputs/02merged2.pdf", false, true);
console.log("---cpdf_mergeSame()");
var all = cpdfjs.all(pdf11);
var ranges = [all, all, all];
var merged3 = cpdfjs.mergeSame(arr, false, false, ranges);
cpdfjs.toFile(merged3, "testoutputs/02merged3.pdf", false, false);
console.log("---cpdf_selectPages()");
var pdf12 = cpdfjs.selectPages(pdf11, selectrange);
cpdfjs.toFile(pdf12, "testoutputs/02selected.pdf", false, false);

/* CHAPTER 3. Pages */
console.log("***** CHAPTER 3. Pages");
var pagespdf1 = cpdfjs.fromFile("testinputs/cpdflibmanual.pdf", "");
var r1 = cpdfjs.all(pagespdf1);
var pagespdf2 = cpdfjs.fromFile("testinputs/cpdflibmanual.pdf", "");
var r2 = cpdfjs.all(pagespdf2);
var pagespdf3 = cpdfjs.fromFile("testinputs/cpdflibmanual.pdf", "");
var r3 = cpdfjs.all(pagespdf3);
var pagespdf4 = cpdfjs.fromFile("testinputs/cpdflibmanual.pdf", "");
var r4 = cpdfjs.all(pagespdf4);
var pagespdf5 = cpdfjs.fromFile("testinputs/cpdflibmanual.pdf", "");
var r5 = cpdfjs.all(pagespdf5);
var pagespdf6 = cpdfjs.fromFile("testinputs/cpdflibmanual.pdf", "");
var r6 = cpdfjs.all(pagespdf6);
var pagespdf7 = cpdfjs.fromFile("testinputs/cpdflibmanual.pdf", "");
var r7 = cpdfjs.all(pagespdf7);
var pagespdf8 = cpdfjs.fromFile("testinputs/cpdflibmanual.pdf", "");
var r8 = cpdfjs.all(pagespdf8);
var pagespdf9 = cpdfjs.fromFile("testinputs/cpdflibmanual.pdf", "");
var r9 = cpdfjs.all(pagespdf9);
var pagespdf10 = cpdfjs.fromFile("testinputs/cpdflibmanual.pdf", "");
var r10 = cpdfjs.all(pagespdf10);
var pagespdf11 = cpdfjs.fromFile("testinputs/cpdflibmanual.pdf", "");
var r11 = cpdfjs.all(pagespdf11);
var pagespdf12 = cpdfjs.fromFile("testinputs/cpdflibmanual.pdf", "");
var r12 = cpdfjs.all(pagespdf12);
var pagespdf13 = cpdfjs.fromFile("testinputs/cpdflibmanual.pdf", "");
var r13 = cpdfjs.all(pagespdf13);
var pagespdf14 = cpdfjs.fromFile("testinputs/cpdflibmanual.pdf", "");
var r14 = cpdfjs.all(pagespdf14);
var pagespdf15 = cpdfjs.fromFile("testinputs/cpdflibmanual.pdf", "");
var r15 = cpdfjs.all(pagespdf15);
var pagespdf16 = cpdfjs.fromFile("testinputs/cpdflibmanual.pdf", "");
var r16 = cpdfjs.all(pagespdf16);
var pagespdf17 = cpdfjs.fromFile("testinputs/cpdflibmanual.pdf", "");
var r17 = cpdfjs.all(pagespdf17);
var pagespdf18 = cpdfjs.fromFile("testinputs/cpdflibmanual.pdf", "");
var r18 = cpdfjs.all(pagespdf18);
var pagespdf19 = cpdfjs.fromFile("testinputs/cpdflibmanual.pdf", "");
var r19 = cpdfjs.all(pagespdf19);
console.log("---cpdf_scalePages()");
cpdfjs.scalePages(pagespdf1, r1, 1.5, 1.8);
cpdfjs.toFile(pagespdf1, "testoutputs/03scalepages.pdf", false, false);
console.log("---cpdf_scaleToFit()");
cpdfjs.scaleToFit(pagespdf2, r2, 1.5, 1.8, 0.9);
cpdfjs.toFile(pagespdf2, "testoutputs/03scaletofit.pdf", false, false);
console.log("---cpdf_scaleToFitPaper()");
cpdfjs.scaleToFitPaper(pagespdf3, r3, cpdfjs.a4portrait, 0.8);
cpdfjs.toFile(pagespdf3, "testoutputs/03scaletofitpaper.pdf", false, false);
console.log("---cpdf_scaleContents()");
cpdfjs.scaleContents(pagespdf4, r4, cpdfjs.topLeft, 20.0, 20.0, 2.0);
cpdfjs.toFile(pagespdf4, "testoutputs/03scalecontents.pdf", false, false);
console.log("---cpdf_shiftContents()");
cpdfjs.shiftContents(pagespdf5, r5, 1.5, 1.25);
cpdfjs.toFile(pagespdf5, "testoutputs/03shiftcontents.pdf", false, false);
console.log("---cpdf_rotate()");
cpdfjs.rotate(pagespdf6, r6, 90);
cpdfjs.toFile(pagespdf6, "testoutputs/03rotate.pdf", false, false);
console.log("---cpdf_rotateBy()");
cpdfjs.rotateBy(pagespdf7, r7, 90);
cpdfjs.toFile(pagespdf7, "testoutputs/03rotateby.pdf", false, false);
console.log("---cpdf_rotateContents()");
cpdfjs.rotateContents(pagespdf8, r8, 35.0);
cpdfjs.toFile(pagespdf8, "testoutputs/03rotatecontents.pdf", false, false);
console.log("---cpdf_upright()");
cpdfjs.upright(pagespdf9, r9);
cpdfjs.toFile(pagespdf9, "testoutputs/03upright.pdf", false, false);
console.log("---cpdf_hFlip()");
cpdfjs.hFlip(pagespdf10, r10);
cpdfjs.toFile(pagespdf10, "testoutputs/03hflip.pdf", false, false);
console.log("---cpdf_vFlip()");
cpdfjs.vFlip(pagespdf11, r11);
cpdfjs.toFile(pagespdf11, "testoutputs/03vflip.pdf", false, false);
console.log("---cpdf_crop()");
cpdfjs.crop(pagespdf12, r12, 0.0, 0.0, 400.0, 500.0);
cpdfjs.toFile(pagespdf12, "testoutputs/03crop.pdf", false, false);
console.log("---cpdf_trimMarks()");
cpdfjs.trimMarks(pagespdf13, r13);
cpdfjs.toFile(pagespdf13, "testoutputs/03trim_marks.pdf", false, false);
console.log("---cpdf_showBoxes()");
cpdfjs.showBoxes(pagespdf14, r14);
cpdfjs.toFile(pagespdf14, "testoutputs/03show_boxes.pdf", false, false);
console.log("---cpdf_hardBox()");
cpdfjs.hardBox(pagespdf15, r15, "/MediaBox");
cpdfjs.toFile(pagespdf15, "testoutputs/03hard_box.pdf", false, false);
console.log("---cpdf_removeCrop()");
cpdfjs.removeCrop(pagespdf16, r16);
cpdfjs.toFile(pagespdf16, "testoutputs/03remove_crop.pdf", false, false);
console.log("---cpdf_removeTrim()");
cpdfjs.removeTrim(pagespdf17, r17);
cpdfjs.toFile(pagespdf17, "testoutputs/03remove_trim.pdf", false, false);
console.log("---cpdf_removeArt()");
cpdfjs.removeArt(pagespdf18, r18);
cpdfjs.toFile(pagespdf18, "testoutputs/03remove_art.pdf", false, false);
console.log("---cpdf_removeBleed()");
cpdfjs.removeBleed(pagespdf19, r19);
cpdfjs.toFile(pagespdf19, "testoutputs/03remove_bleed.pdf", false, false);
        
/* CHAPTER 4. Encryption */
/* Encryption covered under Chapter 1 in cpdflib. */

/* CHAPTER 5. Compression */
console.log("***** CHAPTER 5. Compression");
var pdf16 = cpdfjs.fromFile("testinputs/cpdflibmanual.pdf", "")
console.log("---cpdf_compress()");
cpdfjs.compress(pdf16);
cpdfjs.toFile(pdf16, "testoutputs/05compressed.pdf", false, false);
console.log("---cpdf_decompress()");
cpdfjs.decompress(pdf16);
cpdfjs.toFile(pdf16, "testoutputs/05decompressed.pdf", false, false);
console.log("---cpdf_squeezeInMemory()");
cpdfjs.squeezeInMemory(pdf16);
cpdfjs.toFile(pdf16, "testoutputs/05squeezedinmemory.pdf", false, false);
 
/*    static void chapter6(Jcpdf jcpdf) throws Jcpdf.CpdfError
    {
        CHAPTER 6. Bookmarks
        System.out.println("***** CHAPTER 6. Bookmarks");
        Jcpdf.Pdf pdf17 = jcpdf.fromFile("testinputs/cpdflibmanual.pdf", "");
        System.out.println("---cpdf: get bookmarks");
        jcpdf.startGetBookmarkInfo(pdf17);
        int nb = jcpdf.numberBookmarks();
        System.out.format("There are %d bookmarks\n", nb);
        for (int b2 = 0; b2 < nb; b2++)
        {
            int level = jcpdf.getBookmarkLevel(b2);
            int page = jcpdf.getBookmarkPage(pdf17, b2);
            String text = jcpdf.getBookmarkText(b2);
            boolean open = jcpdf.getBookmarkOpenStatus(b2);
            System.out.format("Bookmark at level %d points to page %d and has text \"%s\" and open %d\n", level, page, text, open ? 1 : 0);
        }
        jcpdf.endGetBookmarkInfo();
        System.out.println("---cpdf: set bookmarks");
        jcpdf.startSetBookmarkInfo(1);
        jcpdf.setBookmarkLevel(0, 0);
        jcpdf.setBookmarkPage(pdf17, 0, 20);
        jcpdf.setBookmarkOpenStatus(0, true);
        jcpdf.setBookmarkText(0, "New bookmark!");
        jcpdf.endSetBookmarkInfo(pdf17);
        jcpdf.toFile(pdf17, "testoutputs/06newmarks.pdf", false, false);
        System.out.println("---cpdf_getBookmarksJSON()");
        Jcpdf.Pdf marksjson = jcpdf.fromFile("testinputs/cpdflibmanual.pdf", "");
        byte[] marksdata = jcpdf.getBookmarksJSON(marksjson);
        System.out.format("Contains %d bytes of data\n", marksdata.length);
        System.out.println("---cpdf_setBookmarksJSON()");
        jcpdf.setBookmarksJSON(marksjson, marksdata);
        jcpdf.toFile(marksjson, "testoutputs/06jsonmarks.pdf", false, false);
        System.out.println("---cpdf_tableOfContents()");
        Jcpdf.Pdf toc = jcpdf.fromFile("testinputs/cpdflibmanual.pdf", "");
        jcpdf.tableOfContents(toc, jcpdf.timesRoman, 12.0, "Table of Contents", false);
        jcpdf.toFile(toc, "testoutputs/06toc.pdf", false, false);
        pdf17.close();
        marksjson.close();
        toc.close();
    }
   
    static void chapter7(Jcpdf jcpdf) throws Jcpdf.CpdfError
    {
        CHAPTER 7. Presentations
        Not included in the library version.
    }
   
    static void chapter8(Jcpdf jcpdf) throws Jcpdf.CpdfError
    {
        CHAPTER 8. Logos, Watermarks and Stamps
        System.out.println("***** CHAPTER 8. Logos, Watermarks and Stamps");
        Jcpdf.Pdf textfile = jcpdf.fromFile("testinputs/cpdflibmanual.pdf", "");
        System.out.println("---cpdf_addText()");
        Jcpdf.Range all = jcpdf.all(textfile);
        jcpdf.addText(false,
                     textfile,
                     all,
                     "Some Text~~~~~~~~~~!",
                     jcpdf.topLeft, 20.0, 20.0,
                     1.0,
                     1,
                     jcpdf.timesRoman,
                     20.0,
                     0.5,
                     0.5,
                     0.5,
                     false,
                     false,
                     true,
                     0.5,
                     jcpdf.leftJustify,
                     false,
                     false,
                     "",
                     1.0,
                     false);
        System.out.println("---cpdf_addTextSimple()");
        jcpdf.addTextSimple(textfile, all, "The text!", jcpdf.topLeft, 20.0, 20.0, jcpdf.timesRoman, 50.0);
        jcpdf.toFile(textfile, "testoutputs/08added_text.pdf", false, false);
        System.out.println("---cpdf_removeText()");
        jcpdf.removeText(textfile, all);
        jcpdf.toFile(textfile, "testoutputs/08removed_text.pdf", false, false);
        System.out.println("---cpdf_textWidth()");
        int w = jcpdf.textWidth(jcpdf.timesRoman, "What is the width of this?");
        Jcpdf.Pdf stamp = jcpdf.fromFile("testinputs/logo.pdf", "");
        Jcpdf.Pdf stampee = jcpdf.fromFile("testinputs/cpdflibmanual.pdf", "");
        Jcpdf.Range stamp_range = jcpdf.all(stamp);
        System.out.println("---cpdf_stampOn()");
        jcpdf.stampOn(stamp, stampee, stamp_range);
        System.out.println("---cpdf_stampUnder()");
        jcpdf.stampUnder(stamp, stampee, stamp_range);
        System.out.println("---cpdf_stampExtended()");
        jcpdf.stampExtended(stamp, stampee, stamp_range, true, true, jcpdf.topLeft, 20.0, 20.0, true);
        jcpdf.toFile(stamp, "testoutputs/08stamp_after.pdf", false, false);
        jcpdf.toFile(stampee, "testoutputs/08stampee_after.pdf", false, false);
        Jcpdf.Pdf c1 = jcpdf.fromFile("testinputs/logo.pdf", "");
        Jcpdf.Pdf c2 = jcpdf.fromFile("testinputs/cpdflibmanual.pdf", "");
        System.out.println("---cpdf_combinePages()");
        Jcpdf.Pdf c3 = jcpdf.combinePages(c1, c2);
        jcpdf.toFile(c3, "testoutputs/08c3after.pdf", false, false);
        System.out.println("---cpdf_stampAsXObject()");
        Jcpdf.Pdf undoc = jcpdf.fromFile("testinputs/cpdflibmanual.pdf", "");
        Jcpdf.Pdf ulogo = jcpdf.fromFile("testinputs/logo.pdf", "");
        Jcpdf.Range undoc_all = jcpdf.all(undoc);
        String name = jcpdf.stampAsXObject(undoc, undoc_all, ulogo);
        String content = String.format("q 1 0 0 1 100 100 cm %s Do Q q 1 0 0 1 300 300 cm %s Do Q q 1 0 0 1 500 500 cm %s Do Q", name, name, name);
        System.out.println("---cpdf_addContent()");
        jcpdf.addContent(content, true, undoc, undoc_all);
        jcpdf.toFile(undoc, "testoutputs/08demo.pdf", false, false);
        textfile.close();
        stamp.close();
        stampee.close();
        c1.close();
        c2.close();
        c3.close();
        undoc.close();
        ulogo.close();
        all.close();
        stamp_range.close();
        undoc_all.close();
    }
   
    static void chapter9(Jcpdf jcpdf) throws Jcpdf.CpdfError
    {
        CHAPTER 9. Multipage facilities
        System.out.println("***** CHAPTER 9. Multipage facilities");
        try
            (Jcpdf.Pdf mp = jcpdf.fromFile("testinputs/cpdflibmanual.pdf", "");
             Jcpdf.Pdf mp2 = jcpdf.fromFile("testinputs/cpdflibmanual.pdf", "");
             Jcpdf.Pdf mp25 = jcpdf.fromFile("testinputs/cpdflibmanual.pdf", "");
             Jcpdf.Pdf mp26 = jcpdf.fromFile("testinputs/cpdflibmanual.pdf", "");
             Jcpdf.Pdf mp3 = jcpdf.fromFile("testinputs/cpdflibmanual.pdf", "");
             Jcpdf.Pdf mp4 = jcpdf.fromFile("testinputs/cpdflibmanual.pdf", "");
             Jcpdf.Pdf mp5 = jcpdf.fromFile("testinputs/cpdflibmanual.pdf", "");
             Jcpdf.Pdf mp6 = jcpdf.fromFile("testinputs/cpdflibmanual.pdf", "");
             Jcpdf.Pdf mp7 = jcpdf.fromFile("testinputs/cpdflibmanual.pdf", ""))
        {
            System.out.println("---cpdf_twoUp()");
            jcpdf.twoUp(mp);
            jcpdf.toFile(mp, "testoutputs/09mp.pdf", false, false);
            System.out.println("---cpdf_twoUpStack()");
            jcpdf.twoUpStack(mp2);
            jcpdf.toFile(mp2, "testoutputs/09mp2.pdf", false, false);
            System.out.println("---cpdf_impose()");
            jcpdf.impose(mp25, 5.0, 4.0, false, false, false, false, false, 40.0, 20.0, 2.0);
            jcpdf.toFile(mp25, "testoutputs/09mp25.pdf", false, false);
            jcpdf.impose(mp26, 2000.0, 1000.0, true, false, false, false, false, 40.0, 20.0, 2.0);
            jcpdf.toFile(mp26, "testoutputs/09mp26.pdf", false, false);
            System.out.println("---cpdf_padBefore()");
            Jcpdf.Range r = jcpdf.range(1, 10);
            jcpdf.padBefore(mp3, r);
            jcpdf.toFile(mp3, "testoutputs/09mp3.pdf", false, false);
            System.out.println("---cpdf_padAfter()");
            jcpdf.padAfter(mp4, r);
            jcpdf.toFile(mp4, "testoutputs/09mp4.pdf", false, false);
            System.out.println("---cpdf_padEvery()");
            jcpdf.padEvery(mp5, 5);
            jcpdf.toFile(mp5, "testoutputs/09mp5.pdf", false, false);
            System.out.println("---cpdf_padMultiple()");
            jcpdf.padMultiple(mp6, 10);
            jcpdf.toFile(mp6, "testoutputs/09mp6.pdf", false, false);
            System.out.println("---cpdf_padMultipleBefore()");
            jcpdf.padMultipleBefore(mp7, 23);
            jcpdf.toFile(mp7, "testoutputs/09mp7.pdf", false, false);
            r.close();
        }
    }
   
    static void chapter10(Jcpdf jcpdf) throws Jcpdf.CpdfError
    {
        CHAPTER 10. Annotations
        System.out.println("***** CHAPTER 10. Annotations");
        System.out.println("---cpdf_annotationsJSON()");
        Jcpdf.Pdf annot = jcpdf.fromFile("testinputs/cpdflibmanual.pdf", "");
        byte[] annotjson = jcpdf.annotationsJSON(annot);
        System.out.format("Contains %d bytes of data\n", annotjson.length);
        annot.close();
    }
   
    static void chapter11(Jcpdf jcpdf) throws Jcpdf.CpdfError
    {
        CHAPTER 11. Document Information and Metadata
        System.out.println("***** CHAPTER 11. Document Information and Metadata");
        Jcpdf.Pdf pdf30 = jcpdf.fromFile("testinputs/cpdflibmanual.pdf", "");
        Jcpdf.Range pdf30all = jcpdf.all(pdf30);
        System.out.println("---cpdf_getVersion()");
        int v = jcpdf.getVersion(pdf30);
        System.out.format("minor version:%d\n", v);
        System.out.println("---cpdf_getMajorVersion()");
        int v2 = jcpdf.getMajorVersion(pdf30);
        System.out.format("major version:%d\n", v2);
        System.out.println("---cpdf_getTitle()");
        String title = jcpdf.getTitle(pdf30);
        System.out.format("title: %s\n", title);
        System.out.println("---cpdf_getAuthor()");
        String author = jcpdf.getAuthor(pdf30);
        System.out.format("author: %s\n", author);
        System.out.println("---cpdf_getSubject()");
        String subject = jcpdf.getSubject(pdf30);
        System.out.format("subject: %s\n", subject);
        System.out.println("---cpdf_getKeywords()");
        String keywords = jcpdf.getKeywords(pdf30);
        System.out.format("keywords: %s\n", keywords);
        System.out.println("---cpdf_getCreator()");
        String creator = jcpdf.getCreator(pdf30);
        System.out.format("creator: %s\n", creator);
        System.out.println("---cpdf_getProducer()");
        String producer = jcpdf.getProducer(pdf30);
        System.out.format("producer: %s\n", producer);
        System.out.println("---cpdf_getCreationDate()");
        String creationdate = jcpdf.getCreationDate(pdf30);
        System.out.format("creationdate: %s\n", creationdate);
        System.out.println("---cpdf_getModificationDate()");
        String modificationdate = jcpdf.getModificationDate(pdf30);
        System.out.format("modificationdate: %s\n", modificationdate);
        System.out.println("---cpdf_getTitleXMP()");
        String titlexmp = jcpdf.getTitleXMP(pdf30);
        System.out.format("titleXMP: %s\n", titlexmp);
        System.out.println("---cpdf_getAuthorXMP()");
        String authorxmp = jcpdf.getAuthorXMP(pdf30);
        System.out.format("authorXMP: %s\n", authorxmp);
        System.out.println("---cpdf_getSubjectXMP()");
        String subjectxmp = jcpdf.getSubjectXMP(pdf30);
        System.out.format("subjectXMP: %s\n", subjectxmp);
        System.out.println("---cpdf_getKeywordsXMP()");
        String keywordsxmp = jcpdf.getKeywordsXMP(pdf30);
        System.out.format("keywordsXMP: %s\n", keywordsxmp);
        System.out.println("---cpdf_getCreatorXMP()");
        String creatorxmp = jcpdf.getCreatorXMP(pdf30);
        System.out.format("creatorXMP: %s\n", creatorxmp);
        System.out.println("---cpdf_getProducerXMP()");
        String producerxmp = jcpdf.getProducerXMP(pdf30);
        System.out.format("producerXMP: %s\n", producerxmp);
        System.out.println("---cpdf_getCreationDateXMP()");
        String creationdatexmp = jcpdf.getCreationDateXMP(pdf30);
        System.out.format("creationdateXMP: %s\n", creationdatexmp);
        System.out.println("---cpdf_getModificationDateXMP()");
        String modificationdatexmp = jcpdf.getModificationDateXMP(pdf30);
        System.out.format("modificationdateXMP: %s\n", modificationdatexmp);
        System.out.println("---cpdf_setTitle()");
        jcpdf.setTitle(pdf30, "title");
        System.out.println("---cpdf_setAuthor()");
        jcpdf.setAuthor(pdf30, "author");
        System.out.println("---cpdf_setSubject()");
        jcpdf.setSubject(pdf30, "subject");
        System.out.println("---cpdf_setKeywords()");
        jcpdf.setKeywords(pdf30, "keywords");
        System.out.println("---cpdf_setCreator()");
        jcpdf.setCreator(pdf30, "creator");
        System.out.println("---cpdf_setProducer()");
        jcpdf.setProducer(pdf30, "producer");
        System.out.println("---cpdf_setCreationDate()");
        jcpdf.setCreationDate(pdf30, "now");
        System.out.println("---cpdf_setModificationDate()");
        jcpdf.setModificationDate(pdf30, "now");
        System.out.println("---cpdf_setTitleXMP()");
        jcpdf.setTitleXMP(pdf30, "title");
        System.out.println("---cpdf_setAuthorXMP()");
        jcpdf.setAuthorXMP(pdf30, "author");
        System.out.println("---cpdf_setSubjectXMP()");
        jcpdf.setSubjectXMP(pdf30, "subject");
        System.out.println("---cpdf_setKeywordsXMP()");
        jcpdf.setKeywordsXMP(pdf30, "keywords");
        System.out.println("---cpdf_setCreatorXMP()");
        jcpdf.setCreatorXMP(pdf30, "creator");
        System.out.println("---cpdf_setProducerXMP()");
        jcpdf.setProducerXMP(pdf30, "producer");
        System.out.println("---cpdf_setCreationDateXMP()");
        jcpdf.setCreationDateXMP(pdf30, "now");
        System.out.println("---cpdf_setModificationDateXMP()");
        jcpdf.setModificationDateXMP(pdf30, "now");
        jcpdf.toFile(pdf30, "testoutputs/11setinfo.pdf", false, false);
        int[] t = {0, 0, 0, 0, 0, 0, 0, 0};
        System.out.println("---cpdf_getDateComponents()");
        jcpdf.getDateComponents("D:20061108125017Z", t);
        System.out.format("D:20061108125017Z = %d, %d, %d, %d, %d, %d, %d, %d\n", t[0], t[1], t[2], t[3], t[4], t[5], t[6], t[7]);
        System.out.println("---cpdf_dateStringOfComponents()");
        String datestr = jcpdf.dateStringOfComponents(t[0], t[1], t[2], t[3], t[4], t[5], t[6], t[7]);
        System.out.println(datestr);
        System.out.println("---cpdf_getPageRotation()");
        int rot = jcpdf.getPageRotation(pdf30, 1);
        System.out.format("/Rotate on page 1 = %d\n", rot);
        System.out.println("---cpdf_hasBox()");
        boolean hasbox = jcpdf.hasBox(pdf30, 1, "/CropBox");
        System.out.format("hasbox: %d\n", hasbox ? 1 : 0);
        System.out.println("---cpdf_getMediaBox()");
        double[] b4 = {0.0, 0.0, 0.0, 0.0};
        jcpdf.getMediaBox(pdf30, 1, b4);
        System.out.format("Media: %f %f %f %f\n", b4[0], b4[1], b4[2], b4[3]);
        System.out.println("---cpdf_getCropBox()");
        jcpdf.getCropBox(pdf30, 1, b4);
        System.out.format("Crop: %f %f %f %f\n", b4[0], b4[1], b4[2], b4[3]);
        System.out.println("---cpdf_getBleedBox()");
        jcpdf.getBleedBox(pdf30, 1, b4);
        System.out.format("Bleed: %f %f %f %f\n", b4[0], b4[1], b4[2], b4[3]);
        System.out.println("---cpdf_getArtBox()");
        jcpdf.getArtBox(pdf30, 1, b4);
        System.out.format("Art: %f %f %f %f\n", b4[0], b4[1], b4[2], b4[3]);
        System.out.println("---cpdf_getTrimBox()");
        jcpdf.getTrimBox(pdf30, 1, b4);
        System.out.format("Trim: %f %f %f %f\n", b4[0], b4[1], b4[2], b4[3]);
        System.out.println("---cpdf_setMediaBox()");
        jcpdf.setMediabox(pdf30, pdf30all, 100, 500, 150, 550);
        System.out.println("---cpdf_setCropBox()");
        jcpdf.setCropBox(pdf30, pdf30all, 100, 500, 150, 550);
        System.out.println("---cpdf_setTrimBox()");
        jcpdf.setTrimBox(pdf30, pdf30all, 100, 500, 150, 550);
        System.out.println("---cpdf_setArtBox()");
        jcpdf.setArtBox(pdf30, pdf30all, 100, 500, 150, 550);
        System.out.println("---cpdf_setBleedBox()");
        jcpdf.setBleedBox(pdf30, pdf30all, 100, 500, 150, 550);
        jcpdf.toFile(pdf30, "testoutputs/11setboxes.pdf", false, false);
        System.out.println("---cpdf_markTrapped()");
        jcpdf.markTrapped(pdf30);
        System.out.println("---cpdf_markTrappedXMP()");
        jcpdf.markTrappedXMP(pdf30);
        jcpdf.toFile(pdf30, "testoutputs/11trapped.pdf", false, false);
        System.out.println("---cpdf_markUntrapped()");
        jcpdf.markUntrapped(pdf30);
        System.out.println("---cpdf_markUntrappedXMP()");
        jcpdf.markUntrappedXMP(pdf30);
        jcpdf.toFile(pdf30, "testoutputs/11untrapped.pdf", false, false);
        System.out.println("---cpdf_setPageLayout()");
        jcpdf.setPageLayout(pdf30, jcpdf.twoColumnLeft);
        System.out.println("---cpdf_setPageMode()");
        jcpdf.setPageMode(pdf30, jcpdf.useOutlines);
        System.out.println("---cpdf_hideToolbar()");
        jcpdf.hideToolbar(pdf30, true);
        System.out.println("---cpdf_hideMenubar()");
        jcpdf.hideMenubar(pdf30, true);
        System.out.println("---cpdf_hideWindowUi()");
        jcpdf.hideWindowUi(pdf30, true);
        System.out.println("---cpdf_fitWindow()");
        jcpdf.fitWindow(pdf30, true);
        System.out.println("---cpdf_centerWindow()");
        jcpdf.centerWindow(pdf30, true);
        System.out.println("---cpdf_displayDocTitle()");
        jcpdf.displayDocTitle(pdf30, true);
        System.out.println("---cpdf_openAtPage()");
        jcpdf.openAtPage(pdf30, true, 4);
        jcpdf.toFile(pdf30, "testoutputs/11open.pdf", false, false);
        System.out.println("---cpdf_setMetadataFromFile()");
        jcpdf.setMetadataFromFile(pdf30, "testinputs/cpdflibmanual.pdf");
        jcpdf.toFile(pdf30, "testoutputs/11metadata1.pdf", false, false);
        System.out.println("---cpdf_setMetadataFromByteArray()");
        byte[] md = "BYTEARRAY".getBytes();
        jcpdf.setMetadataFromByteArray(pdf30, md);
        jcpdf.toFile(pdf30, "testoutputs/11metadata2.pdf", false, false);
        System.out.println("---cpdf_getMetadata()");
        byte[] metadata = jcpdf.getMetadata(pdf30);
        System.out.println("---cpdf_removeMetadata()");
        jcpdf.removeMetadata(pdf30);
        System.out.println("---cpdf_createMetadata()");
        jcpdf.createMetadata(pdf30);
        jcpdf.toFile(pdf30, "testoutputs/11metadata3.pdf", false, false);
        System.out.println("---cpdf_setMetadataDate()");
        jcpdf.setMetadataDate(pdf30, "now");
        jcpdf.toFile(pdf30, "testoutputs/11metadata4.pdf", false, false);
        System.out.println("---cpdf_addPageLabels()");
        jcpdf.addPageLabels(pdf30, jcpdf.uppercaseRoman, "PREFIX-", 1, pdf30all, false);
        System.out.println("---cpdf: get page labels");
        int pls = jcpdf.startGetPageLabels(pdf30);
        System.out.format("There are %d labels\n", pls);
        for (int plsc = 0; plsc < pls; plsc++)
        {
            int style = jcpdf.getPageLabelStyle(plsc);
            String prefix = jcpdf.getPageLabelPrefix(plsc);
            int offset = jcpdf.getPageLabelOffset(plsc);
            int lab_range = jcpdf.getPageLabelRange(plsc);
            System.out.format("Page label: %d, %s, %d, %d\n", style, prefix, offset, lab_range);
        }
        jcpdf.endGetPageLabels();
        System.out.println("---cpdf_removePageLabels()");
        jcpdf.removePageLabels(pdf30);
        jcpdf.toFile(pdf30, "testoutputs/11pagelabels.pdf", false, false);
        System.out.println("---cpdf_getPageLabelStringForPage()");
        String pl = jcpdf.getPageLabelStringForPage(pdf30, 1);
        System.out.format("Label string is %s\n", pl);
        pdf30.close();
        pdf30all.close();
    }
   
    static void chapter12(Jcpdf jcpdf) throws Jcpdf.CpdfError
    {
        CHAPTER 12. File Attachments
        System.out.println("***** CHAPTER 12. File Attachments");
        Jcpdf.Pdf attachments = jcpdf.fromFile("testinputs/has_attachments.pdf", "");
        System.out.println("---cpdf_attachFile()");
        jcpdf.attachFile("testinputs/image.pdf", attachments);
        System.out.println("---cpdf_attachFileToPage()");
        jcpdf.attachFileToPage("testinputs/image.pdf", attachments, 1);
        System.out.println("---cpdf_attachFileFromMemory()");
        byte[] empty = {};
        jcpdf.attachFileFromMemory(empty, "metadata.txt", attachments);
        System.out.println("---cpdf_attachFileToPageFromMemory()");
        jcpdf.attachFileToPageFromMemory(empty, "metadata.txt", attachments, 1);
        jcpdf.toFile(attachments, "testoutputs/12with_attachments.pdf", false, false);
        System.out.println("---cpdf: get attachments");
        jcpdf.startGetAttachments(attachments);
        int n_a = jcpdf.numberGetAttachments();
        System.out.format("There are %d attachments to get\n", n_a);
        for (int aa = 0; aa < n_a; aa++)
        {
            String a_n = jcpdf.getAttachmentName(aa);
            System.out.format("Attachment %d is named %s\n", aa, a_n);
            int a_page = jcpdf.getAttachmentPage(aa);
            System.out.format("It is on page %d\n", a_page);
            byte[] a_data = jcpdf.getAttachmentData(aa);
            System.out.format("Contains %d bytes of data\n", a_data.length);
        }
        jcpdf.endGetAttachments();
        System.out.println("---cpdf_removeAttachedFiles()");
        jcpdf.removeAttachedFiles(attachments);
        jcpdf.toFile(attachments, "testoutputs/12removed_attachments.pdf", false, false);
        attachments.close();
    }
   
    static void chapter13(Jcpdf jcpdf) throws Jcpdf.CpdfError
    {
        CHAPTER 13. Images.
        System.out.println("***** CHAPTER 13. Images");
        System.out.println("---cpdf: get image resolution");
        Jcpdf.Pdf image_pdf = jcpdf.fromFile("testinputs/image.pdf", "");
        int im_n = jcpdf.startGetImageResolution(image_pdf, 2.0);
        for (int im = 0; im < im_n; im++)
        {
            int im_p = jcpdf.getImageResolutionPageNumber(im);
            String im_name = jcpdf.getImageResolutionImageName(im);
            int im_xp = jcpdf.getImageResolutionXPixels(im);
            int im_yp = jcpdf.getImageResolutionYPixels(im);
            double im_xres = jcpdf.getImageResolutionXRes(im);
            double im_yres = jcpdf.getImageResolutionYRes(im);
            System.out.format("IMAGE: %d, %s, %d, %d, %f, %f\n", im_p, im_name, im_xp, im_yp, im_xres, im_yres);
        }
        jcpdf.endGetImageResolution();
        image_pdf.close();
    }
   
    static void chapter14(Jcpdf jcpdf) throws Jcpdf.CpdfError
    {
        CHAPTER 14. Fonts.
        System.out.println("***** CHAPTER 14. Fonts");
        System.out.println("---cpdf: Get Fonts");
        Jcpdf.Pdf fonts = jcpdf.fromFile("testinputs/cpdflibmanual.pdf", "");
        Jcpdf.Pdf fonts2 = jcpdf.fromFile("testinputs/frontmatter.pdf", "");
        jcpdf.startGetFontInfo(fonts);
        int n_fonts = jcpdf.numberFonts();
        for (int ff = 0; ff < n_fonts; ff++)
        {
            int page = jcpdf.getFontPage(ff);
            String f_name = jcpdf.getFontName(ff);
            String type = jcpdf.getFontType(ff);
            String encoding = jcpdf.getFontEncoding(ff);
            System.out.format("Page %d, font %s has type %s and encoding %s\n", page, f_name, type, encoding);
        }
        jcpdf.endGetFontInfo();
        System.out.println("---cpdf_removeFonts()");
        jcpdf.removeFonts(fonts);
        jcpdf.toFile(fonts, "testoutputs/14remove_fonts.pdf", false, false);
        System.out.println("---cpdf_copyFont()");
        Jcpdf.Range all = jcpdf.all(fonts);
        jcpdf.copyFont(fonts, fonts2, all, 1, "/Font");
        fonts.close();
        fonts2.close();
        all.close();
    }
   
    static void chapter15(Jcpdf jcpdf) throws Jcpdf.CpdfError
    {
        CHAPTER 15. PDF and JSON
        System.out.println("***** CHAPTER 15. PDF and JSON");
        Jcpdf.Pdf jsonpdf = jcpdf.fromFile("testinputs/cpdflibmanual.pdf", "");
        System.out.println("---cpdf_outputJSON()");
        jcpdf.outputJSON("testoutputs/15json.json", false, false, false, jsonpdf);
        jcpdf.outputJSON("testoutputs/15jsonnostream.json", false, true, false, jsonpdf);
        jcpdf.outputJSON("testoutputs/15jsonparsed.json", true, false, false, jsonpdf);
        jcpdf.outputJSON("testoutputs/15jsondecomp.json", false, false, true, jsonpdf);
        System.out.println("---cpdf_fromJSON()");
        Jcpdf.Pdf fromjsonpdf = jcpdf.fromJSON("testoutputs/15jsonparsed.json");
        jcpdf.toFile(fromjsonpdf, "testoutputs/15fromjson.pdf", false, false);
        System.out.println("---cpdf_outputJSONMemory()");
        byte[] jbuf = jcpdf.outputJSONMemory(fromjsonpdf, false, false, false);
        System.out.println("---cpdf_fromJSONMemory()");
        Jcpdf.Pdf jfrommem = jcpdf.fromJSONMemory(jbuf);
        jcpdf.toFile(jfrommem, "testoutputs/15fromJSONMemory.pdf", false, false);
        jsonpdf.close();
        fromjsonpdf.close();
        jfrommem.close();
    }
   
    static void chapter16(Jcpdf jcpdf) throws Jcpdf.CpdfError
    {
        CHAPTER 16. Optional Content Groups
        System.out.println("***** CHAPTER 16. Optional Content Groups");
        Jcpdf.Pdf ocg = jcpdf.fromFile("testinputs/has_ocgs.pdf", "");
        System.out.println("---cpdf: Get OCG List");
        int n2 = jcpdf.startGetOCGList(ocg);
        for(int x = 0; x < n2; x++)
        {
            System.out.println(jcpdf.OCGListEntry(x));
        }
        jcpdf.endGetOCGList();
        System.out.println("---cpdf_OCGCoalesce()");
        jcpdf.OCGCoalesce(ocg);
        System.out.println("---cpdf_OCGRename()");
        jcpdf.OCGRename(ocg, "From", "To");
        System.out.println("---cpdf_OCGOrderAll()");
        jcpdf.OCGOrderAll(ocg);
        ocg.close();
    }
    
    static void chapter17(Jcpdf jcpdf) throws Jcpdf.CpdfError
    {
        CHAPTER 17. Creating New PDFs
        System.out.println("***** CHAPTER 17. Creating New PDFs");
        System.out.println("---cpdf_blankDocument()");
        System.out.println("---cpdf_blankDocumentPaper()");
        try
            (Jcpdf.Pdf new1 = jcpdf.blankDocument(100.0, 200.0, 20);
             Jcpdf.Pdf new2 = jcpdf.blankDocumentPaper(jcpdf.a4portrait, 10))
        {
            jcpdf.toFile(new1, "testoutputs/01blank.pdf", false, false);
            jcpdf.toFile(new2, "testoutputs/01blanka4.pdf", false, false);
            System.out.println("---cpdf_textToPDF()");
            System.out.println("---cpdf_textToPDFPaper()");
        }
        try
            (Jcpdf.Pdf ttpdf = jcpdf.textToPDF(500.0, 600.0, jcpdf.timesItalic, 8.0, "../cpdflib-source/cpdflibtest.c");
             Jcpdf.Pdf ttpdfpaper = jcpdf.textToPDFPaper(jcpdf.a4portrait, jcpdf.timesBoldItalic, 10.0, "../cpdflib-source/cpdflibtest.c"))
        {
            jcpdf.toFile(ttpdf, "testoutputs/01ttpdf.pdf", false, false);
            jcpdf.toFile(ttpdfpaper, "testoutputs/01ttpdfpaper.pdf", false, false);
        }
    }

    static void chapter18(Jcpdf jcpdf) throws Jcpdf.CpdfError
    {
        CHAPTER 18. Miscellaneous
        System.out.println("***** CHAPTER 18. Miscellaneous");
        try
            (Jcpdf.Pdf misc = jcpdf.fromFile("testinputs/cpdflibmanual.pdf", "");
             Jcpdf.Pdf misc2 = jcpdf.fromFile("testinputs/cpdflibmanual.pdf", "");
             Jcpdf.Pdf misc3 = jcpdf.fromFile("testinputs/cpdflibmanual.pdf", "");
             Jcpdf.Pdf misc4 = jcpdf.fromFile("testinputs/cpdflibmanual.pdf", "");
             Jcpdf.Pdf misc5 = jcpdf.fromFile("testinputs/cpdflibmanual.pdf", "");
             Jcpdf.Pdf misc6 = jcpdf.fromFile("testinputs/cpdflibmanual.pdf", "");
             Jcpdf.Pdf misc7 = jcpdf.fromFile("testinputs/cpdflibmanual.pdf", "");
             Jcpdf.Pdf misc8 = jcpdf.fromFile("testinputs/cpdflibmanual.pdf", "");
             Jcpdf.Pdf misc9 = jcpdf.fromFile("testinputs/cpdflibmanual.pdf", "");
             Jcpdf.Pdf misc10 = jcpdf.fromFile("testinputs/cpdflibmanual.pdf", "");
             Jcpdf.Pdf misc11 = jcpdf.fromFile("testinputs/cpdflibmanual.pdf", "");
             Jcpdf.Pdf misc12 = jcpdf.fromFile("testinputs/cpdflibmanual.pdf", "");
             Jcpdf.Pdf misc13 = jcpdf.fromFile("testinputs/cpdflibmanual.pdf", "");
             Jcpdf.Pdf misc14 = jcpdf.fromFile("testinputs/cpdflibmanual.pdf", "");
             Jcpdf.Pdf misc15 = jcpdf.fromFile("testinputs/cpdflibmanual.pdf", "");
             Jcpdf.Pdf misc16 = jcpdf.fromFile("testinputs/cpdflibmanual.pdf", "");
             Jcpdf.Range all = jcpdf.all(misc);
             Jcpdf.Pdf misclogo = jcpdf.fromFile("testinputs/logo.pdf", ""))
        {
            System.out.println("---cpdf_draft()");
            jcpdf.draft(misc, all, true);
            jcpdf.toFile(misc, "testoutputs/17draft.pdf", false, false);
            System.out.println("---cpdf_removeAllText()");
            jcpdf.removeAllText(misc2, all);
            jcpdf.toFile(misc2, "testoutputs/17removealltext.pdf", false, false);
            System.out.println("---cpdf_blackText()");
            jcpdf.blackText(misc3, all);
            jcpdf.toFile(misc3, "testoutputs/17blacktext.pdf", false, false);
            System.out.println("---cpdf_blackLines()");
            jcpdf.blackLines(misc4, all);
            jcpdf.toFile(misc4, "testoutputs/17blacklines.pdf", false, false);
            System.out.println("---cpdf_blackFills()");
            jcpdf.blackFills(misc5, all);
            jcpdf.toFile(misc5, "testoutputs/17blackfills.pdf", false, false);
            System.out.println("---cpdf_thinLines()");
            jcpdf.thinLines(misc6, all, 2.0);
            jcpdf.toFile(misc6, "testoutputs/17thinlines.pdf", false, false);
            System.out.println("---cpdf_copyId()");
            jcpdf.copyId(misclogo, misc7);
            jcpdf.toFile(misc7, "testoutputs/17copyid.pdf", false, false);
            System.out.println("---cpdf_removeId()");
            jcpdf.removeId(misc8);
            jcpdf.toFile(misc8, "testoutputs/17removeid.pdf", false, false);
            System.out.println("---cpdf_setVersion()");
            jcpdf.setVersion(misc9, 1);
            jcpdf.toFile(misc9, "testoutputs/17setversion.pdf", false, false);
            System.out.println("---cpdf_setFullVersion()");
            jcpdf.setFullVersion(misc10, 2, 0);
            jcpdf.toFile(misc10, "testoutputs/17setfullversion.pdf", false, false);
            System.out.println("---cpdf_removeDictEntry()");
            jcpdf.removeDictEntry(misc11, "/Producer");
            jcpdf.toFile(misc11, "testoutputs/17removedictentry.pdf", false, false);
            System.out.println("---cpdf_removeDictEntrySearch()");
            jcpdf.removeDictEntrySearch(misc13, "/Producer", "1");
            jcpdf.toFile(misc13, "testoutputs/17removedictentrysearch.pdf", false, false);
            System.out.println("---cpdf_replaceDictEntry()");
            jcpdf.replaceDictEntry(misc14, "/Producer", "{\"I\" : 1}");
            jcpdf.toFile(misc14, "testoutputs/17replacedictentry.pdf", false, false);
            System.out.println("---cpdf_replaceDictEntrySearch()");
            jcpdf.replaceDictEntrySearch(misc15, "/Producer", "1", "2");
            jcpdf.toFile(misc15, "testoutputs/17replacedictentrysearch.pdf", false, false);
            System.out.println("---cpdf_getDictEntries()");
            byte[] entries = jcpdf.getDictEntries(misc16, "/Producer");
            System.out.format("length of entries data = %d\n", entries.length);
            System.out.println("---cpdf_removeClipping()");
            jcpdf.removeClipping(misc12, all);
            jcpdf.toFile(misc12, "testoutputs/17removeclipping.pdf", false, false);
        }
    }*/
