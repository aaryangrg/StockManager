import React, { Component } from "react";
import Chart from "react-apexcharts";
import data from "../config"
class ChartsDisplay extends Component {
  constructor(props) {
    super(props);
    this.state = {
      options: {
        chart: {
          id: "stockdata-chart"
        },
        xaxis: {
          categories: this.props.xcoords
        },
        colors : data["LINE COLORS"],
        stroke: {
            show: true,
            width: 4
            }
      },
      series: this.props.series
    };
  }

  componentDidUpdate(prevProps) {
    if (this.props.series !== prevProps.series) {
      const seriesData = this.props.series // this.props.series is returned as type object rather than an array.
      this.setState({options : {
        chart: {
          id: "stockdata-chart"
        },
        xaxis: {
          categories: this.props.xcoords
        }
      }});
      this.setState({series : seriesData});
    }
    console.log("Component Update of Graph Class Called.", this.props)
    }

  render(){
    return (
          <div>
            <Chart
              options={this.state.options}
              series={this.state.series}
              type="line"
              height=  "700"
              width="1050"
               />
          </div>
    );
  }
}

export default ChartsDisplay;