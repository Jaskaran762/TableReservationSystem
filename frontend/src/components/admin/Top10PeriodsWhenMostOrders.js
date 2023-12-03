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
            url="https://lookerstudio.google.com/embed/reporting/e2b0ce57-2d21-4bbd-af6f-80ec3d10bbfb/page/377jD"
            width="600"
            height="450"
            frameBorder="0"
            allowFullScreen
            style={iframeStyle}
        />
    );
}

export default Top10CustomerOrders;
