const FundraiserContract = artifacts.require("Fundraiser");

contract("Fundraiser", accounts => {
  let fundraiser;
  const name = "Beneficiary Name"
  const url = "beneficiaryname.org"
  const imageURL = "https://placekitten.com/600/350"
  const description = "Beneficiary description"

  describe("initialization", () => {

    beforeEach(async () => {
      fundraiser = await FundraiserContract.new(
        name,
        url,
        imageURL,
        description
      )
    })

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
  })
})
