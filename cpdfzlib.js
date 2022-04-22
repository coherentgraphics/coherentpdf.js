//Provides: camlpdf_caml_zlib_decompress
function camlpdf_caml_zlib_decompress(s)
{
  //FIXME Add error handling. How does js_of_ocaml do it?
  console.log('camlpdf_caml_zlib_decompress');
  var s2 = caml_array_of_bytes(s);
  console.log(globalThis);
  var output = pako.inflate(s2);
  return caml_bytes_of_array(output);
}

//Provides camlpdf_caml_zlib_compress

//Provides camlpdf_caml_zlib_decompress_streaming
