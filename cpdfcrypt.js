//Provides: camlpdf_caml_aes_cook_encrypt_key 
function camlpdf_caml_aes_cook_encrypt_key(s)
{
  console.log('camlpdf_caml_aes_cook_decrypt_key');
  return s;
}

//This has to do rijndaelKeySetupDec(cooked_key, key, 8 * length(key))

//Provides: camlpdf_caml_aes_cook_decrypt_key 
function camlpdf_caml_aes_cook_decrypt_key(s)
{
  console.log(s);
  var key = sjcl.codec.base64.toBits('foo');
  console.log(globalThis);
  console.log('camlpdf_caml_aes_cook_decrypt_key');
  return s;
}

//Provides: camlpdf_caml_aes_encrypt
function camlpdf_caml_aes_encrypt(s, bs, i, bs2, i2)
{
  console.log('camlpdf_caml_aes_encrypt');
}

//This has to do rijndaelDecrypt(ckey, ???, src, dst)

//Provides: camlpdf_caml_aes_decrypt
function camlpdf_caml_aes_decrypt(ckey, src, src_ofs, dst, dst_ofs)
{
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
