CSL = sage-harvard

*.md:
	pandoc fmgp_method.md  -t markdown-citations -s --bibliography /Users/jtollefs/Documents/bibliography.bib --csl /Users/jtollefs/Documents/SOCIOLOGY/PROJECTS/PlainTextEditing/styles/sage-harvard.csl -o fmgp_method_out.md
