module.exports = (required, permitted) =>
  permitted === 0 ? true : (required & permitted) === required;
