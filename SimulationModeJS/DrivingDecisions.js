class DrivingDecisions{
    constructor(vehicleObj, forwardLineOfSight=new Line(),
    frontLeftLineOfSight,frontRightLineOfSight,rearLeftLineOfSight,rearRightLineOfSight){

        this.forwardLineOfSight=forwardLineOfSight;
        this.frontLeftLineOfSight=frontLeftLineOfSight;
        this.frontRightLineOfSight=frontRightLineOfSight;
        this.rearLeftLineOfSight=rearLeftLineOfSight;
        this.rearRightLineOfSight=rearRightLineOfSight;

        this.dynamicStates={turning:'N', steadyState:'Y',stopped:'N',laneChanging:'N',
        changingSpeed:'N', toStop:false};

        this.nextTurnDynamics={centroid:{x:null,y:null},centroidToVehicleLine:new Line(), beganTurn:false,turning:false, finishingTurn:false,
            reachedEnd:false,radius:null, leftOrRightTurn:null};
        
        this.vehicle=vehicleObj;

        this.nextCheckpoint={object:null, 
            intersectionInfo:{stopPoint:{x:null,y:null},
                            entryPoint:{x:null,y:null}, 
                            hasDecidedOnTurn:false},
            action:null, 
            nextRoadID:null, nextLane:null, nextRoadDir:null};
    }

    updateForwardVisionLinePosition(){//-
        let absoluteDirection=getAbsoluteDirectionFromRelativeDir("forward",this.vehicle.position.dir);
        let frontBumperCenterPt=getVectorGivenDirection_Magnitude(absoluteDirection,this.vehicle.length/2);
        frontBumperCenterPt.x+=this.vehicle.position.x;
        frontBumperCenterPt.y+=this.vehicle.position.y;
        let forwardVisionExtentPt=getVectorGivenDirection_Magnitude(absoluteDirection,this.vehicle.length/2+forwardVisionRange);
        forwardVisionExtentPt.x+=this.vehicle.position.x;
        forwardVisionExtentPt.y+=this.vehicle.position.y;
        this.forwardLineOfSight.startX=frontBumperCenterPt.x;
        this.forwardLineOfSight.startY=frontBumperCenterPt.y;
        this.forwardLineOfSight.endX=forwardVisionExtentPt.x;
        this.forwardLineOfSight.endY=forwardVisionExtentPt.y;

        drawLine(this.forwardLineOfSight.startX,this.forwardLineOfSight.startY,this.forwardLineOfSight.endX,
            this.forwardLineOfSight.endY,line_Width*0.6,"red",0,0,ctx2);
    }

    getNextRoadVertex(){//-
        let nextVertex=new Vertex();

        let roadDirFromStartToEndVertex=getLineAzimuthFromVertex(roads[this.vehicle.position.onRoadID].startX,roads[this.vehicle.position.onRoadID].startY,
            roads[this.vehicle.position.onRoadID].startX,roads[this.vehicle.position.onRoadID].startY,
            roads[this.vehicle.position.onRoadID].endX,roads[this.vehicle.position.onRoadID].endY,roads[this.vehicle.position.onRoadID].angle);
            

        if(roadDirFromStartToEndVertex==this.vehicle.position.dir){
            nextVertex.x=roads[this.vehicle.position.onRoadID].endX;
            nextVertex.y=roads[this.vehicle.position.onRoadID].endY;

        }

        else{
            nextVertex.x=roads[this.vehicle.position.onRoadID].startX;
            nextVertex.y=roads[this.vehicle.position.onRoadID].startY;
        }
        console.log("distance is "+getDistanceBetweenTwoPoints(nextVertex.x,nextVertex.y,this.vehicle.position.x,this.vehicle.position.y));
        console.log(this.nextTurnDynamics.radius*1.1);
        if(getDistanceBetweenTwoPoints(nextVertex.x,nextVertex.y,this.vehicle.position.x,this.vehicle.position.y)
        <this.nextTurnDynamics.radius*1.1){
            nextVertex=null;
        }
        return nextVertex;
    }

    getNextCheckpointInfo(){//-

        let nextRoadVertex=this.getNextRoadVertex();
        if(nextRoadVertex!=null){
         for(let i in intersections){
             if(nextRoadVertex.x==intersections[i].x&&nextRoadVertex.y==intersections[i].y){
                //console.log("heading towards intersection");
                this.nextCheckpoint.object=intersections[i];
                this.nextCheckpoint.intersectionInfo.stopPoint=
                    intersections[i].getStopLinePoint(this.vehicle.position.onRoadID,this.vehicle.position.lane);
                 
                this.nextCheckpoint.intersectionInfo.entryPoint=
                intersections[i].getEntryLinePoint(this.vehicle.position.onRoadID,this.vehicle.position.lane);

                let nextRoadAfterIntersection=this.pickRandomTurnFromPossibilities(this.getTurnPossibilitiesAtNextIntersection());
                console.log(this.getTurnPossibilitiesAtNextIntersection());
                this.nextCheckpoint.nextRoadID=nextRoadAfterIntersection.roadID;
                this.nextCheckpoint.intersectionInfo.hasDecidedOnTurn=true;
                this.nextTurnDynamics.radius=intersectionTurnRadius;
                this.nextTurnDynamics.leftOrRightTurn=nextRoadAfterIntersection.leftOrRightTurn;
                this.nextCheckpoint.nextLane=nextRoadAfterIntersection.nextLane;
                this.nextCheckpoint.nextRoadDir=nextRoadAfterIntersection.nextRoadDir;

                let lineIntersectionInfo;
                let currentFollowLine=roads[this.vehicle.position.onRoadID].getFollowLineForLane(this.vehicle.position.lane);
                let nextRoadFollowLine=roads[this.nextCheckpoint.nextRoadID].getFollowLineForLane(this.nextCheckpoint.nextLane);
                
                if(this.nextTurnDynamics.leftOrRightTurn=="right"){
                    lineIntersectionInfo=getLinesIntersectionPt(currentFollowLine,nextRoadFollowLine);
                }

                else if(this.nextTurnDynamics.leftOrRightTurn=="left"){
                    lineIntersectionInfo=getLinesIntersectionPt(currentFollowLine,nextRoadFollowLine,"extrapolation"); //lines to be extrapolated to "infinity" 
                                        //the function does not account for whether the lines actually intersect per their start and end vertices as the follow lines
                                        //aren't expected to intersect if it is a left turn.
                }

                let followLinesIntersectionPt=new Vertex(); // point representing the intersection of two follow lines at a traffic intersection 
                followLinesIntersectionPt.x=currentFollowLine.startX+
                    lineIntersectionInfo.lambda*(currentFollowLine.endX-currentFollowLine.startX);
                followLinesIntersectionPt.y=currentFollowLine.startY+
                lineIntersectionInfo.lambda*(currentFollowLine.endY-currentFollowLine.startY);

                let turnAngle=azimuthAToAzimuthBdiff(this.nextCheckpoint.nextRoadDir,azimuthMinusAngle(this.vehicle.position.dir,180));
                
                let followLinesIntersectionPtOffsetAlongCurrentRoadDir=intersectionTurnRadius/Math.tan(degreesToRadians(turnAngle/2));

                let followLinesIntersectionPtOffsetAlongCurrentRoadDirVector=
                getVectorGivenDirection_Magnitude(azimuthMinusAngle(this.vehicle.position.dir,180),followLinesIntersectionPtOffsetAlongCurrentRoadDir);
                let offsetToCentroidPositionVector=getVectorGivenDirection_Magnitude(azimuthMinusAngle(this.vehicle.position.dir,270),intersectionTurnRadius);

                this.nextTurnDynamics.centroid.x=followLinesIntersectionPt.x+followLinesIntersectionPtOffsetAlongCurrentRoadDirVector.x+
                                                    offsetToCentroidPositionVector.x;  
                
                this.nextTurnDynamics.centroid.y=followLinesIntersectionPt.y+followLinesIntersectionPtOffsetAlongCurrentRoadDirVector.y+
                offsetToCentroidPositionVector.y;  
                this.dynamicStates.toStop=true;
                
                return;
             }
         }

         for(let i in roadBends){
              if(nextRoadVertex.x==roadBends[i].x&&nextRoadVertex.y==roadBends[i].y){
                  console.log("heading towards roadBend");
                  this.nextCheckpoint.object=roadBends[i];
                  this.nextTurnDynamics.radius=roadBends[i].radius;
                  console.log("next turn's radius is "+this.nextTurnDynamics.radius);
                  this.nextTurnDynamics.centroid=roadBends[i].bendCentroid;
                  if(roadBends[i].joinRoad[0].roadID==this.vehicle.position.onRoadID){
                      this.nextCheckpoint.nextRoadID=roadBends[i].joinRoad[1].roadID;
                      this.nextCheckpoint.nextRoadDir=roadBends[i].joinRoad[1].dir;
                  }
                  else{
                      this.nextCheckpoint.nextRoadID=roadBends[i].joinRoad[0].roadID;
                      this.nextCheckpoint.nextRoadDir=roadBends[i].joinRoad[0].dir;
                  }
                  return;
              }
         }

         for(let i in transitions){
              if(nextRoadVertex.x==transitions[i].x&&nextRoadVertex.y==transitions[i].y){
                  console.log("heading towards transition");
                  this.nextCheckpoint.object=transitions[i];
                  return;
              }
         }

         for(let i in straightConnections){
              if(nextRoadVertex.x==straightConnections[i].x&&nextRoadVertex.y==straightConnections[i].y){
                  console.log("heading towards straightConnection");
                  this.nextCheckpoint.object=straightConnections[i];
                  return;
              }
         }

         for(let i in controlVolumeBorderVertices){
              if(nextRoadVertex.x==controlVolumeBorderVertices[i].x&&nextRoadVertex.y==controlVolumeBorderVertices[i].y){
                  //console.log("heading towards border");
                  this.nextCheckpoint.object=controlVolumeBorderVertices[i];
                  return;
              }
          }
        } 
     }

     getNextCheckpointDistance(){//-
         return convertPixelsToMetres(getDistanceBetweenTwoPoints(this.vehicle.position.x,this.vehicle.position.y,
            this.nextCheckpoint.intersectionInfo.stopPoint.x,this.nextCheckpoint.intersectionInfo.stopPoint.y)-this.vehicle.length/2);
     }

     getTurnPossibilitiesAtNextIntersection(){//- 
         let possibleTurnRoadsInfo=[];
         let turnType="";
         console.log("joinRoad "+this.nextCheckpoint.object.joinRoad.length);
         for(let i in this.nextCheckpoint.object.joinRoad){
             if(i!=this.vehicle.position.onRoadID){
                 if(azimuthAToAzimuthBdiff(this.vehicle.position.dir,this.nextCheckpoint.object.joinRoad[i].dir)>=0){
                     console.log("right general rel dir");
                     turnType="rightward";
                 }
                 else {
                     console.log("left general rel dir");
                     turnType="leftward";
                 }

                 if(turnType=="rightward"&&this.nextCheckpoint.object.joinRoad[i].lanes>1){
                     console.log("turn available");
                     possibleTurnRoadsInfo.push({roadID:this.nextCheckpoint.object.joinRoad[i].roadID, 
                        leftOrRightTurn:"right", nextLane: this.nextCheckpoint.object.joinRoad[i].lanes});
                 }

                 else if(turnType=="leftward"&&laneFromCenterLine(roads[this.vehicle.position.onRoadID].lanes,this.vehicle.position.lane)==
                 laneFromCenterLine(this.nextCheckpoint.object.joinRoad[i].lanes, this.vehicle.position.lane)){       
                    possibleTurnRoadsInfo.push({roadID:this.nextCheckpoint.object.joinRoad[i].roadID, leftOrRightTurn:"left", 
                    nextLane:this.nextCheckpoint.object.joinRoad[i].lanes/2+laneFromCenterLine(this.nextCheckpoint.object.joinRoad[i].lanes, this.vehicle.position.lane),
                    nextRoadDir:this.nextCheckpoint.object.joinRoad[i].dir});
                    
                     console.log("turn available");
                 }

             }
         }
         return possibleTurnRoadsInfo;

     }



     pickRandomTurnFromPossibilities(possibleTurnRoadsInfo){//--

         let chosenRoad_ID_LorR=possibleTurnRoadsInfo[Math.floor(Math.random() * possibleTurnRoadsInfo.length)];
         return chosenRoad_ID_LorR;

     }
         /*if(!this.turnDecision.hasDecided){//intersection/junction exists at end of road
         this.turnDecision.toTurn=this.makeTurnDecision();
         }
         if(this.ReachedNextIntersection()){
             this.executeTurn();
         }
     }

     */
        nullifyNextCheckpoint(){

        this.nextCheckpoint={object:null, 
            intersectionInfo:{stopPoint:{x:null,y:null},
                            entryPoint:{x:null,y:null}, 
                            hasDecidedOnTurn:false},
            action:null, 
            nextRoadID:null,nextLane:null, nextRoadDir:null};
        }

        nullifyNextTurnDynamics(){
        this.nextTurnDynamics={centroid:{x:null,y:null},centroidToVehicleLine:new Line(), beganTurn:false,turning:false,
        reachedEnd:false,radius:null, leftOrRightTurn:null,finishingTurn:null};
        }

        updateTurnCentroidToVehicleLine(){
        this.nextTurnDynamics.centroidToVehicleLine.startX=this.nextTurnDynamics.centroid.x;
        this.nextTurnDynamics.centroidToVehicleLine.startY=this.nextTurnDynamics.centroid.y;
        this.nextTurnDynamics.centroidToVehicleLine.endX=this.vehicle.position.x;
        this.nextTurnDynamics.centroidToVehicleLine.endY=this.vehicle.position.y;
        let slope=-1*(this.nextTurnDynamics.centroidToVehicleLine.endY-this.nextTurnDynamics.centroidToVehicleLine.startY)
        /(this.nextTurnDynamics.centroidToVehicleLine.endX-this.nextTurnDynamics.centroidToVehicleLine.startX);
        this.nextTurnDynamics.centroidToVehicleLine.angle=getAngleFromSlopeRatio(slope); 
        this.nextTurnDynamics.centroidToVehicleLine.dir=
        getLineAzimuthFromVertex(this.nextTurnDynamics.centroidToVehicleLine.startX,
            this.nextTurnDynamics.centroidToVehicleLine.startY,this.nextTurnDynamics.centroidToVehicleLine.startX,
            this.nextTurnDynamics.centroidToVehicleLine.startY,this.nextTurnDynamics.centroidToVehicleLine.endX,
            this.nextTurnDynamics.centroidToVehicleLine.endY,this.nextTurnDynamics.centroidToVehicleLine.angle);

        drawLine(this.nextTurnDynamics.centroidToVehicleLine.startX,this.nextTurnDynamics.centroidToVehicleLine.startY,
            this.nextTurnDynamics.centroidToVehicleLine.endX,this.nextTurnDynamics.centroidToVehicleLine.endY,
                line_Width,"blue",0,0,ctx2);
    }

        detectForTurnStart(){
        if(Math.abs(this.vehicle.position.dir-getAbsoluteDirectionFromRelativeDir("left",this.nextTurnDynamics.centroidToVehicleLine.dir))
        <0.1){
            this.nextTurnDynamics.beganTurn=true;
            console.log("turn start detected");
            this.nextTurnDynamics.leftOrRightTurn="left";
        }
        else if(Math.abs(this.vehicle.position.dir-getAbsoluteDirectionFromRelativeDir("right",this.nextTurnDynamics.centroidToVehicleLine.dir))
            <0.1){
            this.nextTurnDynamics.beganTurn=true;
            console.log("turn start detected");
            this.nextTurnDynamics.leftOrRightTurn="right";
        }

       // else console.log(this.position.dir,Math.abs(this.position.dir-getAbsoluteDirectionFromRelativeDir("left",this.nextTurnDynamics.centroidToVehicleLine.dir)));
    }
     
}