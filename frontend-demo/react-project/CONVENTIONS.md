# 前端开发规范

> 技术栈：React 19 + TypeScript + Vite + antd 6 + Zustand + React Query + SCSS

---

## 1. 目录与文件命名

```
src/
├── api/              # 接口函数，按业务域拆分
│   └── types/        # 全局 namespace 类型（.d.ts，无需 import）
├── components/       # 通用组件，每个组件一个目录
│   └── comp-name/
│       ├── comp-name.tsx
│       └── comp-name.scss   # 有样式时才建
├── layouts/          # 布局壳层，同 components 结构
├── pages/            # 页面，同 components 结构
├── stores/           # zustand store，barrel export
├── mocks/            # vite-plugin-mock，仅开发环境
├── styles/           # 全局 SCSS（variables、reset）
├── theme/            # antd ThemeConfig
└── utils/            # 工具函数
```

| 类型 | 规范 | 示例 |
|---|---|---|
| 目录 / 文件 | kebab-case | `page-container/page-container.tsx` |
| 组件名 | PascalCase | `PageContainer`、`ProTable` |
| hooks / store | `use` + camelCase | `useLayoutStore`、`useAuth.ts` |
| 常量 | UPPER_SNAKE_CASE | `MAX_PAGE_SIZE`、`API_TIMEOUT` |
| 类型 / 接口 | PascalCase | `UserInfo`、`ApiResponse` |
| CSS 类名 | BEM | `.card__header--active` |

- 路径引用统一使用 `@/` 别名，禁止多层 `../../`

---

## 2. API 层

```ts
// api/types/xxx.d.ts — 全局 namespace，不 export
declare namespace Xxx {
    interface Item {
        id: number
        name: string
    }
    interface ListResult {
        list: Item[]
        total: number
    }
}

// api/xxx.ts — 一函数一接口
export function fetchXxxList(params: Xxx.ListParams) {
    return request<Xxx.ListResult>({ url: '/api/xxx/list', method: 'GET', params })
}
```

- 响应统一走 `request<T>`，自动解包 `data.data`
- 错误由拦截器全局 toast，业务层不需重复 catch
- 服务端数据用 React Query 管理，不存入 Zustand
- 接口函数命名动词开头：`getXxx`、`fetchXxxList`、`createXxx`、`updateXxx`、`deleteXxx`

---

## 3. 状态管理

| 场景 | 方案 |
|---|---|
| 组件内 UI 状态 | `useState` |
| 跨组件客户端状态 | Zustand store |
| 服务端数据 | React Query |
| 布局 / 主题 | `useLayoutStore` |

- store 文件：`use-xxx-store.ts`，统一从 `stores/index.ts` barrel export
- 组件内用 selector 订阅，避免全量重渲染：

```ts
const collapsed = useLayoutStore(s => s.collapsed)
```

---

## 4. 组件规范

- 页面级组件放 `pages/`，可复用组件放 `components/`
- 每个组件目录内 `.tsx` + `.scss` 同名
- Props 用 interface 声明，可选 props 加 `?`
- 列表渲染必须有稳定 key，禁止用 index
- 异步数据必须有 loading / error 态（用 React Query 的 `isFetching`）
- 单一职责：展示组件 vs 容器组件分离
- 避免 prop drilling 超过 3 层，用 Zustand 或 Context

---

## 5. 样式规范

- BEM 命名：`.block__element--modifier`
- 颜色 / 间距用 CSS 变量（`--admin-*`），禁止魔法数字
- 组件样式 co-located，全局样式只放 `styles/`
- antd 组件覆盖优先用 theme token，其次 `:global(.ant-xxx)`，最后才 `!important`（需注释原因）
- 布局优先 flex / grid

---

## 6. 路由规范

- 路由配置集中在 `router/index.tsx`
- 路由 path 与页面目录名一致（kebab-case）
- 新增页面需同步更新 `admin-layout` 中的 `menuItems`
- 页面增多后改为 `lazy()` 懒加载，减小首屏体积

---

## 7. 代码质量

