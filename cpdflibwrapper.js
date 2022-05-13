"use strict";

// Js_of_ocaml runtime support
// http://www.ocsigen.org/js_of_ocaml/
// Copyright (C) 2014 Jérôme Vouillon, Hugo Heuzard, Andy Ray
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
//
// Bigarray.
//
// - all bigarray types including Int64 and Complex.
// - fortran + c layouts
// - sub/slice/reshape
// - retain fast path for 1d array access

function caml_ba_init() {
  return 0;
}

function caml_ba_get_size(dims) {
  var n_dims = dims.length;
  var size = 1;
  for (var i = 0; i < n_dims; i++) {
    if (dims[i] < 0)
      caml_invalid_argument("Bigarray.create: negative dimension");
    size = size * dims[i];
  }
  return size;
}

function caml_ba_get_size_per_element(kind){
  switch(kind){
  case 7: case 10: case 11: return 2;
  default: return 1;
  }
}

function caml_ba_create_buffer(kind, size){
  var g = globalThis;
  var view;
  switch(kind){
  case 0:  view = g.Float32Array; break;
  case 1:  view = g.Float64Array; break;
  case 2:  view = g.Int8Array; break;
  case 3:  view = g.Uint8Array; break;
  case 4:  view = g.Int16Array; break;
  case 5:  view = g.Uint16Array; break;
  case 6:  view = g.Int32Array; break;
  case 7:  view = g.Int32Array; break;
  case 8:  view = g.Int32Array; break;
  case 9:  view = g.Int32Array; break;
  case 10: view = g.Float32Array; break;
  case 11: view = g.Float64Array; break;
  case 12: view = g.Uint8Array; break;
  }
  if (!view) caml_invalid_argument("Bigarray.create: unsupported kind");
  var data = new view(size * caml_ba_get_size_per_element(kind));
  return data;
}

var caml_ba_custom_name = "_bigarray"

var caml_ba_custom_name = "_bigarr02"

function Ml_Bigarray (kind, layout, dims, buffer) {

  this.kind   = kind ;
  this.layout = layout;
  this.dims   = dims;
  this.data = buffer;
}

Ml_Bigarray.prototype.caml_custom = caml_ba_custom_name;

Ml_Bigarray.prototype.offset = function (arg) {
  var ofs = 0;
  if(typeof arg === "number") arg = [arg];
  if (! (arg instanceof Array)) caml_invalid_argument("bigarray.js: invalid offset");
  if (this.dims.length != arg.length)
    caml_invalid_argument("Bigarray.get/set: bad number of dimensions");
  if(this.layout == 0 /* c_layout */) {
    for (var i = 0; i < this.dims.length; i++) {
      if (arg[i] < 0 || arg[i] >= this.dims[i])
        caml_array_bound_error();
      ofs = (ofs * this.dims[i]) + arg[i];
    }
  } else {
    for (var i = this.dims.length - 1; i >= 0; i--) {
      if (arg[i] < 1 || arg[i] > this.dims[i]){
        caml_array_bound_error();
      }
      ofs = (ofs * this.dims[i]) + (arg[i] - 1);
    }
  }
  return ofs;
}

Ml_Bigarray.prototype.get = function (ofs) {
  switch(this.kind){
  case 7:
    // Int64
    var l = this.data[ofs * 2 + 0];
    var h = this.data[ofs * 2 + 1];
    return caml_int64_create_lo_hi(l,h);
  case 10: case 11:
    // Complex32, Complex64
    var r = this.data[ofs * 2 + 0];
    var i = this.data[ofs * 2 + 1];
    return [254, r, i];
  default:
    return this.data[ofs]
  }
}

Ml_Bigarray.prototype.set = function (ofs,v) {
  switch(this.kind){
  case 7:
    // Int64
    this.data[ofs * 2 + 0] = caml_int64_lo32(v);
    this.data[ofs * 2 + 1] = caml_int64_hi32(v);
    break;
  case 10: case 11:
    // Complex32, Complex64
    this.data[ofs * 2 + 0] = v[1];
    this.data[ofs * 2 + 1] = v[2];
    break;
  default:
    this.data[ofs] = v;
    break;
  }
  return 0
}


Ml_Bigarray.prototype.fill = function (v) {
  switch(this.kind){
  case 7:
    // Int64
    var a = caml_int64_lo32(v);
    var b = caml_int64_hi32(v);
    if(a == b){
      this.data.fill(a);
    }
    else {
      for(var i = 0; i<this.data.length; i++){
        this.data[i] = (i%2 == 0) ? a : b;
      }
    }
    break;
  case 10: case 11:
    // Complex32, Complex64
    var im = v[1];
    var re = v[2];
    if(im == re){
      this.data.fill(im);
    }
    else {
      for(var i = 0; i<this.data.length; i++){
        this.data[i] = (i%2 == 0) ? im : re;
      }
    }
    break;
  default:
    this.data.fill(v);
    break;
  }
}


Ml_Bigarray.prototype.compare = function (b, total) {
  if (this.layout != b.layout || this.kind != b.kind) {
    var k1 = this.kind | (this.layout << 8);
    var k2 =    b.kind | (b.layout << 8);
    return k2 - k1;
  }
  if (this.dims.length != b.dims.length) {
    return b.dims.length - this.dims.length;
  }
  for (var i = 0; i < this.dims.length; i++)
    if (this.dims[i] != b.dims[i])
      return (this.dims[i] < b.dims[i]) ? -1 : 1;
  switch (this.kind) {
  case 0:
  case 1:
  case 10:
  case 11:
    // Floats
    var x, y;
    for (var i = 0; i < this.data.length; i++) {
      x = this.data[i];
      y = b.data[i];
      if (x < y)
        return -1;
      if (x > y)
        return 1;
      if (x != y) {
        if (!total) return NaN;
        if (x == x) return 1;
        if (y == y) return -1;
      }
    }
    break;
  case 7:
    // Int64
    for (var i = 0; i < this.data.length; i+=2) {
      // Check highest bits first
      if (this.data[i+1] < b.data[i+1])
        return -1;
      if (this.data[i+1] > b.data[i+1])
        return 1;
      if ((this.data[i] >>> 0) < (b.data[i] >>> 0))
        return -1;
      if ((this.data[i] >>> 0) > (b.data[i] >>> 0))
        return 1;
    }
    break;
  case 2:
  case 3:
  case 4:
  case 5:
  case 6:
  case 8:
  case 9:
  case 12:
    for (var i = 0; i < this.data.length; i++) {
      if (this.data[i] < b.data[i])
        return -1;
      if (this.data[i] > b.data[i])
        return 1;
    }
    break;
  }
  return 0;
}

function Ml_Bigarray_c_1_1(kind, layout, dims, buffer) {
  this.kind   = kind ;
  this.layout = layout;
  this.dims   = dims;
  this.data   = buffer;
}

Ml_Bigarray_c_1_1.prototype = new Ml_Bigarray()
Ml_Bigarray_c_1_1.prototype.offset = function (arg) {
  if(typeof arg !== "number"){
    if((arg instanceof Array) && arg.length == 1)
      arg = arg[0];
    else caml_invalid_argument("Ml_Bigarray_c_1_1.offset");
  }
  if (arg < 0 || arg >= this.dims[0])
    caml_array_bound_error();
  return arg;
}

Ml_Bigarray_c_1_1.prototype.get = function (ofs) {
  return this.data[ofs];
}

Ml_Bigarray_c_1_1.prototype.set = function (ofs,v) {
  this.data[ofs] = v;
  return 0
}

Ml_Bigarray_c_1_1.prototype.fill = function (v) {
  this.data.fill(v);
  return 0
}

function caml_ba_compare(a,b,total){
  return a.compare(b,total)
}

