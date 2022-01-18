import React, { useCallback } from "react";
import makeStyles from '@mui/styles/makeStyles';
import Drawer from "@mui/material/Drawer";
import DragIcon from '@mui/icons-material/MoreVert';

export const defaultWidth = 360;
const minWidth = 50;
const maxWidth = 1000;

const useStyles = makeStyles(theme => ({
  drawer: {
    flexShrink: 0
  },
  toolbar: theme.mixins.toolbar,
  dragger: {
    width: "8px",
    cursor: "ew-resize",
    padding: "4px 0 0",
    borderTop: "1px solid #ddd",
    position: "absolute",
    top: '64px',
    left: 0,
    bottom: 0,
    zIndex: 100,
    backgroundColor: "#fafbfc",
    height: '1000px'
  }
}));

const ResponsiveDrawer = ({formComponent, variant, isOpen, onClose, onWidthChange, width}) => {
  const [open, setOpen] = React.useState(isOpen);
  const classes = useStyles();
  const [drawerWidth, setDrawerWidth] = React.useState(width || defaultWidth);

  const handleMouseDown = () => {
    document.addEventListener("mouseup", handleMouseUp, true);
    document.addEventListener("mousemove", handleMouseMove, true);
  };

  const handleMouseUp = () => {
    document.removeEventListener("mouseup", handleMouseUp, true);
    document.removeEventListener("mousemove", handleMouseMove, true);
  };

  const handleMouseMove = useCallback(e => {
    let offsetRight =
      document.body.offsetWidth - (e.clientX - document.body.offsetLeft);
    if (offsetRight > minWidth && offsetRight < maxWidth) {
      setDrawerWidth(offsetRight)
      onWidthChange(offsetRight)
    }

  }, []);

  React.useEffect(() => setOpen(isOpen), [isOpen])

  return (
    <Drawer
      anchor='right'
      open={open}
      className={classes.drawer}
      variant={variant}
      PaperProps={{ style: { width: drawerWidth } }}
      onClose={onClose}
    >
      <div className={classes.toolbar} />
      <div onMouseDown={e => handleMouseDown(e)} className={classes.dragger + ' flex-vertical-center'}>
        <DragIcon style={{marginLeft: '-8px', color: 'rgba(0, 0, 0, 0.3)'}} />
      </div>
      {
        formComponent
      }
    </Drawer>
  );
}

export default ResponsiveDrawer;
