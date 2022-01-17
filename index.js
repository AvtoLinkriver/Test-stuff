const express = require('express');
const app = express();
const server = require('http').createServer(app);
const https = require('https')
const axios = require('axios')
const CoinGecko = require('coingecko-api');
const CoinGeckoClient = new CoinGecko();
const { google } = require("googleapis");
const apiKey = "AIzaSyCY_-q43gpYndrLWAX29OhM-W4nuBNS0hk";
const apiUrl = "https://www.googleapis.com/youtube/v3";
const cmcxchanel = 'UCP_jrHlj5CGuMp0qUCaBH6A';
const nomics_api_key  = "df8b160e03d420b91a0f5f57025a39bc";
const options = {
    hostname: 'cryptore.io',
    port: 443,
    path: '/cmcx_price_nomics_node',
    method: 'GET'
}
const youtube = google.youtube({
    version: "v3",
    auth: apiKey,
});

app.get('/', async (req, res) => {
    let data = await CoinGeckoClient.coins.fetchMarketChart('core', {
        days: "30",
        interval:'daily',
        vs_currency: 'usd'
    });
    // res.send(data.data.market_caps);

    if(data && data.code ==200 && data.success == true){
        let data_prices =data.data.prices;
        let data_market_cap =data.data.market_caps;
        let data_exchange_volume =data.data.total_volumes;
        let months = {};
        let days = {};
        let monthdays = {};
        let weekDataPrice = {};
        let monthDataPrice = {};
        let weekData_market_cap = {};
        let monthData_market_cap = {};
        let weekData_exchange_volume = {};
        let monthData_exchange_volume = {};
        let marketdatalength = data_prices.length;
        let options = {
            day: 'numeric',
            month: 'short'
        };
        let date;
        for (var i = 0; i < marketdatalength; i++) {
            value = data_prices[i]; // property access
            value_market_cap = data_market_cap[i];
            value_exchange_volume = data_exchange_volume[i];
            date = new Date(value[0]);

            if(i > (marketdatalength-7)){
                days[i] = date.toLocaleDateString('en-GB', options);
                weekDataPrice[value[0]] = value[1]
                weekData_market_cap[value_market_cap[0]] = value_market_cap[1]
                weekData_exchange_volume[value_exchange_volume[0]] = value_exchange_volume[1]
            }
            if( i%5 == 0 && i!=0){
                monthdays[i] = date.toLocaleDateString('en-GB', options);
                monthDataPrice[value[0]] = value[1]
                monthData_market_cap[value_market_cap[0]] = value_market_cap[1]
                monthData_exchange_volume[value_exchange_volume[0]] = value_exchange_volume[1]
            }
        }
        console.log('---------')
        console.log(weekDataPrice)
        console.log('---------')
        console.log(weekData_market_cap)
        console.log('---------')
        console.log(weekData_exchange_volume)
        console.log('---------') 
        console.log(days)
        console.log('---------')
        console.log(monthdays)

        res.send('123');

    }else{
        res.send(123);
    }
})

/*
https.createServer('/', function (req, resp){
    res.send('213');
})
*/
const io = require('socket.io')(server, {
    cors: {
        origin: '*'
    }
});
io.on('connection', (socket)=>{
    console.log('connection');
    // socket.on('sendService', (message)=>{
    //     const req = https.request(options, res => {
    //         console.log(`statusCode: ${res.statusCode}`)
    //         res.on('data', function (chunk) {
    //             const data = chunk.toString();
    //             if(JSON.Parse(data).statusCode==1){
    //                 io.emit('recieveService',data );
    //             }
    //         });
    //     })
    //     req.on('error', error => {
    //         console.error(error)
    //     })
    //
    //     req.end()
    // })
    socket.on('sendYoutubeApi', async (message)=>{
        // io.emit('recieveYoutubeApi',message );
        const response = await youtube.search.list({
            part: "snippet",
            channelId:cmcxchanel,
            maxResults:50
        });
        // const titles = response.data.items.map((item) => item.snippet.title);
        io.emit('recieveYoutubeApi',response.data.items );
        // res.send(response.data.items);

    })
    socket.on('sendCMCXHistory', async (message)=>{
        let data = await CoinGeckoClient.coins.fetchMarketChart('core', {
            days: 'max',
            vs_currency: 'usd'
        });
        io.emit('recieveCMCXHistory', data);


    })
    socket.on('sendSupplyData', async (message)=>{
        let data = await CoinGeckoClient.coins.fetch('core');
        let supply = {
            total_supply: null,
            total_supply_percent: null,
            max_supply: null,
            max_supply_percent: null,
            circulating_supply:null,
            circulating_supply_percent:null,
        }
        if(data){
            let market_data = data.data.market_data;
            if(data.data && market_data){
                supply = {
                    total_supply: market_data.total_supply,
                    max_supply: market_data.max_supply,
                    circulating_supply: market_data.circulating_supply,
                }
            }
        }
        supply = {
            total_supply: '17 690 344',
            total_supply_percent: '+0.03',
            max_supply: '11 690 344',
            max_supply_percent: '-0.09',
            circulating_supply:'17 690 344',
            circulating_supply_percent:'+0.03',
        }
        io.emit('recieveSupplyData', supply);
    })
    // socket.on('send_nomics_price', async (message)=>{
    //     const nomics_cmcx_url  = `https://api.nomics.com/v1/currencies/ticker?key=${nomics_api_key}&ids=CMCX&interval=1h&convert=USDT&per-page=100&page=1`;
    //     io.emit('recieve_nomics_price', nomics_cmcx_url)
    //
    //     axios({
    //         method: 'get',
    //         url: nomics_cmcx_url,
    //         responseType: 'stream'
    //     })
    //         .then(function (response) {
    //             io.emit('recieve_nomics_price', response )
    //         });
    //    // const price =  axios
    //    //      .get(  )
    //    //      .then(response => io.emit('recieve_nomics_price', response ))
    //
    //
    // })

    socket.on('disconnect', (socket)=>{
        console.log('Disconnection');
    })
})
server.listen(8181,  () => {
    console.log('server is running');
});
function SocketObjectData(data){
    this.data = data;
}
