let flock;
let objects = [];

function setup() {
    createCanvas(windowWidth, windowHeight);

    flock = new Flock();
    //Add an initial set of boids into the system
    for (let i = 0; i < 10; i++) {
        let b = new Boid(width / 2, height / 2, 8);
        flock.addBoid(b);
    }

    let object = {
        a: createVector(width / 2, height / 2),
        b: createVector(width / 2 + 200, height / 2)
    }

    let object1 = {
        a: createVector(width / 3, height / 2 + 200),
        b: createVector(width / 3, height / 3),
    }
    objects.push(object);
    objects.push(object1);

}

function draw() {
    background(51);
    flock.run();

    for (let i = 0; i < objects.length; i++) {
        strokeWeight(4);
        line(objects[i].a.x, objects[i].a.y, objects[i].b.x, objects[i].b.y);

    }
}

// Add a new boid into the System
function mouseDragged() {
    flock.addBoid(new Boid(mouseX, mouseY, 12));
}

// calculate the squared distance of a point P to a line segment A-B
// and return the nearest line point S
function distLineToPoint(A, B, P) {

    let distance;
    let S = createVector();

    let vx = P.x - A.x,
        vy = P.y - A.y; // v = A->P
    let ux = B.x - A.x,
        uy = B.y - A.y; // u = A->B
    let det = vx * ux + vy * uy;

    if (det <= 0) { // its outside the line segment near A
        S.set(A);
        distance = vx * vx + vy * vy;
    } else {
        let len = ux * ux + uy * uy; // len = u^2
        if (det >= len) { // its outside the line segment near B
            S.set(B);
            distance = sq(B.x - P.x) + sq(B.y - P.y);
        } else {
            // its near line segment between A and B
            let ex = ux / sqrt(len); // e = u / |u^2|
            let ey = uy / sqrt(len);
            let f = ex * vx + ey * vy; // f = e . v
            S.x = A.x + f * ex; // S = A + f * e
            S.y = A.y + f * ey;

            distance = sq(ux * vy - uy * vx) / len; // (u X v)^2 / len
        }
    }
    return { distance: sqrt(distance), point: S }

}

// The Nature of Code
// Daniel Shiffman
// http://natureofcode.com

// Flock object
// Does very little, simply manages the array of all the boids

class Flock {
    constructor() {
        // An array for all the boids
        this.boids = []; // Initialize the array
    }


    run() {
        for (let i = 0; i < this.boids.length; i++) {
            this.boids[i].run(this.boids); // Passing the entire list of boids to each boid individually
        }
    }

    addBoid(b) {
        this.boids.push(b);
    }
}

// The Nature of Code
// Daniel Shiffman
// http://natureofcode.com

// Boid class
// Methods for Separation, Cohesion, Alignment added

class Boid {
    constructor(x, y, r) {
        this.acceleration = createVector(0, 0);
        this.velocity = createVector(random(-1, 1), random(-1, 1));
        this.position = createVector(x, y);
        this.r = r;
        this.maxspeed = 3; // Maximum speed
        this.maxforce = 0.05; // Maximum steering force
        this.flap = 0;
    }

    run(boids) {
        this.flock(boids);
        this.update();
        this.borders();
        this.render();
        this.acceleration.mult(0);

    }

    applyForce(force) {
        // We could add mass here if we want A = F / M
        this.acceleration.add(force);
    }

    // We accumulate a new acceleration each time based on three rules
    flock(boids) {
        let sep = this.separate(boids); // Separation
        let ali = this.align(boids); // Alignment
        let coh = this.cohesion(boids); // Cohesion
        let avo = this.avoidObjects(objects);
        //onsole.log(avo);
        // Arbitrarily weight these forces
        sep.mult(1.2);
        ali.mult(1.3);
        coh.mult(1.0);
        avo.mult(2.0);
        // Add the force vectors to acceleration
        this.applyForce(sep);
        this.applyForce(ali);
        this.applyForce(coh);
        this.applyForce(avo);

    }

