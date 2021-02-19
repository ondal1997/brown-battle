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
let entityId

// --------
// 네트워크 설정
let socket

const connectNetwork = () => {
    socket = io()

    // socket.on('connect', () => {
    // })

    // socket.on('disconnect', () => {
    // })

    canvas.addEventListener('click', (event) => {
        const x = event.offsetX / canvas.getBoundingClientRect().width * canvas.width
        const y = event.offsetY / canvas.getBoundingClientRect().height * canvas.height

        const command = {
            commandType: 'move',
            angle: Math.atan2(y - entities[entityId].position.z, x - entities[entityId].position.x)
        }
        socket.emit('playerCommand', command)
    })

    socket.on('updateWorld', () => {
        brownLogic.update(entities)
        translateLogic.update(entities)

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
        playerCommand(entities, data)
    })

    socket.on('initLobby', (data) => {
        entities = data.entities
        entityId = data.entityId
    })

    socket.on('initGame', (data) => {

    })

    socket.on('playerEnter', (data) => {
        playerEnter(entities, data)
    })

    socket.on('playerExit', (data) => {
        playerExit(entities, data)
    })
}
