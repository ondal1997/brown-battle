// --------
// 프레임워크 로드
const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')
ctx.imageSmoothingEnabled = false
let focusX = 0
let focusZ = 0
canvas.addEventListener('mousemove', (event) => {
    focusX = event.offsetX / canvas.getBoundingClientRect().width * canvas.width
    focusZ = event.offsetY / canvas.getBoundingClientRect().height * canvas.height
})

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
        const focusX = event.offsetX / canvas.getBoundingClientRect().width * canvas.width
        const focusZ = event.offsetY / canvas.getBoundingClientRect().height * canvas.height

        const command = {
            commandType: 'move',
            angle: Math.atan2(focusZ - entities[entityId].position.z, focusX - entities[entityId].position.x)
        }
        socket.emit('playerCommand', command)
    })

    window.addEventListener('keydown', () => {
        const command = {
            commandType: 'fire',
            angle: Math.atan2(focusZ - entities[entityId].position.z, focusX - entities[entityId].position.x)
        }
        socket.emit('playerCommand', command)
    })

    socket.on('updateWorld', () => {
        brownLogic.update(entities)
        translateLogic.update(entities)
        render(entities)
    })

    socket.on('playerCommand', (data) => {
        playerCommand(entities, data)
    })

    socket.on('initLobby', (data) => {
        entities = data.entities
        entityId = data.entityId
        render(entities)
    })

    socket.on('initGame', (data) => {
        entities = data.entities
        entityId = data.entityId
        render(entities)

        // 게임 초기화
    })

    socket.on('playerEnter', (data) => {
        playerEnter(entities, data)
    })

    socket.on('playerExit', (data) => {
        playerExit(entities, data)
    })
}
