const _ = require('underscore');
const {WebClient} = require('@slack/client');
const getVault = require('../utils/get-vault');
const STATUS_INFO = require('../../shared/constants/status-info');

const getToken = async ({
  env,
  env: {config: {slack: {token: {value, vault: {path, key} = {}}}}}
}) => value || (await getVault({env}).get(path))[key];

const getChannel = async ({
  client,
  env: {config: {slack: {channel: defaultChannel}}},
  meta
}) => {
  let {channel} = ((meta || {}).slack || {});
  if (!channel) channel = defaultChannel;
  if (!channel) return;

  if (!channel.startsWith('#')) return channel;

  const {channels} = await client.channels.list();
  return (_.find(channels, {name: channel.slice(1)}) || {}).id;
};

module.exports = async ({
  build: {error, id, ref, repo, sha, tags, status, updatedAt},
  env,
  env: {config: {slack}},
  meta,
  url
}) => {
  if (!slack) return;

  const client = new WebClient(await getToken({env}));
  const channel = await getChannel({client, env, meta});
  if (!channel) return;

  if (!meta.slack) meta.slack = {};
  const {iconEmoji, iconUrl, username} = slack;
  const {color, emojiShortname} = STATUS_INFO[status];
  const title = `:${emojiShortname}: Build #${id} ${repo}#${ref} ${status}`;
  const options = {
    attachments: [{
      color,
      fallback: title,
      fields: !error ? [] : [{title: 'Error', value: error}],
      footer: `SHA ${sha}`,
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

  let {buildId, ts} = meta.slack.message || {};
  if (buildId !== id) ts = null;
  if (ts) return client.chat.update(ts, channel, null, options);

  ts = (await client.chat.postMessage(channel, null, options)).ts;
  _.extend(meta.slack, {channel, message: {buildId: id, ts}});
};
