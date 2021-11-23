# **STOCKMANAGER**

## Problem

1. Popular trading platforms like Robinhood dont have an option to visualize stock trends for all stocks in your portfolio simultaneously.

2. When there are a large number of stocks in your portfolio, it becomes difficult to keep track of the macro level trends of all stocks over say the duration of a month. Even a simple alert for stocks that see a negative price trend could be useful for the average non-hyperactive investor.

3. When plotting graphs for stocks simultaneously, a stock price (Y-axis) scaling issue becomes prominent. Ex : AMD (at 152 dollars at the time of writing) is seen to be a straight line without any actual recognizable micro level trends (though macro level trends are intuitive) in comparison to AMZN (at 3600 dollars at the time of writing), because Amazon dominates the scaling of the plot. This problem is ideally not solved by normalizing stock prices as this could be misleading at first glance.

---

## Solution

1. Create a simple interface, which is directly suggestive of stocks that have a seen a negative trend (losers) in the last 2 weeks. To facilitate this the overall portfolio (filled with tickers), is split into sections of sustained and alerted stocks. StockManager considers a stock a "loser" if it has been consistently falling in price in the last 2 weeks and has an overall fall in price.

2. Give users the option to see plots of either :

   - All stocks in their portfolio
   - Sustained stocks - Stocks whose prices have seen growth or have been sustained
   - Alerted Stocks - All "losers"

   In addition the graph is further toggleable:

   - The ability to further filter stocks within each sub type by simply deactivating their ticker in the graph legend. This forces the graph to auto-rescale for the remaining stocks.
   - The ability to zoom in on particular sections of the overall sub plot, this reveals some micro level trends in a macro level plot.

   The 2 level filteration aims to make it possible to very intuitively compare different stocks without the need to normalize their actual prices. Ex : if you have AMD, AAPL (159 dollars at the time of writing), AMZN and a few losing stocks in your portfolio (as suggested visually), simply click on sustained stocks and see trends for AMZN,AMD and AAPL (level 1 filteration). Further, since AMZN disrupts the graph scale, deactivate it (level 2 filteration) to reveal the comparable micro-level trends of AAPL and AMD (both in the similar price range). This is especially useful when viewing the trends of the "losers".

3. Provide a simple facility to read the latest news about the Companies whose stock you own. This allows you to be up-to-date with market happenings, company actions, business and economics to make an informed choice for your next steps in the share market.

---

## Stack

1. Frontend : React.js
2. Backend : Flask (Python)
3. Database : MongoDB Atlas (non-local)
