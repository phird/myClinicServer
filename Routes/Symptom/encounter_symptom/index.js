import express from 'express'
import db from '../../../config/index.js'

const router = express.Router();

router.get('/', (req, res) => {
    const sqlSelect = " SELECT * FROM Encounter_symptom"
    db.query(sqlSelect, (err, result) => {
        res.status(200).send(result);
    })
})

router.post('/addSymptom', (req, res) => {
    const {
        encounterID,
        symptom,
    } = req.body;

    if (!encounterID || !symptom) {
        return res.status(400).json({ message: 'Invalid request body' });
    }
    const sqlInsert = "INSERT INTO `Encounter_symptom`(`encounterID`, `name`) VALUES (?,?)";
    db.query(sqlInsert, [encounterID, symptom.name], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: 'Unable to add symptom to database' });
        }
        return res.status(200).json({ message: 'Symptom added successfully' });
    });
});

//* Get Patient Symptoms 
router.get('/getSymptoms', (req, res) => {
    const encounterID = req.query.encounterID;
    if (!encounterID) {
        return res.status(400).json({ message: 'Missing encounterID parameter' });
    }
    const sqlSelect = " SELECT name FROM Encounter_symptom WHERE encounterID = ? ";
    db.query(sqlSelect, [encounterID], (err, Symptoms) => {
        if(err) throw err;
        return res.status(200).send(Symptoms);
    })

})


export default router;