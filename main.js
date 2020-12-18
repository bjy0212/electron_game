const { app, BrowserWindow, Menu, ipcMain } = require('electron');

function createWindow () {
    // 브라우저 창을 생성합니다.
    const win = new BrowserWindow({
	    width: 1080,
		height: 720,
		backgroundColor: "#3d3d3d",
		title: "bvt_game",
	    webPreferences: {
	      	nodeIntegration: true
		},
		frame: false
	});
	
	win.setResizable(false);

	const menu = [/*{
			label: "파일",
			submenu: [
				{
				  	label: "저장",
				  	accelerator: 'CmdOrCtrl+S',
				  	click: () => {
					  	win.webContents.send("save", null)
					}
				}
			]
		},
		{
			label: "설정",
			accelerator: 'CmdOrCtrl+,',
			click: () => {
				win.webContents.send("setting", null)
			}
		}*/
	];

	//win.setMenu(Menu.buildFromTemplate(menu));
	win.setMenu(null);

  	// and load the index.html of the app.
  	win.loadFile('index.html');

  	// 개발자 도구를 엽니다.
  	win.webContents.openDevTools()

	/*ipcMain.on("sendContents", (event, contents) => {
		// console.log(contents);
		fs.writeFile(filePath, contents, err => {
		  if (err) {
			alert("An error ocurred saving the file :" + err.message);
			return;
		  }
		  console.log("saved");
		});
	});*/
}

// 이 메소드는 Electron의 초기화가 완료되고
// 브라우저 윈도우가 생성될 준비가 되었을때 호출된다.
// Some APIs can only be used after this event occurs.
app.whenReady().then(createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  	if (process.platform !== 'darwin') {
    	app.quit();
  	}
});

app.on('activate', () => {
  	// On macOS it's common to re-create a window in the app when the
  	// dock icon is clicked and there are no other windows open.
  	if (BrowserWindow.getAllWindows().length === 0) {
    	createWindow();
  	}
});
