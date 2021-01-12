//bvt 객체
const bvt = {};
//캔버스, 컨텍스트 선언부
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let wWidth = window.innerWidth;
let wHeight = window.innerHeight - 32;

let width, height;

//속도 조절용 변수
bvt.deltaTime = 6;

//키보드 객체
bvt.keys = {};

window.addEventListener('keydown', keyInput);
window.addEventListener('keyup', keyInput);

//키 입력
function keyInput(event) {
	if(event.type === "keydown") bvt.keys[event.keyCode] = true;
	if(event.type === "keyup") delete(bvt.keys[event.keyCode]);
}

bvt.Vector = class {
    constructor(x = 0, y = 0) {
        this.x = Number(x.toFixed(2));
        this.y = Number(y.toFixed(2));
        this.type = "Vector";
    }

    Up() {
        return new bvt.Vector(0, -1);
    }

    Down() {
        return new bvt.Vector(0, 1);
    }

    Left() {
        return new bvt.Vector(-1, 0);
    }

    Right() {
        return new bvt.Vector(1, 0);
    }

    Zero() {
        return new bvt.Vector(0, 0);
    }

    Length() {
        return Number(Math.sqrt((this.x * this.x) + (this.y * this.y)));
    }

    Normalize() {
        this.x /= this.Length();
        this.y /= this.Length();
    }

    Normalized() {
        return new bvt.Vector(this.x / this.Length(), this.y / this.Length());
    }

    DistanceBetween(vec) {
        if(!vec.type || vec.type !== "Vector") throw new Error("Vector argument is needed");
        return (new bvt.Vector(this.x - vec.x, this.y - vec.y)).Length();
    }

    Add(vec) {
        if(!vec.type || vec.type !== "Vector") throw new Error("Vector argument is needed");
        this.x += vec.x;
        this.y += vec.y;
    }
}

bvt.Sprite = class {
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
        this.width = this.src[0].width;
        this.height = this.src[0].height;
    }

    Animate() {
        const img = new Image();
        if(this.src.length === 1) {
            return this.src[0];
        }
        this.time++;
        if(this.time % this.speed === 0) {
            this.frame++;
        }
        if(this.time === this.src.length * this.speed + 1) {
            this.time = 0;
            this.frame = 0;
        }
        return this.src[this.frame];
    }
}

bvt.Camera = class {
    constructor(x = 0, y = 0) {
        this.type = "Camera";
        this.x = x;
        this.y = y;
    }

    Vec(v = null) {
        if(v === null) return new Vector(this.x, this.y);
        return new bvt.Vector(v.x - this.x, v.y - this.y);
    }

    In(gameObject) {
        if(gameObject.type !== "GameObject") throw new Error("argument should be GameObject");

        return gameObject.x + (gameObject.width / 2) > this.x - (width / 2) && gameObject.x - (gameObject.width / 2) < this.x + (width / 2) && gameObject.y + (gameObject.height / 2) > this.y - (height / 2) && gameObject.y - (gameObject.height / 2) < this.y + (height / 2);
    }
}

bvt.Scene = class {
    constructor(cam, obj, back = null) {
        this.type = "Scene";
        this.mainCamera = cam;
        this.objects = obj;
        this.effects = {};
        this.background = back;
    }
}

bvt.Background = class {
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

bvt.GameObject = class {
    constructor(name, sprite = null, x = 0, y = 0, w = 32, h = 32) {
        this.name = name;
        this.type = "GameObject";
        this.x = x;
        this.y = y;
        this.sprite = sprite;
        this.solid = true;
        this.width = w;
        this.height = h;
        if(this.sprite) {
            this.width = this.sprite.width;
            this.height = this.sprite.height;
        }
        this.speed = 10;
        this.tag = [];
    }

    Update() {}
    
    Draw() {
        const cam = bvt.Engine.Scene.mainCamera;
        let cx = this.x - cam.x + (width / 2);
        let cy = this.y - cam.y + (height / 2);
        ctx.drawImage(this.sprite.Animate(), cx - (this.width / 2), cy - (this.height / 2), this.width, this.height);
    }

    Move(vec) {
        vec.Normalize();
        this.x += Number(((vec.x * this.speed) / deltaTime).toFixed(2));
        this.y += Number(((vec.y * this.speed) / deltaTime).toFixed(2));
        this.x = Number(this.x.toFixed(2));
        this.y = Number(this.y.toFixed(2));
    }

    Collided(o) {
        return Math.abs(o.x - this.x) <= (o.width / 2) + (this.width / 2) && Math.abs(o.y - this.y) <= (o.height / 2) + (this.height / 2);
    }
}

bvt.Effect = class {
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

bvt.Engine = {
    Scene: new bvt.Scene(new bvt.Camera(), {}),
    Draw: function() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if(this.Scene.background) {
            this.Scene.background.Draw();
        }

        //오브젝트 그리기 for i in 써야함 무조건! this 때문에
        for(let i of Object.keys(this.Scene.objects)) {
            if(this.Scene.mainCamera.In(this.Scene.objects[i])) this.Scene.objects[i].Draw();
        }

        //이펙트 그리기
        for(let i of Object.keys(this.Scene.effects)) {
            if(this.Scene.effects[i].duration <= 0) delete(this.Scene.effects[i]);
            if(this.Scene.mainCamera.In(this.Scene.effects[i]))
            this.Scene.effects[i].Draw();
        }
    },
    Update: function() {
        for(let i of Object.keys(this.Scene.objects)) {
            if(this.Scene.objects[i].Update) {
                this.Scene.objects[i].Update();
            }
        }
    
        for(let i of Object.keys(this.Scene.effects)) {
            this.Scene.effects[i].Update();
        }
    
        //기본 드로우
        this.Draw();
    }
}

bvt.sleep = time => new Promise(resolve => setTimeout(resolve, time));

bvt.Start = function() {
    wWidth = window.innerWidth;
    wHeight = window.innerHeight - 32;

    canvas.width = wWidth;
    canvas.height = wHeight;

    width = canvas.width;
    height = canvas.height;
}

window.addEventListener("resize", Start);

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
	canvas.width = width;
	canvas.height = height;
	loop = setInterval(function() {
		Game.Update();
	}, 1000 / 60);
	document.getElementById("loading").outerHTML = "";
}

onReady();
*/