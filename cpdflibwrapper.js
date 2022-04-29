//This wraps the things exported from exports.ml into a JavaScript library.
//We wrap and re-export.

// Js_of_ocaml runtime support
// http://www.ocsigen.org/js_of_ocaml/
// Copyright (C) 2010-2014 Jérôme Vouillon
// Laboratoire PPS - CNRS Université Paris Diderot
//
// This program is free software; you can redistribute it and/or modify
// it under the terms of the GNU Lesser General Public License as published by
// the Free Software Foundation, with linking exception;
// either version 2.1 of the License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public License
// along with this program; if not, write to the Free Software
// Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA 02111-1307, USA.

// An OCaml string is an object with three fields:
// - tag 't'
// - length 'l'
// - contents 'c'
//
// The contents of the string can be either a JavaScript array or
// a JavaScript string. The length of this string can be less than the
// length of the OCaml string. In this case, remaining bytes are
// assumed to be zeroes. Arrays are mutable but consumes more memory
// than strings. A common pattern is to start from an empty string and
// progressively fill it from the start. Partial strings makes it
// possible to implement this efficiently.
//
// When converting to and from UTF-16, we keep track of whether the
// string is composed only of ASCII characters (in which case, no
// conversion needs to be performed) or not.
//
// The string tag can thus take the following values:
//   full string     BYTE | UNKNOWN:      0
//                   BYTE | ASCII:        9
//                   BYTE | NOT_ASCII:    8
//   string prefix   PARTIAL:             2
//   array           ARRAY:               4
//
// One can use bit masking to discriminate these different cases:
//   known_encoding(x) = x&8
//   is_ascii(x) =       x&1
//   kind(x) =           x&6

//Provides: caml_str_repeat
function caml_str_repeat(n, s) {
  if(n == 0) return "";
  if (s.repeat) {return s.repeat(n);} // ECMAscript 6 and Firefox 24+
  var r = "", l = 0;
  for(;;) {
    if (n & 1) r += s;
    n >>= 1;
    if (n == 0) return r;
    s += s;
    l++;
    if (l == 9) {
      s.slice(0,1); // flatten the string
      // then, the flattening of the whole string will be faster,
      // as it will be composed of larger pieces
    }
  }
}

//Provides: caml_subarray_to_jsbytes
//Weakdef
// Pre ECMAScript 5, [apply] would not support array-like object.
// In such setup, Typed_array would be implemented as polyfill, and [f.apply] would
// fail here. Mark the primitive as Weakdef, so that people can override it easily.
function caml_subarray_to_jsbytes (a, i, len) {
  var f = String.fromCharCode;
  if (i == 0 && len <= 4096 && len == a.length) return f.apply (null, a);
  var s = "";
  for (; 0 < len; i += 1024,len-=1024)
    s += f.apply (null, a.slice(i,i + Math.min(len, 1024)));
  return s;
}

//Provides: caml_utf8_of_utf16
function caml_utf8_of_utf16(s) {
  for (var b = "", t = b, c, d, i = 0, l = s.length; i < l; i++) {
    c = s.charCodeAt(i);
    if (c < 0x80) {
      for (var j = i + 1; (j < l) && (c = s.charCodeAt(j)) < 0x80; j++);
      if (j - i > 512) { t.substr(0, 1); b += t; t = ""; b += s.slice(i, j) }
      else t += s.slice(i, j);
      if (j == l) break;
      i = j;
    }
    if (c < 0x800) {
      t += String.fromCharCode(0xc0 | (c >> 6));
      t += String.fromCharCode(0x80 | (c & 0x3f));
    } else if (c < 0xd800 || c >= 0xdfff) {
      t += String.fromCharCode(0xe0 | (c >> 12),
                               0x80 | ((c >> 6) & 0x3f),
                               0x80 | (c & 0x3f));
    } else if (c >= 0xdbff || i + 1 == l ||
               (d = s.charCodeAt(i + 1)) < 0xdc00 || d > 0xdfff) {
      // Unmatched surrogate pair, replaced by \ufffd (replacement character)
      t += "\xef\xbf\xbd";
    } else {
      i++;
      c = (c << 10) + d - 0x35fdc00;
      t += String.fromCharCode(0xf0 | (c >> 18),
                               0x80 | ((c >> 12) & 0x3f),
                               0x80 | ((c >> 6) & 0x3f),
                               0x80 | (c & 0x3f));
    }
    if (t.length > 1024) {t.substr(0, 1); b += t; t = "";}
  }
  return b+t;
}

//Provides: caml_utf16_of_utf8
function caml_utf16_of_utf8(s) {
  for (var b = "", t = "", c, c1, c2, v, i = 0, l = s.length; i < l; i++) {
    c1 = s.charCodeAt(i);
    if (c1 < 0x80) {
      for (var j = i + 1; (j < l) && (c1 = s.charCodeAt(j)) < 0x80; j++);
      if (j - i > 512) { t.substr(0, 1); b += t; t = ""; b += s.slice(i, j) }
      else t += s.slice(i, j);
      if (j == l) break;
      i = j;
    }
    v = 1;
    if ((++i < l) && (((c2 = s.charCodeAt(i)) & -64) == 128)) {
      c = c2 + (c1 << 6);
      if (c1 < 0xe0) {
        v = c - 0x3080;
        if (v < 0x80) v = 1;
      } else {
        v = 2;
        if ((++i < l) && (((c2 = s.charCodeAt(i)) & -64) == 128)) {
          c = c2 + (c << 6);
          if (c1 < 0xf0) {
            v = c - 0xe2080;
            if ((v < 0x800) || ((v >= 0xd7ff) && (v < 0xe000))) v = 2;
          } else {
            v = 3;
            if ((++i < l) && (((c2 = s.charCodeAt(i)) & -64) == 128) &&
                (c1 < 0xf5)) {
              v = c2 - 0x3c82080 + (c << 6);
              if (v < 0x10000 || v > 0x10ffff) v = 3;
            }
          }
        }
      }
    }
    if (v < 4) { // Invalid sequence
      i -= v;
      t += "\ufffd";
    } else if (v > 0xffff)
      t += String.fromCharCode(0xd7c0 + (v >> 10), 0xdc00 + (v & 0x3FF))
    else
      t += String.fromCharCode(v);
    if (t.length > 1024) {t.substr(0, 1); b += t; t = "";}
  }
  return b+t;
}

//Provides: jsoo_is_ascii
function jsoo_is_ascii (s) {
  // The regular expression gets better at around this point for all browsers
  if (s.length < 24) {
    // Spidermonkey gets much slower when s.length >= 24 (on 64 bit archs)
    for (var i = 0; i < s.length; i++) if (s.charCodeAt(i) > 127) return false;
    return true;
  } else
    return !/[^\x00-\x7f]/.test(s);
}

//Provides: caml_bytes_unsafe_get mutable
function caml_bytes_unsafe_get (s, i) {
  switch (s.t & 6) {
  default: /* PARTIAL */
    if (i >= s.c.length) return 0;
  case 0: /* BYTES */
    return s.c.charCodeAt(i);
  case 4: /* ARRAY */
    return s.c[i]
  }
}

//Provides: caml_bytes_unsafe_set
//Requires: caml_convert_bytes_to_array
function caml_bytes_unsafe_set (s, i, c) {
  // The OCaml compiler uses Char.unsafe_chr on integers larger than 255!
  c &= 0xff;
  if (s.t != 4 /* ARRAY */) {
    if (i == s.c.length) {
      s.c += String.fromCharCode (c);
      if (i + 1 == s.l) s.t = 0; /*BYTES | UNKOWN*/
      return 0;
    }
    caml_convert_bytes_to_array (s);
  }
  s.c[i] = c;
  return 0;
}

//Provides: caml_string_bound_error
//Requires: caml_invalid_argument
function caml_string_bound_error () {
  caml_invalid_argument ("index out of bounds");
}

//Provides: caml_bytes_bound_error
//Requires: caml_invalid_argument
function caml_bytes_bound_error () {
  caml_invalid_argument ("index out of bounds");
}

//Provides: caml_string_get
//Requires: caml_string_bound_error, caml_string_unsafe_get
//Requires: caml_ml_string_length
function caml_string_get (s, i) {
  if (i >>> 0 >= caml_ml_string_length(s)) caml_string_bound_error();
  return caml_string_unsafe_get (s, i);
}

//Provides: caml_string_get16
//Requires: caml_string_unsafe_get, caml_string_bound_error
//Requires: caml_ml_string_length
function caml_string_get16(s,i) {
  if (i >>> 0 >= caml_ml_string_length(s) - 1) caml_string_bound_error();
  var b1 = caml_string_unsafe_get (s, i),
      b2 = caml_string_unsafe_get (s, i + 1);
  return (b2 << 8 | b1);
}

//Provides: caml_bytes_get16
//Requires: caml_bytes_unsafe_get, caml_bytes_bound_error
function caml_bytes_get16(s,i) {
  if (i >>> 0 >= s.l - 1) caml_bytes_bound_error();
  var b1 = caml_bytes_unsafe_get (s, i),
      b2 = caml_bytes_unsafe_get (s, i + 1);
  return (b2 << 8 | b1);
}

