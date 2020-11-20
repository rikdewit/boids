let boids = [];

class Boid {
    constructor(x, y, size) {
        this.size = size;
        this.maxv = 3;
        this.minv = .8

        this.a = createVector(0, 0);
        this.v = createVector(random(-1, 1), random(-1, 1));
        this.pos = createVector(x, y);
        this.maxf = 0.05;

    }

    rotate(amount) {
        this.dir += amount;
    }
    speed(amount) {
        this.v.add(amount);

    }

    steer(dir) {

        let s = createVector(this.v.y * dir, -this.v.x * dir);
        let a = p5.Vector.sub(s, this.v).normalize().mult(0.01);
        this.applyForce(a);
    }
    seek(target) {
        let desired = p5.Vector.sub(target, this.position); // A vector pointing from the location to the target
        // Normalize desired and scale to maximum speed
        desired.normalize();
        desired.mult(this.maxv);
        // Steering = Desired minus Velocity
        let steer = p5.Vector.sub(desired, this.v);
        steer.limit(this.maxf); // Limit to maximum steering force
        return steer;
    }

    applyForce(force) {
        // We could add mass here if we want A = F / M
        this.a.add(force);
    }

    cohesion(boids) {
        let neighbordist = 50;
        let sum = createVector(0, 0); // Start with empty vector to accumulate all locations
        let count = 0;
        for (let i = 0; i < boids.length; i++) {
            let d = p5.Vector.dist(this.pos, boids[i].pos);
            if ((d > 0) && (d < neighbordist)) {
                sum.add(boids[i].pos); // Add location
                count++;
            }
        }
        if (count > 0) {
            sum.div(count);
            return this.seek(sum); // Steer towards the location
        } else {
            return createVector(0, 0);
        }
    }

    align(boids) {
        let neighbordist = 50;
        let sum = createVector(0, 0);
        let count = 0;
        for (let i = 0; i < boids.length; i++) {
            let d = p5.Vector.dist(this.pos, boids[i].pos);
            if ((d > 0) && (d < neighbordist)) {
                sum.add(boids[i].v);
                count++;
            }
        }
        if (count > 0) {
            sum.div(count);
            sum.normalize();
            sum.mult(this.maxv);
            let steer = p5.Vector.sub(sum, this.v);
            steer.limit(this.maxf);
            return steer;
        } else {
            return createVector(0, 0);
        }
    }

    separate(boids) {
        let desiredseparation = 25.0;
        let steer = createVector(0, 0);
        let count = 0;
        // For every boid in the system, check if it's too close
        for (let i = 0; i < boids.length; i++) {
            let d = p5.Vector.dist(this.pos, boids[i].pos);
            // If the distance is greater than 0 and less than an arbitrary amount (0 when you are yourself)
            if ((d > 0) && (d < desiredseparation)) {
                // Calculate vector pointing away from neighbor
                let diff = p5.Vector.sub(this.pos, boids[i].pos);
                diff.normalize();
                diff.div(d); // Weight by distance
                steer.add(diff);
                count++; // Keep track of how many
            }
        }
        // Average -- divide by how many
        if (count > 0) {
            steer.div(count);
        }

        // As long as the vector is greater than 0
        if (steer.mag() > 0) {
            // Implement Reynolds: Steering = Desired - Velocity
            steer.normalize();
            steer.mult(this.maxv);
            steer.sub(this.v);
            steer.limit(this.maxf);
        }
        return steer;
    }


    draw() {
        push();
        translate(this.pos.x, this.pos.y);
        console.log(this.v.heading());
        rotate(radians(this.v.heading()));

        let la = (sin((this.v.mag() * 0.25 + 0.6) * frameCount / 6) + 1) / 2;
        let ra = (sin(radians(200) + (this.v.mag() * 0.25 + 0.6) * frameCount / 6) + 1) / 2;

        stroke(255);
        strokeWeight(5);
        line(0, 0, -this.size / 2 + (la * this.size / 2) * 1.4, -this.size + (la * this.size / 2) * 1.6);
        line(0, 0, this.size / 2 - (ra * this.size / 2) * 2, +this.size - (ra * this.size / 2) * 1.8);
        pop();

    }

    update() {
        // this.x += cos(radians(-this.dir)) * this.v;
        // this.y += sin(radians(-this.dir)) * this.v;
        let coh = this.cohesion(boids);
        let al = this.align(boids);
        let sep = this.separate(boids);

        this.applyForce(coh);
        this.applyForce(al);
        this.applyForce(sep)


        this.v.add(this.a);
        this.v.limit(this.maxv);
        if (this.v.mag() < this.minv) {

            this.v.setMag(this.minv);
        }
        this.pos.add(this.v);
        // Reset accelertion to 0 each cycle
        this.a.mult(0);

    }

}



function setup() {
    createCanvas(windowWidth, windowHeight);
    bird = new Boid(innerWidth / 2, innerHeight / 2, 10);
    boids.push(bird);

    for (let i = 0; i < 10; i++) {
        boid = new Boid(random(innerWidth), random(innerHeight), 10);
        boids.push(boid);
    }



}

function draw() {
    background(0);

    if (keyIsDown(LEFT_ARROW)) {
        bird.steer(1);
    } else if (keyIsDown(RIGHT_ARROW)) {
        bird.steer(-1);
    }
    if (keyIsDown(UP_ARROW)) {
        bird.speed(.03);
    } else if (keyIsDown(DOWN_ARROW)) {
        bird.speed(-.03);
    }

    for (let i = 0; i < boids.length; i++) {
        boids[i].update();
        boids[i].draw();
    }


}