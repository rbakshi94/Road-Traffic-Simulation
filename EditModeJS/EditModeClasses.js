class Vertex{
    constructor(x,y,lineID){
        this.x=x;
        this.y=y;
        this.lineID=lineID;
    }
}


class Line{
    constructor(startX,startY,endX,endY,angle){
        this.startX=startX;
        this.startY=startY;
        this.endX=endX;
        this.endY=endY;
        this.angle=angle;
        this.dir;
    }
}

class Road extends Line{
    constructor(startX,startY,endX,endY,angle,lanes){
        super(startX,startY,endX,endY,angle);
        this.lanes=lanes;
        this.dir;
        this.oppositeDir;
        this.laneFollowLines=[]; //an array of line objects that represent lanes' centers (paths)
    }

    updateRoadInfo(){
        let slope=-1*(this.endY-this.startY)/(this.endX-this.startX);
        this.angle=getAngleFromSlopeRatio(slope); 
    }

    drawThisRoad(){         
        
        let solidWhiteLineOffsetY=Math.cos(degreesToRadians(this.angle))*laneWidth;
        let solidWhiteLineOffsetX=Math.sin(degreesToRadians(this.angle))*laneWidth;
        //--filling road with color
        ctx.beginPath();
        ctx.moveTo(this.startX+solidWhiteLineOffsetX*this.lanes/2,this.startY+solidWhiteLineOffsetY*this.lanes/2);
        ctx.lineTo(this.endX+solidWhiteLineOffsetX*this.lanes/2,this.endY+solidWhiteLineOffsetY*this.lanes/2);
        ctx.lineTo(this.endX-solidWhiteLineOffsetX*this.lanes/2,this.endY-solidWhiteLineOffsetY*this.lanes/2);
        ctx.lineTo(this.startX-solidWhiteLineOffsetX*this.lanes/2,this.startY-solidWhiteLineOffsetY*this.lanes/2);
        ctx.closePath();
        ctx.fillStyle = roadColor;
        ctx.fill();

        if(this.lanes==1){
            this.laneFollowLines.push(new Line(this.startX,this.startY,this.endX,this.endY,this.angle));
        }

        if(this.lanes==2){
            drawLine(this.startX,this.startY,this.endX,this.endY,line_Width,yellowLineColor,0,0); //centerline

            //oncoming lane follow line
            let laneFollowLineStartVshiftDir=getAbsoluteDirectionFromRelativeDir("left",this.dir);
            let laneFollowLineStartVshiftVector=getVectorGivenDirection_Magnitude(laneFollowLineStartVshiftDir,laneWidth/2);
            this.laneFollowLines.push(new Line(this.startX+solidWhiteLineOffsetX/2,
                this.startY+solidWhiteLineOffsetY/2,this.endX+solidWhiteLineOffsetX/2,this.endY+solidWhiteLineOffsetY/2,this.angle));

            //normal lane follow line
            this.laneFollowLines.push(new Line(this.startX-solidWhiteLineOffsetX/2,
                this.startY-solidWhiteLineOffsetY/2,this.endX-solidWhiteLineOffsetX/2,this.endY-solidWhiteLineOffsetY/2,this.angle));
        }
        

        if(this.lanes>2){
            drawLine(this.startX,this.startY,this.endX,this.endY,line_Width,yellowLineColor,0,0); //centerline
            let i;
            for(i=1;i<=this.lanes/2-1;i++){
                //drawing broken white lines
                drawLine(this.startX+solidWhiteLineOffsetX*i,this.startY+solidWhiteLineOffsetY*i,
                    this.endX+solidWhiteLineOffsetX*i,this.endY+solidWhiteLineOffsetY*i,line_Width,whiteLineColor,20,25);
                
                //drawing broken white lines
                drawLine(this.startX-solidWhiteLineOffsetX*i,this.startY-solidWhiteLineOffsetY*i,
                    this.endX-solidWhiteLineOffsetX*i,this.endY-solidWhiteLineOffsetY*i,line_Width,whiteLineColor,20,25);
            
            //oncoming lane follow line
            this.laneFollowLines.push(new Line(this.startX+solidWhiteLineOffsetX*i-solidWhiteLineOffsetX/2,
                this.startY+solidWhiteLineOffsetY*i-solidWhiteLineOffsetY/2,
                this.endX+solidWhiteLineOffsetX*i-solidWhiteLineOffsetX/2,
                this.endY+solidWhiteLineOffsetY*i-solidWhiteLineOffsetY/2,this.angle));

            //normal lane follow line
            this.laneFollowLines.push(new Line(this.startX-solidWhiteLineOffsetX*i+solidWhiteLineOffsetX/2,
                this.startY-solidWhiteLineOffsetY*i+solidWhiteLineOffsetY/2,
                this.endX-solidWhiteLineOffsetX*i+solidWhiteLineOffsetX/2,
                this.endY-solidWhiteLineOffsetY*i+solidWhiteLineOffsetY/2,this.angle));
            }
            
        }

        //--making white lines 
        drawLine(this.startX+solidWhiteLineOffsetX*this.lanes/2,this.startY+solidWhiteLineOffsetY*this.lanes/2,
            this.endX+solidWhiteLineOffsetX*this.lanes/2,this.endY+solidWhiteLineOffsetY*this.lanes/2,line_Width,whiteLineColor,0,0);

        drawLine(this.startX-solidWhiteLineOffsetX*this.lanes/2,this.startY-solidWhiteLineOffsetY*this.lanes/2,
            this.endX-solidWhiteLineOffsetX*this.lanes/2,this.endY-solidWhiteLineOffsetY*this.lanes/2,line_Width,whiteLineColor,0,0);
    }
    
