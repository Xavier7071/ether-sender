let express = require('express');
let router = express.Router();

const Web3 = require("web3");
const network = "https://goerli.infura.io/v3/404b5f580f4a433791e89674f0058e3a";
const web3 = new Web3(new Web3.providers.HttpProvider(network));

const publicAddress = "0xE7CA92E5e407d61EDf4736Dc6fE68B4F64C74809";
const privateKey = "ad70e9358467fd4bc6f3e10d8633b1712f1fea3306eb98e7c905a91d06d2d080";

router.get('/', async function(req, res) {
    res.render('index', {
        balance: await getBalance(publicAddress),
        error: req.flash('error'),
        success: req.flash('success'),
        address: publicAddress
    });
});

router.post('/', async function (req, res) {
    let ethAmount = req.body.amount;
    let address = req.body.address;

    if (ethAmount === undefined || ethAmount === "") {
        req.flash('error', "The amount to sent must be given.");
        res.redirect("/");
        return;
    }

    if (isNaN(ethAmount)) {
        req.flash('error', "The amount must be numeric.");
        res.redirect("/");
        return;
    }

    if (address === undefined || address === "") {
        req.flash('error', "The recipient address must be given.");
        res.redirect("/");
        return;
    }

    if (!web3.utils.isAddress(address)) {
        req.flash('error', "The recipient address must be valid.");
        res.redirect("/");
        return;
    }

    try {
        let txId = await sendEthereum(address, ethAmount);
        req.flash('success', ethAmount + " ETH sent successfully to "
            + ". <a target='_blank' href='https://goerli.etherscan.io/tx/" + txId + "'>" + txId + "</a>");
        res.redirect("/");
    } catch (e) {
        req.flash('error', e.message);
        res.redirect("/");
    }
});

function getBalance(address) {
    return new Promise((resolve, reject) => {
        web3.eth.getBalance(address, (err, result) => {
            if (err) {
                return reject(err);
            }
            const eth = web3.utils.fromWei(result, "ether");
            resolve(parseFloat(eth).toFixed(5));
        }).then();
    });
}

async function sendEthereum(toAddress, ethAmount) {
    const txInfo = {
        from: publicAddress,
        to: toAddress,
        value: web3.utils.toWei(ethAmount.toString(), "ether"),
        gas: '21000'
    };

    const tx = await web3.eth.accounts.signTransaction(txInfo, privateKey);
    const result = await web3.eth.sendSignedTransaction(tx.rawTransaction);
    return result.transactionHash;
}

module.exports = router;
