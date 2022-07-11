# Build cpdf.js
PDFMODS = pdfutil pdfio pdftransform pdfunits pdfpaper pdfcryptprimitives \
  pdf pdfcrypt pdfflate pdfcodec pdfwrite pdfgenlex pdfread pdfjpeg pdfops \
  pdfdest pdfmarks pdfpagelabels pdfpage pdfannot pdffun pdfspace pdfimage \
  pdfafm pdfafmdata pdfglyphlist pdftext pdfstandard14 pdfgraphics pdfshapes \
  pdfdate pdfocg pdfcff pdftype1 pdftruetype pdftype0 pdfmerge \
  cpdfyojson cpdfxmlm cpdfutil \
  cpdfunicodedata cpdferror cpdfdebug cpdfjson cpdfstrftime cpdfcoord \
  cpdfattach cpdfpagespec cpdfposition cpdfpresent cpdfmetadata \
  cpdfbookmarks cpdfpage cpdfaddtext cpdfimage cpdffont cpdftype \
  cpdftexttopdf cpdftoc cpdfpad cpdfocg cpdfsqueeze cpdfdraft cpdfspot \
  cpdfpagelabels cpdfcreate cpdfannot cpdfxobject cpdfimpose cpdftweak \
  cpdf

SOURCES = flatestubs.c rijndael-alg-fst.c stubs-aes.c sha2.c stubs-sha2.c \
	  $(foreach x,$(PDFMODS),$(x).ml $(x).mli) exports.ml

PACKS = unix js_of_ocaml js_of_ocaml-ppx

OCAMLBCFLAGS = -g
OCAMLLDFLAGS = -g

RESULT = cpdf.byte

all : byte-code js

-include OCamlMakefile

js :
	js_of_ocaml -q nodestubs.js cpdfzlib.js cpdfcrypt.js cpdf.byte

jsdebug :
	js_of_ocaml -q --pretty --debuginfo \
	  --disable inline --source-map-inline \
	  nodestubs.js cpdfzlib.js cpdfcrypt.js \
	  cpdf.byte

distrib:
	cp cpdf.js dist/
	js_of_ocaml -o cpdf.min.js -q \
	  nodestubs.js cpdfzlib.js cpdfcrypt.js cpdf.byte
	uglifyjs cpdf.min.js --compress --mangle --output dist/cpdf.min.js
	browserify cpdf.js -s cpdf -o cpdf.browser.js
	browserify cpdf.min.js -s cpdf -o cpdf.browser.formin.js
	uglifyjs cpdf.browser.formin.js --compress --mangle \
	  --output cpdf.browser.min.js
	cp cpdf.browser.min.js cpdf.browser.js dist/

clean ::
	rm -rf doc foo foo2 out.pdf out2.pdf foo.pdf decomp.pdf *.cmt *.cmti \
	*.json test/*.pdf debug/*.pdf *.ps *.aux *.idx *.log *.out *.toc \
	*.cut cpdflib.js cpdf.js all.js cpdf-browser.js dist/*.js*
