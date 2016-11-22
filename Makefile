# Build the camlpdf library as byte code and native code
PDFMODS = pdfutil pdfio pdftransform pdfunits pdfpaper pdf \
pdfcrypt pdfcodec pdfwrite pdfgenlex pdfread pdfjpeg pdfops pdfdest \
pdfmarks pdfpagelabels pdfpage pdfannot pdffun pdfspace pdfimage pdfafm \
pdfafmdata pdfglyphlist pdftext pdfstandard14 pdfgraphics pdfshapes pdfdate \
pdfocg pdfcff pdftype1 pdftruetype pdftype0 pdfmerge

SOURCES = $(foreach x,$(PDFMODS),$(x).ml $(x).mli) pdfex.ml

PACKS = js_of_ocaml js_of_ocaml.syntax bigarray

RESULT = pdfex

OCAMLBCFLAGS = -g
OCAMLLDFLAGS = -g

all : byte-code-library byte-code

-include OCamlMakefile

js : pdfex
	js_of_ocaml pdfex
