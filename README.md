[中文](https://github.com/shenjinglei/siyuan-plugin-graph-enhance/blob/main/README_zh_CN.md)

# Graph Enhance

## Get Start

After enabling this plug-in, a sidebar will be added in the right top corner. After opening the sidebar, click the function button in the right top corner. The plug-in will draw a diagram according to the current document and display it in the sidebar.
For example, select "Start here" in the Siyuan User Guide, and then click the "Global" button in "Diagram Enhance". The resulting relationship diagram is shown in the figure below:
![preview](https://github.com/shenjinglei/siyuan-plugin-graph-enhance/raw/main/preview.png)

## Graph Classification

- Global
  - from the current node, all reachable nodes are collected with ignoring the direction of the edge
- Vertical
  - from the current node，all reachable nodes are collected with all dege are forward or reverse.
- Horizontal
  - from the current node，all reachable nodes are collected with one forward edge and a reverse edge.

## Settings

- Layout Dirction
  - Left to Right
  - Right to Left
  - Top Down
  - Bottom Up
- Layout Algorithm
  - network-simplex
  - tight-tree
  - longest-path

## Changelog

- v0.0.1
  - Basic function

## Planning

- [ ] Color
- [ ] Jump to note

## Acknowledge

- [Dagre](https://github.com/dagrejs/dagre) Dagre is a JavaScript library that makes it easy to lay out directed graphs on the client-side.
- [Apache ECharts](https://echarts.apache.org/en/index.html) An Open Source JavaScript Visualization Library
- [Plugin Sample](https://github.com/siyuan-note/plugin-sample) A code sample which this plugin base on
