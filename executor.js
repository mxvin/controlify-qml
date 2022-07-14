const net = require('net')
const process = require('process')

const string = process.argv[2]

let client = net.createConnection({port:2298})
client.write(string)
client.end()