import { Router } from 'express';

const router = Router();

const templates = [
  {
    id: 'blank',
    name: 'Blank Document',
    category: 'General',
    description: 'Start with a clean slate',
    author: 'TexFlow',
    content: `\\documentclass{article}\n\\usepackage[utf8]{inputenc}\n\\title{My Document}\n\\author{Author}\n\\date{\\today}\n\\begin{document}\n\\maketitle\n\\section{Introduction}\nHello World!\n\\end{document}`
  },
  {
    id: 'article',
    name: 'Academic Article',
    category: 'Academic Papers',
    description: 'Standard academic article format',
    author: 'TexFlow',
    content: `\\documentclass[12pt]{article}\n\\usepackage[utf8]{inputenc}\n\\usepackage{amsmath}\n\\usepackage{graphicx}\n\\usepackage{hyperref}\n\\usepackage{natbib}\n\\title{Article Title}\n\\author{Author Name\\\\Department\\\\University}\n\\date{\\today}\n\\begin{document}\n\\maketitle\n\\begin{abstract}\nThis is the abstract.\n\\end{abstract}\n\\section{Introduction}\n\\section{Methods}\n\\section{Results}\n\\section{Discussion}\n\\section{Conclusion}\n\\bibliographystyle{plain}\n\\bibliography{references}\n\\end{document}`
  },
  {
    id: 'thesis',
    name: 'Thesis',
    category: 'Thesis',
    description: 'Complete thesis template',
    author: 'TexFlow',
    content: `\\documentclass[12pt,a4paper]{report}\n\\usepackage[utf8]{inputenc}\n\\usepackage{amsmath}\n\\usepackage{graphicx}\n\\usepackage{hyperref}\n\\usepackage{natbib}\n\\title{Thesis Title}\n\\author{Student Name}\n\\date{\\today}\n\\begin{document}\n\\maketitle\n\\tableofcontents\n\\chapter{Introduction}\n\\chapter{Literature Review}\n\\chapter{Methodology}\n\\chapter{Results}\n\\chapter{Discussion}\n\\chapter{Conclusion}\n\\bibliographystyle{plain}\n\\bibliography{references}\n\\end{document}`
  },
  {
    id: 'report',
    name: 'Lab Report',
    category: 'Reports',
    description: 'Scientific lab report format',
    author: 'TexFlow',
    content: `\\documentclass[12pt]{article}\n\\usepackage[utf8]{inputenc}\n\\usepackage{amsmath}\n\\usepackage{graphicx}\n\\title{Lab Report: Experiment Title}\n\\author{Student Name\\\\Partner Name}\n\\date{\\today}\n\\begin{document}\n\\maketitle\n\\section{Objective}\n\\section{Theory}\n\\section{Apparatus}\n\\section{Procedure}\n\\section{Observations}\n\\section{Analysis}\n\\section{Conclusion}\n\\end{document}`
  },
  {
    id: 'resume',
    name: 'Resume / CV',
    category: 'CV / Resume',
    description: 'Professional resume template',
    author: 'TexFlow',
    content: `\\documentclass[11pt]{article}\n\\usepackage[utf8]{inputenc}\n\\usepackage{enumitem}\n\\usepackage{hyperref}\n\\usepackage[margin=0.75in]{geometry}\n\\name{Your Name}\n\\address{Email: email@example.com \\\\ Phone: (555) 123-4567}\n\\date{}\n\\begin{document}\n\\maketitle\n\\section{Education}\n\\textbf{University Name} \\hfill 2020--2024\\\\\nBachelor of Science in Computer Science\n\\section{Experience}\n\\textbf{Company Name} \\hfill 2023--2024\\\\\nSoftware Engineer\n\\begin{itemize}[nosep]\n\\item Achievement 1\n\\item Achievement 2\n\\end{itemize}\n\\section{Skills}\nProgramming: Python, Java, C++\\\\\nTools: Git, Docker, LaTeX\n\\end{document}`
  },
  {
    id: 'beamer',
    name: 'Presentation (Beamer)',
    category: 'Presentations',
    description: 'Beamer slide presentation',
    author: 'TexFlow',
    content: `\\documentclass{beamer}\n\\usetheme{Madrid}\n\\usepackage[utf8]{inputenc}\n\\title{Presentation Title}\n\\author{Presenter Name}\n\\date{\\today}\n\\begin{document}\n\\begin{frame}\n\\titlepage\n\\end{frame}\n\\begin{frame}{Outline}\n\\tableofcontents\n\\end{frame}\n\\section{Introduction}\n\\begin{frame}{Introduction}\nContent here.\n\\end{frame}\n\\section{Methods}\n\\begin{frame}{Methods}\nContent here.\n\\end{frame}\n\\section{Results}\n\\begin{frame}{Results}\nContent here.\n\\end{frame}\n\\begin{frame}{Thank You}\nQuestions?\n\\end{frame}\n\\end{document}`
  },
  {
    id: 'book',
    name: 'Book',
    category: 'Books',
    description: 'Book chapter template',
    author: 'TexFlow',
    content: `\\documentclass[12pt]{book}\n\\usepackage[utf8]{inputenc}\n\\usepackage{amsmath}\n\\usepackage{graphicx}\n\\title{Book Title}\n\\author{Author Name}\n\\date{\\today}\n\\begin{document}\n\\maketitle\n\\tableofcontents\n\\chapter{Introduction}\nChapter content here.\n\\chapter{Main Content}\nMore content.\n\\chapter{Conclusion}\nFinal thoughts.\n\\end{document}`
  },
  {
    id: 'ieee',
    name: 'IEEE Conference Paper',
    category: 'Conference Papers',
    description: 'IEEE conference format',
    author: 'TexFlow',
    content: `\\documentclass[conference]{IEEEtran}\n\\usepackage[utf8]{inputenc}\n\\usepackage{amsmath}\n\\usepackage{graphicx}\n\\usepackage{cite}\n\\title{Paper Title}\n\\author{\\\\Author One\\\\Affiliation \\\\ Author Two\\\\Affiliation}\n\\begin{document}\n\\maketitle\n\\begin{abstract}\nAbstract text here.\n\\end{abstract}\n\\section{Introduction}\n\\section{Related Work}\n\\section{Methodology}\n\\section{Experiments}\n\\section{Conclusion}\n\\begin{thebibliography}{1}\n\\bibitem{ref1} Reference 1.\n\\end{thebibliography}\n\\end{document}`
  },
  {
    id: 'homework',
    name: 'Homework Assignment',
    category: 'Academic Papers',
    description: 'Homework problem set',
    author: 'TexFlow',
    content: `\\documentclass[12pt]{article}\n\\usepackage[utf8]{inputenc}\n\\usepackage{amsmath}\n\\usepackage{amssymb}\n\\usepackage[margin=1in]{geometry}\n\\title{Homework Assignment \\#1}\n\\author{Your Name\\\\Student ID: 12345}\n\\date{\\today}\n\\begin{document}\n\\maketitle\n\\section*{Problem 1}\nSolution here.\n\\section*{Problem 2}\nSolution here.\n\\section*{Problem 3}\nSolution here.\n\\end{document}`
  },
  {
    id: 'letter',
    name: 'Cover Letter',
    category: 'Cover Letters',
    description: 'Professional cover letter',
    author: 'TexFlow',
    content: `\\documentclass[11pt]{letter}\n\\usepackage[utf8]{inputenc}\n\\usepackage[margin=1in]{geometry}\n\\address{Your Name\\\\Your Address\\\\City, State ZIP}\n\\date{\\today}\n\\begin{document}\n\\begin{letter}{Recipient Name\\\\Company Name\\\\Company Address}\n\\opening{Dear Hiring Manager,}\nI am writing to express my interest in the position.\n\\closing{Sincerely,}\n\\end{letter}\n\\end{document}`
  }
];

router.get('/', (_req, res) => {
  res.json({ templates });
});

router.get('/:id', (req, res) => {
  const template = templates.find(t => t.id === req.params.id);
  if (!template) return res.status(404).json({ error: 'Template not found' });
  res.json({ template });
});

export default router;
