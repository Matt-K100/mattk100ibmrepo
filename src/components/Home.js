import React, { Component } from 'react';
import Sunburst from './Sunburst/Sunburst';
import jsonData from '../../public/data.json';
import * as d3 from 'd3';

export class Home extends Component {
  // set the default server side rendering value to false
  constructor(props) {
    super(props);
    this.state = {
      ssrDone: false,
      lastUpdated: 'loading...'
    };
  }

  //  because the app uses server side rendering and the sunburst doesn't support it,
  //  this method is a react function that will only render the sunburst client side
  componentDidMount() {
    // when server side rendering has complete, we set the prop to true
    this.setState({
      ssrDone: true,
      lastUpdated: jsonData.lastModified
    });

    // initialise sunburst and the colour scheme for it
    const myChart = Sunburst();
    const color = d3.scaleOrdinal(d3.schemePaired);

    // assinging the properties for the Sunburst chart
    myChart
      .width(750)
      .height(750)
      .minSliceAngle(0.4)
      .data(jsonData)
      .size('size')
      .color(d => color(d.name))
      .tooltipContent((d, node) => showTooltip(node))(
      // eslint-disable-next-line no-undef
      chart
    );

    // function that will show role details if outer sunburst else will just show value
    function showTooltip(node) {
      if (node.data.startDate === undefined) {
        return `Size: <i>${node.value}</i> `;
      } else {
        return `Band Low: <i>${node.data.bandLow}</i> <br>
        Band High: <i>${node.data.bandHigh}</i> <br>
        Number of Roles: <i>${node.data.size}</i> <br>
        Start Date: <i>${excelDateToString(node.data.startDate)}</i> <br>
        New Roadmap Status: <i>${node.data.roadmapStatus}</i>`;
      }
    }

    // converts the excel date to a string to show on the tooltip
    function excelDateToString(excelDate) {
      const date = new Date((excelDate - (25567 + 2)) * 86400 * 1000);
      return date.toString().substring(4, 15);
    }
  }

  render() {
    // if SSR has complete, we don't need to show the loading message anymore
    // and can just show the sunburst which will render client side
    if (this.state.ssrDone) {
      return (
        <div>
          <div id="chart" />
          <h6>Last Updated: {this.state.lastUpdated}</h6>
        </div>
      );
    } else {
      return (
        <div id="chart">
          <h1>Loading... Please wait</h1>
        </div>
      );
    }
  }
}

export default Home;
