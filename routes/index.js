let express = require('express');
let router = express.Router();

const Web3 = require("web3");
const network = "https://goerli.infura.io/v3/404b5f580f4a433791e89674f0058e3a";
const web3 = new Web3(new Web3.providers.HttpProvider(network));

const publicAddress = "0xE7CA92E5e407d61EDf4736Dc6fE68B4F64C74809";

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

    // TODO: Test if the given ETH address is valid for the given network ...

    sendEthereum(address, ethAmount);
    req.flash('success', ethAmount + " ETH sent successfully to " + address
        + ". I may take up to few minutes before the transaction is completed.");
    res.redirect("/");
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

function sendEthereum(toAddress, ethAmount) {
    // TODO: Proceed to do the real transfer ...
}

module.exports = router;
