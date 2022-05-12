//Provides: camlpdf_caml_zlib_decompress
//Requires: caml_bytes_of_array
//Requires: caml_array_of_bytes
function camlpdf_caml_zlib_decompress(s)
{
  var s2 = caml_array_of_bytes(s);
  var output = zlib.inflateSync(s2);
  return caml_bytes_of_array(output);
}

//Provides: camlpdf_caml_zlib_compress
//Requires: caml_bytes_of_array
//Requires: caml_array_of_bytes
function camlpdf_caml_zlib_compress(s)
{
  var s2 = caml_array_of_bytes(s);
  var output = zlib.deflateSync(s2);
  return caml_bytes_of_array(output);
}

//Provides: camlpdf_camlzip_inflateInit
function camlpdf_camlzip_inflateInit(b)
{
  console.log("Cpdf.js does not currently support inline images compressed with zlib. Contact the author if this is a problem.");
}

//Provides: camlpdf_camlzip_inflateEnd
function camlpdf_camlzip_inflateEnd(a, b, c, d, e, f, g, h)
{
  console.log("Cpdf.js does not currently support inline images compressed with zlib. Contact the author if this is a problem.");
}

//Provides: camlpdf_camlzip_inflate_bytecode
function camlpdf_camlzip_inflate_bytecode(b)
{
  console.log("Cpdf.js does not currently support inline images compressed with zlib. Contact the author if this is a problem.");
}
