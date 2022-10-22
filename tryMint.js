//Simple Script to bot an NFT Collection

// This is to ensure we can use the .env file
require('dotenv').config();
// Ensure to get an instance of web3 with your provider
const Web3 = require('web3');
const web3Provider = `wss://goerli.infura.io/ws/v3/${process.env.INFURA_API_KEY}`;
const web3 = new Web3(web3Provider);

//Import the build of the NFT you want to mint
let BUILD = require('./build/contracts/Doods.json');
//In most cases only the ABI would be provided on ETherscan if verfied, if not use WhatsABI by @w1nt3r_eth
let abi = BUILD.abi;
// Get the contract address, for mainnet, it would be 1 or you could just paste in manually
let contractAddress = BUILD.networks[5].address;

// Get an instatnce of the contract
let contractDood = new web3.eth.Contract(abi, contractAddress);
// console.log(contractDood);

// Declare Variables
let fromAddress = process.env.WALLET_PUBLIC_KEY;
let toAddress = contractAddress;
let privateKey = process.env.WALLET_PRIVATE_KEY;
let maxPriorityFee = 20;
let totalCost;
let priceInEther;
let amountToMint = 2;

//Begin Mint Proper
async function beginMint() {
  console.log('Beginning Mint at', web3Provider);
  // Set an interval to call the tryMint Function
  setInterval(
    function () {
      tryMint(web3);
    }.bind(this),
    5000
  );
}
//Attempt to mint
async function tryMint(web3) {
  console.log('Trying to mint');
  //It would be smart to always use a test condition always , if not you run the risk of wasting gas by
  //attempting to mint when the sale is not live.

  let isPublicActiveYet = await contractDood.methods.isPublicActive().call();
  console.log(isPublicActiveYet);

  //Proceed only if this condition is met
  if (isPublicActiveYet) {
    console.log('Public Sale is live');
    console.log("Let's go");
    //get the price of the NFT, could be modified based on the name of the function in the contract or you
    //could type it out manually
    getPricePerNFT = await contractDood.methods.pricePerNFT().call();
    //Convert it to Wei
    priceInEther = web3.utils.fromWei(getPricePerNFT, 'ether');
    // let priceInEtherString = '' + priceInEther;

    //Get the Total Cost of Minting
    totalCost = priceInEther * amountToMint;

    console.log(totalCost);

    // 1. Get the nonce of the wallet, that is the number of tx performed from that wallet
    try {
      txCount = await web3.eth.getTransactionCount(fromAddress);
      console.log(txCount);
    } catch (error) {
      console.log('error', error);
    }
    //2. Also try to estimate the amount of gas it would cost you  for the function call(mint).
    //Think of this as a pseudo-tx with no value being sent
    try {
      estimatedGasCost = await contractDood.methods
        .publicMint(amountToMint)
        .estimateGas({
          from: fromAddress,
          to: toAddress,
          value: web3.utils.toWei(totalCost.toString(), 'ether'),
        });
      console.log('the estimated gas cost of this tx is ', estimatedGasCost);
    } catch (e) {
      console.log('error', e);
    }
    // 3.//Now build a TX Object
    const txObject = {
      from: fromAddress,
      to: toAddress,
      value: web3.utils.toHex(web3.utils.toWei(totalCost.toString(), 'ether')),
      gas: estimatedGasCost,
      data: contractDood.methods.publicMint(amountToMint).encodeABI(),
      nonce: web3.utils.toHex(txCount),
      //Notice how we set a priority Fee, this is going to make our Tx go faster, the higher you set , the higher the c
      //  chances of your tx going faster
      maxPriorityFeePerGas: web3.utils.toHex(
        web3.utils.toWei(maxPriorityFee.toString(), 'gwei')
      ),
    };
    //4. Sign and Send your Tx , log it when you're done
    let txResult = await signAndSendRawTransaction(txObject, privateKey);
    console.log(txResult);
  }
  //In the event Public Sale is not Live , the function keeps running every seconds and only moves on if the sale starts
  else {
    console.log('Public Mint has not begun yet');
  }
}
beginMint();

async function signAndSendRawTransaction(txObject, privateKey) {
  //5. Sign your Tx with your privateKey
  let signedTx = await new Promise((resolve, reject) => {
    web3.eth.accounts.signTransaction(
      txObject,
      privateKey,
      (error, signedTx) => {
        if (error) {
          console.log(error);
          reject(error);
        } else {
          resolve(signedTx);
        }
      }
    );
  });
  // 6.Broadcast your Tx to the rest of the network
  let submittedTx = await new Promise((resolve, reject) => {
    web3.eth
      .sendSignedTransaction(signedTx.rawTransaction)
      .on('transactionHash', (txhash) => {
        console.log('Tx was succesful , this is the TxHash:', txhash);
        resolve({ success: true, txhash: txhash });
      });
  });
  console.log('This is the submitted Tx:', submittedTx);
  return submittedTx;
}

//To-Do

// What to figure next is to display better errors when the tx i send is succesful and abount to be sent again
// Returned error: already known
