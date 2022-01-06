/*eslint no-process-env: 0*/

import React from 'react';
import { Tooltip } from '@mui/material';
import APIService from '../../services/APIService';
import { isFHIRServer, toFullAPIURL } from '../../common/utils';
import packageJson from '../../../package.json';
import config from '../../../config.json';

const VERSION = `${packageJson.version}-${config.build}`
const SWAGGER_URL = toFullAPIURL('/swagger/')

const AppVersionChip = ({version, label, tooltip}) => {
  return (
    <Tooltip title={tooltip || label} arrow>
      <span className='app-version-container' style={{marginLeft: '4px'}}>
        <span className='app-label'>
          {label}
        </span>
        <span className='app-version'>{version}</span>
      </span>
    </Tooltip>
  )
}

class AppVersions extends React.Component {
  constructor(props) {
    super(props)
    this.state = {version: null}
  }
  componentDidMount() {
    if(!isFHIRServer())
      APIService
      .version()
      .get()
      .then(response => this.setState({version: response.status === 200 ? response.data : null}))
  }

  render() {
    return (
      <React.Fragment>
        <AppVersionChip tooltip='Web Version' label='Web' version={VERSION} />
        {
          this.state.version &&
          <a href={SWAGGER_URL} target='_blank' rel="noopener noreferrer">
            <AppVersionChip tooltip='API Version' label='API' version={this.state.version} />
          </a>
        }
      </React.Fragment>
    )
  }
}

export default AppVersions;