function caml_ba_create_unsafe(kind, layout, dims, data){
  var size_per_element = caml_ba_get_size_per_element(kind);
  if(caml_ba_get_size(dims) * size_per_element != data.length) {
    caml_invalid_argument("length doesn't match dims");
  }
  if(layout == 0 && // c_layout
     dims.length == 1 && // Array1
     size_per_element == 1) // 1-to-1 mapping
    return new Ml_Bigarray_c_1_1(kind, layout, dims, data);
  return new Ml_Bigarray(kind, layout, dims, data);

}


function caml_ba_create(kind, layout, dims_ml) {
  var dims = caml_js_from_array(dims_ml);
  var data = caml_ba_create_buffer(kind, caml_ba_get_size(dims));
  return caml_ba_create_unsafe(kind, layout, dims, data);
}

function caml_ba_change_layout(ba, layout) {
  if(ba.layout == layout) return ba;
  var new_dims = []
  for(var i = 0; i < ba.dims.length; i++) new_dims[i] = ba.dims[ba.dims.length - i - 1];
  return caml_ba_create_unsafe(ba.kind, layout, new_dims, ba.data);
}

function caml_ba_kind(ba) {
  return ba.kind;
}

function caml_ba_layout(ba) {
  return ba.layout;
}

function caml_ba_num_dims(ba) {
  return ba.dims.length;
}

function caml_ba_dim(ba, i) {
  if (i < 0 || i >= ba.dims.length)
    caml_invalid_argument("Bigarray.dim");
  return ba.dims[i];
}

function caml_ba_dim_1(ba) {
  return caml_ba_dim(ba, 0);
}

function caml_ba_dim_2(ba) {
  return caml_ba_dim(ba, 1);
}

function caml_ba_dim_3(ba) {
  return caml_ba_dim(ba, 2);
}

function caml_ba_get_generic(ba, i) {
  var ofs = ba.offset(caml_js_from_array(i));
  return ba.get(ofs);
}

function caml_ba_uint8_get16(ba, i0) {
  var ofs = ba.offset(i0);
  if(ofs + 1 >= ba.data.length) caml_array_bound_error();
  var b1 = ba.get(ofs);
  var b2 = ba.get(ofs + 1);
  return (b1 | (b2 << 8));
}

function caml_ba_uint8_get32(ba, i0) {
  var ofs = ba.offset(i0);
  if(ofs + 3 >= ba.data.length) caml_array_bound_error();
  var b1 = ba.get(ofs+0);
  var b2 = ba.get(ofs+1);
  var b3 = ba.get(ofs+2);
  var b4 = ba.get(ofs+3);
  return ( (b1 << 0)  |
           (b2 << 8)  |
           (b3 << 16) |
           (b4 << 24) );
}

function caml_ba_uint8_get64(ba, i0) {
  var ofs = ba.offset(i0);
  if(ofs + 7 >= ba.data.length) caml_array_bound_error();
  var b1 = ba.get(ofs+0);
  var b2 = ba.get(ofs+1);
  var b3 = ba.get(ofs+2);
  var b4 = ba.get(ofs+3);
  var b5 = ba.get(ofs+4);
  var b6 = ba.get(ofs+5);
  var b7 = ba.get(ofs+6);
  var b8 = ba.get(ofs+7);
  return caml_int64_of_bytes([b8,b7,b6,b5,b4,b3,b2,b1]);
}

function caml_ba_get_1(ba, i0) {
  return ba.get(ba.offset(i0));
}

function caml_ba_get_2(ba, i0, i1) {
  return ba.get(ba.offset([i0,i1]));
}

function caml_ba_get_3(ba, i0, i1, i2) {
  return ba.get(ba.offset([i0,i1,i2]));
}

function caml_ba_set_generic(ba, i, v) {
  ba.set(ba.offset(caml_js_from_array(i)), v);
  return 0
}

function caml_ba_uint8_set16(ba, i0, v) {
  var ofs = ba.offset(i0);
  if(ofs + 1 >= ba.data.length) caml_array_bound_error();
  ba.set(ofs+0,  v        & 0xff);
  ba.set(ofs+1, (v >>> 8) & 0xff);
  return 0;
}

function caml_ba_uint8_set32(ba, i0, v) {
  var ofs = ba.offset(i0);
  if(ofs + 3 >= ba.data.length) caml_array_bound_error();
  ba.set(ofs+0,  v         & 0xff);
  ba.set(ofs+1, (v >>> 8)  & 0xff);
  ba.set(ofs+2, (v >>> 16) & 0xff);
  ba.set(ofs+3, (v >>> 24) & 0xff);
  return 0;
}

function caml_ba_uint8_set64(ba, i0, v) {
  var ofs = ba.offset(i0);
  if(ofs + 7 >= ba.data.length) caml_array_bound_error();
  var v = caml_int64_to_bytes(v);
  for(var i = 0; i < 8; i++) ba.set(ofs+i, v[7-i])
  return 0;
}

function caml_ba_set_1(ba, i0, v) {
  ba.set(ba.offset(i0), v);
  return 0
}

function caml_ba_set_2(ba, i0, i1, v) {
  ba.set(ba.offset([i0,i1]), v);
  return 0;
}

function caml_ba_set_3(ba, i0, i1, i2, v) {
  ba.set(ba.offset([i0,i1,i2]), v);
  return 0;
}

function caml_ba_fill(ba, v) {
  ba.fill(v);
  return 0;
}

function caml_ba_blit(src, dst) {
  if (dst.dims.length != src.dims.length)
    caml_invalid_argument("Bigarray.blit: dimension mismatch");
  for (var i = 0; i < dst.dims.length; i++)
    if (dst.dims[i] != src.dims[i])
      caml_invalid_argument("Bigarray.blit: dimension mismatch");
  dst.data.set(src.data);
  return 0;
}

function caml_ba_sub(ba, ofs, len) {
  var changed_dim;
  var mul = 1;
  if (ba.layout == 0) {
    for (var i = 1; i < ba.dims.length; i++)
      mul = mul * ba.dims[i];
    changed_dim = 0;
  } else {
    for (var i = 0; i < (ba.dims.length - 1); i++)
      mul = mul * ba.dims[i];
    changed_dim = ba.dims.length - 1;
    ofs = ofs - 1;
  }
  if (ofs < 0 || len < 0 || (ofs + len) > ba.dims[changed_dim]){
    caml_invalid_argument("Bigarray.sub: bad sub-array");
  }
  var new_dims = [];
  for (var i = 0; i < ba.dims.length; i++)
    new_dims[i] = ba.dims[i];
  new_dims[changed_dim] = len;
  mul *= caml_ba_get_size_per_element(ba.kind);
  var new_data = ba.data.subarray(ofs * mul, (ofs + len) * mul);
  return caml_ba_create_unsafe(ba.kind, ba.layout, new_dims, new_data);
}

function caml_ba_slice(ba, vind) {
  vind = caml_js_from_array(vind);
  var num_inds = vind.length;
  var index = [];
  var sub_dims = [];
  var ofs;

  if (num_inds > ba.dims.length)
    caml_invalid_argument("Bigarray.slice: too many indices");

  // Compute offset and check bounds
  if (ba.layout == 0) {
    for (var i = 0; i < num_inds; i++)
      index[i] = vind[i];
    for (; i < ba.dims.length; i++)
      index[i] = 0;
    sub_dims = ba.dims.slice(num_inds);
  } else {
    for (var i = 0; i < num_inds; i++)
      index[ba.dims.length - num_inds + i] = vind[i];
    for (var i = 0; i < ba.dims.length - num_inds; i++)
      index[i] = 1;
    sub_dims = ba.dims.slice(0, ba.dims.length - num_inds);
  }
  ofs = ba.offset(index);
  var size = caml_ba_get_size(sub_dims);
  var size_per_element = caml_ba_get_size_per_element(ba.kind);
  var new_data = ba.data.subarray(ofs * size_per_element, (ofs + size) * size_per_element);
  return caml_ba_create_unsafe(ba.kind, ba.layout, sub_dims, new_data);
}

