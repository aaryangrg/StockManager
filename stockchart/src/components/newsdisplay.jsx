import { throwStatement } from "@babel/types";
import React, { Component } from "react";
import {
  Card,
  Header,
  Image,
  Dimmer,
  Segment,
  Loader,
} from "semantic-ui-react";



class NewsPage extends React.Component {
  state = {
    tickers: this.props.tickers,
    allNews: [],
  };
  //function to generate cards containing news articles for each Stock/Company.
  genComponentForStock(articleList) {
    console.log(articleList);
    var articleCards = [];
    var stock = articleList[0]["related"];
    for (let j = 0; j < articleList.length; j++) {
      const publishDate = new Date((articleList[j]["datetime"]*1000))
      const year = publishDate.getFullYear()
      var month = publishDate.getMonth() +1
      var day = publishDate.getDate()
      if (day < 10) {
        day = "0"+ day.toString()
      }else if(month < 10){
        month = "0"+month.toString()
      }
      const card = (
        <div
          style={{
            display: "inline-block",
            marginLeft: "10px",
            backgroundColor: "white",
            padding: 2,
            borderRadius: 6,
          }}
        >
          <Card href = {articleList[j]["url"]} className= "text-wrap" style = {{textDecoration : "none"}}>
            <Image src={ articleList[j]["image"].length ? articleList[j]["image"] : "https://media.istockphoto.com/vectors/newspaper-cover-page-vector-id187925868?k=20&m=187925868&s=612x612&w=0&h=xn8eHpzq2KMomzY5YROMoKSZKxcYWNjGZOw25cUV28Y="} ui = {false} style = {{height :  "200px"}}/>
            <Card.Content style = {{height : "246px"}}>
              <Card.Header>
                <Header as="h5">
                  {articleList[j]["source"] + ": " + articleList[j]["headline"]}
                </Header>
              </Card.Header>
              <Card.Meta>{"Published on : " + day+"-"+month+"-"+year}</Card.Meta>
              <Card.Description>{articleList[j]["summary"]}</Card.Description>
            </Card.Content>
          </Card>
        </div>
      );
      articleCards.push(card);
    }
    //each individual black segment to contain all the article cards of each stock
    return (
      <div
        style={{
          height: 350,
          overflowX: "scroll",
          whiteSpace: "nowrap",
          backgroundColor: "black",
          marginLeft: 10,
          marginRight: 10,
          marginBottom: 6,
          borderRadius: 10,
          padding: 4,
        }}
        className= "m"
      >
        <Header
          size="huge"
          className = "mt-2 mb-1"
          color="grey"
          style={{ padding: 10 }}
        >
          {stock}
        </Header>{" "}
        {articleCards}
      </div>
    );
  }

  render() {
    //rendering each stock-segment in an overall div
    if (this.state.allNews.length === 0 && this.state.tickers.length !== 0) {
      var div_list = [];
      fetch("/news", {
        method: "POST",
        body: JSON.stringify({ tickers: this.state.tickers }),
      })
        .then((response) => (response = response.json()))
        .then((tickers) => {
          for (let i = 0; i < this.state.tickers.length; i++) {
            if (tickers[this.state.tickers[i]].length !== 0) {
              div_list.push(
                this.genComponentForStock(tickers[this.state.tickers[i]])
              );
            }
          }
          console.log(div_list, "DIV LIST IN FETCH");
          this.setState({ allNews: div_list });
        });
      return (
        <div>
          <Segment>
            <Dimmer active>
              <Loader />
            </Dimmer>
            <Image src="https://react.semantic-ui.com/images/wireframe/short-paragraph.png" />
          </Segment>
          </div>
      );
    } else {
      return <div className="m-2">{this.state.allNews}</div>;
    }
  }
}

export default NewsPage;