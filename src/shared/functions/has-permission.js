const _ = require('underscore');
const ROLES = require('../constants/roles');

module.exports = (requestKeys, ...requestRoles) => {
  if (!_.isArray(requestKeys)) requestKeys = [requestKeys];

  const requiredRoles = requestKeys.reduce((roles, key) => {
    const role = ROLES[key];
    if (!role) throw new Error(`Unknown role '${key}'`);

    return roles || role;
  }, 0);

  const permittedRoles = requestRoles.reduce(
    (roles, role) => role ? roles & role : roles,
    requiredRoles
  );

  return permittedRoles === requiredRoles;
};
