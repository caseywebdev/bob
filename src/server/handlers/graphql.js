const {graphql} = require('graphql');
const getSchemaContext = require('../functions/get-schema-context');
const schema = require('../schema');

module.exports = async ({
  req,
  req: {body: {operationName, query, variables}, headers: {authorization}},
  res
}) =>
  res.send(await graphql(
    schema,
    query,
    null,
    await getSchemaContext({authorization, req}),
    variables,
    operationName
  ));
