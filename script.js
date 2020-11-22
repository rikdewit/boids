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
        a: createVector(0, height - 20),
        b: createVector(width / 2, height - 100)
    }

    let object1 = {
        a: createVector(width / 2, height - 100),
        b: createVector(width, height - 20),
    }
    let object2 = {
        a: createVector(0, height),
        b: createVector(width, height)
    }
    let object3 = {
            a: createVector(0, 0),
            b: createVector(width, 0)
        }
        // objects.push(object);
        // objects.push(object1);
        // objects.push(object2);
        // objects.push(object3);


    //tree

    // angleSlider = createSlider(0, 55, 30, 1);
    // seedSlider = createSlider(0, 10000, 0, 1);
    background(0);
    randomSeed(random(0, 10000));

    branch = new Branch(width / 2, height, 200, 0, 30, 0);



}

function draw() {
    background(51);
    let movement = (((sin(frameCount / 100) + 1) / 6) + 0.6);
    randomSeed(81);
    branch = new Branch(width / 2, height, 100, 0, 30, movement);
    flock.run();

    // for (let i = 0; i < objects.length; i++) {
    //     strokeWeight(4);
    //     line(objects[i].a.x, objects[i].a.y, objects[i].b.x, objects[i].b.y);

    //     // let mousevect = createVector(mouseX, mouseY);

    //     // let { distance, point } = distLineToPoint(objects[i].a, objects[i].b, mousevect);
    //     // line(mousevect.x, mousevect.y, point.x, point.y);

    // }


    // objects = [];
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