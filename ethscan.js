const eth_api_key ="9GDYYQZHM22W93NJV363Q55A716ADCZR3E"
const bsc_api_key = "X88IQYI37MDGR39KBGE549IQG1ANSFX52G"
const axios = require('axios')
const express = require('express');
const app = express();
const server = require('http').createServer(app);
app.get('/v1/tronscan', async (req, res) => {
    let data = axios.get("https://apilist.tronscan.org/api/account?address=TKg1nGjtWYDcf1HNTSNQtwGwNAuTxd1X2A")
        .then(function (resp){
            let tokens  = resp.data.tokens;
            let length = tokens.length;
            for(let i=0; i<length ; i++ ){
                if(tokens[i].tokenId=="TKg1nGjtWYDcf1HNTSNQtwGwNAuTxd1X2A"){
                    console.log(tokens[i])
                    let item = tokens[i];
                    let tronscan_holders = item.nrOfTokenHolders;
                    let tronscan_transfer_count = item.transferCount;
                    console.log("holders: "+ tronscan_holders, "Transfer_Count : "+ tronscan_transfer_count)
                }
            }
                res.send("123")
            }
        )
    })
app.get('/v1/etherscan', async (req, res)=>{
    await sendRequest();
    res.send("123")


})
const sendRequest = async()=>{
    let data = await axios.get('https://api.etherscan.io/api?module=account&action=tokentx&contractaddress=0x5b685863494c33f344081f75e5430c260c224a32&sort=asc&apikey=9GDYYQZHM22W93NJV363Q55A716ADCZR3E')
        .then(async function(resp){
            let items = resp.data.result;
            let length = items.length;
            let smth = [];
            // console.log(items[0], length)
            for(let i=0; i<length; i++){
                let item = items[i];
                await axios.get(`https://api.etherscan.io/api?module=transaction&action=getstatus&txhash=${item.hash}&apikey=9GDYYQZHM22W93NJV363Q55A716ADCZR3E`)
                    .then(function(resp){
                        if(resp.data.status==1  &&resp.data && resp.data.result && resp.data.result.isError!='undefined' && resp.data.result.isError==0){
                            if(!smth.includes(item.to)){
                                smth.push(item.to)
                                console.log(smth, smth.length);
                            }
                        }
                    });

                // if(!smth.includes(item.to) && item.nonce>0){
                //     smth.push(item.to)
                // }
            }
            console.log("holders: "+ smth.length , "Transfer_Count : "+ length)
        })
}
app.get('/v1/etherscan1', async (req, res)=>{
    let data = axios.get('https://etherscan.io/token/generic-tokenholders2?a=0x5b685863494c33f344081f75e5430c260c224a32')
        .then(function(resp){
            console.log(res)
            res.send("123")
        })

})
server.listen(8181,  () => {
    console.log('server is running');
});