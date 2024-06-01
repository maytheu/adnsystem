import amqp from 'amqplib';

export let channel, connection;

export async function mqServer(queue: string) {
  const amqpServer = 'amqp://localhost:5672';
  connection = await amqp.connect(amqpServer);
  channel = await connection.createChannel();
  await channel.assertQueue(queue);
}
