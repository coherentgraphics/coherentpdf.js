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

3.  ---cpdf\_compositionJSON()
    -Contains 231 bytes of data
    +Contains 230 bytes of data

    Difference in floating point maths.
