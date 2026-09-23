# 小程序前端开发规范

> 技术栈：uni-app 3 + Vue 3 + TypeScript + Vite + Pinia + SCSS
> 目标平台：mp-weixin（主）、mp-toutiao（副）

---

## 1. 目录与文件命名

```
src/
├── api/                  # 接口函数，按业务域拆分
│   └── types/            # 全局 namespace 类型（.d.ts，无需 import）
├── components/           # 通用组件（跨页面复用）
│   └── comp-name/
│       └── CompName.vue  # 目录 kebab-case，SFC PascalCase
├── hooks/                # 组合式函数（useXxx.ts）
├── pages/                # 主包页面
│   └── page-name/
│       ├── page-name.vue
│       └── components/   # 页面私有组件（仅该页面使用）
├── pages-common/         # 分包：通用页面
├── pages-authorize/      # 分包：授权相关
├── pages-withdraw/       # 分包：提现相关
├── static/               # 本地静态资源（tabbar 图标、iconfont）
├── store/                # Pinia store
├── styles/               # 全局 SCSS（variables、common、mixins）
└── utils/                # 工具函数
```

| 类型 | 规范 | 示例 |
|---|---|---|
| 目录 / 文件 | kebab-case | `kol-detail/kol-detail.vue` |
| 组件 SFC | PascalCase | `KolCard.vue`、`ProductFilter.vue` |
| Composable | `use` + PascalCase | `useKolData.ts`、`useWallet.ts` |
| Store | `use` + PascalCase | `useMember.ts` |
| 常量 | UPPER_SNAKE_CASE | `DEFAULT_DATE_TYPE`、`ORDER_STATUS_OPTIONS` |
| 类型 / 接口 | PascalCase | `UserInfo`、`OrderData<T>` |
| CSS 类名 | BEM | `.kol-card__fans--active` |

- 路径引用统一使用 `@/` 别名
- 页面文件遵循 uni-app 约定：`pages/page-name/page-name.vue`
- 页面私有组件放 `pages/page-name/components/`，跨页面复用才提升到 `src/components/`

---

## 2. 分包策略

- 主包只放 tabBar 页面 + 高频入口页面，控制在 **2MB 以内**
- 按业务域拆分分包：`pages-common`、`pages-authorize`、`pages-withdraw`
- 新页面注册到 `pages.json` 对应分包的 `pages` 数组
- 分包间可以引用主包组件，但**禁止分包之间互相引用**
- `manifest.json` 开启 `lazyCodeLoading: requiredComponents`

---

## 3. 组件规范（SFC）

### 单文件组件结构

顺序固定：**template → script → style**

```vue
<template>
    <view class="kol-card" @click="handleClick">
        <image class="kol-card__avatar" :src="item.avatar" mode="aspectFill" />
        <view class="kol-card__info">
            <text class="kol-card__name">{{ item.name }}</text>
            <text class="kol-card__fans">{{ formatFans(item.fans) }} 粉丝</text>
        </view>
        <slot name="extra" />
    </view>
</template>

<script lang="ts" setup>
interface Props {
    item: KOL.Item
    showAction?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    showAction: false,
})

const emit = defineEmits<{
    click: [item: KOL.Item]
}>()

function handleClick() {
    emit('click', props.item)
}

function formatFans(fans: number) {
    return fans >= 10000 ? `${(fans / 10000).toFixed(1)}万` : fans
}
</script>

<style lang="scss" scoped>
.kol-card {
    display: flex;
    align-items: center;
    padding: 24rpx;

    &__avatar {
        width: 96rpx;
        height: 96rpx;
        border-radius: 50%;
    }

    &__info {
        flex: 1;
        margin-left: 20rpx;
    }

    &__name {
        font-size: 30rpx;
        font-weight: 600;
        color: #1c1917;
    }

    &__fans {
        font-size: 24rpx;
        color: #78716c;
    }
}
</style>
```

### Props / Emits / Expose

