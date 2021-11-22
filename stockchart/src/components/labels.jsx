import React, { Component } from "react";
import { Segment, Button, Icon, Label, Popup } from "semantic-ui-react";
import "semantic-ui-css/semantic.min.css";
import 'bootstrap'

// Defining each stock tag (to be rendered either in the sustained or alerted stock section)
class StockLabel extends React.Component {
  render() {
    console.log("Tried to Render Segment", this.props.stockName);
    if (this.props.stockName) {
      if (this.props.prices) {
        console.log("Month prices for", this.props.stockName, "Receieved");
        const priceData = JSON.parse(this.props.prices).data;
        const monthStart = priceData[0];
        const monthEnd = priceData.slice(-1)[0];
        const percentageChange = (
          ((monthEnd - monthStart) * 100) /
          monthStart
        ).toFixed(2);
        console.log(
          "Percentage change of",
          this.props.stockName,
          "is",
          percentageChange
        );
        const spanColor = percentageChange >= 0 ? "#39FF14" : "#F72119";
        return (
          <Segment
            textAlign="left"
            raised
            clearing
            inverted
            className="mt-1"
            className="text-bold"
          >
            <Label
              color="black"
              size="huge"
              className="text-white"
              textAlign="center"
            >
              {this.props.stockName}
            </Label>
            <Popup
              inverted
              content={
                this.props.stockName +
                (percentageChange >= 0 ? " Up " : " down ") +
                Math.abs(percentageChange) +
                "% In the last month "
              }
              trigger={
                <span
                  className=""
                  style={{
                    backgroundColor: "black",
                    color: spanColor,
                    fontWeight: "bold",
                    fontSize: "",
                  }}
                >
                  {Math.abs(percentageChange).toString() + "%"}
                </span>
              }
            />
            {percentageChange >= 0 ? (
              <Icon name="arrow up" color="green" />
            ) : (
              <Icon name="arrow down" color="red" />
            )}
            <Button
              className="mt-0.5"
              animated="vertical"
              onClick={() => this.props.clickFunc(this.props.stockName)}
              floated="right"
            >
              <Button.Content visible>
                <Icon name="close"></Icon>
              </Button.Content>
              <Button.Content className = "text-danger" hidden>
                Remove
              </Button.Content>
            </Button>
          </Segment>
        );
      } else {
        return <div></div>;
      }
    } else {
      return <div></div>;
    }
  }
}

export default StockLabel;
