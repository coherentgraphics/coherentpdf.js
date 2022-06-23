open Js_of_ocaml

exception CPDFError of string

(* Check and raise in case of an error. *)
let checkerror r =
  if Cpdf.getLastError () != 0 then raise (CPDFError (Cpdf.getLastErrorString ())) else r

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
       (* CHAPTER 0. Preliminaries *)
       method getLastError = Cpdf.getLastError ()
       method getLastErrorString = Js.string (Cpdf.getLastErrorString ())
       method clearError = Cpdf.clearError ()
       (* CHAPTER 1. Basics *)
       method setFast = checkerror (Cpdf.setFast ())
       method setSlow = checkerror (Cpdf.setSlow ())
       method version = checkerror ((fun () -> Js.string Cpdf.version) ())
       method onexit = checkerror (Cpdf.onexit ())
       method startEnumeratePDFs = checkerror (Cpdf.startEnumeratePDFs ())
       method enumeratePDFsKey a = checkerror (Cpdf.enumeratePDFsKey a)
       method enumeratePDFsInfo a = checkerror (Js.string (Cpdf.enumeratePDFsInfo a))
       method endEnumeratePDFs = checkerror (Cpdf.endEnumeratePDFs ())
       method deletePdf pdf = checkerror (Cpdf.deletePdf pdf)
       method parsePagespec pdf pagespec = checkerror (Cpdf.parsePagespec pdf (Js.to_string pagespec))
       method stringOfPagespec pdf r = checkerror (Js.string (Cpdf.stringOfPagespec pdf r))
       method validatePagespec pagespec = checkerror (Cpdf.validatePagespec (Js.to_string pagespec))
       method ptOfCm x = checkerror (Cpdf.ptOfCm x)
       method ptOfMm x = checkerror (Cpdf.ptOfMm x)
       method ptOfIn x = checkerror (Cpdf.ptOfIn x)
       method cmOfPt x = checkerror (Cpdf.cmOfPt x)
       method mmOfPt x = checkerror (Cpdf.mmOfPt x)
       method inOfPt x = checkerror (Cpdf.inOfPt x)
       method range = Cpdf.range
       method blankRange = Cpdf.blankrange ()
       method makerange = Cpdf.makerange
       method writerange = Cpdf.writerange
       method rangeAdd = Cpdf.addtorange
       method even = Cpdf.even
       method odd = Cpdf.odd
       method rangeUnion = Cpdf.union
       method rangeLength = Cpdf.lengthrange
       method rangeGet = Cpdf.readrange
       method difference = Cpdf.difference
       method removeDuplicates = Cpdf.removeDuplicates
       method isInRange = Cpdf.isInRange
       method fromFile filename userpw =
         Cpdf.fromFile (Js.to_string filename) (Js.to_string userpw)
       method fromFileLazy filename userpw =
         Cpdf.fromFileLazy (Js.to_string filename) (Js.to_string userpw)
       method fromMemory = Cpdf.fromMemory (* data *)
       method fromMemoryLazy = Cpdf.fromMemoryLazy (* data *)
       method toFile pdf filename linearize make_id =
         Cpdf.toFile pdf (Js.to_string filename) linearize make_id
       method toFileExt pdf filename linearize make_id preserve_objstm create_objstm compress_objstm =
         Cpdf.toFileExt pdf (Js.to_string filename) linearize make_id preserve_objstm create_objstm compress_objstm
       method toFileEncrypted pdf encryption_method permissions ownerpw userpw linearize makeid filename =
         Cpdf.toFileEncrypted
           pdf encryption_method (Js.to_array permissions) (Js.to_string ownerpw) (Js.to_string userpw)
           linearize makeid (Js.to_string filename)
       method toFileEncryptedExt
         pdf encryption_method permissions ownerpw userpw linearize makeid preserve_objstm generate_objstm
         compress_objstm filename
       =
         Cpdf.toFileEncryptedExt
           pdf encryption_method (Js.to_array permissions) (Js.to_string ownerpw) (Js.to_string userpw)
           linearize makeid preserve_objstm generate_objstm compress_objstm (Js.to_string filename)
       method toMemory = Cpdf.toFileMemory (* data *)
       method toMemoryExt = Cpdf.toFileMemoryExt (* data *)
       method toMemoryEncrypted = Cpdf.toFileMemoryEncrypted (* data *)
       method toMemoryEncryptedExt = Cpdf.toFileMemoryEncryptedExt (* data *)
       method pages = Cpdf.pages
       method pagesFast password filename =
         Cpdf.pagesFast (Js.to_string password) (Js.to_string filename)
       method pagesFastMemory = Cpdf.pagesFastMemory (* data *)
       method all = Cpdf.all
       method isEncrypted = Cpdf.isEncrypted
       method decryptPdf pdf userpw =
         Cpdf.decryptPdf pdf (Js.to_string userpw)
       method decryptPdfOwner pdf ownerpw =
         Cpdf.decryptPdfOwner pdf (Js.to_string ownerpw)
       method hasPermission = Cpdf.hasPermission
       method encryptionKind = Cpdf.encryptionKind

       (* CHAPTER 2. Merging and Splitting *)
       method mergeSimple pdfs = Cpdf.mergeSimple (Js.to_array pdfs)
       method merge pdfs retain_numbering remove_duplicate_fonts =
         Cpdf.merge (Js.to_array pdfs) retain_numbering remove_duplicate_fonts
       method mergeSame = Cpdf.mergeSame (* FIXME array of arrays *)
       method selectPages = Cpdf.selectPages

       (* CHAPTER 3. Pages *)
       method scalePages = Cpdf.scalePages
       method scaleToFit = Cpdf.scaleToFit
       method scaleToFitPaper = Cpdf.scaleToFitPaper
       method scaleContents = Cpdf.scaleContents(* TODO *)
       method shiftContents = Cpdf.shiftContents(* TODO *)
       method rotate = Cpdf.rotate(* TODO *)
       method rotateBy = Cpdf.rotateBy(* TODO *)
       method rotateContents = Cpdf.rotateContents(* TODO *)
       method upright = Cpdf.upright(* TODO *)
       method hFlip = Cpdf.hFlip(* TODO *)
       method vFlip = Cpdf.vFlip(* TODO *)
       method crop = Cpdf.crop(* TODO *)
       method setMediabox = Cpdf.setMediabox(* TODO *)
       method setCropBox = Cpdf.setCropBox(* TODO *)
       method setTrimBox = Cpdf.setTrimBox(* TODO *)
       method setArtBox = Cpdf.setArtBox(* TODO *)
       method setBleedBox = Cpdf.setBleedBox(* TODO *)
       method getMediaBox = Cpdf.getMediaBox(* TODO *)
       method getCropBox = Cpdf.getCropBox(* TODO *)
       method getArtBox = Cpdf.getArtBox(* TODO *)
       method getBleedBox = Cpdf.getBleedBox(* TODO *)
       method getTrimBox = Cpdf.getTrimBox(* TODO *)
       method removeCrop = Cpdf.removeCrop(* TODO *)
       method removeArt = Cpdf.removeArt(* TODO *)
       method removeTrim = Cpdf.removeTrim(* TODO *)
       method removeBleed = Cpdf.removeBleed(* TODO *)
       method hardBox = Cpdf.hardBox(* TODO *)
       method trimMarks = Cpdf.trimMarks(* TODO *)
       method showBoxes = Cpdf.showBoxes(* TODO *)

       (* CHAPTER 4. Encryption and Decryption *)

       (* CHAPTER 5. Compression *)
       method compress = Cpdf.compress(* TODO *)
       method decompress = Cpdf.decompress(* TODO *)
       method squeezeInMemory = Cpdf.squeezeInMemory(* TODO *)

       (* CHAPTER 6. Bookmarks *)
       method startGetBookmarkInfo = Cpdf.startGetBookmarkInfo(* TODO *)
       method endGetBookmarkInfo = Cpdf.endGetBookmarkInfo ()(* TODO *)
       method numberBookmarks = Cpdf.numberBookmarks ()(* TODO *)
       method getBookmarkPage = Cpdf.getBookmarkPage(* TODO *)
       method getBookmarkLevel = Cpdf.getBookmarkLevel(* TODO *)
       method getBookmarkText = Cpdf.getBookmarkText(* TODO *)
       method getBookmarkOpenStatus = Cpdf.getBookmarkOpenStatus(* TODO *)
       method startSetBookmarkInfo = Cpdf.startSetBookmarkInfo(* TODO *)
       method endSetBookmarkInfo = Cpdf.endSetBookmarkInfo(* TODO *)
       method setBookmarkPage = Cpdf.setBookmarkPage(* TODO *)
       method setBookmarkLevel = Cpdf.setBookmarkLevel(* TODO *)
       method setBookmarkText = Cpdf.setBookmarkText(* TODO *)
       method setBookmarkOpenStatus = Cpdf.setBookmarkOpenStatus(* TODO *)
       method getBookmarksJSON = Cpdf.getBookmarksJSON(* TODO *)
       method setBookmarksJSON = Cpdf.setBookmarksJSON(* TODO *)
       method tableOfContents = Cpdf.tableOfContents(* TODO *)

       (* CHAPTER 7. Presentations *)

       (* CHAPTER 8. Logos, Watermarks and Stamps *)
       method stampOn = Cpdf.stampOn(* TODO *)
       method stampUnder = Cpdf.stampUnder(* TODO *)
       method stampExtended = Cpdf.stampExtended(* TODO *)
       method combinePages = Cpdf.combinePages(* TODO *)
       method addText = Cpdf.addText(* TODO *)
       method removeText = Cpdf.removeText(* TODO *)
       method addContent = Cpdf.addContent(* TODO *)
       method stampAsXObject = Cpdf.stampAsXObject(* TODO *)
       method textWidth = Cpdf.textWidth(* TODO *)

       (* CHAPTER 9. Multipage facilities *)
       method twoUp = Cpdf.twoUp(* TODO *)
       method twoUpStack = Cpdf.twoUpStack(* TODO *)
       method impose = Cpdf.impose(* TODO *)
       method padBefore = Cpdf.padBefore(* TODO *)
       method padAfter = Cpdf.padAfter(* TODO *)
       method padEvery = Cpdf.padEvery(* TODO *)
       method padMultiple = Cpdf.padMultiple(* TODO *)
       method padMultipleBefore = Cpdf.padMultipleBefore(* TODO *)

       (* CHAPTER 10. Annotations *)
       method annotationsJSON = Cpdf.annotationsJSON(* TODO *)

       (* CHAPTER 11. Document Information and Metadata *)
       method getVersion = Cpdf.getVersion(* TODO *)
       method getMajorVersion = Cpdf.getMajorVersion(* TODO *)
       method isLinearized filename =
         Cpdf.isLinearized (Js.to_string filename)
       method isLinearizedMemory = Cpdf.isLinearizedMemory(* TODO *)
       method getTitle = Cpdf.getTitle(* TODO *)
       method getAuthor = Cpdf.getAuthor(* TODO *)
       method getSubject = Cpdf.getSubject(* TODO *)
       method getKeywords = Cpdf.getKeywords(* TODO *)
       method getCreator = Cpdf.getCreator(* TODO *)
       method getProducer = Cpdf.getProducer(* TODO *)
       method getCreationDate = Cpdf.getCreationDate(* TODO *)
       method getModificationDate = Cpdf.getModificationDate(* TODO *)
       method getTitleXMP = Cpdf.getTitleXMP(* TODO *)
       method getAuthorXMP = Cpdf.getAuthorXMP(* TODO *)
       method getSubjectXMP = Cpdf.getSubjectXMP(* TODO *)
       method getKeywordsXMP = Cpdf.getKeywordsXMP(* TODO *)
       method getCreatorXMP = Cpdf.getCreatorXMP(* TODO *)
       method getProducerXMP = Cpdf.getProducerXMP(* TODO *)
       method getCreationDateXMP = Cpdf.getCreationDateXMP(* TODO *)
       method getModificationDateXMP = Cpdf.getModificationDateXMP(* TODO *)
       method getDateComponents = Cpdf.getDateComponents(* TODO *)
       method dateStringOfComponents = Cpdf.dateStringOfComponents(* TODO *)
       method setTitle = Cpdf.setTitle(* TODO *)
       method setAuthor = Cpdf.setAuthor(* TODO *)
       method setSubject = Cpdf.setSubject(* TODO *)
       method setKeywords = Cpdf.setKeywords(* TODO *)
       method setCreator = Cpdf.setCreator(* TODO *)
       method setProducer = Cpdf.setProducer(* TODO *)
       method setCreationDate = Cpdf.setCreationDate(* TODO *)
       method setModificationDate = Cpdf.setModificationDate(* TODO *)
       method markTrapped = Cpdf.markTrapped(* TODO *)
       method markUntrapped = Cpdf.markUntrapped(* TODO *)
       method markTrappedXMP = Cpdf.markTrappedXMP(* TODO *)
       method markUntrappedXMP = Cpdf.markUntrappedXMP(* TODO *)
       method setTitleXMP = Cpdf.setTitleXMP(* TODO *)
       method setAuthorXMP = Cpdf.setAuthorXMP(* TODO *)
       method setSubjectXMP = Cpdf.setSubjectXMP(* TODO *)
       method setKeywordsXMP = Cpdf.setKeywordsXMP(* TODO *)
       method setCreatorXMP = Cpdf.setCreatorXMP(* TODO *)
       method setProducerXMP = Cpdf.setProducerXMP(* TODO *)
       method setCreationDateXMP = Cpdf.setCreationDateXMP(* TODO *)
       method setModificationDateXMP = Cpdf.setModificationDateXMP(* TODO *)
       method hasBox = Cpdf.hasBox(* TODO *)
       method getPageRotation = Cpdf.getPageRotation(* TODO *)
       method setPageLayout = Cpdf.setPageLayout(* TODO *)
       method setPageMode = Cpdf.setPageMode(* TODO *)
       method hideToolbar = Cpdf.hideToolbar(* TODO *)
       method hideMenubar = Cpdf.hideMenubar(* TODO *)
       method hideWindowUi = Cpdf.hideWindowUi(* TODO *)
       method fitWindow = Cpdf.fitWindow(* TODO *)
       method centerWindow = Cpdf.centerWindow(* TODO *)
       method displayDocTitle = Cpdf.displayDocTitle(* TODO *)
       method openAtPage = Cpdf.openAtPage(* TODO *)
       method setMetadataFromFile = Cpdf.setMetadataFromFile(* TODO *)
       method setMetadataFromByteArray = Cpdf.setMetadataFromByteArray(* TODO *)
       method getMetadata = Cpdf.getMetadata(* TODO *)
       method removeMetadata = Cpdf.removeMetadata(* TODO *)
       method createMetadata = Cpdf.createMetadata(* TODO *)
       method setMetadataDate = Cpdf.setMetadataDate(* TODO *)
       method addPageLabels = Cpdf.addPageLabels(* TODO *)
       method removePageLabels = Cpdf.removePageLabels(* TODO *)
       method startGetPageLabels = Cpdf.startGetPageLabels(* TODO *)
       method getPageLabelStyle = Cpdf.getPageLabelStyle(* TODO *)
       method getPageLabelPrefix = Cpdf.getPageLabelPrefix(* TODO *)
       method getPageLabelOffset = Cpdf.getPageLabelOffset(* TODO *)
       method getPageLabelRange = Cpdf.getPageLabelRange(* TODO *)
       method endGetPageLabels = Cpdf.endGetPageLabels ()(* TODO *)
       method getPageLabelStringForPage = Cpdf.getPageLabelStringForPage(* TODO *)

       (* CHAPTER 12. File Attachments *)
       method attachFile = Cpdf.attachFile(* TODO *)
       method attachFileToPage = Cpdf.attachFileToPage(* TODO *)
       method attachFileFromMemory = Cpdf.attachFileFromMemory(* TODO *)
       method attachFileToPageFromMemory = Cpdf.attachFileToPageFromMemory(* TODO *)
       method removeAttachedFiles = Cpdf.removeAttachedFiles(* TODO *)
       method startGetAttachments = Cpdf.startGetAttachments(* TODO *)
       method endGetAttachments = Cpdf.endGetAttachments ()(* TODO *)
       method numberGetAttachments = Cpdf.numberGetAttachments ()(* TODO *)
       method getAttachmentName = Cpdf.getAttachmentName(* TODO *)
       method getAttachmentPage = Cpdf.getAttachmentPage(* TODO *)
       method getAttachmentData = Cpdf.getAttachmentData(* TODO *)

       (* CHAPTER 13. Images *)
       method startGetImageResolution = Cpdf.startGetImageResolution(* TODO *)
       method getImageResolutionPageNumber = Cpdf.getImageResolutionPageNumber(* TODO *)
       method getImageResolutionImageName = Cpdf.getImageResolutionImageName(* TODO *)
       method getImageResolutionXPixels = Cpdf.getImageResolutionXPixels(* TODO *)
       method getImageResolutionYPixels = Cpdf.getImageResolutionYPixels(* TODO *)
       method getImageResolutionXRes = Cpdf.getImageResolutionXRes(* TODO *)
       method getImageResolutionYRes = Cpdf.getImageResolutionYRes(* TODO *)
       method endGetImageResolution = Cpdf.endGetImageResolution ()(* TODO *)

       (* CHAPTER 14. Fonts *)
       method numberFonts = Cpdf.numberFonts ()(* TODO *)
       method getFontPage = Cpdf.getFontPage(* TODO *)
       method getFontName = Cpdf.getFontName(* TODO *)
       method getFontType = Cpdf.getFontType(* TODO *)
       method getFontEncoding = Cpdf.getFontEncoding(* TODO *)
       method startGetFontInfo = Cpdf.startGetFontInfo(* TODO *)
       method endGetFontInfo = Cpdf.endGetFontInfo ()(* TODO *)
       method copyFont = Cpdf.copyFont(* TODO *)
       method removeFonts = Cpdf.removeFonts(* TODO *)

       (* CHAPTER 15. PDF and JSON *)
       method outputJSON = Cpdf.outputJSON(* TODO *)
       method outputJSONMemory = Cpdf.outputJSONMemory(* TODO *)
       method fromJSON = Cpdf.fromJSON(* TODO *)
       method fromJSONMemory = Cpdf.fromJSONMemory(* TODO *)

       (* CHAPTER 16. Optional Content Groups *)
       method startGetOCGList = Cpdf.startGetOCGList(* TODO *)
       method ocgListEntry = Cpdf.ocgListEntry(* TODO *)
       method endGetOCGList = Cpdf.endGetOCGList ()(* TODO *)
       method ocgCoalesce = Cpdf.ocgCoalesce(* TODO *)
       method ocgRename = Cpdf.ocgRename(* TODO *)
       method ocgOrderAll = Cpdf.ocgOrderAll(* TODO *)

       (* CHAPTER 17. Creating New PDFs *)
       method blankDocument = Cpdf.blankDocument(* TODO *)
       method blankDocumentPaper = Cpdf.blankDocumentPaper(* TODO *)
       method textToPDF = Cpdf.textToPDF(* TODO *)
       method textToPDFPaper = Cpdf.textToPDFPaper(* TODO *)
       method textToPDFMemory = Cpdf.textToPDFMemory(* TODO *)
       method textToPDFPaperMemory = Cpdf.textToPDFPaperMemory(* TODO *)

       (* CHAPTER 18. Miscellaneous *)
       method draft = Cpdf.draft(* TODO *)
       method removeAllText = Cpdf.removeAllText(* TODO *)
       method blackText = Cpdf.blackText(* TODO *)
       method blackLines = Cpdf.blackLines(* TODO *)
       method blackFills = Cpdf.blackFills(* TODO *)
       method thinLines = Cpdf.thinLines(* TODO *)
       method copyId = Cpdf.copyId(* TODO *)
       method removeId = Cpdf.removeId(* TODO *)
       method setVersion = Cpdf.setVersion(* TODO *)
       method setFullVersion = Cpdf.setFullVersion(* TODO *)
       method removeDictEntry = Cpdf.removeDictEntry(* TODO *)
       method removeDictEntrySearch = Cpdf.removeDictEntrySearch(* TODO *)
       method replaceDictEntry = Cpdf.replaceDictEntry(* TODO *)
       method replaceDictEntrySearch = Cpdf.replaceDictEntrySearch(* TODO *)
       method getDictEntries = Cpdf.getDictEntries(* TODO *)
       method removeClipping = Cpdf.removeClipping(* TODO *)
    end)