```vue
<script lang="ts" setup>
// Props：必填不设默认值，可选显式标注 ?
interface Props {
    title: string
    disabled?: boolean
}
const props = withDefaults(defineProps<Props>(), { disabled: false })

// Emits：类型化声明
const emit = defineEmits<{
    submit: [value: string]
    cancel: []
}>()

// Expose：弹窗类组件必须暴露 open/close 方法
const popupRef = ref<InstanceType<typeof UniPopup>>()
defineExpose({
    open: () => popupRef.value?.open('bottom'),
    close: () => popupRef.value?.close(),
})
</script>
```

### 弹窗组件模式

项目统一使用 `uni-popup` + `defineExpose` 模式：

```vue
<!-- 父组件调用 -->
<script lang="ts" setup>
const sharePanelRef = ref<InstanceType<typeof SharePanel>>()
function openShare() {
    sharePanelRef.value?.open()
}
</script>

<template>
    <SharePanel ref="sharePanelRef" />
</template>
```

### 组件设计原则

- **单一职责**：展示组件 vs 容器组件分离
- **Props 向下，Events 向上**，禁止子组件直接修改 props
- **避免 prop drilling**：跨 3 层以上用 provide/inject 或 store
- **v-for 必须 `:key`**，key 用稳定唯一 id，不用 index
- 组件不超过 **300 行**，超出考虑拆分子组件或 composable
- 不使用 DOM API（`document`、`window`），用 `uni.*` API

---

## 4. Composables（组合式函数）

### 分页列表模式（项目核心模式）

```ts
// hooks/useKolData.ts
import { ref, reactive } from 'vue'
import { onReachBottom } from '@dcloudio/uni-app'
import { getKolList } from '@/api/kol'

export function useKolData(autoLoad = true) {
    const pageParam = ref({ page: 1, length: 20 })
    const state = reactive<OrderData<KOL.Item[]>>({
        pageCount: 0,
        data: [],
        loading: false,
        hasNext: true,
    })

    async function fetchData(reset = false) {
        if (reset) {
            pageParam.value.page = 1
            state.data = []
            state.hasNext = true
        }
        if (state.loading || !state.hasNext) return

        state.loading = true
        try {
            const res = await getKolList({
                start: (pageParam.value.page - 1) * pageParam.value.length,
                length: pageParam.value.length,
            })
            if (res.success) {
                const list = res.data.data
                state.data = pageParam.value.page === 1 ? list : [...state.data, ...list]
                state.pageCount = res.data.total
                state.hasNext = state.data.length < res.data.total
                pageParam.value.page++
            }
        } finally {
            state.loading = false
        }
    }

    if (autoLoad) {
        fetchData(true)
        onReachBottom(() => fetchData())
    }

    return { state, pageParam, fetchData }
}
```

### 编写规则

- 文件名 `useXxx.ts`，函数名与文件名一致
- 只封装**可复用**逻辑：分页列表、表单状态、权限校验、上传
- 返回 `ref` / `reactive` + 方法
- 避免返回过多零散变量（> 5 个考虑对象分组）
- 放 `hooks/` 目录
- 分页列表统一使用 `OrderData<T>` 全局类型 + `pageParam` 偏移量分页

---

## 5. API 层

```ts
// api/types/kol.d.ts — 全局 namespace，不 export
declare namespace KOL {
    interface Item {
        id: number
        name: string
        avatar: string
        fans: number
    }
    interface ListParams {
        start: number
        length: number
        keyword?: string
    }
}

// api/kol.ts — 一函数一接口
import { request } from '@/utils/request'

export function getKolList(params: KOL.ListParams) {
    return request<PageResult<KOL.Item>>({
        url: '/qiongqi/xd/frontend/kol/list',
        method: 'GET',
        data: params,
    })
}

export function getKolDetail(id: number, showLoading = true) {
    return request<Result<KOL.Detail>>({
        url: `/qiongqi/xd/frontend/kol/detail`,
        method: 'GET',
        data: { id },
        showLoading,
    })
}
```

### 规则

