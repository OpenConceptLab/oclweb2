import React from 'react';

const About = ({id, about}) => {
  return (
    <div className='col-md-12 about-home-tab'>
      <h1 style={{padding: '10px'}}>
        {`About ${id}`}
      </h1>
      {
        about ?
        <div className='col-md-12' dangerouslySetInnerHTML={{__html: about.replaceAll('href="/', 'href="/#/')}} /> :
        <p>No about entry</p>
      }
    </div>
  );
}

export default About;
