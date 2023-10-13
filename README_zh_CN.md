[English](https://github.com/shenjinglei/siyuan-plugin-graph-enhance/blob/main/README.md)

# 关系图增强

## 开始

启用本插件后，会在右上方添加一个侧边栏按钮，打开侧边栏后点击右上方的功能按钮，本插件会根据当前文档绘制关系图并展示在该侧边栏中。

例如，选中思源用户指南中的【请从这里开始】，再点击【关系图增强】中的【全局图】按钮，得到的关系图如示例图所示。

使用说明：[笔记可视化 - 关系图增强插件的使用](https://ld246.com/article/1696579047798)

## 功能说明

- 生成全局图：从当前文档开始所有有关系的文档的关系图
- 生成纵向图：见使用说明
- 生成横向图：见使用说明
- 点击节点跳转至文档
- 关系图设置

## 更新日志

- 0.1.6
  - 增加了未获取到当前文档的提示
- 0.1.5
  - 修复 Bug
- 0.1.4
  - 修复 Bug: 设置未能正确初始化
- 0.1.3
  - 修复 Bug：全局图不能绘制
  - 设置：全局图最大节点数
- 0.1.2
  - 点击跳转
- 0.1.1
  - 设置：可排除 dailynote
- 0.1.0
  - 基本功能

## 未来计划

- [x] 点击跳转
- [ ] 全局图排除节点
- [ ] 附近图
- [ ] 色彩

欢迎提 ISSUE 反馈，及爱发电赞助

## 感谢

- [Dagre](https://github.com/dagrejs/dagre)
  - 用于本插件的有向图布局计算
- [Apache ECharts](https://echarts.apache.org/en/index.html)
  - 用于本插件的图可视化展示
- [思源笔记插件示例](https://github.com/siyuan-note/plugin-sample)
  - 本插件基于官方插件模板开发
