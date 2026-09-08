# Xilume 首次修复发布步骤

日期：2026-09-08。范围：审计 A1–A5 的维护修复。本文是可审查的执行方案，不是已经部署的记录，也不构成发布授权。

## 发布前

1. 取得用户对本批 PR 合并、Pages Source 切换及正式发布的明确授权
2. 确认 origin 为 `xilume/xilume.github.io`，检查 main 是否仍为审查基线；如有新提交，先整合并重新验证，不覆盖远端工作
3. 检查 PR 的最终提交和 GitHub Actions 结果。重新核对 artifact 白名单、下载包完整性、四页 robots 和域名，必要时重做受影响页面的预览

## 统一发布入口

当前只读 API 结果为 `build_type: legacy`，source 为 `main`、`/`。此设置与自定义 `_site` 流程并存，不能仅改 workflow 就宣称问题解决。

在合并前，使用 GitHub 仓库 Settings → Pages，把 Source 改为 **GitHub Actions**。若使用已授权的 API，只提交：

```json
{"build_type":"workflow"}
```

接口为 `PUT /repos/xilume/xilume.github.io/pages`。随后 GET 同一接口，确认 `build_type` 为 `workflow`、`cname` 仍为 `xilume.co`、`https_enforced` 仍为 `true`。不更改 CNAME 文件、DNS、凭据或其他 Pages 字段。参见 [GitHub 官方 Pages API 文档](https://docs.github.com/en/rest/pages/pages#update-information-about-a-apiname-pages-site)。

## 合并与验收

合并已审查 PR 时核对最终 head SHA；不强推 main。跟踪 `.github/workflows/pages.yml` 的 build 和 deploy，确认该提交没有新增动态根目录发布与其竞争。PR 检查本身不得上传 Pages artifact 或执行 deploy。

部署完成后：

- 核对 Pages 正式部署提交与预期代码，确认 HTTPS 和正式域名
- 双语首页、Solutions、产品和下载页可访问；软件名称一致、TraceBox 英文提示可见；新版 `site.js` 被引用
- 点击 Solutions 章节再切换语言，保留当前 query/hash；手机菜单、关键 CTA、图片/视频及代表性 PDF/ZIP/EXE 下载可达
- `/README.md`、`/AGENTS.md`、`/docs/WEBSITE_CONTEXT.md`、`/scripts/sync-site-chrome.py` 返回 404；不能只看一次状态码，要排除缓存与软 404。下载可达不等于软件安装或硬件兼容性验收
- 更新 `WEBSITE_STATUS.md`，记录 PR、提交、Actions run、实际线上检查时间、结果和未完成项。分别报告修改、测试、推送、部署、线上验证

## 异常处理

任一步骤失败，先保留最后一次成功部署并修正明确失败原因，不重复触发流程碰运气。若需要回退代码，在获批范围内对本批提交做有针对性的 revert，再经过相同检查；不回退到交接 ZIP、不 reset main、不重新启用已确认会发布维护资料的根目录发布方式。

产品事实、域名、Logo 或其他超出本批范围的改变仍需单独确认。
