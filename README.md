# dsh-liquid-glass

Liquid-glass skin for the [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) web UI.

A single client plugin that redraws the shell as frosted glass: one shared light
field behind the whole window, a translucent sidebar and conversation panel, a
glass composer, glass cards, bubbles and modals.

![status](https://img.shields.io/badge/status-working-brightgreen)

---

## 效果 / What it does

| 区域 | 处理 |
|---|---|
| 窗口 | 整窗一张柔光壁纸（蓝 / 紫 / 青 / 粉），12px 圆角；Windows 自绘标题条改为半透明 |
| 侧边栏 | 磨砂玻璃：半透明底 + 顶部高光 + 右侧 1px 亮线 |
| 会话窗口 | 半透明 + 顶部高光 + 内侧细边 + 1px 外沿 |
| 输入框 | 玻璃卡片，圆形按钮带顶部反光（悬停保留） |
| 卡片 / 消息气泡 | 统一玻璃表面，沿用宿主各自的填充 token，只降低不透明度 |
| 设置弹窗 | 半透明面板 + 柔光；其遮罩本来就模糊背景，因此不额外加滤镜 |
| 轨迹页 | 清掉视图根、分栏、表格、时间线、工具栏的不透明底，透出会话玻璃 |

Dark and light palettes are handled separately; every surface is derived from the
host's own `--dsw-*` tokens, so a theme change stays consistent.

## 安装 / Install

本插件是一个 DSH **bundle**（`dsh.bundle.patch` + `dsh.client`），不是普通的 npm 依赖。

### 推荐：交给 DSH agent 安装

把本仓库克隆到本地任意目录，然后对 DSH 说：

> 用 `plugin_manager install_bundle` 安装 `<仓库目录>`。

它会完成 `pnpm add`、bundle 选择与激活，并给出 `application: applied`。

### 手动

```bash
git clone https://github.com/Stars-Twinkle/dsh-liquid-glass.git
```

然后在 DSH 的插件管理里指向该目录安装。安装后刷新页面（Ctrl+R）即可看到效果。

## 卸载 / Uninstall

插件管理里禁用或移除即可。样式由 `ctx.effect` 随插件卸载自动清理，界面立刻回到原样。

## 设计约束 / Design notes

这些约束是为了「不写崩」而刻意选择的：

1. **只改绘制属性。** 背景、圆角、阴影、滤镜、伪元素。`display`、`grid-template-columns`、`height`、`overflow`、滚动容器、拖拽手柄一律不动。
2. **玻璃压在负层。** 每个玻璃面都是 `isolation: isolate` 容器上的 `::before { z-index: -1 }`。定位伪元素若用默认 `z-index: auto` 会绘制在行内文字之上，把内容糊掉——这是这类皮肤最容易翻车的地方。
3. **`backdrop-filter` 只加在没有子节点的伪元素上。** 会话里存在 `position: fixed` 的浮层（ContextMeter），把滤镜加在容器上会把它变成该浮层的包含块，弹层位置直接错位。
4. **不依赖哈希类名。** 选择器只用 `#root`、`[data-slot="main.conversation"]`、`[data-phase]`、`[data-composer-card]`、`[data-shortcut-modal="settings"]` 这类稳定锚点；卡片类则按 CSS Modules 的**局部名后缀**（`_card`、`Card`、`_bubble`）匹配——哈希前缀随构建变化，局部名不会。
5. **列宽动画期间暂停模糊。** 收缩侧栏时列宽逐帧变化，`backdrop-filter` 每帧重算会拖垮过渡；`[data-animating]` / `[data-dragging]` 状态下自动关闭。

## 已知限制 / Limitations

- **窗口右上角的最小化 / 最大化 / 关闭按钮改不了。** 它们由 Electron 的 `titleBarOverlay` 交给系统绘制，不在网页文档里，CSS 选不到。开关在主进程的 `setTitleBarOverlay({ color, symbolColor })`。
- 插件跟随宿主 DOM 结构。Harness 大改布局时可能部分失效（表现为退回原样，不会破坏布局）。
- 磨砂强度、壁纸配色、各表面的不透明度都写死在 `client.js` 顶部的 `CSS` 模板里，改这几行即可调整。

## License

MIT © Stars-Twinkle
