class Branch {
    constructor(x, y, length, dir, offa, move) {
        this.length = length;
        this.dir = dir;
        this.offa = offa
        this.x = x;
        this.y = y;
        this.xe = this.x + sin(radians(this.dir)) * this.length;
        this.ye = this.y - cos(radians(this.dir)) * this.length;

        if (this.length > 15) {
            new Branch(this.xe, this.ye, this.length * 0.76 * random(0.8, 1.2), move * this.dir + offa + random(-15, 15), offa, move);
            new Branch(this.xe, this.ye, this.length * 0.76 * random(0.8, 1.2), move * this.dir - offa + random(-15, 15), offa, move);
            if (this.length > 70) {
                let object = {
                    a: createVector(this.x, this.y),
                    b: createVector(this.xe, this.ye)
                }
                objects.push(object)
            }
        }
        this.draw();
    }

    draw() {
        stroke(255, 50 + (this.length * this.length / 10))
        strokeWeight(this.length / 10)
        line(this.x, this.y, this.xe, this.ye);

        // line(this.xe, this.ye, this.xe+sin(radians(30))*100, this.ye-cos(radians(30))*100 )

    }

}