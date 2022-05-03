cpdf.js
=======

JavaScript PDF library built by compiling CamlPDF+CPDF+cpdflib with `js_of_ocaml`.

Expected test output differences
================================

1. 03rotatecontents.pdf (last digit of floating point number differs by one.
   Difference in libc/js float rounding).

2. 01tofileext.pdf/05squeezedinmemory.pdf/17draft.pdf (different zlib
   compression libraries)
