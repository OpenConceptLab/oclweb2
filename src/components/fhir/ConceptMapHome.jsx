import React from 'react';
import { get, isObject, find } from 'lodash';
import { Pagination } from '@material-ui/lab'
import { CircularProgress } from '@material-ui/core';
import APIService from '../../services/APIService';
import { getAppliedServerConfig } from '../../common/utils';
import NotFound from '../common/NotFound';
import NavigationButtonGroup from '../search/NavigationButtonGroup';
import ContainerHomeHeader from './ContainerHomeHeader';
import ConceptMapGroups from './ConceptMapGroups';

const CONCEPT_MAP_DEFAULT_CONFIG = {
  name: 'FHIR Default (ConceptMap)',
  web_default: true,
  is_default: false,
  config: {
    tabs: [
      {type: "codes", label: "Codes", page_size: 25, "default": true, layout: 'table'},
      {type: "versions", label: "Versions", page_size: 25, layout: 'table'},
      {type: "about", label: "About"},
    ]
  }
}

class ConceptMapHome extends React.Component {
  constructor(props) {
    super(props);
    this.URLAttr = 'ConceptMap'
    const config = CONCEPT_MAP_DEFAULT_CONFIG
    const server = getAppliedServerConfig()
    const isHAPI = get(server, 'hapi', false);
    const currentURL = isHAPI ?
                       `/fhir/${this.URLAttr}/${props.match.params.id}` :
                       window.location.hash.split('?')[0].replace('#', '');
    const serverURL = isHAPI ?
                      `${server.info.baseURI}/${this.URLAttr}/${props.match.params.id}` :
                      window.location.hash.split('?')[0].replace('#/fhir', '');
    this.state = {
      server: server,
      isHAPI: isHAPI,
      notFound: false,
      isLoading: true,
      isLoadingGroups: true,
      selectedConfig: config,
      resource: {},
      codes: {
        next: null,
        previous: null,
        results: [],
        pageNumber: 1,
        total: 0,
        pageCount: 100,
        pages: 1,
      },
      url: currentURL,
      serverUrl: serverURL,
    }
  }

  componentDidMount() {
    this.refreshDataByURL()
  }

  componentDidUpdate(prevProps) {
    if(
      (prevProps.location.pathname !== this.props.location.pathname) ||
      (prevProps.location.search !== this.props.location.search)
    ) {
      this.refreshDataByURL()
    }
  }

  getCurrentPage = data => {
    const selfLink = this.getLinkURL(data, 'self')
    if(selfLink !== 'null') {
      const query = new URLSearchParams(selfLink.split('?')[1])
      const page = query.get('page')
      if(page)
        return parseInt(page)
    }
    return 1
  }

  getTotalPages = total => {
    const pages = Math.ceil(total/100);
    return pages < 1 ? 1 : pages
  }


  getLinkURL = (response, rel) => {
    const url = get(find(get(response, 'link', []), {relation: rel}), 'url')
    if(url !== 'null')
      return url
  }

  refreshDataByURL(loadingGroups = false, page) {
    const { isHAPI, codes } = this.state;
    this.setState({isLoading: !loadingGroups, isLoadingGroups: loadingGroups, notFound: false}, () => {
      const queryParams = isHAPI ? {} : {page: page || codes.pageNumber}
      APIService.new()
                .overrideURL(this.state.serverUrl)
                .get(null, null, queryParams)
                .then(response => {
                  if(get(response, 'detail') === "Not found.")
                    this.setState({isLoading: false, notFound: true, resource: {}})
                  else if(!isObject(response))
                    this.setState({isLoading: false}, () => {throw response})
                  else {
                    const resource = isHAPI ? response.data : get(response, 'data.entry.0.resource');
                    const groups = get(resource, 'group') || [];
                    const total = get(groups, 'length') || 0;
                    this.setState({
                      isLoadingGroups: false,
                      isLoading: false,
                      resource: resource,
                      codes: {
                        next: this.getLinkURL(response.data, 'next'),
                        previous: this.getLinkURL(response.data, 'previous'),
                        results: groups,
                        pageNumber: isHAPI ? 1 : this.getCurrentPage(response.data),
                        pages: isHAPI ? 1 : this.getTotalPages(total)
                      },
                    })
                  }
                })

    })
  }

  onPageChange = page => this.refreshDataByURL(true, page)

  onNavClick = next => this.refreshDataByURL(
    true, next ? this.state.codes.pageNumber + 1 : this.state.codes.pageNumber - 1
  );

  render() {
    const {
      resource, codes, isLoading, notFound, server, isHAPI, url, serverUrl, isLoadingGroups
    } = this.state;
    const source = {...resource, owner: server.info.org.id, canonical_url: resource.url, release_date: resource.date};

    return (
      <div style={isLoading ? {textAlign: 'center', marginTop: '40px'} : {}}>
        {
          isLoading ?
          <CircularProgress color='primary' /> :
          (
            notFound ?
            <NotFound /> :
            <div className='col-md-12 home-container no-side-padding'>
              <ContainerHomeHeader
                resource={this.URLAttr}
                source={source}
                url={`#${url}`}
                parentURL={`/fhir/${this.URLAttr}`}
                serverURL={serverUrl}
              />
              {
                !isHAPI &&
                <div className='col-md-12 flex-vertical-center' style={{justifyContent: 'flex-end'}}>
                  <span>
                    <NavigationButtonGroup onClick={this.onNavClick} next={Boolean(codes.next)} prev={Boolean(codes.previous)} />
                  </span>
                </div>
              }
              <div className='col-md-12'>
                <ConceptMapGroups groups={codes.results} isHAPI={isHAPI} isLoading={isLoadingGroups} />
              </div>
              {
                !isHAPI &&
                <div className='col-md-12 no-side-padding pagination-center' style={{textAlign: 'center'}}>
                  <Pagination
                    onChange={(event, page) => this.onPageChange(page)}
                    variant="outlined"
                    shape="rounded"
                    color="primary"
                    showFirstButton
                    showLastButton={false}
                    page={codes.pageNumber}
                    count={codes.next ? codes.pageNumber + 1 : codes.pageNumber}
                    style={{display: 'inline-flex', marginTop: '10px'}}
                  />
                </div>
              }

            </div>
          )
        }
      </div>
    )
  }
}

export default ConceptMapHome;