//Provides: caml_string_get32
//Requires: caml_string_unsafe_get, caml_string_bound_error
//Requires: caml_ml_string_length
function caml_string_get32(s,i) {
  if (i >>> 0 >= caml_ml_string_length(s) - 3) caml_string_bound_error();
  var b1 = caml_string_unsafe_get (s, i),
      b2 = caml_string_unsafe_get (s, i + 1),
      b3 = caml_string_unsafe_get (s, i + 2),
      b4 = caml_string_unsafe_get (s, i + 3);
  return (b4 << 24 | b3 << 16 | b2 << 8 | b1);
}

//Provides: caml_bytes_get32
//Requires: caml_bytes_unsafe_get, caml_bytes_bound_error
function caml_bytes_get32(s,i) {
  if (i >>> 0 >= s.l - 3) caml_bytes_bound_error();
  var b1 = caml_bytes_unsafe_get (s, i),
      b2 = caml_bytes_unsafe_get (s, i + 1),
      b3 = caml_bytes_unsafe_get (s, i + 2),
      b4 = caml_bytes_unsafe_get (s, i + 3);
  return (b4 << 24 | b3 << 16 | b2 << 8 | b1);
}

//Provides: caml_string_get64
//Requires: caml_string_unsafe_get, caml_string_bound_error
//Requires: caml_int64_of_bytes
//Requires: caml_ml_string_length
function caml_string_get64(s,i) {
  if (i >>> 0 >= caml_ml_string_length(s) - 7) caml_string_bound_error();
  var a = new Array(8);
  for(var j = 0; j < 8; j++){
    a[7 - j] = caml_string_unsafe_get (s, i + j);
  }
  return caml_int64_of_bytes(a);
}

//Provides: caml_bytes_get64
//Requires: caml_bytes_unsafe_get, caml_bytes_bound_error
//Requires: caml_int64_of_bytes
function caml_bytes_get64(s,i) {
  if (i >>> 0 >= s.l - 7) caml_bytes_bound_error();
  var a = new Array(8);
  for(var j = 0; j < 8; j++){
    a[7 - j] = caml_bytes_unsafe_get (s, i + j);
  }
  return caml_int64_of_bytes(a);
}

//Provides: caml_bytes_get
//Requires: caml_bytes_bound_error, caml_bytes_unsafe_get
function caml_bytes_get (s, i) {
  if (i >>> 0 >= s.l) caml_bytes_bound_error();
  return caml_bytes_unsafe_get (s, i);
}

//Provides: caml_string_set
//Requires: caml_failwith
//If: js-string
function caml_string_set (s, i, c) {
  caml_failwith("caml_string_set");
}

//Provides: caml_string_set
//Requires: caml_string_unsafe_set, caml_string_bound_error
//If: !js-string
function caml_string_set (s, i, c) {
  if (i >>> 0 >= s.l) caml_string_bound_error();
  return caml_string_unsafe_set (s, i, c);
}

//Provides: caml_bytes_set16
//Requires: caml_bytes_bound_error, caml_bytes_unsafe_set
function caml_bytes_set16(s,i,i16){
  if (i >>> 0 >= s.l - 1) caml_bytes_bound_error();
  var b2 = 0xFF & i16 >> 8,
      b1 = 0xFF & i16;
  caml_bytes_unsafe_set (s, i + 0, b1);
  caml_bytes_unsafe_set (s, i + 1, b2);
  return 0
}

//Provides: caml_string_set16
//Requires: caml_failwith
//If: js-string
function caml_string_set16(s,i,i16){
  caml_failwith("caml_string_set16");
}

//Provides: caml_string_set16
//Requires: caml_bytes_set16
//If: !js-string
function caml_string_set16(s,i,i16){
  return caml_bytes_set16(s,i,i16);
}

//Provides: caml_bytes_set32
//Requires: caml_bytes_bound_error, caml_bytes_unsafe_set
function caml_bytes_set32(s,i,i32){
  if (i >>> 0 >= s.l - 3) caml_bytes_bound_error();
  var b4 = 0xFF & i32 >> 24,
      b3 = 0xFF & i32 >> 16,
      b2 = 0xFF & i32 >> 8,
      b1 = 0xFF & i32;
  caml_bytes_unsafe_set (s, i + 0, b1);
  caml_bytes_unsafe_set (s, i + 1, b2);
  caml_bytes_unsafe_set (s, i + 2, b3);
  caml_bytes_unsafe_set (s, i + 3, b4);
  return 0
}

//Provides: caml_string_set32
//Requires: caml_failwith
//If: js-string
function caml_string_set32(s,i,i32){
  caml_failwith("caml_string_set32");
}

//Provides: caml_string_set32
//Requires: caml_bytes_set32
//If: !js-string
function caml_string_set32(s,i,i32){
  return caml_bytes_set32(s,i,i32);
}

//Provides: caml_bytes_set64
//Requires: caml_bytes_bound_error, caml_bytes_unsafe_set
//Requires: caml_int64_to_bytes
function caml_bytes_set64(s,i,i64){
  if (i >>> 0 >= s.l - 7) caml_bytes_bound_error();
  var a = caml_int64_to_bytes(i64);
  for(var j = 0; j < 8; j++) {
    caml_bytes_unsafe_set (s, i + 7 - j, a[j]);
  }
  return 0
}

//Provides: caml_string_set64
//Requires: caml_failwith
//If: js-string
function caml_string_set64(s,i,i64){
  caml_failwith("caml_string_set64");
}

//Provides: caml_string_set64
//Requires: caml_bytes_set64
//If: !js-string
function caml_string_set64(s,i,i64){
  return caml_bytes_set64(s,i,i64);
}

//Provides: caml_bytes_set
//Requires: caml_bytes_bound_error, caml_bytes_unsafe_set
function caml_bytes_set (s, i, c) {
  if (i >>> 0 >= s.l) caml_bytes_bound_error();
  return caml_bytes_unsafe_set (s, i, c);
}

//Provides: caml_bytes_of_utf16_jsstring
//Requires: jsoo_is_ascii, caml_utf8_of_utf16, MlBytes
function caml_bytes_of_utf16_jsstring (s) {
  var tag = 9 /* BYTES | ASCII */;
  if (!jsoo_is_ascii(s))
    tag = 8 /* BYTES | NOT_ASCII */, s = caml_utf8_of_utf16(s);
  return new MlBytes(tag, s, s.length);
}


//Provides: MlBytes
//Requires: caml_convert_string_to_bytes, jsoo_is_ascii, caml_utf16_of_utf8
function MlBytes (tag, contents, length) {
  this.t=tag; this.c=contents; this.l=length;
}
MlBytes.prototype.toString = function(){
  switch (this.t) {
  case 9: /*BYTES | ASCII*/
    return this.c;
  default:
    caml_convert_string_to_bytes(this);
  case 0: /*BYTES | UNKOWN*/
    if (jsoo_is_ascii(this.c)) {
      this.t = 9; /*BYTES | ASCII*/
      return this.c;
    }
    this.t = 8; /*BYTES | NOT_ASCII*/
  case 8: /*BYTES | NOT_ASCII*/
    return this.c;
  }
};
MlBytes.prototype.toUtf16 = function (){
  var r = this.toString();
  if(this.t == 9) return r
  return caml_utf16_of_utf8(r);
}
MlBytes.prototype.slice = function (){
  var content = this.t == 4 ? this.c.slice() : this.c;
  return new MlBytes(this.t,content,this.l);
}

//Provides: caml_convert_string_to_bytes
//Requires: caml_str_repeat, caml_subarray_to_jsbytes
function caml_convert_string_to_bytes (s) {
  /* Assumes not BYTES */
  if (s.t == 2 /* PARTIAL */)
    s.c += caml_str_repeat(s.l - s.c.length, '\0')
  else
    s.c = caml_subarray_to_jsbytes (s.c, 0, s.c.length);
  s.t = 0; /*BYTES | UNKOWN*/
}

//Provides: caml_convert_bytes_to_array
function caml_convert_bytes_to_array (s) {
  /* Assumes not ARRAY */
  if(globalThis.Uint8Array) {
    var a = new globalThis.Uint8Array(s.l);
  } else {
    var a = new Array(s.l);
  }
  var b = s.c, l = b.length, i = 0;
  for (; i < l; i++) a[i] = b.charCodeAt(i);
  for (l = s.l; i < l; i++) a[i] = 0;
  s.c = a;
  s.t = 4; /* ARRAY */
  return a;
}

//Provides: caml_array_of_bytes mutable
//Requires: caml_convert_bytes_to_array
function caml_array_of_bytes (s) {
  if (s.t != 4 /* ARRAY */) caml_convert_bytes_to_array(s);
  return s.c;
}

//Provides: caml_array_of_string mutable
//Requires: caml_convert_bytes_to_array
//Requires: caml_ml_string_length, caml_string_unsafe_get
function caml_array_of_string (s) {
  var l = caml_ml_string_length(s);
  var a = new Array(l);
  var i = 0;
  for (; i < l; i++) a[i] = caml_string_unsafe_get(s,i);
  return a;
}

//Provides: caml_create_string const
//Requires: MlBytes, caml_invalid_argument
//If: !js-string
function caml_create_string(len) {
  if(len < 0) caml_invalid_argument("String.create");
  return new MlBytes(len?2:9,"",len);
}

//Provides: caml_create_string const
//Requires: caml_invalid_argument
//If: js-string
function caml_create_string(len) {
  caml_invalid_argument("String.create");
}

//Provides: caml_create_bytes const
//Requires: MlBytes,caml_invalid_argument
function caml_create_bytes(len) {
  if (len < 0) caml_invalid_argument("Bytes.create");
  return new MlBytes(len?2:9,"",len);
}