function caml_ba_reshape(ba, vind) {
  vind = caml_js_from_array(vind);
  var new_dim = [];
  var num_dims = vind.length;

  if (num_dims < 0 || num_dims > 16){
    caml_invalid_argument("Bigarray.reshape: bad number of dimensions");
  }
  var num_elts = 1;
  for (var i = 0; i < num_dims; i++) {
    new_dim[i] = vind[i];
    if (new_dim[i] < 0)
      caml_invalid_argument("Bigarray.reshape: negative dimension");
    num_elts = num_elts * new_dim[i];
  }

  var size = caml_ba_get_size(ba.dims);
  // Check that sizes agree
  if (num_elts != size)
    caml_invalid_argument("Bigarray.reshape: size mismatch");
  return caml_ba_create_unsafe(ba.kind, ba.layout, new_dim, ba.data);
}

function caml_ba_serialize(writer, ba, sz) {
  writer.write(32, ba.dims.length);
  writer.write(32, (ba.kind | (ba.layout << 8)));
  if(ba.caml_custom == "_bigarr02")
    for(var i = 0; i < ba.dims.length; i++) {
      if(ba.dims[i] < 0xffff)
        writer.write(16, ba.dims[i]);
      else {
        writer.write(16, 0xffff);
        writer.write(32, 0);
        writer.write(32, ba.dims[i]);
      }
    }
  else
    for(var i = 0; i < ba.dims.length; i++) writer.write(32,ba.dims[i])
  switch(ba.kind){
  case 2:  //Int8Array
  case 3:  //Uint8Array
  case 12: //Uint8Array
    for(var i = 0; i < ba.data.length; i++){
      writer.write(8, ba.data[i]);
    }
    break;
  case 4:  // Int16Array
  case 5:  // Uint16Array
    for(var i = 0; i < ba.data.length; i++){
      writer.write(16, ba.data[i]);
    }
    break;
  case 6:  // Int32Array (int32)
    for(var i = 0; i < ba.data.length; i++){
      writer.write(32, ba.data[i]);
    }
    break;
  case 8:  // Int32Array (int)
  case 9:  // Int32Array (nativeint)
    writer.write(8,0);
    for(var i = 0; i < ba.data.length; i++){
      writer.write(32, ba.data[i]);
    }
    break;
  case 7:  // Int32Array (int64)
    for(var i = 0; i < ba.data.length / 2; i++){
      var b = caml_int64_to_bytes(ba.get(i));
      for (var j = 0; j < 8; j++) writer.write (8, b[j]);
    }
    break;
  case 1:  // Float64Array
    for(var i = 0; i < ba.data.length; i++){
      var b = caml_int64_to_bytes(caml_int64_bits_of_float(ba.get(i)));
      for (var j = 0; j < 8; j++) writer.write (8, b[j]);
    }
    break;
  case 0:  // Float32Array
    for(var i = 0; i < ba.data.length; i++){
      var b = caml_int32_bits_of_float(ba.get(i));
      writer.write(32, b);
    }
    break;
  case 10: // Float32Array (complex32)
    for(var i = 0; i < ba.data.length / 2; i++){
      var j = ba.get(i);
      writer.write(32, caml_int32_bits_of_float(j[1]));
      writer.write(32, caml_int32_bits_of_float(j[2]));
    }
    break;
  case 11: // Float64Array (complex64)
    for(var i = 0; i < ba.data.length / 2; i++){
      var complex = ba.get(i);
      var b = caml_int64_to_bytes(caml_int64_bits_of_float(complex[1]));
      for (var j = 0; j < 8; j++) writer.write (8, b[j]);
      var b = caml_int64_to_bytes(caml_int64_bits_of_float(complex[2]));
      for (var j = 0; j < 8; j++) writer.write (8, b[j]);
    }
    break;
  }
  sz[0] = (4 + ba.dims.length) * 4;
  sz[1] = (4 + ba.dims.length) * 8;
}

function caml_ba_deserialize(reader, sz, name){
  var num_dims = reader.read32s();
  if (num_dims < 0 || num_dims > 16)
    caml_failwith("input_value: wrong number of bigarray dimensions");
  var tag = reader.read32s();
  var kind = tag & 0xff
  var layout = (tag >> 8) & 1;
  var dims = []
  if(name == "_bigarr02")
    for (var i = 0; i < num_dims; i++) {
      var size_dim = reader.read16u();
      if(size_dim == 0xffff){
        var size_dim_hi = reader.read32u();
        var size_dim_lo = reader.read32u();
        if(size_dim_hi != 0)
          caml_failwith("input_value: bigarray dimension overflow in 32bit");
        size_dim = size_dim_lo;
      }
      dims.push(size_dim);
    }
  else
    for (var i = 0; i < num_dims; i++) dims.push(reader.read32u());
  var size = caml_ba_get_size(dims);
  var data = caml_ba_create_buffer(kind, size);
  var ba = caml_ba_create_unsafe(kind, layout, dims, data);
  switch(kind){
  case 2:  //Int8Array
    for(var i = 0; i < size; i++){
      data[i] = reader.read8s();
    }
    break;
  case 3:  //Uint8Array
  case 12: //Uint8Array
    for(var i = 0; i < size; i++){
      data[i] = reader.read8u();
    }
    break;
  case 4:  // Int16Array
    for(var i = 0; i < size; i++){
      data[i] = reader.read16s();
    }
    break;
  case 5:  // Uint16Array
    for(var i = 0; i < size; i++){
      data[i] = reader.read16u();
    }
    break;
  case 6:  // Int32Array (int32)
    for(var i = 0; i < size; i++){
      data[i] = reader.read32s();
    }
    break;
  case 8:  // Int32Array (int)
  case 9:  // Int32Array (nativeint)
    var sixty = reader.read8u();
    if(sixty) caml_failwith("input_value: cannot read bigarray with 64-bit OCaml ints");
    for(var i = 0; i < size; i++){
      data[i] = reader.read32s();
    }
    break;
  case 7: // (int64)
    var t = new Array(8);;
    for(var i = 0; i < size; i++){
      for (var j = 0;j < 8;j++) t[j] = reader.read8u();
      var int64 = caml_int64_of_bytes(t);
      ba.set(i,int64);
    }
    break;
  case 1:  // Float64Array
    var t = new Array(8);;
    for(var i = 0; i < size; i++){
      for (var j = 0;j < 8;j++) t[j] = reader.read8u();
      var f = caml_int64_float_of_bits(caml_int64_of_bytes(t));
      ba.set(i,f);
    }
    break;
  case 0:  // Float32Array
    for(var i = 0; i < size; i++){
      var f = caml_int32_float_of_bits(reader.read32s());
      ba.set(i,f);
    }
    break;
  case 10: // Float32Array (complex32)
    for(var i = 0; i < size; i++){
      var re = caml_int32_float_of_bits(reader.read32s());
      var im = caml_int32_float_of_bits(reader.read32s());
      ba.set(i,[254,re,im]);
    }
    break;
  case 11: // Float64Array (complex64)
    var t = new Array(8);;
    for(var i = 0; i < size; i++){
      for (var j = 0;j < 8;j++) t[j] = reader.read8u();
      var re = caml_int64_float_of_bits(caml_int64_of_bytes(t));
      for (var j = 0;j < 8;j++) t[j] = reader.read8u();
      var im = caml_int64_float_of_bits(caml_int64_of_bytes(t));
      ba.set(i,[254,re,im]);
    }
    break
  }
  sz[0] = (4 + num_dims) * 4;
  return caml_ba_create_unsafe(kind, layout, dims, data);
}

function caml_ba_create_from(data1, data2, jstyp, kind, layout, dims){
  if(data2 || caml_ba_get_size_per_element(kind) == 2){
    caml_invalid_argument("caml_ba_create_from: use return caml_ba_create_unsafe");
  }
  return caml_ba_create_unsafe(kind, layout, dims, data1);
}

