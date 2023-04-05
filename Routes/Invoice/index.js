import express from 'express'
import db from '../../config/index.js'

const router = express.Router()

router.get('/', (req,res) => {
    const sqlSelect = "SELECT * FROM invoice WHERE Invoice.status = 1"
    db.query(sqlSelect, (err, result ) => {
        res.status(200).send(result);
    })
})

router.get('/getInvoice' , (req,res) => {  // ** Get list/data
    console.log(req.query)
    const {
        q,
        sort = 'DESC',
        sortColumn = 'invID',
    } = req.query 

    const sqlSelect = `SELECT Invoice.*, Patient.fname, Patient.lname FROM Invoice JOIN Patient ON Invoice.patientID = Patient.patientID WHERE Invoice.status = 1 AND LOWER(Patient.fname) LIKE LOWER(?) OR Invoice.encounterID LIKE ? ORDER BY ${sortColumn} ${sort}`
    db.query(sqlSelect,[ `%${q}%`, q ] , (err, Invoice) =>{
        if(err){
            console.log("err in getInvoice")
            console.error(err);
        }
        console.log(Invoice);
        return res.status(200).send(Invoice)
    })
})

router.put('/status/:id', (req,res)=> {
    const encounterID = req.params.id
    const sqlInsert = " UPDATE Invoice SET status = 1 WHERE encounterID = ?"
    db.query(sqlInsert, [encounterID], (err,result) => {
        if(err){
            console.log(err);
            console.error(err);
            return res.status(400).send({message: 'something went wrong while updating status'})
        }
        return res.status(400).send({message: 'Change statis successful'})
    })
})

router.get('/getInvoiceDetail/:id', (req,res)=>{
    const invID = req.params.id;
    if(!invID){
        return res.status(400).json({message: 'Invalid req id params'});
    }
    const sqlSelect = 'SELECT Invoice.*, Patient.fname, Patient.lname, Patient.phoneNo, Patient.address, Patient.district, Patient.subdistrict, Patient.province, Patient.postalCode FROM Invoice JOIN Patient ON Invoice.patientID = Patient.patientID WHERE Invoice.invID = ?'
    db.query(sqlSelect, invID, (err, invDetail)=>{
        if(err){
            console.log("error in getInvoiceDetail");
            console.log(err);
        }
        console.log(invDetail);
        return res.status(200).send(invDetail);

    })
})

router.get('/getInvoiceList/:id', (req,res) => {
    const invID = req.params.id;
    if(!invID){
        res.status(400).json({message: 'Invalid req id params'});
    }
    const sqlSelect = "SELECT * FROM Invoice_List WHERE invID = ?";
    db.query(sqlSelect, invID, (err,invList) => {
        if(err){
            console.log("error in getInvoiceList");
            console.log(err);
        }
        console.log(invList);
        return res.status(200).send(invList);
    })
})


router.get('/getInvoice/:id' , (req,res) => {
    const encounterID  = req.params.id
    if(!encounterID){
        return res.status(400).json({message: 'Missing encounterID parameter'})
    }
    const sqlSelect = "SELECT * FROM Invoice JOIN Invoice_List ON Invoice.invID = Invoice_List.invID WHERE Invoice.EncounterID = ? "
    db.query(sqlSelect, [encounterID], (err, Invoice) =>{
        if(err){
            console.log(err);
        }
        console.log(Invoice);
        return res.status(200).send(Invoice)
    })
})

router.get('/getInvoice/prescription/:id', (req, res) => {
    const invoiceID = req.params.id
    if(!invoiceID){
        return res.status(400).json({message: 'Missing patientID params'});
    }
    const sqlSelect = `SELECT Invoice.encounterID, Prescription.*, Drug.drugName, Drug.drugPrice, Drug.unit, Drug.drugID, Prescription_Drug.quantity  FROM Invoice JOIN Encounter JOIN Prescription JOIN Prescription_Drug JOIN Drug ON Invoice.encounterID = Encounter.encounterID AND Encounter.encounterID = Prescription.encounterID AND  Prescription.prescriptionID = Prescription_Drug.prescriptionID AND Prescription_Drug.drugID = Drug.drugID WHERE Invoice.invID = ${invoiceID}`
    db.query(sqlSelect, (err,drugsExpense) => {
        if(err){
            console.log("error in Query - Internal Server Error ")
            console.error(err)
        }
        return res.status(200).send(drugsExpense)
    })
})


router.post('/createInvoice' , (req,res) => {
    const {
        encounterID,
        patientID,
        addedDate
    } = req.body
    if(!encounterID || !patientID || !addedDate){
        return res.status(400).json({message: 'Invalid request body'});
    }
    const sqlInsert = "INSERT INTO `Invoice`(`encounterID`, `patientID`, `addedDate`) VALUES (?,?,?)"
    db.query(sqlInsert, [encounterID, patientID, addedDate], (err,result) => {
        if(err){
            console.log(err);
            return res.status(500).json({message: 'Internal Server Error ! '});
        }
        return res.status(200).json({message: 'Invoice Create Successfully ! '})
    })
})


router.post('/addInvoiceList', (req,res) => {
    const {
        invID,
        invoice
    } = req.body
    console.log("here invoice array")
    console.log(invoice)
    if(!invID || !invoice){
        return res.status(400).json({message: 'Invalid request body !'});
    }
    const sqlInsert = "INSERT INTO `Invoice_List`(`invID`, `expenseName`, `price`) VALUES (?,?,?)"
    db.query(sqlInsert, [invID, invoice.expenseName , invoice.price], (err, result)=> {
        if(err){
            console.log("error in addInvoiceList")
            console.log(err)
        }
        console.log(result)
        return res.status(200).json({message: 'added Succesfull !'});
    })
})


export default router;