//Provides: caml_string_of_array
//Requires: caml_subarray_to_jsbytes, caml_string_of_jsbytes
function caml_string_of_array (a) {
  return caml_string_of_jsbytes(caml_subarray_to_jsbytes(a,0,a.length));
}

//Provides: caml_bytes_of_array
//Requires: MlBytes
function caml_bytes_of_array (a) {
  return new MlBytes(4,a,a.length);
}

//Provides: caml_bytes_compare mutable
//Requires: caml_convert_string_to_bytes
function caml_bytes_compare(s1, s2) {
  (s1.t & 6) && caml_convert_string_to_bytes(s1);
  (s2.t & 6) && caml_convert_string_to_bytes(s2);
  return (s1.c < s2.c)?-1:(s1.c > s2.c)?1:0;
}


//Provides: caml_bytes_equal mutable (const, const)
//Requires: caml_convert_string_to_bytes
function caml_bytes_equal(s1, s2) {
  if(s1 === s2) return 1;
  (s1.t & 6) && caml_convert_string_to_bytes(s1);
  (s2.t & 6) && caml_convert_string_to_bytes(s2);
  return (s1.c == s2.c)?1:0;
}

//Provides: caml_string_notequal mutable (const, const)
//Requires: caml_string_equal
function caml_string_notequal(s1, s2) { return 1-caml_string_equal(s1, s2); }

//Provides: caml_bytes_notequal mutable (const, const)
//Requires: caml_bytes_equal
function caml_bytes_notequal(s1, s2) { return 1-caml_bytes_equal(s1, s2); }

//Provides: caml_bytes_lessequal mutable
//Requires: caml_convert_string_to_bytes
function caml_bytes_lessequal(s1, s2) {
  (s1.t & 6) && caml_convert_string_to_bytes(s1);
  (s2.t & 6) && caml_convert_string_to_bytes(s2);
  return (s1.c <= s2.c)?1:0;
}

//Provides: caml_bytes_lessthan mutable
//Requires: caml_convert_string_to_bytes
function caml_bytes_lessthan(s1, s2) {
  (s1.t & 6) && caml_convert_string_to_bytes(s1);
  (s2.t & 6) && caml_convert_string_to_bytes(s2);
  return (s1.c < s2.c)?1:0;
}

//Provides: caml_string_greaterequal
//Requires: caml_string_lessequal
function caml_string_greaterequal(s1, s2) {
  return caml_string_lessequal(s2,s1);
}
//Provides: caml_bytes_greaterequal
//Requires: caml_bytes_lessequal
function caml_bytes_greaterequal(s1, s2) {
  return caml_bytes_lessequal(s2,s1);
}

//Provides: caml_string_greaterthan
//Requires: caml_string_lessthan
function caml_string_greaterthan(s1, s2) {
  return caml_string_lessthan(s2, s1);
}

//Provides: caml_bytes_greaterthan
//Requires: caml_bytes_lessthan
function caml_bytes_greaterthan(s1, s2) {
  return caml_bytes_lessthan(s2, s1);
}

//Provides: caml_fill_bytes
//Requires: caml_str_repeat, caml_convert_bytes_to_array
function caml_fill_bytes(s, i, l, c) {
  if (l > 0) {
    if (i == 0 && (l >= s.l || (s.t == 2 /* PARTIAL */ && l >= s.c.length))) {
      if (c == 0) {
        s.c = "";
        s.t = 2; /* PARTIAL */
      } else {
        s.c = caml_str_repeat (l, String.fromCharCode(c));
        s.t = (l == s.l)?0 /* BYTES | UNKOWN */ :2; /* PARTIAL */
      }
    } else {
      if (s.t != 4 /* ARRAY */) caml_convert_bytes_to_array(s);
      for (l += i; i < l; i++) s.c[i] = c;
    }
  }
  return 0;
}

//Provides: caml_fill_string
//Requires: caml_fill_bytes
var caml_fill_string = caml_fill_bytes

//Provides: caml_blit_bytes
//Requires: caml_subarray_to_jsbytes, caml_convert_bytes_to_array
function caml_blit_bytes(s1, i1, s2, i2, len) {
  if (len == 0) return 0;
  if ((i2 == 0) &&
      (len >= s2.l || (s2.t == 2 /* PARTIAL */ && len >= s2.c.length))) {
    s2.c = (s1.t == 4 /* ARRAY */)?
      caml_subarray_to_jsbytes(s1.c, i1, len):
      (i1 == 0 && s1.c.length == len)?s1.c:s1.c.substr(i1, len);
    s2.t = (s2.c.length == s2.l)?0 /* BYTES | UNKOWN */ :2; /* PARTIAL */
  } else if (s2.t == 2 /* PARTIAL */ && i2 == s2.c.length) {
    s2.c += (s1.t == 4 /* ARRAY */)?
      caml_subarray_to_jsbytes(s1.c, i1, len):
      (i1 == 0 && s1.c.length == len)?s1.c:s1.c.substr(i1, len);
    s2.t = (s2.c.length == s2.l)?0 /* BYTES | UNKOWN */ :2; /* PARTIAL */
  } else {
    if (s2.t != 4 /* ARRAY */) caml_convert_bytes_to_array(s2);
    var c1 = s1.c, c2 = s2.c;
    if (s1.t == 4 /* ARRAY */) {
      if (i2 <= i1) {
        for (var i = 0; i < len; i++) c2 [i2 + i] = c1 [i1 + i];
      } else {
        for (var i = len - 1; i >= 0; i--) c2 [i2 + i] = c1 [i1 + i];
      }
    } else {
      var l = Math.min (len, c1.length - i1);
      for (var i = 0; i < l; i++) c2 [i2 + i] = c1.charCodeAt(i1 + i);
      for (; i < len; i++) c2 [i2 + i] = 0;
    }
  }
  return 0;
}

//Provides: caml_blit_string
//Requires: caml_blit_bytes, caml_bytes_of_string
function caml_blit_string(a,b,c,d,e) {
  caml_blit_bytes(caml_bytes_of_string(a),b,c,d,e);
  return 0
}

//Provides: caml_ml_bytes_length const
function caml_ml_bytes_length(s) { return s.l }

//Provides: caml_string_unsafe_get const
//If: js-string
function caml_string_unsafe_get (s, i) {
  return s.charCodeAt(i);
}

//Provides: caml_string_unsafe_set
//Requires: caml_failwith
//If: js-string
function caml_string_unsafe_set (s, i, c) {
  caml_failwith("caml_string_unsafe_set");
}

//Provides: caml_ml_string_length const
//If: js-string
function caml_ml_string_length(s) {
  return s.length
}

//Provides: caml_string_compare const
//If: js-string
function caml_string_compare(s1, s2) {
  return (s1 < s2)?-1:(s1 > s2)?1:0;
}

//Provides: caml_string_equal const
//If: js-string
function caml_string_equal(s1, s2) {
  if(s1 === s2) return 1;
  return 0;
}

//Provides: caml_string_lessequal const
//If: js-string
function caml_string_lessequal(s1, s2) {
  return (s1 <= s2)?1:0;
}

//Provides: caml_string_lessthan const
//If: js-string
function caml_string_lessthan(s1, s2) {
  return (s1 < s2)?1:0;
}

//Provides: caml_string_of_bytes
//Requires: caml_convert_string_to_bytes, caml_string_of_jsbytes
//If: js-string
function caml_string_of_bytes(s) {
  (s.t & 6) && caml_convert_string_to_bytes(s);
  return caml_string_of_jsbytes(s.c);
}

//Provides: caml_bytes_of_string const
//Requires: caml_bytes_of_jsbytes, caml_jsbytes_of_string
//If: js-string
function caml_bytes_of_string(s) {
  return caml_bytes_of_jsbytes(caml_jsbytes_of_string(s));
}

//Provides: caml_string_of_jsbytes const
//If: js-string
function caml_string_of_jsbytes(x) { return x }

//Provides: caml_jsbytes_of_string const
//If: js-string
function caml_jsbytes_of_string(x) { return x }

//Provides: caml_jsstring_of_string const
//Requires: jsoo_is_ascii, caml_utf16_of_utf8
//If: js-string
function caml_jsstring_of_string(s) {
  if(jsoo_is_ascii(s))
    return s;
  return caml_utf16_of_utf8(s); }

//Provides: caml_string_of_jsstring const
//Requires: jsoo_is_ascii, caml_utf8_of_utf16, caml_string_of_jsbytes
//If: js-string
function caml_string_of_jsstring (s) {
  if (jsoo_is_ascii(s))
    return caml_string_of_jsbytes(s)
  else return caml_string_of_jsbytes(caml_utf8_of_utf16(s));
}

//Provides: caml_bytes_of_jsbytes const
//Requires: MlBytes
function caml_bytes_of_jsbytes(s) { return new MlBytes(0,s,s.length); }


// The section below should be used when use-js-string=false

//Provides: caml_string_unsafe_get const
//Requires: caml_bytes_unsafe_get
//If: !js-string
function caml_string_unsafe_get (s, i) {
  return caml_bytes_unsafe_get(s,i);
}

//Provides: caml_string_unsafe_set
//Requires: caml_bytes_unsafe_set
//If: !js-string
function caml_string_unsafe_set (s, i, c) {
  return caml_bytes_unsafe_set(s,i,c);
}

//Provides: caml_ml_string_length const
//Requires: caml_ml_bytes_length
//If: !js-string
function caml_ml_string_length(s) {
  return caml_ml_bytes_length(s)
}

