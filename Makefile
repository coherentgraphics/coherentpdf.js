# Build the camlpdf library as byte code and native code
PDFMODS = pdfutil pdfio pdftransform pdfunits pdfpaper pdfcryptprimitives \
  pdf pdfcrypt pdfflate pdfcodec pdfwrite pdfgenlex pdfread pdfjpeg pdfops \
  pdfdest pdfmarks pdfpagelabels pdfpage pdfannot pdffun pdfspace pdfimage \
  pdfafm pdfafmdata pdfglyphlist pdftext pdfstandard14 pdfgraphics pdfshapes \
  pdfdate pdfocg pdfcff pdftype1 pdftruetype pdftype0 pdfmerge

SOURCES = $(foreach x,$(PDFMODS),$(x).ml $(x).mli) pdfex.ml

RESULT = pdfex.byte

OCAMLBCFLAGS = -g
OCAMLLDFLAGS = -g

all : byte-code

-include OCamlMakefile

js :
	js_of_ocaml pdfex.byte

clean ::
	rm -rf doc foo foo2 out.pdf out2.pdf foo.pdf decomp.pdf *.cmt *.cmti \
	*.json test/*.pdf debug/*.pdf *.ps *.aux *.idx *.log *.out *.toc *.cut *.js
