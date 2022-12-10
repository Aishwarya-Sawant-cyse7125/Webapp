console.log("Producer")
const Kafka = require('node-rdkafka');

// create a stream with broker list, options and topic
const producer = Kafka.Producer.createWriteStream({
    'metadata.broker.list': 'a3d5c8632a6384a7f80c3221f6f942d1-339011804.us-east-1.elb.amazonaws.com:9094'
}, {}, { topic: 'rolwyn' })

const queueMessage = () => {
    const event = { index: 'summary', taskID: 1 }
    console.log(Buffer.from(JSON.stringify(event)))
    const result = producer.write(Buffer.from(JSON.stringify(event)))
    if (result) {
        console.log(result)
        console.log('We queued our message!'); 
    }
    else
        console.log('Too many messages in our queue already');    
}

setInterval(() => {
    queueMessage()
}, 3000)

// if (queueMessage) {
//     console.log('We queued our message!');
// } else {
//     console.log('Too many messages in our queue already');
// }


producer.on('error', function (err) {
    console.error('Error in our kafka stream');
    console.error(err);
})


// var producer = new Kafka.Producer({
//     'metadata.broker.list': 'localhost:9092',
//     'dr_cb': true
//   });
  
//   // Connect to the broker manually
//   producer.connect();
  
//   // Wait for the ready event before proceeding
//   producer.on('ready', function() {
//     try {
//       producer.produce(
//         // Topic to send the message to
//         'topic',
//         // optionally we can manually specify a partition for the message
//         // this defaults to -1 - which will use librdkafka's default partitioner (consistent random for keyed messages, random for unkeyed messages)
//         null,
//         // Message to send. Must be a buffer
//         Buffer.from('Awesome message'),
//         // for keyed messages, we also specify the key - note that this field is optional
//         'Stormwind',
//         // you can send a timestamp here. If your broker version supports it,
//         // it will get added. Otherwise, we default to 0
//         Date.now(),
//         // you can send an opaque token here, which gets passed along
//         // to your delivery reports
//       );
//     } catch (err) {
//       console.error('A problem occurred when sending our message');
//       console.error(err);
//     }
//   });
  
//   // Any errors we encounter, including connection errors
//   producer.on('event.error', function(err) {
//     console.error('Error from producer');
//     console.error(err);
//   })
  
//   // We must either call .poll() manually after sending messages
//   // or set the producer to poll on an interval (.setPollInterval).
//   // Without this, we do not get delivery events and the queue
//   // will eventually fill up.
//   producer.setPollInterval(100);