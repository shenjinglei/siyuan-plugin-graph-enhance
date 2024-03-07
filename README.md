[中文](https://github.com/shenjinglei/siyuan-plugin-graph-enhance/blob/main/README_zh_CN.md)

# Graph Enhance

## Get Start

After enabling this plug-in, a sidebar will be added in the right top corner. After opening the sidebar, click the function button in the right top corner. The plug-in will draw a diagram according to the current document and display it in the sidebar.

For example, If you link note A with note B, C and D. The relation graph drawn by Siyuan looks like the picture in left side. While the relation graph drawn by this plugin looks like the picture in right side.

![pic1](https://z1.ax1x.com/2023/10/20/piFpacQ.png) ![pic2](https://z1.ax1x.com/2023/10/20/piFpN9S.png)

## Changelog

- v0.4.2
  - add show/hide dailynote button
- v0.4.1
  - add path graph
- v0.4.0
  - remove sunburst and tail graph
  - adjust edge sparation
- v0.3.6
  - add color to lines
    - The color lines start at the starting point and ends at the end of the branch, Like a mind map.
      ![](https://z1.ax1x.com/2023/12/07/pig5hc9.png)
- v0.3.5
  - [#10](https://github.com/shenjinglei/siyuan-plugin-graph-enhance/issues/10) Changed the icon.
  - Adjusted label width.
- v0.3.4
  - Added nodes color of same level.
- v0.3.3
  - Added Long Tail Graph
  - Added setting of node exclusion
- v0.3.2
  - Improved the feature of automatic following the current note. Need siyuan version 2.10.13.
- v0.3.1
  - The maximum number of nodes limit applies to all graphs.
  - dailynote applies as separating nodes.
- v0.3.0
  - Added a function that separates the graph.
- v0.2.0
  - Added Source Graph
  - Added Sink Graph
  - Added Neighbor Graph
  - Added V&H Graph
- v0.1.0
  - draw global graph
  - draw vertical graph
  - draw horizontal graph

more details in [CHANGELOG](./CHANGELOG.md)

### Manuals

- [Manual in Chinese](https://ld246.com/article/1696579047798)

## Planning

- [ ] Layout
- [ ] Color

## Feedback

- [github issue](https://github.com/shenjinglei/siyuan-plugin-graph-enhance/issues)

## Sponsor

- [胖头鱼](https://afdian.net/a/shenjinglei)

## Acknowledge

- [Dagre](https://github.com/dagrejs/dagre) Dagre is a JavaScript library that makes it easy to lay out directed graphs on the client-side.
- [Apache ECharts](https://echarts.apache.org/en/index.html) An Open Source JavaScript Visualization Library
- [Plugin Sample](https://github.com/siyuan-note/plugin-sample) A code sample which this plugin base on
