const FundraiserContract = artifacts.require("Fundraiser");

contract("Fundraiser", accounts => {
  let fundraiser;
  const name = "Beneficiary Name"
  const url = "beneficiaryname.org"
  const imageURL = "https://placekitten.com/600/350"
  const description = "Beneficiary description"
  const beneficiary = accounts[1]
  const owner = accounts[0]

  beforeEach(async () => {
    fundraiser = await FundraiserContract.new(
      name,
      url,
      imageURL,
      description,
      beneficiary,
      owner
    )
  })

  describe("initialization", () => {

    it("gets beneficiary name", async () => {
      const actual = await fundraiser.name()
      assert.equal(actual, name, "names should match")
    })

    it("gets beneficiary url", async () => {
      const actual = await fundraiser.url()
      assert.equal(actual, url, "url should match")
    })


    it("gets beneficiary imageURL", async () => {
      const actual = await fundraiser.imageURL()
      assert.equal(actual, imageURL, "imageURL should match")
    })

    it("gets beneficiary description", async () => {
      const actual = await fundraiser.description()
      assert.equal(actual, description, "names should match")
    })

    it("gets beneficiary description", async () => {
      const actual = await fundraiser.description()
      assert.equal(actual, description, "description should match")
    })

    it("gets beneficiary", async () => {
      const actual = await fundraiser.beneficiary()
      assert.equal(actual, beneficiary, "beneficiary should match")
    })

    it("gets owner", async () => {
      const actual = await fundraiser.owner()
      assert.equal(actual, owner, "bios should match")
    })

  })

  describe("setBeneficiary", () => {
    const newBeneficiary = accounts[2]

    it("updated beneficiary when called by owner account", async () => {
      await fundraiser.setBeneficiary(newBeneficiary, { from: owner });
      const actualBeneficiary = await fundraiser.beneficiary();
      assert.equal(actualBeneficiary, newBeneficiary, "beneficiaries should match")
    })

    it("throws an error when called from a non-owner account", async () => {
      try {
        await fundraiser.setBeneficiary(newBeneficiary, { from: accounts[3] })
        assert.fail("withdraw was not restricted to owners")
      } catch (error) {
        const expectedError = "Ownable: caller is not the owner"
        const actualError = error.reason
        assert.equal(actualError, expectedError, "should not permitted")
      }
    })

  })

  describe('making donations', () => {
    // wei is the smallest denomination of the ether
    const value = web3.utils.toWei('0.0289');
    const donor = accounts[2]

    it("increase myDonationsCount", async () => {
      const currentDonationsCount = await fundraiser.myDonationsCount(
        { from: donor }
      )

      await fundraiser.donate({ from: donor, value })

      const newDonationsCount = await fundraiser.myDonationsCount({ from: donor })

      assert.equal(
        1,
        newDonationsCount - currentDonationsCount,
        "myDonationsCount should increment by 1"
      )
    })

    it("includes donation in MyDonations", async () => {
      await fundraiser.donate({ from: donor, value })
      const { values, dates } = await fundraiser.myDonations({ from: donor })

      assert.equal(
        value,
        values[0],
        "values should match"
      )
      assert(dates[0], "date should be present")
    })

    it("increase the totalDonations amount", async () => {
      const currentTotalDonations = await fundraiser.totalDonations()
      await fundraiser.donate({ from: donor, value })
      const newTotalDonations = await fundraiser.totalDonations()

      const diff = newTotalDonations - currentTotalDonations

      assert.equal(
        diff,
        value,
        "difference should match the donation value"
      )
    })

    it("increase donationsCount", async () => {
      const currentDonationsCount = await fundraiser.donationsCount()
      await fundraiser.donate({ from: donor, value })
      const newDonationCount = await fundraiser.donationsCount()

      assert.equal(
        1,
        newDonationCount - currentDonationsCount,
        "donationsCount should increment by 1"
      )
    })

    it('emits the DonationReceived event', async () => {
      const tx = await fundraiser.donate({ from: donor, value })
      const expectedEvent = "DonationReceived"
      const actualEvent = tx.logs[0].event

      assert.equal(
        actualEvent, 
        expectedEvent,
        "events should match"
      )
    })
  }) 

  describe("withdraws funds", () => {
    beforeEach(async () => {
      await fundraiser.donate({
        from: accounts[2], value: web3.utils.toWei('0.1')
      })
    })

    describe("access control", () => {
      it("throws an error when called from non-owner account", async () => {
        try {
          await fundraiser.withdraw({ from: accounts[3] })
          assert.fail("withdraw was not restricted to owners")
        } catch (error) {
          const expectedError = "Ownable: caller is not the owner"
          const actualError = error.reason
          assert.equal(actualError, expectedError, "should not be permitted")
        }
      })

      it("permits the owner to call the function", async () => {
        try {
          await fundraiser.withdraw({ from: owner })
          assert(true, "no errors were thrown")
        } catch (error) {
          assert.fail("should nor have thrown an error")
        }
      })

      it("transfer balance to beneficiary", async () => {
        const currentContractBalance = await web3.eth.getBalance(fundraiser.address)
        const currentBeneficiaryBalanace = await web3.eth.getBalance(beneficiary)

        await fundraiser.withdraw({ from: owner })

        const newContractBalance = await web3.eth.getBalance(fundraiser.address)
        const newBeneficiaryBalance = await web3.eth.getBalance(beneficiary)
        const beneficiaryDifference = newBeneficiaryBalance - currentBeneficiaryBalanace

        assert.equal(
          newContractBalance,
          0,
          "contract should have a 0 balance"
        )

        assert.equal(
          beneficiaryDifference,
          currentContractBalance,
          "beneficiary should recieve all the funds"
        )
      })

      it("emits Withdraw event", async () => {
        const tx = await fundraiser.withdraw({ from: owner })
        const expectedEvent = "Withdraw"
        const actualEvent = tx.logs[0].event

        assert.equal(
          actualEvent,
          expectedEvent,
          "events should match"
        )
      })
    })

    describe("fallback function", () => {
      const value = web3.utils.toWei('0.0289')

      it("increases the totalDonations amount", async() => {
        const currentTotalDonations = await fundraiser.totalDonations()
        await web3.eth.sendTransaction(
          {
            to: fundraiser.address,
            from: accounts[9], value
          }
        )
        const newTotalDonations = await fundraiser.totalDonations()

        const diff = newTotalDonations - currentTotalDonations

        assert.equal(
          diff,
          value,
          "difference should match the donation value"
        )
      })

      it("increases donationsCount", async () => {
        const currentDonationsCount = await fundraiser.donationsCount()
        await web3.eth.sendTransaction(
          {
            to: fundraiser.address,
            from: accounts[9], value
          }
        )

        const newDonationsCount = await fundraiser.donationsCount()

        assert.equal(
          1,
          newDonationsCount - currentDonationsCount,
          "donationsCount should increment by 1"
        )
      })
    })
  })
})
