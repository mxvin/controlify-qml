const Wss = require("ws").Server
const net = require('net')

var wsServer = new Wss({port:2299})

wsServer.on('connection', function(ws){

    ws.on('message', function(data){
        console.log('message = %s',data)
    })
    
})
let emitToAll = (msg)=>{
    wsServer.clients.forEach(
        (c)=>{
            c.send(msg)
        }
    )
}
let tcp = net.createServer({},(socket)=>{
    socket.on('data',(data)=>{
        let cmd = data.toString()
        emitToAll(cmd)
        console.log("Receive from TCP: %s",cmd)     
        

    })
    socket.on('error', ()=>{
        
    })    
    
})
tcp.listen(2298)