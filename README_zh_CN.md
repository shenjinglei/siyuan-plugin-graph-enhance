[English](https://github.com/shenjinglei/siyuan-plugin-graph-enhance/blob/main/README.md)

# 关系图增强

## 开始

启用本插件后，会在左下方添加一个侧边栏，打开侧边栏后点击右上方的功能按钮，插件会根据当前文档（需要选中当前文档 tab 页）绘制关系图并展示在该侧边栏中。
例如，选中思源用户指南中的【请从这里开始】，再点击【关系图增强】中的【全局图】按钮。得到的关系图如下图所示：
![预览图](https://github.com/shenjinglei/siyuan-plugin-graph-enhance/blob/main/preview.png)

## 生成子图分类

- 全局图
  - 自当前节点开始，所有正链、反链可达的节点集合
- 纵向图
  - 自当前节点开始，路径全是正链或全是反链的节点集合
- 横向图
  - 自当前节点开始，经过一次正链和一次反链可达的节点集合

## 设置

- 布局方向
  - 从左向右
  - 从右向左
  - 自顶向下
  - 自底向上
- 布局算法
  - 网络简单
  - 紧密树
  - 最长路径

## 更新日志

- v0.0.1
  - 基本功能

## 未来计划

- [ ] 色彩
- [ ] 点击跳转

## 感谢

- [Dagre](https://github.com/dagrejs/dagre)
  - 用于本插件的有向图布局计算
- [Apache ECharts](https://echarts.apache.org/en/index.html)
  - 用于本插件的图可视化展示
- [思源笔记插件示例](https://github.com/siyuan-note/plugin-sample)
  - 本插件基于官方插件模板开发
