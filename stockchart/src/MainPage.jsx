import React, { Component } from "react";
import ChartsDisplay from "./components/charts";
import stocktickers from "./stocktickers";
import StockLabel from "./components/labels";
import {
  Grid,
  SegmentGroup,
  Segment,
  Header,
  Icon,
  Button,
  GridRow,
} from "semantic-ui-react";
import "semantic-ui-css/semantic.min.css";
import WindowedSelect from "react-windowed-select";
import { Tab, Divider, Card } from "semantic-ui-react";
import NewsPage from "./components/newsdisplay";
import { GoogleLogout } from "react-google-login";
import { Link } from "react-router-dom";

const options = stocktickers;

class MainPage extends React.Component {
  state = {
    googleID: "" /*google account ID*/,
    initialRender: 0 /* session variable determines if inital render data has been recieved*/,
    currentPage: "onPortfolioPage",
    graphDiplayed: "portfolio",
    losingTickers: new Array() /* stocks going down for 2 weeks*/,
    tickers: new Array() /*all ticker names in portfolio*/,
    data: { x: new Array(), series: new Array() } /*all data*/,
  };

  //consider adding data to the local storage during initial render, if refreshed take data from localStorage (Clear it when closed or logging out)
  componentWillMount() {
    // if(localStorage.getItem("Initial State")){
    // const prevLoginState = JSON.parse(localStorage.getItem("Initial State"))
    // const lastPortfolioStocks =  prevLoginState["tickers"]
    // this.setState({tickers : lastPortfolioStocks})
    //    fetch("/generatestockplot", {method: "POST", body : JSON.stringify({tickers : lastPortfolioStocks})}).then(response => response.json()).then(datajson => {this.setState({data: { 'x' : datajson.x , 'series': datajson.series}}); this.setState({losingTickers : datajson.stockType})})
    // }
    this.setState({ googleID: this.props.googleID });
    fetch("/initialrender", {
      method: "POST",
      body: JSON.stringify({ googleID: this.props.googleID }),
    })
      .then((response) => response.json())
      .then((datajson) => {
        console.log("Reached here");
        console.log(datajson , "Logging response from server in initial render")
        if (datajson.series.length) {
          this.setState({ data: { x: datajson.x, series: datajson.series } });
          this.setState({ losingTickers: datajson.stockType });
          this.setState({ tickers: datajson.tickers });
        }
        this.setState({ initialRender: 1 });
      });
    console.log("Sent Inital Render request.")
  }

  componentDidUpdate(prevProps, prevState) {
    // prevState.tickers !== this.state.tickers
    if (this.state.initialRender === 1) {
      /*only get data if new ticker is added to tickers (not recalling API if ticker is removed) */
      if (
        this.state.tickers.filter(
          (ticker) => prevState.tickers.indexOf(ticker) < 0
        ).length !== 0 &&
        this.state.tickers.length > prevState.tickers.length
      ) {
        console.log("Tickers Changed , Fetching new Data for Plot");
        fetch("/generatestockplot", {
          method: "POST",
          body: JSON.stringify({ tickers: this.state.tickers.slice(-1) }),
        })
          .then((response) => response.json())
          .then((datajson) => {
            this.setState({
              data: {
                x: datajson.x,
                series: this.state.data.series.concat(datajson.series),
              },
            });
            if (datajson["stockType"].length) {
              this.setState({
                losingTickers: this.state.losingTickers.concat(
                  datajson.stockType[0]
                ),
              });
            }
          }); /*change this to post request with tickers list*/
      }
    }
    
    /* if tickers change we need to update the database with all the new tickers*/
    if (prevState.tickers !== this.state.tickers) {
      console.log("Updated DATABASE");
      fetch("/updateDatabase", {
        method: "POST",
        body: JSON.stringify({
          tickers: this.state.tickers,
          googleID: this.state.googleID,
        }),
      });
    }
  }

