# Xilume 官网维护状态

更新日期：2026-09-08

任务：完成首轮审计发现的代码问题与维护改进

阶段：本地修复和回归、GitHub CI 通过；任务分支已上传，草稿 PR #3 待明确发布授权

## 授权与工程

用户在首轮交接后要求“把你检查出来的问题和需要改进的地方都改好”，授权本批代码、内容一致性、维护工具与预览测试。继续遵守先前明确的发布边界：没有明确授权，不向 main 推送、不合并 PR、不触发正式部署或修改 Pages 后台设置。修复方案已包含待获批的发布配置调整，但尚未生效。

- 仓库：`xilume/xilume.github.io`；origin：`https://github.com/xilume/xilume.github.io.git`
- 任务分支：`codex/site-maintenance-fixes-20260908`
- 修复提交：`0b1c828ae617b6fb10749b82b08b2036093ed36e`；[草稿 PR #3](https://github.com/xilume/xilume.github.io/pull/3)。后续状态记录提交仅修改本文
- 起始 main/HEAD：`d188871c2d226d8b2ca5bc73fa85d11d67047d55`；本轮收尾前再次读取远端 main，仍为该提交
- 首轮文档工作已保留；原始交接文件夹保持本地参考，不整体提交
- 当前工作树已完整检出，包括视频、PDF 和下载包；补齐的 12 个文件均核对固定提交 Git blob 哈希。历史仍为浅克隆
- 没有修改产品参数、价格、型号、Logo、域名、下载文件内容、路由或四页搜索图片预览策略

## 已修改

| 编号 | 修复及文件 | 当前结果 |
| --- | --- | --- |
| A1 | `scripts/site_files.py`、`build-site.py`、`check-site.py`、`test-site-tools.py`；`.github/workflows/pages.yml`；README | 沿用网站白名单，构建真实 `_site` 并检查；PR 只测试，main 发布前检查。后台 Source 尚待切换，因此线上问题未闭环 |
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

## Pages 配置与待发布步骤

本轮只读 API 已确认 `build_type: legacy`、源为 main 根目录、`cname: xilume.co`、`https_enforced: true`，解释了首轮发现的动态根目录部署。后台设置未修改；旧正式站仍可能提供 README 和同步脚本。

具体步骤见 `WEBSITE_RELEASE.md`。先获批，再把 Source 切到 GitHub Actions（只改变 `build_type`），保留域名与 HTTPS，检查设置，再合并已通过检查的任务 PR。随后核对唯一预期部署、正式页面和开发路径 404。不应先合并含维护文档的 PR 再处理旧根目录发布入口。

## 发布状态

| 状态 | 本轮结果 |
| --- | --- |
| 已修改 | 上述代码、文案、缓存版本、检查流程与维护文档 |
| 已测试 | 本地自动检查、HTTP、实际浏览器、独立审查及上述 GitHub PR CI 通过 |
| 已推送 | 是，仅任务分支与草稿 PR #3；Git 传输连接重置后通过 GitHub Git Data API 上传，并验证远端 tree/commit 与本地精确一致；main 未动 |
| 已部署 | 否；未合并 main、未手动触发正式 workflow、未改 Pages 设置 |
| 已线上验证 | 只读核对既有站点和 Pages 配置；本轮修复未上线，不能宣称官网已修复 |

## 尚待验证及后续

- PR 检查已完成；正式上传、部署及线上效果仍待获批执行，不能以 PR CI 通过替代正式验收
- 实体设备参数、认证、兼容性与价格未重新核定；软件包未安装运行，签名未验证，不为未知事项编造结论
- 未做全部 SKU 图片人工比对、完整无障碍审计、跨 Safari/Firefox/实体手机测试、性能基准或 Search Console 验收
- 已见页面没有需要立即大改的布局故障。审美改善继续按具体页面、小批次、桌面/手机对比验收推进
- 没有创建定时巡检、后台持续运行或自动发布任务

首轮交接和只读审计历史保存在 `WEBSITE_AUDIT.md`；本状态记录反映最新已完成工作。回退本批使用针对本批提交的 revert，保留原始基线与其他工作；不得 reset main 或整站恢复旧交接包。
