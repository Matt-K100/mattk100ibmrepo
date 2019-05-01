import React from 'react';
import XLSX from 'xlsx';
// import Sunburst from "react-sunburst-d3-v4";

class Spreadsheet extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      fsData: {}
    };
    this.handleFile = this.handleFile.bind(this);
  }
  handleFile(file /*:File*/) {
    const reader = new FileReader();
    const rABS = !!reader.readAsBinaryString;
    reader.onload = e => {
      const bstr = e.target.result;
      const workbook = XLSX.read(bstr, { type: rABS ? 'binary' : 'array' });
      const worksheet = workbook.Sheets['Basedata'];
      this.setState({
        fsData: XLSX.utils.sheet_to_json(worksheet)
      });
      for (var i = 0; i < this.state.fsData.length; i++) {
        this.setState({
          fsData: this.state.fsData.filter(
            object =>
              object['Sector + IMT + Service'].substring(0, 6) === 'FSSUKI'
          )
        });
      }
      this.setState({
        fsData: buildTree(this.state.fsData)
      });
    };
    if (rABS) reader.readAsBinaryString(file);
    else reader.readAsArrayBuffer(file);
  }
  render() {
    return (
      <div>
        <div className="justify-content-center row py-3">
          <DataInput handleFile={this.handleFile} />
        </div>
        {/* <Sunburst
          data={this.state.fsData}
          onSelect={this.onSelect}
          scale="linear"
          showLabels="true"
          tooltipContent={
            <div
              class="sunburstTooltip"
              style={{
                position: "absolute",
                color: "black",
                zIndex: "10",
                background: "#e2e2e2",
                padding: "5px",
                textAlign: "center"
              }}
            />
          }
          tooltip
          tooltipPosition="right"
          keyId="anagraph"
          width="500"
          height="500"
        /> */}
      </div>
    );
  }
}

export default Spreadsheet;

class DataInput extends React.Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }
  handleChange(e) {
    const files = e.target.files;
    // eslint-disable-next-line react/prop-types
    if (files && files[0]) this.props.handleFile(files[0]);
  }
  render() {
    return (
      <form className="form-inline">
        <div className="form-group">
          <input
            type="file"
            className="form-control"
            id="file"
            accept={spreadsheetFiles}
            onChange={this.handleChange}
          />
        </div>
      </form>
    );
  }
}

const spreadsheetFiles = ['xlsx', 'xlsb', 'xlsm', 'xls'];

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
