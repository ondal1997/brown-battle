const entities = {
    // entity_id : { ... }
}

const gameStartLogic = {
    count: 0,
    delay: 10,
    update() {
        if (this.count++ === this.delay) {
            // start
        }
    }
}

const playerLogic = {
    update() {
        for (const entity of Object.values(entities)) {
            entity.state.update()
        }
    }
}

const translateLogic = {
    update() {
        for (const entity of Object.values(entities)) {
            entity.velocity.x *= 0.95
            entity.velocity.y *= 0.95

            entity.position.x += entity.velocity.x
            entity.position.y += entity.velocity.y
        }
    }
}
