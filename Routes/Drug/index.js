import express from "express"
import db from '../../config/index.js'

const router = express.Router();


router.get('/', (req, res) => {
    const sqlSelect = "SELECT * FROM Drug WHERE status = 1 "
    db.query(sqlSelect, (err, drugs) => {
        if (err) {
            console.error(err)
        }
        res.status(200).send(drugs);
    })
})

router.get('/list/getDrug', (req, res) => {
    const {
        q,
        sort = 'DESC',
        sortColumn = 'drugID',
    } = req.query
    const sqlSelect = `SELECT * FROM Drug WHERE LOWER(drugName) LIKE (?) AND status = 1 ORDER BY ${sortColumn} ${sort}`
    db.query(sqlSelect, [`%${q}%`], (err, drugs) => {
        if (err) {
            console.log("an error occur in list/getDrug")
            console.error(err)
        }
        return res.status(200).send(drugs);
    })
})

router.get('/getDrug/:id', (req,res)=>{
    const id = req.params.id
    const sqlSelect = `SELECT * FROM Drug WHERE drugID = ${id}`
    db.query(sqlSelect, (err,drug) => {
        if(err){
            console.error(err);
            console.log("error occur in getDrug/:id")
        }
        return res.status(200).send(drug)
    })
})

router.get('/list/allDrugs', (req, res) => {
    const sqlSelect = "SELECT * FROM Drug WHERE status = 1 "
    db.query(sqlSelect, (err, drugs) => {
        if (err) {
            throw err;
            console.error(err)
        }
        res.status(200).send(drugs)
    })
})

router.post('/add/drug', (req, res) => {
    console.log(req.params)
    const {
        drugName,
        drugPrice,
        unit,
        description,
    } = req.body
    if (!drugName || !unit) {
        return res.status(400).json({ message: 'Invalid request body ! ' })
    }
    const sqlInsert = " INSERT INTO Drug(drugName, unit, drugPrice,description) VALUE (?,?,?,?)"
    db.query(sqlInsert, [drugName, unit, drugPrice, description], (err, result) => {
        if (err) {
            console.error(err)
            return res.status(500).json({ message: 'Internal Server Error Can not add Drug ! ' })
        }
        return res.status(200).json({ message: 'drug added successful' })
    })
})

router.put('/edit/drug', (req, res) => {
    const {
        drugID,
        drugName,
        drugPrice,
        unit,
        description,
    } = req.body
    console.log(req.body)
    const sqlInsert = `UPDATE Drug SET drugName = '${drugName}' , unit= '${unit}', drugPrice = ${drugPrice},  description = '${description}'  WHERE Drug.drugID = ${drugID}`
    db.query(sqlInsert, (err, result) => {
        if (err) {
            console.error(err)
            console.log("err occur in /edit/drug")
        }
        console.log("edit with seccess")
        return res.status(200).json({ message: 'edit Success ! ' })
    })
})

router.put('/delete/drug/:id', (req,res)=> {
    const drugID = req.params.id
    console.log(drugID)
    const sqlDelete = `UPDATE Drug SET status= 0 WHERE drugID = ${drugID}`
    db.query(sqlDelete, (err,result)=> {
        if(err){
            console.error(err);
            console.log("err occur while deleting Drug")
        }
        return res.status(200).json({message: 'Delete completed ! '})
    })
})







export default router;