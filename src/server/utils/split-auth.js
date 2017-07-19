module.exports = ({auth}) => {
  const [type, ...id] = auth.split(':');
  return [type, id.join(':')];
};
