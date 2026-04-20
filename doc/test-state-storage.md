# 双存储策略与状态结构重设计

## 当前结论

插件继续采用双存储策略，但运行态图状态的结构已重新设计为带版本号的语义化对象：

- `graph-enhance-config`: 保留现有用户设置
- `graph-enhance-graph-state`: 持久化图视图运行态状态

这次重构不包含旧状态数据迁移，因为该结构尚未正式上线。

## 新状态结构

```typescript
interface GraphPersistedState {
   version: 1;
   view: {
      mode: GraphType;
   };
   filters: {
      hideDailyNotes: boolean;
   };
}
```

### 设计理由

1. `version` 为未来升级逻辑预留入口。
2. `view.mode` 明确表示当前图展示模式，比 `graphType` 更符合持久化语义。
3. `filters.hideDailyNotes` 明确表示过滤条件，比 `isHideDailynote` 更清晰。
4. 后续如需保存节点位置，建议增加 `layout.nodePositions`，而不是继续在根对象追加扁平字段。

## 实现范围

### 已包含

1. 新状态存储 key 设计。
2. 状态对象版本号设计。
3. 当前已持久化字段的语义化重命名。
4. 统一的状态标准化逻辑，确保读取时总能得到完整默认值。

### 未包含

1. 旧 `graph-enhance-state` 到新结构的迁移逻辑。
2. 节点位置持久化实现。
3. 设置存储 `graph-enhance-config` 的结构调整。

## 后续扩展建议

如果后续需要保存节点位置，推荐扩展为：

```typescript
interface GraphPersistedState {
   version: 1 | 2;
   view: {
      mode: GraphType;
   };
   filters: {
      hideDailyNotes: boolean;
   };
   layout?: {
      nodePositions?: Record<string, { x: number; y: number }>;
   };
}
```

届时可基于 `version` 增加升级逻辑。
