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
  cpdflib

SOURCES = flatestubs.c rijndael-alg-fst.c stubs-aes.c sha2.c stubs-sha2.c \
	  $(foreach x,$(PDFMODS),$(x).ml $(x).mli) exports.ml

XSOURCES = flatestubs.c rijndael-alg-fst.c stubs-aes.c sha2.c stubs-sha2.c \
	  $(foreach x,$(PDFMODS),$(x).ml $(x).mli) cpdfcommand.ml cpdfcommandrun.ml

PACKS = js_of_ocaml,js_of_ocaml-ppx

OCAMLBCFLAGS = -g
OCAMLLDFLAGS = -g

RESULT = cpdf.byte

all : byte-code js

-include OCamlMakefile

js :
	js_of_ocaml -q --pretty --debuginfo --source-map-inline nodestubs.js sjclstub.js cpdfzlib.js cpdfcrypt.js cpdflibwrapper.js cpdf.byte

small:
	js_of_ocaml -q nodestubs.js sjclstub.js cpdfzlib.js cpdfcrypt.js cpdflibwrapper.js cpdf.byte
	uglifyjs cpdf.js --compress --mangle --output cpdf.js

browser:
	browserify cpdf.js -s cpdf -o cpdf-browser.js

smallbrowser:
	uglifyjs cpdf-browser.js --compress --mangle --output cpdf-browser.js

clean ::
	rm -rf doc foo foo2 out.pdf out2.pdf foo.pdf decomp.pdf *.cmt *.cmti \
	*.json test/*.pdf debug/*.pdf *.ps *.aux *.idx *.log *.out *.toc *.cut cpdf.js cpdf-browser.js