//Provides: caml_string_compare
//Requires: caml_bytes_compare
//If: !js-string
function caml_string_compare(s1, s2) {
  return caml_bytes_compare(s1,s2)
}

//Provides: caml_string_equal
//Requires: caml_bytes_equal
//If: !js-string
function caml_string_equal(s1, s2) {
  return caml_bytes_equal(s1,s2)
}

//Provides: caml_string_lessequal
//Requires: caml_bytes_lessequal
//If: !js-string
function caml_string_lessequal(s1, s2) {
  return caml_bytes_lessequal(s1,s2)
}

//Provides: caml_string_lessthan
//Requires: caml_bytes_lessthan
//If: !js-string
function caml_string_lessthan(s1, s2) {
  return caml_bytes_lessthan(s1,s2)
}

//Provides: caml_string_of_bytes
//If: !js-string
function caml_string_of_bytes(s) { return s }

//Provides: caml_bytes_of_string const
//If: !js-string
function caml_bytes_of_string(s) { return s }

//Provides: caml_string_of_jsbytes const
//Requires: caml_bytes_of_jsbytes
//If: !js-string
function caml_string_of_jsbytes(s) { return caml_bytes_of_jsbytes(s); }

//Provides: caml_jsbytes_of_string const
//Requires: caml_convert_string_to_bytes
//If: !js-string
function caml_jsbytes_of_string(s) {
  (s.t & 6) && caml_convert_string_to_bytes(s);
  return s.c }

//Provides: caml_jsstring_of_string mutable (const)
//If: !js-string
function caml_jsstring_of_string(s){
  return s.toUtf16()
}

//Provides: caml_string_of_jsstring
//Requires: caml_bytes_of_utf16_jsstring
//If: !js-string
function caml_string_of_jsstring (s) {
  return caml_bytes_of_utf16_jsstring(s);
}

//Provides: caml_is_ml_bytes
//Requires: MlBytes
function caml_is_ml_bytes(s) {
  return (s instanceof MlBytes);
}

//Provides: caml_ml_bytes_content
//Requires: MlBytes, caml_convert_string_to_bytes
function caml_ml_bytes_content(s) {
  switch (s.t & 6) {
  default: /* PARTIAL */
    caml_convert_string_to_bytes(s);
  case 0: /* BYTES */
    return s.c;
  case 4:
    return s.c
  }
}

//Provides: caml_is_ml_string
//Requires: jsoo_is_ascii
//If: js-string
function caml_is_ml_string(s) {
  return (typeof s === "string" && !/[^\x00-\xff]/.test(s));
}

//Provides: caml_is_ml_string
//Requires: caml_is_ml_bytes
//If: !js-string
function caml_is_ml_string(s) {
  return caml_is_ml_bytes(s);
}

// The functions below are deprecated

//Provides: caml_js_to_byte_string const
//Requires: caml_string_of_jsbytes
function caml_js_to_byte_string(s) { return caml_string_of_jsbytes(s) }

//Provides: caml_new_string
//Requires: caml_string_of_jsbytes
function caml_new_string (s) { return caml_string_of_jsbytes(s) }

//Provides: caml_js_from_string mutable (const)
//Requires: caml_jsstring_of_string
function caml_js_from_string(s) {
  return caml_jsstring_of_string(s)
}

//Provides: caml_to_js_string mutable (const)
//Requires: caml_jsstring_of_string
function caml_to_js_string(s) {
  return caml_jsstring_of_string(s)
}

//Provides: caml_js_to_string const
//Requires: caml_string_of_jsstring
function caml_js_to_string (s) {
  return caml_string_of_jsstring(s);
}

/* ------------------------------------------------------ */

/* CHAPTER 0. Preliminaries */
function setFast()
{
  return cpdf.cpdflib.setFast();
}

function setSlow()
{
  return cpdf.cpdflib.setSlow();
}

function version()
{
  return cpdf.cpdflib.version;
}

//CHAPTER 1. Basics
function fromFile(filename, userpw)
{
  var r = 
    cpdf.cpdflib.fromFile
      (caml_string_of_jsstring(filename), caml_string_of_jsstring(userpw));
  return r
}

function toFile(pdf, filename, linearize, make_id)
{
  cpdf.cpdflib.toFile(pdf, caml_string_of_jsstring(filename), linearize, make_id);
}

function toFileExt(pdf, filename, linearize, make_id, preserve_objstm, create_objstm, compress_objstm)
{
  cpdf.cpdflib.toFileExt(pdf, caml_string_of_jsstring(filename), linearize, make_id, preserve_objstm, create_objstm, compress_objstm);
}

function fromFileLazy(filename, userpw)
{
  var r =
    cpdf.cpdflib.fromFileLazy
      (caml_string_of_jsstring(filename), caml_string_of_jsstring(userpw));
  return r;
}

function ptOfCm(x)
{
  return cpdf.cpdflib.ptOfCm(x);
}

function ptOfMm(x)
{
  return cpdf.cpdflib.ptOfMm(x);
}

function ptOfIn(x)
{
  return cpdf.cpdflib.ptOfIn(x);
}

function cmOfPt(x)
{
  return cpdf.cpdflib.cmOfPt(x);
}

function mmOfPt(x)
{
  return cpdf.cpdflib.mmOfPt(x);
}

function inOfPt(x)
{
  return cpdf.cpdflib.inOfPt(x);
}

function toMemory(pdf, linearize, make_id)
{
  var r = cpdf.cpdflib.toMemory(pdf, linearize, make_id);
  return r.data;
}

function fromMemory(arr, pw)
{
  var bigarray =
    {kind : 3,
     layout : 0,
     dims : [arr.length],
     data : arr};
  var r = cpdf.cpdflib.fromMemory(bigarray, pw);
  return r;
}

//FIXME Need to prevent garbage collection until actually unused
function fromMemoryLazy(arr, pw)
{
  var bigarray =
    {kind : 3,
     layout : 0,
     dims : [arr.length],
     data : arr};
  var r = cpdf.cpdflib.fromMemoryLazy(bigarray, pw);
  return r;
}

function blankDocument(w, h, pages)
{
  var r = cpdf.cpdflib.blankDocument(w, h, pages);
  return r;
}

const a0portrait = 0;
const a1portrait = 1;
const a2portrait = 2;
const a3portrait = 3;
const a4portrait = 4;
const a5portrait = 5;
const a0landscape = 6;
const a1landscape = 7;
const a2landscape = 8;
const a3landscape = 9;
const a4landscape = 10;
const a5landscape = 11;
const usletterportrait = 12;
const usletterlandscape = 13;
const uslegalportrait = 14;
const uslegallandscape = 15;

function blankDocumentPaper(papersize, pages)
{
  var r = cpdf.cpdflib.blankDocumentPaper(papersize, pages);
  return r;
}

function isLinearized(filename)
{
  var r = cpdf.cpdflib.isLinearized(caml_string_of_jsstring(filename));
  return r;
}

function isEncrypted(pdf)
{
  var r = cpdf.cpdflib.isEncrypted(pdf);
  return r;
}

const noEdit = 0;
const noPrint = 1;
const noCopy = 2;
const noAnnot = 3;
const noForms = 4;
const noExtract = 5;
const noAssemble = 6;
const noHqPrint = 7;

const pdf40bit = 0;
const pdf128bit = 1;
const aes128bitfalse = 2;
const aes128bittrue = 3;
const aes256bitfalse = 4;
const aes256bittrue = 5;
const aes256bitisofalse = 6;
const aes256bitisotrue = 7;

function toFileEncrypted(pdf, encryption_method, perms, owner, user, linearize, makeid, filename)
{
  var ps = [0].concat(perms);
  cpdf.cpdflib.toFileEncrypted(pdf, encryption_method, ps,
                               caml_string_of_jsstring(owner), caml_string_of_jsstring(user), linearize, makeid,
                               caml_string_of_jsstring(filename));
}

function toFileEncryptedExt(pdf, encryption_method, perms, owner, user, linearize, makeid, preserve_objstm, generate_objstm, compress_objstm, filename)
{
  var ps = [0].concat(perms);
  cpdf.cpdflib.toFileEncryptedExt(pdf, encryption_method, ps,
                                  caml_string_of_jsstring(owner), caml_string_of_jsstring(user),
                                  linearize, makeid, preserve_objstm, generate_objstm, compress_objstm,
                                  caml_string_of_jsstring(filename));
}

function range(a, b)
{
  var r = cpdf.cpdflib.range(a, b);
  return r;
}

function all(x)
{
  var r = cpdf.cpdflib.all(x);
  return r;
}

function even(x)
{
  var r = cpdf.cpdflib.even(x);
  return r;
}

function odd(x)
{
  var r = cpdf.cpdflib.odd(x);
  return r;
}

function rangeUnion(a, b)
{
  var r = cpdf.cpdflib.rangeUnion(a, b);
  return r;
}

function difference(a, b)
{
  var r = cpdf.cpdflib.difference(a, b);
  return r;
}

function removeDuplicates(x)
{
  var r = cpdf.cpdflib.removeDuplicates(x);
  return r;
}

function rangeLength(x)
{
  var r = cpdf.cpdflib.rangeLength(x);
  return r;
}

function rangeGet(a, b)
{
  var r = cpdf.cpdflib.rangeGet(a, b);
  return r;
}

function rangeAdd(a, b)
{
  var r = cpdf.cpdflib.rangeAdd(a, b);
  return r;
}

