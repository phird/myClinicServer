import express from 'express'
import db from '../../config/index.js'


const router = express.Router();

router.get('/allData', (req,res)=> {
    const sqlSelect = `SELECT staff.*, Role.name FROM Staff JOIN Role ON Staff.roleID = Role.roleID WHERE Staff.status = 1 `
    db.query(sqlSelect, (err, staff) => {
        if (err) {
            console.error(err)
            console.log("error occur in Staff js")
        }
        return res.status(200).send(staff)
    })
})

router.get('/allData/:id', (req, res) => {
    const currentUserID = req.params.id
    const sqlSelect = `SELECT staff.*, Role.name FROM Staff JOIN Role ON Staff.roleID = Role.roleID WHERE Staff.status = 1 AND Staff.staffID != ?`
    db.query(sqlSelect, [currentUserID], (err, staff) => {
        if (err) {
            console.error(err)
            console.log("error occur in Staff js")
        }
        return res.status(200).send(staff)
    })
})

router.get('/list/doctor', (req, res) => {
    const sqlSelect = "SELECT * FROM Staff WHERE Staff.status = 1"
    db.query(sqlSelect, (err, result) => {
        if (err) {
            console.log(err)
            return res.send(400).send({ message: 'Error Occur' });
        }
        return res.status(200).send(result)
    })
})


router.get('/list/data', (req, res) => {
    const {
        q,
        sort = 'DESC',
        sortColumn = 'staffID',
        except,
    } = req.query;
    if (!except) {
        console.log("error ")
        console.log(except)
    }
    const sqlSelect = `SELECT Staff.*, Role.name FROM Staff JOIN Role ON Staff.roleID = Role.roleID WHERE LOWER(fname)LIKE (?) AND Staff.status = 1 AND Staff.staffID != ? ORDER BY ${sortColumn} ${sort}`
    db.query(sqlSelect, [`%${q}%`, except], (err, staff) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ Error: "Internal Server error !" });
        }
        return res.status(200).send(staff)
    })
})

router.get('/getStaffData/:id', (req, res) => {
    console.log("getting staff data")
    const staffID = req.params.id
    const sqlSelect = `SELECT Staff.*, users.username, users.pstatus FROM Staff JOIN users ON Staff.staffID = users.staffID WHERE Staff.staffID = ?`
    db.query(sqlSelect, [staffID], (err, staff) => {
        delete staff.userID;
        delete staff.password;
        if (err) {
            console.error(err)
            return res.status(500).send({ message: 'An error occurred while fetching staff data' })
        }
        console.log(staff)
        return res.status(200).send(staff)
    })
})

router.put('/editStaffData/:id', (req, res) => {
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
    const sqlInsert = "UPDATE Staff  SET `fname`=?,`lname`=?,`phoneNo`=?,`dob`=?,`bloodtype`=?,`gender`=?,`address`=?,`district`=?,`subdistrict`=?,`province`=?,`postalCode`=?,`dateEdit`=? WHERE staffID =?"
    db.query(sqlInsert, [fname, lname, phoneNo, dob, bloodtype, pgender, paddress, district, subdistrict, province, postalCode, editDate, id], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: 'Internal server error' });
        }
        return res.status(200).json({ message: 'Staff edit Succesfully ' })
    })
})

router.get('/getEncounterStaff/:id', (req, res) => {
    const staffID = req.params.id;
    const sqlSelect = `SELECT Encounter.*, Patient.fname, Patient.lname FROM Encounter JOIN Patient ON Encounter.patientID = Patient.patientID WHERE staffID = ? AND eStatus = 0  ORDER BY Encounter.encounterID desc `
    db.query(sqlSelect, [staffID], (err, encounter) => {
        if (err) {
            console.log(err)
            console.error(err)
            return res.send({ message: 'there a error in getPatientStaff' })
        }
        return res.status(200).send(encounter)
    })
})

router.put('/updateRole/:id', (req, res) => {
    const staffID = req.params.id;
    const roleID = req.body.roleID;
    const sqlUpdate = 'UPDATE Staff SET roleID = ? WHERE staffID = ?'

    db.query(sqlUpdate, [parseInt(roleID), staffID], (err, result) => {
        if (err) {
            console.log(err)
            res.status(500).send(err)
        }
        res.status(200).send(result)
    })
})

router.get('/widget/:id', (req, res) => {
    const staffID = parseInt(req.params.id);
    const sqlSelect = "SELECT COUNT(*) AS EncounterCount, p.fname, p.lname FROM Encounter e JOIN Patient p ON e.patientID = p.patientID WHERE e.staffID = ? AND e.eStatus = 1 AND p.delStatus = 0 AND e.addedDate = (SELECT MAX(addedDate) FROM Encounter WHERE patientID = e.patientID AND eStatus = 1 AND staffID = ?) GROUP BY p.fname, p.lname";
    db.query(sqlSelect, [staffID, staffID], (err, widget) => {
        if (err) {
            console.log(err);
            res.status(500).send(err);
        }
        return res.status(200).send(widget);
    })

})

//* ADD Patient Section
router.post('/createStaff', (req, res) => {
    console.log("im tryna add staff")
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
        personalID,
        addedDate
    } = req.body
    const roleID = 2
    if (!personalID || !fname || !lname) {
        return res.status(400).json({ message: 'Invalid request body !' });
    }
    const delStatus = 1
    const sqlInsert = "INSERT INTO `Staff`(`roleID`,`fname`, `lname`, `phoneNo`, `dob`, `bloodtype`, `gender`, `address`, `district`, `subdistrict`, `province`, `postalCode`, `personalID`, `status`, `dateAdded`) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)"
    db.query(sqlInsert, [roleID, fname, lname, phoneNo, dob, bloodtype, pgender, paddress, district, subdistrict, province, postalCode, personalID, delStatus, addedDate], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: 'Internal server error' });
        }
        return res.status(200).json({ message: 'Staff added Succesfully ' })

    })
})

router.put('/deleteStaff/:id', (req,res) => {
    const staffID = req.params.id
    const sqlDelete = "UPDATE Staff SET status = 0 WHERE staffID = ? "
    const sqlOnUser = "UPDATE Users SET status = 0 WHERE staffID = ?"
    db.query(sqlDelete, [staffID], (err,result) => {
        if(err){
            console.log(err)
            res.status(400).send(err)
        }
        db.query(sqlOnUser, [staffID] , (err2, result2) => {
            if(err2) {
                console.log(err2)
            }
        })
        res.status(200).send({message : 'Delete Successful'})
    })
})




export default router