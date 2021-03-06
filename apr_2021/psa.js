// define global variable for layout element
var taOut;  		// text area for output parameter
var taIn;			// text area for input parameter
var caOut;			// canvas for showing simulation
var caOut2;			// canvas for drawing chart
var caOut3;			// canvas for drawing chart
var btLoad, btRead, btSimulate, btClear; // buttons variable

// define global variable for simulation
var N_iter, M_iter, N_irf, n;
var t_min, t_max;
var t_start, t_end;
var t, dt, tC, tn_1, tn_2, t_delay, t_0, nt_0;
const fps = 1000;
var running;
var intensity, time;
var G2, tau_arr;

// define global variable for ray parameters
var ray, ray_bfr, nv_ray, trajectory, r_src, r_waf, n_dir, n_par, n_ref, v_ray, r_waf2, r_waf1, v, nr_src, nn_dir;
// define global variabel for particle parameters
var par, par_init, v_par, R_par, num_par, r_C, s_obs, xmin_par, xmax_par, ymin_par, ymax_par;
// define global variable for coordinate parameters
var xmin, ymin, xmax, ymax, XMIN, YMIN, XMAX, YMAX;
var xmin2, ymin2, xmax2, ymax2, XMIN2, YMIN2, XMAX2, YMAX2;
// define global variable for detector
var det, R_det;

var count_ray;

var proc, tproc;

var t_chart, t_dummy, detected;

main();

function main (){
	setLayout();
}

/* =============== SIMULATION FUNCTION ===============*/

function drawSystem(){
	var cx = caOut.getContext("2d")
	
	// draw laser
	for(var i=0; i<M_iter; i=i+1) {
		ray_scaled = transform(ray[i].x,ray[i].y)
		ray_bfr_scaled = transform(ray_bfr[i].x,ray_bfr[i].y)
	
		/*
		cx.beginPath();
		cx.arc(ray_scaled.x, ray_scaled.y, (R_par/2), 0, 2 * Math.PI); 
		cx.fillStyle = "#f00";		
		cx.fill();	
		*/
		
		cx.beginPath();
		cx.strokeStyle = "#f00";
		cx.lineWidth = 1;
		cx.fillStyle = "#c00";
		cx.setLineDash([0, 1, 0]);
		cx.moveTo(ray_bfr_scaled.x, ray_bfr_scaled.y);
		cx.lineTo(ray_scaled.x, ray_scaled.y);
		cx.closePath();
		cx.stroke();
		
	}	
	
	// draw particle
	for(var i=0; i<num_par; i++ ){
		rPar_scaled = transform(par[i].x, par[i].y);
		
		cx.beginPath();
		cx.arc(rPar_scaled.x, rPar_scaled.y, (R_par), 0, 2 * Math.PI); 
		cx.fillStyle = "#0E9944";		
		cx.closePath();
		cx.fill();	
	}

	// draw detector
	det_scaled = transform(det.x,det.y)
	cx.beginPath();
	cx.arc(det_scaled.x, det_scaled.y, R_det, 0, 2 * Math.PI); 
	cx.fillStyle = "#318CE7";		
	cx.closePath();
	cx.fill();
		
	// draw particle boundary
	cx.beginPath()
	cx.strokeStyle = "#ccc";
	cx.lineWidth = 1;
	cx.fillStyle = "#ccc";
	cx.moveTo(scalingx(xmin_par), scalingy(ymin_par));
	cx.lineTo(scalingx(xmax_par), scalingy(ymin_par));
	cx.lineTo(scalingx(xmax_par), scalingy(ymax_par));
	cx.lineTo(scalingx(xmin_par), scalingy(ymax_par));
	cx.closePath();
	cx.stroke();
	
}

function drawChart(){
	var cx2 = caOut2.getContext("2d");
	cx2.beginPath();
	cx2.strokeStyle = "#000000";
	cx2.fillStyle = "#000000";
	cx2.lineWidth = 1;
	cx2.moveTo(scalingx_chart(time),scalingy_chart(ymin2));
	
	var X = scalingx_chart(time);
	var Y = scalingy_chart(intensity);
	cx2.lineTo(X,Y);
	cx2.arc(X,Y,2, 0, 2*Math.PI); 
	cx2.font = "10px Arial";
	cx2.fillText(intensity,X,Y-5);
	cx2.stroke();
}

