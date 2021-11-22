import React, { Component } from 'react'
// import React, { useState, useEffect } from 'react';

class DataDisplay extends React.Component {

    constructor(){
        super();
        this.state = {
            jsonData : ""
        }
    }

    async componentDidMount(){
        const stockData = await fetch("http://localhost:5000/stockadata", {
            method: "GET",
            mode: "no-cors"
        })
        .then(response => {
            return response.json()
        });
        this.setState({
            jsonData: stockData
        })
        console.log(this.state.jsonData);
        
    }
    render() { 
        return <div>{JSON.stringify(this.state.jsonData)}</div>;
    }
}
 
export default DataDisplay;