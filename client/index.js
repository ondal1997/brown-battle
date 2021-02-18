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
            // do next
        }
    }
    image.onerror = () => {
        console.log('에러, 이미지 리소스 로드 실패')
    }

    images[key] = image
}

// --------
// 네트워크 설정
let socket

const connectNetwork = () => {
    socket = io()

    socket.on('connect', () => {
        
    })

    socket.on('disconnect', () => {
        
    })
}

// <정보>를 받고 월드를 구성한다.

// 틱을 받는 족족 업데이트를 한다.

// 새로운 월드 구성 이벤트가 발생하면 ...
// 1. 새로운 월드를 구성한 후 틱을 받는 족족 업데이트를 한다.
// 2. 새로운 월드를 구성한 후 완료 신호를 보내고 틱을 받는다. (이 경우 늦어서 서버가 먼저 가동될 여지가 있긴 하다.)
