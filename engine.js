//캔버스, 컨텍스트 선언부
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

//화면의 넓이와 높이 구하기
let width = (window.innerWidth > 0) ? window.innerWidth : screen.width;
let height = (window.innerHeight > 0) ? window.innerHeight : screen.height;
height -= 32;

//mouse 객체
const mouse = {
	c : false,
	x : 0,
	y : 0
};

//키보드 객체
const key = {};

function toCode(k) {
    return String(k).toUpperCase().charCodeAt();
}

class Scene {
    constructor() {
        this.Objects = [];
        this.UI = [];
        this.type = "Scene";
    }

    Start() {}
    Update() {}
}

class Vector {
    constructor(x = 0, y = 0) {
        this.x = Number(Number(x).toFixed(2));
        this.y = Number(Number(y).toFixed(2));
        this.type = "Vector";
    }

    Up() {
        return new Vector(0, -1);
    }

    Down() {
        return new Vector(0, 1);
    }

    Left() {
        return new Vector(-1, 0);
    }

    Right() {
        return new Vector(1, 0);
    }

    Zero() {
        return new Vector(0, 0);
    }

    Length() {
        return Math.sqrt((this.x * this.x) + (this.y * this.y));
    }

    Normalize() {
        this.x /= this.Length();
        this.y /= this.Length();
    }

    Normalized() {
        return new Vector(this.x / this.Length(), this.y / this.Length());
    }

    DistanceBetween(vec) {
        if(!vec.type || vec.type !== "Vector") throw new Error("Vector argument is needed");
        return (new Vector(this.x - vec.x, this.y - vec.y)).Length();
    }

    Add(vec) {
        if(!vec.type || vec.type !== "Vector") throw new Error("Vector argument is needed");
        this.x += vec.x;
        this.y += vec.y;
    }
}

class Sprite {
    constructor(src, width = 32, height = 32, speed = 1) {
        if(isNaN(speed) || speed <= 0) throw new Error("Argument speed should be larger than 0");
        this.src = [];
        src.forEach(e => {
            //preloading
            let image = new Image(width, height);
            image.src = e;
            
            //adding to sprite
            this.src.push(image);
        });
        this.time = 0;
        this.frame = 0;
        this.type = "Sprite";
        this.speed = speed;
    }

    Animate() {
        const img = new Image();
        if(this.src.length === 1) {
            img.src = this.src[0];
            return img;
        }
        this.time++;
        if(this.time % this.speed === 0) {
            this.frame++;
        }
        if(this.time === this.src.length * this.speed + 1) {
            this.time = 0;
            this.frame = 0;
        }
        img.src = this.src[this.frame];
        return img;
    }
}

class Camera {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    Vec(v = null) {
        if(v === null) return new Vector(this.x, this.y);
        return new Vector(v.x - this.x, v.y - this.y);
    }
}

class GameObject {
    constructor(sprite = null,x = 0, y = 0) {
        this.x = x;
        this.y = y;
        this.sprite = sprite;
        this.type = "GameObject";
    }
}

const Engine = {};
//Engine.Scene = new Scene();