const config = require('../config');

const {trustForwardedForIndex} = config;

module.exports = ({
  req: {headers: {'x-forwarded-for': forwardedFor}, socket: {remoteAddress}}
}) => {
  if (trustForwardedForIndex && forwardedFor) {
    const ips = forwardedFor.split(',');
    return ips[ips.length - trustForwardedForIndex];
  }

  return remoteAddress;
};
