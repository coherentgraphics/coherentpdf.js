//Provides: camlpdf_caml_zlib_decompress
function camlpdf_caml_zlib_decompress(s)
{
  var s2 = caml_array_of_bytes(s);
  //var output = pako.inflate(s2);
  var output = zlib.inflateSync(s2);
  return caml_bytes_of_array(output);
}

//Provides: camlpdf_caml_zlib_compress
function camlpdf_caml_zlib_compress(s)
{
  var s2 = caml_array_of_bytes(s);
  //var output = pako.deflate(s2);
  var output = zlib.deflateSync(s2);
  return caml_bytes_of_array(output);
}

//Provides camlpdf_caml_zlib_decompress_streaming
