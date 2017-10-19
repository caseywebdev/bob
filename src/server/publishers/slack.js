const _ = require('underscore');
const {WebClient} = require('@slack/client');
const getBuildDescription = require('../../shared/functions/get-build-description');
const getValue = require('../functions/get-value');
const STATUS_INFO = require('../../shared/constants/status-info');

const getToken = async ({env, env: {config: {slack: {token}}}}) =>
  getValue({env, value: token});

const getChannel = async ({
  client,
  env: {config: {slack: {channel: defaultChannel}}},
  meta
}) => {
  let {channel} = (meta || {}).slack || {};
  if (!channel) channel = defaultChannel;
  if (!channel) return;

  if (!channel.startsWith('#')) return channel;

  const {channels} = await client.channels.list();
  return (_.find(channels, {name: channel.slice(1)}) || {}).id;
};

module.exports = async ({
  build,
  build: {error, id, sha, tags, status, updatedAt},
  env,
  env: {config: {slack}},
  meta,
  url
}) => {
  if (!slack) return;

  const client = new WebClient(await getToken({env}));
  const channel = await getChannel({client, env, meta});
  if (!channel) return;

  const {iconEmoji, iconUrl, username} = slack;
  const title = getBuildDescription({build, withEmoji: true});
  const options = {
    attachments: [{
      color: STATUS_INFO[status].color,
      fallback: title,
      fields: !error ? [] : [{title: 'Error', value: error}],
      footer: `${sha} SHA`,
      text: _.map(tags, tag => {
        const [left, ...right] = tag.split(':');
        return `${left}:${right.join(':')}`;
      }).join('\n'),
      title,
      title_link: url,
      ts: updatedAt / 1000
    }],
    icon_emoji: iconEmoji,
    icon_url: iconUrl,
    parse: 'none',
    username
  };

  if (!meta.slack) meta.slack = {};
  if (!meta.slack.message) meta.slack.message = {};
  let {buildId, ts} = meta.slack.message;
  if (buildId !== id) ts = null;
  if (ts) return client.chat.update(ts, channel, null, options);

  ts = (await client.chat.postMessage(channel, null, options)).ts;
  _.extend(meta.slack, {channel, message: {buildId: id, ts}});
};
