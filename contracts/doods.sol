// SPDX-License-Identifier: MIT

// This is a test contract to try out the minting bot i wrote.

pragma solidity ^0.8.15;
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "../node_modules/@openzeppelin/contracts/token/ERC721/ERC721.sol";
// import "../node_modules/erc721a/contracts/ERC721A.sol";
import "../node_modules/@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "../node_modules/@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract Doods is ERC721,ERC721Enumerable,Ownable{
     using Strings for uint256;
     bool public revealed;
    
    address public _owner;
    bytes32  public  rootHash;

    uint256 public immutable availableToMint = 4444;
    uint256 public immutable mintForPresale = 5;
    uint256 public immutable mintForPublic = 20;
    uint256 public immutable pricePerNFT= 0.005 ether;


    mapping(address => uint256) public mintDuringPresale;
    mapping(address => uint256) public mintDuringPublic;

    bool public isPresaleActive;
    bool public isPublicActive;

    string public _baseUri;

    constructor(bytes32 _rootHash)ERC721("Doods","DOOD"){
        rootHash = _rootHash;
        _owner = msg.sender;

    }
    modifier whenPresaleActive(){
      require(isPresaleActive, "Presale is not active");
        _;
    }
    modifier whenPublicActive(){
      require(isPublicActive, "Public sale is not active");
        _;
    }
    modifier whenPresaleNotActive(){
      require(!isPresaleActive, "Presale is active");
        _;
    }
    modifier whenPublicNotActive(){
      require(!isPublicActive, "Public sale is active");
        _;
    }
    function updateHash(bytes32 _newHash) public onlyOwner{
        rootHash = _newHash;

    }
    function updateBaseUri(string memory _newBaseUri) public onlyOwner{
        _baseUri = _newBaseUri;
    }
    function togglePublicMint() public  onlyOwner{
        isPublicActive = !isPublicActive;

    }
    function togglePresaleMint()public onlyOwner{
      isPresaleActive = !isPresaleActive;

    }
    function reveal() public onlyOwner{
        revealed = true;

    }
    function _baseURI() internal view override returns (string memory) {
        return _baseUri;
    }

    function isAllowed(bytes32[] memory proof) public view returns(bool){
        bytes32 leaf = keccak256(abi.encodePacked(msg.sender));
        return MerkleProof.verify(proof,rootHash,leaf);
    }

    function presaleMint(bytes32[] calldata proof,uint256 amount) public payable whenPresaleActive whenPublicNotActive {
        require(isAllowed(proof), "You are not allowed to mint in this phase");
        require(mintDuringPresale[msg.sender] + amount <= mintForPresale,"If you mint this amount, you will exceed your allocation");
        require( pricePerNFT * amount >= msg.value, "Send enough funds to cover mint");
        require(totalSupply() + amount <= availableToMint, "Minted Out.");
        uint256 id = totalSupply();

        for(uint256 i =0 ; i<amount; i++){
            _mint(msg.sender,++id);


        }

        mintDuringPresale[msg.sender] += amount;


    }
    function publicMint(uint256 amount) public payable  whenPresaleNotActive whenPublicActive{

        require(mintDuringPublic[msg.sender] + amount <= mintForPublic,"If you mint this amount, you will exceed your allocation");
        require( pricePerNFT* amount >= msg.value, "Send enough funds to cover mint");
        require(totalSupply() + amount <= availableToMint, "Minted Out.");
        uint256 id = totalSupply();
        for(uint256 i =0 ; i<amount; i++){
            _mint(msg.sender,++id);


        }


        mintDuringPublic[msg.sender] += amount;

    } 


    function withdrawFunds() public  payable onlyOwner{
        (bool success,) = payable(msg.sender).call{value: address(this).balance}("");
        require(success);

    } 
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
     ) internal override(ERC721,ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId);

       
    }

   
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function tokenURI(uint256 tokenId) public view  override returns (string memory) {
        require(_exists(tokenId), "ERC721URIStorage: URI query for nonexistent token");

        // string memory _tokenURI = _tokenURIs[tokenId];
        string memory base = _baseURI();

        if (revealed == false) {
            return
                bytes(base).length > 0
                    ? string(abi.encodePacked(base, "hidden.json"))
                    : "";
        } else {
            return
                bytes(base).length > 0
                    ? string(
                        abi.encodePacked(base, tokenId.toString(), ".json"))
                    : "";
        }

        
    }

   

   
    







}