- 响应统一走 `request<T>`，自动注入 token 和 loading
- 静默请求（列表刷新、轮询）传 `showLoading: false`
- 错误由拦截器全局处理，业务层判断 `res.success`
- 接口函数命名动词开头：`getXxx`、`fetchXxxList`、`createXxx`、`updateXxx`、`deleteXxx`
- 分页使用偏移量：`start = (page - 1) * length`
- 上传文件不走 `request`，用 `uni.uploadFile` + 手动注入 header

### 响应类型（全局声明）

```ts
// api/types/common.d.ts
interface Result<T = unknown> {
    status: number
    code: number
    message: string
    success: boolean
    data: T
}

interface PageResult<T = unknown> {
    success: boolean
    data: {
        data: T[]
        total: number
        start: number
        length: number
    }
}

interface PageParam {
    start: number
    length: number
}
```

---

## 6. 状态管理（Pinia）

### Store 写法

```ts
// store/useMember.ts
import { defineStore } from 'pinia'

export const useMemberStore = defineStore('MemberStore', {
    state: () => ({
        userInfo: null as UserRes.Info | null,
        token: uni.getStorageSync('accessToken') || '',
        platform: '' as 'wechat_mini' | 'douyin_mini',
        weappStatus: false,
    }),

    getters: {
        isLoggedIn: state => !!state.token,
    },

    actions: {
        async getMemberinfo() {
            const res = await getMemberInfo()
            if (res.success) {
                this.userInfo = res.data
                uni.setStorageSync('useInfo', res.data)
            }
        },

        async validateLogin(): Promise<boolean> {
            if (this.isLoggedIn) return true
            uni.showModal({
                title: '提示',
                content: '请先登录',
                confirmText: '去登录',
                success: res => {
                    if (res.confirm) {
                        uni.navigateTo({ url: '/pages/login/login' })
                    }
                },
            })
            return false
        },

        logOut() {
            this.token = ''
            this.userInfo = null
            uni.removeStorageSync('accessToken')
            uni.removeStorageSync('useInfo')
        },
    },
})
```

### 规则

- 全局只维护**一个核心 store**（用户/登录态），避免 store 碎片化
- 持久化用 `uni.getStorageSync` / `uni.setStorageSync`，手动逐字段读写
- 服务端数据用 composable + 请求层管理，不存入 store
- 登录校验统一走 `store.validateLogin()`，不在各页面重复写
- 组件内用 `storeToRefs()` 解构响应式状态

### 状态管理边界

| 场景 | 方案 |
|---|---|
| 组件内 UI 状态 | `ref` / `reactive` |
| 跨组件客户端状态 | provide/inject 或 composable |
| 全局登录态 / 用户信息 | Pinia store |
| 服务端列表数据 | composable（分页列表模式） |
| 布局 / 主题 | store 或 CSS 变量 |

---

## 7. 路由与导航

### 页面注册

新页面必须注册到 `pages.json`（主包或对应分包）：

```json
{
    "pages": [
        {
            "path": "pages/dashboard/dashboard",
            "style": { "navigationStyle": "custom" }
        }
    ],
    "subPackages": [
        {
            "root": "pages-common",
            "pages": [
                { "path": "user-info/user-info", "style": { "navigationStyle": "custom" } }
            ]
        }
    ]
}
```

### 导航方式

| 方法 | 场景 |
|---|---|
| `uni.navigateTo` | 保留页面栈，普通跳转 |
| `uni.redirectTo` | 替换当前页（登录后跳转） |
| `uni.reLaunch` | 关闭所有页面（退出登录） |
| `uni.navigateBack` | 返回上一页 |
| `uni.switchTab` | 跳转 tabBar 页面 |

### 规则

- 跳转使用**绝对路径** + query string：`/pages/kol-detail/kol-detail?id=123`
- 参数在 `onLoad(option)` 中读取，不用 props
- 页面间传参优先用 URL query，复杂数据用 `eventChannel`
- 登录拦截：操作前调用 `store.validateLogin()`
- tabBar 页面只能用 `switchTab` 跳转
- 新增页面同步更新 `docs/pages-map.md`

