import path from 'path';
import express from 'express';
import upload from 'express-fileupload';
import compression from 'compression';
import helmet from 'helmet';
import morgan from 'morgan';
import responseTime from 'response-time';
import XLSX from 'xlsx';
import fs from 'fs';
import { renderServerSideApp } from './renderServerSideApp';

// This export is used by our initialization code in /scripts
export const app = express();
const { PUBLIC_URL = '' } = process.env;

app.use(compression());
app.use(helmet());

// Serve generated assets
app.use(
  PUBLIC_URL,
  express.static(path.resolve(__dirname, '../build'), {
    maxage: Infinity
  })
);

// Serve static assets in /public
app.use(
  PUBLIC_URL,
  express.static(path.resolve(__dirname, '../public'), {
    maxage: '30 days'
  })
);

app.use(morgan('tiny'));

app.use(
  responseTime((_req, res, time) => {
    res.setHeader('X-Response-Time', time.toFixed(2) + 'ms');
    res.setHeader('Server-Timing', `renderServerSideApp;dur=${time}`);
  })
);

app.use(upload());

// allows for file upload from client to server
app.post('/upload', (request, response) => {
  // get file and filename
  const fileName = request.files.file.name;
  const file = request.files.file.data;
  var outputData;

  // checks which file types to accept
  if (fileName.includes('xls')) {
    // open the file and assign which data we want
    const workbook = XLSX.read(file, { type: 'buffer' });
    const worksheet = workbook.Sheets['Basedata'];

    // change the data into a json file
    outputData = XLSX.utils.sheet_to_json(worksheet);

    // take out just the FSSUKI data from the JSON file
    for (var i = 0; i < outputData.length; i++) {
      outputData = outputData.filter(
        object => object['Sector + IMT + Service'].substring(0, 6) === 'FSSUKI'
      );
    }

    // build new JSONs for sunbursts
    const dataOne = buildTree(outputData, [
      'Smart Account Group Name',
      'NEW CLIENT NAME',
      'Workforce Type',
      'Seat/Role Title'
    ]);
    const dataTwo = buildTree(outputData, [
      'JR/S Service',
      'JR/S Practice',
      'NEW CLIENT NAME',
      'Workforce Type',
      'Seat/Role Title'
    ]);

    // assume success message unless error check in next line changes it
    var responseMessage = 'Successfully uploaded file: ' + fileName;

    // save the newly constructed JSONs to public folder
    fs.writeFile('./public/dataOne.json', JSON.stringify(dataOne), error => {
      if (error) {
        responseMessage = 'Technical error, please try again';
      }
    });
    fs.writeFile('./public/dataTwo.json', JSON.stringify(dataTwo), error => {
      if (error) {
        responseMessage = 'Technical error, please try again';
      }
    });

    // output message back to client side
    response.send(responseMessage);
  } else {
    // send response to client and don't do anything with the file if it's not correct format
    response.send('Unable to upload this file type');
  }
});

app.use(renderServerSideApp);