    getFollowLineForLane(laneNo){
        return this.laneFollowLines[laneNo+1];        
    }
}



class RoadJoinsVertex extends Vertex{
    constructor(x,y,joinType){
            super(x,y);

        this.joinType=joinType;

        this.joinRoad=[];
    }
}

class Intersection extends RoadJoinsVertex{
    constructor(x,y,joinRoad,stopLineDistanceFromCenter){
            
        super(x,y);
        this.joinRoad=joinRoad;
        this.controlType=this.getDefaultControlType();
        this.stopLineDistanceFromCenter=stopLineDistanceFromCenter;
        //this.decisionLine2=this.makeDecisionLine(road1Lanes,road1Dir);
       // this.decisionLine2=this.makeDecisionLine(road2Lanes,road2Dir);
        //this.decisionLine3=this.makeDecisionLine(road3Lanes,road3Dir);
       // this.decisionLine4=this.makeDecisionLine(road4Lanes,road4Dir);
    }

    makeDecisionLine(lanes,roadDirection){
        let decisionLine=new Line();
        switch(roadDirection){
            case "north":
                decisionLine.startY=decisionLine.endY=this.y-intersectionDecisionPointDistance;
                decisionLine.startX=this.x;
                decisionLine.endX=this.x-lanes/2*laneWidth;
                break;
            case "south":
            decisionLine.startY=decisionLine.endY=this.y+intersectionDecisionPointDistance;
            decisionLine.startX=this.x;
            decisionLine.endX=this.x+lanes/2*laneWidth;
            break;
            case "east":
            decisionLine.startX=decisionLine.endX=this.x+intersectionDecisionPointDistance;
            decisionLine.startY=this.y;
            decisionLine.endY=this.y-lanes/2*laneWidth;
            break;
            case "west":
                decisionLine.startX=decisionLine.endX=this.x-intersectionDecisionPointDistance;
                decisionLine.startY=this.y;
                decisionLine.endY=this.y+lanes/2*laneWidth;
        }
        return decisionLine;

    }

    getDefaultControlType(){
        let controlType;
        if(this.joinRoad.length==3){
            controlType= "stop sign";
        }
        
        else controlType= "signalized";
        console.log(controlType);
        return controlType;
    }

    drawDecisionLines(){
        drawLine(this.decisionLine1.startX,this.decisionLine1.startY,this.decisionLine1.endX,
            this.decisionLine1.endY,line_Width,"yellow",0,0,ctx2);
        drawLine(this.decisionLine2.startX,this.decisionLine2.startY,this.decisionLine2.endX,
            this.decisionLine2.endY,line_Width,"yellow",0,0,ctx2);
        drawLine(this.decisionLine3.startX,this.decisionLine3.startY,this.decisionLine3.endX,
            this.decisionLine3.endY,line_Width,"yellow",0,0,ctx2);
        if(this.type=="intersection"){
            drawLine(this.decisionLine4.startX,this.decisionLine4.startY,this.decisionLine4.endX,
                this.decisionLine4.endY,line_Width,"yellow",0,0,ctx2);
        }
    }

    createStopLinePointsForLanes(){
        
        for(let i in this.joinRoad){
            this.joinRoad[i].stopLinePoints=[]; //creating an array of stop line points for a particular join road for the intersection
            for(let j=1;j<=Math.ceil(this.joinRoad[i].lanes/2);j++){//each stoplinepoint object has position(x,y) and the lane no. it belongs to
                let stopLinePoint={position:getVectorGivenDirection_Magnitude(this.joinRoad[i].dir,this.stopLineDistanceFromCenter),
                    lane:this.joinRoad[i].lanes/2+j, state:null};
                
                    if(this.joinRoad[i].lanes>1){
                    stopLinePoint.position.x+=
                    getVectorGivenDirection_Magnitude(getAbsoluteDirectionFromRelativeDir("left",this.joinRoad[i].dir),
                    laneWidth*(stopLinePoint.lane-this.joinRoad[i].lanes/2)-laneWidth/2).x;
                    stopLinePoint.position.y+=
                    getVectorGivenDirection_Magnitude(getAbsoluteDirectionFromRelativeDir("left",this.joinRoad[i].dir),
                    laneWidth*(stopLinePoint.lane-this.joinRoad[i].lanes/2)-laneWidth/2).y;
                }
                
                stopLinePoint.position.x+=this.x;
                stopLinePoint.position.y+=this.y;
                this.joinRoad[i].stopLinePoints.push(stopLinePoint); //stop line point added to stopLinePoints array      
                drawCircularMarker(stopLinePoint.position.x,stopLinePoint.position.y);
            }
    
        }
    }

