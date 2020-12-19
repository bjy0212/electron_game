const { TouchBarOtherItemsProxy } = require("electron");

//캔버스, 컨텍스트 선언부
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

//속도 조절용 변수
const deltaTime = 6;

//화면의 넓이와 높이 구하기
let width = (window.innerWidth > 0) ? window.innerWidth : screen.width;
let height = (window.innerHeight > 0) ? window.innerHeight : screen.height;
//header 높이 빼주기
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

window.addEventListener('keydown', keyInput);
window.addEventListener('keyup', keyInput);

//키 입력
function keyInput(event) {
	if(event.type === "keydown") key[event.keyCode] = true;
	if(event.type === "keyup") delete(key[event.keyCode]);
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
        this.type = "Sprite";
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
        this.type = "Camera";
        this.x = x;
        this.y = y;
    }

    Vec(v = null) {
        if(v === null) return new Vector(this.x, this.y);
        return new Vector(v.x - this.x, v.y - this.y);
    }

    In(gameObject) {
        if(gameObject.type !== "GameObject") throw new Error("argument should be GameObject");

        return gameObject.x + (gameObject.width / 2) > this.x - (canvas.width / 2) && gameObject.x - (gameObject.width / 2) < this.x + (canvas.width / 2) && gameObject.y + (gameObject.height / 2) > this.y - (canvas.height / 2) && gameObject.y - (gameObject.height / 2) > this.y + (canvas.height / 2);
    }
}

class Scene {
    constructor(cam, obj, back = null) {
        this.type = "Scene";
        this.mainCamera = cam;
        this.objects = obj;
        this.effects = {};
        this.background = back;
    }
}

class Background {
    constructor(src, x = 0, y = 0, w = null, h = null) {
        this.type = "Background";
        this.img = new Image();
        this.img.src = src;
        this.x = x;
        this.y = y;
        this.width = this.img.width;
        this.height = this.img.height;
        if(w) {
            this.width = w;
            this.height = h;
        }
    }

    Draw() {
        ctx.drawImage(this.img, this.x - (this.width / 2), this.y - (this.height / 2), this.width, this.height);
    }
}

class GameObject {
    constructor(name, sprite = null, x = 0, y = 0) {
        this.name = name;
        this.type = "GameObject";
        this.x = x;
        this.y = y;
        this.sprite = sprite;
        this.solid = true;
        this.width = 32;
        this.height = 32;
        this.speed = 10;
        if(this.sprite) this.sprite.src[0].onload = function() {
            const obj = Engine.Scene.objects[name];
            if(obj.width === 1) {
                obj.width = this.width;
                obj.height = this.height;
            }
        }
    }

    Update() {}
    
    Draw() {
        const cam = Engine.Scene.mainCamera;
        let cx = this.x - cam.x + (width / 2);
		let cy = this.y - cam.y + (height / 2);
		ctx.drawImage(this.sprite.animation.animate(), cx - (this.width / 2), cy - (this.height / 2), this.width, this.height);
    }

    Move(vec) {
        vec.normalize();
        this.x += (vec.x * this.speed) / deltaTime;
        this.y += (vec.y * this.speed) / deltaTime;
    }

    Collided(o) {
        return Math.abs(o.x - this.x) <= (o.width / 2) + (this.width / 2) && Math.abs(o.y - this.y) <= (o.height / 2) + (this.height / 2);
    }
}

class Effect {
    constructor(name, x, y, sprite, duration) {
        this.name = name;
        this.sprite = sprite;
        this.width = 32;
        this.height = 32;
        if(this.sprite) this.sprite.src[0].onload = function() {
            const obj = Engine.Scene.objects[name];
            if(obj.width === 1) {
                obj.width = this.width;
                obj.height = this.height;
            }
        }
        this.x = x;
        this.y = y;
        this.duration = duration;
    }

    Draw() {
        const cam = Engine.Scene.mainCamera;
        let cx = this.x - cam.x + (width / 2);
		let cy = this.y - cam.y + (height / 2);
		ctx.drawImage(this.animation.animate(), cx - (this.width / 2), cy - (this.height / 2), this.width, this.height);
    }
}

const Engine = {};
Engine.Scene = new Scene(new Camera(), {});
Engine.Draw = function() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if(Engine.Scene.background) {
        Engine.Scene.background.Draw();
    }

    //오브젝트 그리기
    for(i in Engine.Scene.objects) {
        if(Engine.Scene.mainCamera.In(Engine.Scene.objects[i])) Engine.Scene.objects[i].Draw();
    }

    //이펙트 그리기
    for(i in Engine.Scene.effects) {
        if(Engine.Scene.effects[i].duration <= 0) delete(Engine.Scene.effects[i]);
        if(Engine.Scene.mainCamera.In(Engine.Scene.effects[i]))
        Engine.Scene.effects[i].Draw();
    }
};

//메인 업데이트 함수(유저가 관여 하는 부분이 아님)
function Update() {
	for(i in Engine.Scene.objects) {
		if(Engine.Scene.objects[i].update) {
			Engine.Scene.objects[i].Update();
		}
	}

	for(i in Engine.Scene.effects) {
		Engine.Scene.effects[i].Update();
	}

	//기본 드로우
	Engine.Draw();
}

const sleep = time => new Promise(resolve => setTimeout(resolve, time));

/* Example
//fps: 60
let loop;

async function onReady() {
    await sleep(10000);
    //Web Loading time
	//화면의 넓이와 높이 구하기
	width = (window.innerWidth > 0) ? window.innerWidth : screen.width;
    height = (window.innerHeight > 0) ? window.innerHeight : screen.height;
    height -= 32;
    //header 높이 빼주기
	//Canvas의 넓이와 높이를 화면 크기에 맞게 조정
	can.width = width;
	can.height = height;
	loop = setInterval(function() {
		Update();
	}, 1000 / 60);
	Start();
	document.getElementById("loading").outerHTML = "";
}

onReady();
*/