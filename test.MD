Expected test output differences compared with other cpdflib implementations
============================================================================

1. 03rotatecontents.pdf
   08stampee\_after.pdf

   Last digit of floating point number differs by one. Difference in libc/js
   float rounding.

2. 01tofileext.pdf
   05squeezedinmemory.pdf
   17draft.pdf

   Differing zlib compression libraries.
