const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

canvas.width = innerWidth;
canvas.height = innerHeight;



//boundaries voor de game in een 5x5 platform game.
class Boundary {
    constructor({ position }) {
        this.position = position;
        this.width = 40;
        this.height = 40;
    }

    draw() {
        c.fillStyle = 'blue';
        c.fillRect(this.position.x, this.position.y, this.width, this.height);
    }
}

const boundaries = [
    new Boundary({
        position: { 
            x: 0,
            y: 0
        }
    }), 
    new Boundary({
        position: { 
            x: 41,
            y: 0
        }
    }), 
    new Boundary({
        position: { 
            x: 41,
            y: 0
        }
    }), 
    
    new Boundary({
        position: { 
            x: 41,
            y: 0
        }
    }), 
];

const boundaries2 = [
    new Boundary({
        position: { 
            x: 41,
            y: 0
        }
    })
];


boundaries.forEach((boundary) => {
    boundary.draw()
})

