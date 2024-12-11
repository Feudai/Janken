import { Cell } from "./cell.js";

class CellularSimulation {
    constructor() {
        this.canvas = document.querySelector("canvas");
        this.ctx = this.canvas.getContext("2d", { alpha: false });
        this.setupCanvas();
        this.setupParameters();
        this.cells = new Array(this.cols * this.rows);
        this.createSeed();
        this.animate = this.animate.bind(this);
        requestAnimationFrame(this.animate);
    }

    setupCanvas() {
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = window.innerWidth * dpr;
        this.canvas.height = window.innerHeight * dpr;
        this.canvas.style.width = `${window.innerWidth}px`;
        this.canvas.style.height = `${window.innerHeight}px`;
        
        this.ctx.scale(dpr, dpr);
        
        this.width = this.canvas.width / dpr;
        this.height = this.canvas.height / dpr;
        
        this.ctx.fillStyle = "black";
        this.ctx.fillRect(0, 0, this.width, this.height);
    }

    setupParameters() {
        // Réduction significative du nombre de cellules
        this.cellSize = 2;
        this.probabilities = {
            fire: 0.01,
            water: 0.05,
            erosion: 0.3,
            plant: 0.93,
            lava: 0.0005,
            stoneP: 0.05
        };
        
        this.cols = Math.floor(this.width / this.cellSize);
        this.rows = Math.floor(this.height / this.cellSize);
    }

    createSeed() {
        for (let i = 0; i < this.cols; i++) {
            for (let j = 0; j < this.rows; j++) {
                const index = j + i * this.cols;
                this.cells[index] = Math.random() > 0.3 
                    ? new Cell(Math.random() < this.probabilities.stoneP ? 4 : Math.floor(Math.random() * 4 + 1)) 
                    : new Cell(0);
            }
        }
    }

    pickNeighbor(i, j) {
        const n1 = Math.floor(Math.random() * 3 - 1);
        const n2 = Math.floor(Math.random() * 3 - 1);
        const neighborI = Math.max(0, Math.min(this.cols - 1, i + n1));
        const neighborJ = Math.max(0, Math.min(this.rows - 1, j + n2));
        const neighborIndex = neighborJ + neighborI * this.cols;
        return this.cells[neighborIndex];
    }

    interact(i, j) {
        const current = this.cells[j + i * this.cols];
        const neighbor = this.pickNeighbor(i, j);

        if (!neighbor) return;

        // Conservation de la logique d'interaction originale
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

    animate() {
        const imageData = this.ctx.createImageData(this.width, this.height);
        const data = imageData.data;

        // Interactions et rendu pour toutes les cellules
        for (let i = 0; i < this.cols; i++) {
            for (let j = 0; j < this.rows; j++) {
                this.interact(i, j);
                
                const cell = this.cells[j + i * this.cols];
                
                // Dessin de la cellule sur toute sa surface
                for (let dx = 0; dx < this.cellSize; dx++) {
                    for (let dy = 0; dy < this.cellSize; dy++) {
                        const pixelX = (i * this.cellSize + dx);
                        const pixelY = (j * this.cellSize + dy);
                        
                        if (pixelX < this.width && pixelY < this.height) {
                            const pixelIndex = (pixelY * this.width + pixelX) * 4;

                            switch (cell.state) {
                                case 1: // Feu
                                    data[pixelIndex] = 255;
                                    data[pixelIndex + 1] = 100;
                                    data[pixelIndex + 2] = 0;
                                    break;
                                case 2: // Plante
                                    data[pixelIndex] = 0;
                                    data[pixelIndex + 1] = 200;
                                    data[pixelIndex + 2] = 0;
                                    break;
                                case 3: // Eau
                                    data[pixelIndex] = 0;
                                    data[pixelIndex + 1] = 100;
                                    data[pixelIndex + 2] = 255;
                                    break;
                                case 4: // Pierre
                                    data[pixelIndex] = 150;
                                    data[pixelIndex + 1] = 150;
                                    data[pixelIndex + 2] = 150;
                                    break;
                                default: // Air
                                    data[pixelIndex] = 0;
                                    data[pixelIndex + 1] = 0;
                                    data[pixelIndex + 2] = 0;
                            }
                            data[pixelIndex + 3] = 255; // Opacité complète
                        }
                    }
                }
            }
        }

        this.ctx.putImageData(imageData, 0, 0);
        requestAnimationFrame(this.animate);
    }
}

// Initialiser la simulation
new CellularSimulation();