---

## 8. 样式规范

### 基本原则

- 组件样式必须 **scoped**
- 单位统一使用 **rpx**（750rpx = 屏幕宽度）
- 颜色 / 间距提取为 SCSS 变量，通过 `vite.config.ts` 的 `additionalData` 全局注入
- 布局优先 flex，配合全局工具类
- **禁止在组件 WXSS 中使用标签选择器、ID 选择器、属性选择器**

### SCSS 变量（全局注入）

```scss
// styles/variable.scss — 通过 vite additionalData 自动注入，无需手动 @use
$primary-color: #ffbd00;
$background-color: #fff4d7;
$btn-color: linear-gradient(135deg, #ffd34d, #ffb400);

// 工具函数
@function bg($name) {
    @return url('https://oss-xingdou.aixingdou.com/weapp/#{$name}');
}

@mixin hairline-border($color: #e8e4de) {
    position: relative;
    &::after {
        content: '';
        position: absolute;
        inset: 0;
        border: 1px solid $color;
        transform: scale(0.5);
        transform-origin: 0 0;
        width: 200%;
        height: 200%;
        border-radius: inherit;
        pointer-events: none;
    }
}
```

### 全局工具类

```scss
// styles/common.scss — 在 App.vue 中引入
// flex 布局快捷类：fh = flex horizontal, fv = flex vertical
// 后缀：c = center, b = baseline, bt = space-between, ar = space-around
.fh-c-bt { display: flex; align-items: center; justify-content: space-between; }
.fh-c    { display: flex; align-items: center; }
.fv-c    { display: flex; flex-direction: column; align-items: center; }

// 文本溢出
.text-overflow   { @include ellipsis(1); }
.text-overflow-2 { @include ellipsis(2); }
.text-overflow-3 { @include ellipsis(3); }
```

### BEM 命名

```vue
<style lang="scss" scoped>
.kol-card {
    padding: 24rpx;

    &__avatar {
        width: 96rpx;
        height: 96rpx;
    }

    &__name {
        font-size: 30rpx;
        font-weight: 600;
    }

    &--featured {
        border: 2rpx solid $primary-color;
    }
}
</style>
```

### 覆盖组件库样式

```vue
<style lang="scss" scoped>
// 使用 :deep() 穿透 scoped
:deep(.uni-popup__wrapper) {
    border-radius: 24rpx 24rpx 0 0;
}
</style>
```

---

## 9. 多平台适配（条件编译）

### 语法

```vue
<template>
    <!-- #ifdef MP-WEIXIN -->
    <view class="wx-only">仅微信显示</view>
    <!-- #endif -->

    <!-- #ifndef MP-TOUTIAO -->
    <view class="not-toutiao">除头条外显示</view>
    <!-- #endif -->
</template>

<script lang="ts" setup>
// #ifdef MP-WEIXIN
const platform = 'wechat_mini'
// #endif
// #ifdef MP-TOUTIAO
const platform = 'douyin_mini'
// #endif
</script>
```

### 规则

- 平台差异代码必须用条件编译包裹，禁止运行时 `if (platform === 'xxx')` 判断
- 登录方式、导航栏高度、tabBar 配置、分享逻辑是主要差异点
- 新增平台差异需在代码注释中说明原因
- `pages.json` 中平台差异用 `#ifdef` / `#ifndef` 注释块

---

## 10. 移动端优先

- 设计稿基准 **750rpx**，所有尺寸用 rpx
- 触控目标最小 **88rpx × 88rpx**（约 44px）
- 列表项高度不低于 **88rpx**
- 字号基准 **28rpx**（约 14px），禁止小于 **24rpx**
- 安全区域：底部操作栏使用 `<SafeArea />` 组件适配 iPhone 底部横条
- 长列表必须实现分页加载（`onReachBottom`），禁止一次性渲染全部数据
- 图片使用 `mode="aspectFill"` 或 `mode="widthFix"`，禁止拉伸变形
- 远程图片走 OSS CDN，本地 `static/` 只放 tabbar 图标和字体

