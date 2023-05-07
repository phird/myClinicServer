import express, { response } from 'express'
import db from '../../config/index.js'


const router = express.Router()


// * Get All Disease from DB 
router.get('/', (req, res) => {
    const sqlSelect = "SELECT * FROM Disease"
    db.query(sqlSelect, (err, disease) => {
        if (err) {
            console.log(err)
            res.status(400).send(err)
        }
        return res.status(200).send(disease)
    })
})

// * Get data 
router.get('/data', (req, res) => {
    const {
        q,
        sort = 'DESC',
        sortColumn = 'diseaseID',
    } = req.query
    const sqlSelect = 'SELECT * FROM Disease d WHERE LOWER(d.name) LIKE LOWER(?) OR diseaseID LIKE ? ORDER BY ? ?'
    db.query(sqlSelect, [`%${q}%`, q, sortColumn, sort], (err, disease) => {
        if (err) {
            console.log(err)
            console.error(err)
        }
        return res.status(200).send(disease)
    })
})


// * Get specific Disease with their Symptom 
router.get('/disease/:id', (req, res) => {
    const id = req.params.id
    /*  const sqlSelect = "SELECT d.*, ds.name as sName, Disease_symptom.symptomID as sId FROM Disease d JOIN Disease_Symptom ds ON d.diseaseID = ds.diseaseID WHERE d.diseaseID = ?" */
    const sqlSelect = "SELECT d.name as diseaseName, ds.dsID, ds.name FROM Disease d JOIN Disease_Symptom ds ON d.diseaseID = ds.diseaseID WHERE d.diseaseID = ?"
    const sympList = []
    db.query(sqlSelect, id, (err, disease) => {
        if (err) {
            console.log(err)
            res.status(400).send(err)
        }
        if (disease) {
            disease?.forEach(symptom => {
                /* sympList.push(symptom.sName) */
                sympList.push({ id: symptom.dsID, name: symptom.name })
            });
            const name = disease[0].diseaseName
            const response = { name, sympList }
            return res.status(200).send(response)
        }
    })
})

router.delete('/disease/:id', (req, res) => {
    const id = req.params.id
    const sqlDeleteDisease = "DELETE FROM Disease WHERE diseaseID = ?";
    const sqlDeleteDiseaseSymptom = "DELETE FROM Disease_Symptom WHERE diseaseID = ?";
    const promises = [];

    promises.push(
        new Promise((resolve, reject) => {
            db.query(sqlDeleteDiseaseSymptom, [id], (err, result) => {
                if (err) {
                    console.log("error occurs in server side ")
                    console.log(err)
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        })
    );

    promises.push(
        new Promise((resolve, reject) => {
            db.query(sqlDeleteDisease, [id], (err, result) => {
                if (err) {
                    console.log("error occurs in server side ")
                    console.log(err)
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        })
    );

    Promise.all(promises)
        .then((results) => {
            return res.status(200).json({ success: 'delete successful' });
        })
        .catch((err) => {
            return res.status(400).json({ error: 'internal server error' });
        });

})

router.post('/symptom', (req, res) => {
    const {
        id,
        newDi
    } = req.body

    const sqlInsert = "INSERT INTO Disease_Symptom (diseaseID, name) VALUE (?,?)"
    for (const symptom of newDi) {
        db.query(sqlInsert, [id, symptom.name], (err, result) => {
            if (err) {
                console.log("error occur in Server Side")
                console.log(err)
                return res.status(400).json({ err: 'internal server error' })
            }

        })
    }
})

router.delete('/symptom', (req, res) => {
    const {
        id,
        delDi
    } = req.body
    console.log(req.params)
    console.log(req.body)
    console.log(req.query)

    const sqlDelete = " DELETE FROM Disease_Symptom WHERE diseaseID = ? && dsID = ?"

    if (!Array.isArray(delDi)) {
        console.log("delDi not an array")
        return res.status(400).json({ error: 'delDi must be an array' })
    }

    for (const symptom of delDi) {
        db.query(sqlDelete, [id, symptom.id], (err, result) => {
            if (err) {
                console.log("error occurs in server side ")
                console.log(err)
                return res.status(400).json({ error: 'internal server error' })
            }
        })
    }
})

router.post('/create-disease', async (req, res) => {
    const {
        sName,
        inputSymptoms,
    } = req.body
    const sqlPost = "INSERT INTO Disease (name) VALUE (?)"
    const symptomPost = "INSERT INTO Disease_Symptom (diseaseID, name) VALUE (?,?)"
    let diseaseID = null
    try {
        await db.query(sqlPost, [sName], (err, disease) => {
            console.log("here is disease retrieve")
            console.log(disease.insertId)
            const diseaseID = disease.insertId
            for (const symptom of inputSymptoms) {
                db.query(symptomPost, [diseaseID, symptom.name])
            }
        })
        //* Retrieve an ID of the newly created disease record 
        res.status(200).json({ success: true })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Internal Server Error ' })
    }
})



export default router