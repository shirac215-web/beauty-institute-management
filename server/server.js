const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// ייבוא המודלים (נוודא שיצרת את הקבצים האלו בתיקיית models)
const Treatment = require('./models/Treatment');
const Appointment = require('./models/Appointment');
const Branches = require('./models/Branches');

const app = express();

// Middlewares - הגדרות בסיסיות
app.use(cors());
app.use(express.json());

// חיבור ל-MongoDB המקומי
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/beauty_salon_db')
    .then(() => console.log('✅ Connected to Beauty Salon DB'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

// --- נתיבים (Routes) עבור האתר ---
// דף בית לבדיקה שהשרת עובד
app.get('/', (req, res) => {
    res.send('Beauty Salon Server is Up!');
});

// 1. קבלת כל הטיפולים (גבות, מניקור וכו')
app.get('/api/treatments', async (req, res) => {
    console.log('get treatments');

    try {
        const treatments = await Treatment.find();
        res.json(treatments);
    } catch (err) {
        console.error('❌ Error fetching treatments:', err);
        res.status(500).json({ message: "שגיאה בשליפת הטיפולים" });
    }
    // Treatment.find()
    //     .then(treatments => {
    //         console.log(treatments);
            
    //         res.send(treatments)
    //     })
});

// 2. נתיב להוספת טיפול חדש (POST) - זה מה שהיה חסר לך!
app.post('/api/treatments', async (req, res) => {
    try {
        const newTreatment = new Treatment(req.body);
        await newTreatment.save();
        res.status(201).json(newTreatment);
    } catch (err) {
        console.error('❌ Error adding treatment:', err);
        res.status(400).json({ message: 'שגיאה בהוספת הטיפול' });
    }
});

// 3. נתיב לקביעת תור חדש (POST)
app.post('/api/appointments', async (req, res) => {
    try {
        const newAppointment = new Appointment(req.body);
        await newAppointment.save();
        res.status(201).json({ message: 'התור נקבע בהצלחה!' });
    } catch (err) {
        console.error('❌ Error creating appointment:', err);
        res.status(400).json({ message: 'שגיאה בקביעת התור' });
    }
});
//שליפת כל התורים
app.get('/api/appointments', async (req, res) => {
    try {
        const appointments = await Appointment.find();
        res.json(appointments);
    } catch (err) {
        console.error('❌ Error fetching appointments:', err);
        res.status(500).send("שגיאה בשליפת התורים");
    }
});
app.get('/api/branches', async (req, res) => {
    try {
        const branches = await Branches.find(); // שליפת כל הסניפים
        res.json(branches);
    } catch (err) {
        console.error('❌ Error fetching branches:', err);
        res.status(500).send("שגיאה בשליפת הסניפים");
    }
});
// מחיקת תור לפי ה-ID שלו
// app.delete('/api/appointments/:id', async (req, res) => {
//     try {
//         const id = req.params.id; // שליפת ה-ID מתוך הכתובת
//         const deletedAppointment = await Appointment.findByIdAndDelete(id);

//         if (!deletedAppointment) {
//             return res.status(404).send("התור לא נמצא");
//         }

//         res.json({ message: "התור נמחק בהצלחה", deletedAppointment });
//     } catch (err) {
//         console.error(err);
//         res.status(500).send("שגיאה במחיקת התור");
//     }
// });
app.post('/api/appointments/update-status', async (req, res) => {
    try {
        const { id, customerName, phone,isAvailable } = req.body; // מקבלים מה-Angular את ה-ID ופרטי הלקוח

        if (!id) {
            return res.status(400).send("חסר מזהה תור");
        }

        // עדכון המסמך: הופכים את isAvailable ל-false וממלאים פרטי לקוח
        const updatedAppointment = await Appointment.findByIdAndUpdate(
            id,
            { 
                isAvailable: isAvailable, 
                customerName: customerName, 
                phone: phone 
            },
            { new: true } // מחזיר את האובייקט המעודכן
        );

        if (!updatedAppointment) {
            return res.status(404).send("התור לא נמצא");
        }

        res.json({ message: "התור עודכן בהצלחה", updatedAppointment });
    } catch (err) {
        console.error(err);
        res.status(500).send("שגיאה בעדכון התור");
    }
});





// הפעלת השרת
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
