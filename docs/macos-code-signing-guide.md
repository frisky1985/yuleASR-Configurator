# macOS 代码签名与公证证书申请指南

> **用途**：yuleASR
> Configurator 桌面端 macOS 正式分发所需的 Apple 开发者证书申请、导出与 CI 配置
> **状态**：参考文档（P0-2 待办，阻塞项为证书未申请）
> **适用对象**：需要对外正式发布 macOS 安装包时执行；内部试用阶段可用未签名包替代

---

## 1. 背景：为什么需要签名

macOS 的 Gatekeeper 安全机制会拦截未签名的应用：

| 场景                        | 未签名                                     | 已签名 + 公证                     |
| --------------------------- | ------------------------------------------ | --------------------------------- |
| 用户首次打开                | ⚠️ 被拦，需右键 → 打开（"无法验证开发者"） | ✅ 正常双击打开                   |
| 浏览器下载                  | 可能被自动删除（quarantine）               | ✅ 正常保留                       |
| 自动更新 (electron-updater) | ❌ 不支持                                  | ✅ 支持（macOS 要求签名才能更新） |
| 分发对象                    | 仅限内部/熟人                              | 任意用户                          |

**结论**：正式对外发布前必须申请；内测阶段可用未签名包（当前 CI 已能产出）。

---

## 2. 需要申请的东西（总览）

| #   | 凭证                                                                | 用途                | 费用       | 审批时间                             |
| --- | ------------------------------------------------------------------- | ------------------- | ---------- | ------------------------------------ |
| 1   | **Apple Developer Program 会员**                                    | 申请一切证书的前提  | $99/年     | 即时（个人）/ 数天（公司需 D-U-N-S） |
| 2   | **Developer ID Application 证书**                                   | 签名 .app / DMG     | 含在会员内 | 即时（CSR 上传后几分钟）             |
| 3   | **App Store Connect API Key**（推荐）或 **Apple ID + App 专用密码** | 公证 (notarization) | 免费       | 即时                                 |

> 说明：我们做的是 **Developer ID 分发**（官网下载安装包），**不是 App
> Store 分发**——不需要 App Store 上架流程，也不需要 `Apple Development` 证书。

---

## 3. 前置条件

