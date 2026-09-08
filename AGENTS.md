# Xilume 官网维护规则

适用仓库：`xilume/xilume.github.io`

正式域名：`xilume.co`

整理日期：2026-09-08

## 先读与核对

先读 `README.md`、`docs/WEBSITE_CONTEXT.md`、`docs/WEBSITE_STATUS.md`，按任务查阅 `docs/WEBSITE_AUDIT.md`、Pages workflow 和相关产品资料。核对远端、分支、HEAD、最新远端状态和未提交改动。使用独立任务分支，保护已有工作；不强推、重写历史或为了匹配旧交接回退工程。

用户当次明确要求优先于旧交接记录。区分用户决定、代码事实、历史偏好、建议和待验证事项；不能假定已读过以前的 ChatGPT 对话，也不能把历史助手的完成声明当作验证证据。

2026-09-08 首轮仅做工程交接与审查，这是已完成阶段的历史边界。随后用户授权修复全部已发现的问题，并明确要求“你以后修复完要发布到xilume.co这个官网上”。本次及以后常规维护修复可在独立分支修改、测试与审查后合并并发布到 `xilume.co`，不再逐次询问发布许可。按下文的内容边界与验证流程完成工作；新的明确限制优先。

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

## 发布流程与边界

常规流程为：独立任务分支 → 修改与测试 → 审查最终 diff / PR 检查 → 合并到 `main` → 发布到 `xilume.co` → 线上验证 → 更新状态。发布链路为 `.github/workflows/pages.yml` → `scripts/build-site.py` → 检查后的 `_site/` → GitHub Pages。白名单统一维护于 `scripts/site_files.py`；新增根 CSS/JS/图标必须进入名单，新增页面同时核对中英文和 sitemap。`scripts/check-site.py` 检查实际 artifact 并拒绝维护资料；保留根 `.nojekyll` 及上传步骤的 `include-hidden-files: true`。

workflow 对 PR 只运行检查，不上传或部署；合并后的 `main` 网站改动或在 `main` 手动运行经检查后部署。`push.paths-ignore` 排除 `AGENTS.md`、`README.md`、`docs/**`，仅这些维护文档变化时不重复部署，PR 仍运行检查。正式部署并发组不取消正在运行的部署。已有长期授权覆盖常规维护合并与发布，不需要另设逐批人工批准步骤。

**本次发布迁移：** 2026-09-08 发布前只读 Pages API 曾确认 `build_type: legacy`，既有动态流程上传仓库根目录并提供 README 和维护脚本。已按本次授权将 Pages Source 切为 **GitHub Actions**，并于 `2026-09-08T07:53:30Z` 通过 GET 核实 `build_type: workflow`、`cname: xilume.co`、`https_enforced: true`。响应仍保留 `source: main /` 字段，生效发布类型以 `build_type` 为准，不因此切回 legacy。设置与本批修复已正式发布，生产 run `34202648965` 成功，线上 200 个发布文件可访问，6 类维护路径返回 404。完整范围和工具限制见 `docs/WEBSITE_STATUS.md`；后续仍须分别核对设置、部署和线上结果。

发布后检查实际运行、关键网页和下载，并验证 `/README.md`、`/AGENTS.md`、`/docs/WEBSITE_CONTEXT.md`、`/scripts/sync-site-chrome.py` 不再提供源文件。Logo、型号参数、价格、域名、大规模删除/重构和与任务无关的配置不在常规维护授权内，不得擅改。发布失败先定位原因并保护最后一次成功版本，不强推 main，不以重复触发代替诊断。具体步骤见 `docs/WEBSITE_RELEASE.md`。

所有仓库文件按公开资料处理，不写密码、Token、私人聊天全文、未公开客户信息或商业资料。原始交接文件夹只作本地参考，不整体提交。

## 每轮收尾

更新 `docs/WEBSITE_STATUS.md`。新的已确认长期决定写入 `docs/WEBSITE_CONTEXT.md`，标明日期、来源；必要时更新本文件。分别报告已修改、已测试、已推送、已部署、已线上验证，以及未完成项和下一步。代码修改、本地通过、历史部署成功、本轮正式上线不得混为一谈。

“长期维护”包括每次常规修复通过测试后发布并验证；没有创建定时巡检或无人值守后台任务，也不承诺在未运行的会话中持续工作。
