"use strict";

const cpdflib = require('./cpdflib.js');

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

// Internal
function deleterange(r)
{
  cpdflib.cpdflib.deleterange(r);
}

function array_of_range(r)
{
 var l = [];
 for (var x = 0; x < cpdflib.cpdflib.rangeLength(r); x++)
 {
   l.push(cpdflib.cpdflib.rangeGet(r, x));
 }
 return l;
}

function range_of_array(a)
{
  var r = cpdflib.cpdflib.blankRange();
  for (var x = 0; x < a.length; x++)
  {
    var rn = cpdflib.cpdflib.rangeAdd(r, a[x]);
    deleterange(r);
    r = rn;
  }
  return r;
}

function checkError()
{
  if (cpdflib.cpdflib.getLastError() != 0)
  {
    var str = caml_jsstring_of_string(cpdflib.cpdflib.getLastErrorString());
    cpdflib.cpdflib.clearError();
    throw new Error(str);
  }
}

// CHAPTER 0. Preliminaries

/** Returns a string giving the version number of the CPDF library. */
function version()
{
  var r = caml_jsstring_of_string(cpdflib.cpdflib.version);
  checkError();
  return r;
}

/** Some operations have a fast mode. The default is 'slow' mode, which works
even on old-fashioned files. For more details, see section 1.13 of the CPDF
manual. This function sets the mode to fast globally. */
function setFast()
{
  cpdflib.cpdflib.setFast();
  checkError();
}

/** Some operations have a fast mode. The default is 'slow' mode, which works
even on old-fashioned files. For more details, see section 1.13 of the CPDF
manual. This function sets the mode to slow globally. */
function setSlow()
{
  cpdflib.cpdflib.setSlow();
  checkError();
}

/** Delete a PDF so the memory representing it may be recovered. */
function deletePdf(pdf)
{
  cpdflib.cpdflib.deletePdf(pdf);
  checkError();
}

/* A debug function which prints some information about resource usage. This
can be used to detect if PDFs or ranges are being deallocated properly.
Contrary to its name, it may be run at any time. */
function onexit()
{
  cpdflib.cpdflib.onexit();
  checkError();
}

//CHAPTER 1. Basics

/** Loads a PDF file from a given file. Supply a user password (possibly blank)
in case the file is encrypted. It won't be decrypted, but sometimes the
password is needed just to load the file. */
function fromFile(filename, userpw)
{
  var r = 
    cpdflib.cpdflib.fromFile(caml_string_of_jsstring(filename), caml_string_of_jsstring(userpw));
  return r
}

/** Loads a PDF from a file, doing only minimal parsing. The objects will be
read and parsed when they are actually needed. Use this when the whole file
won't be required. Also supply a user password (possibly blank) in case the
file is encrypted. It won't be decrypted, but sometimes the password is needed
just to load the file. */
function fromFileLazy(filename, userpw)
{
  var r =
    cpdflib.cpdflib.fromFileLazy(caml_string_of_jsstring(filename), caml_string_of_jsstring(userpw));
  checkError();
  return r;
}

/** Loads a file from memory given any user password. */
function fromMemory(data, userpw)
{
  var bigarray = caml_ba_from_typed_array(data);
  var r = cpdflib.cpdflib.fromMemory(bigarray, userpw);
  checkError();
  return r;
}

/** Loads a file from memory, given a pointer and a length, and the user
password, but lazily like fromFileLazy. */
function fromMemoryLazy(data, userpw)
{
  var bigarray = caml_ba_from_typed_array(data);
  var r = cpdflib.cpdflib.fromMemoryLazy(bigarray, userpw);
  checkError();
  return r;
}

/** To enumerate the list of currently allocated PDFs, call startEnumeratePDFs
which gives the number, n, of PDFs allocated, then enumeratePDFsInfo and
enumeratePDFsKey with index numbers from 0...(n - 1). Call endEnumeratePDFs to
clean up. */
function startEnumeratePDFs()
{
  var r = cpdflib.cpdflib.startEnumeratePDFs();
  checkError();
  return r;
}

/** To enumerate the list of currently allocated PDFs, call startEnumeratePDFs
which gives the number, n, of PDFs allocated, then enumeratePDFsInfo and
enumeratePDFsKey with index numbers from 0...(n - 1). Call endEnumeratePDFs to
clean up. */
function enumeratePDFsKey(n)
{
  var r = cpdflib.cpdflib.enumeratePDFsKey(n);
  checkError();
  return r;
}

/** To enumerate the list of currently allocated PDFs, call startEnumeratePDFs
which gives the number, n, of PDFs allocated, then enumeratePDFsInfo and
enumeratePDFsKey with index numbers from 0...(n - 1). Call endEnumeratePDFs to
clean up. */
function enumeratePDFsInfo(n)
{
  var r = cpdflib.cpdflib.enumeratePDFsInfo(n);
  checkError();
  return caml_jsstring_of_string(r);
}

/** To enumerate the list of currently allocated PDFs, call startEnumeratePDFs
which gives the number, n, of PDFs allocated, then enumeratePDFsInfo and
enumeratePDFsKey with index numbers from 0...(n - 1). Call endEnumeratePDFs to
clean up. */
function endEnumeratePDFs()
{
  cpdflib.cpdflib.endEnumeratePDFs();
  checkError();
}

/** Converts a figure in centimetres to points (72 points to 1 inch) */
function ptOfCm(i)
{
  var r = cpdflib.cpdflib.ptOfCm(i);
  checkError();
  return r;
}

/** Converts a figure in millimetres to points (72 points to 1 inch) */
function ptOfMm(i)
{
  var r = cpdflib.cpdflib.ptOfMm(i);
  checkError();
  return r;
}

/** Converts a figure in inches to points (72 points to 1 inch) */
function ptOfIn(i)
{
  var r = cpdflib.cpdflib.ptOfIn(i);
  checkError();
  return r;
}


/** Converts a figure in points to centimetres (72 points to 1 inch) */
function cmOfPt(i)
{
  var r = cpdflib.cpdflib.cmOfPt(i);
  checkError();
  return r;
}

/** Converts a figure in points to millimetres (72 points to 1 inch) */
function mmOfPt(i)
{
  var r = cpdflib.cpdflib.mmOfPt(i);
  checkError();
  return r;
}

/** Converts a figure in points to inches (72 points to 1 inch) */
function inOfPt(i)
{
  var r = cpdflib.cpdflib.inOfPt(i);
  checkError();
  return r;
}

/** Parses a page specification with reference to a given PDF (the PDF is
supplied so that page ranges which reference pages which do not exist are
rejected). */
function parsePagespec(pdf, pagespec)
{
  var r = cpdflib.cpdflib.parsePagespec(pdf, caml_string_of_jsstring(pagespec));
  var arr = array_of_range(r);
  deleterange(r);
  checkError();
  return arr;
}

/** Validates a page specification so far as is possible in the absence of
the actual document. Result is true if valid. */
function validatePagespec(pagespec)
{
  var r = cpdflib.cpdflib.validatePagespec(caml_string_of_jsstring(pagespec));
  checkError();
  return r;
}

/** Builds a page specification from a page range. For example, the range
containing 1,2,3,6,7,8 in a document of 8 pages might yield "1-3,6-end" */
function stringOfPagespec(pdf, r)
{
  var rn = range_of_array(r);
  var ret = caml_jsstring_of_string(cpdflib.cpdflib.stringOfPagespec(pdf, rn));
  deleterange(rn);
  checkError();
  return ret;
}

/** Creates a range with no pages in. */
function blankRange()
{
  var rn = cpdflib.cpdflib.blankRange();
  var r = array_of_range(rn);
  deleterange(rn);
  checkError();
  return r;
}

/** Builds a range from one page to another inclusive. For example, range(3,7)
gives the range 3,4,5,6,7 */
function range(f, t)
{
  var rn = cpdflib.cpdflib.range(f, t);
  var r = array_of_range(rn);
  deleterange(rn);
  checkError();
  return r;
}

/** The range containing all the pages in a given document. */
function all(pdf)
{
  var rn = cpdflib.cpdflib.all(pdf);
  var r = array_of_range(rn);
  deleterange(rn);
  checkError();
  return r;
}

/** Makes a range which contains just the even pages of another range. */
function even(r_in)
{
  var ri = range_of_array(r_in);
  var rn = cpdflib.cpdflib.even(ri);
  var r = array_of_range(rn);
  deleterange(rn);
  deleterange(ri);
  checkError();
  return r;
}

/** Makes a range which contains just the odd pages of another range. */
function odd(r_in)
{
  var ri = range_of_array(r_in);
  var rn = cpdflib.cpdflib.odd(ri);
  var r = array_of_range(rn);
  deleterange(rn);
  deleterange(ri);
  checkError();
  return r;
}

/** Makes the union of two ranges giving a range containing the pages in range
a and range b. */
function rangeUnion(a, b)
{
  var ra = range_of_array(a);
  var rb = range_of_array(b);
  var rn = cpdflib.cpdflib.rangeUnion(ra, rb);
  var r = array_of_range(rn);
  deleterange(rn);
  deleterange(ra);
  deleterange(rb);
  checkError();
  return r;
}

/** Makes the difference of two ranges, giving a range containing all the
pages in a except for those which are also in b. */
function difference(a, b)
{
  var ra = range_of_array(a);
  var rb = range_of_array(b);
  var rn = cpdflib.cpdflib.difference(ra, rb);
  var r = array_of_range(rn);
  deleterange(rn);
  deleterange(ra);
  deleterange(rb);
  checkError();
  return r;
}

