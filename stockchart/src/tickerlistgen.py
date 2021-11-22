import requests
from dotenv import load_dotenv
import os
load_dotenv()

response = requests.get(
    "https://finnhub.io/api/v1/stock/symbol?exchange=US&token={}".format(os.getenv("REACT_APP_FINNHUB_KEY")))
response = response.json()  # is now a list object
stock_list = [{'value': i["symbol"], 'label': i["description"]}
              for i in response if(i["type"] == "Common Stock" and i["mic"] == "XNYS")]  # only shares listed on the NYSE (NYSX is the MIC code)
f = open("stocktickers.js", "w")
f.write("var stocktickers = {};".format(stock_list))
# Writing everything to an importable JS file.
f.write("export default stocktickers;")
f.close()
print(len(stock_list), "Number of stock tickers added.")
