module.exports = {
  '*': ({query}) => {
    throw new Error(`No route found for ${JSON.stringify(query)}`);
  }
};