// method that returns JSON object for Sunburst given an array of headers and data
function buildTree(jsonData, arrayTitles) {
  // current date and time to display on front end
  const date = new Date().toLocaleString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric'
  });

  // the initialisation of the object
  let outputData = {
    name: 'Financial Services',
    lastModified: date,
    children: []
  };

  // loops through each row of data
  jsonData.forEach(function(data) {
    // initialise the levels
    let l1, l2, l3, l4, l5;
    for (var i = 0; i < arrayTitles.length; i++) {
      // initialise new object
      let newObject;

      // checks to see if it's the final object, if it is then returns all data otherwise just returns name and child
      if (i === arrayTitles.length - 1) {
        newObject = {
          name: data[arrayTitles[i]],
          size: 1,
          workforceType: data['Workforce Type'],
          newClientName: data['NEW CLIENT NAME'],
          smartAccountGroupName: data['Smart Account Group Name'],
          jobRoleSpecialty: data['Job Role/Specialty'],
          bandLow: data['Band Low'],
          bandHigh: data['Band High'],
          startDate: data['Start Date'],
          candidatesInPlay: data['Has Candidates in Play'],
          additionalComments: data['Additional Comments'],
          contractStatus: data['Contract Status'],
          csaID: data['CSA Request ID'],
          endDate: data['End Date'],
          jrsService: data['JR/S Service'],
          jrsPractice: data['JR/S Practice'],
          skillsToHave: data['Nice to Have Skills'],
          opportunityOwnerNotesId: data['Opportunity Owner Notes ID'],
          opportunityName: data['Opportunity Name'],
          ownerNotesId: data['Owner Notes ID'],
          planTotalRequiredPositions: data['Plan Total Required Positions'],
          positionDescription: data['Position Description'],
          projectDescription: data['Project Description'],
          roadmapStatus: data['New Roadmap Status'],
          projectName: data['Project Name'],
          projectContactEmail: data['Project Contact Email Address'],
          requiredSkills: data['Required Skills'],
          createdDate: data['Created Date'],
          hoursPerWeek: data['Hours Per Week'],
          workLocationCity: data['Work Location City'],
          metroHiringRequestId: data['Metro Hiring Request ID'],
          priorityRankingNumber: data['Priority Ranking Number'],
          urgentFlag: data['Urgent Flag'],
          urgentReason: data['Urgent Reason'],
          winOdds: data['Roadmap Status'],
          positionId: data['Position ID'],
          seatContractorCandidates: data['Seat Contractor Candidates'],
          seatIBMCandidates: data['Seat IBM Regular Candidates'],
          seatCandidatesNotSelected: data['Seat Candidates Not Selected'],
          seatCandidatesWithdrawn: data['Seat Candidates Withdrawn'],
          seatCandidatesProposed: data['Seat Candidates Proposed'],
          seatCandidatesSelected: data['Seat Candidates Selected']
        };
      } else {
        newObject = {
          name: data[arrayTitles[i]],
          children: []
        };
      }

      // checks which level to push the object to
      if (i === 0) {
        if (!checkExists(data[arrayTitles[i]], outputData.children)) {
          outputData.children.push(newObject);
        }
      } else if (i === 1) {
        l1 = findIndex(data[arrayTitles[i - 1]], outputData.children);
        if (
          !checkExists(data[arrayTitles[i]], outputData.children[l1].children)
        ) {
          outputData.children[l1].children.push(newObject);
        } else {
          if (i === arrayTitles.length - 1) {
            outputData.children[l1].children[
              findIndex(data[arrayTitles[i]], outputData.children[l1].children)
            ].size++;
          }
        }
      } else if (i === 2) {
        l2 = findIndex(
          data[arrayTitles[i - 1]],
          outputData.children[l1].children
        );
        if (
          !checkExists(
            data[arrayTitles[i]],
            outputData.children[l1].children[l2].children
          )
        ) {
          outputData.children[l1].children[l2].children.push(newObject);
        } else {
          if (i === arrayTitles.length - 1) {
            outputData.children[l1].children[l2].children[
              findIndex(
                data[arrayTitles[i]],
                outputData.children[l1].children[l2].children
              )
            ].size++;
          }
        }
      } else if (i === 3) {
        l3 = findIndex(
          data[arrayTitles[i - 1]],
          outputData.children[l1].children[l2].children
        );
        if (
          !checkExists(
            data[arrayTitles[i]],
            outputData.children[l1].children[l2].children[l3].children
          )
        ) {
          outputData.children[l1].children[l2].children[l3].children.push(
            newObject
          );
        } else {
          if (i === arrayTitles.length - 1) {
            outputData.children[l1].children[l2].children[l3].children[
              findIndex(
                data[arrayTitles[i]],
                outputData.children[l1].children[l2].children[l3].children
              )
            ].size++;
          }
        }
      } else if (i === 4) {
        l4 = findIndex(
          data[arrayTitles[i - 1]],
          outputData.children[l1].children[l2].children[l3].children
        );
        if (
          !checkExists(
            data[arrayTitles[i]],
            outputData.children[l1].children[l2].children[l3].children[l4]
              .children
          )
        ) {
          outputData.children[l1].children[l2].children[l3].children[
            l4
          ].children.push(newObject);
        } else {
          if (i === arrayTitles.length - 1) {
            outputData.children[l1].children[l2].children[l3].children[l4]
              .children[
              findIndex(
                data[arrayTitles[i]],
                outputData.children[l1].children[l2].children[l3].children[l4]
                  .children
              )
            ].size++;
          }
        }
      } else if (i === 5) {
        l5 = findIndex(
          data[arrayTitles[i - 1]],
          outputData.children[l1].children[l2].children[l3].children[l4]
            .children
        );
        if (
          !checkExists(
            data[arrayTitles[i]],
            outputData.children[l1].children[l2].children[l3].children[l4]
              .children[l5].children
          )
        ) {
          outputData.children[l1].children[l2].children[l3].children[
            l4
          ].children[l5].children.push(newObject);
        } else {
          if (i === arrayTitles.length - 1) {
            outputData.children[l1].children[l2].children[l3].children[l4]
              .children[l5].children[
              findIndex(
                data[arrayTitles[i]],
                outputData.children[l1].children[l2].children[l3].children[l4]
                  .children[l5].children
              )
            ].size++;
          }
        }
      }
    }
  });

  // returns the value back to where the function is called from
  return outputData;
}

// function that returns index value of a value in array
function findIndex(name, array) {
  for (var i = 0; i < array.length; i++) {
    if (array[i].name === name) {
      return i;
    }
  }
}

function checkExists(objectData, arrayData) {
  for (var i = 0; i < arrayData.length; i++) {
    if (objectData === arrayData[i]['name']) {
      return true;
    }
  }
  return false;
}
