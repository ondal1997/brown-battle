const express = require('express')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const port = process.env.PORT | 3000

app.use('/', express.static('client'))

const sockets = {
    // socket_id: { socket, where }
}

const lobby = {
    socketIdToEntity: {
    },
    matchingSockets: {
    },
    entities: {
    },
    entityIdCount: 0,

    oldTime: undefined,
    updateTerm: 10,
    idleToUpdate() {
        const newTime = Date.now()
        while (newTime - this.oldTime >= this.updateTerm) {
            this.oldTime += this.updateTerm
            for (const lobbySocketId in this.socketIdToEntity) {
                sockets[lobbySocketId].socket.emit('updateWorld')
            }

            // unitUpdate
            for (const entity of Object.values(this.entities)) {
                entity.update()
            }

            // translate
            for (const entity of Object.values(this.entities)) {
                entity.velocity.x *= 0.95
                entity.velocity.z *= 0.95

                entity.position.x += entity.velocity.x
                entity.position.z += entity.velocity.z
            }
        }
        setTimeout(() => this.idleToUpdate())
    },
    start() {
        this.oldTime = Date.now()
        setTimeout(() => this.idleToUpdate())
    }
}
lobby.start()

const games = {
    gameIdCount: 0,
    // gameId: { socketIdToEntity, entities, entityIdCount }
}

io.on('connection', (socket) => {
    console.log('플레이어 로비 접속')

    const socket_id = socket.id

    sockets[socket_id] = {
        where: "lobby",
        socket
    }

    // create lobby entity by socket_id
    const entity_id = lobby.entityIdCount++
    for (const otherSocketId in lobby.socketIdToEntity) {
        sockets[otherSocketId].socket.emit('playerEnter', { entity_id })
    }

    lobby.socketIdToEntity[socket_id] = entity_id

    // CORE LOGIC
    lobby.entities[entity_id] = {
        type: '브라운',
        position: {
            x: 0,
            z: 0
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
        moveCount: 0,
        doMove(angle) {
            if (this.state === 'idle' || (this.state === 'move' && this.moveCount < this.maxMoveCount && this.stateTick >= 5)) {
                this.state = 'move'
                this.stateTick = 0
                this.moveCount++
                this.velocity.x += this.movePoint * Math.cos(angle)
                this.velocity.z += this.movePoint * Math.sin(angle)
                if (Math.abs(angle) > Math.PI / 2) {
                    this.direction.x = -1
                }
                else {
                    this.direction.x = 1
                }
            
                if (angle < 0) {
                    this.direction.z = -1
                }
                else {
                    this.direction.z = 1
                }
                return
            }
        },
        update() {
            if (this.state === 'idle') {
                this.stateTick++
                if (this.stateTick === 40) {
                    this.stateTick = 0
                }
                return
            }

            if (this.state === 'move') {
                this.stateTick++
                if (this.stateTick === 80) {
                    this.state = 'idle'
                    this.stateTick = 0
                    this.moveCount = 0
                }
                return
            }
        }
    }

    socket.emit('initLobby', { entities: lobby.entities, entity_id })

    socket.on('playerCommand', (data) => {
        console.log('플레이어 로비에서 명령')

        data.entity_id = entity_id

        for (const lobbySocketId in lobby.socketIdToEntity) {
            sockets[lobbySocketId].socket.emit('playerCommand', data)
        }

        const entities = lobby.entities
        // CORE LOGIC
        switch (data.commandType) {
            case 'move':
                entities[data.entity_id].doMove(data.angle)
                break
        }
    })

    socket.on('disconnect', () => {
        console.log('플레이어 로비 나감')

        delete sockets[socket_id]
        delete lobby.socketIdToEntity[socket_id]
        if (lobby.matchingSockets[socket_id]) {
            delete lobby.matchingSockets[socket_id]
        }

        const data = { entity_id }
        for (const otherSocketId in lobby.socketIdToEntity) {
            sockets[otherSocketId].socket.emit('playerExit', data)
        }

        const entities = lobby.entities
        // CORE LOGIC
        delete entities[data.entity_id]
    })
})

http.listen(port, () => {
    console.log(`서버가 ${port}번 포트에 열렸습니다`)
})