---

## 11. 代码质量

### 禁止事项

- 不提交 `.env`、密钥、证书等敏感文件
- 不在组件内拼接完整 API 域名，走环境变量 + request 基址
- 不滥用 `!important` 覆盖样式
- 不用 `any` 逃避类型（临时除外需加 TODO）
- 不为只用一次的简单逻辑过度抽象
- 不复制粘贴大段重复代码（抽 composable 或组件）
- 不使用 DOM API（`document`、`window`），用 `uni.*` API
- 不在组件 WXSS 中使用标签 / ID / 属性选择器

### 错误处理

```ts
// 业务层判断 success
const res = await fetchOrderList(params)
if (res.success) {
    // 处理数据
} else {
    uni.showToast({ title: res.message || '请求失败', icon: 'none' })
}

// 异步操作 try/catch
try {
    await submitForm(data)
    uni.showToast({ title: '提交成功' })
} catch (_) {
    // 拦截器已处理 toast，此处静默
}
```

### 日期处理

- 统一使用 `dayjs`，格式 `YYYY-MM-DD` 或 `YYYY/MM/DD`
- 禁止手写日期格式化逻辑

### 提交前检查

```bash
pnpm lint          # ESLint 检查
pnpm format        # Prettier 格式化
pnpm type-check    # vue-tsc 类型检查
```

### Git 提交规范

使用 Conventional Commits：`feat:` / `fix:` / `refactor:` / `style:` / `chore:` / `docs:`

---

## 12. 全局类型声明

```ts
// global.d.ts — 无需 import，全局可用
interface OrderData<T> {
    pageCount: number
    data: T
    loading: boolean
    hasNext: boolean
    total?: number
}

interface Option {
    label: string
    value: string | number
}

interface OptionParam {
    agency_invite_id?: string
    invite_user_id?: string
    share_user_id?: string
}
```

- 通用类型放 `global.d.ts`
- API 类型放 `api/types/*.d.ts`，使用 `declare namespace`
- 组件类型放组件文件内，不单独建 types 文件

---

## 13. 小程序平台特有约定

### 生命周期使用场景

| 钩子 | 时机 | 典型用途 |
|---|---|---|
| `onLoad(option)` | 页面加载，仅一次 | 读取 URL 参数、初始化数据 |
| `onShow` | 每次页面显示 | 刷新数据（从详情页返回）、登录态检查 |
| `onReady` | 首次渲染完成 | DOM 操作（`uni.createSelectorQuery`） |
| `onHide` | 页面隐藏 | 暂停定时器、停止轮询 |
| `onUnload` | 页面销毁 | 清理定时器、解绑事件 |
| `onReachBottom` | 触底 | 分页加载更多 |
| `onPullDownRefresh` | 下拉刷新 | 重置列表并重新请求 |
| `onShareAppMessage` | 用户点分享 | 返回分享标题/路径/图片 |

```vue
<script lang="ts" setup>
import { onLoad, onShow, onReachBottom, onUnload } from '@dcloudio/uni-app'

// onLoad 读参数
onLoad(option => {
    const id = option?.id
    if (id) fetchDetail(Number(id))
})

// onShow 刷新（从子页面返回时）
onShow(() => {
    refreshList()
})

// 分页
onReachBottom(() => {
    fetchMore()
})

// 清理
let timer: ReturnType<typeof setInterval> | null = null
onUnload(() => {
    if (timer) clearInterval(timer)
})
</script>
```

**规则：**
- 数据初始化放 `onLoad`，不放 `onMounted`（小程序中 `onMounted` 时机不稳定）
- 需要每次进入都刷新的数据放 `onShow`
- 定时器、轮询必须在 `onUnload` / `onHide` 中清理
- `onShareAppMessage` 必须在 setup 顶层直接调用，不能包在条件或回调里（编译器限制）

### setData 性能优化