    createEntryLinePointsForLanes(){
        for(let i in this.joinRoad){
            this.joinRoad[i].entryLinePoints=[]; //creating an array of stop line points for a particular join road for the intersection
            for(let j=1;j<=Math.ceil(this.joinRoad[i].lanes/2);j++){//each entryLinepoint object has position(x,y) and the lane no. it belongs to
                let entryLinePoint={position:getVectorGivenDirection_Magnitude(this.joinRoad[i].dir,this.stopLineDistanceFromCenter),
                    lane:this.joinRoad[i].lanes/2+j, state:null};
                
                    if(this.joinRoad[i].lanes>1){
                        entryLinePoint.position.x+=
                    getVectorGivenDirection_Magnitude(getAbsoluteDirectionFromRelativeDir("right",this.joinRoad[i].dir),
                    laneWidth*(entryLinePoint.lane-this.joinRoad[i].lanes/2)-laneWidth/2).x;
                    entryLinePoint.position.y+=
                    getVectorGivenDirection_Magnitude(getAbsoluteDirectionFromRelativeDir("right",this.joinRoad[i].dir),
                    laneWidth*(entryLinePoint.lane-this.joinRoad[i].lanes/2)-laneWidth/2).y;
                }
                
                entryLinePoint.position.x+=this.x;
                entryLinePoint.position.y+=this.y;
                this.joinRoad[i].entryLinePoints.push(entryLinePoint); //stop line point added to entryLinePoints array      
                drawCircularMarker(entryLinePoint.position.x,entryLinePoint.position.y);
            }
    
        }
    }


    getStopLinePoint(roadID,lane){
        let stopLinePoint;
        for(let i in this.joinRoad){
            if(this.joinRoad[i].roadID==roadID){
                
               for (let j in this.joinRoad[i].stopLinePoints){
                    if(this.joinRoad[i].stopLinePoints[j].lane==lane){
                        stopLinePoint=this.joinRoad[i].stopLinePoints[j].position;
                        return stopLinePoint;
                    }
               }
            }
        }
    }

    getEntryLinePoint(roadID,lane){
        let entryLinePoint;
        for(let i in this.joinRoad){
            if(this.joinRoad[i].roadID==roadID){
                
               for (let j in this.joinRoad[i].stopLinePoints){
                    if(this.joinRoad[i].entryLinePoints[j].lane==lane){
                        entryLinePoint=this.joinRoad[i].stopLinePoints[j].position;
                        return entryLinePoint;
                    }
               }
            }
        }
    }

    //returns an array containing possible turns (ie. [left,straight..])
    /*possibleTurnsAtIntersection(vehicleDirection){
    let turnsAvailable=[];
    if(vehicleDirection==this.line1Dir||vehicleDirection==this.line2Dir||
        vehicleDirection==this.line3Dir||vehicleDirection==this.line4Dir){
        turnsAvailable.push("straight");
    }
    if(getLeftDirectionOf(vehicleDirection)==this.line1Dir||
    getLeftDirectionOf(vehicleDirection)==this.line2Dir||
    getLeftDirectionOf(vehicleDirection)==this.line3Dir||
    getLeftDirectionOf(vehicleDirection)==this.line4Dir){
        turnsAvailable.push("left");
    }
    if(getRightDirectionOf(vehicleDirection)==this.line1Dir||
    getRightDirectionOf(vehicleDirection)==this.line2Dir||
    getRightDirectionOf(vehicleDirection)==this.line3Dir||
    getRightDirectionOf(vehicleDirection)==this.line4Dir){
        turnsAvailable.push("right");
    }
    return turnsAvailable;
}
    
*/
}

class RoadBend extends RoadJoinsVertex{

    constructor(x,y,joinRoad,radius,bendCentroid){
            
        super(x,y);
        this.joinRoad=joinRoad;
        this.radius=radius;
        this.bendCentroid=bendCentroid;
    
    }
}

class Transition extends RoadJoinsVertex{

    constructor(x,y,joinRoad){
            
        super(x,y);
        this.joinRoad=joinRoad;
    }
}

class StraightConnection extends RoadJoinsVertex{

    constructor(x,y,joinRoad){
            
        super(x,y);
        this.joinRoad=joinRoad;
    }
}