  // Removing a stock from your portfolio
  handleRemoveStock = (stockName) => {
    this.setState({
      tickers: this.state.tickers.filter((ticker) => ticker !== stockName),
    });
    this.setState({
      losingTickers: this.state.losingTickers.filter(
        (ticker) => ticker !== stockName
      ),
    });
    this.setState({
      data: {
        x: this.state.data.x,
        series: this.state.data.series.filter(
          (ticker) => ticker.name !== stockName
        ),
      },
    });
  };

  handleSelect = (selectedOption) => {
    var currentTickers = this.state.tickers;
    if(currentTickers.indexOf(selectedOption.value) < 0 ){
    this.setState({ tickers: currentTickers.concat(selectedOption.value) });
    console.log(currentTickers.concat(selectedOption.value));
    }else{
      console.log("Added ticker already in portfolio")
    }
    /*Only update tickers list if the ticker isnt already in list*/
  };

  // Setting the graph choice based on container chosen
  handleContainerClick = (graphDiplayed) => {
    this.setState({ graphDiplayed: graphDiplayed });
  };

  //  which kind of graph to display based on user choice
  detGraphData() {
    if (this.state.graphDiplayed === "portfolio") {
      return [this.state.data.series, "ALL STOCKS", "purple"];
    } else if (this.state.graphDiplayed === "losing") {
      return [
        this.state.data.series.filter(
          (dataObj) => this.state.losingTickers.indexOf(dataObj.name) >= 0
        ),
        "ALERTED STOCKS",
        "red",
      ];
    } else if (this.state.graphDiplayed === "sustained") {
      return [
        this.state.data.series.filter(
          (dataObj) => this.state.losingTickers.indexOf(dataObj.name) < 0
        ),
        "SUSTAINED STOCKS",
        "green",
      ];
    }
  }

  // To choose which page to render (portfolio or News)
  handleMainMenu(page) {
    this.setState({ currentPage: page });
    console.log("Back to Portfolio Page");
  }

