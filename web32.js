const Web3 = require('web3');

class TransactionChecker {
    web3;
    web3ws;
    account;
    subscription;
    // daata;

    constructor(projectId, account) {
        this.web3ws = new Web3(new Web3.providers.WebsocketProvider('wss://rinkeby.infura.io/ws/v3/' + projectId));
        this.web3 = new Web3(new Web3.providers.HttpProvider('https://rinkeby.infura.io/v3/' + projectId));
        this.account = account.toLowerCase();
        // this.daata = [];
    }

    subscribe(topic) {
        this.subscription = this.web3ws.eth.subscribe(topic, (err, res) => {
            if (err) console.error(err);
        });
    }

    watchTransactions() {
        console.log('Watching all pending transactions...');
        this.subscription.on('data', (txHash) => {
            setTimeout(async () => {
                try {
                    let tx = await this.web3.eth.getTransaction(txHash);
                    if (tx != null && tx.to != null) {
                        console.log(tx.transactionHash);
                        if (this.account == tx.to.toLowerCase()) {
                            console.log({address: tx.from, value: this.web3.utils.fromWei(tx.value, 'ether'), timestamp: new Date()});
                        }
                    }
                } catch (err) {
                    console.error(err);
                }
            }, 60000)
        });
    }
}

let txChecker = new TransactionChecker("2af427991f7d46bdb286df9414b648da", '0x5b685863494c33f344081f75e5430c260c224a32');
txChecker.subscribe('pendingTransactions');
txChecker.watchTransactions();
// console.log(this.daata);