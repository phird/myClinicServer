import express from 'express';
import db from '../../config/index.js'


const router = express.Router()


router.get('/', (req,res) => {
    const sqlSelect = 'SELECT * FROM Role'

    db.query(sqlSelect, (err,roleList) => {
        if(err){
            console.error(err)
            return res.status(400).send({message : 'invaide request'});
        }
        return res.status(200).send(roleList)
    })
})




export default router