import React, { useState, useEffect } from "react";
import Iframe from "react-iframe";

function Top10RestaurantOrders() {
    const iframeStyle = {
        width: '600px',
        height: '450px',
        border: '0',
    };

    return (
        <Iframe
            url="https://lookerstudio.google.com/embed/reporting/635d5f6c-24ab-4d88-b374-3ddec85006c4/page/kb5jD"
            width="600"
            height="450"
            frameBorder="0"
            allowFullScreen
            style={iframeStyle}
        />
    );
}

export default Top10RestaurantOrders;
