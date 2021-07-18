// const { Console } = require('console');
// const { ENOLCK } = require('constants');
// const express = require('express');
// const ruta = require('path');
const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = 3000;


const OCUPADAS = [];        
const mesas_ayuda = [];     
// const plato_para = [];      
const PLATOS = [];
const PEDIDOS = [];
const BLOQUEADAS=[]; 

// app.use(express.static(ruta.join(__dirname, 'public')));

//fu INICIANDO SERVER
http.listen(port, () => {
    console.log(`Escuchando el puerto ${port}`);
});

//fu EVENTOS
io.on("connection", (socket) => {
    console.log('Nueva escucha de ' + socket.id);

//lu UNIRTE A CANAL ESPECÍFICO.
    socket.on('unirse', (canal) => {
        socket.join(canal, () => {
            console.log('Entraron a la sala ' + canal);
            if(canal == "Mesas_Cocina"){
                console.log("Te mando " + OCUPADAS);
                io.to(canal).emit('mesas', OCUPADAS);
                io.to(canal).emit("anotamos_pedido", PEDIDOS);
                // console.log(mensaje);
            }
            if(canal == "camareros"){
                io.to(canal).emit('ayuda!', mesas_ayuda);
                io.to(canal).emit("yendo", PLATOS);
            }
        })
    });

//lu CLIENTE A COCINA.
    socket.on('ocupan_mesa', (data) => {
        console.log('Ocupando la mesa ' + data);
        OCUPADAS[data] = true;
        // console.log(OCUPADAS);
        io.emit('mesas', OCUPADAS);

    });
 
//lu CLIENTE A COCINA. 
    socket.on('abandonan_mesa', function (data) {
        console.log("Abandonando la mesa " + data);
        OCUPADAS[data]=null;
        // console.log(OCUPADAS);
        io.emit('mesas', OCUPADAS);
    });

//ve CLIENTE A CAMAREROS.
    socket.on('ayuda_para', (mesa) => {
        console.log("Una mesa necesita ayuda " + mesa);
        if(mesas_ayuda.indexOf(mesa) == (-1)){
            console.log(mesas_ayuda.indexOf(mesa));
            mesas_ayuda.push(mesa);
        }
        io.emit('ayuda!', mesas_ayuda);
    });

//hi CAMAREROS A CAMAREROS.
    socket.on('ayudada', (mesa) => {
        console.log("Ya la ayude." + mesa);
        mesas_ayuda.splice(mesas_ayuda.indexOf(mesa), 1);
        io.emit('ayuda!', mesas_ayuda);
        
    });
    
//lu CLIENTE A COCINA.
    socket.on('mandan_pedido', (pedido) => {
        if(pedido[0] == 'limpiar'){
            let i = PEDIDOS.indexOf(PEDIDOS.find( (p) => p['mesa'] == pedido[1]));
            PEDIDOS.splice(i, 1);
            console.log(PEDIDOS);
        }
        else{
            index = PEDIDOS.indexOf(PEDIDOS.find( (peticiones) => peticiones.mesa == pedido.mesa))
            if(index >= 0){
                PEDIDOS[index] = pedido;
            }else{
                PEDIDOS.push(pedido);
            }
            console.log(index);
            console.log(PEDIDOS);
        }
        console.log("Refrescamos, ¿no?");
        io.emit("anotamos_pedido", PEDIDOS);
    });

//fu COCINA A CLIENTE.
    socket.on('bloquear_mesa', (mesa) => {
        console.log("Bloquearemos la mesa " + mesa);
        BLOQUEADAS[mesa] = true;
        io.emit('bloqueando', BLOQUEADAS);
    })
//fu COCINA A CLIENTE.
    socket.on('desbloquear_mesa', (mesa) => {
        console.log("Desbloquearemos la mesa " + mesa);
        BLOQUEADAS[mesa] = false;
        io.emit('bloqueando', BLOQUEADAS);
    })

//ps COCINA A CAMAREROS.
    socket.on('listo_pedido', (pedido) => {
        if(pedido != null){
                //ve Las siguietnes 3 líneas sirven para apagar/encender la campanita.
                var indice = PEDIDOS.indexOf(PEDIDOS.find( (x) => x["mesa"] == pedido[0]));
                var valorActual = PEDIDOS[indice][pedido[3]][1];
                PEDIDOS[indice][pedido[3]][1] = !valorActual;
                if(pedido[4]){
                    var posicion = PLATOS.lastIndexOf(PLATOS.find( (pl) => (pl[0] == pedido[0] && pl[1] == pedido[1])));
                    PLATOS.splice(posicion, 1);
                }else{
                    PLATOS.push(pedido);   
                }
                io.emit('plato!', PLATOS);
        }
        io.emit("anotamos_pedido", PEDIDOS);
    });

//hi CAMAREROS A CAMAREROS.
    socket.on('voy_a', (i, n) => {
        console.log("Estoy yendo a llevar el plato.");
        PLATOS[i][2] = n;
        console.log(PLATOS);
        io.emit("yendo", PLATOS);
    });

//hi CAMAREROS A CAMAREROS.
     socket.on('no_voy_a', (i) => {
         if(i != null){
            console.log('Dejaron de ir a llevar el plato.');
            PLATOS[i][2] = null;
        }
        io.emit("yendo", PLATOS);
    });

//hi CAMAREROS A CAMAREROS.
    socket.on('ya_fui', (i) =>  {
        console.log('Ya llevé el plato a la mesa.');
        PLATOS.splice(i, 1);
        socket.broadcast.emit("yendo", PLATOS);
    });

    
    //si PARA TODOS
    // io.emit('mesas', OCUPADAS);      //si LAS MESAS OCUPADAS, PARA LOS COCINEROS.
    //ps No funcionaba con navigateUrl. Io connection no se realizaba.
    io.emit('bloqueando', BLOQUEADAS);
    io.emit('anotamos_pedido', PEDIDOS);
    io.emit('ayuda!', mesas_ayuda);     //si LAS MESAS AYUDABLES, PARA LOS CAMAREROS.
    io.emit('plato!', PLATOS);          //si LOS PLATOS ESPERANDO A SER LLEVADOS.
    
})

 //ag sending to the client
 //el Mandando hacia el cliente.
 //hi socket.emit("hello", "can you hear me?", 1, 2, "abc");

 //ag sending to all clients except sender
 //el Mandando a todos los clientes excepto al enviador.
