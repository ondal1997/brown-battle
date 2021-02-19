// --------
// 프레임워크 로드
const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')
ctx.imageSmoothingEnabled = false

// --------
// 이미지 로드
const images = {}

let imageLoadCount = 0
const targetImageLoadCount = imageResources.length

for (const imageResource of imageResources) {
    const { key, src, center } = imageResource

    const image = new Image()
    image.src = src
    image.center = center
    image.onload = () => {
        imageLoadCount++
        if (imageLoadCount === targetImageLoadCount) {
            connectNetwork()
        }
    }
    image.onerror = () => {
        console.log('에러, 이미지 리소스 로드 실패')
    }

    images[key] = image
}

// --------
// 게임 월드
let entities
let myEntityId

// --------
// 네트워크 설정
let socket

const connectNetwork = () => {
    socket = io()

    // socket.on('connect', () => {
    // })

    // socket.on('disconnect', () => {
    // })

    // 리펙토링 요망
    canvas.addEventListener('click', (event) => {
        const x = event.offsetX
        const y = event.offsetY

        const command = { commandType: 'move', angle: Math.atan2(y - entities[myEntityId].position.z, x - entities[myEntityId].position.x) }
        socket.emit('playerCommand', command)
    })

    socket.on('updateWorld', () => {
        // unitUpdate
        for (const entity of Object.values(entities)) {
            entity.update()
        }

        // translate
        for (const entity of Object.values(entities)) {
            entity.velocity.x *= 0.95
            entity.velocity.z *= 0.95

            entity.position.x += entity.velocity.x
            entity.position.z += entity.velocity.z
        }

        // render
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        const entitiesSortedByZ = Object.values(entities)
        entitiesSortedByZ.sort((a, b) => {
            return a.position.z - b.position.z
        })
        for (const entity of entitiesSortedByZ) {
            let imageKey
            if (entity.state === 'idle') {
                if (entity.stateTick < 20) {
                    imageKey = '브라운_idle0'
                }
                else if (entity.stateTick < 40) {
                    imageKey = '브라운_idle1'
                }
            }
            else if (entity.state === 'move') {
                if (entity.stateTick < 15) {
                    imageKey = '브라운_move0'
                }
                else if (entity.stateTick < 80) {
                    imageKey = '브라운_move1'
                }
            }

            const image = images[imageKey]
            ctx.save()
            ctx.translate(entity.position.x, entity.position.z)
            ctx.scale(entity.direction.x, 1)
            ctx.translate(-image.center.x, -image.center.y)
            ctx.drawImage(image, 0, 0)
            ctx.restore()
        }
    })

    socket.on('playerCommand', (data) => {
        // CORE LOGIC
        switch (data.commandType) {
            case 'move':
                entities[data.entity_id].doMove(data.angle)
                break
        }
    })

    socket.on('initLobby', (data) => {
        entities = data.entities
        // 리펙토링 요망
        
        for (const entity of Object.values(entities)) {
            entity.doMove = (angle) => {
                if (entity.state === 'idle' || (entity.state === 'move' && entity.moveCount < entity.maxMoveCount && entity.stateTick >= 5)) {
                    entity.state = 'move'
                    entity.stateTick = 0
                    entity.moveCount++
                    entity.velocity.x += entity.movePoint * Math.cos(angle)
                    entity.velocity.z += entity.movePoint * Math.sin(angle)
                    if (Math.abs(angle) > Math.PI / 2) {
                        entity.direction.x = -1
                    }
                    else {
                        entity.direction.x = 1
                    }
                
                    if (angle < 0) {
                        entity.direction.z = -1
                    }
                    else {
                        entity.direction.z = 1
                    }
                    return
                }
            }

            entity.update = () => {
                if (entity.state === 'idle') {
                    entity.stateTick++
                    if (entity.stateTick === 40) {
                        entity.stateTick = 0
                    }
                    return
                }
    
                if (entity.state === 'move') {
                    entity.stateTick++
                    if (entity.stateTick === 80) {
                        entity.state = 'idle'
                        entity.stateTick = 0
                        entity.moveCount = 0
                    }
                    return
                }
            }
        }

        //
        myEntityId = data.entity_id
    })

    socket.on('initGame', (data) => {

    })

    socket.on('playerEnter', (data) => {
        // CORE LOGIC
        const entity_id = data.entity_id

        entities[entity_id] = {
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
    })

    socket.on('playerExit', (data) => {
        // CORE LOGIC
        delete entities[data.entity_id]
    })
}
