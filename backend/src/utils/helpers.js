const path = require('path');
const fs = require('fs');
const express = require('express');

function serveStaticFile(app) {
    const directory = path.join(__dirname, '../uploads');
    app.use('/uploads', express.static(directory));
}

// Function to resolve file path to domain url for static files
function url(path)
{
    if(process.env.NODE_ENV === 'development')
    {
        return `http://localhost:${process.env.APP_PORT}/${path}`;
    }
    return `${process.env.APP_URL}/${path}`;
}

function deleteImage(image){
    const imagePath = path.join(__dirname, image);

    fs.unlink(image, (err) => {
        if(err)
        {
            console.log(`Error deleting file : ${err}`);
        }else{
            console.log(`Image ${image} deleted successfully`);
        }
    });
}

module.exports = {
    serveStaticFile,
    deleteImage,
    url
};