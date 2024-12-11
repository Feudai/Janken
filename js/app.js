import { Cell } from "./cell.js";

class CellularSimulation {
    constructor() {
        this.canvas = document.querySelector("canvas");
        this.ctx = this.canvas.getContext("2d");
        this.setupCanvas();
        this.setupParameters();
        this.cells = [];
        this.createSeed();
        this.animate();
    }

    setupCanvas() {
        this.ctx.width = window.innerWidth / 6.5;
        this.ctx.height = window.innerHeight / 6;
        this.width = this.ctx.width;
        this.height = this.ctx.height;
        
        this.ctx.fillStyle = "black";
        this.ctx.fillRect(0, 0, this.width, this.height);
    }

    setupParameters() {
        this.cellSize = 1;
        this.probabilities = {
            fire: 0.001,
            water: 0.1,
            erosion: 0.005,
            plant: 0.92,
            lava: 0.0005
        };
        
        this.cols = Math.floor(this.width / this.cellSize);
        this.rows = Math.floor(this.height / this.cellSize);
    }

    createSeed() {
        for (let i = 0; i < this.cols; i++) {
            for (let j = 0; j < this.rows; j++) {
                const index = j + i * this.cols;
                this.cells[index] = Math.random() > 0.3 
                    ? new Cell(Math.floor(Math.random() * 5 + 1)) 
                    : new Cell(0);
                this.drawCell(i, j);
            }
        }
    }

    pickNeighbor(i, j) {
        const n1 = Math.floor(Math.random() * 3 - 1);
        const n2 = Math.floor(Math.random() * 3 - 1);
        const neighborIndex = (j + n2) + (i + n1) * this.cols;
        return this.cells[neighborIndex];
    }

    interact(i, j) {
        const current = this.cells[j + i * this.cols];
        const neighbor = this.pickNeighbor(i, j);

        if (!neighbor) return;

        // Interaction logic based on cell states
        if (current.state === 4) { // Pierre
            if ((neighbor.state === 3 || neighbor.state === 0 || neighbor.state === 1) && Math.random() > this.probabilities.erosion) {
                current.state = 0;
            }
            if (neighbor.state === 3 && Math.random() > this.probabilities.plant) {
                current.state = 2;
            }
            if (neighbor.state === 2) {
                current.state = 2;
            }
        }
        else if (current.state === 2) { // Plante
            if (neighbor.state === 3 && Math.random() > this.probabilities.plant) {
                neighbor.state = 2;
            }
            if (neighbor.state === 1) {
                current.state = 1;
            }
        }
        else if (current.state === 0) { // Air
            if (neighbor.state === 3 && Math.random() > this.probabilities.water) {
                if (Math.random() > this.probabilities.fire) {
                    current.state = 3;
                }
            }
            else if (neighbor.state === 1) {
                current.state = 1;
            }
        }
        else if (current.state === 1) { // Feu
            if (neighbor.state === 3) {
                if (Math.random() > this.probabilities.lava) {
                    current.state = 4;
                } else {
                    current.state = 0;
                }
            }
        }
    }

    drawCell(i, j) {
        const cell = this.cells[j + i * this.cols];
        
        switch (cell.state) {
            case 1: this.ctx.fillStyle = 'red'; break;
            case 2: this.ctx.fillStyle = 'green'; break;
            case 3: this.ctx.fillStyle = 'blue'; break;
            case 4: this.ctx.fillStyle = 'gray'; break;
            default: this.ctx.fillStyle = 'black';
        }

        this.ctx.fillRect(i * this.cellSize, j * this.cellSize, this.cellSize, this.cellSize);
    }

    animate() {
        this.ctx.fillStyle = "white";
        
        for (let i = 0; i < this.cols; i++) {
            for (let j = 0; j < this.rows; j++) {
                this.interact(i, j);
                this.drawCell(i, j);
            }
        }

        requestAnimationFrame(() => this.animate());
    }
}

// Initialiser la simulation
new CellularSimulation();