// Initialize parameters
function initParams() {
	r_src = r_src;
	n_dir = n_dir;
	t_0	  = t_start;
	t	  = t_min;	
	
	n_iter = 0;
	m_iter = 0;
	
	xmin = 0;
	ymin = 0;
	xmax = 500;
	ymax = 500;

	XMIN = 0;
	YMIN = parseInt(caOut.style.height);
	XMAX = parseInt(caOut.style.width);
	YMAX = 0;
	
	xmin2 = 0;
	ymin2 = 0;
	xmax2 = t_max/t_delay;
	ymax2 = 20;

	XMIN2 = 0;
	YMIN2 = parseInt(caOut2.style.height);
	XMAX2 = parseInt(caOut2.style.width);
	YMAX2 = 0;
	
	xmin_par	= 0.5*(xmax-xmin) - 0.5*s_obs;
	xmax_par	= 0.5*(xmax-xmin) + 0.5*s_obs;
	ymin_par	= 0.5*(ymax-ymin) - 0.5*s_obs;
	ymax_par	= 0.5*(ymax-ymin) + 0.5*s_obs;


	// Initial position of particle
	var Nx_par 	= Math.sqrt(num_par);
	var Ny_par	= Nx_par;
	var dx_par 	= 0.15 * (xmax - xmin) / Nx_par;
	var dy_par 	= 0.15 * (ymax - ymin) / Ny_par;
	var xc_par	= 0.5 * (xmax - xmin);
	var yc_par	= 0.5 * (ymax - ymin);
	
	par = [];
	
	var k = 0;
	for(var j = 0; j < Ny_par; j++){
		for(var i = 0; i < Nx_par; i++) {
			var x = (i + 0.25) * dx_par + xc_par - 0.5 * Nx_par * dx_par;
			var y = (j + 0.25) * dy_par + yc_par - 0.5 * Ny_par * dy_par;
			var z = 0;
			
			var rndx = 0.1*dx_par * Math.random();
			var rndy = 0.1*dy_par * Math.random();
			
			x += rndx;
			y += rndy;
						
			par.push(new Vect3(x,y,z));
			k++;
			if (k >= num_par) {break;}
		}
	}
	
	// Initial position of ray
	ray = [];
	ray_bfr = [];
	nv_ray = [];
	nr_src = [];
	nn_dir = [];
	nt_0   = [];
	detected = []
	for(var n=0;n<M_iter;n++){
		ray.push(r_src);
		ray_bfr.push(r_src);
		nv_ray.push(v_ray);
		nr_src.push(r_src);
		nn_dir.push(n_dir);
		nt_0.push(t_0);
		detected.push(false);
	}
	
	t_dummy = 0;
	count_ray = 0;
}

