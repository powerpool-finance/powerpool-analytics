module.exports = (web3, ethers) => {
  const {toBN, toWei, fromWei} = web3.utils;

  function nToBN(num) {
    return toBN(num.toString(10));
  }

  function ether(num) {
    return toWei(num.toString(10), 'ether');
  }

  const h = {
    maxUint: '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
    zeroAddress: '0x0000000000000000000000000000000000000000',
    ether,
    fromEther(wei) {
      return parseFloat(fromWei(wei.toString(10), 'ether'));
    },
    addBN(bn1, bn2) {
      return nToBN(bn1).add(nToBN(bn2)).toString();
    },
    subBN(bn1, bn2) {
      return nToBN(bn1).sub(nToBN(bn2));
    },
    mulBN(bn1, bn2) {
      return nToBN(bn1).mul(nToBN(bn2)).toString();
    },
    divBN(bn1, bn2) {
      return nToBN(bn1).div(nToBN(bn2)).toString();
    },
    mulScalarBN(bn1, bn2) {
      return nToBN(bn1).mul(nToBN(bn2)).div(nToBN(ether(1))).toString();
    },
    divScalarBN(bn1, bn2) {
      return nToBN(bn1).mul(nToBN(ether(1))).div(nToBN(bn2)).toString();
    },
    async callContract(contract, methodName, args = [], type = null, blockNumber = null) {
      if (contract.contract) {
        contract = contract.contract;
      }
      if (blockNumber) {
        const data = contract.methods[methodName].apply(contract, args).encodeABI();
        try {
          const result = await web3.eth.call({
            data,
            to: contract._address,
          }, blockNumber);
          return web3.eth.abi.decodeParameters(contract._jsonInterface.filter(i => i.name === methodName)[0].outputs, result);
        } catch (e) {
          console.error('callContract error', contract._address, methodName, e, args);
          throw e;
        }
      } else {
        let result = await contract.methods[methodName].apply(contract, args).call();
        if (type === 'array') {
          result = [].concat(result);
        }
        return result;
      }
    },
    async ethUsed(receipt) {
      const tx = await web3.eth.getTransaction(receipt.transactionHash);
      return h.fromEther(h.mulBN(receipt.gasUsed, tx.gasPrice));
    }
  };

  return h;
};
