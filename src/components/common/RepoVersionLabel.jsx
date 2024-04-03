import React from 'react';

const RepoVersionLabel = ({version, href, onClick}) => (
  <span style={{backgroundColor: 'rgb(92, 184, 92, 0.34)', padding: '2px 4px', borderRadius: '2px', fontSize: '11px'}}>
    <a onClick={onClick} href={href} target='_blank' rel='noopener noreferrer' style={{color: 'rgba(0, 0, 0, 0.7)'}}>
      {version}
    </a>
  </span>
)

export default RepoVersionLabel;