/** Deduplicates a range, making a new one. */
function removeDuplicates(a)
{
  var rn = range_of_array(a);
  var rdup = cpdflib.cpdflib.removeDuplicates(rn);
  var r = array_of_range(rdup);
  deleterange(rn);
  deleterange(rdup);
  checkError();
  return r;
}

/** Gives the number of pages in a range. */
function rangeLength(r)
{
  var rn = range_of_array(r);
  var r_out = cpdflib.cpdflib.rangeLength(rn);
  deleterange(rn);
  checkError();
  return r_out;
}

/** Gets the page number at position n in a range, where n runs from 0 to
rangeLength - 1. */
function rangeGet(r, n)
{
  var rn = range_of_array(r);
  var r_out = cpdflib.cpdflib.rangeGet(rn, n);
  deleterange(rn);
  checkError();
  return r_out;
}

/** Adds the page to a range, if it is not already there. */
function rangeAdd(r, page)
{
  var rn = range_of_array(r)
  var r2 = cpdflib.cpdflib.rangeAdd(rn, page);
  var rout = array_of_range(r2);
  deleterange(rn);
  deleterange(r2);
  checkError();
  return rout;
}

/** Returns true if the page is in the range, false otherwise. */
function isInRange(r, page)
{
  var rn = range_of_array(r);
  var ret = cpdflib.cpdflib.isInRange(rn, page);
  deleterange(rn);
  checkError();
  return ret;
}

/** Returns the number of pages in a PDF. */
function pages(pdf)
{
  var r = cpdflib.cpdflib.pages(pdf);
  checkError();
  return r;
}

/** Returns the number of pages in a given PDF, with given user password. It
tries to do this as fast as possible, without loading the whole file. */
function pagesFast(password, filename)
{
  var r = cpdflib.cpdflib.pagesFast(caml_string_of_jsstring(password), caml_string_of_jsstring(filename));
  checkError();
  return r;
}

/** Writes the file to a given filename. If linearize is true, it will be
linearized if a linearizer is available. If make_id is true, it will be
given a new ID. */
function toFile(pdf, filename, linearize, make_id)
{
  cpdflib.cpdflib.toFile(pdf, caml_string_of_jsstring(filename), linearize, make_id);
  checkError();
}

/** Writes the file to a given filename. If make_id is true, it will be given
a new ID.  If preserve_objstm is true, existing object streams will be
preserved. If generate_objstm is true, object streams will be generated even if
not originally present. If compress_objstm is true, object streams will be
compressed (what we usually want). WARNING: the pdf argument will be invalid
after this call, and should be not be used again. */
function toFileExt(pdf, filename, linearize, make_id, preserve_objstm, create_objstm, compress_objstm)
{
  cpdflib.cpdflib.toFileExt(pdf, caml_string_of_jsstring(filename), linearize, make_id, preserve_objstm, create_objstm, compress_objstm);
  checkError();
}

/** Writes a PDF file and returns as an array of bytes. */
function toMemory(pdf, linearize, make_id)
{
  var r = cpdflib.cpdflib.toMemory(pdf, linearize, make_id);
  checkError();
  return r.data;
}

/** Returns true if a document is encrypted, false otherwise. */
function isEncrypted(pdf)
{
  var r = cpdflib.cpdflib.isEncrypted(pdf);
  checkError();
  return r;
}

/** Attempts to decrypt a PDF using the given user password. An exception is
raised if the decryption fails. */
function decryptPdf(pdf, userpw)
{
  cpdflib.cpdflib.decryptPdf(pdf, caml_string_of_jsstring(userpw));
  checkError();
}

/** Attempts to decrypt a PDF using the given owner password. Raises an
exception if the decryption fails. */
function decryptPdfOwner(pdf, ownerpw)
{
  cpdflib.cpdflib.decryptPdfOwner(pdf, caml_string_of_jsstring(ownerpw));
  checkError();
}

/** Cannot edit the document */
var noEdit = 0;

/** Cannot print the document */
var noPrint = 1;

/** Cannot copy the document */
var noCopy = 2;

/** Cannot annotate the document */
var noAnnot = 3;

/** Cannot edit forms in the document */
var noForms = 4;

/** Cannot extract information */
var noExtract = 5;

/** Cannot assemble into a bigger document */
var noAssemble = 6;

/** Cannot print high quality */
var noHqPrint = 7;

/** 40 bit RC4 encryption */
var pdf40bit = 0;

/** 128 bit RC4 encryption */
var pdf128bit = 1;

/** 128 bit AES encryption, do not encrypt metadata */
var aes128bitfalse = 2;

/** 128 bit AES encryption, encrypt metadata */
var aes128bittrue = 3;

/** Deprecated. Do not use for new files */
var aes256bitfalse = 4;

/** Deprecated. Do not use for new files */
var aes256bittrue = 5;

/** 256 bit AES encryption, do not encrypt metadata */
var aes256bitisofalse = 6;

/** 256 bit AES encryption, encrypt metadata */
var aes256bitisotrue = 7;

/** Writes a file as encrypted. */
function toFileEncrypted(pdf, encryption_method, permissions, ownerpw, userpw, linearize, makeid, filename)
{
  var ps = [0].concat(permissions);
  cpdflib.cpdflib.toFileEncrypted(pdf, encryption_method, ps,
                               caml_string_of_jsstring(ownerpw), caml_string_of_jsstring(userpw), linearize, makeid,
                               caml_string_of_jsstring(filename));
  checkError();
}

/** Writes a file as encrypted with extra parameters. WARNING: the pdf argument
will be invalid after this call, and should not be used again. */
function toFileEncryptedExt(pdf, encryption_method, permissions, ownerpw, userpw, linearize, makeid, preserve_objstm, generate_objstm, compress_objstm, filename)
{
  var ps = [0].concat(permissions);
  cpdflib.cpdflib.toFileEncryptedExt(pdf, encryption_method, ps,
                                  caml_string_of_jsstring(ownerpw), caml_string_of_jsstring(userpw),
                                  linearize, makeid, preserve_objstm, generate_objstm, compress_objstm,
                                  caml_string_of_jsstring(filename));
  checkError();
}

/** Returns true if the given permission (restriction) is present. */
function hasPermission(pdf, permission)
{
  var r = cpdflib.cpdflib.hasPermission(pdf, permission);
  checkError();
  return r;
}

/** Returns the encryption method currently in use on a document. */
function encryptionKind(pdf)
{
  var r = cpdflib.cpdflib.encryptionKind(pdf);
  checkError();
  return r;
}

// CHAPTER 2. Merging and Splitting

/** Given a list of PDFs, merges the files into a new one, which is returned. */
function mergeSimple(pdfs)
{
  var arr2 = [0].concat(pdfs);
  var r = cpdflib.cpdflib.mergeSimple(arr2);
  checkError();
  return r;
}

/** Merges the PDFs. If retain_numbering is true page labels are not
rewritten. If remove_duplicate_fonts is true, duplicate fonts are merged.
This is useful when the source documents for merging originate from the same
source. */
function merge(pdfs, retain_numbering, remove_duplicate_fonts)
{
  var arr2 = [0].concat(pdfs);
  var r = cpdflib.cpdflib.merge(arr2, retain_numbering, remove_duplicate_fonts);
  checkError();
  return r;
}

/** The same as merge, except that it has an additional argument - a list of
page ranges. This is used to select the pages to pick from each PDF. This
avoids duplication of information when multiple discrete parts of a source PDF
are included. */
function mergeSame(pdfs, retain_numbering, remove_duplicate_fonts, ranges)
{
  var arr2 = [0].concat(pdfs);
  var nativeranges = [];
  for (var x = 0; x < ranges.length; x++)
  {
    nativeranges.push(range_of_array(ranges[x]));
  }
  var ranges2 = [0].concat(nativeranges);
  var r = cpdflib.cpdflib.mergeSame(arr2, retain_numbering, remove_duplicate_fonts, ranges2);
  for (var y = 0; y < nativeranges.length; y++)
  {
    deleterange(nativeranges[y]);
  }
  checkError();
  return r;
}

/** Returns a new document with just those pages in the page range. */
function selectPages(pdf, r)
{
  var rn = range_of_array(r);
  var r_out = cpdflib.cpdflib.selectPages(pdf, rn);
  deleterange(rn);
  checkError();
  return r_out;
}

// CHAPTER 3. Pages

/** Scales the page dimensions and content by the given scale, about (0, 0).
Other boxes (crop etc. are altered as appropriate) */
function scalePages(pdf, range, sx, sy)
{
  var rn = range_of_array(range);
  cpdflib.cpdflib.scalePages(pdf, rn, sx, sy);
  deleterange(rn);
  checkError();
}

/** Scales the content to fit new page dimensions (width x height) multiplied
by scale (typically 1.0). Other boxes (crop etc. are altered as appropriate). */
function scaleToFit(pdf, range, sx, sy, scale)
{
  var rn = range_of_array(range);
  cpdflib.cpdflib.scaleToFit(pdf, rn, sx, sy, scale);
  deleterange(rn);
  checkError();
}

/** A0 Portrait paper */
var a0portrait = 0;

/** A1 Portrait paper */
var a1portrait = 1;

/** A2 Portrait paper */
var a2portrait = 2;

/** A3 Portrait paper */
var a3portrait = 3;

/** A4 Portrait paper */
var a4portrait = 4;

/** A5 Portrait paper */
var a5portrait = 5;

/** A0 Landscape paper */
var a0landscape = 6;