- 一个 Apple ID（公司或个人均可）
- 如果是公司账号：需要 **D-U-N-S 编码**（苹果会校验公司信息；可在
  [dnb.com](https://www.dnb.com) 免费申请，通常 1-5 个工作日）
- 一台 Mac（用于生成 CSR 和导出 .p12）

---

## 4. 步骤一：注册 Apple Developer Program

1. 打开 <https://developer.apple.com/programs/enroll/>
2. 用 Apple ID 登录（没有则先注册 Apple ID）
3. 选择实体类型：
   - **个人 (Individual)**：用个人身份，最快，1 小时内可完成
   - **公司 (Organization)**：需要 D-U-N-S 编码 + 法人授权，数天
4. 完成付款 $99/年（支持信用卡）

> 💡 若团队已有公司开发者账号，跳过此步，直接复用。

---

## 5. 步骤二：生成证书签名请求 (CSR)

在**任一 Mac** 上操作（不需要是开发机）：

1. 打开「钥匙串访问」→ 菜单栏「钥匙串访问」→「证书助理」→「从证书颁发机构请求证书…」
2. 填写：
   - 电子邮件地址：Apple ID 邮箱
   - 常用名称：`yuletech`（团队标识即可）
   - 选择 **「存储到磁盘」**
3. 生成 `CertificateSigningRequest.certSigningRequest` 文件

> 命令行替代（无 GUI 环境）：
>
> ```bash
> openssl req -new -newkey rsa:2048 -nodes -keyout csr_key.pem -out CertificateSigningRequest.certSigningRequest -subj "/emailAddress=you@yuletech.com/CN=yuletech"
> ```

---

## 6. 步骤三：申请 Developer ID Application 证书

1. 登录 <https://developer.apple.com/account/> → 侧边栏「Certificates,
   Identifiers & Profiles」
2. 点击 ➕ 新建证书
3. 证书类型选择 **「Developer ID Application」**（注意：不是 "Apple
   Development"，不是 "Mac App Distribution"）
4. 上传第 5 步的 CSR 文件
5. 下载生成的 `developerID_application.cer`

---

## 7. 步骤四：导出 .p12（含私钥）

1. 双击 `developerID_application.cer` 安装到钥匙串（默认「登录」钥匙串）
2. 钥匙串访问 → 搜索证书名（常见名
   `Developer ID Application: yuletech (TEAMID)`）
3. **右键证书 → 导出…** → 格式选 **「个人信息交换 (.p12)」**
4. **必须设置导出密码**（CI 构建时需要；密码自己保管好）
5. 得到 `yuletech_developer_id.p12`

> ⚠️
> .p12 包含私钥，等同账号凭证，**不要提交到 git、不要发群**。只用于配置 GitHub
> Secrets。

---

## 8. 步骤五：获取公证凭证（Notarization）

推荐 **App Store Connect API Key**（长期有效、适合 CI）：

1. <https://appstoreconnect.apple.com/access/api> → 密钥 → 生成 API Key
2. 记录三项：
   - **Key ID**（如 `ABCD123456`）
   - **Issuer ID**（如 `69a6de90-...-...`）
   - **下载 .p8 私钥文件**（仅可下载一次！）

备选：Apple ID + App 专用密码：

1. <https://appleid.apple.com> → 登录与安全 → App 专用密码 → 生成
2. 记录 Apple ID 邮箱 + 专用密码 + Team ID（developer.apple.com 账号页可见）

---

## 9. 步骤六：配置 GitHub Secrets

仓库 → Settings → Secrets and variables → Actions → New repository secret：

| Secret 名                     | 值                                  | 来源                       |
| ----------------------------- | ----------------------------------- | -------------------------- |
| `MAC_CSC_LINK`                | .p12 的 **base64 编码**             | 步骤 7 产物                |
| `MAC_CSC_KEY_PASSWORD`        | .p12 导出密码                       | 步骤 7                     |
| `APPLE_ID`                    | Apple ID 邮箱（备选方案用）         | 步骤 8 备选                |
| `APPLE_APP_SPECIFIC_PASSWORD` | App 专用密码（备选方案用）          | 步骤 8 备选                |
| `APPLE_TEAM_ID`               | 团队 ID（10 位，形如 `ABCDE12345`） | developer.apple.com 账号页 |

**生成 base64 的命令**：

```bash
base64 -i yuletech_developer_id.p12 -o mac_csc_link.b64   # macOS
# 把 mac_csc_link.b64 内容粘贴到 MAC_CSC_LINK
```

> 当前 `build-desktop.yml` 已支持：有 `MAC_CSC_LINK`
> 时自动签名 + 公证（`sign-mac` job）；没有时跳过签名产出未签名包。

---

## 10. 验证

配置完成后推 tag 触发构建：

```bash
git tag v0.3.0 && git push origin v0.3.0
```

检查：

1. **CI**：`Sign macOS Build (notarized)` job 不再是 skipped，且 `build-mac`
   job 日志出现 `signing with identity` 而非
   `skipped macOS application code signing`
2. **产物**：下载 `.dmg`，双击安装后系统托盘无 "无法验证开发者" 警告
3. **命令行校验**：
   ```bash
   codesign --verify --deep --strict "yuleASR Configurator.app"   # 应输出无错误
   spctl --assess --type execute "yuleASR Configurator.app"      # 应输出 accepted
   ```

---

## 11. 常见问题 (FAQ)

**Q1：不申请证书能发布吗？**
能，但用户需右键 → 打开绕过 Gatekeeper，且无法用自动更新。适合内测。

**Q2：申请后多久能拿到证书？**
会员注册即时（个人）/ 数天（公司），证书本身上传 CSR 后几分钟。

**Q3：证书有效期？** Developer
ID 证书有效期 1-3 年（苹果会邮件提醒续期）。到期前需重新走步骤 5-9（生成新 CSR
→ 新证书 → 重新导出 .p12 → 更新 Secrets）。

**Q4：多台电脑打包需要多份证书吗？** 不需要。用同一个 .p12 配置到 CI
Secrets 即可，任何 runner 都能签。

**Q5：公司没有 Mac 能做这些吗？**
可以——任何一台 Mac（甚至虚拟机）完成步骤 4-7 即可，CI 打包不需要本地 Mac。

**Q6：公证 (notarization) 和签名 (signing) 有什么区别？**
签名证明"这个包是 yuletech 签的"；公证是苹果服务器扫描无恶意代码后给包打"已公证"标记（用户看到"来自已识别的开发者"）。现代 macOS 两者都必需。

---

## 12. 检查清单（完成状态）

- [ ] Apple Developer Program 会员已激活
- [ ] Developer ID Application 证书已签发
- [ ] .p12 已导出（密码妥善保管）
- [ ] App Store Connect API Key 已生成（或 App 专用密码）
- [ ] GitHub Secrets 5 项已配置
- [ ] 推 tag 后 CI `sign-mac` job 成功
- [ ] 本地安装 dmg 无 Gatekeeper 警告
