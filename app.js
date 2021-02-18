const express = require('express')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const port = process.env.PORT | 3000

app.use('/', express.static('client'))

io.on('connection', (socket) => {
    /*

    socket.broadcast.emit('join', socket.id)
    joinPlayer(socket.id)

    socket.emit('welcome', data)
    socket.on('disconnect', () => {
        io.emit('userLeft', socket,id)
    })

    ...

    */
})

http.listen(port, () => {
    console.log(`서버가 ${port}번 포트에 열렸습니다`)
})
