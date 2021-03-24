class Vehicle{
    constructor(length=vehicleLength,width=vehicleWidth,onRoadID,
    color=this.getRandomVehicleColor(),
    body={leftBoundary:0,rightBoundary:0,bumperF:0,bumperR:0},
    
        
        currentLane,velocity=40,acceleration=0){

            this.length=length;
            this.width=width;
            this.position={lane:null,x:null,y:null,onRoadID:null,dir:null};
            this.color=color;
            this.body=body;
           
            this.currentLane=currentLane;
            this.velocity=velocity;//in km/h
            this.onRoadID=onRoadID;
            
            this.acceleration=acceleration;
            this.maxComfortableAcceleration=1;
            this.maxComfortableDeceleration=1.5;
            this.sum=0;
            this.drivingDecisions=new DrivingDecisions(this);

        }

        draw(){
            ctx2.beginPath();
            ctx2.translate(this.position.x,this.position.y);
            let carDirInRadians=0;
            let frontBumperCurveMargin=7;
            let rearBumperCurveMargin=8;
            let windShieldBackMargin=19.5;
            let windShieldFrontMargin=14;
            let windShieldFrontInwardMargin=1;
            let windShieldBackInwardMargin=2.6;
            let rearWindowInwardMargin=2.2;
            let rearWindowBackMargin=6.0;
            let rearWindowFrontMargin=10;

            carDirInRadians=this.position.dir/360*2*Math.PI;
            
            ctx2.rotate(carDirInRadians);
            ctx2.translate(-this.position.x,-this.position.y);


            //drawing body
            ctx2.moveTo(this.position.x-this.width/2,this.position.y-this.length/2+frontBumperCurveMargin);
            ctx2.bezierCurveTo(this.position.x-this.width/2,this.position.y-this.length/2,
                this.position.x+this.width/2,this.position.y-this.length/2,
                this.position.x+this.width/2,this.position.y-this.length/2+frontBumperCurveMargin);
            ctx2.lineTo(this.position.x+this.width/2,this.position.y+this.length/2-rearBumperCurveMargin);
            ctx2.bezierCurveTo(this.position.x+this.width/2,this.position.y+this.length/2,
                this.position.x-this.width/2,this.position.y+this.length/2,
                this.position.x-this.width/2,this.position.y+this.length/2-rearBumperCurveMargin);
            ctx2.closePath(); 
            ctx2.fillStyle=this.color;   
            ctx2.fill();

            //drawing windshield
            ctx2.beginPath();
            ctx2.moveTo(this.position.x-this.width/2+windShieldBackInwardMargin,
                this.position.y-this.length/2+windShieldBackMargin);
            ctx2.lineTo(this.position.x-this.width/2+windShieldFrontInwardMargin,
                this.position.y-this.length/2+windShieldFrontMargin);
            ctx2.bezierCurveTo(this.position.x-this.width/2+windShieldFrontInwardMargin,
                this.position.y-this.length/2+windShieldFrontMargin-windShieldFrontMargin*0.3,
                this.position.x+this.width/2-windShieldFrontInwardMargin,
                this.position.y-this.length/2+windShieldFrontMargin-windShieldFrontMargin*0.3,
                this.position.x+this.width/2-windShieldFrontInwardMargin,
                this.position.y-this.length/2+windShieldFrontMargin);
            ctx2.lineTo(this.position.x+this.width/2-windShieldBackInwardMargin,
                    this.position.y-this.length/2+windShieldBackMargin);    
            ctx2.closePath();
            ctx2.fillStyle="#234D63";

            ctx2.fill();

            //drawing rear window
            ctx2.beginPath();
            ctx2.moveTo(this.position.x-this.width/2+rearWindowInwardMargin,
                this.position.y+this.length/2-rearWindowFrontMargin);

            ctx2.bezierCurveTo(this.position.x-this.width/2+rearWindowInwardMargin,
                this.position.y+this.length/2-rearWindowFrontMargin+rearWindowFrontMargin*0.3,
                this.position.x+this.width/2-rearWindowInwardMargin,
                this.position.y+this.length/2-rearWindowFrontMargin+rearWindowFrontMargin*0.3,
                this.position.x+this.width/2-rearWindowInwardMargin,
                this.position.y+this.length/2-rearWindowFrontMargin);

            ctx2.lineTo(this.position.x+this.width/2-rearWindowInwardMargin,
                this.position.y+this.length/2-rearWindowBackMargin);

            ctx2.bezierCurveTo(this.position.x+this.width/2-rearWindowInwardMargin,
                this.position.y+this.length/2-rearWindowBackMargin+rearWindowBackMargin*0.5,
                this.position.x-this.width/2+rearWindowInwardMargin,
                this.position.y+this.length/2-rearWindowBackMargin+rearWindowBackMargin*0.5,
                this.position.x-this.width/2+rearWindowInwardMargin,
                this.position.y+this.length/2-rearWindowBackMargin);
            ctx2.closePath();
            ctx2.fill();


            ctx2.translate(this.position.x,this.position.y);
            ctx2.rotate(-carDirInRadians);
            ctx2.translate(-this.position.x,-this.position.y);

            
        }

        getRandomVehicleColor(){
            let randomInt=Math.floor(Math.random() * 6);
            let selectedColor;
            switch(randomInt){
                case 0:
                    selectedColor="#80bfff";
                break;
                case 1:
                    selectedColor="#ff9966";
                break;
                case 2:
                    selectedColor="#cc99ff";
                break;
                case 3:
                    selectedColor="#DCE863";
                break;
                case 4:
                    selectedColor="#FAEA65";
                break;
                case 5:
                    selectedColor="#F6F6F6";
            }
            return selectedColor;
        }

        getInitialPosition(){
            
            //let initialBorderPt=Math.floor(Math.random() * controlVolumeBorderVertices.length);
            let initialBorderPt=0;
            
            //this.position.lane=Math.floor(Math.random()
            //    *roads[controlVolumeBorderVertices[initialBorderPt].roadID].lanes/2)+1+
            //    roads[controlVolumeBorderVertices[initialBorderPt].roadID].lanes/2;
            this.position.lane=4;
            this.position.x=controlVolumeBorderVertices[initialBorderPt].x;
            this.position.y=controlVolumeBorderVertices[initialBorderPt].y;
            this.position.onRoadID=controlVolumeBorderVertices[initialBorderPt].roadID;
            this.position.dir=controlVolumeBorderVertices[initialBorderPt].initialDir;

        }

        modifyInitialPositionToFitLane(){
            let absoluteDirection=getAbsoluteDirectionFromRelativeDir("right",this.position.dir);
            if(roads[this.position.onRoadID].lanes>1){
                this.position.x+=getVectorGivenDirection_Magnitude(absoluteDirection,laneWidth*(this.position.lane-
                    roads[this.position.onRoadID].lanes/2)-laneWidth/2).x;
                this.position.y+=getVectorGivenDirection_Magnitude(absoluteDirection,laneWidth*(this.position.lane-
                    roads[this.position.onRoadID].lanes/2)-laneWidth/2).y;
            }    
        }

        moveForward(){
            let absoluteDirection=getAbsoluteDirectionFromRelativeDir("forward",this.position.dir);
            let deltaPosition=getVectorGivenDirection_Magnitude(absoluteDirection,
                convertkmhToPixelsPerMillisecond(this.velocity)*deltaTime);
            this.position.x+=deltaPosition.x;
            this.position.y+=deltaPosition.y;
    
            this.updateForwardVisionLinePosition();
        }
        

        getDeceleration(){
            return -Math.pow(Math.pow(convertKMHtoMS(this.velocity),2)/(2*this.getNextCheckpointDistance()),2)
            /this.maxComfortableDeceleration;//m/s^2
        }

        

        executeTurn(){
            let turnFinished=false;
            if(this.drivingDecisions.nextTurnDynamics.leftOrRightTurn=="left"){
                if(Math.abs(azimuthAToAzimuthBdiff(this.position.dir,getAbsoluteDirectionFromRelativeDir("left",this.drivingDecisions.nextTurnDynamics.centroidToVehicleLine.dir)))>0.4){
                    rotateObject(this,0.5);
                }
                //console.log(azimuthAToAzimuthBdiff(this.nextCheckpoint.nextRoadDir,this.position.dir));
                if(azimuthAToAzimuthBdiff(this.drivingDecisions.nextCheckpoint.nextRoadDir,this.position.dir)>0.4){ //car overturns by at least 0.4 deg
                    turnFinished=true;
                    console.log("left turn finished");
                }
                
                 
                //console.log(this.position.dir,getAbsoluteDirectionFromRelativeDir("left",this.nextTurnDynamics.centroidToVehicleLine.dir));
                //console.log(azimuthAToAzimuthBdiff(this.position.dir,getAbsoluteDirectionFromRelativeDir("left",this.nextTurnDynamics.centroidToVehicleLine.dir)));
                
            }

            else{
                if(Math.abs(azimuthAToAzimuthBdiff(this.position.dir,getAbsoluteDirectionFromRelativeDir("right",this.drivingDecisions.nextTurnDynamics.centroidToVehicleLine.dir)))>0.4){
                    rotateObject(this,-0.5);
                }
                console.log(azimuthAToAzimuthBdiff(this.position.dir,this.drivingDecisions.nextCheckpoint.nextRoadDir));
                if(azimuthAToAzimuthBdiff(this.position.dir,this.drivingDecisions.nextCheckpoint.nextRoadDir)>0.4){//car overturns by at least 0.4 deg
                    turnFinished=true;
                }
                
            }
            
            if(turnFinished){
                console.log("turn complete");
                this.position.onRoadID=this.drivingDecisions.nextCheckpoint.nextRoadID;
                console.log("on road "+this.position.onRoadID);
                this.position.dir=this.drivingDecisions.nextCheckpoint.nextRoadDir;
                this.drivingDecisions.nullifyNextCheckpoint();

                this.drivingDecisions.nullifyNextTurnDynamics();
                
                
            }            
        }

        updateVelocity(){ //0.02 is acceleration
            let deceleration;
            //if(Math.abs(this.getDeceleration())>2*this.maxComfortableDeceleration)
            //    deceleration=-2*this.maxComfortableDeceleration;
           // else 
                deceleration=this.getDeceleration();

            this.velocity+=convertMStoKMH(deceleration*deltaTime/1000);
            //console.log(deceleration);
        }

        update(){
            this.draw();
            if(this.drivingDecisions.nextCheckpoint.object==null){
                console.log("Getting next checkpoint info");
                this.drivingDecisions.getNextCheckpointInfo();
            }

            else if(this.drivingDecisions.nextCheckpoint.object instanceof RoadBend || 
                this.drivingDecisions.nextCheckpoint.object instanceof Intersection){
                //console.log("next road ID "+this.nextCheckpoint.nextRoadID);
                drawCircularMarker(this.drivingDecisions.nextCheckpoint.centroid.x,this.drivingDecisions.nextCheckpoint.centroid.y,
                    "green",15,ctx2);
                    this.drivingDecisions.updateTurnCentroidToVehicleLine();

                if(!this.drivingDecisions.nextTurnDynamics.beganTurn){
                    this.detectForTurnStart();
                    console.log("detectting");
                }
                    
                else{
                    this.executeTurn();
                }

            }

            this.updateVelocity();
            this.moveForward();
            this.drivingDecisions.updateForwardVisionLinePosition();
            drawCircularMarker(this.nextCheckpoint.intersectionInfo.stopPoint.x,this.nextCheckpoint.intersectionInfo.stopPoint.y,
            "blue",15,ctx2);
        }


}


























