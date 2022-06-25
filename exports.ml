open Js_of_ocaml

exception CPDFError of string

(* Check and raise in case of an error. *)
let checkerror r =
  if Cpdf.getLastError () != 0 then
    begin
      let str = Cpdf.getLastErrorString () in
        Cpdf.clearError ();
        raise (CPDFError str)
    end
  else r

(* Convert Cpdflib range to Javascript array of page numbers *)
let array_of_range r =
  let a = Array.make (Cpdf.lengthrange r) 0 in
    for x = 0 to Cpdf.lengthrange r - 1 do
      a.(x) <- Cpdf.readrange r x
    done;
    Js.array a

(* Convert Javascript array of page numbers to Cpdflib range *)
let range_of_array a =
  let a = Js.to_array a in
  let r = ref (Cpdf.blankrange ()) in
    for x = 0 to Array.length a - 1 do
      let rn = Cpdf.addtorange !r a.(x) in
        Cpdf.deleterange !r;
        r := rn
    done;
    !r

let _ =
  Js.export_all
    (object%js
       (* ENUMERATIONS *)
       val noEdit = 0
       val noPrint = 1
       val noCopy = 2
       val noAnnot = 3
       val noForms = 4
       val noExtract = 5
       val noAssemble = 6
       val noHqPrint = 7
       val pdf40bit = 0
       val pdf128bit = 1
       val aes128bitfalse = 2
       val aes128bittrue = 3
       val aes256bitfalse = 4
       val aes256bittrue = 5
       val aes256bitisofalse = 6
       val aes256bitisotrue = 7
       val a0portrait = 0
       val a1portrait = 1
       val a2portrait = 2
       val a3portrait = 3
       val a4portrait = 4
       val a5portrait = 5
       val a0landscape = 6
       val a1landscape = 7
       val a2landscape = 8
       val a3landscape = 9
       val a4landscape = 10
       val a5landscape = 11
       val usletterportrait = 12
       val usletterlandscape = 13
       val uslegalportrait = 14
       val uslegallandscape = 15
       val posCentre = 0
       val posLeft = 1
       val posRight = 2
       val top = 3
       val topLeft = 4
       val topRight = 5
       val left = 6
       val bottomLeft = 7
       val bottom = 8
       val bottomRight = 9
       val right = 10
       val diagonal = 11
       val reversediagonal = 12
       val timesRoman = 0
       val timesBold = 1
       val timesItalic = 2
       val timesBoldItalic = 3
       val helvetica = 4
       val helveticaBold = 5
       val helveticaOblique = 6
       val helveticaBoldOblique = 7
       val courier = 8
       val courierBold = 9
       val courierOblique = 10
       val courierBoldOblique = 11
       val leftJustify = 0
       val centreJustify = 1
       val rightJustify = 2
       val singlePage = 0
       val oneColumn = 1
       val twoColumnLeft = 2
       val twoColumnRight = 3
       val twoPageLeft = 4
       val twoPageRight = 5
       val useNone = 0
       val useOutlines = 1
       val useThumbs = 2
       val useOC = 3
       val useAttachments = 4
       val decimalArabic = 0
       val uppercaseRoman = 1
       val lowercaseRoman = 2
       val uppercaseLetters = 3
       val lowercaseLetters = 4
       (* CHAPTER 0. Preliminaries *)
       method getLastError =
         Cpdf.getLastError ()
       method getLastErrorString =
         Js.string (Cpdf.getLastErrorString ())
       method clearError =
         Cpdf.clearError ()
       (* CHAPTER 1. Basics *)
       method setFast =
         checkerror (Cpdf.setFast ())
       method setSlow =
         checkerror (Cpdf.setSlow ())
       method version =
         checkerror ((fun () -> Js.string Cpdf.version) ())
       method onexit =
         checkerror (Cpdf.onexit ())
       method startEnumeratePDFs =
         checkerror (Cpdf.startEnumeratePDFs ())
       method enumeratePDFsKey a =
         checkerror (Cpdf.enumeratePDFsKey a)
       method enumeratePDFsInfo a =
         checkerror (Js.string (Cpdf.enumeratePDFsInfo a))
       method endEnumeratePDFs =
         checkerror (Cpdf.endEnumeratePDFs ())
       method deletePdf pdf =
         checkerror (Cpdf.deletePdf pdf)
       method parsePagespec pdf pagespec =
         checkerror (Cpdf.parsePagespec pdf (Js.to_string pagespec))
       method stringOfPagespec pdf r =
         checkerror (Js.string (Cpdf.stringOfPagespec pdf r))
       method validatePagespec pagespec =
         checkerror (Cpdf.validatePagespec (Js.to_string pagespec))
       method ptOfCm x =
         checkerror (Cpdf.ptOfCm x)
       method ptOfMm x =
         checkerror (Cpdf.ptOfMm x)
       method ptOfIn x =
         checkerror (Cpdf.ptOfIn x)
       method cmOfPt x =
         checkerror (Cpdf.cmOfPt x)
       method mmOfPt x =
         checkerror (Cpdf.mmOfPt x)
       method inOfPt x =
         checkerror (Cpdf.inOfPt x)
       method range f t =
         checkerror (Cpdf.range f t)
       method blankRange =
         checkerror (Cpdf.blankrange ())
       method rangeAdd r page =
         checkerror (Cpdf.addtorange r page)
       method even x =
         checkerror (Cpdf.even x)
       method odd x =
         checkerror (Cpdf.odd x)
       method rangeUnion a b =
         checkerror (Cpdf.union a b)
       method rangeLength r =
         checkerror (Cpdf.lengthrange r)
       method rangeGet r n =
         checkerror (Cpdf.readrange r n)
       method difference a b =
         checkerror (Cpdf.difference a b)
       method removeDuplicates x =
         checkerror (Cpdf.removeDuplicates x)
       method isInRange r page =
         checkerror (Cpdf.isInRange r page)
       method fromFile filename userpw =
         checkerror (Cpdf.fromFile (Js.to_string filename) (Js.to_string userpw))
       method fromFileLazy filename userpw =
         checkerror (Cpdf.fromFileLazy (Js.to_string filename) (Js.to_string userpw))
       method fromMemory data userpw =
         checkerror (Cpdf.fromMemory data (Js.to_string userpw)) (* data *)
       method fromMemoryLazy data userpw =
         checkerror (Cpdf.fromMemoryLazy data (Js.to_string userpw)) (* data *)
       method toFile pdf filename linearize make_id =
         checkerror (Cpdf.toFile pdf (Js.to_string filename) linearize make_id)
       method toFileExt pdf filename linearize make_id preserve_objstm generate_objstm compress_objstm =
         checkerror (Cpdf.toFileExt pdf (Js.to_string filename) linearize make_id preserve_objstm generate_objstm compress_objstm)
       method toFileEncrypted pdf encryption_method permissions ownerpw userpw linearize makeid filename =
         checkerror (Cpdf.toFileEncrypted
           pdf encryption_method (Js.to_array permissions) (Js.to_string ownerpw) (Js.to_string userpw)
           linearize makeid (Js.to_string filename))
       method toFileEncryptedExt
         pdf encryption_method permissions ownerpw userpw linearize makeid preserve_objstm generate_objstm
         compress_objstm filename
       =
         checkerror (Cpdf.toFileEncryptedExt
           pdf encryption_method (Js.to_array permissions) (Js.to_string ownerpw) (Js.to_string userpw)
           linearize makeid preserve_objstm generate_objstm compress_objstm (Js.to_string filename))
       method toMemory pdf linearize make_id =
         checkerror (Cpdf.toFileMemory pdf linearize make_id) (* data *)
       method toMemoryExt pdf linearize make_id preserve_objstm generate_objstm compress_objstm =
         checkerror (Cpdf.toFileMemoryExt pdf linearize make_id preserve_objstm generate_objstm compress_objstm) (* data *)
       method toMemoryEncrypted pdf encryption_method permissions ownerpw userpw linearize makeid =
         checkerror (Cpdf.toFileMemoryEncrypted pdf encryption_method permissions ownerpw userpw linearize makeid) (* data *)
       method toMemoryEncryptedExt pdf encryption_method permissions ownerpw userpw linearize makeid preserve_objstm generate_objstm compress_objstm =
         checkerror (Cpdf.toFileMemoryEncryptedExt pdf encryption_method permissions ownerpw userpw linearize makeid preserve_objstm generate_objstm compress_objstm) (* data *)
       method pages pdf =
         checkerror (Cpdf.pages pdf)
       method pagesFast password filename =
         checkerror (Cpdf.pagesFast (Js.to_string password) (Js.to_string filename))
       method pagesFastMemory password data =
         checkerror (Cpdf.pagesFastMemory (Js.to_string password) data) (* data *)
       method all pdf =
         checkerror (Cpdf.all pdf)
       method isEncrypted pdf =
         checkerror (Cpdf.isEncrypted pdf)
       method decryptPdf pdf userpw =
         checkerror (Cpdf.decryptPdf pdf (Js.to_string userpw))
       method decryptPdfOwner pdf ownerpw =
         checkerror (Cpdf.decryptPdfOwner pdf (Js.to_string ownerpw))
       method hasPermission pdf permission =
         checkerror (Cpdf.hasPermission pdf permission)
       method encryptionKind pdf =
         checkerror (Cpdf.encryptionKind pdf)

       (* CHAPTER 2. Merging and Splitting *)
       method mergeSimple pdfs =
         checkerror (Cpdf.mergeSimple (Js.to_array pdfs))
       method merge pdfs retain_numbering remove_duplicate_fonts =
         checkerror (Cpdf.merge (Js.to_array pdfs) retain_numbering remove_duplicate_fonts)
       method mergeSame pdfs retain_numbering remove_duplicate_fonts ranges =
         checkerror (Cpdf.mergeSame pdfs retain_numbering remove_duplicate_fonts ranges) (* FIXME array of arrays *)
       method selectPages pdf range =
         checkerror (Cpdf.selectPages pdf range)

       (* CHAPTER 3. Pages *)
       method scalePages pdf range sx sy =
         checkerror (Cpdf.scalePages pdf range sx sy)
       method scaleToFit pdf range sx sy scale =
         checkerror (Cpdf.scaleToFit pdf range sx sy scale)
       method scaleToFitPaper pdf range papersize s =
         checkerror (Cpdf.scaleToFitPaper pdf range papersize s)
       method scaleContents pdf range position scale =
         checkerror (Cpdf.scaleContents pdf range position scale) (* position *)
       method shiftContents pdf range dx dy =
         checkerror (Cpdf.shiftContents pdf range dx dy)
       method rotate pdf range rotation =
         checkerror (Cpdf.rotate pdf range rotation)
       method rotateBy pdf range rotation =
         checkerror (Cpdf.rotateBy pdf range rotation)
       method rotateContents pdf range angle =
         checkerror (Cpdf.rotateContents pdf range angle)
       method upright pdf =
         checkerror (Cpdf.upright pdf)
       method hFlip pdf =
         checkerror (Cpdf.hFlip pdf)
       method vFlip pdf =
         checkerror (Cpdf.vFlip pdf)
       method crop pdf range x y w h =
         checkerror (Cpdf.crop pdf range x y w h)
       method setMediabox pdf range minx maxx miny maxy =
         checkerror (Cpdf.setMediabox pdf range minx maxx miny maxy)
       method setCropBox pdf range minx maxx miny maxy =
         checkerror (Cpdf.setCropBox pdf range minx maxx miny maxy)
       method setTrimBox pdf range minx maxx miny maxy =
         checkerror (Cpdf.setTrimBox pdf range minx maxx miny maxy)
       method setArtBox pdf range minx maxx miny maxy =
         checkerror (Cpdf.setArtBox pdf range minx maxx miny maxy)
       method setBleedBox pdf range minx maxx miny maxy =
         checkerror (Cpdf.setBleedBox pdf range minx maxx miny maxy)
       method getMediaBox pdf pagenumber =
         checkerror (Js.array (let (a, b, c, d) = Cpdf.getMediaBox pdf pagenumber in [|a; b; c; d|]))
       method getCropBox pdf pagenumber =
         checkerror (Js.array (let (a, b, c, d) = Cpdf.getCropBox pdf pagenumber in [|a; b; c; d|]))
       method getArtBox pdf pagenumber =
         checkerror (Js.array (let (a, b, c, d) = Cpdf.getArtBox pdf pagenumber in [|a; b; c; d|]))
       method getBleedBox pdf pagenumber =
         checkerror (Js.array (let (a, b, c, d) = Cpdf.getBleedBox pdf pagenumber in [|a; b; c; d|]))
       method getTrimBox pdf pagenumber =
         checkerror (Js.array (let (a, b, c, d) = Cpdf.getTrimBox pdf pagenumber in [|a; b; c; d|]))
       method removeCrop pdf range =
         checkerror (Cpdf.removeCrop pdf range)
       method removeArt pdf range =
         checkerror (Cpdf.removeArt pdf range)
       method removeTrim pdf range =
         checkerror (Cpdf.removeTrim pdf range)
       method removeBleed pdf range =
         checkerror (Cpdf.removeBleed pdf range)
       method hardBox pdf range boxname =
         checkerror (Cpdf.hardBox pdf range (Js.to_string boxname))
       method trimMarks pdf range =
         checkerror (Cpdf.trimMarks pdf range)
       method showBoxes pdf range =
         checkerror (Cpdf.showBoxes pdf range)

       (* CHAPTER 4. Encryption and Decryption *)

       (* CHAPTER 5. Compression *)
       method compress pdf =
         checkerror (Cpdf.compress pdf)
       method decompress pdf =
         checkerror (Cpdf.decompress pdf)
       method squeezeInMemory pdf =
         checkerror (Cpdf.squeezeInMemory pdf)

       (* CHAPTER 6. Bookmarks *)
       method startGetBookmarkInfo pdf =
         checkerror (Cpdf.startGetBookmarkInfo pdf)
       method endGetBookmarkInfo =
         checkerror (Cpdf.endGetBookmarkInfo ())
       method numberBookmarks =
         checkerror (Cpdf.numberBookmarks ())
       method getBookmarkPage pdf n =
         checkerror (Cpdf.getBookmarkPage pdf n)
       method getBookmarkLevel n =
         checkerror (Cpdf.getBookmarkLevel n)
       method getBookmarkText n =
         checkerror (Js.string (Cpdf.getBookmarkText n))
       method getBookmarkOpenStatus n =
         checkerror (Cpdf.getBookmarkOpenStatus n)
       method startSetBookmarkInfo n =
         checkerror (Cpdf.startSetBookmarkInfo n)
       method endSetBookmarkInfo pdf =
         checkerror (Cpdf.endSetBookmarkInfo pdf)
       method setBookmarkPage pdf n page =
         checkerror (Cpdf.setBookmarkPage pdf n page)
       method setBookmarkLevel n level =
         checkerror (Cpdf.setBookmarkLevel n level)
       method setBookmarkText n text =
         checkerror (Cpdf.setBookmarkText n (Js.to_string text))
       method setBookmarkOpenStatus n status =
         checkerror (Cpdf.setBookmarkOpenStatus n status)
       method getBookmarksJSON pdf =
         checkerror (Cpdf.getBookmarksJSON pdf) (* data *)
       method setBookmarksJSON pdf data =
         checkerror (Cpdf.setBookmarksJSON pdf data) (* data *)
       method tableOfContents pdf font fontsize title bookmark =
         checkerror (Cpdf.tableOfContents pdf font fontsize (Js.to_string title) bookmark)

       (* CHAPTER 7. Presentations *)

       (* CHAPTER 8. Logos, Watermarks and Stamps *)
       method stampOn =
         Cpdf.stampOn(* TODO *)
       method stampUnder =
         Cpdf.stampUnder(* TODO *)
       method stampExtended =
         Cpdf.stampExtended(* TODO *)
       method combinePages =
         Cpdf.combinePages(* TODO *)
       method addText =
         Cpdf.addText(* TODO *)
       method removeText =
         Cpdf.removeText(* TODO *)
       method addContent =
         Cpdf.addContent(* TODO *)
       method stampAsXObject =
         Cpdf.stampAsXObject(* TODO *)
       method textWidth =
         Cpdf.textWidth(* TODO *)

       (* CHAPTER 9. Multipage facilities *)
       method twoUp pdf =
         checkerror (Cpdf.twoUp pdf)
       method twoUpStack pdf =
         checkerror (Cpdf.twoUpStack pdf)
       method impose pdf x y fit columns rtl btt center margin spacing linewidth =
         checkerror (Cpdf.impose pdf x y fit columns rtl btt center margin spacing linewidth)
       method padBefore pdf range =
         checkerror (Cpdf.padBefore pdf range)
       method padAfter pdf range =
         checkerror (Cpdf.padAfter pdf range)
       method padEvery pdf n =
         checkerror (Cpdf.padEvery pdf n)
       method padMultiple pdf n =
         checkerror (Cpdf.padMultiple pdf n)
       method padMultipleBefore pdf n =
         checkerror (Cpdf.padMultipleBefore pdf n)

       (* CHAPTER 10. Annotations *)
       method annotationsJSON pdf =
         checkerror (Cpdf.annotationsJSON pdf) (* data *)

       (* CHAPTER 11. Document Information and Metadata *)
       method getVersion pdf =
         checkerror (Cpdf.getVersion pdf)
       method getMajorVersion pdf =
         checkerror (Cpdf.getMajorVersion pdf)
       method isLinearized filename =
         checkerror (Cpdf.isLinearized (Js.to_string filename))
       method isLinearizedMemory data =
         checkerror (Cpdf.isLinearizedMemory data) (* data *)
       method getTitle =
         Cpdf.getTitle(* TODO *)
       method getAuthor =
         Cpdf.getAuthor(* TODO *)
       method getSubject =
         Cpdf.getSubject(* TODO *)
       method getKeywords =
         Cpdf.getKeywords(* TODO *)
       method getCreator =
         Cpdf.getCreator(* TODO *)
       method getProducer =
         Cpdf.getProducer(* TODO *)
       method getCreationDate = 
         Cpdf.getCreationDate(* TODO *)
       method getModificationDate =
         Cpdf.getModificationDate(* TODO *)
       method getTitleXMP =
         Cpdf.getTitleXMP(* TODO *)
       method getAuthorXMP =
         Cpdf.getAuthorXMP(* TODO *)
       method getSubjectXMP =
         Cpdf.getSubjectXMP(* TODO *)
       method getKeywordsXMP =
         Cpdf.getKeywordsXMP(* TODO *)
       method getCreatorXMP =
         Cpdf.getCreatorXMP(* TODO *)
       method getProducerXMP =
         Cpdf.getProducerXMP(* TODO *)
       method getCreationDateXMP = 
         Cpdf.getCreationDateXMP(* TODO *)
       method getModificationDateXMP =
         Cpdf.getModificationDateXMP(* TODO *)
       method getDateComponents =
         Cpdf.getDateComponents(* TODO *)
       method dateStringOfComponents =
         Cpdf.dateStringOfComponents(* TODO *)
       method setTitle =
         Cpdf.setTitle(* TODO *)
       method setAuthor =
         Cpdf.setAuthor(* TODO *)
       method setSubject =
         Cpdf.setSubject(* TODO *)
       method setKeywords =
         Cpdf.setKeywords(* TODO *)
       method setCreator =
         Cpdf.setCreator(* TODO *)
       method setProducer =
         Cpdf.setProducer(* TODO *)
       method setCreationDate = 
         Cpdf.setCreationDate(* TODO *)
       method setModificationDate =
         Cpdf.setModificationDate(* TODO *)
       method markTrapped =
         Cpdf.markTrapped(* TODO *)
       method markUntrapped =
         Cpdf.markUntrapped(* TODO *)
       method markTrappedXMP =
         Cpdf.markTrappedXMP(* TODO *)
       method markUntrappedXMP =
         Cpdf.markUntrappedXMP(* TODO *)
       method setTitleXMP =
         Cpdf.setTitleXMP(* TODO *)
       method setAuthorXMP =
         Cpdf.setAuthorXMP(* TODO *)
       method setSubjectXMP =
         Cpdf.setSubjectXMP(* TODO *)
       method setKeywordsXMP =
         Cpdf.setKeywordsXMP(* TODO *)
       method setCreatorXMP =
         Cpdf.setCreatorXMP(* TODO *)
       method setProducerXMP =
         Cpdf.setProducerXMP(* TODO *)
       method setCreationDateXMP =
         Cpdf.setCreationDateXMP(* TODO *)
       method setModificationDateXMP =
         Cpdf.setModificationDateXMP(* TODO *)
       method hasBox =
         Cpdf.hasBox(* TODO *)
       method getPageRotation =
         Cpdf.getPageRotation(* TODO *)
       method setPageLayout =
         Cpdf.setPageLayout(* TODO *)
       method setPageMode =
         Cpdf.setPageMode(* TODO *)
       method hideToolbar =
         Cpdf.hideToolbar(* TODO *)
       method hideMenubar =
         Cpdf.hideMenubar(* TODO *)
       method hideWindowUi =
         Cpdf.hideWindowUi(* TODO *)
       method fitWindow =
         Cpdf.fitWindow(* TODO *)
       method centerWindow =
         Cpdf.centerWindow(* TODO *)
       method displayDocTitle =
         Cpdf.displayDocTitle(* TODO *)
       method openAtPage =
         Cpdf.openAtPage(* TODO *)
       method setMetadataFromFile =
         Cpdf.setMetadataFromFile(* TODO *)
       method setMetadataFromByteArray =
         Cpdf.setMetadataFromByteArray(* TODO *)
       method getMetadata =
         Cpdf.getMetadata(* TODO *)
       method removeMetadata =
         Cpdf.removeMetadata(* TODO *)
       method createMetadata =
         Cpdf.createMetadata(* TODO *)
       method setMetadataDate =
         Cpdf.setMetadataDate(* TODO *)
       method addPageLabels =
         Cpdf.addPageLabels(* TODO *)
       method removePageLabels =
         Cpdf.removePageLabels(* TODO *)
       method startGetPageLabels =
         Cpdf.startGetPageLabels(* TODO *)
       method getPageLabelStyle =
         Cpdf.getPageLabelStyle(* TODO *)
       method getPageLabelPrefix =
         Cpdf.getPageLabelPrefix(* TODO *)
       method getPageLabelOffset =
         Cpdf.getPageLabelOffset(* TODO *)
       method getPageLabelRange =
         Cpdf.getPageLabelRange(* TODO *)
       method endGetPageLabels =
         Cpdf.endGetPageLabels ()(* TODO *)
       method getPageLabelStringForPage =
         Cpdf.getPageLabelStringForPage(* TODO *)

       (* CHAPTER 12. File Attachments *)
       method attachFile filename pdf =
         checkerror (Cpdf.attachFile (Js.to_string filename) pdf)
       method attachFileToPage filename pdf pagenumber =
         checkerror (Cpdf.attachFileToPage (Js.to_string filename) pdf pagenumber)
       method attachFileFromMemory data filename pdf =
         checkerror (Cpdf.attachFileFromMemory data (Js.to_string filename) pdf) (* data *)
       method attachFileToPageFromMemory data filename pdf pagenumber =
         checkerror (Cpdf.attachFileToPageFromMemory data (Js.to_string filename) pdf pagenumber) (* data *)
       method removeAttachedFiles pdf =
         checkerror (Cpdf.removeAttachedFiles pdf)
       method startGetAttachments pdf =
         checkerror (Cpdf.startGetAttachments pdf)
       method endGetAttachments =
         checkerror (Cpdf.endGetAttachments ())
       method numberGetAttachments pdf =
         checkerror (Cpdf.numberGetAttachments ())
       method getAttachmentName n =
         checkerror (Cpdf.getAttachmentName n)
       method getAttachmentPage n =
         checkerror (Cpdf.getAttachmentPage n)
       method getAttachmentData n =
         checkerror (Cpdf.getAttachmentData n) (* data *)

       (* CHAPTER 13. Images *)
       method startGetImageResolution pdf min_required_resolution =
         checkerror (Cpdf.startGetImageResolution pdf min_required_resolution)
       method getImageResolutionPageNumber n =
         checkerror (Cpdf.getImageResolutionPageNumber n)
       method getImageResolutionImageName n =
         checkerror (Js.string (Cpdf.getImageResolutionImageName n))
       method getImageResolutionXPixels n =
         checkerror (Cpdf.getImageResolutionXPixels n)
       method getImageResolutionYPixels n =
         checkerror (Cpdf.getImageResolutionYPixels n)
       method getImageResolutionXRes n =
         checkerror (Cpdf.getImageResolutionXRes n)
       method getImageResolutionYRes n =
         checkerror (Cpdf.getImageResolutionYRes n)
       method endGetImageResolution = checkerror (Cpdf.endGetImageResolution ())

       (* CHAPTER 14. Fonts *)
       method numberFonts =
         checkerror (Cpdf.numberFonts ())
       method getFontPage n =
         checkerror (Cpdf.getFontPage n)
       method getFontName n =
         checkerror (Js.string (Cpdf.getFontName n))
       method getFontType n =
         checkerror (Js.string (Cpdf.getFontType n))
       method getFontEncoding n =
         checkerror (Js.string (Cpdf.getFontEncoding n))
       method startGetFontInfo pdf = 
         checkerror (Cpdf.startGetFontInfo pdf)
       method endGetFontInfo =
         checkerror (Cpdf.endGetFontInfo ())
       method copyFont docfrom docto range pagenumber fontname =
         checkerror (Cpdf.copyFont docfrom docto range pagenumber (Js.to_string fontname))
       method removeFonts pdf =
         checkerror (Cpdf.removeFonts pdf)

       (* CHAPTER 15. PDF and JSON *)
       method outputJSON filename parse_content no_stream_data decompress_streams pdf =
         checkerror (Cpdf.outputJSON filename parse_content no_stream_data decompress_streams pdf) (* data *)
       method outputJSONMemory parse_content no_stream_data decompress_streams pdf =
         checkerror (Cpdf.outputJSONMemory parse_content no_stream_data decompress_streams pdf) (* data *)
       method fromJSON filename =
         checkerror (Cpdf.fromJSON filename) (* data *)
       method fromJSONMemory data =
         checkerror (Cpdf.fromJSONMemory data) (* data *)

       (* CHAPTER 16. Optional Content Groups *)
       method startGetOCGList pdf =
         checkerror (Cpdf.startGetOCGList pdf)
       method ocgListEntry n =
         checkerror (Js.string (Cpdf.ocgListEntry n))
       method endGetOCGList =
         checkerror (Cpdf.endGetOCGList ())
       method ocgCoalesce pdf =
         checkerror (Cpdf.ocgCoalesce pdf)
       method ocgRename pdf name_from name_to =
         checkerror (Cpdf.ocgRename pdf (Js.to_string name_from) (Js.to_string name_to))
       method ocgOrderAll pdf =
         checkerror (Cpdf.ocgOrderAll pdf)

       (* CHAPTER 17. Creating New PDFs *)
       method blankDocument w h pages =
         checkerror (Cpdf.blankDocument w h pages)
       method blankDocumentPaper papersize pages =
         checkerror (Cpdf.blankDocumentPaper papersize pages)
       method textToPDF w h font fontsize filename =
         checkerror (Cpdf.textToPDF w h font fontsize (Js.to_string filename))
       method textToPDFPaper papersize font fontsize filename =
         checkerror (Cpdf.textToPDFPaper papersize font fontsize (Js.to_string filename))
       method textToPDFMemory w h font fontsize data =
         checkerror (Cpdf.textToPDFMemory w h font fontsize data) (* data *)
       method textToPDFPaperMemory papersize font fontsize data =
         checkerror (Cpdf.textToPDFPaperMemory papersize font fontsize data) (* data *)

       (* CHAPTER 18. Miscellaneous *)
       method draft pdf range boxes =
         checkerror (Cpdf.draft pdf range boxes)
       method removeAllText pdf range =
         checkerror (Cpdf.removeAllText pdf range)
       method blackText pdf range =
         checkerror (Cpdf.blackText pdf range)
       method blackLines pdf range =
         checkerror (Cpdf.blackLines pdf range)
       method blackFills pdf range =
         checkerror (Cpdf.blackFills pdf range)
       method thinLines pdf range min_thickness =
         checkerror (Cpdf.thinLines pdf range min_thickness)
       method copyId pdf_from pdf_to =
         checkerror (Cpdf.copyId pdf_from pdf_to)
       method removeId pdf =
         checkerror (Cpdf.removeId pdf)
       method setVersion pdf version =
         checkerror (Cpdf.setVersion pdf version)
       method setFullVersion pdf major minor =
         checkerror (Cpdf.setFullVersion pdf major minor)
       method removeDictEntry pdf key =
         checkerror (Cpdf.removeDictEntry pdf (Js.to_string key))
       method removeDictEntrySearch pdf key searchterm =
         checkerror (Cpdf.removeDictEntrySearch pdf (Js.to_string key) (Js.to_string searchterm))
       method replaceDictEntry pdf key newval =
         checkerror (Cpdf.replaceDictEntry pdf (Js.to_string key) (Js.to_string newval))
       method replaceDictEntrySearch pdf key newval searchterm =
         checkerror (Cpdf.replaceDictEntrySearch pdf key (Js.to_string newval) (Js.to_string searchterm))
       method getDictEntries pdf key =
         checkerror (Cpdf.getDictEntries pdf (Js.to_string key)) (* data *)
       method removeClipping pdf range =
         checkerror (Cpdf.removeClipping pdf range)
    end)
