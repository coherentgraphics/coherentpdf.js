open Js_of_ocaml

let _ =
  Js.export "cpdflib"
    (object%js
       (* CHAPTER 1. Basics *)
       method setFast = Cpdflib.setFast ()
       method setSlow = Cpdflib.setSlow ()
       val version = Cpdflib.version
       method startEnumeratePDFs = Cpdflib.startEnumeratePDFs ()
       method enumeratePDFsKey = Cpdflib.enumeratePDFsKey
       method endEnumeratePDFs = Cpdflib.endEnumeratePDFs ()
       method deletePdf = Cpdflib.deletePdf
       method parsePagespec = Cpdflib.parsePagespec
       method stringOfPagespec = Cpdflib.stringOfPagespec
       method ptOfCm = Cpdflib.ptOfCm
       method ptOfMm = Cpdflib.ptOfMm
       method ptOfIn = Cpdflib.ptOfIn
       method cmOfPt = Cpdflib.cmOfPt
       method mmOfPt = Cpdflib.mmOfPt
       method inOfPt = Cpdflib.inOfPt
       method range = Cpdflib.range
       method blankRange = Cpdflib.blankrange
       method makerange = Cpdflib.makerange
       method writerange = Cpdflib.writerange
       method readrange = Cpdflib.readrange
       method addtorange = Cpdflib.addtorange
       method even = Cpdflib.even
       method odd = Cpdflib.odd
       method union = Cpdflib.union
       method different = Cpdflib.difference
       method removeDuplicates = Cpdflib.removeDuplicates
       method isInRange = Cpdflib.isInRange
       method fromFile = Cpdflib.fromFile
       method fromFileLazy = Cpdflib.fromFileLazy
       method fromMemory = Cpdflib.fromMemory
       method fromMemoryLazy = Cpdflib.fromMemoryLazy
       method toFile = Cpdflib.toFile
       method toFileExt = Cpdflib.toFileExt
       method toFileEncrypted = Cpdflib.toFileEncrypted
       method toFileEncryptedExt = Cpdflib.toFileEncryptedExt
       method toMemory = Cpdflib.toFileMemory
       method pages = Cpdflib.pages
       method pagesFast = Cpdflib.pagesFast
       method all = Cpdflib.all
       method isEncrypted = Cpdflib.isEncrypted
       method decryptPdf = Cpdflib.decryptPdf
       method decryptPdfOwner = Cpdflib.decryptPdfOwner
       method hasPermission = Cpdflib.hasPermission
       method encryptionKind = Cpdflib.encryptionKind

       (* CHAPTER 2. Merging and Splitting *)
       method mergeSimple = Cpdflib.mergeSimple
       method merge = Cpdflib.merge
       method mergeSame = Cpdflib.mergeSame
       method selectPages = Cpdflib.selectPages

       (* CHAPTER 3. Pages *)
       method scalePages = Cpdflib.scalePages
       method scaleToFit = Cpdflib.scaleToFit
       method scaleToFitPaper = Cpdflib.scaleToFit
       method scaleContents = Cpdflib.scaleContents
       method rotate = Cpdflib.rotate
       method rotateBy = Cpdflib.rotateBy
       method rotateContents = Cpdflib.rotateContents
       method upright = Cpdflib.upright
       method hFlip = Cpdflib.hFlip
       method vFlip = Cpdflib.vFlip
       method crop = Cpdflib.crop
       method setMediabox = Cpdflib.setMediabox
       method setCropBox = Cpdflib.setCropBox
       method setTrimBox = Cpdflib.setTrimBox
       method setArtBox = Cpdflib.setArtBox
       method getMediaBox = Cpdflib.getMediaBox
       method getCropBox = Cpdflib.getCropBox
       method getArtBox = Cpdflib.getArtBox
       method getBleedBox = Cpdflib.getBleedBox
       method getTrimBox = Cpdflib.getTrimBox
       method removeCrop = Cpdflib.removeCrop
       method removeArt = Cpdflib.removeArt
       method removeTrim = Cpdflib.removeTrim
       method removeBleed = Cpdflib.removeBleed
       method hardBox = Cpdflib.hardBox
       method trimMarks = Cpdflib.trimMarks
       method showBoxes = Cpdflib.showBoxes


       (* CHAPTER 4. Encryption and Decryption *)

       (* CHAPTER 5. Compression *)
       method compress = Cpdflib.compress
       method decompress = Cpdflib.decompress

       (* CHAPTER 6. Bookmarks *)
       method startGetBookmarkInfo = Cpdflib.startGetBookmarkInfo
       method endGetBookmarkInfo = Cpdflib.endGetBookmarkInfo
       method numberBookmarks = Cpdflib.numberBookmarks
       method getBookmarkPage = Cpdflib.getBookmarkPage
       method getBookmarkLevel = Cpdflib.getBookmarkLevel
       method getBookmarkText = Cpdflib.getBookmarkText
       method getBookmarkOpenStatus = Cpdflib.getBookmarkOpenStatus
       method startSetBookmarkInfo = Cpdflib.startSetBookmarkInfo
       method endSetBookmarkInfo = Cpdflib.endSetBookmarkInfo
       method setBookmarkPage = Cpdflib.setBookmarkPage
       method setBookmarkLevel = Cpdflib.setBookmarkLevel
       method setBookmarkOpenStatus = Cpdflib.setBookmarkOpenStatus
       method getBookmarksJSON = Cpdflib.getBookmarksJSON
       method setBookmarksJSON = Cpdflib.setBookmarksJSON
       method tableOfContents = Cpdflib.tableOfContents

       (* CHAPTER 7. Presentations *)

       (* CHAPTER 8. Logos, Watermarks and Stamps *)
       method stampOn = Cpdflib.stampOn
       method stampUnder = Cpdflib.stampUnder
       method stampExtended = Cpdflib.stampExtended
       method combinePages = Cpdflib.combinePages
       method addText = Cpdflib.addText
       method removeText = Cpdflib.removeText
       method addContent = Cpdflib.addContent
       method stampAsXObject = Cpdflib.stampAsXObject

       (* CHAPTER 9. Multipage facilities *)
       method twoUp = Cpdflib.twoUp
       method twoUpStack = Cpdflib.twoUpStack
       method impose = Cpdflib.impose
       method padBefore = Cpdflib.padBefore
       method padAfter = Cpdflib.padAfter
       method padEvery = Cpdflib.padEvery
       method padMultiple = Cpdflib.padMultiple
       method padMultipleBefore = Cpdflib.padMultipleBefore

       (* CHAPTER 10. Annotations *)
       method annotationsJSON = Cpdflib.annotationsJSON

       (* CHAPTER 11. Document Information and Metadata *)
       method getVersion = Cpdflib.getVersion
       method isLinearized = Cpdflib.isLinearized
       method getTitle = Cpdflib.getTitle
       method getAuthor = Cpdflib.getAuthor
       method getSubject = Cpdflib.getSubject
       method getKeywords = Cpdflib.getKeywords
       method getCreator = Cpdflib.getCreator
       method getProducer = Cpdflib.getProducer
       method getCreationDate = Cpdflib.getCreationDate
       method getModificationDate = Cpdflib.getModificationDate
       method getTitleXMP = Cpdflib.getTitleXMP
       method getAuthorXMP = Cpdflib.getAuthorXMP
       method getSubjectXMP = Cpdflib.getSubjectXMP
       method getKeywordsXMP = Cpdflib.getKeywordsXMP
       method getCreatorXMP = Cpdflib.getCreatorXMP
       method getProducerXMP = Cpdflib.getProducerXMP
       method getCreationDateXMP = Cpdflib.getCreationDateXMP
       method getModificationDateXMP = Cpdflib.getModificationDateXMP
       method getDateComponents = Cpdflib.getDateComponents
       method dateStringOfComponents = Cpdflib.dateStringOfComponents
       method setTitle = Cpdflib.setTitle
       method setAuthor = Cpdflib.setAuthor
       method setSubject = Cpdflib.setSubject
       method setKeywords = Cpdflib.setKeywords
       method setCreator = Cpdflib.setCreator
       method setProducer = Cpdflib.setProducer
       method setCreationDate = Cpdflib.setCreationDate
       method setModificationDate = Cpdflib.setModificationDate
       method markTrapped = Cpdflib.markTrapped
       method markUntrapped = Cpdflib.markUntrapped
       method setTitleXMP = Cpdflib.setTitleXMP
       method setAuthorXMP = Cpdflib.setAuthorXMP
       method setSubjectXMP = Cpdflib.setSubjectXMP
       method setKeywordsXMP = Cpdflib.setKeywordsXMP
       method setCreatorXMP = Cpdflib.setCreatorXMP
       method setProducerXMP = Cpdflib.setProducerXMP
       method setCreationDateXMP = Cpdflib.setCreationDateXMP
       method setModificationDateXMP = Cpdflib.setModificationDateXMP
       method hasBox = Cpdflib.hasBox
       method getPageRotation = Cpdflib.getPageRotation
       method setPageLayout = Cpdflib.setPageLayout
       method setPageMode = Cpdflib.setPageMode
       method hideToolbar = Cpdflib.hideToolbar
       method hideMenubar = Cpdflib.hideMenubar
       method hideWindowUi = Cpdflib.hideWindowUi
       method fitWindow = Cpdflib.fitWindow
       method centerWindow = Cpdflib.centerWindow
       method displayDocTitle = Cpdflib.displayDocTitle
       method openAtPage = Cpdflib.openAtPage
       method setMetadataFromFile = Cpdflib.setMetadataFromFile
       method getMetadata = Cpdflib.getMetadata
       method removeMetadata = Cpdflib.removeMetadata
       method createMetadata = Cpdflib.createMetadata
       method setMetadataDate = Cpdflib.setMetadataDate
       method addPageLabels = Cpdflib.addPageLabels
       method removePageLabels = Cpdflib.removePageLabels
       method startGetPageLabels = Cpdflib.startGetPageLabels
       method getPageLabelStyle = Cpdflib.getPageLabelStyle
       method getPageLabelPrefix = Cpdflib.getPageLabelPrefix
       method getPageLabelOffset = Cpdflib.getPageLabelOffset
       method getPageLabelRange = Cpdflib.getPageLabelRange
       method endGetPageLabels = Cpdflib.endGetPageLabels
       method getPageLabelStringForPage = Cpdflib.getPageLabelStringForPage

       (* CHAPTER 12. File Attachments *)
       method attachFile = Cpdflib.attachFile
       method attachFileToPage = Cpdflib.attachFileToPage
       method removeAttachedFiles = Cpdflib.removeAttachedFiles
       method startGetAttachments = Cpdflib.startGetAttachments
       method endGetAttachments = Cpdflib.endGetAttachments
       method numberGetAttachments = Cpdflib.numberGetAttachments
       method getAttachmentName = Cpdflib.getAttachmentName
       method getAttachmentPage = Cpdflib.getAttachmentPage
       method getAttachmentData = Cpdflib.getAttachmentData

       (* CHAPTER 13. Images *)
       method startGetImageResolution = Cpdflib.startGetImageResolution
       method getImageResolutionPageNumber = Cpdflib.getImageResolutionPageNumber
       method getImageResolutionImageName = Cpdflib.getImageResolutionImageName
       method getImageResolutionXPixels = Cpdflib.getImageResolutionXPixels
       method getImageResolutionYPixels = Cpdflib.getImageResolutionYPixels
       method getImageResolutionXRes = Cpdflib.getImageResolutionXRes
       method getImageResolutionYRes = Cpdflib.getImageResolutionYRes
       method endGetImageResolution = Cpdflib.endGetImageResolution

       (* CHAPTER 14. Fonts *)
       method numberFonts = Cpdflib.numberFonts
       method getFontPage = Cpdflib.getFontPage
       method getFontName = Cpdflib.getFontName
       method getFontType = Cpdflib.getFontType
       method getFontEncoding = Cpdflib.getFontEncoding
       method startGetFontInfo = Cpdflib.startGetFontInfo
       method endGetFontInfo = Cpdflib.endGetFontInfo
       method copyFont = Cpdflib.copyFont
       method removeFonts = Cpdflib.removeFonts

       (* CHAPTER 15. PDF and JSON *)
       method outputJSON = Cpdflib.outputJSON
       method outputJSONMemory = Cpdflib.outputJSONMemory
       method fromJSON = Cpdflib.fromJSON
       method fromJSONMemory = Cpdflib.fromJSONMemory

       (* CHAPTER 16. Optional Content Groups *)
       method startGetOCGList = Cpdflib.startGetOCGList
       method ocgListEntry = Cpdflib.ocgListEntry
       method endGetOCGList = Cpdflib.endGetOCGList
       method ocgCoalesce = Cpdflib.ocgCoalesce
       method ocgRename = Cpdflib.ocgRename
       method ocgOrderAll = Cpdflib.ocgOrderAll

       (* CHAPTER 17. Creating New PDFs *)
       method blankDocument = Cpdflib.blankDocument
       method blankDocumentPaper = Cpdflib.blankDocumentPaper
       method textToPDF = Cpdflib.textToPDF
       method textToPDFPaper = Cpdflib.textToPDFPaper

       (* CHAPTER 18. Miscellaneous *)
       method draft = Cpdflib.draft
       method removeAllText = Cpdflib.removeAllText
       method blackText = Cpdflib.blackText
       method blackLines = Cpdflib.blackLines
       method blackFills = Cpdflib.blackFills
       method thinLines = Cpdflib.thinLines
       method copyId = Cpdflib.copyId
       method removeId = Cpdflib.removeId
       method setVersion = Cpdflib.setVersion
       method setFullVersion = Cpdflib.setFullVersion
       method removeDictEntry = Cpdflib.removeDictEntry
       method removeDictEntrySearch = Cpdflib.removeDictEntrySearch
       method replaceDictEntry = Cpdflib.replaceDictEntry
       method replaceDictEntrySearch = Cpdflib.replaceDictEntrySearch
       method getDictEntries = Cpdflib.getDictEntries
       method removeClipping = Cpdflib.removeClipping
    end)
