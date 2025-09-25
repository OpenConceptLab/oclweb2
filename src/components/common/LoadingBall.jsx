import React from 'react';
import SvgIcon from '@mui/material/SvgIcon';

const LoadingBall = () => {
  return (
    <SvgIcon style={{width: "150px", height: "150px"}} viewBox="0 0 100 100" preserveAspectRatio="xMidYMid">
      <circle cx="50" cy="23" r="13" fill="#3f27ff">
        <animate attributeName="cy" dur="1s" repeatCount="indefinite" calcMode="spline" keySplines="0.45 0 0.9 0.55;0 0.45 0.55 0.9" keyTimes="0;0.5;1" values="23;77;23"></animate>
      </circle>
    </SvgIcon>
  )
}

export default LoadingBall;
