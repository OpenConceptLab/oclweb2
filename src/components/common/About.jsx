import React from 'react';
import SafeHTML from './SafeHTML';

const About = ({id, about}) => {
  return (
    <div className='col-md-12 about-home-tab'>
      <h1 style={{padding: '0px', marginBottom: 0}}>
        {`About ${id}`}
      </h1>
      {
        about ?
        <SafeHTML className='col-md-12 no-side-padding' html={about} hashLinks /> :
        <p>No about entry</p>
      }
    </div>
  );
}

export default About;
