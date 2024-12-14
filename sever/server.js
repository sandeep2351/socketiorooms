const express=require('express');
const http=require('http');
const app=express();

const server=http.createServer(app)
const socket=require('socket.io')
const io=socket(server)

let users=[];

const messages={
    general:[],
    random:[],
    jokes:[],
    javascript:[],
};

io.on('connecton',(socket)=>{
    socket.on("join server",(username)=>{
        const user={
            username,
            id:socket.id,
        }
        users.push(user);
        io.emit("new user",users);
    });
    socket.on('joinroom',(roomname,cb)=>{
        socket.join(roomname);
        cb(messages[roomname]);
    })

    socket.on("sendmesage",({content,to,sender,chatname,isChannel})=>{
        if(isChannel){
            const playload={
                content,
                chatname,
                sender,
            }
            socket.to(to).emit("newmessage",playload)
        }else{
            const playload={
                content,
                chatname:sender,
                sender,
            }
            socket.to(to).emit("newmessage",playload)
        }
        if(messages[chatname]){
            messages[chatname].push({
                sender,content
            });
        }
    })

    socket.on("disconnect",()=>{
        users=users.filter(u=>u.id !== socket.id);
        io.emit("new user",users)
    })
})






server.listen(3000,()=>{
    console.log("server is running on 3000");
})