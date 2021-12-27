import React from 'react';
import * as d3 from "d3";
import { CircularProgress } from '@mui/material';
import { isEmpty } from 'lodash';
import APIService from '../../services/APIService';
import { BLUE } from '../../common/constants';
import './d3Tree.scss';

class ConceptHierarchyTree extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tree: {},
      isLoading: true,
      hasEntries: true,
    }
  }

  componentDidMount() {
    this.makeInitialTree()
  }

  getChildren = (concept, callback) => APIService
    .new()
    .overrideURL(concept.url)
    .appendToUrl('$cascade/')
    .get(null, null, {includeMappings: false, view: 'hierarchy'})
    .then(response => callback(response.data.entry));

  makeInitialTree = () => this.getChildren(this.props.concept, tree => {
    const data = JSON.parse(JSON.stringify(tree).replaceAll('entries', 'children'))
    this.setState({isLoading: false, tree: data, hasEntries: !isEmpty(data.children)}, () => {
      if(this.state.hasEntries)
        this.renderTree()
    })
  })

  renderTree = () => {
    const width = this.props.width || 960;
    const fontSize = this.props.fontSize || '16';
    const dx = this.props.dx || 30;
    const data = this.state.tree
    const margin = { top: 10, right: 120, bottom: 10, left: 120 };
    const root = d3.hierarchy(data);
    const dy = width / 6;
    const tree = d3.tree().nodeSize([dx, dy]);
    const diagonal = d3
      .linkHorizontal()
      .x(d => d.y)
      .y(d => d.x);

    root.x0 = dy / 2;
    root.y0 = 0;
    root.descendants().forEach((d, i) => {
      d.id = i;
      d._children = d.children;
      // if (d.depth && d.data.name.length !== 7) d.children = null;
    });

    tree(root);

    const svg = d3
      .create("svg")
      .attr("viewBox", [-margin.left, -margin.top, width, dx])
      .style("font", "10px sans-serif")
      .style("user-select", "none");

    const gLink = svg
      .append("g")
      .attr("fill", "none")
      .attr("stroke", "#555")
      .attr("stroke-opacity", 0.4)
      .attr("stroke-width", 1.5);

    const gNode = svg
      .append("g")
      .attr("cursor", "pointer")
      .attr("pointer-events", "all");

    update(root);

    document.querySelector("#treeWrapper").appendChild(svg.node());

    function update(source) {
      const duration = 250;
      const nodes = root.descendants().reverse();
      const links = root.links();

      // Compute the new tree layout.

      let left = root;
      let right = root;
      root.eachBefore((node) => {
        if (node.x < left.x) left = node;
        if (node.x > right.x) right = node;
      });

      const height = right.x - left.x + margin.top + margin.bottom;

      const transition = svg
        .transition()
        .duration(duration)
        .attr("viewBox", [-margin.left, left.x - margin.top, width, height])
        .tween(
          "resize",
          window.ResizeObserver ? null : () => () => svg.dispatch("toggle")
        );

      // Update the nodes…
      const node = gNode.selectAll("g").data(nodes, d => d.id);

      // Enter any new nodes at the parent's previous position.
      const nodeEnter = node
        .enter()
        .append("g")
        .attr("transform", () => `translate(${source.y0},${source.x0})`)
        .attr("fill-opacity", 0)
        .attr("stroke-opacity", 0)
        .on("click", (event, d) => {
          d.children = d.children ? null : d._children;
          update(d);
        });

      nodeEnter
        .append("circle")
        .attr("r", 4.5)
        .attr("fill", d => (d._children ? BLUE : "#999"))
        .attr("stroke-width", 10);

      nodeEnter
        .append("text")
        .attr("dy", "0.31em")
        .attr('font-size', `${fontSize}px`)
        .attr('fill', d => d._children ? BLUE : '#000')
        .attr("x", d => (d._children ? -6 : 6))
        .attr("text-anchor", d => (d._children ? "end" : "start"))
        .text(d => d.data.name)
        .clone(true)
        .lower()
        .attr("stroke-linejoin", "round")
        .attr("stroke-width", 3)
        .attr("stroke", "white");

      // Transition nodes to their new position.
      node
        .merge(nodeEnter)
        .transition(transition)
        .attr("transform", d => `translate(${d.y},${d.x})`)
        .attr("fill-opacity", 1)
        .attr("stroke-opacity", 1);

      // Transition exiting nodes to the parent's new position.
      node
        .exit()
        .transition(transition)
        .remove()
        .attr("transform", () => `translate(${source.y},${source.x})`)
        .attr("fill-opacity", 0)
        .attr("stroke-opacity", 0);

      // Update the links…
      const link = gLink.selectAll("path").data(links, d => d.target.id);

      // Enter any new links at the parent's previous position.
      const linkEnter = link
        .enter()
        .append("path")
        .attr("d", () => {
          const o = { x: source.x0, y: source.y0 };
          return diagonal({ source: o, target: o });
        });

      // Transition links to their new position.
      link.merge(linkEnter).transition(transition).attr("d", diagonal);

      // Transition exiting nodes to the parent's new position.
      link
        .exit()
        .transition(transition)
        .remove()
        .attr("d", () => {
          const o = { x: source.x, y: source.y };
          return diagonal({ source: o, target: o });
        });

      // Stash the old positions for transition.
      root.eachBefore(d => {
        d.x0 = d.x;
        d.y0 = d.y;
      });
    }
  }

  render() {
    const { isLoading, hasEntries } = this.state;
    return (
      <div className='col-xs-12 no-side-padding'>
        {
          isLoading &&
          <div style={{textAlign: 'center'}}><CircularProgress /></div>
        }
        {
          !isLoading && hasEntries &&
          <div id="treeWrapper" />
        }
        {
          !isLoading && !hasEntries &&
          <div style={{textAlign: 'left'}}>No entries found</div>
        }
      </div>
    )
  }
}

export default ConceptHierarchyTree;