function simulate(){
    if (t >= t_max) {
		btRun.innerHTML = "Run";
		btLoad.disabled 	= false;
		btRead.disabled 	= false;
		btRun.disabled  	= true;
		btClear.disabled	= false;
		clearInterval(proc);
		
		running = false;
    }	
	
	clearCanvas();
	drawSystem();
	
	for(var n=0; n<M_iter; n++){
		ray_bfr[n] = ray[n]
		
		if(detected[n]==false){
			var d_det = Vect3.sub(ray[n],det).len() - R_det;
			if(d_det<=0){
				count_ray = count_ray+1;
				detected[n] = true;
//				tout(detected[n] +'\t'+count_ray+'\n');
			};		
		}
		
		
		tn = t - n*dt;
		
		if(n>m_iter){
			nv_ray[n]=0;
		} else{
			nv_ray[n]=v_ray;
		}
		
		if(ray[n].x>xmax || ray[n].x<xmin || ray[n].y>ymax || ray[n].y<ymin) {
			nv_ray[n] = 0;
		}
		else {
			ray[n]=getBeamWavefrontPosition(nr_src[n], nn_dir[n], nv_ray[n], nt_0[n], tn);
						
			tA = tn;
			tB = tA+dt;
			
			
			for(var i=0; i<num_par; i++){	
				r = par[i];
				
				var r_wafA = getBeamWavefrontPosition(nr_src[n], nn_dir[n], nv_ray[n], nt_0[n], tA);
				var r_wafB = getBeamWavefrontPosition(nr_src[n], nn_dir[n], nv_ray[n], nt_0[n], tB);
				
				fA = f_root(r_wafA, r, R_par);
				fB = f_root(r_wafB, r, R_par);

				if(fA * fB<0) {
					tC = rootSecant(tA, tB, nr_src[n], nn_dir[n], nv_ray[n], nt_0[n]);
					r_C = getBeamWavefrontPosition(nr_src[n], nn_dir[n], nv_ray[n], nt_0[n], tC);
					
					n_par = dirNormal(r_C,r);
					n_ref = dirReflection(nn_dir[n], n_par);
					
					nn_dir[n] = n_ref; 
					nr_src[n] = r_C;
					nt_0[n] = tC;				
					break;
				}
			}				
		}	
	}	
	//tout(t.toFixed(2)+'\t'+sum+ '\n')

	if(t_dummy > t_delay){
		time = t.toFixed(2);
		intensity = count_ray;
		tout(time+'\t'+intensity+ '\n')		
		count_ray=0;
		t_dummy = 0;	
		drawChart();
	}
	
	
	// particles move
	for(var i=0; i<num_par; i++) {
			var vmax   	= 100;
			var vmin	= -100;
			var v_par  	= new Vect3(Math.random()*(vmax-vmin)+vmin, 
									Math.random()*(vmax-vmin)+vmin, 
									0);
			var dr_par 	= Vect3.mul(dt,v_par);
			r_new = Vect3.add(par[i],dr_par); 
			
			if(r_new.x<xmax_par && r_new.x>xmin_par 
				&& r_new.y<ymax_par && r_new.y>ymin_par) {
				par[i] = r_new;
			}
	}


	t = t + dt;
	t_dummy = t_dummy + dt;
	n_iter++;
	m_iter++;
}

// Get the wave front when t=t
function getBeamWavefrontPosition(r0, n0, v, t0, t) {
	var dt = t-t0;
	var u  = (t >= t_start) ? 1 : 0;			// to make sure ray turned-on in t_0
	var dr = Vect3.mul(n0, u*v*dt);
	//console.log(r_src.x + " || " + dr)
	var wave = Vect3.add(r0, dr);
	return wave;
}

// Get the reflection site
function f_root(r_waf, r_par, R_par) {
	var dist = Vect3.sub(r_waf,r_par).len();
	var f = dist - R_par;
	return f;
}

function rootSecant(tA, tB, r0, n0, v, t0){
	tn_2 = tB;
	tn_1 = tA;
	
	for(var n=0; n<N_irf; n++){
		var r_waf2 = getBeamWavefrontPosition(r0, n0, v, t0, tn_2);
		var r_waf1 = getBeamWavefrontPosition(r0, n0, v, t0, tn_1);
		
		var fn_2 = f_root(r_waf2, r, R_par);
		var fn_1 = f_root(r_waf1, r, R_par);
		
		var tn = tn_1 - (((tn_1 - tn_2) / (fn_1 - fn_2)) * fn_1);
		
		// for the next iteration
		tn_2 = tn_1
		tn_1 = tn
	}
	return tn;
}

// Get the normal direction from particle and reflection
function dirNormal(r_C,r_par){
	var n = Vect3.div(Vect3.sub(r_C, r_par),Vect3.sub(r_C, r_par).len());
	return n;
}

function dirReflection(n_dir, n_par){
	var dot = Vect3.dot(n_dir,n_par);
	var mul = Vect3.mul(n_par,2*dot);
	var res = Vect3.sub(n_dir, mul);
	
	return res;
}


/* =============== BASE FUNCTION ===============*/


