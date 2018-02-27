const {graphql} = require('graphql');
const bcrypt = require('bcrypt');
const schema = require('../../schema');

module.exports = async ({
  req: {body: {query}, headers: {authorization = ''}},
  res
}) => {
  let [type, token] = authorization.split(/\s+/);

  // Basic will supply a base64 encoded token.
  if (type.toLowerCase() === 'basic') {
    try {
      const [email, password] =
        Buffer.from(token, 'base64').toString().split(':');
      if (email && password) {
        // const match = await bcrypt.compare(password, passwordHash);

      } else {
        token = email || password;
      }
    } catch (er) {}
  }
  res.send(await graphql(schema, query));
};
