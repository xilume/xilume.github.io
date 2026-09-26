# Xilume 官网维护背景

整理日期：2026-09-08

核对基线：`d188871c2d226d8b2ca5bc73fa85d11d67047d55`

证据：用户明确要求、提供的交接 ZIP、当前 Git 树与代码、近 12 条提交、GitHub Actions 日志、认证只读 Pages API、实时 HTTPS 请求及本地测试/浏览器检查

## 证据与优先级

本文件不包含完整历史聊天，也不声称已读取用户过去的 ChatGPT 对话。最新明确要求决定任务目标；交接包保留为有来源的历史资料；代码说明当前实现，不自动证明硬件宣传真实。未验证的产品参数、价格、认证、驱动兼容性和搜索结果保持待核实。

## 2026-09-08 新确认的长期决定

用户明确希望接手整个官网的长期维护，并逐步提升网站审美和设计；范围包含代码、产品页、双语内容、图片引用、导航、下载链接、技术 SEO、预览测试、正式发布与线上验证。

保持现有技术栈、品牌风格和产品定位，不每次重新设计。首次仅交接和审查的阶段已经完成；随后用户要求“把你检查出来的问题和需要改进的地方都改好”，授权自主修复和测试，不逐行请求确认。

**2026-09-08 后续明确决定：** 用户进一步要求“你以后修复完要发布到xilume.co这个官网上”。本次及以后常规维护修复在独立任务分支完成测试和审查后，应合并到 `main`、正式发布到 `xilume.co`、完成线上验证并更新状态，不再逐次询问发布许可。这取代先前阶段对每批 main 合并与部署另行确认的要求；Logo、产品参数、价格、域名、大规模删除和与任务无关配置仍不得擅改。本次解决 A1 所需的 Pages Source 从 legacy 切到 workflow 已获得授权。

本轮沿用既有软件详情 H1 统一 Control Center 入口名称，为中文页面上的英文 TraceBox 入口补语言提示；这是现有信息的一致性修复，不是另定产品名称或发布新语言软件。设计提升继续按小批次和实际预览推进，本轮没有整站重设计。

每轮更新状态，将新的确认决定留在版本化文档。禁止把凭据、私人聊天或未公开商业信息写入公开仓库。常规修复的测试后发布属于已授权流程；没有安排定时巡检或无人值守后台任务。

## 2026-09-25 表单确认邮件决定

来源：用户明确要求设置提供的英文确认文案，并确认已关闭 Dynadot 自动回复。表单提交后的确认邮件由 FormSubmit `_autoresponse` 处理；为满足该供应商限制，中英文表单改为原生 POST 并保留验证码。普通业务邮件仍使用 `contact@xilume.co`，不变更邮箱或 DNS。确认邮件实际送达与 Reply-To 需实收验证，不能用代码检查或服务页面代替。

## 工程事实

### 2026-09-08 快捷联系决定

用户要求在 Contact 页面直接填写邮箱、姓名和问题，减少询价时打开邮件软件和复制邮箱的操作，参考成熟公司的专业联系体验，并明确授权“工作人员会在一个工作日内回复”的提示。实现为页面内表单，邮箱和问题必填、姓名选填，默认价格咨询；不增加公司、电话、预算等门槛。中英文同步保留原有品牌与公开电话。

用户随后明确只需向 `contact@xilume.co` 发送，取消私人邮箱转发关系核验。维护中不得把私人收件地址写入页面、服务抄送、仓库或公开报告；也不能把 DNS MX、服务接受或用户激活表单当作转发配置证据。2026-09-08 用户分别确认本地预览来源和官网来源的 FormSubmit 激活，两处真实浏览器提交均被服务接受；最新发布与线上状态见 STATUS。

静态 GitHub Pages 页面采用 FormSubmit 转送询盘，前端无秘密凭据，提交时才向服务发送用户填写的内容，并在表单旁说明服务提供方和隐私政策。不能据此承诺零存储、已送达收件箱或经过完整安全审计。实现、测试和已知服务限制见 `WEBSITE_CONTACT.md`。

仓库 `xilume/xilume.github.io` 为公开仓库，默认分支 main。首轮核对的远端基线与交接包相同，无需回退；之后的提交和部署以 STATUS 中的实际记录为准。技术栈为无应用构建步骤的静态 HTML/CSS/JavaScript；英文位于根目录，中文位于 `zh-cn/`。

