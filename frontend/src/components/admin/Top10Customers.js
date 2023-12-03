import React, { useState, useEffect } from "react";
import Iframe from "react-iframe";

// import "./home.css";


function Top10Customers() {
    const iframeStyle = {
        width: '600px',
        height: '450px',
        border: '0',
    };

    return (
        <Iframe url="https://lookerstudio.google.com/embed/reporting/8c448184-331c-44ff-9787-9939e974d733/page/WD6jD" 
        width="1000px"
        height="850px"
        frameBorder="0"
        allowFullScreen
        style={iframeStyle}/>
    );
}

export default Top10Customers;