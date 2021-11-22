import yfinance as yf
from os import close
import os
from dotenv import load_dotenv
from flask import Flask, request
from numpy import e
import requests
import json
from datetime import datetime
import datetime as DT
from pymongo import MongoClient

app = Flask(__name__)
load_dotenv()

# function used by other routes to generate stock data (during initialrender or when a stock is added to the portfolio)


def stockdatagenerator(portfolioStocks):
    series_data = []
    stock_type = []
    dates = []
    for ticker in portfolioStocks:
        try:
            ticker_Obj = yf.Ticker(ticker)
            hist_Data = ticker_Obj.history(period="1mo", interval="1d")
            all_close_price = [round(i, 3) for i in hist_Data.Close]
            closeprices_last2weeks = all_close_price[-1:-15:-1][::-1]
            print(closeprices_last2weeks)
            print(all_close_price[len(all_close_price) -
                  14: len(all_close_price)])
            neg_count = 0
            total_sum = 0
            for i in range(len(closeprices_last2weeks) - 1):
                dif = closeprices_last2weeks[i+1] - closeprices_last2weeks[i]
                if dif < 0:
                    neg_count += 1
                total_sum = total_sum + dif
            print(neg_count, "number of negative changes")
            print(total_sum)
            is_loser = 0
            # if the number of negative differences is greater than half of the total number of differences &
            # if the total sum of differences is negative, the stock has been going down for the last 2 weeks.
            if neg_count > (len(closeprices_last2weeks)-1)//2 and total_sum < 0:
                print(ticker, "1")
                stock_type.append(ticker)
            dates = [str(i) for i in hist_Data.index]
            series_data.append({'name': ticker, 'data': all_close_price})
        except e:
            print(e)

    print(series_data)
    return {'x': dates, 'series': series_data, 'stockType': stock_type, 'tickers': portfolioStocks}


@app.route("/generatestockplot", methods=["POST", "GET"])
# for a single stock (As used by the front end)
def generateStockPlot():
    request_json = json.loads(request.data)
    print(request_json)
    selected_tickers = request_json.get("tickers")
    return stockdatagenerator(selected_tickers)


# route to generate data based on tickers stored in the MongoDB, identified by googleID(passed by frontend)
@app.route("/initialrender", methods=["POST"])
def initialrender():
    try:
        request_json = json.loads(request.data)
        googleID = request_json.get("googleID")
        cluster_client = MongoClient(
            "mongodb+srv://{}@cluster0.21gmq.mongodb.net/myFirstDatabase?retryWrites=true&w=majority".format(os.getenv("CLIENT_AUTH_DB")))
        database = cluster_client["userTickers"]
        lastTickers_collection = database["lastTickers"]
        user = lastTickers_collection.find_one({"googleID": googleID})
        # code to read data from mongo and get tickers if user exists in database, else create a new user whose ticker list is blank
        if user:
            tickers = user["tickers"]
            print(str(tickers) + " " + "for user : " + googleID)
            return stockdatagenerator(tickers)
        else:
            # adding a record of the user so it can be updated later.
            print("User not found, Creating new user")
            lastTickers_collection.insert_one(
                {'googleID': googleID, 'tickers': []})
            return {'x': [], 'series': [], 'stockType': []}
    except Exception as e:
        print(e)
        return {}


# route to update tickers stored in database for the user.
@app.route("/updateDatabase", methods=["POST"])
def updateTickers():
    try:
        request_json = json.loads(request.data)
        newtickers = request_json.get("tickers")
        googleID = request_json.get("googleID")
        cluster_client = MongoClient(
            "mongodb+srv://{}@cluster0.21gmq.mongodb.net/myFirstDatabase?retryWrites=true&w=majority".format(os.getenv("CLIENT_AUTH_DB")))
        database = cluster_client["userTickers"]
        lastTickers_collection = database["lastTickers"]
        lastTickers_collection.update_one(
            {'googleID': googleID}, {"$set": {'tickers': newtickers}})
        return {}
    except Exception as e:
        print(e)
    pass

# route to generate news from stock tickers (if can be found by the API)


@app.route("/news", methods=["POST"])
def genNews():
    try:
        today = DT.date.today()
        last_weekdate = today - DT.timedelta(days=7)
        print(today, last_weekdate)
        # to get news between today and the last week.
        string_today = str(today)
        string_last_week = str(last_weekdate)
        tickers = json.loads(request.data)["tickers"]
        all_stock_news = {}  # dictionary to hold the first 25 news articles from each ticker
        for ticker in tickers:
            all_news = requests.get(
                "https://finnhub.io/api/v1/company-news?symbol={}&from={}&to={}&token={}".format(ticker, string_last_week, string_today, os.getenv("FINNHUB_KEY"))).json()
            all_stock_news[ticker] = all_news[0:25]  # first 25 articles.
        return all_stock_news
    except Exception as e:
        print(e)
        return {}


if __name__ == "__main__":
    app.run(debug=True, port='8000')
