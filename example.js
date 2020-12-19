const { contextBridge } = require("electron");
const bvt = require("./engine.js");

String.prototype.toCode = function() {
    return String(this).toUpperCase().charCodeAt();
}

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

//fps: 60
let loop, Engine, width, height;

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
    const newScene = new bvt.Scene(new bvt.Camera(), objs);
    Engine = new bvt.Engine(newScene);
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
		Engine.Update();
    }, 1000 / 60);
    
	document.getElementById("loading").outerHTML = "";
}

onReady();