import React from 'react'
import { TreeView, TreeItem } from '@material-ui/lab'
import { CircularProgress } from '@material-ui/core'
import { find, reject, isEmpty, isEqual, forEach } from 'lodash'
import { BLUE, BLACK } from '../../common/constants';
import { generateRandomString } from '../../common/utils';
import PlusIcon from '../common/PlusSquareIcon';
import MinusIcon from '../common/MinusSquareIcon';
import CloseIcon from '../common/CloseSquareIcon';

const makeChildNode = child => ({id: child.url, _id: child.id, name: child.name, url: child.url, children: child.children, root: child.root})

const makeHierarchy = data => {
  const hierarchy = {root: [{id: data.id, name: data.id, origin: true}]}
  hierarchy[data.id] = []
  const rootChild = find(data.children, {root: true})
  let nonRootChildren = data.children
  if(rootChild) {
    hierarchy[data.id].push(makeChildNode(rootChild))
    nonRootChildren = reject(data.children, {url: rootChild.url})
  }

  nonRootChildren.map(child => hierarchy[data.id].push(makeChildNode(child)))

  return hierarchy
}

const getLoader = () => (<CircularProgress color='secondary' style={{width: '11px', height: '11px', marginLeft: '5px', marginTop: '5px'}} />)

const getNodeLabel = (child, isCurrentNode, isLoading) => {
  const labelStyles = {fontSize: '12px', color: isCurrentNode ? BLUE : BLACK}
  const showName = child.name && child.name !== child._id
  return (
    <React.Fragment>
      <span style={labelStyles} className='flex-vertical-center'>
        <span>
          {
            child._id && (showName ? <React.Fragment><b>{child._id}</b>&nbsp;</React.Fragment> : <React.Fragment>{child._id} &nbsp;</React.Fragment>)
          }
          {
            showName && (child.origin ? <b>{child.name}</b> : <React.Fragment>{child.name}</React.Fragment>)
          }
          {
            child.root &&
            <span style={{fontSize: '10px', fontStyle: 'italic', color: 'gray', marginLeft: '2px', fontWeight: 'bold'}}>
              (root)
            </span>
          }
          {
            isLoading && getLoader()
          }
        </span>
      </span>
    </React.Fragment>
  )
}

class HierarchyTraversalList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tree: makeHierarchy(props.data),
      isLoading: false,
      loadingNode: null,
    }
  }

  handleChange = (event, nodeId, loadingNodeId) => {
    if(isEqual(nodeId, [this.props.data.id]))
      return

    const id = nodeId[0]
    this.setState({isLoading: true, loadingNode: loadingNodeId || id}, () => {
      this.props.fetchChildren(id, children => {
        if(children) {
          const newTree = {
            ...this.state.tree,
            [id]: children.map(makeChildNode)
          }
          this.setState({tree: newTree, isLoading: false, loadingNode: null})
        } else {
          this.setState({isLoading: false, loadingNode: null})
        }
      })
    })
  };

  onLabelClick = child => window.location.hash = child.url

  renderTree = children => {
    const { tree, isLoading, loadingNode } = this.state
    const { currentNodeURL } = this.props;
    return children.map(child => {
      const childrenNodes = (tree[child.id] && tree[child.id].length > 0) ?
                            this.renderTree(tree[child.id]) :
                            (child.children.length === 0 ? null : [<div key={generateRandomString()} />]);
      const isCurrentNode = child.url && child.url === currentNodeURL
      const loading = isLoading && loadingNode === child.id
      return (
        <TreeItem
          id={child.id}
          style={{overflow: 'hidden'}}
          onLabelClick={() => this.onLabelClick(child)}
          key={child.id}
          nodeId={child.id}
          label={getNodeLabel(child, isCurrentNode, loading)}
          classes={
            isCurrentNode ? {label: 'hierarchy-node-selected', iconContainer: 'hierarchy-node-icon', content: 'hierarchy-node-content'} : {iconContainer: 'hierarchy-node-icon', content: 'hierarchy-node-content'}
          }>
          {childrenNodes}
        </TreeItem>
      );
    });
  };

  componentDidMount() {
    const { hierarchyPath, data } = this.props;
    if(!isEmpty(hierarchyPath)) {
      setTimeout(() => {
        forEach(hierarchyPath, path => setTimeout(() => this.handleChange(null, [path], data.id), 100))
        this.scrollToSelected()
      }, 500)
    }
  }

  scrollToSelected() {
    const { currentNodeURL } = this.props;
    this.scrollInterval = setInterval(() => {
      const el = document.getElementById(currentNodeURL);
      if(el) {
        el.scrollIntoViewIfNeeded()
        clearInterval(this.scrollInterval)
      }
    }, 500)
  }

  render() {
    const { data, hierarchyPath } = this.props
    const iconStyles = {width: '12px', height: '12px'}
    return (
      <div className='col-md-12' style={{padding: '2px 12px', height: '700px', overflow: 'auto'}}>
        <TreeView
          defaultExpanded={[data.id, ...hierarchyPath]}
          onNodeToggle={this.handleChange}
          defaultCollapseIcon={<MinusIcon style={iconStyles} />}
          defaultExpandIcon={<PlusIcon style={iconStyles} />}
          defaultEndIcon={<CloseIcon style={{...iconStyles, opacity: 0.3}} />}
        >
          {this.renderTree(this.state.tree.root)}
        </TreeView>
      </div>
    )
  }
}
export default HierarchyTraversalList
