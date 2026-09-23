# Vue 3 前端开发规范

> 技术栈：Vue 3 + TypeScript + Vite + Ant Design Vue 4 + Pinia + Vue Query + SCSS

---

## 1. 目录与文件命名

```
src/
├── api/                  # 接口函数，按业务域拆分
│   └── types/            # 全局 namespace 类型（.d.ts，无需 import）
├── assets/               # 静态资源（图片、SVG、字体）
├── components/           # 通用组件，每个组件一个目录
│   └── comp-name/
│       ├── comp-name.vue
│       └── comp-name.scss   # 有样式时才建（scoped 优先写在 SFC 内）
├── composables/          # 组合式函数（useXxx.ts）
├── layouts/              # 布局壳层，同 components 结构
├── pages/                # 页面（views），同 components 结构
├── router/               # 路由配置
├── stores/               # Pinia store，barrel export
├── mocks/                # vite-plugin-mock，仅开发环境
├── styles/               # 全局 SCSS（variables、reset）
├── theme/                # Ant Design Vue ThemeConfig
└── utils/                # 工具函数
```

| 类型 | 规范 | 示例 |
|---|---|---|
| 目录 / 文件 | kebab-case | `page-container/page-container.vue` |
| 组件名 | PascalCase | `PageContainer`、`ProTable` |
| Composable | `use` + camelCase | `useAuth.ts`、`useOrderList.ts` |
| Store | `use` + PascalCase + `Store` | `useLayoutStore`、`useAppStore` |
| 常量 | UPPER_SNAKE_CASE | `MAX_PAGE_SIZE`、`API_TIMEOUT` |
| 类型 / 接口 | PascalCase | `UserInfo`、`ApiResponse` |
| CSS 类名 | BEM | `.card__header--active` |

- 路径引用统一使用 `@/` 别名，禁止多层 `../../`
- 模板中组件标签用 PascalCase（`<PageContainer />`），与文件名 kebab-case 自动映射

---

## 2. 组件规范（SFC）

### 单文件组件结构

顺序固定：**template → script → style**

```vue
<template>
    <div class="order-list">
        <div
            v-for="item in list"
            :key="item.id"
            class="order-list__item"
            @click="handleItemClick(item)"
        >
            {{ item.title }}
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { fetchOrderList } from '@/api/order'
import type { OrderItem } from '@/api/types/order'

const PAGE_SIZE = 20
const list = ref<OrderItem[]>([])

async function loadList() {
    const res = await fetchOrderList({ pageSize: PAGE_SIZE })
    if (res.success) {
        list.value = res.data
    }
}

function handleItemClick(item: OrderItem) {
    /* ... */
}

onMounted(loadList)
</script>

<style lang="scss" scoped>
.order-list {
    &__item {
        padding: 12px;
    }
}
</style>
```

### Props / Emits

```vue
<script lang="ts" setup>
interface Props {
    title: string
    disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    disabled: false,
})

const emit = defineEmits<{
    submit: [value: string]
    cancel: []
}>()
</script>
```

- 必填 props 不设默认值；可选 props 显式标注 `?`
- 事件名 camelCase
- 禁止子组件直接修改 props，用 emit 通知父组件

### 组件设计原则

- **单一职责**：展示组件 vs 容器组件分离
- **Props 向下，Events 向上**
- **避免 prop drilling**：跨 3 层以上考虑 provide/inject 或 store
- **v-for 必须 `:key`**，key 用稳定唯一 id，不用 index（列表会增删时）
- **条件渲染**：`v-if` 切换开销大、`v-show` 频繁切换；按需选择
- 组件不超过 **300 行**，超出考虑拆分子组件或 composable

---

## 3. Composables（组合式函数）

```ts
// composables/useAuth.ts
import { ref, computed, onMounted } from 'vue'
import { getUserInfo } from '@/api/user'
import type { UserInfo } from '@/api/types/user'

export function useAuth() {
    const user = ref<UserInfo | null>(null)
    const loading = ref(false)
    const isLoggedIn = computed(() => !!user.value)

    async function fetchUser() {
        loading.value = true
        try {
            user.value = await getUserInfo()
        } finally {
            loading.value = false
        }
    }

    onMounted(fetchUser)

    return { user, loading, isLoggedIn, fetchUser }
}
```

- 文件名 `useXxx.ts`，函数名与文件名一致
- 只封装**可复用**逻辑：表单 state、分页、权限、请求状态
- 返回 `ref` / `computed` + 方法
- 避免返回过多零散变量（> 5 个考虑对象分组）
- 放 `composables/` 目录，不放 `utils/`

---

## 4. API 层

```ts
// api/types/xxx.d.ts — 全局 namespace，不 export
declare namespace Xxx {
    interface Item {
        id: number
        name: string
    }
    interface ListParams {
        page: number
        pageSize: number
        keyword?: string
    }
    interface ListResult {
        list: Item[]
        total: number
    }
}

// api/xxx.ts — 一函数一接口
import { request } from '@/utils/request'

export function fetchXxxList(params: Xxx.ListParams) {
    return request<Xxx.ListResult>({ url: '/api/xxx/list', method: 'GET', params })
}

export function createXxx(data: Xxx.CreatePayload) {
    return request<Xxx.Item>({ url: '/api/xxx', method: 'POST', data })
}
```

- 响应统一走 `request<T>`，自动解包 `data.data`
- 错误由拦截器全局 toast，业务层不需重复 catch
- 服务端数据用 Vue Query 管理，不存入 Pinia
- 接口函数命名动词开头：`getXxx`、`fetchXxxList`、`createXxx`、`updateXxx`、`deleteXxx`

---

## 5. 状态管理（Pinia）

### Store 写法（Composition API 风格）

