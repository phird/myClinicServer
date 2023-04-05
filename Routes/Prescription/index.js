import express from 'express';
import db from '../../config/index.js';

const router = express.Router();


router.get('/', (req, res) => {
    const sqlSelect = "SELECT * FROM Prescription WHERE delStatus = 1"
    db.query(sqlSelect, (err,result) => {
        res.status(200).send(result);
    })
});

router.get('/getPrescription/:id', (req, res) => {
    const encounterID = req.params.id
    console.log(encounterID)
    if(!encounterID){
        return res.status(400).json({message: 'Missing encounterID parameter'});
    }
    const sqlSelect = "SELECT * FROM Prescription JOIN Prescription_Drug JOIN Drug ON Prescription.prescriptionID = Prescription_Drug.prescriptionID AND Prescription_Drug.drugID = Drug.drugID WHERE Prescription.encounterID = ?"
    db.query(sqlSelect, [encounterID], (err,Prescription) => {
        if(err){ 
            console.log("error in getPrescription");
            console.log(err)
            throw err
        };
        console.log(Prescription)
        return res.status(200).send(Prescription)
    })
})

router.post('/addDrugList', (req,res)=> {
    const {
        prescriptionID,
        drugDetail
    } = req.body
    console.log("addDrugList ! :")
    console.log(prescriptionID);
    console.log(drugDetail)
    if(!prescriptionID || !drugDetail){
        return res.status(400).json({message: 'Invalid Request Body !'});
    }
    const sqlInsert = "INSERT INTO `Prescription_Drug`(`prescriptionID`, `drugID`, `quantity`, `note`) VALUES (?,?,?,?)"
    db.query(sqlInsert, [prescriptionID, drugDetail.drugID, drugDetail.quantity, drugDetail.note], (err, result) => {
        if(err){
            console.log("internal server error - prescriptonList");
            console.log(err)
        }
        console.log(result);
        res.status(200).json({message: "added successful ! "});
    })
})

router.post('/createPrescription', (req,res) => {
    const {
        encounterID,
        patientID,
        staffID,
        addedDate,
    } =req.body;
    if(!patientID || !staffID || !addedDate){
        return res.status(400).json({message: 'Invalid request body'});
    }
    const delStatus = 1 ;
    const sqlInsert = "INSERT INTO `Prescription`( `encounterID`,`patientID`, `staffID`, `addedDate`,  `delStatus`) VALUES (?,?,?,?,?)"
    db.query(sqlInsert, [encounterID,patientID,staffID,addedDate,delStatus], (err, result) => {
        if(err){
            console.log(err);
            return res.status(500).json({message: 'Internal Server Error'});
        }
        return res.status(200).json({message: 'Prescription create successfully ! '})
    })
})


export default router;