function setLayout() {
	var bgColors	= ["#f8f8f8","#eee"];
	var btDim 		= [50,21]
	var caOutDim 	= [500,500];		// dimension of canvas
	var taInDim 	= [btDim[0]*4,caOutDim[1]-btDim[1]-8];
	var caOutDim2 	= [300, 100]
	var taOutDim 	= [caOutDim2[0],caOutDim[1]-caOutDim2[1]-8];
	
	btLoad = document.createElement("button");
	btLoad.innerHTML = "Load";
	btLoad.style.width = parseInt(btDim[0]) + "px";
	btLoad.style.height = parseInt(btDim[1]) + "px";
	btLoad.disabled = false;
		
	btRead = document.createElement("button");
	btRead.innerHTML = "Read";
	btRead.style.width = parseInt(btDim[0]) + "px";
	btRead.style.height = parseInt(btDim[1]) + "px";
	btRead.disabled = true;
	
	btRun = document.createElement("button");
	btRun.innerHTML = "Run";
	btRun.style.width = parseInt(btDim[0]) + "px";
	btRun.style.height = parseInt(btDim[1]) + "px";
	btRun.disabled = true;
	
	btClear = document.createElement("button");
	btClear.innerHTML = "Clear";
	btClear.style.width = parseInt(btDim[0]) + "px";
	btClear.style.height = parseInt(btDim[1]) + "px";
	
	// text area INPUT PARAMETER layout
	taIn = document.createElement("textarea");
	taIn.style.width = parseInt(taInDim[0]) + "px";
	taIn.style.height = parseInt(taInDim[1]) + "px";
	taIn.style.overflowY = "scroll";
	
	// text area OUTPUT PARAMETER layout
	taOut = document.createElement("textarea");
	taOut.style.width = parseInt(taOutDim[0]) + "px";
	taOut.style.height = parseInt(taOutDim[1]) + "px";
	taOut.style.overflowY = "scroll";
	
	// canvas for draw simulation
	caOut = document.createElement("canvas");
	caOut.width = caOutDim[0];
	caOut.height = caOutDim[1];
	caOut.style.width = caOutDim[0] + "px";
	caOut.style.height = caOutDim[1]+ "px";
	caOut.style.background = bgColors[0];
	caOut.style.border = "1px solid #ccc";
	caOut.style.float = "left";
	
	// canvas for draw line chart of intensity
	caOut2 = document.createElement("canvas");
	caOut2.width = caOutDim2[0];
	caOut2.height = caOutDim2[1];
	caOut2.style.width = parseInt(caOut2.width) + "px";
	caOut2.style.height = parseInt(caOut2.height)+ "px";
	caOut2.style.background = bgColors[0];
	caOut2.style.border = "1px solid #ccc";
			
	// make division
	var divLeft = document.createElement("div");
	divLeft.style.border = "1px solid #ccc";
	divLeft.style.background = bgColors[1];
	divLeft.style.width = parseInt(taInDim[0])+"px";
	divLeft.style.height = parseInt(caOutDim[1])+"px";
	divLeft.style.float = "left";

	var divRight = document.createElement("div");
	divRight.style.border = "1px solid #ccc";
	divRight.style.background = bgColors[1];
	divRight.style.width = caOutDim2[0]+4+"px";
	divRight.style.height = caOutDim[1]+"px";
	divRight.style.float = "left";
	
	document.body.append(divLeft);
		divLeft.append(taIn);
		divLeft.append(btLoad);
		divLeft.append(btRead);
		divLeft.append(btRun);
		divLeft.append(btClear);
	document.body.append(caOut);
	document.body.append(divRight);
		divRight.append(taOut);
		divRight.append(caOut2);

	btLoad.addEventListener("click", clickButton);
	btRead.addEventListener("click", clickButton);
	btRun.addEventListener("click", clickButton);
	btClear.addEventListener("click", clickButton);
}