function isInRange(a, b)
{
  var r = cpdf.cpdflib.isInRange(a, b);
  return r;
}

function blankRange()
{
  var r = cpdf.cpdflib.blankRange();
  return r;
}

function pages(pdf)
{
  var r = cpdf.cpdflib.pages(pdf);
  return r;
}

function pagesFast(filename, pw)
{
  var r = cpdf.cpdflib.pagesFast(caml_string_of_jsstring(filename), caml_string_of_jsstring(pw));
  return r;
}

function hasPermission(pdf, perm)
{
  var r = cpdf.cpdflib.hasPermission(pdf, perm);
  return r;
}

function encryptionKind(pdf)
{
  var r = cpdf.cpdflib.encryptionKind(pdf);
  return r;
}

function decryptPdf(pdf, userpw)
{
  cpdf.cpdflib.decryptPdf(pdf, caml_string_of_jsstring(userpw));
}

function decryptPdfOwner(pdf, ownerpw)
{
  cpdf.cpdflib.decryptPdfOwner(pdf, caml_string_of_jsstring(ownerpw));
}

function parsePagespec(pdf, spec)
{
  var r = cpdf.cpdflib.parsePagespec(pdf, caml_string_of_jsstring(spec));
  return r;
}

function stringOfPagespec(pdf, r)
{
  var r = caml_jsstring_of_string(cpdf.cpdflib.stringOfPagespec(pdf, r));
  return r;
}

function validatePagespec(spec)
{
  var r = cpdf.cpdflib.validatePagespec(caml_string_of_jsstring(spec));
  return r;
}

function startEnumeratePDFs()
{
  var r = cpdf.cpdflib.startEnumeratePDFs();
  return r;
}

function endEnumeratePDFs()
{
  cpdf.cpdflib.endEnumeratePDFs();
}

function enumeratePDFsKey(n)
{
  var r = cpdf.cpdflib.enumeratePDFsKey(n);
  return r;
}

function enumeratePDFsInfo(n)
{
  var r = cpdf.cpdflib.enumeratePDFsInfo(n);
  return caml_jsstring_of_string(r);
}

function mergeSimple(arr)
{
  arr2 = [0].concat(arr);
  var r = cpdf.cpdflib.mergeSimple(arr2);
  return r;
}

function merge(arr, retain_numbering, remove_duplicate_fonts)
{
  arr2 = [0].concat(arr);
  var r = cpdf.cpdflib.merge(arr2, retain_numbering, remove_duplicate_fonts);
  return r;
}

function mergeSame(arr, retain_numbering, remove_duplicate_fonts, ranges)
{
  arr2 = [0].concat(arr);
  ranges2 = [0].concat(ranges);
  var r = cpdf.cpdflib.mergeSame(arr2, retain_numbering, remove_duplicate_fonts, ranges2);
  return r;
}

function selectPages(pdf, range)
{
  var r = cpdf.cpdflib.selectPages(pdf, range);
  return r;
}

function scalePages(pdf, range, sx, sy)
{
  cpdf.cpdflib.scalePages(pdf, range, sx, sy);
}

function scaleToFit(pdf, range, sx, sy, s)
{
  cpdf.cpdflib.scaleToFit(pdf, range, sx, sy, s);
}

function scaleToFitPaper(pdf, range, papersize, s)
{
  cpdf.cpdflib.scaleToFitPaper(pdf, range, papersize, s);
}

function scaleContents(pdf, range, anchor, p1, p2, s)
{
  cpdf.cpdflib.scaleContents(pdf, range, anchor, p1, p2, s);
}

function shiftContents(pdf, range, dx, dy)
{
  cpdf.cpdflib.shiftContents(pdf, range, dx, dy);
}

function rotate(pdf, range, angle)
{
  cpdf.cpdflib.rotate(pdf, range, angle);
}

function rotateBy(pdf, range, angle)
{
  cpdf.cpdflib.rotateBy(pdf, range, angle);
}

function rotateContents(pdf, range, angle)
{
  cpdf.cpdflib.rotateContents(pdf, range, angle);
}

function upright(pdf, range)
{
  cpdf.cpdflib.upright(pdf, range);
}

function hFlip(pdf, range)
{
  cpdf.cpdflib.hFlip(pdf, range);
}

function vFlip(pdf, range)
{
  cpdf.cpdflib.vFlip(pdf, range);
}

function crop(pdf, range, a, b, c, d)
{
  cpdf.cpdflib.crop(pdf, range, a, b, c, d);
}

function trimMarks(pdf, range)
{
  cpdf.cpdflib.trimMarks(pdf, range);
}

function hardBox(pdf, range, boxname)
{
  cpdf.cpdflib.hardBox(pdf, range, caml_string_of_jsstring(boxname));
}

function removeCrop(pdf, range)
{
  cpdf.cpdflib.removeCrop(pdf, range);
}

function removeArt(pdf, range)
{
  cpdf.cpdflib.removeArt(pdf, range);
}

function removeBleed(pdf, range)
{
  cpdf.cpdflib.removeBleed(pdf, range);
}

function removeTrim(pdf, range)
{
  cpdf.cpdflib.removeTrim(pdf, range);
}

function showBoxes(pdf, range)
{
  cpdf.cpdflib.showBoxes(pdf, range);
}

function compress(pdf)
{
  cpdf.cpdflib.compress(pdf);
}

function decompress(pdf)
{
  cpdf.cpdflib.decompress(pdf);
}

function squeezeInMemory(pdf)
{
  cpdf.cpdflib.squeezeInMemory(pdf);
}

function startGetBookmarkInfo(pdf)
{
  cpdf.cpdflib.startGetBookmarkInfo(pdf);
}

function endGetBookmarkInfo()
{
  cpdf.cpdflib.endGetBookmarkInfo();
}

function numberBookmarks()
{
  var r = cpdf.cpdflib.numberBookmarks();
  return r;
}

function getBookmarkPage(pdf, n)
{
  var r = cpdf.cpdflib.getBookmarkPage(pdf, n);
  return r;
}

function getBookmarkLevel(n)
{
  var r = cpdf.cpdflib.getBookmarkLevel(n);
  return r;
}

function getBookmarkText(n)
{
  var r = caml_jsstring_of_string(cpdf.cpdflib.getBookmarkText(n));
  return r;
}

function getBookmarkOpenStatus(n)
{
  var r = cpdf.cpdflib.getBookmarkOpenStatus(n);
  return r;
}

function numberFonts()
{
  var r = cpdf.cpdflib.numberFonts();
  return r;
}

function getFontPage(n)
{
  var r = cpdf.cpdflib.getFontPage(n);
  return r;
}

function getFontName(n)
{
  var r = caml_jsstring_of_string(cpdf.cpdflib.getFontName(n));
  return r;
}

function getFontType(n)
{
  var r = caml_jsstring_of_string(cpdf.cpdflib.getFontType(n));
  return r;
}

function getFontEncoding(n)
{
  var r = caml_jsstring_of_string(cpdf.cpdflib.getFontEncoding(n));
  return r;
}

function startGetFontInfo(pdf)
{
  cpdf.cpdflib.startGetFontInfo(pdf);
}

function endGetFontInfo()
{
  cpdf.cpdflib.endGetFontInfo();
}

function startSetBookmarkInfo(n)
{
  cpdf.cpdflib.startSetBookmarkInfo(n);
}

function setBookmarkLevel(a, b)
{
  cpdf.cpdflib.setBookmarkLevel(a, b);
}

function setBookmarkPage(pdf, a, b)
{
  cpdf.cpdflib.setBookmarkPage(pdf, a, b);
}

function setBookmarkOpenStatus(a, b)
{
  cpdf.cpdflib.setBookmarkOpenStatus(a, b);
}

function setBookmarkText(n, t)
{
  cpdf.cpdflib.setBookmarkText(n, caml_string_of_jsstring(t));
}

function endSetBookmarkInfo(pdf)
{
  cpdf.cpdflib.endSetBookmarkInfo(pdf);
}

function getBookmarksJSON(pdf)
{
  var r = cpdf.cpdflib.getBookmarksJSON(pdf).data;
  return r;
}

function setBookmarksJSON(pdf)
{
  //FIXME do something here
}

function tableOfContents(pdf, font, fontsize, title, bookmarks)
{
  cpdf.cpdflib.tableOfContents(pdf, font, fontsize, caml_string_of_jsstring(title), bookmarks);
}

function removeFonts(pdf)
{
  cpdf.cpdflib.removeFonts(pdf);
}

function copyFont(pdf, pdf2, range, pagenumber, fontname)
{
  cpdf.cpdflib.copyFont(pdf, pdf2, range, pagenumber, caml_string_of_jsstring(fontname));
}

function draft(pdf, range, boxes)
{
  cpdf.cpdflib.draft(pdf, range, boxes);
}

function removeAllText(pdf, range)
{
  cpdf.cpdflib.removeAllText(pdf, range);
}

function blackText(pdf, range)
{
  cpdf.cpdflib.blackText(pdf, range);
}

function blackLines(pdf, range)
{
  cpdf.cpdflib.blackLines(pdf, range);
}

function blackFills(pdf, range)
{
  cpdf.cpdflib.blackFills(pdf, range);
}

function thinLines(pdf, range, thickness)
{
  cpdf.cpdflib.thinLines(pdf, range, thickness);
}

function copyId(from_pdf, to_pdf)
{
  cpdf.cpdflib.copyId(from_pdf, to_pdf);
}

