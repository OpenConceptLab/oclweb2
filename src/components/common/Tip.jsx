import React from 'react';
import {
  Card, CardHeader, CardContent
} from '@material-ui/core';
import {
  Highlight as HighlightIcon
} from '@material-ui/icons';

const Tip = ({ content }) => {
  return (
    <Card style={{border: '1px solid lightgray', boxShadow: 'none', borderRadius: '4px'}}>
      <CardHeader style={{padding: '8px', paddingBottom: '0px'}} avatar={<HighlightIcon fontSize='small' color='primary' style={{marginTop: '2px'}}/>} title='Tip' />
      <CardContent style={{padding: '0px 16px'}}>
        {content}
      </CardContent>
    </Card>
  )
};

export default Tip;
