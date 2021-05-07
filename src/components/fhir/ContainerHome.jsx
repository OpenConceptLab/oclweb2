import React from 'react';
import { isEmpty, get, isObject, map, find } from 'lodash';
import { CircularProgress } from '@material-ui/core';
import NotFound from '../common/NotFound';
import APIService from '../../services/APIService';
import ContainerHomeHeader from './ContainerHomeHeader';
import ContainerHomeTabs from './ContainerHomeTabs';
import { getAppliedServerConfig } from '../../common/utils';

const CODE_SYSTEM_DEFAULT_CONFIG = {
  name: 'FHIR Default (CodeSystem)',
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

const VALUE_SET_DEFAULT_CONFIG = {
  name: 'FHIR Default (ValueSet)',
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

class ContainerHome extends React.Component {
  constructor(props) {
    super(props);
    this.isCodeSystem = Boolean(window.location.hash.match('/CodeSystem/'))
    this.isValueSet = Boolean(window.location.hash.match('/ValueSet/'))
    this.URLAttr = 'CodeSystem'
    let config = CODE_SYSTEM_DEFAULT_CONFIG
    if(this.isValueSet) {
      this.URLAttr = 'ValueSet'
      config = VALUE_SET_DEFAULT_CONFIG
    }
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
      isLoadingCodes: true,
      selectedConfig: config,
      resource: {},
      versions: [],
      codes: {
        systems: [],
        results: [],
        pageNumber: 1,
        total: 0,
        pageCount: 100,
        pages: 1,
      },
      tab: this.getDefaultTabIndex(),
      url: currentURL,
      serverUrl: serverURL,
    }
  }

  getDefaultTabIndex() {
    const { location } = this.props;

    if(location.pathname.indexOf('/about') > -1)
      return 2;
    if(location.pathname.indexOf('/versions') > -1)
      return 1;
    if(location.pathname.indexOf('/codes') > -1)
      return 0;

    return 0;
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
      this.onTabChange(null, this.getDefaultTabIndex())
    }
  }

  getVersions() {
    const { serverUrl, isHAPI, server } = this.state;
    const versionURL = isHAPI ? serverUrl + '/_history/?total=accurate&_sort=-date' : serverUrl + '/version/';
    APIService.new()
              .overrideURL(versionURL)
              .get()
              .then(response => {
                this.setState({versions: map(response.data.entry, entry => ({...entry.resource, owner: server.info.org.id}))})
              })
  }

  onTabChange = (event, value) => {
    this.setState({tab: value}, () => {
      if(isEmpty(this.state.versions))
        this.getVersions()
    })
  }

  getCurrentPage = data => {
    const links = get(data, 'link', [])
    const selfLink = get(find(links, {relation: 'self'}), 'url')
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

  refreshDataByURL(loadingCodes = false) {
    const { isHAPI, versions, codes } = this.state;
    this.setState({isLoading: !loadingCodes, notFound: false}, () => {
      const queryParams = isHAPI ? {} : {page: codes.pageNumber};
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
                    const concepts = get(resource, 'concept') ||
                                     get(find(get(resource, 'compose.include', []), inc => !isEmpty(get(inc, 'concept'))), 'concept') || [];
                    const total = get(resource, 'count') || concepts.length || 0;
                    this.setState({
                      isLoadingCodes: false,
                      isLoading: false,
                      resource: resource,
                      codes: {
                        systems: get(resource, 'compose.include', []),
                        results: concepts,
                        total: total,
                        pageCount: 100,
                        pageNumber: isHAPI ? 1 : this.getCurrentPage(response.data),
                        pages: isHAPI ? 1 : this.getTotalPages(total)
                      },
                    }, () => {
                      if(isEmpty(versions))
                        this.getVersions()
                    })
                  }
                })

    })
  }

  onCodesPageChange = page => this.setState({
    isLoadingCodes: true,
    codes: {...this.state.codes, pageNumber: page}
  }, () => this.refreshDataByURL(true))

  render() {
    const {
      resource, codes, versions, isLoading, tab, notFound, server, isHAPI, url, selectedConfig,
      isLoadingCodes,
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
              />
              <ContainerHomeTabs
                resource={this.URLAttr}
                tab={tab}
                onTabChange={this.onTabChange}
                source={source}
                versions={versions}
                codes={codes}
                location={this.props.location}
                match={this.props.match}
                versionedObjectURL={url}
                aboutTab
                selectedConfig={selectedConfig}
                isOCLDefaultConfigSelected
                hapi={isHAPI}
                onPageChange={this.onCodesPageChange}
                isLoadingCodes={isLoadingCodes}
              />
            </div>
          )
        }
      </div>
    )
  }
}

export default ContainerHome;
