const amqp = require('amqplib');
const fetch = require('node-fetch');
const csv = require('csv-parser');
const fs = require('fs');
const { Client } = require('pg');

async function consumeScheduledEvents() {
  const connection = await amqp.connect('amqp://localhost');
  const channel = await connection.createChannel();
  const exchangeName = 'scheduled-events';

  // Declare exchange (fanout type)
  await channel.assertExchange(exchangeName, 'fanout', { durable: false });

  // Declare a queue with a random name (exclusive and auto-delete)
  const { queue } = await channel.assertQueue('', { exclusive: true, autoDelete: true });

  // Bind the queue to the exchange
  await channel.bindQueue(queue, exchangeName, '');

  console.log('Waiting for scheduled events. To exit press CTRL+C');

  // Consume messages from the queue
  channel.consume(queue, async (msg) => {
    const event = JSON.parse(msg.content.toString());
    console.log(`Received scheduled event: ${JSON.stringify(event)}`);

    // Download CSV file from GitHub
    const csvUrl = 'https://raw.githubusercontent.com/example/example/master/data.csv';
    const response = await fetch(csvUrl);
    const csvFilePath = './downloaded-data.csv';

    const fileStream = fs.createWriteStream(csvFilePath);
    await new Promise((resolve, reject) => {
      response.body.pipe(fileStream);
      response.body.on('error', (err) => {
        reject(err);
      });
      fileStream.on('finish', () => {
        console.log(`CSV file downloaded: ${csvFilePath}`);
        resolve();
      });
    });

    // Import data from CSV into PostgreSQL
    const client = new Client({
      user: 'your_username',
      host: 'your_host',
      database: 'your_database',
      password: 'your_password',
      port: 5432,
    });

    await client.connect();
    const stream = fs.createReadStream(csvFilePath).pipe(csv());

    stream.on('data', async (data) => {
      // Assuming you have a 'your_table' table in your PostgreSQL database
      await client.query(
        `INSERT INTO your_table(column1, column2, column3) VALUES($1, $2, $3)`,
        [data.column1, data.column2, data.column3]
      );
    });

    stream.on('end', async () => {
      console.log('Data imported into PostgreSQL');
      await client.end();
    });

    // Acknowledge the received message
    channel.ack(msg);
  }, { noAck: false });
}

consumeScheduledEvents();