class Cell{
    constructor(s){
      this.state=s;
      if(this.state==0)this.dead=true;
      else this.dead = false;
    }
    update(){
      
    }
  }
  export{Cell};