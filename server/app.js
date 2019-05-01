import path from 'path';
import express from 'express';
import upload from 'express-fileupload';
import compression from 'compression';
import helmet from 'helmet';
import morgan from 'morgan';
import responseTime from 'response-time';

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

app.use(renderServerSideApp);

app.use(upload());

app.post('/upload', (request, response) => {
  console.log('detected file upload in app.js');
  response.send('received some sort of data ' + request.files);
  // let uploadFile = req.files.file;
  // const fileName = req.files.file.name;
  // uploadFile.mv(`${__dirname}/public/${fileName}`, function(err) {
  //   if (err) {
  //     return res.status(500).send(err);
  //   }
  //   res.json({
  //     file: `public/${req.files.file.name}`
  //   });
  // });
});
