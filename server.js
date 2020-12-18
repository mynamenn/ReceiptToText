const express = require("express");
const app = express();
const fs = require("fs"); // File system 
const multer = require("multer"); // Handle multipart form-data
const { TesseractWorker } = require("tesseract.js");
const worker = new TesseractWorker();
var cors = require('cors');

app.use(cors());

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads");
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
})

const upload = multer({ storage: storage }).single("receipt");

app.post('/upload', (req, res) => {
    upload(req, res, err => {
        fs.readFile(`./uploads/${req.file.originalname}`, (err, data) => {
            if (err) return console.log("Error: ", err);

            worker
                .recognize(data, "eng", { tessjs_create_pdf: "1" })
                .progress(progress => {
                    console.log(progress);
                })
                .then(result => {
                    res.send(result.text);
                })
                .finally(() => worker.terminate());
        });
    });
});

const PORT = 4000 || process.env.PORT;
app.listen(PORT, () => console.log(`Running on ${PORT}`));
