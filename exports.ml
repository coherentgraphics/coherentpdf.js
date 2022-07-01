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

let checkerror_unit x =
  ignore (checkerror x);
  Js.undefined

let checkerror_bool x =
  ignore (checkerror x);
  Js.bool x

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

(* Pdfio.rawbytes to JavaScript typed array *)
let data_out x =
  Typed_array.from_genarray (Bigarray.genarray_of_array1 x)

let data_in x =
  Bigarray.array1_of_genarray (Typed_array.to_genarray x)

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
       (* CHAPTER 1. Basics *)
       method setFast =
         checkerror_unit (Cpdf.setFast ())
       method setSlow =
         checkerror_unit (Cpdf.setSlow ())
       method version =
         checkerror ((fun () -> Js.string Cpdf.version) ())
       method onexit =
         checkerror_unit (Cpdf.onexit ())
       method startEnumeratePDFs =
         checkerror (Cpdf.startEnumeratePDFs ())
       method enumeratePDFsKey a =
         checkerror (Cpdf.enumeratePDFsKey a)
       method enumeratePDFsInfo a =
         checkerror (Js.string (Cpdf.enumeratePDFsInfo a))
       method endEnumeratePDFs =
         checkerror_unit (Cpdf.endEnumeratePDFs ())
       method deletePdf pdf =
         checkerror_unit (Cpdf.deletePdf pdf)
       method parsePagespec pdf pagespec =
         let range = Cpdf.parsePagespec pdf (Js.to_string pagespec) in
         let arr = array_of_range range in
           Cpdf.deleterange range;
           checkerror arr
       method stringOfPagespec pdf r =
         let range = range_of_array r in
         let ret = Js.string (Cpdf.stringOfPagespec pdf range) in
           Cpdf.deleterange range;
           checkerror ret
       method validatePagespec pagespec =
         checkerror_bool (Cpdf.validatePagespec (Js.to_string pagespec))
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
         let range = Cpdf.range f t in
         let arr = array_of_range range in
           Cpdf.deleterange range;
           checkerror arr
       method blankRange =
         let range = Cpdf.blankrange () in
         let arr = array_of_range range in
           Cpdf.deleterange range;
           checkerror arr
       method rangeAdd r page =
         let range = range_of_array r in
         let added = Cpdf.addtorange range page in
         let arr = array_of_range added in
           Cpdf.deleterange range;
           Cpdf.deleterange added;
           checkerror arr
       method even x =
         let range = range_of_array x in
         let even = Cpdf.even range in
         let arr = array_of_range even in
           Cpdf.deleterange range;
           Cpdf.deleterange even;
           checkerror arr
       method odd x =
         let range = range_of_array x in
         let odd = Cpdf.odd range in
         let arr = array_of_range odd in
           Cpdf.deleterange range;
           Cpdf.deleterange odd;
           checkerror arr
       method rangeUnion a b =
         let range_a = range_of_array a in
         let range_b = range_of_array b in
         let union = Cpdf.union range_a range_b in
         let arr = array_of_range union in
           Cpdf.deleterange range_a;
           Cpdf.deleterange range_b;
           Cpdf.deleterange union;
           arr
       method rangeLength r =
         let range = range_of_array r in
         let ret = Cpdf.lengthrange range in
           Cpdf.deleterange range;
           checkerror ret
       method rangeGet r n =
         let range = range_of_array r in
         let ret = Cpdf.readrange range n in
           Cpdf.deleterange range;
           checkerror ret
       method difference a b =
         let range_a = range_of_array a in
         let range_b = range_of_array b in
         let diff = Cpdf.difference range_a range_b in
         let arr = array_of_range diff in
           Cpdf.deleterange range_a;
           Cpdf.deleterange range_b;
           Cpdf.deleterange diff;
           checkerror arr
       method removeDuplicates x =
         let range = range_of_array x in
         let deduped = Cpdf.removeDuplicates range in
         let arr = array_of_range deduped in
           Cpdf.deleterange range;
           Cpdf.deleterange deduped;
           checkerror arr
       method isInRange r page =
         let range = range_of_array r in
         let ret = Cpdf.isInRange range page in
           Cpdf.deleterange range;
           checkerror_bool ret
       method fromFile filename userpw =
         checkerror (Cpdf.fromFile (Js.to_string filename) (Js.to_string userpw))
       method fromFileLazy filename userpw =
         checkerror (Cpdf.fromFileLazy (Js.to_string filename) (Js.to_string userpw))
       method fromMemory data userpw =
         checkerror (Cpdf.fromMemory (data_in data) (Js.to_string userpw))
       method fromMemoryLazy data userpw =
         checkerror (Cpdf.fromMemoryLazy (data_in data) (Js.to_string userpw))
       method toFile pdf filename linearize make_id =
         checkerror_unit (Cpdf.toFile pdf (Js.to_string filename) linearize make_id)
       method toFileExt pdf filename linearize make_id preserve_objstm generate_objstm compress_objstm =
         checkerror_unit (Cpdf.toFileExt pdf (Js.to_string filename) linearize make_id preserve_objstm generate_objstm compress_objstm)
       method toFileEncrypted pdf encryption_method permissions ownerpw userpw linearize makeid filename =
         checkerror_unit (Cpdf.toFileEncrypted
           pdf encryption_method (Js.to_array permissions) (Js.to_string ownerpw) (Js.to_string userpw)
           linearize makeid (Js.to_string filename))
       method toFileEncryptedExt
         pdf encryption_method permissions ownerpw userpw linearize makeid preserve_objstm generate_objstm
         compress_objstm filename
       =
         checkerror_unit (Cpdf.toFileEncryptedExt
           pdf encryption_method (Js.to_array permissions) (Js.to_string ownerpw) (Js.to_string userpw)
           linearize makeid preserve_objstm generate_objstm compress_objstm (Js.to_string filename))
       method toMemory pdf linearize make_id =
         checkerror (data_out (Cpdf.toFileMemory pdf linearize make_id))
       method toMemoryExt pdf linearize make_id preserve_objstm generate_objstm compress_objstm =
         checkerror (data_out (Cpdf.toFileMemoryExt pdf linearize make_id preserve_objstm generate_objstm compress_objstm))
       method toMemoryEncrypted pdf encryption_method permissions ownerpw userpw linearize makeid =
         checkerror (data_out (Cpdf.toFileMemoryEncrypted pdf encryption_method permissions ownerpw userpw linearize makeid))
       method toMemoryEncryptedExt pdf encryption_method permissions ownerpw userpw linearize makeid preserve_objstm generate_objstm compress_objstm =
         checkerror (data_out (Cpdf.toFileMemoryEncryptedExt pdf encryption_method permissions ownerpw userpw linearize makeid preserve_objstm generate_objstm compress_objstm))
       method pages pdf =
         checkerror (Cpdf.pages pdf)
       method pagesFast password filename =
         checkerror (Cpdf.pagesFast (Js.to_string password) (Js.to_string filename))
       method pagesFastMemory password data =
         checkerror (Cpdf.pagesFastMemory (Js.to_string password) (data_in data))
       method all pdf =
         let range = Cpdf.all pdf in
         let ret = array_of_range range in
           Cpdf.deleterange range;
           checkerror ret
       method isEncrypted pdf =
         checkerror_bool (Cpdf.isEncrypted pdf)
       method decryptPdf pdf userpw =
         checkerror_unit (Cpdf.decryptPdf pdf (Js.to_string userpw))
       method decryptPdfOwner pdf ownerpw =
         checkerror_unit (Cpdf.decryptPdfOwner pdf (Js.to_string ownerpw))
       method hasPermission pdf permission =
         checkerror_bool (Cpdf.hasPermission pdf permission)
       method encryptionKind pdf =
         checkerror (Cpdf.encryptionKind pdf)

       (* CHAPTER 2. Merging and Splitting *)
       method mergeSimple pdfs =
         checkerror (Cpdf.mergeSimple (Js.to_array pdfs))
       method merge pdfs retain_numbering remove_duplicate_fonts =
         checkerror (Cpdf.merge (Js.to_array pdfs) retain_numbering remove_duplicate_fonts)
       method mergeSame pdfs retain_numbering remove_duplicate_fonts ranges =
         let ranges = Array.map range_of_array (Js.to_array ranges) in
         let ret = Cpdf.mergeSame (Js.to_array pdfs) retain_numbering remove_duplicate_fonts ranges in
           Array.iter Cpdf.deleterange ranges;
           checkerror ret
       method selectPages pdf range =
         let range = range_of_array range in
         let ret = Cpdf.selectPages pdf range in
           Cpdf.deleterange range;
           checkerror ret

       (* CHAPTER 3. Pages *)
       method scalePages pdf range sx sy =
         let range = range_of_array range in
         let ret = Cpdf.scalePages pdf range sx sy in
           Cpdf.deleterange range;
           checkerror_unit ret
       method scaleToFit pdf range sx sy scale =
         let range = range_of_array range in
         let ret = Cpdf.scaleToFit pdf range sx sy scale in
           Cpdf.deleterange range;
           checkerror_unit ret
       method scaleToFitPaper pdf range papersize s =
         let range = range_of_array range in
         let ret = Cpdf.scaleToFitPaper pdf range papersize s in
           Cpdf.deleterange range;
           checkerror_unit ret
       method scaleContents pdf range anchor p1 p2 scale =
         let range = range_of_array range in
         let ret = Cpdf.scaleContents pdf range anchor p1 p2 scale in
           Cpdf.deleterange range;
           checkerror_unit ret
       method shiftContents pdf range dx dy =
         let range = range_of_array range in
         let ret = Cpdf.shiftContents pdf range dx dy in
           Cpdf.deleterange range;
           checkerror_unit ret
       method rotate pdf range rotation =
         let range = range_of_array range in
         let ret = Cpdf.rotate pdf range rotation in
           Cpdf.deleterange range;
           checkerror_unit ret
       method rotateBy pdf range rotation =
         let range = range_of_array range in
         let ret = Cpdf.rotateBy pdf range rotation in
           Cpdf.deleterange range;
           checkerror_unit ret
       method rotateContents pdf range angle =
         let range = range_of_array range in
         let ret = Cpdf.rotateContents pdf range angle in
           Cpdf.deleterange range;
           checkerror_unit ret
       method upright pdf range =
         let range = range_of_array range in
         let ret = Cpdf.upright pdf range in
           Cpdf.deleterange range;
           checkerror_unit ret
       method hFlip pdf range =
         let range = range_of_array range in
         let ret = Cpdf.hFlip pdf range in
           Cpdf.deleterange range;
           checkerror_unit ret
       method vFlip pdf range =
         let range = range_of_array range in
         let ret = Cpdf.vFlip pdf range in
           Cpdf.deleterange range;
           checkerror_unit ret
       method crop pdf range x y w h =
         let range = range_of_array range in
         let ret = Cpdf.crop pdf range x y w h in
           Cpdf.deleterange range;
           checkerror_unit ret
       method setMediabox pdf range minx maxx miny maxy =
         let range = range_of_array range in
         let ret = Cpdf.setMediabox pdf range minx maxx miny maxy in
           Cpdf.deleterange range;
           checkerror_unit ret
       method setCropBox pdf range minx maxx miny maxy =
         let range = range_of_array range in
         let ret = Cpdf.setCropBox pdf range minx maxx miny maxy in
           Cpdf.deleterange range;
           checkerror_unit ret
       method setTrimBox pdf range minx maxx miny maxy =
         let range = range_of_array range in
         let ret = Cpdf.setTrimBox pdf range minx maxx miny maxy in
           Cpdf.deleterange range;
           checkerror_unit ret
       method setArtBox pdf range minx maxx miny maxy =
         let range = range_of_array range in
         let ret = Cpdf.setArtBox pdf range minx maxx miny maxy in
           Cpdf.deleterange range;
           checkerror_unit ret
       method setBleedBox pdf range minx maxx miny maxy =
         let range = range_of_array range in
         let ret = Cpdf.setBleedBox pdf range minx maxx miny maxy in
           Cpdf.deleterange range;
           checkerror_unit ret
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
         let range = range_of_array range in
         let ret = Cpdf.removeCrop pdf range in
           Cpdf.deleterange range;
           checkerror_unit ret
       method removeArt pdf range =
         let range = range_of_array range in
         let ret = Cpdf.removeArt pdf range in
           Cpdf.deleterange range;
           checkerror_unit ret
       method removeTrim pdf range =
         let range = range_of_array range in
         let ret = Cpdf.removeTrim pdf range in 
           Cpdf.deleterange range;
           checkerror_unit ret
       method removeBleed pdf range =
         let range = range_of_array range in
         let ret = Cpdf.removeBleed pdf range in
           Cpdf.deleterange range;
           checkerror_unit ret
       method hardBox pdf range boxname =
         let range = range_of_array range in
         let ret = Cpdf.hardBox pdf range (Js.to_string boxname) in
           Cpdf.deleterange range;
           checkerror_unit ret
       method trimMarks pdf range =
         let range = range_of_array range in
         let ret = Cpdf.trimMarks pdf range in
           Cpdf.deleterange range;
           checkerror_unit ret
       method showBoxes pdf range =
         let range = range_of_array range in
         let ret = Cpdf.showBoxes pdf range in
           Cpdf.deleterange range;
           checkerror_unit ret

       (* CHAPTER 4. Encryption and Decryption *)

       (* CHAPTER 5. Compression *)
       method compress pdf =
         checkerror_unit (Cpdf.compress pdf)
       method decompress pdf =
         checkerror_unit (Cpdf.decompress pdf)
       method squeezeInMemory pdf =
         checkerror_unit (Cpdf.squeezeInMemory pdf)

       (* CHAPTER 6. Bookmarks *)
       method startGetBookmarkInfo pdf =
         checkerror_unit (Cpdf.startGetBookmarkInfo pdf)
       method endGetBookmarkInfo =
         checkerror_unit (Cpdf.endGetBookmarkInfo ())
       method numberBookmarks =
         checkerror (Cpdf.numberBookmarks ())
       method getBookmarkPage pdf n =
         checkerror (Cpdf.getBookmarkPage pdf n)
       method getBookmarkLevel n =
         checkerror (Cpdf.getBookmarkLevel n)
       method getBookmarkText n =
         checkerror (Js.string (Cpdf.getBookmarkText n))
       method getBookmarkOpenStatus n =
         checkerror_bool (Cpdf.getBookmarkOpenStatus n)
       method startSetBookmarkInfo n =
         checkerror_unit (Cpdf.startSetBookmarkInfo n)
       method endSetBookmarkInfo pdf =
         checkerror_unit (Cpdf.endSetBookmarkInfo pdf)
       method setBookmarkPage pdf n page =
         checkerror_unit (Cpdf.setBookmarkPage pdf n page)
       method setBookmarkLevel n level =
         checkerror_unit (Cpdf.setBookmarkLevel n level)
       method setBookmarkText n text =
         checkerror_unit (Cpdf.setBookmarkText n (Js.to_string text))
       method setBookmarkOpenStatus n status =
         checkerror_unit (Cpdf.setBookmarkOpenStatus n status)
       method getBookmarksJSON pdf =
         checkerror (data_out (Cpdf.getBookmarksJSON pdf))
       method setBookmarksJSON pdf data =
         checkerror_unit (Cpdf.setBookmarksJSON pdf (data_in data))
       method tableOfContents pdf font fontsize title bookmark =
         checkerror_unit (Cpdf.tableOfContents pdf font fontsize (Js.to_string title) bookmark)

       (* CHAPTER 7. Presentations *)

       (* CHAPTER 8. Logos, Watermarks and Stamps *)
       method stampOn stamp_pdf pdf range =
         let range = range_of_array range in
         let ret = Cpdf.stampOn stamp_pdf pdf range in
           Cpdf.deleterange range;
           checkerror_unit ret
       method stampUnder stamp_pdf pdf range =
         let range = range_of_array range in
         let ret = Cpdf.stampUnder stamp_pdf pdf range in
           Cpdf.deleterange range;
           checkerror_unit ret
       method stampExtended pdf pdf2 range isover scale_stamp_to_fit anchor p1 p2 relative_to_cropbox =
         let range = range_of_array range in
         let ret = Cpdf.stampExtended pdf pdf2 range isover scale_stamp_to_fit p1 p2 anchor relative_to_cropbox in
           Cpdf.deleterange range;
           checkerror_unit ret
       method combinePages under over =
         checkerror (Cpdf.combinePages under over)
       method addText
         metrics pdf range text anchor p1 p2 linespacing bates font fontsize r g b
         underneath relative_to_cropbox outline opacity justification midline
         topline filename linewidth embed_fonts
       =
         let range = range_of_array range in
         let ret = 
           Cpdf.addText metrics pdf range (Js.to_string text) anchor p1 p2
            linespacing bates font fontsize r g b underneath relative_to_cropbox outline
            opacity justification midline topline (Js.to_string filename) linewidth
            embed_fonts (* position *)
         in
           Cpdf.deleterange range;
           checkerror_unit ret
       method addTextSimple pdf range text anchor p1 p2 font fontsize =
         let range = range_of_array range in
         let ret =
           Cpdf.addText false pdf range (Js.to_string text) anchor p1 p2 1.0 0 font fontsize 0. 0. 0. false false false 1.0 Cpdfaddtext.LeftJustify false false "" 0.0 false
         in
           Cpdf.deleterange range;
           checkerror_unit ret
       method removeText pdf range =
         let range = range_of_array range in
         let ret = Cpdf.removeText pdf range in
           Cpdf.deleterange range;
           checkerror_unit ret
       method addContent content before pdf range =
         let range = range_of_array range in
         let ret = Cpdf.addContent (Js.to_string content) before pdf range in
           Cpdf.deleterange range;
           checkerror_unit ret
       method stampAsXObject pdf range stamp_pdf =
         let range = range_of_array range in
         let ret = Js.string (Cpdf.stampAsXObject pdf range stamp_pdf) in
           Cpdf.deleterange range;
           checkerror ret
       method textWidth font text =
         checkerror (Cpdf.textWidth font (Js.to_string text))

       (* CHAPTER 9. Multipage facilities *)
       method twoUp pdf =
         checkerror_unit (Cpdf.twoUp pdf)
       method twoUpStack pdf =
         checkerror_unit (Cpdf.twoUpStack pdf)
       method impose pdf x y fit columns rtl btt center margin spacing linewidth =
         checkerror_unit (Cpdf.impose pdf x y fit columns rtl btt center margin spacing linewidth)
       method padBefore pdf range =
         let range = range_of_array range in
         let ret = Cpdf.padBefore pdf range in
           Cpdf.deleterange range;
           checkerror_unit ret
       method padAfter pdf range =
         let range = range_of_array range in
         let ret = Cpdf.padAfter pdf range in
           Cpdf.deleterange range;
           checkerror_unit ret
       method padEvery pdf n =
         checkerror_unit (Cpdf.padEvery pdf n)
       method padMultiple pdf n =
         checkerror_unit (Cpdf.padMultiple pdf n)
       method padMultipleBefore pdf n =
         checkerror_unit (Cpdf.padMultipleBefore pdf n)

       (* CHAPTER 10. Annotations *)
       method annotationsJSON pdf =
         checkerror (data_out (Cpdf.annotationsJSON pdf))

       (* CHAPTER 11. Document Information and Metadata *)
       method getVersion pdf =
         checkerror (Cpdf.getVersion pdf)
       method getMajorVersion pdf =
         checkerror (Cpdf.getMajorVersion pdf)
       method isLinearized filename =
         checkerror_bool (Cpdf.isLinearized (Js.to_string filename))
       method isLinearizedMemory data =
         checkerror (Cpdf.isLinearizedMemory (data_in data))
       method getTitle pdf =
         checkerror (Js.string (Cpdf.getTitle pdf))
       method getAuthor pdf =
         checkerror (Js.string (Cpdf.getAuthor pdf))
       method getSubject pdf =
         checkerror (Js.string (Cpdf.getSubject pdf))
       method getKeywords pdf =
         checkerror (Js.string (Cpdf.getKeywords pdf))
       method getCreator pdf =
         checkerror (Js.string (Cpdf.getCreator pdf))
       method getProducer pdf =
         checkerror (Js.string (Cpdf.getProducer pdf))
       method getCreationDate pdf = 
         checkerror (Js.string (Cpdf.getCreationDate pdf))
       method getModificationDate pdf =
         checkerror (Js.string (Cpdf.getModificationDate pdf))
       method getTitleXMP pdf =
         checkerror (Js.string (Cpdf.getTitleXMP pdf))
       method getAuthorXMP pdf =
         checkerror (Js.string (Cpdf.getAuthorXMP pdf))
       method getSubjectXMP pdf =
         checkerror (Js.string (Cpdf.getSubjectXMP pdf))
       method getKeywordsXMP pdf =
         checkerror (Js.string (Cpdf.getKeywordsXMP pdf))
       method getCreatorXMP pdf =
         checkerror (Js.string (Cpdf.getCreatorXMP pdf))
       method getProducerXMP pdf =
         checkerror (Js.string (Cpdf.getProducerXMP pdf))
       method getCreationDateXMP pdf = 
         checkerror (Js.string (Cpdf.getCreationDateXMP pdf))
       method getModificationDateXMP pdf =
         checkerror (Js.string (Cpdf.getModificationDateXMP pdf))
       method getDateComponents s =
         let t = Cpdf.getDateComponents (Js.to_string s) in
         checkerror (Js.array [|t.year; t.month; t.day; t.hour; t.minute; t.second; t.hour_offset; t.minute_offset|])
       method dateStringOfComponents y m d h min sec hour_offset minute_offset =
         checkerror (Js.string (Cpdf.dateStringOfComponents y m d h min sec hour_offset minute_offset))
       method setTitle pdf s =
         checkerror_unit (Cpdf.setTitle pdf (Js.to_string s))
       method setAuthor pdf s =
         checkerror_unit (Cpdf.setAuthor pdf (Js.to_string s))
       method setSubject pdf s =
         checkerror_unit (Cpdf.setSubject pdf (Js.to_string s))
       method setKeywords pdf s =
         checkerror_unit (Cpdf.setKeywords pdf (Js.to_string s))
       method setCreator pdf s =
         checkerror_unit (Cpdf.setCreator pdf (Js.to_string s))
       method setProducer pdf s =
         checkerror_unit (Cpdf.setProducer pdf (Js.to_string s))
       method setCreationDate pdf s = 
         checkerror_unit (Cpdf.setCreationDate pdf (Js.to_string s))
       method setModificationDate pdf s =
         checkerror_unit (Cpdf.setModificationDate pdf (Js.to_string s))
       method setTitleXMP pdf s =
         checkerror_unit (Cpdf.setTitleXMP pdf (Js.to_string s))
       method setAuthorXMP pdf s =
         checkerror_unit (Cpdf.setAuthorXMP pdf (Js.to_string s))
       method setSubjectXMP pdf s =
         checkerror_unit (Cpdf.setSubjectXMP pdf (Js.to_string s))
       method setKeywordsXMP pdf s =
         checkerror_unit (Cpdf.setKeywordsXMP pdf (Js.to_string s))
       method setCreatorXMP pdf s =
         checkerror_unit (Cpdf.setCreatorXMP pdf (Js.to_string s))
       method setProducerXMP pdf s =
         checkerror_unit (Cpdf.setProducerXMP pdf (Js.to_string s))
       method setCreationDateXMP pdf s =
         checkerror_unit (Cpdf.setCreationDateXMP pdf (Js.to_string s))
       method setModificationDateXMP pdf s =
         checkerror_unit (Cpdf.setModificationDateXMP pdf (Js.to_string s))
       method markTrapped pdf =
         checkerror_unit (Cpdf.markTrapped pdf)
       method markUntrapped pdf =
         checkerror_unit (Cpdf.markUntrapped pdf)
       method markTrappedXMP pdf =
         checkerror_unit (Cpdf.markTrappedXMP pdf)
       method markUntrappedXMP pdf =
         checkerror_unit (Cpdf.markUntrappedXMP pdf)
       method hasBox pdf page box =
         checkerror_bool (Cpdf.hasBox pdf page (Js.to_string box))
       method getPageRotation pdf page =
         checkerror (Cpdf.getPageRotation pdf page)
       method setPageLayout pdf layout =
         checkerror_unit (Cpdf.setPageLayout pdf layout)
       method setPageMode pdf mode =
         checkerror_unit (Cpdf.setPageMode pdf mode)
       method hideToolbar pdf flag =
         checkerror_unit (Cpdf.hideToolbar pdf flag)
       method hideMenubar pdf flag =
         checkerror_unit (Cpdf.hideMenubar pdf flag)
       method hideWindowUi pdf flag =
         checkerror_unit (Cpdf.hideWindowUi pdf flag)
       method fitWindow pdf flag =
         checkerror_unit (Cpdf.fitWindow pdf flag)
       method centerWindow pdf flag =
         checkerror_unit (Cpdf.centerWindow pdf flag)
       method displayDocTitle pdf flag =
         checkerror_unit (Cpdf.displayDocTitle pdf flag)
       method openAtPage pdf fit pagenumber =
         checkerror_unit (Cpdf.openAtPage pdf fit pagenumber)
       method setMetadataFromFile pdf filename =
         checkerror_unit (Cpdf.setMetadataFromFile pdf (Js.to_string filename))
       method setMetadataFromByteArray pdf data =
         checkerror_unit (Cpdf.setMetadataFromByteArray pdf (data_in data))
       method getMetadata pdf =
         checkerror (data_out (Cpdf.getMetadata pdf))
       method removeMetadata pdf =
         checkerror_unit (Cpdf.removeMetadata pdf)
       method createMetadata pdf =
         checkerror_unit (Cpdf.createMetadata pdf)
       method setMetadataDate pdf date =
         checkerror_unit (Cpdf.setMetadataDate pdf (Js.to_string date))
       method addPageLabels pdf style prefix offset range progress =
         let range = range_of_array range in
         let ret = Cpdf.addPageLabels pdf style (Js.to_string prefix) offset range progress in
           Cpdf.deleterange range;
           checkerror_unit ret
       method removePageLabels pdf = 
         checkerror_unit (Cpdf.removePageLabels pdf)
       method startGetPageLabels pdf =
         checkerror (Cpdf.startGetPageLabels pdf)
       method getPageLabelStyle n =
         checkerror (Cpdf.getPageLabelStyle n)
       method getPageLabelPrefix n =
         checkerror (Js.string (Cpdf.getPageLabelPrefix n))
       method getPageLabelOffset n =
         checkerror (Cpdf.getPageLabelOffset n)
       method getPageLabelRange n =
         checkerror (Cpdf.getPageLabelRange n)
       method endGetPageLabels =
         checkerror_unit (Cpdf.endGetPageLabels ())
       method getPageLabelStringForPage pdf pagenumber =
         checkerror (Js.string (Cpdf.getPageLabelStringForPage pdf pagenumber))

       (* CHAPTER 12. File Attachments *)
       method attachFile filename pdf =
         checkerror_unit (Cpdf.attachFile (Js.to_string filename) pdf)
       method attachFileToPage filename pdf pagenumber =
         checkerror_unit (Cpdf.attachFileToPage (Js.to_string filename) pdf pagenumber)
       method attachFileFromMemory data filename pdf =
         checkerror_unit (Cpdf.attachFileFromMemory (data_in data) (Js.to_string filename) pdf)
       method attachFileToPageFromMemory data filename pdf pagenumber =
         checkerror_unit (Cpdf.attachFileToPageFromMemory (data_in data) (Js.to_string filename) pdf pagenumber)
       method removeAttachedFiles pdf =
         checkerror_unit (Cpdf.removeAttachedFiles pdf)
       method startGetAttachments pdf =
         checkerror_unit (Cpdf.startGetAttachments pdf)
       method endGetAttachments =
         checkerror_unit (Cpdf.endGetAttachments ())
       method numberGetAttachments =
         checkerror (Cpdf.numberGetAttachments ())
       method getAttachmentName n =
         checkerror (Cpdf.getAttachmentName n)
       method getAttachmentPage n =
         checkerror (Cpdf.getAttachmentPage n)
       method getAttachmentData n =
         checkerror (data_out (Cpdf.getAttachmentData n))

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
       method endGetImageResolution =
         checkerror_unit (Cpdf.endGetImageResolution ())

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
         checkerror_unit (Cpdf.startGetFontInfo pdf)
       method endGetFontInfo =
         checkerror_unit (Cpdf.endGetFontInfo ())
       method copyFont docfrom docto range pagenumber fontname =
         let range = range_of_array range in
         let ret = checkerror (Cpdf.copyFont docfrom docto range pagenumber (Js.to_string fontname)) in
           Cpdf.deleterange range;
           checkerror_unit ret
       method removeFonts pdf =
         checkerror_unit (Cpdf.removeFonts pdf)

       (* CHAPTER 15. PDF and JSON *)
       method outputJSON filename parse_content no_stream_data decompress_streams pdf =
         checkerror_unit (Cpdf.outputJSON (Js.to_string filename) parse_content no_stream_data decompress_streams pdf)
       method outputJSONMemory parse_content no_stream_data decompress_streams pdf =
         checkerror (data_out (Cpdf.outputJSONMemory parse_content no_stream_data decompress_streams pdf))
       method fromJSON filename =
         checkerror (Cpdf.fromJSON (Js.to_string filename))
       method fromJSONMemory data =
         checkerror (Cpdf.fromJSONMemory (data_in data))

       (* CHAPTER 16. Optional Content Groups *)
       method startGetOCGList pdf =
         checkerror (Cpdf.startGetOCGList pdf)
       method ocgListEntry n =
         checkerror (Js.string (Cpdf.ocgListEntry n))
       method endGetOCGList =
         checkerror_unit (Cpdf.endGetOCGList ())
       method ocgCoalesce pdf =
         checkerror_unit (Cpdf.ocgCoalesce pdf)
       method ocgRename pdf name_from name_to =
         checkerror_unit (Cpdf.ocgRename pdf (Js.to_string name_from) (Js.to_string name_to))
       method ocgOrderAll pdf =
         checkerror_unit (Cpdf.ocgOrderAll pdf)

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
         checkerror (Cpdf.textToPDFMemory w h font fontsize (data_in data))
       method textToPDFPaperMemory papersize font fontsize data =
         checkerror (Cpdf.textToPDFPaperMemory papersize font fontsize (data_in data))

       (* CHAPTER 18. Miscellaneous *)
       method draft pdf range boxes =
         let range = range_of_array range in
         let ret = Cpdf.draft pdf range boxes in
           Cpdf.deleterange range;
           checkerror_unit ret
       method removeAllText pdf range =
         let range = range_of_array range in
         let ret = Cpdf.removeAllText pdf range in
           Cpdf.deleterange range;
           checkerror_unit ret
       method blackText pdf range =
         let range = range_of_array range in
         let ret = Cpdf.blackText pdf range in
           Cpdf.deleterange range;
           checkerror_unit ret
       method blackLines pdf range =
         let range = range_of_array range in
         let ret = Cpdf.blackLines pdf range in
           Cpdf.deleterange range;
           checkerror_unit ret
       method blackFills pdf range =
         let range = range_of_array range in
         let ret = Cpdf.blackFills pdf range in
           Cpdf.deleterange range;
           checkerror_unit ret
       method thinLines pdf range min_thickness =
         let range = range_of_array range in
         let ret = Cpdf.thinLines pdf range min_thickness in
           Cpdf.deleterange range;
           checkerror_unit ret
       method copyId pdf_from pdf_to =
         checkerror_unit (Cpdf.copyId pdf_from pdf_to)
       method removeId pdf =
         checkerror_unit (Cpdf.removeId pdf)
       method setVersion pdf version =
         checkerror_unit (Cpdf.setVersion pdf version)
       method setFullVersion pdf major minor =
         checkerror_unit (Cpdf.setFullVersion pdf major minor)
       method removeDictEntry pdf key =
         checkerror_unit (Cpdf.removeDictEntry pdf (Js.to_string key))
       method removeDictEntrySearch pdf key searchterm =
         checkerror_unit (Cpdf.removeDictEntrySearch pdf (Js.to_string key) (Js.to_string searchterm))
       method replaceDictEntry pdf key newval =
         checkerror_unit (Cpdf.replaceDictEntry pdf (Js.to_string key) (Js.to_string newval))
       method replaceDictEntrySearch pdf key newval searchterm =
         checkerror_unit (Cpdf.replaceDictEntrySearch pdf (Js.to_string key) (Js.to_string newval) (Js.to_string searchterm))
       method getDictEntries pdf key =
         checkerror (data_out (Cpdf.getDictEntries pdf (Js.to_string key)))
       method removeClipping pdf range =
         let range = range_of_array range in
         let ret = Cpdf.removeClipping pdf range in
           Cpdf.deleterange range;
           checkerror_unit ret
    end)