    avoidObjects(objects) {
        let steer = createVector(0, 0);
        let count = 0;

        for (let i = 0; i < objects.length; i++) {
            let { distance, point } = distLineToPoint(objects[i].a, objects[i].b, this.position);
            let desiredseparation = 5 * this.r;
            console.log(distance);



            // If the distance is greater than 0 and less than an arbitrary amount (0 when you are yourself)
            if ((distance > 0) && (distance < desiredseparation)) {
                // Calculate vector pointing away from neighbor
                let diff = p5.Vector.sub(this.position, point);
                diff.normalize();
                diff.div(distance); // Weight by distance
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
            steer.mult(this.maxspeed);
            steer.sub(this.velocity);
            steer.limit(this.maxforce);
        }
        return steer;

    }

    // Method to update location
    update() {
        // Update velocity
        this.velocity.add(this.acceleration);
        // Limit speed
        this.velocity.limit(this.maxspeed);
        this.position.add(this.velocity);
        // Reset accelertion to 0 each cycle
    }

    // A method that calculates and applies a steering force towards a target
    // STEER = DESIRED MINUS VELOCITY
    seek(target) {
        let desired = p5.Vector.sub(target, this.position); // A vector pointing from the location to the target
        // Normalize desired and scale to maximum speed
        desired.normalize();
        desired.mult(this.maxspeed);
        // Steering = Desired minus Velocity
        let steer = p5.Vector.sub(desired, this.velocity);
        steer.limit(this.maxforce); // Limit to maximum steering force
        return steer;
    }

    render() {
        // Draw a triangle rotated in the direction of velocity
        let theta = this.velocity.heading()
        fill(127);
        stroke(200);
        push();
        translate(this.position.x, this.position.y);
        rotate(theta);

        let speed = this.velocity.mag();
        let acc = this.acceleration.mag();
        let flapspeed = 0.01 + acc * 3 + speed * 0.2 * (7 / this.r);

        this.flap += flapspeed * 0.5;
        this.la = (sin(this.flap) + 1) / 2;
        this.ra = (sin(radians(200) + this.flap) + 1) / 2;


        stroke(255);
        strokeWeight(5);
        line(0, 0, -this.r / 2 + (this.la * this.r / 2) * 1.4, -this.r + (this.la * this.r / 2) * 1.6);
        line(0, 0, this.r / 2 - (this.ra * this.r / 2) * 2, +this.r - (this.ra * this.r / 2) * 1.8);
        pop();




    }

    // Wraparound
    borders() {
        if (this.position.x < -this.r) this.position.x = width + this.r;
        if (this.position.y < -this.r) this.position.y = height + this.r;
        if (this.position.x > width + this.r) this.position.x = -this.r;
        if (this.position.y > height + this.r) this.position.y = -this.r;
    }

    // Separation
    // Method checks for nearby boids and steers away
    separate(boids) {
        let steer = createVector(0, 0);
        let count = 0;
        // For every boid in the system, check if it's too close
        for (let i = 0; i < boids.length; i++) {
            let d = p5.Vector.dist(this.position, boids[i].position);
            let desiredseparation = 1.8 * this.r + 1.8 * boids[i].r;

            // If the distance is greater than 0 and less than an arbitrary amount (0 when you are yourself)
            if ((d > 0) && (d < desiredseparation)) {
                // Calculate vector pointing away from neighbor
                let diff = p5.Vector.sub(this.position, boids[i].position);
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
            steer.mult(this.maxspeed);
            steer.sub(this.velocity);
            steer.limit(this.maxforce);
        }
        return steer;
    }

    // Alignment
    // For every nearby boid in the system, calculate the average velocity
    align(boids) {
        let sum = createVector(0, 0);
        let count = 0;
        for (let i = 0; i < boids.length; i++) {
            let neighbordist = 2.5 * this.r + 2.5 * boids[i].r;

            let d = p5.Vector.dist(this.position, boids[i].position);
            if ((d > 0) && (d < neighbordist)) {
                sum.add(boids[i].velocity);
                count++;
            }
        }
        if (count > 0) {
            sum.div(count);
            sum.normalize();
            sum.mult(this.maxspeed);
            let steer = p5.Vector.sub(sum, this.velocity);
            steer.limit(this.maxforce);
            return steer;
        } else {
            return createVector(0, 0);
        }
    }

    // Cohesion
    // For the average location (i.e. center) of all nearby boids, calculate steering vector towards that location
    cohesion(boids) {
        let sum = createVector(0, 0); // Start with empty vector to accumulate all locations
        let count = 0;
        for (let i = 0; i < boids.length; i++) {
            let neighbordist = 2.5 * this.r + 2.5 * boids[i].r;

            let d = p5.Vector.dist(this.position, boids[i].position);
            if ((d > 0) && (d < neighbordist)) {
                sum.add(boids[i].position); // Add location
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
}