'use strict';
const axios = require('axios');
const anonymize = require('ip-anonymize');
const Stock = require('../models/stock');
module.exports = function (app) {

  app.route('/api/stock-prices')
    .get(async function (req, res){
      let stocks = req['query'].stock;
      if(typeof stocks == "string"){
        // ensure consistency for when both one and two stocks are entered
        stocks = [stocks];
      }

      let stockDatas = [];
      for(let stock of stocks){
        // get stock data from provided api
        let stockData = await axios.get('https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/' + stock 
        + '/quote',{ headers: { 'Accept-Encoding': 'text/html; charset=UTF-8',}}).catch(function(error){return false;});
        stockData = stockData.data;
        // above catch is to handle inconsistent behavior from the api which is inconsistent on wether it returns error or not.
        if(!stockData || stockData == 'Unknown symbol' || stockData == 'Invalid symbol'){
          return res.send({stockData: `Stock ${stock} does not exist`});
        }
        
        try{
          stockDatas.push({"stock": stockData.symbol, "price": stockData.latestPrice});
          let stockD = new Stock({
            stock: stock,
            likes: []
          });
          await stockD.save()
        }catch(err){
          // ensures app does not stop when adding already existing stock in db
        }
        try{
          if(req['query'].like == 'true'){
            // adds anonymized ip to stock's likes if it has not already liked it before
            await Stock.updateOne({stock:stock}, {$addToSet:{likes:anonymize(req.ip)}});
          }
        } catch(err){
          console.log(err)
        } 
        
        
      }
      let likeNums = [];
      for(let stock of stocks){
        // get the number of likes for a stock
        try{
          let currentStock = await Stock.findOne({stock: stock});
          let likes;
          if(!currentStock.likes){
            likes = 0;
          }else{
            likes = currentStock.likes.length
          }
          likeNums.push(likes);
        } catch(err){
          console.log(err);
        }
        
        
      }

      // if only one stock is sent
      if(stocks.length == 1){
        let stockData = stockDatas[0];
        stockData['likes'] = likeNums[0];
        return res.send({stockData: stockDatas[0]});
      }

      // when multiple stocks are sent
      for(let i=0;i<stockDatas.length;i++){
        stockDatas[i]['rel_likes'] = likeNums.at(i) - likeNums.at(i-1);
      }
      return res.send({stockData: stockDatas});
      
      
    });
    
};
