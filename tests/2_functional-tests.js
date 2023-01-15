const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);
const Stock = require('../models/stock');
Stock.deleteMany().exec();
suite('Functional Tests', function() {
    
    test("Viewing one stock", (done) => {
        chai.request(server)
        .get('/api/stock-prices?stock=GOOG')
        .end((err, res) => {
            let stockData = res.body.stockData;
            assert.equal(res.status, 200);
            assert.equal(stockData.stock, 'GOOG');
            assert.property(stockData, 'price');
            assert.equal(stockData.likes, 0);
            done();
        });
    });
  
    test("Viewing one stock and liking it", function (done) {
        chai.request(server)
        .get('/api/stock-prices?stock=GOOG&like=true')
        .end((err, res) => {
            let stockData = res.body.stockData;
            assert.equal(res.status, 200);
            assert.equal(stockData.stock, 'GOOG');
            assert.property(stockData, 'price');
            assert.equal(stockData.likes, 1);
            done();
        });
        
    });
  
    test("Viewing the same stock and liking it again", function (done) {
        chai.request(server)
        .get('/api/stock-prices?stock=GOOG&like=true')
        .end((err, res) => {
            let stockData = res.body.stockData;
            assert.equal(res.status, 200);
            assert.equal(stockData.stock, 'GOOG');
            assert.property(stockData, 'price');
            assert.equal(stockData.likes, 1);
            done();
        });
    });
  
    test("Viewing two stock", function (done) {
        chai.request(server)
        .get('/api/stock-prices?stock=GOOG&stock=MSFT')
        .end((err, res) => {
            let stockData = res.body.stockData;
            assert.equal(res.status, 200);
            assert.isArray(stockData);
            assert.equal(stockData[0].stock, 'GOOG');
            assert.equal(stockData[1].stock, 'MSFT');
            assert.property(stockData[0], 'price');
            assert.property(stockData[1], 'price');
            assert.equal(stockData[0].rel_likes, 1);
            assert.equal(stockData[1].rel_likes, -1);
            done();
        });
      });
  
    test("Viewing two stocks and liking it", function (done) {
        chai.request(server)
        .get('/api/stock-prices?stock=GOOG&stock=MSFT&like=true')
        .end((err, res) => {
            let stockData = res.body.stockData;
            assert.equal(res.status, 200);
            assert.isArray(stockData);
            assert.equal(stockData[0].stock, 'GOOG');
            assert.equal(stockData[1].stock, 'MSFT');
            assert.property(stockData[0], 'price');
            assert.property(stockData[1], 'price');
            assert.equal(stockData[0].rel_likes, 0);
            assert.equal(stockData[1].rel_likes, 0);
            done();
        });
    });
    
  });
