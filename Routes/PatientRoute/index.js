import express from 'express';
import db from '../../config/index.js';


const router = express.Router();

router.get('/', (req, res) => {
    const sqlSelect = "SELECT * from Patient WHERE delStatus=0"
    db.query(sqlSelect, (err, result) => {
        console.log(res.status(200), result)
        res.status(200).send(result)
    })
});

router.get('/list/data', (req, res) => {
    const sqlSelect = "SELECT * FROM Patient WHERE delStatus = 0 ORDER BY patientID DESC"
    db.query(sqlSelect, (err, result) => {
        res.status(200).send(result)
    })
})

router.get('/list/getdata', (req, res) => {
    console.log(req.query)
    const {
        q,
        sort = 'DESC',
        sortColumn = 'patientID'
      } = req.query;
    const sqlSelect = `SELECT * FROM Patient WHERE LOWER(fname) LIKE LOWER(?) OR patientID LIKE ? ORDER BY ${sortColumn} ${sort}`;
    db.query(sqlSelect,[ `%${q}%`, q ] , (err, patient) => {
        if (err) {
            console.error(err)
            return res.status(500).json({ Error: "Internal server error" });
        }
        res.status(200).json({ patient });
    });
});

router.get('/list/getPatientEncounter', (req, res) => {
    
    const {
        selectedPatientID,
        sort = 'DESC',
        sortColumn = 'encounterID',
    } = req.query

    const sqlSelect = `SELECT Encounter.*, Patient.fname, Patient.lname, Invoice.invID FROM Encounter JOIN Patient JOIN Invoice ON Encounter.patientID = Patient.patientID AND Encounter.encounterID = Invoice.EncounterID WHERE Encounter.patientID = ? ORDER BY ${sortColumn} ${sort}`
    db.query(sqlSelect, selectedPatientID, (err, encounter) => {
        if (err) {
            throw err;
            console.log(err)
        }
        console.log(encounter)
        res.status(200).send({ encounter })
    })
})

router.get('/patients/patient/:id', (req, res) => {
    const id = req.params.id
    const sqlSelect = "SELECT * FROM Patient WHERE delStatus = 0 AND patientID=?"
    db.query(sqlSelect, id, (err, patient) => {
        if (err) throw err;
        if (patient.length === 0) {
            return res.status(404).json({ Error: 'Patient not found!' });
        }
        res.status(200).send({ patient })
    })
})

//* ADD Patient Section
router.post('/createPatient', (req, res) => {
    const { fname,
        lname,
        phoneNo,
        dob,
        bloodtype,
        pgender,
        paddress,
        district,
        subdistrict,
        province,
        postalCode,
        personalID,
        addedDate
    } = req.body
    if (!personalID || !fname || !lname) {
        return res.status(400).json({ message: 'Invalid request body !' });
    }
    const delStatus = 0
    const sqlInsert = "INSERT INTO `Patient`(`fname`, `lname`, `phoneNo`, `dob`, `bloodtype`, `gender`, `address`, `district`, `subdistrict`, `province`, `postalCode`, `personalID`, `delStatus`, `addedDate`) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)"
    db.query(sqlInsert, [fname, lname, phoneNo, dob, bloodtype, pgender, paddress, district, subdistrict, province, postalCode, personalID, delStatus, addedDate], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: 'Internal server error' });
        }
        return res.status(200).json({ message: 'Patient added Succesfully ' })

    })
})

// * Edit Patient 
router.put('/editPatient/:id', (req, res) => {
    const id = req.params.id
    const { 
        fname,
        lname,
        phoneNo,
        dob,
        bloodtype,
        pgender,
        paddress,
        district,
        subdistrict,
        province,
        postalCode,
        editDate
    } = req.body
    if (!personalID || !fname || !lname) {
        return res.status(400).json({ message: 'Invalid request body !' });
    }
    const sqlInsert = "UPDATE `Patient` SET `fname`=?,`lname`=?,`phoneNo`=?,`dob`=?,`bloodtype`=?,`gender`=?,`address`=?,`district`=?,`subdistrict`=?,`province`=?,`postalCode`=?,`personalID`=?,`editDate`=? WHERE Patient.patientID =?"
    db.query(sqlInsert, [fname, lname, phoneNo, dob, bloodtype, pgender, paddress, district, subdistrict, province, postalCode, personalID, editDate, id], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: 'Internal server error' });
        }
        return res.status(200).json({ message: 'Patient edit Succesfully ' })
    })
})


export default router