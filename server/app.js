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

  // TO-DO: FIX FILE NAME INPUT
  // checks which file types to accept
  if (fileName != null) {
    // open the file and assign which data we want
    const workbook = XLSX.read(file, { type: 'buffer' });
    const worksheet = workbook.Sheets['Basedata'];

    // change the data into a json file
    outputData = XLSX.utils.sheet_to_json(worksheet);

    // take out just the FSSUKI data from the JSON file
    for (var i = 0; i < outputData.length; i++) {
      outputData.filter(
        object => object['Sector + IMT + Service'].substring(0, 6) === 'FSSUKI'
      );
    }

    // build new JSON suitable for sunburst
    outputData = buildTree(outputData);

    // assume success message unless error check in next line changes it
    var responseMessage = 'Successfully uploaded file: ' + fileName;

    // save outputData as a JSON to public folder
    fs.writeFile('./public/data.json', JSON.stringify(outputData), error => {
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

// method that returns object for Sunburst tree when you input the filtered FSSUKI JSON
function buildTree(data) {
  // the initialisation of the object
  let outputData = {
    name: 'FSSUKI',
    children: []
  };

  // first layer for smart account group name outputData.children
  for (var i = 0; i < data.length; i++) {
    if (
      !checkExists(data[i]['Smart Account Group Name'], outputData.children)
    ) {
      const sagnObject = {
        name: data[i]['Smart Account Group Name'],
        children: []
      };
      outputData.children.push(sagnObject);
    }

    // second layer for new client name outputData.children.children
    for (var j = 0; j < outputData.children.length; j++) {
      if (outputData.children[j].name === data[i]['Smart Account Group Name']) {
        if (
          !checkExists(
            data[i]['NEW CLIENT NAME'],
            outputData.children[j].children
          )
        ) {
          const ncmObject = {
            name: data[i]['NEW CLIENT NAME'],
            children: []
          };
          outputData.children[j].children.push(ncmObject);
        }
      }

      // third layer for workforce type outputData.children.children.children
      for (var k = 0; k < outputData.children[j].children.length; k++) {
        if (
          outputData.children[j].children[k].name === data[i]['NEW CLIENT NAME']
        ) {
          if (
            !checkExists(
              data[i]['Workforce Type'],
              outputData.children[j].children[k].children
            )
          ) {
            const wtObject = {
              name: data[i]['Workforce Type'],
              children: []
            };
            outputData.children[j].children[k].children.push(wtObject);
          }
        }

        // fourth layer for seat/role title outputData.children.children.children.children
        for (
          var l = 0;
          l < outputData.children[j].children[k].children.length;
          l++
        ) {
          if (
            outputData.children[j].children[k].children[l].name ===
              data[i]['Workforce Type'] &&
            outputData.children[j].children[k].name ===
              data[i]['NEW CLIENT NAME'] &&
            outputData.children[j].name === data[i]['Smart Account Group Name']
          ) {
            if (
              !checkExists(
                data[i]['Seat/Role Title'],
                outputData.children[j].children[k].children[l].children
              )
            ) {
              const srtObject = {
                name: data[i]['Seat/Role Title'],
                size: 1
              };
              outputData.children[j].children[k].children[l].children.push(
                srtObject
              );
            } else {
              // if seat/role title already exists then increments the size
              for (
                var m = 0;
                m <
                outputData.children[j].children[k].children[l].children.length;
                m++
              ) {
                if (
                  outputData.children[j].children[k].children[l].children[m][
                    'name'
                  ] === data[i]['Seat/Role Title']
                ) {
                  outputData.children[j].children[k].children[l].children[m]
                    .size++;
                }
              }
            }
          }
        }
      }
    }
  }
  return outputData;
}

function checkExists(objectData, arrayData) {
  for (var i = 0; i < arrayData.length; i++) {
    if (objectData === arrayData[i]['name']) {
      return true;
    }
  }
  return false;
}
