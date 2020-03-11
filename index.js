"use strict";

const functions = require("firebase-functions");
const { WebhookClient } = require("dialogflow-fulfillment");
const { Card, Suggestion, Payload } = require("dialogflow-fulfillment");
const LINE_MESSAGING_API = " https://notify-api.line.me/api/notify";
const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();
const https = require('https');
process.env.DEBUG = "dialogflow:debug"; // enables lib debugging statements




exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
 
    const agent = new WebhookClient({ request, response });
    const payload = {
        "type": "template",
        "altText": "this is a confirm template",
        "template": {
            "type": "confirm",
            "actions": [
                {
                    "type": "message",
                    "label": "ถูก",
                    "text": "ถูก"
                },
                {
                    "type": "message",
                    "label": "ไม่ถูก",
                    "text": "ไม่ถูก"
                }
            ],
            "text": "คุณได้รับคำตอบถูกต้องไหมคะ?"
        }
    };
    let date = new Date();

    //Count_Accuracy

    let Count_Intent = admin.firestore().collection("Count_Intent").doc(date.toLocaleDateString());



    //หมวดการลงทะเบียน
    //การเพิ่ม
    function Additional_Credit_Registration(agent) {
        let payload = {
            "type": "template",
            "altText": "this is a confirm template",
            "template": {
                "type": "confirm",
                "actions": [
                    {
                        "type": "message",
                        "label": "ถูก",
                        "text": "ได้รับคำตอบถูกต้องในเรื่องการเพิ่มรายวิชา"
                    },
                    {
                        "type": "message",
                        "label": "ไม่ถูก",
                        "text": "ได้รับคำตอบไม่ถูกต้องในเรื่องการเพิ่มรายวิชา"
                    }
                ],
                "text": "คุณได้รับคำตอบถูกต้องไหมคะ?"
            }
        };

        //ประกาศตัวแปร payload เพื่อแสดงออกหน้าจอ
        let payload่json = new Payload(`LINE`, payload, { sendAsMessage: true });
        let text = request.body.queryResult.queryText;
        let c = 'ได้รับคำตอบถูกต้องในเรื่องการเพิ่มรายวิชา';
        let b = 'ได้รับคำตอบไม่ถูกต้องในเรื่องการเพิ่มรายวิชา';

        //Count_Accuracy
        let Count_Accuracy = admin.firestore().collection("Count_Accuracy").doc(date.toLocaleDateString()).collection("การลงทะเบียน").doc("การเพิ่มรายวิชา");
        Count_Accuracy.get().then(function (docs) {
            if (!docs.exists) {
                Count_Accuracy.set({
                    ถูก: 0,
                    ไม่ถูก: 0
                });
            }

        });


        if (text === c) {
            agent.add("ขอบคุณค่ะ");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ถูก + 1;

                    t.update(Count_Accuracy, {
                        ถูก: newcount,

                    });
                });
            });



        }

        else if (text === b) {

            agent.add("กรุณากดปุ่มติดต่อเจ้าหน้าที่");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ไม่ถูก + 1;

                    t.update(Count_Accuracy, {
                        ไม่ถูก: newcount,

                    });
                });
            });

        }
        else {
            //เชคว่ามี ตัว doc อยู๋ไหม ถ้าไม่ ก็ set ค่า 
            // count_intent 
            Count_Intent.get().then(function (docs) {
                if (!docs.exists) {
                    Count_Intent.set({
                        การลงทะเบียน: 1
                    });
                }

                else {
                    //เลขcount เวลามีคนเข้ามาสอบถาม

                    let transaction = db.runTransaction(t => {
                        return t.get(Count_Intent).then(doc => {
                            if (doc.data().การลงทะเบียน > 0) {
                                let newcount = doc.data().การลงทะเบียน + 1;

                                t.update(Count_Intent, {
                                    การลงทะเบียน: newcount,

                                });
                            } else {
                                t.update(Count_Intent, {
                                    การลงทะเบียน: 1
                                });

                            }

                        });
                    });
                }
            });


            //return ข้อมูลคำตอบ 

            return admin.firestore().collection('Registration').doc('Topic').collection('การเพิ่มรายวิชา').orderBy("date", "desc").limit(1).get().then((snapshot) => {
                snapshot.forEach(doc => {
                    agent.add("การเพิ่มรายวิชา\n" + doc.data().description);
                    agent.add(payload่json); //แสดง paylaod
                    //agent.add(date.toLocaleDateString());

                });
            });

        }
    }


    //การถอน
    function Withdraw_credit_registration(agent) {
        //เลขcount เวลามีคนเข้ามาสอบถาม

        let payload = {
            "type": "template",
            "altText": "this is a confirm template",
            "template": {
                "type": "confirm",
                "actions": [
                    {
                        "type": "message",
                        "label": "ถูก",
                        "text": "ได้รับคำตอบถูกต้องในเรื่องการถอนรายวิชา"
                    },
                    {
                        "type": "message",
                        "label": "ไม่ถูก",
                        "text": "ได้รับคำตอบไม่ถูกต้องในเรื่องการถอนรายวิชา"
                    }
                ],
                "text": "คุณได้รับคำตอบถูกต้องไหมคะ?"
            }
        };
        //ประกาศตัวแปร payload เพื่อแสดงออกหน้าจอ
        let payload่json = new Payload(`LINE`, payload, { sendAsMessage: true });
        let text = request.body.queryResult.queryText;
        let c = 'ได้รับคำตอบถูกต้องในเรื่องการถอนรายวิชา';
        let b = 'ได้รับคำตอบไม่ถูกต้องในเรื่องการถอนรายวิชา';


        //Count_Accuracy
        let Count_Accuracy = admin.firestore().collection("Count_Accuracy").doc(date.toLocaleDateString()).collection("การลงทะเบียน").doc("การถอนรายวิชา");
        Count_Accuracy.get().then(function (docs) {
            if (!docs.exists) {
                Count_Accuracy.set({
                    ถูก: 0,
                    ไม่ถูก: 0
                });
            }

        });

        if (text === c) {
            agent.add("ขอบคุณค่ะ");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ถูก + 1;

                    t.update(Count_Accuracy, {
                        ถูก: newcount,

                    });
                });
            });



        }

        else if (text === b) {

            agent.add("กรุณากดปุ่มติดต่อเจ้าหน้าที่");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ไม่ถูก + 1;

                    t.update(Count_Accuracy, {
                        ไม่ถูก: newcount,

                    });
                });
            });

        }

        else {
            //เชคว่ามี ตัว doc อยู๋ไหม ถ้าไม่ ก็ set ค่า 
            // count_intent 
            Count_Intent.get().then(function (docs) {
                if (!docs.exists) {
                    Count_Intent.set({
                        การลงทะเบียน: 1
                    });
                }

                else {
                    //เลขcount เวลามีคนเข้ามาสอบถาม

                    let transaction = db.runTransaction(t => {
                        return t.get(Count_Intent).then(doc => {
                            if (doc.data().การลงทะเบียน > 0) {
                                let newcount = doc.data().การลงทะเบียน + 1;

                                t.update(Count_Intent, {
                                    การลงทะเบียน: newcount,

                                });
                            } else {
                                t.update(Count_Intent, {
                                    การลงทะเบียน: 1
                                });

                            }

                        });
                    });
                }
            });

            //return ข้อมูลคำตอบ 
            return admin.firestore().collection('Registration').doc('Topic').collection('การถอนรายวิชา').orderBy("date", "desc").limit(1).get().then((snapshot) => {
                snapshot.forEach(doc => {
                    agent.add("การถอนรายวิชา\n" + doc.data().description);
                    agent.add(payload่json); //แสดง paylaod

                });
            });

        }
    }


    //การยกเลิกรายวิชา
    function Course_termination(agent) {

        let payload = {
            "type": "template",
            "altText": "this is a confirm template",
            "template": {
                "type": "confirm",
                "actions": [
                    {
                        "type": "message",
                        "label": "ถูก",
                        "text": "ได้รับคำตอบถูกต้องในเรื่องการยกเลิกรายวิชา"
                    },
                    {
                        "type": "message",
                        "label": "ไม่ถูก",
                        "text": "ได้รับคำตอบไม่ถูกต้องในเรื่องการยกเลิกรายวิชา"
                    }
                ],
                "text": "คุณได้รับคำตอบถูกต้องไหมคะ?"
            }
        };

        //ประกาศตัวแปร payload เพื่อแสดงออกหน้าจอ
        let payload่json = new Payload(`LINE`, payload, { sendAsMessage: true });
        let text = request.body.queryResult.queryText;
        let c = 'ได้รับคำตอบถูกต้องในเรื่องการยกเลิกรายวิชา';
        let b = 'ได้รับคำตอบไม่ถูกต้องในเรื่องการยกเลิกรายวิชา';

        //Count_Accuracy
        let Count_Accuracy = admin.firestore().collection("Count_Accuracy").doc(date.toLocaleDateString()).collection("การลงทะเบียน").doc("การยกเลิกรายวิชา");
        Count_Accuracy.get().then(function (docs) {
            if (!docs.exists) {
                Count_Accuracy.set({
                    ถูก: 0,
                    ไม่ถูก: 0
                });
            }

        });

        if (text === c) {
            agent.add("ขอบคุณค่ะ");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ถูก + 1;

                    t.update(Count_Accuracy, {
                        ถูก: newcount,

                    });
                });
            });



        }

        else if (text === b) {

            agent.add("กรุณากดปุ่มติดต่อเจ้าหน้าที่");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ไม่ถูก + 1;

                    t.update(Count_Accuracy, {
                        ไม่ถูก: newcount,

                    });
                });
            });

        }
        else {



            //เชคว่ามี ตัว doc อยู๋ไหม ถ้าไม่ ก็ set ค่า 
            // count_intent 
            Count_Intent.get().then(function (docs) {
                if (!docs.exists) {
                    Count_Intent.set({
                        การลงทะเบียน: 1
                    });
                }

                else {
                    //เลขcount เวลามีคนเข้ามาสอบถาม

                    db.runTransaction(t => {
                        return t.get(Count_Intent).then(doc => {
                            if (doc.data().การลงทะเบียน > 0) {
                                let newcount = doc.data().การลงทะเบียน + 1;

                                t.update(Count_Intent, {
                                    การลงทะเบียน: newcount,

                                });
                            } else {
                                t.update(Count_Intent, {
                                    การลงทะเบียน: 1
                                });

                            }

                        });
                    });
                }
            });


            //return ข้อมูลคำตอบ 
            return admin.firestore().collection('Registration').doc('Topic').collection('การยกเลิกรายวิชา').orderBy("date", "desc").limit(1).get().then((snapshot) => {
                snapshot.forEach(doc => {
                    agent.add("การยกเลิกรายวิชา\n" + doc.data().description);
                    agent.add(payload่json); //แสดง paylaod

                });
            });

        }
    }






    //การลืมรหัสผ่าน
    function Forgot_Password(agent) {
        let payload = {
            "type": "template",
            "altText": "this is a confirm template",
            "template": {
                "type": "confirm",
                "actions": [
                    {
                        "type": "message",
                        "label": "ถูก",
                        "text": "ได้รับคำตอบถูกต้องในเรื่องการลืมรหัสผ่าน"
                    },
                    {
                        "type": "message",
                        "label": "ไม่ถูก",
                        "text": "ได้รับคำตอบไม่ถูกต้องในเรื่องการลืมรหัสผ่าน"
                    }
                ],
                "text": "คุณได้รับคำตอบถูกต้องไหมคะ?"
            }
        };


        //ประกาศตัวแปร payload เพื่อแสดงออกหน้าจอ
        let payload่json = new Payload(`LINE`, payload, { sendAsMessage: true });
        let text = request.body.queryResult.queryText;
        let c = 'ได้รับคำตอบถูกต้องในเรื่องการลืมรหัสผ่าน';
        let b = 'ได้รับคำตอบไม่ถูกต้องในเรื่องการลืมรหัสผ่าน';

        //Count_Accuracy
        let Count_Accuracy = admin.firestore().collection("Count_Accuracy").doc(date.toLocaleDateString()).collection("การลงทะเบียน").doc("การลืมรหัสผ่าน");
        Count_Accuracy.get().then(function (docs) {
            if (!docs.exists) {
                Count_Accuracy.set({
                    ถูก: 0,
                    ไม่ถูก: 0
                });
            }

        });

        if (text === c) {
            agent.add("ขอบคุณค่ะ");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ถูก + 1;

                    t.update(Count_Accuracy, {
                        ถูก: newcount,

                    });
                });
            });



        }

        else if (text === b) {

            agent.add("กรุณากดปุ่มติดต่อเจ้าหน้าที่");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ไม่ถูก + 1;

                    t.update(Count_Accuracy, {
                        ไม่ถูก: newcount,

                    });
                });
            });

        }

        else {
            //เชคว่ามี ตัว doc อยู๋ไหม ถ้าไม่ ก็ set ค่า 
            // count_intent 
            Count_Intent.get().then(function (docs) {
                if (!docs.exists) {
                    Count_Intent.set({
                        การลงทะเบียน: 1
                    });
                }

                else {
                    //เลขcount เวลามีคนเข้ามาสอบถาม

                    let transaction = db.runTransaction(t => {
                        return t.get(Count_Intent).then(doc => {
                            if (doc.data().การลงทะเบียน > 0) {
                                let newcount = doc.data().การลงทะเบียน + 1;

                                t.update(Count_Intent, {
                                    การลงทะเบียน: newcount,

                                });
                            } else {
                                t.update(Count_Intent, {
                                    การลงทะเบียน: 1
                                });

                            }

                        });
                    });
                }
            });


            //return ข้อมูลคำตอบ 
            return admin.firestore().collection('Registration').doc('Topic').collection('การลืมรหัสผ่าน').orderBy("date", "desc").limit(1).get().then((snapshot) => {
                snapshot.forEach(doc => {
                    agent.add("กรณีลืมรหัสผ่าน\n" + doc.data().description);
                    agent.add(payload่json); //แสดง paylaod

                });
            });
        }
    }



    //ลงทะเบียนเรียนไม่ได้
    function Unable_to_register(agent) {
        let payload = {
            "type": "template",
            "altText": "this is a confirm template",
            "template": {
                "type": "confirm",
                "actions": [
                    {
                        "type": "message",
                        "label": "ถูก",
                        "text": "ได้รับคำตอบถูกต้องในเรื่องการลงทะเบียนไม่ได้"
                    },
                    {
                        "type": "message",
                        "label": "ไม่ถูก",
                        "text": "ได้รับคำตอบไม่ถูกต้องในเรื่องการลงทะเบียนไม่ได้"
                    }
                ],
                "text": "คุณได้รับคำตอบถูกต้องไหมคะ?"
            }
        };

        //ประกาศตัวแปร payload เพื่อแสดงออกหน้าจอ
        let payload่json = new Payload(`LINE`, payload, { sendAsMessage: true });
        let text = request.body.queryResult.queryText;
        let c = 'ได้รับคำตอบถูกต้องในเรื่องการลงทะเบียนไม่ได้';
        let b = 'ได้รับคำตอบไม่ถูกต้องในเรื่องการลงทะเบียนไม่ได้';

        //Count_Accuracy
        let Count_Accuracy = admin.firestore().collection("Count_Accuracy").doc(date.toLocaleDateString()).collection("การลงทะเบียน").doc("การลงทะเบียนไม่ได้");
        Count_Accuracy.get().then(function (docs) {
            if (!docs.exists) {
                Count_Accuracy.set({
                    ถูก: 0,
                    ไม่ถูก: 0
                });
            }

        });

        if (text === c) {
            agent.add("ขอบคุณค่ะ");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ถูก + 1;

                    t.update(Count_Accuracy, {
                        ถูก: newcount,

                    });
                });
            });



        }

        else if (text === b) {

            agent.add("กรุณากดปุ่มติดต่อเจ้าหน้าที่");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ไม่ถูก + 1;

                    t.update(Count_Accuracy, {
                        ไม่ถูก: newcount,

                    });
                });
            });

        }
        else {

            //เชคว่ามี ตัว doc อยู๋ไหม ถ้าไม่ ก็ set ค่า 
            // count_intent 
            Count_Intent.get().then(function (docs) {
                if (!docs.exists) {
                    Count_Intent.set({
                        การลงทะเบียน: 1
                    });
                }

                else {
                    //เลขcount เวลามีคนเข้ามาสอบถาม

                    let transaction = db.runTransaction(t => {
                        return t.get(Count_Intent).then(doc => {
                            if (doc.data().การลงทะเบียน > 0) {
                                let newcount = doc.data().การลงทะเบียน + 1;

                                t.update(Count_Intent, {
                                    การลงทะเบียน: newcount,

                                });
                            } else {
                                t.update(Count_Intent, {
                                    การลงทะเบียน: 1
                                });

                            }

                        });
                    });
                }
            });


            //return ข้อมูลคำตอบ 
            return admin.firestore().collection('Registration').doc('Topic').collection('ลงทะเบียนไม่ได้').orderBy("date", "desc").limit(1).get().then((snapshot) => {
                snapshot.forEach(doc => {
                    agent.add("กรณีลงทะเบียนเรียนไม่ได้\n" + doc.data().description);
                    agent.add(payload่json); //แสดง paylaod

                });
            });
        }
    }


    //การขอเปิดรายวิชาเพิ่ม
    function To_Increase_the_new_crouse(agent) {

        let payload = {
            "type": "template",
            "altText": "this is a confirm template",
            "template": {
                "type": "confirm",
                "actions": [
                    {
                        "type": "message",
                        "label": "ถูก",
                        "text": "ได้รับคำตอบถูกต้องในเรื่องการขอเปิดรายวิชาเพิ่ม"
                    },
                    {
                        "type": "message",
                        "label": "ไม่ถูก",
                        "text": "ได้รับคำตอบไม่ถูกต้องในเรื่องการขอเปิดรายวิชาเพิ่ม"
                    }
                ],
                "text": "คุณได้รับคำตอบถูกต้องไหมคะ?"
            }
        };

        //ประกาศตัวแปร payload เพื่อแสดงออกหน้าจอ
        let payload่json = new Payload(`LINE`, payload, { sendAsMessage: true });
        let text = request.body.queryResult.queryText;
        let c = 'ได้รับคำตอบถูกต้องในเรื่องการขอเปิดรายวิชาเพิ่ม';
        let b = 'ได้รับคำตอบไม่ถูกต้องในเรื่องการขอเปิดรายวิชาเพิ่ม';

        //Count_Accuracy
        let Count_Accuracy = admin.firestore().collection("Count_Accuracy").doc(date.toLocaleDateString()).collection("การลงทะเบียน").doc("การขอเปิดรายวิชาเพิ่ม");
        Count_Accuracy.get().then(function (docs) {
            if (!docs.exists) {
                Count_Accuracy.set({
                    ถูก: 0,
                    ไม่ถูก: 0
                });
            }

        });


        if (text === c) {
            agent.add("ขอบคุณค่ะ");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ถูก + 1;

                    t.update(Count_Accuracy, {
                        ถูก: newcount,

                    });
                });
            });



        }

        else if (text === b) {

            agent.add("กรุณากดปุ่มติดต่อเจ้าหน้าที่");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ไม่ถูก + 1;

                    t.update(Count_Accuracy, {
                        ไม่ถูก: newcount,

                    });
                });
            });

        }
        else {

            //เชคว่ามี ตัว doc อยู๋ไหม ถ้าไม่ ก็ set ค่า 
            // count_intent 
            Count_Intent.get().then(function (docs) {
                if (!docs.exists) {
                    Count_Intent.set({
                        การลงทะเบียน: 1
                    });
                }

                else {
                    //เลขcount เวลามีคนเข้ามาสอบถาม

                    let transaction = db.runTransaction(t => {
                        return t.get(Count_Intent).then(doc => {
                            if (doc.data().การลงทะเบียน > 0) {
                                let newcount = doc.data().การลงทะเบียน + 1;

                                t.update(Count_Intent, {
                                    การลงทะเบียน: newcount,

                                });
                            } else {
                                t.update(Count_Intent, {
                                    การลงทะเบียน: 1
                                });

                            }

                        });
                    });
                }
            });

            //return ข้อมูลคำตอบ 
            return admin.firestore().collection('Registration').doc('Topic').collection('การขอเปิดรายวิชาเพิ่ม').orderBy("date", "desc").limit(1).get().then((snapshot) => {
                snapshot.forEach(doc => {
                    agent.add("กรณีขอเปิดรายวิชาเพิ่ม\n" + doc.data().description);
                    agent.add(payload่json); //แสดง paylaod

                });
            });
        }
    }

    //การลงทะเบียนซ้ำ
    function Duplicate_registrations(agent) {

        let payload = {
            "type": "template",
            "altText": "this is a confirm template",
            "template": {
                "type": "confirm",
                "actions": [
                    {
                        "type": "message",
                        "label": "ถูก",
                        "text": "ได้รับคำตอบถูกต้องในเรื่องการลงทะเบียนซ้ำ"
                    },
                    {
                        "type": "message",
                        "label": "ไม่ถูก",
                        "text": "ได้รับคำตอบไม่ถูกต้องในเรื่องการลงทะเบียนซ้ำ"
                    }
                ],
                "text": "คุณได้รับคำตอบถูกต้องไหมคะ?"
            }
        };

        //ประกาศตัวแปร payload เพื่อแสดงออกหน้าจอ
        let payload่json = new Payload(`LINE`, payload, { sendAsMessage: true });
        let text = request.body.queryResult.queryText;
        let c = 'ได้รับคำตอบถูกต้องในเรื่องการลงทะเบียนซ้ำ';
        let b = 'ได้รับคำตอบไม่ถูกต้องในเรื่องการลงทะเบียนซ้ำ';

        //Count_Accuracy
        let Count_Accuracy = admin.firestore().collection("Count_Accuracy").doc(date.toLocaleDateString()).collection("การลงทะเบียน").doc("การลงทะเบียนซ้ำ");
        Count_Accuracy.get().then(function (docs) {
            if (!docs.exists) {
                Count_Accuracy.set({
                    ถูก: 0,
                    ไม่ถูก: 0
                });
            }

        });


        if (text === c) {
            agent.add("ขอบคุณค่ะ");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ถูก + 1;

                    t.update(Count_Accuracy, {
                        ถูก: newcount,

                    });
                });
            });



        }

        else if (text === b) {

            agent.add("กรุณากดปุ่มติดต่อเจ้าหน้าที่");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ไม่ถูก + 1;

                    t.update(Count_Accuracy, {
                        ไม่ถูก: newcount,

                    });
                });
            });

        }

        else {
            //เชคว่ามี ตัว doc อยู๋ไหม ถ้าไม่ ก็ set ค่า 
            // count_intent 
            Count_Intent.get().then(function (docs) {
                if (!docs.exists) {
                    Count_Intent.set({
                        การลงทะเบียน: 1
                    });
                }

                else {
                    //เลขcount เวลามีคนเข้ามาสอบถาม

                    let transaction = db.runTransaction(t => {
                        return t.get(Count_Intent).then(doc => {
                            if (doc.data().การลงทะเบียน > 0) {
                                let newcount = doc.data().การลงทะเบียน + 1;

                                t.update(Count_Intent, {
                                    การลงทะเบียน: newcount,

                                });
                            } else {
                                t.update(Count_Intent, {
                                    การลงทะเบียน: 1
                                });

                            }

                        });
                    });
                }
            });


            //return ข้อมูลคำตอบ 
            return admin.firestore().collection('Registration').doc('Topic').collection('การลงทะเบียนซ้ำ').orderBy("date", "desc").limit(1).get().then((snapshot) => {
                snapshot.forEach(doc => {
                    agent.add("กรณีลงทะเบียนซ้ำ\n" + doc.data().description);
                    agent.add(payload่json); //แสดง paylaod

                });
            });
        }
    }





    //หน่วยกิตที่ต้องสะสม
    function Cumulative_credits(agent) {

        let payload = {
            "type": "template",
            "altText": "this is a confirm template",
            "template": {
                "type": "confirm",
                "actions": [
                    {
                        "type": "message",
                        "label": "ถูก",
                        "text": "ได้รับคำตอบถูกต้องในเรื่องหน่วยกิตที่ต้องสะสม"
                    },
                    {
                        "type": "message",
                        "label": "ไม่ถูก",
                        "text": "ได้รับคำตอบไม่ถูกต้องในเรื่องหน่วยกิตที่ต้องสะสม"
                    }
                ],
                "text": "คุณได้รับคำตอบถูกต้องไหมคะ?"
            }
        };

        //ประกาศตัวแปร payload เพื่อแสดงออกหน้าจอ
        let payload่json = new Payload(`LINE`, payload, { sendAsMessage: true });
        let text = request.body.queryResult.queryText;
        let c = 'ได้รับคำตอบถูกต้องในเรื่องหน่วยกิตที่ต้องสะสม';
        let b = 'ได้รับคำตอบไม่ถูกต้องในเรื่องหน่วยกิตที่ต้องสะสม';

        //Count_Accuracy
        let Count_Accuracy = admin.firestore().collection("Count_Accuracy").doc(date.toLocaleDateString()).collection("การลงทะเบียน").doc("หน่วยกิตที่ต้องสะสม");
        Count_Accuracy.get().then(function (docs) {
            if (!docs.exists) {
                Count_Accuracy.set({
                    ถูก: 0,
                    ไม่ถูก: 0
                });
            }

        });


        if (text === c) {
            agent.add("ขอบคุณค่ะ");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ถูก + 1;

                    t.update(Count_Accuracy, {
                        ถูก: newcount,

                    });
                });
            });



        }

        else if (text === b) {

            agent.add("กรุณากดปุ่มติดต่อเจ้าหน้าที่");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ไม่ถูก + 1;

                    t.update(Count_Accuracy, {
                        ไม่ถูก: newcount,

                    });
                });
            });

        }
        else {

            //เชคว่ามี ตัว doc อยู๋ไหม ถ้าไม่ ก็ set ค่า 
            // count_intent 
            Count_Intent.get().then(function (docs) {
                if (!docs.exists) {
                    Count_Intent.set({
                        การลงทะเบียน: 1
                    });
                }

                else {
                    //เลขcount เวลามีคนเข้ามาสอบถาม

                    let transaction = db.runTransaction(t => {
                        return t.get(Count_Intent).then(doc => {
                            if (doc.data().การลงทะเบียน > 0) {
                                let newcount = doc.data().การลงทะเบียน + 1;

                                t.update(Count_Intent, {
                                    การลงทะเบียน: newcount,

                                });
                            } else {
                                t.update(Count_Intent, {
                                    การลงทะเบียน: 1
                                });

                            }

                        });
                    });
                }
            });


            //return ข้อมูลคำตอบ 
            return admin.firestore().collection('Registration').doc('Topic').collection('หน่วยกิตที่ต้องสะสม').orderBy("date", "desc").limit(1).get().then((snapshot) => {
                snapshot.forEach(doc => {
                    agent.add("หน่วยกิตที่ต้องสะสม\n" + doc.data().description);
                    agent.add(payload่json); //แสดง paylaod

                });
            });
        }
    }


    //ระยะเวลาในการศึกษา 4 ปี
    function Year4_undergraduate_program(agent) {

        let payload = {
            "type": "template",
            "altText": "this is a confirm template",
            "template": {
                "type": "confirm",
                "actions": [
                    {
                        "type": "message",
                        "label": "ถูก",
                        "text": "ได้รับคำตอบถูกต้องในเรื่องระยะเวลาในการศึกษา 4 ปี"
                    },
                    {
                        "type": "message",
                        "label": "ไม่ถูก",
                        "text": "ได้รับคำตอบไม่ถูกต้องในเรื่องระยะเวลาในการศึกษา 4 ปี"
                    }
                ],
                "text": "คุณได้รับคำตอบถูกต้องไหมคะ?"
            }
        };

        //ประกาศตัวแปร payload เพื่อแสดงออกหน้าจอ
        let payload่json = new Payload(`LINE`, payload, { sendAsMessage: true });
        let text = request.body.queryResult.queryText;
        let c = 'ได้รับคำตอบถูกต้องในเรื่องระยะเวลาในการศึกษา 4 ปี';
        let b = 'ได้รับคำตอบไม่ถูกต้องในเรื่องระยะเวลาในการศึกษา 4 ปี';

        //Count_Accuracy
        let Count_Accuracy = admin.firestore().collection("Count_Accuracy").doc(date.toLocaleDateString()).collection("การลงทะเบียน").doc("ระยะเวลาในการศึกษา 4 ปี");
        Count_Accuracy.get().then(function (docs) {
            if (!docs.exists) {
                Count_Accuracy.set({
                    ถูก: 0,
                    ไม่ถูก: 0
                });
            }

        });


        if (text === c) {
            agent.add("ขอบคุณค่ะ");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ถูก + 1;

                    t.update(Count_Accuracy, {
                        ถูก: newcount,

                    });
                });
            });



        }

        else if (text === b) {

            agent.add("กรุณากดปุ่มติดต่อเจ้าหน้าที่");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ไม่ถูก + 1;

                    t.update(Count_Accuracy, {
                        ไม่ถูก: newcount,

                    });
                });
            });

        }
        else {
            //เชคว่ามี ตัว doc อยู๋ไหม ถ้าไม่ ก็ set ค่า 
            // count_intent 
            Count_Intent.get().then(function (docs) {
                if (!docs.exists) {
                    Count_Intent.set({
                        การลงทะเบียน: 1
                    });
                }

                else {
                    //เลขcount เวลามีคนเข้ามาสอบถาม

                    let transaction = db.runTransaction(t => {
                        return t.get(Count_Intent).then(doc => {
                            if (doc.data().การลงทะเบียน > 0) {
                                let newcount = doc.data().การลงทะเบียน + 1;

                                t.update(Count_Intent, {
                                    การลงทะเบียน: newcount,

                                });
                            } else {
                                t.update(Count_Intent, {
                                    การลงทะเบียน: 1
                                });

                            }

                        });
                    });
                }
            });


            //return ข้อมูลคำตอบ 
            return admin.firestore().collection('Registration').doc('Topic').collection('ระยะเวลาการศึกษาระดับปริญญาตรี').doc('ระยะเวลาการศึกษาระดับปริญญาตรี').collection('หลักสูตรปริญญาตรี 4 ปี').orderBy("date", "desc").limit(1).get().then((snapshot) => {
                snapshot.forEach(doc => {
                    agent.add("สำหรับระยะเวลาในการศึกษา 4 ปี\n" + doc.data().description);
                    agent.add(payload่json); //แสดง paylaod

                });
            });
        }
    }


    //ระยะเวลาในการศึกษา 5 ปี
    function Year5_undergraduate_program(agent) {

        let payload = {
            "type": "template",
            "altText": "this is a confirm template",
            "template": {
                "type": "confirm",
                "actions": [
                    {
                        "type": "message",
                        "label": "ถูก",
                        "text": "ได้รับคำตอบถูกต้องในเรื่องระยะเวลาในการศึกษา 5 ปี"
                    },
                    {
                        "type": "message",
                        "label": "ไม่ถูก",
                        "text": "ได้รับคำตอบไม่ถูกต้องในเรื่องระยะเวลาในการศึกษา 5 ปี"
                    }
                ],
                "text": "คุณได้รับคำตอบถูกต้องไหมคะ?"
            }
        };

        //ประกาศตัวแปร payload เพื่อแสดงออกหน้าจอ
        let payload่json = new Payload(`LINE`, payload, { sendAsMessage: true });
        let text = request.body.queryResult.queryText;
        let c = 'ได้รับคำตอบถูกต้องในเรื่องระยะเวลาในการศึกษา 5 ปี';
        let b = 'ได้รับคำตอบไม่ถูกต้องในเรื่องระยะเวลาในการศึกษา 5 ปี';

        //Count_Accuracy
        let Count_Accuracy = admin.firestore().collection("Count_Accuracy").doc(date.toLocaleDateString()).collection("การลงทะเบียน").doc("ระยะเวลาในการศึกษา 5 ปี");
        Count_Accuracy.get().then(function (docs) {
            if (!docs.exists) {
                Count_Accuracy.set({
                    ถูก: 0,
                    ไม่ถูก: 0
                });
            }

        });


        if (text === c) {
            agent.add("ขอบคุณค่ะ");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ถูก + 1;

                    t.update(Count_Accuracy, {
                        ถูก: newcount,

                    });
                });
            });



        }

        else if (text === b) {

            agent.add("กรุณากดปุ่มติดต่อเจ้าหน้าที่");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ไม่ถูก + 1;

                    t.update(Count_Accuracy, {
                        ไม่ถูก: newcount,

                    });
                });
            });

        }

        else {
            //เชคว่ามี ตัว doc อยู๋ไหม ถ้าไม่ ก็ set ค่า 
            // count_intent 
            Count_Intent.get().then(function (docs) {
                if (!docs.exists) {
                    Count_Intent.set({
                        การลงทะเบียน: 1
                    });
                }

                else {
                    //เลขcount เวลามีคนเข้ามาสอบถาม

                    let transaction = db.runTransaction(t => {
                        return t.get(Count_Intent).then(doc => {
                            if (doc.data().การลงทะเบียน > 0) {
                                let newcount = doc.data().การลงทะเบียน + 1;

                                t.update(Count_Intent, {
                                    การลงทะเบียน: newcount,

                                });
                            } else {
                                t.update(Count_Intent, {
                                    การลงทะเบียน: 1
                                });

                            }

                        });
                    });
                }
            });

            //return ข้อมูลคำตอบ 
            return admin.firestore().collection('Registration').doc('Topic').collection('ระยะเวลาการศึกษาระดับปริญญาตรี').doc('ระยะเวลาการศึกษาระดับปริญญาตรี').collection('หลักสูตรปริญญาตรี 5 ปี').orderBy("date", "desc").limit(1).get().then((snapshot) => {
                snapshot.forEach(doc => {
                    agent.add("สำหรับระยะเวลาในการศึกษา 5 ปี\n" + doc.data().description);
                    agent.add(payload่json); //แสดง paylaod

                });
            });
        }
    }



    //หลักสูตรปริญญาตรีต่อเนื่อง
    function Continuing_undergraduate_program(agent) {

        let payload = {
            "type": "template",
            "altText": "this is a confirm template",
            "template": {
                "type": "confirm",
                "actions": [
                    {
                        "type": "message",
                        "label": "ถูก",
                        "text": "ได้รับคำตอบถูกต้องในเรื่องหลักสูตรปริญญาตรีต่อเนื่อง"
                    },
                    {
                        "type": "message",
                        "label": "ไม่ถูก",
                        "text": "ได้รับคำตอบไม่ถูกต้องในเรื่องหลักสูตรปริญญาตรีต่อเนื่อง"
                    }
                ],
                "text": "คุณได้รับคำตอบถูกต้องไหมคะ?"
            }
        };

        //ประกาศตัวแปร payload เพื่อแสดงออกหน้าจอ
        let payload่json = new Payload(`LINE`, payload, { sendAsMessage: true });
        let text = request.body.queryResult.queryText;
        let c = 'ได้รับคำตอบถูกต้องในเรื่องหลักสูตรปริญญาตรีต่อเนื่อง';
        let b = 'ได้รับคำตอบไม่ถูกต้องในเรื่องหลักสูตรปริญญาตรีต่อเนื่อง';

        //Count_Accuracy
        let Count_Accuracy = admin.firestore().collection("Count_Accuracy").doc(date.toLocaleDateString()).collection("การลงทะเบียน").doc("หลักสูตรปริญญาตรีต่อเนื่อง");
        Count_Accuracy.get().then(function (docs) {
            if (!docs.exists) {
                Count_Accuracy.set({
                    ถูก: 0,
                    ไม่ถูก: 0
                });
            }

        });


        if (text === c) {
            agent.add("ขอบคุณค่ะ");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ถูก + 1;

                    t.update(Count_Accuracy, {
                        ถูก: newcount,

                    });
                });
            });



        }

        else if (text === b) {

            agent.add("กรุณากดปุ่มติดต่อเจ้าหน้าที่");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ไม่ถูก + 1;

                    t.update(Count_Accuracy, {
                        ไม่ถูก: newcount,

                    });
                });
            });

        }
        else {
            //เชคว่ามี ตัว doc อยู๋ไหม ถ้าไม่ ก็ set ค่า 
            // count_intent 
            Count_Intent.get().then(function (docs) {
                if (!docs.exists) {
                    Count_Intent.set({
                        การลงทะเบียน: 1
                    });
                }

                else {
                    //เลขcount เวลามีคนเข้ามาสอบถาม

                    let transaction = db.runTransaction(t => {
                        return t.get(Count_Intent).then(doc => {
                            if (doc.data().การลงทะเบียน > 0) {
                                let newcount = doc.data().การลงทะเบียน + 1;

                                t.update(Count_Intent, {
                                    การลงทะเบียน: newcount,

                                });
                            } else {
                                t.update(Count_Intent, {
                                    การลงทะเบียน: 1
                                });

                            }

                        });
                    });
                }
            });

            //return ข้อมูลคำตอบ 
            return admin.firestore().collection('Registration').doc('Topic').collection('ระยะเวลาการศึกษาระดับปริญญาตรี').doc('ระยะเวลาการศึกษาระดับปริญญาตรี').collection('หลักสูตรปริญญาต่อเนื่อง').orderBy("date", "desc").limit(1).get().then((snapshot) => {
                snapshot.forEach(doc => {
                    agent.add("สำหรับหลักสูตรปริญญาตรีต่อเนื่อง\n" + doc.data().description);
                    agent.add(payload่json); //แสดง paylaod
                });
            });
        }
    }


    //การลงทะเบียนเรียน
    function Enroll_in(agent) {

        let payload = {
            "type": "template",
            "altText": "this is a confirm template",
            "template": {
                "type": "confirm",
                "actions": [
                    {
                        "type": "message",
                        "label": "ถูก",
                        "text": "ได้รับคำตอบถูกต้องในเรื่องการลงทะเบียนเรียน"
                    },
                    {
                        "type": "message",
                        "label": "ไม่ถูก",
                        "text": "ได้รับคำตอบไม่ถูกต้องในเรื่องการลงทะเบียนเรียน"
                    }
                ],
                "text": "คุณได้รับคำตอบถูกต้องไหมคะ?"
            }
        };

        //ประกาศตัวแปร payload เพื่อแสดงออกหน้าจอ
        let payload่json = new Payload(`LINE`, payload, { sendAsMessage: true });
        let text = request.body.queryResult.queryText;
        let c = 'ได้รับคำตอบถูกต้องในเรื่องการลงทะเบียนเรียน';
        let b = 'ได้รับคำตอบไม่ถูกต้องในเรื่องการลงทะเบียนเรียน';

        //Count_Accuracy
        let Count_Accuracy = admin.firestore().collection("Count_Accuracy").doc(date.toLocaleDateString()).collection("การลงทะเบียน").doc("การลงทะเบียนเรียน");
        Count_Accuracy.get().then(function (docs) {
            if (!docs.exists) {
                Count_Accuracy.set({
                    ถูก: 0,
                    ไม่ถูก: 0
                });
            }

        });


        if (text === c) {
            agent.add("ขอบคุณค่ะ");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ถูก + 1;

                    t.update(Count_Accuracy, {
                        ถูก: newcount,

                    });
                });
            });



        }

        else if (text === b) {

            agent.add("กรุณากดปุ่มติดต่อเจ้าหน้าที่");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ไม่ถูก + 1;

                    t.update(Count_Accuracy, {
                        ไม่ถูก: newcount,

                    });
                });
            });

        }

        else {
            //เชคว่ามี ตัว doc อยู๋ไหม ถ้าไม่ ก็ set ค่า 
            // count_intent 
            Count_Intent.get().then(function (docs) {
                if (!docs.exists) {
                    Count_Intent.set({
                        การลงทะเบียน: 1
                    });
                }

                else {
                    //เลขcount เวลามีคนเข้ามาสอบถาม

                    let transaction = db.runTransaction(t => {
                        return t.get(Count_Intent).then(doc => {
                            if (doc.data().การลงทะเบียน > 0) {
                                let newcount = doc.data().การลงทะเบียน + 1;

                                t.update(Count_Intent, {
                                    การลงทะเบียน: newcount,

                                });
                            } else {
                                t.update(Count_Intent, {
                                    การลงทะเบียน: 1
                                });

                            }

                        });
                    });
                }
            });


            //return ข้อมูลคำตอบ 
            return admin.firestore().collection('Registration').doc('Topic').collection('การลงทะเบียนเรียน').orderBy("date", "desc").limit(1).get().then((snapshot) => {
                snapshot.forEach(doc => {
                    agent.add(doc.data().description);
                    agent.add(payload่json); //แสดง paylaod
                });
            });
        }
    }



    //การลา

    //ลากิจ
    function Private_leave(agent) {


        let payload = {
            "type": "template",
            "altText": "this is a confirm template",
            "template": {
                "type": "confirm",
                "actions": [
                    {
                        "type": "message",
                        "label": "ถูก",
                        "text": "ได้รับคำตอบถูกต้องในเรื่องการลากิจ"
                    },
                    {
                        "type": "message",
                        "label": "ไม่ถูก",
                        "text": "ได้รับคำตอบไม่ถูกต้องในเรื่องการลากิจ"
                    }
                ],
                "text": "คุณได้รับคำตอบถูกต้องไหมคะ?"
            }
        };

        //ประกาศตัวแปร payload เพื่อแสดงออกหน้าจอ
        let payload่json = new Payload(`LINE`, payload, { sendAsMessage: true });
        let text = request.body.queryResult.queryText;
        let c = 'ได้รับคำตอบถูกต้องในเรื่องการลากิจ';
        let b = 'ได้รับคำตอบไม่ถูกต้องในเรื่องการลากิจ';

        //Count_Accuracy
        let Count_Accuracy = admin.firestore().collection("Count_Accuracy").doc(date.toLocaleDateString()).collection("การลา").doc("การลากิจ");
        Count_Accuracy.get().then(function (docs) {
            if (!docs.exists) {
                Count_Accuracy.set({
                    ถูก: 0,
                    ไม่ถูก: 0
                });
            }

        });


        if (text === c) {
            agent.add("ขอบคุณค่ะ");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ถูก + 1;

                    t.update(Count_Accuracy, {
                        ถูก: newcount,

                    });
                });
            });



        }

        else if (text === b) {

            agent.add("กรุณากดปุ่มติดต่อเจ้าหน้าที่");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ไม่ถูก + 1;

                    t.update(Count_Accuracy, {
                        ไม่ถูก: newcount,

                    });
                });
            });

        }
        else {
            //เชคว่ามี ตัว doc อยู๋ไหม ถ้าไม่ ก็ set ค่า 
            // count_intent 
            Count_Intent.get().then(function (docs) {
                if (!docs.exists) {
                    Count_Intent.set({
                        การลา: 1
                    });
                }

                else {
                    //เลขcount เวลามีคนเข้ามาสอบถาม

                    let transaction = db.runTransaction(t => {
                        return t.get(Count_Intent).then(doc => {
                            if (doc.data().การลา > 0) {
                                let newcount = doc.data().การลา + 1;

                                t.update(Count_Intent, {
                                    การลา: newcount

                                });
                            } else {
                                t.update(Count_Intent, {
                                    การลา: 1
                                });

                            }

                        });
                    });
                }
            });

            //return ข้อมูลคำตอบ 
            return admin.firestore().collection('Leave').doc('Topic').collection('ลากิจ').orderBy("date", "desc").limit(1).get().then((snapshot) => {
                snapshot.forEach(doc => {
                    agent.add(doc.data().description);
                    agent.add(payload่json); //แสดง paylaod
                });
            });
        }

    }


    //ลาป่วย
    function Sick_Leave(agent) {

        let payload = {
            "type": "template",
            "altText": "this is a confirm template",
            "template": {
                "type": "confirm",
                "actions": [
                    {
                        "type": "message",
                        "label": "ถูก",
                        "text": "ได้รับคำตอบถูกต้องในเรื่องการลาป่วย"
                    },
                    {
                        "type": "message",
                        "label": "ไม่ถูก",
                        "text": "ได้รับคำตอบไม่ถูกต้องในเรื่องการลาป่วย"
                    }
                ],
                "text": "คุณได้รับคำตอบถูกต้องไหมคะ?"
            }
        };

        //ประกาศตัวแปร payload เพื่อแสดงออกหน้าจอ
        let payload่json = new Payload(`LINE`, payload, { sendAsMessage: true });
        let text = request.body.queryResult.queryText;
        let c = 'ได้รับคำตอบถูกต้องในเรื่องการลาป่วย';
        let b = 'ได้รับคำตอบไม่ถูกต้องในเรื่องการลาป่วย';

        //Count_Accuracy
        let Count_Accuracy = admin.firestore().collection("Count_Accuracy").doc(date.toLocaleDateString()).collection("การลา").doc("การลาป่วย");
        Count_Accuracy.get().then(function (docs) {
            if (!docs.exists) {
                Count_Accuracy.set({
                    ถูก: 0,
                    ไม่ถูก: 0
                });
            }

        });


        if (text === c) {
            agent.add("ขอบคุณค่ะ");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ถูก + 1;

                    t.update(Count_Accuracy, {
                        ถูก: newcount,

                    });
                });
            });



        }

        else if (text === b) {

            agent.add("กรุณากดปุ่มติดต่อเจ้าหน้าที่");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ไม่ถูก + 1;

                    t.update(Count_Accuracy, {
                        ไม่ถูก: newcount,

                    });
                });
            });

        }

        else {
            //เชคว่ามี ตัว doc อยู๋ไหม ถ้าไม่ ก็ set ค่า 
            // count_intent 
            Count_Intent.get().then(function (docs) {
                if (!docs.exists) {
                    Count_Intent.set({
                        การลา: 1
                    });
                }

                else {
                    //เลขcount เวลามีคนเข้ามาสอบถาม

                    let transaction = db.runTransaction(t => {
                        return t.get(Count_Intent).then(doc => {
                            if (doc.data().การลา > 0) {
                                let newcount = doc.data().การลา + 1;

                                t.update(Count_Intent, {
                                    การลา: newcount

                                });
                            } else {
                                t.update(Count_Intent, {
                                    การลา: 1
                                });

                            }

                        });
                    });
                }
            });

            //return ข้อมูลคำตอบ 
            return admin.firestore().collection('Leave').doc('Topic').collection('ลาป่วย').orderBy("date", "desc").limit(1).get().then((snapshot) => {
                snapshot.forEach(doc => {
                    agent.add(doc.data().description);
                    agent.add(payload่json); //แสดง paylaod
                });
            });
        }

    }


    //บัตรนักศึกษา
    //บัตรหายหรือชำรุด

    function Lost_or_Breakdown(agent) {
        let payload = {
            "type": "template",
            "altText": "this is a confirm template",
            "template": {
                "type": "confirm",
                "actions": [
                    {
                        "type": "message",
                        "label": "ถูก",
                        "text": "ได้รับคำตอบถูกต้องในเรื่องบัตรหายหรือชำรุด"
                    },
                    {
                        "type": "message",
                        "label": "ไม่ถูก",
                        "text": "ได้รับคำตอบไม่ถูกต้องในเรื่องบัตรหายหรือชำรุด"
                    }
                ],
                "text": "คุณได้รับคำตอบถูกต้องไหมคะ?"
            }
        };

        //ประกาศตัวแปร payload เพื่อแสดงออกหน้าจอ
        let payload่json = new Payload(`LINE`, payload, { sendAsMessage: true });
        let text = request.body.queryResult.queryText;
        let c = 'ได้รับคำตอบถูกต้องในเรื่องบัตรหายหรือชำรุด';
        let b = 'ได้รับคำตอบไม่ถูกต้องในเรื่องบัตรหายหรือชำรุด';

        //Count_Accuracy
        let Count_Accuracy = admin.firestore().collection("Count_Accuracy").doc(date.toLocaleDateString()).collection("บัตรนักศึกษา").doc("บัตรหายหรือชำรุด");
        Count_Accuracy.get().then(function (docs) {
            if (!docs.exists) {
                Count_Accuracy.set({
                    ถูก: 0,
                    ไม่ถูก: 0
                });
            }

        });


        if (text === c) {
            agent.add("ขอบคุณค่ะ");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ถูก + 1;

                    t.update(Count_Accuracy, {
                        ถูก: newcount,

                    });
                });
            });



        }

        else if (text === b) {

            agent.add("กรุณากดปุ่มติดต่อเจ้าหน้าที่");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ไม่ถูก + 1;

                    t.update(Count_Accuracy, {
                        ไม่ถูก: newcount,

                    });
                });
            });

        }

        else {
            //เชคว่ามี ตัว doc อยู๋ไหม ถ้าไม่ ก็ set ค่า 
            // count_intent 
            Count_Intent.get().then(function (docs) {
                if (!docs.exists) {
                    Count_Intent.set({
                        บัตรนักศึกษา: 1
                    });
                }

                else {
                    //เลขcount เวลามีคนเข้ามาสอบถาม

                    db.runTransaction(t => {
                        return t.get(Count_Intent).then(doc => {
                            if (doc.data().บัตรนักศึกษา > 0) {
                                let newcount = doc.data().บัตรนักศึกษา + 1;

                                t.update(Count_Intent, {
                                    บัตรนักศึกษา: newcount

                                });
                            } else {
                                t.update(Count_Intent, {
                                    บัตรนักศึกษา: 1
                                });

                            }

                        });
                    });
                }
            });

            //return ข้อมูลคำตอบ 
            return admin.firestore().collection('Student_Card').doc('Topic').collection('บัตรหายหรือชำรุด').orderBy("date", "desc").limit(1).get().then((snapshot) => {
                snapshot.forEach(doc => {
                    agent.add(doc.data().description);
                    agent.add(payload่json); //แสดง paylaod
                });
            });
        }

    }


    //เปลี่ยนแปลงข้อมูลในบัตร

    function Change_Information(agent) {
        let payload = {
            "type": "template",
            "altText": "this is a confirm template",
            "template": {
                "type": "confirm",
                "actions": [
                    {
                        "type": "message",
                        "label": "ถูก",
                        "text": "ได้รับคำตอบถูกต้องในเรื่องการเปลี่ยนแปลงข้อมูลในบัตร"
                    },
                    {
                        "type": "message",
                        "label": "ไม่ถูก",
                        "text": "ได้รับคำตอบไม่ถูกต้องในเรื่องการเปลี่ยนแปลงข้อมูลในบัตร"
                    }
                ],
                "text": "คุณได้รับคำตอบถูกต้องไหมคะ?"
            }
        };

        //ประกาศตัวแปร payload เพื่อแสดงออกหน้าจอ
        let payload่json = new Payload(`LINE`, payload, { sendAsMessage: true });
        let text = request.body.queryResult.queryText;
        let c = 'ได้รับคำตอบถูกต้องในเรื่องการเปลี่ยนแปลงข้อมูลในบัตร';
        let b = 'ได้รับคำตอบไม่ถูกต้องในเรื่องการเปลี่ยนแปลงข้อมูลในบัตร';

        //Count_Accuracy
        let Count_Accuracy = admin.firestore().collection("Count_Accuracy").doc(date.toLocaleDateString()).collection("บัตรนักศึกษา").doc("การเปลี่ยนแปลงข้อมูลในบัตร");
        Count_Accuracy.get().then(function (docs) {
            if (!docs.exists) {
                Count_Accuracy.set({
                    ถูก: 0,
                    ไม่ถูก: 0
                });
            }

        });


        if (text === c) {
            agent.add("ขอบคุณค่ะ");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ถูก + 1;

                    t.update(Count_Accuracy, {
                        ถูก: newcount,

                    });
                });
            });



        }

        else if (text === b) {

            agent.add("กรุณากดปุ่มติดต่อเจ้าหน้าที่");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ไม่ถูก + 1;

                    t.update(Count_Accuracy, {
                        ไม่ถูก: newcount,

                    });
                });
            });

        }

        else {
            //เชคว่ามี ตัว doc อยู๋ไหม ถ้าไม่ ก็ set ค่า 
            // count_intent 
            Count_Intent.get().then(function (docs) {
                if (!docs.exists) {
                    Count_Intent.set({
                        บัตรนักศึกษา: 1
                    });
                }

                else {
                    //เลขcount เวลามีคนเข้ามาสอบถาม

                    db.runTransaction(t => {
                        return t.get(Count_Intent).then(doc => {
                            if (doc.data().บัตรนักศึกษา > 0) {
                                let newcount = doc.data().บัตรนักศึกษา + 1;

                                t.update(Count_Intent, {
                                    บัตรนักศึกษา: newcount

                                });
                            } else {
                                t.update(Count_Intent, {
                                    บัตรนักศึกษา: 1
                                });

                            }

                        });
                    });
                }
            });

            //return ข้อมูลคำตอบ 
            return admin.firestore().collection('Student_Card').doc('Topic').collection('เปลี่ยนแปลงข้อมูลในบัตร').orderBy("date", "desc").limit(1).get().then((snapshot) => {
                snapshot.forEach(doc => {
                    agent.add(doc.data().description);
                    agent.add(payload่json); //แสดง paylaod
                });
            });
        }

    }


    //การสำเร็จการศึกษา
    //เกรดเฉลี่ยสะสม
    function GPA(agent) {
        let payload = {
            "type": "template",
            "altText": "this is a confirm template",
            "template": {
                "type": "confirm",
                "actions": [
                    {
                        "type": "message",
                        "label": "ถูก",
                        "text": "ได้รับคำตอบถูกต้องในเรื่องเกรดเฉลี่ยสะสม"
                    },
                    {
                        "type": "message",
                        "label": "ไม่ถูก",
                        "text": "ได้รับคำตอบไม่ถูกต้องในเรื่องเกรดเฉลี่ยสะสม"
                    }
                ],
                "text": "คุณได้รับคำตอบถูกต้องไหมคะ?"
            }
        };

        //ประกาศตัวแปร payload เพื่อแสดงออกหน้าจอ
        let payload่json = new Payload(`LINE`, payload, { sendAsMessage: true });
        let text = request.body.queryResult.queryText;
        let c = 'ได้รับคำตอบถูกต้องในเรื่องเกรดเฉลี่ยสะสม';
        let b = 'ได้รับคำตอบไม่ถูกต้องในเรื่องเกรดเฉลี่ยสะสม';

        //Count_Accuracy
        let Count_Accuracy = admin.firestore().collection("Count_Accuracy").doc(date.toLocaleDateString()).collection("การสำเร็จการศึกษา").doc("เกรดเฉลี่ยสะสม");
        Count_Accuracy.get().then(function (docs) {
            if (!docs.exists) {
                Count_Accuracy.set({
                    ถูก: 0,
                    ไม่ถูก: 0
                });
            }

        });


        if (text === c) {
            agent.add("ขอบคุณค่ะ");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ถูก + 1;

                    t.update(Count_Accuracy, {
                        ถูก: newcount,

                    });
                });
            });



        }

        else if (text === b) {

            agent.add("กรุณากดปุ่มติดต่อเจ้าหน้าที่");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ไม่ถูก + 1;

                    t.update(Count_Accuracy, {
                        ไม่ถูก: newcount,

                    });
                });
            });

        }

        else {
            //เชคว่ามี ตัว doc อยู๋ไหม ถ้าไม่ ก็ set ค่า 
            // count_intent 
            Count_Intent.get().then(function (docs) {
                if (!docs.exists) {
                    Count_Intent.set({
                        การสำเร็จการศึกษา: 1
                    });
                }

                else {
                    //เลขcount เวลามีคนเข้ามาสอบถาม

                    db.runTransaction(t => {
                        return t.get(Count_Intent).then(doc => {
                            if (doc.data().การสำเร็จการศึกษา > 0) {
                                let newcount = doc.data().การสำเร็จการศึกษา + 1;

                                t.update(Count_Intent, {
                                    การสำเร็จการศึกษา: newcount

                                });
                            } else {
                                t.update(Count_Intent, {
                                    การสำเร็จการศึกษา: 1
                                });

                            }

                        });
                    });
                }
            });

            //return ข้อมูลคำตอบ 
            return admin.firestore().collection('Graduation').doc('Topic').collection('เกรดเฉลี่ยสะสม').orderBy("date", "desc").limit(1).get().then((snapshot) => {
                snapshot.forEach(doc => {
                    agent.add(doc.data().description);
                    agent.add(payload่json); //แสดง paylaod
                });
            });
        }

    }

    //การแจ้งขอสำเร็จการศึกษา
    function Graduation_Informing(agent) {
        let payload = {
            "type": "template",
            "altText": "this is a confirm template",
            "template": {
                "type": "confirm",
                "actions": [
                    {
                        "type": "message",
                        "label": "ถูก",
                        "text": "ได้รับคำตอบถูกต้องในเรื่องการแจ้งขอสำเร็จการศึกษา"
                    },
                    {
                        "type": "message",
                        "label": "ไม่ถูก",
                        "text": "ได้รับคำตอบไม่ถูกต้องในเรื่องการแจ้งขอสำเร็จการศึกษา"
                    }
                ],
                "text": "คุณได้รับคำตอบถูกต้องไหมคะ?"
            }
        };

        //ประกาศตัวแปร payload เพื่อแสดงออกหน้าจอ
        let payload่json = new Payload(`LINE`, payload, { sendAsMessage: true });
        let text = request.body.queryResult.queryText;
        let c = 'ได้รับคำตอบถูกต้องในเรื่องการแจ้งขอสำเร็จการศึกษา';
        let b = 'ได้รับคำตอบไม่ถูกต้องในเรื่องการแจ้งขอสำเร็จการศึกษา';

        //Count_Accuracy
        let Count_Accuracy = admin.firestore().collection("Count_Accuracy").doc(date.toLocaleDateString()).collection("การสำเร็จการศึกษา").doc("การแจ้งขอสำเร็จการศึกษา");
        Count_Accuracy.get().then(function (docs) {
            if (!docs.exists) {
                Count_Accuracy.set({
                    ถูก: 0,
                    ไม่ถูก: 0
                });
            }

        });


        if (text === c) {
            agent.add("ขอบคุณค่ะ");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ถูก + 1;

                    t.update(Count_Accuracy, {
                        ถูก: newcount,

                    });
                });
            });



        }

        else if (text === b) {

            agent.add("กรุณากดปุ่มติดต่อเจ้าหน้าที่");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ไม่ถูก + 1;

                    t.update(Count_Accuracy, {
                        ไม่ถูก: newcount,

                    });
                });
            });

        }

        else {
            //เชคว่ามี ตัว doc อยู๋ไหม ถ้าไม่ ก็ set ค่า 
            // count_intent 
            Count_Intent.get().then(function (docs) {
                if (!docs.exists) {
                    Count_Intent.set({
                        การสำเร็จการศึกษา: 1
                    });
                }

                else {
                    //เลขcount เวลามีคนเข้ามาสอบถาม

                    db.runTransaction(t => {
                        return t.get(Count_Intent).then(doc => {
                            if (doc.data().การสำเร็จการศึกษา > 0) {
                                let newcount = doc.data().การสำเร็จการศึกษา + 1;

                                t.update(Count_Intent, {
                                    การสำเร็จการศึกษา: newcount

                                });
                            } else {
                                t.update(Count_Intent, {
                                    การสำเร็จการศึกษา: 1
                                });

                            }

                        });
                    });
                }
            });

            //return ข้อมูลคำตอบ 
            return admin.firestore().collection('Graduation').doc('Topic').collection('การแจ้งขอสำเร็จการศึกษา').orderBy("date", "desc").limit(1).get().then((snapshot) => {
                snapshot.forEach(doc => {
                    agent.add(doc.data().description);
                    agent.add(payload่json); //แสดง paylaod
                });
            });
        }

    }




    //การขอแก้ไขข้อมูลเอกสารจบ
    function Editing_information(agent) {
        let payload = {
            "type": "template",
            "altText": "this is a confirm template",
            "template": {
                "type": "confirm",
                "actions": [
                    {
                        "type": "message",
                        "label": "ถูก",
                        "text": "ได้รับคำตอบถูกต้องในเรื่องการขอแก้ไขข้อมูลเอกสารจบ"
                    },
                    {
                        "type": "message",
                        "label": "ไม่ถูก",
                        "text": "ได้รับคำตอบไม่ถูกต้องในเรื่องการขอแก้ไขข้อมูลเอกสารจบ"
                    }
                ],
                "text": "คุณได้รับคำตอบถูกต้องไหมคะ?"
            }
        };

        //ประกาศตัวแปร payload เพื่อแสดงออกหน้าจอ
        let payload่json = new Payload(`LINE`, payload, { sendAsMessage: true });
        let text = request.body.queryResult.queryText;
        let c = 'ได้รับคำตอบถูกต้องในเรื่องการขอแก้ไขข้อมูลเอกสารจบ';
        let b = 'ได้รับคำตอบไม่ถูกต้องในเรื่องการขอแก้ไขข้อมูลเอกสารจบ';

        //Count_Accuracy
        let Count_Accuracy = admin.firestore().collection("Count_Accuracy").doc(date.toLocaleDateString()).collection("การสำเร็จการศึกษา").doc("การขอแก้ไขข้อมูลเอกสารจบ");
        Count_Accuracy.get().then(function (docs) {
            if (!docs.exists) {
                Count_Accuracy.set({
                    ถูก: 0,
                    ไม่ถูก: 0
                });
            }

        });


        if (text === c) {
            agent.add("ขอบคุณค่ะ");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ถูก + 1;

                    t.update(Count_Accuracy, {
                        ถูก: newcount,

                    });
                });
            });



        }

        else if (text === b) {

            agent.add("กรุณากดปุ่มติดต่อเจ้าหน้าที่");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ไม่ถูก + 1;

                    t.update(Count_Accuracy, {
                        ไม่ถูก: newcount,

                    });
                });
            });

        }

        else {
            //เชคว่ามี ตัว doc อยู๋ไหม ถ้าไม่ ก็ set ค่า 
            // count_intent 
            Count_Intent.get().then(function (docs) {
                if (!docs.exists) {
                    Count_Intent.set({
                        การสำเร็จการศึกษา: 1
                    });
                }

                else {
                    //เลขcount เวลามีคนเข้ามาสอบถาม

                    db.runTransaction(t => {
                        return t.get(Count_Intent).then(doc => {
                            if (doc.data().การสำเร็จการศึกษา > 0) {
                                let newcount = doc.data().การสำเร็จการศึกษา + 1;

                                t.update(Count_Intent, {
                                    การสำเร็จการศึกษา: newcount

                                });
                            } else {
                                t.update(Count_Intent, {
                                    การสำเร็จการศึกษา: 1
                                });

                            }

                        });
                    });
                }
            });

            //return ข้อมูลคำตอบ 
            return admin.firestore().collection('Graduation').doc('Topic').collection('การขอแก้ไขข้อมูลเอกสารจบ').orderBy("date", "desc").limit(1).get().then((snapshot) => {
                snapshot.forEach(doc => {
                    agent.add(doc.data().description);
                    agent.add(payload่json); //แสดง paylaod
                });
            });
        }

    }




    //การได้รับเกียรตินิยม
    function honor(agent) {
        let payload = {
            "type": "template",
            "altText": "this is a confirm template",
            "template": {
                "type": "confirm",
                "actions": [
                    {
                        "type": "message",
                        "label": "ถูก",
                        "text": "ได้รับคำตอบถูกต้องในเรื่องการได้รับเกียรตินิยม"
                    },
                    {
                        "type": "message",
                        "label": "ไม่ถูก",
                        "text": "ได้รับคำตอบไม่ถูกต้องในเรื่องการได้รับเกียรตินิยม"
                    }
                ],
                "text": "คุณได้รับคำตอบถูกต้องไหมคะ?"
            }
        };

        //ประกาศตัวแปร payload เพื่อแสดงออกหน้าจอ
        let payload่json = new Payload(`LINE`, payload, { sendAsMessage: true });
        let text = request.body.queryResult.queryText;
        let c = 'ได้รับคำตอบถูกต้องในเรื่องการได้รับเกียรตินิยม';
        let b = 'ได้รับคำตอบไม่ถูกต้องในเรื่องการได้รับเกียรตินิยม';

        //Count_Accuracy
        let Count_Accuracy = admin.firestore().collection("Count_Accuracy").doc(date.toLocaleDateString()).collection("การสำเร็จการศึกษา").doc("การได้รับเกียรตินิยม");
        Count_Accuracy.get().then(function (docs) {
            if (!docs.exists) {
                Count_Accuracy.set({
                    ถูก: 0,
                    ไม่ถูก: 0
                });
            }

        });


        if (text === c) {
            agent.add("ขอบคุณค่ะ");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ถูก + 1;

                    t.update(Count_Accuracy, {
                        ถูก: newcount,

                    });
                });
            });



        }

        else if (text === b) {

            agent.add("กรุณากดปุ่มติดต่อเจ้าหน้าที่");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ไม่ถูก + 1;

                    t.update(Count_Accuracy, {
                        ไม่ถูก: newcount,

                    });
                });
            });

        }

        else {
            //เชคว่ามี ตัว doc อยู๋ไหม ถ้าไม่ ก็ set ค่า 
            // count_intent 
            Count_Intent.get().then(function (docs) {
                if (!docs.exists) {
                    Count_Intent.set({
                        การสำเร็จการศึกษา: 1
                    });
                }

                else {
                    //เลขcount เวลามีคนเข้ามาสอบถาม

                    db.runTransaction(t => {
                        return t.get(Count_Intent).then(doc => {
                            if (doc.data().การสำเร็จการศึกษา > 0) {
                                let newcount = doc.data().การสำเร็จการศึกษา + 1;

                                t.update(Count_Intent, {
                                    การสำเร็จการศึกษา: newcount

                                });
                            } else {
                                t.update(Count_Intent, {
                                    การสำเร็จการศึกษา: 1
                                });

                            }

                        });
                    });
                }
            });

            //return ข้อมูลคำตอบ 
            return admin.firestore().collection('Graduation').doc('Topic').collection('การได้รับเกียรตินิยม').orderBy("date", "desc").limit(1).get().then((snapshot) => {
                snapshot.forEach(doc => {
                    agent.add(doc.data().description);
                    agent.add(payload่json); //แสดง paylaod
                });
            });
        }

    }


    //การอนุมัติจบ
    function Approval(agent) {
        let payload = {
            "type": "template",
            "altText": "this is a confirm template",
            "template": {
                "type": "confirm",
                "actions": [
                    {
                        "type": "message",
                        "label": "ถูก",
                        "text": "ได้รับคำตอบถูกต้องในเรื่องการอนุมัติจบ"
                    },
                    {
                        "type": "message",
                        "label": "ไม่ถูก",
                        "text": "ได้รับคำตอบไม่ถูกต้องในเรื่องการอนุมัติจบ"
                    }
                ],
                "text": "คุณได้รับคำตอบถูกต้องไหมคะ?"
            }
        };

        //ประกาศตัวแปร payload เพื่อแสดงออกหน้าจอ
        let payload่json = new Payload(`LINE`, payload, { sendAsMessage: true });
        let text = request.body.queryResult.queryText;
        let c = 'ได้รับคำตอบถูกต้องในเรื่องการอนุมัติจบ';
        let b = 'ได้รับคำตอบไม่ถูกต้องในเรื่องการอนุมัติจบ';

        //Count_Accuracy
        let Count_Accuracy = admin.firestore().collection("Count_Accuracy").doc(date.toLocaleDateString()).collection("การสำเร็จการศึกษา").doc("การอนุมัติจบ");
        Count_Accuracy.get().then(function (docs) {
            if (!docs.exists) {
                Count_Accuracy.set({
                    ถูก: 0,
                    ไม่ถูก: 0
                });
            }

        });


        if (text === c) {
            agent.add("ขอบคุณค่ะ");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ถูก + 1;

                    t.update(Count_Accuracy, {
                        ถูก: newcount,

                    });
                });
            });



        }

        else if (text === b) {

            agent.add("กรุณากดปุ่มติดต่อเจ้าหน้าที่");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ไม่ถูก + 1;

                    t.update(Count_Accuracy, {
                        ไม่ถูก: newcount,

                    });
                });
            });

        }

        else {
            //เชคว่ามี ตัว doc อยู๋ไหม ถ้าไม่ ก็ set ค่า 
            // count_intent 
            Count_Intent.get().then(function (docs) {
                if (!docs.exists) {
                    Count_Intent.set({
                        การสำเร็จการศึกษา: 1
                    });
                }

                else {
                    //เลขcount เวลามีคนเข้ามาสอบถาม

                    db.runTransaction(t => {
                        return t.get(Count_Intent).then(doc => {
                            if (doc.data().การสำเร็จการศึกษา > 0) {
                                let newcount = doc.data().การสำเร็จการศึกษา + 1;

                                t.update(Count_Intent, {
                                    การสำเร็จการศึกษา: newcount

                                });
                            } else {
                                t.update(Count_Intent, {
                                    การสำเร็จการศึกษา: 1
                                });

                            }

                        });
                    });
                }
            });

            //return ข้อมูลคำตอบ 
            return admin.firestore().collection('Graduation').doc('Topic').collection('การอนุมัติจบ').orderBy("date", "desc").limit(1).get().then((snapshot) => {
                snapshot.forEach(doc => {
                    agent.add(doc.data().description);
                    agent.add(payload่json); //แสดง paylaod
                });
            });
        }

    }




    //การลาออก
    //ขั้นตอนการลาออก
    function Resignation_Procedure(agent) {
        let payload = {
            "type": "template",
            "altText": "this is a confirm template",
            "template": {
                "type": "confirm",
                "actions": [
                    {
                        "type": "message",
                        "label": "ถูก",
                        "text": "ได้รับคำตอบถูกต้องในเรื่องขั้นตอนการลาออก"
                    },
                    {
                        "type": "message",
                        "label": "ไม่ถูก",
                        "text": "ได้รับคำตอบไม่ถูกต้องในเรื่องขั้นตอนการลาออก"
                    }
                ],
                "text": "คุณได้รับคำตอบถูกต้องไหมคะ?"
            }
        };

        //ประกาศตัวแปร payload เพื่อแสดงออกหน้าจอ
        let payload่json = new Payload(`LINE`, payload, { sendAsMessage: true });
        let text = request.body.queryResult.queryText;
        let c = 'ได้รับคำตอบถูกต้องในเรื่องขั้นตอนการลาออก';
        let b = 'ได้รับคำตอบไม่ถูกต้องในเรื่องขั้นตอนการลาออก';

        //Count_Accuracy
        let Count_Accuracy = admin.firestore().collection("Count_Accuracy").doc(date.toLocaleDateString()).collection("การลาออก").doc("ขั้นตอนการลาออก");
        Count_Accuracy.get().then(function (docs) {
            if (!docs.exists) {
                Count_Accuracy.set({
                    ถูก: 0,
                    ไม่ถูก: 0
                });
            }

        });


        if (text === c) {
            agent.add("ขอบคุณค่ะ");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ถูก + 1;

                    t.update(Count_Accuracy, {
                        ถูก: newcount,

                    });
                });
            });



        }

        else if (text === b) {

            agent.add("กรุณากดปุ่มติดต่อเจ้าหน้าที่");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ไม่ถูก + 1;

                    t.update(Count_Accuracy, {
                        ไม่ถูก: newcount,

                    });
                });
            });

        }

        else {
            //เชคว่ามี ตัว doc อยู๋ไหม ถ้าไม่ ก็ set ค่า 
            // count_intent 
            Count_Intent.get().then(function (docs) {
                if (!docs.exists) {
                    Count_Intent.set({
                        การลาออก: 1
                    });
                }

                else {
                    //เลขcount เวลามีคนเข้ามาสอบถาม

                    db.runTransaction(t => {
                        return t.get(Count_Intent).then(doc => {
                            if (doc.data().การลาออก > 0) {
                                let newcount = doc.data().การลาออก + 1;

                                t.update(Count_Intent, {
                                    การลาออก: newcount

                                });
                            } else {
                                t.update(Count_Intent, {
                                    การลาออก: 1
                                });

                            }

                        });
                    });
                }
            });

            //return ข้อมูลคำตอบ 
            return admin.firestore().collection('Resignation').doc('Topic').collection('ขั้นตอนการลาออก').orderBy("date", "desc").limit(1).get().then((snapshot) => {
                snapshot.forEach(doc => {
                    agent.add(doc.data().description);
                    agent.add(payload่json); //แสดง paylaod
                });
            });
        }

    }


    //การยกเลิกการลาออก
    function Resignation_Cancle(agent) {
        let payload = {
            "type": "template",
            "altText": "this is a confirm template",
            "template": {
                "type": "confirm",
                "actions": [
                    {
                        "type": "message",
                        "label": "ถูก",
                        "text": "ได้รับคำตอบถูกต้องในเรื่องการยกเลิกการลาออก"
                    },
                    {
                        "type": "message",
                        "label": "ไม่ถูก",
                        "text": "ได้รับคำตอบไม่ถูกต้องในเรื่องการยกเลิกการลาออก"
                    }
                ],
                "text": "คุณได้รับคำตอบถูกต้องไหมคะ?"
            }
        };

        //ประกาศตัวแปร payload เพื่อแสดงออกหน้าจอ
        let payload่json = new Payload(`LINE`, payload, { sendAsMessage: true });
        let text = request.body.queryResult.queryText;
        let c = 'ได้รับคำตอบถูกต้องในเรื่องการยกเลิกการลาออก';
        let b = 'ได้รับคำตอบไม่ถูกต้องในเรื่องการยกเลิกการลาออก';

        //Count_Accuracy
        let Count_Accuracy = admin.firestore().collection("Count_Accuracy").doc(date.toLocaleDateString()).collection("การลาออก").doc("การยกเลิกการลาออก");
        Count_Accuracy.get().then(function (docs) {
            if (!docs.exists) {
                Count_Accuracy.set({
                    ถูก: 0,
                    ไม่ถูก: 0
                });
            }

        });


        if (text === c) {
            agent.add("ขอบคุณค่ะ");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ถูก + 1;

                    t.update(Count_Accuracy, {
                        ถูก: newcount,

                    });
                });
            });



        }

        else if (text === b) {

            agent.add("กรุณากดปุ่มติดต่อเจ้าหน้าที่");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ไม่ถูก + 1;

                    t.update(Count_Accuracy, {
                        ไม่ถูก: newcount,

                    });
                });
            });

        }

        else {
            //เชคว่ามี ตัว doc อยู๋ไหม ถ้าไม่ ก็ set ค่า 
            // count_intent 
            Count_Intent.get().then(function (docs) {
                if (!docs.exists) {
                    Count_Intent.set({
                        การลาออก: 1
                    });
                }

                else {
                    //เลขcount เวลามีคนเข้ามาสอบถาม

                    db.runTransaction(t => {
                        return t.get(Count_Intent).then(doc => {
                            if (doc.data().การลาออก > 0) {
                                let newcount = doc.data().การลาออก + 1;

                                t.update(Count_Intent, {
                                    การลาออก: newcount

                                });
                            } else {
                                t.update(Count_Intent, {
                                    การลาออก: 1
                                });

                            }

                        });
                    });
                }
            });

            //return ข้อมูลคำตอบ 
            return admin.firestore().collection('Resignation').doc('Topic').collection('การยกเลิกการลาออก').orderBy("date", "desc").limit(1).get().then((snapshot) => {
                snapshot.forEach(doc => {
                    agent.add(doc.data().description);
                    agent.add(payload่json); //แสดง paylaod
                });
            });
        }

    }



    //การขอย้ายสถานศึกษา
    function University_Transfer(agent) {
        let payload = {
            "type": "template",
            "altText": "this is a confirm template",
            "template": {
                "type": "confirm",
                "actions": [
                    {
                        "type": "message",
                        "label": "ถูก",
                        "text": "ได้รับคำตอบถูกต้องในเรื่องการขอย้ายสถานศึกษา"
                    },
                    {
                        "type": "message",
                        "label": "ไม่ถูก",
                        "text": "ได้รับคำตอบไม่ถูกต้องในเรื่องการขอย้ายสถานศึกษา"
                    }
                ],
                "text": "คุณได้รับคำตอบถูกต้องไหมคะ?"
            }
        };

        //ประกาศตัวแปร payload เพื่อแสดงออกหน้าจอ
        let payload่json = new Payload(`LINE`, payload, { sendAsMessage: true });
        let text = request.body.queryResult.queryText;
        let c = 'ได้รับคำตอบถูกต้องในเรื่องการขอย้ายสถานศึกษา';
        let b = 'ได้รับคำตอบไม่ถูกต้องในเรื่องการขอย้ายสถานศึกษา';

        //Count_Accuracy
        let Count_Accuracy = admin.firestore().collection("Count_Accuracy").doc(date.toLocaleDateString()).collection("การลาออก").doc("การขอย้ายสถานศึกษา");
        Count_Accuracy.get().then(function (docs) {
            if (!docs.exists) {
                Count_Accuracy.set({
                    ถูก: 0,
                    ไม่ถูก: 0
                });
            }

        });


        if (text === c) {
            agent.add("ขอบคุณค่ะ");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ถูก + 1;

                    t.update(Count_Accuracy, {
                        ถูก: newcount,

                    });
                });
            });



        }

        else if (text === b) {

            agent.add("กรุณากดปุ่มติดต่อเจ้าหน้าที่");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ไม่ถูก + 1;

                    t.update(Count_Accuracy, {
                        ไม่ถูก: newcount,

                    });
                });
            });

        }

        else {
            //เชคว่ามี ตัว doc อยู๋ไหม ถ้าไม่ ก็ set ค่า 
            // count_intent 
            Count_Intent.get().then(function (docs) {
                if (!docs.exists) {
                    Count_Intent.set({
                        การลาออก: 1
                    });
                }

                else {
                    //เลขcount เวลามีคนเข้ามาสอบถาม

                    db.runTransaction(t => {
                        return t.get(Count_Intent).then(doc => {
                            if (doc.data().การลาออก > 0) {
                                let newcount = doc.data().การลาออก + 1;

                                t.update(Count_Intent, {
                                    การลาออก: newcount

                                });
                            } else {
                                t.update(Count_Intent, {
                                    การลาออก: 1
                                });

                            }

                        });
                    });
                }
            });

            //return ข้อมูลคำตอบ 
            return admin.firestore().collection('Resignation').doc('Topic').collection('การขอย้ายสถานศึกษา').orderBy("date", "desc").limit(1).get().then((snapshot) => {
                snapshot.forEach(doc => {
                    agent.add(doc.data().description);
                    agent.add(payload่json); //แสดง paylaod
                });
            });
        }

    }





    //การพ้นสภาพการเป็นนักศึกษา
    //เกรดเฉลี่ยขั้นต่ำภาคปกติ
    function Regular_session(agent) {
        let payload = {
            "type": "template",
            "altText": "this is a confirm template",
            "template": {
                "type": "confirm",
                "actions": [
                    {
                        "type": "message",
                        "label": "ถูก",
                        "text": "ได้รับคำตอบถูกต้องในเรื่องเกรดเฉลี่ยขั้นต่ำของภาคปกติ"
                    },
                    {
                        "type": "message",
                        "label": "ไม่ถูก",
                        "text": "ได้รับคำตอบไม่ถูกต้องในเรื่องเกรดเฉลี่ยขั้นต่ำของภาคปกติ"
                    }
                ],
                "text": "คุณได้รับคำตอบถูกต้องไหมคะ?"
            }
        };

        //ประกาศตัวแปร payload เพื่อแสดงออกหน้าจอ
        let payload่json = new Payload(`LINE`, payload, { sendAsMessage: true });
        let text = request.body.queryResult.queryText;
        let c = 'ได้รับคำตอบถูกต้องในเรื่องเกรดเฉลี่ยขั้นต่ำของภาคปกติ';
        let b = 'ได้รับคำตอบไม่ถูกต้องในเรื่องเกรดเฉลี่ยขั้นต่ำของภาคปกติ';

        //Count_Accuracy
        let Count_Accuracy = admin.firestore().collection("Count_Accuracy").doc(date.toLocaleDateString()).collection("การพ้นสภาพการเป็นนักศึกษา").doc("เกรดเฉลี่ยขั้นต่ำของภาคปกติ");
        Count_Accuracy.get().then(function (docs) {
            if (!docs.exists) {
                Count_Accuracy.set({
                    ถูก: 0,
                    ไม่ถูก: 0
                });
            }

        });


        if (text === c) {
            agent.add("ขอบคุณค่ะ");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ถูก + 1;

                    t.update(Count_Accuracy, {
                        ถูก: newcount,

                    });
                });
            });



        }

        else if (text === b) {

            agent.add("กรุณากดปุ่มติดต่อเจ้าหน้าที่");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ไม่ถูก + 1;

                    t.update(Count_Accuracy, {
                        ไม่ถูก: newcount,

                    });
                });
            });

        }

        else {
            //เชคว่ามี ตัว doc อยู๋ไหม ถ้าไม่ ก็ set ค่า 
            // count_intent 
            Count_Intent.get().then(function (docs) {
                if (!docs.exists) {
                    Count_Intent.set({
                        การพ้นสภาพการเป็นนักศึกษา: 1
                    });
                }

                else {
                    //เลขcount เวลามีคนเข้ามาสอบถาม

                    db.runTransaction(t => {
                        return t.get(Count_Intent).then(doc => {
                            if (doc.data().การพ้นสภาพการเป็นนักศึกษา > 0) {
                                let newcount = doc.data().การพ้นสภาพการเป็นนักศึกษา + 1;

                                t.update(Count_Intent, {
                                    การพ้นสภาพการเป็นนักศึกษา: newcount

                                });
                            } else {
                                t.update(Count_Intent, {
                                    การพ้นสภาพการเป็นนักศึกษา: 1
                                });

                            }

                        });
                    });
                }
            });

            //return ข้อมูลคำตอบ 
            return admin.firestore().collection('Student_Retirement').doc('Topic').collection('เกรดเฉลี่ยขั้นต่ำ').doc('เกรดเฉลี่ยขั้นต่ำ').collection('ภาคปกติ').orderBy("date", "desc").limit(1).get().then((snapshot) => {
                snapshot.forEach(doc => {
                    agent.add(doc.data().description);
                    agent.add(payload่json); //แสดง paylaod
                });
            });
        }

    }


    //เกรดเฉลี่ยขั้นต่ำภาคพิเศษ
    function Spacial_session(agent) {
        let payload = {
            "type": "template",
            "altText": "this is a confirm template",
            "template": {
                "type": "confirm",
                "actions": [
                    {
                        "type": "message",
                        "label": "ถูก",
                        "text": "ได้รับคำตอบถูกต้องในเรื่องเกรดเฉลี่ยขั้นต่ำของภาคพิเศษ"
                    },
                    {
                        "type": "message",
                        "label": "ไม่ถูก",
                        "text": "ได้รับคำตอบไม่ถูกต้องในเรื่องเกรดเฉลี่ยขั้นต่ำของภาคพิเศษ"
                    }
                ],
                "text": "คุณได้รับคำตอบถูกต้องไหมคะ?"
            }
        };

        //ประกาศตัวแปร payload เพื่อแสดงออกหน้าจอ
        let payload่json = new Payload(`LINE`, payload, { sendAsMessage: true });
        let text = request.body.queryResult.queryText;
        let c = 'ได้รับคำตอบถูกต้องในเรื่องเกรดเฉลี่ยขั้นต่ำของภาคพิเศษ';
        let b = 'ได้รับคำตอบไม่ถูกต้องในเรื่องเกรดเฉลี่ยขั้นต่ำของภาคพิเศษ';

        //Count_Accuracy
        let Count_Accuracy = admin.firestore().collection("Count_Accuracy").doc(date.toLocaleDateString()).collection("การพ้นสภาพการเป็นนักศึกษา").doc("เกรดเฉลี่ยขั้นต่ำของภาคพิเศษ");
        Count_Accuracy.get().then(function (docs) {
            if (!docs.exists) {
                Count_Accuracy.set({
                    ถูก: 0,
                    ไม่ถูก: 0
                });
            }

        });


        if (text === c) {
            agent.add("ขอบคุณค่ะ");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ถูก + 1;

                    t.update(Count_Accuracy, {
                        ถูก: newcount,

                    });
                });
            });



        }

        else if (text === b) {

            agent.add("กรุณากดปุ่มติดต่อเจ้าหน้าที่");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ไม่ถูก + 1;

                    t.update(Count_Accuracy, {
                        ไม่ถูก: newcount,

                    });
                });
            });

        }

        else {
            //เชคว่ามี ตัว doc อยู๋ไหม ถ้าไม่ ก็ set ค่า 
            // count_intent 
            Count_Intent.get().then(function (docs) {
                if (!docs.exists) {
                    Count_Intent.set({
                        การพ้นสภาพการเป็นนักศึกษา: 1
                    });
                }

                else {
                    //เลขcount เวลามีคนเข้ามาสอบถาม

                    db.runTransaction(t => {
                        return t.get(Count_Intent).then(doc => {
                            if (doc.data().การพ้นสภาพการเป็นนักศึกษา > 0) {
                                let newcount = doc.data().การพ้นสภาพการเป็นนักศึกษา + 1;

                                t.update(Count_Intent, {
                                    การพ้นสภาพการเป็นนักศึกษา: newcount

                                });
                            } else {
                                t.update(Count_Intent, {
                                    การพ้นสภาพการเป็นนักศึกษา: 1
                                });

                            }

                        });
                    });
                }
            });

            //return ข้อมูลคำตอบ 
            return admin.firestore().collection('Student_Retirement').doc('Topic').collection('เกรดเฉลี่ยขั้นต่ำ').doc('เกรดเฉลี่ยขั้นต่ำ').collection('ภาคพิเศษ').orderBy("date", "desc").limit(1).get().then((snapshot) => {
                snapshot.forEach(doc => {
                    agent.add(doc.data().description);
                    agent.add(payload่json); //แสดง paylaod
                });
            });
        }

    }


    //กรณีการพ้นสภาพการเป็นนักศึกษา
    function In_case_Student_Retirement(agent) {
        let payload = {
            "type": "template",
            "altText": "this is a confirm template",
            "template": {
                "type": "confirm",
                "actions": [
                    {
                        "type": "message",
                        "label": "ถูก",
                        "text": "ได้รับคำตอบถูกต้องในเรื่องกรณีการพ้นสภาพการเป็นนักศึกษา"
                    },
                    {
                        "type": "message",
                        "label": "ไม่ถูก",
                        "text": "ได้รับคำตอบไม่ถูกต้องในเรื่องกรณีการพ้นสภาพการเป็นนักศึกษา"
                    }
                ],
                "text": "คุณได้รับคำตอบถูกต้องไหมคะ?"
            }
        };

        //ประกาศตัวแปร payload เพื่อแสดงออกหน้าจอ
        let payload่json = new Payload(`LINE`, payload, { sendAsMessage: true });
        let text = request.body.queryResult.queryText;
        let c = 'ได้รับคำตอบถูกต้องในเรื่องกรณีการพ้นสภาพการเป็นนักศึกษา';
        let b = 'ได้รับคำตอบไม่ถูกต้องในเรื่องกรณีการพ้นสภาพการเป็นนักศึกษา';

        //Count_Accuracy
        let Count_Accuracy = admin.firestore().collection("Count_Accuracy").doc(date.toLocaleDateString()).collection("การพ้นสภาพการเป็นนักศึกษา").doc("กรณีการพ้นสภาพการเป็นนักศึกษา");
        Count_Accuracy.get().then(function (docs) {
            if (!docs.exists) {
                Count_Accuracy.set({
                    ถูก: 0,
                    ไม่ถูก: 0
                });
            }

        });


        if (text === c) {
            agent.add("ขอบคุณค่ะ");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ถูก + 1;

                    t.update(Count_Accuracy, {
                        ถูก: newcount,

                    });
                });
            });



        }

        else if (text === b) {

            agent.add("กรุณากดปุ่มติดต่อเจ้าหน้าที่");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ไม่ถูก + 1;

                    t.update(Count_Accuracy, {
                        ไม่ถูก: newcount,

                    });
                });
            });

        }

        else {
            //เชคว่ามี ตัว doc อยู๋ไหม ถ้าไม่ ก็ set ค่า 
            // count_intent 
            Count_Intent.get().then(function (docs) {
                if (!docs.exists) {
                    Count_Intent.set({
                        การพ้นสภาพการเป็นนักศึกษา: 1
                    });
                }

                else {
                    //เลขcount เวลามีคนเข้ามาสอบถาม

                    db.runTransaction(t => {
                        return t.get(Count_Intent).then(doc => {
                            if (doc.data().การพ้นสภาพการเป็นนักศึกษา > 0) {
                                let newcount = doc.data().การพ้นสภาพการเป็นนักศึกษา + 1;

                                t.update(Count_Intent, {
                                    การพ้นสภาพการเป็นนักศึกษา: newcount

                                });
                            } else {
                                t.update(Count_Intent, {
                                    การพ้นสภาพการเป็นนักศึกษา: 1
                                });

                            }

                        });
                    });
                }
            });

            //return ข้อมูลคำตอบ 
            return admin.firestore().collection('Student_Retirement').doc('Topic').collection('กรณีการพ้นสภาพการเป็นนักศึกษา').orderBy("date", "desc").limit(1).get().then((snapshot) => {
                snapshot.forEach(doc => {
                    agent.add(doc.data().description);
                    agent.add(payload่json); //แสดง paylaod
                });
            });
        }

    }


    //การดำเนินการเมื่อพ้นสภาพการเป็นนักศึกษา
    function Procession_Student_Retirement(agent) {
        let payload = {
            "type": "template",
            "altText": "this is a confirm template",
            "template": {
                "type": "confirm",
                "actions": [
                    {
                        "type": "message",
                        "label": "ถูก",
                        "text": "ได้รับคำตอบถูกต้องในเรื่องการดำเนินการเมื่อพ้นสภาพการเป็นนักศึกษา"
                    },
                    {
                        "type": "message",
                        "label": "ไม่ถูก",
                        "text": "ได้รับคำตอบไม่ถูกต้องในเรื่องการดำเนินการเมื่อพ้นสภาพการเป็นนักศึกษา"
                    }
                ],
                "text": "คุณได้รับคำตอบถูกต้องไหมคะ?"
            }
        };

        //ประกาศตัวแปร payload เพื่อแสดงออกหน้าจอ
        let payload่json = new Payload(`LINE`, payload, { sendAsMessage: true });
        let text = request.body.queryResult.queryText;
        let c = 'ได้รับคำตอบถูกต้องในเรื่องการดำเนินการเมื่อพ้นสภาพการเป็นนักศึกษา';
        let b = 'ได้รับคำตอบไม่ถูกต้องในเรื่องการดำเนินการเมื่อพ้นสภาพการเป็นนักศึกษา';

        //Count_Accuracy
        let Count_Accuracy = admin.firestore().collection("Count_Accuracy").doc(date.toLocaleDateString()).collection("การพ้นสภาพการเป็นนักศึกษา").doc("การดำเนินการเมื่อพ้นสภาพการเป็นนักศึกษา");
        Count_Accuracy.get().then(function (docs) {
            if (!docs.exists) {
                Count_Accuracy.set({
                    ถูก: 0,
                    ไม่ถูก: 0
                });
            }

        });


        if (text === c) {
            agent.add("ขอบคุณค่ะ");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ถูก + 1;

                    t.update(Count_Accuracy, {
                        ถูก: newcount,

                    });
                });
            });



        }

        else if (text === b) {

            agent.add("กรุณากดปุ่มติดต่อเจ้าหน้าที่");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ไม่ถูก + 1;

                    t.update(Count_Accuracy, {
                        ไม่ถูก: newcount,

                    });
                });
            });

        }

        else {
            //เชคว่ามี ตัว doc อยู๋ไหม ถ้าไม่ ก็ set ค่า 
            // count_intent 
            Count_Intent.get().then(function (docs) {
                if (!docs.exists) {
                    Count_Intent.set({
                        การพ้นสภาพการเป็นนักศึกษา: 1
                    });
                }

                else {
                    //เลขcount เวลามีคนเข้ามาสอบถาม

                    db.runTransaction(t => {
                        return t.get(Count_Intent).then(doc => {
                            if (doc.data().การพ้นสภาพการเป็นนักศึกษา > 0) {
                                let newcount = doc.data().การพ้นสภาพการเป็นนักศึกษา + 1;

                                t.update(Count_Intent, {
                                    การพ้นสภาพการเป็นนักศึกษา: newcount

                                });
                            } else {
                                t.update(Count_Intent, {
                                    การพ้นสภาพการเป็นนักศึกษา: 1
                                });

                            }

                        });
                    });
                }
            });

            //return ข้อมูลคำตอบ 
            return admin.firestore().collection('Student_Retirement').doc('Topic').collection('การดำเนินการเมื่อพ้นสภาพการเป็นนักศึกษา').orderBy("date", "desc").limit(1).get().then((snapshot) => {
                snapshot.forEach(doc => {
                    agent.add(doc.data().description);
                    agent.add(payload่json); //แสดง paylaod
                });
            });
        }

    }



    //การวัดและการประเมินผล
    //เกรด

    function Grade(agent) {
        let payload = {
            "type": "template",
            "altText": "this is a confirm template",
            "template": {
                "type": "confirm",
                "actions": [
                    {
                        "type": "message",
                        "label": "ถูก",
                        "text": "ได้รับคำตอบถูกต้องในเรื่องเกรดไม่ออก"
                    },
                    {
                        "type": "message",
                        "label": "ไม่ถูก",
                        "text": "ได้รับคำตอบไม่ถูกต้องในเรื่องเกรดไม่ออก"
                    }
                ],
                "text": "คุณได้รับคำตอบถูกต้องไหมคะ?"
            }
        };

        //ประกาศตัวแปร payload เพื่อแสดงออกหน้าจอ
        let payload่json = new Payload(`LINE`, payload, { sendAsMessage: true });
        let text = request.body.queryResult.queryText;
        let c = 'ได้รับคำตอบถูกต้องในเรื่องเกรดไม่ออก';
        let b = 'ได้รับคำตอบไม่ถูกต้องในเรื่องเกรดไม่ออก';

        //Count_Accuracy
        let Count_Accuracy = admin.firestore().collection("Count_Accuracy").doc(date.toLocaleDateString()).collection("การวัดและการประเมินผล").doc("เกรดไม่ออก");
        Count_Accuracy.get().then(function (docs) {
            if (!docs.exists) {
                Count_Accuracy.set({
                    ถูก: 0,
                    ไม่ถูก: 0
                });
            }

        });


        if (text === c) {
            agent.add("ขอบคุณค่ะ");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ถูก + 1;

                    t.update(Count_Accuracy, {
                        ถูก: newcount,

                    });
                });
            });



        }

        else if (text === b) {

            agent.add("กรุณากดปุ่มติดต่อเจ้าหน้าที่");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ไม่ถูก + 1;

                    t.update(Count_Accuracy, {
                        ไม่ถูก: newcount,

                    });
                });
            });

        }

        else {
            //เชคว่ามี ตัว doc อยู๋ไหม ถ้าไม่ ก็ set ค่า 
            // count_intent 
            Count_Intent.get().then(function (docs) {
                if (!docs.exists) {
                    Count_Intent.set({
                        การวัดและการประเมินผล: 1
                    });
                }

                else {
                    //เลขcount เวลามีคนเข้ามาสอบถาม

                    db.runTransaction(t => {
                        return t.get(Count_Intent).then(doc => {
                            if (doc.data().การวัดและการประเมินผล > 0) {
                                let newcount = doc.data().การวัดและการประเมินผล + 1;

                                t.update(Count_Intent, {
                                    การวัดและการประเมินผล: newcount

                                });
                            } else {
                                t.update(Count_Intent, {
                                    การวัดและการประเมินผล: 1
                                });

                            }

                        });
                    });
                }
            });

            //return ข้อมูลคำตอบ 
            return admin.firestore().collection('Measurement').doc('Topic').collection('เกรดไม่ออก').orderBy("date", "desc").limit(1).get().then((snapshot) => {
                snapshot.forEach(doc => {
                    agent.add(doc.data().description);
                    agent.add(payload่json); //แสดง paylaod
                });
            });
        }

    }


    //การแก้ I
    function Fix_Incomplete_Grade(agent) {
        let payload = {
            "type": "template",
            "altText": "this is a confirm template",
            "template": {
                "type": "confirm",
                "actions": [
                    {
                        "type": "message",
                        "label": "ถูก",
                        "text": "ได้รับคำตอบถูกต้องในเรื่องการแก้ I"
                    },
                    {
                        "type": "message",
                        "label": "ไม่ถูก",
                        "text": "ได้รับคำตอบไม่ถูกต้องในเรื่องการแก้ I"
                    }
                ],
                "text": "คุณได้รับคำตอบถูกต้องไหมคะ?"
            }
        };

        //ประกาศตัวแปร payload เพื่อแสดงออกหน้าจอ
        let payload่json = new Payload(`LINE`, payload, { sendAsMessage: true });
        let text = request.body.queryResult.queryText;
        let c = 'ได้รับคำตอบถูกต้องในเรื่องการแก้ I';
        let b = 'ได้รับคำตอบไม่ถูกต้องในเรื่องการแก้ I';

        //Count_Accuracy
        let Count_Accuracy = admin.firestore().collection("Count_Accuracy").doc(date.toLocaleDateString()).collection("การวัดและการประเมินผล").doc("การแก้ I");
        Count_Accuracy.get().then(function (docs) {
            if (!docs.exists) {
                Count_Accuracy.set({
                    ถูก: 0,
                    ไม่ถูก: 0
                });
            }

        });


        if (text === c) {
            agent.add("ขอบคุณค่ะ");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ถูก + 1;

                    t.update(Count_Accuracy, {
                        ถูก: newcount,

                    });
                });
            });



        }

        else if (text === b) {

            agent.add("กรุณากดปุ่มติดต่อเจ้าหน้าที่");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ไม่ถูก + 1;

                    t.update(Count_Accuracy, {
                        ไม่ถูก: newcount,

                    });
                });
            });

        }

        else {
            //เชคว่ามี ตัว doc อยู๋ไหม ถ้าไม่ ก็ set ค่า 
            // count_intent 
            Count_Intent.get().then(function (docs) {
                if (!docs.exists) {
                    Count_Intent.set({
                        การวัดและการประเมินผล: 1
                    });
                }

                else {
                    //เลขcount เวลามีคนเข้ามาสอบถาม

                    db.runTransaction(t => {
                        return t.get(Count_Intent).then(doc => {
                            if (doc.data().การวัดและการประเมินผล > 0) {
                                let newcount = doc.data().การวัดและการประเมินผล + 1;

                                t.update(Count_Intent, {
                                    การวัดและการประเมินผล: newcount

                                });
                            } else {
                                t.update(Count_Intent, {
                                    การวัดและการประเมินผล: 1
                                });

                            }

                        });
                    });
                }
            });

            //return ข้อมูลคำตอบ 
            return admin.firestore().collection('Measurement').doc('Topic').collection('เกรดไม่ออก').orderBy("date", "desc").limit(1).get().then((snapshot) => {
                snapshot.forEach(doc => {
                    agent.add(doc.data().description);
                    agent.add(payload่json); //แสดง paylaod
                });
            });
        }

    }


    //การลาพักการศึกษา
    //การยื่นคำร้องลาพักการศึกษา
    function Presenting_a_Petition(agent) {
        let payload = {
            "type": "template",
            "altText": "this is a confirm template",
            "template": {
                "type": "confirm",
                "actions": [
                    {
                        "type": "message",
                        "label": "ถูก",
                        "text": "ได้รับคำตอบถูกต้องในเรื่องการยื่นคำร้องลาพักการศึกษา"
                    },
                    {
                        "type": "message",
                        "label": "ไม่ถูก",
                        "text": "ได้รับคำตอบไม่ถูกต้องในเรื่องการยื่นคำร้องลาพักการศึกษา"
                    }
                ],
                "text": "คุณได้รับคำตอบถูกต้องไหมคะ?"
            }
        };

        //ประกาศตัวแปร payload เพื่อแสดงออกหน้าจอ
        let payload่json = new Payload(`LINE`, payload, { sendAsMessage: true });
        let text = request.body.queryResult.queryText;
        let c = 'ได้รับคำตอบถูกต้องในเรื่องการยื่นคำร้องลาพักการศึกษา';
        let b = 'ได้รับคำตอบไม่ถูกต้องในเรื่องการยื่นคำร้องลาพักการศึกษา';

        //Count_Accuracy
        let Count_Accuracy = admin.firestore().collection("Count_Accuracy").doc(date.toLocaleDateString()).collection("การลาพักการศึกษา").doc("การยื่นคำร้องลาพักการศึกษา");
        Count_Accuracy.get().then(function (docs) {
            if (!docs.exists) {
                Count_Accuracy.set({
                    ถูก: 0,
                    ไม่ถูก: 0
                });
            }

        });


        if (text === c) {
            agent.add("ขอบคุณค่ะ");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ถูก + 1;

                    t.update(Count_Accuracy, {
                        ถูก: newcount,

                    });
                });
            });



        }

        else if (text === b) {

            agent.add("กรุณากดปุ่มติดต่อเจ้าหน้าที่");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ไม่ถูก + 1;

                    t.update(Count_Accuracy, {
                        ไม่ถูก: newcount,

                    });
                });
            });

        }

        else {
            //เชคว่ามี ตัว doc อยู๋ไหม ถ้าไม่ ก็ set ค่า 
            // count_intent 
            Count_Intent.get().then(function (docs) {
                if (!docs.exists) {
                    Count_Intent.set({
                        การลาพักการศึกษา: 1
                    });
                }

                else {
                    //เลขcount เวลามีคนเข้ามาสอบถาม

                    db.runTransaction(t => {
                        return t.get(Count_Intent).then(doc => {
                            if (doc.data().การลาพักการศึกษา > 0) {
                                let newcount = doc.data().การลาพักการศึกษา + 1;

                                t.update(Count_Intent, {
                                    การลาพักการศึกษา: newcount

                                });
                            } else {
                                t.update(Count_Intent, {
                                    การลาพักการศึกษา: 1
                                });

                            }

                        });
                    });
                }
            });

            //return ข้อมูลคำตอบ 
            return admin.firestore().collection('Taking_leave_from_studies').doc('Topic').collection('การยื่นคำร้องลาพักการศึกษา').orderBy("date", "desc").limit(1).get().then((snapshot) => {
                snapshot.forEach(doc => {
                    agent.add(doc.data().description);
                    agent.add(payload่json); //แสดง paylaod
                });
            });
        }

    }



    //ระเบียบการลาพักการศึกษา
    function Taking_leave_from_studies_Regulation(agent) {
        let payload = {
            "type": "template",
            "altText": "this is a confirm template",
            "template": {
                "type": "confirm",
                "actions": [
                    {
                        "type": "message",
                        "label": "ถูก",
                        "text": "ได้รับคำตอบถูกต้องในเรื่องระเบียบการลาพักการศึกษา"
                    },
                    {
                        "type": "message",
                        "label": "ไม่ถูก",
                        "text": "ได้รับคำตอบไม่ถูกต้องในเรื่องระเบียบการลาพักการศึกษา"
                    }
                ],
                "text": "คุณได้รับคำตอบถูกต้องไหมคะ?"
            }
        };

        //ประกาศตัวแปร payload เพื่อแสดงออกหน้าจอ
        let payload่json = new Payload(`LINE`, payload, { sendAsMessage: true });
        let text = request.body.queryResult.queryText;
        let c = 'ได้รับคำตอบถูกต้องในเรื่องระเบียบการลาพักการศึกษา';
        let b = 'ได้รับคำตอบไม่ถูกต้องในเรื่องระเบียบการลาพักการศึกษา';

        //Count_Accuracy
        let Count_Accuracy = admin.firestore().collection("Count_Accuracy").doc(date.toLocaleDateString()).collection("การลาพักการศึกษา").doc("ระเบียบการลาพักการศึกษา");
        Count_Accuracy.get().then(function (docs) {
            if (!docs.exists) {
                Count_Accuracy.set({
                    ถูก: 0,
                    ไม่ถูก: 0
                });
            }

        });


        if (text === c) {
            agent.add("ขอบคุณค่ะ");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ถูก + 1;

                    t.update(Count_Accuracy, {
                        ถูก: newcount,

                    });
                });
            });



        }

        else if (text === b) {

            agent.add("กรุณากดปุ่มติดต่อเจ้าหน้าที่");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ไม่ถูก + 1;

                    t.update(Count_Accuracy, {
                        ไม่ถูก: newcount,

                    });
                });
            });

        }

        else {
            //เชคว่ามี ตัว doc อยู๋ไหม ถ้าไม่ ก็ set ค่า 
            // count_intent 
            Count_Intent.get().then(function (docs) {
                if (!docs.exists) {
                    Count_Intent.set({
                        การลาพักการศึกษา: 1
                    });
                }

                else {
                    //เลขcount เวลามีคนเข้ามาสอบถาม

                    db.runTransaction(t => {
                        return t.get(Count_Intent).then(doc => {
                            if (doc.data().การลาพักการศึกษา > 0) {
                                let newcount = doc.data().การลาพักการศึกษา + 1;

                                t.update(Count_Intent, {
                                    การลาพักการศึกษา: newcount

                                });
                            } else {
                                t.update(Count_Intent, {
                                    การลาพักการศึกษา: 1
                                });

                            }

                        });
                    });
                }
            });

            //return ข้อมูลคำตอบ 
            return admin.firestore().collection('Taking_leave_from_studies').doc('Topic').collection('ระเบียบการลาพักการศึกษา').orderBy("date", "desc").limit(1).get().then((snapshot) => {
                snapshot.forEach(doc => {
                    agent.add(doc.data().description);
                    agent.add(payload่json); //แสดง paylaod
                });
            });
        }

    }


    //ค่าธรรมเนียมการลาพักการศึกษา
    function Taking_leave_from_studies_Fee(agent) {
        let payload = {
            "type": "template",
            "altText": "this is a confirm template",
            "template": {
                "type": "confirm",
                "actions": [
                    {
                        "type": "message",
                        "label": "ถูก",
                        "text": "ได้รับคำตอบถูกต้องในเรื่องค่าธรรมเนียมการลาพักการศึกษา"
                    },
                    {
                        "type": "message",
                        "label": "ไม่ถูก",
                        "text": "ได้รับคำตอบไม่ถูกต้องในเรื่องค่าธรรมเนียมการลาพักการศึกษา"
                    }
                ],
                "text": "คุณได้รับคำตอบถูกต้องไหมคะ?"
            }
        };

        //ประกาศตัวแปร payload เพื่อแสดงออกหน้าจอ
        let payload่json = new Payload(`LINE`, payload, { sendAsMessage: true });
        let text = request.body.queryResult.queryText;
        let c = 'ได้รับคำตอบถูกต้องในเรื่องค่าธรรมเนียมการลาพักการศึกษา';
        let b = 'ได้รับคำตอบไม่ถูกต้องในเรื่องค่าธรรมเนียมการลาพักการศึกษา';

        //Count_Accuracy
        let Count_Accuracy = admin.firestore().collection("Count_Accuracy").doc(date.toLocaleDateString()).collection("การลาพักการศึกษา").doc("ค่าธรรมเนียมการลาพักการศึกษา");
        Count_Accuracy.get().then(function (docs) {
            if (!docs.exists) {
                Count_Accuracy.set({
                    ถูก: 0,
                    ไม่ถูก: 0
                });
            }

        });


        if (text === c) {
            agent.add("ขอบคุณค่ะ");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ถูก + 1;

                    t.update(Count_Accuracy, {
                        ถูก: newcount,

                    });
                });
            });



        }

        else if (text === b) {

            agent.add("กรุณากดปุ่มติดต่อเจ้าหน้าที่");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ไม่ถูก + 1;

                    t.update(Count_Accuracy, {
                        ไม่ถูก: newcount,

                    });
                });
            });

        }

        else {
            //เชคว่ามี ตัว doc อยู๋ไหม ถ้าไม่ ก็ set ค่า 
            // count_intent 
            Count_Intent.get().then(function (docs) {
                if (!docs.exists) {
                    Count_Intent.set({
                        การลาพักการศึกษา: 1
                    });
                }

                else {
                    //เลขcount เวลามีคนเข้ามาสอบถาม

                    db.runTransaction(t => {
                        return t.get(Count_Intent).then(doc => {
                            if (doc.data().การลาพักการศึกษา > 0) {
                                let newcount = doc.data().การลาพักการศึกษา + 1;

                                t.update(Count_Intent, {
                                    การลาพักการศึกษา: newcount

                                });
                            } else {
                                t.update(Count_Intent, {
                                    การลาพักการศึกษา: 1
                                });

                            }

                        });
                    });
                }
            });

            //return ข้อมูลคำตอบ 
            return admin.firestore().collection('Taking_leave_from_studies').doc('Topic').collection('ค่าธรรมเนียมการลาพักการศึกษา').orderBy("date", "desc").limit(1).get().then((snapshot) => {
                snapshot.forEach(doc => {
                    agent.add(doc.data().description);
                    agent.add(payload่json); //แสดง paylaod
                });
            });
        }

    }



    //การขอรับเอกสารการศึกษา
    //ใบรับรองการเป็นนักศึกษา
    function Certificate_of_Student_Status(agent) {
        let payload = {
            "type": "template",
            "altText": "this is a confirm template",
            "template": {
                "type": "confirm",
                "actions": [
                    {
                        "type": "message",
                        "label": "ถูก",
                        "text": "ได้รับคำตอบถูกต้องในเรื่องใบรับรองการเป็นนักศึกษา"
                    },
                    {
                        "type": "message",
                        "label": "ไม่ถูก",
                        "text": "ได้รับคำตอบไม่ถูกต้องในเรื่องใบรับรองการเป็นนักศึกษา"
                    }
                ],
                "text": "คุณได้รับคำตอบถูกต้องไหมคะ?"
            }
        };

        //ประกาศตัวแปร payload เพื่อแสดงออกหน้าจอ
        let payload่json = new Payload(`LINE`, payload, { sendAsMessage: true });
        let text = request.body.queryResult.queryText;
        let c = 'ได้รับคำตอบถูกต้องในเรื่องใบรับรองการเป็นนักศึกษา';
        let b = 'ได้รับคำตอบไม่ถูกต้องในเรื่องใบรับรองการเป็นนักศึกษา';

        //Count_Accuracy
        let Count_Accuracy = admin.firestore().collection("Count_Accuracy").doc(date.toLocaleDateString()).collection("การขอรับเอกสารการศึกษา").doc("ใบรับรองการเป็นนักศึกษา");
        Count_Accuracy.get().then(function (docs) {
            if (!docs.exists) {
                Count_Accuracy.set({
                    ถูก: 0,
                    ไม่ถูก: 0
                });
            }

        });


        if (text === c) {
            agent.add("ขอบคุณค่ะ");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ถูก + 1;

                    t.update(Count_Accuracy, {
                        ถูก: newcount,

                    });
                });
            });



        }

        else if (text === b) {

            agent.add("กรุณากดปุ่มติดต่อเจ้าหน้าที่");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ไม่ถูก + 1;

                    t.update(Count_Accuracy, {
                        ไม่ถูก: newcount,

                    });
                });
            });

        }

        else {
            //เชคว่ามี ตัว doc อยู๋ไหม ถ้าไม่ ก็ set ค่า 
            // count_intent 
            Count_Intent.get().then(function (docs) {
                if (!docs.exists) {
                    Count_Intent.set({
                        การขอรับเอกสารการศึกษา: 1
                    });
                }

                else {
                    //เลขcount เวลามีคนเข้ามาสอบถาม

                    db.runTransaction(t => {
                        return t.get(Count_Intent).then(doc => {
                            if (doc.data().การขอรับเอกสารการศึกษา > 0) {
                                let newcount = doc.data().การขอรับเอกสารการศึกษา + 1;

                                t.update(Count_Intent, {
                                    การขอรับเอกสารการศึกษา: newcount

                                });
                            } else {
                                t.update(Count_Intent, {
                                    การขอรับเอกสารการศึกษา: 1
                                });

                            }

                        });
                    });
                }
            });

            //return ข้อมูลคำตอบ 
            return admin.firestore().collection('Education_Documentary').doc('Topic').collection('ใบรับรองการเป็นนักศึกษา').orderBy("date", "desc").limit(1).get().then((snapshot) => {
                snapshot.forEach(doc => {
                    agent.add(doc.data().description);
                    agent.add(payload่json); //แสดง paylaod
                });
            });
        }

    }



    //ใบรับรองผลการเรียน
    function Transcript(agent) {
        let payload = {
            "type": "template",
            "altText": "this is a confirm template",
            "template": {
                "type": "confirm",
                "actions": [
                    {
                        "type": "message",
                        "label": "ถูก",
                        "text": "ได้รับคำตอบถูกต้องในเรื่องใบรับรองผลการเรียน"
                    },
                    {
                        "type": "message",
                        "label": "ไม่ถูก",
                        "text": "ได้รับคำตอบไม่ถูกต้องในเรื่องใบรับรองผลการเรียน"
                    }
                ],
                "text": "คุณได้รับคำตอบถูกต้องไหมคะ?"
            }
        };

        //ประกาศตัวแปร payload เพื่อแสดงออกหน้าจอ
        let payload่json = new Payload(`LINE`, payload, { sendAsMessage: true });
        let text = request.body.queryResult.queryText;
        let c = 'ได้รับคำตอบถูกต้องในเรื่องใบรับรองผลการเรียน';
        let b = 'ได้รับคำตอบไม่ถูกต้องในเรื่องใบรับรองผลการเรียน';

        //Count_Accuracy
        let Count_Accuracy = admin.firestore().collection("Count_Accuracy").doc(date.toLocaleDateString()).collection("การขอรับเอกสารการศึกษา").doc("ใบรับรองผลการเรียน");
        Count_Accuracy.get().then(function (docs) {
            if (!docs.exists) {
                Count_Accuracy.set({
                    ถูก: 0,
                    ไม่ถูก: 0
                });
            }

        });


        if (text === c) {
            agent.add("ขอบคุณค่ะ");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ถูก + 1;

                    t.update(Count_Accuracy, {
                        ถูก: newcount,

                    });
                });
            });



        }

        else if (text === b) {

            agent.add("กรุณากดปุ่มติดต่อเจ้าหน้าที่");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ไม่ถูก + 1;

                    t.update(Count_Accuracy, {
                        ไม่ถูก: newcount,

                    });
                });
            });

        }

        else {
            //เชคว่ามี ตัว doc อยู๋ไหม ถ้าไม่ ก็ set ค่า 
            // count_intent 
            Count_Intent.get().then(function (docs) {
                if (!docs.exists) {
                    Count_Intent.set({
                        การขอรับเอกสารการศึกษา: 1
                    });
                }

                else {
                    //เลขcount เวลามีคนเข้ามาสอบถาม

                    db.runTransaction(t => {
                        return t.get(Count_Intent).then(doc => {
                            if (doc.data().การขอรับเอกสารการศึกษา > 0) {
                                let newcount = doc.data().การขอรับเอกสารการศึกษา + 1;

                                t.update(Count_Intent, {
                                    การขอรับเอกสารการศึกษา: newcount

                                });
                            } else {
                                t.update(Count_Intent, {
                                    การขอรับเอกสารการศึกษา: 1
                                });

                            }

                        });
                    });
                }
            });

            //return ข้อมูลคำตอบ 
            return admin.firestore().collection('Education_Documentary').doc('Topic').collection('ใบรับรองผลการเรียน').orderBy("date", "desc").limit(1).get().then((snapshot) => {
                snapshot.forEach(doc => {
                    agent.add(doc.data().description);
                    agent.add(payload่json); //แสดง paylaod
                });
            });
        }

    }


    //ใบขอรับปริญญาย้อนหลัง
    function Recovery_Diploma(agent) {
        let payload = {
            "type": "template",
            "altText": "this is a confirm template",
            "template": {
                "type": "confirm",
                "actions": [
                    {
                        "type": "message",
                        "label": "ถูก",
                        "text": "ได้รับคำตอบถูกต้องในเรื่องใบขอรับปริญญาย้อนหลัง"
                    },
                    {
                        "type": "message",
                        "label": "ไม่ถูก",
                        "text": "ได้รับคำตอบไม่ถูกต้องในเรื่องใบขอรับปริญญาย้อนหลัง"
                    }
                ],
                "text": "คุณได้รับคำตอบถูกต้องไหมคะ?"
            }
        };

        //ประกาศตัวแปร payload เพื่อแสดงออกหน้าจอ
        let payload่json = new Payload(`LINE`, payload, { sendAsMessage: true });
        let text = request.body.queryResult.queryText;
        let c = 'ได้รับคำตอบถูกต้องในเรื่องใบขอรับปริญญาย้อนหลัง';
        let b = 'ได้รับคำตอบไม่ถูกต้องในเรื่องใบขอรับปริญญาย้อนหลัง';

        //Count_Accuracy
        let Count_Accuracy = admin.firestore().collection("Count_Accuracy").doc(date.toLocaleDateString()).collection("การขอรับเอกสารการศึกษา").doc("ใบขอรับปริญญาย้อนหลัง");
        Count_Accuracy.get().then(function (docs) {
            if (!docs.exists) {
                Count_Accuracy.set({
                    ถูก: 0,
                    ไม่ถูก: 0
                });
            }

        });


        if (text === c) {
            agent.add("ขอบคุณค่ะ");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ถูก + 1;

                    t.update(Count_Accuracy, {
                        ถูก: newcount,

                    });
                });
            });



        }

        else if (text === b) {

            agent.add("กรุณากดปุ่มติดต่อเจ้าหน้าที่");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ไม่ถูก + 1;

                    t.update(Count_Accuracy, {
                        ไม่ถูก: newcount,

                    });
                });
            });

        }

        else {
            //เชคว่ามี ตัว doc อยู๋ไหม ถ้าไม่ ก็ set ค่า 
            // count_intent 
            Count_Intent.get().then(function (docs) {
                if (!docs.exists) {
                    Count_Intent.set({
                        การขอรับเอกสารการศึกษา: 1
                    });
                }

                else {
                    //เลขcount เวลามีคนเข้ามาสอบถาม

                    db.runTransaction(t => {
                        return t.get(Count_Intent).then(doc => {
                            if (doc.data().การขอรับเอกสารการศึกษา > 0) {
                                let newcount = doc.data().การขอรับเอกสารการศึกษา + 1;

                                t.update(Count_Intent, {
                                    การขอรับเอกสารการศึกษา: newcount

                                });
                            } else {
                                t.update(Count_Intent, {
                                    การขอรับเอกสารการศึกษา: 1
                                });

                            }

                        });
                    });
                }
            });

            //return ข้อมูลคำตอบ 
            return admin.firestore().collection('Education_Documentary').doc('Topic').collection('ใบขอรับปริญญาย้อนหลัง').orderBy("date", "desc").limit(1).get().then((snapshot) => {
                snapshot.forEach(doc => {
                    agent.add(doc.data().description);
                    agent.add(payload่json); //แสดง paylaod
                });
            });
        }

    }

    //ระยะเวลาการขอเอกสาร
    function Period_of_Documentary(agent) {
        let payload = {
            "type": "template",
            "altText": "this is a confirm template",
            "template": {
                "type": "confirm",
                "actions": [
                    {
                        "type": "message",
                        "label": "ถูก",
                        "text": "ได้รับคำตอบถูกต้องในเรื่องระยะเวลาการขอเอกสาร"
                    },
                    {
                        "type": "message",
                        "label": "ไม่ถูก",
                        "text": "ได้รับคำตอบไม่ถูกต้องในเรื่องระยะเวลาการขอเอกสาร"
                    }
                ],
                "text": "คุณได้รับคำตอบถูกต้องไหมคะ?"
            }
        };

        //ประกาศตัวแปร payload เพื่อแสดงออกหน้าจอ
        let payload่json = new Payload(`LINE`, payload, { sendAsMessage: true });
        let text = request.body.queryResult.queryText;
        let c = 'ได้รับคำตอบถูกต้องในเรื่องระยะเวลาการขอเอกสาร';
        let b = 'ได้รับคำตอบไม่ถูกต้องในเรื่องระยะเวลาการขอเอกสาร';

        //Count_Accuracy
        let Count_Accuracy = admin.firestore().collection("Count_Accuracy").doc(date.toLocaleDateString()).collection("การขอรับเอกสารการศึกษา").doc("ระยะเวลาการขอเอกสาร");
        Count_Accuracy.get().then(function (docs) {
            if (!docs.exists) {
                Count_Accuracy.set({
                    ถูก: 0,
                    ไม่ถูก: 0
                });
            }

        });


        if (text === c) {
            agent.add("ขอบคุณค่ะ");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ถูก + 1;

                    t.update(Count_Accuracy, {
                        ถูก: newcount,

                    });
                });
            });



        }

        else if (text === b) {

            agent.add("กรุณากดปุ่มติดต่อเจ้าหน้าที่");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ไม่ถูก + 1;

                    t.update(Count_Accuracy, {
                        ไม่ถูก: newcount,

                    });
                });
            });

        }

        else {
            //เชคว่ามี ตัว doc อยู๋ไหม ถ้าไม่ ก็ set ค่า 
            // count_intent 
            Count_Intent.get().then(function (docs) {
                if (!docs.exists) {
                    Count_Intent.set({
                        การขอรับเอกสารการศึกษา: 1
                    });
                }

                else {
                    //เลขcount เวลามีคนเข้ามาสอบถาม

                    db.runTransaction(t => {
                        return t.get(Count_Intent).then(doc => {
                            if (doc.data().การขอรับเอกสารการศึกษา > 0) {
                                let newcount = doc.data().การขอรับเอกสารการศึกษา + 1;

                                t.update(Count_Intent, {
                                    การขอรับเอกสารการศึกษา: newcount

                                });
                            } else {
                                t.update(Count_Intent, {
                                    การขอรับเอกสารการศึกษา: 1
                                });

                            }

                        });
                    });
                }
            });

            //return ข้อมูลคำตอบ 
            return admin.firestore().collection('Education_Documentary').doc('Topic').collection('ระยะเวลาการขอเอกสาร').orderBy("date", "desc").limit(1).get().then((snapshot) => {
                snapshot.forEach(doc => {
                    agent.add(doc.data().description);
                    agent.add(payload่json); //แสดง paylaod
                });
            });
        }

    }


    //ปัญหาการรับเอกสาร
    function Receiving_documentary(agent) {
        let payload = {
            "type": "template",
            "altText": "this is a confirm template",
            "template": {
                "type": "confirm",
                "actions": [
                    {
                        "type": "message",
                        "label": "ถูก",
                        "text": "ได้รับคำตอบถูกต้องในเรื่องปัญหาการรับเอกสาร"
                    },
                    {
                        "type": "message",
                        "label": "ไม่ถูก",
                        "text": "ได้รับคำตอบไม่ถูกต้องในเรื่องปัญหาการรับเอกสาร"
                    }
                ],
                "text": "คุณได้รับคำตอบถูกต้องไหมคะ?"
            }
        };

        //ประกาศตัวแปร payload เพื่อแสดงออกหน้าจอ
        let payload่json = new Payload(`LINE`, payload, { sendAsMessage: true });
        let text = request.body.queryResult.queryText;
        let c = 'ได้รับคำตอบถูกต้องในเรื่องปัญหาการรับเอกสาร';
        let b = 'ได้รับคำตอบไม่ถูกต้องในเรื่องปัญหาการรับเอกสาร';

        //Count_Accuracy
        let Count_Accuracy = admin.firestore().collection("Count_Accuracy").doc(date.toLocaleDateString()).collection("การขอรับเอกสารการศึกษา").doc("ปัญหาการรับเอกสาร");
        Count_Accuracy.get().then(function (docs) {
            if (!docs.exists) {
                Count_Accuracy.set({
                    ถูก: 0,
                    ไม่ถูก: 0
                });
            }

        });


        if (text === c) {
            agent.add("ขอบคุณค่ะ");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ถูก + 1;

                    t.update(Count_Accuracy, {
                        ถูก: newcount,

                    });
                });
            });



        }

        else if (text === b) {

            agent.add("กรุณากดปุ่มติดต่อเจ้าหน้าที่");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ไม่ถูก + 1;

                    t.update(Count_Accuracy, {
                        ไม่ถูก: newcount,

                    });
                });
            });

        }

        else {
            //เชคว่ามี ตัว doc อยู๋ไหม ถ้าไม่ ก็ set ค่า 
            // count_intent 
            Count_Intent.get().then(function (docs) {
                if (!docs.exists) {
                    Count_Intent.set({
                        การขอรับเอกสารการศึกษา: 1
                    });
                }

                else {
                    //เลขcount เวลามีคนเข้ามาสอบถาม

                    db.runTransaction(t => {
                        return t.get(Count_Intent).then(doc => {
                            if (doc.data().การขอรับเอกสารการศึกษา > 0) {
                                let newcount = doc.data().การขอรับเอกสารการศึกษา + 1;

                                t.update(Count_Intent, {
                                    การขอรับเอกสารการศึกษา: newcount

                                });
                            } else {
                                t.update(Count_Intent, {
                                    การขอรับเอกสารการศึกษา: 1
                                });

                            }

                        });
                    });
                }
            });

            //return ข้อมูลคำตอบ 
            return admin.firestore().collection('Education_Documentary').doc('Topic').collection('ปัญหาการรับเอกสาร').orderBy("date", "desc").limit(1).get().then((snapshot) => {
                snapshot.forEach(doc => {
                    agent.add(doc.data().description);
                    agent.add(payload่json); //แสดง paylaod
                });
            });
        }

    }



    //ปฎิทินการศึกษา
    //ภาคการศึกษาปกติ
    function Regular_calendar(agent) {
        let payload = {
            "type": "template",
            "altText": "this is a confirm template",
            "template": {
                "type": "confirm",
                "actions": [
                    {
                        "type": "message",
                        "label": "ถูก",
                        "text": "ได้รับคำตอบถูกต้องในเรื่องปฎิทินภาคการศึกษาปกติ"
                    },
                    {
                        "type": "message",
                        "label": "ไม่ถูก",
                        "text": "ได้รับคำตอบไม่ถูกต้องในเรื่องปฎิทินภาคการศึกษาปกติ"
                    }
                ],
                "text": "คุณได้รับคำตอบถูกต้องไหมคะ?"
            }
        };

        //ประกาศตัวแปร payload เพื่อแสดงออกหน้าจอ
        let payload่json = new Payload(`LINE`, payload, { sendAsMessage: true });
        let text = request.body.queryResult.queryText;
        let c = 'ได้รับคำตอบถูกต้องในเรื่องปฎิทินภาคการศึกษาปกติ';
        let b = 'ได้รับคำตอบไม่ถูกต้องในเรื่องปฎิทินภาคการศึกษาปกติ';

        //Count_Accuracy
        let Count_Accuracy = admin.firestore().collection("Count_Accuracy").doc(date.toLocaleDateString()).collection("ปฏิทินการศึกษา").doc("ภาคการศึกษาปกติ");
        Count_Accuracy.get().then(function (docs) {
            if (!docs.exists) {
                Count_Accuracy.set({
                    ถูก: 0,
                    ไม่ถูก: 0
                });
            }

        });


        if (text === c) {
            agent.add("ขอบคุณค่ะ");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ถูก + 1;

                    t.update(Count_Accuracy, {
                        ถูก: newcount,

                    });
                });
            });



        }

        else if (text === b) {

            agent.add("กรุณากดปุ่มติดต่อเจ้าหน้าที่");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ไม่ถูก + 1;

                    t.update(Count_Accuracy, {
                        ไม่ถูก: newcount,

                    });
                });
            });

        }

        else {
            //เชคว่ามี ตัว doc อยู๋ไหม ถ้าไม่ ก็ set ค่า 
            // count_intent 
            Count_Intent.get().then(function (docs) {
                if (!docs.exists) {
                    Count_Intent.set({
                        ปฎิทินการศึกษา: 1
                    });
                }

                else {
                    //เลขcount เวลามีคนเข้ามาสอบถาม

                    db.runTransaction(t => {
                        return t.get(Count_Intent).then(doc => {
                            if (doc.data().ปฎิทินการศึกษา > 0) {
                                let newcount = doc.data().ปฎิทินการศึกษา + 1;

                                t.update(Count_Intent, {
                                    ปฎิทินการศึกษา: newcount

                                });
                            } else {
                                t.update(Count_Intent, {
                                    ปฎิทินการศึกษา: 1
                                });

                            }

                        });
                    });
                }
            });

            //return ข้อมูลคำตอบ 
            return admin.firestore().collection('Calendar').doc('Topic').collection('ภาคการศึกษาปกติ').orderBy("date", "desc").limit(1).get().then((snapshot) => {
                snapshot.forEach(doc => {
                    agent.add(doc.data().description);
                    agent.add(payload่json); //แสดง paylaod
                });
            });
        }

    }

    //ภาคการศึกษาพิเศษ
    function Spacial_calendar(agent) {
        let payload = {
            "type": "template",
            "altText": "this is a confirm template",
            "template": {
                "type": "confirm",
                "actions": [
                    {
                        "type": "message",
                        "label": "ถูก",
                        "text": "ได้รับคำตอบถูกต้องในเรื่องปฎิทินภาคการศึกษาพิเศษ"
                    },
                    {
                        "type": "message",
                        "label": "ไม่ถูก",
                        "text": "ได้รับคำตอบไม่ถูกต้องในเรื่องปฎิทินภาคการศึกษาพิเศษ"
                    }
                ],
                "text": "คุณได้รับคำตอบถูกต้องไหมคะ?"
            }
        };

        //ประกาศตัวแปร payload เพื่อแสดงออกหน้าจอ
        let payload่json = new Payload(`LINE`, payload, { sendAsMessage: true });
        let text = request.body.queryResult.queryText;
        let c = 'ได้รับคำตอบถูกต้องในเรื่องปฎิทินภาคการศึกษาพิเศษ';
        let b = 'ได้รับคำตอบไม่ถูกต้องในเรื่องปฎิทินภาคการศึกษาพิเศษ';

        //Count_Accuracy
        let Count_Accuracy = admin.firestore().collection("Count_Accuracy").doc(date.toLocaleDateString()).collection("ปฏิทินการศึกษา").doc("ภาคการศึกษาพิเศษ");
        Count_Accuracy.get().then(function (docs) {
            if (!docs.exists) {
                Count_Accuracy.set({
                    ถูก: 0,
                    ไม่ถูก: 0
                });
            }

        });


        if (text === c) {
            agent.add("ขอบคุณค่ะ");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ถูก + 1;

                    t.update(Count_Accuracy, {
                        ถูก: newcount,

                    });
                });
            });



        }

        else if (text === b) {

            agent.add("กรุณากดปุ่มติดต่อเจ้าหน้าที่");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ไม่ถูก + 1;

                    t.update(Count_Accuracy, {
                        ไม่ถูก: newcount,

                    });
                });
            });

        }

        else {
            //เชคว่ามี ตัว doc อยู๋ไหม ถ้าไม่ ก็ set ค่า 
            // count_intent 
            Count_Intent.get().then(function (docs) {
                if (!docs.exists) {
                    Count_Intent.set({
                        ปฎิทินการศึกษา: 1
                    });
                }

                else {
                    //เลขcount เวลามีคนเข้ามาสอบถาม

                    db.runTransaction(t => {
                        return t.get(Count_Intent).then(doc => {
                            if (doc.data().ปฎิทินการศึกษา > 0) {
                                let newcount = doc.data().ปฎิทินการศึกษา + 1;

                                t.update(Count_Intent, {
                                    ปฎิทินการศึกษา: newcount

                                });
                            } else {
                                t.update(Count_Intent, {
                                    ปฎิทินการศึกษา: 1
                                });

                            }

                        });
                    });
                }
            });

            //return ข้อมูลคำตอบ 
            return admin.firestore().collection('Calendar').doc('Topic').collection('ภาคการศึกษาพิเศษ').orderBy("date", "desc").limit(1).get().then((snapshot) => {
                snapshot.forEach(doc => {
                    agent.add(doc.data().description);
                    agent.add(payload่json); //แสดง paylaod
                });
            });
        }

    }


    //ภาคการศึกษาฤดูร้อน
    function Summer(agent) {
        let payload = {
            "type": "template",
            "altText": "this is a confirm template",
            "template": {
                "type": "confirm",
                "actions": [
                    {
                        "type": "message",
                        "label": "ถูก",
                        "text": "ได้รับคำตอบถูกต้องในเรื่องปฎิทินภาคการศึกษาฤดูร้อน"
                    },
                    {
                        "type": "message",
                        "label": "ไม่ถูก",
                        "text": "ได้รับคำตอบไม่ถูกต้องในเรื่องปฎิทินภาคการศึกษาฤดูร้อน"
                    }
                ],
                "text": "คุณได้รับคำตอบถูกต้องไหมคะ?"
            }
        };

        //ประกาศตัวแปร payload เพื่อแสดงออกหน้าจอ
        let payload่json = new Payload(`LINE`, payload, { sendAsMessage: true });
        let text = request.body.queryResult.queryText;
        let c = 'ได้รับคำตอบถูกต้องในเรื่องปฎิทินภาคการศึกษาฤดูร้อน';
        let b = 'ได้รับคำตอบไม่ถูกต้องในเรื่องปฎิทินภาคการศึกษาฤดูร้อน';

        //Count_Accuracy
        let Count_Accuracy = admin.firestore().collection("Count_Accuracy").doc(date.toLocaleDateString()).collection("ปฏิทินการศึกษา").doc("ภาคการศึกษาฤดูร้อน");
        Count_Accuracy.get().then(function (docs) {
            if (!docs.exists) {
                Count_Accuracy.set({
                    ถูก: 0,
                    ไม่ถูก: 0
                });
            }

        });


        if (text === c) {
            agent.add("ขอบคุณค่ะ");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ถูก + 1;

                    t.update(Count_Accuracy, {
                        ถูก: newcount,

                    });
                });
            });



        }

        else if (text === b) {

            agent.add("กรุณากดปุ่มติดต่อเจ้าหน้าที่");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ไม่ถูก + 1;

                    t.update(Count_Accuracy, {
                        ไม่ถูก: newcount,

                    });
                });
            });

        }

        else {
            //เชคว่ามี ตัว doc อยู๋ไหม ถ้าไม่ ก็ set ค่า 
            // count_intent 
            Count_Intent.get().then(function (docs) {
                if (!docs.exists) {
                    Count_Intent.set({
                        ปฎิทินการศึกษา: 1
                    });
                }

                else {
                    //เลขcount เวลามีคนเข้ามาสอบถาม

                    db.runTransaction(t => {
                        return t.get(Count_Intent).then(doc => {
                            if (doc.data().ปฎิทินการศึกษา > 0) {
                                let newcount = doc.data().ปฎิทินการศึกษา + 1;

                                t.update(Count_Intent, {
                                    ปฎิทินการศึกษา: newcount

                                });
                            } else {
                                t.update(Count_Intent, {
                                    ปฎิทินการศึกษา: 1
                                });

                            }

                        });
                    });
                }
            });

            //return ข้อมูลคำตอบ 
            return admin.firestore().collection('Calendar').doc('Topic').collection('ภาคการศึกษาฤดูร้อน').orderBy("date", "desc").limit(1).get().then((snapshot) => {
                snapshot.forEach(doc => {
                    agent.add(doc.data().description);
                    agent.add(payload่json); //แสดง paylaod
                });
            });
        }

    }


    //การสมัครเรียน
    //ภาคการศึกษาปกติ
    function Regular_application(agent) {
        let payload = {
            "type": "template",
            "altText": "this is a confirm template",
            "template": {
                "type": "confirm",
                "actions": [
                    {
                        "type": "message",
                        "label": "ถูก",
                        "text": "ได้รับคำตอบถูกต้องในเรื่องการสมัครเรียนภาคการศึกษาปกติ"
                    },
                    {
                        "type": "message",
                        "label": "ไม่ถูก",
                        "text": "ได้รับคำตอบไม่ถูกต้องในเรื่องการสมัครเรียนภาคการศึกษาปกติ"
                    }
                ],
                "text": "คุณได้รับคำตอบถูกต้องไหมคะ?"
            }
        };

        //ประกาศตัวแปร payload เพื่อแสดงออกหน้าจอ
        let payload่json = new Payload(`LINE`, payload, { sendAsMessage: true });
        let text = request.body.queryResult.queryText;
        let c = 'ได้รับคำตอบถูกต้องในเรื่องการสมัครเรียนภาคการศึกษาปกติ';
        let b = 'ได้รับคำตอบไม่ถูกต้องในเรื่องการสมัครเรียนภาคการศึกษาปกติ';

        //Count_Accuracy
        let Count_Accuracy = admin.firestore().collection("Count_Accuracy").doc(date.toLocaleDateString()).collection("การสมัครเรียน").doc("ภาคการศึกษาปกติ");
        Count_Accuracy.get().then(function (docs) {
            if (!docs.exists) {
                Count_Accuracy.set({
                    ถูก: 0,
                    ไม่ถูก: 0
                });
            }

        });


        if (text === c) {
            agent.add("ขอบคุณค่ะ");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ถูก + 1;

                    t.update(Count_Accuracy, {
                        ถูก: newcount,

                    });
                });
            });



        }

        else if (text === b) {

            agent.add("กรุณากดปุ่มติดต่อเจ้าหน้าที่");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ไม่ถูก + 1;

                    t.update(Count_Accuracy, {
                        ไม่ถูก: newcount,

                    });
                });
            });

        }

        else {
            //เชคว่ามี ตัว doc อยู๋ไหม ถ้าไม่ ก็ set ค่า 
            // count_intent 
            Count_Intent.get().then(function (docs) {
                if (!docs.exists) {
                    Count_Intent.set({
                        การสมัครเรียน: 1
                    });
                }

                else {
                    //เลขcount เวลามีคนเข้ามาสอบถาม

                    db.runTransaction(t => {
                        return t.get(Count_Intent).then(doc => {
                            if (doc.data().การสมัครเรียน > 0) {
                                let newcount = doc.data().การสมัครเรียน + 1;

                                t.update(Count_Intent, {
                                    การสมัครเรียน: newcount

                                });
                            } else {
                                t.update(Count_Intent, {
                                    การสมัครเรียน: 1
                                });

                            }

                        });
                    });
                }
            });

            //return ข้อมูลคำตอบ 
            return admin.firestore().collection('Application_study').doc('Topic').collection('ภาคการศึกษาปกติ').orderBy("date", "desc").limit(1).get().then((snapshot) => {
                snapshot.forEach(doc => {
                    agent.add(doc.data().description);
                    agent.add(payload่json); //แสดง paylaod
                });
            });
        }

    }


    //ภาคการศึกษาพิเศษ
    function Spacial_application(agent) {
        let payload = {
            "type": "template",
            "altText": "this is a confirm template",
            "template": {
                "type": "confirm",
                "actions": [
                    {
                        "type": "message",
                        "label": "ถูก",
                        "text": "ได้รับคำตอบถูกต้องในเรื่องการสมัครเรียนภาคการศึกษาพิเศษ"
                    },
                    {
                        "type": "message",
                        "label": "ไม่ถูก",
                        "text": "ได้รับคำตอบไม่ถูกต้องในเรื่องการสมัครเรียนภาคการศึกษาพิเศษ"
                    }
                ],
                "text": "คุณได้รับคำตอบถูกต้องไหมคะ?"
            }
        };

        //ประกาศตัวแปร payload เพื่อแสดงออกหน้าจอ
        let payload่json = new Payload(`LINE`, payload, { sendAsMessage: true });
        let text = request.body.queryResult.queryText;
        let c = 'ได้รับคำตอบถูกต้องในเรื่องการสมัครเรียนภาคการศึกษาพิเศษ';
        let b = 'ได้รับคำตอบไม่ถูกต้องในเรื่องการสมัครเรียนภาคการศึกษาพิเศษ';

        //Count_Accuracy
        let Count_Accuracy = admin.firestore().collection("Count_Accuracy").doc(date.toLocaleDateString()).collection("การสมัครเรียน").doc("ภาคการศึกษาพิเศษ");
        Count_Accuracy.get().then(function (docs) {
            if (!docs.exists) {
                Count_Accuracy.set({
                    ถูก: 0,
                    ไม่ถูก: 0
                });
            }

        });


        if (text === c) {
            agent.add("ขอบคุณค่ะ");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ถูก + 1;

                    t.update(Count_Accuracy, {
                        ถูก: newcount,

                    });
                });
            });



        }

        else if (text === b) {

            agent.add("กรุณากดปุ่มติดต่อเจ้าหน้าที่");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ไม่ถูก + 1;

                    t.update(Count_Accuracy, {
                        ไม่ถูก: newcount,

                    });
                });
            });

        }

        else {
            //เชคว่ามี ตัว doc อยู๋ไหม ถ้าไม่ ก็ set ค่า 
            // count_intent 
            Count_Intent.get().then(function (docs) {
                if (!docs.exists) {
                    Count_Intent.set({
                        การสมัครเรียน: 1
                    });
                }

                else {
                    //เลขcount เวลามีคนเข้ามาสอบถาม

                    db.runTransaction(t => {
                        return t.get(Count_Intent).then(doc => {
                            if (doc.data().การสมัครเรียน > 0) {
                                let newcount = doc.data().การสมัครเรียน + 1;

                                t.update(Count_Intent, {
                                    การสมัครเรียน: newcount

                                });
                            } else {
                                t.update(Count_Intent, {
                                    การสมัครเรียน: 1
                                });

                            }

                        });
                    });
                }
            });

            //return ข้อมูลคำตอบ 
            return admin.firestore().collection('Application_study').doc('Topic').collection('ภาคการศึกษาพิเศษ').orderBy("date", "desc").limit(1).get().then((snapshot) => {
                snapshot.forEach(doc => {
                    agent.add(doc.data().description);
                    agent.add(payload่json); //แสดง paylaod
                });
            });
        }

    }


    //ภาคการศึกษาฤดูร้อน
    function Summer_application(agent) {
        let payload = {
            "type": "template",
            "altText": "this is a confirm template",
            "template": {
                "type": "confirm",
                "actions": [
                    {
                        "type": "message",
                        "label": "ถูก",
                        "text": "ได้รับคำตอบถูกต้องในเรื่องการสมัครเรียนภาคการศึกษาฤดูร้อน"
                    },
                    {
                        "type": "message",
                        "label": "ไม่ถูก",
                        "text": "ได้รับคำตอบไม่ถูกต้องในเรื่องการสมัครเรียนภาคการศึกษาฤดูร้อน"
                    }
                ],
                "text": "คุณได้รับคำตอบถูกต้องไหมคะ?"
            }
        };

        //ประกาศตัวแปร payload เพื่อแสดงออกหน้าจอ
        let payload่json = new Payload(`LINE`, payload, { sendAsMessage: true });
        let text = request.body.queryResult.queryText;
        let c = 'ได้รับคำตอบถูกต้องในเรื่องการสมัครเรียนภาคการศึกษาฤดูร้อน';
        let b = 'ได้รับคำตอบไม่ถูกต้องในเรื่องการสมัครเรียนภาคการศึกษาฤดูร้อน';

        //Count_Accuracy
        let Count_Accuracy = admin.firestore().collection("Count_Accuracy").doc(date.toLocaleDateString()).collection("การสมัครเรียน").doc("ภาคการศึกษาฤดูร้อน");
        Count_Accuracy.get().then(function (docs) {
            if (!docs.exists) {
                Count_Accuracy.set({
                    ถูก: 0,
                    ไม่ถูก: 0
                });
            }

        });


        if (text === c) {
            agent.add("ขอบคุณค่ะ");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ถูก + 1;

                    t.update(Count_Accuracy, {
                        ถูก: newcount,

                    });
                });
            });



        }

        else if (text === b) {

            agent.add("กรุณากดปุ่มติดต่อเจ้าหน้าที่");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ไม่ถูก + 1;

                    t.update(Count_Accuracy, {
                        ไม่ถูก: newcount,

                    });
                });
            });

        }

        else {
            //เชคว่ามี ตัว doc อยู๋ไหม ถ้าไม่ ก็ set ค่า 
            // count_intent 
            Count_Intent.get().then(function (docs) {
                if (!docs.exists) {
                    Count_Intent.set({
                        การสมัครเรียน: 1
                    });
                }

                else {
                    //เลขcount เวลามีคนเข้ามาสอบถาม

                    db.runTransaction(t => {
                        return t.get(Count_Intent).then(doc => {
                            if (doc.data().การสมัครเรียน > 0) {
                                let newcount = doc.data().การสมัครเรียน + 1;

                                t.update(Count_Intent, {
                                    การสมัครเรียน: newcount

                                });
                            } else {
                                t.update(Count_Intent, {
                                    การสมัครเรียน: 1
                                });

                            }

                        });
                    });
                }
            });

            //return ข้อมูลคำตอบ 
            return admin.firestore().collection('Application_study').doc('Topic').collection('ภาคการศึกษาฤดูร้อน').orderBy("date", "desc").limit(1).get().then((snapshot) => {
                snapshot.forEach(doc => {
                    agent.add(doc.data().description);
                    agent.add(payload่json); //แสดง paylaod
                });
            });
        }

    }

    //ค่าธรรมเนียมการศึกษา Tuition_fee
    //คณะครุศาสตร์
    // สาขาคณิตศาสตร์
    function Mathematics(agent) {
        let payload = {
            "type": "template",
            "altText": "this is a confirm template",
            "template": {
                "type": "confirm",
                "actions": [
                    {
                        "type": "message",
                        "label": "ถูก",
                        "text": "ได้รับคำตอบถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาคณิตศาสตร์"
                    },
                    {
                        "type": "message",
                        "label": "ไม่ถูก",
                        "text": "ได้รับคำตอบไม่ถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาคณิตศาสตร์"
                    }
                ],
                "text": "คุณได้รับคำตอบถูกต้องไหมคะ?"
            }
        };

        //ประกาศตัวแปร payload เพื่อแสดงออกหน้าจอ
        let payload่json = new Payload(`LINE`, payload, { sendAsMessage: true });
        let text = request.body.queryResult.queryText;
        let c = 'ได้รับคำตอบถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาคณิตศาสตร์';
        let b = 'ได้รับคำตอบไม่ถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาคณิตศาสตร์';

        //Count_Accuracy
        let Count_Accuracy = admin.firestore().collection("Count_Accuracy").doc(date.toLocaleDateString()).collection("ค่าธรรมเนียมการศึกษา").doc("คณะครุศาสตร์").collection("Subject").doc("คณิตศาสตร์");
        Count_Accuracy.get().then(function (docs) {
            if (!docs.exists) {
                Count_Accuracy.set({
                    ถูก: 0,
                    ไม่ถูก: 0
                });
            }

        });


        if (text === c) {
            agent.add("ขอบคุณค่ะ");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ถูก + 1;

                    t.update(Count_Accuracy, {
                        ถูก: newcount,

                    });
                });
            });



        }

        else if (text === b) {

            agent.add("กรุณากดปุ่มติดต่อเจ้าหน้าที่");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ไม่ถูก + 1;

                    t.update(Count_Accuracy, {
                        ไม่ถูก: newcount,

                    });
                });
            });

        }

        else {
            //เชคว่ามี ตัว doc อยู๋ไหม ถ้าไม่ ก็ set ค่า 
            // count_intent 
            Count_Intent.get().then(function (docs) {
                if (!docs.exists) {
                    Count_Intent.set({
                        ค่าธรรมเนียมการศึกษา: 1
                    });
                }

                else {
                    //เลขcount เวลามีคนเข้ามาสอบถาม

                    db.runTransaction(t => {
                        return t.get(Count_Intent).then(doc => {
                            if (doc.data().ค่าธรรมเนียมการศึกษา > 0) {
                                let newcount = doc.data().ค่าธรรมเนียมการศึกษา + 1;

                                t.update(Count_Intent, {
                                    ค่าธรรมเนียมการศึกษา: newcount

                                });
                            } else {
                                t.update(Count_Intent, {
                                    ค่าธรรมเนียมการศึกษา: 1
                                });

                            }

                        });
                    });
                }
            });

            //return ข้อมูลคำตอบ 
            return admin.firestore().collection('Tuition_fee').doc('คณะครุศาสตร์').collection('คณิตศาสตร์').orderBy("date", "desc").limit(1).get().then((snapshot) => {
                snapshot.forEach(doc => {
                    agent.add(doc.data().description);
                    agent.add(payload่json); //แสดง paylaod
                });
            });
        }

    }


    //การสอนวิทยาศาสตร์ทั่วไป
    function Teaching_General_Science(agent) {
        let payload = {
            "type": "template",
            "altText": "this is a confirm template",
            "template": {
                "type": "confirm",
                "actions": [
                    {
                        "type": "message",
                        "label": "ถูก",
                        "text": "ได้รับคำตอบถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาการสอนวิทยาศาสตร์ทั่วไป"
                    },
                    {
                        "type": "message",
                        "label": "ไม่ถูก",
                        "text": "ได้รับคำตอบไม่ถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาการสอนวิทยาศาสตร์ทั่วไป"
                    }
                ],
                "text": "คุณได้รับคำตอบถูกต้องไหมคะ?"
            }
        };

        //ประกาศตัวแปร payload เพื่อแสดงออกหน้าจอ
        let payload่json = new Payload(`LINE`, payload, { sendAsMessage: true });
        let text = request.body.queryResult.queryText;
        let c = 'ได้รับคำตอบถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาการสอนวิทยาศาสตร์ทั่วไป';
        let b = 'ได้รับคำตอบไม่ถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาการสอนวิทยาศาสตร์ทั่วไป';

        //Count_Accuracy
        let Count_Accuracy = admin.firestore().collection("Count_Accuracy").doc(date.toLocaleDateString()).collection("ค่าธรรมเนียมการศึกษา").doc("คณะครุศาสตร์").collection("Subject").doc("การสอนวิทยาศาสตร์ทั่วไป");
        Count_Accuracy.get().then(function (docs) {
            if (!docs.exists) {
                Count_Accuracy.set({
                    ถูก: 0,
                    ไม่ถูก: 0
                });
            }

        });


        if (text === c) {
            agent.add("ขอบคุณค่ะ");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ถูก + 1;

                    t.update(Count_Accuracy, {
                        ถูก: newcount,

                    });
                });
            });



        }

        else if (text === b) {

            agent.add("กรุณากดปุ่มติดต่อเจ้าหน้าที่");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ไม่ถูก + 1;

                    t.update(Count_Accuracy, {
                        ไม่ถูก: newcount,

                    });
                });
            });

        }

        else {
            //เชคว่ามี ตัว doc อยู๋ไหม ถ้าไม่ ก็ set ค่า 
            // count_intent 
            Count_Intent.get().then(function (docs) {
                if (!docs.exists) {
                    Count_Intent.set({
                        ค่าธรรมเนียมการศึกษา: 1
                    });
                }

                else {
                    //เลขcount เวลามีคนเข้ามาสอบถาม

                    db.runTransaction(t => {
                        return t.get(Count_Intent).then(doc => {
                            if (doc.data().ค่าธรรมเนียมการศึกษา > 0) {
                                let newcount = doc.data().ค่าธรรมเนียมการศึกษา + 1;

                                t.update(Count_Intent, {
                                    ค่าธรรมเนียมการศึกษา: newcount

                                });
                            } else {
                                t.update(Count_Intent, {
                                    ค่าธรรมเนียมการศึกษา: 1
                                });

                            }

                        });
                    });
                }
            });

            //return ข้อมูลคำตอบ 
            return admin.firestore().collection('Tuition_fee').doc('คณะครุศาสตร์').collection('การสอนวิทยาศาสตร์ทั่วไป').orderBy("date", "desc").limit(1).get().then((snapshot) => {
                snapshot.forEach(doc => {
                    agent.add(doc.data().description);
                    agent.add(payload่json); //แสดง paylaod
                });
            });
        }

    }



    //คอมพิวเตอร์ศึกษา
    function Computer_Education(agent) {
        let payload = {
            "type": "template",
            "altText": "this is a confirm template",
            "template": {
                "type": "confirm",
                "actions": [
                    {
                        "type": "message",
                        "label": "ถูก",
                        "text": "ได้รับคำตอบถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาคอมพิวเตอร์ศึกษา"
                    },
                    {
                        "type": "message",
                        "label": "ไม่ถูก",
                        "text": "ได้รับคำตอบไม่ถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาคอมพิวเตอร์ศึกษา"
                    }
                ],
                "text": "คุณได้รับคำตอบถูกต้องไหมคะ?"
            }
        };

        //ประกาศตัวแปร payload เพื่อแสดงออกหน้าจอ
        let payload่json = new Payload(`LINE`, payload, { sendAsMessage: true });
        let text = request.body.queryResult.queryText;
        let c = 'ได้รับคำตอบถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาคอมพิวเตอร์ศึกษา';
        let b = 'ได้รับคำตอบไม่ถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาคอมพิวเตอร์ศึกษา';

        //Count_Accuracy
        let Count_Accuracy = admin.firestore().collection("Count_Accuracy").doc(date.toLocaleDateString()).collection("ค่าธรรมเนียมการศึกษา").doc("คณะครุศาสตร์").collection("Subject").doc("คอมพิวเตอร์ศึกษา");
        Count_Accuracy.get().then(function (docs) {
            if (!docs.exists) {
                Count_Accuracy.set({
                    ถูก: 0,
                    ไม่ถูก: 0
                });
            }

        });


        if (text === c) {
            agent.add("ขอบคุณค่ะ");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ถูก + 1;

                    t.update(Count_Accuracy, {
                        ถูก: newcount,

                    });
                });
            });



        }

        else if (text === b) {

            agent.add("กรุณากดปุ่มติดต่อเจ้าหน้าที่");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ไม่ถูก + 1;

                    t.update(Count_Accuracy, {
                        ไม่ถูก: newcount,

                    });
                });
            });

        }

        else {
            //เชคว่ามี ตัว doc อยู๋ไหม ถ้าไม่ ก็ set ค่า 
            // count_intent 
            Count_Intent.get().then(function (docs) {
                if (!docs.exists) {
                    Count_Intent.set({
                        ค่าธรรมเนียมการศึกษา: 1
                    });
                }

                else {
                    //เลขcount เวลามีคนเข้ามาสอบถาม

                    db.runTransaction(t => {
                        return t.get(Count_Intent).then(doc => {
                            if (doc.data().ค่าธรรมเนียมการศึกษา > 0) {
                                let newcount = doc.data().ค่าธรรมเนียมการศึกษา + 1;

                                t.update(Count_Intent, {
                                    ค่าธรรมเนียมการศึกษา: newcount

                                });
                            } else {
                                t.update(Count_Intent, {
                                    ค่าธรรมเนียมการศึกษา: 1
                                });

                            }

                        });
                    });
                }
            });

            //return ข้อมูลคำตอบ 
            return admin.firestore().collection('Tuition_fee').doc('คณะครุศาสตร์').collection('คอมพิวเตอร์ศึกษา').orderBy("date", "desc").limit(1).get().then((snapshot) => {
                snapshot.forEach(doc => {
                    agent.add(doc.data().description);
                    agent.add(payload่json); //แสดง paylaod
                });
            });
        }

    }


    //การสอนภาษาไทย
    function Thai_Teaching(agent) {
        let payload = {
            "type": "template",
            "altText": "this is a confirm template",
            "template": {
                "type": "confirm",
                "actions": [
                    {
                        "type": "message",
                        "label": "ถูก",
                        "text": "ได้รับคำตอบถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาการสอนภาษาไทย"
                    },
                    {
                        "type": "message",
                        "label": "ไม่ถูก",
                        "text": "ได้รับคำตอบไม่ถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาการสอนภาษาไทย"
                    }
                ],
                "text": "คุณได้รับคำตอบถูกต้องไหมคะ?"
            }
        };

        //ประกาศตัวแปร payload เพื่อแสดงออกหน้าจอ
        let payload่json = new Payload(`LINE`, payload, { sendAsMessage: true });
        let text = request.body.queryResult.queryText;
        let c = 'ได้รับคำตอบถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาการสอนภาษาไทย';
        let b = 'ได้รับคำตอบไม่ถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาการสอนภาษาไทย';

        //Count_Accuracy
        let Count_Accuracy = admin.firestore().collection("Count_Accuracy").doc(date.toLocaleDateString()).collection("ค่าธรรมเนียมการศึกษา").doc("คณะครุศาสตร์").collection("Subject").doc("การสอนภาษาไทย");
        Count_Accuracy.get().then(function (docs) {
            if (!docs.exists) {
                Count_Accuracy.set({
                    ถูก: 0,
                    ไม่ถูก: 0
                });
            }

        });


        if (text === c) {
            agent.add("ขอบคุณค่ะ");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ถูก + 1;

                    t.update(Count_Accuracy, {
                        ถูก: newcount,

                    });
                });
            });



        }

        else if (text === b) {

            agent.add("กรุณากดปุ่มติดต่อเจ้าหน้าที่");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ไม่ถูก + 1;

                    t.update(Count_Accuracy, {
                        ไม่ถูก: newcount,

                    });
                });
            });

        }

        else {
            //เชคว่ามี ตัว doc อยู๋ไหม ถ้าไม่ ก็ set ค่า 
            // count_intent 
            Count_Intent.get().then(function (docs) {
                if (!docs.exists) {
                    Count_Intent.set({
                        ค่าธรรมเนียมการศึกษา: 1
                    });
                }

                else {
                    //เลขcount เวลามีคนเข้ามาสอบถาม

                    db.runTransaction(t => {
                        return t.get(Count_Intent).then(doc => {
                            if (doc.data().ค่าธรรมเนียมการศึกษา > 0) {
                                let newcount = doc.data().ค่าธรรมเนียมการศึกษา + 1;

                                t.update(Count_Intent, {
                                    ค่าธรรมเนียมการศึกษา: newcount

                                });
                            } else {
                                t.update(Count_Intent, {
                                    ค่าธรรมเนียมการศึกษา: 1
                                });

                            }

                        });
                    });
                }
            });

            //return ข้อมูลคำตอบ 
            return admin.firestore().collection('Tuition_fee').doc('คณะครุศาสตร์').collection('การสอนภาษาไทย').orderBy("date", "desc").limit(1).get().then((snapshot) => {
                snapshot.forEach(doc => {
                    agent.add(doc.data().description);
                    agent.add(payload่json); //แสดง paylaod
                });
            });
        }

    }


    //การสอนภาษาอังกฤษ
    function English_Teaching(agent) {
        let payload = {
            "type": "template",
            "altText": "this is a confirm template",
            "template": {
                "type": "confirm",
                "actions": [
                    {
                        "type": "message",
                        "label": "ถูก",
                        "text": "ได้รับคำตอบถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาการสอนภาษาอังกฤษ"
                    },
                    {
                        "type": "message",
                        "label": "ไม่ถูก",
                        "text": "ได้รับคำตอบไม่ถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาการสอนภาษาอังกฤษ"
                    }
                ],
                "text": "คุณได้รับคำตอบถูกต้องไหมคะ?"
            }
        };

        //ประกาศตัวแปร payload เพื่อแสดงออกหน้าจอ
        let payload่json = new Payload(`LINE`, payload, { sendAsMessage: true });
        let text = request.body.queryResult.queryText;
        let c = 'ได้รับคำตอบถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาการสอนภาษาอังกฤษ';
        let b = 'ได้รับคำตอบไม่ถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาการสอนภาษาอังกฤษ';

        //Count_Accuracy
        let Count_Accuracy = admin.firestore().collection("Count_Accuracy").doc(date.toLocaleDateString()).collection("ค่าธรรมเนียมการศึกษา").doc("คณะครุศาสตร์").collection("Subject").doc("การสอนภาษาอังกฤษ");
        Count_Accuracy.get().then(function (docs) {
            if (!docs.exists) {
                Count_Accuracy.set({
                    ถูก: 0,
                    ไม่ถูก: 0
                });
            }

        });


        if (text === c) {
            agent.add("ขอบคุณค่ะ");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ถูก + 1;

                    t.update(Count_Accuracy, {
                        ถูก: newcount,

                    });
                });
            });



        }

        else if (text === b) {

            agent.add("กรุณากดปุ่มติดต่อเจ้าหน้าที่");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ไม่ถูก + 1;

                    t.update(Count_Accuracy, {
                        ไม่ถูก: newcount,

                    });
                });
            });

        }

        else {
            //เชคว่ามี ตัว doc อยู๋ไหม ถ้าไม่ ก็ set ค่า 
            // count_intent 
            Count_Intent.get().then(function (docs) {
                if (!docs.exists) {
                    Count_Intent.set({
                        ค่าธรรมเนียมการศึกษา: 1
                    });
                }

                else {
                    //เลขcount เวลามีคนเข้ามาสอบถาม

                    db.runTransaction(t => {
                        return t.get(Count_Intent).then(doc => {
                            if (doc.data().ค่าธรรมเนียมการศึกษา > 0) {
                                let newcount = doc.data().ค่าธรรมเนียมการศึกษา + 1;

                                t.update(Count_Intent, {
                                    ค่าธรรมเนียมการศึกษา: newcount

                                });
                            } else {
                                t.update(Count_Intent, {
                                    ค่าธรรมเนียมการศึกษา: 1
                                });

                            }

                        });
                    });
                }
            });

            //return ข้อมูลคำตอบ 
            return admin.firestore().collection('Tuition_fee').doc('คณะครุศาสตร์').collection('การสอนภาษาอังกฤษ').orderBy("date", "desc").limit(1).get().then((snapshot) => {
                snapshot.forEach(doc => {
                    agent.add(doc.data().description);
                    agent.add(payload่json); //แสดง paylaod
                });
            });
        }

    }




    //การศึกษาปฐมวัย
    function Early_Childhood_Education(agent) {
        let payload = {
            "type": "template",
            "altText": "this is a confirm template",
            "template": {
                "type": "confirm",
                "actions": [
                    {
                        "type": "message",
                        "label": "ถูก",
                        "text": "ได้รับคำตอบถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาการศึกษาปฐมวัย"
                    },
                    {
                        "type": "message",
                        "label": "ไม่ถูก",
                        "text": "ได้รับคำตอบไม่ถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาการศึกษาปฐมวัย"
                    }
                ],
                "text": "คุณได้รับคำตอบถูกต้องไหมคะ?"
            }
        };

        //ประกาศตัวแปร payload เพื่อแสดงออกหน้าจอ
        let payload่json = new Payload(`LINE`, payload, { sendAsMessage: true });
        let text = request.body.queryResult.queryText;
        let c = 'ได้รับคำตอบถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาการศึกษาปฐมวัย';
        let b = 'ได้รับคำตอบไม่ถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาการศึกษาปฐมวัย';

        //Count_Accuracy
        let Count_Accuracy = admin.firestore().collection("Count_Accuracy").doc(date.toLocaleDateString()).collection("ค่าธรรมเนียมการศึกษา").doc("คณะครุศาสตร์").collection("Subject").doc("การศึกษาปฐมวัย");
        Count_Accuracy.get().then(function (docs) {
            if (!docs.exists) {
                Count_Accuracy.set({
                    ถูก: 0,
                    ไม่ถูก: 0
                });
            }

        });


        if (text === c) {
            agent.add("ขอบคุณค่ะ");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ถูก + 1;

                    t.update(Count_Accuracy, {
                        ถูก: newcount,

                    });
                });
            });



        }

        else if (text === b) {

            agent.add("กรุณากดปุ่มติดต่อเจ้าหน้าที่");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ไม่ถูก + 1;

                    t.update(Count_Accuracy, {
                        ไม่ถูก: newcount,

                    });
                });
            });

        }

        else {
            //เชคว่ามี ตัว doc อยู๋ไหม ถ้าไม่ ก็ set ค่า 
            // count_intent 
            Count_Intent.get().then(function (docs) {
                if (!docs.exists) {
                    Count_Intent.set({
                        ค่าธรรมเนียมการศึกษา: 1
                    });
                }

                else {
                    //เลขcount เวลามีคนเข้ามาสอบถาม

                    db.runTransaction(t => {
                        return t.get(Count_Intent).then(doc => {
                            if (doc.data().ค่าธรรมเนียมการศึกษา > 0) {
                                let newcount = doc.data().ค่าธรรมเนียมการศึกษา + 1;

                                t.update(Count_Intent, {
                                    ค่าธรรมเนียมการศึกษา: newcount

                                });
                            } else {
                                t.update(Count_Intent, {
                                    ค่าธรรมเนียมการศึกษา: 1
                                });

                            }

                        });
                    });
                }
            });

            //return ข้อมูลคำตอบ 
            return admin.firestore().collection('Tuition_fee').doc('คณะครุศาสตร์').collection('การศึกษาปฐมวัย').orderBy("date", "desc").limit(1).get().then((snapshot) => {
                snapshot.forEach(doc => {
                    agent.add(doc.data().description);
                    agent.add(payload่json); //แสดง paylaod
                });
            });
        }

    }

    //การสอนภาษาจีน
    function Chinese_Teaching(agent) {
        let payload = {
            "type": "template",
            "altText": "this is a confirm template",
            "template": {
                "type": "confirm",
                "actions": [
                    {
                        "type": "message",
                        "label": "ถูก",
                        "text": "ได้รับคำตอบถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาการสอนภาษาจีน"
                    },
                    {
                        "type": "message",
                        "label": "ไม่ถูก",
                        "text": "ได้รับคำตอบไม่ถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาการสอนภาษาจีน"
                    }
                ],
                "text": "คุณได้รับคำตอบถูกต้องไหมคะ?"
            }
        };

        //ประกาศตัวแปร payload เพื่อแสดงออกหน้าจอ
        let payload่json = new Payload(`LINE`, payload, { sendAsMessage: true });
        let text = request.body.queryResult.queryText;
        let c = 'ได้รับคำตอบถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาการสอนภาษาจีน';
        let b = 'ได้รับคำตอบไม่ถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาการสอนภาษาจีน';

        //Count_Accuracy
        let Count_Accuracy = admin.firestore().collection("Count_Accuracy").doc(date.toLocaleDateString()).collection("ค่าธรรมเนียมการศึกษา").doc("คณะครุศาสตร์").collection("Subject").doc("การสอนภาษาจีน");
        Count_Accuracy.get().then(function (docs) {
            if (!docs.exists) {
                Count_Accuracy.set({
                    ถูก: 0,
                    ไม่ถูก: 0
                });
            }

        });


        if (text === c) {
            agent.add("ขอบคุณค่ะ");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ถูก + 1;

                    t.update(Count_Accuracy, {
                        ถูก: newcount,

                    });
                });
            });



        }

        else if (text === b) {

            agent.add("กรุณากดปุ่มติดต่อเจ้าหน้าที่");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ไม่ถูก + 1;

                    t.update(Count_Accuracy, {
                        ไม่ถูก: newcount,

                    });
                });
            });

        }

        else {
            //เชคว่ามี ตัว doc อยู๋ไหม ถ้าไม่ ก็ set ค่า 
            // count_intent 
            Count_Intent.get().then(function (docs) {
                if (!docs.exists) {
                    Count_Intent.set({
                        ค่าธรรมเนียมการศึกษา: 1
                    });
                }

                else {
                    //เลขcount เวลามีคนเข้ามาสอบถาม

                    db.runTransaction(t => {
                        return t.get(Count_Intent).then(doc => {
                            if (doc.data().ค่าธรรมเนียมการศึกษา > 0) {
                                let newcount = doc.data().ค่าธรรมเนียมการศึกษา + 1;

                                t.update(Count_Intent, {
                                    ค่าธรรมเนียมการศึกษา: newcount

                                });
                            } else {
                                t.update(Count_Intent, {
                                    ค่าธรรมเนียมการศึกษา: 1
                                });

                            }

                        });
                    });
                }
            });

            //return ข้อมูลคำตอบ 
            return admin.firestore().collection('Tuition_fee').doc('คณะครุศาสตร์').collection('การสอนภาษาจีน').orderBy("date", "desc").limit(1).get().then((snapshot) => {
                snapshot.forEach(doc => {
                    agent.add(doc.data().description);
                    agent.add(payload่json); //แสดง paylaod
                });
            });
        }

    }

    //จิตวิทยาการปรึกษาและแนะแนว-การสอนภาษาไทย
    function Counseling_Psychology_and_Guidance_and_Thai_Teaching(agent) {
        let payload = {
            "type": "template",
            "altText": "this is a confirm template",
            "template": {
                "type": "confirm",
                "actions": [
                    {
                        "type": "message",
                        "label": "ถูก",
                        "text": "ได้รับคำตอบถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาจิตวิทยาการปรึกษาและแนะแนว-การสอนภาษาไทย"
                    },
                    {
                        "type": "message",
                        "label": "ไม่ถูก",
                        "text": "ได้รับคำตอบไม่ถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาจิตวิทยาการปรึกษาและแนะแนว-การสอนภาษาไทย"
                    }
                ],
                "text": "คุณได้รับคำตอบถูกต้องไหมคะ?"
            }
        };

        //ประกาศตัวแปร payload เพื่อแสดงออกหน้าจอ
        let payload่json = new Payload(`LINE`, payload, { sendAsMessage: true });
        let text = request.body.queryResult.queryText;
        let c = 'ได้รับคำตอบถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาจิตวิทยาการปรึกษาและแนะแนว-การสอนภาษาไทย';
        let b = 'ได้รับคำตอบไม่ถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาจิตวิทยาการปรึกษาและแนะแนว-การสอนภาษาไทย';

        //Count_Accuracy
        let Count_Accuracy = admin.firestore().collection("Count_Accuracy").doc(date.toLocaleDateString()).collection("ค่าธรรมเนียมการศึกษา").doc("คณะครุศาสตร์").collection("Subject").doc("จิตวิทยาการปรึกษาและแนะแนว-การสอนภาษาไทย");
        Count_Accuracy.get().then(function (docs) {
            if (!docs.exists) {
                Count_Accuracy.set({
                    ถูก: 0,
                    ไม่ถูก: 0
                });
            }

        });


        if (text === c) {
            agent.add("ขอบคุณค่ะ");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ถูก + 1;

                    t.update(Count_Accuracy, {
                        ถูก: newcount,

                    });
                });
            });



        }

        else if (text === b) {

            agent.add("กรุณากดปุ่มติดต่อเจ้าหน้าที่");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ไม่ถูก + 1;

                    t.update(Count_Accuracy, {
                        ไม่ถูก: newcount,

                    });
                });
            });

        }

        else {
            //เชคว่ามี ตัว doc อยู๋ไหม ถ้าไม่ ก็ set ค่า 
            // count_intent 
            Count_Intent.get().then(function (docs) {
                if (!docs.exists) {
                    Count_Intent.set({
                        ค่าธรรมเนียมการศึกษา: 1
                    });
                }

                else {
                    //เลขcount เวลามีคนเข้ามาสอบถาม

                    db.runTransaction(t => {
                        return t.get(Count_Intent).then(doc => {
                            if (doc.data().ค่าธรรมเนียมการศึกษา > 0) {
                                let newcount = doc.data().ค่าธรรมเนียมการศึกษา + 1;

                                t.update(Count_Intent, {
                                    ค่าธรรมเนียมการศึกษา: newcount

                                });
                            } else {
                                t.update(Count_Intent, {
                                    ค่าธรรมเนียมการศึกษา: 1
                                });

                            }

                        });
                    });
                }
            });

            //return ข้อมูลคำตอบ 
            return admin.firestore().collection('Tuition_fee').doc('คณะครุศาสตร์').collection('จิตวิทยาการปรึกษาและแนะแนว-การสอนภาษาไทย').orderBy("date", "desc").limit(1).get().then((snapshot) => {
                snapshot.forEach(doc => {
                    agent.add(doc.data().description);
                    agent.add(payload่json); //แสดง paylaod
                });
            });
        }

    }


    //เทคโนโลยีสารสนเทศทางการศึกษา-การสอนภาษาไทย
    function Educational_Information_Technology(agent) {
        let payload = {
            "type": "template",
            "altText": "this is a confirm template",
            "template": {
                "type": "confirm",
                "actions": [
                    {
                        "type": "message",
                        "label": "ถูก",
                        "text": "ได้รับคำตอบถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาเทคโนโลยีสารสนเทศทางการศึกษา-การสอนภาษาไทย"
                    },
                    {
                        "type": "message",
                        "label": "ไม่ถูก",
                        "text": "ได้รับคำตอบไม่ถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาเทคโนโลยีสารสนเทศทางการศึกษา-การสอนภาษาไทย"
                    }
                ],
                "text": "คุณได้รับคำตอบถูกต้องไหมคะ?"
            }
        };

        //ประกาศตัวแปร payload เพื่อแสดงออกหน้าจอ
        let payload่json = new Payload(`LINE`, payload, { sendAsMessage: true });
        let text = request.body.queryResult.queryText;
        let c = 'ได้รับคำตอบถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาเทคโนโลยีสารสนเทศทางการศึกษา-การสอนภาษาไทย';
        let b = 'ได้รับคำตอบไม่ถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาเทคโนโลยีสารสนเทศทางการศึกษา-การสอนภาษาไทย';

        //Count_Accuracy
        let Count_Accuracy = admin.firestore().collection("Count_Accuracy").doc(date.toLocaleDateString()).collection("ค่าธรรมเนียมการศึกษา").doc("คณะครุศาสตร์").collection("Subject").doc("เทคโนโลยีสารสนเทศทางการศึกษา-การสอนภาษาไทย");
        Count_Accuracy.get().then(function (docs) {
            if (!docs.exists) {
                Count_Accuracy.set({
                    ถูก: 0,
                    ไม่ถูก: 0
                });
            }

        });


        if (text === c) {
            agent.add("ขอบคุณค่ะ");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ถูก + 1;

                    t.update(Count_Accuracy, {
                        ถูก: newcount,

                    });
                });
            });



        }

        else if (text === b) {

            agent.add("กรุณากดปุ่มติดต่อเจ้าหน้าที่");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ไม่ถูก + 1;

                    t.update(Count_Accuracy, {
                        ไม่ถูก: newcount,

                    });
                });
            });

        }

        else {
            //เชคว่ามี ตัว doc อยู๋ไหม ถ้าไม่ ก็ set ค่า 
            // count_intent 
            Count_Intent.get().then(function (docs) {
                if (!docs.exists) {
                    Count_Intent.set({
                        ค่าธรรมเนียมการศึกษา: 1
                    });
                }

                else {
                    //เลขcount เวลามีคนเข้ามาสอบถาม

                    db.runTransaction(t => {
                        return t.get(Count_Intent).then(doc => {
                            if (doc.data().ค่าธรรมเนียมการศึกษา > 0) {
                                let newcount = doc.data().ค่าธรรมเนียมการศึกษา + 1;

                                t.update(Count_Intent, {
                                    ค่าธรรมเนียมการศึกษา: newcount

                                });
                            } else {
                                t.update(Count_Intent, {
                                    ค่าธรรมเนียมการศึกษา: 1
                                });

                            }

                        });
                    });
                }
            });

            //return ข้อมูลคำตอบ 
            return admin.firestore().collection('Tuition_fee').doc('คณะครุศาสตร์').collection('เทคโนโลยีสารสนเทศทางการศึกษา-การสอนภาษาไทย').orderBy("date", "desc").limit(1).get().then((snapshot) => {
                snapshot.forEach(doc => {
                    agent.add(doc.data().description);
                    agent.add(payload่json); //แสดง paylaod
                });
            });
        }

    }


    //การสอนสังคมศึกษา
    function Social_Studies_Teaching(agent) {
        let payload = {
            "type": "template",
            "altText": "this is a confirm template",
            "template": {
                "type": "confirm",
                "actions": [
                    {
                        "type": "message",
                        "label": "ถูก",
                        "text": "ได้รับคำตอบถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาการสอนสังคมศึกษา"
                    },
                    {
                        "type": "message",
                        "label": "ไม่ถูก",
                        "text": "ได้รับคำตอบไม่ถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาการสอนสังคมศึกษา"
                    }
                ],
                "text": "คุณได้รับคำตอบถูกต้องไหมคะ?"
            }
        };

        //ประกาศตัวแปร payload เพื่อแสดงออกหน้าจอ
        let payload่json = new Payload(`LINE`, payload, { sendAsMessage: true });
        let text = request.body.queryResult.queryText;
        let c = 'ได้รับคำตอบถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาการสอนสังคมศึกษา';
        let b = 'ได้รับคำตอบไม่ถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาการสอนสังคมศึกษา';

        //Count_Accuracy
        let Count_Accuracy = admin.firestore().collection("Count_Accuracy").doc(date.toLocaleDateString()).collection("ค่าธรรมเนียมการศึกษา").doc("คณะครุศาสตร์").collection("Subject").doc("การสอนสังคมศึกษา");
        Count_Accuracy.get().then(function (docs) {
            if (!docs.exists) {
                Count_Accuracy.set({
                    ถูก: 0,
                    ไม่ถูก: 0
                });
            }

        });


        if (text === c) {
            agent.add("ขอบคุณค่ะ");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ถูก + 1;

                    t.update(Count_Accuracy, {
                        ถูก: newcount,

                    });
                });
            });



        }

        else if (text === b) {

            agent.add("กรุณากดปุ่มติดต่อเจ้าหน้าที่");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ไม่ถูก + 1;

                    t.update(Count_Accuracy, {
                        ไม่ถูก: newcount,

                    });
                });
            });

        }

        else {
            //เชคว่ามี ตัว doc อยู๋ไหม ถ้าไม่ ก็ set ค่า 
            // count_intent 
            Count_Intent.get().then(function (docs) {
                if (!docs.exists) {
                    Count_Intent.set({
                        ค่าธรรมเนียมการศึกษา: 1
                    });
                }

                else {
                    //เลขcount เวลามีคนเข้ามาสอบถาม

                    db.runTransaction(t => {
                        return t.get(Count_Intent).then(doc => {
                            if (doc.data().ค่าธรรมเนียมการศึกษา > 0) {
                                let newcount = doc.data().ค่าธรรมเนียมการศึกษา + 1;

                                t.update(Count_Intent, {
                                    ค่าธรรมเนียมการศึกษา: newcount

                                });
                            } else {
                                t.update(Count_Intent, {
                                    ค่าธรรมเนียมการศึกษา: 1
                                });

                            }

                        });
                    });
                }
            });

            //return ข้อมูลคำตอบ 
            return admin.firestore().collection('Tuition_fee').doc('คณะครุศาสตร์').collection('การสอนสังคมศึกษา').orderBy("date", "desc").limit(1).get().then((snapshot) => {
                snapshot.forEach(doc => {
                    agent.add(doc.data().description);
                    agent.add(payload่json); //แสดง paylaod
                });
            });
        }

    }



    //คณะเทคโนโลยีอุตสาหกรรม 
    //เทคโนโลยีอุตสาหกรรม
    function Industrial_Technology(agent) {
        let payload = {
            "type": "template",
            "altText": "this is a confirm template",
            "template": {
                "type": "confirm",
                "actions": [
                    {
                        "type": "message",
                        "label": "ถูก",
                        "text": "ได้รับคำตอบถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาเทคโนโลยีอุตสาหกรรม"
                    },
                    {
                        "type": "message",
                        "label": "ไม่ถูก",
                        "text": "ได้รับคำตอบไม่ถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาเทคโนโลยีอุตสาหกรรม"
                    }
                ],
                "text": "คุณได้รับคำตอบถูกต้องไหมคะ?"
            }
        };

        //ประกาศตัวแปร payload เพื่อแสดงออกหน้าจอ
        let payload่json = new Payload(`LINE`, payload, { sendAsMessage: true });
        let text = request.body.queryResult.queryText;
        let c = 'ได้รับคำตอบถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาเทคโนโลยีอุตสาหกรรม';
        let b = 'ได้รับคำตอบไม่ถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาเทคโนโลยีอุตสาหกรรม';

        //Count_Accuracy
        let Count_Accuracy = admin.firestore().collection("Count_Accuracy").doc(date.toLocaleDateString()).collection("ค่าธรรมเนียมการศึกษา").doc("คณะเทคโนโลยีอุตสาหกรรม").collection("Subject").doc("เทคโนโลยีอุตสาหกรรม");
        Count_Accuracy.get().then(function (docs) {
            if (!docs.exists) {
                Count_Accuracy.set({
                    ถูก: 0,
                    ไม่ถูก: 0
                });
            }

        });


        if (text === c) {
            agent.add("ขอบคุณค่ะ");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ถูก + 1;

                    t.update(Count_Accuracy, {
                        ถูก: newcount,

                    });
                });
            });



        }

        else if (text === b) {

            agent.add("กรุณากดปุ่มติดต่อเจ้าหน้าที่");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ไม่ถูก + 1;

                    t.update(Count_Accuracy, {
                        ไม่ถูก: newcount,

                    });
                });
            });

        }

        else {
            //เชคว่ามี ตัว doc อยู๋ไหม ถ้าไม่ ก็ set ค่า 
            // count_intent 
            Count_Intent.get().then(function (docs) {
                if (!docs.exists) {
                    Count_Intent.set({
                        ค่าธรรมเนียมการศึกษา: 1
                    });
                }

                else {
                    //เลขcount เวลามีคนเข้ามาสอบถาม

                    db.runTransaction(t => {
                        return t.get(Count_Intent).then(doc => {
                            if (doc.data().ค่าธรรมเนียมการศึกษา > 0) {
                                let newcount = doc.data().ค่าธรรมเนียมการศึกษา + 1;

                                t.update(Count_Intent, {
                                    ค่าธรรมเนียมการศึกษา: newcount

                                });
                            } else {
                                t.update(Count_Intent, {
                                    ค่าธรรมเนียมการศึกษา: 1
                                });

                            }

                        });
                    });
                }
            });

            //return ข้อมูลคำตอบ 
            return admin.firestore().collection('Tuition_fee').doc('คณะเทคโนโลยีอุตสาหกรรม').collection('เทคโนโลยีอุตสาหกรรม').orderBy("date", "desc").limit(1).get().then((snapshot) => {
                snapshot.forEach(doc => {
                    agent.add(doc.data().description);
                    agent.add(payload่json); //แสดง paylaod
                });
            });
        }

    }


    //วิศวกรรมการจัดการอุตสาหกรรม
    function Industrial_Management_Engineering(agent) {
        let payload = {
            "type": "template",
            "altText": "this is a confirm template",
            "template": {
                "type": "confirm",
                "actions": [
                    {
                        "type": "message",
                        "label": "ถูก",
                        "text": "ได้รับคำตอบถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาวิศวกรรมการจัดการอุตสาหกรรม"
                    },
                    {
                        "type": "message",
                        "label": "ไม่ถูก",
                        "text": "ได้รับคำตอบไม่ถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาวิศวกรรมการจัดการอุตสาหกรรม"
                    }
                ],
                "text": "คุณได้รับคำตอบถูกต้องไหมคะ?"
            }
        };

        //ประกาศตัวแปร payload เพื่อแสดงออกหน้าจอ
        let payload่json = new Payload(`LINE`, payload, { sendAsMessage: true });
        let text = request.body.queryResult.queryText;
        let c = 'ได้รับคำตอบถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาวิศวกรรมการจัดการอุตสาหกรรม';
        let b = 'ได้รับคำตอบไม่ถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาวิศวกรรมการจัดการอุตสาหกรรม';

        //Count_Accuracy
        let Count_Accuracy = admin.firestore().collection("Count_Accuracy").doc(date.toLocaleDateString()).collection("ค่าธรรมเนียมการศึกษา").doc("คณะเทคโนโลยีอุตสาหกรรม").collection("Subject").doc("วิศวกรรมการจัดการอุตสาหกรรม");
        Count_Accuracy.get().then(function (docs) {
            if (!docs.exists) {
                Count_Accuracy.set({
                    ถูก: 0,
                    ไม่ถูก: 0
                });
            }

        });


        if (text === c) {
            agent.add("ขอบคุณค่ะ");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ถูก + 1;

                    t.update(Count_Accuracy, {
                        ถูก: newcount,

                    });
                });
            });



        }

        else if (text === b) {

            agent.add("กรุณากดปุ่มติดต่อเจ้าหน้าที่");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ไม่ถูก + 1;

                    t.update(Count_Accuracy, {
                        ไม่ถูก: newcount,

                    });
                });
            });

        }

        else {
            //เชคว่ามี ตัว doc อยู๋ไหม ถ้าไม่ ก็ set ค่า 
            // count_intent 
            Count_Intent.get().then(function (docs) {
                if (!docs.exists) {
                    Count_Intent.set({
                        ค่าธรรมเนียมการศึกษา: 1
                    });
                }

                else {
                    //เลขcount เวลามีคนเข้ามาสอบถาม

                    db.runTransaction(t => {
                        return t.get(Count_Intent).then(doc => {
                            if (doc.data().ค่าธรรมเนียมการศึกษา > 0) {
                                let newcount = doc.data().ค่าธรรมเนียมการศึกษา + 1;

                                t.update(Count_Intent, {
                                    ค่าธรรมเนียมการศึกษา: newcount

                                });
                            } else {
                                t.update(Count_Intent, {
                                    ค่าธรรมเนียมการศึกษา: 1
                                });

                            }

                        });
                    });
                }
            });

            //return ข้อมูลคำตอบ 
            return admin.firestore().collection('Tuition_fee').doc('คณะเทคโนโลยีอุตสาหกรรม').collection('วิศวกรรมการจัดการอุตสาหกรรม').orderBy("date", "desc").limit(1).get().then((snapshot) => {
                snapshot.forEach(doc => {
                    agent.add(doc.data().description);
                    agent.add(payload่json); //แสดง paylaod
                });
            });
        }

    }



    //วิศวกรรมเครื่องกลยานยนต์
    function Automotive_Mechanical_Engineering(agent) {
        let payload = {
            "type": "template",
            "altText": "this is a confirm template",
            "template": {
                "type": "confirm",
                "actions": [
                    {
                        "type": "message",
                        "label": "ถูก",
                        "text": "ได้รับคำตอบถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาวิศวกรรมเครื่องกลยานยนต์"
                    },
                    {
                        "type": "message",
                        "label": "ไม่ถูก",
                        "text": "ได้รับคำตอบไม่ถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาวิศวกรรมเครื่องกลยานยนต์"
                    }
                ],
                "text": "คุณได้รับคำตอบถูกต้องไหมคะ?"
            }
        };

        //ประกาศตัวแปร payload เพื่อแสดงออกหน้าจอ
        let payload่json = new Payload(`LINE`, payload, { sendAsMessage: true });
        let text = request.body.queryResult.queryText;
        let c = 'ได้รับคำตอบถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาวิศวกรรมเครื่องกลยานยนต์';
        let b = 'ได้รับคำตอบไม่ถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาวิศวกรรมเครื่องกลยานยนต์';

        //Count_Accuracy
        let Count_Accuracy = admin.firestore().collection("Count_Accuracy").doc(date.toLocaleDateString()).collection("ค่าธรรมเนียมการศึกษา").doc("คณะเทคโนโลยีอุตสาหกรรม").collection("Subject").doc("วิศวกรรมเครื่องกลยานยนต์");
        Count_Accuracy.get().then(function (docs) {
            if (!docs.exists) {
                Count_Accuracy.set({
                    ถูก: 0,
                    ไม่ถูก: 0
                });
            }

        });


        if (text === c) {
            agent.add("ขอบคุณค่ะ");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ถูก + 1;

                    t.update(Count_Accuracy, {
                        ถูก: newcount,

                    });
                });
            });



        }

        else if (text === b) {

            agent.add("กรุณากดปุ่มติดต่อเจ้าหน้าที่");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ไม่ถูก + 1;

                    t.update(Count_Accuracy, {
                        ไม่ถูก: newcount,

                    });
                });
            });

        }

        else {
            //เชคว่ามี ตัว doc อยู๋ไหม ถ้าไม่ ก็ set ค่า 
            // count_intent 
            Count_Intent.get().then(function (docs) {
                if (!docs.exists) {
                    Count_Intent.set({
                        ค่าธรรมเนียมการศึกษา: 1
                    });
                }

                else {
                    //เลขcount เวลามีคนเข้ามาสอบถาม

                    db.runTransaction(t => {
                        return t.get(Count_Intent).then(doc => {
                            if (doc.data().ค่าธรรมเนียมการศึกษา > 0) {
                                let newcount = doc.data().ค่าธรรมเนียมการศึกษา + 1;

                                t.update(Count_Intent, {
                                    ค่าธรรมเนียมการศึกษา: newcount

                                });
                            } else {
                                t.update(Count_Intent, {
                                    ค่าธรรมเนียมการศึกษา: 1
                                });

                            }

                        });
                    });
                }
            });

            //return ข้อมูลคำตอบ 
            return admin.firestore().collection('Tuition_fee').doc('คณะเทคโนโลยีอุตสาหกรรม').collection('วิศวกรรมเครื่องกลยานยนต์').orderBy("date", "desc").limit(1).get().then((snapshot) => {
                snapshot.forEach(doc => {
                    agent.add(doc.data().description);
                    agent.add(payload่json); //แสดง paylaod
                });
            });
        }

    }



    //วิศวกรรมไฟฟ้า
    function Electonic_Engineering(agent) {
        let payload = {
            "type": "template",
            "altText": "this is a confirm template",
            "template": {
                "type": "confirm",
                "actions": [
                    {
                        "type": "message",
                        "label": "ถูก",
                        "text": "ได้รับคำตอบถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาวิศวกรรมไฟฟ้า"
                    },
                    {
                        "type": "message",
                        "label": "ไม่ถูก",
                        "text": "ได้รับคำตอบไม่ถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาวิศวกรรมไฟฟ้า"
                    }
                ],
                "text": "คุณได้รับคำตอบถูกต้องไหมคะ?"
            }
        };

        //ประกาศตัวแปร payload เพื่อแสดงออกหน้าจอ
        let payload่json = new Payload(`LINE`, payload, { sendAsMessage: true });
        let text = request.body.queryResult.queryText;
        let c = 'ได้รับคำตอบถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาวิศวกรรมไฟฟ้า';
        let b = 'ได้รับคำตอบไม่ถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาวิศวกรรมไฟฟ้า';

        //Count_Accuracy
        let Count_Accuracy = admin.firestore().collection("Count_Accuracy").doc(date.toLocaleDateString()).collection("ค่าธรรมเนียมการศึกษา").doc("คณะเทคโนโลยีอุตสาหกรรม").collection("Subject").doc("วิศวกรรมไฟฟ้า");
        Count_Accuracy.get().then(function (docs) {
            if (!docs.exists) {
                Count_Accuracy.set({
                    ถูก: 0,
                    ไม่ถูก: 0
                });
            }

        });


        if (text === c) {
            agent.add("ขอบคุณค่ะ");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ถูก + 1;

                    t.update(Count_Accuracy, {
                        ถูก: newcount,

                    });
                });
            });



        }

        else if (text === b) {

            agent.add("กรุณากดปุ่มติดต่อเจ้าหน้าที่");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ไม่ถูก + 1;

                    t.update(Count_Accuracy, {
                        ไม่ถูก: newcount,

                    });
                });
            });

        }

        else {
            //เชคว่ามี ตัว doc อยู๋ไหม ถ้าไม่ ก็ set ค่า 
            // count_intent 
            Count_Intent.get().then(function (docs) {
                if (!docs.exists) {
                    Count_Intent.set({
                        ค่าธรรมเนียมการศึกษา: 1
                    });
                }

                else {
                    //เลขcount เวลามีคนเข้ามาสอบถาม

                    db.runTransaction(t => {
                        return t.get(Count_Intent).then(doc => {
                            if (doc.data().ค่าธรรมเนียมการศึกษา > 0) {
                                let newcount = doc.data().ค่าธรรมเนียมการศึกษา + 1;

                                t.update(Count_Intent, {
                                    ค่าธรรมเนียมการศึกษา: newcount

                                });
                            } else {
                                t.update(Count_Intent, {
                                    ค่าธรรมเนียมการศึกษา: 1
                                });

                            }

                        });
                    });
                }
            });

            //return ข้อมูลคำตอบ 
            return admin.firestore().collection('Tuition_fee').doc('คณะเทคโนโลยีอุตสาหกรรม').collection('วิศวกรรมไฟฟ้า').orderBy("date", "desc").limit(1).get().then((snapshot) => {
                snapshot.forEach(doc => {
                    agent.add(doc.data().description);
                    agent.add(payload่json); //แสดง paylaod
                });
            });
        }

    }




    //ออกแบบผลิตภัณฑ์
    function Product_Design(agent) {
        let payload = {
            "type": "template",
            "altText": "this is a confirm template",
            "template": {
                "type": "confirm",
                "actions": [
                    {
                        "type": "message",
                        "label": "ถูก",
                        "text": "ได้รับคำตอบถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาออกแบบผลิตภัณฑ์"
                    },
                    {
                        "type": "message",
                        "label": "ไม่ถูก",
                        "text": "ได้รับคำตอบไม่ถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาออกแบบผลิตภัณฑ์"
                    }
                ],
                "text": "คุณได้รับคำตอบถูกต้องไหมคะ?"
            }
        };

        //ประกาศตัวแปร payload เพื่อแสดงออกหน้าจอ
        let payload่json = new Payload(`LINE`, payload, { sendAsMessage: true });
        let text = request.body.queryResult.queryText;
        let c = 'ได้รับคำตอบถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาออกแบบผลิตภัณฑ์';
        let b = 'ได้รับคำตอบไม่ถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาออกแบบผลิตภัณฑ์';

        //Count_Accuracy
        let Count_Accuracy = admin.firestore().collection("Count_Accuracy").doc(date.toLocaleDateString()).collection("ค่าธรรมเนียมการศึกษา").doc("คณะเทคโนโลยีอุตสาหกรรม").collection("Subject").doc("ออกแบบผลิตภัณฑ์");
        Count_Accuracy.get().then(function (docs) {
            if (!docs.exists) {
                Count_Accuracy.set({
                    ถูก: 0,
                    ไม่ถูก: 0
                });
            }

        });


        if (text === c) {
            agent.add("ขอบคุณค่ะ");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ถูก + 1;

                    t.update(Count_Accuracy, {
                        ถูก: newcount,

                    });
                });
            });



        }

        else if (text === b) {

            agent.add("กรุณากดปุ่มติดต่อเจ้าหน้าที่");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ไม่ถูก + 1;

                    t.update(Count_Accuracy, {
                        ไม่ถูก: newcount,

                    });
                });
            });

        }

        else {
            //เชคว่ามี ตัว doc อยู๋ไหม ถ้าไม่ ก็ set ค่า 
            // count_intent 
            Count_Intent.get().then(function (docs) {
                if (!docs.exists) {
                    Count_Intent.set({
                        ค่าธรรมเนียมการศึกษา: 1
                    });
                }

                else {
                    //เลขcount เวลามีคนเข้ามาสอบถาม

                    db.runTransaction(t => {
                        return t.get(Count_Intent).then(doc => {
                            if (doc.data().ค่าธรรมเนียมการศึกษา > 0) {
                                let newcount = doc.data().ค่าธรรมเนียมการศึกษา + 1;

                                t.update(Count_Intent, {
                                    ค่าธรรมเนียมการศึกษา: newcount

                                });
                            } else {
                                t.update(Count_Intent, {
                                    ค่าธรรมเนียมการศึกษา: 1
                                });

                            }

                        });
                    });
                }
            });

            //return ข้อมูลคำตอบ 
            return admin.firestore().collection('Tuition_fee').doc('คณะเทคโนโลยีอุตสาหกรรม').collection('ออกแบบผลิตภัณฑ์').orderBy("date", "desc").limit(1).get().then((snapshot) => {
                snapshot.forEach(doc => {
                    agent.add(doc.data().description);
                    agent.add(payload่json); //แสดง paylaod
                });
            });
        }

    }




    //คณะมนุษยศาสตร์และสังคมศาสตร์ 
    //การพัฒนาสังคม
    function Social_development(agent) {
        let payload = {
            "type": "template",
            "altText": "this is a confirm template",
            "template": {
                "type": "confirm",
                "actions": [
                    {
                        "type": "message",
                        "label": "ถูก",
                        "text": "ได้รับคำตอบถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาการพัฒนาสังคม"
                    },
                    {
                        "type": "message",
                        "label": "ไม่ถูก",
                        "text": "ได้รับคำตอบไม่ถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาการพัฒนาสังคม"
                    }
                ],
                "text": "คุณได้รับคำตอบถูกต้องไหมคะ?"
            }
        };

        //ประกาศตัวแปร payload เพื่อแสดงออกหน้าจอ
        let payload่json = new Payload(`LINE`, payload, { sendAsMessage: true });
        let text = request.body.queryResult.queryText;
        let c = 'ได้รับคำตอบถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาการพัฒนาสังคม';
        let b = 'ได้รับคำตอบไม่ถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาการพัฒนาสังคม';

        //Count_Accuracy
        let Count_Accuracy = admin.firestore().collection("Count_Accuracy").doc(date.toLocaleDateString()).collection("ค่าธรรมเนียมการศึกษา").doc("คณะมนุษยศาสตร์และสังคมศาสตร์").collection("Subject").doc("การพัฒนาสังคม");
        Count_Accuracy.get().then(function (docs) {
            if (!docs.exists) {
                Count_Accuracy.set({
                    ถูก: 0,
                    ไม่ถูก: 0
                });
            }

        });


        if (text === c) {
            agent.add("ขอบคุณค่ะ");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ถูก + 1;

                    t.update(Count_Accuracy, {
                        ถูก: newcount,

                    });
                });
            });



        }

        else if (text === b) {

            agent.add("กรุณากดปุ่มติดต่อเจ้าหน้าที่");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ไม่ถูก + 1;

                    t.update(Count_Accuracy, {
                        ไม่ถูก: newcount,

                    });
                });
            });

        }

        else {
            //เชคว่ามี ตัว doc อยู๋ไหม ถ้าไม่ ก็ set ค่า 
            // count_intent 
            Count_Intent.get().then(function (docs) {
                if (!docs.exists) {
                    Count_Intent.set({
                        ค่าธรรมเนียมการศึกษา: 1
                    });
                }

                else {
                    //เลขcount เวลามีคนเข้ามาสอบถาม

                    db.runTransaction(t => {
                        return t.get(Count_Intent).then(doc => {
                            if (doc.data().ค่าธรรมเนียมการศึกษา > 0) {
                                let newcount = doc.data().ค่าธรรมเนียมการศึกษา + 1;

                                t.update(Count_Intent, {
                                    ค่าธรรมเนียมการศึกษา: newcount

                                });
                            } else {
                                t.update(Count_Intent, {
                                    ค่าธรรมเนียมการศึกษา: 1
                                });

                            }

                        });
                    });
                }
            });

            //return ข้อมูลคำตอบ 
            return admin.firestore().collection('Tuition_fee').doc('คณะมนุษยศาสตร์และสังคมศาสตร์').collection('การพัฒนาสังคม').orderBy("date", "desc").limit(1).get().then((snapshot) => {
                snapshot.forEach(doc => {
                    agent.add(doc.data().description);
                    agent.add(payload่json); //แสดง paylaod
                });
            });
        }

    }


    //ภาษาอังกฤษ
    function English(agent) {
        let payload = {
            "type": "template",
            "altText": "this is a confirm template",
            "template": {
                "type": "confirm",
                "actions": [
                    {
                        "type": "message",
                        "label": "ถูก",
                        "text": "ได้รับคำตอบถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาภาษาอังกฤษ"
                    },
                    {
                        "type": "message",
                        "label": "ไม่ถูก",
                        "text": "ได้รับคำตอบไม่ถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาภาษาอังกฤษ"
                    }
                ],
                "text": "คุณได้รับคำตอบถูกต้องไหมคะ?"
            }
        };

        //ประกาศตัวแปร payload เพื่อแสดงออกหน้าจอ
        let payload่json = new Payload(`LINE`, payload, { sendAsMessage: true });
        let text = request.body.queryResult.queryText;
        let c = 'ได้รับคำตอบถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาภาษาอังกฤษ';
        let b = 'ได้รับคำตอบไม่ถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาภาษาอังกฤษ';

        //Count_Accuracy
        let Count_Accuracy = admin.firestore().collection("Count_Accuracy").doc(date.toLocaleDateString()).collection("ค่าธรรมเนียมการศึกษา").doc("คณะมนุษยศาสตร์และสังคมศาสตร์").collection("Subject").doc("ภาษาอังกฤษ");
        Count_Accuracy.get().then(function (docs) {
            if (!docs.exists) {
                Count_Accuracy.set({
                    ถูก: 0,
                    ไม่ถูก: 0
                });
            }

        });


        if (text === c) {
            agent.add("ขอบคุณค่ะ");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ถูก + 1;

                    t.update(Count_Accuracy, {
                        ถูก: newcount,

                    });
                });
            });



        }

        else if (text === b) {

            agent.add("กรุณากดปุ่มติดต่อเจ้าหน้าที่");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ไม่ถูก + 1;

                    t.update(Count_Accuracy, {
                        ไม่ถูก: newcount,

                    });
                });
            });

        }

        else {
            //เชคว่ามี ตัว doc อยู๋ไหม ถ้าไม่ ก็ set ค่า 
            // count_intent 
            Count_Intent.get().then(function (docs) {
                if (!docs.exists) {
                    Count_Intent.set({
                        ค่าธรรมเนียมการศึกษา: 1
                    });
                }

                else {
                    //เลขcount เวลามีคนเข้ามาสอบถาม

                    db.runTransaction(t => {
                        return t.get(Count_Intent).then(doc => {
                            if (doc.data().ค่าธรรมเนียมการศึกษา > 0) {
                                let newcount = doc.data().ค่าธรรมเนียมการศึกษา + 1;

                                t.update(Count_Intent, {
                                    ค่าธรรมเนียมการศึกษา: newcount

                                });
                            } else {
                                t.update(Count_Intent, {
                                    ค่าธรรมเนียมการศึกษา: 1
                                });

                            }

                        });
                    });
                }
            });

            //return ข้อมูลคำตอบ 
            return admin.firestore().collection('Tuition_fee').doc('คณะมนุษยศาสตร์และสังคมศาสตร์').collection('ภาษาอังกฤษ').orderBy("date", "desc").limit(1).get().then((snapshot) => {
                snapshot.forEach(doc => {
                    agent.add(doc.data().description);
                    agent.add(payload่json); //แสดง paylaod
                });
            });
        }

    }

    //ดนตรีสากล
    function Western_Music(agent) {
        let payload = {
            "type": "template",
            "altText": "this is a confirm template",
            "template": {
                "type": "confirm",
                "actions": [
                    {
                        "type": "message",
                        "label": "ถูก",
                        "text": "ได้รับคำตอบถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาดนตรีสากล"
                    },
                    {
                        "type": "message",
                        "label": "ไม่ถูก",
                        "text": "ได้รับคำตอบไม่ถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาดนตรีสากล"
                    }
                ],
                "text": "คุณได้รับคำตอบถูกต้องไหมคะ?"
            }
        };

        //ประกาศตัวแปร payload เพื่อแสดงออกหน้าจอ
        let payload่json = new Payload(`LINE`, payload, { sendAsMessage: true });
        let text = request.body.queryResult.queryText;
        let c = 'ได้รับคำตอบถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาดนตรีสากล';
        let b = 'ได้รับคำตอบไม่ถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาดนตรีสากล';

        //Count_Accuracy
        let Count_Accuracy = admin.firestore().collection("Count_Accuracy").doc(date.toLocaleDateString()).collection("ค่าธรรมเนียมการศึกษา").doc("คณะมนุษยศาสตร์และสังคมศาสตร์").collection("Subject").doc("ดนตรีสากล");
        Count_Accuracy.get().then(function (docs) {
            if (!docs.exists) {
                Count_Accuracy.set({
                    ถูก: 0,
                    ไม่ถูก: 0
                });
            }

        });


        if (text === c) {
            agent.add("ขอบคุณค่ะ");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ถูก + 1;

                    t.update(Count_Accuracy, {
                        ถูก: newcount,

                    });
                });
            });



        }

        else if (text === b) {

            agent.add("กรุณากดปุ่มติดต่อเจ้าหน้าที่");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ไม่ถูก + 1;

                    t.update(Count_Accuracy, {
                        ไม่ถูก: newcount,

                    });
                });
            });

        }

        else {
            //เชคว่ามี ตัว doc อยู๋ไหม ถ้าไม่ ก็ set ค่า 
            // count_intent 
            Count_Intent.get().then(function (docs) {
                if (!docs.exists) {
                    Count_Intent.set({
                        ค่าธรรมเนียมการศึกษา: 1
                    });
                }

                else {
                    //เลขcount เวลามีคนเข้ามาสอบถาม

                    db.runTransaction(t => {
                        return t.get(Count_Intent).then(doc => {
                            if (doc.data().ค่าธรรมเนียมการศึกษา > 0) {
                                let newcount = doc.data().ค่าธรรมเนียมการศึกษา + 1;

                                t.update(Count_Intent, {
                                    ค่าธรรมเนียมการศึกษา: newcount

                                });
                            } else {
                                t.update(Count_Intent, {
                                    ค่าธรรมเนียมการศึกษา: 1
                                });

                            }

                        });
                    });
                }
            });

            //return ข้อมูลคำตอบ 
            return admin.firestore().collection('Tuition_fee').doc('คณะมนุษยศาสตร์และสังคมศาสตร์').collection('ดนตรีสากล').orderBy("date", "desc").limit(1).get().then((snapshot) => {
                snapshot.forEach(doc => {
                    agent.add(doc.data().description);
                    agent.add(payload่json); //แสดง paylaod
                });
            });
        }

    }

    //ทัศนศิลป์
    function Visual_Arts(agent) {
        let payload = {
            "type": "template",
            "altText": "this is a confirm template",
            "template": {
                "type": "confirm",
                "actions": [
                    {
                        "type": "message",
                        "label": "ถูก",
                        "text": "ได้รับคำตอบถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาทัศนศิลป์"
                    },
                    {
                        "type": "message",
                        "label": "ไม่ถูก",
                        "text": "ได้รับคำตอบไม่ถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาทัศนศิลป์"
                    }
                ],
                "text": "คุณได้รับคำตอบถูกต้องไหมคะ?"
            }
        };

        //ประกาศตัวแปร payload เพื่อแสดงออกหน้าจอ
        let payload่json = new Payload(`LINE`, payload, { sendAsMessage: true });
        let text = request.body.queryResult.queryText;
        let c = 'ได้รับคำตอบถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาทัศนศิลป์';
        let b = 'ได้รับคำตอบไม่ถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาทัศนศิลป์';

        //Count_Accuracy
        let Count_Accuracy = admin.firestore().collection("Count_Accuracy").doc(date.toLocaleDateString()).collection("ค่าธรรมเนียมการศึกษา").doc("คณะมนุษยศาสตร์และสังคมศาสตร์").collection("Subject").doc("ทัศนศิลป์");
        Count_Accuracy.get().then(function (docs) {
            if (!docs.exists) {
                Count_Accuracy.set({
                    ถูก: 0,
                    ไม่ถูก: 0
                });
            }

        });


        if (text === c) {
            agent.add("ขอบคุณค่ะ");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ถูก + 1;

                    t.update(Count_Accuracy, {
                        ถูก: newcount,

                    });
                });
            });



        }

        else if (text === b) {

            agent.add("กรุณากดปุ่มติดต่อเจ้าหน้าที่");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ไม่ถูก + 1;

                    t.update(Count_Accuracy, {
                        ไม่ถูก: newcount,

                    });
                });
            });

        }

        else {
            //เชคว่ามี ตัว doc อยู๋ไหม ถ้าไม่ ก็ set ค่า 
            // count_intent 
            Count_Intent.get().then(function (docs) {
                if (!docs.exists) {
                    Count_Intent.set({
                        ค่าธรรมเนียมการศึกษา: 1
                    });
                }

                else {
                    //เลขcount เวลามีคนเข้ามาสอบถาม

                    db.runTransaction(t => {
                        return t.get(Count_Intent).then(doc => {
                            if (doc.data().ค่าธรรมเนียมการศึกษา > 0) {
                                let newcount = doc.data().ค่าธรรมเนียมการศึกษา + 1;

                                t.update(Count_Intent, {
                                    ค่าธรรมเนียมการศึกษา: newcount

                                });
                            } else {
                                t.update(Count_Intent, {
                                    ค่าธรรมเนียมการศึกษา: 1
                                });

                            }

                        });
                    });
                }
            });

            //return ข้อมูลคำตอบ 
            return admin.firestore().collection('Tuition_fee').doc('คณะมนุษยศาสตร์และสังคมศาสตร์').collection('ทัศนศิลป์').orderBy("date", "desc").limit(1).get().then((snapshot) => {
                snapshot.forEach(doc => {
                    agent.add(doc.data().description);
                    agent.add(payload่json); //แสดง paylaod
                });
            });
        }

    }


    //รัฐศาสตร์
    function Political_Science(agent) {
        let payload = {
            "type": "template",
            "altText": "this is a confirm template",
            "template": {
                "type": "confirm",
                "actions": [
                    {
                        "type": "message",
                        "label": "ถูก",
                        "text": "ได้รับคำตอบถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขารัฐศาสตร์"
                    },
                    {
                        "type": "message",
                        "label": "ไม่ถูก",
                        "text": "ได้รับคำตอบไม่ถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขารัฐศาสตร์"
                    }
                ],
                "text": "คุณได้รับคำตอบถูกต้องไหมคะ?"
            }
        };

        //ประกาศตัวแปร payload เพื่อแสดงออกหน้าจอ
        let payload่json = new Payload(`LINE`, payload, { sendAsMessage: true });
        let text = request.body.queryResult.queryText;
        let c = 'ได้รับคำตอบถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขารัฐศาสตร์';
        let b = 'ได้รับคำตอบไม่ถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขารัฐศาสตร์';

        //Count_Accuracy
        let Count_Accuracy = admin.firestore().collection("Count_Accuracy").doc(date.toLocaleDateString()).collection("ค่าธรรมเนียมการศึกษา").doc("คณะมนุษยศาสตร์และสังคมศาสตร์").collection("Subject").doc("รัฐศาสตร์");
        Count_Accuracy.get().then(function (docs) {
            if (!docs.exists) {
                Count_Accuracy.set({
                    ถูก: 0,
                    ไม่ถูก: 0
                });
            }

        });


        if (text === c) {
            agent.add("ขอบคุณค่ะ");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ถูก + 1;

                    t.update(Count_Accuracy, {
                        ถูก: newcount,

                    });
                });
            });



        }

        else if (text === b) {

            agent.add("กรุณากดปุ่มติดต่อเจ้าหน้าที่");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ไม่ถูก + 1;

                    t.update(Count_Accuracy, {
                        ไม่ถูก: newcount,

                    });
                });
            });

        }

        else {
            //เชคว่ามี ตัว doc อยู๋ไหม ถ้าไม่ ก็ set ค่า 
            // count_intent 
            Count_Intent.get().then(function (docs) {
                if (!docs.exists) {
                    Count_Intent.set({
                        ค่าธรรมเนียมการศึกษา: 1
                    });
                }

                else {
                    //เลขcount เวลามีคนเข้ามาสอบถาม

                    db.runTransaction(t => {
                        return t.get(Count_Intent).then(doc => {
                            if (doc.data().ค่าธรรมเนียมการศึกษา > 0) {
                                let newcount = doc.data().ค่าธรรมเนียมการศึกษา + 1;

                                t.update(Count_Intent, {
                                    ค่าธรรมเนียมการศึกษา: newcount

                                });
                            } else {
                                t.update(Count_Intent, {
                                    ค่าธรรมเนียมการศึกษา: 1
                                });

                            }

                        });
                    });
                }
            });

            //return ข้อมูลคำตอบ 
            return admin.firestore().collection('Tuition_fee').doc('คณะมนุษยศาสตร์และสังคมศาสตร์').collection('รัฐศาสตร์').orderBy("date", "desc").limit(1).get().then((snapshot) => {
                snapshot.forEach(doc => {
                    agent.add(doc.data().description);
                    agent.add(payload่json); //แสดง paylaod
                });
            });
        }

    }

    //รัฐประศาสนศาสตร์
    function Public_Adminstration(agent) {
        let payload = {
            "type": "template",
            "altText": "this is a confirm template",
            "template": {
                "type": "confirm",
                "actions": [
                    {
                        "type": "message",
                        "label": "ถูก",
                        "text": "ได้รับคำตอบถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขารัฐประศาสนศาสตร์"
                    },
                    {
                        "type": "message",
                        "label": "ไม่ถูก",
                        "text": "ได้รับคำตอบไม่ถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขารัฐประศาสนศาสตร์"
                    }
                ],
                "text": "คุณได้รับคำตอบถูกต้องไหมคะ?"
            }
        };

        //ประกาศตัวแปร payload เพื่อแสดงออกหน้าจอ
        let payload่json = new Payload(`LINE`, payload, { sendAsMessage: true });
        let text = request.body.queryResult.queryText;
        let c = 'ได้รับคำตอบถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขารัฐประศาสนศาสตร์';
        let b = 'ได้รับคำตอบไม่ถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขารัฐประศาสนศาสตร์';

        //Count_Accuracy
        let Count_Accuracy = admin.firestore().collection("Count_Accuracy").doc(date.toLocaleDateString()).collection("ค่าธรรมเนียมการศึกษา").doc("คณะมนุษยศาสตร์และสังคมศาสตร์").collection("Subject").doc("รัฐประศาสนศาสตร์");
        Count_Accuracy.get().then(function (docs) {
            if (!docs.exists) {
                Count_Accuracy.set({
                    ถูก: 0,
                    ไม่ถูก: 0
                });
            }

        });


        if (text === c) {
            agent.add("ขอบคุณค่ะ");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ถูก + 1;

                    t.update(Count_Accuracy, {
                        ถูก: newcount,

                    });
                });
            });



        }

        else if (text === b) {

            agent.add("กรุณากดปุ่มติดต่อเจ้าหน้าที่");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ไม่ถูก + 1;

                    t.update(Count_Accuracy, {
                        ไม่ถูก: newcount,

                    });
                });
            });

        }

        else {
            //เชคว่ามี ตัว doc อยู๋ไหม ถ้าไม่ ก็ set ค่า 
            // count_intent 
            Count_Intent.get().then(function (docs) {
                if (!docs.exists) {
                    Count_Intent.set({
                        ค่าธรรมเนียมการศึกษา: 1
                    });
                }

                else {
                    //เลขcount เวลามีคนเข้ามาสอบถาม

                    db.runTransaction(t => {
                        return t.get(Count_Intent).then(doc => {
                            if (doc.data().ค่าธรรมเนียมการศึกษา > 0) {
                                let newcount = doc.data().ค่าธรรมเนียมการศึกษา + 1;

                                t.update(Count_Intent, {
                                    ค่าธรรมเนียมการศึกษา: newcount

                                });
                            } else {
                                t.update(Count_Intent, {
                                    ค่าธรรมเนียมการศึกษา: 1
                                });

                            }

                        });
                    });
                }
            });

            //return ข้อมูลคำตอบ 
            return admin.firestore().collection('Tuition_fee').doc('คณะมนุษยศาสตร์และสังคมศาสตร์').collection('รัฐประศาสนศาสตร์').orderBy("date", "desc").limit(1).get().then((snapshot) => {
                snapshot.forEach(doc => {
                    agent.add(doc.data().description);
                    agent.add(payload่json); //แสดง paylaod
                });
            });
        }

    }


    //นิติศาสตร์บัณฑิต
    function Laws_Program(agent) {
        let payload = {
            "type": "template",
            "altText": "this is a confirm template",
            "template": {
                "type": "confirm",
                "actions": [
                    {
                        "type": "message",
                        "label": "ถูก",
                        "text": "ได้รับคำตอบถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขานิติศาสตร์บัณฑิต"
                    },
                    {
                        "type": "message",
                        "label": "ไม่ถูก",
                        "text": "ได้รับคำตอบไม่ถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขานิติศาสตร์บัณฑิต"
                    }
                ],
                "text": "คุณได้รับคำตอบถูกต้องไหมคะ?"
            }
        };

        //ประกาศตัวแปร payload เพื่อแสดงออกหน้าจอ
        let payload่json = new Payload(`LINE`, payload, { sendAsMessage: true });
        let text = request.body.queryResult.queryText;
        let c = 'ได้รับคำตอบถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขานิติศาสตร์บัณฑิต';
        let b = 'ได้รับคำตอบไม่ถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขานิติศาสตร์บัณฑิต';

        //Count_Accuracy
        let Count_Accuracy = admin.firestore().collection("Count_Accuracy").doc(date.toLocaleDateString()).collection("ค่าธรรมเนียมการศึกษา").doc("คณะมนุษยศาสตร์และสังคมศาสตร์").collection("Subject").doc("นิติศาสตร์บัณฑิต");
        Count_Accuracy.get().then(function (docs) {
            if (!docs.exists) {
                Count_Accuracy.set({
                    ถูก: 0,
                    ไม่ถูก: 0
                });
            }

        });


        if (text === c) {
            agent.add("ขอบคุณค่ะ");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ถูก + 1;

                    t.update(Count_Accuracy, {
                        ถูก: newcount,

                    });
                });
            });



        }

        else if (text === b) {

            agent.add("กรุณากดปุ่มติดต่อเจ้าหน้าที่");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ไม่ถูก + 1;

                    t.update(Count_Accuracy, {
                        ไม่ถูก: newcount,

                    });
                });
            });

        }

        else {
            //เชคว่ามี ตัว doc อยู๋ไหม ถ้าไม่ ก็ set ค่า 
            // count_intent 
            Count_Intent.get().then(function (docs) {
                if (!docs.exists) {
                    Count_Intent.set({
                        ค่าธรรมเนียมการศึกษา: 1
                    });
                }

                else {
                    //เลขcount เวลามีคนเข้ามาสอบถาม

                    db.runTransaction(t => {
                        return t.get(Count_Intent).then(doc => {
                            if (doc.data().ค่าธรรมเนียมการศึกษา > 0) {
                                let newcount = doc.data().ค่าธรรมเนียมการศึกษา + 1;

                                t.update(Count_Intent, {
                                    ค่าธรรมเนียมการศึกษา: newcount

                                });
                            } else {
                                t.update(Count_Intent, {
                                    ค่าธรรมเนียมการศึกษา: 1
                                });

                            }

                        });
                    });
                }
            });

            //return ข้อมูลคำตอบ 
            return admin.firestore().collection('Tuition_fee').doc('คณะมนุษยศาสตร์และสังคมศาสตร์').collection('นิติศาสตร์บัณฑิต').orderBy("date", "desc").limit(1).get().then((snapshot) => {
                snapshot.forEach(doc => {
                    agent.add(doc.data().description);
                    agent.add(payload่json); //แสดง paylaod
                });
            });
        }

    }



    //ภาษาญี่ปุ่น
    function Japanese(agent) {
        let payload = {
            "type": "template",
            "altText": "this is a confirm template",
            "template": {
                "type": "confirm",
                "actions": [
                    {
                        "type": "message",
                        "label": "ถูก",
                        "text": "ได้รับคำตอบถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาภาษาญี่ปุ่น"
                    },
                    {
                        "type": "message",
                        "label": "ไม่ถูก",
                        "text": "ได้รับคำตอบไม่ถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาภาษาญี่ปุ่น"
                    }
                ],
                "text": "คุณได้รับคำตอบถูกต้องไหมคะ?"
            }
        };

        //ประกาศตัวแปร payload เพื่อแสดงออกหน้าจอ
        let payload่json = new Payload(`LINE`, payload, { sendAsMessage: true });
        let text = request.body.queryResult.queryText;
        let c = 'ได้รับคำตอบถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาภาษาญี่ปุ่น';
        let b = 'ได้รับคำตอบไม่ถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาภาษาญี่ปุ่น';

        //Count_Accuracy
        let Count_Accuracy = admin.firestore().collection("Count_Accuracy").doc(date.toLocaleDateString()).collection("ค่าธรรมเนียมการศึกษา").doc("คณะมนุษยศาสตร์และสังคมศาสตร์").collection("Subject").doc("ภาษาญี่ปุ่น");
        Count_Accuracy.get().then(function (docs) {
            if (!docs.exists) {
                Count_Accuracy.set({
                    ถูก: 0,
                    ไม่ถูก: 0
                });
            }

        });


        if (text === c) {
            agent.add("ขอบคุณค่ะ");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ถูก + 1;

                    t.update(Count_Accuracy, {
                        ถูก: newcount,

                    });
                });
            });



        }

        else if (text === b) {

            agent.add("กรุณากดปุ่มติดต่อเจ้าหน้าที่");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ไม่ถูก + 1;

                    t.update(Count_Accuracy, {
                        ไม่ถูก: newcount,

                    });
                });
            });

        }

        else {
            //เชคว่ามี ตัว doc อยู๋ไหม ถ้าไม่ ก็ set ค่า 
            // count_intent 
            Count_Intent.get().then(function (docs) {
                if (!docs.exists) {
                    Count_Intent.set({
                        ค่าธรรมเนียมการศึกษา: 1
                    });
                }

                else {
                    //เลขcount เวลามีคนเข้ามาสอบถาม

                    db.runTransaction(t => {
                        return t.get(Count_Intent).then(doc => {
                            if (doc.data().ค่าธรรมเนียมการศึกษา > 0) {
                                let newcount = doc.data().ค่าธรรมเนียมการศึกษา + 1;

                                t.update(Count_Intent, {
                                    ค่าธรรมเนียมการศึกษา: newcount

                                });
                            } else {
                                t.update(Count_Intent, {
                                    ค่าธรรมเนียมการศึกษา: 1
                                });

                            }

                        });
                    });
                }
            });

            //return ข้อมูลคำตอบ 
            return admin.firestore().collection('Tuition_fee').doc('คณะมนุษยศาสตร์และสังคมศาสตร์').collection('ภาษาญี่ปุ่น').orderBy("date", "desc").limit(1).get().then((snapshot) => {
                snapshot.forEach(doc => {
                    agent.add(doc.data().description);
                    agent.add(payload่json); //แสดง paylaod
                });
            });
        }

    }



    //ศิลปกรรม
    function Fine_and_Applied_Arts(agent) {
        let payload = {
            "type": "template",
            "altText": "this is a confirm template",
            "template": {
                "type": "confirm",
                "actions": [
                    {
                        "type": "message",
                        "label": "ถูก",
                        "text": "ได้รับคำตอบถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาศิลปกรรม"
                    },
                    {
                        "type": "message",
                        "label": "ไม่ถูก",
                        "text": "ได้รับคำตอบไม่ถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาศิลปกรรม"
                    }
                ],
                "text": "คุณได้รับคำตอบถูกต้องไหมคะ?"
            }
        };

        //ประกาศตัวแปร payload เพื่อแสดงออกหน้าจอ
        let payload่json = new Payload(`LINE`, payload, { sendAsMessage: true });
        let text = request.body.queryResult.queryText;
        let c = 'ได้รับคำตอบถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาศิลปกรรม';
        let b = 'ได้รับคำตอบไม่ถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาศิลปกรรม';

        //Count_Accuracy
        let Count_Accuracy = admin.firestore().collection("Count_Accuracy").doc(date.toLocaleDateString()).collection("ค่าธรรมเนียมการศึกษา").doc("คณะมนุษยศาสตร์และสังคมศาสตร์").collection("Subject").doc("ศิลปกรรม");
        Count_Accuracy.get().then(function (docs) {
            if (!docs.exists) {
                Count_Accuracy.set({
                    ถูก: 0,
                    ไม่ถูก: 0
                });
            }

        });


        if (text === c) {
            agent.add("ขอบคุณค่ะ");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ถูก + 1;

                    t.update(Count_Accuracy, {
                        ถูก: newcount,

                    });
                });
            });



        }

        else if (text === b) {

            agent.add("กรุณากดปุ่มติดต่อเจ้าหน้าที่");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ไม่ถูก + 1;

                    t.update(Count_Accuracy, {
                        ไม่ถูก: newcount,

                    });
                });
            });

        }

        else {
            //เชคว่ามี ตัว doc อยู๋ไหม ถ้าไม่ ก็ set ค่า 
            // count_intent 
            Count_Intent.get().then(function (docs) {
                if (!docs.exists) {
                    Count_Intent.set({
                        ค่าธรรมเนียมการศึกษา: 1
                    });
                }

                else {
                    //เลขcount เวลามีคนเข้ามาสอบถาม

                    db.runTransaction(t => {
                        return t.get(Count_Intent).then(doc => {
                            if (doc.data().ค่าธรรมเนียมการศึกษา > 0) {
                                let newcount = doc.data().ค่าธรรมเนียมการศึกษา + 1;

                                t.update(Count_Intent, {
                                    ค่าธรรมเนียมการศึกษา: newcount

                                });
                            } else {
                                t.update(Count_Intent, {
                                    ค่าธรรมเนียมการศึกษา: 1
                                });

                            }

                        });
                    });
                }
            });

            //return ข้อมูลคำตอบ 
            return admin.firestore().collection('Tuition_fee').doc('คณะมนุษยศาสตร์และสังคมศาสตร์').collection('ศิลปกรรม').orderBy("date", "desc").limit(1).get().then((snapshot) => {
                snapshot.forEach(doc => {
                    agent.add(doc.data().description);
                    agent.add(payload่json); //แสดง paylaod
                });
            });
        }

    }


    //สารสนเทศศาสตร์และบรรณารักษศาสตร์
    function Information_and_Library_Science(agent) {
        let payload = {
            "type": "template",
            "altText": "this is a confirm template",
            "template": {
                "type": "confirm",
                "actions": [
                    {
                        "type": "message",
                        "label": "ถูก",
                        "text": "ได้รับคำตอบถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาสารสนเทศศาสตร์และบรรณารักษศาสตร์"
                    },
                    {
                        "type": "message",
                        "label": "ไม่ถูก",
                        "text": "ได้รับคำตอบไม่ถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาสารสนเทศศาสตร์และบรรณารักษศาสตร์"
                    }
                ],
                "text": "คุณได้รับคำตอบถูกต้องไหมคะ?"
            }
        };

        //ประกาศตัวแปร payload เพื่อแสดงออกหน้าจอ
        let payload่json = new Payload(`LINE`, payload, { sendAsMessage: true });
        let text = request.body.queryResult.queryText;
        let c = 'ได้รับคำตอบถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาสารสนเทศศาสตร์และบรรณารักษศาสตร์';
        let b = 'ได้รับคำตอบไม่ถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาสารสนเทศศาสตร์และบรรณารักษศาสตร์';

        //Count_Accuracy
        let Count_Accuracy = admin.firestore().collection("Count_Accuracy").doc(date.toLocaleDateString()).collection("ค่าธรรมเนียมการศึกษา").doc("คณะมนุษยศาสตร์และสังคมศาสตร์").collection("Subject").doc("สารสนเทศศาสตร์และบรรณารักษศาสตร์");
        Count_Accuracy.get().then(function (docs) {
            if (!docs.exists) {
                Count_Accuracy.set({
                    ถูก: 0,
                    ไม่ถูก: 0
                });
            }

        });


        if (text === c) {
            agent.add("ขอบคุณค่ะ");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ถูก + 1;

                    t.update(Count_Accuracy, {
                        ถูก: newcount,

                    });
                });
            });



        }

        else if (text === b) {

            agent.add("กรุณากดปุ่มติดต่อเจ้าหน้าที่");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ไม่ถูก + 1;

                    t.update(Count_Accuracy, {
                        ไม่ถูก: newcount,

                    });
                });
            });

        }

        else {
            //เชคว่ามี ตัว doc อยู๋ไหม ถ้าไม่ ก็ set ค่า 
            // count_intent 
            Count_Intent.get().then(function (docs) {
                if (!docs.exists) {
                    Count_Intent.set({
                        ค่าธรรมเนียมการศึกษา: 1
                    });
                }

                else {
                    //เลขcount เวลามีคนเข้ามาสอบถาม

                    db.runTransaction(t => {
                        return t.get(Count_Intent).then(doc => {
                            if (doc.data().ค่าธรรมเนียมการศึกษา > 0) {
                                let newcount = doc.data().ค่าธรรมเนียมการศึกษา + 1;

                                t.update(Count_Intent, {
                                    ค่าธรรมเนียมการศึกษา: newcount

                                });
                            } else {
                                t.update(Count_Intent, {
                                    ค่าธรรมเนียมการศึกษา: 1
                                });

                            }

                        });
                    });
                }
            });

            //return ข้อมูลคำตอบ 
            return admin.firestore().collection('Tuition_fee').doc('คณะมนุษยศาสตร์และสังคมศาสตร์').collection('สารสนเทศศาสตร์และบรรณารักษศาสตร์').orderBy("date", "desc").limit(1).get().then((snapshot) => {
                snapshot.forEach(doc => {
                    agent.add(doc.data().description);
                    agent.add(payload่json); //แสดง paylaod
                });
            });
        }

    }


    //นาฎดุริยางคศิลป์ไทย
    function Thai_Music_Education(agent) {
        let payload = {
            "type": "template",
            "altText": "this is a confirm template",
            "template": {
                "type": "confirm",
                "actions": [
                    {
                        "type": "message",
                        "label": "ถูก",
                        "text": "ได้รับคำตอบถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขานาฎดุริยางคศิลป์ไทย"
                    },
                    {
                        "type": "message",
                        "label": "ไม่ถูก",
                        "text": "ได้รับคำตอบไม่ถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขานาฎดุริยางคศิลป์ไทย"
                    }
                ],
                "text": "คุณได้รับคำตอบถูกต้องไหมคะ?"
            }
        };

        //ประกาศตัวแปร payload เพื่อแสดงออกหน้าจอ
        let payload่json = new Payload(`LINE`, payload, { sendAsMessage: true });
        let text = request.body.queryResult.queryText;
        let c = 'ได้รับคำตอบถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขานาฎดุริยางคศิลป์ไทย';
        let b = 'ได้รับคำตอบไม่ถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขานาฎดุริยางคศิลป์ไทย';

        //Count_Accuracy
        let Count_Accuracy = admin.firestore().collection("Count_Accuracy").doc(date.toLocaleDateString()).collection("ค่าธรรมเนียมการศึกษา").doc("คณะมนุษยศาสตร์และสังคมศาสตร์").collection("Subject").doc("นาฎดุริยางคศิลป์ไทย");
        Count_Accuracy.get().then(function (docs) {
            if (!docs.exists) {
                Count_Accuracy.set({
                    ถูก: 0,
                    ไม่ถูก: 0
                });
            }

        });


        if (text === c) {
            agent.add("ขอบคุณค่ะ");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ถูก + 1;

                    t.update(Count_Accuracy, {
                        ถูก: newcount,

                    });
                });
            });



        }

        else if (text === b) {

            agent.add("กรุณากดปุ่มติดต่อเจ้าหน้าที่");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ไม่ถูก + 1;

                    t.update(Count_Accuracy, {
                        ไม่ถูก: newcount,

                    });
                });
            });

        }

        else {
            //เชคว่ามี ตัว doc อยู๋ไหม ถ้าไม่ ก็ set ค่า 
            // count_intent 
            Count_Intent.get().then(function (docs) {
                if (!docs.exists) {
                    Count_Intent.set({
                        ค่าธรรมเนียมการศึกษา: 1
                    });
                }

                else {
                    //เลขcount เวลามีคนเข้ามาสอบถาม

                    db.runTransaction(t => {
                        return t.get(Count_Intent).then(doc => {
                            if (doc.data().ค่าธรรมเนียมการศึกษา > 0) {
                                let newcount = doc.data().ค่าธรรมเนียมการศึกษา + 1;

                                t.update(Count_Intent, {
                                    ค่าธรรมเนียมการศึกษา: newcount

                                });
                            } else {
                                t.update(Count_Intent, {
                                    ค่าธรรมเนียมการศึกษา: 1
                                });

                            }

                        });
                    });
                }
            });

            //return ข้อมูลคำตอบ 
            return admin.firestore().collection('Tuition_fee').doc('คณะมนุษยศาสตร์และสังคมศาสตร์').collection('นาฎดุริยางคศิลป์ไทย').orderBy("date", "desc").limit(1).get().then((snapshot) => {
                snapshot.forEach(doc => {
                    agent.add(doc.data().description);
                    agent.add(payload่json); //แสดง paylaod
                });
            });
        }

    }



    //คณะวิทยาการจัดการ 
    //การบัญชี
    function Accounting(agent) {
        let payload = {
            "type": "template",
            "altText": "this is a confirm template",
            "template": {
                "type": "confirm",
                "actions": [
                    {
                        "type": "message",
                        "label": "ถูก",
                        "text": "ได้รับคำตอบถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาการบัญชี"
                    },
                    {
                        "type": "message",
                        "label": "ไม่ถูก",
                        "text": "ได้รับคำตอบไม่ถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาการบัญชี"
                    }
                ],
                "text": "คุณได้รับคำตอบถูกต้องไหมคะ?"
            }
        };

        //ประกาศตัวแปร payload เพื่อแสดงออกหน้าจอ
        let payload่json = new Payload(`LINE`, payload, { sendAsMessage: true });
        let text = request.body.queryResult.queryText;
        let c = 'ได้รับคำตอบถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาการบัญชี';
        let b = 'ได้รับคำตอบไม่ถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาการบัญชี';

        //Count_Accuracy
        let Count_Accuracy = admin.firestore().collection("Count_Accuracy").doc(date.toLocaleDateString()).collection("ค่าธรรมเนียมการศึกษา").doc("คณะวิทยาการจัดการ").collection("Subject").doc("การบัญชี");
        Count_Accuracy.get().then(function (docs) {
            if (!docs.exists) {
                Count_Accuracy.set({
                    ถูก: 0,
                    ไม่ถูก: 0
                });
            }

        });


        if (text === c) {
            agent.add("ขอบคุณค่ะ");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ถูก + 1;

                    t.update(Count_Accuracy, {
                        ถูก: newcount,

                    });
                });
            });



        }

        else if (text === b) {

            agent.add("กรุณากดปุ่มติดต่อเจ้าหน้าที่");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ไม่ถูก + 1;

                    t.update(Count_Accuracy, {
                        ไม่ถูก: newcount,

                    });
                });
            });

        }

        else {
            //เชคว่ามี ตัว doc อยู๋ไหม ถ้าไม่ ก็ set ค่า 
            // count_intent 
            Count_Intent.get().then(function (docs) {
                if (!docs.exists) {
                    Count_Intent.set({
                        ค่าธรรมเนียมการศึกษา: 1
                    });
                }

                else {
                    //เลขcount เวลามีคนเข้ามาสอบถาม

                    db.runTransaction(t => {
                        return t.get(Count_Intent).then(doc => {
                            if (doc.data().ค่าธรรมเนียมการศึกษา > 0) {
                                let newcount = doc.data().ค่าธรรมเนียมการศึกษา + 1;

                                t.update(Count_Intent, {
                                    ค่าธรรมเนียมการศึกษา: newcount

                                });
                            } else {
                                t.update(Count_Intent, {
                                    ค่าธรรมเนียมการศึกษา: 1
                                });

                            }

                        });
                    });
                }
            });

            //return ข้อมูลคำตอบ 
            return admin.firestore().collection('Tuition_fee').doc('คณะวิทยาการจัดการ').collection('การบัญชี').orderBy("date", "desc").limit(1).get().then((snapshot) => {
                snapshot.forEach(doc => {
                    agent.add(doc.data().description);
                    agent.add(payload่json); //แสดง paylaod
                });
            });
        }

    }


    //การจัดการทรัพยากรมนุษย์
    function Human_Resource_Management(agent) {
        let payload = {
            "type": "template",
            "altText": "this is a confirm template",
            "template": {
                "type": "confirm",
                "actions": [
                    {
                        "type": "message",
                        "label": "ถูก",
                        "text": "ได้รับคำตอบถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาการจัดการทรัพยากรมนุษย์"
                    },
                    {
                        "type": "message",
                        "label": "ไม่ถูก",
                        "text": "ได้รับคำตอบไม่ถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาการจัดการทรัพยากรมนุษย์"
                    }
                ],
                "text": "คุณได้รับคำตอบถูกต้องไหมคะ?"
            }
        };

        //ประกาศตัวแปร payload เพื่อแสดงออกหน้าจอ
        let payload่json = new Payload(`LINE`, payload, { sendAsMessage: true });
        let text = request.body.queryResult.queryText;
        let c = 'ได้รับคำตอบถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาการจัดการทรัพยากรมนุษย์';
        let b = 'ได้รับคำตอบไม่ถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาการจัดการทรัพยากรมนุษย์';

        //Count_Accuracy
        let Count_Accuracy = admin.firestore().collection("Count_Accuracy").doc(date.toLocaleDateString()).collection("ค่าธรรมเนียมการศึกษา").doc("คณะวิทยาการจัดการ").collection("Subject").doc("การจัดการทรัพยากรมนุษย์");
        Count_Accuracy.get().then(function (docs) {
            if (!docs.exists) {
                Count_Accuracy.set({
                    ถูก: 0,
                    ไม่ถูก: 0
                });
            }

        });


        if (text === c) {
            agent.add("ขอบคุณค่ะ");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ถูก + 1;

                    t.update(Count_Accuracy, {
                        ถูก: newcount,

                    });
                });
            });



        }

        else if (text === b) {

            agent.add("กรุณากดปุ่มติดต่อเจ้าหน้าที่");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ไม่ถูก + 1;

                    t.update(Count_Accuracy, {
                        ไม่ถูก: newcount,

                    });
                });
            });

        }

        else {
            //เชคว่ามี ตัว doc อยู๋ไหม ถ้าไม่ ก็ set ค่า 
            // count_intent 
            Count_Intent.get().then(function (docs) {
                if (!docs.exists) {
                    Count_Intent.set({
                        ค่าธรรมเนียมการศึกษา: 1
                    });
                }

                else {
                    //เลขcount เวลามีคนเข้ามาสอบถาม

                    db.runTransaction(t => {
                        return t.get(Count_Intent).then(doc => {
                            if (doc.data().ค่าธรรมเนียมการศึกษา > 0) {
                                let newcount = doc.data().ค่าธรรมเนียมการศึกษา + 1;

                                t.update(Count_Intent, {
                                    ค่าธรรมเนียมการศึกษา: newcount

                                });
                            } else {
                                t.update(Count_Intent, {
                                    ค่าธรรมเนียมการศึกษา: 1
                                });

                            }

                        });
                    });
                }
            });

            //return ข้อมูลคำตอบ 
            return admin.firestore().collection('Tuition_fee').doc('คณะวิทยาการจัดการ').collection('การจัดการทรัพยากรมนุษย์').orderBy("date", "desc").limit(1).get().then((snapshot) => {
                snapshot.forEach(doc => {
                    agent.add(doc.data().description);
                    agent.add(payload่json); //แสดง paylaod
                });
            });
        }

    }

    //การตลาด
    function Marketing(agent) {
        let payload = {
            "type": "template",
            "altText": "this is a confirm template",
            "template": {
                "type": "confirm",
                "actions": [
                    {
                        "type": "message",
                        "label": "ถูก",
                        "text": "ได้รับคำตอบถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาการตลาด"
                    },
                    {
                        "type": "message",
                        "label": "ไม่ถูก",
                        "text": "ได้รับคำตอบไม่ถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาการตลาด"
                    }
                ],
                "text": "คุณได้รับคำตอบถูกต้องไหมคะ?"
            }
        };

        //ประกาศตัวแปร payload เพื่อแสดงออกหน้าจอ
        let payload่json = new Payload(`LINE`, payload, { sendAsMessage: true });
        let text = request.body.queryResult.queryText;
        let c = 'ได้รับคำตอบถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาการตลาด';
        let b = 'ได้รับคำตอบไม่ถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาการตลาด';

        //Count_Accuracy
        let Count_Accuracy = admin.firestore().collection("Count_Accuracy").doc(date.toLocaleDateString()).collection("ค่าธรรมเนียมการศึกษา").doc("คณะวิทยาการจัดการ").collection("Subject").doc("การตลาด");
        Count_Accuracy.get().then(function (docs) {
            if (!docs.exists) {
                Count_Accuracy.set({
                    ถูก: 0,
                    ไม่ถูก: 0
                });
            }

        });


        if (text === c) {
            agent.add("ขอบคุณค่ะ");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ถูก + 1;

                    t.update(Count_Accuracy, {
                        ถูก: newcount,

                    });
                });
            });



        }

        else if (text === b) {

            agent.add("กรุณากดปุ่มติดต่อเจ้าหน้าที่");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ไม่ถูก + 1;

                    t.update(Count_Accuracy, {
                        ไม่ถูก: newcount,

                    });
                });
            });

        }

        else {
            //เชคว่ามี ตัว doc อยู๋ไหม ถ้าไม่ ก็ set ค่า 
            // count_intent 
            Count_Intent.get().then(function (docs) {
                if (!docs.exists) {
                    Count_Intent.set({
                        ค่าธรรมเนียมการศึกษา: 1
                    });
                }

                else {
                    //เลขcount เวลามีคนเข้ามาสอบถาม

                    db.runTransaction(t => {
                        return t.get(Count_Intent).then(doc => {
                            if (doc.data().ค่าธรรมเนียมการศึกษา > 0) {
                                let newcount = doc.data().ค่าธรรมเนียมการศึกษา + 1;

                                t.update(Count_Intent, {
                                    ค่าธรรมเนียมการศึกษา: newcount

                                });
                            } else {
                                t.update(Count_Intent, {
                                    ค่าธรรมเนียมการศึกษา: 1
                                });

                            }

                        });
                    });
                }
            });

            //return ข้อมูลคำตอบ 
            return admin.firestore().collection('Tuition_fee').doc('คณะวิทยาการจัดการ').collection('การตลาด').orderBy("date", "desc").limit(1).get().then((snapshot) => {
                snapshot.forEach(doc => {
                    agent.add(doc.data().description);
                    agent.add(payload่json); //แสดง paylaod
                });
            });
        }

    }

    //คอมพิวเตอร์ธุรกิจ
    function Business_Computer(agent) {
        let payload = {
            "type": "template",
            "altText": "this is a confirm template",
            "template": {
                "type": "confirm",
                "actions": [
                    {
                        "type": "message",
                        "label": "ถูก",
                        "text": "ได้รับคำตอบถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาคอมพิวเตอร์ธุรกิจ"
                    },
                    {
                        "type": "message",
                        "label": "ไม่ถูก",
                        "text": "ได้รับคำตอบไม่ถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาคอมพิวเตอร์ธุรกิจ"
                    }
                ],
                "text": "คุณได้รับคำตอบถูกต้องไหมคะ?"
            }
        };

        //ประกาศตัวแปร payload เพื่อแสดงออกหน้าจอ
        let payload่json = new Payload(`LINE`, payload, { sendAsMessage: true });
        let text = request.body.queryResult.queryText;
        let c = 'ได้รับคำตอบถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาคอมพิวเตอร์ธุรกิจ';
        let b = 'ได้รับคำตอบไม่ถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาคอมพิวเตอร์ธุรกิจ';

        //Count_Accuracy
        let Count_Accuracy = admin.firestore().collection("Count_Accuracy").doc(date.toLocaleDateString()).collection("ค่าธรรมเนียมการศึกษา").doc("คณะวิทยาการจัดการ").collection("Subject").doc("คอมพิวเตอร์ธุรกิจ");
        Count_Accuracy.get().then(function (docs) {
            if (!docs.exists) {
                Count_Accuracy.set({
                    ถูก: 0,
                    ไม่ถูก: 0
                });
            }

        });


        if (text === c) {
            agent.add("ขอบคุณค่ะ");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ถูก + 1;

                    t.update(Count_Accuracy, {
                        ถูก: newcount,

                    });
                });
            });



        }

        else if (text === b) {

            agent.add("กรุณากดปุ่มติดต่อเจ้าหน้าที่");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ไม่ถูก + 1;

                    t.update(Count_Accuracy, {
                        ไม่ถูก: newcount,

                    });
                });
            });

        }

        else {
            //เชคว่ามี ตัว doc อยู๋ไหม ถ้าไม่ ก็ set ค่า 
            // count_intent 
            Count_Intent.get().then(function (docs) {
                if (!docs.exists) {
                    Count_Intent.set({
                        ค่าธรรมเนียมการศึกษา: 1
                    });
                }

                else {
                    //เลขcount เวลามีคนเข้ามาสอบถาม

                    db.runTransaction(t => {
                        return t.get(Count_Intent).then(doc => {
                            if (doc.data().ค่าธรรมเนียมการศึกษา > 0) {
                                let newcount = doc.data().ค่าธรรมเนียมการศึกษา + 1;

                                t.update(Count_Intent, {
                                    ค่าธรรมเนียมการศึกษา: newcount

                                });
                            } else {
                                t.update(Count_Intent, {
                                    ค่าธรรมเนียมการศึกษา: 1
                                });

                            }

                        });
                    });
                }
            });

            //return ข้อมูลคำตอบ 
            return admin.firestore().collection('Tuition_fee').doc('คณะวิทยาการจัดการ').collection('คอมพิวเตอร์ธุรกิจ').orderBy("date", "desc").limit(1).get().then((snapshot) => {
                snapshot.forEach(doc => {
                    agent.add(doc.data().description);
                    agent.add(payload่json); //แสดง paylaod
                });
            });
        }

    }


    //การบัญชี
    function Management(agent) {
        let payload = {
            "type": "template",
            "altText": "this is a confirm template",
            "template": {
                "type": "confirm",
                "actions": [
                    {
                        "type": "message",
                        "label": "ถูก",
                        "text": "ได้รับคำตอบถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาการจัดการ"
                    },
                    {
                        "type": "message",
                        "label": "ไม่ถูก",
                        "text": "ได้รับคำตอบไม่ถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาการจัดการ"
                    }
                ],
                "text": "คุณได้รับคำตอบถูกต้องไหมคะ?"
            }
        };

        //ประกาศตัวแปร payload เพื่อแสดงออกหน้าจอ
        let payload่json = new Payload(`LINE`, payload, { sendAsMessage: true });
        let text = request.body.queryResult.queryText;
        let c = 'ได้รับคำตอบถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาการจัดการ';
        let b = 'ได้รับคำตอบไม่ถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาการจัดการ';

        //Count_Accuracy
        let Count_Accuracy = admin.firestore().collection("Count_Accuracy").doc(date.toLocaleDateString()).collection("ค่าธรรมเนียมการศึกษา").doc("คณะวิทยาการจัดการ").collection("Subject").doc("การจัดการ");
        Count_Accuracy.get().then(function (docs) {
            if (!docs.exists) {
                Count_Accuracy.set({
                    ถูก: 0,
                    ไม่ถูก: 0
                });
            }

        });


        if (text === c) {
            agent.add("ขอบคุณค่ะ");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ถูก + 1;

                    t.update(Count_Accuracy, {
                        ถูก: newcount,

                    });
                });
            });



        }

        else if (text === b) {

            agent.add("กรุณากดปุ่มติดต่อเจ้าหน้าที่");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ไม่ถูก + 1;

                    t.update(Count_Accuracy, {
                        ไม่ถูก: newcount,

                    });
                });
            });

        }

        else {
            //เชคว่ามี ตัว doc อยู๋ไหม ถ้าไม่ ก็ set ค่า 
            // count_intent 
            Count_Intent.get().then(function (docs) {
                if (!docs.exists) {
                    Count_Intent.set({
                        ค่าธรรมเนียมการศึกษา: 1
                    });
                }

                else {
                    //เลขcount เวลามีคนเข้ามาสอบถาม

                    db.runTransaction(t => {
                        return t.get(Count_Intent).then(doc => {
                            if (doc.data().ค่าธรรมเนียมการศึกษา > 0) {
                                let newcount = doc.data().ค่าธรรมเนียมการศึกษา + 1;

                                t.update(Count_Intent, {
                                    ค่าธรรมเนียมการศึกษา: newcount

                                });
                            } else {
                                t.update(Count_Intent, {
                                    ค่าธรรมเนียมการศึกษา: 1
                                });

                            }

                        });
                    });
                }
            });

            //return ข้อมูลคำตอบ 
            return admin.firestore().collection('Tuition_fee').doc('คณะวิทยาการจัดการ').collection('การจัดการ').orderBy("date", "desc").limit(1).get().then((snapshot) => {
                snapshot.forEach(doc => {
                    agent.add(doc.data().description);
                    agent.add(payload่json); //แสดง paylaod
                });
            });
        }

    }


    //นิเทศศาสตร์
    function Communication_Arts(agent) {
        let payload = {
            "type": "template",
            "altText": "this is a confirm template",
            "template": {
                "type": "confirm",
                "actions": [
                    {
                        "type": "message",
                        "label": "ถูก",
                        "text": "ได้รับคำตอบถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขานิเทศศาสตร์"
                    },
                    {
                        "type": "message",
                        "label": "ไม่ถูก",
                        "text": "ได้รับคำตอบไม่ถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขานิเทศศาสตร์"
                    }
                ],
                "text": "คุณได้รับคำตอบถูกต้องไหมคะ?"
            }
        };

        //ประกาศตัวแปร payload เพื่อแสดงออกหน้าจอ
        let payload่json = new Payload(`LINE`, payload, { sendAsMessage: true });
        let text = request.body.queryResult.queryText;
        let c = 'ได้รับคำตอบถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขานิเทศศาสตร์';
        let b = 'ได้รับคำตอบไม่ถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขานิเทศศาสตร์';

        //Count_Accuracy
        let Count_Accuracy = admin.firestore().collection("Count_Accuracy").doc(date.toLocaleDateString()).collection("ค่าธรรมเนียมการศึกษา").doc("คณะวิทยาการจัดการ").collection("Subject").doc("นิเทศศาสตร์");
        Count_Accuracy.get().then(function (docs) {
            if (!docs.exists) {
                Count_Accuracy.set({
                    ถูก: 0,
                    ไม่ถูก: 0
                });
            }

        });


        if (text === c) {
            agent.add("ขอบคุณค่ะ");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ถูก + 1;

                    t.update(Count_Accuracy, {
                        ถูก: newcount,

                    });
                });
            });



        }

        else if (text === b) {

            agent.add("กรุณากดปุ่มติดต่อเจ้าหน้าที่");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ไม่ถูก + 1;

                    t.update(Count_Accuracy, {
                        ไม่ถูก: newcount,

                    });
                });
            });

        }

        else {
            //เชคว่ามี ตัว doc อยู๋ไหม ถ้าไม่ ก็ set ค่า 
            // count_intent 
            Count_Intent.get().then(function (docs) {
                if (!docs.exists) {
                    Count_Intent.set({
                        ค่าธรรมเนียมการศึกษา: 1
                    });
                }

                else {
                    //เลขcount เวลามีคนเข้ามาสอบถาม

                    db.runTransaction(t => {
                        return t.get(Count_Intent).then(doc => {
                            if (doc.data().ค่าธรรมเนียมการศึกษา > 0) {
                                let newcount = doc.data().ค่าธรรมเนียมการศึกษา + 1;

                                t.update(Count_Intent, {
                                    ค่าธรรมเนียมการศึกษา: newcount

                                });
                            } else {
                                t.update(Count_Intent, {
                                    ค่าธรรมเนียมการศึกษา: 1
                                });

                            }

                        });
                    });
                }
            });

            //return ข้อมูลคำตอบ 
            return admin.firestore().collection('Tuition_fee').doc('คณะวิทยาการจัดการ').collection('นิเทศศาสตร์').orderBy("date", "desc").limit(1).get().then((snapshot) => {
                snapshot.forEach(doc => {
                    agent.add(doc.data().description);
                    agent.add(payload่json); //แสดง paylaod
                });
            });
        }

    }


    //การท่องเที่ยว
    function Tourism(agent) {
        let payload = {
            "type": "template",
            "altText": "this is a confirm template",
            "template": {
                "type": "confirm",
                "actions": [
                    {
                        "type": "message",
                        "label": "ถูก",
                        "text": "ได้รับคำตอบถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาการท่องเที่ยว"
                    },
                    {
                        "type": "message",
                        "label": "ไม่ถูก",
                        "text": "ได้รับคำตอบไม่ถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาการท่องเที่ยว"
                    }
                ],
                "text": "คุณได้รับคำตอบถูกต้องไหมคะ?"
            }
        };

        //ประกาศตัวแปร payload เพื่อแสดงออกหน้าจอ
        let payload่json = new Payload(`LINE`, payload, { sendAsMessage: true });
        let text = request.body.queryResult.queryText;
        let c = 'ได้รับคำตอบถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาการท่องเที่ยว';
        let b = 'ได้รับคำตอบไม่ถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาการท่องเที่ยว';

        //Count_Accuracy
        let Count_Accuracy = admin.firestore().collection("Count_Accuracy").doc(date.toLocaleDateString()).collection("ค่าธรรมเนียมการศึกษา").doc("คณะวิทยาการจัดการ").collection("Subject").doc("การท่องเที่ยว");
        Count_Accuracy.get().then(function (docs) {
            if (!docs.exists) {
                Count_Accuracy.set({
                    ถูก: 0,
                    ไม่ถูก: 0
                });
            }

        });


        if (text === c) {
            agent.add("ขอบคุณค่ะ");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ถูก + 1;

                    t.update(Count_Accuracy, {
                        ถูก: newcount,

                    });
                });
            });



        }

        else if (text === b) {

            agent.add("กรุณากดปุ่มติดต่อเจ้าหน้าที่");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ไม่ถูก + 1;

                    t.update(Count_Accuracy, {
                        ไม่ถูก: newcount,

                    });
                });
            });

        }

        else {
            //เชคว่ามี ตัว doc อยู๋ไหม ถ้าไม่ ก็ set ค่า 
            // count_intent 
            Count_Intent.get().then(function (docs) {
                if (!docs.exists) {
                    Count_Intent.set({
                        ค่าธรรมเนียมการศึกษา: 1
                    });
                }

                else {
                    //เลขcount เวลามีคนเข้ามาสอบถาม

                    db.runTransaction(t => {
                        return t.get(Count_Intent).then(doc => {
                            if (doc.data().ค่าธรรมเนียมการศึกษา > 0) {
                                let newcount = doc.data().ค่าธรรมเนียมการศึกษา + 1;

                                t.update(Count_Intent, {
                                    ค่าธรรมเนียมการศึกษา: newcount

                                });
                            } else {
                                t.update(Count_Intent, {
                                    ค่าธรรมเนียมการศึกษา: 1
                                });

                            }

                        });
                    });
                }
            });

            //return ข้อมูลคำตอบ 
            return admin.firestore().collection('Tuition_fee').doc('คณะวิทยาการจัดการ').collection('การท่องเที่ยว').orderBy("date", "desc").limit(1).get().then((snapshot) => {
                snapshot.forEach(doc => {
                    agent.add(doc.data().description);
                    agent.add(payload่json); //แสดง paylaod
                });
            });
        }

    }



    //คณะวิทยาศาสตร์และเทคโนโลยี
    //อาชีวอนามัยและความปลอดภัย
    function Occupational_Safety_and_Health(agent) {
        let payload = {
            "type": "template",
            "altText": "this is a confirm template",
            "template": {
                "type": "confirm",
                "actions": [
                    {
                        "type": "message",
                        "label": "ถูก",
                        "text": "ได้รับคำตอบถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาอาชีวอนามัยและความปลอดภัย"
                    },
                    {
                        "type": "message",
                        "label": "ไม่ถูก",
                        "text": "ได้รับคำตอบไม่ถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาอาชีวอนามัยและความปลอดภัย"
                    }
                ],
                "text": "คุณได้รับคำตอบถูกต้องไหมคะ?"
            }
        };

        //ประกาศตัวแปร payload เพื่อแสดงออกหน้าจอ
        let payload่json = new Payload(`LINE`, payload, { sendAsMessage: true });
        let text = request.body.queryResult.queryText;
        let c = 'ได้รับคำตอบถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาอาชีวอนามัยและความปลอดภัย';
        let b = 'ได้รับคำตอบไม่ถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาอาชีวอนามัยและความปลอดภัย';

        //Count_Accuracy
        let Count_Accuracy = admin.firestore().collection("Count_Accuracy").doc(date.toLocaleDateString()).collection("ค่าธรรมเนียมการศึกษา").doc("คณะวิทยาศาสตร์และเทคโนโลยี").collection("Subject").doc("อาชีวอนามัยและความปลอดภัย");
        Count_Accuracy.get().then(function (docs) {
            if (!docs.exists) {
                Count_Accuracy.set({
                    ถูก: 0,
                    ไม่ถูก: 0
                });
            }

        });


        if (text === c) {
            agent.add("ขอบคุณค่ะ");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ถูก + 1;

                    t.update(Count_Accuracy, {
                        ถูก: newcount,

                    });
                });
            });



        }

        else if (text === b) {

            agent.add("กรุณากดปุ่มติดต่อเจ้าหน้าที่");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ไม่ถูก + 1;

                    t.update(Count_Accuracy, {
                        ไม่ถูก: newcount,

                    });
                });
            });

        }

        else {
            //เชคว่ามี ตัว doc อยู๋ไหม ถ้าไม่ ก็ set ค่า 
            // count_intent 
            Count_Intent.get().then(function (docs) {
                if (!docs.exists) {
                    Count_Intent.set({
                        ค่าธรรมเนียมการศึกษา: 1
                    });
                }

                else {
                    //เลขcount เวลามีคนเข้ามาสอบถาม

                    db.runTransaction(t => {
                        return t.get(Count_Intent).then(doc => {
                            if (doc.data().ค่าธรรมเนียมการศึกษา > 0) {
                                let newcount = doc.data().ค่าธรรมเนียมการศึกษา + 1;

                                t.update(Count_Intent, {
                                    ค่าธรรมเนียมการศึกษา: newcount

                                });
                            } else {
                                t.update(Count_Intent, {
                                    ค่าธรรมเนียมการศึกษา: 1
                                });

                            }

                        });
                    });
                }
            });

            //return ข้อมูลคำตอบ 
            return admin.firestore().collection('Tuition_fee').doc('คณะวิทยาศาสตร์และเทคโนโลยี').collection('อาชีวอนามัยและความปลอดภัย').orderBy("date", "desc").limit(1).get().then((snapshot) => {
                snapshot.forEach(doc => {
                    agent.add(doc.data().description);
                    agent.add(payload่json); //แสดง paylaod
                });
            });
        }

    }


    //วิทยาศาสตร์สิ่งแวดล้อม
    function Environmental_Science(agent) {
        let payload = {
            "type": "template",
            "altText": "this is a confirm template",
            "template": {
                "type": "confirm",
                "actions": [
                    {
                        "type": "message",
                        "label": "ถูก",
                        "text": "ได้รับคำตอบถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาวิทยาศาสตร์สิ่งแวดล้อม"
                    },
                    {
                        "type": "message",
                        "label": "ไม่ถูก",
                        "text": "ได้รับคำตอบไม่ถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาวิทยาศาสตร์สิ่งแวดล้อม"
                    }
                ],
                "text": "คุณได้รับคำตอบถูกต้องไหมคะ?"
            }
        };

        //ประกาศตัวแปร payload เพื่อแสดงออกหน้าจอ
        let payload่json = new Payload(`LINE`, payload, { sendAsMessage: true });
        let text = request.body.queryResult.queryText;
        let c = 'ได้รับคำตอบถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาวิทยาศาสตร์สิ่งแวดล้อม';
        let b = 'ได้รับคำตอบไม่ถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาวิทยาศาสตร์สิ่งแวดล้อม';

        //Count_Accuracy
        let Count_Accuracy = admin.firestore().collection("Count_Accuracy").doc(date.toLocaleDateString()).collection("ค่าธรรมเนียมการศึกษา").doc("คณะวิทยาศาสตร์และเทคโนโลยี").collection("Subject").doc("วิทยาศาสตร์สิ่งแวดล้อม");
        Count_Accuracy.get().then(function (docs) {
            if (!docs.exists) {
                Count_Accuracy.set({
                    ถูก: 0,
                    ไม่ถูก: 0
                });
            }

        });


        if (text === c) {
            agent.add("ขอบคุณค่ะ");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ถูก + 1;

                    t.update(Count_Accuracy, {
                        ถูก: newcount,

                    });
                });
            });



        }

        else if (text === b) {

            agent.add("กรุณากดปุ่มติดต่อเจ้าหน้าที่");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ไม่ถูก + 1;

                    t.update(Count_Accuracy, {
                        ไม่ถูก: newcount,

                    });
                });
            });

        }

        else {
            //เชคว่ามี ตัว doc อยู๋ไหม ถ้าไม่ ก็ set ค่า 
            // count_intent 
            Count_Intent.get().then(function (docs) {
                if (!docs.exists) {
                    Count_Intent.set({
                        ค่าธรรมเนียมการศึกษา: 1
                    });
                }

                else {
                    //เลขcount เวลามีคนเข้ามาสอบถาม

                    db.runTransaction(t => {
                        return t.get(Count_Intent).then(doc => {
                            if (doc.data().ค่าธรรมเนียมการศึกษา > 0) {
                                let newcount = doc.data().ค่าธรรมเนียมการศึกษา + 1;

                                t.update(Count_Intent, {
                                    ค่าธรรมเนียมการศึกษา: newcount

                                });
                            } else {
                                t.update(Count_Intent, {
                                    ค่าธรรมเนียมการศึกษา: 1
                                });

                            }

                        });
                    });
                }
            });

            //return ข้อมูลคำตอบ 
            return admin.firestore().collection('Tuition_fee').doc('คณะวิทยาศาสตร์และเทคโนโลยี').collection('วิทยาศาสตร์สิ่งแวดล้อม').orderBy("date", "desc").limit(1).get().then((snapshot) => {
                snapshot.forEach(doc => {
                    agent.add(doc.data().description);
                    agent.add(payload่json); //แสดง paylaod
                });
            });
        }

    }


    //เทคโนโลยีสารสนเทศ
    function Information_Technology(agent) {
        let payload = {
            "type": "template",
            "altText": "this is a confirm template",
            "template": {
                "type": "confirm",
                "actions": [
                    {
                        "type": "message",
                        "label": "ถูก",
                        "text": "ได้รับคำตอบถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาเทคโนโลยีสารสนเทศ"
                    },
                    {
                        "type": "message",
                        "label": "ไม่ถูก",
                        "text": "ได้รับคำตอบไม่ถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาเทคโนโลยีสารสนเทศ"
                    }
                ],
                "text": "คุณได้รับคำตอบถูกต้องไหมคะ?"
            }
        };

        //ประกาศตัวแปร payload เพื่อแสดงออกหน้าจอ
        let payload่json = new Payload(`LINE`, payload, { sendAsMessage: true });
        let text = request.body.queryResult.queryText;
        let c = 'ได้รับคำตอบถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาเทคโนโลยีสารสนเทศ';
        let b = 'ได้รับคำตอบไม่ถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาเทคโนโลยีสารสนเทศ';

        //Count_Accuracy
        let Count_Accuracy = admin.firestore().collection("Count_Accuracy").doc(date.toLocaleDateString()).collection("ค่าธรรมเนียมการศึกษา").doc("คณะวิทยาศาสตร์และเทคโนโลยี").collection("Subject").doc("เทคโนโลยีสารสนเทศ");
        Count_Accuracy.get().then(function (docs) {
            if (!docs.exists) {
                Count_Accuracy.set({
                    ถูก: 0,
                    ไม่ถูก: 0
                });
            }

        });


        if (text === c) {
            agent.add("ขอบคุณค่ะ");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ถูก + 1;

                    t.update(Count_Accuracy, {
                        ถูก: newcount,

                    });
                });
            });



        }

        else if (text === b) {

            agent.add("กรุณากดปุ่มติดต่อเจ้าหน้าที่");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ไม่ถูก + 1;

                    t.update(Count_Accuracy, {
                        ไม่ถูก: newcount,

                    });
                });
            });

        }

        else {
            //เชคว่ามี ตัว doc อยู๋ไหม ถ้าไม่ ก็ set ค่า 
            // count_intent 
            Count_Intent.get().then(function (docs) {
                if (!docs.exists) {
                    Count_Intent.set({
                        ค่าธรรมเนียมการศึกษา: 1
                    });
                }

                else {
                    //เลขcount เวลามีคนเข้ามาสอบถาม

                    db.runTransaction(t => {
                        return t.get(Count_Intent).then(doc => {
                            if (doc.data().ค่าธรรมเนียมการศึกษา > 0) {
                                let newcount = doc.data().ค่าธรรมเนียมการศึกษา + 1;

                                t.update(Count_Intent, {
                                    ค่าธรรมเนียมการศึกษา: newcount

                                });
                            } else {
                                t.update(Count_Intent, {
                                    ค่าธรรมเนียมการศึกษา: 1
                                });

                            }

                        });
                    });
                }
            });

            //return ข้อมูลคำตอบ 
            return admin.firestore().collection('Tuition_fee').doc('คณะวิทยาศาสตร์และเทคโนโลยี').collection('เทคโนโลยีสารสนเทศ').orderBy("date", "desc").limit(1).get().then((snapshot) => {
                snapshot.forEach(doc => {
                    agent.add(doc.data().description);
                    agent.add(payload่json); //แสดง paylaod
                });
            });
        }

    }


    //การอาหารและธุรกิจบริการ
    function Food_and_Service(agent) {
        let payload = {
            "type": "template",
            "altText": "this is a confirm template",
            "template": {
                "type": "confirm",
                "actions": [
                    {
                        "type": "message",
                        "label": "ถูก",
                        "text": "ได้รับคำตอบถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาการอาหารและธุรกิจบริการ"
                    },
                    {
                        "type": "message",
                        "label": "ไม่ถูก",
                        "text": "ได้รับคำตอบไม่ถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาการอาหารและธุรกิจบริการ"
                    }
                ],
                "text": "คุณได้รับคำตอบถูกต้องไหมคะ?"
            }
        };

        //ประกาศตัวแปร payload เพื่อแสดงออกหน้าจอ
        let payload่json = new Payload(`LINE`, payload, { sendAsMessage: true });
        let text = request.body.queryResult.queryText;
        let c = 'ได้รับคำตอบถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาการอาหารและธุรกิจบริการ';
        let b = 'ได้รับคำตอบไม่ถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาการอาหารและธุรกิจบริการ';

        //Count_Accuracy
        let Count_Accuracy = admin.firestore().collection("Count_Accuracy").doc(date.toLocaleDateString()).collection("ค่าธรรมเนียมการศึกษา").doc("คณะวิทยาศาสตร์และเทคโนโลยี").collection("Subject").doc("การอาหารและธุรกิจบริการ");
        Count_Accuracy.get().then(function (docs) {
            if (!docs.exists) {
                Count_Accuracy.set({
                    ถูก: 0,
                    ไม่ถูก: 0
                });
            }

        });


        if (text === c) {
            agent.add("ขอบคุณค่ะ");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ถูก + 1;

                    t.update(Count_Accuracy, {
                        ถูก: newcount,

                    });
                });
            });



        }

        else if (text === b) {

            agent.add("กรุณากดปุ่มติดต่อเจ้าหน้าที่");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ไม่ถูก + 1;

                    t.update(Count_Accuracy, {
                        ไม่ถูก: newcount,

                    });
                });
            });

        }

        else {
            //เชคว่ามี ตัว doc อยู๋ไหม ถ้าไม่ ก็ set ค่า 
            // count_intent 
            Count_Intent.get().then(function (docs) {
                if (!docs.exists) {
                    Count_Intent.set({
                        ค่าธรรมเนียมการศึกษา: 1
                    });
                }

                else {
                    //เลขcount เวลามีคนเข้ามาสอบถาม

                    db.runTransaction(t => {
                        return t.get(Count_Intent).then(doc => {
                            if (doc.data().ค่าธรรมเนียมการศึกษา > 0) {
                                let newcount = doc.data().ค่าธรรมเนียมการศึกษา + 1;

                                t.update(Count_Intent, {
                                    ค่าธรรมเนียมการศึกษา: newcount

                                });
                            } else {
                                t.update(Count_Intent, {
                                    ค่าธรรมเนียมการศึกษา: 1
                                });

                            }

                        });
                    });
                }
            });

            //return ข้อมูลคำตอบ 
            return admin.firestore().collection('Tuition_fee').doc('คณะวิทยาศาสตร์และเทคโนโลยี').collection('การอาหารและธุรกิจบริการ').orderBy("date", "desc").limit(1).get().then((snapshot) => {
                snapshot.forEach(doc => {
                    agent.add(doc.data().description);
                    agent.add(payload่json); //แสดง paylaod
                });
            });
        }

    }

    //เทคโนโลยีการเกษตร
    function Agricultural_Technology(agent) {
        let payload = {
            "type": "template",
            "altText": "this is a confirm template",
            "template": {
                "type": "confirm",
                "actions": [
                    {
                        "type": "message",
                        "label": "ถูก",
                        "text": "ได้รับคำตอบถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาเทคโนโลยีการเกษตร"
                    },
                    {
                        "type": "message",
                        "label": "ไม่ถูก",
                        "text": "ได้รับคำตอบไม่ถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาเทคโนโลยีการเกษตร"
                    }
                ],
                "text": "คุณได้รับคำตอบถูกต้องไหมคะ?"
            }
        };

        //ประกาศตัวแปร payload เพื่อแสดงออกหน้าจอ
        let payload่json = new Payload(`LINE`, payload, { sendAsMessage: true });
        let text = request.body.queryResult.queryText;
        let c = 'ได้รับคำตอบถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาเทคโนโลยีการเกษตร';
        let b = 'ได้รับคำตอบไม่ถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาเทคโนโลยีการเกษตร';

        //Count_Accuracy
        let Count_Accuracy = admin.firestore().collection("Count_Accuracy").doc(date.toLocaleDateString()).collection("ค่าธรรมเนียมการศึกษา").doc("คณะวิทยาศาสตร์และเทคโนโลยี").collection("Subject").doc("เทคโนโลยีการเกษตร");
        Count_Accuracy.get().then(function (docs) {
            if (!docs.exists) {
                Count_Accuracy.set({
                    ถูก: 0,
                    ไม่ถูก: 0
                });
            }

        });


        if (text === c) {
            agent.add("ขอบคุณค่ะ");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ถูก + 1;

                    t.update(Count_Accuracy, {
                        ถูก: newcount,

                    });
                });
            });



        }

        else if (text === b) {

            agent.add("กรุณากดปุ่มติดต่อเจ้าหน้าที่");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ไม่ถูก + 1;

                    t.update(Count_Accuracy, {
                        ไม่ถูก: newcount,

                    });
                });
            });

        }

        else {
            //เชคว่ามี ตัว doc อยู๋ไหม ถ้าไม่ ก็ set ค่า 
            // count_intent 
            Count_Intent.get().then(function (docs) {
                if (!docs.exists) {
                    Count_Intent.set({
                        ค่าธรรมเนียมการศึกษา: 1
                    });
                }

                else {
                    //เลขcount เวลามีคนเข้ามาสอบถาม

                    db.runTransaction(t => {
                        return t.get(Count_Intent).then(doc => {
                            if (doc.data().ค่าธรรมเนียมการศึกษา > 0) {
                                let newcount = doc.data().ค่าธรรมเนียมการศึกษา + 1;

                                t.update(Count_Intent, {
                                    ค่าธรรมเนียมการศึกษา: newcount

                                });
                            } else {
                                t.update(Count_Intent, {
                                    ค่าธรรมเนียมการศึกษา: 1
                                });

                            }

                        });
                    });
                }
            });

            //return ข้อมูลคำตอบ 
            return admin.firestore().collection('Tuition_fee').doc('คณะวิทยาศาสตร์และเทคโนโลยี').collection('เทคโนโลยีการเกษตร').orderBy("date", "desc").limit(1).get().then((snapshot) => {
                snapshot.forEach(doc => {
                    agent.add(doc.data().description);
                    agent.add(payload่json); //แสดง paylaod
                });
            });
        }

    }



    //วิชาเคมี
    function Chemistry(agent) {
        let payload = {
            "type": "template",
            "altText": "this is a confirm template",
            "template": {
                "type": "confirm",
                "actions": [
                    {
                        "type": "message",
                        "label": "ถูก",
                        "text": "ได้รับคำตอบถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาวิชาเคมี"
                    },
                    {
                        "type": "message",
                        "label": "ไม่ถูก",
                        "text": "ได้รับคำตอบไม่ถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาวิชาเคมี"
                    }
                ],
                "text": "คุณได้รับคำตอบถูกต้องไหมคะ?"
            }
        };

        //ประกาศตัวแปร payload เพื่อแสดงออกหน้าจอ
        let payload่json = new Payload(`LINE`, payload, { sendAsMessage: true });
        let text = request.body.queryResult.queryText;
        let c = 'ได้รับคำตอบถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาวิชาเคมี';
        let b = 'ได้รับคำตอบไม่ถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาวิชาเคมี';

        //Count_Accuracy
        let Count_Accuracy = admin.firestore().collection("Count_Accuracy").doc(date.toLocaleDateString()).collection("ค่าธรรมเนียมการศึกษา").doc("คณะวิทยาศาสตร์และเทคโนโลยี").collection("Subject").doc("วิชาเคมี");
        Count_Accuracy.get().then(function (docs) {
            if (!docs.exists) {
                Count_Accuracy.set({
                    ถูก: 0,
                    ไม่ถูก: 0
                });
            }

        });


        if (text === c) {
            agent.add("ขอบคุณค่ะ");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ถูก + 1;

                    t.update(Count_Accuracy, {
                        ถูก: newcount,

                    });
                });
            });



        }

        else if (text === b) {

            agent.add("กรุณากดปุ่มติดต่อเจ้าหน้าที่");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ไม่ถูก + 1;

                    t.update(Count_Accuracy, {
                        ไม่ถูก: newcount,

                    });
                });
            });

        }

        else {
            //เชคว่ามี ตัว doc อยู๋ไหม ถ้าไม่ ก็ set ค่า 
            // count_intent 
            Count_Intent.get().then(function (docs) {
                if (!docs.exists) {
                    Count_Intent.set({
                        ค่าธรรมเนียมการศึกษา: 1
                    });
                }

                else {
                    //เลขcount เวลามีคนเข้ามาสอบถาม

                    db.runTransaction(t => {
                        return t.get(Count_Intent).then(doc => {
                            if (doc.data().ค่าธรรมเนียมการศึกษา > 0) {
                                let newcount = doc.data().ค่าธรรมเนียมการศึกษา + 1;

                                t.update(Count_Intent, {
                                    ค่าธรรมเนียมการศึกษา: newcount

                                });
                            } else {
                                t.update(Count_Intent, {
                                    ค่าธรรมเนียมการศึกษา: 1
                                });

                            }

                        });
                    });
                }
            });

            //return ข้อมูลคำตอบ 
            return admin.firestore().collection('Tuition_fee').doc('คณะวิทยาศาสตร์และเทคโนโลยี').collection('วิชาเคมี').orderBy("date", "desc").limit(1).get().then((snapshot) => {
                snapshot.forEach(doc => {
                    agent.add(doc.data().description);
                    agent.add(payload่json); //แสดง paylaod
                });
            });
        }

    }



    //ชีววิทยาประยุกต์
    function Biology(agent) {
        let payload = {
            "type": "template",
            "altText": "this is a confirm template",
            "template": {
                "type": "confirm",
                "actions": [
                    {
                        "type": "message",
                        "label": "ถูก",
                        "text": "ได้รับคำตอบถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาชีววิทยาประยุกต์"
                    },
                    {
                        "type": "message",
                        "label": "ไม่ถูก",
                        "text": "ได้รับคำตอบไม่ถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาชีววิทยาประยุกต์"
                    }
                ],
                "text": "คุณได้รับคำตอบถูกต้องไหมคะ?"
            }
        };

        //ประกาศตัวแปร payload เพื่อแสดงออกหน้าจอ
        let payload่json = new Payload(`LINE`, payload, { sendAsMessage: true });
        let text = request.body.queryResult.queryText;
        let c = 'ได้รับคำตอบถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาชีววิทยาประยุกต์';
        let b = 'ได้รับคำตอบไม่ถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาชีววิทยาประยุกต์';

        //Count_Accuracy
        let Count_Accuracy = admin.firestore().collection("Count_Accuracy").doc(date.toLocaleDateString()).collection("ค่าธรรมเนียมการศึกษา").doc("คณะวิทยาศาสตร์และเทคโนโลยี").collection("Subject").doc("ชีววิทยาประยุกต์");
        Count_Accuracy.get().then(function (docs) {
            if (!docs.exists) {
                Count_Accuracy.set({
                    ถูก: 0,
                    ไม่ถูก: 0
                });
            }

        });


        if (text === c) {
            agent.add("ขอบคุณค่ะ");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ถูก + 1;

                    t.update(Count_Accuracy, {
                        ถูก: newcount,

                    });
                });
            });



        }

        else if (text === b) {

            agent.add("กรุณากดปุ่มติดต่อเจ้าหน้าที่");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ไม่ถูก + 1;

                    t.update(Count_Accuracy, {
                        ไม่ถูก: newcount,

                    });
                });
            });

        }

        else {
            //เชคว่ามี ตัว doc อยู๋ไหม ถ้าไม่ ก็ set ค่า 
            // count_intent 
            Count_Intent.get().then(function (docs) {
                if (!docs.exists) {
                    Count_Intent.set({
                        ค่าธรรมเนียมการศึกษา: 1
                    });
                }

                else {
                    //เลขcount เวลามีคนเข้ามาสอบถาม

                    db.runTransaction(t => {
                        return t.get(Count_Intent).then(doc => {
                            if (doc.data().ค่าธรรมเนียมการศึกษา > 0) {
                                let newcount = doc.data().ค่าธรรมเนียมการศึกษา + 1;

                                t.update(Count_Intent, {
                                    ค่าธรรมเนียมการศึกษา: newcount

                                });
                            } else {
                                t.update(Count_Intent, {
                                    ค่าธรรมเนียมการศึกษา: 1
                                });

                            }

                        });
                    });
                }
            });

            //return ข้อมูลคำตอบ 
            return admin.firestore().collection('Tuition_fee').doc('คณะวิทยาศาสตร์และเทคโนโลยี').collection('ชีววิทยาประยุกต์').orderBy("date", "desc").limit(1).get().then((snapshot) => {
                snapshot.forEach(doc => {
                    agent.add(doc.data().description);
                    agent.add(payload่json); //แสดง paylaod
                });
            });
        }

    }


    //ฟิสิกส์ประยุกต์
    function Physics(agent) {
        let payload = {
            "type": "template",
            "altText": "this is a confirm template",
            "template": {
                "type": "confirm",
                "actions": [
                    {
                        "type": "message",
                        "label": "ถูก",
                        "text": "ได้รับคำตอบถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาฟิสิกส์ประยุกต์"
                    },
                    {
                        "type": "message",
                        "label": "ไม่ถูก",
                        "text": "ได้รับคำตอบไม่ถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาฟิสิกส์ประยุกต์"
                    }
                ],
                "text": "คุณได้รับคำตอบถูกต้องไหมคะ?"
            }
        };

        //ประกาศตัวแปร payload เพื่อแสดงออกหน้าจอ
        let payload่json = new Payload(`LINE`, payload, { sendAsMessage: true });
        let text = request.body.queryResult.queryText;
        let c = 'ได้รับคำตอบถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาฟิสิกส์ประยุกต์';
        let b = 'ได้รับคำตอบไม่ถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาฟิสิกส์ประยุกต์';

        //Count_Accuracy
        let Count_Accuracy = admin.firestore().collection("Count_Accuracy").doc(date.toLocaleDateString()).collection("ค่าธรรมเนียมการศึกษา").doc("คณะวิทยาศาสตร์และเทคโนโลยี").collection("Subject").doc("ฟิสิกส์ประยุกต์");
        Count_Accuracy.get().then(function (docs) {
            if (!docs.exists) {
                Count_Accuracy.set({
                    ถูก: 0,
                    ไม่ถูก: 0
                });
            }

        });


        if (text === c) {
            agent.add("ขอบคุณค่ะ");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ถูก + 1;

                    t.update(Count_Accuracy, {
                        ถูก: newcount,

                    });
                });
            });



        }

        else if (text === b) {

            agent.add("กรุณากดปุ่มติดต่อเจ้าหน้าที่");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ไม่ถูก + 1;

                    t.update(Count_Accuracy, {
                        ไม่ถูก: newcount,

                    });
                });
            });

        }

        else {
            //เชคว่ามี ตัว doc อยู๋ไหม ถ้าไม่ ก็ set ค่า 
            // count_intent 
            Count_Intent.get().then(function (docs) {
                if (!docs.exists) {
                    Count_Intent.set({
                        ค่าธรรมเนียมการศึกษา: 1
                    });
                }

                else {
                    //เลขcount เวลามีคนเข้ามาสอบถาม

                    db.runTransaction(t => {
                        return t.get(Count_Intent).then(doc => {
                            if (doc.data().ค่าธรรมเนียมการศึกษา > 0) {
                                let newcount = doc.data().ค่าธรรมเนียมการศึกษา + 1;

                                t.update(Count_Intent, {
                                    ค่าธรรมเนียมการศึกษา: newcount

                                });
                            } else {
                                t.update(Count_Intent, {
                                    ค่าธรรมเนียมการศึกษา: 1
                                });

                            }

                        });
                    });
                }
            });

            //return ข้อมูลคำตอบ 
            return admin.firestore().collection('Tuition_fee').doc('คณะวิทยาศาสตร์และเทคโนโลยี').collection('ฟิสิกส์ประยุกต์').orderBy("date", "desc").limit(1).get().then((snapshot) => {
                snapshot.forEach(doc => {
                    agent.add(doc.data().description);
                    agent.add(payload่json); //แสดง paylaod
                });
            });
        }

    }


    //วิทยาการคอมพิวเตอร์
    function Computer_Science(agent) {
        let payload = {
            "type": "template",
            "altText": "this is a confirm template",
            "template": {
                "type": "confirm",
                "actions": [
                    {
                        "type": "message",
                        "label": "ถูก",
                        "text": "ได้รับคำตอบถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาวิทยาการคอมพิวเตอร์"
                    },
                    {
                        "type": "message",
                        "label": "ไม่ถูก",
                        "text": "ได้รับคำตอบไม่ถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาวิทยาการคอมพิวเตอร์"
                    }
                ],
                "text": "คุณได้รับคำตอบถูกต้องไหมคะ?"
            }
        };

        //ประกาศตัวแปร payload เพื่อแสดงออกหน้าจอ
        let payload่json = new Payload(`LINE`, payload, { sendAsMessage: true });
        let text = request.body.queryResult.queryText;
        let c = 'ได้รับคำตอบถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาวิทยาการคอมพิวเตอร์';
        let b = 'ได้รับคำตอบไม่ถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาวิทยาการคอมพิวเตอร์';

        //Count_Accuracy
        let Count_Accuracy = admin.firestore().collection("Count_Accuracy").doc(date.toLocaleDateString()).collection("ค่าธรรมเนียมการศึกษา").doc("คณะวิทยาศาสตร์และเทคโนโลยี").collection("Subject").doc("วิทยาการคอมพิวเตอร์");
        Count_Accuracy.get().then(function (docs) {
            if (!docs.exists) {
                Count_Accuracy.set({
                    ถูก: 0,
                    ไม่ถูก: 0
                });
            }

        });


        if (text === c) {
            agent.add("ขอบคุณค่ะ");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ถูก + 1;

                    t.update(Count_Accuracy, {
                        ถูก: newcount,

                    });
                });
            });



        }

        else if (text === b) {

            agent.add("กรุณากดปุ่มติดต่อเจ้าหน้าที่");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ไม่ถูก + 1;

                    t.update(Count_Accuracy, {
                        ไม่ถูก: newcount,

                    });
                });
            });

        }

        else {
            //เชคว่ามี ตัว doc อยู๋ไหม ถ้าไม่ ก็ set ค่า 
            // count_intent 
            Count_Intent.get().then(function (docs) {
                if (!docs.exists) {
                    Count_Intent.set({
                        ค่าธรรมเนียมการศึกษา: 1
                    });
                }

                else {
                    //เลขcount เวลามีคนเข้ามาสอบถาม

                    db.runTransaction(t => {
                        return t.get(Count_Intent).then(doc => {
                            if (doc.data().ค่าธรรมเนียมการศึกษา > 0) {
                                let newcount = doc.data().ค่าธรรมเนียมการศึกษา + 1;

                                t.update(Count_Intent, {
                                    ค่าธรรมเนียมการศึกษา: newcount

                                });
                            } else {
                                t.update(Count_Intent, {
                                    ค่าธรรมเนียมการศึกษา: 1
                                });

                            }

                        });
                    });
                }
            });

            //return ข้อมูลคำตอบ 
            return admin.firestore().collection('Tuition_fee').doc('คณะวิทยาศาสตร์และเทคโนโลยี').collection('วิทยาการคอมพิวเตอร์').orderBy("date", "desc").limit(1).get().then((snapshot) => {
                snapshot.forEach(doc => {
                    agent.add(doc.data().description);
                    agent.add(payload่json); //แสดง paylaod
                });
            });
        }

    }

    //สาธารณสุขศาสตร์
    function Public_Health(agent) {
        let payload = {
            "type": "template",
            "altText": "this is a confirm template",
            "template": {
                "type": "confirm",
                "actions": [
                    {
                        "type": "message",
                        "label": "ถูก",
                        "text": "ได้รับคำตอบถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาสาธารณสุขศาสตร์"
                    },
                    {
                        "type": "message",
                        "label": "ไม่ถูก",
                        "text": "ได้รับคำตอบไม่ถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาสาธารณสุขศาสตร์"
                    }
                ],
                "text": "คุณได้รับคำตอบถูกต้องไหมคะ?"
            }
        };

        //ประกาศตัวแปร payload เพื่อแสดงออกหน้าจอ
        let payload่json = new Payload(`LINE`, payload, { sendAsMessage: true });
        let text = request.body.queryResult.queryText;
        let c = 'ได้รับคำตอบถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาสาธารณสุขศาสตร์';
        let b = 'ได้รับคำตอบไม่ถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาสาธารณสุขศาสตร์';

        //Count_Accuracy
        let Count_Accuracy = admin.firestore().collection("Count_Accuracy").doc(date.toLocaleDateString()).collection("ค่าธรรมเนียมการศึกษา").doc("คณะวิทยาศาสตร์และเทคโนโลยี").collection("Subject").doc("สาธารณสุขศาสตร์");
        Count_Accuracy.get().then(function (docs) {
            if (!docs.exists) {
                Count_Accuracy.set({
                    ถูก: 0,
                    ไม่ถูก: 0
                });
            }

        });


        if (text === c) {
            agent.add("ขอบคุณค่ะ");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ถูก + 1;

                    t.update(Count_Accuracy, {
                        ถูก: newcount,

                    });
                });
            });



        }

        else if (text === b) {

            agent.add("กรุณากดปุ่มติดต่อเจ้าหน้าที่");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ไม่ถูก + 1;

                    t.update(Count_Accuracy, {
                        ไม่ถูก: newcount,

                    });
                });
            });

        }

        else {
            //เชคว่ามี ตัว doc อยู๋ไหม ถ้าไม่ ก็ set ค่า 
            // count_intent 
            Count_Intent.get().then(function (docs) {
                if (!docs.exists) {
                    Count_Intent.set({
                        ค่าธรรมเนียมการศึกษา: 1
                    });
                }

                else {
                    //เลขcount เวลามีคนเข้ามาสอบถาม

                    db.runTransaction(t => {
                        return t.get(Count_Intent).then(doc => {
                            if (doc.data().ค่าธรรมเนียมการศึกษา > 0) {
                                let newcount = doc.data().ค่าธรรมเนียมการศึกษา + 1;

                                t.update(Count_Intent, {
                                    ค่าธรรมเนียมการศึกษา: newcount

                                });
                            } else {
                                t.update(Count_Intent, {
                                    ค่าธรรมเนียมการศึกษา: 1
                                });

                            }

                        });
                    });
                }
            });

            //return ข้อมูลคำตอบ 
            return admin.firestore().collection('Tuition_fee').doc('คณะวิทยาศาสตร์และเทคโนโลยี').collection('สาธารณสุขศาสตร์').orderBy("date", "desc").limit(1).get().then((snapshot) => {
                snapshot.forEach(doc => {
                    agent.add(doc.data().description);
                    agent.add(payload่json); //แสดง paylaod
                });
            });
        }

    }


    //คณิตศาสตร์และสถิติประยุกต์
    function Mathematics_and_Applied_Statistics(agent) {
        let payload = {
            "type": "template",
            "altText": "this is a confirm template",
            "template": {
                "type": "confirm",
                "actions": [
                    {
                        "type": "message",
                        "label": "ถูก",
                        "text": "ได้รับคำตอบถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาคณิตศาสตร์และสถิติประยุกต์"
                    },
                    {
                        "type": "message",
                        "label": "ไม่ถูก",
                        "text": "ได้รับคำตอบไม่ถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาคณิตศาสตร์และสถิติประยุกต์"
                    }
                ],
                "text": "คุณได้รับคำตอบถูกต้องไหมคะ?"
            }
        };

        //ประกาศตัวแปร payload เพื่อแสดงออกหน้าจอ
        let payload่json = new Payload(`LINE`, payload, { sendAsMessage: true });
        let text = request.body.queryResult.queryText;
        let c = 'ได้รับคำตอบถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาคณิตศาสตร์และสถิติประยุกต์';
        let b = 'ได้รับคำตอบไม่ถูกต้องในเรื่องค่าธรรมเนียมการศึกษาสาขาคณิตศาสตร์และสถิติประยุกต์';

        //Count_Accuracy
        let Count_Accuracy = admin.firestore().collection("Count_Accuracy").doc(date.toLocaleDateString()).collection("ค่าธรรมเนียมการศึกษา").doc("คณะวิทยาศาสตร์และเทคโนโลยี").collection("Subject").doc("คณิตศาสตร์และสถิติประยุกต์");
        Count_Accuracy.get().then(function (docs) {
            if (!docs.exists) {
                Count_Accuracy.set({
                    ถูก: 0,
                    ไม่ถูก: 0
                });
            }

        });


        if (text === c) {
            agent.add("ขอบคุณค่ะ");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ถูก + 1;

                    t.update(Count_Accuracy, {
                        ถูก: newcount,

                    });
                });
            });



        }

        else if (text === b) {

            agent.add("กรุณากดปุ่มติดต่อเจ้าหน้าที่");
            db.runTransaction(t => {
                return t.get(Count_Accuracy).then(doc => {
                    let newcount = doc.data().ไม่ถูก + 1;

                    t.update(Count_Accuracy, {
                        ไม่ถูก: newcount,

                    });
                });
            });

        }

        else {
            //เชคว่ามี ตัว doc อยู๋ไหม ถ้าไม่ ก็ set ค่า 
            // count_intent 
            Count_Intent.get().then(function (docs) {
                if (!docs.exists) {
                    Count_Intent.set({
                        ค่าธรรมเนียมการศึกษา: 1
                    });
                }

                else {
                    //เลขcount เวลามีคนเข้ามาสอบถาม

                    db.runTransaction(t => {
                        return t.get(Count_Intent).then(doc => {
                            if (doc.data().ค่าธรรมเนียมการศึกษา > 0) {
                                let newcount = doc.data().ค่าธรรมเนียมการศึกษา + 1;

                                t.update(Count_Intent, {
                                    ค่าธรรมเนียมการศึกษา: newcount

                                });
                            } else {
                                t.update(Count_Intent, {
                                    ค่าธรรมเนียมการศึกษา: 1
                                });

                            }

                        });
                    });
                }
            });

            //return ข้อมูลคำตอบ 
            return admin.firestore().collection('Tuition_fee').doc('คณะวิทยาศาสตร์และเทคโนโลยี').collection('คณิตศาสตร์และสถิติประยุกต์').orderBy("date", "desc").limit(1).get().then((snapshot) => {
                snapshot.forEach(doc => {
                    agent.add(doc.data().description);
                    agent.add(payload่json); //แสดง paylaod
                });
            });
        }

    }

	function Contact_staff(agent) {
      let text = request.body.queryResult.queryText;
      agent.add(text);
    }
  
  
    function Default_Fallback_Intent(agent) {
     
		
        let text = request.body.queryResult.queryText;
      	let user_id = request.body.originalDetectIntentRequest.payload.data.source.userId;
      
      
  		 

     
        let c = 'หอพัก';
        //agent.add("Correct");
        if (text.search(c) !== -1) {
            agent.add("Correct");
        } else {
            agent.add();
        }
    }





    let intentMap = new Map();


    //การลงทะเบียน
    intentMap.set("Additional_Credit_Registration", Additional_Credit_Registration);//การเพิ่ม
    intentMap.set("Withdraw_credit_registration", Withdraw_credit_registration); //การถอน
    intentMap.set("Course_termination", Course_termination); //การยกเลิกรายวิชา
    intentMap.set("Forgot_Password", Forgot_Password); //การลืมรหัสผ่าน
    intentMap.set("Unable_to_register", Unable_to_register); //ลงทะเบียนไม่ได้
    intentMap.set("To_Increase_the_new_crouse", To_Increase_the_new_crouse); //การขอเปิดรายวิชาเพิ่ม
    intentMap.set("Duplicate_registrations", Duplicate_registrations); //การลงทะเบียนซ้ำ
    intentMap.set("Cumulative_credits", Cumulative_credits); //หน่วยกิตที่ต้องสะสม
    intentMap.set("4_Year_undergraduate_program", Year4_undergraduate_program); //ระยะเวลาในการศึกษา 4 ปี
    intentMap.set("5_Year_undergraduate_program", Year5_undergraduate_program); //ระยะเวลาในการศึกษา 5 ปี
    intentMap.set("Continuing_undergraduate_program", Continuing_undergraduate_program); //ศึกษาปริญญาต่อเนื่อง
    intentMap.set("Enroll_in", Enroll_in); //การลงทะเบียนเรียน
    intentMap.set("Default Fallback Intent", Default_Fallback_Intent); //กรณีอื่นๆ



    //การลา 
    intentMap.set("Private_leave", Private_leave); //การลากิจ
    intentMap.set("Sick_Leave", Sick_Leave); //การลาป่วย

    // บัตรนักศึกษา
    intentMap.set("Lost_or_Breakdown", Lost_or_Breakdown); //บัตรหายหรือชำรุด
    intentMap.set("Change_Information", Change_Information); //เปลี่ยนแปลงข้อมูลในบัตร

    //การสำเร็จการศึกษา**
    intentMap.set("GPA", GPA); //เกรดเฉลี่ยสะสม
    intentMap.set("Graduation_Informing", Graduation_Informing); //การแจ้งขอสำเร็จการศึกษา
    intentMap.set("Editing_information", Editing_information); //การขอแก้ไขข้อมูลเอกสารจบ
    intentMap.set("honor", honor); //การได้รับเกียรตินิยม
    intentMap.set("Approval", Approval); //การอนุมัติจบ

    //การลาออก
    intentMap.set("Resignation_Procedure", Resignation_Procedure); //ขั้นตอนการลาออก
    intentMap.set("Resignation_Cancle", Resignation_Cancle); //การยกเลิกการลาออก
    intentMap.set("University_Transfer", University_Transfer); //การขอย้ายสถานศึกษา


    //การพ้นสภาพการเป็นนักศึกษา
    intentMap.set("In_case_Student_Retirement", In_case_Student_Retirement); //กรณีการพ้นสภาพการเป็นนักศึกษา
    intentMap.set("Procession_Student_Retirement", Procession_Student_Retirement); //การดำเนินการเมื่อพ้นสภาพการเป็นนักศึกษา
    intentMap.set("Regular_session", Regular_session); //เกรดเฉลี่ยขั้นต่ำ ภาคปกติ
    intentMap.set("Spacial_session", Spacial_session); //เกรดเฉลี่ยขั้นต่ำ ภาคพิเศษ


    //การวัดและการประเมินผล
    intentMap.set("Grade", Grade); //เกรดออกช้า
    intentMap.set("Fix_Incomplete_Grade", Fix_Incomplete_Grade); //การแก้ I


    //การลาพักการศึกษา Taking_leave_from_studies
    intentMap.set("Presenting_a_Petition", Presenting_a_Petition); //การยื่นคำร้องลาพักการศึกษา
    intentMap.set("Taking_leave_from_studies_Regulation", Taking_leave_from_studies_Regulation); //ระเบียบการลาพักการศึกษา
    intentMap.set("Taking_leave_from_studies_Fee", Taking_leave_from_studies_Fee); //ค่าธรรมเนียมการลาพักการศึกษา


    //การขอรับเอกสารการศึกษา
    intentMap.set("Certificate_of_Student_Status", Certificate_of_Student_Status); //ใบรับรองการเป็นนักศึกษา
    intentMap.set("Transcript", Transcript); //ใบรับรองผลการเรียน
    intentMap.set("Recovery_Diploma", Recovery_Diploma); //ใบขอรับปริญญาย้อนหลัง
    intentMap.set("Period_of_Documentary", Period_of_Documentary); //ระยะเวลาการขอเอกสาร
    intentMap.set("Receiving_documentary", Receiving_documentary); //ปัญหาการรับเอกสาร


    //ปฏิทินการศึกษา
    intentMap.set("Regular_calendar", Regular_calendar); //ภาคการศึกษาปกติ
    intentMap.set("Spacial_calendar", Spacial_calendar); //ภาคการศึกษาพิเศษ
    intentMap.set("Summer", Summer); //ภาคการศึกษาฤดูร้อน


    //การสมัครเรียน
    intentMap.set("Regular_application", Regular_application); //ภาคการศึกษาปกติ
    intentMap.set("Spacial_application", Spacial_application); //ภาคการศึกษาพิเศษ
    intentMap.set("Summer_application", Summer_application); //ภาคการศึกษาฤดูร้อน

    //ค่าธรรมเนียมการศึกษา Tuition_fee
    //คณะครุศาสตร์
    intentMap.set("Mathematics", Mathematics);  //คณิตศาสตร์
    intentMap.set("Teaching_General_Science", Teaching_General_Science); //การสอนวิทยาศาสตร์ทั่วไป
    intentMap.set("Computer_Education", Computer_Education); //คอมพิวเตอร์ศึกษา
    intentMap.set("Thai_Teaching", Thai_Teaching); //การสอนภาษาไทย
    intentMap.set("English_Teaching", English_Teaching); //การสอนภาษาอังกฤษ
    intentMap.set("Early_Childhood_Education", Early_Childhood_Education); //การศึกษาปฐมวัย
    intentMap.set("Chinese_Teaching", Chinese_Teaching); //การสอนภาษาจีน
    intentMap.set("Counseling_Psychology_and_Guidance_and_Thai_Teaching", Counseling_Psychology_and_Guidance_and_Thai_Teaching); //จิตวิทยาการปรึกษาและแนะแนว-การสอนภาษาไทย
    intentMap.set("Educational_Information_Technology", Educational_Information_Technology); //เทคโนโลยีสารสนเทศทางการศึกษา-การสอนภาษาไทย
    intentMap.set("Social_Studies_Teaching", Social_Studies_Teaching); //การสอนสังคมศึกษา

    //คณะเทคโนโลยีอุตสาหกรรม 
    intentMap.set("Industrial_Technology", Industrial_Technology);  //เทคโนโลยีอุตสาหกรรม
    intentMap.set("Industrial_Management_Engineering", Industrial_Management_Engineering); //วิศวกรรมการจัดการอุตสาหกรรม
    intentMap.set("Automotive_Mechanical_Engineering", Automotive_Mechanical_Engineering); //วิศวกรรมเครื่องกลยานยนต์
    intentMap.set("Electonic_Engineering", Electonic_Engineering); //วิศวกรรมไฟฟ้า
    intentMap.set("Product_Design", Product_Design); //ออกแบบผลิตภัณฑ์


    //คณะมนุษยศาสตร์และสังคมศาสตร์ 
    intentMap.set("Social_development", Social_development);  //การพัฒนาสังคม
    intentMap.set("English", English); //ภาษาอังกฤษ
    intentMap.set("Western_Music", Western_Music); //ดนตรีสากล
    intentMap.set("Visual_Arts", Visual_Arts); //ทัศนศิลป์
    intentMap.set("Political_Science", Political_Science); //รัฐศาสตร์
    intentMap.set("Public_Adminstration", Public_Adminstration); //รัฐประศาสนศาสตร์
    intentMap.set("Laws_Program", Laws_Program); //นิติศาสตร์บัณฑิต
    intentMap.set("Japanese", Japanese); //ภาษาญี่ปุ่น
    intentMap.set("Fine_and_Applied_Arts", Fine_and_Applied_Arts); //ศิลปกรรม
    intentMap.set("Information_and_Library_Science", Information_and_Library_Science); //สารสนเทศศาสตร์และบรรณารักษศาสตร์
    intentMap.set("Thai_Music_Education", Thai_Music_Education); //นาฎดุริยางคศิลป์ไทย


    //คณะวิทยาการจัดการ 
    intentMap.set("Accounting", Accounting);  //การบัญชี
    intentMap.set("Human_Resource_Management", Human_Resource_Management); //การจัดการทรัพยากรมนุษย์
    intentMap.set("Marketing", Marketing); //การตลาด
    intentMap.set("Business_Computer", Business_Computer); //คอมพิวเตอร์ธุรกิจ
    intentMap.set("Management", Management); //การจัดการ
    intentMap.set("Communication_Arts", Communication_Arts); //นิเทศศาสตร์
    intentMap.set("Tourism", Tourism); //การท่องเที่ยว

    //คณะวิทยาศาสตร์และเทคโนโลยี
    intentMap.set("Occupational_Safety_and_Health", Occupational_Safety_and_Health);  //อาชีวอนามัยและความปลอดภัย
    intentMap.set("Environmental_Science", Environmental_Science); //วิทยาศาสตร์สิ่งแวดล้อม
    intentMap.set("Information_Technology", Information_Technology); //เทคโนโลยีสารสนเทศ
    intentMap.set("Food_and_Service", Food_and_Service); //การอาหารและธุรกิจบริการ
    intentMap.set("Agricultural_Technology", Agricultural_Technology); //เทคโนโลยีการเกษตร
    intentMap.set("Chemistry", Chemistry); //วิชาเคมี
    intentMap.set("Biology", Biology); //ชีววิทยาประยุกต์
    intentMap.set("Physics", Physics); //ฟิสิกส์ประยุกต์
    intentMap.set("Computer_Science", Computer_Science); //วิทยาการคอมพิวเตอร์
    intentMap.set("Public_Health", Public_Health); //สาธารณสุขศาสตร์
    intentMap.set("Mathematics_and_Applied_Statistics", Mathematics_and_Applied_Statistics); //คณิตศาสตร์และสถิติประยุกต์
	
  
  	//Contact_staff - fallback
  	 intentMap.set("Contact_staff - fallback", Contact_staff);
  
  
    agent.handleRequest(intentMap);
}
);