function removeId(pdf)
{
  cpdf.cpdflib.removeId(pdf);
}

function setVersion(pdf, a)
{
  cpdf.cpdflib.setVersion(pdf, a);
}

function setFullVersion(pdf, a, b)
{
  cpdf.cpdflib.setFullVersion(pdf, a, b);
}

function removeDictEntry(pdf, key)
{
  cpdf.cpdflib.removeDictEntry(pdf, caml_string_of_jsstring(key));
}

function removeDictEntrySearch(pdf, key, searchterm)
{
  cpdf.cpdflib.removeDictEntrySearch(pdf, caml_string_of_jsstring(key), caml_string_of_jsstring(searchterm));
}

function replaceDictEntry(pdf, key, newval)
{
  cpdf.cpdflib.replaceDictEntry(pdf, caml_string_of_jsstring(key), caml_string_of_jsstring(newval));
}

function replaceDictEntrySearch(pdf, key, searchterm, newval)
{
  cpdf.cpdflib.replaceDictEntrySearch
    (pdf, caml_string_of_jsstring(key), caml_string_of_jsstring(searchterm), caml_string_of_jsstring(newval));
}

function getDictEntries(pdf, key)
{
  var r = cpdf.cpdflib.getDictEntries(pdf, caml_string_of_jsstring(key));
  return r.data;
}

function removeClipping(pdf, range)
{
  cpdf.cpdflib.removeClipping(pdf, range);
}

function textToPDF(w, h, font, fontsize, filename)
{
  var r = cpdf.cpdflib.textToPDF(w, h, font, fontsize, caml_string_of_jsstring(filename));
  return r;
}

function textToPDFPaper(papersize, font, fontsize, filename)
{
  var r = cpdf.cpdflib.textToPDFPaper(papersize, font, fontsize, caml_string_of_jsstring(filename));
  return r;
}

function annotationsJSON(pdf)
{
  var r = cpdf.cpdflib.annotationsJSON(pdf);
  return r.data;
}

function twoUp(pdf)
{
  var r = cpdf.cpdflib.twoUp(pdf);
  return r;
}

function twoUpStack(pdf)
{
  var r = cpdf.cpdflib.twoUpStack(pdf);
  return r;
}

function impose(pdf, a, b, c, d, e, f, g, h, i, j)
{
  var r = cpdf.cpdflib.impose(pdf, a, b, c, d, e, f, g, h, i, j);
  return r;
}

function padBefore(pdf, range)
{
  var r = cpdf.cpdflib.padBefore(pdf, range);
}

function padAfter(pdf, range)
{
  var r = cpdf.cpdflib.padAfter(pdf, range);
}

function padEvery(pdf, range)
{
  var r = cpdf.cpdflib.padEvery(pdf, range);
}

function padMultiple(pdf, range)
{
  var r = cpdf.cpdflib.padMultiple(pdf, range);
}

function padMultipleBefore(pdf, range)
{
  var r = cpdf.cpdflib.padMultipleBefore(pdf, range);
}

function stampOn(stamp, stampee, stamp_range)
{
  cpdf.cpdflib.stampOn(stamp, stampee, stamp_range);
}

function stampUnder(stamp, stampee, stamp_range)
{
  cpdf.cpdflib.stampUnder(stamp, stampee, stamp_range);
}

function stampExtended(stamp, stampee, stamp_range, a, b, c, d, e, f)
{
  cpdf.cpdflib.stampExtended(stamp, stampee, stamp_range, a, b, c, d, e, f);
}

function combinePages(a, b)
{
  var r = cpdf.cpdflib.combinePages(a, b);
  return r;
}

function addText(metrics, pdf, range, text, anchor, p1, p2, linespacing,
                 bates, font, fontsize, color, underneath, cropbox, outline,
                 opacity, justification, midline, topline, filename, linewidth, embed_fonts)
{
  cpdf.cpdflib.addText(metrics, pdf, range, caml_string_of_jsstring(text), anchor, p1, p2,
                       linespacing, bates, font, fontsize, color, underneath, cropbox, outline,
                       opacity, justification, midline, topline, caml_string_of_jsstring(filename),
                       linewidth, embed_fonts);
}

function addTextSimple(pdf, range, text, anchor, p1, p2, font, fontsize)
{
  cpdf.cpdflib.addText(0, pdf, range, caml_string_of_jsstring(text), anchor, p1, p2, 1.0, 0, font, fontsize, 0, 0, 0, 0, 1, 1, 1.0, leftJustify, 1, 1, "", 1);
}

function removeText(pdf, range)
{
  cpdf.cpdflib.removeText(pdf, range);
}

function addContent(content, underneath, pdf, range)
{
  cpdf.cpdflib.addContent(caml_string_of_jsstring(content), underneath, pdf, range);
}

function stampAsXObject(pdf, range, pdf2)
{
  var r = caml_jsstring_of_string(cpdf.cpdflib.stampAsXObject(pdf, range, pdf2));
  return r;
}

function textWidth(font, text)
{
  var r = cpdf.cpdflib.textWidth(font, caml_string_of_jsstring(text));
  return r;
}

var leftJustify = 0;
var centreJustify = 1;
var rightJustify = 2;

function startGetOCGList(pdf)
{
  var r = cpdf.cpdflib.startGetOCGList(pdf);
  return r;
}

function ocgListEntry(n)
{
  var r = caml_jsstring_of_string(cpdf.cpdflib.ocgListEntry(n));
  return r;
}

function endGetOCGList()
{
  cpdf.cpdflib.endGetOCGList();
}

function ocgCoalesce(pdf)
{
  cpdf.cpdflib.ocgCoalesce(pdf);
}

function ocgRename(pdf, f, t)
{
  cpdf.cpdflib.ocgRename(pdf, caml_string_of_jsstring(f), caml_string_of_jsstring(t));
}

function ocgOrderAll(pdf)
{
  cpdf.cpdflib.ocgOrderAll(pdf);
}

function startGetImageResolution(pdf, res)
{
  var r = cpdf.cpdflib.startGetImageResolution(pdf, res);
  return r;
}

function getImageResolutionPageNumber(n)
{
  var r = cpdf.cpdflib.getImageResolutionPageNumber(n);
  return r;
}

function getImageResolutionImageName(n)
{
  var r = caml_jsstring_of_string(cpdf.cpdflib.getImageResolutionImageName(n));
  return r;
}

function getImageResolutionXPixels(n)
{
  var r = cpdf.cpdflib.getImageResolutionXPixels(n);
  return r;
}

function getImageResolutionYPixels(n)
{
  var r = cpdf.cpdflib.getImageResolutionYPixels(n);
  return r;
}

function getImageResolutionXRes(n)
{
  var r = cpdf.cpdflib.getImageResolutionXRes(n);
  return r;
}

function getImageResolutionYRes(n)
{
  var r = cpdf.cpdflib.getImageResolutionYRes(n);
  return r;
}

function endGetImageResolution()
{
  cpdf.cpdflib.endGetImageResolution();
}

function attachFile(file, pdf)
{
  cpdf.cpdflib.attachFile(caml_string_of_jsstring(file), pdf);
}

function attachFileFromMemory(data, filename, file)
{
  //FIXME
}

function attachFileToPageFromMemory(data, filename, file, pagenumber)
{
  //FIXME
}

function attachFileToPage(file, pdf, pagenumber)
{
  cpdf.cpdflib.attachFileToPage(caml_string_of_jsstring(file), pdf, pagenumber);
}

function removeAttachedFiles(pdf)
{
  cpdf.cpdflib.removeAttachedFiles(pdf);
}

function startGetAttachments(pdf)
{
  cpdf.cpdflib.startGetAttachments(pdf);
}

function endGetAttachments()
{
  cpdf.cpdflib.endGetAttachments();
}

function numberGetAttachments()
{
  var r = cpdf.cpdflib.numberGetAttachments();
  return r;
}

function getAttachmentName(n)
{
  var r = caml_jsstring_of_string(cpdf.cpdflib.getAttachmentName(n));
  return r;
}

function getAttachmentPage(n)
{
  var r = cpdf.cpdflib.getAttachmentPage(n);
  return n;
}

function getAttachmentData(n)
{
  var r = cpdf.cpdflib.getAttachmentData(n);
  return r.data;
}

function outputJSON(filename, a, b, c, pdf)
{
  cpdf.cpdflib.outputJSON(caml_string_of_jsstring(filename), a, b, c, pdf);
}

function outputJSONMemory(pdf, a, b, c)
{
  var r = cpdf.cpdflib.outputJSONMemory(pdf, a, b, c);
  return r.data;
}

function fromJSON(filename)
{
  var r = cpdf.cpdflib.fromJSON(caml_string_of_jsstring(filename));
  return r;
}

function fromJSONMemory(buf)
{
  //FIXME
}

function getVersion(pdf)
{
  var r = cpdf.cpdflib.getVersion(pdf);
  return r;
}

function getMajorVersion(pdf)
{
  var r = cpdf.cpdflib.getMajorVersion(pdf);
  return r;
}

function getTitle(pdf)
{
  var r = caml_jsstring_of_string(cpdf.cpdflib.getTitle(pdf));
  return r;
}

function getAuthor(pdf)
{
  var r = caml_jsstring_of_string(cpdf.cpdflib.getAuthor(pdf));
  return r;
}

function getSubject(pdf)
{
  var r = caml_jsstring_of_string(cpdf.cpdflib.getSubject(pdf));
  return r;
}