/** A1 Landscape paper */
var a1landscape = 7;

/** A2 Landscape paper */
var a2landscape = 8;

/** A3 Landscape paper */
var a3landscape = 9;

/** A4 Landscape paper */
var a4landscape = 10;

/** A5 Landscape paper */
var a5landscape = 11;

/** US Letter Portrait paper */
var usletterportrait = 12;

/** US Letter Landscape paper */
var usletterlandscape = 13;

/** US Legal Portrait paper */
var uslegalportrait = 14;

/** US Legal Landscape paper */
var uslegallandscape = 15;

/** Scales the page content to fit the given page size, possibly multiplied by
scale (typically 1.0) */
function scaleToFitPaper(pdf, range, papersize, s)
{
  var rn = range_of_array(range);
  cpdflib.cpdflib.scaleToFitPaper(pdf, rn, papersize, s);
  deleterange(rn);
  checkError();
}

/** Absolute centre */
var posCentre = 0;

/** Absolute left */
var posLeft = 1;

/** Absolute right */
var posRight = 2;

/** The top centre of the page */
var top = 3;

/** The top left of the page */
var topLeft = 4;

/** The top right of the page */
var topRight = 5;

/** The left hand side of the page, halfway down */
var left = 6;

/** The bottom left of the page */
var bottomLeft = 7;

/** The bottom middle of the page */
var bottom = 8;

/** The bottom right of the page */
var bottomRight = 9;

/** The right hand side of the page, halfway down */
var right = 10;

/** Diagonal, bottom left to top right */
var diagonal = 11;

/** Diagonal, top left to bottom right */
var reversediagonal = 12;

/** Positions on the page. Used for scaling about a point, and adding text.

A position is an anchor and zero or one or two parameters. Constructors are provided.

posCentre: Two parameters, x and y
posLeft: Two parameters, x and y
posRight: Two parameters, x and y
top: One parameter - distance from top
topLeft: One parameter - distance from top left
topRight: One parameter - distance from top right
left: One parameter - distance from left middle
bottomLeft: One parameter - distance from bottom left
bottom: One parameter - distance from bottom
bottomRight: One parameter - distance from bottom right
right: One parameter - distance from right
diagonal: Zero parameters
reverseDiagonal: Zero parameters */
function Position(anchor, p1, p2)
{
  this.anchor = anchor;
  this.p1 = p1; //may be undefined
  this.p2 = p2; //may be undefined
}

/** Scales the contents of the pages in the range about the point given by
the position, by the scale given. */
function scaleContents(pdf, range, position, scale)
{
  var rn = range_of_array(range);
  cpdflib.cpdflib.scaleContents(pdf, rn, position.anchor, position.p1, position.p2, scale);
  deleterange(rn);
  checkError();
}

/** Shifts the content of the pages in the range. */
function shiftContents(pdf, range, dx, dy)
{
  var rn = range_of_array(range);
  cpdflib.cpdflib.shiftContents(pdf, rn, dx, dy);
  deleterange(rn);
  checkError();
}

/** Changes the viewing rotation to an absolute value. Appropriate rotations
are 0, 90, 180, 270. */
function rotate(pdf, range, rotation)
{
  var rn = range_of_array(range);
  cpdflib.cpdflib.rotate(pdf, rn, rotation);
  deleterange(rn);
  checkError();
}

/** Rotates the content about the centre of the page by the given number of
degrees, in a clockwise direction. */
function rotateBy(pdf, range, rotation)
{
  var rn = range_of_array(range);
  cpdflib.cpdflib.rotateBy(pdf, rn, rotation);
  deleterange(rn);
  checkError();
}

/** Rotates the content about the centre of the page by the given number of
degrees, in a clockwise direction. */
function rotateContents(pdf, range, angle)
{
  var rn = range_of_array(range);
  cpdflib.cpdflib.rotateContents(pdf, rn, angle);
  deleterange(rn);
  checkError();
}

/** Changes the viewing rotation of the pages in the range, counter-rotating
the dimensions and content such that there is no visual change. */
function upright(pdf, range)
{
  var rn = range_of_array(range);
  cpdflib.cpdflib.upright(pdf, rn);
  deleterange(rn);
  checkError();
}

/** Flips horizontally the pages in the range. */
function hFlip(pdf, range)
{
  var rn = range_of_array(range);
  cpdflib.cpdflib.hFlip(pdf, rn);
  deleterange(rn);
  checkError();
}

/** Flips vertically the pages in the range. */
function vFlip(pdf, range)
{
  var rn = range_of_array(range);
  cpdflib.cpdflib.vFlip(pdf, rn);
  deleterange(rn);
  checkError();
}

/** Crops a page, replacing any existing crop box. The dimensions are in
points. */
function crop(pdf, range, x, y, w, h)
{
  var rn = range_of_array(range);
  cpdflib.cpdflib.crop(pdf, rn, x, y, w, h);
  deleterange(rn);
  checkError();
}

/** Removes any crop box from pages in the range. */
function removeCrop(pdf, range)
{
  var rn = range_of_array(range);
  cpdflib.cpdflib.removeCrop(pdf, rn);
  deleterange(rn);
  checkError();
}

/** Removes any trim box from pages in the range. */
function removeTrim(pdf, range)
{
  var rn = range_of_array(range);
  cpdflib.cpdflib.removeTrim(pdf, rn);
  deleterange(rn);
  checkError();
}

/** Removes any art box from pages in the range. */
function removeArt(pdf, range)
{
  var rn = range_of_array(range);
  cpdflib.cpdflib.removeArt(pdf, rn);
  deleterange(rn);
  checkError();
}

/** Removes any bleed box from pages in the range. */
function removeBleed(pdf, range)
{
  var rn = range_of_array(range);
  cpdflib.cpdflib.removeBleed(pdf, rn);
  deleterange(rn);
  checkError();
}

/** Adds trim marks to the given pages, if the trimbox exists. */
function trimMarks(pdf, range)
{
  var rn = range_of_array(range);
  cpdflib.cpdflib.trimMarks(pdf, rn);
  deleterange(rn);
  checkError();
}

/** Shows the boxes on the given pages, for debug. */
function showBoxes(pdf, range)
{
  var rn = range_of_array(range);
  cpdflib.cpdflib.showBoxes(pdf, rn);
  deleterange(rn);
  checkError();
}

/** Makes a given box a 'hard box' i.e clips it explicitly. */
function hardBox(pdf, range, boxname)
{
  var rn = range_of_array(range);
  cpdflib.cpdflib.hardBox(pdf, rn, caml_string_of_jsstring(boxname));
  deleterange(rn);
  checkError();
}

// CHAPTER 4. Encryption

// CHAPTER 5. Compression

 /** Compresses any uncompressed streams in the given PDF using the Flate
algorithm. */
function compress(pdf)
{
  cpdflib.cpdflib.compress(pdf);
  checkError();
}

/** Decompresses any streams in the given PDF, so long as the compression
method is supported. */
function decompress(pdf)
{
  cpdflib.cpdflib.decompress(pdf);
  checkError();
}

/** Squeezes a pdf in memory. */
function squeezeInMemory(pdf)
{
  cpdflib.cpdflib.squeezeInMemory(pdf);
  checkError();
}

// CHAPTER 6. Bookmarks

/** Starts the bookmark retrieval process for a given PDF. */
function startGetBookmarkInfo(pdf)
{
  cpdflib.cpdflib.startGetBookmarkInfo(pdf);
  checkError();
}

/** Gets the number of bookmarks for the PDF given to startGetBookmarkInfo. */
function numberBookmarks()
{
  var r = cpdflib.cpdflib.numberBookmarks();
  checkError();
  return r;
}

/** Gets the bookmark level for the given bookmark (0...(n - 1)). */
function getBookmarkLevel(n)
{
  var r = cpdflib.cpdflib.getBookmarkLevel(n);
  checkError();
  return r;
}

/** Gets the bookmark target page for the given PDF (which must be the same
as the PDF passed to startSetBookmarkInfo) and bookmark (0...(n - 1)). */
function getBookmarkPage(pdf, n)
{
  var r = cpdflib.cpdflib.getBookmarkPage(pdf, n);
  checkError();
  return r;
}

/** Returns the text of bookmark (0...(n - 1)). */
function getBookmarkText(n)
{
  var r = caml_jsstring_of_string(cpdflib.cpdflib.getBookmarkText(n));
  checkError();
  return r;
}

/** True if the bookmark is open. */
function getBookmarkOpenStatus(n)
{
  var r = cpdflib.cpdflib.getBookmarkOpenStatus(n);
  checkError();
  return r;
}

/** Ends the bookmark retrieval process, cleaning up. */
function endGetBookmarkInfo()
{
  cpdflib.cpdflib.endGetBookmarkInfo();
  checkError();
}

/** Starts the bookmark setting process for n bookmarks. */
function startSetBookmarkInfo(n)
{
  cpdflib.cpdflib.startSetBookmarkInfo(n);
  checkError();
}

/** Set bookmark level for the given bookmark (0...(n - 1)). */
function setBookmarkLevel(a, b)
{
  cpdflib.cpdflib.setBookmarkLevel(a, b);
  checkError();
}

/** Sets the bookmark target page for the given PDF (which must be the same as
the PDF to be passed to endSetBookmarkInfo) and bookmark (0...(n - 1)). */
function setBookmarkPage(pdf, a, b)
{
  cpdflib.cpdflib.setBookmarkPage(pdf, a, b);
  checkError();
}