```ts
// stores/use-layout-store.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useLayoutStore = defineStore('layout', () => {
    const collapsed = ref(false)
    const mobileOpen = ref(false)

    function toggleCollapsed() {
        collapsed.value = !collapsed.value
    }

    function setMobileOpen(open: boolean) {
        mobileOpen.value = open
    }

    return { collapsed, mobileOpen, toggleCollapsed, setMobileOpen }
})
```

```ts
// stores/index.ts — barrel export
export { useAppStore } from './use-app-store'
export { useLayoutStore } from './use-layout-store'
```

### 组件内使用

```vue
<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { useLayoutStore } from '@/stores'

const layoutStore = useLayoutStore()
const { collapsed, mobileOpen } = storeToRefs(layoutStore)  // 响应式状态
const { toggleCollapsed } = layoutStore                      // 方法直接解构
</script>
```

### 状态管理边界

| 场景 | 方案 |
|---|---|
| 组件内 UI 状态 | `ref` / `reactive` |
| 跨 2–3 个兄弟组件 | 提升到共同父组件或 composable |
| 跨页面 / 全局客户端状态 | Pinia store |
| 服务端数据缓存 | Vue Query |
| 布局 / 主题 | `useLayoutStore` |

- 禁止直接解构 store 状态（会丢失响应性），必须用 `storeToRefs()`
- Action 动词开头，保持同步操作直接改 state

---

## 6. 路由规范

```ts
// router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import AdminLayout from '@/layouts/admin-layout/admin-layout.vue'

const basename = import.meta.env.VITE_BASE_PATH || '/'

export const router = createRouter({
    history: createWebHistory(basename),
    routes: [
        {
            path: '/',
            component: AdminLayout,
            children: [
                { path: '', redirect: '/dashboard' },
                {
                    path: 'dashboard',
                    component: () => import('@/pages/dashboard/dashboard.vue'),
                    meta: { title: '仪表盘' },
                },
                {
                    path: 'demo/table',
                    component: () => import('@/pages/demo-table/demo-table.vue'),
                    meta: { title: '示例表格' },
                },
            ],
        },
    ],
})
```

- 路由配置集中在 `router/index.tsx`
- 页面组件用 `() => import(...)` 懒加载，减小首屏体积
- 路由 path 与页面目录名一致（kebab-case）
- `meta.title` 用于面包屑 / 文档标题
- 导航守卫用 `router.beforeEach`（权限、登录态）
- 新增页面需同步更新 `admin-layout` 中的 `menuItems`
- 布局内用 `<RouterView />` 渲染子路由

---

## 7. 样式规范

- BEM 命名：`.block__element--modifier`
- 组件样式必须 `scoped`，避免污染全局
- 颜色 / 间距用 CSS 变量（`--admin-*`），禁止魔法数字
- 全局样式只放 `styles/`（variables、reset）
- Ant Design Vue 组件覆盖优先用 theme token，其次 `:deep(.ant-xxx)`，最后才 `!important`（需注释原因）
- 布局优先 flex / grid

```vue
<style lang="scss" scoped>
.user-card {
    padding: var(--admin-content-padding);

    &__avatar {
        width: 48px;
        height: 48px;
        border-radius: 50%;
    }

    &__name {
        font-size: 14px;
        font-weight: 600;
        color: var(--admin-ink);
    }

    // 覆盖 antd 组件
    :deep(.ant-card-body) {
        padding: 12px;
    }
}
</style>
```

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
- 表格在移动端用响应式列隐藏次要列，或切换为卡片列表
- 字号基准 **16px**，禁止小于 12px；行高不低于 1.4
- 断点与 Ant Design Vue Grid 对齐：`xs <576` / `sm ≥576` / `md ≥768` / `lg ≥992` / `xl ≥1200`

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
| 组件间距 | `8px` 基准 |

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

1. Ant Design Vue 原生组件（Button、Table、Form、Card…）
2. 项目封装组件（PageContainer、ProTable、ChartCard）
3. 自定义组件（放 `components/`，遵循 BEM + scoped SCSS）

- 不引入第二套 UI 库
- 图标统一用 `@ant-design/icons-vue`，自定义 SVG 放 `assets/`

### 暗色模式

当前暂不支持。后续如需支持，在 `:root` 下加 `@media (prefers-color-scheme: dark)` 覆盖变量，Ant Design Vue 走 `theme.algorithm: theme.darkAlgorithm`。

---

## 10. 代码质量

- 禁止随意 `any`，API 响应必须有类型
- `@typescript-eslint/no-unused-vars` 已配置，提交前跑 `pnpm lint`
- 格式化用 `pnpm format`，CI 可加 `pnpm format:check`
- Git 提交使用 Conventional Commits：`feat:` / `fix:` / `refactor:` / `style:` / `chore:`
- 不提交 `.env`、密钥、证书等敏感文件
- 不在组件内拼接完整 API 域名，走环境变量 + request 基址
- 不滥用 `!important` 覆盖样式
- 不复制粘贴大段重复代码（抽 composable 或组件）
- 不为只用一次的简单逻辑过度抽象

---

## 代码审查检查清单

- [ ] 命名符合 kebab-case / BEM / camelCase / PascalCase / UPPER_SNAKE_CASE
- [ ] SFC 顺序：template → script → style
- [ ] `<script lang="ts" setup>` 写法
- [ ] Props 有类型，可选 props 有默认值
- [ ] v-for 有 :key，key 是稳定 id
- [ ] 无硬编码密钥、token、内网地址
- [ ] API 有类型，响应判 success/error
- [ ] 异步有 loading/error 态
- [ ] scoped + BEM，颜色/间距用 token
- [ ] 媒体查询 min-width 向上增强
- [ ] 改动范围最小，无无关重构
- [ ] 类型检查通过（`vue-tsc`）
