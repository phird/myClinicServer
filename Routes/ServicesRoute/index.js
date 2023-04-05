import express from 'express'
import db from '../../config/index.js'

const router = express.Router();


router.get('/', (req, res) => {
    const sqlSelect = "SELECT * FROM Service"
    db.query(sqlSelect, (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).json({ message: 'Internal Server Error ! ' });
        }
        res.status(200).send(result); 
    })
})

router.get('/list/getData', (req,res) => {
    console.log(req.query)
    const {
        q,
        sort = 'DESC',
        sortColumn = 'serviceID',
    } = req.query

    const sqlSelect = `SELECT * FROM Service WHERE LOWER(sname) LIKE (?) AND STATUS = 1 ORDER BY ${sortColumn} ${sort}`
    db.query(sqlSelect, [`%${q}%`], (err, services) => {
        if(err){
            console.error(err);
            return res.status(500).json({message: 'Internal Server Error !'});
        }
        return res.status(200).send({services});
    })
})

router.get('/list/getAllData', (req, res) => {
    const sqlSelect = "SELECT * FROM Service WHERE status = 1 "
    db.query(sqlSelect, (err, services) => {
        if (err) {
            console.error(err);
            res.status(500).json({ message: 'Internal Server Error ! ' });
        }
        res.status(200).send({services}); 
    })
})

router.get('/getService/:id', (req,res) => {
    const id = req.params.id
    const sqlSelect = `SELECT * FROM Service WHERE serviceID = ${id}`
    db.query(sqlSelect, (err, service) => {
        if(err){
            console.log("err occur in getService")
            console.error(err)
        }
        return res.status(200).send(service)
    })
})           

router.put('/updateService' , (req,res) => {
    const {
        serviceID,
        sname,
        sprice,
    } = req.body.params
    if(!serviceID || !sname || !sprice){
        return res.status(400).json({message: 'Invalid Query params'});
    }
    const sqlInsert = "UPDATE Service SET `sname` = ?, `sprice` = ? WHERE serviceID = ?"
    db.query(sqlInsert,[sname, sprice, serviceID], (err,result)=>{
        if(err){
            console.log("err occur in updateService")
            console.error(err)
        }
        return res.status(200).json({message: 'Uodate succesfull'})
    }) 
})



router.put('/delete/:id' , (req,res)=>{
    const serviceID = req.params.id
    const sqlDelete = `UPDATE Service SET status = 0 WHERE serviceID = ${serviceID}`
    
    db.query(sqlDelete, (err,result) => {
        if(err){
            console.log("some err occur while delete ! ");
            console.error(err)
        }
        return res.status(204).json({message: 'Service Delete Successful'})
    })
})

router.post('/addService', (req,res) => {
    const { sname, sprice } = req.body;
    if(!sname || !sprice) {
        return res.status(400).json({message: 'Invalod request body ! '})
    }
    const sqlInsert = "INSERT INTO Service(sname, sprice, status) VALUES (?,?,?)"
    const status = 1 ; /// 1 = avaiable 
    db.query(sqlInsert, [sname, sprice, status], (err, result) => {
        if(err){
            console.error(err)
            return res.status(500).json({message: 'Internal Server Error ! '});
        }
        return res.status(200).json({message: 'Added Successful !'});
    })
})


export default router;