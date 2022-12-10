console.log("Consumer")
const Kafka = require('node-rdkafka');

// create a stream with broker list, options and topic
const consumer = Kafka.KafkaConsumer({
    'group.id': 'infra-chart',
    'metadata.broker.list': 'a49fd206fe07d4b00abfee3ff46383df-1826894528.us-east-1.elb.amazonaws.com:9094'
}, {})

consumer.connect();

consumer.on('ready', () => {
    console.log('The consumer is ready')
    consumer.subscribe(['rolwyn'])
    consumer.consume();
}).on('data', (data) => {
    console.log(`The message is received: ${data.value}`)
    // await client.update({
    //     index: data.value.index,
    //     doc: {
    //         taskID: data.value.taskID
    //     }
    // })
})

consumer.on('error', function (err) {
    console.error('Error in our kafka stream');
    console.error(err);
})

// const queueMessage = () => {
//     const result = producer.write(Buffer.from('hi'))
//     if (result)
//         console.log('We queued our message!'); 
//     else
//         console.log('Too many messages in our queue already');    
// }

// setInterval(() => {
//     queueMessage()
// }, 3000)
