import React from 'react';
import ReactDOM from 'react-dom';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import MomentUtils from '@date-io/moment';
import { Route, HashRouter, Switch } from 'react-router-dom';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import alertifyjs from 'alertifyjs';
import App from './components/app/App';
import './index.scss';
import { BLUE, WHITE, BLACK } from './common/constants';


alertifyjs.defaults = {
  ...alertifyjs.defaults,
  notifier: {
    ...alertifyjs.defaults.notifier,
    delay: 3,
    position: 'top-right',
  },
};

const theme = createMuiTheme({
  palette: {
    primary: {
      main: BLUE,
      dark: BLUE,
      light: BLUE,
      contrastText: WHITE,
    },
    secondary: {
      main: BLACK,
      dark: BLACK,
      light: BLACK,
      contrastText: WHITE,
    },
  },
});

ReactDOM.render(
  <HashRouter>
    <MuiThemeProvider theme={theme}>
      <MuiPickersUtilsProvider utils={MomentUtils}>
        <Switch>
          <Route exact path="/" component={App} />
          <App />
        </Switch>
      </MuiPickersUtilsProvider>
    </MuiThemeProvider>
  </HashRouter>,
  document.getElementById('root')
);
