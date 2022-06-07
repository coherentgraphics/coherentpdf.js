//Provides: camlpdf_caml_aes_cook_encrypt_key 
//Requires: camlpdf_caml_aes_cook_decrypt_key 
function camlpdf_caml_aes_cook_encrypt_key(s)
{
  //console.log('camlpdf_caml_aes_cook_encrypt_key');
  return camlpdf_caml_aes_cook_decrypt_key(s);
}

//The aes cipher. We set it up in camlpdf_caml_aes_cook_decrypt_key, but store
//it here. The "cooked key" handed back to OCaml is junk and will be ignored
//when sent to camlpdf_caml_aes_decrypt.
var cpdf_aes;

//Provides: camlpdf_caml_aes_cook_decrypt_key
//Requires: caml_array_of_bytes
//Requires: caml_bytes_of_array
function camlpdf_caml_aes_cook_decrypt_key(s)
{
  //console.log('camlpdf_caml_aes_cook_decrypt_key');
  var s2 = caml_array_of_bytes(s);
  var key = cpdf_sjcl.codec.bytes.toBits(s2);
  cpdf_aes = new cpdf_sjcl.cipher.aes(key);
  var ba2 = Uint8Array.from(s2);
  return caml_bytes_of_array(ba2);
}

//Provides: camlpdf_caml_aes_encrypt
//Requires: caml_array_of_bytes
function camlpdf_caml_aes_encrypt(ckey, src, src_ofs, dst, dst_ofs)
{
  //console.log('camlpdf_caml_aes_encrypt');
  var srcbytes = caml_array_of_bytes(src);
  var srcbits = cpdf_sjcl.codec.bytes.toBits(srcbytes);
  var encrypted = cpdf_aes.encrypt(srcbits);
  dst.t = 4;
  dst.c = cpdf_sjcl.codec.bytes.fromBits(encrypted);
  dst.l = src.l;
}

//Provides: camlpdf_caml_aes_decrypt
//Requires: caml_array_of_bytes
//ckey is irrelevant here, since stored in global cpdf_aes above
function camlpdf_caml_aes_decrypt(ckey, src, src_ofs, dst, dst_ofs)
{
  //console.log('camlpdf_caml_aes_decrypt');
  var srcbytes = caml_array_of_bytes(src);
  var srcbits = cpdf_sjcl.codec.bytes.toBits(srcbytes);
  var plaintext = cpdf_aes.decrypt(srcbits);
  dst.t = 4;
  dst.c = cpdf_sjcl.codec.bytes.fromBits(plaintext);
  dst.l = src.l;
}

//Provides: camlpdf_caml_sha256
//Requires: caml_bytes_of_array
//Requires: caml_array_of_bytes
function camlpdf_caml_sha256(src)
{ 
  //console.log('camlpdf_caml_sha256');
  var hash = cpdf_crypto.createHash('sha256').update(caml_array_of_bytes(src));
  var hashedbytes = hash.digest().buffer;
  var arr = new Uint8Array(hashedbytes);
  var r = caml_bytes_of_array(arr);
  return r;
}

//Provides: camlpdf_caml_sha384
//Requires: caml_bytes_of_array
//Requires: caml_array_of_bytes
function camlpdf_caml_sha384(src)
{
  //console.log('camlpdf_caml_sha384');
  var hash = cpdf_crypto.createHash('sha384').update(caml_array_of_bytes(src));
  var hashedbytes = hash.digest().buffer;
  var arr = new Uint8Array(hashedbytes);
  var r = caml_bytes_of_array(arr);
  return r;
}

//Provides: camlpdf_caml_sha512
//Requires: caml_bytes_of_array
//Requires: caml_array_of_bytes
function camlpdf_caml_sha512(src)
{
  //console.log('camlpdf_caml_sha512');
  var hash = cpdf_crypto.createHash('sha512').update(caml_array_of_bytes(src));
  var hashedbytes = hash.digest().buffer;
  var arr = new Uint8Array(hashedbytes);
  var r = caml_bytes_of_array(arr);
  return r;
}
