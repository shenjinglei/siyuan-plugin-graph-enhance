[中文](https://github.com/shenjinglei/siyuan-plugin-graph-enhance/blob/main/README_zh_CN.md)

# Graph Enhance

## Quick Start

After enabling the plugin, a sidebar entry appears in the top-right. Open the sidebar and click the function buttons at the top to draw the corresponding relation graph in the sidebar.

For example, if note `a` references notes `b`, `c`, and `d`, the left image shows Siyuan’s relation graph and the right shows the graph drawn by this plugin.

![pic1](https://z1.ax1x.com/2023/10/20/piFpacQ.png) ![pic2](https://z1.ax1x.com/2023/10/20/piFpN9S.png)

This plugin emphasizes hierarchy in the graph.

## Changelog

- v0.4.3
  - Documentation: updated README with full feature description and polished wording; sponsor URL fix
- v0.4.2
  - Add show/hide Daily Note button
- v0.4.1
  - New: Path graph
    - Draw path between two nodes
    - **Start & end**: With auto-follow on, click "Start" then "End" then "Path graph"; with auto-follow off, click "Start" → "Path graph" → "End" → "Path graph".
- v0.4.0
  - Graph separation no longer configured in plugin settings; reference specific docs in your notes instead. See feature description.
  - Source graph, sink graph, and long-tail graph moved to the "Note Sunburst" plugin.
- v0.3.6
  - Add colors to edges
    - Colored edges run from the start node to the end of each branch, like a mind map.
      ![](https://z1.ax1x.com/2023/12/07/pig5hc9.png)
- v0.3.5
  - [#10](https://github.com/shenjinglei/siyuan-plugin-graph-enhance/issues/10) Updated sidebar icon.
  - Adjusted label width.
- v0.3.4
  - Added color for nodes at the same level as the start.
- v0.3.3
  - New: Long tail graph
  - New setting: Exclude nodes
  - Edge separation: start node only sees adjacent nodes
- v0.3.2
  - Improved auto-follow of current document. Requires Siyuan 2.10.13+.
- v0.3.1
  - Max node limit applies to all graphs.
  - Daily note used as separation node by default.
- v0.3.0
  - New: Graph separation
- v0.2.0
  - New: Source graph, sink graph, neighbor graph, V&H graph
- v0.1.0
  - New: Vertical graph, horizontal graph, global graph

See [CHANGELOG](./CHANGELOG.md) for full history.

## Feature Description

### Basic Graphs

The relation graph above can be described as three basic types: vertical graph (cross-level relations), horizontal graph (same-level relations), and global graph.

![pic3](https://z1.ax1x.com/2023/10/20/piFScyd.png)

- The current document is the start node (red); linked nodes are blue.
- Layout direction, layout mode, and max node count can be adjusted in settings.

### Neighbor Graph

- Graph of nodes reachable from the start within a given number of hops.
- Hop count is configurable in settings.

### V&H Graph

- Combination of vertical and horizontal graphs.

### Graph Separation

When a graph has too many nodes, you can split it as follows.

#### Node Separation

Suppose the current document is `b`: `b` is at level 0; forward links `c`, `c1`, `c2` are at level 1; backlink `a` is at level -1.

![](https://s11.ax1x.com/2023/12/13/pif626I.png)

To split at nodes `c`, `c1`, `c2`, add a reference to `ge-cv1` in document `b`.

![](https://s11.ax1x.com/2023/12/13/pifcd3j.png)

You can also add a reference to `ge-cv2` in document `a` for the same effect.

After separation, a graph starting from `b` no longer draws nodes beyond `c`, `c1`, `c2`:

![](https://s11.ax1x.com/2023/12/13/pifcRC4.png)

A graph starting from `d` no longer draws nodes before `c`, `c1`, `c2`; the graph is split.

![](https://s11.ax1x.com/2023/12/13/pifchvR.png)

A graph starting from `c` includes both sides of the split.

![](https://s11.ax1x.com/2023/12/13/pifcHUO.png)

#### Edge Separation

With start `b`, forward edges `b-c`, `b-c1`, `b-c2` are at level 1 and backlink edge `b-a` at -1, and so on.

![](https://s11.ax1x.com/2023/12/13/pifgFPg.png)

To split edges `c-d`, `c1-d`, `c2-d`, add a reference to `ge-ce2` in document `b` (or `ge-ce3` in document `a`).

![](https://s11.ax1x.com/2023/12/13/pifgcLt.png)

After separation, a graph starting from `b` no longer draws edges `c-d`, `c1-d`, `c2-d`:

![](https://s11.ax1x.com/2023/12/13/pifg2eP.png)

A graph starting from `e` also omits those three edges.

![](https://s11.ax1x.com/2023/12/13/pifISNq.png)

A graph starting from `c` still draws edge `c-d`.

![](https://s11.ax1x.com/2023/12/13/pifICCV.png)

- Graphs starting from a separation node or an endpoint of a separation edge can cross the split and show both sides.

### Other

- Click a node to jump to the corresponding note.
- Enable "Follow current document" in settings to keep the graph in sync with the note.
- Consider backing up complex settings to avoid loss.

### Guides

- [Note visualization – using the Graph Enhance plugin](https://ld246.com/article/1696579047798) (Chinese)
- [About the Graph Enhance plugin](https://ld246.com/article/1702042778713) (Chinese)

## Future Plans

- [ ] Layout improvements
- [x] Color distinction

## Feedback

For questions or suggestions, use [GitHub Issues](https://github.com/shenjinglei/siyuan-plugin-graph-enhance/issues). If GitHub is not accessible, use [Gitee Issues](https://gitee.com/shenjinglei/siyuan-plugin-graph-enhance/issues).

## Sponsor

[胖头鱼](https://afdian.com/a/shenjinglei)

## Thanks

- [Dagre](https://github.com/dagrejs/dagre) for directed graph layout.
- [Apache ECharts](https://echarts.apache.org/en/index.html) for rendering the graph.
- [Color.js](https://github.com/color-js/color.js) for color blending.
- This is a [Siyuan](https://github.com/siyuan-note/siyuan) plugin and is available in the Siyuan marketplace.
