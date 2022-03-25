import React from 'react';
import {
  hierarchy as d3Hierarchy,
  tree as d3Tree,
  linkHorizontal as d3LinkHorizontal,
}  from "d3";
import * as d3Selection from 'd3-selection';
import { tip as d3tip } from "d3-v6-tip";
import { CircularProgress } from '@mui/material';
import { isEmpty, get, reject, find, merge, isEqual, orderBy, filter, isArray } from 'lodash';
import APIService from '../../services/APIService';
import { BLUE } from '../../common/constants';
import { getRandomColor, getWidthOfText } from '../../common/utils';
import './d3Tree.scss';

const HIERARCHY_CHILD_REL = '-haschild-'

class ConceptHierarchyTree extends React.Component {
  constructor(props) {
    super(props);
    this.availableColors = [
      '#c10e75', '#57bdd4', '#4b24f5', '#2f6c81', '#ef8fa7', '#762bff', '#e45a44', '#105274', '#d1cc49',
      '#846413', '#c96d8f', '#645304', '#dc9416', '#f979e3', '#422b9c', '#f59f0f', '#1a4d0a', '#b3406d',
      '#bd09d1', '#d914b2', '#41c3bb'
    ]
    this.colors = {
      "default": '#555',
    }
    this.state = {
      tree: {},
      isLoading: true,
      hasEntries: true,
    }
  }

  generateColor = item => {
    const key = item.map_type || "default"
    const cleanKey = key.replaceAll(' ', '').replaceAll('-', '').toLowerCase()
    const existingColor = get(this.colors, cleanKey)
    if(existingColor)
      return existingColor
    const newColor = this.availableColors.length > 0 ? this.availableColors.pop() : getRandomColor()
    this.colors[cleanKey] = newColor
    return newColor
  }

  componentDidMount() {
    this.makeInitialTree()
  }

  componentDidUpdate(prevProps) {
    if(!isEqual(prevProps.filters, this.props.filters))
      this.setState({isLoading: true}, this.makeInitialTree)
  }

  getChildren = (concept, callback) => APIService
    .new()
    .overrideURL(concept.url)
    .appendToUrl('$cascade/')
    .get(null, null, merge({view: 'hierarchy'}, (this.props.filters || {})))
    .then(response => callback(response.data.entry));

  makeInitialTree = () => this.getChildren(this.props.concept, tree => {
    const data = JSON.parse(JSON.stringify(tree).replaceAll('entries', 'children'))
    data.target_source = this.getSourceName(data)
    this.setState({isLoading: false, tree: data, hasEntries: !isEmpty(data.children)}, () => {
      if(this.state.hasEntries) {
        this.renderTree()
        setTimeout(this.positionTree, 200)
      }
    })
  })

  positionTree = () => {
    const svg = document.getElementById('hierarchy-tree')
    const box = svg.getBBox()
    svg.viewBox.baseVal.width = box.width - box.x + 100
  }

  getSourceName = (data, urlKey) => {
    if(data.target_source_name && data.target_source_owner)
      return `${data.target_source_owner} / ${data.target_source_name}`

    const key = urlKey || 'url'

    if(!get(data, key))
      return ''
    const urlParts = data[key].split('/')
    const ownerName = urlParts[2]
    const sourceName = urlParts[4]
    return `${ownerName} / ${sourceName}`
  }

  formatChildren = (children) => {
    if(!children || isEmpty(children))
      return children

    let result = []
    children.forEach(child => {
      if(!child.data.map_type) {
        child.data.map_type = this.getMapType(child)
        child.data.target_source = this.getSourceName(child.data)
      }
      if(!child.data.target_concept_url)
        result.push(child)
      if(child.data.target_concept_url && !find(children, c => c.data.url === child.data.target_concept_url && c.data.type === 'Concept')) {
        child.data.target_source = this.getSourceName(child.data, 'target_concept_url')
        result.push(child)
      }
    })
    const hierarchicalNodes = orderBy(filter(result, node => node.data.map_type === HIERARCHY_CHILD_REL), 'data.map_type')
    const nonHierarchicalNodes = orderBy(reject(result, node => node.data.map_type === HIERARCHY_CHILD_REL), 'data.map_type')
    return [...hierarchicalNodes, ...nonHierarchicalNodes]
  }

