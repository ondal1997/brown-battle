const express = require('express')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const port = process.env.PORT | 3000

app.use('/', express.static('client'))

const sockets = {
    // socket_id: { where }
}

const lobby = {
    socketToEntity: {
        // socket_id: entity_id
    },
    entities: {
        // entity_id: { ... }
    }
}

const matchingQueue = []

const game = {
    socketToEntity: {
        // socket_id: entity_id
    },
    entities: {
        // entity_id: { ... }
    }
}

const games = {
    // game_id: game
}

io.on('connection', (socket) => {
    const socket_id = socket.id

    sockets[socket_id] = {
        where: "lobby"
    }

    // const entity = lobby.createEntityBySocketId(socket_id)
    const entity_id = lobby.getNewEntityId()
    lobby.socketToEntity[socket_id] = entity_id
    lobby.entities[entity_id] = {
        // ...
    }

    lobby.socketToEntity.keys.emit('addEntity', entity)

    /*
    socket.on('disconnect', () => {
        // disconnect process
        io.emit('leaveOut', socket.id)
    })
    */
})

http.listen(port, () => {
    console.log(`서버가 ${port}번 포트에 열렸습니다`)
})