function caml_ba_hash(ba){
  var num_elts = caml_ba_get_size(ba.dims);
  var h = 0;
  switch(ba.kind){
  case 2:  //Int8Array
  case 3:  //Uint8Array
  case 12: //Uint8Array
    if(num_elts > 256) num_elts = 256;
    var w = 0, i =0;
    for(i = 0; i + 4 <= ba.data.length; i+=4){
      w = ba.data[i+0] | (ba.data[i+1] << 8) | (ba.data[i+2] << 16) | (ba.data[i+3] << 24);
      h = caml_hash_mix_int(h,w);
    }
    w = 0;
    switch (num_elts & 3) {
    case 3: w  = ba.data[i+2] << 16;    /* fallthrough */
    case 2: w |= ba.data[i+1] << 8;     /* fallthrough */
    case 1: w |= ba.data[i+0];
      h = caml_hash_mix_int(h, w);
    }
    break;
  case 4:  // Int16Array
  case 5:  // Uint16Array
    if(num_elts > 128) num_elts = 128;
    var w = 0, i =0;
    for(i = 0; i + 2 <= ba.data.length; i+=2){
      w = ba.data[i+0] | (ba.data[i+1] << 16);
      h = caml_hash_mix_int(h,w);
    }
    if ((num_elts & 1) != 0)
      h = caml_hash_mix_int(h, ba.data[i]);
    break;
  case 6:  // Int32Array (int32)
    if (num_elts > 64) num_elts = 64;
    for (var i = 0; i < num_elts; i++) h = caml_hash_mix_int(h, ba.data[i]);
    break;
  case 8:  // Int32Array (int)
  case 9:  // Int32Array (nativeint)
    if (num_elts > 64) num_elts = 64;
    for (var i = 0; i < num_elts; i++) h = caml_hash_mix_int(h, ba.data[i]);
    break;
  case 7:  // Int32Array (int64)
    if (num_elts > 32) num_elts = 32;
    num_elts *= 2
    for (var i = 0; i < num_elts; i++) {
      h = caml_hash_mix_int(h, ba.data[i]);
    }
    break;
  case 10: // Float32Array (complex32)
    num_elts *=2; /* fallthrough */
  case 0:  // Float32Array
    if (num_elts > 64) num_elts = 64;
    for (var i = 0; i < num_elts; i++) h = caml_hash_mix_float(h, ba.data[i]);
    break;
  case 11: // Float64Array (complex64)
    num_elts *=2; /* fallthrough */
  case 1:  // Float64Array
    if (num_elts > 32) num_elts = 32;
    for (var i = 0; i < num_elts; i++) h = caml_hash_mix_float(h, ba.data[i]);
    break;
  }
  return h;
}

function caml_ba_to_typed_array(ba){
  return ba.data;
}

function caml_ba_kind_of_typed_array(ta){
  var g = globalThis;
  var kind;
  if (ta instanceof g.Float32Array) kind = 0;
  else if (ta instanceof g.Float64Array) kind = 1;
  else if (ta instanceof g.Int8Array) kind = 2;
  else if (ta instanceof g.Uint8Array) kind = 3;
  else if (ta instanceof g.Int16Array) kind = 4;
  else if (ta instanceof g.Uint16Array) kind = 5;
  else if (ta instanceof g.Int32Array) kind = 6;
  else if (ta instanceof g.Uint32Array) kind = 6;
  else caml_invalid_argument("caml_ba_kind_of_typed_array: unsupported kind");
  return kind;
}

function caml_ba_from_typed_array(ta){
  var kind = caml_ba_kind_of_typed_array(ta);
  return caml_ba_create_unsafe(kind, 0, [ta.length], ta);
}
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

function jsoo_is_ascii (s) {
  // The regular expression gets better at around this point for all browsers
  if (s.length < 24) {
    // Spidermonkey gets much slower when s.length >= 24 (on 64 bit archs)
    for (var i = 0; i < s.length; i++) if (s.charCodeAt(i) > 127) return false;
    return true;
  } else
    return !/[^\x00-\x7f]/.test(s);
}

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

function caml_string_bound_error () {
  caml_invalid_argument ("index out of bounds");
}

function caml_bytes_bound_error () {
  caml_invalid_argument ("index out of bounds");
}

function caml_string_get (s, i) {
  if (i >>> 0 >= caml_ml_string_length(s)) caml_string_bound_error();
  return caml_string_unsafe_get (s, i);
}

function caml_string_get16(s,i) {
  if (i >>> 0 >= caml_ml_string_length(s) - 1) caml_string_bound_error();
  var b1 = caml_string_unsafe_get (s, i),
      b2 = caml_string_unsafe_get (s, i + 1);
  return (b2 << 8 | b1);
}

function caml_bytes_get16(s,i) {
  if (i >>> 0 >= s.l - 1) caml_bytes_bound_error();
  var b1 = caml_bytes_unsafe_get (s, i),
      b2 = caml_bytes_unsafe_get (s, i + 1);
  return (b2 << 8 | b1);
}

function caml_string_get32(s,i) {
  if (i >>> 0 >= caml_ml_string_length(s) - 3) caml_string_bound_error();
  var b1 = caml_string_unsafe_get (s, i),
      b2 = caml_string_unsafe_get (s, i + 1),
      b3 = caml_string_unsafe_get (s, i + 2),
      b4 = caml_string_unsafe_get (s, i + 3);
  return (b4 << 24 | b3 << 16 | b2 << 8 | b1);
}

function caml_bytes_get32(s,i) {
  if (i >>> 0 >= s.l - 3) caml_bytes_bound_error();
  var b1 = caml_bytes_unsafe_get (s, i),
      b2 = caml_bytes_unsafe_get (s, i + 1),
      b3 = caml_bytes_unsafe_get (s, i + 2),
      b4 = caml_bytes_unsafe_get (s, i + 3);
  return (b4 << 24 | b3 << 16 | b2 << 8 | b1);
}

function caml_string_get64(s,i) {
  if (i >>> 0 >= caml_ml_string_length(s) - 7) caml_string_bound_error();
  var a = new Array(8);
  for(var j = 0; j < 8; j++){
    a[7 - j] = caml_string_unsafe_get (s, i + j);
  }
  return caml_int64_of_bytes(a);
}

function caml_bytes_get64(s,i) {
  if (i >>> 0 >= s.l - 7) caml_bytes_bound_error();
  var a = new Array(8);
  for(var j = 0; j < 8; j++){
    a[7 - j] = caml_bytes_unsafe_get (s, i + j);
  }
  return caml_int64_of_bytes(a);
}

function caml_bytes_get (s, i) {
  if (i >>> 0 >= s.l) caml_bytes_bound_error();
  return caml_bytes_unsafe_get (s, i);
}

function caml_string_set (s, i, c) {
  caml_failwith("caml_string_set");
}

function caml_string_set (s, i, c) {
  if (i >>> 0 >= s.l) caml_string_bound_error();
  return caml_string_unsafe_set (s, i, c);
}

function caml_bytes_set16(s,i,i16){
  if (i >>> 0 >= s.l - 1) caml_bytes_bound_error();
  var b2 = 0xFF & i16 >> 8,
      b1 = 0xFF & i16;
  caml_bytes_unsafe_set (s, i + 0, b1);
  caml_bytes_unsafe_set (s, i + 1, b2);
  return 0
}

function caml_string_set16(s,i,i16){
  caml_failwith("caml_string_set16");
}

function caml_string_set16(s,i,i16){
  return caml_bytes_set16(s,i,i16);
}

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

function caml_string_set32(s,i,i32){
  caml_failwith("caml_string_set32");
}

function caml_string_set32(s,i,i32){
  return caml_bytes_set32(s,i,i32);
}

function caml_bytes_set64(s,i,i64){
  if (i >>> 0 >= s.l - 7) caml_bytes_bound_error();
  var a = caml_int64_to_bytes(i64);
  for(var j = 0; j < 8; j++) {
    caml_bytes_unsafe_set (s, i + 7 - j, a[j]);
  }
  return 0
}

