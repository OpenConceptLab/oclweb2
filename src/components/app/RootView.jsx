import React from 'react';
import { Redirect } from 'react-router-dom';
import { isLoggedIn, getCurrentUserUsername } from '../../common/utils';
import Search from '../search/Search';

class RootView extends React.Component {
  render() {
    return (
      <React.Fragment>
        {
          isLoggedIn() ?
          <Redirect
            to={{
              pathname: `/users/${getCurrentUserUsername()}`,
            }}
          /> :
          <Search resource="organizations" {...this.props} />
        }
      </React.Fragment>
    )
  }
}

export default RootView;
