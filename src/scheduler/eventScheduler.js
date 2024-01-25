const amqp = require('amqplib');
const cron = require('node-cron');

async function generateScheduledEvent() {
  const connection = await amqp.connect('amqp://localhost');
  const channel = await connection.createChannel();
  const exchangeName = 'scheduled-events';

  // Declare exchange (fanout type)
  await channel.assertExchange(exchangeName, 'fanout', { durable: false });

  // Schedule event generation every minute
  cron.schedule('* * * * *', async () => {
    const event = {
      type: 'scheduled.event',
      data: {
        timestamp: new Date().toISOString(),
      },
    };

    // Publish the event to the exchange
    channel.publish(exchangeName, '', Buffer.from(JSON.stringify(event)));
    console.log(`Scheduled Event generated: ${JSON.stringify(event)}`);
  });
}

generateScheduledEvent();