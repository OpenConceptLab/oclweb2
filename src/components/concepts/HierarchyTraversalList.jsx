import React from 'react'
import { TreeView, TreeItem } from '@material-ui/lab'
import { CircularProgress } from '@material-ui/core'
import { find, reject, isEmpty, isEqual, forEach, get } from 'lodash'
import { BLUE, BLACK } from '../../common/constants';
import { generateRandomString, toParentURI } from '../../common/utils';
import PlusIcon from '../common/PlusSquareIcon';
import MinusIcon from '../common/MinusSquareIcon';
import CloseIcon from '../common/CloseSquareIcon';
import HierarchySearch from './HierarchySearch';


class HierarchyTraversalList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tree: this.makeHierarchy(props.data),
      currentCount: get(props.data, 'children.length', 0),
      isLoading: false,
      loadingNode: null,
    }
  }

  makeChildNode = child => ({id: child.url, _id: child.id, name: child.name, url: child.url, children: child.children, root: child.root})

  makeHierarchy = data => {
    const hierarchy = {root: [{id: data.id, name: data.id, origin: true, count: data.count}]}
    hierarchy[data.id] = []
    const rootChild = find(data.children, {root: true})
    let nonRootChildren = data.children
    if(rootChild) {
      hierarchy[data.id].push(this.makeChildNode(rootChild))
      nonRootChildren = reject(data.children, {url: rootChild.url})
    }

    nonRootChildren.map(child => hierarchy[data.id].push(this.makeChildNode(child)))

    return hierarchy
  }

  getLoader = () => (<CircularProgress color='secondary' style={{width: '11px', height: '11px', marginLeft: '5px', marginTop: '5px'}} />)

  onLoadMoreClick = event => {
    event.preventDefault()
    event.stopPropagation()
    this.props.onLoadMore()
    return false
  }

  getOriginNode = origin => {
    const { currentCount } = this.state
    return (
      <span style={{display: 'flex', justifyContent: 'space-between'}}>
        <b>{`${origin.name} (${currentCount}/${origin.count})`}</b>
        {
          currentCount < origin.count &&
          <span id="top-load-more" style={{float: 'right'}}>
            {
              this.props.isLoadingChildren ?
              this.getLoader() :
              <a onClick={this.onLoadMoreClick}>Load More</a>
            }
          </span>
        }
      </span>
    )
  }

  getNodeLabel = (child, isCurrentNode, isLoading) => {
    const labelStyles = {fontSize: '12px', color: isCurrentNode ? BLUE : BLACK, width: '100%'}
    const showName = child.name && child.name !== child._id
    return (
      <React.Fragment>
        <span style={labelStyles} className='flex-vertical-center'>
          <span style={{width: '100%'}}>
            {
              child._id && (showName ? <React.Fragment><b>{child._id}</b>&nbsp;</React.Fragment> : <React.Fragment>{child._id} &nbsp;</React.Fragment>)
            }
            {
              showName && (
                child.origin ?
                this.getOriginNode(child) :
                <React.Fragment>{child.name}</React.Fragment>
              )
            }
            {
              child.root &&
              <span style={{fontSize: '10px', fontStyle: 'italic', color: 'gray', marginLeft: '2px', fontWeight: 'bold'}}>
                (root)
              </span>
            }
            {
              isLoading && this.getLoader()
            }
          </span>
        </span>
      </React.Fragment>
    )
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
            [id]: children.map(this.makeChildNode)
          }
          this.setState({tree: newTree, isLoading: false, loadingNode: null})
        } else {
          this.setState({isLoading: false, loadingNode: null})
        }
      })
    })
  };

  onLabelClick = child => {
    if(child.origin)
      return
    if(this.props.onClick)
      this.props.onClick(child)
    else
      window.location.hash = child.url
  }

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
          label={this.getNodeLabel(child, isCurrentNode, loading)}
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

  componentDidUpdate(prevProps) {
    const { newChildren, data } = this.props
    if(!isEqual(newChildren, prevProps.newChildren)) {
      const newState = {...this.state}
      newChildren.map(child => newState.tree[data.id].push(this.makeChildNode(child)))
      newState.currentCount += newChildren.length
      this.setState(newState)
    }
  }

  scrollToSelected() {
    const { currentNodeURL } = this.props;
    this.scrollInterval = setInterval(() => {
      const el = document.getElementById(currentNodeURL);
      if(el) {
        try {
          el.scrollIntoViewIfNeeded()
        } catch (err) {
          //pass
        }
        clearInterval(this.scrollInterval)
      }
    }, 500)
  }

  onSearchSelect = selected => selected && this.onLabelClick(selected)
  shouldShowBottomLoadMore = () => Boolean(document.getElementById('top-load-more'))

  render() {
    const { data, hierarchyPath, currentNodeURL } = this.props
    const iconStyles = {width: '12px', height: '12px'}
    return (
      <div className='col-md-12' style={{padding: '2px 12px', height: '700px', overflow: 'auto'}}>
        <HierarchySearch
          searchURL={toParentURI(currentNodeURL) + '/concepts/'}
          style={{margin: '5px 0'}}
          onChange={this.onSearchSelect}
        />
        <TreeView
          defaultExpanded={[data.id, ...hierarchyPath]}
          onNodeToggle={this.handleChange}
          defaultCollapseIcon={<MinusIcon style={iconStyles} />}
          defaultExpandIcon={<PlusIcon style={iconStyles} />}
          defaultEndIcon={<CloseIcon style={{...iconStyles, opacity: 0.3}} />}
        >
          {this.renderTree(this.state.tree.root)}
        </TreeView>
        {
          this.shouldShowBottomLoadMore() &&
          <span id="bottom-load-more" style={{float: 'right', fontSize: '12px', cursor: 'pointer'}}>
            {
              this.props.isLoadingChildren ?
              this.getLoader() :
              <a onClick={this.onLoadMoreClick}>Load More</a>
            }
          </span>
        }
      </div>
    )
  }
}
export default HierarchyTraversalList
