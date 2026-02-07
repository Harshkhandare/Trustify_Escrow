import { expect } from 'chai'
import { ethers } from 'hardhat'

describe('Escrow', function () {
  it('creates an escrow and funds it on create', async function () {
    const [buyer, seller, arbiter] = await ethers.getSigners()

    const Escrow = await ethers.getContractFactory('Escrow')
    const escrow = await Escrow.deploy()
    await escrow.waitForDeployment()

    const tx = await escrow.connect(buyer).createEscrow(seller.address, arbiter.address, {
      value: ethers.parseEther('0.1'),
    })
    await tx.wait()

    const data = await escrow.getEscrow(1)
    expect(data.buyer).to.equal(buyer.address)
    expect(data.seller).to.equal(seller.address)
    expect(data.arbiter).to.equal(arbiter.address)
    expect(data.funded).to.equal(true)
  })
})


