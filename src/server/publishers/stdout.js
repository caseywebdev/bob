const getBuildDescription = require('../../shared/functions/get-build-description');

module.exports = ({build}) =>
  console.log(getBuildDescription({build, withError: true}));