/** Sets the open status of bookmark (0...(n - 1)). */
function setBookmarkOpenStatus(a, b)
{
  cpdflib.cpdflib.setBookmarkOpenStatus(a, b);
  checkError();
}

/** Sets the text of bookmark (0...(n - 1)). */
function setBookmarkText(n, t)
{
  cpdflib.cpdflib.setBookmarkText(n, caml_string_of_jsstring(t));
  checkError();
}

/** Ends the bookmark setting process, writing the bookmarks to the given
PDF. */
function endSetBookmarkInfo(pdf)
{
  cpdflib.cpdflib.endSetBookmarkInfo(pdf);
  checkError();
}

/** Returns the bookmark data in JSON format. */
function getBookmarksJSON(pdf)
{
  var r = cpdflib.cpdflib.getBookmarksJSON(pdf).data;
  checkError();
  return r;
}

/** Sets the bookmarks from JSON bookmark data. */
function setBookmarksJSON(pdf, data)
{
  var bigarray = caml_ba_from_typed_array(data);
  cpdflib.cpdflib.setBookmarksJSON(pdf, bigarray);
  checkError();
}

/** Typesets a table of contents from existing bookmarks and prepends it to
the document. If bookmark is set, the table of contents gets its own
bookmark. */
function tableOfContents(pdf, font, fontsize, title, bookmark)
{
  cpdflib.cpdflib.tableOfContents(pdf, font, fontsize, caml_string_of_jsstring(title), bookmark);
  checkError();
}

// CHAPTER 7. Presentations

// CHAPTER 8. Logos, Watermarks and Stamps
   
/** A stamping function with extra features. - isover true, pdf goes over pdf2,
isover false, pdf goes under pdf2 - scale_stamp_to_fit scales the stamp to fit
the page - pos gives the position to put the stamp - relative_to_cropbox: if
true, pos is relative to cropbox not mediabox. */
function stampOn(stamp_pdf, pdf, range)
{
  var rn = range_of_array(range);
  cpdflib.cpdflib.stampOn(stamp_pdf, pdf, rn);
  deleterange(rn);
  checkError();
}

/** Stamps stamp_pdf under all the pages in the document which are in the
range. The stamp is placed with its origin at the origin of the target
document. */
function stampUnder(stamp_pdf, pdf, range)
{
  var rn = range_of_array(range);
  cpdflib.cpdflib.stampUnder(stamp_pdf, pdf, rn);
  deleterange(rn);
  checkError();
}

/** A stamping function with extra features. - isover true, pdf goes over
pdf2, isover false, pdf goes under pdf2 - scale_stamp_to_fit scales the
stamp to fit the page - pos gives the position to put the stamp -
relative_to_cropbox: if true, pos is relative to cropbox not mediabox. */
function stampExtended(pdf, pdf2, range, isover, scale_stamp_to_fit, position, relative_to_cropbox)
{
  var rn = range_of_array(range);
  cpdflib.cpdflib.stampExtended(pdf, pdf2, rn, isover, scale_stamp_to_fit, position.p1, position.p2, position.anchor, relative_to_cropbox);
  deleterange(rn);
  checkError();
}

/** Combines the PDFs page-by-page, putting each page of 'over' over each page
of 'under'. */
function combinePages(under, over)
{
  var r = cpdflib.cpdflib.combinePages(under, over);
  checkError();
  return r;
}

/** Times Roman */
var timesRoman = 0;

/** Times Bold */
var timesBold = 1;

/** Times Italic */
var timesItalic = 2;

/** Times Bold Italic */
var timesBoldItalic = 3;

/** Helvetica */
var helvetica = 4;

/** Helvetica Bold */
var helveticaBold = 5;

/** Helvetica Oblique */
var helveticaOblique = 6;

/** Helvetica Bold Oblique */
var helveticaBoldOblique = 7;

/** Courier */
var courier = 8;

/** Courier Bold */
var courierBold = 9;

/** Courier Oblique */
var courierOblique = 10;

/** Courier Bold Oblique */
var courierBoldOblique = 11;

/** Left justify */
var leftJustify = 0;

/** Centre justify */
var centreJustify = 1;

/** Right justify */
var rightJustify = 2;

/** Adds text to the pages in the given range. */
function addText(metrics, pdf, range, text, position, linespacing,
                 bates, font, fontsize, r, g, b, underneath, relative_to_cropbox, outline,
                 opacity, justification, midline, topline, filename, linewidth, embed_fonts)
{
  var rn = range_of_array(range);
  cpdflib.cpdflib.addText(metrics, pdf, rn, caml_string_of_jsstring(text), position.anchor, position.p1, position.p2,
                       linespacing, bates, font, fontsize, r, g, b, underneath, relative_to_cropbox, outline,
                       opacity, justification, midline, topline, caml_string_of_jsstring(filename),
                       linewidth, embed_fonts);
  deleterange(rn);
  checkError();
}

/** Adds text with most parameters default. */
function addTextSimple(pdf, range, text, position, font, fontsize)
{
  var rn = range_of_array(range);
  cpdflib.cpdflib.addText(0, pdf, rn, caml_string_of_jsstring(text), position.anchor, position.p1, position.p2, 1.0, 0, font, fontsize, 0, 0, 0, 1, 1, 1, 1.0, leftJustify, 1, 1, caml_string_of_jsstring(""), 0.0, 1);
  deleterange(rn);
  checkError();
}

/** Removes any text added by cpdf from the given pages. */
function removeText(pdf, range)
{
  var rn = range_of_array(range);
  cpdflib.cpdflib.removeText(pdf, rn);
  deleterange(rn);
  checkError();
}

/** Returns the width of a given string in the given font in thousandths of a
point. */
function textWidth(font, text)
{
  var r = cpdflib.cpdflib.textWidth(font, caml_string_of_jsstring(text));
  checkError();
  return r;
}

/** Adds page content before (if true) or after (if false) the existing
content to pages in the given range in the given PDF. */
function addContent(content, before, pdf, range)
{
  var rn = range_of_array(range);
  cpdflib.cpdflib.addContent(caml_string_of_jsstring(content), before, pdf, rn);
  deleterange(rn);
  checkError();
}

/** Stamps stamp_pdf onto the pages in the given range in pdf as a shared Form
XObject. The name of the newly-created XObject is returned. */
function stampAsXObject(pdf, range, stamp_pdf)
{
  var rn = range_of_array(range);
  var r = caml_jsstring_of_string(cpdflib.cpdflib.stampAsXObject(pdf, rn, stamp_pdf));
  deleterange(rn);
  checkError();
  return r;
}

// CHAPTER 9. Multipage facilities

/** Imposes a PDF. There are two modes: imposing x * y, or imposing to fit a
page of size x * y. This is controlled by fit. Columns imposes by columns
rather than rows. rtl is right-to-left, btt bottom-to-top. Center is unused
for now. Margin is the margin around the output, spacing the spacing between
imposed inputs. */
function impose(pdf, x, y, fit, columns, rtl, btt, center, margin, spacing, linewidth)
{
  var r = cpdflib.cpdflib.impose(pdf, x, y, fit, columns, rtl, btt, center, margin, spacing, linewidth);
  checkError();
  return r;
}

/** Imposes a document two up. twoUp does so by shrinking the page size, to fit
two pages on one. */
function twoUp(pdf)
{
  var r = cpdflib.cpdflib.twoUp(pdf);
  checkError();
  return r;
}

/** Impose a document two up. twoUpStack does so by doubling the page size,
to fit two pages on one. */
function twoUpStack(pdf)
{
  var r = cpdflib.cpdflib.twoUpStack(pdf);
  checkError();
  return r;
}

/** Adds a blank page before each page in the given range. */
function padBefore(pdf, range)
{
  var rn = range_of_array(range);
  cpdflib.cpdflib.padBefore(pdf, rn);
  deleterange(rn);
  checkError();
}

/** Adds a blank page after every n pages. */
function padAfter(pdf, range)
{
  var rn = range_of_array(range);
  cpdflib.cpdflib.padAfter(pdf, rn);
  deleterange(rn);
  checkError();
}

/** Adds a blank page after every n pages. */
function padEvery(pdf, n)
{
  cpdflib.cpdflib.padEvery(pdf, n);
  checkError();
}

/** Adds pages at the end to pad the file to a multiple of n pages in
length. */
function padMultiple(pdf, n)
{
  cpdflib.cpdflib.padMultiple(pdf, n);
  checkError();
}

/** Adds pages at the beginning to pad the file to a multiple of n pages in
length. */
function padMultipleBefore(pdf, n)
{
  cpdflib.cpdflib.padMultipleBefore(pdf, n);
  checkError();
}

// CHAPTER 10. Annotations 

/** Returns the annotations from a PDF in JSON format. */
function annotationsJSON(pdf)
{
  var r = cpdflib.cpdflib.annotationsJSON(pdf);
  checkError();
  return r.data;
}

// CHAPTER 11. Document Information and Metadata

/** Finds out if a document is linearized as quickly as possible without
loading it. */
function isLinearized(filename)
{
  var r = cpdflib.cpdflib.isLinearized(caml_string_of_jsstring(filename));
  checkError();
  return r;
}

/** Returns the minor version number of a document. */
function getVersion(pdf)
{
  var r = cpdflib.cpdflib.getVersion(pdf);
  checkError();
  return r;
}

/** Returns the major version number of a document. */
function getMajorVersion(pdf)
{
  var r = cpdflib.cpdflib.getMajorVersion(pdf);
  checkError();
  return r;
}