  render() {
    // Updating the localStorage with each Re-render to stay fully up-to-date
    // localStorage.removeItem("Initial State")
    // localStorage.setItem("Initial State" , JSON.stringify(this.state))
    // Determining page to be displayed based on menu buttons
    if (this.state.initialRender) {
      if (this.state.currentPage === "onPortfolioPage") {
        console.log(
          "Re-rendering",
          this.state.tickers,
          this.state.data,
          "Current Losing Tickers",
          this.state.losingTickers
        );
        var tickerTags = this.state.tickers
          .filter((ticker) => this.state.losingTickers.indexOf(ticker) < 0)
          .map((ticker) => (
            <StockLabel
              stockName={ticker}
              clickFunc={this.handleRemoveStock}
              key={ticker}
              prices={JSON.stringify(
                this.state.data.series.filter(
                  (stock) => stock.name === ticker
                )[0]
              )}
            ></StockLabel>
          )); /*re-rendering all tickers in case of change*/
        var losingTickerTags = this.state.losingTickers.map((ticker) => (
          <StockLabel
            stockName={ticker}
            clickFunc={this.handleRemoveStock}
            key={ticker}
            prices={JSON.stringify(
              this.state.data.series.filter((stock) => stock.name === ticker)[0]
            )}
          ></StockLabel>
        ));
        var dataForGraph = this.detGraphData();
        console.log(dataForGraph);
        return (
          <Grid divided>
            <Grid.Row className="m-1">
              <Grid.Column width={7}>
                <Button
                  fluid
                  color="black"
                  onClick={() => this.handleMainMenu("onPortfolioPage")}
                >
                  <div style={{ marginRight: 8, display: "inline-block" }}>
                    PORTFOLIO
                  </div>
                  <Icon name="shopping cart" color="white"></Icon>
                </Button>
              </Grid.Column>
              <Grid.Column width={7}>
                <Button fluid onClick={() => this.handleMainMenu("onNewsPage")}>
                  <div
                    style={{ marginRight: 8, display: "inline-block" }}
                    className="text-black"
                  >
                    NEWS
                  </div>
                  <Icon name="newspaper outline" color="black"></Icon>
                </Button>
              </Grid.Column>
              <Grid.Column width={2}>
                <GoogleLogout
                  clientId="437083341130-f8kunsbdl0b606ml89te6p5favuvrn09.apps.googleusercontent.com"
                  render={(renderProps) => (
                    <Button fluid color="red" as = {Link} to = "/login">
                        LOGOUT <Icon name="google icon" style = {{marginLeft : 1}}></Icon>
                    </Button>
                  )}
                  onLogoutSuccess={() => console.log("Successfully logged out")}
                  onLogoutFailure={(err) => console.log(err)}
                />
              </Grid.Column>
            </Grid.Row>
            <Grid.Row>
              <div className></div>
              <Grid.Column width={12}>
                <div className="m-4"></div>
                <div className="m-4"></div>
                <div className="m-3">
                  <Header size="huge" color={dataForGraph[2]}>
                    {dataForGraph[1]}
                  </Header>
                  <ChartsDisplay
                    xcoords={this.state.data.x}
                    series={dataForGraph[0]}
                    className="m-4"
                    id="ChartDisplay"
                  ></ChartsDisplay>
                </div>
              </Grid.Column>
              <Grid.Column width={4} textAlign="center">
                <WindowedSelect
                  options={options}
                  onChange={this.handleSelect}
                  placeholder="Add Stock"
                />
                <div
                  id="portfolio"
                  onClick={() => {
                    this.handleContainerClick("portfolio");
                  }}
                >
                  <Header size="large" block color="purple">
                    {" "}
                    PORTFOLIO <Icon name="chart line"></Icon>
                  </Header>
                </div>
                <Divider />
                <div
                  id="sustained"
                  onClick={() => {
                    this.handleContainerClick("sustained");
                  }}
                  style={{
                    borderStyle: "solid",
                    borderWidth: 2,
                    borderColor: "black",
                    padding: 10,
                    borderRadius: 10,
                  }}
                >
                  <Header size="medium" color="green">
                    <Icon name="check"></Icon>
                  </Header>
                  <div
                    style={{
                      overflowY: "scroll",
                      height: 260,
                      backgroundColor: "#D3D3D3",
                      borderRadius: 10,
                    }}
                  >
                    {" "}
                    {tickerTags}
                  </div>{" "}
                  {/* div for non-losing stocks */}
                </div>
                <Divider />
                <div
                  id="losing"
                  onClick={() => {
                    this.handleContainerClick("losing");
                  }}
                  style={{
                    borderStyle: "solid",
                    borderWidth: 2,
                    borderColor: "black",
                    padding: 10,
                    borderRadius: 10,
                  }}
                >
                  <Header size="medium" color="red">
                    <Icon name="exclamation"></Icon>
                  </Header>
                  <div
                    style={{
                      overflowY: "scroll",
                      height: 260,
                      backgroundColor: "#D3D3D3",
                      borderRadius: 10,
                    }}
                  >
                    {losingTickerTags}
                  </div>
                </div>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        );
      } else if (this.state.currentPage === "onNewsPage") {
        return (
          <Grid divided>
            <Grid.Row className="m-1">
              <Grid.Column width={8}>
                <Button
                  fluid
                  onClick={() => this.handleMainMenu("onPortfolioPage")}
                >
                  <div
                    style={{ marginRight: 8, display: "inline-block" }}
                    className="text-black"
                  >
                    PORTFOLIO
                  </div>
                  <Icon name="shopping cart" color="black"></Icon>
                </Button>
              </Grid.Column>
              <Grid.Column width={8}>
                <Button
                  fluid
                  color="black"
                  onClick={() => this.handleMainMenu("onNewsPage")}
                >
                  <div style={{ marginRight: 8, display: "inline-block" }}>
                    NEWS
                  </div>
                  <Icon name="newspaper outline" color="white"></Icon>
                </Button>
              </Grid.Column>
            </Grid.Row>
            <Grid.Row>
              <NewsPage tickers={this.state.tickers} />
            </Grid.Row>
          </Grid>
        );
      }
    } else {
      return <div></div>;
    }
  }
}

// prices = {JSON.stringify(this.state.data.series.filter(stock => stock.name === ticker)[0])}
export default MainPage;
