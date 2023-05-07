import express, { response } from "express"
import db from '../../config/index.js'


const router = express.Router();


// * for event calendar
router.get('/event', (req, res) => {
    const sqlSelect = "SELECT appointmentID as ID, patient_name as title, date as start, date as end FROM Appointment WHERE Appointment.deleteStatus = 1"
    db.query(sqlSelect, (err, result) => {
        const allday = false;
        if (err){
            console.log("error while getting appointmentAPI")
            console.error(err)
        } else {
            const response = result.map((appt) => {
                return {
                    ...appt,
                    allday
                };
            });
            return res.status(200).send(response)
        }

    })
})



// for get all of the data without condition
router.get('/', (req, res) => {
    const sqlSelect = "SELECT * FROM Appointment WHERE Appointment.deleteStatus != 0"

    db.query(sqlSelect, (err, result) => {
        if (err) {
            console.error(err);
        }
        return res.status(200).send(result)
    })
});

// get data with params query 
router.get('/appointment', (req, res) => {
    const {
        q = '',
        sort = 'desc',
        sortColumn = 'appointmentID',
        perPage = 10,
    } = req.query;

    console.log("params: ")
    console.log(req.query)

    const sqlSelect = `SELECT * FROM Appointment WHERE (LOWER(patient_name) LIKE LOWER(?) OR LOWER(patient_lastname) LIKE LOWER(?)) AND Appointment.deleteStatus != 0 ORDER BY ${sortColumn} ${sort} LIMIT ${parseInt(perPage)}`
    db.query(sqlSelect, [`%${q}%`,`%${q}%`], (err, result) => {
        if (err) {
            console.log("Error occurs in /appointment");
            console.error(err);
        }
        return res.status(200).send(result);
    }) 
})

// get data from specific appointment 
router.get('/appointment/:id', (req, res) => {
    const id = req.params.id;

    const sqlSelect = "SELECT * FROM Appointment a JOIN Appointment_Patient ap ON a.appointmentID = ap.appointmentID WHERE a.appointmentID = ?"

    db.query(sqlSelect, [id], (err, result) => {
        if (err) {
            console.log("err while get appointment Data ")
            console.error(err)
        }
        return res.status(200).send(result)
    })
})

// handle with Delete AppointmentData 
router.put('/appointment/:id', (req, res) => {
    const id = req.params.id;
    const sqlDelete = `UPDATE Appointment SET deleteStatus = 0 WHERE appointmentID = ?`

    db.query(sqlDelete, id, (err, result) => {
        if(err){
            console.log("err while delete")
            console.error(err)
        }
        return res.status(200).json({success: 'delete Successful ! '})
    })
})


// handle with create Appointment
router.post('/appointment', (req, res) => {
    const {
        patientID,
        fname,
        lname,
        doctorID,
        phoneNumber,
        note,
        date,
        addedDate,
        //* Data to create an appointment place here 
    } = req.body

    const formattedDate = new Date(date).toISOString().slice(0, 19).replace('T', ' ');
    const sqlPost = "INSERT INTO Appointment (staffID, patientID, patient_name, patient_lastname, contact, note, date, addedDate,editDate) VALUE (?,?,?,?,?,?,?,?)"

    db.query(sqlPost, [doctorID, patientID, fname, lname, phoneNumber, note, formattedDate,addedDate] , (err,result) => {
        if(err){
            console.log("Error in sql command")
            console.error(err)
        }
        return res.status(200).json({success : true})
    })
})


export default router;