/** Returns the title of a document. */
function getTitle(pdf)
{
  var r = caml_jsstring_of_string(cpdflib.cpdflib.getTitle(pdf));
  checkError();
  return r;
}

/** Returns the author of a document. */
function getAuthor(pdf)
{
  var r = caml_jsstring_of_string(cpdflib.cpdflib.getAuthor(pdf));
  checkError();
  return r;
}

/** Returns the subject of a document. */
function getSubject(pdf)
{
  var r = caml_jsstring_of_string(cpdflib.cpdflib.getSubject(pdf));
  checkError();
  return r;
}

/** Returns the keywords of a document. */
function getKeywords(pdf)
{
  var r = caml_jsstring_of_string(cpdflib.cpdflib.getKeywords(pdf));
  checkError();
  return r;
}

/** Returns the creator of a document. */
function getCreator(pdf)
{
  var r = caml_jsstring_of_string(cpdflib.cpdflib.getCreator(pdf));
  checkError();
  return r;
}

/** Returns the producer of a document. */
function getProducer(pdf)
{
  var r = caml_jsstring_of_string(cpdflib.cpdflib.getProducer(pdf));
  checkError();
  return r;
}

/** Returns the creation date of a document. */
function getCreationDate(pdf)
{
  var r = caml_jsstring_of_string(cpdflib.cpdflib.getCreationDate(pdf));
  checkError();
  return r;
}

/** Returns the modification date of a document. */
function getModificationDate(pdf)
{
  var r = caml_jsstring_of_string(cpdflib.cpdflib.getModificationDate(pdf));
  checkError();
  return r;
}

/** Returns the XMP title of a document. */
function getTitleXMP(pdf)
{
  var r = caml_jsstring_of_string(cpdflib.cpdflib.getTitleXMP(pdf));
  checkError();
  return r;
}

/** Returns the XMP author of a document. */
function getAuthorXMP(pdf)
{
  var r = caml_jsstring_of_string(cpdflib.cpdflib.getAuthorXMP(pdf));
  checkError();
  return r;
}

/** Returns the XMP subject of a document. */
function getSubjectXMP(pdf)
{
  var r = caml_jsstring_of_string(cpdflib.cpdflib.getSubjectXMP(pdf));
  checkError();
  return r;
}

/** Returns the XMP keywords of a document. */
function getKeywordsXMP(pdf)
{
  var r = caml_jsstring_of_string(cpdflib.cpdflib.getKeywordsXMP(pdf));
  checkError();
  return r;
}

/** Returns the XMP creator of a document. */
function getCreatorXMP(pdf)
{
  var r = caml_jsstring_of_string(cpdflib.cpdflib.getCreatorXMP(pdf));
  checkError();
  return r;
}

/** Returns the XMP producer of a document. */
function getProducerXMP(pdf)
{
  var r = caml_jsstring_of_string(cpdflib.cpdflib.getProducerXMP(pdf));
  checkError();
  return r;
}

/** Returns the XMP creation date of a document. */
function getCreationDateXMP(pdf)
{
  var r = caml_jsstring_of_string(cpdflib.cpdflib.getCreationDateXMP(pdf));
  checkError();
  return r;
}

/** Returns the XMP modification date of a document. */
function getModificationDateXMP(pdf)
{
  var r = caml_jsstring_of_string(cpdflib.cpdflib.getModificationDateXMP(pdf));
  checkError();
  return r;
}

/** Sets the title of a document. */
function setTitle(pdf, s)
{
  cpdflib.cpdflib.setTitle(pdf, caml_string_of_jsstring(s));
  checkError();
}

/** Sets the author of a document. */
function setAuthor(pdf, s)
{
  cpdflib.cpdflib.setAuthor(pdf, caml_string_of_jsstring(s));
  checkError();
}

/** Sets the subject of a document. */
function setSubject(pdf, s)
{
  cpdflib.cpdflib.setSubject(pdf, caml_string_of_jsstring(s));
  checkError();
}

/** Sets the keywords of a document. */
function setKeywords(pdf, s)
{
  cpdflib.cpdflib.setKeywords(pdf, caml_string_of_jsstring(s));
  checkError();
}

/** Sets the creator of a document. */
function setCreator(pdf, s)
{
  cpdflib.cpdflib.setCreator(pdf, caml_string_of_jsstring(s));
  checkError();
}

/** Sets the producer of a document. */
function setProducer(pdf, s)
{
  cpdflib.cpdflib.setProducer(pdf, caml_string_of_jsstring(s));
  checkError();
}

/** Sets the creation date of a document. */
function setCreationDate(pdf, s)
{
  cpdflib.cpdflib.setCreationDate(pdf, caml_string_of_jsstring(s));
  checkError();
}

/** Sets the modification date of a document. */
function setModificationDate(pdf, s)
{
  cpdflib.cpdflib.setModificationDate(pdf, caml_string_of_jsstring(s));
  checkError();
}

/** Sets the XMP title of a document. */
function setTitleXMP(pdf, s)
{
  cpdflib.cpdflib.setTitleXMP(pdf, caml_string_of_jsstring(s));
  checkError();
}

/** Sets the XMP author of a document. */
function setAuthorXMP(pdf, s)
{
  cpdflib.cpdflib.setAuthorXMP(pdf, caml_string_of_jsstring(s));
  checkError();
}

/** Sets the XMP author of a document. */
function setSubjectXMP(pdf, s)
{
  cpdflib.cpdflib.setSubjectXMP(pdf, caml_string_of_jsstring(s));
  checkError();
}

/** Sets the XMP keywords of a document. */
function setKeywordsXMP(pdf, s)
{
  cpdflib.cpdflib.setKeywordsXMP(pdf, caml_string_of_jsstring(s));
  checkError();
}

/** Sets the XMP creator of a document. */
function setCreatorXMP(pdf, s)
{
  cpdflib.cpdflib.setCreatorXMP(pdf, caml_string_of_jsstring(s));
  checkError();
}

/** Sets the XMP producer of a document. */
function setProducerXMP(pdf, s)
{
  cpdflib.cpdflib.setProducerXMP(pdf, caml_string_of_jsstring(s));
  checkError();
}

/** Sets the XMP creation date of a document. */
function setCreationDateXMP(pdf, s)
{
  cpdflib.cpdflib.setCreationDateXMP(pdf, caml_string_of_jsstring(s));
  checkError();
}

/** Sets the XMP modification date of a document. */
function setModificationDateXMP(pdf, s)
{
  cpdflib.cpdflib.setModificationDateXMP(pdf, caml_string_of_jsstring(s));
  checkError();
}

/** Returns the components from a PDF date string. */
function getDateComponents(string)
{
  var r = cpdflib.cpdflib.getDateComponents(caml_string_of_jsstring(string));
  checkError();
  return r.slice(1);
}

/** Builds a PDF date string from individual components. */
function dateStringOfComponents(y, m, d, h, min, sec, hour_offset, minute_offset)
{
  var r = caml_jsstring_of_string(cpdflib.cpdflib.dateStringOfComponents(y, m, d, h, min, sec, hour_offset, minute_offset));
  checkError();
  return r;
}

/** Gets the viewing rotation for a given page. */
function getPageRotation(pdf, page)
{
  var r = cpdflib.cpdflib.getPageRotation(pdf, page);
  checkError();
  return r;
}

/** Returns true, if that page has the given box. E.g "/CropBox". */
function hasBox(pdf, page, box)
{
  var r = cpdflib.cpdflib.hasBox(pdf, page, caml_string_of_jsstring(box));
  checkError();
  return r;
}

/** These functions get a box given the document, page number, min x, max x,
min y, max y in points. Only succeeds if such a box exists, as checked by
hasBox. */
function getMediaBox(pdf, pagenumber)
{
  var r = cpdflib.cpdflib.getMediaBox(pdf, pagenumber);
  checkError();
  return r.slice(1);
}

/** These functions get a box given the document, page number, min x, max x,
min y, max y in points. Only succeeds if such a box exists, as checked by
hasBox. */
function getCropBox(pdf, pagenumber)
{
  var r = cpdflib.cpdflib.getCropBox(pdf, pagenumber);
  checkError();
  return r.slice(1);
}

/** These functions get a box given the document, page number, min x, max x,
min y, max y in points. Only succeeds if such a box exists, as checked by
hasBox. */
function getArtBox(pdf, pagenumber)
{
  var r = cpdflib.cpdflib.getArtBox(pdf, pagenumber);
  checkError();
  return r.slice(1);
}

/** These functions get a box given the document, page number, min x, max x,
min y, max y in points. Only succeeds if such a box exists, as checked by
hasBox. */
function getBleedBox(pdf, pagenumber)
{
  var r = cpdflib.cpdflib.getBleedBox(pdf, pagenumber);
  checkError();
  return r.slice(1);
}

/** These functions get a box given the document, page number, min x, max x,
min y, max y in points. Only succeeds if such a box exists, as checked by
hasBox. */
function getTrimBox(pdf, pagenumber)
{
  var r = cpdflib.cpdflib.getTrimBox(pdf, pagenumber);
  checkError();
  return r.slice(1);
}

/** These functions set a box given the document, page range, min x, max x,
min y, max y in points. */
function setMediabox(pdf, range, minx, maxx, miny, maxy)
{
  var rn = range_of_array(range);
  cpdflib.cpdflib.setMediabox(pdf, rn, minx, maxx, miny, maxy);
  deleterange(rn);
  checkError();
}

