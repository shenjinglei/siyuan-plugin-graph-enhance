[English](https://github.com/shenjinglei/siyuan-plugin-graph-enhance/blob/main/README.md)

# 关系图增强

## 开始

启用本插件后，会在右上方添加一个侧边栏按钮，打开侧边栏后点击上方的功能按钮，会在侧边栏中绘制相应的关系图。
例如，在笔记【a】中引用了笔记【b】、【c】和【d】，思源笔记会绘制如下关系图：

![pic1](https://z1.ax1x.com/2023/10/20/piFpacQ.png)

而本插件会绘制如下关系图，更突出一种层次关系：

![pic2](https://z1.ax1x.com/2023/10/20/piFpN9S.png)

## 功能说明

### 基本图

对于上文的关系图，可以分类成以下 3 种基本形式：展示跨层次间关系的纵向图、展示同层次间关系的横向图，和全局关系图。

![pic3](https://z1.ax1x.com/2023/10/20/piFScyd.png)

绘制过程由一个起始点开始，即当前文档，在图中用红色标记；其他链接到的点用蓝色标记。

### 起点/终点图

起点/终点图会从起点（即没有被其他笔记引用）或终点（即没有引用其他笔记）开始绘制旭日图。如下图所示。

![](https://z1.ax1x.com/2023/10/20/piF9dPK.jpg)

### 邻近图

从起始点开始，经过特定次链接可达的点所绘制的图。

### 纵横图

纵向图和横向图合并后的图。也是一开始的默认图。

### 一些实践

- [笔记可视化 - 关系图增强插件的使用](https://ld246.com/article/1696579047798)

## 更新日志

[CHANGELOG](./CHANGELOG.md)

## 未来计划

- [ ] 布局优化
- [ ] 颜色区分

## 反馈

如果有问题、建议等可通过[github issue](https://github.com/shenjinglei/siyuan-plugin-graph-enhance/issues)反馈。
若无法访问也可以通过[gitee issue](https://gitee.com/shenjinglei/siyuan-plugin-graph-enhance/issues)反馈。

## 赞助

[胖头鱼](https://afdian.net/a/shenjinglei)

## 感谢

- 本插件使用了[Dagre](https://github.com/dagrejs/dagre)进行有向图布局计算
- 本插件使用了[Apache ECharts](https://echarts.apache.org/en/index.html)绘制图形
- [siyuan](https://github.com/siyuan-note/siyuan)