function caml_string_set64(s,i,i64){
  caml_failwith("caml_string_set64");
}

function caml_string_set64(s,i,i64){
  return caml_bytes_set64(s,i,i64);
}

function caml_bytes_set (s, i, c) {
  if (i >>> 0 >= s.l) caml_bytes_bound_error();
  return caml_bytes_unsafe_set (s, i, c);
}

function caml_bytes_of_utf16_jsstring (s) {
  var tag = 9 /* BYTES | ASCII */;
  if (!jsoo_is_ascii(s))
    tag = 8 /* BYTES | NOT_ASCII */, s = caml_utf8_of_utf16(s);
  return new MlBytes(tag, s, s.length);
}


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

function caml_convert_string_to_bytes (s) {
  /* Assumes not BYTES */
  if (s.t == 2 /* PARTIAL */)
    s.c += caml_str_repeat(s.l - s.c.length, '\0')
  else
    s.c = caml_subarray_to_jsbytes (s.c, 0, s.c.length);
  s.t = 0; /*BYTES | UNKOWN*/
}

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

function caml_array_of_bytes (s) {
  if (s.t != 4 /* ARRAY */) caml_convert_bytes_to_array(s);
  return s.c;
}

function caml_array_of_string (s) {
  var l = caml_ml_string_length(s);
  var a = new Array(l);
  var i = 0;
  for (; i < l; i++) a[i] = caml_string_unsafe_get(s,i);
  return a;
}

function caml_create_string(len) {
  if(len < 0) caml_invalid_argument("String.create");
  return new MlBytes(len?2:9,"",len);
}

function caml_create_string(len) {
  caml_invalid_argument("String.create");
}

function caml_create_bytes(len) {
  if (len < 0) caml_invalid_argument("Bytes.create");
  return new MlBytes(len?2:9,"",len);
}

function caml_string_of_array (a) {
  return caml_string_of_jsbytes(caml_subarray_to_jsbytes(a,0,a.length));
}

function caml_bytes_of_array (a) {
  return new MlBytes(4,a,a.length);
}

function caml_bytes_compare(s1, s2) {
  (s1.t & 6) && caml_convert_string_to_bytes(s1);
  (s2.t & 6) && caml_convert_string_to_bytes(s2);
  return (s1.c < s2.c)?-1:(s1.c > s2.c)?1:0;
}


function caml_bytes_equal(s1, s2) {
  if(s1 === s2) return 1;
  (s1.t & 6) && caml_convert_string_to_bytes(s1);
  (s2.t & 6) && caml_convert_string_to_bytes(s2);
  return (s1.c == s2.c)?1:0;
}

function caml_string_notequal(s1, s2) { return 1-caml_string_equal(s1, s2); }

function caml_bytes_notequal(s1, s2) { return 1-caml_bytes_equal(s1, s2); }

function caml_bytes_lessequal(s1, s2) {
  (s1.t & 6) && caml_convert_string_to_bytes(s1);
  (s2.t & 6) && caml_convert_string_to_bytes(s2);
  return (s1.c <= s2.c)?1:0;
}

function caml_bytes_lessthan(s1, s2) {
  (s1.t & 6) && caml_convert_string_to_bytes(s1);
  (s2.t & 6) && caml_convert_string_to_bytes(s2);
  return (s1.c < s2.c)?1:0;
}

function caml_string_greaterequal(s1, s2) {
  return caml_string_lessequal(s2,s1);
}
function caml_bytes_greaterequal(s1, s2) {
  return caml_bytes_lessequal(s2,s1);
}

function caml_string_greaterthan(s1, s2) {
  return caml_string_lessthan(s2, s1);
}

function caml_bytes_greaterthan(s1, s2) {
  return caml_bytes_lessthan(s2, s1);
}

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

var caml_fill_string = caml_fill_bytes

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

function caml_blit_string(a,b,c,d,e) {
  caml_blit_bytes(caml_bytes_of_string(a),b,c,d,e);
  return 0
}

function caml_ml_bytes_length(s) { return s.l }

function caml_string_unsafe_get (s, i) {
  return s.charCodeAt(i);
}

function caml_string_unsafe_set (s, i, c) {
  caml_failwith("caml_string_unsafe_set");
}

function caml_ml_string_length(s) {
  return s.length
}

function caml_string_compare(s1, s2) {
  return (s1 < s2)?-1:(s1 > s2)?1:0;
}

function caml_string_equal(s1, s2) {
  if(s1 === s2) return 1;
  return 0;
}

function caml_string_lessequal(s1, s2) {
  return (s1 <= s2)?1:0;
}

function caml_string_lessthan(s1, s2) {
  return (s1 < s2)?1:0;
}

function caml_string_of_bytes(s) {
  (s.t & 6) && caml_convert_string_to_bytes(s);
  return caml_string_of_jsbytes(s.c);
}

function caml_bytes_of_string(s) {
  return caml_bytes_of_jsbytes(caml_jsbytes_of_string(s));
}

function caml_string_of_jsbytes(x) { return x }

function caml_jsbytes_of_string(x) { return x }

function caml_jsstring_of_string(s) {
  if(jsoo_is_ascii(s))
    return s;
  return caml_utf16_of_utf8(s); }

function caml_string_of_jsstring (s) {
  if (jsoo_is_ascii(s))
    return caml_string_of_jsbytes(s)
  else return caml_string_of_jsbytes(caml_utf8_of_utf16(s));
}

function caml_bytes_of_jsbytes(s) { return new MlBytes(0,s,s.length); }


// The section below should be used when use-js-string=false

function caml_string_unsafe_get (s, i) {
  return caml_bytes_unsafe_get(s,i);
}

function caml_string_unsafe_set (s, i, c) {
  return caml_bytes_unsafe_set(s,i,c);
}

function caml_ml_string_length(s) {
  return caml_ml_bytes_length(s)
}

function caml_string_compare(s1, s2) {
  return caml_bytes_compare(s1,s2)
}

function caml_string_equal(s1, s2) {
  return caml_bytes_equal(s1,s2)
}

function caml_string_lessequal(s1, s2) {
  return caml_bytes_lessequal(s1,s2)
}

function caml_string_lessthan(s1, s2) {
  return caml_bytes_lessthan(s1,s2)
}

function caml_string_of_bytes(s) { return s }

function caml_string_of_jsbytes(s) { return caml_bytes_of_jsbytes(s); }

function caml_jsbytes_of_string(s) {
  (s.t & 6) && caml_convert_string_to_bytes(s);
  return s.c }

function caml_jsstring_of_string(s){
  return s.toUtf16()
}

function caml_string_of_jsstring (s) {
  return caml_bytes_of_utf16_jsstring(s);
}

function caml_is_ml_bytes(s) {
  return (s instanceof MlBytes);
}

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

function caml_is_ml_string(s) {
  return (typeof s === "string" && !/[^\x00-\xff]/.test(s));
}

function caml_is_ml_string(s) {
  return caml_is_ml_bytes(s);
}

// The functions below are deprecated

function caml_js_to_byte_string(s) { return caml_string_of_jsbytes(s) }

function caml_new_string (s) { return caml_string_of_jsbytes(s) }

function caml_js_from_string(s) {
  return caml_jsstring_of_string(s)
}

function caml_to_js_string(s) {
  return caml_jsstring_of_string(s)
}

function caml_js_to_string (s) {
  return caml_string_of_jsstring(s);
}

/* Internal */
function deleterange(r)
{
  cpdf.cpdflib.deleterange(r);
}

function array_of_range(r)
{
 var l = [];
 for (var x = 0; x < cpdf.cpdflib.rangeLength(r); x++)
 {
   l.push(cpdf.cpdflib.rangeGet(r, x));
 }
 return l;
}

