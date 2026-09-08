# Xilume 官网维护规则

适用仓库：`xilume/xilume.github.io`

正式域名：`xilume.co`

整理日期：2026-09-08

## 先读与核对

先读 `README.md`、`docs/WEBSITE_CONTEXT.md`、`docs/WEBSITE_STATUS.md`，按任务查阅 `docs/WEBSITE_AUDIT.md`、Pages workflow 和相关产品资料。核对远端、分支、HEAD、最新远端状态和未提交改动。使用独立任务分支，保护已有工作；不强推、重写历史或为了匹配旧交接回退工程。

用户当次明确要求优先于旧交接记录。区分用户决定、代码事实、历史偏好、建议和待验证事项；不能假定已读过以前的 ChatGPT 对话，也不能把历史助手的完成声明当作验证证据。

2026-09-08 首轮仅做工程交接与审查，这是已完成阶段的历史边界。随后用户要求修复已发现的问题和改进项，当前已授权在独立任务分支修改代码、维护工具和待审 workflow、测试及准备草稿审查，不必逐行确认。该授权没有取消下文的正式发布边界。

## 品牌、内容与设计

- 保持静态 HTML/CSS/JavaScript 多页面结构，英文根路由、简体中文 `zh-cn/` 共享资源。维护现有工程；不另建官网或擅自引入新框架、平台、域名及 URL 结构。
- 品牌为 Xilume / 熙联迈。设计以清晰、克制、真实工程产品和高质量素材为方向，逐批改善层级、排版、间距与移动端体验，不在每次维护时重做整站。
- 保留当前品牌素材。现行页头页脚使用 `images/xilume-official-wordmark.webp`，图标使用 `favicon.svg` 和 `xilume-icon-*.png`。交接中对部分旧 X/光环方案的否决不能直接套用于现行已在用素材；不自行重绘、替换 Logo 或复用旧版本。
- 不编造或凭相似型号推导产品参数、价格、供货状态、认证、兼容性、支持系统、芯片能力或公司信息。网站和 datasheet 不一致时登记冲突，核对产品版本与正式证据。
- Octant 为盒装 USB 工业通信扩展坞，XE826 为内置 USB 模块，二者不混用图片和资料；保持 Octant 的 `/products/8hub/` 路由。XL1326-A 的资料独立呈现。电池状态读取不等于充电、保护或大功率供电；不凭讨论方案宣称 PLC、EtherCAT 主站或功能安全能力。
- 保留已公开业务邮箱与电话。不主动加入个人姓名、私人地址、无依据的 Office 地址、语言/语音支持清单、制造归属或未经授权的合作背书，也不主动公开底层第三方 MCU 信息。
- 中英文自然表达，保持事实和主要入口对应。中文营销文案沿用避免句末“。”的偏好，但保留技术语法、小数、文件扩展名和必要安装限制。
- Control Center 入口沿用现有详情页名称 `Xilume CAN FD Control Center` / `熙联迈 CAN FD 控制中心`。中文页面进入现有英文 TraceBox 详情或示例时明确提示“英文”或 `EN`；不把英文品牌名当作语言提示，不凭空新增中文版或改动软件包。
- 不擅自替换公开下载包，不把测试文件放到正式路径；核对产品、版本、语言、系统架构与安装条件。

## 实施与验证

共享导航、页头、页脚、favicon 与资源版本入口为 `scripts/sync-site-chrome.py`，动态菜单及语言切换在 `site.js`。同步脚本已显式使用 UTF-8，并跳过 `_site/` 和原始交接目录；共享缓存资源改变时更新其 `VERSION` 并同步普通页面，当前值为 `20260908-maintenance1`。先读脚本，再按获批任务运行和审查 diff。

使用 Python 3.12+ 和 Node.js 24，在仓库根目录按影响运行：

```sh
python scripts/sync-site-chrome.py
python scripts/test-site-tools.py
node scripts/test-language-navigation.cjs
python scripts/build-site.py
python scripts/check-site.py _site
node --check site.js
python -m http.server 8000 --bind 127.0.0.1 --directory _site
```

