# 快捷联系表单维护

日期：2026-09-08

## 目的与页面

让首次询价、选型和技术问题可直接在网页提交。中英文页面为 `contact/index.html` 与 `zh-cn/contact/index.html`，共用 `contact/contact.css`、`contact/contact.js`。保留既有导航、Logo、SEO 和资源链接；不改动产品事实和价格。

邮箱、问题必填；姓名选填；咨询类型默认价格，可选选型、支持或其他。无需账户、公司名称、电话、完整项目介绍或附件。“一个工作日内回复”来自用户明确要求，不是实现者推定。实际履约由工作人员处理业务邮箱。

设计参考 [Linear 联系页](https://linear.app/contact) 的目的清晰和紧凑入口、[Stripe 销售联系页](https://stripe.com/en-ca/contact/sales) 的表单层级与回复预期，采用 Xilume 现有蓝色和品牌素材创作。没有复制对方品牌、插图或较长的企业信息收集流程。

## 收件与数据

- 唯一目的地址：`contact@xilume.co`；不设置私人地址、CC 或 BCC
- 原生 POST：`https://formsubmit.co/contact@xilume.co`
- AJAX POST：`https://formsubmit.co/ajax/contact@xilume.co`
- 表单值：`email`、`name`、`message`、`topic`；AJAX 附带语言、固定公开来源页、主题、table 模板和蜜罐
- `email` 作为可回复地址；没有客户端密钥、邮件密码或 SMTP 凭据
- 仅在提交时发送；不把输入存进 localStorage、日志、分析事件或仓库，也不携带访问 URL 的 query/hash
- 页面说明通过 FormSubmit 发送并链接其 [隐私政策](https://formsubmit.co/privacy.pdf)

按 [FormSubmit 文档](https://formsubmit.co/documentation) 和 [帮助](https://formsubmit.co/help)，首次需要收件人激活；未激活提交保留 30 天，激活后补投，服务亦提供 30 天提交归档。不要宣称服务不存储。AJAX 不支持自动回复；网页显示成功不等于自动给客户发送确认邮件。

不设置 `_captcha=false`，保留供应商默认；前端与服务蜜罐使用 `_honey`。真实浏览器 AJAX 提交无需跳离页面，供应商文档未定义 AJAX 验证码 challenge/token 协议，不能声称已验证验证码挑战或完成端到端反垃圾审计。以后若垃圾消息增多，应先评估服务端防护，不只增加浏览器校验。

## 交互与验证

按钮发送期间禁用；20 秒超时；没有自动重试或静默换通道，避免未知投递状态下重复发送。HTTP 200 不足以成功；需明确布尔 `true` 或字符串 `"true"`，激活/确认/验证提示优先当作未就绪。非 JSON、HTTP 错误、网络失败与超时均保留内容，显示重试和业务邮箱提示。成功只称“已提交”；请求中编辑过的内容不被清空。缺少 fetch/AbortController 时保留原生 POST 和 noscript 说明。

`node scripts/test-contact-form.cjs` 执行完整脚本的离线 DOM/fetch 测试，当前 40 个场景覆盖两种语言、输入校验、响应真假/激活、错误/超时/双提交、输入保留、固定收件人和原生回退。已加入 PR 与正式部署 CI。离线测试不发送邮件，不能证明实际收件。

每次相关改动检查中英文、桌面/手机、键盘、状态提示和共享导航。构建真实 `_site/`，新 JS 随允许的 `contact/` 目录发布。两页资源版本为 `20260908-contact1`；修改共享 Contact CSS/JS 后同步更新这两个引用。

2026-09-08 首次脚本请求遭服务 Cloudflare 403；未在该路径重复请求。正常浏览器的实际表单提交进入待激活分支，用户随后确认已激活；之后中文真实表单显示服务已接受，字段清空、按钮恢复且控制台无错误。没有读取私人邮件内容或验证邮箱转发规则。实际 inbox 投递、跨浏览器、无 JS 托管页和验证码挑战不在此已验证结论内。发布和线上实际提交以 STATUS 最新记录为准。

## 后续故障处理

先区分页面未加载、输入校验、请求未确认、服务未激活、服务已接受但业务邮箱未收到、工作人员尚未回复。不要把浏览器成功提示等同所有环节成功。收件地址或供应商改变时重新验证激活和真实提交，不擅自改私人邮箱作为备用收件人。API 响应格式变化时保守失败并保留用户输入；避免从供应商响应渲染 HTML。服务中断期间保留可点击邮件和电话入口。
