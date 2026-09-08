# Xilume 官网维护状态

更新日期：2026-09-08

任务：新增中英文 Contact 快捷联系表单

阶段：表单设计与本地验证完成，用户确认收件人激活；真实中文提交已被服务接受。正在完成 PR 和正式发布

## 本轮快捷联系状态

起始 main 为 `3d258dd6ecb7df5ec979bb52f7c3b7b35bdb6d59`，独立分支 `codex/contact-form-20260908`。开始时工作树干净，远端一致；本轮没有改动既有产品事实、价格、Logo、域名、发布平台或私人邮箱配置。

| 状态 | 本轮结果 |
| --- | --- |
| 已修改 | `contact/index.html`、`zh-cn/contact/index.html`、`contact/contact.css`、新增 `contact/contact.js`；双语快捷咨询、默认询价、姓名选填、一个工作日内回复、业务邮箱和电话备用入口 |
| 已测试 | 40 个表单场景、6 个维护工具测试、12 项导航断言通过；201 文件、61 HTML、47 索引页、2419 本地引用通过；实际浏览器桌面与手机预览、双语切换、必填拦截、待激活内容保留和激活后中文提交成功 |
| 已推送 | 待 PR 推送与检查 |
| 已部署 | 本轮尚未部署；官网仍为上一批发布 |
| 已线上验证 | 本轮尚未线上验证 |

用户取消私人邮箱转发关系核验，仅要求发往 `contact@xilume.co`；本轮遵循该决定。用户已确认点击表单激活，实际中文提交得到服务接受，按钮恢复和内容清空，控制台无 error/warn。未读取实际收件邮件，不将此写成收件箱送达或私人转发已证实。服务资料、实现与限制见 `WEBSITE_CONTACT.md`。

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
