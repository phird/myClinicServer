import express from 'express';
import db from '../../config/index.js'
import bcrypt from 'bcrypt'
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken'
import bodyParser from 'body-parser';


dotenv.config();

const router = express.Router()
router.use(bodyParser.json());

const jwtSecret = process.env.JWT_SECRET;
const refreshTokenSecret = process.env.JWT_REFRESH_TOKEN_SECRET;
const expireTime = process.env.JWT_EXPIRE_TIME;
const refreshTokenExpireTime = process.env.JWT_REFRESH_TOKEN_EXPIRE_TIME;


router.post('/login', (req, res) => {
    console.log("im in login")
    const { username, password } = req.body
    let error = {
        username: ['Something went wrong ! ']
    }
    const sqlQuery = `SELECT Staff.fname, Staff.lname , users.*, Role.* FROM users JOIN Role JOIN Staff ON users.staffID = Staff.staffID AND Staff.roleID = Role.roleID WHERE username = '${username}' AND users.status = 1`
    db.query(sqlQuery, (err, result) => {
        if (err) {
            res.send({ err: err });
        }
        if (result.length > 0) {
            bcrypt.compare(password, result[0].password, (error, resp) => {
                console.log("here is resp")
                console.log(resp)
                if (resp) {
                    console.log("im in login process")
                    const id = result[0].userID
                    const accessToken = jwt.sign({ id }, jwtSecret, { expiresIn: expireTime });
                    const refreshToken = jwt.sign({ id }, refreshTokenSecret, {
                        expiresIn: refreshTokenExpireTime
                    })
                    const ability = [];
                    result.forEach(item => {
                        ability.push({ action: item.action, subject: item.subject });
                    });

                    const fullname = result[0].fname + ' ' + result[0].lname
                    const userData = { ...result[0], fullname, ability }
                    delete userData.id
                    delete userData.password
                    delete userData.fname
                    delete userData.lname
                    const response = {
                        userData,
                        accessToken,
                        refreshToken
                    }
                    console.log(response)
                    return res.status(200).send(response)
                    /* return [200, response] */
                }
            })
            /* if (result[0].password === password) {

            } */
        } else {
            console.log("not found user ! ")
            error = "Username or Password is Invalid";
        }
        /* return [400, { error }] */
    });
});

router.put('/updatePassword/:id', (req, res) => {
    const userID = req.params.id;
    const newPassword = req.body.password;
    const pstatus = 1
    const sqlUpdate = 'UPDATE users SET password = ?, pstatus = ? WHERE staffID = ?'
    bcrypt.genSalt(10, (err, salt) => {
        if (err) {
            console.log(err);
        }
        bcrypt.hash(newPassword, salt, (err, hash) => {
            db.query(sqlUpdate, [hash,pstatus, userID], (err, user) => {
                if (err) {
                    return res.status(500).send(err);
                }
                res.status(200).send(user)
            })
        })
    })
})

router.post('/createUser', (req, res) => {
    const staffID = req.body.staffID
    const status = 1;
    const sqlInsert = 'INSERT INTO users (staffID,status) VALUE (?,?)'
    db.query(sqlInsert, [staffID, status], (err, result) => {
        if (err) {
            console.error(err)
            console.log(err)
            return res.status(400).send({ message: 'Error in Server ! ' });
        }
        return res.status(200).send({ message: 'Create User Successful' });
    })
})

router.put('/setUsername', (req, res) => {
    const staffID = req.body.staffID
    const username = req.body.username

    const sqlInsert = 'UPDATE users SET username = ? WHERE staffID = ?'
    db.query(sqlInsert, [username, staffID], (err, result) => {
        if (err) {
            console.error(err)
            res.status(400).send(err)
        }
        res.status(200).send({message: 'set Username Successful'})
    })
})


router.put('/deleteUser/:id', (req,res) => {
    const staffID = req.params.id
    const sqlDelete = "UPDATE Staff SET status = 0 WHERE staffID = ? "

    db.query(sqlDelete, [staffID], (err,result) => {
        if(err){
            console.log(err)
            res.status(400).send(err)
        }
        res.status(200).send({message : 'Delete Successful'})
    })
})

export default router;