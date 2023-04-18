import express from "express";
import db from '../../config/index.js'


const router = express.Router();

router.get('/', (req, res) => {
    const sqlSelect = "SELECT * FROM Encounter_patient"
    db.query(sqlSelect, (err, encounter) => {
        if (err) throw err
        if (encounter.length === 0) {
            return res.status(404).json({ Error: "encounter not found ! " })
        }
        res.status(200).send({ encounter })
    })
})

router.get('/img/:id', (req,res)=> {
    const patientID = req.params.id
    const sqlSelect = `SELECT * FROM Image_url WHERE patientID = ${patientID}`
    db.query(sqlSelect, (err, images) => {
        if(err){
            console.error(err)
            console.log("err in query")
        }
        return res.status(200).send(images)
    })
} )

router.post('/imgUrl', (req, res) => {
    console.log(req.body)
    const {
        encounterID,
        url,
    } = req.body;
    const sqlInsert = " INSERT INTO Image_url(encounterID, Url) VALUES (?,?)"
    db.query(sqlInsert, [encounterID, url], (err,result) => {
        if(err){
            console.error(err)
        }
        return res.status(200).json({message: 'Upload Successful !'});
    })
}) 

router.get('/forExport' ,(req,res)=> {
    const sqlSelect = "SELECT (Encounter.addedDate) as วันที่, (Patient.fname) as ชื่อ, (Patient.lname)as นามสกุล, (Patient.patientID) as รหัสผู้ป่วย, (Patient.phoneNO) as เบอร์โทรติด่อ   FROM Encounter JOIN Patient ON Encounter.patientID = Patient.patientID WHERE Encounter.eStatus = 1"
    db.query(sqlSelect, (err,result) => {
        if(err){
            console.log(err)
            console.error(err)
        }
        return res.status(200).send(result)
    })
})


router.get('/list/data', (req, res) => {
    //* ☢️ this not include in case of deleting a encounter 
    const sqlSelect = "SELECT * FROM Encounter"
    db.query(sqlSelect, (err, encounter) => {
        if (err) throw err
        if (encounter.length === 0) {
            return res.status(404).json({ Error: "Encounter not found ! " })
        }
        res.status(200).send({ encounter })
    })
})
router.get('/list/getdata', (req, res) => {  
    const {
        q,
        sort = 'DESC',
        sortColumn = 'encounterID'
    } = req.query;
    const sqlSelect = `SELECT Encounter.*, Patient.fname, Patient.lname, Patient.delStatus, Invoice.invID FROM Encounter JOIN Patient JOIN Invoice ON Encounter.patientID = Patient.patientID AND Encounter.encounterID = Invoice.encounterID WHERE LOWER(Patient.fname) LIKE LOWER(?) OR Encounter.encounterID LIKE ? ORDER BY ${sortColumn} ${sort}` 
    db.query(sqlSelect, [`%${q}%`, q], (err, encounters) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ Error: "Internal server error" });
        }
        console.log(encounters)
        return res.status(200).send({ encounters });
    });
})

router.get('/list/getdata/:id', (req, res) => {
    const id = req.params.id
    const sqlSelect = "SELECT Encounter_Patient.*, Patient.fname, Patient.lname FROM Encounter_Patient JOIN Patient ON  Encounter_Patient.patientID = Patient.patientID WHERE Encounter_Patient.patientID = ? "
    db.query(sqlSelect, id, (err, encounter) => {
        if (err) {
            throw err
            console.log(err)
        }
        if (encounter.length === 0) {
            return res.status(404).json({ Error: "Encounter not found !" })
        }
        res.status(200).send({ encounter })
    })
})

router.get('/widgetData/:id', (req,res) => {
    const id = req.params.id
    const sqlSelect = `SELECT * FROM Encounter JOIN ( SELECT MAX(addedDate) AS latest_encounter_date FROM Encounter WHERE patientID = ? AND eStatus = 0 ) AS latest_encounter ON Encounter.addedDate = latest_encounter.latest_encounter_date AND Encounter.patientID = ? AND Encounter.eStatus = 0`
    db.query(sqlSelect, [id, id],(err,encounter) => {
        if(err){
            console.log('Error in widgetData')
            console.error(err)
            return res.status(500).json({message: 'Internal Server Error! '})
        }
        return res.status(200).send(encounter)
    })
})


router.get('/encounters/encounter/:id', (req, res) => {
    const id = req.params.id
    const sqlSelect = "SELECT *  FROM Encounter  JOIN Patient  JOIN Invoice  JOIN Prescription ON  Encounter.patientID = Patient.patientID AND Encounter.encounterID = Invoice.encounterID AND Encounter.encounterID = Prescription.encounterID  WHERE Encounter.encounterID=? "
    db.query(sqlSelect, id, (err, encounter) => {
        if (err) throw err;
        
        res.status(200).send({ encounter })
    })
})

router.get('/latestID', (req, res) => {
    const sqlSelect = "SELECT max(encounterID) as id FROM Encounter"
    db.query(sqlSelect, (err, id) => {
        if (err) {
            console.log(err)
            return res.status(500).json({ message: 'internal server error !' });
        }
        return res.status(200).send(id)
    })
})

// * ADD Note Section
router.put('/addNote', (req, res) => {
    const {
        encounterID,
        doctorNote,
    } = req.body;

    if (!encounterID || !doctorNote) {
        return res.status(400).json({ message: 'Invalid request body' });
    }

    const sqlUpdate = "UPDATE `Encounter` SET `tnote` = ? WHERE Encounter.encounterID = ?";
    db.query(sqlUpdate, [doctorNote, encounterID], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
        return res.status(200).json({ message: 'Doctor note added successfully' });
    });
});


// OPTIMIZE
router.post('/createEncounter', (req, res) => {
    console.log("Creating Encounter ....")
    const { patientID, staffID, note, addedDate } = req.body;
    if (!patientID || !staffID || !addedDate) {
        return res.status(400).json({ message: 'Invalid request body!' });
    }
    const sqlInsert = "INSERT INTO Encounter( patientID, staffID, note, addedDate, eStatus) VALUES (?,?,?,?,?)";
    const eStatus = 1;
    db.query(sqlInsert, [patientID, staffID, note, addedDate, eStatus], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: 'Internal server error' });
        }
        return res.status(200).json({ message: 'Encounter added successfully.' });
    });
});

router.put('/handleSubmit/:id', (req, res) => {
    const encounterID = req.params.id
    if (!encounterID) {
        res.status(400).json({ message: 'invalid request body ! ' });
    }


    const eStatus = 0
    const sqlUpdate = `UPDATE Encounter SET eStatus = ${eStatus}  WHERE encounterID = ?`
    db.query(sqlUpdate, [encounterID], (err, result) => {
        if (err) {
            console.log(err)
            res.status(500).json({ message: 'Internal Server Error !' });
        }
        console.log("Encounter ChangeID")
        res.status(200).json({ message: 'Encounter Submitted ! ' });
    })
})




export default router;