  getMapType = node => {
    if(node.data.map_type)
      return node.data.map_type
    const siblings = get(node, 'parent.allChildren', [])
    const mappingForConcept = find(siblings, sibling => sibling.data.target_concept_url === node.data.url)
    return mappingForConcept ? mappingForConcept.data.map_type : HIERARCHY_CHILD_REL;
  }

  existsInOCL = node => Boolean(node.data.type === 'Concept' || (node.data.type === 'Mapping' && node.data.target_concept_url))

  renderTree = () => {
    const width = this.props.width || 960;
    const fontSize = this.props.fontSize || '16';
    const dx = this.props.dx || 60;
    const data = this.state.tree
    const margin = { top: 40, right: 120, bottom: 10, left: 300 };
    const root = d3Hierarchy(data);
    const dy = width / 6;
    const tree = d3Tree().nodeSize([dx, dy]);
    const linkMultiplier = 1.3
    const diagonal = d3LinkHorizontal().x(d => d.y * linkMultiplier).y(d => d.x);

    root.x0 = dy / 2;
    root.y0 = 0;
    root.descendants().forEach((d, i) => {
      d.id = i;
      if(!d.data.map_type)
        d.data.mapType = this.getMapType(d)
      d.allChildren = d.children
      const newChildren = this.formatChildren(d.children)
      if(isArray(newChildren) && newChildren.length === 0)
        d.children = null
      else
        d.children = newChildren
      d._children = d.children
    });

    tree(root);

    const svg = d3Selection
      .select('body')
      .append("svg")
      .attr("id", 'hierarchy-tree')
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

    update(root, this);

    document.querySelector("#treeWrapper").appendChild(svg.node());

    function update(source, that) {
      const duration = 150;
      const nodes = root.descendants().reverse();
      const links = root.links();

      // Compute the new tree layout.

      let left = root;
      let right = root;
      root.eachBefore(node => {
        if (node.x < left.x) left = node;
        if (node.x > right.x) right = node;
      });
      const height = right.x - left.x + margin.top + margin.bottom;
      const marginLeft = getWidthOfText(root.data.display_name, 'sans-serif', `${fontSize}px`) || margin.left
      const transition = svg
        .transition()
        .duration(duration)
        .attr("viewBox", [-marginLeft, left.x - margin.top, width, height + 50])
        .tween(
          "resize",
          window.ResizeObserver ? null : () => () => svg.dispatch("toggle")
        );

      // Update the nodes…
      const node = gNode.selectAll("g").data(nodes, d => d.id);

      //Tooltip
      const tip = d3tip().attr('class', 'd3-tip').html(
        (event, d) => {
          const existInOCL = that.existsInOCL(d)
          let mapType = that.props.concept.id == d.data.id && !d.parent ? null : d.data.map_type
          if(mapType === HIERARCHY_CHILD_REL)
            mapType = that.props.hierarchyMeaning ? `Has Child (${that.props.hierarchyMeaning})` : 'Has Child'
          const idLabel = mapType ? 'Map Type:' : 'ID:'
          const header = existInOCL ? '' : '<div class="gray-italics-small">(not defined in OCL)</div>';
          const sourceHeader = d.data.target_source ? `<div><span class='gray'>Source: </span><span><b>${d.data.target_source}</b></span></div> ` : '';
          let terminalHeader = '';
          if(!d.data.target_concept_code && isEmpty(d.data.children)) {
            if(d.data.uuid === d.parent.data.uuid)
              terminalHeader = '<div class="gray-italics-small">(Same As Parent)</div> ';
            else if(d.data.terminal === false)
              terminalHeader = '<div class="gray-italics-small">(not terminal - cascaded elsewhere)</div> ';
            else if(d.data.terminal === null)
              terminalHeader = '<div class="gray-italics-small">(may be not terminal)</div> ';
          }
          return (
            `<div>
              ${header}
              ${terminalHeader}
              ${sourceHeader}
              <div>
                <span class='gray'>${idLabel}</span>
                <span><b>${mapType || d.data.id}</b></span>
              </div>
              <div>
                <span class='gray'>Name:</span>
                <span><b>${d.data.display_name || d.data.target_concept_code}</b></span>
              </div>
            </div>`
          )}
      );
      svg.call(tip);

      // Enter any new nodes at the parent's previous position.
      const nodeEnter = node
        .enter()
        .append("g")
        .attr("transform", () => `translate(${source.y0 * linkMultiplier},${source.x0})`)
        .attr("fill-opacity", 0)
        .attr("stroke-opacity", 0)
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide)
        .on("click", (event, d) => {
          d.children = d.children ? null : d._children
          update(d, that);
        });

      nodeEnter
        .append("circle")
        .attr("r", 4.5)
        .attr("fill", d => {
          const mapType = d.data.map_type
          return (!mapType || mapType === HIERARCHY_CHILD_REL) ? (d._children ? BLUE : "#999") : that.generateColor(d.data)
        })
        .attr("stroke-width", 10);

      nodeEnter
        .append("text")
        .attr("dy", "0.31em")
        .attr('font-size', `${fontSize}px`)
        .attr('font-style', d => that.existsInOCL(d) ? 'inherit': 'italic')
        .attr("x", d => (d._children ? -6 : 6))
        .attr("text-anchor", d => (d._children ? "end" : "start"))

      nodeEnter
        .select('text')
        .append('tspan')
        .attr('font-size', `${fontSize-1}px`)
        .attr('fill', 'gray')
        .text(d => {
        let name;
        if(d.data.target_concept_code)
          name = d.data.target_concept_code
        else {
          name = d.data.name
          if(isEmpty(d.data.children) && d.data.uuid !== d.parent.data.uuid) {
            if(d.data.terminal === false)
              name += '⁺'
            else if (d.data.terminal === null)
              name += '^'
          }
        }
          return name + '  '
        })
      nodeEnter
        .select('text')
        .append('tspan')
        .attr('class', 'tspan-to-wrap')
        .attr('font-size', `${fontSize}px`)
        .attr('fill', d => that.existsInOCL(d) ? (d._children ? BLUE : '#000') : 'rgba(0, 0, 0, 0.5)')
        .attr('x', d => d._children ? -6 : 6)
        .attr('dy', `1.2em`)
        .text(d => {
          let name = d.data.display_name || '';
          if(name.length > 20)
            name = name.substring(0, 17) + '...'
          return name
        })

      // Transition nodes to their new position.
      node
        .merge(nodeEnter)
        .transition(transition)
        .attr("transform", d => `translate(${d.y * linkMultiplier},${d.x})`)
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

      const link = gLink.selectAll(".link").data(links, d => d.target.id);
      var linkEnter = link
        .enter()
        .append("g")
        .attr("class", "link")
        .attr("fill", "none");

      linkEnter.append("path")
               .attr("d", diagonal)
               .attr("stroke-width", d => d.target.data.map_type === HIERARCHY_CHILD_REL ? 3 : 2)
               .attr("stroke-dasharray", d => d.target.data.map_type === HIERARCHY_CHILD_REL ? "" : "5, 5")
               .attr("stroke", d => (!d.target.data.map_type || d.target.data.map_type) === HIERARCHY_CHILD_REL ? '#000' : that.generateColor(d.target.data));

      linkEnter.append("text")
               .attr("transform", d => `translate(${((d.source.y * linkMultiplier) + (d.target.y * linkMultiplier))/2}, ${(d.source.x + d.target.x)/2})`)
               .attr("text-anchor", "middle")
               .attr("stroke-width", "0.02em")
               .attr("fill", "black")
               .attr("font-size", "12px")
               .attr("dy", "-0.75em")
               .text(d => {
                 let mapType = d.target.data.map_type
                 if(mapType === HIERARCHY_CHILD_REL)
                   mapType = that.props.hierarchyMeaning ? `Has Child (${that.props.hierarchyMeaning})` : 'Has Child'
                 return mapType;
               });
      link.merge(linkEnter).transition(transition).attr("d", diagonal);
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
