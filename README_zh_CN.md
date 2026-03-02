[English](https://github.com/shenjinglei/siyuan-plugin-graph-enhance/blob/main/README.md)

![GitHub release](https://img.shields.io/github/v/release/shenjinglei/siyuan-plugin-graph-enhance)
![GitHub Release Date](https://img.shields.io/github/release-date/shenjinglei/siyuan-plugin-graph-enhance)
![License](https://img.shields.io/badge/license-AGPL--3.0-blue)
![Last commit](https://img.shields.io/github/last-commit/shenjinglei/siyuan-plugin-graph-enhance)
![Repo size](https://img.shields.io/github/repo-size/shenjinglei/siyuan-plugin-graph-enhance)
![Downloads](https://img.shields.io/github/downloads/shenjinglei/siyuan-plugin-graph-enhance/total)

# 关系图增强

## 快速开始

启用插件后，右上方会出现侧边栏入口。打开侧边栏，点击顶部功能按钮，即可在侧边栏中绘制对应的关系图。

例如，在笔记`a`中引用了笔记`b`、`c`和`d`，思源笔记的关系图如左图所示，本插件绘制的关系图如右图所示。

![pic1](https://z1.ax1x.com/2023/10/20/piFpacQ.png) ![pic2](https://z1.ax1x.com/2023/10/20/piFpN9S.png)

本插件更突出层次关系。

## 功能更新

- v0.5.0
  - NEW：字体及字号设置
  - NEW：全屏模式

详细更新日志请查看[CHANGELOG](./CHANGELOG.md)

## 功能说明

### 基本图

上文关系图可归纳为三种基本形式：展示跨层关系的纵向图、同层关系的横向图，以及全局关系图。

![pic3](https://z1.ax1x.com/2023/10/20/piFScyd.png)

- 以当前文档为起始点（图中以红色标记），其关联节点以蓝色标记。
- 可在设置中调整布局方向、布局方式、节点数量上限等。

### 邻近图

- 从起始点出发，经指定跳数可达的节点所构成的图。
- 可在设置中调整跳数。

### 纵横图

- 纵向图与横向图合并后的图。

### 图分割

当关系图节点过多时，可按以下方式对图进行分割。

#### 点分割

假设有如下关系图，起始点（当前文档）为 `b`：`b` 的层数为 0，`b` 正链指向的文档 `c`、`c1`、`c2` 为 1，反链指向的文档 `a` 为 -1。

![](https://s11.ax1x.com/2023/12/13/pif626I.png)

若要在节点 `c`、`c1`、`c2` 处分割图形，只需在文档 `b` 中引用 `ge-cv1` 即可。

![](https://s11.ax1x.com/2023/12/13/pifcd3j.png)

同理，在文档 `a` 中引用 `ge-cv2` 也可达到相同效果。

分割后，以 `b` 为起点的图将不再绘制 `c`、`c1`、`c2` 之后的节点，效果如下。

![](https://s11.ax1x.com/2023/12/13/pifcRC4.png)

以 `d` 为起点的图则不再绘制 `c`、`c1`、`c2` 之前的节点，关系图已被分割。

![](https://s11.ax1x.com/2023/12/13/pifchvR.png)

以 `c` 为起点的图会同时包含分割线两侧的部分。

![](https://s11.ax1x.com/2023/12/13/pifcHUO.png)

#### 边分割

假设有如下关系图，起始点（当前文档）为 `b`，那么 `b` 的正链 `b-c`、`b-c1`、`b-c2` 为 1，反链 `b-a` 为 -1，以此类推。

![](https://s11.ax1x.com/2023/12/13/pifgFPg.png)

若要分割边 `c-d`、`c1-d`、`c2-d`，可在文档 `b` 中引用 `ge-ce2`（或在文档 `a` 中引用 `ge-ce3`）。

![](https://s11.ax1x.com/2023/12/13/pifgcLt.png)

分割后，以 `b` 为起点的图中将不再绘制边 `c-d`、`c1-d`、`c2-d`，效果如下。

![](https://s11.ax1x.com/2023/12/13/pifg2eP.png)

以 `e` 为起点的图中同样不会绘制上述三条边。

![](https://s11.ax1x.com/2023/12/13/pifISNq.png)

以 `c` 为起点的图则会绘制边 `c-d`。

![](https://s11.ax1x.com/2023/12/13/pifICCV.png)

- 以分割点或分割边上的节点为起点时，可跨越分割线，同时看到两侧内容。

### 其他

- 点击节点可跳转到对应笔记。
- 可在设置中开启「跟随当前文档」，使笔记与关系图联动。
- 建议将复杂配置另行备份，以免丢失。

### 一些实践

- [笔记可视化 - 关系图增强插件的使用](https://ld246.com/article/1696579047798)
- [关于关系图增强插件](https://ld246.com/article/1702042778713)

## 未来计划

- [ ] 布局优化
- [x] 颜色区分

## 反馈

如有问题或建议，可通过 [GitHub Issue](https://github.com/shenjinglei/siyuan-plugin-graph-enhance/issues) 反馈；若无法访问 GitHub，可使用 [Gitee Issue](https://gitee.com/shenjinglei/siyuan-plugin-graph-enhance/issues)。

## 赞助

[胖头鱼](https://afdian.com/a/shenjinglei)

## 感谢

- 本项目使用了[Dagre](https://github.com/dagrejs/dagre)进行有向图布局计算。
- 本项目使用了[Apache ECharts](https://echarts.apache.org/en/index.html)绘制图形。
- 本项目使用了[Color.js](https://github.com/color-js/color.js)进行颜色混合计算。
- 本项目为[siyuan](https://github.com/siyuan-note/siyuan)插件，已在思源集市上架。
