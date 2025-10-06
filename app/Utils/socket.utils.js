const Ws = use('Ws')

function broadcast(id, type, data) {
  const channel = Ws.getChannel('order:*')
  if (!channel) return

  const topic = channel.topic(`order:${id}`)
  if (!topic) {
    console.error('Has no topic')
    return
  }

  // emit, broadcast, broadcastToAll
  topic.broadcastToAll(`message`, {
    type,
    data
  });
}

module.exports = {
  broadcast
}
