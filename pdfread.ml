(*pp camlp4o *)
(* This module can read PDF files into the format given by the [Pdf] module *)
open Pdfutil
open Pdfio
open Pdfgenlex

let read_debug = ref false

(* Predicate on newline characters (carriage return and linefeed). *)
let is_newline = function
  | '\010' | '\013' -> true
  | _ -> false

let b = Buffer.create 30

let input_line i =
  Buffer.clear b;
  let goteol = ref false
  and finished = ref false in
    while not !finished do
      match i.input_byte () with
      | x when x = Pdfio.no_more -> set finished
      | x ->
         let c = Char.unsafe_chr x in
           if is_newline c then set goteol
           else if !goteol then (rewind i; set finished)
           else Buffer.add_char b c
    done;
    Buffer.contents b

(* Read back until a predicate is fulfilled. *)
let rec read_back_until p i =
  if (notpred p) (match read_char_back i with Some x -> x | None -> raise End_of_file)
    then read_back_until p i

(* Go back one line. In other words, find the second EOL character group
seeking back in the file, and seek to the character after it. A blank line
after a line with a single EOL character will be treated as being part of that
EOL. *)
let backline i =
  read_back_until is_newline i;
  read_back_until (notpred is_newline) i;
  read_back_until is_newline i;
  nudge i

(* Read the major and minor version numbers  from a PDF [1.x] file. Fail if
header invalid or major version number is not 1.  *)
let get9chars i =
  let c1 = i.input_char () in
  let c2 = i.input_char () in
  let c3 = i.input_char () in
  let c4 = i.input_char () in
  let c5 = i.input_char () in
  let c6 = i.input_char () in
  let c7 = i.input_char () in
  let c8 = i.input_char () in
  let c9 = i.input_char () in
    try map unopt [c1; c2; c3; c4; c5; c6; c7; c8; c9] with _ -> []

let rec read_header_inner pos i =
  try
    if pos > 1024 then raise End_of_file else
      i.seek_in pos;
      match get9chars i with
      | '%'::'P'::'D'::'F'::'-'::_::'.'::minor ->
          let minorchars = takewhile isdigit minor in
            if minorchars = []
              then
                raise (Pdf.PDFError (Pdf.input_pdferror i "Malformed PDF header"))
              else
                begin
                  i.set_offset pos;
                  1, int_of_string (implode minorchars)
                end
      | _ ->
          read_header_inner (pos + 1) i
  with
    End_of_file | Failure "int_of_string" ->
      raise (Pdf.PDFError (Pdf.input_pdferror i "Could not read PDF header"))

let read_header =
  read_header_inner 0

(* Find the EOF marker, and move position to its first character. We allow 1024
bytes from end-of-file for compatibility with Acrobat. *)
let find_eof i =
  let fail () = raise (Pdf.PDFError (Pdf.input_pdferror i "Could not find EOF marker"))
  in let pos = ref (i.in_channel_length - 4) in
    try
      let notfound = ref true
      in let tries = ref 1024 in
        while !notfound do
          pos := !pos - 1;
          i.seek_in !pos;
          if !tries < 0 then fail () else decr tries;
          let l = input_line i in
            if String.length l >= 5 && String.sub l 0 5 = "%%EOF" then clear notfound
        done;
        i.seek_in !pos;
    with
      _ -> fail ()

(* String of lexeme. *)
let string_of_lexeme = function
  | LexNull -> "null"
  | LexBool b -> Pdfwrite.string_of_pdf (Pdf.Boolean b)
  | LexInt i -> Pdfwrite.string_of_pdf (Pdf.Integer i)
  | LexReal f -> Pdfwrite.string_of_pdf (Pdf.Real f)
  | LexString s -> Pdfwrite.string_of_pdf (Pdf.String s)
  | LexName s -> s
  | LexLeftSquare -> "["
  | LexRightSquare -> "]"
  | LexLeftDict -> "<<"
  | LexRightDict -> ">>"
  | LexStream _ -> "LexStream"
  | LexEndStream -> "EndStream"
  | LexObj -> "obj"
  | LexEndObj -> "endobj"
  | LexR -> "R"
  | LexComment -> "Comment"
  | StopLexing -> "StopLexing"
  | LexNone -> "LexNone"

let print_lexeme l =
  Printf.printf "%s " (string_of_lexeme l)

(* Predicate on whitespace and delimiters. *)
let is_whitespace_or_delimiter c =
  Pdf.is_whitespace c || Pdf.is_delimiter c

(* Return the list of characters between and including the current position and
before the next character satisfying a given predicate, leaving the position at
the character following the last one returned. Can raise [EndOfInput]. If [eoi]
is true, end of input is considered a delimiter, and the characters up to it are
returned if it is reached. *)
let getuntil eoi f i =
  let rec getuntil_inner r eoi f i =
    match i.input_byte () with
    | x when x = Pdfio.no_more ->
        if eoi then rev r else raise End_of_file
    | x ->
        let chr = char_of_int x in
          if f chr
            then (rewind i; rev r)
            else getuntil_inner (chr::r) eoi f i
  in
    getuntil_inner [] eoi f i

let b = Buffer.create 30

let getuntil_string eoi f i =
  let rec getuntil_inner_string b eoi f i =
    match i.input_byte () with
    | x when x = Pdfio.no_more ->
        if eoi then Buffer.contents b else raise End_of_file
    | x ->
       let chr = char_of_int x in
         if f chr
           then (rewind i; Buffer.contents b)
           else getuntil_inner_string (Buffer.add_char b chr; b) eoi f i
  in
    Buffer.clear b;
    getuntil_inner_string b eoi f i

