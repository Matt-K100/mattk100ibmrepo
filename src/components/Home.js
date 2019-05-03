import React, { Component } from 'react';
import { ResponsiveSunburst } from '@nivo/sunburst';
import jsonData from '../../public/data.json';

export class Home extends Component {
  render() {
    return (
      <div>
        <ResponsiveSunburst
          data={jsonData}
          margin={{
            top: 0,
            right: 0,
            bottom: 0,
            left: 0
          }}
          identity="name"
          value="size"
          height={500}
          width={500}
          colors="set3"
          animate={true}
          isInteractive={true}
        />
      </div>
    );
  }
}

export default Home;
