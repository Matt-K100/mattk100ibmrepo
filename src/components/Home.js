import React, { Component } from 'react';

import { createSession } from '../actions';
// import { Sunburst } from '@nivo/sunburst';
// import jsonData from '../../public/data.json';

export class Home extends Component {
  static fetchData(store) {
    // Normally you'd pass action creators to "connect" from react-redux,
    // but since this is a static method you don't have access to "this.props".

    // Dispatching actions from "static fetchData()" will look like this (make sure to return a Promise):
    return store.dispatch(createSession({ id: 1, name: 'Cullen Jett' }));
  }

  render() {
    return (
      <div>
        <h6>Hello World</h6>
        {/* <Sunburst
          data={jsonData}
          margin={{
            top: 40,
            right: 20,
            bottom: 20,
            left: 20
          }}
          height={500}
          width={500}
          identity="name"
          value="loc"
          cornerRadius={2}
          borderWidth={1}
          borderColor="white"
          colors="set2"
          colorBy="id"
          childColor="inherit"
          animate={true}
          motionStiffness={90}
          motionDamping={15}
          isInteractive={true}
        /> */}
      </div>
    );
  }
}

export default Home;