function getKeywords(pdf)
{
  var r = caml_jsstring_of_string(cpdf.cpdflib.getKeywords(pdf));
  return r;
}

function getCreator(pdf)
{
  var r = caml_jsstring_of_string(cpdf.cpdflib.getCreator(pdf));
  return r;
}

function getProducer(pdf)
{
  var r = caml_jsstring_of_string(cpdf.cpdflib.getProducer(pdf));
  return r;
}

function getCreationDate(pdf)
{
  var r = caml_jsstring_of_string(cpdf.cpdflib.getCreationDate(pdf));
  return r;
}

function getModificationDate(pdf)
{
  var r = caml_jsstring_of_string(cpdf.cpdflib.getModificationDate(pdf));
  return r;
}

function getTitleXMP(pdf)
{
  var r = caml_jsstring_of_string(cpdf.cpdflib.getTitleXMP(pdf));
  return r;
}

function getAuthorXMP(pdf)
{
  var r = caml_jsstring_of_string(cpdf.cpdflib.getAuthorXMP(pdf));
  return r;
}

function getSubjectXMP(pdf)
{
  var r = caml_jsstring_of_string(cpdf.cpdflib.getSubjectXMP(pdf));
  return r;
}

function getKeywordsXMP(pdf)
{
  var r = caml_jsstring_of_string(cpdf.cpdflib.getKeywordsXMP(pdf));
  return r;
}

function getCreatorXMP(pdf)
{
  var r = caml_jsstring_of_string(cpdf.cpdflib.getCreatorXMP(pdf));
  return r;
}

function getProducerXMP(pdf)
{
  var r = caml_jsstring_of_string(cpdf.cpdflib.getProducerXMP(pdf));
  return r;
}

function getCreationDateXMP(pdf)
{
  var r = caml_jsstring_of_string(cpdf.cpdflib.getCreationDateXMP(pdf));
  return r;
}

function getModificationDateXMP(pdf)
{
  var r = caml_jsstring_of_string(cpdf.cpdflib.getModificationDateXMP(pdf));
  return r;
}

function setTitle(pdf, s)
{
  cpdf.cpdflib.setTitle(pdf, caml_string_of_jsstring(s));
}

function setAuthor(pdf, s)
{
  cpdf.cpdflib.setAuthor(pdf, caml_string_of_jsstring(s));
}

function setSubject(pdf, s)
{
  cpdf.cpdflib.setSubject(pdf, caml_string_of_jsstring(s));
}

function setKeywords(pdf, s)
{
  cpdf.cpdflib.setKeywords(pdf, caml_string_of_jsstring(s));
}

function setCreator(pdf, s)
{
  cpdf.cpdflib.setCreator(pdf, caml_string_of_jsstring(s));
}

function setProducer(pdf, s)
{
  cpdf.cpdflib.setProducer(pdf, caml_string_of_jsstring(s));
}

function setCreationDate(pdf, s)
{
  cpdf.cpdflib.setCreationDate(pdf, caml_string_of_jsstring(s));
}

function setModificationDate(pdf, s)
{
  cpdf.cpdflib.setModificationDate(pdf, caml_string_of_jsstring(s));
}

function setTitleXMP(pdf, s)
{
  cpdf.cpdflib.setTitleXMP(pdf, caml_string_of_jsstring(s));
}

function setAuthorXMP(pdf, s)
{
  cpdf.cpdflib.setAuthorXMP(pdf, caml_string_of_jsstring(s));
}

function setSubjectXMP(pdf, s)
{
  cpdf.cpdflib.setSubjectXMP(pdf, caml_string_of_jsstring(s));
}

function setKeywordsXMP(pdf, s)
{
  cpdf.cpdflib.setKeywordsXMP(pdf, caml_string_of_jsstring(s));
}

function setCreatorXMP(pdf, s)
{
  cpdf.cpdflib.setCreatorXMP(pdf, caml_string_of_jsstring(s));
}

function setProducerXMP(pdf, s)
{
  cpdf.cpdflib.setProducerXMP(pdf, caml_string_of_jsstring(s));
}

function setCreationDateXMP(pdf, s)
{
  cpdf.cpdflib.setCreationDateXMP(pdf, caml_string_of_jsstring(s));
}

function setModificationDateXMP(pdf, s)
{
  cpdf.cpdflib.setModificationDateXMP(pdf, caml_string_of_jsstring(s));
}

var decimalArabic = 0;
var uppercaseRoman = 1;
var lowercaseRoman = 2;
var uppercaseLetters = 3;
var lowercaseLetters = 4;

function addPageLabels(pdf, style, prefix, a, range, b)
{
  cpdf.cpdflib.addPageLabels(pdf, style, caml_string_of_jsstring(prefix), a, range, b);
}

function removePageLabels(pdf)
{
  cpdf.cpdflib.removePageLabels(pdf);
}

function startGetPageLabels(pdf)
{
  var r = cpdf.cpdflib.startGetPageLabels(pdf);
  return r;
}

function getPageLabelStyle(n)
{
  var r = cpdf.cpdflib.getPageLabelStyle(n);
  return r;
}

function getPageLabelPrefix(n)
{
  var r = caml_jsstring_of_string(cpdf.cpdflib.getPageLabelPrefix(n));
  return r;
}

function getPageLabelOffset(n)
{
  var r = cpdf.cpdflib.getPageLabelOffset(n);
  return r;
}

function getPageLabelRange(n)
{
  var r = cpdf.cpdflib.getPageLabelRange(n);
  return r;
}

function endGetPageLabels()
{
  cpdf.cpdflib.endGetPageLabels();
}

function getPageLabelStringForPage(pdf, pagenumber)
{
  var r = cpdf.cpdflib.getPageLabelStringForPage(pdf, pagenumber);
  return r;
}

function getDateComponents(string, arr)
{
  var r = cpdf.cpdflib.getDateComponents(caml_string_of_jsstring(string));
  arr[0] = r[1];
  arr[1] = r[2];
  arr[2] = r[3];
  arr[3] = r[4];
  arr[4] = r[5];
  arr[5] = r[6];
  arr[6] = r[7];
  arr[7] = r[8];
}

function dateStringOfComponents(a, b, c, d, e, f, g, h)
{
  var r = caml_jsstring_of_string(cpdf.cpdflib.dateStringOfComponents(a, b, c, d, e, f, g, h));
  return r;
}

function hasBox(pdf, page, box)
{
  var r = cpdf.cpdflib.hasBox(pdf, page, caml_string_of_jsstring(box));
  return r;
}

function getPageRotation(pdf, page)
{
  var r = cpdf.cpdflib.getPageRotation(pdf, page);
  return r;
}

function setMediabox(pdf, range, a, b, c, d)
{
  cpdf.cpdflib.setMediabox(pdf, range, a, b, c, d);
}

function setCropBox(pdf, range, a, b, c, d)
{
  cpdf.cpdflib.setCropBox(pdf, range, a, b, c, d);
}

function setTrimBox(pdf, range, a, b, c, d)
{
  cpdf.cpdflib.setTrimBox(pdf, range, a, b, c, d);
}

function setBleedBox(pdf, range, a, b, c, d)
{
  cpdf.cpdflib.setBleedBox(pdf, range, a, b, c, d);
}

function setArtBox(pdf, range, a, b, c, d)
{
  cpdf.cpdflib.setArtBox(pdf, range, a, b, c, d);
}

function markTrapped(pdf)
{
  cpdf.cpdflib.markTrapped(pdf);
}

function markUntrapped(pdf)
{
  cpdf.cpdflib.markUntrapped(pdf);
}

function markTrappedXMP(pdf)
{
  cpdf.cpdflib.markTrappedXMP(pdf);
}

function markUntrappedXMP(pdf)
{
  cpdf.cpdflib.markUntrappedXMP(pdf);
}

var singlePage = 0;
var oneColumn = 1;
var twoColumnLeft = 2;
var twoColumnRight = 3;
var twoPageLeft = 4;
var twoPageRight = 5;
  
var useNone = 0;
var useOutlines = 1;
var useThumbs = 2;
var useOC = 3;
var useAttachments = 4;

function setPageLayout(pdf, layout)
{
  cpdf.cpdflib.setPageLayout(pdf, layout);
}

function setPageMode(pdf, mode)
{
  cpdf.cpdflib.setPageMode(pdf, mode);
}

function hideToolbar(pdf, a)
{
  cpdf.cpdflib.hideToolbar(pdf, a);
}

function hideMenubar(pdf, a)
{
  cpdf.cpdflib.hideMenubar(pdf, a);
}

function hideWindowUi(pdf, a)
{
  cpdf.cpdflib.hideWindowUi(pdf, a);
}

function fitWindow(pdf, a)
{
  cpdf.cpdflib.fitWindow(pdf, a);
}

function centerWindow(pdf, a)
{
  cpdf.cpdflib.centerWindow(pdf, a);
}

function displayDocTitle(pdf, a)
{
  cpdf.cpdflib.displayDocTitle(pdf, a);
}

function openAtPage(pdf, a, pagenumber)
{
  cpdf.cpdflib.openAtPage(pdf, a, pagenumber);
}

function getMediaBox(pdf, page, a)
{
  var r = cpdf.cpdflib.getMediaBox(pdf, page, a);
  a[0] = r[1];
  a[1] = r[2];
  a[2] = r[3];
  a[3] = r[4];
}

function getCropBox(pdf, page, a)
{
  //FIXME
}

function getArtBox(pdf, page, a)
{
  //FIXME
}