基线跟踪 231 个文件，含 61 个 HTML：47 个可索引内容页、12 个兼容重定向、1 个 noindex 示例报告、1 个 Google 验证页。本轮新增维护工具和文档，页面结构仍为 23 组中英文内容页及 1 个英文 TraceBox 页面；sitemap 对应 47 个 URL。路由与验证详见审计报告。

| 入口 | 用途 |
| --- | --- |
| `index.html`、`zh-cn/index.html` | 中英文首页 |
| `products/`、`solutions/`、`applications/` | 产品、连接方案、应用场景 |
| `documentation/`、`downloads/` | 对访客的技术资料、软件与下载 |
| `about/`、`contact/` | 公司与联系方式 |
| `styles.css`、`site-refinement.css`、`zh-cn.css` | 基础、全站细化与中文样式 |
| `company-applications.css`、`products/product-refinement.css`、`documentation/docs-support.css` | 页面类别样式 |
| `site.js`、`hero.js`、`finder.js`、`chip-selector.js` | 导航/语言切换、首页轮播与选择工具 |
| `scripts/sync-site-chrome.py` | 共享页头页脚、品牌引用及版本同步 |
| `scripts/site_files.py`、`scripts/build-site.py` | 统一发布白名单及静态文件打包；不转换网页或素材 |
| `scripts/check-site.py`、`scripts/test-site-tools.py` | artifact、引用/SEO 检查与维护工具回归 |
| `scripts/test-language-navigation.cjs` | 语言切换 URL / 事件回归，不替代真实浏览器 |
| `images/`、`media/` | 现有图片与视频 |
| `robots.txt`、`sitemap.xml`、`CNAME` | 抓取、路由和域名配置 |
| `.github/workflows/pages.yml` | 自定义 Pages 发布入口 |
| `AGENTS.md`、`docs/` | 本轮新增的维护规则、背景、状态与审计 |

`docs/` 与公开网站的 `documentation/` 是不同目录。目录名称不构成保密或不发布保证。

## 部署现状与交接纠正

基线自定义 workflow 在 main push 或手动触发时将显式根文件和产品等目录复制到 `_site/`，然后上传并部署。

但同一基线实际存在两次成功正式部署：

