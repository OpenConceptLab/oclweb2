import React from 'react';
import { Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button } from '@material-ui/core';
import { Person as PersonIcon } from '@material-ui/icons';
import { isAtGlobalSearch, isLoggedIn, getCurrentUser } from '../../common/utils';
import { WHITE, BLACK } from '../../common/constants';
import SearchInput from '../search/SearchInput';
import UserOptions from '../users/UserOptions';

const Header = props => {
  const authenticated = isLoggedIn()
  const user = getCurrentUser()

  return (
    <AppBar position="static" variant="outlined" style={{backgroundColor: WHITE, color: BLACK}}>
      <Toolbar>
        <Typography variant="h6" className="brand col-sm-1">
          <Link className="no-anchor-styles" to="/">OCL</Link>
        </Typography>
        <div className="col-sm-8">
          {
            !isAtGlobalSearch() &&
            <SearchInput {...props} />
          }
        </div>
        <div className='col-sm-4 pull-right' style={{textAlign: 'right'}}>
          {
            authenticated ?
            <span>
              <Button className='primary-btn' href={`/#${user.url}`} color='primary' variant='contained' startIcon={<PersonIcon />}>
                {user.username}
              </Button>
              <span style={{marginLeft: '10px'}}>
                <UserOptions />
              </span>
            </span>:
            <Button className='primary-btn' href="/#/accounts/login" color='primary' variant='contained'>
              Sign In
            </Button>
          }
        </div>
      </Toolbar>
    </AppBar>
  )
}

export default Header;