/** These functions set a box given the document, page range, min x, max x,
min y, max y in points. */
function setCropBox(pdf, range, minx, maxx, miny, maxy)
{
  var rn = range_of_array(range);
  cpdflib.cpdflib.setCropBox(pdf, rn, minx, maxx, miny, maxy);
  deleterange(rn);
  checkError();
}

/** These functions set a box given the document, page range, min x, max x,
min y, max y in points. */
function setTrimBox(pdf, range, minx, maxx, miny, maxy)
{
  var rn = range_of_array(range);
  cpdflib.cpdflib.setTrimBox(pdf, rn, minx, maxx, miny, maxy);
  deleterange(rn);
  checkError();
}

/** These functions set a box given the document, page range, min x, max x,
min y, max y in points. */
function setBleedBox(pdf, range, minx, maxx, miny, maxy)
{
  var rn = range_of_array(range);
  cpdflib.cpdflib.setBleedBox(pdf, rn, minx, maxx, miny, maxy);
  deleterange(rn);
  checkError();
}

/** These functions set a box given the document, page range, min x, max x,
min y, max y in points. */
function setArtBox(pdf, range, minx, maxx, miny, maxy)
{
  var rn = range_of_array(range);
  cpdflib.cpdflib.setArtBox(pdf, rn, minx, maxx, miny, maxy);
  deleterange(rn);
  checkError();
}

/** Marks a document as trapped. */
function markTrapped(pdf)
{
  cpdflib.cpdflib.markTrapped(pdf);
  checkError();
}

/** Marks a document as untrapped. */
function markUntrapped(pdf)
{
  cpdflib.cpdflib.markUntrapped(pdf);
  checkError();
}

/** Marks a document as trapped in XMP metadata. */
function markTrappedXMP(pdf)
{
  cpdflib.cpdflib.markTrappedXMP(pdf);
  checkError();
}

/** Marks a document as untrapped in XMP metadata. */
function markUntrappedXMP(pdf)
{
  cpdflib.cpdflib.markUntrappedXMP(pdf);
  checkError();
}

/** Single page */
var singlePage = 0;

/** One column */
var oneColumn = 1;

/** Two column left */
var twoColumnLeft = 2;

/** Two column right */
var twoColumnRight = 3;

/** Two page left */
var twoPageLeft = 4;

/** Two page right */
var twoPageRight = 5;
  
/** Sets the page layout for a document. */
function setPageLayout(pdf, layout)
{
  cpdflib.cpdflib.setPageLayout(pdf, layout);
  checkError();
}

/** Use none */
var useNone = 0;

/** Use outlines */
var useOutlines = 1;

/** Use thumbs */
var useThumbs = 2;

/** Use OC */
var useOC = 3;

/** Use attachments */
var useAttachments = 4;

/** Sets the page mode for a document. */
function setPageMode(pdf, mode)
{
  cpdflib.cpdflib.setPageMode(pdf, mode);
  checkError();
}

/** Sets the hide toolbar flag. */
function hideToolbar(pdf, flag)
{
  cpdflib.cpdflib.hideToolbar(pdf, flag);
  checkError();
}

/** Sets the hide menubar flag. */
function hideMenubar(pdf, flag)
{
  cpdflib.cpdflib.hideMenubar(pdf, flag);
  checkError();
}

/** Sets the hide window UI flag. */
function hideWindowUi(pdf, flag)
{
  cpdflib.cpdflib.hideWindowUi(pdf, flag);
  checkError();
}

/** Sets the fit window flag. */
function fitWindow(pdf, flag)
{
  cpdflib.cpdflib.fitWindow(pdf, flag);
  checkError();
}

/** Sets the center window flag. */
function centerWindow(pdf, flag)
{
  cpdflib.cpdflib.centerWindow(pdf, flag);
  checkError();
}

/** Sets the display doc title flag. */
function displayDocTitle(pdf, flag)
{
  cpdflib.cpdflib.displayDocTitle(pdf, flag);
  checkError();
}

/** Sets the PDF to open, possibly with zoom-to-fit, at the given page
number. */
function openAtPage(pdf, fit, pagenumber)
{
  cpdflib.cpdflib.openAtPage(pdf, fit, pagenumber);
  checkError();
}

/** Sets the XMP metadata of a document, given a file name. */
function setMetadataFromFile(pdf, filename)
{
  cpdflib.cpdflib.setMetadataFromFile(pdf, caml_string_of_jsstring(filename));
  checkError();
}

/** Sets the XMP metadata from an array of bytes. */
function setMetadataFromByteArray(pdf, data)
{
  var bigarray = caml_ba_from_typed_array(data);
  cpdflib.cpdflib.setMetadataFromByteArray(pdf, bigarray);
  checkError();
}

/** Removes the XMP metadata from a document. */
function removeMetadata(pdf)
{
  cpdflib.cpdflib.removeMetadata(pdf);
  checkError();
}

/** Returns the XMP metadata from a document. */
function getMetadata(pdf)
{
  var r = cpdflib.cpdflib.getMetadata(pdf);
  return r.data;
  checkError();
}

/** Builds fresh XMP metadata as best it can from existing metadata in the
document. */
function createMetadata(pdf)
{
  cpdflib.cpdflib.createMetadata(pdf);
  checkError();
}

/** Sets the metadata date for a PDF. The date is given in PDF date format --
cpdf will convert it to XMP format. The date 'now' means now. */
function setMetadataDate(pdf, date)
{
  cpdflib.cpdflib.setMetadataDate(pdf, caml_string_of_jsstring(date));
  checkError();
}

/** 1, 2, 3... */
var decimalArabic = 0;

/** I, II, III... */
var uppercaseRoman = 1;

/** i, ii, iii... */
var lowercaseRoman = 2;

/** A, B, C... */
var uppercaseLetters = 3;

/** a, b, c... */
var lowercaseLetters = 4;

/** Adds page labels. The prefix is prefix text for each label. The range is
the page range the labels apply to. Offset can be used to shift the numbering
up or down. */
function addPageLabels(pdf, style, prefix, offset, range, progress)
{
  var rn = range_of_array(range);
  cpdflib.cpdflib.addPageLabels(pdf, style, caml_string_of_jsstring(prefix), offset, rn, progress);
  deleterange(rn);
  checkError();
}

/** Removes the page labels from the document. */
function removePageLabels(pdf)
{
  cpdflib.cpdflib.removePageLabels(pdf);
  checkError();
}

/** Calculates the full label string for a given page, and returns it. */
function getPageLabelStringForPage(pdf, pagenumber)
{
  var r = cpdflib.cpdflib.getPageLabelStringForPage(pdf, pagenumber);
  checkError();
  return r;
}

/** Gets page label data. Call startGetPageLabels to find out how many
there are, then use these serial numbers to get the style, prefix, offset
and start value (note not a range). Call endGetPageLabels to clean up.

For example, a document might have five pages of introduction with roman
numerals, followed by the rest of the pages in decimal arabic, numbered from
one:

labelstyle = LowercaseRoman
labelprefix = ""
startpage = 1
startvalue = 1

labelstyle = DecimalArabic
labelprefix = ""
startpage = 6
startvalue = 1 */
function startGetPageLabels(pdf)
{
  var r = cpdflib.cpdflib.startGetPageLabels(pdf);
  checkError();
  return r;
}

/** Gets page label data. Call startGetPageLabels to find out how many
there are, then use these serial numbers to get the style, prefix, offset
and start value (note not a range). Call endGetPageLabels to clean up.

For example, a document might have five pages of introduction with roman
numerals, followed by the rest of the pages in decimal arabic, numbered from
one:

labelstyle = LowercaseRoman
labelprefix = ""
startpage = 1
startvalue = 1

labelstyle = DecimalArabic
labelprefix = ""
startpage = 6
startvalue = 1 */
function getPageLabelStyle(n)
{
  var r = cpdflib.cpdflib.getPageLabelStyle(n);
  checkError();
  return r;
}

/** Gets page label data. Call startGetPageLabels to find out how many
there are, then use these serial numbers to get the style, prefix, offset
and start value (note not a range). Call endGetPageLabels to clean up.

For example, a document might have five pages of introduction with roman
numerals, followed by the rest of the pages in decimal arabic, numbered from
one:

labelstyle = LowercaseRoman
labelprefix = ""
startpage = 1
startvalue = 1

labelstyle = DecimalArabic
labelprefix = ""
startpage = 6
startvalue = 1 */
function getPageLabelPrefix(n)
{
  var r = caml_jsstring_of_string(cpdflib.cpdflib.getPageLabelPrefix(n));
  checkError();
  return r;
}

/** Gets page label data. Call startGetPageLabels to find out how many
there are, then use these serial numbers to get the style, prefix, offset
and start value (note not a range). Call endGetPageLabels to clean up.

For example, a document might have five pages of introduction with roman
numerals, followed by the rest of the pages in decimal arabic, numbered from
one:

labelstyle = LowercaseRoman
labelprefix = ""
startpage = 1
startvalue = 1

labelstyle = DecimalArabic
labelprefix = ""
startpage = 6
startvalue = 1 */
function getPageLabelOffset(n)
{
  var r = cpdflib.cpdflib.getPageLabelOffset(n);
  checkError();
  return r;
}

/** Gets page label data. Call startGetPageLabels to find out how many
there are, then use these serial numbers to get the style, prefix, offset
and start value (note not a range). Call endGetPageLabels to clean up.

For example, a document might have five pages of introduction with roman
numerals, followed by the rest of the pages in decimal arabic, numbered from
one:

labelstyle = LowercaseRoman
labelprefix = ""
startpage = 1
startvalue = 1

labelstyle = DecimalArabic
labelprefix = ""
startpage = 6
startvalue = 1 */
function getPageLabelRange(n)
{
  var r = cpdflib.cpdflib.getPageLabelRange(n);
  checkError();
  return r;
}

