const render = (entities) => {
    if (entities[entityId].state === 'cry')
    {
        document.body.style.backgroundColor = 'Black'
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.beginPath()
    ctx.arc(250, 250, 200, 0, 2 * Math.PI)
    ctx.fillStyle = 'white'
    ctx.fill()
    const entitiesSortedByZ = Object.values(entities)
    entitiesSortedByZ.sort((a, b) => {
        return a.position.z - b.position.z
    })
    for (const entity of entitiesSortedByZ) {
        let imageKey

        switch (entity.state) {
            case 'idle':
                if (entity.stateTick < 20) {
                    imageKey = '브라운_idle0'
                }
                else {
                    imageKey = '브라운_idle1'
                }
                break

            case 'move':
                if (entity.stateTick < 15) {
                    imageKey = '브라운_move0'
                }
                else {
                    imageKey = '브라운_move1'
                }
                break

            case 'fire':
                if (entity.stateTick < 15) {
                    imageKey = '브라운_pose'
                }
                else if (entity.stateTick < 20) {
                    imageKey = '브라운_smash0'
                }
                else {
                    imageKey = '브라운_smash1'
                }
                break

            case 'cry':
                if (entity.stateTick < 15) {
                    imageKey = '브라운_cry0'
                }
                else {
                    imageKey = '브라운_cry1'
                }
                break
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