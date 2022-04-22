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
       method toFileMemory = Cpdflib.toFileMemory
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

       (* CHAPTER 4. Encryption and Decryption *)

       (* CHAPTER 5. Compression *)
       method compress = Cpdflib.compress
       method decompress = Cpdflib.decompress

       (* CHAPTER 6. Bookmarks *)

       (* CHAPTER 7. Presentations *)

       (* CHAPTER 8. Logos, Watermarks and Stamps *)

       (* CHAPTER 9. Multipage facilities *)

       (* CHAPTER 10. Annotations *)

       (* CHAPTER 11. Document Information and Metadata *)

       (* CHAPTER 12. File Attachments *)

       (* CHAPTER 13. Images *)

       (* CHAPTER 14. Fonts *)

       (* CHAPTER 15. PDF and JSON *)

       (* CHAPTER 16. Optional Content Groups *)

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