首条用于获批的普通页面及共享资源维护；在仅检查任务中不要为了测试改写页面。`python3` 环境可替换命令名。构建脚本只允许替换仓库自己的 `_site/`，自定义输出须为仓库外的新目录或空目录；预览实际 artifact，打开 `http://127.0.0.1:8000/`。先确保工作区资料与视频完整，不能用本地缺省文件推断线上断链。无需引入 npm 或新框架。

每批按实际影响检查中英文页面、导航/CTA、图片与下载、canonical/hreflang/sitemap、JavaScript 错误与发布资源范围；共享修改扩大回归。视觉修改需桌面及手机宽度的实际浏览器检查和截图。工具失败时明确写“未验证”，不能以 HTTP 200 或语法检查替代交互/视觉验收。

语言切换回归覆盖查询参数、当前锚点、同页跳转及浏览器前进/后退。无中文对应的 TraceBox 页沿用中文下载总览回退，不把该页专用锚点带到总览。当前 Node 回归包含 12 项断言，不能替代实际浏览器验证。2026-09-08 已完成 1440px 桌面和 390px 手机抽样、菜单/Escape、语言 URL 与前进/后退、视频暂停检查，不能据此宣称全部页面、设备或产品内容已验收。

保留首页和 About 的中英文四页现有 `index, follow, max-image-preview:none`。这不是删除站内图片的指令；搜索缩略图、favicon、分享图和页面图片分别处理。

## 发布边界

待审发布链路为 `.github/workflows/pages.yml` → `scripts/build-site.py` → 检查后的 `_site/` → GitHub Pages。白名单统一维护于 `scripts/site_files.py`；新增根 CSS/JS/图标必须进入名单，新增页面同时核对中英文和 sitemap。`scripts/check-site.py` 检查实际 artifact 并拒绝维护资料；保留根 `.nojekyll` 及上传步骤的 `include-hidden-files: true`。

当前分支的 workflow 对 PR 只运行检查，不上传或部署；只有 `main` push / 在 `main` 手动运行才可能部署。正式部署并发组不取消正在运行的部署。代码中的触发条件不是用户发布授权，维护者仍须遵守批准边界。

**正式设置仍待处理：** 2026-09-08 认证只读 Pages API 已确认 `build_type: legacy`、来源 `main` / `/`、域名 `xilume.co`、强制 HTTPS。既有动态 Pages 流程上传仓库根目录，README 和维护脚本已在线上提供。当前仅准备分支中的修复，没有修改 Pages 设置，也没有修复线上发布范围。不得仅凭新白名单认定维护资料不会由旧流程发布。

没有用户明确的最终授权，不向 `main` 推送、不合并 PR、不触发正式部署、不修改 Pages 设置。当前 workflow 差异仅供分支审查；其他发布配置变更也须在获批范围内。首次合并前，先取得发布与 Pages Source 切换授权，将 Source 改为 **GitHub Actions**（`build_type: workflow`），保留域名和 HTTPS 并核实成功；然后才能按授权合并及部署。发布后检查实际运行、关键网页和下载，并验证 `/README.md`、`/AGENTS.md`、`/docs/WEBSITE_CONTEXT.md`、`/scripts/sync-site-chrome.py` 不再提供源文件。域名、凭据、Logo、型号参数、价格及大规模删除/重构同样不得擅改。

所有仓库文件按公开资料处理，不写密码、Token、私人聊天全文、未公开客户信息或商业资料。原始交接文件夹只作本地参考，不整体提交。

## 每轮收尾

更新 `docs/WEBSITE_STATUS.md`。新的已确认长期决定写入 `docs/WEBSITE_CONTEXT.md`，标明日期、来源；必要时更新本文件。分别报告已修改、已测试、已推送、已部署、已线上验证，以及未完成项和下一步。代码修改、本地通过、历史部署成功、本轮正式上线不得混为一谈。

“长期维护”在本轮指持续按任务维护；本轮没有创建定时巡检、自动发布或后台持续运行承诺。
