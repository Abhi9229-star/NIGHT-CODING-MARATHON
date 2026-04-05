//! create express server and check it's work or not
import express from "express"; // we are importing express module which we installed using npm i


// call/invoke the function
const app = express()

// assign a port number to our server
const port = 8000;


// app.listen(port,callback_function)
app.listen(port,()=>{
console.log(`server is running on port ${port}`);

})