小程序底层通过 `setData` 将数据从逻辑层传到渲染层，是性能瓶颈所在。

**必须遵守：**

- **只传变化字段**，不整体替换大对象

```ts
// 错误：整体替换
list.value = [...list.value, ...newItems]

// 正确（uni-app 已自动 diff，但原生写法需注意）：
// 在 uni-app + Vue 3 中，框架会做最小化 setData
// 但仍应避免不必要的深层响应式对象
```

- **大列表用 `shallowRef`**，避免深层响应式追踪

```ts
import { shallowRef, triggerRef } from 'vue'

const list = shallowRef<Item[]>([])

function appendItems(newItems: Item[]) {
    list.value = [...list.value, ...newItems]
    triggerRef(list)  // 手动触发更新
}
```

- **高频更新（动画、倒计时）用 CSS 动画或 `WXS`**，不走 setData
- **避免在 setData 中传输大图片 base64**，改用网络 URL 或本地路径
- **合并多次状态更新**，Vue 3 的响应式系统会自动批量，但避免在循环中逐个修改 ref

### 包体积控制

| 限制 | 微信 | 抖音 |
|---|---|---|
| 主包 | ≤ 2MB | ≤ 4MB |
| 单个分包 | ≤ 2MB | ≤ 4MB |
| 总包 | ≤ 20MB | ≤ 20MB |

**规则：**

- 主包只放 tabBar 页面 + 登录页 + 全局组件
- 业务页面全部放分包，按业务域拆分
- 图片资源走 OSS CDN，`static/` 只放 tabbar 图标和 iconfont
- 字体文件走远程加载（`uni.loadFontFace`），不打入包内
- 第三方库按需引入，避免整包导入（如 dayjs 不导入全部 locale）
- `manifest.json` 开启 `lazyCodeLoading: requiredComponents`
- 定期用 `pnpm build:mp-weixin` 检查产物体积

### Storage 管理

小程序本地存储上限 **10MB**（微信）/ **10MB**（抖音），超出会静默失败。

```ts
// utils/storage.ts — 统一封装
const STORAGE_KEYS = {
    TOKEN: 'accessToken',
    USER_INFO: 'useInfo',
    THEME: 'theme',
    INVITE: 'agencyInviteId',
} as const

export function getStorage<T>(key: string): T | null {
    try {
        return uni.getStorageSync(key) || null
    } catch {
        return null
    }
}

export function setStorage(key: string, value: unknown) {
    try {
        uni.setStorageSync(key, value)
    } catch {
        // 存储满时静默失败，不影响主流程
    }
}

export function clearAuth() {
    uni.removeStorageSync(STORAGE_KEYS.TOKEN)
    uni.removeStorageSync(STORAGE_KEYS.USER_INFO)
}
```

**规则：**

- key 名统一在 `STORAGE_KEYS` 常量中管理，禁止散落字符串
- 只存必要数据（token、用户基础信息、主题偏好），不缓存列表数据
- 列表数据用内存状态（composable），不持久化
- 存储操作必须 try/catch，存储满时不能崩溃
- 退出登录时清理所有业务缓存

### 微信 / 抖音特有 API

#### 登录流程

```ts
// 微信：uni.login → code → 后端换 token
// 抖音：tt.login → code → 后端换 token（或短信登录）

// #ifdef MP-WEIXIN
const { code } = await uni.login({ provider: 'weixin' })
// #endif

// #ifdef MP-TOUTIAO
const { code, anonymousCode } = await tt.login()
// #endif
```

- 登录方式必须用条件编译区分
- 微信登录失败 code 50064 → 跳转绑定手机号页面
- 抖音支持匿名登录（`anonymousCode`），按需使用
- token 过期（401）→ 清除本地态 → 跳转登录页

#### 支付

