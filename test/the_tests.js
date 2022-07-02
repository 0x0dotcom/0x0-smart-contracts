const { expect, assert } = require("chai")
const { web3, ethers } = require("hardhat")
const { BN, time, balance, expectEvent, expectRevert } = require("@openzeppelin/test-helpers")
const ether = require("@openzeppelin/test-helpers/src/ether")

let nft, erc721
let owner, acc1, acc2

describe("Simple Tests", function () {
	beforeEach(async function () {
		let TContract = await ethers.getContractFactory("OxO")
		nft = await TContract.deploy()
		await nft.deployed()

		signers = await ethers.getSigners()
		owner = signers[0]
		acc1 = signers[1]
		acc2 = signers[2]
	})

	it("simple test...", async function () {
		expect(await nft.totalSupply()).to.equal(0)
	})
})
