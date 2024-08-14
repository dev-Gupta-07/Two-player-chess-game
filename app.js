const express=require('express')
const socket=require('socket.io')
const path=require('path')
const http=require('http')
const {Chess}=require("chess.js")


const app=express();
const server=http.createServer(app)
const io=socket(server)
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
const chess= new Chess();
let players={};
let currentPlayer="w";

app.get('/',(req,res)=>{
    res.render("index",{title:"Chess game"})
})


io.on("connection",function(uniqsocket){
    console.log("connected")

    if(!players.white){
        players.white=uniqsocket.id;
        uniqsocket.emit("playerRole","w")
    }
    else if(!players.black){
        players.black=uniqsocket.id;
        uniqsocket.emit("playerRole","b")
    }else{
        uniqsocket.emit("spectatorRole")
    }


    uniqsocket.on("disconnect",function(){
        if(uniqsocket.id===players.white){
            delete players.white;
        }
        else if(uniqsocket.id===players.black){
            delete players.black;
        }
    })

    uniqsocket.on("move",function(move){
   

        try{
                 if (chess.turn() === "w" && uniqsocket.id !== players.white)return;
                 if (chess.turn() === "b" && uniqsocket.id !== players.black) return;
            const response=chess.move(move)
            if(response){
                currentPlayer=chess.turn();
                io.emit("move", move)
                io.emit("boardState",chess.fen())
            }else{
                console.log("Invalid move ",move)
                uniqsocket.emit("invalidMove",move);
            }

        }catch(err){
            console.log(err)
            uniqsocket.emit("invalidMove", move);
        }





    })
})
server.listen(3000,()=>{
    console.log(`Server listening at port 3000`)
})