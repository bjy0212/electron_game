String.prototype.toCode = function() {
    return String(this).toUpperCase().charCodeAt();
}

let loop;

function Start() {
    const player = new bvt.GameObject("player", new bvt.Sprite(["./sprites/sans.png"], 48, 48), 0, 0);
    player.Update = function() {
        let vec = new bvt.Vector().Zero();
        if(bvt.keys["w".toCode()]) vec.y += -1;
        if(bvt.keys["s".toCode()]) vec.y += 1;
        if(bvt.keys["a".toCode()]) vec.x += -1;
        if(bvt.keys["d".toCode()]) vec.x += 1;
        
        if(!(vec.x === 0 && vec.y === 0)) this.Move(vec);
    }
    const objs = {
        "player": player
    };
    bvt.Engine.Scene = new bvt.Scene(new bvt.Camera(), objs);;
}

async function onReady() {
    await bvt.sleep(3000);
    //Web Loading time

    bvt.Start();

    //화면의 넓이와 높이 구하기
	width = canvas.width;
    height = canvas.height;
    
    Start();

	loop = setInterval(function() {
		bvt.Engine.Update();
    }, 1000 / 60);
    
	document.getElementById("loading").outerHTML = "";
}

onReady();