//hi  socket.broadcast.emit("broadcast", "hello friends!");

 //ag sending to all clients in "game" room except sender
 //el Mandando a todos los clientes en la sala "game" excepto al enviador.
//hi  socket.to("game").emit("nice game", "let's play a game");

 //ag sending to all clients in "game1" and/or in "game2" room, except sender
 //el Igual, pero en la sala "game1" y/o "game2".
//hi  socket.to("game1").to("game2").emit("nice game", "let's play a game (too)");

 //ag sending to all clients in "game" room, including sender
 //el Mandando a todos en la sala, incluido el enviador.
//hi  io.in("game").emit("big-announcement", "the game will start soon");

 //ag sending to all clients in namespace "myNamespace", including sender
 //el Mandando a todos en el espacio de nombres "myNamespace", enviador incluido.
 //hi io.of("myNamespace").emit("bigger-announcement", "the tournament will start soon");

 //ag sending to a specific room in a specific namespace, including sender
 //el Mandando a una sala específica del espacio de nombres, enviador incluido.
 //hi io.of("myNamespace").to("room").emit("event", "message");

 //ag sending to individual socketid (private message)
 //el Mandando un mensaje privado.
 //hi io.to(socketId).emit("hey", "I just met you");

 // WARNING: `socket.to(socket.id).emit()` will NOT work, as it will send to everyone in the room
 // named `socket.id` but the sender. Please use the classic `socket.emit()` instead.

 // sending with acknowledgement
 //hi socket.emit("question", "do you think so?", (answer) => {});

 // sending without compression
 //hi socket.compress(false).emit("uncompressed", "that's rough");

 // sending a message that might be dropped if the client is not ready to receive messages
 //hi socket.volatile.emit("maybe", "do you really need it?");

 // sending to all clients on this node (when using multiple nodes)
 //hi io.local.emit("hi", "my lovely babies");

 //ag sending to all connected clients
 //el Mandando a todos los clientes conectados.
 //hi io.emit("an event sent to all connected clients");