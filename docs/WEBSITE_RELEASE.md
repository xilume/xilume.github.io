# Xilume 官网维护与发布步骤

日期：2026-09-08。本次范围：审计 A1–A5 的维护修复；流程同时适用于以后常规维护。

用户已明确要求“你以后修复完要发布到xilume.co这个官网上”。本次及以后常规修复通过测试和审查后，按独立分支 → 合并到 main → 发布到 `xilume.co` → 线上验证 → 更新状态执行，不再逐次询问发布许可。本次 Pages legacy → workflow 设置切换和 PR #3 正式发布已完成；生产 run `34202648965` 成功，200 个发布文件可访问，6 类维护路径返回 404。具体结果和验证限制见 `WEBSITE_STATUS.md`，下文作为后续维护的执行流程保留。

## 发布前

1. 在独立任务分支修复，保护现有工作；确认改动属于常规维护或本次明确范围，不扩展到未经授权的品牌、产品事实或域名变更
2. 确认 origin 为 `xilume/xilume.github.io`，检查 main 是否仍为审查基线；如有新提交，先整合并重新验证，不覆盖远端工作
3. 完成适用的本地测试、预览和最终 diff 审查，并检查 PR 的最终提交与 GitHub Actions 结果。核对 artifact 白名单、下载包完整性、四页 robots 和域名；失败时先修复，不带着未解决的阻断问题部署

## 统一发布入口

本次迁移前的只读 API 结果为 `build_type: legacy`，source 为 `main`、`/`。此设置曾与自定义 `_site` 流程并存，不能仅改 workflow 就宣称问题解决。

本次已授权在合并前将 GitHub 仓库 Settings → Pages 的 Source 改为 **GitHub Actions**。使用 API 时只提交：

```json
{"build_type":"workflow"}
```

接口为 `PUT /repos/xilume/xilume.github.io/pages`。随后 GET 同一接口，确认 `build_type` 为 `workflow`、`cname` 仍为 `xilume.co`、`https_enforced` 仍为 `true`。不更改 CNAME 文件、DNS、凭据或其他 Pages 字段。参见 [GitHub 官方 Pages API 文档](https://docs.github.com/en/rest/pages/pages#update-information-about-a-apiname-pages-site)。

本次已于 `2026-09-08T07:53:30Z` 成功切换并 GET 核实上述三个字段。`source` 字段仍显示 `main` / `/`，但生效的 `build_type` 已为 workflow。以后常规发布核对后直接沿用，不重复切换或改动无关配置。

## 合并与验收

合并已审查 PR 时核对最终 head SHA；不强推 main。跟踪 `.github/workflows/pages.yml` 的 build 和 deploy，确认该提交没有新增动态根目录发布与其竞争。PR 检查本身不得上传 Pages artifact 或执行 deploy。

`push.paths-ignore` 排除 `AGENTS.md`、`README.md`、`docs/**`，因此仅更新这些维护文档的 main 提交不重复部署；PR 仍运行检查。把发布后的状态记录合并回 main 时，核对差异确实仅属上述文档范围。

部署完成后：

- 核对 Pages 正式部署提交与预期代码，确认 HTTPS 和正式域名
- 双语首页、Solutions、产品和下载页可访问；软件名称一致、TraceBox 英文提示可见；新版 `site.js` 被引用
- 点击 Solutions 章节再切换语言，保留当前 query/hash；手机菜单、关键 CTA、图片/视频及代表性 PDF/ZIP/EXE 下载可达
- `/README.md`、`/AGENTS.md`、`/docs/WEBSITE_CONTEXT.md`、`/scripts/sync-site-chrome.py` 返回 404；不能只看一次状态码，要排除缓存与软 404。下载可达不等于软件安装或硬件兼容性验收
- 更新 `WEBSITE_STATUS.md`，记录 PR、提交、Actions run、实际线上检查时间、结果和未完成项。分别报告修改、测试、推送、部署、线上验证

## 异常处理

任一步骤失败，先保留最后一次成功部署并修正明确失败原因，不重复触发流程碰运气。若需要回退代码，在获批范围内对本批提交做有针对性的 revert，再经过相同检查；不回退到交接 ZIP、不 reset main、不重新启用已确认会发布维护资料的根目录发布方式。

常规发布授权不包括擅改 Logo、型号参数、价格、域名、大规模删除或与任务无关的配置；这些变更仍须用户明确决定。
