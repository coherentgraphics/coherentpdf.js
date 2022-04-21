//Provides: camlpdf_caml_aes_cook_encrypt_key 
function camlpdf_caml_aes_cook_encrypt_key(s)
{
  console.log('camlpdf_caml_aes_cook_decrypt_key');
  return s;
}

//The aes cipher. We set it up in camlpdf_caml_aes_cook_decrypt_key, but store
//it here. The "cooked key" handed back to OCaml is junk and will be ignored
//when sent to camlpdf_caml_aes_decrypt.
var cpdf_aes;

//Provides: camlpdf_caml_aes_cook_decrypt_key
function camlpdf_caml_aes_cook_decrypt_key(s)
{
  var s2 = caml_array_of_bytes(s);
  var key = sjcl.codec.bytes.toBits(s2);
  cpdf_aes = new sjcl.cipher.aes(key);
  var ba2 = Uint8Array.from(s2);
  return caml_bytes_of_array(ba2);
}

//Provides: camlpdf_caml_aes_encrypt
function camlpdf_caml_aes_encrypt(s, bs, i, bs2, i2)
{
  console.log('camlpdf_caml_aes_encrypt');
}

//Provides: camlpdf_caml_aes_decrypt
function camlpdf_caml_aes_decrypt(ckey, src, src_ofs, dst, dst_ofs)
{
  console.log(cpdf_aes);
  console.log(src, src_ofs, dst, dst_ofs);
  console.log('camlpdf_caml_aes_decrypt');
}

//Provides: camlpdf_caml_sha256
function camlpdf_caml_sha256(s)
{ 
  console.log('camlpdf_caml_sha256');
  return s;
}

//Provides: camlpdf_caml_sha384
function camlpdf_caml_sha384(s)
{
  console.log('camlpdf_caml_sha384');
  return s;
}

//Provides: camlpdf_caml_sha512
function camlpdf_caml_sha512(s)
{
  console.log('camlpdf_caml_sha512');
  return s;
}
