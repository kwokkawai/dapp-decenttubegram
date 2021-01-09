pragma solidity ^0.5.0;

// [x] 1. Model the Media
// [x] 2. Store the Media
// [x] 3. Upload the Media
// [x] 4. List the Media

contract Decenttubegram {
  // Code goes here...
  string public name = "Decenttubegram";

  mapping(uint => Media) public medias;

  uint public mediaCount = 0;

  enum Mediatype {IMAGE, VIDEO}
  
  struct Media {
    uint id;
    Mediatype mtype;
    string hash;
    string title;
    uint tipAmount;
    address payable author;
  }

  event UploadMedia (
  	uint id,
    Mediatype mediatype,  
  	string hash,
  	string title,
  	uint tipAmount,
  	address payable author
  );

  event MediaTipped (
  	uint id,
  	string hash,
  	string title,
  	uint tipAmount,
  	address payable author
  );

  constructor() public {

  }

  // create Media
  function uploadMedia(string memory _mediaHash, string memory _title, uint _mtype) public {
  	
  	// make sure image hash exists
  	require(bytes(_mediaHash).length > 0);

  	// make sure descrption hash exists
  	require(bytes(_title).length > 0);

  	// make sure descrption hash exists
  	require(msg.sender != address(0x0));

    Mediatype _mediatype;

  	// Media count
  	mediaCount ++;
  	
    if (_mtype == 0) {
        _mediatype = Mediatype.IMAGE;
      } else {
        _mediatype = Mediatype.VIDEO;
      }

  	// add Media
  	medias[mediaCount] = Media(mediaCount, _mediatype, _mediaHash ,_title, 0, msg.sender);

  	// trigger an event
  	emit UploadMedia(mediaCount, _mediatype, _mediaHash ,_title, 0, msg.sender);
  }

  // Tip Images
  function tipMediaOwner(uint _id) public payable {

  	require(_id > 0 && _id <= mediaCount);

  	Media memory _media = medias[_id];

  	address payable _author = _media.author;
  	address(_author).transfer(msg.value);
  	_media.tipAmount = _media.tipAmount + msg.value;
  	medias[_id]	= _media;

  	emit MediaTipped(_id, _media.hash, _media.title, _media.tipAmount, _author);
  }
}