// Load parameters to taOutPar
function loadParameter() {
	var lines = "";
	lines += "# Simulations\n";
	lines += "t_min 0\n";    
	lines += "t_max 20\n";
	lines += "t_start 0\n";    
	lines += "t_end 18\n"; 
	lines += "dt 0.01\n";
	lines += "tproc 0.01\n";
	lines += "t_delay 1\n"
	lines += "N_irf 2\n"
    
	lines += "\n";
	lines += "# Ray's Properties \n";
	lines += "r_x 250\n";    
	lines += "r_y 0\n";
	lines += "r_z 0\n";
	lines += "n_x 0\n";    
	lines += "n_y 0.8\n";
	lines += "n_z 0\n";
	lines += "v_ray 1000\n";
	
	lines += "\n";
	lines += "# Detector's Properties\n";
	lines += "det_x 500\n";
	lines += "det_y 250\n";	
	lines += "det_z 0\n";
	lines += "R_det 50\n";
	
	lines += "\n";
	lines += "# Particle's Properties\n";
	lines += "num_par 20\n";
	lines += "R_par 5\n";
	lines += "s_obs 100\n"
	
	taIn.value = lines;
	taIn.scrollTop = taIn.scrollHeight;
}

function readParameter(){
	var lines = taIn.value;
	
	t_min 	= getValue(lines, "t_min");    
	t_max 	= getValue(lines, "t_max");
	t_start = getValue(lines,"t_start");
	t_end	= getValue(lines,"t_end");
	dt		= getValue(lines,"dt");
	tproc	= getValue(lines,"tproc");
	t_delay = getValue(lines,"t_delay");
	N_irf	= getValue(lines,"N_irf");
	
	
	N_iter	= (t_max-t_min)/dt;
	M_iter	= (t_end-t_start)/dt;
    
	var r_x	= getValue(lines,"r_x");    
	var r_y	= getValue(lines,"r_y");
	var r_z	= getValue(lines,"r_z");
	var n_x	= getValue(lines,"n_x");
	var n_y	= getValue(lines,"n_y");
	var n_z	= getValue(lines,"n_z");
	v_ray	= getValue(lines,"v_ray");
	
	r_src	= new Vect3(r_x,r_y,r_z);
	n_dir	= new Vect3(n_x,n_y,n_z);
	
	var det_x	= getValue(lines,"det_x");
	var det_y	= getValue(lines,"det_y");
	var det_z	= getValue(lines,"det_z");
	R_det		= getValue(lines,"R_det");

	det		= new Vect3(det_x,det_y,det_z);
	
	num_par	= getValue(lines,"num_par");
	R_par	= getValue(lines,"R_par");
	s_obs	= getValue(lines,"s_obs");
	
	// Get value from a line inside parameter textarea
	function getValue(lines, key) {
		var value = undefined;
		var line = lines.split("\n");
		var N = line.length;
		for(var i = 0; i < N; i++) {
			var col = line[i].split(" ");
			if(col[0] == key) {
				value = parseFloat(col[1]);
			}
		} return value;
	}
}

// Show message on the output textarea
function tout() {
	var msg = arguments[0];
	taOut.value += msg;
	taOut.scrollTop = taOut.scrollHeight;
}


// Clear canvas
function clearCanvas() {
	var cx = caOut.getContext("2d");
	cx.clearRect(XMIN, YMAX, XMAX, YMIN);
}

// Clear canvas 2
function clearCanvas2() {
	var cx2 = caOut2.getContext("2d");
	cx2.clearRect(XMIN2, YMAX2, XMAX2, YMIN2);
}

// Clear all
function clearAll() {
	taIn.value = "";
	taOut.value = "";
	clearCanvas();
	clearCanvas2();
}

