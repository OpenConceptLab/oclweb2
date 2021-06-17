import React from 'react'
import { TreeView, TreeItem } from '@material-ui/lab'
import { makeStyles } from '@material-ui/core/styles'
import { ExpandMore as DownIcon, ChevronRight as RightIcon } from '@material-ui/icons'
import { isArray, map, find, reject, isEmpty, isEqual, get, forEach } from 'lodash'
import { BLUE, BLACK } from '../../common/constants';

const useStyles = makeStyles({
  root: {
    height: 110,
    flexGrow: 1,
    maxWidth: 400,
  },
});

const makeChildNode = child => ({id: child.url, name: child.id, url: child.url, children: child.children})


const makeHierarchy = data => {
  const hierarchy = {root: [{id: data.id, name: data.id}]}
  hierarchy[data.id] = []
  const rootChild = find(data.children, {root: true})
  const nonRootChildren = reject(data.children, {url: rootChild.url})
  if(rootChild)
    hierarchy[data.id].push(makeChildNode(rootChild))
  nonRootChildren.map(child => hierarchy[data.id].push(makeChildNode(child)))

  return hierarchy
}

class HierarchyTraversalList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tree: makeHierarchy(props.data),
    }
  }

  handleChange = (event, nodeId) => {
    if(isEqual(nodeId, [this.props.data.id]))
      return

    const id = nodeId[0]
    this.props.fetchChildren(id, children => {
      const newTree = {
        ...this.state.tree,
        [id]: children.map(makeChildNode)
      }
      this.setState({tree: newTree})
    })
  };

  onLabelClick = child => window.location.hash = child.url

  renderTree = children => {
    const { tree } = this.state
    const { currentNodeURL } = this.props;
    return children.map(child => {
      const childrenNodes = (tree[child.id] && tree[child.id].length > 0) ?
                            this.renderTree(tree[child.id]) :
                            (child.children.length === 0 ? null : [<div />]);
      const isCurrentNode = child.url && child.url === currentNodeURL
      const labelStyles = {fontSize: '12px', fontWeight: isCurrentNode ? 'bold' : 'initial', color: isCurrentNode ? BLUE : BLACK}
      return (
        <TreeItem style={{overflow: 'hidden'}} onLabelClick={() => this.onLabelClick(child)} key={child.id} nodeId={child.id} label={<span style={labelStyles}>{child.name}</span>}>
          {childrenNodes}
        </TreeItem>
      );
    });
  };

  componentDidMount() {
    const { hierarchyPath } = this.props;
    setTimeout(() => {
      if(!isEmpty(hierarchyPath)) {
        forEach(hierarchyPath, path => {
          setTimeout(this.handleChange(null, [path]), 100)
        })
      }
    }, 500)
  }

  render() {
    const iconStyles = {width: '14px', height: '14px'}

    return (
      <div className='col-md-12' style={{padding: '5px'}}>
        <TreeView
          defaultExpanded={[this.props.data.id, ...this.props.hierarchyPath]}
          onNodeToggle={this.handleChange}
          defaultCollapseIcon={<DownIcon style={iconStyles} />}
          defaultExpandIcon={<RightIcon style={iconStyles} />}
        >
          {this.renderTree(this.state.tree.root)}
        </TreeView>
      </div>
    )
  }
}
export default HierarchyTraversalList
