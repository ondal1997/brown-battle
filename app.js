const { brownLogic, translateLogic, playerEnter, playerExit, playerCommand } = require('./core.js')

const express = require('express')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const port = process.env.PORT | 3000

app.use(express.static('client'))

const socketWrappers = {
    // socketId: { socket, where }
}

const lobby = {
    socketToEntity: {
    },
    entityToSocket: {
    },
    entityIdCount: 0,
    entities: {
    },

    oldTime: undefined,
    updateTerm: 10,
    emit(type, data) {
        for (const socketId in this.socketToEntity) {
            socketWrappers[socketId].socket.emit(type, data)
        }
    },
    idleToUpdate() {
        const newTime = Date.now()
        while (newTime - this.oldTime >= this.updateTerm) {
            this.oldTime += this.updateTerm

            this.emit('updateWorld')
            brownLogic.update(this.entities)
            translateLogic.update(this.entities)
        }
        setTimeout(() => this.idleToUpdate())
    },
    start() {
        this.oldTime = Date.now()
        setTimeout(() => this.idleToUpdate())
    }
}

io.on('connection', (socket) => {
    console.log('플레이어 로비 접속')
    const socketId = socket.id
    socketWrappers[socketId] = {
        socket,
        where: 'lobby'
    }

    const entity = {
        type: 'brown',
        position: {
            x: 100,
            z: 100
        },
        velocity: {
            x: 0,
            z: 0
        },
        direction: {
            x: 1,
            z: 1
        },
        movePoint: 3,
        state: 'idle',
        stateTick: 0,
        maxMoveCount: 2,
        moveCount: 0
    }

    const entityId = lobby.entityIdCount++

    const data = { entityId, entity }
    lobby.emit('playerEnter', data)
    playerEnter(lobby.entities, data)

    lobby.socketToEntity[socketId] = entityId
    lobby.entityToSocket[entityId] = socketId

    socket.emit('initLobby', { entities: lobby.entities, entityId: entityId })

    socket.on('playerCommand', (data) => {
        data.entityId = lobby.socketToEntity[socketId]
        lobby.emit('playerCommand', data)
        playerCommand(lobby.entities, data)
    })

    socket.on('disconnect', () => {
        console.log('플레이어 로비 나감')
        delete socketWrappers[socketId]
        delete lobby.socketToEntity[socketId]
        delete lobby.entityToSocket[entityId]

        const data = { entityId }
        lobby.emit('playerExit', data)
        playerExit(lobby.entities, data)
    })
})

http.listen(port, () => {
    console.log(`서버가 ${port}번 포트에 열렸습니다`)
})

lobby.start()
