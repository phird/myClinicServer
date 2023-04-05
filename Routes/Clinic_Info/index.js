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

router.post('/createClinic', (req,res) => {
    const data = req.body
    const sqlInsert = ''

    db.query(sqlInsert, [data], (err, result) => {
        if(err){
            console.log(err)
            res.status(400).send(err)
        }
        return res.status(200).send(result)
    })
})

router.put('/updateClinic', (req,res)=> {
    const sqlInsert = ''
    db.query(sqlInsert, [], (err, result)=>{
        if(err){
            console.log(err)
            res.status(400).send(err)
        }
        return res.status(200).send(result)
    })
})


export default router