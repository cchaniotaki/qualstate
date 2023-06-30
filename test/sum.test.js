// const qualState = require('../qualState');

// test('overalltest', async () => {
//     let value = await qualState.run();
//     expect(value.size).toBe(3);

//     // return qualState.run().then(list => {
//     //     expect(list).toContain('lemon');
//     // });
// }, 30000);

const qualState = require('../qualState');
// const expect = require('chai');

describe('overalltest', function () {
  it('Should be 3 states', async function () {
    this.timeout(0);

    let value = await qualState.run();

    expect(value.size).to.be.equal(3);
  });
});