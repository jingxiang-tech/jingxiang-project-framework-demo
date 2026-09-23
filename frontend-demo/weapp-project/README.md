# weapp-project

按 `CONVENTIONS.md` 落地的小程序示例项目：达人（KOL）选号与佣金提现。

技术栈：**uni-app 3 + Vue 3 + TypeScript + Vite 5 + Pinia + SCSS**
目标平台：**mp-weixin**（主）、**mp-toutiao**（副）

---

## 快速开始

```bash
pnpm install

pnpm dev:mp-weixin      # 微信开发者工具导入 dist/dev/mp-weixin
pnpm dev:mp-toutiao     # 抖音开发者工具导入 dist/dev/mp-toutiao
```

提交前检查：

```bash
pnpm lint               # ESLint（含 --fix）
pnpm format             # Prettier
pnpm type-check         # vue-tsc
pnpm build:mp-weixin    # 产物体积检查
```

> `src/manifest.json` 的 `appid` 为空，开发者工具中选择「测试号」即可运行。

### 演示数据

`.env.development` 中 `VITE_USE_MOCK = true`，请求由 `src/mock/` 本地兜底，无需后端即可跑通全流程。
接真实后端时：把 `VITE_USE_MOCK` 置为 `false`、填入 `VITE_API_BASE_URL`，然后删除 `src/mock/` 目录。

mock 通过 `utils/request` 里的 `await import('@/mock')` 动态引入，`USE_MOCK` 在构建时被折叠为字面量，
生产产物里只会留下一个空 chunk（已验证 `dist/build/mp-weixin/mock/index.js` 为 45 字节空壳）。

---

## 目录结构

```
src/
├── api/                  # 一函数一接口，按业务域拆分
│   ├── types/            # declare namespace 全局类型（无需 import）
│   ├── kol.ts / user.ts / wallet.ts
├── components/           # 跨页面复用组件：目录 kebab-case，SFC PascalCase
│   ├── kol-card/KolCard.vue
│   ├── safe-area/SafeArea.vue
│   └── share-panel/SharePanel.vue
├── hooks/                # usePagedList（分页核心模式）/ useKolData / useWallet
├── mock/                 # 仅演示用本地数据源
├── pages/                # 主包：dashboard、kol-list、mine（tabBar）
├── pages-common/         # 分包：kol-detail
├── pages-authorize/      # 分包：login、user-info
├── pages-withdraw/       # 分包：withdraw、withdraw-record
├── static/               # 只放 tabBar 图标与 iconfont，当前为空
├── store/useMember.ts    # 全局唯一核心 store
├── styles/               # variable / mixins / common
├── types/tt.d.ts         # 抖音专有 API 最小声明
└── utils/                # request / storage / platform / format / constants
```

`static/` 说明：tabBar 目前为纯文字模式（`pages.json` 未配 `iconPath`）。接入正式设计稿时，
把 81×81 PNG 按 `tab-home.png` / `tab-home-active.png` 命名放入，并补上 `iconPath` / `selectedIconPath`。
其余图片一律走 OSS CDN（`styles/variable.scss` 的 `bg()` 函数）；字体用 `uni.loadFontFace` 远程加载。

---

## 规范落点对照

