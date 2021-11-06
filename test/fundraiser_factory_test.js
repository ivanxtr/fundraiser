
const FundraiserFactoryContract = artifacts.require("FundraiserFactory")

contract("FundraiserFactory: deployment", () => {
  it("has been deployed", async () => {
    const fundraiserFactory = FundraiserFactoryContract.deployed()
    assert(fundraiserFactory, "fundraiser factory was not deployed")
  })
})

contract("FundraiserFactory: createFundraiser", (accounts) => {
  let fundraiserFactory;
  // fundraiser args
  const name = "Beneficiary Name"
  const url = "beneficiaryname.org"
  const imageURL = "https://placekitten.com/600/350"
  const bio = "Beneficiary Description"
  const beneficiary = accounts[1]

  it("increment the fundraiserCount", async () => {
    fundraiserFactory = await FundraiserFactoryContract.deployed()
    const currentFundraiserCount = await fundraiserFactory.fundraisersCount()
    await fundraiserFactory.createFundraiser(
      name, url, imageURL, bio, beneficiary
    )
    const newFundraisersCount = await fundraiserFactory.fundraisersCount()

    assert.equal(
      newFundraisersCount - currentFundraiserCount,
      1,
      "should be increment by 1"
    )
  })
})
