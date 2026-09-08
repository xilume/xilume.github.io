#!/usr/bin/env python3
"""Keep static navigation, branding and footer identical across locale pages."""
from pathlib import Path
import re

ROOT=Path(__file__).resolve().parents[1]
VERSION='20260908-maintenance1'

def header(zh,path):
 p='/zh-cn' if zh else ''
 label='熙联迈首页' if zh else 'Xilume home'
 navigation=[('products','产品','Products'),('solutions','解决方案','Solutions'),('downloads','软件与驱动','Software &amp; Drivers'),('applications','应用','Applications'),('documentation','文档','Documentation'),('about','公司','Company'),('contact','联系我们','Contact')]
 links=[]
 for target,cn,en in navigation:
  active=' aria-current="page"' if path==f'{p}/{target}/' else ''
  cls=' class="nav-finder"' if target=='contact' else ''
  links.append(f'<a{cls} href="{p}/{target}/"{active}>{cn if zh else en}</a>')
 return f'''<header class="site-header corporate-header">
    <div class="container header-inner">
      <a class="brand brand-symbol" href="{p}/" aria-label="{label}"><img src="/images/xilume-official-wordmark.webp" width="160" height="62" alt="{'熙联迈' if zh else 'Xilume'}" fetchpriority="high"></a>
      <nav aria-label="{'主导航' if zh else 'Primary navigation'}">{''.join(links)}</nav>
    </div>
  </header>'''

def footer(zh):
 p='/zh-cn' if zh else ''
 def a(path,label): return f'<a href="{p}/{path}/">{label}</a>'
 groups=[('产品' if zh else 'Products', [('products/embedded-communication','嵌入式通信' if zh else 'Embedded communication'),('products/8hub','Octant 工业通信扩展坞' if zh else 'Octant USB hub'),('products/interface-ics','接口芯片' if zh else 'Interface ICs'),('products/usb-smbus','智能电池接口' if zh else 'Smart-battery interfaces')]),('支持' if zh else 'Support',[('downloads','软件与驱动' if zh else 'Software &amp; Drivers'),('documentation','技术资料' if zh else 'Documentation'),('applications','安装与应用' if zh else 'Applications'),('contact','联系我们' if zh else 'Contact')])]
 content=''.join(f'<div><h3>{title}</h3>'+''.join(a(path,label) for path,label in items)+'</div>' for title,items in groups)
 return f'''<footer class="site-footer">
    <div class="container footer-grid">
      <div class="footer-identity"><a class="brand footer-brand brand-symbol" href="{p}/" aria-label="{'熙联迈首页' if zh else 'Xilume home'}"><img src="/images/xilume-official-wordmark.webp" width="160" height="62" alt="{'熙联迈' if zh else 'Xilume'}" loading="lazy"></a><p>{'熙联迈<br>工业通信接口与芯片' if zh else 'Xilume<br>Industrial communication interfaces &amp; ICs'}</p>{a('about','了解熙联迈 →' if zh else 'About Xilume →')}</div>
      {content}
      <div><h3>{'销售与技术咨询' if zh else 'Sales &amp; technical inquiries'}</h3><a href="mailto:contact@xilume.co">contact@xilume.co</a><a href="tel:+16573459435">+1 (657) 345-9435</a></div>
    </div>
    <div class="container footer-bottom"><span>© 2026 {'熙联迈' if zh else 'Xilume'}</span><span>CAN FD · RS-485 · RS-232 · SBS / SMBus</span></div>
  </footer>'''

changed=[]
for file in ROOT.rglob('*.html'):
 if any(part in {'.git', '_site', 'Xilume_Website_Codex_Handoff'} for part in file.relative_to(ROOT).parts): continue
 text=file.read_text(encoding='utf-8')
 if not re.search(r'<header\b[^>]*class="[^"]*site-header',text): continue
 rel=file.relative_to(ROOT)
 zh=rel.parts[0]=='zh-cn'
 path='/'+str(rel.parent).replace('\\','/')+'/' if str(rel.parent)!='.' else '/'
 old=text
 text=re.sub(r'<header\b[^>]*class="[^"]*site-header[^>]*>.*?</header>',header(zh,path),text,count=1,flags=re.S)
 # Only the last footer belongs to the shared site shell.
 matches=list(re.finditer(r'<footer\b[^>]*>.*?</footer>',text,re.S))
 if matches:
  m=matches[-1]; text=text[:m.start()]+footer(zh)+text[m.end():]
 # Shared CSS follows page CSS so the brand never inherits old page overrides.
 text=re.sub(r'\s*<link rel="stylesheet" href="/site-refinement.css[^"\n]*">','',text)
 text=text.replace('</head>',f'  <link rel="stylesheet" href="/site-refinement.css?v={VERSION}">\n</head>')
 text=re.sub(r'(<(?:script|link)\b[^>]*(?:src|href)="[^"?]*(?:site\.js|hero\.js|finder\.js|styles\.css|zh-cn\.css))(?:\?[^" ]*)?("[^>]*>)',rf'\g<1>?v={VERSION}\g<2>',text)
 text=re.sub(r'<link rel="icon"[^>]*>',f'<link rel="icon" href="/favicon.svg?v={VERSION}" type="image/svg+xml">',text)
 text=re.sub(r'(href="/(?:xilume-icon|brand-mark)-180\.png)(?:\?[^" ]*)?(" sizes="180x180")',rf'\g<1>?v={VERSION}\g<2>',text)
 # Native image loading retains usable media without requiring a script.
 if '<main' in text and 'class="skip-link"' not in text:
  main=re.search(r'<main\b[^>]*>',text)
  idmatch=re.search(r'\bid="([^"]+)"',main.group())
  mid=idmatch.group(1) if idmatch else 'main-content'
  if not idmatch: text=text[:main.start()]+main.group()[:-1]+' id="main-content">'+text[main.end():]
  text=re.sub(r'(<body\b[^>]*>)',rf'\g<1>\n  <a class="skip-link" href="#{mid}">{"跳到正文" if zh else "Skip to content"}</a>',text,count=1)
 if text!=old: file.write_text(text, encoding='utf-8');changed.append(str(rel))
print(f'Synchronized {len(changed)} pages')
