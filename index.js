const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

canvas.width = innerWidth;
canvas.height = innerHeight;

class Player {
    constructor() {
        this.velocity = {
            x: 0,
            y: 0
        };
        this.rotation = 0;

        const image = new Image();
        image.src = './player.png';
        image.onload = () => {
            const scale = 0.15;
            this.image = image;
            this.width = image.width * scale;
            this.height = image.height * scale;
            this.position = {
                x: canvas.width / 2 - this.width / 2,
                y: canvas.height - this.height - 20
            };
        };
    }

    draw() {
        if (!this.image || !this.image.complete) return; // Ensure the image is loaded
        c.save();
        c.translate(this.position.x + this.width / 2, this.position.y + this.height / 2);
        c.rotate(this.rotation);
        c.translate(-this.position.x - this.width / 2, -this.position.y - this.height / 2);
        c.drawImage(this.image, this.position.x, this.position.y, this.width, this.height);
        c.restore();
    }
 
    update() {
        if (this.image) {
            this.draw();
            this.position.x += this.velocity.x;
        }
    }
}

class Projectile {
    constructor({ position, velocity }) {
        this.position = position;
        this.velocity = velocity;
        this.radius = 3;
    }

    draw() {
        c.beginPath();
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        c.fillStyle = 'red';
        c.fill();
        c.closePath();
    }

    update() {
        this.draw();
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }
}


class InvaderProjectile {
    constructor({ position, velocity }) {
        this.position = position;
        this.velocity = velocity;
        this.width=3
        this.height=10
    }

    draw() {
        c.fillStyle='white'
        c.fillRect(this.position.x,this.position.y,this.width,this.height)
    }

    update() {
        this.draw();
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }
}


class Invader {
    constructor({ position }) {
        this.velocity = {
            x: 3,
            y: 0
        };

        const image = new Image();
        image.src = './enemy.png';
        image.onload = () => {
            const scale = 0.03;
            this.image = image;
            this.width = image.width * scale;
            this.height = image.height * scale;
            this.position = {
                x: position.x,
                y: position.y
            };
        };
    }

    draw() {
        if (!this.image || !this.position) return; // Ensure the image is loaded and position is set
        c.drawImage(this.image, this.position.x, this.position.y, this.width, this.height);
    }

    update({ velocity }) {
        if (this.image) {
            this.draw();
            this.position.x += velocity.x;
            this.position.y += velocity.y;
        }
    }
    shoot(invaderProjectiles){
        invaderProjectiles.push(new InvaderProjectile({position:{
            x: this.position.x +this.width/2,
            y:this.position.y+ this.height
        },
        velocity:{
            x:0,
            y:5
        }
    }))

    }
}

class Grid {
    constructor() {
        this.position = { x: 0, y: 0 };
        this.velocity = { x: 3, y: 0 };
        this.invaders = [];

        const rows = Math.floor(Math.random() * 5 + 2);
        const cols = Math.floor(Math.random() * 10 + 3);
        this.width = cols * 30;

        for (let i = 0; i < cols; i++) {
            for (let y = 0; y < rows; y++) {
                this.invaders.push(
                    new Invader({
                        position: { x: i * 30, y: y * 30 }
                    })
                );
            }
        }
    }

    update() {
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
        this.velocity.y = 0;

        if (this.position.x + this.width >= canvas.width || this.position.x <= 0) {
            this.velocity.x = -this.velocity.x;
            this.velocity.y =30;
        }
    }
}

const player = new Player();
const projectiles = [];
const grids = [new Grid()];
const invaderProjectiles=[]
const keys = {
    a: { pressed: false },
    d: { pressed: false },
    space: { pressed: false }
};





let frames = 0;
let randomInterval= Math.floor(Math.random() *500)+500




