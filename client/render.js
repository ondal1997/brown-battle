const render = (entities) => {
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
}