/** Gets page label data. Call startGetPageLabels to find out how many
there are, then use these serial numbers to get the style, prefix, offset
and start value (note not a range). Call endGetPageLabels to clean up.

For example, a document might have five pages of introduction with roman
numerals, followed by the rest of the pages in decimal arabic, numbered from
one:

labelstyle = LowercaseRoman
labelprefix = ""
startpage = 1
startvalue = 1

labelstyle = DecimalArabic
labelprefix = ""
startpage = 6
startvalue = 1 */
function endGetPageLabels()
{
  cpdflib.cpdflib.endGetPageLabels();
  checkError();
}

// CHAPTER 12. File Attachments
    
/** Attaches a file to the pdf. It is attached at document level. */
function attachFile(filename, pdf)
{
  cpdflib.cpdflib.attachFile(caml_string_of_jsstring(filename), pdf);
  checkError();
}

/** Attaches a file, given its file name, pdf, and the page number
to which it should be attached. */
function attachFileToPage(filename, pdf, pagenumber)
{
  cpdflib.cpdflib.attachFileToPage(caml_string_of_jsstring(filename), pdf, pagenumber);
  checkError();
}

/** Attaches data from memory, just like attachFile. */
function attachFileFromMemory(data, filename, pdf)
{
  var bigarray = caml_ba_from_typed_array(data);
  var r = cpdflib.cpdflib.attachFileFromMemory(bigarray, caml_string_of_jsstring(filename), pdf);
  checkError();
  return r;
}

/** Attaches to a page from memory, just like attachFileToPage. */
function attachFileToPageFromMemory(data, filename, pdf, pagenumber)
{
  var bigarray = caml_ba_from_typed_array(data);
  var r = cpdflib.cpdflib.attachFileToPageFromMemory(bigarray, caml_string_of_jsstring(filename), pdf, pagenumber);
  checkError();
  return r;
}

/** Removes all page- and document-level attachments from a document. */
function removeAttachedFiles(pdf)
{
  cpdflib.cpdflib.removeAttachedFiles(pdf);
  checkError();
}

/** Lists information about attachments. Call startGetAttachments(pdf) first,
then numberGetAttachments to find out how many there are. Then
getAttachmentName etc. to return each one 0...(n - 1). Finally, call
endGetAttachments to clean up. */
function startGetAttachments(pdf)
{
  cpdflib.cpdflib.startGetAttachments(pdf);
  checkError();
}

/** Lists information about attachments. Call startGetAttachments(pdf) first,
then numberGetAttachments to find out how many there are. Then
getAttachmentName etc. to return each one 0...(n - 1). Finally, call
endGetAttachments to clean up. */
function numberGetAttachments()
{
  var r = cpdflib.cpdflib.numberGetAttachments();
  checkError();
  return r;
}

/** Gets the name of an attachment. */
function getAttachmentName(n)
{
  var r = caml_jsstring_of_string(cpdflib.cpdflib.getAttachmentName(n));
  checkError();
  return r;
}

/** Gets the page number. 0 = document level. */
function getAttachmentPage(n)
{
  var r = cpdflib.cpdflib.getAttachmentPage(n);
  checkError();
  return r;
}

/** Gets the attachment data itself. */
function getAttachmentData(n)
{
  var r = cpdflib.cpdflib.getAttachmentData(n);
  checkError();
  return r.data;
}

/** Cleans up after getting attachments. */
function endGetAttachments()
{
  cpdflib.cpdflib.endGetAttachments();
  checkError();
}

//CHAPTER 13. Images

/** Gets image data, including resolution at all points of use. Call
startGetImageResolution(pdf, min_required_resolution) to begin the process of
obtaining data on all image uses below min_required_resolution, returning the
total number. So, to return all image uses, specify a very high
min_required_resolution. Then, call the other functions giving a serial number
0..n - 1, to retrieve the data. Finally, call endGetImageResolution to clean
up. */
function startGetImageResolution(pdf, min_required_resolution)
{
  var r = cpdflib.cpdflib.startGetImageResolution(pdf, min_required_resolution);
  checkError();
  return r;
}

/** Gets image data, including resolution at all points of use. Call
startGetImageResolution(pdf, min_required_resolution) to begin the process of
obtaining data on all image uses below min_required_resolution, returning the
total number. So, to return all image uses, specify a very high
min_required_resolution. Then, call the other functions giving a serial number
0..n - 1, to retrieve the data. Finally, call endGetImageResolution to clean
up. */
function getImageResolutionPageNumber(n)
{
  var r = cpdflib.cpdflib.getImageResolutionPageNumber(n);
  checkError();
  return r;
}

/** Gets image data, including resolution at all points of use. Call
startGetImageResolution(pdf, min_required_resolution) to begin the process of
obtaining data on all image uses below min_required_resolution, returning the
total number. So, to return all image uses, specify a very high
min_required_resolution. Then, call the other functions giving a serial number
0..n - 1, to retrieve the data. Finally, call endGetImageResolution to clean
up. */
function getImageResolutionImageName(n)
{
  var r = caml_jsstring_of_string(cpdflib.cpdflib.getImageResolutionImageName(n));
  checkError();
  return r;
}

/** Gets image data, including resolution at all points of use. Call
startGetImageResolution(pdf, min_required_resolution) to begin the process of
obtaining data on all image uses below min_required_resolution, returning the
total number. So, to return all image uses, specify a very high
min_required_resolution. Then, call the other functions giving a serial number
0..n - 1, to retrieve the data. Finally, call endGetImageResolution to clean
up. */
function getImageResolutionXPixels(n)
{
  var r = cpdflib.cpdflib.getImageResolutionXPixels(n);
  checkError();
  return r;
}

/** Gets image data, including resolution at all points of use. Call
startGetImageResolution(pdf, min_required_resolution) to begin the process of
obtaining data on all image uses below min_required_resolution, returning the
total number. So, to return all image uses, specify a very high
min_required_resolution. Then, call the other functions giving a serial number
0..n - 1, to retrieve the data. Finally, call endGetImageResolution to clean
up. */
function getImageResolutionYPixels(n)
{
  var r = cpdflib.cpdflib.getImageResolutionYPixels(n);
  checkError();
  return r;
}

/** Gets image data, including resolution at all points of use. Call
startGetImageResolution(pdf, min_required_resolution) to begin the process of
obtaining data on all image uses below min_required_resolution, returning the
total number. So, to return all image uses, specify a very high
min_required_resolution. Then, call the other functions giving a serial number
0..n - 1, to retrieve the data. Finally, call endGetImageResolution to clean
up. */
function getImageResolutionXRes(n)
{
  var r = cpdflib.cpdflib.getImageResolutionXRes(n);
  checkError();
  return r;
}

/** Gets image data, including resolution at all points of use. Call
startGetImageResolution(pdf, min_required_resolution) to begin the process of
obtaining data on all image uses below min_required_resolution, returning the
total number. So, to return all image uses, specify a very high
min_required_resolution. Then, call the other functions giving a serial number
0..n - 1, to retrieve the data. Finally, call endGetImageResolution to clean
up. */
function getImageResolutionYRes(n)
{
  var r = cpdflib.cpdflib.getImageResolutionYRes(n);
  checkError();
  return r;
}

/** Gets image data, including resolution at all points of use. Call
startGetImageResolution(pdf, min_required_resolution) to begin the process of
obtaining data on all image uses below min_required_resolution, returning the
total number. So, to return all image uses, specify a very high
min_required_resolution. Then, call the other functions giving a serial number
0..n - 1, to retrieve the data. Finally, call endGetImageResolution to clean
up. */
function endGetImageResolution()
{
  checkError();
  cpdflib.cpdflib.endGetImageResolution();
}

// CHAPTER 14. Fonts.

/** Retrieves font information. First, call startGetFontInfo(pdf). Now call
numberFonts to return the number of fonts. For each font, call one or more of
getFontPage, getFontName, getFontType, and getFontEncoding giving a serial
number 0..n - 1 to return information. Finally, call endGetFontInfo to clean
up. */
function startGetFontInfo(pdf)
{
  checkError();
  cpdflib.cpdflib.startGetFontInfo(pdf);
}

/** Retrieves font information. First, call startGetFontInfo(pdf). Now call
numberFonts to return the number of fonts. For each font, call one or more of
getFontPage, getFontName, getFontType, and getFontEncoding giving a serial
number 0..n - 1 to return information. Finally, call endGetFontInfo to clean
up. */
function numberFonts()
{
  var r = cpdflib.cpdflib.numberFonts();
  checkError();
  return r;
}

/** Retrieves font information. First, call startGetFontInfo(pdf). Now call
numberFonts to return the number of fonts. For each font, call one or more of
getFontPage, getFontName, getFontType, and getFontEncoding giving a serial
number 0..n - 1 to return information. Finally, call endGetFontInfo to clean
up. */
function getFontPage(n)
{
  var r = cpdflib.cpdflib.getFontPage(n);
  checkError();
  return r;
}

/** Retrieves font information. First, call startGetFontInfo(pdf). Now call
numberFonts to return the number of fonts. For each font, call one or more of
getFontPage, getFontName, getFontType, and getFontEncoding giving a serial
number 0..n - 1 to return information. Finally, call endGetFontInfo to clean
up. */
function getFontName(n)
{
  var r = caml_jsstring_of_string(cpdflib.cpdflib.getFontName(n));
  checkError();
  return r;
}