- [Deploy Xilume website](https://github.com/xilume/xilume.github.io/actions/runs/34178122653)：上传 `_site/`
- [pages build and deployment](https://github.com/xilume/xilume.github.io/actions/runs/34178122459)：动态流程上传仓库根目录，日志明确列出 README 和同步脚本

首轮实时请求已确认 `https://xilume.co/README.md` 和 `https://xilume.co/scripts/sync-site-chrome.py` 返回基线 HEAD 的精确文件字节。因此旧交接和旧 README 的“开发文件不发布”只能描述自定义复制名单，不能概括当前实际网站。

2026-09-08 发布前认证只读 API 曾核实 Pages 设置为 `build_type: legacy`、来源分支 `main`、路径 `/`，域名 `xilume.co` 且强制 HTTPS；这补齐了首轮未读取设置的证据。该结果记录迁移前状态，不能从两次成功记录确定哪次最终覆盖另一套。

本轮发布链路以 `scripts/site_files.py` 作为唯一白名单来源，由 `scripts/build-site.py` 构建 `_site/` 并先检查；根资源显式列出，网站目录递归复制并排除维护资料。`.nojekyll` 保留且上传步骤显式包含隐藏文件。PR 运行工具、语言导航、artifact 与 JavaScript 检查，不上传 Pages artifact，不取消正在运行的正式部署。合并后的 main 网站改动经检查后部署；`push.paths-ignore` 排除 `AGENTS.md`、`README.md`、`docs/**`，仅这些文档变化时不重复部署，PR 检查照常运行。

**A1 的发布设置、正式代码部署与维护路径验收已完成。** 已按授权切换 Source 为 **GitHub Actions**，于 `2026-09-08T07:53:30Z` GET 核实 `build_type: workflow`、`cname: xilume.co`、`https_enforced: true`。响应中的 `source` 字段仍显示 `main` / `/`，生效发布类型已经是 workflow；不把保留字段误判为切换失败。本批已由 PR #3 合并并在生产 run `34202648965` 部署提交 `322902a62883e701a2c348ced358e73e07146972`；同提交只有预期的自定义发布流程。2026-09-08 08:08:14 UTC 的线上核验确认 200 个发布文件可访问、115 个文本资源与构建一致、6 类维护路径原 URL 与刷新查询 URL 均返回 404。具体范围与浏览器连接限制见 `WEBSITE_STATUS.md`。即使以后不随站点发布，公开仓库中的维护文件仍不是秘密。

## 品牌素材与历史偏好

交接记录的方向是清晰、克制、高质量真实产品图，偏好 Apple/NVIDIA 式的信息层级；这不是重做整站或模仿其他品牌 Logo 的授权。逐步改善排版、留白、图片裁切和页面一致性，应先取得实际桌面及移动端视觉基线。

当前代码统一引用的页头/页脚字标是 `images/xilume-official-wordmark.webp`；图标入口为 `favicon.svg`、`xilume-icon-180.png` 及 manifest 的 192/512 图标。本轮已目视打开字标与 192px 图标：当前素材确实包含 X 图形和蓝色弧光。2026-09-07 提交 `a37640e` 的摘要称采用用户选择的字标与图标，但本轮没有重新取得视觉选择确认。

交接中“曾拒绝部分旧 X/光环方案”是历史记录，不能被扩大为否定当前所有 X/弧光元素。保留当前素材、不换 Logo；若用户以后要求调整，先明确目标文件与参考版本。本轮检查证明实际文件外观和引用，不替代用户的最终品牌决定。

品牌文字为 Xilume / 熙联迈。公开业务邮箱为 `contact@xilume.co`，电话为 `+1 (657) 345-9435`。沿用不主动加入个人姓名、私人地址、无依据 Office 地址、语言/语音支持列表和未授权制造归属的规则。网页抓取缓存曾返回旧 Contact 信息，实时 HTML 已更新，不能把缓存当作当前故障。

中文营销文案沿用避免句末“。”的偏好，中英文各自自然表达；不得因此省略技术限制或破坏数字与文件名。

## 产品定位与内容边界

| 名称 | 保持的区分 |
| --- | --- |
| Octant | 盒装 USB 工业通信扩展坞；保留 `/products/8hub/` |
| XE826 | 内置 USB 工业通信模块；与 Octant 的素材、规格、资料分开 |
| Dual Mini PCIe CAN FD | 内置双路 CAN/CAN FD 产品；兼容性按具体资料 |
| XL1326、XL1326-A、XL1108 | 型号和能力不从名称互推；XL1326-A 资料独立 |
| 电池显示/接口模块 | 电池数据和主机集成；不等同于充电、保护或大功率供电 |
| Control Center | 入口沿用现有 H1：Xilume CAN FD Control Center / 熙联迈 CAN FD 控制中心 |
| TraceBox Analyzer Pro | 当前详情和示例为英文；中文入口明确标注英文或 EN，不凭空新增中文软件或资料 |

产品参数、型号、价格、认证、支持系统和驱动/固件版本需对应正式资料。不同 SKU、模块与盒装不能混用。Octant 不因开发讨论被宣传成已完成 PLC、EtherCAT 主站或安全控制器。下载 HTTP 可达不证明可安装、安全性、版本最新或兼容性。

Solutions 保持“具体连接问题 → 主机接口 → 现场接口 → 推荐硬件”的表达：内置扩展、移动电脑现场/汽车调试和客户原理图集成等。当前 2026-09-07 的相关改动已进入代码，不等于所有设备回归已通过。

## SEO 与图片策略

`d188871` 仅在首页、About 中英文四页增加 `max-image-preview:none`，保留 `index, follow`。没有删除网页图片，不据此清理 Logo、产品图或分享图，也不在普通规范化任务中擅自撤销标签。

搜索结果缩略图、站点图标、分享图与正文图片是不同目标。本轮没有 Search Console 实时信息，不承诺搜索引擎已更新或立即生效。

## 维护环境与已知限制

本轮真实 Git 工程位于 main 基线上的独立任务分支 `codex/site-maintenance-fixes-20260908`。初次因 Git 大包连接中断，采用浅层部分克隆，源码与图片按固定提交的 Git blob 哈希核对补齐；后续又将此前缺失的 12 个二进制文件按固定提交下载并验证 blob 哈希，关闭稀疏检出。当前工作树资料和视频已完整，历史仍为浅层；没有替换网站源码、更新下载包版本或回退旧工程。

Windows 默认 cp936 的同步脚本错误已在分支修复为显式 UTF-8 读写，并跳过 `_site/` 与原始交接目录。共享资源版本已更新为 `20260908-maintenance1`，让语言导航修复不沿用旧缓存。工具回归验证实际中文写入、重复运行幂等、四页 robots 保持、发布范围、缺失引用和输出目录保护。

语言切换原先在初始化时捕获 URL，现已随 `hashchange` / `popstate` 更新，并为有对应中英文页的切换保留查询参数与锚点。英文 TraceBox 无中文详情，继续回退中文下载总览，不附带无对应的专用锚点；12 项 Node 断言覆盖 URL 与事件行为。

首轮浏览器超时已经在后续检查中解决，完成 1440px 桌面及 390px 手机宽度抽样、菜单/Escape、查询参数与锚点、前进/后退和视频暂停检查。具体证据与检查范围见 STATUS/AUDIT；这不等于全部浏览器、每张产品图、软件安装、硬件事实或搜索结果均已验证。未建立定时巡检或后台持续运行任务。

## 当前维护命令

使用 Python 3.12+、Node.js 24，从仓库根目录运行；无需 npm 安装：

```sh
python scripts/sync-site-chrome.py
python scripts/test-site-tools.py
node scripts/test-language-navigation.cjs
python scripts/build-site.py
python scripts/check-site.py _site
node --check site.js
python -m http.server 8000 --bind 127.0.0.1 --directory _site
```

同步命令用于任务范围内的页面或共享资源维护，并审查 diff。其他命令检查与预览实际发布 artifact；预览地址为 `http://127.0.0.1:8000/`。系统使用 `python3` 时替换命令名。构建只可替换仓库自己的 `_site/`；自定义输出必须为仓库外新目录或空目录。以后新增根资源更新 `scripts/site_files.py`，新增可索引页面同步语言与 sitemap。常规任务按独立分支 → 测试/审查 → 合并 → `xilume.co` 发布 → 线上验证 → 状态更新完成，具体发布步骤见 `WEBSITE_RELEASE.md`。

## 固定来源

- [README](https://github.com/xilume/xilume.github.io/blob/d188871c2d226d8b2ca5bc73fa85d11d67047d55/README.md)
- [Pages workflow](https://github.com/xilume/xilume.github.io/blob/d188871c2d226d8b2ca5bc73fa85d11d67047d55/.github/workflows/pages.yml)
- [最新图片预览策略提交](https://github.com/xilume/xilume.github.io/commit/d188871c2d226d8b2ca5bc73fa85d11d67047d55)
- [采用当前品牌素材的提交](https://github.com/xilume/xilume.github.io/commit/a37640e7a4744ab9e536e5a7be960b0c24fe3c2b)
- 用户提供的 `Xilume_Website_Codex_Handoff_20260908.zip` 三份规则/背景/状态文档
- 2026-09-08 用户后续修复要求及“以后修复完要发布到 xilume.co”的明确长期决定、认证只读 Pages API 核对、当前任务分支及 STATUS/AUDIT 中的验证记录

## 2026-09-15 DualCANFD 随附内容

来源：用户本轮明确要求及提供的配件实物照片、资料目录截图

DualCANFD 附赠全高扩展挡板与两条 DB9 转接线（用户称 DP9），每个 CAN / CAN FD 通道各一条；资料目录为 `01_用户手册`、`02_SDK`、`03_驱动` 和 `README_开始这里.md`。中英文产品页、资料说明和下载入口同步维护。英文目录标签可翻译，不能据此宣称已有另行打包的英文资料或新增未收到的文件下载。

## 2026-09-15 DualCANFD 接线图片修订

来源：用户在上一轮发布后提供的实际 Xilume CAN 卡正面参考照片，并明确要求更正接线图里的板卡款式、增加 Xilume / XL1326-A 芯片丝印和翻新外观。

接线图应采用该参考板卡布局，主控丝印位于左下方四边引脚的方形芯片上；保留两条 DB9 转接线与连接示例用途。中英文产品页共用同一更正后的图片，不将旧接线图中的板卡作为品牌型号依据。


## 2026-09-15 XL1326-A 官方丝印参考

来源：用户明确指定官网首页芯片区的 XL1326-A 为正确丝印参考

DualCANFD 接线展示图的左下方方形主控应沿用首页 `images/chip-family-hero-xl1326-v4.webp` 中 XL1326-A 的官方字标和排版：带弧线的 Xilume 字标、`XL1326-A`、参考批次行 `2634A1`。这项要求用于图片修订，不代表重新核定实物批次或其他产品规格
