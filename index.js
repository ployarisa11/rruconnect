
const firebase = require("firebase/app")
require("firebase/firestore")

var cron = require('node-cron');
const express = require('express')
const app = express()


app.get('/', (req, res) => {
    res.json({ message: 'Ahoy!' })
  })

//firebase
var firebaseConfig = {
    apiKey: "AIzaSyA5KFIcemUtm1_i64TUyifV0WfKjbm9irk",
    authDomain: "rru-connect-epeevr.firebaseapp.com",
    databaseURL: "https://rru-connect-epeevr.firebaseio.com",
    projectId: "rru-connect-epeevr",
    storageBucket: "rru-connect-epeevr.appspot.com",
    messagingSenderId: "898597223567",
    appId: "1:898597223567:web:8cd2b5064e8edbaf20c4fa"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const db = firebase.firestore()

const LineNotify = require("./src/client");

const ACCESS_TOKEN = "GU1WHyUZz9MopIWb4Z7g1soJT7dkuVUMAO3Drjhvy4y";
const notify = new LineNotify(`${ACCESS_TOKEN}`);



//เอาชื่อมา
const line = require('@line/bot-sdk');

const client = new line.Client({
    channelAccessToken: 'UC877QAnBp4CE5A/3/LNgpLduTrTxEdqZRuF8ShT6p+PFg5A471cvw8buhkpTcRuRbRw3egWF+Y68p2k13FdY9OuYzONaFuYo2zWlDUiJMMHIKjtbqyENtxM1/X2xyjde+OkQyVnJy/6xKNXohqwdQdB04t89/1O/w1cDnyilFU='
});






let Noti = db.collection('Count');

cron.schedule('* * * * *', function () {
    Noti.get().then((snapshot) => {
        let pp = snapshot.docs[snapshot.docs.length - 1];
        let noti = pp.data().count;

        if (noti == 1) {
            client.getProfile('U6d5ea64790214c58808993455916422f')
                .then((profile) => {

                    notify.sendText("กรุณาติดต่อกลับผู้ใช้งาน " + profile.displayName  + "  ด้วยค่ะ");

                })
                .catch((err) => {
                    // error handling
                });

            Noti.doc('H0pK45spljceEu7DBwmP').update({
                count: 0
            });


        } else {
            console.log(pp.data().count);
        }

    });
    console.log('running a task every two minutes');
});


app.listen(9000, () => {
    console.log('Application is running on port 9000')
  })