```ts
// 微信支付
// #ifdef MP-WEIXIN
uni.requestPayment({
    provider: 'wxpay',
    timeStamp, nonceStr, package, signType, paySign,
    success: () => { /* 支付成功 */ },
    fail: () => { /* 用户取消或失败 */ },
})
// #endif

// 抖音支付
// #ifdef MP-TOUTIAO
tt.pay({
    orderInfo, service,
    success: res => { /* res.code === 0 为成功 */ },
    fail: () => { /* 失败 */ },
})
// #endif
```

- 支付参数由后端生成，前端不拼接签名
- 支付结果必须以后端回调为准，前端 success 仅做 UI 反馈
- 用户取消支付不弹错误提示

#### 订阅消息

```ts
// 仅微信支持
// #ifdef MP-WEIXIN
uni.requestSubscribeMessage({
    tmplIds: ['TEMPLATE_ID'],
    success: res => {
        // res['TEMPLATE_ID'] === 'accept' | 'reject' | 'ban'
    },
})
// #endif
```

- 必须在用户点击事件中触发，不能自动弹出
- 用户拒绝不阻塞主流程
- 模板 ID 走配置，不硬编码

#### 授权与隐私

- 头像/昵称：使用 `<button open-type="chooseAvatar">` + `uni.getUserProfile`（微信已回收，改用自定义表单）
- 手机号：`<button open-type="getPhoneNumber">` + 后端解密
- 位置：`uni.getLocation` 需在 `manifest.json` 声明 `requiredPrivateInfos`
- 相册/相机：`uni.chooseImage` / `uni.chooseMedia`
- **禁止强制授权**：用户拒绝后仍可使用基本功能

### 审核注意事项

| 平台 | 常见驳回原因 |
|---|---|
| 微信 | 空页面/功能不完整、强制授权才能使用、诱导分享、虚拟支付（iOS） |
| 抖音 | 页面白屏、功能与描述不符、未适配抖音登录、含微信二维码/跳转 |

**规则：**

- 提审前确保所有页面有实际内容，禁止空壳页面
- 登录不能阻断浏览，游客可看基本内容
- 分享功能不能强制（不分享也能继续操作）
- iOS 端禁止虚拟商品直接支付（走客服/外部链接）
- 抖音端不能出现微信相关 UI（二维码、"关注公众号"等）
- 隐私政策弹窗必须在首次使用敏感 API 前展示
- `pages.json` 中注释掉的页面不能出现在代码引用中

### 性能检查清单

- [ ] 首屏数据请求 ≤ 2 个，其余延后或按需加载
- [ ] 长列表使用分页 + `onReachBottom`，单次渲染 ≤ 20 条
- [ ] 图片使用 CDN + WebP 格式 + 合适尺寸（不传原图）
- [ ] 避免 `setData` 传输 > 256KB 数据
- [ ] 定时器 / 轮询在 `onHide` / `onUnload` 中清理
- [ ] 页面栈不超过 10 层（超出用 `redirectTo` 替换）
- [ ] 分包预加载配置在 `pages.json` 的 `preloadRule` 中

---

## 代码审查检查清单

- [ ] 命名符合 kebab-case / BEM / camelCase / PascalCase / UPPER_SNAKE_CASE
- [ ] SFC 顺序：template → script → style
- [ ] `<script lang="ts" setup>` 写法
- [ ] Props 有类型，可选 props 有默认值
- [ ] v-for 有 :key，key 是稳定 id
- [ ] 新页面已注册到 pages.json（主包或分包）
- [ ] 分包间无互相引用
- [ ] 无硬编码密钥、token、内网地址
- [ ] API 有类型，响应判 success/error
- [ ] 列表有分页加载（onReachBottom）
- [ ] 异步有 loading/error 态
- [ ] scoped + BEM，颜色/间距用变量
- [ ] 尺寸用 rpx，触控目标 ≥ 88rpx
- [ ] 平台差异用条件编译，非运行时判断
- [ ] 不使用 DOM API
- [ ] 组件 WXSS 无标签/ID/属性选择器
- [ ] 改动范围最小，无无关重构
- [ ] 类型检查通过（`vue-tsc`）
- [ ] `docs/pages-map.md` 已同步更新
