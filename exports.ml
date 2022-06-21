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
       method deleterange r = checkerror (Cpdf.deleterange r)
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
       method toFileEncrypted = Cpdf.toFileEncrypted
       method toFileEncryptedExt = Cpdf.toFileEncryptedExt
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
       method mergeSame = Cpdf.mergeSame (* array of arrays *)
       method selectPages = Cpdf.selectPages

       (* CHAPTER 3. Pages *)
       method scalePages = Cpdf.scalePages
       method scaleToFit = Cpdf.scaleToFit
       method scaleToFitPaper = Cpdf.scaleToFitPaper
       method scaleContents = Cpdf.scaleContents
       method shiftContents = Cpdf.shiftContents
       method rotate = Cpdf.rotate
       method rotateBy = Cpdf.rotateBy
       method rotateContents = Cpdf.rotateContents
       method upright = Cpdf.upright
       method hFlip = Cpdf.hFlip
       method vFlip = Cpdf.vFlip
       method crop = Cpdf.crop
       method setMediabox = Cpdf.setMediabox
       method setCropBox = Cpdf.setCropBox
       method setTrimBox = Cpdf.setTrimBox
       method setArtBox = Cpdf.setArtBox
       method setBleedBox = Cpdf.setBleedBox
       method getMediaBox = Cpdf.getMediaBox
       method getCropBox = Cpdf.getCropBox
       method getArtBox = Cpdf.getArtBox
       method getBleedBox = Cpdf.getBleedBox
       method getTrimBox = Cpdf.getTrimBox
       method removeCrop = Cpdf.removeCrop
       method removeArt = Cpdf.removeArt
       method removeTrim = Cpdf.removeTrim
       method removeBleed = Cpdf.removeBleed
       method hardBox = Cpdf.hardBox
       method trimMarks = Cpdf.trimMarks
       method showBoxes = Cpdf.showBoxes


       (* CHAPTER 4. Encryption and Decryption *)

       (* CHAPTER 5. Compression *)
       method compress = Cpdf.compress
       method decompress = Cpdf.decompress
       method squeezeInMemory = Cpdf.squeezeInMemory

       (* CHAPTER 6. Bookmarks *)
       method startGetBookmarkInfo = Cpdf.startGetBookmarkInfo
       method endGetBookmarkInfo = Cpdf.endGetBookmarkInfo ()
       method numberBookmarks = Cpdf.numberBookmarks ()
       method getBookmarkPage = Cpdf.getBookmarkPage
       method getBookmarkLevel = Cpdf.getBookmarkLevel
       method getBookmarkText = Cpdf.getBookmarkText
       method getBookmarkOpenStatus = Cpdf.getBookmarkOpenStatus
       method startSetBookmarkInfo = Cpdf.startSetBookmarkInfo
       method endSetBookmarkInfo = Cpdf.endSetBookmarkInfo
       method setBookmarkPage = Cpdf.setBookmarkPage
       method setBookmarkLevel = Cpdf.setBookmarkLevel
       method setBookmarkText = Cpdf.setBookmarkText
       method setBookmarkOpenStatus = Cpdf.setBookmarkOpenStatus
       method getBookmarksJSON = Cpdf.getBookmarksJSON
       method setBookmarksJSON = Cpdf.setBookmarksJSON
       method tableOfContents = Cpdf.tableOfContents

       (* CHAPTER 7. Presentations *)

       (* CHAPTER 8. Logos, Watermarks and Stamps *)
       method stampOn = Cpdf.stampOn
       method stampUnder = Cpdf.stampUnder
       method stampExtended = Cpdf.stampExtended
       method combinePages = Cpdf.combinePages
       method addText = Cpdf.addText
       method removeText = Cpdf.removeText
       method addContent = Cpdf.addContent
       method stampAsXObject = Cpdf.stampAsXObject
       method textWidth = Cpdf.textWidth

       (* CHAPTER 9. Multipage facilities *)
       method twoUp = Cpdf.twoUp
       method twoUpStack = Cpdf.twoUpStack
       method impose = Cpdf.impose
       method padBefore = Cpdf.padBefore
       method padAfter = Cpdf.padAfter
       method padEvery = Cpdf.padEvery
       method padMultiple = Cpdf.padMultiple
       method padMultipleBefore = Cpdf.padMultipleBefore

       (* CHAPTER 10. Annotations *)
       method annotationsJSON = Cpdf.annotationsJSON

       (* CHAPTER 11. Document Information and Metadata *)
       method getVersion = Cpdf.getVersion
       method getMajorVersion = Cpdf.getMajorVersion
       method isLinearized = Cpdf.isLinearized
       method isLinearizedMemory = Cpdf.isLinearizedMemory
       method getTitle = Cpdf.getTitle
       method getAuthor = Cpdf.getAuthor
       method getSubject = Cpdf.getSubject
       method getKeywords = Cpdf.getKeywords
       method getCreator = Cpdf.getCreator
       method getProducer = Cpdf.getProducer
       method getCreationDate = Cpdf.getCreationDate
       method getModificationDate = Cpdf.getModificationDate
       method getTitleXMP = Cpdf.getTitleXMP
       method getAuthorXMP = Cpdf.getAuthorXMP
       method getSubjectXMP = Cpdf.getSubjectXMP
       method getKeywordsXMP = Cpdf.getKeywordsXMP
       method getCreatorXMP = Cpdf.getCreatorXMP
       method getProducerXMP = Cpdf.getProducerXMP
       method getCreationDateXMP = Cpdf.getCreationDateXMP
       method getModificationDateXMP = Cpdf.getModificationDateXMP
       method getDateComponents = Cpdf.getDateComponents
       method dateStringOfComponents = Cpdf.dateStringOfComponents
       method setTitle = Cpdf.setTitle
       method setAuthor = Cpdf.setAuthor
       method setSubject = Cpdf.setSubject
       method setKeywords = Cpdf.setKeywords
       method setCreator = Cpdf.setCreator
       method setProducer = Cpdf.setProducer
       method setCreationDate = Cpdf.setCreationDate
       method setModificationDate = Cpdf.setModificationDate
       method markTrapped = Cpdf.markTrapped
       method markUntrapped = Cpdf.markUntrapped
       method markTrappedXMP = Cpdf.markTrappedXMP
       method markUntrappedXMP = Cpdf.markUntrappedXMP
       method setTitleXMP = Cpdf.setTitleXMP
       method setAuthorXMP = Cpdf.setAuthorXMP
       method setSubjectXMP = Cpdf.setSubjectXMP
       method setKeywordsXMP = Cpdf.setKeywordsXMP
       method setCreatorXMP = Cpdf.setCreatorXMP
       method setProducerXMP = Cpdf.setProducerXMP
       method setCreationDateXMP = Cpdf.setCreationDateXMP
       method setModificationDateXMP = Cpdf.setModificationDateXMP
       method hasBox = Cpdf.hasBox
       method getPageRotation = Cpdf.getPageRotation
       method setPageLayout = Cpdf.setPageLayout
       method setPageMode = Cpdf.setPageMode
       method hideToolbar = Cpdf.hideToolbar
       method hideMenubar = Cpdf.hideMenubar
       method hideWindowUi = Cpdf.hideWindowUi
       method fitWindow = Cpdf.fitWindow
       method centerWindow = Cpdf.centerWindow
       method displayDocTitle = Cpdf.displayDocTitle
       method openAtPage = Cpdf.openAtPage
       method setMetadataFromFile = Cpdf.setMetadataFromFile
       method setMetadataFromByteArray = Cpdf.setMetadataFromByteArray
       method getMetadata = Cpdf.getMetadata
       method removeMetadata = Cpdf.removeMetadata
       method createMetadata = Cpdf.createMetadata
       method setMetadataDate = Cpdf.setMetadataDate
       method addPageLabels = Cpdf.addPageLabels
       method removePageLabels = Cpdf.removePageLabels
       method startGetPageLabels = Cpdf.startGetPageLabels
       method getPageLabelStyle = Cpdf.getPageLabelStyle
       method getPageLabelPrefix = Cpdf.getPageLabelPrefix
       method getPageLabelOffset = Cpdf.getPageLabelOffset
       method getPageLabelRange = Cpdf.getPageLabelRange
       method endGetPageLabels = Cpdf.endGetPageLabels ()
       method getPageLabelStringForPage = Cpdf.getPageLabelStringForPage

       (* CHAPTER 12. File Attachments *)
       method attachFile = Cpdf.attachFile
       method attachFileToPage = Cpdf.attachFileToPage
       method attachFileFromMemory = Cpdf.attachFileFromMemory
       method attachFileToPageFromMemory = Cpdf.attachFileToPageFromMemory
       method removeAttachedFiles = Cpdf.removeAttachedFiles
       method startGetAttachments = Cpdf.startGetAttachments
       method endGetAttachments = Cpdf.endGetAttachments ()
       method numberGetAttachments = Cpdf.numberGetAttachments ()
       method getAttachmentName = Cpdf.getAttachmentName
       method getAttachmentPage = Cpdf.getAttachmentPage
       method getAttachmentData = Cpdf.getAttachmentData

       (* CHAPTER 13. Images *)
       method startGetImageResolution = Cpdf.startGetImageResolution
       method getImageResolutionPageNumber = Cpdf.getImageResolutionPageNumber
       method getImageResolutionImageName = Cpdf.getImageResolutionImageName
       method getImageResolutionXPixels = Cpdf.getImageResolutionXPixels
       method getImageResolutionYPixels = Cpdf.getImageResolutionYPixels
       method getImageResolutionXRes = Cpdf.getImageResolutionXRes
       method getImageResolutionYRes = Cpdf.getImageResolutionYRes
       method endGetImageResolution = Cpdf.endGetImageResolution ()

       (* CHAPTER 14. Fonts *)
       method numberFonts = Cpdf.numberFonts ()
       method getFontPage = Cpdf.getFontPage
       method getFontName = Cpdf.getFontName
       method getFontType = Cpdf.getFontType
       method getFontEncoding = Cpdf.getFontEncoding
       method startGetFontInfo = Cpdf.startGetFontInfo
       method endGetFontInfo = Cpdf.endGetFontInfo ()
       method copyFont = Cpdf.copyFont
       method removeFonts = Cpdf.removeFonts

       (* CHAPTER 15. PDF and JSON *)
       method outputJSON = Cpdf.outputJSON
       method outputJSONMemory = Cpdf.outputJSONMemory
       method fromJSON = Cpdf.fromJSON
       method fromJSONMemory = Cpdf.fromJSONMemory

       (* CHAPTER 16. Optional Content Groups *)
       method startGetOCGList = Cpdf.startGetOCGList
       method ocgListEntry = Cpdf.ocgListEntry
       method endGetOCGList = Cpdf.endGetOCGList ()
       method ocgCoalesce = Cpdf.ocgCoalesce
       method ocgRename = Cpdf.ocgRename
       method ocgOrderAll = Cpdf.ocgOrderAll

       (* CHAPTER 17. Creating New PDFs *)
       method blankDocument = Cpdf.blankDocument
       method blankDocumentPaper = Cpdf.blankDocumentPaper
       method textToPDF = Cpdf.textToPDF
       method textToPDFPaper = Cpdf.textToPDFPaper
       method textToPDFMemory = Cpdf.textToPDFMemory
       method textToPDFPaperMemory = Cpdf.textToPDFPaperMemory

       (* CHAPTER 18. Miscellaneous *)
       method draft = Cpdf.draft
       method removeAllText = Cpdf.removeAllText
       method blackText = Cpdf.blackText
       method blackLines = Cpdf.blackLines
       method blackFills = Cpdf.blackFills
       method thinLines = Cpdf.thinLines
       method copyId = Cpdf.copyId
       method removeId = Cpdf.removeId
       method setVersion = Cpdf.setVersion
       method setFullVersion = Cpdf.setFullVersion
       method removeDictEntry = Cpdf.removeDictEntry
       method removeDictEntrySearch = Cpdf.removeDictEntrySearch
       method replaceDictEntry = Cpdf.replaceDictEntry
       method replaceDictEntrySearch = Cpdf.replaceDictEntrySearch
       method getDictEntries = Cpdf.getDictEntries
       method removeClipping = Cpdf.removeClipping
    end)
