# Xilume 官网首轮交接与审计

> 历史报告：下文保留首轮只读审计的基线与当时结论，原行号指 `d188871`。同日后续修复状态见 `WEBSITE_STATUS.md`，发布方案见 `WEBSITE_RELEASE.md`。后续已修复 A2/A3/A4 及确认的语言切换问题 A5，并补充 A1 构建检查。用户后续明确授权修复后发布，Pages 已切换为 workflow，PR #3 的生产 run `34202648965` 部署成功，线上 200 文件可访问、115 文本与构建一致、6 类维护路径返回 404。工作树现已完整检出；本地浏览器交互通过，线上 DOM 确认新版，随后连接超时的限制已记入 STATUS。下文首次审计的“尚未”不是最新状态。

日期：2026-09-08

仓库：`xilume/xilume.github.io`；域名：`https://xilume.co/`

起始/当前代码提交：`d188871c2d226d8b2ca5bc73fa85d11d67047d55`

本地分支：`codex/maintenance-handoff-20260908`

本轮只整理维护文档并进行只读审查。没有修改 HTML/CSS/JS、同步脚本、产品资料、Logo 或发布配置；没有提交、推送、合并或触发部署。下文“已确认”指所列检查范围，不是全站所有功能验收通过。

## 1. 真实工程与交接处理

本任务起初是空的交接工作目录；现已建立真实 Git 克隆，所有工程操作明确指向 `work/xilume.github.io`。远端 fetch/push 均为 `https://github.com/xilume/xilume.github.io.git`，从 main 的最新提交建立上述独立任务分支。初始工作区干净，没有覆盖现有工作；已核对祖先目录及完整 Git 树，未发现原有 AGENTS/override 或同名 docs 文件。

Git 大包传输遇到连接重置，随后用浅层部分克隆建立工程，将固定提交的缺省源码和图片按原始 Git blob 哈希验证后补入对象库并检出。没有伪造 Git 历史、换用另一个网站或回退旧提交。`media/`、`downloads/files/` 和 `documentation/files/` 仍部分/全部未检出，其路径存在性由完整 Git 树核对。

原始 ZIP 已解压为工程内 `Xilume_Website_Codex_Handoff/`，保留原件并用本地 Git exclude 排除临时资料。本轮创建根 `AGENTS.md` 和 `docs/WEBSITE_CONTEXT.md`、`docs/WEBSITE_STATUS.md`、本审计报告。因为不存在同名文件，没有直接覆盖或丢弃旧规则。

已经读取交接的 AGENTS、CONTEXT、STATUS，当前 README、workflow、共享脚本及相关页面，以及近期 12 条提交。交接基线与 main 相同；交接里未检查部署和工具环境的部分由本轮补充。没有访问或依赖以前的 ChatGPT 私人对话。

## 2. 组织与部署

站点是静态 HTML/CSS/JavaScript，无应用构建步骤。英文使用根路由、中文使用 `zh-cn/`，共用图片和样式。全树有 61 个 HTML：47 可索引内容页（23 对双语和 1 个英文 TraceBox）、12 兼容重定向、1 个 noindex 示例报告和 1 个 Google 验证页；sitemap 为 47 个 URL。

首页、产品、Solutions、Applications、Documentation、Downloads、About 和 Contact 是主要页面。页头页脚的源码维护入口为 `scripts/sync-site-chrome.py`；动态菜单和语言切换由 `site.js` 注入；轮播由 `hero.js` 驱动。原始 HTML 没有语言切换节点不代表前端缺少切换功能。

自定义 `.github/workflows/pages.yml:3` 的 main push / 手动入口先在第 27–29 行构造 `_site`，显式复制根文件并递归复制网站目录，然后上传与部署。此 workflow 没有发布前测试步骤。本轮又发现动态 Pages 流程同样进行正式部署，详见 A1。

## 3. 已确认问题与改进项

### A1 — 实际发布范围与工程说明不一致，优先处理

**位置：** `README.md:41`、`README.md:43`；`.github/workflows/pages.yml:28`、`:29`、`:34`；Pages 动态运行及其日志。

同一个最新 SHA 存在两次成功正式部署，上传的 artifact 不同：

