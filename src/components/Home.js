import React, { Component } from 'react';
import Sunburst from './Sunburst/Sunburst';
import jsonDataOne from '../../public/data.json';
import * as d3 from 'd3';
import { Container, Row, Col } from 'react-bootstrap';

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
    // set a variable of this to thisContext to be used when setting state
    const thisContext = this;

    // when server side rendering has complete, we set the prop to true
    this.setState({
      ssrDone: true,
      lastUpdated: jsonDataOne.lastModified
    });

    // initialise sunburst and the colour scheme for it
    const sunburstOne = Sunburst();
    const sunburstTwo = Sunburst();
    const color = d3.scaleOrdinal(d3.schemePaired);

    // assinging the properties for the 1st Sunburst chart
    sunburstOne
      .width(750)
      .height(750)
      .minSliceAngle(0.4)
      .data(jsonDataOne)
      .size('size')
      .color(d => color(d.name))
      .tooltipContent((d, node) => showTooltip(node))(
      // eslint-disable-next-line no-undef
      sunburst1
    );

    // assinging the properties for the 2nd Sunburst chart
    sunburstTwo
      .width(750)
      .height(750)
      .minSliceAngle(0.4)
      .data(jsonDataOne)
      .size('size')
      .color(d => color(d.name))
      .tooltipContent((d, node) => showTooltip(node))(
      // eslint-disable-next-line no-undef
      sunburst2
    );

    // function that will show role details if outer sunburst else will just show value
    function showTooltip(node) {
      if (node.data.startDate === undefined) {
        return `Size: <i>${node.value}</i> `;
      } else {
        showDetails(node.data);
        return `Band Low: <i>${thisContext.state.bandLow}</i> <br>
        Band High: <i>${thisContext.state.bandHigh}</i> <br>
        Number of Roles: <i>${thisContext.state.numberOfRoles}</i> <br>
        Start Date: <i>${excelDateToString(
          thisContext.state.startDate
        )}</i> <br>
        New Roadmap Status: <i>${thisContext.state.roadmapStatus}</i>`;
      }
    }

    // function to show further details of the role on the side of the sunburst
    function showDetails(data) {
      thisContext.setState({
        workforceType: data.workforceType,
        newClientName: data.newClientName,
        smartAccountGroupName: data.smartAccountGroupName,
        jobRoleSpecialty: data.jobRoleSpecialty,
        bandLow: data.bandLow,
        bandHigh: data.bandHigh,
        candidatesInPlay: data.candidatesInPlay,
        startDate: data.startDate,
        createdDate: data.createdDate,
        additionalComments: data.additionalComments,
        contractStatus: data.contractStatus,
        csaID: data.csaID,
        endDate: data.endDate,
        jrsService: data.jrsService,
        jrsPractice: data.jrsPractice,
        numberOfRoles: data.size,
        skillsToHave: data.skillsToHave,
        opportunityName: data.opportunityName,
        opportunityOwnerNotesId: data.opportunityOwnerNotesId,
        ownerNotesId: data.ownerNotesId,
        planTotalRequiredPositions: data.planTotalRequiredPositions,
        projectName: data.projectName,
        positionDescription: data.positionDescription,
        priorityRankingNumber: data.priorityRankingNumber,
        projectDescription: data.projectDescription,
        projectContactEmail: data.projectContactEmail,
        requiredSkills: data.requiredSkills,
        roadmapStatus: data.roadmapStatus,
        hoursPerWeek: data.hoursPerWeek,
        seatRoleTitle: data.name,
        urgentFlag: data.urgentFlag,
        urgentReason: data.urgentReason,
        winOdds: data.winOdds,
        workLocationCity: data.workLocationCity,
        metroHiringRequestId: data.metroHiringRequestId,
        seatContractorCandidates: data.seatContractorCandidates,
        seatIBMCandidates: data.seatIBMCandidates,
        seatCandidatesNotSelected: data.seatCandidatesNotSelected,
        seatCandidatesWithdrawn: data.seatCandidatesWithdrawn,
        seatCandidatesSelected: data.seatCandidatesSelected,
        seatCandidatesProposed: data.seatCandidatesProposed
      });
    }
  }

  render() {
    // if SSR has complete, we don't need to show the loading message anymore
    // and can just show the sunburst which will render client side
    if (this.state.ssrDone) {
      return (
        <div>
          <Container>
            <Row className="display-flex">
              <Col>
                <h6>Sunburst One</h6>
                <div id="sunburst1" />
                <h6>Sunburst Two</h6>
                <div id="sunburst2" />
              </Col>
              <Col>
                <div>
                  <h6>Details</h6>
                  <table border="1rem">
                    <tbody>
                      <tr>
                        <td className="small-column">Seat Role Title</td>
                        <td className="big-column">
                          {this.state.seatRoleTitle}
                        </td>
                      </tr>
                      <tr>
                        <td>New Client Name</td>
                        <td>{this.state.newClientName}</td>
                      </tr>
                      <tr>
                        <td>Jobe Role Specialty</td>
                        <td>{this.state.jobRoleSpecialty}</td>
                      </tr>
                      <tr>
                        <td>Band Low</td>
                        <td>{this.state.bandLow}</td>
                      </tr>
                      <tr>
                        <td>Band High</td>
                        <td>{this.state.bandHigh}</td>
                      </tr>
                      <tr>
                        <td>Start Date</td>
                        <td>{excelDateToString(this.state.startDate)}</td>
                      </tr>
                      <tr>
                        <td>End Date</td>
                        <td>{excelDateToString(this.state.endDate)}</td>
                      </tr>
                      <tr>
                        <td>Work Location City</td>
                        <td>{this.state.workLocationCity}</td>
                      </tr>
                      <tr>
                        <td>Position Description</td>
                        <td>{this.state.positionDescription}</td>
                      </tr>
                      <tr>
                        <td>Workforce Type</td>
                        <td>{this.state.workforceType}</td>
                      </tr>
                      <tr>
                        <td>Smart Account Group Name</td>
                        <td>{this.state.smartAccountGroupName}</td>
                      </tr>
                      <tr>
                        <td>Created Date</td>
                        <td>{excelDateToString(this.state.createdDate)}</td>
                      </tr>
                      <tr>
                        <td>Candidates in Play</td>
                        <td>{this.state.candidatesInPlay}</td>
                      </tr>
                      <tr>
                        <td>Additional Comments</td>
                        <td>{this.state.additionalComments}</td>
                      </tr>
                      <tr>
                        <td>Contract Status</td>
                        <td>{this.state.contractStatus}</td>
                      </tr>
                      <tr>
                        <td>CSA ID</td>
                        <td>{this.state.csaID}</td>
                      </tr>
                      <tr>
                        <td>JR/S Service</td>
                        <td>{this.state.jrsService}</td>
                      </tr>
                      <tr>
                        <td>JR/S Practice</td>
                        <td>{this.state.jrsPractice}</td>
                      </tr>
                      <tr>
                        <td>Number of Roles</td>
                        <td>{this.state.numberOfRoles}</td>
                      </tr>
                      <tr>
                        <td>Nice Skills to Have</td>
                        <td>{this.state.skillsToHave}</td>
                      </tr>
                      <tr>
                        <td>Required Skills</td>
                        <td>{this.state.requiredSkills}</td>
                      </tr>
                      <tr>
                        <td>Opportunity Name</td>
                        <td>{this.state.opportunityName}</td>
                      </tr>
                      <tr>
                        <td>Opportunity Owner Notes ID</td>
                        <td>{this.state.opportunityOwnerNotesId}</td>
                      </tr>
                      <tr>
                        <td>Owner Notes ID</td>
                        <td>{this.state.ownerNotesId}</td>
                      </tr>
                      <tr>
                        <td>Plan Total Required Positions</td>
                        <td>{this.state.planTotalRequiredPositions}</td>
                      </tr>
                      <tr>
                        <td>Project Name</td>
                        <td>{this.state.projectName}</td>
                      </tr>
                      <tr>
                        <td>Project Description</td>
                        <td>{this.state.projectDescription}</td>
                      </tr>
                      <tr>
                        <td>Project Contact Email</td>
                        <td>{this.state.projectContactEmail}</td>
                      </tr>
                      <tr>
                        <td>Priority Ranking Number</td>
                        <td>{this.state.priorityRankingNumber}</td>
                      </tr>
                      <tr>
                        <td>Roadmap Status</td>
                        <td>{this.state.roadmapStatus}</td>
                      </tr>
                      <tr>
                        <td>Hours Per Week</td>
                        <td>{this.state.hoursPerWeek}</td>
                      </tr>
                      <tr>
                        <td>Urgent Flag</td>
                        <td>{this.state.urgentFlag}</td>
                      </tr>
                      <tr>
                        <td>Urgent Reason</td>
                        <td>{this.state.urgentReason}</td>
                      </tr>
                      <tr>
                        <td>Win Odds</td>
                        <td>{this.state.winOdds}</td>
                      </tr>
                      <tr>
                        <td>Metro Hiring Request ID</td>
                        <td>{this.state.metroHiringRequestId}</td>
                      </tr>
                      <tr>
                        <td>Seat Contractor Candidates</td>
                        <td>{this.state.seatContractorCandidates}</td>
                      </tr>
                      <tr>
                        <td>Seat IBM Candidates</td>
                        <td>{this.state.seatIBMCandidates}</td>
                      </tr>
                      <tr>
                        <td>Seat Candidates Not Selected</td>
                        <td>{this.state.seatCandidatesNotSelected}</td>
                      </tr>
                      <tr>
                        <td>Seat Candidates Withdrawn</td>
                        <td>{this.state.seatCandidatesWithdrawn}</td>
                      </tr>
                      <tr>
                        <td>Seat Candidates Selected</td>
                        <td>{this.state.seatCandidatesSelected}</td>
                      </tr>
                      <tr>
                        <td>Seat Candidates Proposed</td>
                        <td>{this.state.seatCandidatesProposed}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </Col>
            </Row>
          </Container>
          <h6 className="footer-overlap">
            Last Updated: {this.state.lastUpdated}
          </h6>
        </div>
      );
    } else {
      return (
        <div>
          <Container>
            <Row>
              <Col>
                <h6>Sunburst One</h6>
                <div id="sunburst1" />
                <h6>Sunburst Two</h6>
                <div id="sunburst2" />
              </Col>
              <Col>
                <h1>Loading... Please wait</h1>
              </Col>
            </Row>
          </Container>
        </div>
      );
    }
  }
}

// converts the excel date to a string to show on the tooltip
function excelDateToString(excelDate) {
  if (excelDate === undefined) {
    return;
  }
  const date = new Date((excelDate - (25567 + 2)) * 86400 * 1000);
  return date.toString().substring(4, 15);
}

export default Home;