function getBleedBox(pdf, page, a)
{
  //FIXME
}

function getTrimBox(pdf, page, a)
{
  //FIXME
}

function setMetadataFromFile(pdf, filename)
{
  cpdf.cpdflib.setMetadataFromFile(pdf, caml_string_of_jsstring(filename));
}

function getMetadata(pdf)
{
  var r = cpdf.cpdflib.getMetadata(pdf);
  return r.data;
}

function removeMetadata(pdf)
{
  cpdf.cpdflib.removeMetadata(pdf);
}

function createMetadata(pdf)
{
  cpdf.cpdflib.createMetadata(pdf);
}

function setMetadataDate(pdf, date)
{
  cpdf.cpdflib.setMetadataDate(pdf, caml_string_of_jsstring(date));
}

function setMetadataFromByteArray(pdf, arr)
{
  //cpdf.cpdflib.setMetadataFromByteArray
  //FIXME
}

var timesRoman = 0;
var timesBold = 1;
var timesItalic = 2;
var timesBoldItalic = 3;
var helvetica = 4;
var helveticaBold = 5;
var helveticaOblique = 6;
var helveticaBoldOblique = 7;
var courier = 8;
var courierBold = 9;
var courierOblique = 10;
var courierBoldOblique = 11;

var posCentre = 0;
var posLeft = 1;
var posRight = 2;
var top = 3;
var topLeft = 4;
var topRight = 5;
var left = 6;
var bottomLeft = 7;
var bottom = 8;
var bottomRight = 9;
var right = 10;
var diagonal = 11;
var reversediagonal = 12;

module.exports =
  {
  //Enums
  posCentre,
  posLeft,
  posRight,
  top,
  topLeft,
  topRight,
  left,
  bottomLeft,
  bottom,
  bottomRight,
  right,
  diagonal,
  reversediagonal,
  timesRoman,
  timesBold,
  timesItalic,
  timesBoldItalic,
  helvetica,
  helveticaBold,
  helveticaOblique,
  helveticaBoldOblique,
  courier,
  courierBold,
  courierOblique,
  courierBoldOblique,
  decimalArabic,
  uppercaseRoman,
  lowercaseRoman,
  uppercaseLetters,
  lowercaseLetters,
  singlePage,
  oneColumn,
  twoColumnLeft,
  twoColumnRight,
  twoPageLeft,
  twoPageRight,
  useNone,
  useOutlines,
  useThumbs,
  useOC,
  useAttachments,
  leftJustify,
  centreJustify,
  rightJustify,
  a0portrait,
  a1portrait,
  a2portrait,
  a3portrait,
  a4portrait,
  a5portrait,
  a0landscape,
  a1landscape,
  a2landscape,
  a3landscape,
  a4landscape,
  a5landscape,
  usletterportrait,
  usletterlandscape,
  uslegalportrait,
  uslegallandscape,
  noEdit,
  noPrint,
  noCopy,
  noAnnot,
  noForms,
  noExtract,
  noAssemble,
  noHqPrint,
  pdf40bit,
  pdf128bit,
  aes128bitfalse,
  aes128bittrue,
  aes256bitfalse,
  aes256bittrue,
  aes256bitisofalse,
  aes256bitisotrue,

  //CHAPTER 1. Basics
  setFast,
  setSlow,
  version,
  startEnumeratePDFs,
  enumeratePDFsKey,
  enumeratePDFsInfo,
  endEnumeratePDFs,
  parsePagespec,
  stringOfPagespec,
  validatePagespec,
  ptOfCm,
  ptOfMm,
  ptOfIn,
  cmOfPt,
  mmOfPt,
  inOfPt,
  range,
  blankRange,
  all,
  even,
  odd,
  rangeUnion,
  rangeAdd,
  difference,
  removeDuplicates,
  rangeLength,
  isInRange,
  rangeGet,
  fromFile,
  fromFileLazy,
  toMemory,
  fromMemory,
  fromMemoryLazy,
  toFile,
  toFileExt,
  toFileEncrypted,
  toFileEncryptedExt,
  pages,
  pagesFast,
  isEncrypted,
  decryptPdf,
  decryptPdfOwner,
  hasPermission,
  encryptionKind,

  //CHAPTER 2. Merging and Splitting
  mergeSimple,
  merge,
  mergeSame,
  selectPages,

  //CHAPTER 3. Pages
  scalePages,
  scaleToFit,
  scaleToFitPaper,
  scaleContents,
  shiftContents,
  rotate,
  rotateBy,
  rotateContents,
  upright,
  hFlip,
  vFlip,
  crop,
  setMediabox,
  setCropBox,
  setTrimBox,
  setArtBox,
  setBleedBox,
  getMediaBox,
  getCropBox,
  getArtBox,
  getBleedBox,
  getTrimBox,
  removeCrop,
  removeArt,
  removeTrim,
  removeBleed,
  hardBox,
  trimMarks,
  showBoxes,

  //CHAPTER 4. Encryption and Decryption

  //CHAPTER 5. Compression
  compress,
  decompress,
  squeezeInMemory,

  //CHAPTER 6. Bookmarks
  startGetBookmarkInfo,
  endGetBookmarkInfo,
  numberBookmarks,
  getBookmarkPage,
  getBookmarkLevel,
  getBookmarkText,
  getBookmarkOpenStatus,
  startSetBookmarkInfo,
  endSetBookmarkInfo,
  setBookmarkPage,
  setBookmarkLevel,
  setBookmarkText,
  setBookmarkOpenStatus,
  getBookmarksJSON,
  setBookmarksJSON,
  tableOfContents,

  //CHAPTER 7. Presentations

  //CHAPTER 8. Logos, Watermarks and Stamps
  stampOn,
  stampUnder,
  stampExtended,
  combinePages,
  addText,
  addTextSimple,
  textWidth,
  removeText,
  addContent,
  stampAsXObject,

  //CHAPTER 9. Multipage facilities
  twoUp,
  twoUpStack,
  impose,
  padBefore,
  padAfter,
  padEvery,
  padMultiple,
  padMultipleBefore,

  //CHAPTER 10. Annotations
  annotationsJSON,

  //CHAPTER 11. Document Information and Metadata
  getVersion,
  getMajorVersion,
  isLinearized,
  getTitle,
  getAuthor,
  getSubject,
  getKeywords,
  getCreator,
  getProducer,
  getCreationDate,
  getModificationDate,
  getTitleXMP,
  getAuthorXMP,
  getSubjectXMP,
  getKeywordsXMP,
  getCreatorXMP,
  getProducerXMP,
  getCreationDateXMP,
  getModificationDateXMP,
  setTitle,
  setAuthor,
  setSubject,
  setKeywords,
  setCreator,
  setProducer,
  setCreationDate,
  setModificationDate,
  setTitleXMP,
  setAuthorXMP,
  setSubjectXMP,
  setKeywordsXMP,
  setCreatorXMP,
  setProducerXMP,
  setCreationDateXMP,
  setModificationDateXMP,
  getDateComponents,
  dateStringOfComponents,
  markTrapped,
  markUntrapped,
  markTrappedXMP,
  markUntrappedXMP,
  hasBox,
  getPageRotation,
  setPageLayout,
  setPageMode,
  hideToolbar,
  hideMenubar,
  hideWindowUi,
  fitWindow,
  centerWindow,
  displayDocTitle,
  openAtPage,
  setMetadataFromFile,
  setMetadataFromByteArray,
  getMetadata,
  removeMetadata,
  createMetadata,
  setMetadataDate,
  addPageLabels,
  removePageLabels,
  startGetPageLabels,
  getPageLabelStyle,
  getPageLabelPrefix,
  getPageLabelOffset,
  getPageLabelRange,
  endGetPageLabels,
  getPageLabelStringForPage,

  //CHAPTER 12. File Attachments
  attachFile,
  attachFileToPage,
  attachFileFromMemory,
  attachFileToPageFromMemory,
  removeAttachedFiles,
  startGetAttachments,
  endGetAttachments,
  numberGetAttachments,
  getAttachmentName,
  getAttachmentPage,
  getAttachmentData,

  //CHAPTER 13. Images
  startGetImageResolution,
  getImageResolutionPageNumber,
  getImageResolutionImageName,
  getImageResolutionXPixels,
  getImageResolutionYPixels,
  getImageResolutionXRes,
  getImageResolutionYRes,
  endGetImageResolution,

  //CHAPTER 14. Fonts
  numberFonts,
  getFontPage,
  getFontName,
  getFontType,
  getFontEncoding,
  startGetFontInfo,
  endGetFontInfo,
  copyFont,
  removeFonts,
  
  //CHAPTER 15. PDF and JSON
  outputJSON,
  outputJSONMemory,
  fromJSON,
  fromJSONMemory,
  
  //CHAPTER 16. Optional Content Groups
  startGetOCGList,
  ocgListEntry,
  endGetOCGList,
  ocgCoalesce,
  ocgRename,
  ocgOrderAll,

  //CHAPTER 17. Creating New PDFs
  blankDocument,
  blankDocumentPaper,
  textToPDF,
  textToPDFPaper,

  //CHAPTER 18. Miscellaneous
  draft,
  removeAllText,
  blackText,
  blackLines,
  blackFills,
  thinLines,
  copyId,
  removeId,
  setVersion,
  setFullVersion,
  removeDictEntry,
  removeDictEntrySearch,
  replaceDictEntry,
  replaceDictEntrySearch,
  getDictEntries,
  removeClipping
};
