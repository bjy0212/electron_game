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
		Update();
	}, 1000 / 60);
	Start();
	document.getElementById("loading").outerHTML = "";
}

onReady();