| 运行 | 事件/打包目录 | 结果 |
| --- | --- | --- |
| [34178122653](https://github.com/xilume/xilume.github.io/actions/runs/34178122653) — Deploy Xilume website | push；`_site/` | 成功 |
| [34178122459](https://github.com/xilume/xilume.github.io/actions/runs/34178122459) — pages build and deployment | dynamic；仓库根目录 | 成功 |

[动态 build job](https://github.com/xilume/xilume.github.io/actions/runs/34178122459/job/101911493899) 的原始日志第 140/157 行显示 `path: .` / `INPUT_PATH: .`，第 423/425 行明确将同步脚本和 README 归档。[动态 deploy job](https://github.com/xilume/xilume.github.io/actions/runs/34178122459/job/101911521849) 同样确认部署该提交到正式域名。原始日志行号与网页 UI 行号可能不同，可用路径文字定位。

本轮实时 GET 进一步确认：

| 公网地址 | HTTP / 字节 | Git blob SHA，等于当前 HEAD |
| --- | --- | --- |
| [README.md](https://xilume.co/README.md) | 200；3821 字节；实际 Markdown | `109d7950f63d659952dca3b65974836e9dd53a80` |
| [同步脚本](https://xilume.co/scripts/sync-site-chrome.py) | 200；5054 字节；实际 Python | `8c5f91e470d67408c0932ee3d665f232f4564c8c` |

因此这两个开发文件目前确实由官网提供，而非工具缓存或 200 错误页。旧交接“docs 不在自定义复制名单内”是局部事实，不能推断实际不发布；未来新增维护文档也可能随根目录打包。

**影响：** 发布边界与文档不一致，两套内容不同的部署存在覆盖顺序风险。仓库本身公开，不能把本问题夸大成已确认泄密。本轮没有确定后台 Pages source 设置或证明哪次部署最后覆盖另一套。

**建议：** 发布前只读核实 Pages 设置，获得单独授权后保留一个明确的正式入口，优先沿用现有 `_site` 方案并保持域名。相应修订 README 的发布说明。验收应确认一次获批发布只有预期入口，artifact 排除维护资料且包含所有网站资源，开发文件 URL 返回 404 或明确不再提供源文件，关键站点入口正常。

### A2 — 同步脚本在 Windows 默认编码下无法运行

**位置：** `scripts/sync-site-chrome.py:42` 的 `file.read_text()`，及 `:66` 的 `file.write_text(text)`。

在仓库外的 61 HTML 隔离副本中，Python 3.12.14 默认 `utf8_mode=0`、`cp936` 时，脚本第 42 行实际抛出 `UnicodeDecodeError` 并退出 1。未指定读写编码是维护工具的跨平台问题；本次确认的是读取失败，没有声称已发生乱码写入。

只对子进程设置 `PYTHONUTF8=1` 后，两次运行都退出 0，输出 `Synchronized 0 pages`。全部 61 个 HTML 字节不变，首页和 About 中英文四页图片预览标签保持。真实仓库中的脚本和页面未被测试修改。

**建议：** 后续获批后仅为这两处显式指定 UTF-8。当前文档已记录 `python -X utf8` 的临时使用方式。

### A3 — 软件 CTA 名称跨页不统一，低优先级

**位置：** `solutions/index.html:282`、`zh-cn/solutions/index.html:283`；目标页 `downloads/control-center/index.html:40` 和 `zh-cn/downloads/control-center/index.html:41`。

英文入口为 “Xilume Control Center”，目标 H1 为 “Xilume CAN FD Control Center”；中文入口为“熙联迈控制台”，目标 H1 为“熙联迈 CAN FD 控制中心”。链接正常，但识别名称不一致。建议确认正式中英文名称后统一相关入口，不擅自把某个现行写法提升为业务最终决定。

### A4 — 中文入口进入英文软件页，属于体验改进

**位置：** `zh-cn/solutions/index.html:284` → `downloads/tracebox-analyzer-pro/index.html:2`。

中文介绍的 TraceBox 入口没有提示目标为英文。目标可访问，并非断链；完整代码树目前没有中文 TraceBox 详情页，`site.js:300-303` 为无中文对应的英文下载页提供回到中文下载总览的策略。可在后续内容批次选择标注“英文”或增加中文详情，不在本轮补译或修改路由。

## 4. 交接中需要限定的说法

- **品牌历史：** 交接提及否决部分旧 X/光环方案；实际在用字标和图标含 X 与蓝色弧光。本轮已打开实际文件，且近期提交摘要称采用用户选择素材。这不足以认定当前 Logo 错误，也不授权替换；维护文档改为保留当前版本，历史否决不得泛化。
- **图片策略：** `index.html:17`、`zh-cn/index.html:16`、`about/index.html:8`、`zh-cn/about/index.html:8` 是 `index, follow, max-image-preview:none`，不是 noindex，更不是删除图片。
- **工具缓存：** 网页摘要工具曾返回旧 Contact 内容或无法打开中文页，实时 HTTPS 请求正常；不将工具限制列为站点故障。
- **过往完成声明：** 提交/Actions 成功证明对应代码和发布记录存在，不替代逐浏览器回归、数据手册或搜索结果验证。
- **Codex 历史与自动化：** 本轮使用的是交接文件和当前工程，没有自动继承旧聊天，也未建立定时巡检或自动发布。

## 5. 实际完成的验证

| 检查 | 范围和结果 | 结论边界 |
| --- | --- | --- |
| Git 工程 | 远端、分支、HEAD、干净起点、原有规则及文件冲突已查 | 本地为浅层部分克隆；非全部历史和二进制 |
| 静态路径与锚点 | 61 HTML、14 CSS、8 JS；2510 次提取引用，其中 2379 次站内引用；无缺失目标/静态锚点 | 次数包含重复；动态执行与资源是否为正确 SKU 另验 |
| 发布覆盖 | 上述引用都在自定义根名单或递归目录中 | 不代表实际只有一套发布入口 |
| 技术 SEO | 47 sitemap URL 对应全部 47 内容页；canonical、双语互链无普通页错误 | 不证明已收录、排名、富结果或搜索展示 |
| JSON-LD | 13 段 JSON 语法通过 | 不核定产品事实或 Google 富结果资格 |
| JavaScript | 8 个外部文件通过 Node v24.19.0 的 `--check` | 没有执行 DOM 或浏览器运行时 |
| 共享同步隔离测试 | 默认编码失败；UTF-8 两次成功且 61 HTML 无变化 | 只在仓库外副本运行 |
| 本地 HTTP | 166 个已检出网页/样式/脚本/图片/根资源 HEAD 全为 200 | 本地资源响应，不是视觉回归 |
| 公网站点抽样 | 中英首页、产品目录、Solutions 及英文联系、下载入口实时可访问 | 非所有页面逐一公网抓取 |
| 公开资料/软件 | `downloads/files/`、`documentation/files/` 全部 12 文件线上 HEAD 均为 200 | 未验证正文、签名、安装、完整性或兼容性 |
| 开发文件公开性 | README/同步脚本实时 GET 字节等于 HEAD | 已证实这两项；未泛化为所有内部文件 |
| 品牌资产 | 实际字标 WebP 和 192px 图标已目视查看 | 没有重新取得更换/设计确认 |

特殊页面保持现状：12 个旧路径重定向、noindex 示例报告和 Google 验证页不套用普通内容页的 SEO 模板。示例报告缺 canonical 不作为普通页缺陷，也不为凑审计问题修改它。

本地 HTTP 预览曾在 `http://127.0.0.1:8000/` 执行验证，服务在本轮收尾关闭；重新运行预览命令即可启用。未完整检出的资料和视频需先补齐，不能将其本地缺省当线上错误。

## 6. 尚未验证

- 桌面/手机宽度的实际布局、菜单点击、键盘焦点、轮播暂停、减少动态效果、图片解码/慢网、筛选器和控制台运行时错误。浏览器控制工具在创建/读取页签时连续超时，本轮没有可交付的页面截图。
- `site.js:303-307` 初始化时捕获 hash 后生成语言链接，未监听 hashchange。点击同页章节后切换语言是否应跟随当前位置，需实际复现并确认行为目标，暂不作为已造成故障的问题。
- 图片是否逐个对应正确硬件、性能指标、Core Web Vitals、全量外部链接、PDF 页码、二进制内容/安装/签名、产品参数和价格的正式依据。
- Pages 后台 source 设置、统一入口后的验收和未来正式发布结果。
- Search Console、索引状态和搜索缩略图更新。

## 7. 第一个最小修复批次与用户决定

**建议首批只修 A2 的两处编码声明，保持网页和品牌不动。** 计划差异仅为：

```diff
- text=file.read_text()
+ text=file.read_text(encoding="utf-8")
- if text!=old: file.write_text(text);changed.append(str(rel))
+ if text!=old: file.write_text(text, encoding="utf-8");changed.append(str(rel))
```

这是待批准的方案，尚未写入脚本。验收：默认 cp936 且关闭 UTF-8 mode 时隔离运行成功；现有 61 HTML 保持预期；在隔离中文样本中验证一次真实同步写入仍为 UTF-8；再次运行无差异；四页 robots、canonical、语言链接不变；真实 diff 仅脚本和维护状态文档。

**发布前需独立决定 A1。** 建议保留现有 GitHub Actions 的 `_site` 发布入口，先核实后台再列出具体设置差异，取得授权后实施。只批准编码修复不等于批准修改 Pages 设置、推送 main 或部署。本轮没有变更配置。

A3/A4 可进入后续内容一致性小批次：确认 Control Center 正式中英文名称，选择 TraceBox 中文入口的语言提示或补译范围。

审美改善按独立小批次推进：先完成桌面/移动视觉基线，再选择一个页面统一字号、留白、图片裁切和 CTA 层级，提供预览后扩展到全站；维持既有 Logo、产品事实与信息结构。本轮未形成未经验证的全站重设计方案。

## 8. 状态与回退

已修改：仅四份本地维护 Markdown 文档；已测试：上表列明。

已推送：否；已部署：否；已线上验证：仅现网站抽样及下载/开发文件响应。

历史 main 部署成功是开始前已存在的记录，不是本轮发布。

文件留在独立本地分支，未暂存、未提交，便于审阅；HEAD 仍为基线。将来需要撤回时仅对本轮四份文档做针对性处理，不重置/覆盖其他工作，不对 main 强推。原始交接 ZIP 与本地参考文件夹保留。
