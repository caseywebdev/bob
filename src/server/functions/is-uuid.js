const UUID_RE = /^[a-f\d]{8}-(?:[a-f\d]{4}-){3}[a-f\d]{12}$/i;

module.exports = UUID_RE.test.bind(UUID_RE);
