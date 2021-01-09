const Decentragram = artifacts.require('./Decentragram.sol')

require('chai')
  .use(require('chai-as-promised'))
  .should()

contract('Decentragram', ([deployer, author, tipper]) => {
  let decentragram

  before(async () => {
    decentragram = await Decentragram.deployed()
  })

  describe('deployment', async () => {
    it('deploys successfully', async () => {
      const address = await decentragram.address
      assert.notEqual(address, 0x0)
      assert.notEqual(address, '')
      assert.notEqual(address, null)
      assert.notEqual(address, undefined)
    })

    it('has a name', async () => {
      const name = await decentragram.name()
      assert.equal(name, 'Decentragram')
    })
  })

  describe('images', async () => {
    let result, imageCount
    const hash = 'abc123'

    before(async () => {
      result = await decentragram.uploadImage(hash, 'Image describtion', {from: author })
      imageCount = await decentragram.imageCount()

    })

    it('images create', async () => {
      console.log(result)
      const event = result.logs[0].args
      assert.equal(imageCount, 1)      
      assert.equal(event.id.toNumber(), imageCount.toNumber(),'id is correct')
      assert.equal(event.hash, hash,'has is correct')
      assert.equal(event.description, 'Image describtion','id is correct')
      assert.equal(event.tipAmount,'0','Tip amount is correct')
      assert.equal(event.author, author, 'Author is correct')

      await decentragram.uploadImage('', 'Image describtion', {from: author }).should.be.rejected
      await decentragram.uploadImage(hash, '', {from: author }).should.be.rejected
    })

    it('lists images', async () => {
      const image = await decentragram.images(imageCount)
      assert.equal(image.id.toNumber(), imageCount.toNumber(),'id is correct')
      assert.equal(image.hash, hash,'hasg is correct')
      assert.equal(image.description, 'Image describtion','id is correct')
      assert.equal(image.tipAmount,'0','Tip amount is correct')
      assert.equal(image.author, author, 'Author is correct')
    })

    it('allows user to tip images', async () => {

      let oldAuthorBalance;
      oldAuthorBalance = await web3.eth.getBalance(author)
      oldAuthorBalance = new web3.utils.BN(oldAuthorBalance)
      console.log(oldAuthorBalance)

      result = await decentragram.tipImageOwner(imageCount, {from: tipper, value: web3.utils.toWei('1', 'Ether')})

      const event = result.logs[0].args
      assert.equal(imageCount, 1)      
      assert.equal(event.id.toNumber(), imageCount.toNumber(),'id is correct')
      assert.equal(event.hash, hash,'has is correct')
      assert.equal(event.description, 'Image describtion','id is correct')
      assert.equal(event.tipAmount,'1000000000000000000','Tip amount is correct')
      assert.equal(event.author, author, 'Author is correct')

      let newAuthorBalance;
      newAuthorBalance = await web3.eth.getBalance(author)
      newAuthorBalance = new web3.utils.BN(newAuthorBalance)

      let tipImageOwner
      tipImageOwner = web3.utils.toWei('1', 'Ether')
      tipImageOwner = new web3.utils.BN(tipImageOwner)

      const expectedBalance = oldAuthorBalance.add(tipImageOwner)

      assert.equal(newAuthorBalance.toString(), expectedBalance.toString())

      // FAILURE: Tries to tip a image that does not exist
      await decentragram.tipImageOwner(99, { from: tipper, value: web3.utils.toWei('1', 'Ether')}).should.be.rejected;


    })

  })
})