function range_of_array(a)
{
  var r = cpdf.cpdflib.blankRange();
  for (var x = 0; x < a.length; x++)
  {
    var rn = cpdf.cpdflib.rangeAdd(r, a[x]);
    deleterange(r);
    r = rn;
  }
  return r;
}

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
  return caml_jsstring_of_string(cpdf.cpdflib.version);
}

//CHAPTER 1. Basics
function deletePdf(pdf)
{
  cpdf.cpdflib.deletePdf(pdf);
}

function onexit()
{
  cpdf.cpdflib.onexit();
}

function fromFile(filename, userpw)
{
  var r = 
    cpdf.cpdflib.fromFile(caml_string_of_jsstring(filename), caml_string_of_jsstring(userpw));
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
    cpdf.cpdflib.fromFileLazy(caml_string_of_jsstring(filename), caml_string_of_jsstring(userpw));
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
  var bigarray = caml_ba_from_typed_array(arr);
  var r = cpdf.cpdflib.fromMemory(bigarray, pw);
  return r;
}

function fromMemoryLazy(arr, pw)
{
  var bigarray = caml_ba_from_typed_array(arr);
  var r = cpdf.cpdflib.fromMemoryLazy(bigarray, pw);
  return r;
}

function blankDocument(w, h, pages)
{
  var r = cpdf.cpdflib.blankDocument(w, h, pages);
  return r;
}

var a0portrait = 0;
var a1portrait = 1;
var a2portrait = 2;
var a3portrait = 3;
var a4portrait = 4;
var a5portrait = 5;
var a0landscape = 6;
var a1landscape = 7;
var a2landscape = 8;
var a3landscape = 9;
var a4landscape = 10;
var a5landscape = 11;
var usletterportrait = 12;
var usletterlandscape = 13;
var uslegalportrait = 14;
var uslegallandscape = 15;

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

var noEdit = 0;
var noPrint = 1;
var noCopy = 2;
var noAnnot = 3;
var noForms = 4;
var noExtract = 5;
var noAssemble = 6;
var noHqPrint = 7;

var pdf40bit = 0;
var pdf128bit = 1;
var aes128bitfalse = 2;
var aes128bittrue = 3;
var aes256bitfalse = 4;
var aes256bittrue = 5;
var aes256bitisofalse = 6;
var aes256bitisotrue = 7;

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
  var rn = cpdf.cpdflib.range(a, b);
  var r = array_of_range(rn);
  deleterange(rn);
  return r;
}

function all(x)
{
  var rn = cpdf.cpdflib.all(x);
  var r = array_of_range(rn);
  deleterange(rn);
  return r;
}

function even(x)
{
  var ri = range_of_array(x);
  var rn = cpdf.cpdflib.even(ri);
  var r = array_of_range(rn);
  deleterange(rn);
  deleterange(ri);
  return r;
}

function odd(x)
{
  var ri = range_of_array(x);
  var rn = cpdf.cpdflib.odd(ri);
  var r = array_of_range(rn);
  deleterange(rn);
  deleterange(ri);
  return r;
}

function rangeUnion(a, b)
{
  var ra = range_of_array(a);
  var rb = range_of_array(b);
  var rn = cpdf.cpdflib.rangeUnion(ra, rb);
  var r = array_of_range(rn);
  deleterange(rn);
  deleterange(ra);
  deleterange(rb);
  return r;
}

function difference(a, b)
{
  var ra = range_of_array(a);
  var rb = range_of_array(b);
  var rn = cpdf.cpdflib.difference(ra, rb);
  var r = array_of_range(rn);
  deleterange(rn);
  deleterange(ra);
  deleterange(rb);
  return r;
}

function removeDuplicates(x)
{
  var rn = range_of_array(x);
  var rdup = cpdf.cpdflib.removeDuplicates(rn);
  var r = array_of_range(rdup);
  deleterange(rn);
  deleterange(rdup);
  return r;
}

function rangeLength(x)
{
  var rn = range_of_array(x);
  var r = cpdf.cpdflib.rangeLength(rn);
  deleterange(rn);
  return r;
}

function rangeGet(a, b)
{
  var rn = range_of_array(a);
  var r = cpdf.cpdflib.rangeGet(rn, b);
  deleterange(rn);
  return r;
}

function rangeAdd(r, p)
{
  var rn = range_of_array(r)
  var r2 = cpdf.cpdflib.rangeAdd(rn, p);
  var rout = array_of_range(r2);
  deleterange(rn);
  deleterange(r2);
  return rout;
}

function isInRange(r, p)
{
  var rn = range_of_array(r);
  var r = cpdf.cpdflib.isInRange(rn, p);
  deleterange(rn);
  return r;
}

function blankRange()
{
  var rn = cpdf.cpdflib.blankRange();
  var r = array_of_range(rn);
  deleterange(rn);
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
  var arr = array_of_range(r);
  deleterange(r);
  return arr;
}

function stringOfPagespec(pdf, range)
{
  var rn = range_of_array(range);
  var r = caml_jsstring_of_string(cpdf.cpdflib.stringOfPagespec(pdf, rn));
  deleterange(rn);
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
  var arr2 = [0].concat(arr);
  var r = cpdf.cpdflib.mergeSimple(arr2);
  return r;
}

function merge(arr, retain_numbering, remove_duplicate_fonts)
{
  var arr2 = [0].concat(arr);
  var r = cpdf.cpdflib.merge(arr2, retain_numbering, remove_duplicate_fonts);
  return r;
}

function mergeSame(arr, retain_numbering, remove_duplicate_fonts, ranges)
{
  var arr2 = [0].concat(arr);
  var nativeranges = [];
  for (var x = 0; x < ranges.length; x++)
  {
    nativeranges.push(range_of_array(ranges[x]));
  }
  var ranges2 = [0].concat(nativeranges);
  var r = cpdf.cpdflib.mergeSame(arr2, retain_numbering, remove_duplicate_fonts, ranges2);
  for (var x = 0; x < nativeranges.length; x++)
  {
    deleterange(nativeranges[x]);
  }
  return r;
}

