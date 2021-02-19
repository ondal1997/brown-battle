const brownLogic = {
    update(entities) {
        for (const entityId in entities) {
            const entity = entities[entityId]

            if (entity.type !== 'brown') {
                continue
            }

            switch (entity.state) {
                case 'idle':
                    entity.stateTick++
                    if (entity.stateTick === 40) {
                        entity.stateTick = 0
                    }
                    break
                case 'move':
                    entity.stateTick++
                    if (entity.stateTick === 80) {
                        entity.state = 'idle'
                        entity.stateTick = 0
                        entity.moveCount = 0
                    }
                    break
                case 'fire':
                    entity.stateTick++

                    if (!entity.hitFlag && entity.stateTick >= 15 && entity.stateTick < 20) {
                        for (const other of Object.values(entities)) {
                            if (other === entity) {
                                continue
                            }

                            if (Math.pow(other.position.x - entity.position.x, 2) + Math.pow(other.position.z - entity.position.z, 2) <= Math.pow(30, 2)) {
                                other.velocity.x += 6 * Math.cos(entity.angle)
                                other.velocity.z += 6 * Math.sin(entity.angle)

                                entity.velocity.x -= 3 * Math.cos(entity.angle)
                                entity.velocity.z -= 3 * Math.sin(entity.angle)
                                entity.hitFlag = true
                                break
                            }
                        }
                    }

                    if (entity.stateTick === 80) {
                        entity.state = 'idle'
                        entity.stateTick = 0
                        entity.hitFlag = false
                    }
                    break
            }
        }
    },
    move(entity, angle) {
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
        }
    },
    fire(entities, entity, angle) {
        if (entity.state === 'idle' || entity.state === 'move') {
            entity.state = 'fire'
            entity.stateTick = 0
            entity.moveCount = 0 //
            entity.angle = angle

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
        }
    },
}

const translateLogic = {
    value: 0.95,
    update(entities) {
        for (const entityId in entities) {
            const entity = entities[entityId]

            entity.velocity.x *= this.value
            entity.velocity.z *= this.value

            entity.position.x += entity.velocity.x
            entity.position.z += entity.velocity.z
        }
    }
}

const playerEnter = (entities, data) => {
    const entityId = data.entityId
    const entity = data.entity

    entities[entityId] = entity
}

const playerExit = (entities, data) => {
    const entityId = data.entityId

    delete entities[entityId]
}

const playerCommand = (entities, data) => {
    const commandType = data.commandType
    const entityId = data.entityId
    const angle = data.angle

    switch (commandType) {
        case 'move':
            brownLogic.move(entities[entityId], angle)
            break
        case 'fire':
            brownLogic.fire(entities, entities[entityId], angle)
            break
    }
}
