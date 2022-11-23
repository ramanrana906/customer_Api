// require('dotenv').config();
const express = require('express');
const app = express();
const port = 8000;
const bodyParser = require('body-parser');// For all the post Requests
const con = require('./config/connection');
const mysql2= require('mysql2');
const logger = require('morgan'); //morgan 
const fs = require('fs');// file system
const rfs = require('rotating-file-stream');
const path = require('path');
const { body, validationResult } = require('express-validator');



const logDirectory = path.join(__dirname, '/production_logs'); // creating a og directory
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);

const accessLogStream = rfs.createStream('access.log', {
    interval: '1d',
    path: logDirectory
});



app.use(bodyParser.urlencoded({extended:true})); // body parser for post requests

app.use(logger('dev', {stream: accessLogStream})) // using the morgan 


app.post('/add-customer',body('email').isEmail().normalizeEmail(),// validating the input from the user
body('number').isLength({
    min: 10
}),function(req,res){

const errors = validationResult(req);

        
 if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

       



   const { name, email, number, address } = req.body

      if(name && number && email && address == 0 ){
        return res.json(422, {
            message: "Invalid username or password"
        });
      }
    
            /// check if the customer exists or not 
        con.connect(function(error){
            if(error){
                console.log(error);
                return res.json(500, {
                    message: 'Error Connecting to the database'
                })
            }
            var search = "SELECT email FROM customer where email = ?";

            const search_query = mysql2.format(search,[email])
            con.query(search_query,function(error,result){
                if(error){
                    console.log(error);
                    return res.json(500, {
                        message: 'Error Searching for the result'
                    })
                }

                if (result.length != 0) {
                    
                
                    return res.json(409,{
                        message: '------> User already exists'
                    }) 
                   } 
                   else {

                    /// if not inserting the new customer into the database
                         var sql = "INSERT INTO customer(name,number,email,address) VAlUES('"+name+"','"+number+"','"+email+"','"+address+"')";
            con.query(sql,function(error,result){
                if(error){
                    console.log(error);
                    return res.json(500, {
                        message: 'Error inserting the data'
                    })
                }

                return res.json(201, {
                    message: 'Customer created successfully!'
                })
            })
                   }

            })

        })
})

// Running the server
app.listen(port,function(error){
    if(error){
        console.log("Error Connecting to the Server")
    }

    console.log(`Server is running on port :${port}`)

})
