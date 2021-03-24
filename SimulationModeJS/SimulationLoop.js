vehiclesCanvas=document.getElementById("vehiclesCanvas");
ctx2=vehiclesCanvas.getContext('2d');
ctx2.lineWidth=line_Width;

let lastCalledTime=performance.now();
let deltaTime;
let vehicleWidth=laneWidth*0.7;
let vehicleLength=vehicleWidth*2.4;
let forwardVisionRange=95;
let intersectionDecisionPointDistance=120;

let simulationInitialized=false;
let vehicles=[];


loop(); //calling main simulation loop

function loop() {
    deltaTime = performance.now() - lastCalledTime;
    lastCalledTime = performance.now();
    requestAnimationFrame(loop);
  

  if(Mode.type=="simulate"&&simulationInitialized==false){
    simulationInitialized=true;
    initializeSimulation();
  }

  if (simulationInitialized==true){
    
    clearCanvas(ctx2);

    updateVehicles();
  }


}




function initializeSimulation(){
    getIntersectionPoints();
    initializeIntersections();
    getRoadBendPoints();
    getTransitionPoints();
    getStraightConnectionPoints();
    getControlVolumeBorderPts();
    
    
    
    vehicle1=new Vehicle(vehicleLength ,vehicleWidth);
    vehicle1.getInitialPosition();
    vehicle1.modifyInitialPositionToFitLane();
    vehicles.push(vehicle1);

}


function updateVehicles(){
    
    for(let i in vehicles){
        //console.log(vehicles[i].position.x,vehicles[i].position.y,vehicles[i].position.dir);
        vehicles[i].draw();
        

        vehicles[i].update();

        
        

    }
}

function initializeIntersections(){
    for(let i in intersections){
        intersections[i].createStopLinePointsForLanes();
    }
}