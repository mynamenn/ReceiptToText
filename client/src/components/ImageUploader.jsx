import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import axios from 'axios';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';


const AXIOS_LINK = "http://localhost:4000/";

export default function ImageUploader() {
    const classes = useStyles();

    const [texts, setTexts] = useState([""]);

    const handleImage = async (event) => {
        var formData = new FormData();
        let imageFile = document.getElementById(event.target.id).files[0];
        formData.append("receipt", imageFile);

        if (undefined !== imageFile) {
            readImgFile(imageFile);
            axios({
                method: 'post',
                url: AXIOS_LINK + "upload",
                data: formData,
                headers: { 'Content-Type': 'multipart/form-data' }
            })
                .then(function (response) {
                    console.log(response);
                    processTexts(response.data.split("\n"));
                })
                .catch(function (response) {
                    console.log(response);
                });
        }
    }

    const readImgFile = (imageFile) => {
        const reader = new FileReader();
        reader.onload = function () {
            var imgUrl = reader.result;
            document.getElementById("receiptImg").src = imgUrl;
        }
        reader.readAsDataURL(imageFile);
    }

    const processTexts = (texts) => {
        let arr = ["SHOP NAME: " + texts[0]];

        texts.forEach(text => {
            if (text.slice(0, 6).toLowerCase() === "total:") {
                let string = text.slice(7).trim();
                arr.push("TOTAL: " + string);
            }
            else if (text.slice(0, 5).toLowerCase() === "total") {
                let string = text.slice(6).trim();
                arr.push("TOTAL: " + string);
            }
        });
        setTexts(texts);
    }

    return (
        <div className={classes.main}>
            <Button
                component="label"
                onChange={handleImage}
                className={classes.uploadBtn}
                variant="contained"
                color="primary"
                startIcon={<CloudUploadIcon />}
            >
                Upload Image
                <input
                    type="file"
                    id="img"
                    accept="image/*"
                    style={{ display: "none" }}
                />
            </Button>
            <br />
            <img id="receiptImg" className={classes.image} alt="uploadedImg" />
            {
                texts.map(text => {
                    return <p key={text} className={classes.text}>{text}</p>
                })
            }
        </div>
    )
}

const useStyles = makeStyles(theme => ({
    main: {
        paddingLeft: "20px",
    },
    image: {
        float: "left",
        width: "40%",
        marginRight: "40px",
    },
    text: {

    },
    uploadBtn: {
        marginBottom: "20px",
        marginTop: "20px",
    }
}));
