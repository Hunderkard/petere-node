// const socket = io('http://localhost:3000');

// /* ELEMENTOS DOM */
// let salida = document.getElementById('salida');
// let acciones = document.getElementById('acciones');
// let usuario = document.getElementById('usuario');
// let mensaje = document.getElementById('mensaje');
// let btn = document.getElementById('enviar');


// btn.addEventListener('click', () =>{
//     socket.emit('chat:mandar', 
//     {
//         user: usuario.value,
//         mensaje: mensaje.value
//     })
// })


// socket.on('chat:mandar',(data)=>{
//     salida.innerHTML += data.user + ': ' + data.mensaje + '<br>';
// })