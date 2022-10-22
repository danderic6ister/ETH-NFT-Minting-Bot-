const Doods = artifacts.require('Doods');

let rootHASH =
  '0xa41c6d4c3065e19edea4a3b85a579d3ac65adaaeb63d7fe1e9d7f6f7c11a7c57';
module.exports = function (deployer) {
  deployer.deploy(Doods, rootHASH);
};
