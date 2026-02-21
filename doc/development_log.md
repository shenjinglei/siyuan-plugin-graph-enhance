# 开发日志

本文档记录开发过程中的重要变更与约定，便于后续开发与 AI 协作时快速了解项目。

---

## 开发记录

### 2026-02-21 测试框架（Vitest） #31

- Issue: https://github.com/shenjinglei/siyuan-plugin-graph-enhance/issues/31

- **选用 Vitest**：与 TypeScript 开箱即用、运行快、API 与 Jest 兼容、便于 mock；项目为 webpack/CommonJS，Vitest 单独跑测试不参与打包。
- **配置**：`vitest.config.ts` 中 `environment: "node"`、`include: ["src/**/*.test.ts"]`；通过 `resolve.alias` 将 `siyuan` 指向 `src/__mocks__/siyuan.ts`，避免在测试环境解析思源包。
- **graph 测试**：`src/__tests__/graph.test.ts` 覆盖 `setSourceNode`/`sourceNode`、`setGraphType`、`title`、`initRawGraph`（建图、dailynote 标记、排除节点）、`Display`（调用 `draw` / 源不在图内不调用）、`setIsDailynote`/`isDailynote`。对 `utils`、`settings`、`renderer` 使用 `vi.mock`，保证不依赖真实插件/DOM。

### 2026-02-16 代码结构重构 #21

- Issue: https://github.com/shenjinglei/siyuan-plugin-graph-enhance/issues/21

- **类型集中**（`src/types.ts`）
  - 新增 `GraphType`、`SiyuanNode`、`SiyuanEdge`、`QueueItem`、`SettingKey`，图类型与设置键统一用类型约束。
- **常量与配置**（`src/constants.ts`）
  - 新增 `GRAPH_TYPES`、`GRAPH_API_CONF`（拉取关系图的 API 请求体），便于修改与扩展。
- **设置与入口**
  - 默认配置抽到 `settings.ts` 的 `DEFAULT_SETTINGS`，`getSetting(name: SettingKey)` 做类型安全；`index.ts` 仅做合并与初始化。
- **Dock**
  - `refreashGraph` 更正为 `refreshGraph`；图类型按钮统一用 `handleGraphButton(graphType)`；`getDocid` 改为 `getDocId`。
- **图逻辑**（`graph.ts`）
  - 使用 `types.ts` 中的类型；`createGraph(type: GraphType)` 返回具体图类，便于扩展新图类型。
- **工具与渲染**
  - `getThemeMode()` 移至 `utils.ts`；renderer 中 `draw` 的 links 与 `DagreOutput` 的 edge value 类型一致。


---

## 项目结构（简要）

| 文件 | 职责 |
|------|------|
| `src/index.ts` | 插件入口；加载/合并默认设置；`setPlugin`、`initDock`、`settingInit` |
| `src/dock.ts` | 侧栏 UI、图类型按钮、刷新、日记开关、`autoFollow`、`getDocId`、`refreshGraph` |
| `src/graph.ts` | 图状态与遍历；`Display`、`initRawGraph`、各图类型类、`createGraph(GraphType)` |
| `src/renderer.ts` | ECharts 初始化与 `draw(DagreOutput)`、节点/边颜色与主题 |
| `src/settings.ts` | `DEFAULT_SETTINGS`、`getSetting(SettingKey)`、设置面板表单项 |
| `src/types.ts` | `GraphType`、`SiyuanNode`/`SiyuanEdge`、`QueueItem`、`DagreOutput`、`DagreNodeValue`、`SettingKey` |
| `src/constants.ts` | `GRAPH_TYPES`、`GRAPH_API_CONF` |
| `src/utils.ts` | `plugin`/`i18n`/`rawGraph`、`getThemeMode`、`STORAGE_NAME` |
| `src/i18n/*.json` | 多语言文案 |
| `src/__tests__/*.test.ts` | Vitest 单测（当前主要为 graph） |
| `src/__mocks__/siyuan.ts` | 测试用 siyuan 桩，供 `resolve.alias` 使用 |

---

## 扩展指南

- **新增图类型**
  1. 在 `types.ts` 的 `GraphType` 中增加联合类型。
  2. 在 `graph.ts` 中新增对应 `XxxGraph` 类并实现 `exec()`，在 `createGraph()` 的 switch 中增加分支。
  3. 在 `dock.ts` 中增加按钮并绑定 `handleGraphButton("新类型")`；如需新 i18n，在 `src/i18n/*.json` 与模板中使用。
- **新增设置项**
  1. 在 `types.ts` 的 `SettingKey` 中增加键名。
  2. 在 `settings.ts` 的 `DEFAULT_SETTINGS` 中增加默认值，并在设置面板中增加表单项与 `confirmCallback` 中的保存逻辑。
  3. 在 `graph.ts` 或其它使用处通过 `getSetting("新键")` 读取。
- **修改关系图 API 请求**
  - 只改 `constants.ts` 中的 `GRAPH_API_CONF` 即可。

---

## 开发命令

- `pnpm install`：安装依赖
- `pnpm run dev`：开发构建（watch 模式，编译成功后会有 "Watching for file changes..."）
- `pnpm run build`：生产构建并打包
- `pnpm test`：运行 Vitest 单测（单次）
- `pnpm run test:watch`：Vitest watch 模式

---

## 约定与注意

- **类型**：图类型、设置键、API 请求体等尽量用 `types.ts` / `constants.ts` 集中定义，避免魔法字符串。
- **命名**：函数名与变量使用清晰英文（如 `refreshGraph`、`getDocId`、`handleGraphButton`）。
- **维护本文档**：每次做结构性变更、新增/删除模块或扩展点时，在「开发记录」中追加日期与简要说明，并视情况更新「项目结构」或「扩展指南」。
