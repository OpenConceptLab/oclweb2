/*eslint no-process-env: 0*/

import React from 'react';
import { Tooltip } from '@material-ui/core';
import APIService from '../../services/APIService';
import { isFHIRServer } from '../../common/utils';
import packageJson from '../../../package.json';
import config from '../../../config.json';

const VERSION = `${packageJson.version}-${config.build}`

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
          <AppVersionChip tooltip='API Version' label='API' version={this.state.version} />
        }
      </React.Fragment>
    )
  }
}

export default AppVersions;
