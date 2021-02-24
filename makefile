CSL = sage-harvard
FILE = fmgp_method

fmgp_method_out.md:
	pandoc fmgp_method.md  -t markdown-citations -s --bibliography /Users/jtollefs/Documents/bibliography.bib --csl /Users/jtollefs/Documents/SOCIOLOGY/PROJECTS/PlainTextEditing/styles/sage-harvard.csl -o fmgp_method_out.md


citations:
	pandoc $(FILE).md \
	-t markdown-citations -s \
	--citeproc \
	--bibliography /Users/jtollefs/Documents/bibliography.bib \
	--csl /Users/jtollefs/Documents/SOCIOLOGY/PROJECTS/PlainTextEditing/styles/$(CSL).csl \
	-o $(FILE)_out.md
