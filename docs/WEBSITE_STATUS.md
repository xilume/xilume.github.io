# Xilume 官网维护状态

## 2026-10-22 Stripe 上线准备与安全加固（真实收款保持关闭）

- 基线 main：`8bc0ea81aa9bcea46642470876b7aba31b07e1c9`；独立分支 `codex/shop-payment-readiness-20261022`，没有覆盖已有修改
- 认证只读核验：当前连接只有 Xilume sandbox、livemode=false；两款既有 Product / Price / Payment Link 均 active 且为测试模式，SKU 对应正确，USD 一次性价格为 6999 / 19900 美分，分别对应网站 69.99 / 199.00 美元
- 两个测试链接均为单行商品、数量 1，未配置可调数量，使用 Stripe hosted confirmation；美国收货地址采集明确仅作示例，未设运费，automatic_tax=false，tax_behavior 未指定，商品 tax_code 为空；这些不是正式销售决策
- sandbox 的 webhook endpoints 列表为空；现有仓库无订单后端。发票开关不能证明收据邮件已送达，联系表单确认也不是付款确认
- 已修改：独立付款开关（false）、原始 URL 严格校验、重复 SKU 付款目标拦截、只读 Stripe 金额/商品/模式核验工具、离线回归、受影响脚本版本及上线说明。两个公开链接继续 null，保留网站外观、价格和联系购买入口
- 已测试：22 项 Shop 检查、40 项 Stripe 核验工具测试、10 项维护工具测试、12 项语言断言、8 项联系表单场景、13 个发布 JS 语法检查；构建仍为 216 文件 / 66 HTML / 49 可索引页 / 2756 引用；diff 空白检查通过。两个认证 sandbox 对象快照也通过新校验器
- 验证边界：新 CLI 的直接持钥网络请求未执行；公开双语 Shop 内容读取确认当前价格与联系购买提示，但浏览器连接未完成，未声称本轮桌面/手机交互通过。没有 Stripe 成功/失败/取消/异步付款、收据实收或真实扣款测试
- 必须由本人完成：选择实际正式商户及国家/主体类型、真实商户/身份资料和税号、Stripe 要求的身份核验、银行验证及条款声明；由本人确认可售库存、配送国家/运费/发货时间、退款保修隐私政策及税务决定
- 尚缺工程：签名验证的付款 webhook、持久订单记录、按 Session 去重/并发与重试处理、异步支付结果处理、通知及实际端到端验收。未部署新后端、数据库或通知服务
- 已推送并合并：[PR #17](https://github.com/xilume/xilume.github.io/pull/17)，代码 head `192ec459817dab7e36d40b883ca887f13d4fdda1`，合并 SHA `819e624a81ae3cfd9d4990fb5fd7140c79f3d352`；[PR CI](https://github.com/xilume/xilume.github.io/actions/runs/39873375758) 与 [main CI](https://github.com/xilume/xilume.github.io/actions/runs/39873435744) 全部成功，新 Stripe 离线核验步骤实际执行成功
- 已部署：Cloudflare Pages 对该合并 SHA 的官方 check 于 2026-10-22 16:43:47 PDT（23:43:47 UTC）报告 Deploy successful，部署 `2d7adb68-8b44-4b48-bdcb-7778f13eb058`，[固定部署](https://2d7adb68.xilume.pages.dev/)。主分支重新读取确认 checkout=false、两个链接 null。此记录不将部署成功等同于付款上线
- 线上验证边界：双语 Shop 公开页面内容读取仍为原价和联系购买；本轮未完成线上 JS 字节对比、真实桌面/手机交互或 Stripe 端到端付款验收。真实收款仍关闭，没有启用订单后端
- 详细对象检查、本人事项和验收矩阵见 `WEBSITE_SHOP.md`；本轮未创建或更改 Stripe 对象、未发送邮件、未填写未知商户/库存/配送资料

## 2026-10-11 正式官网已切换至 Cloudflare Pages Free

- 本机 Chrome 现有登录会话完成部署及 DNS 操作，Cloudflare 身份经用户菜单核对；GitHub App 仅获 `xilume/xilume.github.io` 仓库访问。未读取或导出浏览器 Cookie、密码，未购买套餐
- 生产项目 `xilume`，仓库、框架 None、仓库根目录、`python scripts/build-site.py && python scripts/check-site.py _site`、仅 `_site` 输出、main 生产与指定迁移预览均保持已核实设置
- 实际生产部署：`52de383d-dd44-4d86-b2ff-80e300ae5c24`，SHA `d8a34910f473ef75cb4b6d9aeff461bb6a705c26`，日志 2026-10-11 17:23:04 PDT（2026-10-12 00:23:04 UTC）成功。此提交只更新维护文档；网站产物与通过 PR CI 的版本相同，216 文件 / 66 HTML / 49 可索引页 / 2756 引用
- 实际同 SHA 预览：`f09109af-047a-468e-b175-f744fe7fa8af`，日志 17:21:11 PDT 成功，[固定预览](https://f09109af.xilume.pages.dev/)，[迁移分支别名](https://codex-cloudflare-20261011.xilume.pages.dev/)。最新 Shop HTTP 响应头实测 `X-Robots-Tag: noindex`；此前完整预览 HTTP、资源与浏览器验收继续有效
- DNS 委派 17:21 PDT 生效：父区和 Cloudflare / Google 递归均为 `maisie.ns.cloudflare.com`、`zeus.ns.cloudflare.com`。Pages 激活向导只将四条旧网站 A 与旧 www CNAME 改成两个 proxied CNAME `xilume.pages.dev`；最终区有 7 条记录，MX / SPF / DKIM / DMARC / Google 验证共 5 条逐值保留且 DNS only。两家递归与两台 Cloudflare 权威均核对通过，父区 / 递归无 DS，符合 Dynadot 后台 DNSSEC `Not Set`
- 域名注册商与邮箱仍为 Dynadot。完整账户 CSV、所有 UI 配置、邮箱自动记录及旧 NS 备份保存在公开仓库外，未把自动扫描或公共 DNS 当作完整备份；初始扫描遗漏 DKIM 已补齐
- Pages `xilume.co` 与 `www.xilume.co` 均在 17:35 PDT 的账户 UI 明确 Active / SSL enabled，Universal SSL 已 Active 覆盖 apex 与 `*.xilume.co`，Always Use HTTPS 为 On。[正式官网](https://xilume.co/) 和双语 Shop 均已从 Cloudflare 返回经核对的发布内容；HTTPS 证书正常验证，无浏览器安全警告绕过
- `www to xilume.co` 为 301 动态跳转、保留路径与查询串；精确匹配 www 并排除 `/.well-known/acme-challenge/`，避免拦截 Pages 的 HTTP 证书验证。首次普通 www 流量实测通过；随后发现验证路径被旧表达式重定向，依照官方调试说明补充例外，最终规则状态 Active。17:32:52 PDT 定向 5 项复核通过：普通中英路径 HTTP/HTTPS 仍准确 301，随机 HTTPS ACME token 返回真正 404、无 Location；随后账户 UI 于 17:35 PDT 明确 www Active / SSL enabled，实际验证成功的依据为该账户状态
- 正式域名验收 17:30 PDT 完成：216/216 文件 GET 200 且内容匹配（111 字节精确、105 文本只规范化 CRLF）；所有二进制图片和软件下载字节匹配；6 类未知 / 维护路径真实 404，双语错误页与 meta noindex 正常；9 项 HTTP→HTTPS / www→apex / SKU 查询保留通过
- 正式隔离 Chrome 桌面 / 手机：28 项页面/视口及 7 项交互全部通过，无横向溢出、页面 JS 错误或已加载图片失败；双语 Shop/购买入口、语言 SKU/query/hash/返回、手机菜单、联系预填/必填阻断正常。没有安装下载软件，部分长页延迟图未滚动加载，二进制资源匹配另验
- Cloudflare 默认 Email Address Obfuscation 初次改写 51 HTML；已关闭这一新加入的公开邮箱改写，保留现有 mailto 链接和产物。仅重验受影响的 51 HTML，全部恢复匹配；其余已过测试未无故重跑
- 双语表单源配置、原生 POST、验证码、自动确认与各自固定 `_url` 在新托管核对正常。唯一授权实收测试发生在此前的相同正式来源域名，业务 Inbox 已实收，Gmail 自动确认进入 Spam、自动确认邮件 Reply-To 已核实为 `contact@xilume.co`；切换后没有第二次发送，不把配置检查称为新托管的再次送达测试
- 付款仍未启用：只有 `livemode=false` 的 sandbox，两个公开链接 null，正式 Shop 明确联系购买。Stripe 成功 / 取消 / 失败付款流程未测试，没有创建正式订单或真实扣款。待用户选择 / 连接正式商户并亲自完成商户与银行验证，确认可售库存、配送范围/运费、发货条件、退款政策、实际商户资料与税务配置后，再接入平台可靠确认的付款
- 旧 GitHub Pages 发布 workflow 在 Shop 合并前已改为只检查；原部署与 DNS 回退依据保留。后续 main 网站改动由 Cloudflare Git 自动部署，不将带 Shop 的 main 再发布至旧托管；必要回退见 `WEBSITE_CLOUDFLARE.md` 与历史发布说明
- 下方为各阶段历史快照，曾出现的“待委派 / 待迁移 / 未合并”不表示当前状态

## 2026-10-11 正式来源单次邮件实收（托管切换仍待委派）

- 用户明确授权一次测试询单和对应自动确认，并在本机完成 FormSubmit 验证码；仅提交一次，没有重试或追加发送
- 17:10 PDT：Dynadot `contact@xilume.co` 的 Inbox 实际收到该测试，邮件正文包含唯一测试标记、已批准的测试名称与 Other 类型；没有以 HTTP 200 或回到首页代替收件证据
- Gmail 实际收到自动确认，时间 17:10:29 PDT，From 为 FormSubmit `autoresponse@formsubmit.co`，Reply-To 为 `contact@xilume.co`；Gmail 对 FormSubmit 发送域的 SPF / DKIM / DMARC 均判 pass，但邮件被归入 Spam，不能称为到达普通收件箱。未修改用户邮件标签或过滤规则
- 本次测试发生在正式域名仍提供旧站、Pages apex 尚未关联期间，验证的是不变的正式来源和 FormSubmit/Dynadot 邮件服务，不证明已切换至 Cloudflare；未再次提交同一测试
- 未验证：业务邮箱直接外发 SMTP、询单原始 Reply-To（原文查看被浏览器客户端阻止）、中文实际提交与其他收件人的分类；没有把此轮实收扩展成完整邮件服务审计
- 后台 Free / renew 提示不再作为邮箱不能收件的推断；本轮已取得实际业务收件证据，未购买、续费或改动邮箱方案
- 维护记录 `abca300ece0febf04ae9535fc74babccdd396909` 也已由 Cloudflare main 部署成功：`1c8f0b99-8123-4628-81c4-f9091562eef6`，2026-10-11 17:09:34 PDT（2026-10-12 00:09:34 UTC）；此提交只改维护文档，网站产物不变。预览 `7a2001d2.xilume.pages.dev` 同 SHA，Shop 实测 noindex

## 2026-10-11 Cloudflare main 已部署，DNS 委派已提交（域名激活等待中）

- 已合并：[PR #16](https://github.com/xilume/xilume.github.io/pull/16)，最终 head `b79110d72158d8abd6077aac46dfd40895e8af04`；[最终 PR CI](https://github.com/xilume/xilume.github.io/actions/runs/38185779724) 成功，合并 SHA `ad4778f280c9f0949be18da53ba99035cafaa235`
- 旧发布已停用：main 的 `.github/workflows/pages.yml` 仅检查，已移除 GitHub Pages artifact 上传、deploy job 和 Pages / ID-token 写权限；保留全部测试、构建及 JS 检查，不将 Shop 发布至旧托管
- Cloudflare 项目 `xilume` 正式 main 部署成功：`9b2fb074-acfb-4f38-a716-edd6cc83471e`，SHA `ad4778f280c9f0949be18da53ba99035cafaa235`，日志 2026-10-11 23:55:18 UTC 成功；[正式 Pages 地址](https://xilume.pages.dev/)，[固定部署](https://9b2fb074.xilume.pages.dev/)。指定构建、Python 3.12.14、216 文件产物均已核实
- 最新迁移预览：`57d1d41d-26c3-46af-9abd-bd66028f2d9d`，SHA `b79110d72158d8abd6077aac46dfd40895e8af04`，[固定预览](https://57d1d41d.xilume.pages.dev/)，[分支别名](https://codex-cloudflare-20261011.xilume.pages.dev/)。新生产 / 预览定向核验 33/33 通过；网站文件与先前验收完全一致。完整 216 文件和 28 项桌面/手机验收范围见下方
- 完整 DNS 备份已保存于公开仓库外：账户实际 CSV 与全部 UI 行吻合（6 条显式记录，TTL 300，DDNS 关闭）；同时保存真实 `Dynadot Email Hosting` 模式及其 4 条自动邮箱记录，组合清单为 10 条。明确保留 MX、SPF、DKIM、DMARC、Google 验证、www 和旧 NS，未把扫描 / 公共查询当作完整账户导出
- DNS 对账：Cloudflare 两台权威服务器的 10 条记录全部与组合备份一致；网站 A / www 目前均为 DNS only，继续指向原 GitHub Pages，以便区域激活期间保留当前网站。邮件记录 DNS only，注册商和邮箱供应商仍为 Dynadot，没有购买套餐
- 委派提交：2026-10-11 16:59 PDT 已在 Dynadot 保存 `maisie.ns.cloudflare.com` 和 `zeus.ns.cloudflare.com`，后台 DNSSEC 明确 `Not Set`，父区无 DS；没有禁用既有 DNSSEC。17:02 PDT 的父区和两家递归查询仍为旧 Dynadot NS，Cloudflare UI 仍等待激活，不把注册商保存误写为正式站切换完成
- www 跳转已在 Cloudflare 准备：规则 `www to xilume.co`，精确匹配 `www.xilume.co`，301 至 `concat("https://xilume.co", http.request.uri.path)`，保留 query。当前 DNS only 流量不会应用该规则；待 Pages 关联及证书就绪后再启用对应代理并实际验证
- 尚未完成：Pages UI 当前要求区域激活后才能关联 apex，`xilume.co` 的新 Pages 绑定、正式流量切换、custom-domain HTTPS 与新规则实测仍待委派生效；当前正式域名仍由旧站提供，不能宣称官网已迁移完成
- 邮件：保留已有业务邮箱与全部相关 DNS；后续已完成授权的一次业务实收与自动确认核对，结果及 Spam / Reply-To 边界见上方。Dynadot 旧详情页的 Free / renew 提示未引发购买或方案变更；直接外发及新托管来源仍未验证
- 支付：未启用。连接仍仅为 `livemode=false` sandbox，两个链接为 null，公开 Shop 仅联系购买；正式商户选择、商户/银行验证、可售库存、配送国家/运费、退款政策及税务配置未完成，未做真实扣款或 Stripe 成功 / 取消 / 失败流程实测
- 回退依据：原网站部署与 DNS 组合备份均保留；必要时恢复记录 / 原 NS `ns1.dyna-ns.net`、`ns2.dyna-ns.net`，不 reset main 或覆盖其他修改。重新启用旧 workflow 前必须移除商店并按旧站构建验收，不能直接将已含 Shop 的 main 再部署到 GitHub Pages

## 2026-10-11 本机接管与 Cloudflare 预览验收（正式域名待切）

- 已 fetch：`main` 仍为 `c36772cd269089f891943d9fec6fa0a31f0a4861`，两个任务远端分支仍为 `6519fac3304d851f70bfe5d9d2428a5dbed03708`，未覆盖其他修改
- 已确认：本机 Chrome 的现有 Cloudflare 登录会话可用；GitHub App 已仅安装至 `xilume/xilume.github.io`，用户在本机完成 GitHub 重新验证
- 已创建：Cloudflare Pages 项目 `xilume`，生产分支 `main`，None / 仓库根目录，构建 `python scripts/build-site.py && python scripts/check-site.py _site`，输出 `_site`；两环境 `PYTHON_VERSION=3.12.14`
- 初始 main 已部署至 `xilume.pages.dev`，部署 `91d32f6b-e302-41f2-aad4-815bd19fb39b`，SHA `c36772cd269089f891943d9fec6fa0a31f0a4861`，没有绑定生产域名
- 迁移预览成功：部署 `530c650d-b40a-467c-bf87-f2b85266446b`，SHA `7745ed6c98ea88d26fd2acbb2c1ed89df14ee422`；[固定预览](https://530c650d.xilume.pages.dev/)，[分支别名](https://codex-cloudflare-20261011.xilume.pages.dev/)。日志显示 Python 3.12.14、指定构建命令、216 文件 / 66 HTML / 49 索引页 / 2756 引用，2026-10-11 23:47:11 UTC 发布成功
- 预览 HTTP：两个域名的页面抽查响应头均含 `X-Robots-Tag: noindex`；216 文件全部 200 且与构建匹配（111 字节精确匹配，105 文本仅规范化 CRLF）；两个域名各 6 类未知/维护路径均 404，返回双语错误页且 meta noindex，不回退首页。Cloudflare 在 404 上未附 noindex 头，因此错误页的 meta 同样保留
- 已本地验证：Python 3.12.14 / Node 24.19.0；10 工具测试、12 语言断言、8 联系场景、12 Shop 检查和 13 JS 语法检查通过；216 文件 / 66 HTML / 49 可索引页 / 2756 引用
- 实际本地隔离 Chrome：14 路由 × 1440px / 390px，共 28 检查，无横向溢出、页面 JS 错误或已加载图片失败；购买回退、双语 SKU 切换、query/hash/返回、手机菜单、联系预填和空邮箱校验通过；没有表单 POST 或扣款
- 实际 Cloudflare 预览隔离 Chrome：同样 28 项页面/视口检查及 7 项交互通过，覆盖双语首页/Shop/两款购买/产品/下载/联系、语言 SKU/query/hash/返回、手机菜单和联系预填/校验；无横向溢出、页面 JS 错误或已加载图片失败。部分长页延迟图片仍未滚动展示，文件匹配已另验；软件下载未安装，表单未 POST，实际邮件送达仍未验证
- DNS：Cloudflare Free zone 已创建但未切 nameservers；自动扫描只得 9 条记录且遗漏实际 DKIM，尚未获得 Dynadot 完整后台导出，不能视为备份。两家公共解析器与直接权威查询仍为 Dynadot NS、GitHub Pages A 和 Dynadot MX；父区 DS 查询未见 Answer，注册商 DNSSEC 状态尚待后台核对。Pages UI 要求区域激活后才能绑定 apex
- 支付：重新列出 Stripe 连接后只有 sandbox，`livemode=false`；尚未确认正式商户，两个付款链接继续为 null，网站仍仅联系购买
- main / 旧托管：未合并 Shop、未改生产 DNS；本分支将旧 GitHub Pages workflow 改为仅检查，并保留全部回归/构建检查及 Node 24，不上传或部署。合并前仍需确认最终 PR CI 和新托管验收

## 2026-10-11 Cloudflare Pages 迁移准备（暂存与 DNS 待验）

- 授权：用户已明确同意迁移至 Cloudflare 并注册账户；此前仅使用 GitHub Pages 的托管约束已被本次决定取代，保留仓库、域名与业务邮箱
- 基线：Shop 草稿 PR #16 的 `588bca7`；独立 worktree / 分支 `codex/cloudflare-20261011`
- 已修改：新增双语根 `404.html` 并加入发布白名单，避免 Cloudflare Pages 将未知及维护路径按 SPA 回退到首页；新增迁移说明并更新授权记录
- 构建设置：继续使用现有 `python scripts/build-site.py && python scripts/check-site.py _site`，发布目录 `_site`，不发布仓库根目录，不引入框架、Functions 或账户配置文件
- 已测试：10 项维护工具测试、12 项 Shop 检查及 artifact 检查通过；216 文件 / 66 HTML / 49 可索引页 / 2756 本地引用。产物共 81,778,876 字节，最大文件 13,878,469 字节，符合 Pages Free 的 20,000 文件与单文件 25 MiB 限制；根 404 存在、维护源文件未混入，diff 空白检查通过
- 验证边界：本地检查不证明 Cloudflare 的 HTTP 状态、预览页面视觉效果、域名证书、DNS 生效或邮箱收发；这些仍须在实际暂存站与正式域名分别验证
- 发布状态：本轮修改仅用于迁移暂存，未合并 main；现有 GitHub Pages workflow 保持原样。Cloudflare 身份验证过程中浏览器超时，登录结果未确认；尚未取得项目或部署成功记录，未执行 DNS、正式托管切换或邮箱改动
- 付款状态：未改 Stripe 付款链接，仍为 null；托管迁移不等于真实收款已启用。迁移步骤见 `WEBSITE_CLOUDFLARE.md`，付款接入见 `WEBSITE_SHOP.md`

## 2026-10-11 Shop 与托管付款入口（待上线）

- 基线：`c36772cd269089f891943d9fec6fa0a31f0a4861`；独立分支 `codex/shop-checkout-20261011`，保留其他工作区的未提交修改
- 已修改：中英文 Shop、逐款购买确认页、全站导航/页脚入口、两款商品原有购买 CTA、询单商品预填；沿用 Dual Mini PCIe CAN FD USD 69.99 与 Octant USD 199.00
- 付款状态：Stripe 尚未连接，两个公共付款链接均为 null；页面明确未开通在线付款，仅提供联系购买；未创建商户、付款、订单、登录账户、运费或库存承诺
- 已测试：12 项 Shop 状态/安全检查、10 项维护工具测试、12 项导航断言、8 项现有联系表单检查、JS 语法通过；构建 215 文件 / 65 HTML / 49 可索引页 / 2749 本地引用；共享同步二次运行无变化
- 浏览器验证：未完成实际桌面/手机视觉与交互验收，环境没有可用的受支持浏览器预览；离线检查不替代浏览器与 Stripe 端到端付款测试
- 发布边界（草稿创建时）：GitHub Pages 官方 usage limits 明确排除电商网站；当时尚未确认其他托管方案，因此保存为独立分支/草稿 PR，不合并 main、不部署，不改域名或 DNS。后续 Cloudflare 迁移授权与进度见本页上方
- 已推送：草稿 [PR #16](https://github.com/xilume/xilume.github.io/pull/16)，网站代码提交 `344b65bbb6a633b4bd223bf860a9390c42aa62f7`；远端 Git 树与本地检查内容完全一致
- 已通过远端检查：[PR run 38171665240](https://github.com/xilume/xilume.github.io/actions/runs/38171665240) 全部 build 检查成功，artifact 上传与 deploy 均 skipped；未合并 main、未部署、未做线上功能验证
- 接入及后续操作见 `docs/WEBSITE_SHOP.md`，不能将草稿代码与 CI 通过称为上线或收款成功

## 2026-09-25 Contact 自动确认邮件

- 基线：`0bab0fbef061565362d99bb376e55edf0365929e`；独立 worktree / 分支 `codex/contact-autoreply-20260925`，保留原工作区未提交图片修改
- 已修改：中英文 Contact 增加用户提供的英文 `_autoresponse` 文案、显式启用 reCAPTCHA；移除不支持自动回复的 AJAX 路径，使用原生 POST，保留校验、蜜罐和输入内容
- 已测试：8 项联系表单场景、10 项维护工具测试、12 项导航断言、Contact JS 语法与构建检查通过；205 个文件、61 HTML、47 可索引页面、2445 站内引用；共享同步未产生额外差异
- 浏览器边界：本地 Playwright 缺少 Chromium 可执行文件，Cloud Browser 访问本地预览被 ERR_BLOCKED_BY_CLIENT 拒绝；未完成本地实际浏览器提交或移动端视觉检查，计划发布后核对正式页面
- 已推送与合并：[PR #14](https://github.com/xilume/xilume.github.io/pull/14)，源提交 `01758cf74d773a85ee57b6eef1e008ef670e3ad1`，PR build run `36211039696` 成功；合并提交 `f40420e1a291cdf4dfabbe782ad2dc56738fccb7`
- 已部署：[正式发布 run 36211107137](https://github.com/xilume/xilume.github.io/actions/runs/36211107137)，build 与 deploy 均成功，2026-09-26 02:16:01 UTC 完成
- 已线上验证：中英文 Contact HTML 与 Contact JS 返回 200 且逐字节匹配审查产物；四个维护路径均 404。正式浏览器确认两页显示提交说明、加载新版脚本、空表单被邮箱必填校验拦截；中文桌面截图未见布局问题，英文桌面无横向溢出。浏览器日志只观察到扩展 metadata 报错，不归因为网站
- 验证限制：浏览器只读 DOM 对隐藏 input value 进行了省略，因此确认文案/验证码值以线上 HTML 精确匹配与本地 HTML 解码核对为证据。没有完成真实表单 POST、验证码挑战、实际确认邮件收件或 Reply-To 检查；已请用户从自有邮箱提交一次作端到端验证。未完成手机浏览器视觉检查


## 2026-09-19 产品结构化数据修复

- 核对基线：`56d71c3dec05c8c08d343901a2bf7112b3da5ebc`；独立分支 `codex/product-schema-fix-20260919`，起始工作树干净
- 实时核对：DualCANFD 中英文页已有 `Offer`，价格为 USD 69.99；Octant 中英文页已有 `Offer`，价格为 USD 199.00，均与可见价格一致，未改动这四页。截图里的 DualCANFD 最后抓取日期为 2026-08-24，不能代表当前源码
- 已修改：XE826 中英文询价页由缺少报价/评价的 `Product` 改为 `WebPage`，保留名称、描述、图片、语言、canonical 和四级 `BreadcrumbList`；仅更新两页 sitemap 日期，不改变页面正文、价格、库存、图片或购买入口
- 已测试：新增检查先在未修复 artifact 上准确报告两项 XE826 错误；修复后 10 项维护测试、12 项语言导航断言、40 项离线联系表单场景通过，205 文件 / 61 HTML / 47 可索引页面 / 2445 本地引用通过。共享页面同步无额外修改
- 回归保护：发布检查增加 Product 必填信息和报价数值/币种基本检查；测试覆盖双语价格标记与可见售价一致，以及询价页保留面包屑而不发布无报价的 Product
- 已推送与合并：[PR #12](https://github.com/xilume/xilume.github.io/pull/12)，源提交 `2b3c76435eb4aea85bba574ae826bc2c20921dfd`；PR 检查 run `35465502946` 全部通过，合并提交 `c78aa66866c31eec52b88aedb638ec1bde380f5b`
- 已部署：[正式发布 run 35465547772](https://github.com/xilume/xilume.github.io/actions/runs/35465547772) 的 build 与 deploy 均成功，2026-09-19 19:50:25 UTC 完成
- 已线上验证：2026-09-19 19:51:40 UTC，六个中英文产品页、双语首页、双语下载页和 sitemap 共 11 个 URL 均 HTTP 200 且逐字节匹配构建产物；DualCANFD 与 Octant 报价标记正确，XE826 只含 WebPage 和 BreadcrumbList。四个维护路径的原 URL 与刷新查询 URL 均为 404
- 后续：在 Search Console 的该问题页面点击 Validate Fix，等待 Google 重新抓取与验证；本轮没有提交 Search Console 验证，不能据网站上线声明搜索报告已经清除
- 验证边界：基本结构检查不替代 Google 富媒体测试或 Search Console 验证；本轮不编造评论、评分、库存或 XE826 售价，没有视觉/交互改动，不声称完成新的浏览器视觉验收或 Google 重新抓取

## 2026-09-15 XL1326-A 官方丝印与下载图片

- 来源：用户指定官网首页芯片区为正确参考，要求修正接线图并提供可下载图片
- 已修改：中英文产品页共用 `images/dualcanfd-xl1326a-db9-official-marking.png`；左下方 QFP 丝印为带弧线的 Xilume 字标、`XL1326-A`、`2634A1`，参考 `images/chip-family-hero-xl1326-v4.webp` 中下方 XL1326-A 芯片
- 下载文件：已提供同一图像的独立 PNG，1254 × 1254，1,477,805 字节；SHA-256 `9639930c15636c92b739c727f533285151f88809e57a7238d99920e5108e4622`
- 已测试：双人目视核对丝印内容、位置、透视与主要构图；共享页面同步无额外修改；205 个发布文件、61 HTML、47 索引页、2445 本地引用通过；[PR #10](https://github.com/xilume/xilume.github.io/pull/10) 检查 run `34957110136` 全部通过
- 已推送与部署：源提交 `a310c6ff1faaf120e2cc76fcec9af2f8f9c18317`，PR #10 已合并；正式提交 `9b6baea4c3f85b54aeced52f5285245492416dd4`，[发布 run 34957155965](https://github.com/xilume/xilume.github.io/actions/runs/34957155965) 的 build 与 deploy 均成功
- 已线上验证：中英文产品 HTML 与新版图片 HTTP 200，逐字节匹配本地构建；四个维护路径返回 404；实际浏览器截图确认中英文配件区显示新图，图片加载尺寸 1254 × 1254，无页面横向溢出
- 验证边界：本轮仅图片引用更新，未重新测试手机视口；图片编辑对极细小 PCB 字符略有重绘，该图为产品展示图，不能作为电路设计、引脚或实物批次验收依据

## 2026-09-15 DualCANFD 板卡接线图修订

- 来源：用户指出上一版接线照片中的板卡款式不正确，并提供实际 Xilume CAN 卡正面照片，要求更换板卡、补充 Xilume / XL1326-A 丝印和翻新外观
- 已修改：中英文产品页共用新图片 `images/dualcanfd-xl1326a-db9-connection-v2.png`，1254 × 1254；主控丝印位于左下方方形芯片，保留两条 DB9 转接线、适配板和金属扩展片
- 图片处理：按用户参考进行图像编辑，清理外观；已人工核对主要板卡布局、黑色接口方向和主控标识。该图为经编辑的产品展示图，细小 PCB 字符与引脚形状不作为接线或设计尺寸依据
- 页面布局、既有配件/资料清单、软件包、价格、Logo 与正式域名未变
- 已测试：构建产物 204 文件、61 HTML、47 索引页、2445 本地引用通过；图片与主控标识人工检查通过；PR #8 检查 run 34956114357 全部通过
- 已推送与部署：[PR #8](https://github.com/xilume/xilume.github.io/pull/8) 已合并，发布提交 `e73ec4a9f264a2214aebb42e846be3e96d622ca9`，正式 run `34956177201` build 与 deploy 均成功
- 已线上验证：中英文产品 HTML 与新版图片均 HTTP 200，逐字节匹配本地构建；Cloud Browser 截图确认中文官网加载新图，右侧黑色接口与左下角 Xilume / XL1326-A 标识可见，原页面布局保持
- 本轮未重复手机视口检查（未改布局），也未将生成图中的细小元件细节当作实物尺寸/电路验收；上一轮资料内容上线记录保留在下方


## 2026-09-15 DualCANFD 配件与资料更新

任务分支：`codex/dualcanfd-accessories-resources-20260915`；基线 main：`ea6bd8b0238042ef4466ba6ca358070002b4cb3b`

- 已修改：中英文 DualCANFD 产品页增加随附全高扩展挡板、两条 DB9 转接线、用户提供的真实接线照片与四项资料目录；产品指南增加包装清单及资料说明；下载页增加资料入口
- 名称：使用常见的 DB9（9 针 D-sub）表述用户所称 DP9 接口；英文资料面板翻译目录标签，并在英文指南保留原始中文文件名对照
- 资料边界：本轮只收到配件照片和目录截图，没有收到完整手册与 SDK 文件；完整资料入口指向联系页面，现有驱动和上位机下载保留原文件、版本与校验值
- 已测试：6 项维护工具测试、12 项语言导航断言、40 项联系表单场景通过；构建产物 203 文件、61 HTML、47 索引页、2445 本地引用通过；共享页面同步无额外修改
- 已审查：独立审查指出新锚点滚动偏移与现有全局偏移叠加，已移除新偏移；其余中英文内容、链接和 CSS 未发现阻断问题
- 浏览器限制：本轮 Cloud Browser 拒绝访问本地 HTTP 与 file URL，未完成发布前实际视觉验收；未通过替代浏览器绕过访问限制，正式 HTTPS 官网可访问，发布后核对新增内容与实际显示
- 已推送与合并：[PR #7](https://github.com/xilume/xilume.github.io/pull/7)，提交 `746f1644abccde967a9c80f315c04f1f6dbd655a`，PR 检查 run `34954876220` 通过；合并提交 `0c9e44775ee9882b68c669b7b73126ec1774bb3d`
- 已部署：[正式发布 run 34954919155](https://github.com/xilume/xilume.github.io/actions/runs/34954919155) 于 2026-09-15 09:53:06 UTC 完成，结果 success
- 已线上验证：2026-09-15 09:54:09 UTC，六个中英文页面、CSS 与配件照片均 HTTP 200 且逐字节匹配构建产物；中英文首页及现有驱动包可访问，四个维护路径均 404
- 实际浏览器：1363px 桌面检查中英文资料面板和英文配件照片，图片 naturalWidth 为 1024，未见页面横向溢出；配件、资料锚点点击正常，中英文切换保留 #resources，资料说明入口到达 #support-package；中文与英文指南的新增清单可读
- 验证限制：当前 Browser 未提供手机视口调整入口，手机实际视觉验收未完成；未安装驱动或运行 SDK；日志出现浏览器扩展的 metadata 错误，未将其归因于网站。预发布本地视觉访问限制如上，线上桌面已另行验证


更新日期：2026-09-08

任务：新增中英文 Contact 快捷联系表单

阶段：PR #5 已合并并正式部署，线上文件验证通过；用户确认正式来源激活后，官网实际表单提交已被服务接受

## 本轮快捷联系状态

起始 main 为 `3d258dd6ecb7df5ec979bb52f7c3b7b35bdb6d59`，独立分支 `codex/contact-form-20260908`。开始时工作树干净，远端一致；本轮没有改动既有产品事实、价格、Logo、域名、发布平台或私人邮箱配置。

| 状态 | 本轮结果 |
| --- | --- |
| 已修改 | `contact/index.html`、`zh-cn/contact/index.html`、`contact/contact.css`、新增 `contact/contact.js`；双语快捷咨询、默认询价、姓名选填、一个工作日内回复、业务邮箱和电话备用入口 |
| 已测试 | 40 个表单场景、6 个维护工具测试、12 项导航断言通过；201 文件、61 HTML、47 索引页、2419 本地引用通过；实际浏览器桌面与手机预览、双语切换、必填拦截、待激活内容保留和本地预览来源激活后中文提交成功 |
| 已推送 | 是，提交 `44507f85edb406899bed3b75c152d9eadfcf1e3d` 经独立审查和 [PR #5](https://github.com/xilume/xilume.github.io/pull/5) 合并；[PR 检查 34227021768](https://github.com/xilume/xilume.github.io/actions/runs/34227021768) 全部通过，PR 部署 skipped |
| 已部署 | 是，网站提交 `1514a1d5db94f8dfb762f425e0292897fc437894`；[正式发布 34227206441](https://github.com/xilume/xilume.github.io/actions/runs/34227206441) 于 2026-09-08 12:38:46 UTC 成功完成，build、artifact 上传和 deploy 均成功 |
| 已线上验证 | 线上 201 文件均 200、116 文本资源与审查产物一致（CRLF 归一化）、6 类维护路径原 URL 和刷新 URL 均 404；正式页面显示新版表单。用户确认正式来源激活后，`https://xilume.co/contact/` 真实浏览器提交显示服务已接受 |

用户取消私人邮箱转发关系核验，仅要求发往 `contact@xilume.co`；本轮遵循该决定。用户已确认点击首封表单激活，本地预览来源的实际中文提交得到服务接受，按钮恢复和内容清空，控制台无 error/warn。正式来源另经用户确认激活并在官网提交成功；未读取实际收件邮件，不将服务接受写成收件箱送达或私人转发已证实。服务资料、实现与限制见 `WEBSITE_CONTACT.md`。

线上文件核验时间为 2026-09-08 12:41:32 UTC，错误为零；正式浏览器首次提交返回待激活提示，用户随后确认最新官网来源已激活，重试后显示“Your message has been submitted. Our team will reply by email within one business day.”。本地预览成功不代替正式来源激活，固定 `_url` 也不能当作实际来源已激活的证据。正式浏览器连接较慢，已分步通过截图与状态反馈完成实际填写和提交验收。

本轮实际投递使用清楚标明网站验收、无需回复的消息，仅发往公开业务邮箱；没有访问客户邮件、安装邮件软件或核查私人邮箱转发关系。线上二进制仅核对可达，未安装或重新核定内容；未完成跨 Safari/Firefox、无 JavaScript 托管提交及验证码挑战的实机测试。最新维护记录由纯文档分支保存，不再次触发网站部署。

## 上一批维护发布记录（已完成）

以下保留首轮审计修复与 PR #3 的历史证据；其中 200 文件等统计属于上一批发布，不代替本轮状态。

## 授权与工程

2026-09-08 用户进一步明确“你以后修复完要发布到 xilume.co 这个官网上”。这已授权本次发布及后续常规维护在测试后合并、部署并验证官网，不再每批重复请求发布许可。本次已按此授权统一 Pages Source 并发布 PR #3。Logo、产品参数、价格、域名、大规模删除及超出任务范围的配置改变仍不能擅自实施。

- 仓库：`xilume/xilume.github.io`；origin：`https://github.com/xilume/xilume.github.io.git`
- 修复分支：`codex/site-maintenance-fixes-20260908`；发布验收文档分支：`codex/release-verification-20260908`
- 修复提交：`0b1c828ae617b6fb10749b82b08b2036093ed36e`；[PR #3](https://github.com/xilume/xilume.github.io/pull/3)。后续补充状态、长期发布授权和仅文档变更不重复部署的过滤规则
- 起始 main：`d188871c2d226d8b2ca5bc73fa85d11d67047d55`；实际网站发布提交：`322902a62883e701a2c348ced358e73e07146972`。发布后的纯文档提交不改变网站产物
- 首轮文档工作已保留；原始交接文件夹保持本地参考，不整体提交
- 当前工作树已完整检出，包括视频、PDF 和下载包；补齐的 12 个文件均核对固定提交 Git blob 哈希。历史仍为浅克隆
- 没有修改产品参数、价格、型号、Logo、域名、下载文件内容、路由或四页搜索图片预览策略

## 已修改

| 编号 | 修复及文件 | 当前结果 |
| --- | --- | --- |
| A1 | `scripts/site_files.py`、`build-site.py`、`check-site.py`、`test-site-tools.py`；`.github/workflows/pages.yml`；README | 沿用网站白名单，构建真实 `_site` 并检查；PR 只测试，main 发布前检查。后台 Source 已统一为 workflow，生产发布成功；6 类维护路径原 URL 与刷新查询 URL 均为 404 |
| A2 | `scripts/sync-site-chrome.py` | 明确 UTF-8 读写；跳过构建产物和原始交接资料；Windows 默认 cp936 下可运行 |
| A3 | `solutions/index.html`、`zh-cn/solutions/index.html` | CTA 与现有目标 H1 对齐：Xilume CAN FD Control Center / 熙联迈 CAN FD 控制中心；没有更改软件正式产品定义 |
| A4 | `zh-cn/solutions/index.html`、`zh-cn/downloads/index.html` | 英文 TraceBox 入口标注“英文详情”/“英文”；保留现有页面与下载 |
| A5 | `site.js`、`scripts/test-language-navigation.cjs` | 语言链接随当前 query/hash、章节点击和前进后退更新；无中文详情的 TraceBox 仍回中文下载总览，不携带无效章节 |
| 维护 | `.gitignore`、`AGENTS.md`、README、`docs/` | 保存规则、审计、发布步骤与本次状态，忽略构建产物、缓存和原始交接目录 |

共享资源缓存版本为 `20260908-maintenance1`。47 个普通页面已同步；逐文件与基线比对，HTML 差异仅为版本字符串及上述四处文案替换。同步后再次运行输出 `Synchronized 0 pages`。未重做视觉设计。

## 已测试

- `python scripts/test-site-tools.py`：6 项正反例全部通过；含默认 cp936 / UTF-8 模式关闭时的真实中文写入、幂等、robots 保持、输出路径保护、源缺失保护、断链/缺文件/缺锚点/维护文件混入检测
- `node scripts/test-language-navigation.cjs`：12 项断言通过；双语、编码后的查询参数、hashchange、popstate、无翻译回退覆盖。执行完整 site.js 的最小 DOM 测试，浏览器另验
- `python scripts/build-site.py` 与 `python scripts/check-site.py _site`：200 文件、61 HTML、47 可索引页面、2425 次站内引用通过；含 sitemap/canonical/hreflang、JSON-LD、manifest、发布范围和四页 robots
- 产物中全部 8 个 JavaScript 文件通过 Node 语法检查
- `_site` 本地 HTTP：200 个发布文件全部 200；README、AGENTS、维护 docs、脚本、原始交接和 `.git/config` 六个代表性禁止路径全部 404
- 实际浏览器：桌面 1440×900、手机 390×844；双语首页、Octant、接口芯片页面宽度检查，无整页横向溢出、未见已加载图片失败。双语 Solutions、中文 Downloads 入口已检查
- 实际交互：章节点击后切换语言保留 query/hash；浏览器前进/后退更新语言目标；手机菜单打开、Escape 关闭、点导航后关闭；TraceBox 切中文回下载总览
- 桌面及手机软件入口已截图目视检查；键盘焦点边框可见；抽查浏览器控制台无 error/warn
- 接口芯片页面本地生产视频可解码（1920 宽，readyState 4，无 media error），暂停按钮实际生效
- 独立审查未发现阻断问题；额外路径保护探针通过。符号链接动态探针受 Windows 权限限制未执行，拒绝逻辑已静态审阅
- GitHub Actions [run 34200632257](https://github.com/xilume/xilume.github.io/actions/runs/34200632257)：修复提交的 PR build 成功，工具测试、语言回归、构建、产物与 JavaScript 检查全部成功；Pages artifact 上传和 deploy 均明确 skipped

测试命令及复用流程见 README。预览真实产物使用 `python -m http.server 8000 --bind 127.0.0.1 --directory _site`。

## Pages 配置与发布步骤

此前只读 API 确认 `build_type: legacy`、源为 main 根目录，解释了首轮发现的动态根目录部署。2026-09-08 07:53:30 UTC（北京时间 15:53:30），已仅提交 `build_type: workflow` 并 GET 核实成功；`cname: xilume.co` 与 `https_enforced: true` 保持。API 仍返回历史 source 的 main / 字段，不能把它误读为切换失败，实际发布类型已是 workflow。

具体步骤见 `WEBSITE_RELEASE.md`。最终 PR 检查 run `34202565901` 成功后，PR #3 于 2026-09-08 合并；正式 push 运行 [34202648965](https://github.com/xilume/xilume.github.io/actions/runs/34202648965) 于 08:06:11 UTC（北京时间 16:06:11）完成，build、artifact 上传与 deploy 全部成功。同一网站提交只观察到此预期自定义发布运行，无新增动态根目录部署。更新 AGENTS、README 或 docs 的纯文档 main 提交不重复部署；PR 仍执行检查。

## 发布状态

| 状态 | 本轮结果 |
| --- | --- |
| 已修改 | 上述代码、文案、缓存版本、检查流程与维护文档 |
| 已测试 | 本地自动检查、HTTP、实际浏览器、独立审查及上述 GitHub PR CI 通过 |
| 已推送 | 是，PR #3 已合并至 main；通过 GitHub Git Data API 核对远端与本地 tree/commit。发布验收记录单独以纯文档分支合并，不重复部署 |
| 已部署 | 是，xilume.co；发布提交 322902a62883e701a2c348ced358e73e07146972，生产 run 34202648965 成功 |
| 已线上验证 | 是，200 文件可访问、115 文本资源与本地构建一致、6 类维护路径 404，线上 DOM 确认新版脚本和文案；交互复测限制见下文 |

## 尚待验证及后续

- 2026-09-08 08:08:14 UTC 完成线上 HTTP/内容核验：全部 200 文件 HEAD 200；115 个文本资源刷新 GET 与本地 artifact 逐字对应（仅规范化 CRLF）；6 类维护路径在原 URL 和带刷新查询的 URL 上均 404。二进制仅验证可达，未执行软件或重新核定内容
- 实际官网 DOM 已确认 `site.js?v=20260908-maintenance1`、中文 Control Center 名称和 TraceBox 英文提示，抽查无整页溢出或已加载图片失败。随后浏览器连接多次超时，未在正式站再次完成菜单/前进后退等点击；同一代码的本地浏览器交互及 Node 回归此前通过，不将其写成线上点击通过
- 实体设备参数、认证、兼容性与价格未重新核定；软件包未安装运行，签名未验证，不为未知事项编造结论
- 未做全部 SKU 图片人工比对、完整无障碍审计、跨 Safari/Firefox/实体手机测试、性能基准或 Search Console 验收
- 已见页面没有需要立即大改的布局故障。审美改善继续按具体页面、小批次、桌面/手机对比验收推进
- 没有创建定时巡检、后台持续运行或自动发布任务

首轮交接和只读审计历史保存在 `WEBSITE_AUDIT.md`；本状态记录反映最新已完成工作。回退本批使用针对本批提交的 revert，保留原始基线与其他工作；不得 reset main 或整站恢复旧交接包。
