import React from 'react';
import ReactDOM from 'react-dom';
import Fade from '@mui/material/Fade';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { HashRouter } from 'react-router-dom';
import { ThemeProvider, StyledEngineProvider, createTheme, alpha } from '@mui/material/styles';
import { grey } from "@mui/material/colors";
import StylesProvider from '@mui/styles/StylesProvider';
import alertifyjs from 'alertifyjs';
import App from './components/app/App';
import LayoutContext from './components/app/LayoutContext';
import './index.scss';
import { BLUE, WHITE, BLACK } from './common/constants';
import './i18n/config';

alertifyjs.defaults = {
  ...alertifyjs.defaults,
  notifier: {
    ...alertifyjs.defaults.notifier,
    delay: 3,
    position: 'top-right',
  },
};

const theme = createTheme();
const v5Theme = createTheme(theme, {
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
    "default": {
      main: grey[600],
      dark: grey[600]
    }
  },
  components: {
    MuiTooltip: {
      defaultProps: {
        arrow: true,
        leaveDelay: 300,
        TransitionComponent: Fade,
        TransitionProps: { timeout: 300 }
      }
    },
    MuiButton: {
      variants: [
        {
          props: { variant: "contained", color: "grey" },
          style: {
            color: theme.palette.getContrastText(theme.palette.grey[300])
          }
        },
        {
          props: { variant: "outlined", color: "grey" },
          style: {
            color: theme.palette.text.primary,
            borderColor:
                    theme.palette.mode === "light"
                    ? "rgba(0, 0, 0, 0.23)"
                    : "rgba(255, 255, 255, 0.23)",
            "&.Mui-disabled": {
              border: `1px solid ${theme.palette.action.disabledBackground}`
            },
            "&:hover": {
              borderColor:
                      theme.palette.mode === "light"
                      ? "rgba(0, 0, 0, 0.23)"
                      : "rgba(255, 255, 255, 0.23)",
              backgroundColor: alpha(
                theme.palette.text.primary,
                theme.palette.action.hoverOpacity
              )
            }
          }
        },
        {
          props: { color: "grey", variant: "text" },
          style: {
            color: theme.palette.text.primary,
            "&:hover": {
              backgroundColor: alpha(
                theme.palette.text.primary,
                theme.palette.action.hoverOpacity
              )
            }
          }
        }
      ]
    }
  }
})

ReactDOM.render(
  <HashRouter>
    <StylesProvider injectFirst>
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={v5Theme}>
          <LocalizationProvider dateAdapter={AdapterMoment}>
            <LayoutContext subPages ={(<App />)} />
          </LocalizationProvider>
        </ThemeProvider>
      </StyledEngineProvider>
    </StylesProvider>
  </HashRouter>,
  document.getElementById('root')
);