/** Retrieves font information. First, call startGetFontInfo(pdf). Now call
numberFonts to return the number of fonts. For each font, call one or more of
getFontPage, getFontName, getFontType, and getFontEncoding giving a serial
number 0..n - 1 to return information. Finally, call endGetFontInfo to clean
up. */
function getFontType(n)
{
  var r = caml_jsstring_of_string(cpdflib.cpdflib.getFontType(n));
  checkError();
  return r;
}

/** Retrieves font information. First, call startGetFontInfo(pdf). Now call
numberFonts to return the number of fonts. For each font, call one or more of
getFontPage, getFontName, getFontType, and getFontEncoding giving a serial
number 0..n - 1 to return information. Finally, call endGetFontInfo to clean
up. */
function getFontEncoding(n)
{
  var r = caml_jsstring_of_string(cpdflib.cpdflib.getFontEncoding(n));
  checkError();
  return r;
}

/** Retrieves font information. First, call startGetFontInfo(pdf). Now call
numberFonts to return the number of fonts. For each font, call one or more of
getFontPage, getFontName, getFontType, and getFontEncoding giving a serial
number 0..n - 1 to return information. Finally, call endGetFontInfo to clean
up. */
function endGetFontInfo()
{
  cpdflib.cpdflib.endGetFontInfo();
  checkError();
}

/** Removes all font data from a file. */
function removeFonts(pdf)
{
  cpdflib.cpdflib.removeFonts(pdf);
  checkError();
}

/** Copies the given font from the given page in the 'from' PDF to every page
in the 'to' PDF. The new font is stored under its font name. */
function copyFont(docfrom, docto, range, pagenumber, fontname)
{
  var rn = range_of_array(range);
  cpdflib.cpdflib.copyFont(docfrom, docto, rn, pagenumber, caml_string_of_jsstring(fontname));
  deleterange(rn);
  checkError();
}

// CHAPTER 15. PDF and JSON

/** Outputs a PDF in JSON format to the given filename. If parse_content is
true, page content is parsed. If no_stream_data is true, all stream data is
suppressed entirely. If decompress_streams is true, streams are decompressed. */
function outputJSON(filename, parse_content, no_stream_data, decompress_streams, pdf)
{
  cpdflib.cpdflib.outputJSON(caml_string_of_jsstring(filename), parse_content, no_stream_data, decompress_streams, pdf);
  checkError();
}

/** Like outputJSON, but it writes to a byte array in memory. */
function outputJSONMemory(parse_content, no_stream_data, decompress_streams, pdf)
{
  var r = cpdflib.cpdflib.outputJSONMemory(parse_content, no_stream_data, decompress_streams, pdf);
  checkError();
  return r.data;
}

/** Loads a PDF from a JSON file given its filename. */
function fromJSON(filename)
{
  var r = cpdflib.cpdflib.fromJSON(caml_string_of_jsstring(filename));
  checkError();
  return r;
}

/** Loads a PDF from a JSON file in memory. */
function fromJSONMemory(data)
{
  var bigarray = caml_ba_from_typed_array(data);
  var r = cpdflib.cpdflib.fromJSONMemory(bigarray);
  checkError();
  return r;
}

// CHAPTER 16. Optional Content Groups

/** Begins retrieving optional content group names. The serial number 0..n - 1
is returned. */
function startGetOCGList(pdf)
{
  var r = cpdflib.cpdflib.startGetOCGList(pdf);
  checkError();
  return r;
}

/** Retrieves an OCG name, given its serial number 0..n - 1. */
function ocgListEntry(n)
{
  var r = caml_jsstring_of_string(cpdflib.cpdflib.ocgListEntry(n));
  checkError();
  return r;
}

/** Ends retrieval of optional content group names. */
function endGetOCGList()
{
  cpdflib.cpdflib.endGetOCGList();
  checkError();
}

/** Renames an optional content group. */
function ocgRename(pdf, name_from, name_to)
{
  cpdflib.cpdflib.ocgRename(pdf, caml_string_of_jsstring(name_from), caml_string_of_jsstring(name_to));
  checkError();
}

/** Ensures that every optional content group appears in the OCG order list. */
function ocgOrderAll(pdf)
{
  cpdflib.cpdflib.ocgOrderAll(pdf);
  checkError();
}

/** Coalesces optional content groups. For example, if we merge or stamp two
files both with an OCG called "Layer 1", we will have two different optional
content groups. This function will merge the two into a single optional
content group. */
function ocgCoalesce(pdf)
{
  cpdflib.cpdflib.ocgCoalesce(pdf);
  checkError();
}

// CHAPTER 17. Creating new PDFs

/** Creates a blank document with pages of the given width (in points), height
(in points), and number of pages. */
function blankDocument(w, h, pages)
{
  var r = cpdflib.cpdflib.blankDocument(w, h, pages);
  checkError();
  return r;
}

/** Makes a blank document given a page size and number of pages. */
function blankDocumentPaper(papersize, pages)
{
  var r = cpdflib.cpdflib.blankDocumentPaper(papersize, pages);
  checkError();
  return r;
}

/** Typesets a UTF8 text file ragged right on a page of size w * h in points
in the given font and font size. */
function textToPDF(w, h, font, fontsize, filename)
{
  var r = cpdflib.cpdflib.textToPDF(w, h, font, fontsize, caml_string_of_jsstring(filename));
  checkError();
  return r;
}

/** Typesets a UTF8 text file ragged right on a page of the given size in the
given font and font size. */
function textToPDFPaper(papersize, font, fontsize, filename)
{
  var r = cpdflib.cpdflib.textToPDFPaper(papersize, font, fontsize, caml_string_of_jsstring(filename));
  checkError();
  return r;
}

//CHAPTER 18. Miscellaneous

/** Removes images on the given pages, replacing them with crossed boxes if
'boxes' is true. */
function draft(pdf, range, boxes)
{
  var rn = range_of_array(range);
  cpdflib.cpdflib.draft(pdf, rn, boxes);
  deleterange(rn);
  checkError();
}

/** Removes all text from the given pages in a given document. */
function removeAllText(pdf, range)
{
  var rn = range_of_array(range);
  cpdflib.cpdflib.removeAllText(pdf, rn);
  deleterange(rn);
  checkError();
}

/* Blackens all text on the given pages. */
function blackText(pdf, range)
{
  var rn = range_of_array(range);
  cpdflib.cpdflib.blackText(pdf, rn);
  deleterange(rn);
  checkError();
}

/** Blackens all lines on the given pages. */
function blackLines(pdf, range)
{
  var rn = range_of_array(range);
  cpdflib.cpdflib.blackLines(pdf, rn);
  deleterange(rn);
  checkError();
}

/** Blackens all fills on the given pages. */
function blackFills(pdf, range)
{
  var rn = range_of_array(range);
  cpdflib.cpdflib.blackFills(pdf, rn);
  deleterange(rn);
  checkError();
}

/** Thickens every line less than min_thickness to min_thickness. Thickness
given in points. */
function thinLines(pdf, range, min_thickness)
{
  var rn = range_of_array(range);
  cpdflib.cpdflib.thinLines(pdf, rn, min_thickness);
  deleterange(rn);
  checkError();
}

/** Copies the /ID from one document to another. */
function copyId(pdf_from, pdf_to)
{
  cpdflib.cpdflib.copyId(pdf_from, pdf_to);
  checkError();
}

/** Removes a document's /ID. */
function removeId(pdf)
{
  cpdflib.cpdflib.removeId(pdf);
  checkError();
}

/** Sets the minor version number of a document. */
function setVersion(pdf, version)
{
  cpdflib.cpdflib.setVersion(pdf, version);
  checkError();
}

/** Sets the full version number of a document. */
function setFullVersion(pdf, major, minor)
{
  cpdflib.cpdflib.setFullVersion(pdf, major, minor);
  checkError();
}

/** Removes any dictionary entry with the given key anywhere in the document. */
function removeDictEntry(pdf, key)
{
  cpdflib.cpdflib.removeDictEntry(pdf, caml_string_of_jsstring(key));
  checkError();
}

/** Removes any dictionary entry with the given key whose value matches the
given search term. */
function removeDictEntrySearch(pdf, key, searchterm)
{
  cpdflib.cpdflib.removeDictEntrySearch(pdf, caml_string_of_jsstring(key), caml_string_of_jsstring(searchterm));
  checkError();
}

/** Replaces the value associated with the given key. */
function replaceDictEntry(pdf, key, newval)
{
  cpdflib.cpdflib.replaceDictEntry(pdf, caml_string_of_jsstring(key), caml_string_of_jsstring(newval));
  checkError();
}

/** Replaces the value associated with the given key if the existing value
matches the search term. */
function replaceDictEntrySearch(pdf, key, newval, searchterm)
{
  cpdflib.cpdflib.replaceDictEntrySearch(pdf, caml_string_of_jsstring(key), caml_string_of_jsstring(newval), caml_string_of_jsstring(searchterm));
  checkError();
}

/** Removes all clipping from pages in the given range. */
function removeClipping(pdf, range)
{
  var rn = range_of_array(range);
  cpdflib.cpdflib.removeClipping(pdf, rn);
  deleterange(rn);
  checkError();
}

/* Returns a JSON array containing any and all values associated with the
given key, and fills in its length. */
function getDictEntries(pdf, key)
{
  var r = cpdflib.cpdflib.getDictEntries(pdf, caml_string_of_jsstring(key));
  checkError();
  return r.data;
}

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