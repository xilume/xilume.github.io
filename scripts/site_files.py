"""The existing Pages publication allowlist, shared by build and verification."""

ROOT_FILES = """
index.html styles.css site-refinement.css company-applications.css zh-cn.css
finder.js chip-selector.js hero.js site.js favicon.svg favicon.ico
xilume-icon-96.png xilume-icon-180.png xilume-icon-192.png xilume-icon-512.png
site.webmanifest brand-mark-48.png brand-mark-96.png brand-mark-180.png
brand-mark-192.png brand-mark-512.png .nojekyll CNAME robots.txt sitemap.xml
google9b5d5cd94eca340c.html
""".split()

SITE_DIRS = """
products images media contact about documentation downloads chip-selector
applications solutions zh-cn
""".split()


def excluded(path):
    """Keep local maintenance material out even inside a public directory."""
    for part in path.parts:
        name = part.lower()
        if name in {"agents.md", "agents.override.md", "readme.md", "docs", "scripts",
                    "work", "outputs", "node_modules", "__pycache__", "_site"}:
            return True
        if name.startswith(".") and path.as_posix() != ".nojekyll":
            return True
        if name.startswith("xilume_website_codex_handoff"):
            return True
        if name.endswith((".pyc", ".tmp", ".bak", ".swp")) or name.endswith("~"):
            return True
    return False


def published(path):
    return (path.as_posix() in ROOT_FILES or path.parts[0] in SITE_DIRS) and not excluded(path)
