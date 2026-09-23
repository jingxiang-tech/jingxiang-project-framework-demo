# 页面地图

> 新增页面必须同步更新本文件（见 CONVENTIONS.md §7）。

## 主包

| 路径                        | 说明                                | 导航栏         | 生命周期                                                     |
| --------------------------- | ----------------------------------- | -------------- | ------------------------------------------------------------ |
| `pages/dashboard/dashboard` | 首页：平台概览、常用入口、推荐达人  | custom         | `onLoad` 拉取、`onPullDownRefresh` 刷新、`onShareAppMessage` |
| `pages/kol-list/kol-list`   | 达人库：关键词 + 分类筛选、分页列表 | 原生「达人库」 | `useKolData` 内部注册 `onReachBottom`、`onPullDownRefresh`   |
| `pages/mine/mine`           | 我的：用户信息、钱包概览、功能菜单  | 原生「我的」   | `onShow` 刷新余额与用户信息                                  |

tabBar：首页 / 达人库 / 我的（纯文字，未配置图标）

## 分包 pages-common

| 路径                                 | 说明                                                     | 跳转参数                          |
| ------------------------------------ | -------------------------------------------------------- | --------------------------------- |
| `pages-common/kol-detail/kol-detail` | 达人详情：数据面板、带货商品分页列表、邀约合作、分享面板 | `?id={kolId}&share_user_id={uid}` |

页面私有组件：`pages-common/kol-detail/components/StatGrid.vue`

## 分包 pages-authorize

| 路径                                  | 说明                                                    |
| ------------------------------------- | ------------------------------------------------------- |
| `pages-authorize/login/login`         | 登录：一键登录 / 手机号快捷登录（仅微信）/ 先逛逛       |
| `pages-authorize/user-info/user-info` | 个人资料：头像（chooseAvatar / 相册兜底）、昵称、手机号 |

## 分包 pages-withdraw

| 路径                                             | 说明                                                      |
| ------------------------------------------------ | --------------------------------------------------------- |
| `pages-withdraw/withdraw/withdraw`               | 申请提现：金额校验、到账方式、提交                        |
| `pages-withdraw/withdraw-record/withdraw-record` | 提现记录：分页列表 + 30s 轮询（`onHide`/`onUnload` 清理） |

## 分包预加载

- `pages/dashboard/dashboard` → 预载 `pages-common`
- `pages/mine/mine` → wifi 下预载 `pages-authorize`、`pages-withdraw`

## 全局组件

| 组件         | 路径                                    | 用途                                                       |
| ------------ | --------------------------------------- | ---------------------------------------------------------- |
| `KolCard`    | `components/kol-card/KolCard.vue`       | 达人卡片，跨页面复用                                       |
| `SharePanel` | `components/share-panel/SharePanel.vue` | `uni-popup` 底部分享面板，`defineExpose` 暴露 `open/close` |
| `SafeArea`   | `components/safe-area/SafeArea.vue`     | 底部固定操作栏的 iPhone 横条适配                           |

## 页面私有组件

| 组件        | 所属页面                             |
| ----------- | ------------------------------------ |
| `StatPanel` | `pages/dashboard/dashboard`          |
| `FilterBar` | `pages/kol-list/kol-list`            |
| `StatGrid`  | `pages-common/kol-detail/kol-detail` |
