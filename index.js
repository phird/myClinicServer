import express from "express";
import cors from 'cors';
const app = express();
let port = process.env.PORT || 8000;

//import route 
import PatientRoute from './Routes/PatientRoute/index.js'
import EncounterRoute from './Routes/Encounter/index.js'
import EncounterSymptoms from './Routes/Symptom/encounter_symptom/index.js'
import DrugsRoute from './Routes/Drug/index.js'
import PrescriptionRoute from './Routes/Prescription/index.js'
import InvoiceRoute from './Routes/Invoice/index.js'
import ServiceRoute from './Routes/ServicesRoute/index.js'
import StaffRoute from './Routes/Staff/index.js'
import RoleRoute from './Routes/RoleRoute/index.js'
import JWTRoute from './Routes/Users/index.js'
import ClinicInfo from './Routes/Clinic_Info/index.js'
app.use(cors());
app.use(express.json());



// path use here eg. app.use("/company", companyRoute);
app.use("/app/Patient", PatientRoute);
app.use("/app/Encounter", EncounterRoute);
app.use("/encounterSymptom", EncounterSymptoms);
app.use("/drugs", DrugsRoute);
app.use("/prescriptions", PrescriptionRoute);
app.use("/invoice", InvoiceRoute);
app.use('/services', ServiceRoute);
app.use('/staff', StaffRoute);
app.use('/role', RoleRoute);
app.use('/jwt', JWTRoute);
app.use('/clinic', ClinicInfo);
app.listen(port, () => {
    console.log("Running in port", port);
})