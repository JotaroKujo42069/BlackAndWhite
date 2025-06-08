let body = document.getElementById('body');
const canvas = document.getElementById('canvas');
const c = canvas.getContext('2d');

let tick = 0;
let switched = false;
let switchCoolMax = 150;
let switchCoolDown = 0;
let keys = [];
window.onkeyup = function (e) {
  keys[e.keyCode] = false;
  if (e.keyCode == 87 && switchCoolDown == 0) {
  	if (switched) {
  		switched = false;
  	} else {
  		switched = true;
  	}
  	switchCoolDown = switchCoolMax;
    gBase = -gBase;
    g = gBase;
    plr.jumpSp = -plr.jumpSp;
    plr.onGround = false;
    if (switched) {
  	canvas.style.border = "2px solid black";
  	body.style.background = "#ffffff";
  	} else {
  	canvas.style.border = "2px solid white";
  	body.style.background = "#000000";
  	}
    console.log(g)
  }
};
window.onkeydown = function (e) {keys[e.keyCode] = true;console.log(e.keyCode)};


class fadeSquare {
  constructor (obj,op,fadeSp) {
    this.parent = obj;
    this.self = {
      x: obj.x,
      y: obj.y,
      width: obj.width,
      height: obj.height,
      color: obj.color,
      opacity: op
    };
    this.speed = fadeSp;
  }
  tick() {
    if (this.self.opacity > 0) {
       drawEntity(this.self);
    }
    if (tick % 1 == 0) {
      this.self.opacity -= this.speed;
      //console.log("done");
    } 
    
  }
}

let gBase = 3;
let g = 3;

let plr = {
  x: 100,
  y: 100,
  width: 30,
  height: 30,
  color: "#ffffff",
  opacity: 1,
  fades: [],
  jumpSp: 8,
  jumpHeight: 15,
  xSp: 0.7,
  sprintMod: 2,
  sprinting: false,
  onGround: false,
  airTime: 0,
  edgeCollision: false,
  edgeBottomCol: false
}

function controls() {
  
  if (keys[16]) {
    plr.sprinting = true;
  } else {
    plr.sprinting = false;
  }
  if (keys[68]) {
    if (plr.sprinting) {
      plr.x += plr.xSp * plr.sprintMod;
    } else {
      plr.x += plr.xSp;
    }
  } else if (keys[65]) {
     if (plr.sprinting) {
      plr.x -= plr.xSp * plr.sprintMod;
    } else {
      plr.x -= plr.xSp;
    }
  }
   if (keys[32] && plr.airTime < plr.jumpHeight) {
    if (!(plr.edgeBottomCol && Math.sign(g) == -1) || !(plr.edgeTopCol && Math.sign(g) == 1)) {
      plr.y -= plr.jumpSp;
    }
    
    onGround = false;
    plr.airTime++;
  }
}

function edgeCollide(ent) {
	ent.edgeCollide = false;
	ent.edgeBottomCol = false;
	ent.edgeTopCol = false;
	if (ent.y + ent.height >= canvas.height) {
		ent.edgeCollision = true;
		ent.edgeBottomCol = true;
	    if (ent.y + ent.height > canvas.height + 1) {
	    	ent.y--;
	    }
    
	} else if (ent.y <= 0) {
    	ent.edgeCollision = true;
    	ent.edgeTopCol = true;
    	if (ent.y <  -1) {
	    	ent.y++;
	    }
	}
}

function gravity() {
  if ((!plr.edgeBottomCol && Math.sign(g) == 1) || (!plr.edgeTopCol && Math.sign(g) == -1)) {
    plr.y += g;
    plr.onGround = false;
  } else {
    plr.onGround = true;
  }
  
}

function update() {
	tick++;
	if (plr.onGround) {
		plr.airTime = 0;
		g = gBase
	} else {
		if (Math.sign(g) == -1) {
			g -= 0.1
		} else {
			g += 0.1
		}
	}
	if (switchCoolDown > 0) {
		switchCoolDown--;
	}

	//Fade
	if (plr.sprinting) {
		plr.fades.push(new fadeSquare(plr,0.2,0.01));
	}
	  
	for (let i =0;i<plr.fades.length;i++) {
	    if (plr.fades[i].self.opacity <= 0) {
	    	plr.fades.splice(i,1);
	    }
	}

	edgeCollide(plr);

	controls();

	//Physics
	gravity();

	//Draw
	draw();
}

function switchColor(color) {
	return Math.abs(255 - color);
}

function hexChange(hex) {
	var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	if (switched) {
		return result ? {
    		r: switchColor(parseInt(result[1], 16)),
    		g: switchColor(parseInt(result[2], 16)),
    		b: switchColor(parseInt(result[3], 16))
		} : null;
	} else {
		return result ? {
    		r: parseInt(result[1], 16),
    		g: parseInt(result[2], 16),
    		b: parseInt(result[3], 16)
		} : null;
	}
}

function hexToRgb (hex,op) {
	let color = hexChange(hex);
	let rgba = "rgba(" + color.r + "," + color.r + "," + color.r + "," + op +")";
	return rgba;
}

function drawEntity(ent) {
  let color = hexToRgb(ent.color,ent.opacity);
  c.fillStyle = color;
  c.fillRect(ent.x,ent.y,ent.width,ent.height);
}

function drawOverlays() {
	
}

function devTools() {
	if (switched) {
		c.fillStyle = "#000000";
	} else {
		c.fillStyle = "#FFFFFF";
	}
	c.font = "25px Arial";
	c.fillText("X: " + parseInt(plr.x),25,37.5);
	c.fillText("Y: " + parseInt(plr.y),25,62.5);
}

function draw() {
	c.clearRect(0,0,canvas.width,canvas.height);
	for (let i = 0;i<plr.fades.length;i++) {
		plr.fades[i].tick();
	}
	//test.tick();
	drawEntity(plr);
	drawOverlays();
	devTools();
	c.fillStyle = "rgba(122,122,135," + (switchCoolDown / switchCoolMax) * 0.8 + ")";
	c.fillRect(0,0,canvas.width,canvas.height);
}



setInterval(update,10);