function clickButton(){
	var t = event.target;
	var n = t.innerHTML;
	console.log("Button click -> " + n);
	
	if(n == "Load") {
		btRead.disabled = false;
		loadParameter();
	} else if(n == "Read") {
		btLoad.disabled 	= false;
		btRead.disabled 	= false;
		btRun.disabled  	= true;
		btClear.disabled	= false;
		
		readParameter();
		initParams();
		clearCanvas();
		clearCanvas2();
		drawSystem();
		btRun.disabled  	= false;
	} else if(n == "Run") {
		btLoad.disabled 	= true;
		btRead.disabled 	= true;
		btRun.disabled  	= false;
		btClear.disabled	= true;
		
		btRun.innerHTML = "Stop";	
		running = true;
		tout('t(s)\tCount\n')
		proc = setInterval(simulate, tproc);
		
		btLoad.disabled 	= false;
		btRead.disabled 	= false;
		btRun.disabled  	= false;
		btClear.disabled	= false;
	} else if(n == "Stop") {
		btLoad.disabled 	= false;
		btRead.disabled 	= false;
		btRun.disabled  	= false;
		btClear.disabled	= false;
		clearInterval(proc);
		btRun.innerHTML = "Run";
		running = false;
	} else if(n == "Clear") {
		taOut.value = "";
		clearCanvas();
		clearCanvas2();
	}
}

// Transform real coordinates to canvas coordinates
function transform(xx, yy) {
	var XX = (xx - xmin) / (xmax - xmin) * (XMAX - XMIN)
		+ XMIN;
	var YY = (yy - ymin) / (ymax - ymin) * (YMAX - YMIN)
		+ YMIN;
	return {x: XX, y: YY};
}

// Transform real coordinates to canvas coordinates
function scalingx(x) {
	var X = (x - xmin) / (xmax - xmin);
	X *= (XMAX - XMIN);
	X += XMIN;
	return X;
}

function scalingy(y) {
	var Y = (y - ymin) / (ymax - ymin);
	Y *= (YMAX - YMIN);
	Y += YMIN;
	return Y;
}

function scalingx_chart(x) {
	var X = (x - xmin2) / (xmax2 - xmin2);
	X *= (XMAX2 - XMIN2);
	X += XMIN2;
	return X;
}
function scalingy_chart(y) {
	var Y = (y - ymin2) / (ymax2 - ymin2);
	Y *= (YMAX2 - YMIN2);
	Y += YMIN2;
	return Y;
}



/* 
	testing_ray6.html
	Single ray reflection on one sphere.
	
	Sparisoma Viridi
	Septian Ulan Dini
	Dellia Yulita
	Iqbal Rahmadhan
	
	
	20200212
		- briefing with Dini and Dellia to get understanding 
			about concept and the expected result
	20200213
		- start create simple layout directly in html
		- implementing https://butiran.github.io/comp/single-ray-source-direction
		- using requestAnimateFrame to create simulation of ray beam
			- from many online sources say that requestAnimateFrame is better in many aspect
				compares to setInterval
		- debugging
	20200214
		- display sphere on canvas, debugging the coordinate and scaling
			(important note: need to declare both of canvas.height and canvas.style.height)
		- implementing https://butiran.github.io/comp/single-ray-reflection-site-on-sphere
			- find the reflection site
			- problem: although the simulation stop when ray reach the sphere,
						program cannot get the actual r_C
			- problem: secant method would return NaN when using high N_irf, use N_irf=2			
		- implementing https://butiran.github.io/comp/single-ray-reflection-sphere#mjx-eqn-eqn%3Asrrs-normal-ref
			- adding n_par and n_ref
			- adding new r_waf path for reflection beam in iteration
						
	20200216
		- try to rewrite code before in testing_ray3.html to become more orderly
			to solve variable problem
		- global variable solve
		- using setTimeout to complement requestAnimationFrame to set the fps
		- updating n_dir, r_src, and t_0 to get reflection beam

	20200217
		- create position for many particle
		- create iteration for each particle if the ray land on the particle
		- debug variable problem
		- insert random element on initial position
		
	20200218
		- make the sphere dancing

	20200219
		- change paradigm of storing information into matrix of n-time and m-ray for ray
		- change paradigm of storing information into matrix of n-time and i-par for particle
		- ray-m will be beamed if m>n
		- problem with simulation
		- too tired, 
		
	20200220
		- solving problem of simulation
		- adding detector and get count intensity
	
	20200221
		- place count intensity in calculate function
		- start create linechart animation
		
	20200222
		- finish adding realtime chart of intensity
		- it should be drawn more nicely, later
		
		
*/