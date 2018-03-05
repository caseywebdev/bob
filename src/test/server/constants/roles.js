const _ = require('underscore');
const {expect} = require('chai');
const roles = require('../../../server/constants/roles');

it('does not have any duplicate role values', () => {
  expect(_.size(roles)).to.equal(_.size(_.invert(roles)));
});
