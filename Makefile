# Build coherentpdf.js
PDFMODS = pdfe pdfutil pdfio pdftransform pdfunits pdfpaper pdfcryptprimitives \
  pdf pdfcrypt pdfflate pdfcodec pdfwrite pdfgenlex pdfread pdfjpeg pdfops \
  pdfdest pdfmarks pdfpagelabels pdfpage pdfannot pdffun pdfspace pdfimage \
  pdfafm pdfafmdata pdfglyphlist pdftext pdfstandard14  \
  pdfdate pdfocg pdfmerge \
  cpdfyojson cpdfxmlm \
  cpdfunicodedata cpdferror cpdfdebug cpdfjson cpdfstrftime cpdfcoord \
  cpdfattach cpdfpagespec cpdfposition cpdfpresent cpdfmetadata \
  cpdfbookmarks cpdfpage cpdftruetype cpdfremovetext cpdfextracttext \
  cpdfembed cpdffont cpdftype cpdfaddtext cpdfpad cpdfocg \
  cpdfsqueeze cpdfdraft cpdfspot cpdfpagelabels cpdfcreate cpdfannot \
  cpdfxobject cpdfimpose cpdfchop cpdftweak cpdftexttopdf cpdftoc \
  cpdfjpeg cpdfjpeg2000 cpdfpng cpdfimage cpdfdraw cpdfcomposition \
  cpdfshape cpdfcolours cpdfdrawcontrol cpdfcommand \
  cpdf

SOURCES = flatestubs.c rijndael-alg-fst.c stubs-aes.c sha2.c stubs-sha2.c \
	  $(foreach x,$(PDFMODS),$(x).ml $(x).mli) exports.ml

PACKS = unix js_of_ocaml js_of_ocaml-ppx

OCAMLBCFLAGS = -g
OCAMLLDFLAGS = -g

RESULT = coherentpdf.byte

all : byte-code js

-include OCamlMakefile

js :
	js_of_ocaml -q nodestubs.js cpdfzlib.js cpdfcrypt.js coherentpdf.byte

jsdebug :
	js_of_ocaml -q --pretty --debuginfo \
	  --disable inline --source-map-inline \
	  nodestubs.js cpdfzlib.js cpdfcrypt.js \
	  coherentpdf.byte

distrib :
	cp coherentpdf.js dist/
	js_of_ocaml -o coherentpdf.min.js -q \
	  nodestubs.js cpdfzlib.js cpdfcrypt.js coherentpdf.byte
	uglifyjs coherentpdf.min.js --compress --mangle --output dist/coherentpdf.min.js
	browserify coherentpdf.js -s coherentpdf -o coherentpdf.browser.js
	browserify coherentpdf.min.js -s coherentpdf -o coherentpdf.browser.formin.js
	uglifyjs coherentpdf.browser.formin.js --compress --mangle \
	  --output coherentpdf.browser.min.js
	cp coherentpdf.browser.min.js coherentpdf.browser.js dist/

browser :
	browserify coherentpdf.js -s coherentpdf -o coherentpdf.browser.js
	cp coherentpdf.browser.js dist/

clean ::
	rm -rf doc foo foo2 out.pdf out2.pdf foo.pdf decomp.pdf *.cmt *.cmti \
	test/*.pdf debug/*.pdf *.ps *.aux *.idx *.log *.out *.toc \
	*.cut cpdflib.js all.js coherentpdf-browser.js coherentpdf.*.js
