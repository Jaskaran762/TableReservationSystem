import React, { useState, useEffect } from "react";
import Iframe from "react-iframe";

function Top10CustomerOrders() {
    const iframeStyle = {
        width: '600px',
        height: '450px',
        border: '0',
    };

    return (
        <Iframe
            url="https://lookerstudio.google.com/embed/reporting/345d5f9c-15pa-7p91-m277-1pahj49916j1/page/nc5iM"
            width="600"
            height="450"
            frameBorder="0"
            allowFullScreen
            style={iframeStyle}
        />
    );
}

export default Top10CustomerOrders;
