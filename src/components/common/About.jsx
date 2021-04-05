import React from 'react';

const About = ({id, about}) => {
  return (
    <div className='col-md-12 about-home-tab'>
      <h3 className='light-gray-bg' style={{padding: '10px', borderRadius: '3px'}}>
        {`About ${id}`}
      </h3>
      {
        about ?
        <div className='col-md-12' dangerouslySetInnerHTML={{__html: about.replaceAll('href="/', 'href="/#/')}} /> :
        <p>No about entry</p>
      }
    </div>
  );
}

export default About;