(* The same, but don't return anything. *)
let rec ignoreuntil eoi f i =
  match i.input_byte () with
  | x when x = Pdfio.no_more -> if eoi then () else raise End_of_file
  | x -> if f (Char.unsafe_chr x) then rewind i else ignoreuntil eoi f i

(* Ignore until the next whitespace *)
let ignoreuntilwhite =
  ignoreuntil true Pdf.is_whitespace

(* Position on the next non-whitespace character. *)
let dropwhite i =
  ignoreuntil true Pdf.is_not_whitespace i

(* The same, but stop at array, dictionary endings etc. *)
let getuntil_white_or_delimiter =
  getuntil true is_whitespace_or_delimiter

let getuntil_white_or_delimiter_string =
  getuntil_string true is_whitespace_or_delimiter

(* \section {Lexing} *)

(* Each of the following functions lexes a particular object, leaving the
channel position at the character after the end of the lexeme. Upon entry, the
file position is on the first character of the potential lexeme. \smallgap*)

(* Lex a bool. *)
let lex_bool i =
  match getuntil_white_or_delimiter i with
  | ['t'; 'r'; 'u'; 'e'] -> LexBool true
  | ['f'; 'a'; 'l'; 's'; 'e'] -> LexBool false
  | _ -> LexNone

(* Lex an int or float. See PDF manual for details of policy. *)
let lex_number i =
  let pos = i.pos_in () in
    try
      match Pdfgenlex.lex_single i with
      | Pdfgenlex.LexInt i -> LexInt i
      | Pdfgenlex.LexReal f -> LexReal f
      | _ -> LexNone
    with
    | Failure "hd" -> LexNone
    | Pdf.PDFError _ (* can't cope with floats where number has leading point. *)
    | Failure "int_of_string" ->
        LexReal (float_of_string (i.seek_in pos; (getuntil_white_or_delimiter_string i))) (*r [float_of_string] never fails. *)

(* Lex a name. *)
let b = Buffer.create 30

let lex_name i =
  Buffer.clear b;
  nudge i;
  Buffer.add_char b '/';
  let fini = ref false in
    while not !fini do
      match i.input_byte () with
      | x when x = Pdfio.no_more -> set fini
      | x ->
          let c = Char.unsafe_chr x in
            if is_whitespace_or_delimiter c then
              begin rewind i; set fini end
            else if c = '#' then
              begin
                let a = i.input_byte () in
                  let a2 = i.input_byte () in
                    if a <> Pdfio.no_more && a2 <> Pdfio.no_more then
                      Buffer.add_char b
                        (char_of_int (int_of_string ("0x" ^ string_of_char (char_of_int a) ^ string_of_char (char_of_int a2))))
              end
            else Buffer.add_char b c
    done;
    LexName (Buffer.contents b)

(* Lex a comment. We throw away everything from here until a new line. In the
case of a CRLF, only the CR is consumed, but the LF will be consumed before the
next token is read anyway, so this is fine. *)
let lex_comment i =
  ignoreuntil false is_newline i;
  LexComment

(* Lex a string. A string is between parenthesis. Unbalanced parenthesis in the
string must be escaped, but balanced ones need not be. We convert escaped
characters to the characters themselves. A newline sequence following a
backslash represents a newline. The string is returned without its enclosing
parameters. \smallgap *)

(* PDF strings can contain characters as a backslash followed by up to three
octal characters. If there are fewer than three, the next character in the file
cannot be a digit (The format is ambiguous as to whether this means an
\emph{octal} digit --- we play safe and allow non-octal digits). This replaces
these sequences of characters by a single character as used by OCaml in its
native strings.

Beware malformed strings. For instance, Reader accepts ((\\(ISA)) \smallgap *)

(* Build a character from a list of octal digits. *)
let mkchar l =
  try
    char_of_int (int_of_string ("0o" ^ implode l))
  with
    _ -> raise (Pdf.PDFError ("mkchar"))

let str = Buffer.create 16

(* Main function. *)
let lex_string i =
  try
    Buffer.clear str;
    let paren = ref 1
    in let c = char_of_int (i.input_byte ()) in
    assert (c = '(');
    while !paren > 0 do
      let c = char_of_int (i.input_byte ()) in
      match c with
        | '(' ->
            incr paren; Buffer.add_char str c;
        | ')' ->
            decr paren; if !paren > 0 then Buffer.add_char str c;
        | '\\' ->
            let c' = char_of_int (i.input_byte ()) in
            (match c' with
              | 'n' -> Buffer.add_char str '\n'
              | 'r' -> Buffer.add_char str '\r'
              | 't' -> Buffer.add_char str '\t'
              | 'b' -> Buffer.add_char str '\b'
              | 'f' -> Buffer.add_char str '\012'
              | '\r' ->
                  if char_of_int (i.input_byte ()) <> '\n' then
                    rewind i
              | '\n' -> ()
              | x when x >= '0' && x <= '7' ->
                (* Replace octal character sequences with the real character. *)
                  let o2 = char_of_int (i.input_byte ()) in
                  (match o2 with
                    | y when y >= '0' && y <= '7' ->
                        let o3 = char_of_int (i.input_byte ()) in
                        (match o3 with
                          | z when z >= '0' && z <= '7' ->
                              Buffer.add_char str (mkchar [c'; o2; o3])
                          | _ ->
                              rewind i;
                              Buffer.add_char str (mkchar [c'; o2]))
                    | _ ->
                        rewind i;
                        Buffer.add_char str (mkchar [c']))
              | _ -> (* including ['('], [')'], ['\\'], and all the others *)
                  Buffer.add_char str c' )
        | _ ->
            Buffer.add_char str c
    done;
    LexString (Buffer.contents str)
  with
    | Failure "unopt" -> raise (Pdf.PDFError (Pdf.input_pdferror i "lex_string failure"))

(* Lex a hexadecimal string. *)
let lex_hexstring i =
  let mkchar a b =
    try
      char_of_int (int_of_string ("0x" ^ implode [a; b]))
    with
      _ -> raise (Pdf.PDFError (Pdf.input_pdferror i "Lexing Hexstring"))
  in
    let str = Buffer.create 16 in
      try
        let _ = i.input_byte () (*r skip start marker *)
        in let finished = ref false in
          let addchar = Buffer.add_char str in
            let rec input_next_char () =
              let x = i.input_byte () in
                if x = -1 then raise End_of_file else
                  let c = char_of_int x in
                    if Pdf.is_whitespace c then input_next_char () else c
            in
              while not !finished do
                let c = input_next_char () in
                let c' = input_next_char () in
                  match c, c' with
                  | '>', _ -> rewind i; set finished
                  | a, '>' -> addchar (mkchar a '0'); set finished (* Fixed 10 Mar 2011 - added set finished *)
                  | a, b -> addchar (mkchar a b)
              done;
              LexString (Buffer.contents str)
       with
         | End_of_file -> LexString (Buffer.contents str)
         | Failure "unopt" -> raise (Pdf.PDFError (Pdf.input_pdferror i "lex_hexstring"))

(* Lex a keyword. *)
let lex_keyword i =
  match Pdfgenlex.lex_single i with
  | Pdfgenlex.LexName "obj" -> LexObj
  | Pdfgenlex.LexName "endobj" -> LexEndObj
  | Pdfgenlex.LexName "R" -> LexR
  | Pdfgenlex.LexName "null" -> LexNull
  | Pdfgenlex.LexName "endstream" -> LexEndStream
  | _ -> LexNone

(* Read some chars from a file. Leaves position as-is, except in the case of
reaching past the end of a file, in which case an exception is raised. *)
let read_chunk n i =
  try
    let orig_pos = i.pos_in () in
      let s = String.create n in
        for x = 0 to n - 1 do s.[x] <- unopt (i.input_char ()) done;
        i.seek_in orig_pos;
        s
  with
    _ -> raise (Failure "read_chunk")

(* Lex a stream, given its length (previously extracted by parsing the stream
dictionary). If [opt] is [true] the stream is actually read, if [false] a
[ToGet] tuple is created. The channel is positioned on the first character of
the stream keyword. *)
let is_malformed i =
  try
    match read_chunk 9 i with
    | "endstream" -> false
    | _ ->
      match read_chunk 10 i with
      | "\nendstream" | "\rendstream" -> false
      | _ ->
         match read_chunk 11 i with
         | "\r\nendstream" -> false
         | x -> true
  with
    _ -> true (* Beyond end of file - so, read_chunk would have failed... *)

let skip_stream_beginning i =
  ignoreuntilwhite i; (* consume the 'stream' keyword *)
  (* Ignore any white other than CR or LF. For malformed files which don't have
   * CR or LF immediately following stream keyword. *)
  ignoreuntil true (function ' ' | '\000' | '\012' | '\009' -> false | _ -> true) i;
  (* Skip either CRLF or LF. (See PDF specification for why). *)
  match char_of_int (i.input_byte ()) with
  | '\013' ->
      begin match char_of_int (i.input_byte ()) with
      | '\010' -> () (* It was CRLF *)
      | _ -> rewind i (* No padding, happens to be CR *)
      end
  | '\010' -> () (* Just LF *)
  | _ -> rewind i (* No padding. *)

(* Return position of first character for endstream sequence, or last character
of file if none exists. *)
let rec find_endstream i =
  let rec match_chunk s n i =
      n = String.length s
    ||
      match i.input_char () with
      | None -> false
      | Some c when c = s.[n] -> match_chunk s (n + 1) i
      | Some _ -> false
  in
    let match_chunk s i =
      let pos = i.pos_in () in
        let r = match_chunk s 0 i in
          i.seek_in pos;
          r
    in
      if
        match_chunk "endstream" i || match_chunk "\nendstream" i ||
        match_chunk "\r\nendstream" i || match_chunk "\rendstream" i
      then
        i.pos_in ()
      else
        (if i.pos_in () = i.in_channel_length then i.pos_in () else (nudge i; find_endstream i))

let lex_malformed_stream_data i =
  (*Printf.printf "lex_malformed_stream_data at %i\n" (i.Pdfio.pos_in ());
  flprint "\n";
  Pdfio.debug_next_n_chars 20 i;
  flprint "\n";*)
  try
    skip_stream_beginning i;
    let curr = i.pos_in () in
      let pos = find_endstream i in (* returns first char of endstream sequence *)
        i.seek_in curr;
        let arr = mkbytes (pos - curr) in
          for x = 0 to bytes_size arr - 1 do bset_unsafe arr x (i.input_byte ()) done;
          LexStream (Pdf.Got arr)
  with
    e -> raise (Pdf.PDFError ("Couldn't read malformed stream  - " ^ Printexc.to_string e))

let lex_stream_data i l opt =
  let original_pos = i.pos_in () in
    try
      skip_stream_beginning i;
      let pos = i.pos_in () in
      if opt then
        let arr = mkbytes l in
          if l > 0 then
            setinit i arr 0 l;
          i.seek_in (pos + l);
          if is_malformed i
            then (i.seek_in original_pos; lex_malformed_stream_data i)
            else (i.seek_in (pos + l); LexStream (Pdf.Got arr))
      else
        begin
          i.seek_in (pos + l);
          if is_malformed i
            then (i.seek_in original_pos; lex_malformed_stream_data i)
            else (i.seek_in (pos + l); LexStream (Pdf.ToGet (i, pos, l)))
        end
    with
      _ -> raise (Pdf.PDFError (Pdf.input_pdferror i "lex_stream_data"))

(* Lex a stream. This involves \emph{parsing} the stream dictionary to get the
length. [i] is at the start of the stream data, suitable for input to
[lex_stream_data]. We extract the dictionary by going through
[previous_lexemes], the reverse-order list of the lexemes already read. *)
let lex_stream i p previous_lexemes lexobj opt =
  let fail () = raise (Pdf.PDFError (Pdf.input_pdferror i "Failure lexing stream dict")) in
    let dictlexemes =
      (takewhile_reverse (function LexObj -> false | _ -> true) previous_lexemes)
    in
      match p dictlexemes with
      | _, Pdf.Dictionary a ->
        let pos = i.pos_in () in
        let rec findlength = function
          | Pdf.Integer l -> Some l
          | Pdf.Indirect k -> findlength (snd (p (lexobj k)))
          | _ -> None
        in
          begin match lookup "/Length" a with
            | None -> lex_malformed_stream_data i
            | Some v ->
               try
                 match findlength v with
                 | None -> lex_malformed_stream_data i
                 | Some l -> lex_stream_data i l opt
               with
                 _ ->
                   (* When reading malfomed files, /Length could be indirect,
                   and therefore not available. Treat as if it were available,
                   but incorrect. *)
                   i.seek_in pos;
                   lex_malformed_stream_data i
          end
      | _ -> fail ()

(* Find the next lexeme in the channel and return it. The latest-first lexeme
list [previous_lexemes] contains all things thus-far lexed. [dictlevel] is a
number representing the dictionary and/or array nesting level. If [endonstream] is true,
lexing ends upon encountering a [LexStream] lexeme. *)
let lex_next dictlevel arraylevel endonstream i previous_lexemes p opt lexobj =
  try
    dropwhite i;
    let raw = i.input_byte () in
      if raw = Pdfio.no_more then StopLexing else
    let chr1 = Char.unsafe_chr raw in
      rewind i;
      match chr1 with
      | '%' -> lex_comment i
      | 't' | 'f' -> lex_bool i
      | '/' -> lex_name i
      | x when (x >= '0' && x <= '9') || x = '+' || x = '-' || x = '.' ->
          lex_number i
      | '[' -> nudge i; incr arraylevel; LexLeftSquare
      | ']' -> nudge i; decr arraylevel; LexRightSquare
      | '(' -> lex_string i
      | '<' ->
        let _ = char_of_int (i.input_byte ()) in
          let chr2 = char_of_int (i.input_byte ()) in
            rewind i; rewind i;
            begin match chr2 with
            | '<' -> nudge i; nudge i; incr dictlevel; LexLeftDict
            | _ -> lex_hexstring i
            end 
      | '>' ->
        let _ = i.input_byte () in
          let chr2 = char_of_int (i.input_byte ()) in
            rewind i; rewind i;
            begin match chr2 with
            | '>' -> nudge i; nudge i; decr dictlevel; LexRightDict
            | c -> LexNone
            end
      | 'R' -> nudge i; LexR
      | 's' ->
          (* Disambiguate "startxref" and "stream" on the third character. *)
          let _ = i.input_byte () in
            let _ = i.input_byte () in
              let chr3 = char_of_int (i.input_byte ()) in
                rewind i; rewind i; rewind i;
                begin match chr3 with
                | 'a' -> StopLexing (* startxref *)
                | _ -> (* stream *)
                   if endonstream
                     then StopLexing
                     else lex_stream i p previous_lexemes lexobj opt
                end
      | x when x >= 'a' && x <= 'z' -> lex_keyword i
      | 'I' -> StopLexing (* We've hit an ID marker in an inline image *)
      | c -> (*Printf.eprintf "lexnone with character %C\n" c;*) LexNone
  with
    e -> Printf.eprintf "Recovering from Lex error: %s\n" (Printexc.to_string e); StopLexing

(* Lex just a dictionary, consuming only the tokens to the end of it. This is
used in the [PDFPages] module to read dictionaries in graphics streams. *)
let lex_dictionary i =
  let rec lex_dictionary_getlexemes i lexemes dictlevel arraylevel =
    let lex_dictionary_next i dictlevel arraylevel =
      let dummyparse = fun _ -> 0, Pdf.Null
      in let dummylexobj = fun _ -> [] in
        lex_next dictlevel arraylevel false i [] dummyparse false dummylexobj
    in
      match lex_dictionary_next i dictlevel arraylevel with
      | LexRightDict when !dictlevel = 0 && !arraylevel = 0 ->
          rev (LexRightDict::lexemes)
      | StopLexing ->
          rev lexemes
      | LexNone ->
          raise (Pdf.PDFError (Pdf.input_pdferror i "Could not read dictionary"))
      | a ->
          lex_dictionary_getlexemes i (a::lexemes) dictlevel arraylevel
  in
    lex_dictionary_getlexemes i [] (ref 0) (ref 0)
 
(* Calculate a list of lexemes from input [i], using parser [p] to lex
streams. Can raise [PDFError]. *)
let lex_object_at oneonly i opt p lexobj =
  let dictlevel = ref 0
  in let arraylevel = ref 0 in
    let rec lex_object_at i lexemes =
      let lexeme = lex_next dictlevel arraylevel false i lexemes p opt lexobj in
        match lexeme with
        | LexEndObj -> rev (lexeme::lexemes) 
        | StopLexing -> rev lexemes
        | LexComment -> lex_object_at i (lexeme::lexemes)
        | LexRightSquare | LexRightDict ->
            if oneonly && !dictlevel = 0 && !arraylevel = 0
              then
                begin
                  let pos = i.pos_in () in
                    match lex_next dictlevel arraylevel false i (lexeme::lexemes) p opt lexobj with
                    | LexStream s ->
                        begin match lex_next dictlevel arraylevel false i (LexStream s::lexeme::lexemes) p opt lexobj with
                        | LexEndStream ->
                            begin match lex_next dictlevel arraylevel false i (LexEndStream::LexStream s::lexeme::lexemes) p opt lexobj with
                            | LexEndObj -> rev (LexEndObj::LexEndStream::LexStream s::lexeme::lexemes)
                            | _ ->
                               rev (LexEndObj::LexEndStream::LexStream s::lexeme::lexemes)
                            end
                        | _ -> 
                           rev (LexEndObj::LexEndStream::LexStream s::lexeme::lexemes)
                        end
                    | _ -> i.seek_in pos; rev (lexeme::lexemes)
                end
              else lex_object_at i (lexeme::lexemes)
        | LexNone ->
            raise (Pdf.PDFError (Pdf.input_pdferror i "Could not read object"))
        | LexInt i1 ->
            (* Check for the case of "x y obj", which in the case of oneonly
            should be returned as the one object. If i is followed by something
            other than an integer and 'obj', we must rewind and just return the
            integer *)
            if oneonly && !dictlevel = 0 && !arraylevel = 0 then
              let pos = i.pos_in () in
                begin match lex_next dictlevel arraylevel false i lexemes p opt lexobj with
                | LexInt i2 ->
                   begin match lex_next dictlevel arraylevel false i lexemes p opt lexobj with
                   | LexObj ->
                       lex_object_at i (LexObj::LexInt i2::LexInt i1::lexemes)
                   | _ ->
                     i.seek_in pos;
                     rev (LexInt i1::lexemes)
                   end
                | _ ->
                   i.seek_in pos;
                   rev (LexInt i1::lexemes)
                end
            else
              lex_object_at i (LexInt i1::lexemes)
        | a ->
           (* If oneonly, then can return if not in an array or dictionary and if this lexeme was an atom. *)
           let isatom = function
             | LexBool _ | LexReal _ | LexString _ | LexName _ -> true
             | _ -> false
           in
             if oneonly && isatom a && !dictlevel = 0 && !arraylevel = 0
               then rev (a::lexemes)
               else lex_object_at i (a::lexemes)
    in
      lex_object_at i []

(* Type of sanitized cross-reference entries. They are either plain offsets, or
an object stream an index into it. *)
type xref =
  | XRefPlain of int * int (* offset, generation. *)
  | XRefStream of int * int (* object number of stream, index. *)

let string_of_xref = function
  | XRefPlain (p, i) -> Printf.sprintf "XRefPlain (%i, %i)" p i
  | XRefStream (o, i) -> Printf.sprintf "XrefStream %i, index %i" o i

let xrefs_table_create () = Hashtbl.create 1001

let xrefs_table_add_if_not_present table k v =
  try ignore (Hashtbl.find table k) with
    Not_found -> Hashtbl.add table k v

let xrefs_table_find table k =
  try Some (Hashtbl.find table k) with
    Not_found -> None

let xrefs_table_iter = Hashtbl.iter

(* [p] is the parser. Since this will be called from within functions it also
calls, we must store and retrieve the current file position on entry and exit. *)
let rec lex_object i xrefs p opt n =
  let current_pos = i.pos_in () in
     let xref =
       match xrefs_table_find xrefs n with
       | Some x -> x
       | None -> raise (Pdf.PDFError (Pdf.input_pdferror i "Object not in xref table"))
     in
       match xref with
       | XRefStream (objstm, index) ->
           assert false (*r lex object only used on XRefPlain entries *)
       | XRefPlain (o, _) ->
           i.seek_in o;
           let result = lex_object_at false i opt p (lex_object i xrefs p opt) in
             i.seek_in current_pos;
             result

(* Parsing proceeds as a series of operations over lists of lexemes or parsed
objects. Parsing ends when the list is a singleton and its element is an
well-formed object. *)
type partial_parse_element =
  | Lexeme of Pdfgenlex.t
  | Parsed of Pdf.pdfobject

let print_parseme = function
  | Parsed p -> flprint "PARSED:"; print_string (Pdfwrite.string_of_pdf p); flprint "\n"
  | Lexeme l -> flprint "LEXEME:"; print_lexeme l; flprint "\n" 

(* Parse stage one. *)
let parse_R ts =
  let rec parse_R_inner r = function
    | [] -> rev r
    | LexInt o::LexInt _::LexR::rest -> parse_R_inner (Parsed (Pdf.Indirect o)::r) rest
    | LexComment::t -> parse_R_inner r t
    | LexNull::t -> parse_R_inner (Parsed Pdf.Null::r) t
    | LexBool b::t -> parse_R_inner (Parsed (Pdf.Boolean b)::r) t
    | LexInt i::t -> parse_R_inner (Parsed (Pdf.Integer i)::r) t
    | LexReal f::t -> parse_R_inner (Parsed (Pdf.Real f)::r) t
    | LexString s::t -> parse_R_inner (Parsed (Pdf.String s)::r) t
    | LexName n::t -> parse_R_inner (Parsed (Pdf.Name n)::r) t
    | h::t -> parse_R_inner (Lexeme h::r) t
  in
    parse_R_inner [] ts

let process_parse_dictionary elts =
  let rec mkpairs pairs = function
  | [] -> pairs
  | Parsed v::Parsed (Pdf.Name k)::t -> mkpairs ((k, v)::pairs) t
  | _ -> raise (Pdf.PDFError "parse_dictionary")
  in
    try
      Parsed (Pdf.Dictionary (mkpairs [] elts))
    with
      Pdf.PDFError "parse_dictionary" ->
        Printf.eprintf "Malformed file: odd length dictionary - parsed as the empty dictionary. Carrying on...\n";
        Parsed (Pdf.Dictionary [])

let process_parse_array elts =
  let arry =
    rev_map
      (function
       | Parsed x -> x
       | _ -> raise (Pdf.PDFError "parse_array"))
      elts
  in
    Parsed (Pdf.Array arry)

(* Read everything to the close of the dictionary *)
let rec parse_dictionary sofar = function
  | [] ->
      process_parse_dictionary sofar, [] 
  | Lexeme LexLeftDict::t ->
      let dict, rest = parse_dictionary [] t in
        parse_dictionary (dict::sofar) rest
  | Lexeme LexLeftSquare::t ->
      let arr, rest = parse_array [] t in
        parse_dictionary (arr::sofar) rest
  | Lexeme LexRightDict::t ->
      process_parse_dictionary sofar, t
  | h::t ->
      parse_dictionary (h::sofar) t

(* Read everything to the close of the array *)
and parse_array sofar = function
  | [] ->
      process_parse_array sofar, []
  | Lexeme LexLeftDict::t ->
      let dict, rest = parse_dictionary [] t in
        parse_array (dict::sofar) rest
  | Lexeme LexLeftSquare::t ->
      let arr, rest = parse_array [] t in
        parse_array (arr::sofar) rest
  | Lexeme LexRightSquare::t ->
      process_parse_array sofar, t
  | h::t ->
      parse_array (h::sofar) t

(* Main function *)
let rec parse_to_tree (sofar : partial_parse_element list) = function
  | Lexeme LexLeftDict::t ->
      let dict, rest = parse_dictionary [] t in
        parse_to_tree (dict::sofar) rest
  | Lexeme LexLeftSquare::t ->
      let arr, rest = parse_array [] t in
        parse_to_tree (arr::sofar) rest
  | h::t -> parse_to_tree (h::sofar) t
  | [] -> rev sofar

let parse_finish ?(failure_is_ok = false) q =
  match q with
  | [Parsed (Pdf.Integer o); Parsed (Pdf.Integer _);
    Lexeme LexObj; Parsed obj; Lexeme LexEndObj]
  | [Parsed (Pdf.Integer o); Parsed (Pdf.Integer _);
    Lexeme LexObj; Parsed obj] ->
      o, obj
  | Parsed (Pdf.Integer o)::
    Parsed (Pdf.Integer _)::
    Lexeme LexObj::
    Parsed (Pdf.Dictionary d as obj)::
    Lexeme (LexStream s)::
    Lexeme LexEndStream::_ ->
      (* Fix up length, if necessary *)
      let l =
        match s with Pdf.Got b -> bytes_size b | Pdf.ToGet (_, _, l) -> l
      and lold =
        try
          begin match lookup_failnull "/Length" d with Pdf.Integer l -> l | _ -> -1 end
        with
          Not_found -> -1 
      in
        if lold <> l
          then (o, Pdf.Stream {contents = Pdf.add_dict_entry obj "/Length" (Pdf.Integer l), s})
          else (o, Pdf.Stream {contents = obj, s})
  | [Parsed d] ->
      0, d
  | [Parsed (Pdf.Integer o); Parsed (Pdf.Integer _); Lexeme LexObj; Lexeme LexEndObj] -> o, Pdf.Null
  | l ->
      (*if not failure_is_ok then begin flprint "PARSEMES:\n"; iter print_parseme l; flprint "END OF PARSEMES\n"; end;*)
      raise (Pdf.PDFError "Could not extract object")

(* Parse some lexemes *)
let parse ?(failure_is_ok = false) lexemes =
  try parse_finish ~failure_is_ok:failure_is_ok (parse_to_tree [] (parse_R lexemes)) with
    | Pdf.PDFError _ ->
        (*if not failure_is_ok then
          Printf.eprintf "Can't read object. Error was...\n%s\nCarrying on...\n" (Printexc.to_string e);*)
        (max_int, Pdf.Null)

(* Given an object stream pdfobject and a list of object indexes to extract,
 return an [(int * Pdf.objectdata) list] representing those object number, lexeme
 pairs - assuming they exist! *)
let lex_stream_object i xrefs parse opt obj indexes user_pw owner_pw partial_pdf gen =
  if !read_debug then
    begin
      Printf.printf "lexing object stream at %i\n" (i.Pdfio.pos_in ());
      Printf.printf "lexing object stream %i\nTo find the indexes:\n" obj;
      iter (Printf.printf "%i ") indexes; flprint "\n"
    end;
  let _, stmobj = parse (lex_object i xrefs parse opt obj) in
    match stmobj with
    | Pdf.Stream {contents = d, stream} ->
        let n =
          match Pdf.lookup_direct partial_pdf "/N" d with
          | Some (Pdf.Integer n) -> n
          | _ -> raise (Pdf.PDFError (Pdf.input_pdferror i "missing/malformed /N"))
        in let first =
          match Pdf.lookup_direct partial_pdf "/First" d with
          | Some (Pdf.Integer n) -> n
          | _ -> raise (Pdf.PDFError (Pdf.input_pdferror i "missing/malformed /First"))
        in
          (* Decrypt if necessary *)
          let stmobj = Pdfcrypt.decrypt_single_stream user_pw owner_pw partial_pdf obj gen stmobj in
            Pdfcodec.decode_pdfstream partial_pdf stmobj;
            begin match stmobj with
            | Pdf.Stream {contents = _, Pdf.Got raw} ->
              let i = input_of_bytes raw in
                begin try
                  (* Read index. *)
                  let rawnums = ref [] in
                    for x = 1 to n * 2 do
                      dropwhite i;
                      rawnums =|
                        match lex_number i with
                        | LexInt i -> i
                        | k -> raise (Pdf.PDFError (Pdf.input_pdferror i "objstm offset problem"))
                    done;
                    rawnums := rev !rawnums;
                    (* Read each object *)
                    let pairs = pairs_of_list !rawnums
                    and objects = ref []
                    and index = ref 0
                    and indexes = ref (sort compare_i indexes) in
                      iter
                        (fun (objnum, offset) ->
                           begin match !indexes with
                           | [] -> ()
                           | x::xs when x <> !index -> ()
                           | _::xs ->
                               indexes := xs;
                               i.seek_in (offset + first);
                               let lexemes =
                                 lex_object_at true i opt parse (lex_object i xrefs parse opt)
                               in
                                 let obj = (ref (Pdf.ParsedAlreadyDecrypted (snd (parse lexemes))), 0) in
                                   objects =| (objnum, obj)
                           end;
                           incr index)
                        pairs;
                      (* FIXME: Why does this make it null rather than actually remove the object? *)
                      Pdf.addobj_given_num partial_pdf (obj, Pdf.Null);
                      !objects
                with
                  End_of_file ->
                    raise (Pdf.PDFError (Pdf.input_pdferror i "unexpected objstream end"))
                end
          | _ -> raise (Pdf.PDFError (Pdf.input_pdferror i "couldn't decode objstream"))
          end
    | _ -> raise (Pdf.PDFError (Pdf.input_pdferror i "lex_stream_object: not a stream"))

(* Advance to the first thing after the current pointer which is not a comment. *)
let rec ignore_comments i =
  let pos = i.pos_in () in
    match i.input_char () with
    | Some '%' -> ignore (input_line i); ignore_comments i
    | Some _ -> i.seek_in pos
    | None -> raise End_of_file

(* \section{Cross-reference tables} *)

(* Read the cross-reference table. Supports the multiple sections created when
a PDF file is incrementally modified. *)
type xref_line =
  | Invalid
  | Section of int * int (* Start, length. *)
  | Valid of int * int (* byte offset, gen. *)
  | Free of int * int (* free entry. *)
  | InObjectStream of int * int (* Stream number, index. *)
  | StreamFree of int * int (* free entry in an object stream. *)
  | XRefNull (* is the null object. *)
  | Finished (* end of a table. *)

(* Read and parse a single line of a cross-reference table. We use a
long-winded match pattern on the characters of cross-reference lines because a
byte offset can exceed the range for [Genlex.Int]. *)
let rec read_xref_line i =
  let pos = i.pos_in () in
    dropwhite i; 
    let line = input_line i in
      if line = "xref" || line = "xref " then read_xref_line i else
        let is09 x = x >= '0' && x <= '9' in
          (* Consider the usual case - no need to pull apart *)
          if String.length line >= 18 &&
            is09 line.[0] && is09 line.[1] && is09 line.[2] &&
            is09 line.[3] && is09 line.[4] && is09 line.[5] &&
            is09 line.[6] && is09 line.[7] && is09 line.[8] &&
            is09 line.[9] && is09 line.[11] && is09 line.[12] &&
            is09 line.[13] && is09 line.[14] && is09 line.[15]
          then
             let p, i =
               int_of_string (String.sub line 0 10),
               int_of_string (String.sub line 11 5)
             in
               match line.[17] with
               | 'n' -> Valid (p, i)
               | 'f' -> Free (p, i)
               | _ -> Invalid
          else
            match explode line with
            | 't'::'r'::'a'::'i'::'l'::'e'::'r'::more ->
                (* Bad files may not put newlines after the trailer, so [input_line] may
                have taken too much, preventing us from reading the trailer
                dictionary, so we rewind. *)
                let leading_spaces =
                  length (takewhile (eq ' ') (explode line))
                in
                  i.seek_in (pos + 7 + leading_spaces);
                  Finished
            | '0'::'0'::'0'::'0'::'0'::'0'::'0'::'0'::'0'::'0'::' '::_::_::_::_::_::' '::'n'::_ ->
                 (* Consider 0000000000 _____ n as a free entry (malformed file workaround) *)
                 Free (0, 0)
            | r ->
              (* Artworks produces bad PDF with lines like xref 1 5 *)
              match Pdfgenlex.lex (input_of_string line) with
              | [Pdfgenlex.LexName "xref"; Pdfgenlex.LexInt s; Pdfgenlex.LexInt l]
              | [Pdfgenlex.LexInt s; Pdfgenlex.LexInt l] -> Section (s, l)
              | _ -> Invalid 

(* Read the cross-reference table in [i] at the current position. Leaves [i] at
the first character of the trailer dictionary. *)
let read_xref i =
  let fail () = raise (Pdf.PDFError (Pdf.input_pdferror i "Could not read x-ref table"))
  in let xrefs = ref [] in
    begin try
      let finished = ref false
      in let objnumber = ref 0 in
        while not !finished do
          match read_xref_line i with
          | Invalid -> fail ()
          | Valid (offset, gen) ->
              xrefs =| (!objnumber, XRefPlain (offset, gen));
              incr objnumber
          | Finished -> set finished
          | Section (s, _) -> objnumber := s
          | Free _ -> incr objnumber
          | _ -> () (* Xref stream types won't have been generated. *)
        done
      with
        End_of_file | Sys_error _ | Failure "int_of_string"-> fail ()
    end;
    !xrefs

(* PDF 1.5 cross-reference stream support. [i] is the input. The tuple describes
the lengths in bytes of each of the three fields. *)
let read_xref_line_stream i w1 w2 w3 =
  assert (w1 >= 0 && w2 >= 0 && w3 >= 0);
  try
    let read_field bytes =
      let rec read_field bytes mul =
        if bytes = 0 then 0 else
          match i.input_byte () with
          | x when x = Pdfio.no_more -> raise (Pdf.PDFError (Pdf.input_pdferror i "Bad Xref stream"))
          | b -> b * mul + (read_field (bytes - 1) (mul / 256))
      in
        if bytes = 0 then 0 else (* Empty entry *)
          read_field bytes (pow (bytes - 1) 256)
    in
      let f1 = read_field w1 in
        let f2 = read_field w2 in
          let f3 = read_field w3 in
            if !read_debug then Printf.printf "%i %i %i\n" f1 f2 f3;
            match f1 with
            | 0 -> StreamFree (f2, f3)
            | 1 -> Valid (f2, f3)
            | 2 -> InObjectStream (f2, f3)
            | n -> XRefNull
  with
    _ -> raise (Pdf.PDFError (Pdf.input_pdferror i "read_xref_line_stream"))

(* The function to read a whole cross-reference stream, and return an [xref
list]. Leaves [i] at the first character of the stream dictionary, which
containes the trailer dictionary entries. *)
let read_xref_stream i =
  let original_pos = i.pos_in ()
  in let err = Pdf.PDFError (Pdf.input_pdferror i "Bad xref stream") in
    (* Read the next token, which is the object number *)
    let xrefstream_objectnumber =
      match lex_next (ref 0) (ref 0) false i [] (fun _ -> 0, Pdf.Null) false (fun _ -> []) with
      | LexInt i -> i
      | _ -> Printf.eprintf "couldn't lex object number\n"; raise err
    in
    if !read_debug then
      Printf.printf "Object number of this xref stream is %i\n" xrefstream_objectnumber;
    (* Go back to the beginning *)
    i.seek_in original_pos;
    (* And proceed as before *)
    let rec lex_untilstream i ls =
      let lexobj = lex_object i (null_hash ()) parse false in
        match lex_next (ref 0) (ref 0) true i [] parse false lexobj with
        | StopLexing | LexNone -> rev ls (* Added LexNone to prevent infinite loop on malformed files 14/10/09 *)
        | l -> lex_untilstream i (l::ls)
    in
      let stream, obj, gen =
        match
          try
          let lexobj = lex_object i (null_hash ()) parse true in
            let dictlex = lex_untilstream i [] in
              let obj =
                match hd dictlex with
                | LexInt i -> i
                | _ -> raise Not_found
              in let gen =
                match (hd (tl dictlex)) with
                | LexInt i -> i
                | _ -> raise Not_found
              in
                begin match lex_stream i parse (rev dictlex) lexobj true with
                | LexNone -> raise err
                | stream ->
                    snd (parse (dictlex @ [stream] @ [LexEndStream; LexEndObj])),
                    obj,
                    gen
                end
          with _ -> raise (Pdf.PDFError (Pdf.input_pdferror i "Failure to read xref stream - malformed"))
        with
        | Pdf.Stream _ as stream, obj, gen -> stream, obj, gen
        | _ -> raise err
      in
        if !read_debug then flprint "HAVE READ XREF STREAM DICT, NOW ACTUAL XREF STREAM DATA\n";
        Pdfcodec.decode_pdfstream (Pdf.empty ()) stream;
        let w1, w2, w3 =
          match Pdf.lookup_direct (Pdf.empty ()) "/W" stream with
          | Some (Pdf.Array [Pdf.Integer w1; Pdf.Integer w2; Pdf.Integer w3]) -> w1, w2, w3
          | _ -> raise err
        in let i' =
          match stream with
          | Pdf.Stream {contents = _, Pdf.Got s} -> input_of_bytes s
          | _ -> raise err
        in let xrefs = ref [] in
          begin try
            while true do xrefs =| read_xref_line_stream i' w1 w2 w3 done
          with
            _ -> ()
          end;
          xrefs := rev !xrefs;
          if !read_debug then Printf.printf "****** read %i raw Xref stream entries\n" (length !xrefs);
          let starts_and_lens =
            match Pdf.lookup_direct (Pdf.empty ()) "/Index" stream with
            | Some (Pdf.Array elts) ->
                if odd (length elts) then raise (Pdf.PDFError (Pdf.input_pdferror i "Bad /Index"));
                map
                  (function
                    | (Pdf.Integer s, Pdf.Integer l) -> s, l
                    | _ -> raise (Pdf.PDFError (Pdf.input_pdferror i "Bad /Index entry")))
                  (pairs_of_list elts)
            | Some _ -> raise (Pdf.PDFError (Pdf.input_pdferror i "Unknown /Index"))
            | None ->
                let size =
                  match Pdf.lookup_direct (Pdf.empty ()) "/Size" stream with
                  | Some (Pdf.Integer s) -> s
                  | _ ->
                      raise (Pdf.PDFError (Pdf.input_pdferror i "Missing /Size in xref dict"))
                in
                  [0, size]
          in
            let xrefs' = ref [] in
            iter
              (fun (start, len) ->
                let these_xrefs =
                  try take !xrefs len with
                    _ -> raise (Pdf.PDFError (Pdf.input_pdferror i "Bad xref stream\n"))
                in
                  xrefs := drop !xrefs len;
                  let objnumber = ref start in
                    iter
                      (function
                       | Valid (offset, gen) ->
                           xrefs' =| (!objnumber, XRefPlain (offset, gen));
                           incr objnumber
                       | InObjectStream (stream, index) ->
                           xrefs' =| (!objnumber, XRefStream (stream, index));
                           incr objnumber
                       | _ -> incr objnumber)
                      these_xrefs)
                starts_and_lens;
              i.seek_in original_pos;
              if !read_debug then Printf.printf "***READ_XREF_STREAM final result was %i xrefs\n" (length !xrefs');
              rev !xrefs', xrefstream_objectnumber

(* A suitable function for the Pdf module to use to lex and parse an object.
Assumes [i] has been set to the correct position. [n] is the object number. *)
let get_object i xrefs n =
  let lexemes = lex_object i xrefs parse false n in
    snd (parse lexemes)

(* Read a PDF from a channel. If [opt], streams are read immediately into
memory. *)
let read_pdf user_pw owner_pw opt i =
  if !read_debug then
    begin
      flprint "Start of read_pdf\n";
      Printf.printf "%s\n" i.Pdfio.source;
      flprint "opt is "; Printf.printf "%b" opt; flprint "\n"
    end;
  let postdeletes = ref [] in
  let object_stream_ids = null_hash () in
  let xrefs = xrefs_table_create () in
  let major, minor = read_header i 
  in let objects_stream, objects_nonstream, root, trailerdict =
    let addref (n, x) = xrefs_table_add_if_not_present xrefs n x
    in let got_all_xref_sections = ref false
    in let trailerdict = ref []
    in let xref = ref 0
    in let first = ref true in
      (* This function builds a partial pdf of the plain objects whose
      references have currently been seen. *)
      let mkpartial nonstream_objects trailerdict =
        let objpairs = ref [] in
          (* 1. Build object number, offset pairs *)
          xrefs_table_iter
            (fun n x ->
               match x with
               | XRefPlain (offset, gen) -> objpairs =| (n, (ref Pdf.ToParse, gen))
               | _ -> ())
            xrefs;
            (* 2. Build the object map *) 
            let objects =
              Pdf.objects_of_list (Some (get_object i xrefs)) (!objpairs @ nonstream_objects)
            in
              (* 3. Build the Pdf putting the trailerdict in *)
              {(Pdf.empty ()) with
                 Pdf.objects = objects;
                 Pdf.trailerdict = trailerdict}
      in
      (* Move to the first xref section. *)
      find_eof i;
      backline i;
      (* Drop any initial contents which is not a digit - may occur if there is
      legitimate whitespace of if the PDF is malformed such that it has the
      startxref keyword and the byte offset on the same line. *)
      ignoreuntil false isdigit i;
      begin match takewhile isdigit (getuntil_white_or_delimiter i) with
      | [] -> raise (Pdf.PDFError (Pdf.input_pdferror i "Could not find xref pointer"))
      | xrefchars -> xref := int_of_string (implode xrefchars);
      end;
      if !read_debug then flprint "Reading Cross-reference table\n";
      while not !got_all_xref_sections do
        i.seek_in !xref;
        (* Distinguish between xref table and xref stream. *)
        dropwhite i;
        (* Read cross-reference table *)
        if peek_char i = Some 'x'
          then iter addref (read_xref i)
          else
            begin
              let refs, objnumbertodelete = read_xref_stream i in
                postdeletes := objnumbertodelete::!postdeletes;
                iter addref refs
            end;
        (* It is now assumed that [i] is at the start of the trailer dictionary. *)
        let trailerdict_current =
          let lexemes =
            lex_object_at true i opt parse (lex_object i xrefs parse opt)
          in
            match parse lexemes with
            | (_, Pdf.Dictionary d)
            | (_, Pdf.Stream {contents = Pdf.Dictionary d, _}) -> d
            | _ -> raise (Pdf.PDFError (Pdf.input_pdferror i "Malformed trailer"))
        in
          begin
            if !first then
              begin
                trailerdict := mergedict trailerdict_current !trailerdict;
                clear first
              end;
            (* Do we have a /XRefStm to follow? *)
            begin match lookup "/XRefStm" trailerdict_current with
            | Some (Pdf.Integer n) ->
                i.seek_in n;
                let refs, objnumbertodelete = read_xref_stream i in
                  postdeletes := objnumbertodelete::!postdeletes;
                  iter addref refs;
            | _ -> ()
            end;
            (* Is there another to do? *)
            match lookup "/Prev" trailerdict_current with
            | None -> set got_all_xref_sections
            | Some (Pdf.Integer n) -> xref := n
            | _ -> raise (Pdf.PDFError (Pdf.input_pdferror i "Malformed trailer"))
          end;
      done;
      if !read_debug then Printf.printf "*** READ %i XREF entries\n" (Hashtbl.length xrefs);
      let root =
        match lookup "/Root" !trailerdict with
        | Some (Pdf.Indirect i) -> i
        | None -> raise (Pdf.PDFError (Pdf.input_pdferror i "No /Root entry"))
        | _ -> raise (Pdf.PDFError (Pdf.input_pdferror i "Malformed /Root entry"))
      in
        let getgen n =
          match xrefs_table_find xrefs n with
          | Some (XRefPlain (_, g)) -> g
          | Some (XRefStream _) -> 0
          | None -> raise Not_found
        in
        if !read_debug then flprint "Reading non-stream objects\n";
        let objects_nonstream =
          let objnumbers = ref [] in
            xrefs_table_iter
              (fun n x ->
                 match x with
                 | XRefPlain (offset, gen) -> objnumbers =| n
                 | _ -> ())
              xrefs;
              map
                (if opt then
                   fun o ->
                     let num, parsed =
                       parse (lex_object i xrefs parse opt o)
                     in
                       num, (ref (Pdf.Parsed parsed), getgen o)
                   else
                     fun o -> o, (ref Pdf.ToParse, getgen o))
                !objnumbers
          in
          if !read_debug then flprint "Reading stream objects\n";
          let objects_stream =
           let streamones =
             map
               (function
                  | (n, XRefStream (s, i)) -> (n, s, i)
                  | _ -> assert false)
               (keep
                 (function (n, XRefStream _) -> true | _ -> false)
                 (list_of_hashtbl xrefs))
           in
             (*Printf.printf "*** %i objects are in streams\n" (length streamones);
             iter (function (n, s, i) -> Printf.printf "STREAMONES: Obj %i, Stream %i, Index %i\n" n s i) streamones; *)
             iter (function (n, s, _) -> Hashtbl.add object_stream_ids n s) streamones;
             if opt then
               begin
                 let cmp_objs (_, s, _) (_, s', _) = compare_i s s' in
                   let sorted = sort cmp_objs streamones in
                     let collated = collate cmp_objs sorted in
                       let inputs_to_lex_stream_object =
                         map
                           (fun l -> match hd l with (_, s, _) -> s, map (fun (_, _, i) -> i) l)
                           collated
                       in
                         (* Read objects from object streams now *)
                         let outputs_from_lex_stream_object =
                           let partial = mkpartial objects_nonstream (Pdf.Dictionary !trailerdict) in
                             map
                               (function (s, is) ->
                                  let r = lex_stream_object i xrefs parse opt s is user_pw owner_pw partial (getgen s) in
                                    postdeletes := s::!postdeletes;
                                    r)
                               inputs_to_lex_stream_object
                         in
                           flatten outputs_from_lex_stream_object
               end
             else
               let partial = mkpartial objects_nonstream (Pdf.Dictionary !trailerdict) in
                 let readstream streamobjnumber indexes =
                   lex_stream_object i xrefs parse opt streamobjnumber indexes user_pw owner_pw partial (getgen streamobjnumber)
                 in
                   map (function (n, s, i) -> (n, (ref (Pdf.ToParseFromObjectStream (s, i, readstream)), 0))) streamones
         in
          if !read_debug then
            begin
              Printf.printf "There were %i nonstream objects\n" (length objects_nonstream);
              Printf.printf "There were %i stream objects\n" (length objects_stream);
              flprint "\n"
            end;
          objects_stream, objects_nonstream, root, trailerdict
    in
      if !read_debug then flprint "Finishing up...\n";
      let objects = objects_stream @ objects_nonstream in
        (* Fix Size entry and remove Prev, XRefStm, Filter, Index, W, Type, and DecodeParms *)
        let trailerdict' =
          Pdf.Dictionary
            (add "/Size" (Pdf.Integer (length objects))
              (remove "/W"
                (remove "/Type"
                  (remove "/Index"
                    (remove "/Prev"
                      (remove "/XRefStm"
                        (remove "/Filter"
                          (remove "/DecodeParms" !trailerdict))))))))
        in
          let pdf = 
            {Pdf.major = major;
             Pdf.minor = minor;
             Pdf.objects = Pdf.objects_of_list (Some (get_object i xrefs)) objects;
             Pdf.root = root;
             Pdf.trailerdict = trailerdict'}
          in
            (* Delete items in !postdeletes - these are any xref streams, and
            object streams (if finished with).  This allows decryption to be
            performed without accidently trying to decrypt these streams -
            which would fail due to them not being of set lengths. Also saves
            memory *)
            iter (Pdf.removeobj pdf) !postdeletes;
            (* Add stream_object_ids *)
            pdf.Pdf.objects.Pdf.object_stream_ids <- object_stream_ids;
            if !read_debug then
              begin
                flprint "Object stream IDs:\n";
                Hashtbl.iter
                  (fun o s ->
                     Printf.printf "Object %i was in stream %i\n" o s)
                  object_stream_ids
              end;
            if !read_debug then
              begin
                flprint "Done.\n";
                match Pdf.lookup_direct pdf "/Encrypt" pdf.Pdf.trailerdict with
                | Some _ -> flprint "***File is encrypted\n" | _ -> ()
              end;
            pdf

(* Malformed file reading. *)

(* We read all trailerdicts in the file, preferring entries in later dictionaries. *)
let read_malformed_trailerdict i =
  try
    (* Move to just after the keyword trailer, if one still exists. Otherwise,
    file position ends up at the end of the file. *)
    while
      let currpos = i.pos_in () in
        try implode (take (explode (input_line i)) 7) <> "trailer" with
          _ -> not (i.pos_in () = currpos)
    do () done;
    let lexemes = lex_object_at true i true parse (lex_object i (null_hash ()) parse true) in
      match parse lexemes with
      | (_, Pdf.Dictionary d)
      | (_, Pdf.Stream {contents = Pdf.Dictionary d, _}) -> remove "/Prev" d
      | _ -> raise (Pdf.PDFError (Pdf.input_pdferror i "Malformed or missing trailer"))
  with
    e ->
      raise
        (Pdf.PDFError
           (Printf.sprintf "File reconstructor: could not read trailer dictionary - %s" (Printexc.to_string e)))

let read_malformed_trailerdicts i =
  i.seek_in 0;
  let trailerdict = ref [] in
    while
      try
        let currpos = i.pos_in () in
          iter (function (k, v) -> trailerdict := add k v !trailerdict) (read_malformed_trailerdict i);
          i.pos_in () > currpos
      with
        _ -> false
    do () done;
    !trailerdict

(* This function is used to skip non-whitespace junk between objects when
reading malformed files. It looks for the first integer, not actually for the x
y obj pattern itself. *)
let rec advance_to_integer i =
  dropwhite i;
  let p = i.pos_in () in
    match lex_next (ref 0) (ref 0) false i [] parse true (fun _ -> []) with
    | StopLexing -> ()
    | LexInt x -> i.seek_in p
    | l ->
       (* If no progress at all, bail out. *)
       if i.pos_in () > p then advance_to_integer i

(* Read the actual objects, in order. *)
let read_malformed_pdf_objects i =
  let objs = ref [] in
    while i.pos_in () < i.in_channel_length do
      let c = i.pos_in () in
        try
          (*Printf.printf "read_malformed_pdf_object is reading an object at %i\n" c;*)
          let objnum, obj =
            parse ~failure_is_ok:true (lex_object_at true i true parse (lex_object i (null_hash ()) parse true))
          in
            (*Printf.printf "Got object %i, which is %s ok\n" objnum (Pdfwrite.string_of_pdf obj);*)
            if objnum > 0 && objnum < max_int then objs := add objnum obj !objs;
            advance_to_integer i; (* find next possible object *)
            if i.pos_in () = c then ignore (input_line i) (* move on if no progress. *)
        with
          e -> (*Printf.printf "Couldn't get object, moving on\n";*) ignore (input_line i) (* Move on *)
    done;
    !objs

let read_malformed_pdf upw opw i =
  Printf.eprintf "Attempting to reconstruct the malformed pdf %s...\n" i.Pdfio.source;
  let trailerdict = read_malformed_trailerdicts i
  and major, minor = read_header i in
    i.Pdfio.seek_in 0;
    let objects =
      map
        (function (objnum, obj) -> (objnum, (ref (Pdf.Parsed obj), 0)))
        (read_malformed_pdf_objects i)
    in
      Printf.eprintf "Read %i objects\n" (length objects);
      let root =
        match lookup "/Root" trailerdict with
        | Some (Pdf.Indirect i) -> i
        | None -> raise (Pdf.PDFError (Pdf.input_pdferror i "No /Root entry"))
        | _ -> raise (Pdf.PDFError (Pdf.input_pdferror i "Malformed /Root entry"))
      in
        Printf.eprintf "Malformed PDF reconstruction succeeded!\n";
        flush stderr;
        {Pdf.major = major;
         Pdf.minor = minor;
         Pdf.root = root;
         Pdf.objects = Pdf.objects_of_list None objects;
         Pdf.trailerdict = Pdf.Dictionary trailerdict}
    
let read_pdf upw opw opt i =
  try read_pdf upw opw opt i with
  | Pdf.PDFError s as e when String.length s >= 10 && String.sub s 0 10 = "Encryption" ->
      (* If it failed due to encryption not supported or user password not right, the
      error should be passed up - it's not a malformed file. *)
      raise e
  | e ->
      try read_malformed_pdf upw opw i with e' ->
        raise
          (Pdf.PDFError
             (Pdf.input_pdferror
                i
                (Printf.sprintf
                   "Failed to read PDF - initial error was\n%s\n\nfinal error was \n%s\n\n"
                   (Printexc.to_string e)
                   (Printexc.to_string e'))))

(* Read a PDF into memory, including its streams. *)
let pdf_of_channel ?(source = "channel") upw opw ch =
  read_pdf upw opw true (input_of_channel ~source ch) 

(* Same, but delay reading of streams. *)
let pdf_of_channel_lazy ?(source = "channel") upw opw ch =
  read_pdf upw opw false (input_of_channel ~source ch)

(* Similarly for inputs. *)
let pdf_of_input upw opw i =
  read_pdf upw opw true i

(* And lazy on inputs. *)
let pdf_of_input_lazy upw opw i =
  read_pdf upw opw false i

(* Read a whole PDF file into memory. Closes file. *)
let pdf_of_file upw opw f =
  try 
    let fh = open_in_bin f in
      let pdf = pdf_of_channel ~source:f upw opw fh in
        close_in fh;
        pdf
  with
    | (Pdf.PDFError _) as e -> raise e
    | Sys_error str -> raise (Pdf.PDFError str)

let what_encryption pdf =
  if Pdfcrypt.is_encrypted pdf then
    let crypt, _, _, _, _, _, _ = Pdfcrypt.get_encryption_values pdf in
      match crypt with
      | Pdfcrypt.ARC4 (40, _) -> Some (Pdfwrite.PDF40bit)
      | Pdfcrypt.ARC4 (128, _) -> Some (Pdfwrite.PDF128bit)
      | Pdfcrypt.AESV2 | Pdfcrypt.AESV3 _ ->
          let metadata =
            match Pdf.lookup_direct pdf "/Encrypt" pdf.Pdf.trailerdict with
            | Some encrypt_dict ->
                begin match Pdf.lookup_direct pdf "/EncryptMetadata" encrypt_dict with
                | Some (Pdf.Boolean false) -> false
                | _ -> true
                end
            | _ -> assert false
          in
            begin match crypt with
            | Pdfcrypt.AESV2 -> Some (Pdfwrite.AES128bit metadata)
            | Pdfcrypt.AESV3 false -> Some (Pdfwrite.AES256bit metadata)
            | Pdfcrypt.AESV3 true -> Some (Pdfwrite.AES256bitISO metadata)
            | _ -> assert false
            end
      | _ -> None
  else
    None

let permissions pdf =
  if Pdfcrypt.is_encrypted pdf then
    let _, _, _, p, _, _, _ = Pdfcrypt.get_encryption_values pdf in
      Pdfcrypt.banlist_of_p p
  else
    []

let is_linearized i =
  try
    ignore (read_header i);
    let lexemes = lex_dictionary i in
      let _, parsed = parse ~failure_is_ok:true lexemes in
        match Pdf.lookup_direct (Pdf.empty ()) "/Linearized" parsed with
        | Some (Pdf.Integer _ | Pdf.Real _) -> true
        | _ -> false
  with
    _ -> false

let print_xref_table_and_trailer i =
  Printf.printf "attempting to read xref table and trailer at %i\n" (i.pos_in ());
  let xrefs = read_xref i in
    Printf.printf "There were %i xref entries:\n" (length xrefs);
    iter (fun (i, e) -> Printf.printf "Object %i is at %s\n" i (string_of_xref e)) xrefs;
    (* Now parse and print trailer dictionary *)
    dropwhite i;
    let lexemes = lex_dictionary i in
      let _, parsed = parse ~failure_is_ok:true lexemes in
        Printf.printf "Trailer dictionary: %s\n" (Pdfwrite.string_of_pdf parsed)

let print_primary_hint_stream n i =
  assert (n > 0);
  Printf.printf "attempting to read primary hint stream at %i\n" (i.pos_in ());
  (* Read and decode stream and a) get dictionary entry for /S and b) make
  input and bitstream from the raw contents *)
  let stream =
    snd (parse (lex_object_at true i false parse (lex_object i (null_hash ()) parse false)))
  in
    Pdfcodec.decode_pdfstream (Pdf.empty ()) stream;
    Pdf.getstream stream;
    match stream with
    | Pdf.Stream {contents = (dict, Pdf.Got arr)} ->
        Printf.printf "Parsed the hint stream object\n";
        (* Print out the page offset hint table header at byte 0 *)
        let si = Pdfio.input_of_bytes arr in
        let b = Pdfio.bitbytes_of_input si in
        let item1 = Pdfio.getval_32 b 32 in
        let item2 = Pdfio.getval_32 b 32 in
        let item3 = Pdfio.getval_32 b 16 in
        let item4 = Pdfio.getval_32 b 32 in
        let item5 = Pdfio.getval_32 b 16 in
        let item6 = Pdfio.getval_32 b 32 in
        let item7 = Pdfio.getval_32 b 16 in
        let item8 = Pdfio.getval_32 b 32 in
        let item9 = Pdfio.getval_32 b 16 in
        let item10 = Pdfio.getval_32 b 16 in
        let item11 = Pdfio.getval_32 b 16 in
        let item12 = Pdfio.getval_32 b 16 in
        let item13 = Pdfio.getval_32 b 16 in
        Printf.printf "item 1 = %li\n" item1;
        Printf.printf "item 2 = %li\n" item2;
        Printf.printf "item 3 = %li\n" item3;
        Printf.printf "item 4 = %li\n" item4;
        Printf.printf "item 5 = %li\n" item5;
        Printf.printf "item 6 = %li\n" item6;
        Printf.printf "item 7 = %li\n" item7;
        Printf.printf "item 8 = %li\n" item8;
        Printf.printf "item 9 = %li\n" item9;
        Printf.printf "item 10 = %li\n" item10;
        Printf.printf "item 11 = %li\n" item11;
        Printf.printf "item 12 = %li\n" item12;
        Printf.printf "item 13 = %li\n" item13;
        (* Now the per-page entry of the page offset hint table *)
        (* Read item 1 *)
        for p = 1 to n do
          let x = i32toi (Pdfio.getval_32 b (i32toi item3)) in
          Printf.printf "Page %i, item 1 is %i, so nobjects = %i\n" (p - 1) x (x + i32toi item1)
        done;
        Pdfio.align b;
        (* Read item 2 *)
        for p = 1 to n do
          let x = i32toi (Pdfio.getval_32 b (i32toi item5)) in
          Printf.printf "Page %i, item 2 is %i so length is %i\n" (p - 1) x (x + i32toi item4)
        done;
        Pdfio.align b;
        (* Read item 3 *)
        let item3s = Array.make n 0 in
        for p = 1 to n do
          let v = Pdfio.getval_32 b (i32toi item10) in
            item3s.(p - 1) <- i32toi v;
            Printf.printf "Page %i, item 3 is %li\n" (p - 1) v
        done;
        Pdfio.align b;
        if n > 1 then
          begin
            (* Read item 4 *)
            for p = 1 to n - 1 do
              (* Read for each shared object *)
              for obj = 1 to item3s.(p) do
                Printf.printf "Page %i, item 4, obj %i is %li\n" p obj (Pdfio.getval_32 b (i32toi item11))
              done
            done;
            Pdfio.align b;
            (* Read item 5 *)
            for p = 1 to n - 1 do
              (* Read for each shared object *)
              for obj = 1 to item3s.(p) do
                Printf.printf "Page %i, item 5, obj %i is %li\n" p obj (Pdfio.getval_32 b (i32toi item12))
              done
            done;
            Pdfio.align b
          end;
        (* Read item 6 *)
        Printf.printf "per-page table item 6 is %li\n" (Pdfio.getval_32 b (i32toi item7));
        Pdfio.align b;
        (* Read item 7 *)
        Printf.printf "per-page table item 7 is %li\n" (Pdfio.getval_32 b (i32toi item9));
        let spos =
          Pdf.lookup_direct (Pdf.empty ()) "/S" dict 
        in
          begin match spos with
          | Some (Pdf.Integer s) ->
              Printf.printf "Additional table /S found at byte %i\n" s;
              (* Print out the shared object hint table at byte s *)
              let si = Pdfio.input_of_bytes arr in
                si.Pdfio.seek_in s;
                let b = Pdfio.bitbytes_of_input si in
                  (* First, the header *)
                  let item1 = Pdfio.getval_32 b 32 in
                  let item2 = Pdfio.getval_32 b 32 in
                  let item3 = Pdfio.getval_32 b 32 in
                  let item4 = Pdfio.getval_32 b 32 in
                  let item5 = Pdfio.getval_32 b 16 in
                  let item6 = Pdfio.getval_32 b 32 in
                  let item7 = Pdfio.getval_32 b 16 in
                    Printf.printf "Shared object header, item1 = %li\n" item1;
                    Printf.printf "Shared object header, item2 = %li\n" item2;
                    Printf.printf "Shared object header, item3 = %li\n" item3;
                    Printf.printf "Shared object header, item4 = %li\n" item4;
                    Printf.printf "Shared object header, item5 = %li\n" item5;
                    Printf.printf "Shared object header, item6 = %li\n" item6;
                    Printf.printf "Shared object header, item7 = %li\n" item7;
                  for o = 0 to i32toi item4 - 1 do
                    let item1 = Pdfio.getval_32 b (i32toi item7) in
                      Printf.printf "for entry %i, item 1 is %li, so length is %li\n" o item1 (i32add item1 item6)
                  done;
                  Pdfio.align b;
                  let sigpresent = Array.make (i32toi item4) false in
                  for o = 0 to i32toi item4 - 1 do
                    sigpresent.(o) <- (Pdfio.getval_32 b 1 = 1l)
                  done;
                  Pdfio.align b;
                  for o = 0 to i32toi item4 - 1 do
                    if sigpresent.(o) then
                      begin
                        flprint "Sig present, gobbling 16 bytes\n";
                        ignore (Pdfio.getval_32 b 32);
                        ignore (Pdfio.getval_32 b 32);
                        ignore (Pdfio.getval_32 b 32);
                        ignore (Pdfio.getval_32 b 32);
                      end
                  done;
                  Pdfio.align b;
                  for o = 0 to i32toi item4 - 1 do
                    Printf.printf "shared object hint table, item 4 for group %i = %li\n" o (Pdfio.getval_32 b (i32toi item5));
                  done;
                  flprint "Finished reading shared object hint table\n"
          | _ -> Printf.printf "Error - Table /S not found\n"
          end
    | _ -> flprint "Could not read primary hint stream object\n"

let print_linearization i =
  if not (is_linearized i) then Printf.printf "file is not linearized\n" else
    begin try
      i.seek_in 0;
      ignore (read_header i);
      let lexemes = lex_dictionary i in
        let _, parsed = parse ~failure_is_ok:true lexemes in
          (* Print contents of linearization dictionary, and check syntactically well-formed *)
          begin match Pdf.lookup_direct (Pdf.empty ()) "/Linearized" parsed with
          | Some (Pdf.Integer i) -> Printf.printf "linearized version %i\n" i 
          | Some (Pdf.Real n) -> Printf.printf "linearized version %f\n" n
          | _ -> Printf.printf "no linearization version given\n"
          end;
          begin match Pdf.lookup_direct (Pdf.empty ()) "/L" parsed with
          | Some (Pdf.Integer l) -> Printf.printf "/L (length of file) is %i bytes\n" l
          | _ -> Printf.printf "no or malformed /L\n"
          end;
          let offset1, length1 =
            match Pdf.lookup_direct (Pdf.empty ()) "/H" parsed with
            | Some (Pdf.Array [Pdf.Integer offset1; Pdf.Integer length1]) ->
                Printf.printf "/H primary hint stream is at %i of length %i\n" offset1 length1;
                offset1, length1
            | Some (Pdf.Array [Pdf.Integer offset1; Pdf.Integer length1; Pdf.Integer offset2; Pdf.Integer length2]) ->
                Printf.printf "/H primary hint stream is at %i of length %i\n" offset1 length1;
                Printf.printf "/H overflow hint stream is at %i of length %i\n" offset2 length2;
                offset1, length1
            | _ -> Printf.printf "no or malformed /H\n"; 0, 0
          in
            begin match Pdf.lookup_direct (Pdf.empty ()) "/O" parsed with
            | Some (Pdf.Integer o) -> Printf.printf "/O object number of first page object is %i\n" o
            | _ -> Printf.printf "no or malformed /O\n"
            end;
            begin match Pdf.lookup_direct (Pdf.empty ()) "/E" parsed with
            | Some (Pdf.Integer e) -> Printf.printf "/E offset to end of the first page is %i\n" e
            | _ -> Printf.printf "no or malformed /E\n"
            end;
            let n =
              begin match Pdf.lookup_direct (Pdf.empty ()) "/N" parsed with
              | Some (Pdf.Integer n) -> Printf.printf "/N number of pages in file is %i\n" n; n
              | _ -> Printf.printf "no or malformed /N\n"; 0
              end
            in
            let t =
              match Pdf.lookup_direct (Pdf.empty ()) "/T" parsed with
              | Some (Pdf.Integer t) -> Printf.printf "/T (offset of xref table or xref stream object) is %i\n" t; t
              | _ -> Printf.printf "no or malformed /T\n"; 0
            in
              begin match Pdf.lookup_direct (Pdf.empty ()) "/P" parsed with
              | Some (Pdf.Integer p) -> Printf.printf "/P page number of first page is %i\n" p
              | Some _ -> Printf.printf "/P is malformed\n"
              | None -> Printf.printf "/P is default value 0\n"
              end;
              (* Skip past white space, endobj, whitespace *)
              dropwhite i; ignoreuntilwhite i; dropwhite i; 
              (* Now read part 3 - first page xref table and trailer *)
              print_xref_table_and_trailer i;
              (* Now read part 5 - primary hint stream *)
              if offset1 > 0 && length1 > 0 then
                begin
                  i.seek_in offset1;
                  print_primary_hint_stream n i
                end;
              (* Now read part 11 - main xref table and trailer *)
              if t > 0 then
                begin
                  i.seek_in t;
                  dropwhite i;
                  print_xref_table_and_trailer i
                end
    with
      e -> flush stdout; flush stderr; raise e
    end