function animate() {
    requestAnimationFrame(animate);

    // Clear the canvas
    c.fillStyle = 'black';
    c.fillRect(0, 0, canvas.width, canvas.height);

    // Update player
    player.update();
    invaderProjectiles.forEach((invaderProjectile, index)=>{
        if(invaderProjectile.position.y+ invaderProjectile.height>= canvas.height){
            setTimeout(()=>{
                invaderProjectiles.splice(index,1)
            },0)
        }invaderProjectile.update()

        if(invaderProjectile.position.y+ invaderProjectile.height >= player.position.y && invaderProjectile.position.x+invaderProjectile.width>= player.position.x&& invaderProjectile.position.x <= player.position.x+player.width){
            console.log('you lose')
        }
    })

    // Update projectiles and remove off-screen projectiles
    projectiles.forEach((projectile, index) => {
        if (projectile.position.y + projectile.radius <= 0) {
            setTimeout(() => {
                projectiles.splice(index, 1);
            }, 0);
        } else {
            projectile.update();
        }
    });


    // Update grids and invaders
    grids.forEach((grid, gridIndex) => {
        grid.update();
         if(frames%100===0 && grid.invaders.length>0){
            grid.invaders[Math.floor(Math.random()*grid.invaders.length)].shoot(invaderProjectiles)
        }
        grid.invaders.forEach((invader, i) => {
            invader.update({ velocity: grid.velocity });

            // Check for collision between projectiles and invaders
            projectiles.forEach((projectile, j) => {
                if (
                    projectile.position.y - projectile.radius <= invader.position.y + invader.height &&
                    projectile.position.x + projectile.radius >= invader.position.x &&
                    projectile.position.x - projectile.radius <= invader.position.x + invader.width
                ) {
                    // Remove both invader and projectile safely
                    setTimeout(() => {
                        const invaderFound=grid.invaders.find((invader2)=>invader2 === invader)
                        const projectileFound = projectiles.find((projectile2)=> projectile2 ===projectile)
                        if (grid.invaders.includes(invader) && projectiles.includes(projectile)) {
                            grid.invaders.splice(i, 1); // Remove invader
                            projectiles.splice(j, 1);  // Remove projectile

                            if(grid.invaders.length>0){
                                const firstInvader = grid.invaders[0]
                                const lastInvader= grid.invaders[grid.invaders.length-1]
                                grid.width=lastInvader.position.x-firstInvader.position.x+ lastInvader.width
                                grid.position.x=firstInvader.position.x

                            }else{
                                grid.splice(gridIndex,1)
                            }

                        }
                    }, 0);
                }
            });
        });
    });

    // Handle player movement
    if (keys.a.pressed && player.position.x >= 0) {
        player.velocity.x = -5;
        player.rotation = -0.15;
    } else if (keys.d.pressed && player.position.x + player.width <= canvas.width) {
        player.velocity.x = 5;
        player.rotation = 0.15;
    } else {
        player.velocity.x = 0;
        player.rotation = 0;
    }

    // Log frames for debugging
    console.log(frames);

    // Spawn grids at random intervals
    if (frames % randomInterval === 0) {
        grids.push(new Grid());
        randomInterval = Math.floor(Math.random() * 500) + 500; // Randomize interval
        frames = 0;
    }
    //sawn projectiles
    frames++; // Increment frames
}


animate();
console.log('Animating frame:', frames); // Debugging


addEventListener('keydown', ({ key }) => {
    switch (key) {
        case 'a':
            keys.a.pressed = true;
            break;
        case 'd':
            keys.d.pressed = true;
            break;
        case ' ':
            projectiles.push(
                new Projectile({
                    position: { x: player.position.x + player.width / 2, y: player.position.y },
                    velocity: { x: 0, y: -12 }
                })
            );
            break;
    }
});

addEventListener('keyup', ({ key }) => {
    switch (key) {
        case 'a':
            keys.a.pressed = false;
            break;
        case 'd':
            keys.d.pressed = false;
            break;
    }
});