function selectPages(pdf, range)
{
  var rn = range_of_array(range);
  var r = cpdf.cpdflib.selectPages(pdf, rn);
  deleterange(rn);
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

function setBookmarksJSON(pdf, data)
{
  var bigarray = caml_ba_from_typed_array(data);
  cpdf.cpdflib.setBookmarksJSON(pdf, bigarray);
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
  cpdf.cpdflib.replaceDictEntrySearch(pdf, caml_string_of_jsstring(key), caml_string_of_jsstring(searchterm), caml_string_of_jsstring(newval));
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
  cpdf.cpdflib.padBefore(pdf, range);
}

function padAfter(pdf, range)
{
  cpdf.cpdflib.padAfter(pdf, range);
}

function padEvery(pdf, range)
{
  cpdf.cpdflib.padEvery(pdf, range);
}

function padMultiple(pdf, range)
{
  cpdf.cpdflib.padMultiple(pdf, range);
}

function padMultipleBefore(pdf, range)
{
  cpdf.cpdflib.padMultipleBefore(pdf, range);
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
  cpdf.cpdflib.stampExtended(stamp, stampee, stamp_range, a, b, d, e, c, f);
}

function combinePages(a, b)
{
  var r = cpdf.cpdflib.combinePages(a, b);
  return r;
}

function addText(metrics, pdf, range, text, anchor, p1, p2, linespacing,
                 bates, font, fontsize, r, g, b, underneath, cropbox, outline,
                 opacity, justification, midline, topline, filename, linewidth, embed_fonts)
{
  cpdf.cpdflib.addText(metrics, pdf, range, caml_string_of_jsstring(text), anchor, p1, p2,
                       linespacing, bates, font, fontsize, r, g, b, underneath, cropbox, outline,
                       opacity, justification, midline, topline, caml_string_of_jsstring(filename),
                       linewidth, embed_fonts);
}

function addTextSimple(pdf, range, text, anchor, p1, p2, font, fontsize)
{
  cpdf.cpdflib.addText(0, pdf, range, caml_string_of_jsstring(text), anchor, p1, p2, 1.0, 0, font, fontsize, 0, 0, 0, 1, 1, 1, 1.0, leftJustify, 1, 1, caml_string_of_jsstring(""), 0.0, 1);
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

function attachFileFromMemory(data, filename, pdf)
{
  var bigarray = caml_ba_from_typed_array(data);
  var r = cpdf.cpdflib.attachFileFromMemory(bigarray, caml_string_of_jsstring(filename), pdf);
  return r;
}

function attachFileToPageFromMemory(data, filename, pdf, pagenumber)
{
  var bigarray = caml_ba_from_typed_array(data);
  var r = cpdf.cpdflib.attachFileToPageFromMemory(bigarray, caml_string_of_jsstring(filename), pdf, pagenumber);
  return r;
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
  return r;
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

function outputJSONMemory(a, b, c, pdf)
{
  var r = cpdf.cpdflib.outputJSONMemory(a, b, c, pdf);
  return r.data;
}

function fromJSON(filename)
{
  var r = cpdf.cpdflib.fromJSON(caml_string_of_jsstring(filename));
  return r;
}

function fromJSONMemory(buf)
{
  var bigarray = caml_ba_from_typed_array(buf);
  var r = cpdf.cpdflib.fromJSONMemory(bigarray);
  return r;
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
  var r = cpdf.cpdflib.getCropBox(pdf, page, a);
  a[0] = r[1];
  a[1] = r[2];
  a[2] = r[3];
  a[3] = r[4];
}

function getArtBox(pdf, page, a)
{
  var r = cpdf.cpdflib.getArtBox(pdf, page, a);
  a[0] = r[1];
  a[1] = r[2];
  a[2] = r[3];
  a[3] = r[4];
}

function getBleedBox(pdf, page, a)
{
  var r = cpdf.cpdflib.getBleedBox(pdf, page, a);
  a[0] = r[1];
  a[1] = r[2];
  a[2] = r[3];
  a[3] = r[4];
}

function getTrimBox(pdf, page, a)
{
  var r = cpdf.cpdflib.getTrimBox(pdf, page, a);
  a[0] = r[1];
  a[1] = r[2];
  a[2] = r[3];
  a[3] = r[4];
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
  var bigarray = caml_ba_from_typed_array(arr);
  cpdf.cpdflib.setMetadataFromByteArray(pdf, bigarray);
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
  posCentre : posCentre,
  posLeft : posLeft,
  posRight : posRight,
  top : top,
  topLeft : topLeft,
  topRight : topRight,
  left : left,
  bottomLeft : bottomLeft,
  bottom : bottom,
  bottomRight : bottomRight,
  right : right,
  diagonal : diagonal,
  reversediagonal : reversediagonal,
  timesRoman : timesRoman,
  timesBold : timesBold,
  timesItalic : timesItalic,
  timesBoldItalic : timesBoldItalic,
  helvetica : helvetica,
  helveticaBold : helveticaBold,
  helveticaOblique : helveticaOblique,
  helveticaBoldOblique : helveticaBoldOblique,
  courier : courier,
  courierBold : courierBold,
  courierOblique : courierOblique,
  courierBoldOblique : courierBoldOblique,
  decimalArabic : decimalArabic,
  uppercaseRoman : uppercaseRoman,
  lowercaseRoman : lowercaseRoman,
  uppercaseLetters : uppercaseLetters,
  lowercaseLetters : lowercaseLetters,
  singlePage : singlePage,
  oneColumn : oneColumn,
  twoColumnLeft : twoColumnLeft,
  twoColumnRight : twoColumnRight,
  twoPageLeft : twoPageLeft,
  twoPageRight : twoPageRight,
  useNone : useNone,
  useOutlines : useOutlines,
  useThumbs : useThumbs,
  useOC : useOC,
  useAttachments : useAttachments,
  leftJustify : leftJustify,
  centreJustify : centreJustify,
  rightJustify : rightJustify,
  a0portrait : a0portrait,
  a1portrait : a1portrait,
  a2portrait : a2portrait,
  a3portrait : a3portrait,
  a4portrait : a4portrait,
  a5portrait : a5portrait,
  a0landscape : a0landscape,
  a1landscape : a1landscape,
  a2landscape : a2landscape,
  a3landscape : a3landscape,
  a4landscape : a4landscape,
  a5landscape : a5landscape,
  usletterportrait : usletterportrait,
  usletterlandscape : usletterlandscape,
  uslegalportrait : uslegalportrait,
  uslegallandscape : uslegallandscape,
  noEdit : noEdit,
  noPrint : noPrint,
  noCopy : noCopy,
  noAnnot : noAnnot,
  noForms : noForms,
  noExtract : noExtract,
  noAssemble : noAssemble,
  noHqPrint : noHqPrint,
  pdf40bit : pdf40bit,
  pdf128bit : pdf128bit,
  aes128bitfalse : aes128bitfalse,
  aes128bittrue : aes128bittrue,
  aes256bitfalse : aes256bitfalse,
  aes256bittrue : aes256bittrue,
  aes256bitisofalse : aes256bitisofalse,
  aes256bitisotrue : aes256bitisotrue,

  //CHAPTER 1. Basics
  deletePdf : deletePdf,
  onexit : onexit,
  setFast : setFast,
  setSlow : setSlow,
  version : version,
  startEnumeratePDFs : startEnumeratePDFs,
  enumeratePDFsKey : enumeratePDFsKey,
  enumeratePDFsInfo : enumeratePDFsInfo,
  endEnumeratePDFs : endEnumeratePDFs,
  parsePagespec : parsePagespec,
  stringOfPagespec : stringOfPagespec,
  validatePagespec : validatePagespec,
  ptOfCm : ptOfCm,
  ptOfMm : ptOfMm,
  ptOfIn : ptOfIn,
  cmOfPt : cmOfPt,
  mmOfPt : mmOfPt,
  inOfPt : inOfPt,
  range : range,
  blankRange : blankRange,
  all : all,
  even : even,
  odd : odd,
  rangeUnion : rangeUnion,
  rangeAdd : rangeAdd,
  difference : difference,
  removeDuplicates : removeDuplicates,
  rangeLength : rangeLength,
  isInRange : isInRange,
  rangeGet : rangeGet,
  fromFile : fromFile,
  fromFileLazy : fromFileLazy,
  toMemory : toMemory,
  fromMemory : fromMemory,
  fromMemoryLazy : fromMemoryLazy,
  toFile : toFile,
  toFileExt : toFileExt,
  toFileEncrypted : toFileEncrypted,
  toFileEncryptedExt : toFileEncryptedExt,
  pages : pages,
  pagesFast : pagesFast,
  isEncrypted : isEncrypted,
  decryptPdf : decryptPdf,
  decryptPdfOwner : decryptPdfOwner,
  hasPermission : hasPermission,
  encryptionKind : encryptionKind,

  //CHAPTER 2. Merging and Splitting
  mergeSimple : mergeSimple,
  merge : merge,
  mergeSame : mergeSame,
  selectPages : selectPages,

  //CHAPTER 3. Pages
  scalePages : scalePages,
  scaleToFit : scaleToFit ,
  scaleToFitPaper : scaleToFitPaper,
  scaleContents : scaleContents,
  shiftContents : shiftContents,
  rotate : rotate,
  rotateBy : rotateBy,
  rotateContents : rotateContents,
  upright : upright,
  hFlip : hFlip,
  vFlip : vFlip,
  crop : crop,
  setMediabox : setMediabox,
  setCropBox : setCropBox,
  setTrimBox : setTrimBox,
  setArtBox : setArtBox,
  setBleedBox : setBleedBox,
  getMediaBox : getMediaBox,
  getCropBox : getCropBox,
  getArtBox : getArtBox,
  getBleedBox : getBleedBox,
  getTrimBox : getTrimBox,
  removeCrop : removeCrop,
  removeArt : removeArt,
  removeTrim : removeTrim,
  removeBleed : removeBleed,
  hardBox : hardBox,
  trimMarks : trimMarks,
  showBoxes : showBoxes,

  //CHAPTER 4. Encryption and Decryption

  //CHAPTER 5. Compression
  compress : compress,
  decompress : decompress,
  squeezeInMemory : squeezeInMemory,

  //CHAPTER 6. Bookmarks
  startGetBookmarkInfo : startGetBookmarkInfo,
  endGetBookmarkInfo : endGetBookmarkInfo,
  numberBookmarks : numberBookmarks,
  getBookmarkPage : getBookmarkPage,
  getBookmarkLevel : getBookmarkLevel,
  getBookmarkText : getBookmarkText,
  getBookmarkOpenStatus : getBookmarkOpenStatus,
  startSetBookmarkInfo : startSetBookmarkInfo,
  endSetBookmarkInfo : endSetBookmarkInfo,
  setBookmarkPage : setBookmarkPage,
  setBookmarkLevel : setBookmarkLevel,
  setBookmarkText : setBookmarkText,
  setBookmarkOpenStatus : setBookmarkOpenStatus,
  getBookmarksJSON : getBookmarksJSON,
  setBookmarksJSON : setBookmarksJSON,
  tableOfContents : tableOfContents,

  //CHAPTER 7. Presentations

  //CHAPTER 8. Logos, Watermarks and Stamps
  stampOn : stampOn,
  stampUnder : stampUnder,
  stampExtended : stampExtended,
  combinePages : combinePages,
  addText : addText,
  addTextSimple : addTextSimple,
  textWidth : textWidth,
  removeText : removeText,
  addContent : addContent,
  stampAsXObject : stampAsXObject,

  //CHAPTER 9. Multipage facilities
  twoUp : twoUp,
  twoUpStack : twoUpStack,
  impose : impose,
  padBefore : padBefore,
  padAfter : padAfter,
  padEvery : padEvery,
  padMultiple : padMultiple,
  padMultipleBefore : padMultipleBefore,

  //CHAPTER 10. Annotations
  annotationsJSON : annotationsJSON,

  //CHAPTER 11. Document Information and Metadata
  getVersion : getVersion,
  getMajorVersion : getMajorVersion,
  isLinearized : isLinearized,
  getTitle : getTitle,
  getAuthor : getAuthor,
  getSubject : getSubject,
  getKeywords : getKeywords,
  getCreator : getCreator,
  getProducer : getProducer,
  getCreationDate : getCreationDate,
  getModificationDate : getModificationDate,
  getTitleXMP : getTitleXMP,
  getAuthorXMP : getAuthorXMP,
  getSubjectXMP : getSubjectXMP,
  getKeywordsXMP : getKeywordsXMP,
  getCreatorXMP : getCreatorXMP,
  getProducerXMP : getProducerXMP,
  getCreationDateXMP : getCreationDateXMP,
  getModificationDateXMP : getModificationDateXMP,
  setTitle : setTitle,
  setAuthor : setAuthor,
  setSubject : setSubject,
  setKeywords : setKeywords,
  setCreator : setCreator,
  setProducer : setProducer,
  setCreationDate : setCreationDate,
  setModificationDate : setModificationDate,
  setTitleXMP : setTitleXMP,
  setAuthorXMP : setAuthorXMP,
  setSubjectXMP : setSubjectXMP,
  setKeywordsXMP : setKeywordsXMP,
  setCreatorXMP : setCreatorXMP,
  setProducerXMP : setProducerXMP,
  setCreationDateXMP : setCreationDateXMP,
  setModificationDateXMP : setModificationDateXMP,
  getDateComponents : getDateComponents,
  dateStringOfComponents : dateStringOfComponents,
  markTrapped : markTrapped,
  markUntrapped : markUntrapped,
  markTrappedXMP : markTrappedXMP,
  markUntrappedXMP : markUntrappedXMP,
  hasBox : hasBox,
  getPageRotation : getPageRotation,
  setPageLayout : setPageLayout,
  setPageMode : setPageMode,
  hideToolbar : hideToolbar,
  hideMenubar : hideMenubar,
  hideWindowUi : hideWindowUi,
  fitWindow : fitWindow,
  centerWindow : centerWindow,
  displayDocTitle : displayDocTitle,
  openAtPage : openAtPage,
  setMetadataFromFile : setMetadataFromFile,
  setMetadataFromByteArray : setMetadataFromByteArray,
  getMetadata : getMetadata,
  removeMetadata : removeMetadata,
  createMetadata : createMetadata,
  setMetadataDate : setMetadataDate,
  addPageLabels : addPageLabels,
  removePageLabels : removePageLabels,
  startGetPageLabels : startGetPageLabels,
  getPageLabelStyle : getPageLabelStyle,
  getPageLabelPrefix : getPageLabelPrefix,
  getPageLabelOffset : getPageLabelOffset,
  getPageLabelRange : getPageLabelRange,
  endGetPageLabels : endGetPageLabels,
  getPageLabelStringForPage : getPageLabelStringForPage,

  //CHAPTER 12. File Attachments
  attachFile : attachFile,
  attachFileToPage : attachFileToPage,
  attachFileFromMemory : attachFileFromMemory,
  attachFileToPageFromMemory : attachFileToPageFromMemory,
  removeAttachedFiles : removeAttachedFiles,
  startGetAttachments : startGetAttachments,
  endGetAttachments : endGetAttachments,
  numberGetAttachments : numberGetAttachments,
  getAttachmentName : getAttachmentName,
  getAttachmentPage : getAttachmentPage,
  getAttachmentData : getAttachmentData,

  //CHAPTER 13. Images
  startGetImageResolution : startGetImageResolution,
  getImageResolutionPageNumber : getImageResolutionPageNumber,
  getImageResolutionImageName : getImageResolutionImageName,
  getImageResolutionXPixels : getImageResolutionXPixels,
  getImageResolutionYPixels : getImageResolutionYPixels,
  getImageResolutionXRes : getImageResolutionXRes,
  getImageResolutionYRes : getImageResolutionYRes,
  endGetImageResolution : endGetImageResolution,

  //CHAPTER 14. Fonts
  numberFonts : numberFonts,
  getFontPage : getFontPage,
  getFontName : getFontName,
  getFontType : getFontType,
  getFontEncoding : getFontEncoding,
  startGetFontInfo : startGetFontInfo,
  endGetFontInfo : endGetFontInfo,
  copyFont : copyFont,
  removeFonts : removeFonts,
  
  //CHAPTER 15. PDF and JSON
  outputJSON : outputJSON,
  outputJSONMemory : outputJSONMemory,
  fromJSON : fromJSON,
  fromJSONMemory : fromJSONMemory,
  
  //CHAPTER 16. Optional Content Groups
  startGetOCGList : startGetOCGList,
  ocgListEntry : ocgListEntry,
  endGetOCGList : endGetOCGList,
  ocgCoalesce : ocgCoalesce,
  ocgRename : ocgRename,
  ocgOrderAll : ocgOrderAll,

  //CHAPTER 17. Creating New PDFs
  blankDocument : blankDocument,
  blankDocumentPaper : blankDocumentPaper,
  textToPDF : textToPDF,
  textToPDFPaper : textToPDFPaper,

  //CHAPTER 18. Miscellaneous
  draft : draft,
  removeAllText : removeAllText,
  blackText : blackText,
  blackLines : blackLines,
  blackFills : blackFills,
  thinLines : thinLines,
  copyId : copyId,
  removeId : removeId,
  setVersion : setVersion,
  setFullVersion : setFullVersion,
  removeDictEntry : removeDictEntry,
  removeDictEntrySearch : removeDictEntrySearch,
  replaceDictEntry : replaceDictEntry,
  replaceDictEntrySearch : replaceDictEntrySearch,
  getDictEntries : getDictEntries,
  removeClipping : removeClipping
};