- 禁止随意 `any`，API 响应必须有类型
- `@typescript-eslint/no-unused-vars` 已配置，提交前跑 `pnpm lint`
- 格式化用 `pnpm format`，CI 可加 `pnpm format:check`
- Git 提交使用 Conventional Commits：`feat:` / `fix:` / `refactor:` / `style:` / `chore:`
- 不提交 `.env`、密钥、证书等敏感文件
- 不在组件内拼接完整 API 域名，走环境变量 + request 基址

---

## 8. 移动端优先（Mobile First）

- CSS 媒体查询从小屏写起，用 `min-width` 向上增强：

```scss
// 正确
.card {
    padding: 12px;

    @media (min-width: 768px) {
        padding: 24px;
    }
}

// 避免
.card {
    padding: 24px;

    @media (max-width: 768px) {
        padding: 12px;
    }
}
```

- 布局默认单列堆叠，`min-width` 断点后再切多列
- 触控目标最小 **44×44px**，按钮 / 链接间距不低于 8px
- 图片用 `max-width: 100%` 自适应
- 表格在移动端用 `ProTable` 的 `hiddenOn: ['xs']` 隐藏次要列
- 字号基准 **16px**，禁止小于 12px；行高不低于 1.4
- 断点与 antd Grid 对齐：`xs <576` / `sm ≥576` / `md ≥768` / `lg ≥992` / `xl ≥1200`

---

## 9. UI 风格约定

### 色彩体系

已在 `styles/variables.scss` + `theme/index.ts` 定义，禁止绕过。

| 用途 | 变量 | 值 |
|---|---|---|
| 主色 | `--admin-primary` | `#7E72F6` |
| 主色悬停 | `--admin-primary-hover` | `#6B5FE8` |
| 主色浅底 | `--admin-primary-soft` | `rgba(126,114,246,0.12)` |
| 页面背景 | `--admin-bg` | `#F7F5F2` |
| 卡片 / 容器 | `--admin-surface` | `#FFFcfb` |
| 边框 | `--admin-border` | `#E8E4DE` |
| 正文 | `--admin-ink` | `#1C1917` |
| 次要文字 | `--admin-muted` | `#78716C` |
| 侧边栏 | `--admin-sider-bg` | `#17151F` |

- 新增颜色必须先加到 `variables.scss` + `theme/index.ts`，再使用
- 语义色（success / warning / error）走 antd token，不自定义
- 禁止在组件内写死 hex 值

### 圆角与间距

| 场景 | 值 |
|---|---|
| 卡片 / 容器 | `10px` |
| 按钮 / 输入框 | `6px` |
| 内容区 padding | `12px`（`--admin-content-padding`） |
| 组件间距 | `8px` 基准，Row/Col `gutter={[8, 8]}` |

- 间距用 4px 倍数：4 / 8 / 12 / 16 / 24 / 32
- 禁止出现 5px、7px、15px 等非基准值

### 字体

```
font-family: "Outfit", "PingFang SC", "Noto Sans SC", "Helvetica Neue", Arial, sans-serif
```

| 层级 | 字号 | 字重 |
|---|---|---|
| 页面标题 | 16px | 600 |
| 卡片标题 | 13px | 600 |
| 正文 | 14px | 400 |
| 辅助文字 | 12px | 400 |
| KPI 数值 | 22px | 600 |
| 标签 / badge | 11px | 500 |

### 阴影与层级

- 卡片阴影统一用 `--admin-shadow`，极轻
- 弹层 / Drawer 阴影走 antd 默认，不覆盖
- z-index 约定：侧边栏 `100`、Header `10`、Drawer / Modal 走 antd（`1000+`）
- 禁止随意写 `z-index: 9999`

### 组件使用优先级

1. antd 原生组件（Button、Table、Form、Card…）
2. 项目封装组件（PageContainer、ProTable、ChartCard）
3. 自定义组件（放 `components/`，遵循 BEM + co-located SCSS）

- 不引入第二套 UI 库
- 图标统一用 `@ant-design/icons`，自定义 SVG 放 `assets/`

### 暗色模式

当前暂不支持。后续如需支持，在 `:root` 下加 `@media (prefers-color-scheme: dark)` 覆盖变量，antd 走 `theme.algorithm: darkAlgorithm`。