| 规范条目                                            | 代码位置                                                                      |
| --------------------------------------------------- | ----------------------------------------------------------------------------- |
| §1 命名（kebab-case 目录 / PascalCase SFC）         | `components/kol-card/KolCard.vue`、`pages/kol-list/components/FilterBar.vue`  |
| §1 `@/` 别名、页面私有组件                          | 全部 import；`pages/dashboard/components/StatPanel.vue`                       |
| §2 分包策略与 `lazyCodeLoading`                     | `pages.json` 的 `subPackages` / `preloadRule`、`manifest.json`                |
| §2 分包间禁止互相引用                               | 三个分包只引用 `@/components`、`@/hooks`、`@/api`，互不 import                |
| §3 SFC 顺序 template → script → style               | 全部 `.vue`，并由 ESLint `vue/block-order` 强制                               |
| §3 Props / Emits 类型化                             | `KolCard.vue`、`FilterBar.vue`                                                |
| §3 弹窗 `uni-popup` + `defineExpose`                | `SharePanel.vue` → `kol-detail.vue` 用 `InstanceType<typeof SharePanel>` 调用 |
| §3 v-for 必须 `:key` 且用稳定 id                    | 全部列表用 `item.id` / `option.value`，未使用 index                           |
| §4 分页列表核心模式                                 | `hooks/usePagedList.ts` + `hooks/useKolData.ts`                               |
| §5 `request<T>` / 静默请求 / success 判定           | `utils/request.ts`，列表接口传 `showLoading: false`                           |
| §5 上传不走 request                                 | `utils/request.ts` 的 `uploadFile` ← `pages-authorize/user-info`              |
| §5 全局响应类型                                     | `api/types/common.d.ts`（`Result` / `PageResult` / `PageParam`）              |
| §6 单一核心 store / `validateLogin`                 | `store/useMember.ts`，页面统一调用 `validateLogin()`                          |
| §6 `storeToRefs` 解构                               | `pages/mine/mine.vue`                                                         |
| §6 服务端数据不入 store                             | 钱包 / 列表 / 详情全部走 composable                                           |
| §7 绝对路径 + query，`onLoad` 取参                  | `pages-common/kol-detail/kol-detail.vue`                                      |
| §7 tabBar 只能用 switchTab                          | `pages/dashboard/dashboard.vue` 的 `handleEntry`                              |
| §7 新增页面同步文档                                 | `docs/pages-map.md`                                                           |
| §8 scoped + BEM + rpx + SCSS 变量                   | 全部组件样式                                                                  |
| §8 `additionalData` 全局注入变量                    | `vite.config.ts` → `styles/variable.scss` + `styles/mixins.scss`              |
| §8 `:deep()` 覆盖组件库样式                         | `SharePanel.vue`                                                              |
| §8 禁止标签 / ID / 属性选择器                       | 组件样式内仅 class 选择器                                                     |
| §9 条件编译（非运行时判断）                         | `utils/platform.ts`（登录、订阅消息）、`SharePanel.vue`（分享渠道）           |
| §10 触控目标 ≥ 88rpx、字号 ≥ 24rpx                  | `variable.scss` 的 `$touch-target-min` / `$font-size-xs`                      |
| §10 `<SafeArea />` 适配底部横条                     | `kol-detail` / `user-info` / `withdraw` 的固定底栏                            |
| §10 长列表分页，禁止全量渲染                        | `kol-list`、`kol-detail` 商品列表、`withdraw-record`                          |
| §11 错误处理（拦截器 toast + 业务判 success）       | `utils/request.ts` + 各页面 `try/catch`                                       |
| §11 日期统一 dayjs                                  | `utils/format.ts`                                                             |
| §11 不用 DOM API                                    | 全部走 `uni.*`                                                                |
| §12 全局类型 `OrderData` / `Option` / `OptionParam` | `src/global.d.ts`                                                             |
| §13 数据初始化放 `onLoad` 而非 `onMounted`          | 所有页面                                                                      |
| §13 定时器在 `onHide` / `onUnload` 清理             | `pages-withdraw/withdraw-record`（30s 轮询）                                  |
| §13 `onShareAppMessage` 顶层调用                    | `dashboard.vue`、`kol-detail.vue`                                             |
| §13 Storage key 集中管理 + try/catch                | `utils/storage.ts` 的 `STORAGE_KEYS`                                          |
| §13 微信登录失败 / 手机号绑定                       | `pages-authorize/login/login.vue`                                             |
| §13 禁止强制授权、登录不阻断浏览                    | 登录页「先逛逛」，拒绝手机号授权不报错                                        |
| §13 审核期隐藏敏感入口                              | `store.weappStatus` → `pages/mine/mine.vue` 隐藏提现                          |
| §13 订阅消息须由点击触发、拒绝不阻塞                | `kol-detail.vue` 的 `handleInvite`                                            |

---

## 构建产物体积（已验证）

| 包                                            | 体积   | 限制   |
| --------------------------------------------- | ------ | ------ |
| 主包（`pages/` + `components/` + 公共 chunk） | 316 KB | ≤ 2 MB |
| `pages-common`                                | 32 KB  | ≤ 2 MB |
| `pages-authorize`                             | 32 KB  | ≤ 2 MB |
| `pages-withdraw`                              | 32 KB  | ≤ 2 MB |

---

## 有意留白

以下是规范要求、但示例项目未落地的部分，接入真实业务时补齐：

- **支付**：`uni.requestPayment`（微信）/ `tt.pay`（抖音）需要后端下发签名参数，demo 无交易场景，未写死代码。
  落地时同样收敛到 `utils/platform.ts`，前端不拼接签名，支付结果以后端回调为准。
- **tabBar 图标 / iconfont**：`src/static/` 目前为空，见上文说明。
- **`.env` 敏感信息**：仓库内只有占位值；本地覆盖写 `.env.local`（已 gitignore）。
