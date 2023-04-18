import express from 'express'
import db from '../../config/index.js'


const router = express.Router()

router.get('/', (req,res) => {
    const sqlSelect = "SELECT * FROM clinic_info"
    db.query(sqlSelect, (err,clinic) => {
        if(err){
            console.log(err)
            res.status(400).send(err)
        }
        return res.status(200).send(clinic)
    })
})

router.post('/initial', (req,res) => {
    const {
        name,
        des,
        email,
        clinicOpen,
        clinicClose,
        address,
        phoneNumber,
    } = req.body

    const id = '1'

    const sqlInsert = "INSERT INTO clinic_info (id, name,address,phone_number,email,open,close,description) VALUES (?,?,?,?,?,?,?,?)"

    db.query(sqlInsert, [id, name, address, phoneNumber, email, clinicOpen, clinicClose, des], (err, result) => {
        if(err){
            console.log(err)
            console.error(err)
        }
        return res.status(200).send({message : 'clinic info is set ! '})
    })
})


router.put('/updateClinic', (req,res)=> {
    const {
        name,
        des,
        email,
        clinicOpen,
        clinicClose,
        address,
        phoneNumber,
    } = req.body

    console.log(req.body)
    const sqlUpdate = 'UPDATE clinic_info SET name = ?, address = ? , phone_number = ? , email = ? , open = TIME ? , close = TIME ?, description = ? WHERE id = 1 '
    db.query(sqlUpdate, [name, address, phoneNumber, email, clinicOpen, clinicClose, des], (err, result)=>{
        if(err){
            console.log(err)
            res.status(400).send(err)
        }
        return res.status(200).send(result)
    })
})


export default router